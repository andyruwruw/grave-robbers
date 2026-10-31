// Types
import type { GearKind } from '../gear/types/gear-def';
import type { Goods } from '../goods/goods';
import type { StructureKind } from '../structures/types/structures';
import type { ItemKey } from './item-keys';

/**
 * A line or two about each piece of gear, shown under its name.
 */
export const GEAR_BLURBS: Record<GearKind, string> = {
  'hammer': 'Old, trusty, and never breaks. Chops, mines, digs, and cracks the odd skull.',
  'infused-hammer': 'Your old hammer, infused at an anvil into a two-handed brute of a weapon. It still does every job.',
  'wood-armor': 'Bark and bent boards strapped on tight. Better than a nightshirt.',
  'bone-armor': 'Ribs over your ribs. Anything that bites you gets poked back.',
  'stone-armor': 'Like wearing your own tombstone. Nothing knocks you over, but you won\'t outrun much.',
  'plate': 'Proper iron plate, forged on an anvil. Tough without turning you into a statue.',
  'battle-axe': 'A slow, heavy chop that bites harder for every extra monster caught in it.',
  'scythe': 'The reaper\'s own tool. A wide, weak sweep around you that drags blood from the harvest.',
  'spear': 'Pokes from a safe distance, in a straight line and nowhere else.',
  'wrench': 'Tightens bolts and nails boards back on. Barely a weapon.',
  'stake': 'Through the heart, and a vampire is dust. It splinters after a few swings.',
  'ritual-knife': 'Every cut that lands takes a little of your blood. Every kill gives it back.',
  'crossbow': 'Takes a breath to aim, then puts a bolt exactly where it should go. Vampires hate it.',
  'blood-gun': 'Load it with your own blood and it coughs out a cone of nightmares.',
  'torch': 'Fire on a stick. Lights the way and keeps vampires at arm\'s length.',
  'shield': 'Raise it and most of what comes at your front stops there.',
  'short-sword': 'Quick and light, with a hand free for a shield.',
  'greatsword': 'A huge, heavy blade. Sweeping blows that finish off the wounded.',
  'flail': 'A spiked ball on a chain that crushes straight through helmets and shields.',
  'morning-star': 'A blessed chain whip that cracks across the yard. Witches and vampires mourn it.',
  'warhammer': 'The slowest swing in the graveyard, and the one that sends brutes flying.',
  'quarterstaff': 'A holy staff for twirling three-hit combos. It turns aside blows from the front.',
  'glaive': 'A cursed blade on a long pole: one swing sweeps, the next one stabs.',
  'spiked-gauntlet': 'Fast fists full of nails. Wounds keep bleeding, and every sixth hit charges a haymaker.',
  'bow': 'Draw it back for a hit twice as hard. Hold the draw and it lets fly on its own.',
  'repeating-crossbow': 'A rattling drum of bolts, three to a burst. Holy enough to make vampires flinch.',
  'musket': 'One thunderous, smoky shot that pays for itself in blood.',
  'stick': 'A long stick. Not much, but it\'s yours.',
  'femur': 'Somebody\'s thighbone. Short, but it knocks things back.',
  'shovel': 'Bent from digging graves. Scoops wide.',
};

/**
 * A line or two about each structure, shown under its name.
 */
