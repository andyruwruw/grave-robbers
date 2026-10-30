# Code organization

Where new code goes, and the shape it takes. These rules hold in every workspace (`shared/`, `server/`, `packages/*`, `apps/*`). The module map and class diagrams are in [architecture.md](architecture.md).

## Folders

| Folder | Holds | Example |
|---|---|---|
| `<topic>/` | One folder per domain or subsystem, named for what it does | `server/src/game/combat/`, `shared/src/gear/` |
| `config/` | `UPPER_SNAKE` constants, one file per topic (`config/<topic>.ts`) | `game/horde/config/ai.ts`, `renderer/src/world/chunks/config/chunks.ts` |
| `helpers/` | Pure functions, no state | `game/world/helpers/tiles.ts`, `shared/src/helpers/seeded-random.ts` |
| `types/` | Shared types and interfaces, one file per domain | `game/types/players.ts`, `net/types/session.ts` |
| `kinds/` | Leaf classes or data, one per kind (monster kinds, avatar kinds) | `game/horde/monsters/kinds/ghoul.ts`, `shared/src/monsters/kinds/ghoul.ts` |
| `components/`, `hooks/` | React components and hooks (client workspaces) | `game-ui/src/components/bag/`, `controls/src/hooks/use-map-editor.ts` |

- **Never** a `config/index.ts`, an `index.ts` of any kind, a barrel, or a file named `types.ts`. Import each file by its own path.
- **Nearest common ancestor:** a constant, helper, or type lives in the `config/`, `helpers/`, or `types/` of the closest folder that contains every file using it. Used by one subsystem, it stays in that subsystem's folder; used by two, it moves up (`game/config/`, `game/helpers/`, `game/types/`).
- Group related files in subfolders once a folder gets crowded (`painters/walls/`, `audio/watchers/`, `input/modes/`).

## Files

- **kebab-case** file names.
- **One exported class per file**, and the file is the kebab-case of the class: `TileJobSystem` in `jobs/tile-job-system.ts`, `CrossbowReticles` in `effects/crossbow-reticles.ts`.
- **Size:** keep files at or under 300 lines, never over 400. Check with `find shared/src server/src packages/*/src apps/*/src -name '*.ts*' | xargs wc -l | awk '$1>300 && $2!="total"'` (it should print nothing). Split by moving a method group into its own class, or constants into `config/`.

## Imports

| Group | What goes in it |
|---|---|
| `// Packages` | npm packages and every `@halloween/*` workspace import |
| `// Local Imports` | Relative imports |
| `// Types` | Every `import type` |

- Shared is imported as `@halloween/shared/<folder>/<file>` (`@halloween/shared/gear/gear-catalog`); `shared/package.json` exports `./*`, so nested paths need no config. Inside `shared/`, imports are relative only.
- Packages are imported as `@halloween/<package>/<path>` (`@halloween/renderer/world/world-renderer`).
- Use `import type` for anything only used as a type, to keep import cycles out. Server subsystems `import type { Game }`; monsters never value-import `horde.ts`, `spawner.ts`, or `monster-factory.ts`.

## Classes

### Families

- Use a base class and inheritance for a family of things that share a shape (`TileJob`, `TilePainter`, `WeaponMotion`, `SoundWatcher`, `InputMode`).
- Abstract bases are named for their root, and leaves for what they are: `<Thing>Job`, `<Thing>Painter`, `<Thing>Motion`, `<Thing>Handler`, `<Thing>Mode`.

### Composed parts

A part of a bigger object extends that object's part base, which takes the root in its constructor and reads the root's state through **live getters**, never copies that could go stale.

| Root | Part base | Naming | File |
|---|---|---|---|
| `Game` | `GameSystem` | `<Thing>System` | `game/core/game-system.ts` |
| `World` | `WorldFeature` (`TickingFeature` for per-structure ticks) | Named for the feature (`Gardens`, `TurretAmmo`) | `game/world/world-feature.ts` |
| `Horde` | `HordePart` | Named for the job (`Spawner`, `Sight`) | `game/horde/horde-part.ts` |
| `ConnectionHub` | `HubPart` (`MessageHandler` for messages) | `<Thing>Handler`, or named for the job | `net/core/hub-part.ts` |
| `WorldScene` | `ScenePart` | Named for the job (`TerrainChunks`, `CameraRig`) | `renderer/src/world/scene-part.ts` |
| A generator canvas | `GenPass` | `<Thing>Pass` | `game/world-gen/gen-pass.ts` |

### Traps to avoid

- **Field order is init order.** Parts created as field initializers run in declaration order; their constructors must not reach for parts declared later (`Game` declares `horde` after `roster` and `outbox`).
- **No base constructor calls an overridable method** that reads subclass fields (they don't exist yet). Build lazily (`MapPointerMode` handlers on first use) or in a separate step (`createMonsterAvatar` then `assemble()`).
- **Never redeclare a base field** in a subclass, even without an initializer: define semantics reset it to `undefined`. Use `declare` to narrow a type.
- **Methods passed as callbacks** (`requestAnimationFrame`, `setInterval`, a hook's handler) are arrow properties, so `this` stays bound.
- **Module singletons stay singletons:** `sfx`, `TREE_LAYOUT`, the icon renderer and caches, `world-coords` map size, `globalThis.graveyardMusic` and `graveyardSongs`.
- **Hot paths** (the server tick, the render frame) allocate nothing new per call: reuse arrays and return objects, iterate live maps instead of spreading them.
- **three.js:** whoever creates a geometry, material, or texture disposes it.

## Style

- **JSDoc** on every function, class, method, interface, and interface field: a description sentence, plus `@param` and `@returns`.
- Private and protected fields start with `_` (`_game`, `_ctx`); public fields and method names don't.
- Moved code keeps its declaration form; new helpers are arrow consts.
- Single-quoted JSX attributes. UI chrome uses theme token utilities; game colors live in `shared/` or the renderer.
- No em dashes, in code or prose.
