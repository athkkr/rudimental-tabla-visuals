# Schema Test Cases

Each grid covers an edge case the schema must handle.

#### PAS #35: Single Dragadiddle

**System Formula:** A paradiddle whose first stroke becomes a same-hand diddle: R2\[O\], R1\[C\], L1\[C\], R2\[C\], R1\[C\].

**Cycle Length:** N = 8 steps (16th grid with sub-steps).

```
Step:   01a   01b   02    03    04    05a   05b   06    07    08
Grid:   1     .     e     &     a     2     .     e     &     a
Vel:    [X]   [.]   [.]   [.]   [.]   [X]   [.]   [.]   [.]   [.]
Hand:   R     R     L     R     R     L     L     R     L     L
Finger: 2     1     1     2     1     2     1     1     2     1
Zone:   O     C     C     C     C     O     C     C     C     C
```

**Performance Guide:** Unlike Drag Taps, the drag here is played by the lead hand. Strike Step 01a with Finger 2 at the rim, snap Finger 1 into Zone C, then play the closing diddle on Steps 03–04.

### 5.3 Capstone Etude 3: 'The Fractured Tihai'

A classical tihai repeats a phrase three times so its final stroke lands on sam — beat 1 of the next cycle. Here the phrase is 10 steps (P = 10) with 1-step gaps (G = 1), so the tihai lasts 3P + 2G = 32 steps. Starting on beat 1 would put the final stroke on step 32, one step short of sam. So the tihai starts one step late, on the e of beat 1:

```latex
1 + (10 + 1) + (10 + 1) + 10 = 33 \;\rightarrow\; \text{final stroke on step 33 (sam)}
```

**The 10-step core phrase** (step 11 = gap):

```
Step:   01    02    03    04    05    06    07    08    09    10    (11)
Vel:    g[X]  [.]   [.]   [.]   g[X]  [.]   [.]   gg[.] [X]   g[X]  [-]
Hand:   L/R   L     R     R     R/L   L     R     LL/R  L     L/R   -
Finger: 1/1   1     2     1     1/2   1     2     21/1  1     1/1   -
Zone:   C/O   C     C     C     C/O   C     C     CC/C  O     C/O   -
```

Step 07 takes Finger 2 because the same hand plays the drag's primary on Step 08 (Golden Law).

**Full time-series map — Bar 1 (Steps 01–16)**

```
Step:   01    02    03    04    05    06    07    08    09    10    11    12    13    14    15    16
Grid:   1     e     &     a     2     e     &     a     3     e     &     a     4     e     &     a
Rep:    -     1     1     1     1     1     1     1     1     1     1     gap   2     2     2     2
Vel:    [-]   g[X]  [.]   [.]   [.]   g[X]  [.]   [.]   gg[.] [X]   g[X]  [-]   g[X]  [.]   [.]   [.]
Hand:   -     L/R   L     R     R     R/L   L     R     LL/R  L     L/R   -     L/R   L     R     R
Finger: -     1/1   1     2     1     1/2   1     2     21/1  1     1/1   -     1/1   1     2     1
Zone:   -     C/O   C     C     C     C/O   C     C     CC/C  O     C/O   -     C/O   C     C     C
```

**Bar 2 (Steps 17–32) + landing on sam (Step 33)**

```
Step:   17    18    19    20    21    22    23    24    25    26    27    28    29    30    31    32    33
Grid:   1     e     &     a     2     e     &     a     3     e     &     a     4     e     &     a     SAM
Rep:    2     2     2     2     2     2     gap   3     3     3     3     3     3     3     3     3     3
Vel:    g[X]  [.]   [.]   gg[.] [X]   g[X]  [-]   g[X]  [.]   [.]   [.]   g[X]  [.]   [.]   gg[.] [X]   g[X]
Hand:   R/L   L     R     LL/R  L     L/R   -     L/R   L     R     R     R/L   L     R     LL/R  L     L/R
Finger: 1/2   1     2     21/1  1     1/1   -     1/1   1     2     1     1/2   1     2     21/1  1     1/1
Zone:   C/O   C     C     CC/C  O     C/O   -     C/O   C     C     C     C/O   C     C     CC/C  O     C/O
```

**Performance Guide:** Step 01 is a breath; enter on the e. The gaps (Steps 12 and 23) are true rests. Rep 3's closing flam is the landing: Step 33, beat 1 of the next cycle.

#### PAS #30: Flam Drag

