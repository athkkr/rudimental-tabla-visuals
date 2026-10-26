import type { GridLabel, GridType, PhraseStep, Rudiment, Step, StepBody, Stroke } from "./types";
import { SCHEMA_VERSION } from "./types";

export type RuleId =
  | "structure"
  | "step-id"
  | "grid"
  | "velocity"
  | "buzz"
  | "grace"
  | "release"
  | "golden-law"
  | "tihai";

export interface Issue {
  level: "error" | "warning";
  rule: RuleId;
  /** JSON path, e.g. "steps[3].primary.zone". */
  path: string;
  stepId?: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: Issue[];
  warnings: Issue[];
}

type AnyStep = Step | PhraseStep;

class Report {
  issues: Issue[] = [];
  error(rule: RuleId, path: string, message: string, stepId?: string) {
    this.issues.push({ level: "error", rule, path, message, stepId });
  }
  warn(rule: RuleId, path: string, message: string, stepId?: string) {
    this.issues.push({ level: "warning", rule, path, message, stepId });
  }
  result(): ValidationResult {
    const errors = this.issues.filter((i) => i.level === "error");
    const warnings = this.issues.filter((i) => i.level === "warning");
    return { ok: errors.length === 0, errors, warnings };
  }
}

/** Validates parsed JSON against the schema and the notation rules (docs/notation.md). */
export function validateRudiment(input: unknown): ValidationResult {
  const r = new Report();
  if (!checkStructure(input, r)) return r.result();
  const rud = input as Rudiment;

  checkStepIds(rud.steps, "steps", r, rud.cycleLength, !!rud.tihai);
  checkGrid(rud, r);
  rud.steps.forEach((s, i) => checkStepContent(s, `steps[${i}]`, r));
  checkGoldenLaw(rud.steps, "steps", rud.loop, r);

  if (rud.tihai) {
    checkTihai(rud, r);
  } else if (rud.steps.some((s) => s.rep !== undefined)) {
    r.error("tihai", "steps", "Rep values are set but there is no tihai block.");
  }
  return r.result();
}

// ---------------------------------------------------------------------------
// Structure: the JSON has the shape described in types.ts.

const HANDS = ["R", "L"];
const FINGERS = ["1", "2", "B"];
const ZONES = ["O", "C"];
const VELOCITIES = ["X", ".", "%", "-"];
const GRID_LABELS = ["1", "2", "3", "4", "e", "&", "a", ".", "SAM"];

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function checkStructure(input: unknown, r: Report): boolean {
  const before = r.issues.length;
  const bad = (path: string, msg: string) => r.error("structure", path, msg);

  if (!isObj(input)) {
    bad("", "Expected an object.");
    return false;
  }
  if (input.schemaVersion !== SCHEMA_VERSION) bad("schemaVersion", `Expected ${SCHEMA_VERSION}.`);
  for (const k of ["id", "name", "formula"]) {
    if (typeof input[k] !== "string" || input[k] === "") bad(k, "Expected a non-empty string.");
  }
  if (input.kind !== "rudiment" && input.kind !== "etude") bad("kind", 'Expected "rudiment" or "etude".');
  if (input.grid !== "16th" && input.grid !== "triplet") bad("grid", 'Expected "16th" or "triplet".');
  if (!Number.isInteger(input.cycleLength) || (input.cycleLength as number) < 1) {
    bad("cycleLength", "Expected a positive integer.");
  }
  if (typeof input.loop !== "boolean") bad("loop", "Expected a boolean.");
  if (input.pas !== undefined && !Number.isInteger(input.pas)) bad("pas", "Expected an integer.");

  if (!Array.isArray(input.steps) || input.steps.length === 0) {
    bad("steps", "Expected a non-empty array.");
  } else {
    input.steps.forEach((s, i) => checkStepShape(s, `steps[${i}]`, true, r));
  }

  if (input.tihai !== undefined) {
    const t = input.tihai;
    if (!isObj(t)) {
      bad("tihai", "Expected an object.");
    } else {
      for (const k of ["leadIn", "phraseLength", "gapLength"]) {
        if (!Number.isInteger(t[k]) || (t[k] as number) < 0) bad(`tihai.${k}`, "Expected a non-negative integer.");
      }
      if (!Array.isArray(t.phrase) || t.phrase.length === 0) {
        bad("tihai.phrase", "Expected a non-empty array.");
      } else {
        t.phrase.forEach((s, i) => checkStepShape(s, `tihai.phrase[${i}]`, false, r));
      }
    }
  }
  return r.issues.length === before;
}

