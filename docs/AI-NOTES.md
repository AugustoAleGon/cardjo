# AI assistance and human decisions

## AI assistance

The assistant created the React application, pure engine, Zustand store, interface, SVG faces, tests, and CI workflow.
It installed the pinned writing skill with its license and supporting files.
It also checked the game through browser interactions.

Specific examples:

- The assistant checked the original 18-pair sequence against the board geometry before implementation.
- The assistant added tests that observe store updates. These tests reject partial pair removal and duplicate history entries.
- The assistant found cramped control labels at 360 pixels. It placed icons above labels on small screens.
- The assistant found a singular counter error during play. The counter now shows “1 pair available.”
- The assistant checked focus after keyboard matches. Focus reaches Undo after the final pair disappears.

## Human decisions and corrections

The user required mouse input in addition to keyboard input.
The user selected a limit of 60 consecutive minutes.
The user supplied `AugustoAleGon/cardjo` as the repository, replacing the proposed repository name.
The user required atomic commits with standard messages.
Subsequent commits use Conventional Commit prefixes and focused changes.

The original generator placed matching faces in mirrored row positions.
All 10,000 exploratory random games cleared that pattern.
This result did not prove that every possible game would clear.
The assistant reported the finding and proposed random removal sequences.
The user selected that change.
The revised generator preserves a known solution and permits more varied play.
Tests and browser play reached dead ends with the revised generator.

## Validation limits

Automated checks do not replace browser inspection.
Browser checks do not cover every browser or assistive technology.
The prose linter does not prove official ASD dictionary compliance.
The video requires a separate recording after implementation.
