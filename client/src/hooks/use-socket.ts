// Packages
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { SOCKET_PATH } from '@halloween/shared/protocol';

// Local Imports
import {
  RECONNECT_MAX_DELAY,
  RECONNECT_MIN_DELAY,
} from '../config';

// Types
import type { ClientMessage, ServerMessage } from '@halloween/shared/protocol';

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
}

/**
 * Keeps one WebSocket to the game server open for the component's lifetime,
 * reconnecting with exponential backoff and re-sending the hello each time.
 *
 * @param {UseSocketOptions} options - Hook options.
 * @returns {UseSocketResult} Status and a send function.
 */
export function useSocket<M extends ServerMessage>({
  hello,
  onMessage,
}: UseSocketOptions<M>): UseSocketResult {
  const [status, setStatus] = useState<SocketStatus>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const helloRef = useRef(hello);
  const onMessageRef = useRef(onMessage);
  helloRef.current = hello;
  onMessageRef.current = onMessage;

  useEffect(() => {
    let disposed = false;
    let delay = RECONNECT_MIN_DELAY;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

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
        onMessageRef.current(JSON.parse(e.data) as M);
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

  const send = useCallback((msg: ClientMessage): void => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }, []);

  return { status, send };
}
