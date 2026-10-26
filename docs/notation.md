# Notation Rules (from Part 0)

### 0.2 The Coordinate Space (The Two-Node Hardware)

The tabla set is approached as a Two-Node Acoustic Synthesizer. Each drum has two primary acoustic states: Open (O) and Closed (C).

**LEFT NODE (Bayan / Bass)**

- **\[O\] = Open Bass (Ge):** The fingers strike the open skin just beside the black spot and lift immediately, delivering a deep, round bass punch. Pitch-bending with the heel of the hand is disabled in this system to keep pitch stable.
- **\[C\] = Closed Flat (Ka):** The fingers drop flat against the membrane while the heel of the hand stays rested on the drum. The result is a dry slap that matches the decay of the Right Node's center tap.

**RIGHT NODE (Dayan / Treble)**

- **\[O\] = Open Rim (Na):** The index finger strikes the kinar (outer rim) and lifts immediately, letting the drum sing at its tuned pitch. This system uses the kinar only. The maidan (Tin) produces a different tone and is reserved for future extensions.
- **\[C\] = Center Spot (Te):** The fingers strike the syahi (black spot) and stay resting on it, damping the ring instantly for a short, dry click. If the fingers lift, the stroke rings (Tun) — treat that as an error in this system.

**Left-handed players:** Reverse every R and L in this book. "R" always means the hand on the Dayan.

### 0.3 The Kinematics (The Finger Matrix & The Diddle Law)

- **1 = Index Finger:** Alternating single strokes, open accents, the second note of every double stroke (diddle), and every flam grace note.
- **2 = Middle Finger** (supported by the ring finger on the left hand): The first note of every double stroke, and the first grace note of every drag.
- **B = Tremolo Flutter (2-1-2-1):** A fast alternating flutter across the finger pads that simulates a multiple-bounce buzz roll.

**Grace-note fingers:** A flam's grace note uses Finger 1 (`1/1`, `1/2`). A drag's two grace notes fire Finger 2, then Finger 1 (`21/1`), like a small diddle.

**The Golden Law of the Diddle:** When one hand plays consecutive strokes (R R or L L), never bounce a single finger twice from the wrist. Instead, use a single wrist descent that fires the Middle Finger (2) and then the Index Finger (1) on the same zone. One wrist movement produces two clean, matched-pitch transients.

**Scope and exceptions:**

- **Scope:** The Law applies whenever the same hand plays primary strokes on adjacent grid steps — even when the other hand's grace notes fall between them.
- **Three adjacent strokes:** Use the 1 → 2 → 1 rocker from the Triple Stroke Roll (#05).
- **Grace exemption:** Grace notes are dropped from about 1cm and aren't rebounds. A grace note may follow a stroke on the same finger.
- **Split-zone exception:** The "same zone" rule is relaxed for the Split-Vector Diddle and the Inverted Tap-to-Crack (Diagnostics 2 and 4), where the two fingers land in different zones. The book's data files tag the diddle's Finger 2 stroke with `splitZone`: `split-vector` for Zone O into Zone C (Diagnostic 2), or `inverted-tap-to-crack` for Zone C into Zone O (Diagnostic 4). An untagged diddle that changes zones fails validation, so every split-zone diddle in the book must be one of these two.

### 0.4 The Time-Series Matrix (Notation Guide)

Every grid is written in a monospace font so columns align, and every step has equal duration.

- **Step:** The step's position in the pattern (01, 02, 03…). A step written **01a / 01b** splits one step into two equal halves — used for 32nd-note diddles inside a 16th or triplet grid.
- **Grid:** The beat (1, 2, 3, 4) and subdivision (e, &, a for 16ths; `.` for triplet or other partials).
- **Vel (Velocity):**
  - `[X]` = Accent (maximum velocity; played in Zone O)
  - `[.]` = Tap (low velocity; played in Zone C)
  - `[%]` = Tremolo/Buzz (unmeasured finger flutter)
  - `[-]` = Rest (no stroke)
  - `g[X]` or `g[.]` = Flam compound: one grace note `g` dropped about 20 ms (−δ) before the primary stroke at t
  - `gg[X]` or `gg[.]` = Drag compound: two grace notes at −2δ and −δ before the primary stroke at t
- **Hand:** R (Right / Dayan), L (Left / Bayan). Compound events read grace / primary: `L/R` = left grace into right primary; `LL/R` = left drag into right primary.
- **Finger:** 1 (Index), 2 (Middle), B (Buzz). `1/2` = grace on Finger 1 into a primary on Finger 2; `21/1` = drag grace on Fingers 2 then 1, into a primary on Finger 1.
- **Zone:** O (Open) or C (Closed). `C/O` = grace in Zone C into a primary in Zone O.

**Etude-only rows and labels:**

- **Rep:** Which tihai repetition a step belongs to (1, 2 or 3), or `gap` for a rest between repetitions.
- **SAM:** Beat 1 of the next cycle, where a tihai lands.
- **(11):** A step number in parentheses is a trailing rest shown for counting. It isn't part of the phrase.

**Measurements:** Every distance, angle and timing in this book (1cm, 45°, \~20 ms) is an approximate starting point. Adjust it for your drums and hands.
