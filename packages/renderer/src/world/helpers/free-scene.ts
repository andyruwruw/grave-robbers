// Types
import type { SceneParts } from '../types/scene-parts';
import type { WorldContext } from '../world-context';

/**
 * Frees everything a scene holds on the GPU, in the order the scene was
 * always torn down in, and takes its canvas off the page.
 * @param ctx What every part of the scene shares.
 * @param parts The scene's managers.
 */
export const freeScene = (ctx: WorldContext, parts: SceneParts): void => {
  ctx.gore.dispose();
  ctx.puddles.dispose();
  ctx.patches.dispose();
  ctx.bolts.dispose();
  ctx.rings.dispose();
  ctx.cracks.dispose();
  ctx.pickups.dispose();
  ctx.altarGauges.dispose();
  ctx.fountainVictims.dispose();
  ctx.healthBars.dispose();
  parts.tiles.disposeDebris();
  ctx.shotMaterials.dispose();
  parts.chunks.clear();
  parts.overview.dispose();
  parts.scenery.dispose();
  parts.tiles.dispose();
  ctx.lightMap.dispose();
  parts.post.dispose();
  ctx.flames.dispose();
  ctx.piles.dispose();
  ctx.chips.dispose();
  ctx.fog.dispose();
  ctx.renderer.dispose();
  ctx.renderer.domElement.remove();
};
