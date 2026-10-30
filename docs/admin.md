# Admin console (/admin)

`/admin` is the `apps/admin` app: the TV's controls and a view of the world, for whoever runs the game, from a laptop or a phone. It joins as a display with `admin: true` (`admin-page.tsx`).

| Part | What it is |
|---|---|
| World view | The graveyard (`WorldView` from `packages/renderer`), with the kill feed over it |
| Follow (`components/follow-panel.tsx`) | What the view looks at: the whole map (the spawn on a huge world), or any player, away ones included |
| Zoom | While following (or on a huge world), the TV view presets (`TV_VIEWS`): Close (the default) or Classic |
| Controls | `ControlPanel` from `packages/controls`: Overview (players, controllers, stats) and Game. No Music tab and no incognito: only the TV runs music |

- Stacked on a narrow screen (world on top, controls below), side by side on a wide one.
- **Following on a huge world** sends `watch` with the player, so the server sends only their surroundings (`INTEREST_RADIUS`). The admin isn't a viewer, so the TV keeps that player in its split screen.
- **The mouse** works like the TV's (`useTvMouse`): pick up players and monsters, carry the light, as the Game tab's switches allow.
- **The map editor** opens from the Game tab, frames the whole map while it's open, and closes with Escape (`useMapEditor`, `MapEditor`).
- A ping over `INTERP_PING_MS` turns on interpolation, as on the TV.
- No keyboard shortcuts, no game controllers of its own, no sound.
