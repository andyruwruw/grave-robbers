# Grave Robbers

A top-down, pixelated, voxel horror party game. A TV (or any big screen) shows the graveyard, everyone plays on their phone, which becomes a controller.

# Sound and music

Browsers keep audio off until someone interacts with the page. On the TV, click or press any key once (a faded "Click for sound" sits in the bottom right until then). For a kiosk setup, start Chrome with `--autoplay-policy=no-user-gesture-required`.

Phones turn sound on with their first touch.

## Sound Effects

Synthesized in code, so they work out of the box. The TV plays world sounds panned to where they happen (swings, hits, chopping, building, breaking, monster groans, deaths, the blood moon horn). Each phone plays its own player's chops, hits, pickups, builds, hurts, and death.

### Your own SFX

Drop `<name>.mp3` into `server/media/sfx/` to replace that sound. Getting hit has its own sound (`hurt`: a crunchy thud and a pained grunt), on the TV and on the hurt player's phone.

Names: `swing`, `chop`, `mine`, `hit`, `hurt`, `monster-hit`, `bite`, `build`, `break`, `pickup`, `drop`, `refuel`, `snuff`, `error`, `death`, `respawn`, `monster-death`, `blood-moon`, `zombie-groan`, `vampire-hiss`, `ghost-moan`, `equip`, `craft`, `shadow-step`, `ghoul-hiss`, `ghoul-screech`, `shoot`, `splat`, `drink`.

## Music

*Media lives on the server, not in the client bundle: everything under `server/media/` is served at `/media` and listed by `/api/media`, read fresh on each request, so new files show up on the next page load with no rebuild or restart. Phones never download music.

**Incognito** (Music tab) turns the TV into what looks like a now-playing screen with an animated background: the album art big in the middle, title and artist below, the live graveyard (monsters and all) behind it, the QR and kill feed hidden, game sounds muted. It fades back to the graveyard as soon as a phone joins (or press Escape). It's off when the TV page opens; press **I** on the TV to toggle it. Album art comes from Spotify, or from the cover embedded in an mp3's ID3 tag.

### Music (Spotify)

1. Create an app at https://developer.spotify.com/dashboard with the Web Playback SDK and Web API enabled, and add the redirect URI `http://127.0.0.1:3021/auth/spotify/callback` (Spotify doesn't accept `localhost`).
2. Put `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` in `server/.env` (gitignored; the server's `dev` and `start` scripts load it). Add `SPOTIFY_REDIRECT_URI` if you use a different address.
3. Either set `SPOTIFY_REFRESH_TOKEN` in `server/.env` too, which links that account from startup with no login (and wins over any login saved from the TV), or on the TV open the sidebar, click **Connect Spotify** in the Music tab's Spotify card. A TV login is kept in `server/data/spotify.json` until you click **Disconnect**; copy its `refreshToken` into `.env` to make it the default. With an env token, **Disconnect** only lasts until the server restarts.
4. Pick a playlist in the Music tab's Spotify card (it shows each playlist's cover).

### Custom songs

Drop mp3s into `server/media/music/`, or a song split into parts as a folder of mp3s in `server/media/music/<song>/` (`bass`, `drums`, `instruments`, `melody`, played together in step) with its cover as `cover.jpg` (else `art.jpg`; the bundled covers are square crops of the original `art.jpg`).

They play shuffled, named by a `meta.json` in the song's folder (`{ "title": ..., "artist": ... }`, either optional), else their ID3 tags, else the file or folder name in title case.

Part songs follow the game: everything plays while nobody's connected; once players are in, exploring keeps instruments and bass with a hushed melody, and a fight (a monster within 6 tiles of a living player, or a hit in the last 6 seconds) brings in the drums and the full melody, which fade back out afterwards. The blood moon keeps some drums going.

## Ambience

`server/media/ambience/*.mp3` loops quietly under everything on the TV, always, at its own volume (the Ambience slider).

## What plays

The TV keeps its own queue. With **Spotify playback** ticked, whatever is queued on the linked Spotify account (from your phone, or guests in a Spotify Jam) plays first, in Spotify's order, so additions and moves there show up on the TV. After that come the **Spotify playlist** (shuffled by the TV) and the **Custom songs** (shuffled in). 

