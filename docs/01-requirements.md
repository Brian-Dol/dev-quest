# 01 · Requirements Gathering

## Vision
A free, instantly playable, Mario-style game that lives on my GitHub profile and shows how I take software from idea to production and beyond.

## Stakeholders
| Stakeholder | Interest |
|---|---|
| Me (owner / developer) | A memorable portfolio piece that demonstrates end-to-end engineering |
| Recruiters & hiring managers | Understand my process in under 2 minutes |
| Fellow developers / learners | Have fun and learn the SDLC |

## User stories (MoSCoW)
| ID | Story | Priority |
|---|---|---|
| US-1 | As a visitor, I see an animated banner on the GitHub profile so that I'm curious to click. | Must |
| US-2 | As a visitor, I click the banner and the game opens with no install. | Must |
| US-3 | As a player, I can run, jump, collect coins and squash bugs. | Must |
| US-4 | As a player, each world teaches one SDLC phase. | Must |
| US-5 | As a player, I can use keyboard or touch controls. | Must |
| US-6 | As a player, my progress is saved between visits. | Should |
| US-7 | As a player, I get sound effects and can mute them. | Should |
| US-8 | As a maintainer, every push is tested and deployed automatically. | Should |
| US-9 | As a player, I see a final completion screen. | Could |
| US-10 | Online leaderboard / accounts. | Won't (this release) |

## Acceptance criteria (examples)
- **US-2** *Given* the profile README, *when* I click the banner, *then* the game loads over HTTPS and shows the title screen within 3 s on a normal connection.
- **US-3** *Given* a level is running, *when* I press jump while standing, *then* the character leaves the ground; *when* I land on a bug, *then* it is squashed and I bounce.
- **US-5** *Given* a phone browser, *then* on-screen buttons are shown and work.

## Non-functional requirements
- Runs in modern evergreen browsers; no build step, no dependencies.
- 60 FPS on mid-range hardware (fixed-timestep loop).
- Accessible controls hints, responsive layout, no data collection.
- Free hosting (GitHub Pages).
