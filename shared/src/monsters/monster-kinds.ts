/**
 * Everything that comes out of the dark. Zombies, vampires, and ghosts are
 * there from the start; the rest turn up as the world level climbs (see
 * `difficulty/`): skeleton archers, ghouls that scuttle on all fours and
 * pounce, witches that lob potions, brutes (huge, slow zombies), demons
 * that move only through shadow and step out of it behind you, bloaters
 * that burst, necromancers that raise the dead, and (under a blood moon
 * only) werewolves.
 */
export type MonsterKind = 'zombie' | 'vampire' | 'ghost' | 'brute' | 'skeleton' | 'witch' | 'ghoul' | 'demon' | 'bloater' | 'necromancer' | 'werewolf';

/**
 * Every monster kind.
 */
export const MONSTER_KINDS: MonsterKind[] = ['zombie', 'vampire', 'ghost', 'brute', 'skeleton', 'witch', 'ghoul', 'demon', 'bloater', 'necromancer', 'werewolf'];

/**
 * Kinds that walk and think like zombies: path to whoever they see,
 * shamble around otherwise, chew through what's built in the way.
 *
 * @param kind The monster kind.
 * @returns True for every kind but vampires, demons and ghosts.
 */
export function isShambler(kind: MonsterKind): boolean {
  return kind !== 'vampire' && kind !== 'demon' && kind !== 'ghost';
}

/**
 * Kinds that keep to the dark like vampires (and demons).
 *
 * @param kind The monster kind.
 * @returns True for vampires and demons.
 */
export function isShadowWalker(kind: MonsterKind): boolean {
  return kind === 'vampire' || kind === 'demon';
}

/**
 * Whether a string names a monster kind (for spawn requests off the wire).
 *
 * @param kind Any string.
 * @returns True when it's a MonsterKind.
 */
export function isMonsterKind(kind: string): kind is MonsterKind {
  return (MONSTER_KINDS as string[]).includes(kind);
}

/**
 * Zombies proper (zombies and brutes): what carries junk and wears armor.
 *
 * @param kind The monster kind.
 * @returns True for zombies and brutes.
 */
export function isZombie(kind: MonsterKind): boolean {
  return kind === 'zombie' || kind === 'brute';
}
