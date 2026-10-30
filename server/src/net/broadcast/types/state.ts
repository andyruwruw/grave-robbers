// Types
import type { DisplayMessage } from '@halloween/shared/protocol/messages/display-message';

/**
 * One tick's state message for displays.
 */
export type StateMessage = Extract<DisplayMessage, { t: 'state' }>;
