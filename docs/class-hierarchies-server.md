# Class hierarchies: server

Every base class in server and what extends it, as mermaid class diagrams. The client side is in [class-hierarchies-client.md](class-hierarchies-client.md). Module layout is in [architecture.md](architecture.md#modules); the folder rules are in [organization.md](organization.md).

## GameSystem

Every `Game` subsystem extends `GameSystem` (`game/core/game-system.ts`), which holds `_game` and exposes `world`, `horde`, `players`, `outbox`, and `settings` as getters. `Game` creates them as field initializers in dependency order, so their constructors never touch `world` or `horde`.

```mermaid
classDiagram
  class GameSystem {
    <<abstract>>
    #_game: Game
    #world
    #horde
    #players
    #outbox
    #settings
  }
  GameSystem <|-- Outbox
  GameSystem <|-- GameHordeHooks
  GameSystem <|-- ViewSystem
  GameSystem <|-- JoinSystem
  GameSystem <|-- ControlSystem
  GameSystem <|-- LifeSystem
  GameSystem <|-- PlayerTickSystem
  GameSystem <|-- MovementSystem
  GameSystem <|-- PanicSystem
  GameSystem <|-- ActionSystem
  GameSystem <|-- MeleeSystem
  GameSystem <|-- MeleeTricksSystem
  GameSystem <|-- InfusionSystem
  GameSystem <|-- DamageSystem
  GameSystem <|-- TurretSystem
  GameSystem <|-- PatchSystem
  GameSystem <|-- RangedSystem
  GameSystem <|-- FlameSpraySystem
  GameSystem <|-- AimingSystem
  GameSystem <|-- ShotSystem
  GameSystem <|-- GlaiveSystem
  GameSystem <|-- MirrorShieldSystem
  GameSystem <|-- PuddleSystem
  GameSystem <|-- TileJobSystem
  GameSystem <|-- BagSystem
  GameSystem <|-- HandsSystem
  GameSystem <|-- PickupSystem
  GameSystem <|-- DropSystem
  GameSystem <|-- MonsterSpoilsSystem
  GameSystem <|-- StashSystem
  GameSystem <|-- UseSystem
  GameSystem <|-- BuildSystem
  GameSystem <|-- CraftSystem
  GameSystem <|-- WorldEventSystem
  GameSystem <|-- LevelSystem
  GameSystem <|-- GameTabSystem
  GameSystem <|-- ConjureSystem
  GameSystem <|-- TvHandSystem
  GameSystem <|-- TestBotSystem
  GameSystem <|-- TileJob
  GameSystem <|-- TurretFire
```

- Infusion parts: `MeleeTricksSystem` (swing tricks) and `InfusionSystem` (on-kill effects) live in `game/combat/infusions/`, `PatchSystem` in `game/combat/patches/`. `RangedSystem` owns `FlameSpraySystem` (`spray`); `ShotSystem` owns `GlaiveSystem` (`glaives`) and `MirrorShieldSystem` (`shields`).

## Player

`Player` is built in layers so its fields stay flat (`p.x`) and match `PlayerState`. No layer redeclares another's field.

```mermaid
classDiagram
  class PlayerBody {
    identity, position, raw input, knockback
  }
  class PlayerKit {
    goods, bag, tree, light, build pick, stations in reach
    weapon()
    canPay()
  }
  class PlayerFighter {
    swings, blocking, bows, crossbows, combos, drawn item
  }
  class Player {
    health and death
    wounded()
    canBlock()
  }
  PlayerBody <|-- PlayerKit
  PlayerKit <|-- PlayerFighter
  PlayerFighter <|-- Player
```

The test player's steps are a small family too: `BotTask` (`game/bots/tasks/`) with `WalkTask`, `SwingTask`, and `BuildTask`, picked by `TaskPicker`.

## TileJob and TurretFire

`TileJobSystem` asks each `TileJob` in turn to `tryStrike` the facing tile on a swing; `UseSystem` does the same with its own (chest, altar, turret load, watering) on USE. `TurretSystem.fireTurrets` hands each ready turret to its `TurretFire`.

```mermaid
classDiagram
  class TileJob {
    <<abstract>>
    tryStrike(p, tx, ty, tile, chop)
  }
  TileJob <|-- GatherJob
  TileJob <|-- DiggingJob
  DiggingJob <|-- GraveJob
  DiggingJob <|-- TombJob
  TileJob <|-- ChestJob
  TileJob <|-- PumpkinJob
  TileJob <|-- LampJob
  TileJob <|-- AltarJob
  TileJob <|-- StashJob
  TileJob <|-- StructureJob
  TileJob <|-- TurretLoadJob
  TileJob <|-- WateringJob
  class TurretFire {
    <<abstract>>
    fire(turret, def, x, y, angle, damage, label, monsters)
  }
  TurretFire <|-- ShotTurretFire
  TurretFire <|-- SweepTurretFire
  SweepTurretFire <|-- FlameTurretFire
```

## Message handlers

Every hub part extends `HubPart` (`net/core/hub-part.ts`: `game`, `sessions`, `stats`, `pings`, `music`, `pads` getters). `ControllerHandler` and `DisplayHandler` check the session kind before `handleFor`.

```mermaid
classDiagram
  class HubPart {
    <<abstract>>
    #_hub: ConnectionHub
  }
  HubPart <|-- SessionRegistry
  HubPart <|-- PingTracker
  HubPart <|-- MusicOwner
  HubPart <|-- PadRegistry
  HubPart <|-- StatsWindow
  HubPart <|-- StateBroadcaster
  HubPart <|-- MessageHandler
  class MessageHandler {
    <<abstract>>
    handle(ws, session, msg)
  }
  MessageHandler <|-- PongHandler
  MessageHandler <|-- DisplaySessionHandler
  MessageHandler <|-- ControllerSessionHandler
  MessageHandler <|-- MapHandler
  MessageHandler <|-- PadHandler
  MessageHandler <|-- ControllerHandler
  MessageHandler <|-- DisplayHandler
  ControllerHandler <|-- IntentHandler
  ControllerHandler <|-- BagHandler
  ControllerHandler <|-- StashHandler
  ControllerHandler <|-- BuildHandler
  DisplayHandler <|-- MusicHandler
  DisplayHandler <|-- TvToolsHandler
```

## Monster

Monsters hold the `HordeContext` as `_ctx`. Traits are rolled before `new` (`rollTraits`, `horde/helpers/traits.ts`) and `createMonster` (`monster-factory.ts`) picks the kind's class.

```mermaid
classDiagram
  class MonsterCore {
    <<abstract>>
    identity, health, gear, timers
    def
    toState()
  }
  class Afflicted {
    <<abstract>>
    statuses: burning, poisoned, cursed, slowed, pinned, turned
    afflict()
    status()
  }
  class Monster {
    <<abstract>>
    update()
    takeHit()
    adjustDamage()
    adjustKnockback()
  }
  class Walker {
    <<abstract>>
    paths, collision, chewing, memory
  }
  class Fighter {
    <<abstract>>
    wind-up and strike
  }
  MonsterCore <|-- Afflicted
  Afflicted <|-- Monster
  Monster <|-- Walker
  Monster <|-- Ghost
  Walker <|-- Fighter
  Fighter <|-- Shambler
  Fighter <|-- ShadowWalker
  Shambler <|-- Zombie
  Zombie <|-- Brute
  Shambler <|-- Ghoul
  Shambler <|-- Bloater
  Shambler <|-- Werewolf
  Shambler <|-- Kiter
  Kiter <|-- Skeleton
  Kiter <|-- Witch
  Kiter <|-- Necromancer
  ShadowWalker <|-- Vampire
  ShadowWalker <|-- Demon
```

Per-monster state helpers (`monsters/state/`) are composed, not inherited: `Knockback`, `LastSeen`, `Slowed`, `Pinned`, `Turned`, and the `Wound` family (refresh, never stack; see [monsters.md](monsters.md#statuses)).

```mermaid
classDiagram
  class Wound {
    rate, until, by
    refresh()
    active()
  }
  Wound <|-- Bleeding
  Wound <|-- Burning
  Wound <|-- Poisoned
  Wound <|-- Cursed
```

## HordePart and WorldFeature

```mermaid
classDiagram
  class HordePart {
    <<abstract>>
    #_horde: HordeContext
    #roster
    #hooks
  }
  HordePart <|-- Spawner
  HordePart <|-- Sight
  HordePart <|-- Wards
  HordePart <|-- Bursts
  HordePart <|-- Afflictions
  class WorldFeature {
    <<abstract>>
    #_site: WorldSite
    #map
    #view
    #clock
    #structures
    #items
    #timers
  }
  class TickingFeature {
    <<abstract>>
    tick(tx, ty, s, dt)
  }
  WorldFeature <|-- StructureQueries
  WorldFeature <|-- StructureDamage
  WorldFeature <|-- StructureTicker
  WorldFeature <|-- StationOutput
  WorldFeature <|-- Conveyor
  WorldFeature <|-- ResourceNodes
  WorldFeature <|-- Regrowth
  WorldFeature <|-- Planter
  WorldFeature <|-- MapEditor
  WorldFeature <|-- Fountains
  WorldFeature <|-- Gardens
  WorldFeature <|-- TickingFeature
  TickingFeature <|-- WorldLights
  TickingFeature <|-- TurretAmmo
  TickingFeature <|-- Stations
  TickingFeature <|-- Diggers
```

- `HeatMap` and `LightField` (`horde/senses/`) are plain classes held by the `HordeContext` (`horde-context.ts`, as `heat` and `light`).
- `World` holds `StructureStore`, `GroundItems`, `WorldClock`, and the features as `readonly` fields (`world.items`, `world.structures`, `world.growth`, `world.editor`, ...).

## GenPass

Each generator step is a `GenPass` over one `GenCanvas` (map, seeded rand, knobs). Bodies run in a fixed order so the seed gives the same map.

```mermaid
classDiagram
  class GenPass {
    <<abstract>>
    #_canvas: GenCanvas
    #map
    #gen
    #rand()
  }
  class ClassicPass {
    <<abstract>>
    reserved, fill, perimeter, shuffle
  }
  GenPass <|-- ClassicPass
  GenPass <|-- SitePass
  GenPass <|-- HeightPass
  GenPass <|-- ChasmPass
  GenPass <|-- HubPass
  GenPass <|-- RoadPass
  GenPass <|-- SiteBuildPass
  GenPass <|-- WildsPass
  ClassicPass <|-- CryptPass
  ClassicPass <|-- PathPass
  ClassicPass <|-- LandmarkPass
  ClassicPass <|-- TerracePass
  ClassicPass <|-- StairsPass
  ClassicPass <|-- ForestPass
  ClassicPass <|-- PlotPass
  ClassicPass <|-- LampPass
  ClassicPass <|-- ScatterPass
  ClassicPass <|-- Landmark
  Landmark <|-- Hill
  Landmark <|-- Mausoleums
  Landmark <|-- CourtyardLandmark
  CourtyardLandmark <|-- Chapel
  CourtyardLandmark <|-- WellPlaza
  CourtyardLandmark <|-- StoneCircle
  Landmark <|-- Graveyard
  Landmark <|-- LoneCrypt
  Landmark <|-- Ruins
  Landmark <|-- PumpkinPatch
```

- The classic passes and landmarks work on any map size: a landmark turns its door toward `GenCanvas.center` (the map's middle, or the huge-world site being built). Huge worlds reuse them; their own landmarks live in `world-gen/huge/landmarks/`.

## Shared families

```mermaid
classDiagram
  class WeaponPerk {
    name, effect
    apply(stats, base, level)
  }
  WeaponPerk <|-- AddedPerk
  WeaponPerk <|-- ScaledPerk
  WeaponPerk <|-- CustomPerk
  class TileGrid {
    tiles, levels, turns, encoding, changes
  }
  class WorldMap {
    heights: elevationAt, canStep, rampUp, roundTrip
  }
  TileGrid <|-- WorldMap
```

- `WeaponPerk` (`shared/src/gear/perks/`): the base changes nothing (the stake's upgrade is more uses); `WEAPON_PERKS` maps each weapon to one.
- `TileGrid` (`shared/src/world/tile-grid.ts`) is the storage half of a map; `WorldMap` adds the height geometry.
