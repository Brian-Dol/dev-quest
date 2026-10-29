# 05 · Development & Testing

## Development approach
- Trunk-based flow: small commits to `main`, PRs for larger changes, CI on every push.
- Pure logic (`js/levels.js`) is separated from browser code (`js/game.js`) so it is testable in Node.
- Fixed-timestep loop (60 Hz) with axis-separated tile collision, coyote time and jump buffering for a forgiving feel.
- Tooling: VS Code, GitHub Copilot, Node 22 (tests only; the game itself needs no build).

## Test strategy
| Level | What | How |
|---|---|---|
| Unit | Level generator: one start, one `?` per lesson, flag and enemies exist, deterministic output | `node --test` (`test/levels.test.js`) |
| Property | No gap wider than 3 tiles, no step higher than 1 tile, so every level is traversable | `node --test` |
| Static | Syntax check on every JS file | `npm run lint` |
| Integration / E2E | A scripted bot plays every one of the 12 worlds in a real browser (Playwright) and must reach the flag | manual run during release |
| Exploratory | Keyboard, touch, mute, pause, save/restore | manual checklist below |
| Compatibility | Chromium verified; Firefox/Safari expected (standard APIs) | manual |

## Release checklist
- [ ] `npm test` and `npm run lint` pass
- [ ] Title → world map → level → lesson card → summary flow works
- [ ] All 12 worlds completable
- [ ] Touch controls visible on a phone
- [ ] Sound can be muted
- [ ] Progress persists after reload

## Bugs found by testing (examples)
| Bug | Found by | Fix |
|---|---|---|
| Level 1 had no enemy | Unit test | Guaranteed enemy before the final stairs |
| `node --test test/` failed on Node 22 | CI dry run | Use default test discovery |
| Bot spent most jumps on a minimum-height hop and died on spikes | E2E bot | Confirmed expected variable-jump behaviour; bot now holds jump |
