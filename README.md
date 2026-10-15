# Quiet Mahjong

A Mahjong Solitaire game with 36 tiles and two layers.

[Play the game](https://augustoalegon.github.io/cardjo/).

## Setup

Use Node 22.16.0, pnpm 10.12.1, and Python 3.

```sh
pnpm install
pnpm dev
```

## Checks

```sh
pnpm lint
pnpm lint:prose
pnpm test
pnpm build
pnpm preview
```

## Architecture

Pure TypeScript functions define the game rules.
A Zustand store controls the game state.
React components display the board.
Tailwind utilities style the interface.

## Writing skill

The project includes the ASD-STE100 skill from `danyuchn/asd-ste100-skill`.
The source commit is `3944283c183eea13fe5bd902b572da3b4de8bf44`.
The copied files retain the upstream license, references, and linter.
The prose check excludes these copied files.
The linter uses its default zero-error baseline.
Advisory findings require manual review.
The skill does not prove official dictionary compliance.

## Time

Implementation started at 21:37:50 UTC on October 15, 2026.
The implementation limit is 60 consecutive minutes.
Planning and video recording are outside this period.
