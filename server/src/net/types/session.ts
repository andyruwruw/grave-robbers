/**
 * Per-socket state once a client has said hello.
 */
export type Session =
  /**
   * Connected but hasn't said hello yet.
   */
  | { role: 'unknown' }
  /**
   * A TV, the admin page (`admin`), or a /play view (`viewer`), with the
   * players it watches.
   */
  | { role: 'display'; admin: boolean; viewer: boolean; watch: string[] }
  /**
   * A phone (or /play), with its player's token once it has joined.
   */
  | { role: 'controller'; token: string | null };

/**
 * A display's session.
 */
export type DisplaySession = Extract<Session, { role: 'display' }>;

/**
 * A controller's session.
 */
export type ControllerSession = Extract<Session, { role: 'controller' }>;
