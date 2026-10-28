# Graveyard

A top-down, pixelated, voxel horror party game. A TV (or any big screen) shows the graveyard; everyone plays on their phone, which becomes a controller. Game design and milestones live in [docs/design.md](docs/design.md).

## Requirements

- Node.js 22 or newer (developed on Node 24) and npm.
- A computer to run the server and show the TV page.
- Phones on the same Wi-Fi network as that computer.

## Setup

```sh
npm install
```

One install at the root covers all three workspaces (`shared`, `server`, `client`).

## Running locally

```sh
npm run dev
```

This starts:

- the game server on port **3021** (Express + WebSocket, restarts on file changes), and
- the Vite dev server on port **5181** (hot reload, proxies `/ws` to the game server, listens on your LAN).

Then:

1. On the TV machine, open **http://localhost:5181/tv**.
2. Scan the small QR code in the bottom left of the TV with a phone: white squares on a dark glow, which phone cameras read fine (hovering it with the mouse brightens it and shows the URL; it stays up during Incognito). The QR swaps `localhost` for this computer's LAN address, so it points at something like `http://192.168.1.20:5181/`.
3. Pick a name and color, then turn the phone sideways.

### Phones can't connect?

- Make sure the phone is on the same network (not mobile data, not a guest network that isolates devices).
- On Windows, allow Node.js through the firewall for private networks when prompted, or add an inbound rule for TCP 5181 (dev) and 3021 (production).
- If the QR shows the wrong IP (VPNs and virtual adapters can confuse it), type the right address into the phone's browser by hand. The server prefers `192.168.x`, then `10.x`, then `172.x` addresses and skips WSL, Docker, Hyper-V and VPN adapters (`server/src/net/lan-address.ts`).

## Production-style run

```sh
npm run build   # builds the client into client/dist
npm start       # server on :3021 also serves the built client
```

Open **http://localhost:3021/tv** on the TV; phones use the QR as before. Set `PORT` to change the port (the dev proxy in `client/vite.config.ts` assumes 3021) and `WORLD_SAVE` to use a different save file, e.g. to run a second server alongside `npm run dev`:

```sh
PORT=3031 WORLD_SAVE=/tmp/test-world.json npm start
```

## Sound and music

Browsers keep audio off until someone interacts with the page. On the TV, click or press any key once (a faded "Click for sound" sits in the bottom right until then); for a kiosk setup, start Chrome with `--autoplay-policy=no-user-gesture-required`. Phones turn sound on with their first touch.

- **Sound effects** are synthesized in code, so they work out of the box. The TV plays world sounds panned to where they happen (swings, hits, chopping, building, breaking, monster groans, deaths, the blood moon horn); each phone plays its own player's chops, hits, pickups, builds, hurts, and death.
- **Media lives on the server**, not in the client bundle: everything under `server/media/` is served at `/media` and listed by `/api/media`, read fresh on each request, so new files show up on the next page load with no rebuild or restart. Phones never download music.
- **Your own SFX:** drop `<name>.mp3` into `server/media/sfx/` to replace that sound. Getting hit has its own sound (`hurt`: a crunchy thud and a pained grunt), on the TV and on the hurt player's phone. Names: `swing`, `chop`, `mine`, `hit`, `hurt`, `monster-hit`, `bite`, `build`, `break`, `pickup`, `drop`, `refuel`, `snuff`, `error`, `death`, `respawn`, `monster-death`, `blood-moon`, `zombie-groan`, `vampire-hiss`, `ghost-moan`, `equip`, `craft`, `shadow-step`, `ghoul-hiss`, `ghoul-screech`, `shoot`, `splat`, `drink`.
- **Custom songs:** drop mp3s into `server/media/music/`, or a song split into parts as a folder of mp3s in `server/media/music/<song>/` (`bass`, `drums`, `instruments`, `melody`, played together in step) with its cover as `cover.jpg` (else `art.jpg`; the bundled covers are square crops of the original `art.jpg`). They play shuffled, named by a `meta.json` in the song's folder (`{ "title": ..., "artist": ... }`, either optional), else their ID3 tags, else the file or folder name in title case. Part songs follow the game: everything plays while nobody's connected; once players are in, exploring keeps instruments and bass with a hushed melody, and a fight (a monster within 6 tiles of a living player, or a hit in the last 6 seconds) brings in the drums and the full melody, which fade back out afterwards. The blood moon keeps some drums going.
- **Ambience:** `server/media/ambience/*.mp3` loops quietly under everything on the TV, always, at its own volume (the Ambience slider).
- **What plays:** the TV keeps its own queue. With **Spotify playback** ticked, whatever is queued on the linked Spotify account (from your phone, or guests in a Spotify Jam) plays first, in Spotify's order, so additions and moves there show up on the TV. After that come the **Spotify playlist** (shuffled by the TV) and the **Custom songs** (shuffled in). With both ticked, a slider under each sets how often it's picked against the other (3 to 1 for the playlist by default). Spotify tracks play one at a time and fade out at the end; Spotify pauses while a custom song plays. Spotify playback needs the `user-read-currently-playing` scope: if Up next never shows your queued songs, click **Disconnect Spotify** and connect again.
- **Music (Spotify):** needs Spotify Premium and a Spotify app:
  1. Create an app at https://developer.spotify.com/dashboard with the Web Playback SDK and Web API enabled, and add the redirect URI `http://127.0.0.1:3021/auth/spotify/callback` (Spotify doesn't accept `localhost`).
  2. Put `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` in `server/.env` (gitignored; the server's `dev` and `start` scripts load it). Add `SPOTIFY_REDIRECT_URI` if you use a different address.
  3. Either set `SPOTIFY_REFRESH_TOKEN` in `server/.env` too, which links that account from startup with no login (and wins over any login saved from the TV), or on the TV open the sidebar, click **Connect Spotify** in the Music tab's Spotify card. A TV login is kept in `server/data/spotify.json` until you click **Disconnect**; copy its `refreshToken` into `.env` to make it the default. With an env token, **Disconnect** only lasts until the server restarts.
  4. Pick a playlist in the Music tab's Spotify card (it shows each playlist's cover).
