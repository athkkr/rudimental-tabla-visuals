# The Rudimental Tabla — Visuals Plan & Next Steps

*Saved October 25, 2026. Picks up where the book review and revision left off.*

## Where things stand

- **Original draft (Google Doc):** [The Rudimental Tabla - Complete Draft](https://docs.google.com/document/d/1ZuBbKhtcj6_pni2ikek1wYYieV0YU88aj4bG_XuwI1Q/edit) — unchanged.
- **Revised draft (Claude Doc):** [The Rudimental Tabla — Revised Draft](https://claude.ai/artifact/31NN8BL1PQ9VLqD35eeY2V) — all review fixes, gap fixes, and a Rudiment Quick Reference page. Its Revision Notes section logs every change.
- **Open items in the revised draft:** confirm the About the Author details; decide whether to add a bol row to every grid; decide whether to trim Appendix A now that the Quick Reference exists; ask PAS for reprint permission if you still want their official chart in the book.

## The decision

Don't start by drawing visuals. Turn each rudiment and étude into structured data first, then build one renderer that produces the web graphics, print figures, and social videos from that same data.

**Why:** text grids break differently on every platform. The Gemini rendering of #35 showed this — the LaTeX formula ran off a phone screen, and bracketed sub-steps knocked the columns out of line. The text grids should be the source data, not the final visual.

## Visual language

- **Two lanes, one per drum.** Dayan on top, Bayan below, replacing the "Hand" row. Viewers see the high–low melody at a glance — the book's key advantage over a snare.
- **Zone by fill.** Solid = open (O); outline = closed (C). Or two distinct colors.
- **Accent by size.** Large dot = accent; small dot = tap.
- **Grace notes as small dots just before the beat line.** One dot for a flam, two for a drag, so the micro-delay is visible.
- **Finger number inside each dot.** Diddles show a bracketed "2 1" pair.
- **Step grid as faint vertical lines, beat numbers on top.** Reads like a DAW or drum machine, which suits producers.

## One source, three outputs

- **Web / book site:** interactive SVG in React — tempo slider, left/right lead toggle, loop.
- **Print / PDF:** the same component rendered static, exported as vector PDF.
- **YouTube / social:** for now, screen-record the interactive prototype and add audio in any editor. Add Remotion (React rendered to video) later, once you're making videos regularly. Formats: 16:9 for YouTube, 9:16 for Shorts and Reels, 1:1 for feed posts.

## Next steps, in order

1. Define the data schema (time, hand, finger, zone, velocity, grace notes, sub-steps) and convert #35 Single Dragadiddle and the 5.3 Fractured Tihai — the two hardest cases.
2. Build a two-lane SVG renderer as a React component and lock the visual language.
3. Build an interactive web prototype with playhead, tempo and audio. Screen-record it for early YouTube and social posts.
4. Batch-convert the remaining 38 rudiments and the other études.
5. Add Remotion, wrapping the same React component, once you're making videos regularly — not before.

## Where to pick up

Use a coding agent in a real project folder: Claude Code, or Cursor if you prefer an editor. Ask for step 1 only — the schema plus the #35 and Tihai data files, copied from the revised draft. Review the schema before building the renderer; it's the decision that's expensive to change later.
