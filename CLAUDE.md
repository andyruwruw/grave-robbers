# Grave Robbers

Top-down pixelated voxel horror party game. The TV shows the world; phones are the controllers. Real-time over WebSockets.

## Docs

The docs are split by topic so you can load only what a task needs. Read the relevant file before changing that area.

| Doc | Read it when working on |
|---|---|
| [docs/overview.md](docs/overview.md) | What the game is, the core loop, what isn't built yet |
| [docs/architecture.md](docs/architecture.md) | Workspaces, module map per workspace, class hierarchies, tick loop, networking, identity, saves, running, conventions |
| [docs/organization.md](docs/organization.md) | Where new code goes: folders (`config/`, `helpers/`, `types/`, `kinds/`), one class per file, part base classes, imports, size limit, traps |
| [docs/class-hierarchies-server.md](docs/class-hierarchies-server.md) | Server and shared base classes and their subclasses (GameSystem, Player, TileJob, TurretFire, hub parts, Monster, Wound, HordePart, WorldFeature, GenPass, WeaponPerk, TileGrid) |
| [docs/class-hierarchies-client.md](docs/class-hierarchies-client.md) | Client base classes and their subclasses (ScenePart, Avatar, MonsterAvatar, WeaponMotion, GroundDrop, EssenceLook, EffectLayer, TilePainter, MusicSource, SoundWatcher, EditTool, InputMode, StatSheet) |
| [docs/world.md](docs/world.md) | The map, sizes and huge worlds, chasms, terrain levels, height rules, collision, the generators, presets, regrowth, ground items |
| [docs/combat.md](docs/combat.md) | Health, healing, overheal, death, PvP, melee, what a swing is made with, blocking, armor, panic |
| [docs/weapons.md](docs/weapons.md) | Every weapon, trick, and upgrade perk; ranged rules; `damageTo`; junk; off-hand; armor |
| [docs/infusions.md](docs/infusions.md) | Weapon infusions at the anvil: essences, drop rates, costs, every variant with its rules and DPS estimates, infusing, models, the Armory, where the code is |
| [docs/monsters.md](docs/monsters.md) | Monster stats, AI, attacks, sight, each kind, spawning, the blood moon, hit effects, statuses, turned monsters and risen allies |
| [docs/world-events.md](docs/world-events.md) | World events (the blood moon): their effects list, how systems read `EventModifiers`, adding one |
| [docs/difficulty.md](docs/difficulty.md) | Hidden player and world levels and what they do to the horde |
| [docs/building.md](docs/building.md) | Goods, the bag, loot sources, crafting, every structure, lights, stations, automation |
| [docs/skill-tree.md](docs/skill-tree.md) | Tree branches, unlocks, upgrade costs and effects, the phone's tree fog |
| [docs/phone.md](docs/phone.md) | The phone controller: layout, TV controllers, panels, building, details, feedback, icons, font |
| [docs/play.md](docs/play.md) | The /play screen: controller or keyboard and mouse, bindings, the follow camera, menus with spatial navigation, settings |
| [docs/admin.md](docs/admin.md) | The /admin console: world view, following a player, the TV's controls without music |
| [docs/tv.md](docs/tv.md) | The TV renderer, chunks, split screen, effects, sidebar tabs, Game tab, shortcuts, mouse, map editor, controllers phones claim |
| [docs/audio.md](docs/audio.md) | Sound effects, music, Spotify, media |
| [docs/deploy.md](docs/deploy.md) | Running it on a DigitalOcean droplet behind Caddy (HTTPS), updating, backups, latency and region |

## Keeping the docs current

- **Every change updates its doc in the same change.** If you change a mechanic, a number, a file's responsibility, or a UI flow, edit the topic file that describes it. Add a new topic file (and a row above) if nothing fits.
- **The code is the source of truth.** Take numbers from `shared/` rather than memory, and remove anything that's no longer true.
- **Keep them readable:** short sections under headers, tables for stats and options, bullet lists for rules, mermaid diagrams for flows and trees. No long paragraphs. No em dashes.
- **Name the code:** mention the file, function, or constant behind a rule (in backticks) so the next reader can find it.

## Quick reference

- `npm run dev`: server :3021, one Vite per app (mobile :5181 passes /tv, /play, /admin to :5182 to :5184). Open `http://localhost:5181/tv`.
- `apps/` (mobile, tv, play, admin) never import each other; shared client code lives in `packages/` (ui, renderer, game-ui, controls), imported as `@halloween/<package>/<path>`.
- `npm run typecheck`, `npm run build`, `npm start`, `npm run dev:fresh` (deletes every save: all world slots, characters, and backups).
- `shared/` is raw TS in topic folders, imported as `@halloween/shared/<folder>/<file>` by the server, packages, and apps. No barrel.
- The server is authoritative: clients send intent, never positions. Everything acts on the facing tile.
- kebab-case files, `// Packages` (npm and `@halloween/*`) / `// Local Imports` / `// Types` import groups, JSDoc on every function, class, method, and field, single-quoted JSX attributes. UI chrome uses theme token utilities; game colors live in `shared/` or the renderer.
- Organization ([docs/organization.md](docs/organization.md)): one exported class per file named for it, families share a base class, parts extend their root's part base (`GameSystem`, `WorldFeature`, `HordePart`, `HubPart`, `ScenePart`), constants in `config/<topic>.ts`, pure functions in `helpers/`, types in `types/<domain>.ts`, leaf kinds in `kinds/`, no `index.ts` or barrels, files at most 300 lines (400 ceiling).