- The **Music** tab (TV sidebar or `/admin`) has cards: **Music** (checkboxes for Spotify playback, Spotify playlist, and Custom songs), **Spotify** (connect, playlist, disconnect), **Volume** (music, ambience, sound effects; saved per TV), and **Now playing** (cover, play/pause, skip, Incognito), and **Up next** (where each song comes from; the TV's own songs can move up or down or come out, songs queued on Spotify stay). Music dips briefly when someone dies and when the blood moon rises.
- Only one TV page plays music: the newest one opened. Any other open TV page goes quiet and its Music tab shows **Play music here** to take it back.
- **Incognito** (Music tab) turns the TV into what looks like a now-playing screen with an animated background: the album art big in the middle, title and artist below, the live graveyard (monsters and all) behind it, the QR and kill feed hidden, game sounds muted. It fades back to the graveyard as soon as a phone joins (or press Escape). Press **I** on the TV to toggle it. Album art comes from Spotify, or from the cover embedded in an mp3's ID3 tag.

## Controls (phone, landscape)

| Control | What it does |
|---|---|
| Joystick (drag anywhere on the left half) | Move. You face the way you last moved. |
| ACT (hold to repeat) | Also a stick: drag your thumb from where it lands toward a direction (behind you too, snapped to 8 ways) to turn and act that way while you keep walking; a plain tap acts the way you last faced. Acts on whatever is in front of you: hits a player, chops a tree, digs up a grave, mines a rock, smashes a pumpkin, breaks open a chest, refuels a torch or campfire that's burning low (costs 1 wood), feeds a station from your pockets, offers 2 hearts at a sacrificial altar for blood, loads a blood sentry (1 blood for 3 shots), or damages a structure (full lights included). |
| GRAB | Picks up the piece of gear in front of you (or under you). Walking over gear or crated structures also picks them up, into the bag (never equipped); something you just dropped waits 2 seconds. It lights up and shows the item's icon when there's something to grab. |
| Bag (middle) | Opens your equipped slots (weapon, off-hand, armor), candy and blood, and sixteen bag slots, all little 3D icons; the bag also holds wood, planks, stone, iron, bolts, and crated structures as stacks. ACT and GRAB step aside (with a Panic button above the bag) while it's open. Tap a stack of structures to start building: the bag closes and the right side shows what you're building with a **Turn** stick (drag it to face where it should go; the left joystick still walks), **Back** (to the bag), and **Build**. The TV previews it (a dim white outline where it will go, light red with whatever is in the way outlined if it can't); it always goes on the tile in front of you, pushed on past you if you're standing on that one, never on top of you. Tap anything else to pick it up, then tap another slot to move it there (onto a matching stack, swapping places, or into its equipped slot), or tap it again to use it: equip or put away gear, or drink a tonic. While something is picked up a drop slot appears that throws it in front of you (candy and blood 5 at a time, for a teammate). Hold anything to see its details. |
| Hammer (middle) | Opens the Craft list by category, with a Panic button: what you've unlocked shows as icons (dimmed if you're short on materials), and everything else is a plain lock until you tick **Show locked**. Tap one to pick it: a bar along the bottom shows its name, a count with **-** and **+** (up to as many as you can afford), and **Craft**, which makes that many with a hammering chime. What's made goes into your bag (structures stack up to 99 per slot); costs come out of your bag. Hold one to see its details: its name, its model slowly turning, labeled stat bars (red is weak, amber middling, green strong), special traits in words, its cost, and what unlocks it. |
| Tree (middle) | Opens your own skill tree full screen (kept when you die): every piece of gear and structure as an icon, linked to what it grows from, with level pips. What you can't see yet is a question mark (a scroll marks a buried blueprint). Tap a node to see what the next level does and, standing by a research table, upgrade it with candy and blood; hold it for its details. **Back** closes it. The details sidebar on the right can be dragged wider or narrower. **Panic** (also on the Bag and Craft lists) closes the menu and makes your character run from any monster within 4 tiles for a second, then walk back to where you were once it's safe. |
| Top of the screen | Whenever you gain candy or blood, a toast pops up with its icon ("+6 candy", "+3 blood"), adding up while it shows, so you learn what the orange and red things are. |
| Leave (top right) | Leaves the game. Just putting the phone down (or the screen going off) doesn't: your character slumps where it stands, still in the game and still fair game for monsters, until you pick the phone back up. |

The tile you're about to act on is outlined in your color on the TV.

## World, saves, and resets

- The world (map and terrain levels, structures, fuel, piles, stump timers) is saved to `server/data/world.json` every 30 seconds, after a reset, and on shutdown. It is gitignored.
- Players are not saved. After a server restart, phones land back on the join form with their name prefilled.
- To start a new world:
  - pick a map in the TV sidebar's **Game** tab (hover the top-right corner of the TV and click the chevron to open the sidebar), tick **Replace this world**, and press **New world**, or
  - run `npm run dev:fresh`, which deletes the save before starting, or
  - stop the server and delete `server/data/world.json`.
- New worlds start on the **King of the Hill** map preset (`server/presets/king-of-the-hill.json`: a generated map, hand-edited: a lumpy, wooded hill with a higher crown on the middle right, the pit's stairs moved to its top right corner, rocks in the walled courtyard, a round well plaza, and extra graves), unless the Game tab picks **Random map**. `WORLD_PRESET` picks another preset file by name; any `.json` dropped into `server/presets/` shows up in the Game tab's list.
- A save from an older version of the game is ignored and replaced with a new world.

## Testing

There are no automated tests yet. Before committing, run:

```sh
npm run typecheck   # shared, server, and client
npm run build       # catches anything the bundler rejects
```

### Testing without a room full of phones

Each browser profile holds one player (the player token lives in `localStorage` under `graveyard.token`), so two tabs in the same browser are the same player. To get several players on one computer:

- use different browsers, or a mix of normal and private/incognito windows, or separate Chrome profiles;
- open `http://localhost:5181/` in each and join with a different name;
- in Chrome DevTools, turn on the device toolbar (Ctrl+Shift+M), pick a phone, and rotate it to landscape. Portrait shows a "Turn your phone sideways" screen.

The mouse works for the joystick and buttons. Keep the TV page open in another window to watch the result.

### Things to try

- **Joining and reconnecting:** join, then reload the phone. You should come back as the same player. Close the tab: the player fades on the TV and is removed after 2 minutes.
- **Gathering:** walk into a tree and hold ACT. Chips fly, wood goes up by 1 per swing, and after 5 the tree becomes a stump (it rots away after 2 to 4 minutes). New trees rise out of the ground beside other trees, mostly toward the middle, until the map is back to as many as it started with, and pumpkins and chests turn up by themselves too (never more than a set number, so an idle server doesn't fill up). Rocks give stone the same way. Wood and stone go into your bag as stacks; there's plenty of room.
- **Digging graves:** face a headstone or cross and hold ACT. After 3 digs the stone shudders down into the ground, leaving an open mound and a pile of candy (sometimes wood, bones, or a blueprint). A new gravestone rises from the mound a few minutes later, unless something has been built on it (you can build on mounds; a covered one never comes back).
- **Robbing statues, crypts, and mausoleums:** dig at a courtyard statue, a crypt wall, or a mausoleum the same way. After 5 digs it gives up a bigger haul: candy, bones, maybe a piece of gear and a blueprint. It stays standing, but has nothing left for 10 minutes (a whole crypt or mausoleum at once, whichever wall you dug).
- **Loot goes straight to you:** candy, wood, bones, and blood from graves, statues, crypts, chests, and monsters you kill land in your inventory with a popup; only what doesn't fit in the bag drops as a pile.
- **Chopping and mining:** trees, rocks, and hedges give everything at once when they come down (5 wood or stone, 2 from a hedge), with one popup; whatever doesn't fit in your bag drops beside it. Lamp posts break in one hit and drop a lantern you can place. Blueprints unlock skill tree nodes (battle axe, crossbow, shield, stone wall, campfire) for everyone, and the TV feed says who found which.
- **Dropping and picking up:** Drop throws a pile in front of you. Walking over a pile picks it up (your own drop only after a 2 second delay).
- **Building:** gather a few wood, open the hammer menu and craft a torch, then open the Bag, tap the torch, and press Build. Lights never burn out: a torch casts a small warm glow, an oil lantern a wider, brighter one, and a campfire the biggest, and upgrading each in the skill tree widens and brightens it. Further up, the Oil lantern leads to the **Ghost lamp** and the Campfire to the **Soul fire**: cold blue-green lights, wider and brighter still, that ghosts can't snuff (a soul fire heals like a campfire). A ghost can snuff any other light; ACT on it to relight it (free). There's one torch item: craft a stack, place them, or press **Hold** while building to carry one (putting it away returns it to the stack); its upgrades light both. Fortifications start from the Fence, which opens the Wood wall, Door, Scarecrow, and Spikes; the Wood wall opens the Platform, Steps, and Palisade; the Palisade the Stone wall, and that the Bone wall. Spikes open **Iron spikes** (twice the damage) and **Barbed wire** (barely cuts, but holds monsters to 40% speed; players to 60%, unharmed).
- **Chests and pumpkins:** look for a faint glow: a chest breaks open with one hit and spills gear and resources. Pumpkins burst after two hits (and stop lighting the area), then a new one swells up somewhere beside a path a while later.
- **Darkness:** everything outside a light is very dark. Player lanterns, pumpkins, lamp posts, statue candles, torches, lanterns, and campfires light the map.
- **The map:** each new world has a round walled chapel courtyard, a hill with a watchtower, one to three separate mausoleums, and/or a round well plaza (the two courtyards come in a few sizes), linked to the main paths. Hedges around grave plots can be chopped for wood. The ground has levels too: a few broad raised terraces (some with a higher middle) and a sunken hollow, walled in stone with a pale rim, with stone stairs where the paths cross. Higher grass is lighter. You can drop off any edge (your character hops off, tucked, arms up), but only climb by stairs. Trees don't block: you can push through one, but within about half a tile of its middle you're slowed to half speed (zombies and vampires lose only 30%), which also covers squeezing between two trees side by side (low undergrowth fills those gaps, and sinks away when either tree falls); brushing along the outside of a tree doesn't slow you.
- **The watchtower:** walk up the hill's stairs and in through the tower door, then follow the stairs round the pillar to the top floor. It's a roofless ruin; the TV cuts its front wall away while you're inside.
- **High ground:** from a terrace, platform, or the tower you can hit things a level below you (for +1 damage) while they can't reach you, and crossbow bolts fly further. Knock someone off an edge and they take fall damage (zombies don't).
- **Platforms and steps:** build a Platform (3 wood) and Steps (2 wood) next to it, walk up, and fight from the top. Zombies climb the steps if they can get to them; otherwise they chew the platform out from under you.
- **Skill tree:** craft and place a Research table (4 wood, 2 stone), kill a zombie or two for blood (they leave a glowing red puddle), stand next to the table with some candy and blood, open Tree, and upgrade something. Upgrades are yours alone. The TV feed shows it. Upgrading the Research table opens the Sawmill (Lv 1) and Furnace (Lv 2); the Torch structure opens the Lantern, the Fence the Spikes, the Wood wall the Palisade, and the Shield (Lv 2) Plate.
- **Weapons:** the Wood axe (everyone's bare-handed weapon, upgradable), Spear, Bow, and Arrows are open from the start. Each upgrade to a weapon opens the next ones at level 1: the Wood axe or the Spear opens the Stake and the Scythe; the Stake opens the Ritual knife; the Scythe opens the Battle axe, Short sword, Quarterstaff, and Glaive; the Battle axe opens the Flail, Warhammer, and Spiked gauntlet; the Flail opens the Morning star; the Short sword the Greatsword; the Bow the Crossbow; the Crossbow the Repeating crossbow and the Nightmare blunderbuss (shoots your blood); and the blunderbuss the Musket (slow, long range, huge damage, also blood). Each upgrade adds 20% damage plus a perk by kind: pole arms (spear, quarterstaff, glaive) get **Longer reach**, blades (scythe, swords) **Keen edge** (a wider sweep), heavy weapons (axe, hammer, flails) **Heavy blows** (more knockback), the spiked gauntlet **Relentless assault** (faster swings up close), and ranged weapons **Quick reload** (faster shots). Upgrading **Arrows** gives **Steady supply**: a growing chance any arrow or bolt shot is free. The bow shoots arrows, the crossbows bolts.
- **Armor:** made from what you have, each with a trade-off. **Wood armor** (start, 4 wood) takes the edge off hits and is cheap but wears fast; **Bone armor** (after wood) blocks more and stabs back at whatever hits you in melee, but wears out quickest and slows you a touch; **Stone armor** (after wood) blocks half of every hit and you can't be knocked back, but you lumber at 60% speed; **Iron plate** (after stone) blocks well, halves knockback, and slows you a little.
- **Shields:** shields and wood armor are open from the start. A shield only works beside a one-handed weapon (wood axe, stake, spear, short sword, flail, morning star, warhammer, spiked gauntlet, ritual knife); equipping a two-handed weapon puts the shield in your bag, and equipping the shield puts the two-handed weapon away. With one up, hold **Block** on the phone: hits from the front only do a sliver of damage (and wear the shield), but you move at half speed and can't attack.
- **Processing:** place a Sawmill or Furnace and hold ACT on it with wood or stone: each hit feeds a batch, and planks or iron pop out beside it. The furnace glows while it works. Or just drop wood or stone beside it: stations pull from piles next to them.
- **Automation:** stations hand what they make to a neighboring station that uses it. Put a Bone digger (a skeleton with a pick) beside a rock and a Grave sifter beside the digger, and silver piles up on its own. A Furnace beside a Blood forge, with blood dropped next to the forge, makes bloodsteel.
- **Occult:** starts with the **Effigy** (3 wood, 1 bone), a cursed straw figure that slows monsters within 3 tiles (more with upgrades); it opens the Cauldron and the Sacrificial altar (5 stone, 2 bone; zombies drop bones), and the altar opens the Blood furnace. More occult works: the **Cursed obelisk** (Effigy level 2) makes monsters within 4 tiles take 25% more damage, and opens the **Cursed mirror**, which turns monsters' arrows and ectoplasm back on them (and shatters witches' potions); the **Blood fountain** (Altar level 2) mends anyone beside it like a campfire; the **Soul cage** (after the Cauldron) sucks in and destroys a ghost that drifts within 3 tiles, one every few seconds. ACT on it to bleed 2 hearts for blood; monsters killed near it bleed double. The Ritual knife (huge damage, every swing costs you a heart, a zombie takes three, and each kill slowly heals four) now comes from the Stake. The Blood furnace makes the bloodsteel the Nightmare blunderbuss and Musket need; the Blood sentry, a turret you load with blood, opens from the blunderbuss. A Silver bell keeps ghosts away from your lights, and a Coffin (blueprint) makes you respawn at your base.
- **Gear:** gather some wood, open the Craft list, and craft a spear, a bow and arrows, a torch, or a shield; the rest of the weapons and plate open up through the skill tree. It goes straight into its slot if that's empty, otherwise into the bag; the TV shows it in your keeper's hands. Every 75 seconds a piece of gear turns up beside a grave or the crypt (it twinkles in the dark), and killed monsters sometimes drop one: walk up to it and press GRAB. Gear wears out (the bar under each slot) and everything spills when you die.
- **Combat:** with two players, face each other and hold ACT. New players are protected for 10 seconds (they blink on the TV); attacking or building ends it. Everyone swings a wood axe: it hits everything within about two tiles in the half-circle in front of you, leaves a glowing streak, throws sparks and shakes the screen when it connects, each hit takes 3 of 10 hearts, and it knocks the target back a full tile. Hits spray blood that stays on the ground for a while. At zero, the phone shows the death screen, the TV kill feed shows who did it, and the player respawns after 5 seconds. Dying costs: your bag spills where you fell (go back for it), half your candy and blood is gone for good, and only what you have equipped comes with you. Leaving the game doesn't: join again under the same name and you're back with everything you had.
- **Healing:** hearts never come back on their own, and damage from the last 10 seconds can't be healed yet (those hearts show grey on your phone and the TV). Rest beside a burning campfire, drink a Tonic (tap it in the bag, +4 hearts), or kill with the Ritual knife (each kill heals 4 hearts over 8 seconds). Tonics are brewed in a Cauldron (open from the start) from 2 blood and 1 bone, fed by hand or from piles beside it like any station. Spikes hurt anyone standing on them.
- **Monsters:** even with nobody playing, a handful of zombies shamble and stumble around the TV. Once someone is in (and their spawn protection is over), monsters walk in from the dark edges of the map, up to 2 plus 4 per player, and wander until they see someone. Monsters notice you anywhere within 5 tiles, or farther in the direction they're facing, as long as nothing tall is in the way (walls, hedges, and buildings hide you; trees, gravestones, and fences don't), then chase, and search where they last saw you for a few seconds after you break line of sight. Wandering zombies pick a spot a few tiles off and walk a path there instead of bumping into walls; some are drawn toward where players have been lately, some toward clusters of graves. Swing at them like players.
  - **Every attack is telegraphed.** Touching a monster doesn't hurt; its attacks do. Each one winds up first (a zombie rears back, a vampire coils, a brute heaves its fists overhead, a skeleton draws, a witch cocks her arm, a ghoul crouches, a demon rears up), turning to keep you dead ahead the whole time, then lands: a melee blow hits whoever is still in reach in front of it, and shots fly at where you are. Step out of reach (or out of the arrow's path) before it lands and it misses. Cooldowns are short, so keep moving. Hitting a monster never interrupts its attack.
  - **Zombies** (yellow-green eyes in the dark) are slow, rear back and slam down to bite, take 4 hits (their heads snap the way you hit them; the last one tears them apart), and chew through anything you built in their way. Build a scarecrow to pull them off you.
  - **Vampires** (red eyes, a cape that streams behind them) are fast, see far, hit hard, and take 6 axe hits, but a stake kills one in a single hit and crossbow bolts do triple damage; blood weapons barely scratch them. They leave lots of blood, and never step into light, including a torch in someone's hand. Stand by a campfire and watch them wait at the edge; let it burn out and they rush in.
  - **Ghosts** (pale glow) only show up once you've built lights. They float through walls to your torches and snuff them after 3 seconds unless someone stands in the light. They also lob slow balls of ectoplasm (through walls) at anyone within 5 tiles: a hit does 1 damage and slows you to under half speed for a few seconds (you glow green and hazy meanwhile), so step aside. A ghost that sees you within 6 tiles turns angry (red eyes, a snarl, a shriek) and drifts after you, hovering about 2 tiles off, until you're 9 tiles away. Weapons barely hurt one (a quarter of the damage, at least 1, against 8 health) but knock it flying.
  - **Brutes** are huge, hunched, slow zombies that lumber from leg to leg (trees shiver as they stomp past, and shake hard when they slam the ground), growling while they hunt you. Their fists leave a faint streak through the air and throw up dirt that scuffs the ground for a while. They only show up once the world level climbs (see below): about three times a zombie's health, they barely flinch, can't be pushed back at all, and smash through walls. They swing about every 1.3 seconds, but each swing is telegraphed: the brute heaves both fists over its head for about two thirds of a second, then hammers them down (dust flies and the TV shakes). Step back or aside before they drop and it misses; stand there and each blow does 3.5 damage (never more than 4.5, however tough the world gets) and throws you back.
  - **Skeleton archers** (from world level 2) keep their distance, backing off if you rush them, and draw and loose arrows at you from about 6 tiles. Arrows stop at walls; sidestep them. They're brittle (9 health) and fall apart into bones.
  - **Witches** (from world level 6) hang back too, point at you, and lob a glowing purple potion at the spot you're standing on. It bursts and leaves a bubbling purple puddle for 5 seconds that burns and slows anyone standing in it. Move once she throws, and stay out of the puddles. Get up close and she swings her broom in a wide purple sweep that knocks you back and slows you.
  - **Ghouls** (from world level 4) are gray, ragged people crawling low and hunched on hands and feet, knees jutting up above their backs, bounding with both hands then both feet, hissing and screeching. They don't charge straight in: they run circles around you a few tiles out, screaming and growling, then crouch and pounce over 3 tiles, biting whatever they land on. They stop aiming just before they leap, so step aside when one crouches.
  - **Demons** (rare, from world level 10, at most two at once) are ghosts made of shadow: a low, horned shape with burning eyes and a jaw full of fangs that slithers along, its body trailing off into rippling smoke. Like vampires they only move through the dark, and while one stalks you it fades until it's barely there. Every few seconds one vanishes with a gaseous whoosh and a puff of black smoke and steps out of the shadows right behind you. If you're within a few tiles, even standing in light, it rears back with its jaw gaping, turns solid, lunges out to bite you, then slinks back into the dark. Light keeps them from staying, not from striking.
  - **The world gets harder as you do.** Every player has a hidden level, made of how hard their best weapon hits (damage per second, with upgrades), how much damage their plate and shield soak, every skill tree upgrade and found blueprint (worth more the deeper the node), and how long they've been connected (a level per 8 minutes, up to 8; time with nobody connected never counts). The world level follows the players online, 70% the strongest and 30% the average of the rest, climbing over a few minutes and falling slowly. As it rises, more monsters come and come faster, vampires get more common, brutes appear, more zombies carry junk, zombies and brutes start wearing helmets (a quarter of each hit glances off) and later plates (almost half), and new monsters spawn tougher and hit harder, but drop more blood (armored ones sometimes leave iron). Levels are never shown on phones; the TV's Overview tab shows them.
  - **Blood moon:** after 8 to 12 minutes of play (the clock only runs while someone is connected) the map slowly turns red for 90 seconds and twice as many monsters pour in. **Summon blood moon** in the TV sidebar's Game tab raises one right away.