function checkStepShape(s: unknown, path: string, positioned: boolean, r: Report) {
  const bad = (p: string, msg: string) => r.error("structure", `${path}${p}`, msg);
  if (!isObj(s)) return bad("", "Expected a step object.");
  if (typeof s.id !== "string") bad(".id", "Expected a string.");
  if (positioned) {
    if (!GRID_LABELS.includes(s.grid as string)) bad(".grid", `Expected one of ${GRID_LABELS.join(" ")}.`);
    if (s.rep !== undefined && ![1, 2, 3, "gap", null].includes(s.rep as never)) {
      bad(".rep", 'Expected 1, 2, 3, "gap" or null.');
    }
  } else if (s.grid !== undefined || s.rep !== undefined) {
    bad("", "Phrase steps have no grid or rep.");
  }
  if (!VELOCITIES.includes(s.velocity as string)) bad(".velocity", "Expected X . % or -.");

  const g = s.grace;
  if (!isObj(g) || !["none", "g", "gg"].includes(g.type as string)) {
    bad(".grace", 'Expected { type: "none" | "g" | "gg" }.');
  } else {
    const want = g.type === "none" ? 0 : g.type === "g" ? 1 : 2;
    if (want === 0 && g.notes !== undefined) bad(".grace.notes", 'Grace "none" has no notes.');
    if (want > 0) {
      if (!Array.isArray(g.notes) || g.notes.length !== want) {
        bad(".grace.notes", `Grace "${g.type}" needs exactly ${want} note(s).`);
      } else {
        g.notes.forEach((n, i) => {
          const p = `.grace.notes[${i}]`;
          if (!isObj(n)) return bad(p, "Expected a grace note object.");
          if (!HANDS.includes(n.hand as string)) bad(`${p}.hand`, "Expected R or L.");
          if (n.finger !== "1" && n.finger !== "2") bad(`${p}.finger`, "Grace notes use finger 1 or 2.");
          if (!ZONES.includes(n.zone as string)) bad(`${p}.zone`, "Expected O or C.");
        });
      }
    }
  }

  const p = s.primary;
  if (p === null) return;
  if (!isObj(p)) return bad(".primary", "Expected a stroke object or null.");
  if (!HANDS.includes(p.hand as string)) bad(".primary.hand", "Expected R or L.");
  if (!FINGERS.includes(p.finger as string)) bad(".primary.finger", "Expected 1, 2 or B.");
  if (!ZONES.includes(p.zone as string)) bad(".primary.zone", "Expected O or C.");
  if (p.release !== undefined && p.release !== "lift" && p.release !== "stay") {
    bad(".primary.release", 'Expected "lift" or "stay".');
  }
  if (p.splitZone !== undefined && p.splitZone !== "split-vector" && p.splitZone !== "inverted-tap-to-crack") {
    bad(".primary.splitZone", 'Expected "split-vector" or "inverted-tap-to-crack".');
  }
}

// ---------------------------------------------------------------------------
// Step ids: "01", "02", ... in order, with optional "a"/"b" halves.

const STEP_ID = /^(\d{2,})([ab]?)$/;

function parseId(id: string): { n: number; half: "" | "a" | "b" } | null {
  const m = STEP_ID.exec(id);
  return m ? { n: Number(m[1]), half: m[2] as "" | "a" | "b" } : null;
}

/** Whole-step number of a step id ("05b" -> 5). Assumes the id was checked. */
function stepNumber(id: string): number {
  return parseId(id)?.n ?? NaN;
}

