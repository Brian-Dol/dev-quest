# 07 · Operations, Maintenance & Evolution

## Monitoring (post-production)
| Signal | Source | Action |
|---|---|---|
| Site up / deploy status | GitHub Actions badge, Pages status | Re-run workflow, revert if needed |
| Console errors | Manual smoke test after each release | Fix forward or roll back |
| User feedback | GitHub Issues (templates) | Triage within a week |

SLO (informal): game loads and is playable ≥ 99% of the time, matching GitHub Pages availability.

## Support process
1. User opens an issue (bug / idea).
2. Triage: label `bug`, `enhancement`, `question`; assign severity.
3. Fix on a branch, add a regression test where possible, release via the pipeline.
4. Comment on the issue with the release that contains the fix.

## Maintenance types
| Type | Example |
|---|---|
| Corrective | Fix a collision glitch |
| Adaptive | Browser API change (e.g. audio autoplay policy) |
| Perfective | New levels, power-ups, better art |
| Preventive | Refactor `game.js` into modules, add more tests |

## Backlog / evolution ideas
- Power-ups (e.g. "Code Review" shield, "CI" double jump)
- Boss fight per phase (e.g. "The Legacy Monolith")
- Local best-time leaderboard, accessibility options (reduced motion, remappable keys)
- Level editor and community levels
- Automated browser E2E in CI

## Retirement
If the game is ever retired: announce in the README, archive the repo, keep the Pages site up read-only for a notice period, and remove the profile banner.