### TV look

The TV sidebar (hover the top-right corner, click the chevron; click anywhere outside it to close it) has three tabs. The same controls are on their own page at `/admin` (open it on a phone or laptop): music changes there are relayed to the TV through the server, since the TV is what plays the music. **Overview** shows the first few players (the rest fold behind "more") with each one's hidden level, and stats: server ticks per second (30 when keeping up, red when behind), time per tick, the TV's frame rate, the world level, and how many monsters and ground items there are. **Music** is the music panel (see above). **Game** has testing controls and the new-world controls:

- **World level** shows the current world level, and **-** / **+** add or take away a boost of 5 levels at a time (up to 60) on top of what the players call for; it applies at once.
- **Summon blood moon** raises one right away, **Make it day** turns on broad daylight (just the look: monsters act the same) until **Back to night**, and **Kill all monsters** bursts every zombie and vampire (they drop their blood, bones, and junk) and fades every ghost. Below them, pick the map for a new world (a preset, or random) and tick **Replace this world** and press **New world**. With **Random** picked, a **Random map** card sets how the next one is generated: how many mountains (and how big, and how often they get a higher peak), how many pits (and how big), extra stairs beyond the ones needed to reach everything, how much of each kind of scenery (trees, forest edge, rocks, graves, pumpkins; 0% is none), and which landmarks to build (watchtower hill, chapel, mausoleums, well plaza, hedged grave plots, lamp posts). It's remembered per browser; **Defaults** puts it back.
- **Edit map** opens the map editor on the TV (not on `/admin`): a panel down the left edge, and the mouse edits the live world. **Top-down view** (the camera tilts to look nearly straight down, so walls no longer hide the tiles behind them), **Flat lighting** (even daylight, no blood moon), and **Hide monsters** are on while editing; they only change what the TV shows.
  - The brush is round, 1 to 11 tiles across (the **Brush** slider), shown as a ring that follows the tile under the mouse: pointing at the side of a raised block picks that block, pointing at the far wall of a pit or valley picks the tile down in it, and scrolling steps the ring to tiles hidden further back along the line of sight (point at the top of a block near its back edge and scroll to reach the ground right behind it). The panel's hide button tucks it into a small tab while you keep editing.
  - **Raise** / **Lower**: click or drag; only tiles at the level you start on move, one level up (or down), so raising from a 0 lifts just the 0s the brush passes over. While Raise, Lower, or Stairs is picked, trees, buildings, and landmarks are hidden so you can reach every tile.
  - **Stairs**: a see-through yellow flight shows the stairs you'd place and which way they'd climb. Point at the foot of a rise, or at the top of a wall (the stairs then go at its foot, climbing up to it). Right click cycles through every way and spot that works, left click places it (the way you picked carries on to the next tiles). On stairs already there, left click deletes them and right click turns them. Stairs that climb toward the camera are only a sliver along the back edge of the block above, so pointing near that edge picks them.
  - **Paint**: drag to paint ground (grass, path, cobble, flagstone, spawn points), nature (trees, rocks, hedges, pumpkins, chests), graves (**Mixed graves** drops headstones and crosses at random; headstones, crosses, open graves, statues), lights (lamp posts, lanterns, torches, campfires, jack-o'-lanterns; placed ones never burn out, though ghosts can still snuff them), landmarks (wells, ruin, mausoleum, crypt, and tower walls), or any buildable structure (it starts fresh). **Fill** 50% or 20% paints only that share of the brush, for natural-looking trees and graves.
  - **Mix**: set a percentage for trees, rocks, headstones, crosses, pumpkins, and hedges (the rest stays bare ground) and drag: grass and scenery under the brush are laid out to those shares, spread evenly. Paths, paving, stairs, landmarks, and buildings stay. The layout is fixed per tile, so painting the same mix again changes nothing, and nudging one share up only adds that kind. Graves skip tiles at the edge of a drop or the foot of a rise. Each tile remembers the mix it was painted with (saved with the world and with maps).
  - **Pick**: click an area to load its mix into the Mix brush: the one it was painted with, or else a measure of what grows there now.
  - **Erase**: back to grass; built structures come down to what they stood on, and anything lying on the ground (piles, gear) is deleted. The fence can't be edited.
  - **Save as map**: type a name and Save to write the map as it is now to `server/presets/<name>.json` (an existing name replaces that preset; save as "King of the Hill" to change the default). It shows up in the map list for new worlds. Esc or the X closes the editor. Nothing checks that every spot can still be reached, so leave stairs up to raised ground.
- **Aggressive monsters**: switch off and zombies and vampires only wander.
- **All unlocks**: every recipe and skill tree node is open to everyone (upgrade levels stay as they are). **Free crafting**: crafting costs nothing. Both apply to phones right away.
- **Natural spawning**: switch off and nothing comes on its own: no monsters walk in (not even the idle wanderers), no blood moons rise, and trees, pumpkins, and chests don't grow back. Only what you spawn shows up.
- **Sandbox map**: pick **Map: Sandbox** and start a new world for a small test arena: a fenced 10x10 patch of grass in the woods, which the TV zooms in on. Natural spawning switches off on it (and back on when you start any other map), and the Spawn buttons put things inside the fence. Spawn whatever monsters you want to try.
- **Test player**: a server-run player joins and plays on its own: it fights any monster that comes close, chops trees, mines rocks and graves, opens chests, every so often builds something next to itself, and spends candy on upgrades when it's by a research table. Switch off to remove it.
- **Lights off** puts out every light, lanterns included, for monsters too (vampires roam freely).
- **Mouse picks up** (on by default): on the TV, press on a player or monster, drag it, and let go. It's held up, frozen, and dangles like a rag doll, kicking its legs; dropped somewhere it can't stand (in a wall, a monster on a door) it lands on the nearest open tile.
- **Mouse light** (on by default): hold the right mouse button on the TV to carry a wide, steady pool of pale moonlight that follows the cursor. It counts as a real light, so vampires keep out of it.
- **Spawn** puts a tree, pumpkin, chest, rock, piece of loot, zombie, vampire, ghost, brute, skeleton, witch, ghoul, or demon at a random spot anywhere on the map (monsters keep a few tiles from players).

These switches live in the server's memory and reset when it restarts.

### Debugging

- The server logs its port and the world seed on start.
- The TV renders straight from server snapshots, so if the TV looks wrong but the phone works, check the browser console on the TV page.
- `npm run dev` runs both processes with labeled output (`server` in red, `client` in magenta). If port 3021 or 5181 is already taken, stop whatever holds it or change the port in `server/src/server.ts` and `client/vite.config.ts`.

## Project layout

```
shared/   wire protocol, map, players, items, structures, monsters (imported by both sides)
server/   authoritative simulation (game/) and socket routing (net/)
client/   one Vite + React app: / is the phone controller, /tv is the display
docs/     game design and milestones
```

See [CLAUDE.md](CLAUDE.md) for architecture notes and code conventions.
