# The Rudimental Tabla — Visuals

Structured data and a single renderer for the visuals in *The Rudimental Tabla* (the 40 PAS rudiments translated to tabla).

## Docs

- [`docs/notation.md`](docs/notation.md) — notation rules (Part 0 of the book)
- [`docs/test-cases.md`](docs/test-cases.md) — six edge-case grids the schema must handle (#35, 5.3, #30, #33, #04, #39)
- [`docs/plan.md`](docs/plan.md) — visuals plan and build order
- [`docs/schema.md`](docs/schema.md) — data schema, validator rules and decisions (step 1)

## Run

```
npm install
npm test        # validates every file in data/
npm run typecheck
```

## Starter prompt (step 1 only)

```
Read docs/notation.md, docs/test-cases.md and docs/plan.md.

Step 1 only: create the data schema. Do not build the renderer yet.

1. TypeScript types for a Rudiment and its Steps. Each step has:
   id (e.g. "01a"), grid label, velocity (X | . | % | -),
   grace (none | g | gg), hand, finger, zone. Compound events
   (L/R, LL/R, 21/1, CC/C) are modeled as separate grace and
   primary fields, not strings.
2. A JSON file for each test case in docs/test-cases.md.
3. A validator that enforces the notation rules, including:
   - Right zone C means the fingers stay down.
   - Adjacent same-hand primaries follow the Golden Law.
   - Tihai math: 1 + (10+1) + (10+1) + 10 = 33.
4. Tests that run all six cases through the validator.

Commit to a branch and tell me what you decided about anything ambiguous.
```
