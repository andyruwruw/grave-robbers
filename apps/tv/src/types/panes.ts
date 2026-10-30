/**
 * One pane of the TV: the player it follows, or the spawn (`id` '') when
 * nobody's playing here, or the whole map (`id` null) on a classic map.
 */
export interface Pane {
  /**
   * React key and renderer map key.
   */
  key: string;

  /**
   * The followed player's id, '' for the spawn, or null for the whole map.
   */
  id: string | null;

  /**
   * The followed player's name, shown on the pane when there's more than one.
   */
  name: string;
}