**System Formula:** A flam on the first triplet partial, a two-note diddle on the second (sub-steps a/b), and a tap on the third.

**Cycle Length:** N = 12 steps (triplet grid with sub-steps).

```
Step:   01    02a   02b   03    04    05a   05b   06    07    08a   08b   09    10    11a   11b   12
Grid:   1     .     .     .     2     .     .     .     3     .     .     .     4     .     .     .
Vel:    g[X]  [.]   [.]   [.]   g[X]  [.]   [.]   [.]   g[X]  [.]   [.]   [.]   g[X]  [.]   [.]   [.]
Hand:   L/R   L     L     R     R/L   R     R     L     L/R   L     L     R     R/L   R     R     L
Finger: 1/1   2     1     1     1/1   2     1     1     1/1   2     1     1     1/1   2     1     1
Zone:   C/O   C     C     C     C/O   C     C     C     C/O   C     C     C     C/O   C     C     C
```

**Performance Guide:** Keep the diddle on sub-steps 02a–02b low and quiet in Zone C. The dynamic jump from the center diddle back to the flam gives the figure its definition.

#### PAS #33: Double Drag Tap

**System Formula:** Two drag taps followed by an open accent: gg\[.\], gg\[.\], \[X\].

**Cycle Length:** N = 12 steps (triplet grid).

```
Step:   01    02    03    04    05    06    07    08    09    10    11    12
Grid:   1     .     .     2     .     .     3     .     .     4     .     .
Vel:    gg[.] gg[.] [X]   gg[.] gg[.] [X]   gg[.] gg[.] [X]   gg[.] gg[.] [X]
Hand:   LL/R  LL/R  L     RR/L  RR/L  R     LL/R  LL/R  L     RR/L  RR/L  R
Finger: 21/2  21/1  1     21/2  21/1  1     21/2  21/1  1     21/2  21/1  1
Zone:   CC/C  CC/C  O     CC/C  CC/C  O     CC/C  CC/C  O     CC/C  CC/C  O
```

**Performance Guide:** In the loop, each hand plays an accent and then two drag primaries in a row. Use the 1 → 2 → 1 rocker from #05: accent on Finger 1 in Zone O, then the primaries on Fingers 2 and 1 in Zone C. Keep both grace packets identical in spacing and volume.

#### PAS #04: Multiple Bounce Roll (Buzz Roll)

**System Formula:** Alternating hands, each stroke an unmeasured tremolo (B).

**Cycle Length:** N = 8 steps.

```
Step:   01    02    03    04    05    06    07    08
Grid:   1     e     &     a     2     e     &     a
Vel:    [%]   [%]   [%]   [%]   [%]   [%]   [%]   [%]
Hand:   R     L     R     L     R     L     R     L
Finger: B     B     B     B     B     B     B     B
Zone:   C     C     C     C     C     C     C     C
```

**Performance Guide:** Keep contact light — enough to damp the ring, not enough to choke the flutter. Flutter the pads of Fingers 1 and 2 rapidly in Zone C, overlapping each hand's decay with the next.

#### PAS #39: Double Ratamacue

**System Formula:** One drag, then a Single Ratamacue: LL/R\[C\], LL/R\[C\], L\[C\], R\[C\], L\[O\].

**Cycle Length:** N = 24 steps (triplet grid; one bar per lead).

```
Step:   01    02    03    04    05    06    07    08    09    10    11    12    13    14    15    16    17    18    19    20    21    22    23    24
Grid:   1     .     .     2     .     .     3     .     .     4     .     .     1     .     .     2     .     .     3     .     .     4     .     .
Vel:    gg[.] [-]   [-]   gg[.] [.]   [.]   [X]   [-]   [-]   [-]   [-]   [-]   gg[.] [-]   [-]   gg[.] [.]   [.]   [X]   [-]   [-]   [-]   [-]   [-]
Hand:   LL/R  -     -     LL/R  L     R     L     -     -     -     -     -     RR/L  -     -     RR/L  R     L     R     -     -     -     -     -
Finger: 21/1  -     -     21/1  1     1     1     -     -     -     -     -     21/1  -     -     21/1  1     1     1     -     -     -     -     -
Zone:   CC/C  -     -     CC/C  C     C     O     -     -     -     -     -     CC/C  -     -     CC/C  C     C     O     -     -     -     -     -
```

**Performance Guide:** The first drag owns beat 1. The triplet (Steps 04–06) owns beat 2, and the open bass accent lands squarely on beat 3. Both drag packets must land with identical weight and speed.
