# Video outline

Record a video between two and four minutes long.
Use the public demo and repository.

## 0:00–0:30 — Introduce the game

1. Open the public demo.
2. Explain the 36 tiles and two layers.
3. Show the instructions.

## 0:30–1:20 — Show gameplay

1. Select two matching tiles.
2. Use Hint.
3. Use Undo.
4. Cancel a restart to show preserved progress.
5. Show keyboard selection and focus.
6. Show the phone layout.

Explain that hints identify legal pairs without guaranteeing a winning path.
If a dead end appears, demonstrate Undo or Restart.

## 1:20–2:10 — Explain the structure

1. Show the pure engine.
2. Show the Zustand store factory.
3. Explain the random legal sequence and face assignment.
4. Show the React board and SVG faces.

Explain that selectors derive availability and game status.
Explain that one store update removes both tiles and records the pair.

## 2:10–2:50 — Show validation and decisions

1. Show the passing GitHub Actions run.
2. Show the engine, store, and interface tests.
3. Show the prose check and pinned skill.
4. Explain the change from mirrored deals to random legal sequences.
5. State the elapsed implementation time.

Mention the excluded features and the separate video period.
Use `AI-NOTES.md` for specific examples of assistance and human decisions.

## Submission

1. Copy the repository link.
2. Copy the public demo link.
3. Copy the video link after recording.
4. Check that all three links open for the reviewer.
