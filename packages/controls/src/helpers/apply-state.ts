// Types
import type { DisplayMessage } from '@halloween/shared/protocol/messages/display-message';
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';

/**
 * Hands a state snapshot to a renderer: players, monsters, world events,
 * shots, puddles, patches, the lights and daytime switches, the TV's cursor light, then the items,
 * lights, events, and fountain victims, in that order.
 *
 * @param {WorldRenderer} renderer - The renderer to update.
 * @param {Extract<DisplayMessage, { t: 'state' }>} msg - The snapshot.
 */
export function applyState(renderer: WorldRenderer, msg: Extract<DisplayMessage, { t: 'state' }>): void {
  renderer.setPlayers(msg.players);
  renderer.setMonsters(msg.monsters);
  renderer.setWorldEvents(msg.worldEvents);
  renderer.setShots(msg.shots);
  renderer.setPuddles(msg.puddles);
  renderer.setPatches(msg.patches ?? []);
  renderer.setLightsOff(msg.settings.lightsOff);
  renderer.setDaytime(msg.settings.daytime);
  renderer.setCursorLight(msg.cursorLight);
  renderer.setWorldState(msg.items, msg.lights, msg.events, msg.victims ?? []);
}
