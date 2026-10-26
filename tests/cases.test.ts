import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { Rudiment, Stroke } from "../src/schema/types";
import { validateRudiment } from "../src/schema/validate";

const DATA = join(__dirname, "..", "data");
const files = readdirSync(DATA).filter((f) => f.endsWith(".json")).sort();
const load = (name: string): Rudiment => JSON.parse(readFileSync(join(DATA, name), "utf8"));

/** Deep copy so each negative test can mutate freely. */
const fresh = (name: string): Rudiment => structuredClone(load(name));
const step = (r: Rudiment, id: string) => {
  const s = r.steps.find((x) => x.id === id);
  if (!s) throw new Error(`no step ${id}`);
  return s;
};
const stroke = (r: Rudiment, id: string) => step(r, id).primary as Stroke;
const rules = (r: unknown) => validateRudiment(r).errors.map((e) => e.rule);

describe("the six test cases from docs/test-cases.md", () => {
  it("are all present", () => {
    expect(files).toEqual([
      "etude-5-3-fractured-tihai.json",
      "pas-04-multiple-bounce-roll.json",
      "pas-30-flam-drag.json",
      "pas-33-double-drag-tap.json",
      "pas-35-single-dragadiddle.json",
      "pas-39-double-ratamacue.json",
    ]);
  });

  it.each(files)("%s passes with no errors or warnings", (f) => {
    const res = validateRudiment(load(f));
    expect([...res.errors, ...res.warnings]).toEqual([]);
    expect(res.ok).toBe(true);
  });
});

describe("structure", () => {
  it("rejects a compound event written as a string", () => {
    const r = fresh("pas-33-double-drag-tap.json") as any;
    r.steps[0].primary.hand = "LL/R";
    expect(rules(r)).toContain("structure");
  });

  it("rejects a drag with one grace note", () => {
    const r = fresh("pas-33-double-drag-tap.json") as any;
    r.steps[0].grace.notes.pop();
    expect(rules(r)).toContain("structure");
  });
});

describe("step ids and grid", () => {
  it("rejects a split step without its b half", () => {
    const r = fresh("pas-35-single-dragadiddle.json");
    r.steps.splice(1, 1); // drop 01b
    expect(rules(r)).toContain("step-id");
  });

  it("rejects a cycle length that doesn't match the grid", () => {
    const r = fresh("pas-04-multiple-bounce-roll.json");
    r.cycleLength = 16;
    expect(rules(r)).toContain("step-id");
  });

  it("rejects a misplaced grid label", () => {
    const r = fresh("pas-30-flam-drag.json");
    step(r, "04").grid = "e";
    expect(rules(r)).toContain("grid");
  });
});

describe("velocity, buzz and grace rules", () => {
  it("rejects an accent in Zone C", () => {
    const r = fresh("pas-39-double-ratamacue.json");
    stroke(r, "07").zone = "C";
    expect(rules(r)).toContain("velocity");
  });

  it("rejects a tremolo not played as B", () => {
    const r = fresh("pas-04-multiple-bounce-roll.json");
    stroke(r, "03").finger = "1";
    expect(rules(r)).toContain("buzz");
  });

  it("rejects a grace note from the same hand as the primary", () => {
    const r = fresh("pas-30-flam-drag.json");
    const s = step(r, "01");
    if (s.grace.type === "none") throw new Error("expected a flam");
    s.grace.notes[0].hand = "R";
    expect(rules(r)).toContain("grace");
  });

  it("rejects a drag fired 1 then 2", () => {
    const r = fresh("pas-39-double-ratamacue.json");
    const s = step(r, "01");
    if (s.grace.type !== "gg") throw new Error("expected a drag");
    s.grace.notes = [s.grace.notes[1], s.grace.notes[0]];
    expect(rules(r)).toContain("grace");
  });
});

describe("right-hand Zone C: fingers stay down", () => {
  it("rejects a right-hand Zone C stroke that lifts (Tun)", () => {
    const r = fresh("pas-35-single-dragadiddle.json");
    stroke(r, "03").release = "lift";
    const res = validateRudiment(r);
    expect(res.errors).toHaveLength(1);
    expect(res.errors[0]).toMatchObject({ rule: "release", stepId: "03" });
    expect(res.errors[0]!.message).toMatch(/Tun/);
  });

  it("accepts it when written out as staying down", () => {
    const r = fresh("pas-35-single-dragadiddle.json");
    stroke(r, "03").release = "stay";
    expect(validateRudiment(r).ok).toBe(true);
  });

  it("rejects an open stroke that stays down", () => {
    const r = fresh("pas-39-double-ratamacue.json");
    stroke(r, "07").release = "stay";
    expect(rules(r)).toEqual(["release"]);
  });
});

