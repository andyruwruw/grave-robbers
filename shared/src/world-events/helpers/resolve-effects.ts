// Local Imports
import { WORLD_EVENTS } from '../world-event-catalog';

// Types
import type { MonsterKind } from '../../monsters/monster-kinds';
import type { EventEffect, EventModifiers } from '../types/event-effects';
import type { EventWeight, WorldEventKind } from '../types/world-events';

/**
 * A world event's effect of one kind, if it has one.
 * @param kind The event.
 * @param on Which effect.
 * @returns The effect, or undefined.
 */
export function effectOf<K extends EventEffect['on']>(kind: WorldEventKind, on: K): Extract<EventEffect, { on: K }> | undefined {
  return WORLD_EVENTS[kind].effects.find((e: EventEffect): boolean => e.on === on) as Extract<EventEffect, { on: K }> | undefined;
}

/**
 * Combines the effects of every world event, each by its weight: scales
 * blend from 1 and multiply, additions add, flags hold while any weight is
 * above 0, and for overrides and tints the heaviest event wins.
 * @param events The events and how strongly each applies.
 * @returns The modifiers.
 */
export function resolveEffects(events: EventWeight[]): EventModifiers {
  const mods: EventModifiers = {
    spawning: { interval: null, perPlayer: null, lightsPerGhost: null },
    spawnMix: {},
    monsterPower: 1,
    monsterSpeed: 1,
    hunt: false,
    sky: null,
    eyes: null,
    aberration: 0,
    drums: 0,
  };
  const heaviest = { interval: 0, perPlayer: 0, lightsPerGhost: 0 };
  for (const { kind, weight } of events) {
    if (weight <= 0) {
      continue;
    }
    for (const e of WORLD_EVENTS[kind].effects) {
      if (e.on === 'spawning') {
        for (const key of ['interval', 'perPlayer', 'lightsPerGhost'] as const) {
          const value = e[key];
          if (value !== undefined && weight > heaviest[key]) {
            heaviest[key] = weight;
            mods.spawning[key] = value;
          }
        }
      } else if (e.on === 'spawn-mix') {
        for (const [k, add] of Object.entries(e.mix) as [MonsterKind, number][]) {
          mods.spawnMix[k] = (mods.spawnMix[k] ?? 0) + add * weight;
        }
      } else if (e.on === 'monster-power') {
        mods.monsterPower *= 1 + (e.scale - 1) * weight;
      } else if (e.on === 'monster-speed') {
        mods.monsterSpeed *= 1 + (e.scale - 1) * weight;
      } else if (e.on === 'monster-hunt') {
        mods.hunt = true;
      } else if (e.on === 'sky' && weight > (mods.sky?.amount ?? 0)) {
        mods.sky = { moon: e.moon, ambient: e.ambient, fog: e.fog, fogThicken: e.fogThicken, amount: weight };
      } else if (e.on === 'eyes' && weight > (mods.eyes?.amount ?? 0)) {
        mods.eyes = { color: e.color, amount: weight };
      } else if (e.on === 'aberration') {
        mods.aberration += e.add * weight;
      } else if (e.on === 'music') {
        mods.drums = Math.max(mods.drums, e.drums * weight);
      }
    }
  }
  return mods;
}
