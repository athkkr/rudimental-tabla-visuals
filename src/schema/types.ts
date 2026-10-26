/**
 * Data schema for The Rudimental Tabla (notation rules: docs/notation.md).
 *
 * One JSON file per rudiment or étude. Every grid column becomes one Step.
 * Compound cells such as `LL/R`, `21/1`, `CC/C` are split into a `grace`
 * packet and a `primary` stroke instead of being stored as strings.
 */

export const SCHEMA_VERSION = 1;

/** R = the hand on the Dayan (treble), L = the hand on the Bayan (bass). */
export type Hand = "R" | "L";

/** 1 = Index, 2 = Middle, B = tremolo flutter (2-1-2-1). */
export type Finger = "1" | "2" | "B";

/** O = Open (Na / Ge), C = Closed (Te / Ka). */
export type Zone = "O" | "C";

/** X = accent, . = tap, % = tremolo/buzz, - = rest. */
export type Velocity = "X" | "." | "%" | "-";

/** Velocities that produce a stroke. */
export type StrokeVelocity = Exclude<Velocity, "-">;

/**
 * Grid row labels. Beat numbers and 16th partials (e, &, a), `.` for triplet
 * partials and the b half of a split step, and SAM for the landing step of a
 * tihai (beat 1 of the next cycle).
 */
export type GridLabel = "1" | "2" | "3" | "4" | "e" | "&" | "a" | "." | "SAM";

export type GridType = "16th" | "triplet";

/** What the fingers do after striking. */
export type Release = "lift" | "stay";

/**
 * A Golden Law diddle whose two fingers land in different zones.
 * Only these two shapes are sanctioned (notation 0.3, split-zone exception):
 * - "split-vector":           2 in Zone O, then 1 in Zone C (Diagnostic 2)
 * - "inverted-tap-to-crack":  2 in Zone C, then 1 in Zone O (Diagnostic 4)
 */
export type SplitZone = "split-vector" | "inverted-tap-to-crack";

/** A grace note: dropped from ~1cm, ~20 ms (δ) before the primary. */
export interface GraceNote {
  hand: Hand;
  finger: Exclude<Finger, "B">;
  zone: Zone;
}

/**
 * none = plain stroke
 * g    = flam: one grace note at −δ
 * gg   = drag: two grace notes at −2δ and −δ (stored in playing order)
 */
export type Grace =
  | { type: "none" }
  | { type: "g"; notes: [GraceNote] }
  | { type: "gg"; notes: [GraceNote, GraceNote] };

export type GraceType = Grace["type"];

/** The stroke that lands on the grid line. */
export interface Stroke {
  hand: Hand;
  finger: Finger;
  zone: Zone;
  /**
   * Optional. Defaults from the zone: C stays down, O lifts.
   * Written out only to state it explicitly; the validator rejects a right
   * hand lifting from Zone C (that rings as Tun).
   */
  release?: Release;
  /**
   * Set on the Finger-2 stroke that starts a split-zone diddle.
   * Required whenever the two strokes of a Golden Law pair are in different zones.
   */
  splitZone?: SplitZone;
}

/** Sound content of a step, without its position. */
export type StepBody =
  | {
      velocity: StrokeVelocity;
      grace: Grace;
      primary: Stroke;
    }
  | {
      velocity: "-";
      grace: { type: "none" };
      primary: null;
    };

/**
 * "01".."99", optionally with "a"/"b" for the two equal halves of a split step.
 * A step is either whole ("05") or split ("05a" + "05b"), never both.
 */
export type StepId = string;

/** Which tihai repetition a step belongs to; null = outside the tihai (lead-in). */
export type Rep = 1 | 2 | 3 | "gap" | null;

/** One column of a time-series grid. */
export type Step = StepBody & {
  id: StepId;
  grid: GridLabel;
  /** Étude-only row. */
  rep?: Rep;
};

/** A step of a tihai's core phrase. The book prints it without Grid or Rep rows. */
export type PhraseStep = StepBody & { id: StepId };

/** Tihai structure: leadIn + (P + G) + (P + G) + P = landing step (sam). */
export interface Tihai {
  /** Rest steps before Rep 1 starts. */
  leadIn: number;
  /** P: steps in the core phrase. */
  phraseLength: number;
  /** G: rest steps between repetitions. */
  gapLength: number;
  /** The core phrase, P steps. Its trailing counting rest, e.g. "(11)", is not stored. */
  phrase: PhraseStep[];
}

export interface Rudiment {
  schemaVersion: typeof SCHEMA_VERSION;
  /** File-stable slug, e.g. "pas-35". */
  id: string;
  kind: "rudiment" | "etude";
  /** PAS number for rudiments. */
  pas?: number;
  /** Book section for études, e.g. "5.3". */
  section?: string;
  name: string;
  formula: string;
  grid: GridType;
  /**
   * N: number of whole steps in one cycle (split steps count once).
   * A tihai may add one extra step after the cycle: its landing on SAM.
   */
  cycleLength: number;
  /** True if the grid repeats. Golden Law runs then wrap from the last step to the first. */
  loop: boolean;
  steps: Step[];
  tihai?: Tihai;
  performanceGuide?: string;
}
