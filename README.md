# Tessellation Walk

Fullscreen screensaver-style canvas app: generate mathematical tessellations, then run a random walk that ages from terracotta (`#C65D3B`) into powder blue (`#B0E0E6`).

## Develop

```bash
pnpm install
pnpm dev
```

```bash
pnpm build
pnpm preview
```

## Controls

| Control | What it does |
| --- | --- |
| Category → Pattern | Regular / Wallpaper / Aperiodic, then a specific tiling |
| Tile size | Approximate cell scale |
| Steps / sec | Walk speed |
| Trail length | How quickly visited tiles fade to powder blue |
| Self-avoiding | Prefer unvisited neighbors; when boxed in, continues through oldest neighbor |
| Center bias | Seed preference toward the viewport center |
| `?` / Esc | Toggle or hide the control tray (also auto-hides after idle) |

## Deploy (Vercel)

Vite static app — import the GitHub repo in Vercel (framework preset: Vite). Build command `pnpm build`, output `dist`. No env vars required.
