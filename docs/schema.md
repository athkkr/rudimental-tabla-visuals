# Data Schema (Step 1)

Types: [`src/schema/types.ts`](../src/schema/types.ts) · Validator: [`src/schema/validate.ts`](../src/schema/validate.ts) · Data: [`data/`](../data) · Tests: `npm test`

## Shape

One JSON file per rudiment or étude. Each grid column is one step:

```json
{"id":"08","grid":"a","rep":1,"velocity":".",
 "grace":{"type":"gg","notes":[{"hand":"L","finger":"2","zone":"C"},{"hand":"L","finger":"1","zone":"C"}]},
 "primary":{"hand":"R","finger":"1","zone":"C"}}
```

- A compound cell (`LL/R`, `21/1`, `CC/C`) becomes `grace.notes` (in playing order) plus one `primary`.
- `grace.type` is `none`, `g` (one note) or `gg` (two notes). The note count is enforced by the type.
- A rest is `velocity: "-"`, `grace: {type: "none"}`, `primary: null`.
- Split steps are two steps, `05a` and `05b`. They count as one step toward the cycle length N.
- An étude with a tihai stores both the core phrase (`tihai.phrase`) and the full map (`steps`). The validator checks they agree.

## What the validator enforces

| Rule | Source |
|---|---|
| Step ids run 01, 02… with `a`/`b` pairs; whole-step count = N | 0.4 |
| Grid labels match the grid type (4 beats per bar); `a` half takes the parent label, `b` half is `.` | 0.4 |
| `[X]` in Zone O, `[.]` in Zone C; `[%]` ⇔ finger B; rests have no stroke | 0.4 |
| Grace notes come from the other hand; a drag fires 2 then 1 from one hand; graces outside Zone C give a warning | 0.3, 0.4 |
| Right-hand Zone C stays down: `release: "lift"` there is an error (Tun). Zone O with `release: "stay"` is an error too | 0.2 |
| Golden Law: same-hand primaries on adjacent steps: 2 → `2 1`, 3 → `1 2 1` rocker, 4+ → error. Rests break a run; grace notes don't. Loops wrap from the last step to the first | 0.3 |
| Split-zone diddles must be tagged `splitZone` on the Finger-2 stroke: `split-vector` (O → C, Diagnostic 2) or `inverted-tap-to-crack` (C → O, Diagnostic 4) | 0.3, 0.5 |
| Tihai: `leadIn + (P+G) + (P+G) + P` = N + 1 (sam); the last step is SAM; every Rep matches the phrase; gaps and lead-in are rests | 5.3 |

## Decisions on ambiguous points

1. **Split-zone diddles are tagged, not inferred.** #35 (01a–01b, 05a–05b) and the Tihai (phrase 05–06) have O → C diddles but the grids don't say so. Any O → C pair matches Diagnostic 2, so inferring it would make the "same zone" rule unenforceable. I added `splitZone: "split-vector"` to those steps. An untagged zone change is an error, and so is a wrong tag.
2. **"Fingers stay down" is an optional `release` field.** The grids never record lift, so the default comes from the zone (C stays, O lifts). The field only matters if someone writes `lift` on a right-hand C stroke, and the validator rejects that. Left Zone C (Ka) is not constrained: 0.2 says the heel stays rested, not the fingers.
3. **Rocker zones.** Only the 2 → 1 tail of a 1-2-1 rocker must share a zone. The head (1 → 2) may change zone. #33 (O, C, C) and #37 (O, O, C) need this.
4. **Rests break adjacency.** Otherwise #39 (R1, rest, rest, R1) would break the Golden Law.
5. **Buzz (B) strokes are exempt from the Golden Law.** The notation doesn't say what two adjacent same-hand tremolos look like.
6. **Flam grace finger is not enforced.** 0.3 says Finger 2 plays flam grace notes, but every flam in the test cases uses Finger 1 (`1/1`, `1/2`). Drags (`21`) agree with 0.3, so drags are enforced.
7. **A single stroke on Finger 2 is a warning, not an error.** 0.3 assigns single strokes to Finger 1, but that reads as a default, not a law.
8. **Tihai cycle.** `cycleLength` is 32 (two 16-step bars). Step 33 is the SAM landing, one step past the cycle. `loop` is false, so the Golden Law doesn't wrap. The lead-in step 01 has `rep: null` (the grid shows `-`). The "(11)" counting rest in the core phrase is not stored. It equals `gapLength`.
9. **4 beats per bar** is assumed for grid labels, since every grid so far is in 4.