/**
 * Ids must run 01, 02, 03... with no gaps. A split step is "a" then "b".
 * `expected` is the number of whole steps; a tihai may add one SAM step.
 */
function checkStepIds(steps: AnyStep[], path: string, r: Report, expected: number, allowSam: boolean) {
  let next = 1;
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i]!;
    const p = `${path}[${i}].id`;
    const id = parseId(s.id);
    if (!id) {
      r.error("step-id", p, `"${s.id}" is not a step id like "01" or "01a".`, s.id);
      return;
    }
    const want = String(next).padStart(2, "0");
    if (id.half === "") {
      if (id.n !== next) return r.error("step-id", p, `Expected step ${want}, found ${s.id}.`, s.id);
    } else if (id.half === "a") {
      const b = steps[i + 1];
      if (id.n !== next || b?.id !== `${want}b`) {
        return r.error("step-id", p, `Split step ${want}a must be followed by ${want}b.`, s.id);
      }
      i++;
    } else {
      return r.error("step-id", p, `${s.id} has no matching ${want}a before it.`, s.id);
    }
    next++;
  }
  const found = next - 1;
  const ok = found === expected || (allowSam && found === expected + 1);
  if (!ok) {
    r.error("step-id", path, `Cycle length is N = ${expected} but the grid has ${found} whole steps.`);
  }
}

// ---------------------------------------------------------------------------
// Grid labels. Assumes 4 beats per bar (every grid in the book so far).

const PARTIALS: Record<GridType, GridLabel[]> = {
  "16th": ["e", "&", "a"],
  triplet: [".", "."],
};

export function expectedGridLabel(grid: GridType, stepId: string): GridLabel {
  const { n, half } = parseId(stepId)!;
  const perBeat = PARTIALS[grid].length + 1;
  const pos = (n - 1) % perBeat;
  const beat = (Math.floor((n - 1) / perBeat) % 4) + 1;
  const whole = pos === 0 ? (String(beat) as GridLabel) : PARTIALS[grid][pos - 1]!;
  return half === "b" ? "." : whole;
}

function checkGrid(rud: Rudiment, r: Report) {
  rud.steps.forEach((s, i) => {
    if (!parseId(s.id)) return;
    const n = stepNumber(s.id);
    const isSam = n === rud.cycleLength + 1;
    const want: GridLabel = isSam ? "SAM" : expectedGridLabel(rud.grid, s.id);
    if (isSam && !rud.tihai) {
      r.error("grid", `steps[${i}].grid`, `Step ${s.id} is past the cycle (N = ${rud.cycleLength}); only a tihai lands on SAM.`, s.id);
    } else if (s.grid !== want) {
      r.error("grid", `steps[${i}].grid`, `Step ${s.id} on a ${rud.grid} grid should be "${want}", found "${s.grid}".`, s.id);
    }
  });
}

// ---------------------------------------------------------------------------
// Per-step notation rules (0.2, 0.4).

