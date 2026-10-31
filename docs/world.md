# World

The map is a tile grid with a fixed terrain level per tile. It's server-mutable: building, breaking, and regrowth change tiles, and the server broadcasts the deltas.

## Sizes

| Size (`MapGenSettings.size`) | Tiles | Edge |
|---|---|---|
| Classic (default) | 56x34 (`MAP_WIDTH`, `MAP_HEIGHT`) | A fence; off-map reads as `fence` |
| Huge | 256x256 (`HUGE_SIZE`), one whole landscape | A ring of chasm; off-map reads as `chasm` |

- `WorldMap` carries its own `width`, `height`, and `edge`; nothing assumes the classic size. `WorldMap.decode` takes the width, and the `world` message, saves, and presets carry it.
- The TV's Regenerate Map card picks the size (Classic or Huge) next to the random map knobs. Switches for the huge-only sites (`hugeOnly` in `MAP_STRUCTURES`) show only for Huge.
- **Generating popup:** a random huge world takes a moment, so `MapHandler.reset` first sends displays `generating`, then starts generating `GENERATING_LEAD_MS` (60) later (`server/src/net/config/world.ts`) so the message gets out first. The TV, admin, and /play show `GeneratingScreen` (`packages/game-ui`, its lines in `config/generating.ts`) until the `world` message. Further resets are ignored until it's done. Classic maps and presets are quick and skip it.
- **Background threads:** with the `threads` setting on (the default; the Background threads switch on the TV's Game tab and the admin's Gameplay page), `MapHandler.reset` generates a huge world on a worker thread instead (`world-gen/threads/generate-huge-off-thread.ts` runs `huge-gen-worker.ts`), so the game keeps ticking. The worker sends the map back encoded as a nameless `MapPreset`, which `Game.reset` starts the world from (about 30 ms on the game's thread instead of the whole generation). If the worker fails, it generates on the game's thread as before. Off, generation runs on the game's thread and the game freezes for it.
- A huge world is meant for players spread out over it: monsters spawn around each player ([monsters.md](monsters.md#spawning-and-pacing)), each screen gets only what's near the players it shows ([architecture.md](architecture.md#huge-worlds)), and the TV splits its screen ([tv.md](tv.md#split-screen)).

## Terrain levels

| Level | What |
|---|---|
| -1 | Sunken hollows |
| 0 | The ground |
| 1 | Terraces |
| 2 | Higher terrace cores |
| up to 3 | The watchtower's floors |

- Each level is 1.5 high.
- Every drop is a rough stone retaining wall with a broken capstone rim and a shadow line at its foot.
- Grass is lighter the higher it is and darker in hollows.
- Stairs have pale treads over dark risers and a stepped stone wall up each open side. They can be turned (`TileGrid.setRamp`; 0 lets `WorldMap.rampUp` choose).

### Moving between levels

- Walkers step up at most `STEP_UP` (0.4), so only stairs and built steps climb a level. Anyone can drop off an edge.
- A walker stands on the highest ground under any part of them, so they only drop once clear of the edge.
- Monsters path by the same rule. `WorldMap.roundTrip` checks that a tile can be reached and left again.

### Height in combat

| Rule | Value |
|---|---|
| Melee reach down / up | 1.8 / 0.6 (`MELEE_REACH_DOWN`, `MELEE_REACH_UP`) |
| High-ground bonus | +1 damage swinging at a target at least 0.5 lower |
| Ranged shots | +2 tiles of range per level above the ground; stop at ground rising above them |
| Fall damage | 1 heart per level fallen, when knocked off a drop of at least 0.6 (vampires too; zombies take none) |

### Chasms

- `chasm` (`~`) is solid ground at `MIN_LEVEL` that nobody walks into: `walkerBlocked` treats it as a wall.
- Only knockback can push someone over the edge (`walk(..., intoChasm)`). A player knocked in dies to `CHASM_DEATH` ("the abyss"); a monster knocked in is gone.
- The TV draws it as stone cliffs dropping into black (`CHASM_DEPTH` in `graveyard/config/terrain-shape.ts`, `CHASM_FLOOR` in `graveyard/config/palette/ground.ts`), and skips the outskirts woods when the map's edge is chasm.

## Collision

- Height-aware (`shared/src/world/collision.ts` `walkerBlocked`). `moveWithCollision` slides a mover heading straight past a corner it barely clips.
- Players and walking monsters can't overlap; walking into a zombie shoves it.
- Trees are passable but slow whoever is within `TRUNK_RADIUS` of the trunk: players to `TREE_SLOW` (50%), zombies and vampires to `MONSTER_TREE_SLOW` (70%).

## The random map generator

`server/src/game/world-gen/generate-world.ts` `generateWorld`, seeded, shaped by `MapGenSettings` (`shared/src/map-gen/settings.ts`, sent with `reset-world`). Each step is a `ClassicPass` (a `GenPass` over one `GenCanvas`: map, seeded rand, knobs) in `world-gen/classic/passes/`, run in the order below; constants live in `world-gen/config/classic.ts`.

```mermaid
flowchart TD
  A[CryptPass: crypt in a cobbled courtyard at the center] --> B[PathPass: four winding main paths, two spawns each]
  B --> C[LandmarkPass: one landmark per quadrant]
  C --> D[TerracePass: broad terraces and a hollow, nothing narrower than 3 tiles]
  D --> F[StairsPass: stairs where paths cross a level change]
  F --> H[ForestPass, PlotPass, LampPass, ScatterPass: forest edge, groves, hedged grave plots, lamp posts, scatter]
  H --> G[StairsPass: tidy, more stairs until every tile is reachable there and back, fill the rest]
```

**Landmarks** (one per quadrant, `Landmark` subclasses in `world-gen/classic/landmarks/`):
- A round walled chapel (`Chapel`, a `CourtyardLandmark`, random size from `COURTYARD_SIZES`).
- A round well plaza (`WellPlaza`, random size).
- One to three separate mausoleums (`Mausoleums`).
- The hill with the watchtower (`Hill`).

**The watchtower** is a 5x5 roofless ruin on the hill: a doorway toward the center, a pillar in the middle, and stairs spiraling up three floors. Its walls crumble to uneven heights. While a player is inside, the TV hides the front half of its upper walls. A candle on the pillar lights it.

**No roofs.** Everything is an open ruin seen from above.

**Trees** come in dead, pine, and autumn variants. Hedges can be chopped for wood.

### Huge worlds

`world-gen/generate-huge-world.ts` `generateHugeWorld`, about 0.7 s. One landscape, not stitched-together maps. Each step is a `GenPass` in `world-gen/huge/`, reusing the classic passes where they fit.

```mermaid
flowchart TD
  A[SitePass: the hub at the middle, then sites scattered at least SITE_SPACING apart] --> B[HeightPass: one height field for the whole map, cut into levels -1 to 2, a flat pad under each site, shelved]
  B --> C[ChasmPass: chasm ring around the edge, crevasses and sinkholes kept off the sites]
  C --> H[HubPass: crypt, four cobbled arms with two spawns each, lamps, grave plots]
  H --> D[RoadPass: 2-wide roads routed between sites by A*, winding, climbing one level at a time, bridging chasm]
  D --> S[SiteBuildPass: each site's landmark, with a path to the road]
  S --> L[LampPass on the road ends, TerracePass.stairsOnPaths, WildsPass: woods, burial grounds, rocks, pumpkins]
  L --> G[StairsPass: tidy, connect in spread-out batches until everything is reachable there and back, extras, the rest becomes trees]
```

**Sites** (`SITE_KINDS`, `SiteKind` in `world-gen/types/sites.ts`, about 40 a world):

| Site | Landmark | Off when |
|---|---|---|
| Hub (always one, at the middle) | Crypt, cobbled arms, the 8 spawns (`HubPass`) | Never |
| Chapel | `Chapel` | `chapel` is off |
| Well plaza | `WellPlaza` | `well` is off |
| Watchtower hill | `Hill` (its pad is never above the ground, so the tower fits under `MAX_LEVEL`) | `tower` is off |
| Mausoleums | `Mausoleums` | `mausoleums` is off |
| Graveyard | `Graveyard`: two to four hedged plots (`PlotPass.plot`) | `plots` is off |
| Crypt | `LoneCrypt`: a crypt with no spawns, statues or lamps on its corners | `crypts` is off |
| Ruins | `Ruins`: two to four broken stone houses, sometimes a chest or rubble inside | `ruins` is off |
| Stone circle | `StoneCircle`: a ring of statues around a lamp | `stones` is off |
| Pumpkin patch | `PumpkinPatch`: hedged rows of pumpkins between furrows | `patches` is off |

- **Terrain:** two octaves of noise (`LAND_SCALE`, `HILL_SCALE`) cut at shares of the map: `mountains` x `mountainSize` raises `HIGH_SHARE` each, `peaks` raises `PEAK_SHARE` of that again, `pits` x `pitSize` sinks `LOW_SHARE` each (together at most `GROUND_LEFT`). Each pad eases back to the land over `PAD_BLEND` tiles, then `TerracePass.shelve` keeps every level change a broad shelf.
- **Roads:** a minimum spanning tree of the sites plus loops (`ROAD_LOOPS` within `ROAD_LOOP_REACH`), each routed eight ways by `helpers/route.ts` with costs for wandering, climbing, bridging, trespassing, and a discount for following a road already laid (`ROAD_*`). They stop `ROAD_STOP` of the way into a site's pad; the landmark paths out to meet them. Lamp posts mark each road's last `LAMP_STRETCH` tiles into a site.
- **Wilds** (`WildsPass`, off every pad): thick woods where `FOREST_SCALE` noise passes `FOREST_FROM`, lone trees, rocks (`ROCKS_HIGH` times more on raised ground), graves (`GRAVEFIELD_BOOST` times more in burial grounds), and pumpkins (`PUMPKINS_ROADSIDE` times more beside roads), each times its knob.
- `StairsPass.connect` adds flights at least `CONNECT_SPREAD` apart per round (`CONNECT_ROUNDS` at most); anything still unreachable becomes trees.
- `perArea` (`world/helpers/tiles.ts`) scales the pumpkin and chest targets to the map's area.

## Presets

New worlds start from a map preset in `server/presets/<id>.json` unless the TV picks Random.

| Field | Meaning |
|---|---|
| `seed`, `tiles`, `levels`, `ramps` | The map |
| `view` (optional) | The part of the map the TV frames; `World.inView` (over `inView` in `world/helpers/tiles.ts`) keeps Game tab spawns inside it |
| `quiet` (optional) | Starts the world with Natural spawning off |
| structures (optional) | Built structures; a new world gives them fresh state |

- `king-of-the-hill` is the default (`WORLD_PRESET` overrides it).
- `sandbox` is a fenced 10x10 test arena using `view` and `quiet`.
- `game/storage/presets.ts` lists and loads them (`server/src/config/paths.ts` names the folder); `DisplaySessionHandler` sends the list to the TV in `display-welcome`.
- The map editor's Save as map writes one via `savePreset` (`PRESET_DIR` overrides the folder).

## Regrowth

The map keeps itself stocked toward fixed targets, so a server left alone never fills up or empties out.

| What | How |
|---|---|
| Trees | Rise beside other trees (mostly toward the middle) every ~12s, up to as many as the map started with (stumps count) |
| Hedges | Each time a tree grows, a hedge rises beside other hedges too, up to as many as the map started with (`hedgeTarget` in the save) |
| Stumps | Rot away after 2 to 4 minutes |
| Pumpkins | Swell up beside paths every ~40s, up to 10 |
| Chests | Surface beside graves and hedges every ~60s, up to 3 |
| Rocks | Top up to 20 (`ROCK_TARGET`) |
| Graves | A dug grave leaves an open mound; a new gravestone rises 3 to 5 minutes later |

- Nothing grows on a spawn, a person, an item, or anywhere a flood fill says would cut off a reachable tile.
- The Game tab's Natural spawning switch stops all regrowth.
- **Targets** (`Regrowth.targets`, by `RegrowthTile` in `shared/src/world/regrowth.ts`): trees and hedges start at what the map was generated with, pumpkins and chests at `perArea`, rocks at `ROCK_TARGET`. The admin's Manipulate section changes them (`regrowth-target`, `Regrowth.setTarget`, 0 to `MAX_REGROWTH_TARGET`), and all five are saved (`treeTarget`, `hedgeTarget`, `pumpkinTarget`, `chestTarget`, `rockTarget`). A lower target only stops growth; nothing is removed.
- Displays get the targets in every state snapshot (`regrowth`) and the counts on the map once a second (`stats.stocked`, `Regrowth.stocked`).

## Ground items

| Kind | Picked up by |
|---|---|
| Resource piles (materials, candy, blood) | Walking over them |
| One bag item (gear, or a crate of structures) | Walking over it, into the bag, never equipped |

- What you just dropped waits 2 seconds before you can pick it back up.
- What spills from a dead player can only be picked up by that player (`GroundItem.ownerId` in `world/types/items.ts`, not saved).
- Ground gear glints so it can be found in the dark.
