# Contributing to PulseGrid

Thanks for stopping by! Small, focused PRs beat big rewrites.

1. Fork, branch (`feat/<short-name>`), keep the deterministic engine deterministic — no randomness, no API keys in `src/lib/engine.ts`.
2. Every external feed needs an offline fallback in `src/lib/fallback.ts` so `npm run build` passes with no network.
3. Run `npm run lint` and `npm run build` before pushing.
4. Add a test or a one-click console proof when you add an MCP tool.

Be kind. MIT all the way.
