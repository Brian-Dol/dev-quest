# 02 · Analysis & Feasibility

## Feasibility
| Dimension | Verdict | Notes |
|---|---|---|
| Technical | ✅ | HTML5 Canvas + ES modules are enough; no engine required. |
| Economic | ✅ | $0: GitHub Pages and Actions are free for public repos. |
| Operational | ✅ | Static site, nothing to operate beyond the pipeline. |
| Schedule | ✅ | Small scope, iterative delivery. |
| Legal | ⚠️ | Mario is trademarked. Original art, names and levels only; "Mario-style" describes the genre. |

## Options considered
| Option | Pros | Cons | Decision |
|---|---|---|---|
| Phaser / game engine | Fast physics, tooling | Dependency, build step, heavier | ❌ |
| **Vanilla Canvas + ES modules** | Zero deps, full control, shows fundamentals | More code to write | ✅ |
| Embed in README directly | Convenient | GitHub strips JavaScript and iframes | ❌ |

## Key constraint → solution
GitHub profile READMEs cannot run JavaScript. So the README shows an **animated SVG banner** (SVG animation via CSS works inside `<img>`), wrapped in a **link to the hosted game** on GitHub Pages.

## Risks
| Risk | L | I | Mitigation |
|---|---|---|---|
| Levels unbeatable | M | H | Procedural generator with automated traversability tests |
| Touch input unusable | M | M | On-screen controls, manual device testing |
| Trademark concerns | L | M | Original assets and naming |
| Audio blocked by autoplay policy | H | L | Unlock audio on first user gesture |

## Gap analysis
Current: empty folder. Target: deployed, tested, documented game linked from the profile.
