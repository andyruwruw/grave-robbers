# Admin console (/admin)

`/admin` is the `apps/admin` app: the TV's controls and a view of the world, for whoever runs the game, from a laptop or a phone. It joins as a display with `admin: true` (`admin-page.tsx`).

## Layout

- The world view fills the screen (`AdminWorld`, with the kill feed over it). The controls sit in a see-through panel over it (`AdminSidebar`, `bg-background/85` with a blur): down the right on a wide screen, along the bottom on a narrow one.
- The panel holds one page at a time (`AdminPageBody`). Every page has an outlined header card at the top (`PageHeader`, `bg-muted`: a shade lighter than the menu's buttons and the cards) with a back button to the menu (not on the menu itself), the page's icon and title, and a close button.
- Closing hides the panel; the Admin Controls button in the top right corner (`OpenPanelButton`) brings it back.
- The Item Catalogue and Knowledge Tree open as dialogs over the world instead (`AdminDialog`): a see-through backdrop, the header on top. Clicking the backdrop, the close button, or Back returns to the menu.
- Escape goes back to the menu from anywhere.
- Sections are titled cards (`TitledCard` in `packages/controls`): the title over a line, the body below.

## Pages

The menu, titled "Admin Controls", has a button with an icon and a name per page (`ADMIN_PAGES` in `config/admin-pages.ts`: Players, Gameplay, Spawn, Give, Item Catalogue, Knowledge Tree, Map, Worlds), and the server stats (`ServerStats`) pushed to the bottom of the panel.

| Page | What it holds |
|---|---|
| Players | Players (`PlayerRoster`), then Follow (`components/follow-panel.tsx`: the whole map, the spawn on a huge world, or any player, and while following or on a huge world the TV view presets, `TV_VIEWS`), then Controllers (`ControllersPanel`) |
| Gameplay | Manipulate (`ManipulateCard`: the difficulty, a stepped slider from Easy to Hardest (`DifficultyRow`, see [difficulty.md](difficulty.md#server-difficulty)), the world level, a button per world event, Kill all monsters, Destroy ground items (`clear-items`, `GroundItems.clear`), and how many trees, hedges, pumpkins, chests, and rocks the world keeps: the count now, then - and + around the target, shift for 10 (`StockTargets`, see [world.md](world.md#regrowth))), then Cheats (`CheatsCard`: every switch in `SWITCHES`, and daytime) |
| Spawn | Objects, Monsters, Gear, and Buildables, each a button with the thing's own 3D model (`SpawnCard` picking mode), then Random Location, pinned to the bottom of the panel at any scroll |
| Give | Hand a player things straight into their bag (`components/give-page.tsx`). Player picks who (the followed player first, else the first in the roster), Amount picks 1, 10, 50, or 99 (`GIVE_AMOUNTS` in `config/give.ts`), then Goods (candy, blood, every material), Gear, and Buildables each list a button per thing with its own 3D model (`GIVE_SECTIONS`). A click sends `give`. See [Giving](#giving) |
| Map | Tabs (`ControlTabs`): New Map (regenerate on a preset or a random map, `NewMapPage`) and Map Editor, whose tab is open exactly while the editor is (`useMapEditor`, `MapEditor` over the world view, framing the whole map). Back or Escape closes the editor |
| Item Catalogue | Dialog. Everything craftable, every recipe open, with the picked one's details (`components/catalog-panel.tsx`, from `RecipeList` and `ItemDetails`). View only: nothing is crafted |
| Knowledge Tree | Dialog. The skill tree with every node open (`components/tree-viewer.tsx`, `TreePanel` embedded). With a mouse, details show on hover and the tree pans by dragging, as on /play |
| Worlds | Named world save slots (`components/worlds/worlds-page.tsx`). Worlds (`WorldSlotsCard`): a row per slot (`WorldSlotRow`: name, size or New, characters, last saved, Active on the one being played) with Play and Delete on the others, then a name and New world (`NewWorldForm`). Characters (`CharactersCard`): the playing world's characters (`CharacterRow`: color, name, online dot) with Release. See [Worlds](#worlds) |

- **Spawning:** clicking a thing picks it (clicking it again, or leaving the page, puts it down). While something is picked, a left click on the map conjures it there (`SpawnMouseMode`, `useSpawnMouse`: `spawn` with `at`, the ground under the pointer), and Random Location, greyed out until then, conjures it at a random spot. The cursor breaks the usual rules (grass only, away from spawns and people, not cutting off a path, a player's build rules, lit ground for monsters) and puts it right on the clicked tile, but never on top of something: a tree, pumpkin, chest, rock, or structure needs bare floor (`FREE_FLOORS`: grass, path, cobble, flagstone; not stairs, the spawn, or a grave mound, though a structure may still go where a player could build it), and a monster or gear any tile that isn't solid. Random Location keeps the usual rules (see [tv.md](tv.md)).
- **Viewing levels:** the catalogue and the tree each keep their own skill tree, never sent to the server. Left click a picked item or node (or the catalogue's details, or the tree's Upgrade) to upgrade it, right click to downgrade (0 to `MAX_UPGRADE_LEVEL`), so stats and costs show at each level. `TreePanel` takes `onDowngrade` for this. The catalogue's costs show against an empty wallet.
- No Music tab and no incognito: only the TV runs music.
- **Moving the view** (`useAdminCamera`, constants in `config/camera.ts`):
  - A huge world starts on the spawn, `HUGE_START_TALL` (56) tiles tall.
  - **WASD** pans whenever the view is smaller than the whole map (`useAdminPan`; Shift for double speed; not while typing in a field or with the map editor open). It moves at `PAN_SPEED` (0.8) view heights a second, so it feels the same at any zoom. Panning while following a player leaves them and pans from where the camera was (`WorldRenderer.viewCenter`).
  - **The wheel** zooms in to `MIN_TALL` (8) tiles tall and out as far as `MAX_TALL_MAPS` (4) map heights. From the whole map it starts a free view on the map's middle. Far out, the renderer drops detail as it goes: a flat overview map past 64 tiles tall, monsters and players as dots past 150 (see [tv.md](tv.md)).
  - The view can go up to half a screen past the map's edge (`OVERSCROLL`, given to `WorldRenderer.setFollowOverscroll`; the camera's `CameraFollow.overscroll`), so the edge can reach the middle of the screen instead of the view stopping against it. Other screens keep 0.
  - Picking a Follow entry or a view preset drops the wheel's zoom and the free point.
- **Following on a huge world** sends `watch` with the player, so the server sends only their surroundings (`INTEREST_RADIUS`). The admin isn't a viewer, so the TV keeps that player in its split screen.
- **The mouse** works like the TV's (`useTvMouse`): pick up players and monsters, carry the light, as the Cheats switches allow, unless the Spawn page has something picked or the editor is open.
- A ping over `INTERP_PING_MS` turns on interpolation, as on the TV.
- No keyboard shortcuts besides WASD, no game controllers of its own, no sound.
- **Display settings:** like every display it holds a `DisplaySettings` (`DEFAULT_DISPLAY_SETTINGS`, no menu to change them), given to its renderer with `setDisplaySettings` and no player of its own. The TPS, FPS, and server ticks overlay (`PerfOverlay`) shows in the world view's bottom right corner when those flags are on.

## Giving

`give` (`{ player, item, count }`, `GiveKind` and `GIVE_KINDS` in `shared/src/protocol/tv-tools.ts`) goes to `ConjureSystem.give` through the TV tools handler.

- **Candy and blood** are added to the counters (`BagSystem.take`).
- **Materials and buildables** go onto stacks in the bag (`BagSystem.store`), never into a hand.
- **Gear** is made fresh with the player's own tree (`freshItem`, as if crafted), one bag slot each, at most `GIVE_GEAR_MAX` (20) a click. Infused-only gear isn't listed.
- At most `GIVE_MAX` (999) a click. Whatever doesn't fit drops at the player's feet (`DropSystem.dropAt`). The phone plays the pickup sound.

## Worlds

The Worlds page manages the server's world slots (`shared/src/saves/world-slots.ts`: `WorldSlotInfo`, `CharacterInfo`). Every message is admin only, and the server answers each by sending every admin `world-slots` with the slots and the playing world's characters, kept in `AdminPage` state.

| Action | Sends | What happens |
|---|---|---|
| Opening the page (or reconnecting on it) | `world-slots` | Asks for the list |
| New world | `slot-create` with `name` (up to `WORLD_NAME_MAX`, 32, in `config/worlds.ts`) | An empty slot; its map is made from the default preset the first time it's played |
| Play | `slot-open` with `id` | Saves and backs up the current world, then plays that slot. Everyone goes back to the join form; that slot's own characters come back when their phones reconnect |
| Delete | `slot-delete` with `id` | Deletes a slot that isn't active, backed up first under the server's `saves/backups` |
| Release | `character-release` with `id` | Deletes the character from the playing world for good, freeing the name; an online one's phone goes back to the join form |

- Play, Delete, and Release each ask first: the button turns into a note on what it will do, a red go-ahead button, and Cancel (`ConfirmPrompt`).
- Size reads "256 x 256", or "New" before the first save; last saved reads "never", "just now", minutes or hours ago within a day (`RELATIVE_MS`), then the local date and time (`slotSize`, `savedAgo` in `helpers/world-slots.ts`).
