# Weapons and armor

All stats live in `shared/src/gear/` (`GEAR` in `gear-catalog.ts`, built from `defs/melee-weapons.ts`, `defs/ranged-weapons.ts`, `defs/junk-weapons.ts`, `defs/offhand.ts`, `defs/armor.ts`). Levels apply through `weaponStats` and `gearGuard` in `shared/src/skill-tree/upgrades/gear-upgrades.ts`.

## Rules for every weapon

- **Only the stake wears out** (`GearDef.breaks`, `wearsOut`). Nothing else ever breaks.
- **Only the battle axe and warhammer gain damage from upgrades** (+20% a level). Every other upgrade sharpens the weapon's own trick (`WEAPON_PERKS` in `gear/perks/weapon-perks.ts`, each a `WeaponPerk`: `AddedPerk`, `ScaledPerk`, or `CustomPerk`).
- **Two-handed weapons** (`hands: 2`) can't be held with a shield (`twoHanded`, `HandsSystem.settleHands`).
- **The hammer** does every job (gathering, digging, building) whatever is equipped, and is the weapon when none is. See [combat.md](combat.md#what-a-swing-is-made-with).
- **A bagged stake** is drawn automatically for a swing at a vampire in reach, so crafted and found stakes stay in the bag.
- **Anvil gear:** late weapons and the iron plate (`GearDef.anvil`, marked "(anvil)" below) are only crafted within `ANVIL_RADIUS` (2.5) of an anvil, and each anvil level takes 15% off their materials (`craftCost`). See [building.md](building.md#crafting).
- **Haunted names:** the spear is the Ghoul Poker, the crossbow CrossBones, the greatsword Hell's Greatsword, the repeating crossbow Rattlebones, the morning star the Mourning Star, the quarterstaff the Holy Quarterstaff, the glaive the Cursed Glaive, and the musket the Blood Lust Musket (`GearDef.label`; the code keys keep the plain names).
- **The first real weapon** you craft, pick up, or find goes straight into an empty hand (`BagSystem.takeIn`); a shield it can't be held with goes to the bag. Junk and stakes don't.

## Melee

| Weapon | Dmg | Cooldown | DPS | Reach | Arc | Knockback | Hands | Cost |
|---|---|---|---|---|---|---|---|---|
| Hammer | 2 | 0.55s | 3.6 | 1.8 | 157° | 0.5 | 1 | always have it |
| Ghoul Poker | 1.5 | 0.55s | 2.7 | 2.7 | a line | 1.2 | 1 | 2 wood |
| Stake | 1 | 0.4s | - | 1.4 | 145° | 0.6 | 1 | 1 wood |
| Ritual knife | 4 | 0.35s | 11.4 | 1.5 | 133° | 0.5 | 1 | 2 silver, 3 bone (anvil) |
| Scythe | 2.8 | 0.8s | 3.5 | 2.4 | 271° | 1.6 | 2 | 3 planks, 3 iron (anvil) |
| Battle axe | 12 | 1.6s | 7.5 | 1.9 | 203° | 1.8 | 2 | 3 wood, 2 stone |
| Short sword | 3 | 0.4s | 7.5 | 1.7 | 157° | 0.8 | 1 | 1 planks, 2 iron (anvil) |
| Hell's Greatsword | 8 | 0.95s | 8.4 | 2.2 | 215° | 1.6 | 2 | 2 planks, 6 iron, 1 bloodsteel (anvil) |
| Flail | 6 | 0.75s | 8.0 | 2.0 | 203° | 2.2 | 1 | 2 planks, 4 iron (anvil) |
| Mourning Star | 5 | 0.7s | 7.1 | 3.2 | a line | 1.2 | 1 | 2 planks, 3 iron, 2 chain, 1 silver (anvil) |
| Warhammer | 14 | 1.8s | 7.8 | 1.8 | 169° | 3.2 | 1 | 2 planks, 2 stone, 4 iron (anvil) |
| Holy Quarterstaff | 3 | 0.45s | 6.7 | 2.4 | 240° | 2.0 | 2 | 3 planks |
| Cursed Glaive | 5.5 | 0.75s | 7.3 | 2.8 | 157° | 1.4 | 2 | 3 planks, 5 iron, 1 silver (anvil) |
| Spiked gauntlet | 2.2 | 0.28s | 7.9 | 1.2 | 120° | 0.6 | 2 | 2 iron, 3 bone (anvil) |

### Tricks and upgrades

| Weapon | Trick | Each upgrade |
|---|---|---|
| Hammer | Every job; never breaks | Handy: chops, mines, and digs one more per hit |
| Ghoul Poker | Stabs straight ahead: hits everything within 0.45 tiles of a line out to its reach (`line`), nothing beside it | +8% reach |
| Stake | Kills a vampire in one hit; single use | Seasoned wood: one more use |
| Ritual knife | Costs 1 heart only when a swing lands (it won't swing on your last); kills heal | Bloodthirst: each kill heals 2 more |
| Scythe | A flat sweep nearly all the way around: low damage, but it hits everything near you at once | Soul harvest: +1 blood per kill |
| Battle axe | Slow and heavy (0.7s windup, you slow down); `cleave`: +25% per other monster in the swing | +20% damage |
| Short sword | Quick, one-handed, pairs with a shield | Swings 8% faster |
| Hell's Greatsword | Huge sweeping blows | Execution: +25% damage to anything under half health |
| Flail | `crush`: ignores monster helmets, plate, and raised shields | +10% reach |
| Mourning Star | A holy chain whip with a spiked ball (`buildWhip`): pulled back, swung up over the head and cracked out in front (0.35s windup) with a loud `whip-crack`: lashes 3.2 tiles in a line (`line` 0.5); `blessed` 2: double damage to vampires and witches, full damage to ghosts; `stagger` 25% (not brutes) | +15% stagger chance |
| Warhammer | Slowest and heaviest (0.8s windup, you slow down); x1.5 to brutes and shoves them (`bruteBane`) | +20% damage |
| Holy Quarterstaff | Held across the body in both hands; a 3-hit combo (top end down, bottom end up, a one-handed twirl that hits 30% harder); turns aside 15% of hits from the front; 20% chance to stun for 1s (not brutes) | Parry: 10% more turned aside |
| Cursed Glaive | Alternates a wide sweep (like the scythe) and a long stab (`line`, +0.3 reach); the tip (past 60% of reach) hits 40% harder | +15% wider sweep |
| Spiked gauntlet | Two-handed fists: left jab, right punch, left uppercut (+15%); wounds bleed 1 damage a second for 2s. Every 6 landed hits charge (`charge`, a glow on the fists) the next swing into a super uppercut (`SUPER_COMBO`): it launches you into the air and hits 4x as hard, knocks 2.5x as far, and stuns (not brutes) | Bleeds 50% faster |

## Ranged

| Weapon | Dmg | Cooldown | Range | Ammo | Cost |
|---|---|---|---|---|---|
| Bow | 2.5, up to 5 drawn | 0.45s | 7 | Arrows | 2 wood |
| CrossBones | 7 | 1.4s reload | 7.5 | Bolts | 2 wood, 3 planks |
| Rattlebones | 3 | 0.2s in a burst, 1s reload | 7 | Bolts | 5 planks, 4 iron, 1 chain (anvil) |
| Nightmare blunderbuss | 3 per pellet | 1.1s | 5 | 1 blood | 3 planks, 2 iron, 1 cursed core (anvil) |
| Blood Lust Musket | 20 | 1.8s | 10 | 1 blood | 4 planks, 3 iron, 2 cursed cores (anvil) |

| Weapon | Trick | Each upgrade |
|---|---|---|
| Bow | Hold Action to draw, let go to shoot; a full draw (0.8s) hits twice as hard and shoots itself | Quick draw: 20% faster |
| CrossBones | Takes aim for 0.35s (`sight`): locks onto the nearest monster within 1.2 rad of where you point, else the nearest in range (`AimingSystem.lockOn`), turns to it, and fires straight at it; a dim target shows over it meanwhile. Hits hard, pierces one monster (`pierce` 1), holy x3 to vampires; reloads between shots | Piercing: one more monster |
| Rattlebones | Holy x2; a spinning drum fires bursts of 3, then a 1s reload | Bigger magazine: +1 bolt per burst |
| Nightmare blunderbuss | 5 heavy pellets in a tight 0.3 rad cone | Wider bore: +1 pellet |
| Blood Lust Musket | A dark old flintlock: one devastating long-range shot, with fire, smoke, and a boom | Quick reload: 10% faster |

- **Reloading crossbows** (`reload`, `RangedSystem.spend`, `RangedSystem.startReload`): a crossbow holds 1 bolt, a repeating crossbow 3 (`burst`); once spent it must reload, during which you move at half speed (`RELOAD_SLOW`) and can't shoot. The load is kept on the crossbow itself (`GearItem.fired`, `empty`), so putting it away mid-reload means it reloads first next time.
- **Combos** (`WeaponStats.combo`, `MeleeSystem.comboStats`): swings within 1.2s of each other (`COMBO_WINDOW`) step through the combo, then start over; `PlayerState.combo` tells the TV which move to play.
- **Ammo:** a craft makes 4 arrows or 3 bolts from 1 wood. Upgrading the Arrows node gives Steady supply: +20% a level chance any arrow or bolt shot is free.
- **Aim assist:** shots bend toward the monster closest to straight ahead within 0.35 rad (`AIM_ASSIST`).
- **Range from height:** +2 tiles per level above the ground.

## Damage rules (`damageTo`, `gear/damage-to.ts`)

| Target | Rule |
|---|---|
| The monster a weapon `slays` (stake: vampire) | Dies in one hit |
| Vampire, holy weapon | Damage x `holy` |
| Vampire or witch, blessed weapon (morning star) | Damage x `blessed` |
| Vampire, blood weapon (blood ammo or a health cost) | 25% damage |
| Ghost | 25% damage (at least 1), 5x knockback; full damage from a blessed weapon |
| Monster wearing a helmet / plate | 75% / 55% of each hit (the flail ignores this) |
| Another player | 25% damage (`PVP_DAMAGE`) |

## Junk

Some zombies carry junk, hit 1 harder for it, and drop it when they die. Never craftable, never better than the hammer, each with one odd perk.

| Junk | Dmg | Cooldown | Reach | Odd perk |
|---|---|---|---|---|
| Stick | 2 | 0.55s | 2.1 | Long |
| Femur club | 2.5 | 0.75s | 1.4 | Knocks back 1.8 |
| Bent shovel | 2 | 0.6s | 1.7 | Wide scoop (215°) |

## Off-hand

| Item | Effect | Cost |
|---|---|---|
| Torch | Hand light, radius 3.5 (`build:torch` level widens it). Taken from a stack of torches; put away returns it to the stack. | 1 wood |
| Shield | Held up with Block: hits from the front x0.12 (3% less per level). Only beside a one-handed weapon. | 2 wood |
| (empty) | A small lantern, radius 1.5, too dim to keep vampires off | - |

## Armor

| Armor | Every hit x | Speed | Knockback | Special | Cost | Unlock |
|---|---|---|---|---|---|---|
| Wood armor | 0.85 | 100% | normal | Cheap | 2 wood | start |
| Bone armor | 0.72 | 95% | normal | Thorns: 1.5 back at melee attackers | 6 bone, 1 wood | after Wood armor |
| Stone armor | 0.5 | 60% | none | Can't be knocked back | 4 stone | after Wood armor |
| Iron plate | 0.6 | 90% | half | | 6 iron, 2 chain (anvil) | after Stone armor |

Each upgrade takes 0.05 more off every hit. Armor never wears out.
