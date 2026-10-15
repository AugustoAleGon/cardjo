# Release validation

## Automated checks

The release uses these checks:

- Oxlint checks the application, scripts, and Vite configuration.
- The upstream prose linter checks authored Markdown and game text.
- Vitest runs 36 engine, store, and interface tests.
- TypeScript checks the production build.
- Chromium checks the production interface through Playwright.

The solution tests cover 100 deterministic seeds.
A separate set of 100 games checks varied legal choices.
These games include dead ends.

## Browser observations

The assistant checked the development build, production preview, and public Pages site in Chrome.

| Check | Observed result |
| --- | --- |
| Mouse matching | A matching pair disappears immediately. |
| Repeated selection | A double click selects and then deselects one tile. |
| Hint | Two available tiles receive dashed outlines. |
| Undo | The previous pair returns to its original positions. |
| Restart | The exact starting deal returns. |
| Reset cancellation | The board and hint remain unchanged. |
| Keyboard matching | Enter and Space remove a pair. Focus moves to an available tile. |
| Final keyboard match | Victory appears. Focus moves to Undo. |
| Dead end | The message appears with recovery controls. Hint disables. |
| Instructions | The dialog opens. Escape closes it and returns focus. |
| Phone width | The page has no horizontal overflow at 360 pixels. |
| Tile targets | Tile buttons measure about 45 by 54 pixels at 360 pixels. |
| Stable geometry | The board keeps its size as tiles disappear. |
| Public refresh | The game loads again with 36 tiles and no asset errors. |
| Browser console | The production and public checks report no errors. |

The assistant completed a generated deal in the production build.
It also reached a dead end with eight tiles during random play.

The CI browser check uses actual Chromium rendering.
It checks reduced motion and normal motion through media emulation.
It also checks phone sizing, touch selection, keyboard focus, both reset cancellations, accepted restart, instructions, and reload.

## Writing review

The prose linter reports zero hard violations and zero advisory findings.
Manual review checks consistent terms and short instructions.
The copied skill retains its license, references, and linter.
The source commit appears in the README.

## Screenshots

[Desktop preview](screenshots/desktop.jpg)

[Phone preview](screenshots/phone.jpg)