function checkStepContent(s: AnyStep, path: string, r: Report) {
  const id = s.id;

  // Rest: no stroke, no grace.
  if (s.velocity === "-") {
    if (s.primary !== null) r.error("velocity", `${path}.primary`, `Step ${id} is a rest [-] but has a stroke.`, id);
    if (s.grace.type !== "none") r.error("grace", `${path}.grace`, `Step ${id} is a rest [-] but has grace notes.`, id);
    return;
  }
  const p = s.primary as Stroke | null;
  if (!p) {
    r.error("velocity", `${path}.primary`, `Step ${id} has velocity [${s.velocity}] but no stroke.`, id);
    return;
  }

  // Velocity sets the zone: [X] is played in Zone O, [.] in Zone C.
  if (s.velocity === "X" && p.zone !== "O") {
    r.error("velocity", `${path}.primary.zone`, `Step ${id}: an accent [X] is played in Zone O, found Zone ${p.zone}.`, id);
  }
  if (s.velocity === "." && p.zone !== "C") {
    r.error("velocity", `${path}.primary.zone`, `Step ${id}: a tap [.] is played in Zone C, found Zone ${p.zone}.`, id);
  }

  // Tremolo [%] is always played as B, and B only means tremolo.
  if ((s.velocity === "%") !== (p.finger === "B")) {
    r.error("buzz", `${path}.primary.finger`, `Step ${id}: tremolo [%] and finger B go together (found [${s.velocity}] on finger ${p.finger}).`, id);
  }
  if (s.velocity === "%" && s.grace.type !== "none") {
    r.error("grace", `${path}.grace`, `Step ${id}: a tremolo [%] takes no grace notes.`, id);
  }

  // Grace notes come from the other hand. A drag fires 2 then 1.
  if (s.grace.type !== "none") {
    const notes = s.grace.notes;
    notes.forEach((g, k) => {
      if (g.hand === p.hand) {
        r.error("grace", `${path}.grace.notes[${k}].hand`, `Step ${id}: grace notes come from the other hand (grace ${g.hand} into primary ${p.hand}).`, id);
      }
      if (g.zone !== "C") {
        r.warn("grace", `${path}.grace.notes[${k}].zone`, `Step ${id}: grace notes are normally dropped in Zone C, found Zone ${g.zone}.`, id);
      }
    });
    if (s.grace.type === "gg") {
      const [a, b] = s.grace.notes;
      if (a.hand !== b.hand) r.error("grace", `${path}.grace.notes`, `Step ${id}: both drag grace notes are played by one hand.`, id);
      if (a.finger !== "2" || b.finger !== "1") {
        r.error("grace", `${path}.grace.notes`, `Step ${id}: a drag fires Finger 2 then Finger 1 (21), found ${a.finger}${b.finger}.`, id);
      }
    }
  }

  // 0.2: O strokes lift immediately; right-hand C (Te) fingers stay down.
  if (p.release === "lift" && p.hand === "R" && p.zone === "C") {
    r.error("release", `${path}.primary.release`, `Step ${id}: right-hand Zone C (Te) fingers stay resting on the syahi. Lifting makes it ring (Tun), which is an error in this system.`, id);
  }
  if (p.release === "stay" && p.zone === "O") {
    r.error("release", `${path}.primary.release`, `Step ${id}: Zone O strokes (${p.hand === "R" ? "Na" : "Ge"}) lift immediately.`, id);
  }
}

/** What the fingers do after a stroke: explicit value, or the zone default. */
export function releaseOf(p: Stroke): "lift" | "stay" {
  return p.release ?? (p.zone === "C" ? "stay" : "lift");
}

// ---------------------------------------------------------------------------
// Golden Law (0.3).
//
// A run is a maximal sequence of primaries on adjacent grid steps played by
// one hand. Rests break a run. Grace notes are ignored (grace exemption),
// so the other hand's graces between two strokes don't break it.
//   length 2 -> fingers 2, 1 on the same zone (the diddle)
//   length 3 -> fingers 1, 2, 1 (the rocker from #05); its 2 -> 1 tail follows the pair rule
//   length 4+ -> not defined by the notation; reported as an error
// A 2 -> 1 pair in different zones must carry splitZone on the Finger-2 stroke.