describe("Golden Law", () => {
  it("rejects one finger bounced twice (R1 R1)", () => {
    const r = fresh("pas-35-single-dragadiddle.json");
    stroke(r, "03").finger = "1";
    expect(rules(r)).toContain("golden-law");
  });

  it("applies across the other hand's grace notes (Tihai step 07 must be Finger 2)", () => {
    const r = fresh("etude-5-3-fractured-tihai.json");
    r.tihai!.phrase[6]!.primary!.finger = "1";
    expect(rules(r)).toContain("golden-law");
  });

  it("wraps around a loop (#33 step 12 into steps 01–02 is a rocker)", () => {
    const r = fresh("pas-33-double-drag-tap.json");
    stroke(r, "12").finger = "2";
    const errs = validateRudiment(r).errors;
    expect(errs.some((e) => e.rule === "golden-law" && e.message.includes("12–01–02"))).toBe(true);
  });

  it("requires the 1-2-1 rocker for three strokes", () => {
    const r = fresh("pas-33-double-drag-tap.json");
    stroke(r, "03").finger = "2";
    stroke(r, "04").finger = "1";
    expect(rules(r)).toContain("golden-law");
  });

  it("lets rests break a run (#39 steps 01 and 04 are both R1)", () => {
    expect(validateRudiment(load("pas-39-double-ratamacue.json")).ok).toBe(true);
  });

  it("rejects a zone change without the split-zone exception", () => {
    const r = fresh("pas-35-single-dragadiddle.json");
    delete stroke(r, "01a").splitZone;
    const errs = validateRudiment(r).errors;
    expect(errs).toHaveLength(1);
    expect(errs[0]!.message).toMatch(/split-vector/);
  });

  it("rejects the wrong split-zone label for the direction", () => {
    const r = fresh("pas-35-single-dragadiddle.json");
    stroke(r, "01a").splitZone = "inverted-tap-to-crack";
    expect(rules(r)).toEqual(["golden-law"]);
  });

  it("rejects a split-zone label on a same-zone diddle", () => {
    const r = fresh("pas-35-single-dragadiddle.json");
    stroke(r, "03").splitZone = "split-vector";
    expect(rules(r)).toEqual(["golden-law"]);
  });
});

describe("tihai math: 1 + (10 + 1) + (10 + 1) + 10 = 33", () => {
  it("lands the final stroke on step 33, SAM", () => {
    const r = load("etude-5-3-fractured-tihai.json");
    const t = r.tihai!;
    expect(t.leadIn + (t.phraseLength + t.gapLength) * 2 + t.phraseLength).toBe(33);
    expect(r.cycleLength + 1).toBe(33);
    const last = r.steps[r.steps.length - 1]!;
    expect(last).toMatchObject({ id: "33", grid: "SAM", rep: 3 });
    expect(last.primary).not.toBeNull();
  });

  it("rejects starting on beat 1 (no lead-in): lands on step 32, one short of sam", () => {
    const r = fresh("etude-5-3-fractured-tihai.json");
    r.tihai!.leadIn = 0;
    const msgs = validateRudiment(r).errors.filter((e) => e.rule === "tihai").map((e) => e.message);
    expect(msgs.join("\n")).toMatch(/0 \+ \(10 \+ 1\) \+ \(10 \+ 1\) \+ 10 = 32, but sam is step 33.*1 step\(s\) short of sam/);
  });

  it("rejects a 2-step gap", () => {
    const r = fresh("etude-5-3-fractured-tihai.json");
    r.tihai!.gapLength = 2;
    expect(rules(r)).toContain("tihai");
  });

  it("rejects a repetition that drifts from the core phrase", () => {
    const r = fresh("etude-5-3-fractured-tihai.json");
    stroke(r, "26").finger = "1"; // Rep 3, phrase step 03
    stroke(r, "27").finger = "1";
    const errs = validateRudiment(r).errors;
    expect(errs.some((e) => e.rule === "tihai" && e.stepId === "26")).toBe(true);
  });

  it("rejects a wrong Rep label", () => {
    const r = fresh("etude-5-3-fractured-tihai.json");
    step(r, "12").rep = 2;
    expect(rules(r)).toEqual(["tihai"]);
  });

  it("rejects a phrase that ends on a rest", () => {
    const r = fresh("etude-5-3-fractured-tihai.json");
    const last = r.tihai!.phrase[9]!;
    Object.assign(last, { velocity: "-", grace: { type: "none" }, primary: null });
    expect(rules(r)).toContain("tihai");
  });
});
