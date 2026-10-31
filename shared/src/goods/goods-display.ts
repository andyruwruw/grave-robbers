// Types
import type { Goods } from './goods';

/**
 * Goods colors, shared so the phone matches the TV's piles.
 */
export const RESOURCE_COLORS: Record<Goods, string> = {
  wood: '#8a5a32',
  planks: '#c8955a',
  stone: '#8d929b',
  iron: '#5d6b7a',
  bolts: '#c9b48a',
  arrows: '#b89060',
  bone: '#e6dcc0',
  silver: '#d4dce6',
  bloodsteel: '#7e1626',
  tonic: '#7ddc4a',
  ectoplasm: '#9dffc8',
  chain: '#7c8794',
  'cursed-core': '#c02a4a',
  pumpkin: '#e8742a',
  'watering-can': '#8a2030',
  'holy-water': '#bfe4ff',
  'brute-tendon': '#b0485a',
  'ghoul-fang': '#ece2c6',
  'hex-shard': '#9a3fe0',
  brimstone: '#ff7a1a',
  candy: '#f5c62e',
  blood: '#b0141e',
};

/**
 * Goods names, as the phone and the kill feed show them.
 */
export const GOODS_LABELS: Record<Goods, string> = {
  wood: 'Wood',
  planks: 'Planks',
  stone: 'Stone',
  iron: 'Iron',
  bolts: 'Bolts',
  arrows: 'Arrows',
  bone: 'Bone',
  silver: 'Silver',
  bloodsteel: 'Bloodsteel',
  tonic: 'Tonic',
  ectoplasm: 'Ectoplasm',
  chain: 'Chain',
  'cursed-core': 'Cursed core',
  pumpkin: 'Pumpkin',
  'watering-can': 'Blood watering can',
  'holy-water': 'Holy water',
  'brute-tendon': 'Brute tendon',
  'ghoul-fang': 'Ghoul fang',
  'hex-shard': 'Hex shard',
  brimstone: 'Brimstone',
  candy: 'Candy',
  blood: 'Blood',
};