function checkGoldenLaw(steps: AnyStep[], path: string, loop: boolean, r: Report) {
  type Slot = { i: number; step: AnyStep; p: Stroke | null };
  const slots: Slot[] = steps.map((step, i) => ({ i, step, p: step.primary as Stroke | null }));
  const n = slots.length;

  // Cut point: a step that does not continue a run from the step before it.
  const continues = (k: number) => {
    const prev = slots[(k - 1 + n) % n]!;
    const cur = slots[k]!;
    return !!(prev.p && cur.p && prev.p.hand === cur.p.hand);
  };
  let start = 0;
  if (loop) {
    start = slots.findIndex((_, k) => !continues(k));
    if (start === -1) {
      r.error("golden-law", path, "Every step is the same hand with no rests, so the loop never releases. Not covered by the Golden Law.");
      return;
    }
  }

  const ordered = [...slots.slice(start), ...slots.slice(0, start)];
  const runs: Slot[][] = [];
  let cur: Slot[] = [];
  for (const s of ordered) {
    if (s.p && cur.length > 0 && cur[cur.length - 1]!.p!.hand === s.p.hand) {
      cur.push(s);
    } else {
      if (cur.length) runs.push(cur);
      cur = s.p ? [s] : [];
    }
  }
  if (cur.length) runs.push(cur);

  const splitAllowedAt = new Set<number>();
  const ids = (run: Slot[]) => run.map((s) => s.step.id).join("–");
  const fingers = (run: Slot[]) => run.map((s) => s.p!.finger).join(" ");

  for (const run of runs) {
    const first = run[0]!;
    // Tremolo strokes are already a multi-finger flutter; the diddle rule doesn't apply.
    if (run.some((s) => s.p!.finger === "B")) continue;

    const hand = first.p!.hand;
    if (run.length === 1) {
      if (first.p!.finger === "2") {
        r.warn("golden-law", `${path}[${first.i}].primary.finger`, `Step ${first.step.id}: a single ${hand} stroke on Finger 2. Single strokes normally use Finger 1.`, first.step.id);
      }
      continue;
    }
    if (run.length === 2) {
      if (fingers(run) !== "2 1") {
        r.error("golden-law", `${path}[${first.i}].primary.finger`, `Steps ${ids(run)}: adjacent ${hand} strokes must fire Finger 2 then Finger 1, found ${fingers(run)}.`, first.step.id);
        continue;
      }
      checkPair(run[0]!, run[1]!);
      continue;
    }
    if (run.length === 3) {
      if (fingers(run) !== "1 2 1") {
        r.error("golden-law", `${path}[${first.i}].primary.finger`, `Steps ${ids(run)}: three adjacent ${hand} strokes use the 1 → 2 → 1 rocker, found ${fingers(run)}.`, first.step.id);
        continue;
      }
      checkPair(run[1]!, run[2]!);
      continue;
    }
    r.error("golden-law", `${path}[${first.i}]`, `Steps ${ids(run)}: ${run.length} adjacent ${hand} strokes. The notation only defines runs of 2 (diddle) and 3 (rocker).`, first.step.id);
  }

  function checkPair(a: Slot, b: Slot) {
    const pa = a.p!;
    const pb = b.p!;
    const where = `${path}[${a.i}].primary.splitZone`;
    const label = `Steps ${a.step.id}–${b.step.id}`;
    if (pa.zone === pb.zone) return;
    splitAllowedAt.add(a.i);
    const want = pa.zone === "O" ? "split-vector" : "inverted-tap-to-crack";
    const diag = want === "split-vector" ? "Diagnostic 2, Split-Vector Diddle" : "Diagnostic 4, Inverted Tap-to-Crack";
    if (!pa.splitZone) {
      r.error("golden-law", where, `${label}: the ${pa.hand} diddle lands in Zone ${pa.zone} then Zone ${pb.zone}. The Golden Law needs one zone unless this is the split-zone exception; if intended, set splitZone: "${want}" (${diag}).`, a.step.id);
    } else if (pa.splitZone !== want) {
      r.error("golden-law", where, `${label}: Zone ${pa.zone} → ${pb.zone} is "${want}" (${diag}), not "${pa.splitZone}".`, a.step.id);
    }
  }

  slots.forEach((s) => {
    if (s.p?.splitZone && !splitAllowedAt.has(s.i)) {
      r.error("golden-law", `${path}[${s.i}].primary.splitZone`, `Step ${s.step.id}: splitZone is only for the Finger-2 stroke of a same-hand diddle whose two strokes land in different zones.`, s.step.id);
    }
  });
}

// ---------------------------------------------------------------------------
// Tihai: leadIn + (P + G) + (P + G) + P = landing step = sam (N + 1).

function sameBody(a: StepBody, b: StepBody): boolean {
  const pick = (s: StepBody) => JSON.stringify([s.velocity, s.grace, s.primary]);
  return pick(a) === pick(b);
}

