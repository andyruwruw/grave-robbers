// Packages
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { SOCKET_PATH } from '@halloween/shared/protocol/network';

// Local Imports
import {
  RECONNECT_MAX_DELAY,
  RECONNECT_MIN_DELAY,
} from '../config/network';

// Types
import type React from 'react';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { NetMessage, ServerMessage } from '@halloween/shared/protocol/messages/server-message';

/**
 * Connection lifecycle of the game socket.
 */
export type SocketStatus = 'connecting' | 'open' | 'closed';

/**
 * Options for useSocket.
 */
interface UseSocketOptions<M extends ServerMessage> {
  /**
   * Builds the hello message sent on every (re)connect. Read at send time,
   * so it always sees the latest token.
   */
  hello: () => ClientMessage;

  /**
   * Called for each server message.
   */
  onMessage: (msg: M) => void;
}

/**
 * Return value of useSocket.
 */
interface UseSocketResult {
  /**
   * Current connection status.
   */
  status: SocketStatus;

  /**
   * Sends a message if the socket is open; dropped otherwise.
   */
  send: (msg: ClientMessage) => void;

  /**
   * The server's measured round trip in ms (smoothed), or null until the
   * first one.
   */
  ping: number | null;

  /**
   * The same round trip as `ping`, for loops that shouldn't re-render.
   */
  pingRef: React.MutableRefObject<number | null>;
}

/**
 * Keeps one WebSocket to the game server open for the component's lifetime,
 * reconnecting with exponential backoff and re-sending the hello each time.
 * Answers the server's pings itself and keeps the round trip it reports.
 *
 * @param {UseSocketOptions} options - Hook options.
 * @returns {UseSocketResult} Status, a send function, and the ping.
 */
export function useSocket<M extends ServerMessage>({
  hello,
  onMessage,
}: UseSocketOptions<M>): UseSocketResult {
  const [status, setStatus] = useState<SocketStatus>('connecting');
  const [ping, setPing] = useState<number | null>(null);
  const pingRef = useRef<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const helloRef = useRef(hello);
  const onMessageRef = useRef(onMessage);
  helloRef.current = hello;
  onMessageRef.current = onMessage;

  useEffect(() => {
    let disposed = false;
    let delay = RECONNECT_MIN_DELAY;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    /**
     * Opens the socket and wires its handlers, reconnecting with backoff when it closes.
     */
    const connect = (): void => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}${SOCKET_PATH}`);
      wsRef.current = ws;
      setStatus('connecting');

      ws.onopen = (): void => {
        delay = RECONNECT_MIN_DELAY;
        setStatus('open');
        ws.send(JSON.stringify(helloRef.current()));
      };
      ws.onmessage = (e: MessageEvent<string>): void => {
        const msg = JSON.parse(e.data) as M | NetMessage;
        if (msg.t === 'ping') {
          ws.send(JSON.stringify({ t: 'pong' } satisfies ClientMessage));
          return;
        }
        if (msg.t === 'rtt') {
          pingRef.current = msg.ms;
          setPing(msg.ms);
          return;
        }
        onMessageRef.current(msg as M);
      };
      ws.onclose = (): void => {
        if (disposed) {
          return;
        }
        setStatus('closed');
        retryTimer = setTimeout(connect, delay);
        delay = Math.min(delay * 2, RECONNECT_MAX_DELAY);
      };
    };

    connect();
    return () => {
      disposed = true;
      clearTimeout(retryTimer);
      wsRef.current?.close();
    };
  }, []);

  /**
   * Sends a message if the socket is open; drops it otherwise.
   * @param msg The message.
   */
  const send = useCallback((msg: ClientMessage): void => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }, []);

  return { status, send, ping, pingRef };
}
