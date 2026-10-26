// Converts the text grids in docs/test-cases.md into the JSON files in data/.
//
//   node scripts/convert-grids.mjs [source.md] [outDir]   (defaults: docs/test-cases.md data)
//
// Each fenced block that starts with "Step:" is one grid. Compound cells
// (L/R, LL/R, 1/2, 21/1, C/O, CC/C) are split into grace notes plus a primary.
// Metadata (name, cycle length, loop...) and the splitZone tags, which the
// printed grids don't show, are listed per case at the bottom of this file.
// The tests re-run this script and fail if data/ no longer matches.
import fs from "node:fs";
const [src = "docs/test-cases.md", outDir = "data"] = process.argv.slice(2);
const md = fs.readFileSync(src, "utf8");
const blocks = [...md.matchAll(/```\n(Step:[\s\S]*?)```/g)].map((m) => {
  const rows = {};
  for (const line of m[1].trim().split("\n")) {
    const [label, ...cells] = line.trim().split(/\s+/);
    rows[label.replace(":", "")] = cells;
  }
  return rows;
});
const guide = [...md.matchAll(/\*\*Performance Guide:\*\* (.*)/g)].map((m) => m[1].trim());
const formulas = [...md.matchAll(/\*\*System Formula:\*\* (.*)/g)].map((m) => m[1].trim().replace(/\\\[/g, "[").replace(/\\\]/g, "]"));

function body(i, r) {
  const v = r.Vel[i];
  const m = v.match(/^(g{0,2})\[(.)\]$/);
  if (!m) throw new Error("vel " + v);
  const velocity = m[2];
  if (velocity === "-") return { velocity, grace: { type: "none" }, primary: null };
  const split = (s) => (s.includes("/") ? s.split("/") : ["", s]);
  const [gh, ph] = split(r.Hand[i]);
  const [gf, pf] = split(r.Finger[i]);
  const [gz, pz] = split(r.Zone[i]);
  const n = m[1].length;
  if (gh.length !== n || gf.length !== n || gz.length !== n) throw new Error("grace count at " + i);
  const grace = n === 0 ? { type: "none" } : { type: m[1], notes: [...Array(n).keys()].map((k) => ({ hand: gh[k], finger: gf[k], zone: gz[k] })) };
  return { velocity, grace, primary: { hand: ph, finger: pf, zone: pz } };
}
function steps(r, { withGrid = true } = {}) {
  return r.Step.filter((s) => !s.startsWith("(")).map((id, i) => {
    const s = { id };
    if (withGrid) s.grid = r.Grid[i];
    if (r.Rep) s.rep = r.Rep[i] === "-" ? null : r.Rep[i] === "gap" ? "gap" : Number(r.Rep[i]);
    return { ...s, ...body(i, r) };
  });
}
function annotate(list, ids, splitZone) {
  for (const s of list) if (ids.includes(s.id)) s.primary.splitZone = splitZone;
}
function write(name, obj) {
  const { steps: st, tihai, ...rest } = obj;
  const line = (s) => "    " + JSON.stringify(s);
  let out = JSON.stringify(rest, null, 2).replace(/\n}$/, "");
  if (tihai) {
    const { phrase, ...t } = tihai;
    out += ',\n  "tihai": ' + JSON.stringify(t, null, 2).replace(/\n/g, "\n  ").replace(/\n  }$/, "") + ',\n    "phrase": [\n' + phrase.map((s) => "  " + line(s)).join(",\n") + "\n    ]\n  }";
  }
  out += ',\n  "steps": [\n' + st.map(line).join(",\n") + "\n  ]\n}\n";
  fs.writeFileSync(`${outDir}/${name}.json`, out);
}
const base = { schemaVersion: 1 };
// Block order in test-cases.md: #35, tihai phrase, tihai bar1, tihai bar2, #30, #33, #04, #39
const [b35, bPhrase, bBar1, bBar2, b30, b33, b04, b39] = blocks;

const s35 = steps(b35); annotate(s35, ["01a", "05a"], "split-vector");
write("pas-35-single-dragadiddle", { ...base, id: "pas-35", kind: "rudiment", pas: 35, name: "Single Dragadiddle", formula: formulas[0], grid: "16th", cycleLength: 8, loop: true, performanceGuide: guide[0], steps: s35 });

const merged = Object.fromEntries(Object.keys(bBar1).map((k) => [k, [...bBar1[k], ...bBar2[k]]]));
const full = steps(merged); annotate(full, ["06", "17", "28"], "split-vector");
const phrase = steps(bPhrase, { withGrid: false }); annotate(phrase, ["05"], "split-vector");
write("etude-5-3-fractured-tihai", { ...base, id: "etude-5-3", kind: "etude", section: "5.3", name: "The Fractured Tihai", formula: "1 + (10 + 1) + (10 + 1) + 10 = 33", grid: "16th", cycleLength: 32, loop: false, performanceGuide: guide[1], tihai: { leadIn: 1, phraseLength: 10, gapLength: 1, phrase }, steps: full });

write("pas-30-flam-drag", { ...base, id: "pas-30", kind: "rudiment", pas: 30, name: "Flam Drag", formula: formulas[1], grid: "triplet", cycleLength: 12, loop: true, performanceGuide: guide[2], steps: steps(b30) });
write("pas-33-double-drag-tap", { ...base, id: "pas-33", kind: "rudiment", pas: 33, name: "Double Drag Tap", formula: formulas[2], grid: "triplet", cycleLength: 12, loop: true, performanceGuide: guide[3], steps: steps(b33) });
write("pas-04-multiple-bounce-roll", { ...base, id: "pas-04", kind: "rudiment", pas: 4, name: "Multiple Bounce Roll (Buzz Roll)", formula: formulas[3], grid: "16th", cycleLength: 8, loop: true, performanceGuide: guide[4], steps: steps(b04) });
write("pas-39-double-ratamacue", { ...base, id: "pas-39", kind: "rudiment", pas: 39, name: "Double Ratamacue", formula: formulas[4], grid: "triplet", cycleLength: 24, loop: true, performanceGuide: guide[5], steps: steps(b39) });
console.log(`Wrote 6 files to ${outDir}/ from ${blocks.length} grids.`);