function checkTihai(rud: Rudiment, r: Report) {
  const t = rud.tihai!;
  const P = t.phraseLength;
  const G = t.gapLength;
  const L = t.leadIn;

  // The phrase on its own: ids, length, notation rules, Golden Law (played once, no wrap).
  const before = r.issues.length;
  checkStepIds(t.phrase, "tihai.phrase", r, P, false);
  if (r.issues.length > before) return;
  t.phrase.forEach((s, i) => checkStepContent(s, `tihai.phrase[${i}]`, r));
  checkGoldenLaw(t.phrase, "tihai.phrase", false, r);

  const firstStep = t.phrase[0]!;
  const lastStep = t.phrase[t.phrase.length - 1]!;
  if (firstStep.primary === null) r.error("tihai", "tihai.phrase[0]", "The phrase must start with a stroke (leading rests belong in leadIn).");
  if (lastStep.primary === null) r.error("tihai", `tihai.phrase[${t.phrase.length - 1}]`, "The phrase must end with a stroke: its last stroke is the one that lands on sam (trailing rests belong in gapLength).");

  // The math.
  const landing = L + (P + G) + (P + G) + P;
  const formula = `${L} + (${P} + ${G}) + (${P} + ${G}) + ${P} = ${landing}`;
  const sam = rud.cycleLength + 1;
  if (landing !== sam) {
    const off = landing < sam ? `${sam - landing} step(s) short of sam` : `${landing - sam} step(s) past sam`;
    r.error("tihai", "tihai", `Tihai math: ${formula}, but sam is step ${sam} (N + 1 = ${rud.cycleLength} + 1). The final stroke lands ${off}.`);
    return; // The step-by-step map check would only repeat this error.
  }

  // The full map must be exactly: lead-in rests, Rep 1, gap, Rep 2, gap, Rep 3.
  type Expect = { body: StepBody; rep: Exclude<Step["rep"], undefined>; id: string; what: string };
  const expected: Expect[] = [];
  const rest: StepBody = { velocity: "-", grace: { type: "none" }, primary: null };
  const pad = (n: number, half = "") => String(n).padStart(2, "0") + half;
  let offset = 0;
  for (let k = 1; k <= L; k++) expected.push({ body: rest, rep: null, id: pad(++offset), what: "a lead-in rest" });
  for (const rep of [1, 2, 3] as const) {
    for (const ps of t.phrase) {
      const { n, half } = parseId(ps.id)!;
      expected.push({ body: ps, rep, id: pad(offset + n, half), what: `phrase step ${ps.id} (Rep ${rep})` });
    }
    offset += P;
    if (rep < 3) for (let k = 1; k <= G; k++) expected.push({ body: rest, rep: "gap", id: pad(++offset), what: "a gap rest" });
  }

  if (rud.steps.length !== expected.length) {
    r.error("tihai", "steps", `Tihai map should have ${expected.length} columns (${formula}), found ${rud.steps.length}.`);
  }
  const count = Math.min(rud.steps.length, expected.length);
  for (let i = 0; i < count; i++) {
    const s = rud.steps[i]!;
    const e = expected[i]!;
    const where = `steps[${i}]`;
    if (s.id !== e.id) {
      r.error("tihai", `${where}.id`, `Expected step ${e.id} here, found ${s.id}.`, s.id);
      return;
    }
    if (s.rep !== e.rep) {
      r.error("tihai", `${where}.rep`, `Step ${s.id}: Rep should be ${JSON.stringify(e.rep)}, found ${JSON.stringify(s.rep)}.`, s.id);
    }
    if (!sameBody(s, e.body)) {
      r.error("tihai", where, `Step ${s.id} should match ${e.what}.`, s.id);
    }
  }

  const last = rud.steps[rud.steps.length - 1]!;
  if (stepNumber(last.id) !== landing || last.grid !== "SAM") {
    r.error("tihai", `steps[${rud.steps.length - 1}]`, `The final stroke should be step ${landing} on SAM (${formula}); found step ${last.id} on "${last.grid}".`, last.id);
  }
}