With both ticked, a slider under each sets how often it's picked against the other (3 to 1 for the playlist by default). Spotify tracks play one at a time and fade out at the end; Spotify pauses while a custom song plays. Spotify playback needs the `user-read-currently-playing` scope: if Up next never shows your queued songs, click **Disconnect Spotify** and connect again.

The **Music** tab (TV sidebar) has cards: **Music** (checkboxes for Spotify playback, Spotify playlist, and Custom songs), **Spotify** (connect, playlist, disconnect), **Volume** (music, ambience, sound effects; saved per TV), and **Now playing** (cover, play/pause, skip, Incognito), and **Up next** (where each song comes from; the TV's own songs can move up or down or come out, songs queued on Spotify stay). Music dips briefly when someone dies and when the blood moon rises.

Only one TV page plays music: the newest one opened. Any other open TV page goes quiet and its Music tab shows **Play music here** to take it back.

## Controls (phone, landscape)

| Control | What it does |
|---|---|
| Joystick (drag anywhere on the left half) | Move. You face the way you last moved. |
| ACT (hold to repeat) | Also a stick: drag your thumb from where it lands toward a direction (behind you too, snapped to 8 ways) to turn and act that way while you keep walking; a plain tap acts the way you last faced. Acts on whatever is in front of you: hits a player, chops a tree, digs up a grave, mines a rock, smashes a pumpkin, breaks open a chest, refuels a torch or campfire that's burning low (costs 1 wood), feeds a station from your pockets, offers 2 hearts at a sacrificial altar for blood, loads a blood sentry (1 blood for 3 shots), or damages a structure (full lights included). |
| Picking up | There's no button: walk over gear, crated structures, or piles to pick them up into the bag (never equipped); something you just dropped waits 2 seconds. |
| BLOCK (hold) | Shows with a shield beside a one-handed weapon: raises the shield square in front of you (see Shields). |
| Bag (middle) | Opens your equipped slots (weapon, off-hand, armor), candy and blood, and sixteen bag slots, all little 3D icons; the bag also holds wood, planks, stone, iron, bolts, and crated structures as stacks. ACT and BLOCK step aside (with a Panic button above the bag) while it's open. Tap a stack of structures to start building: the bag closes and the right side shows what you're building with a **Turn** stick (drag it to face where it should go; the left joystick still walks), **Back** (to the bag), and **Build**. The TV previews it (a dim white outline where it will go, light red with whatever is in the way outlined if it can't); it always goes on the tile in front of you, pushed on past you if you're standing on that one, never on top of you. Tap anything else to pick it up, then tap another slot to move it there (onto a matching stack, swapping places, or into its equipped slot), or tap it again to use it: equip or put away gear, or drink a tonic. While something is picked up a drop slot appears that throws it in front of you (candy and blood 5 at a time, for a teammate). Hold anything to see its details. |
| Craft (middle) | Opens the Craft list by category, with a Panic button: what you've unlocked shows as icons (dimmed if you're short on materials), and everything else is a plain lock until you tick **Show locked**. Tap one to pick it: a bar along the bottom shows its name, a count with **-** and **+** (up to as many as you can afford), and **Craft**, which makes that many with a hammering chime. What's made goes into your bag (structures stack up to 99 per slot); costs come out of your bag. Hold one to see its details: its name, its model slowly turning, labeled stat bars (red is weak, amber middling, green strong), special traits in words, its cost, and what unlocks it. |
| Tree (middle) | Opens your own skill tree full screen (kept when you die): every piece of gear and structure as an icon, linked to what it grows from, with level pips. The next thing you could open is a locked question mark: tap it for a heavily blurred glimpse and what opens it. Past that, only lines fading into the dark hint at more, and each new row slowly fades in as it comes into sight. Tap an open node to see what the next level does and, standing by a research table, upgrade it with candy and blood; hold it for its details. **Back** closes it. The details sidebar on the right can be dragged wider or narrower. **Panic** (also on the Bag and Craft lists) closes the menu and makes your character run from any monster within 4 tiles for a second, then walk back to where you were once it's safe. |
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

## Setup

#### Requirements

- Node.js 22 or newer (developed on Node 24) and npm.
- A computer to run the server and show the TV page.
- Phones on the same Wi-Fi network as that computer.

```sh
% npm install
```

One install at the root covers every workspace (`shared`, `server`, `packages/*`, `apps/*`).

### Running locally

```sh
npm run dev
```

This starts:

- the game server on port **3021** (Express + WebSocket, restarts on file changes), and
- a Vite dev server per app (hot reload, proxies `/ws` to the game server, listens on your LAN): the phone on **5181**, which also passes `/tv`, `/play`, and `/admin` through to the TV (5182), play (5183), and admin (5184) servers, so everything opens from 5181.

Then:

1. On the TV machine, open **http://localhost:5181/tv**.
2. Scan the small QR code in the bottom left of the TV with a phone: white squares on a dark glow, which phone cameras read fine (hovering it with the mouse brightens it and shows the URL; it stays up during Incognito). The QR swaps `localhost` for this computer's LAN address, so it points at something like `http://192.168.1.20:5181/`.
3. Pick a name and color, then turn the phone sideways.

#### Phones can't connect?

- Make sure the phone is on the same network (not mobile data, not a guest network that isolates devices).
- On Windows, allow Node.js through the firewall for private networks when prompted, or add an inbound rule for TCP 5181 (dev) and 3021 (production).
- If the QR shows the wrong IP (VPNs and virtual adapters can confuse it), type the right address into the phone's browser by hand. The server prefers `192.168.x`, then `10.x`, then `172.x` addresses and skips WSL, Docker, Hyper-V and VPN adapters (`server/src/net/helpers/lan-address.ts`, adapter rules in `net/config/lan.ts`).

### Production-style run

```sh
npm run build   # builds every app into apps/<name>/dist
npm start       # server on :3021 also serves the built apps
```

Open **http://localhost:3021/tv** on the TV; phones use the QR as before. Set `PORT` to change the port (the dev servers proxy to 3021 unless `GAME_PORT` says otherwise; `APPS_PORT` moves their 5181 to 5184) and `WORLD_SAVE` to use a different save file, e.g. to run a second server alongside `npm run dev`:

```sh
PORT=3031 WORLD_SAVE=/tmp/test-world.json npm start
```

## Testing

There are no automated tests yet. Before committing, run:

```sh
npm run typecheck   # shared, server, packages, and every app
npm run build       # catches anything the bundler rejects
```

### Testing without a room full of phones

Each browser profile holds one player (the player token lives in `localStorage` under `graveyard.token`), so two tabs in the same browser are the same player. To get several players on one computer:

- use different browsers, or a mix of normal and private/incognito windows, or separate Chrome profiles;
- open `http://localhost:5181/` in each and join with a different name;
- in Chrome DevTools, turn on the device toolbar (Ctrl+Shift+M), pick a phone, and rotate it to landscape. Portrait shows a "Turn your phone sideways" screen.

The mouse works for the joystick and buttons. Keep the TV page open in another window to watch the result.

### Debugging

- The server logs its port and the world seed on start.
- The TV renders straight from server snapshots, so if the TV looks wrong but the phone works, check the browser console on the TV page.
- `npm run dev` runs the server and the four apps with labeled output (`server`, `mobile`, `tv`, `play`, `admin`). If a port is already taken, stop whatever holds it, or set `PORT` (server), `GAME_PORT`, and `APPS_PORT` (the apps).

## Project layout

```
shared/   game data and rules by topic folder (protocol/, world/, gear/, monsters/, ...), imported by both sides
server/   authoritative simulation (game/, one folder per subsystem) and socket routing (net/)
apps/     one Vite + React app per screen: mobile (/), tv (/tv), play (/play), admin (/admin)
packages/ client code the apps share: ui, renderer, game-ui, controls
docs/     design and architecture, one file per topic
```

See [CLAUDE.md](CLAUDE.md) for an index of the docs, [docs/architecture.md](docs/architecture.md) for code layout and class hierarchies, and [docs/organization.md](docs/organization.md) for where new code goes.