export const STRUCTURE_BLURBS: Record<StructureKind, string> = {
  'wood-wall': 'A plank wall. Zombies chew through it, given the time.',
  'stone-wall': 'Solid stone. The horde will need a while.',
  'palisade': 'Sharpened stakes. Whatever chews on it bleeds for it.',
  'door': 'Lets the living through and keeps the dead out, unless they\'re vampires.',
  'wood-fence': 'A low, rickety fence. Mostly a suggestion.',
  'spikes': 'Anything standing on these has a bad time.',
  'iron-spikes': 'Spikes, but iron, and twice as cruel.',
  'barbed-wire': 'Barely cuts, but everything that wades through it slows to a crawl.',
  'scarecrow': 'A straw decoy that nearby zombies can\'t resist attacking first.',
  'torch': 'A torch on a pole. Vampires keep out of its brighter glow.',
  'lantern': 'An oil lantern that throws light farther than a torch.',
  'ghost-lamp': 'Burns ectoplasm. No ghost can blow it out.',
  'campfire': 'Warm light that slowly mends anyone resting beside it.',
  'soul-fire': 'Pale flames fed on bone and blood. Heals like a campfire, and ghosts can\'t put it out.',
  'effigy': 'A twisted little figure. Monsters near it feel uneasy and slow down.',
  'obelisk': 'A cursed stone. Monsters near it take more damage from everything.',
  'blood-fountain': 'A basin that slowly drains whatever wades in, pumping out blood.',
  'soul-cage': 'An iron cage that snatches nearby ghosts out of the air.',
  'platform': 'A wooden deck one level up, for looking down on the horde.',
  'steps': 'A ramp up to whatever stands beside it.',
  'research-table': 'Notes, skulls, and candle stubs. Upgrades cost less near it.',
  'stash': 'Sixteen slots that only you can open.',
  'sawmill': 'Feed it wood and it cuts planks.',
  'furnace': 'Feed it stone and it smelts iron.',
  'altar': 'Bleed on it to wake it. While it\'s awake, kills nearby spill more blood.',
  'bloodforge': 'Iron and blood go in. Bloodsteel comes out.',
  'sifter': 'Sifts grave dirt and stone for glints of silver.',
  'sentry': 'A cursed turret that drinks blood and spits it back at monsters.',
  'digger': 'Sits on a grave and keeps digging it up, storing what it finds for you.',
  'bone-wall': 'Stacked bones and skulls. The toughest wall there is.',
  'coffin': 'Your own coffin. When you die, you climb back out beside it.',
  'bell': 'A silver bell whose ring keeps ghosts away.',
  'cauldron': 'Candy, blood, and bone stew into a tonic.',
  'anvil': 'Late gear and parts can only be forged beside it.',
  'quarry': 'Slowly cuts stone out of bedrock, forever, and asks for nothing.',
  'oven': 'Bakes pumpkins, bones, and blood into candy. Don\'t ask what\'s in the filling.',
  'belt': 'Carries whatever lies on it the way it was laid, one thing to a tile, pulling it out of chests, diggers, and stations behind it.',
  'sorter': 'A belt with a mind of its own: tell it which way each thing goes, and the rest rolls straight on.',
  'seeds': 'Plant them on grass and water them with blood.',
  'sprout': 'A pumpkin on its way. One more watering of blood.',
  'bolt-turret': 'Shoots bolts at the nearest monster, as long as you keep it loaded.',
  'swiper': 'Blades that spin around and cut down anything that gets close.',
  'flamethrower': 'Burns wood to spray fire across the crowd.',
  'ballista': 'A huge bolt from very far away that skewers several monsters in a row.',
};

/**
 * A line or two about each kind of goods, shown under its name.
 */
export const GOODS_BLURBS: Record<Goods, string> = {
  wood: 'From the gnarled dead trees and the hedges.',
  planks: 'Wood the sawmill has cut straight.',
  stone: 'Broken off rocks and old headstones.',
  iron: 'Stone the furnace has smelted.',
  bolts: 'Crossbow and turret ammunition.',
  arrows: 'Fletched for the bow.',
  bone: 'Dug out of graves and left behind by skeletons. There\'s always more.',
  silver: 'The sifter\'s rare shine, and the bane of the unholy.',
  bloodsteel: 'Iron quenched in blood. It\'s still warm.',
  tonic: 'A bubbling green brew. Drink it for four hearts back.',
  ectoplasm: 'Ghost residue: cold, glowing, and faintly sticky.',
  chain: 'Heavy iron links, forged at an anvil.',
  'cursed-core': 'Bloodsteel and silver bound into something that pulses.',
  pumpkin: 'Fresh off the vine. The witch\'s oven wants it.',
  'watering-can': 'Pours blood instead of water, and pumpkins love it. The can lasts forever; the blood doesn\'t.',
  'holy-water': 'Silver dissolved in blood and prayed over until it runs clear. Vampires and demons hate it.',
  'brute-tendon': 'A cord of gristle as thick as your wrist, cut from a brute. It still twitches.',
  'ghoul-fang': 'A long, hooked tooth pried from a ghoul\'s jaw. Weapons set with it bite faster.',
  'hex-shard': 'A sliver of a witch\'s curse, gone hard and purple. It hums when you hold it.',
  brimstone: 'A smouldering lump left where a demon fell. It never quite goes out.',
  candy: 'Dug from graves and spent on your skill tree. Everything here wants it.',
  blood: 'Spilled by monsters. Spent on upgrades, and some things drink it.',
};

/**
 * The description of a kind of item.
 *
 * @param key The item's key.
 * @returns Its description.
 */
export function itemBlurb(key: ItemKey): string {
  const [kind, what] = key.split(':') as ['gear', GearKind] | ['build', StructureKind] | ['mat', Goods];
  return kind === 'gear' ? GEAR_BLURBS[what] : kind === 'build' ? STRUCTURE_BLURBS[what] : GOODS_BLURBS[what];
}
