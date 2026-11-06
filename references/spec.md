# Writing the spec

The spec is the single source of truth for every style. Write it in `docs/spec.md` (template: `spec-template.md`)
before drawing anything. In the worked example it is `examples/he-staining/docs/protocol.md`.

## 1. Find the real thing

- **A source the user trusts.** For clinical work, a named textbook and edition, a guideline or a manufacturer's manual.
  For everyday machines, the manufacturer's manual or a standard engineering reference.
- **Read it yourself.** For a PDF: `pdftotext -layout book.pdf book.txt`, then `grep -n` for the topic, then read the
  pages around it. Two-column layouts can interleave lines and drop steps: when a numbered method has a gap, render
  that page (read the PDF page as an image) and read it directly.
- **Write down page numbers.** Every time and quantity gets its source: "Bancroft 8th ed. p. 131, step 8". When the
  source gives a range, pick a value inside it and say so. When it gives nothing, use common practice and mark it
  "typical", so the user can check it.
- **Never invent a clinical number.** If you cannot find it, ask.

## 2. Model the process as stations and steps

- **Stations (or parts):** every place the action happens: a jar, a bath, a tray, a valve, a chamber, a button on a
  device. Each has a number, a short label for the drawing and a full name for the "active" card.
  `ALC 99%` / `99% (absolute) alcohol`; `MAG` / `Magnetron`.
- **Steps:** what a person does, in order; each step is one button and one or more stations. 5 to 9 steps reads well.
- **Forward only.** On screen nothing goes backwards. If the real process returns to a station (rinse in running water
  after three different reagents), draw a separate station for each use. Reviewers notice a rack going back to an
  earlier jar at once, and it is confusing to watch.
- **What moves:** the carrier (a slide rack, a tray, a coin, a cursor of heat), its path between stations, how it enters
  and leaves each one (dip, quick dips, slide in, rotate).
- **Last steps that change scale:** if the last step happens to one item (mounting one slide, pouring one cup), show
  that item leaving the group and the action up close, while the rest wait where they would really wait.

## 3. The window and the look

- **The window** shows the part doing the work, magnified: tissue under the microscope, food in the cavity, blood in a
  tube. Describe how it looks after each step as a small set of named colours or states, so each style can blend
  between them.
- **Results** come from the source ("nuclei blue/black, cytoplasm pink, red cells orange/red").

## 4. Numbers

List every number the page will show (time in each station, total time, temperature, pH, dose) with its source. The
Working Model computes them from a pure function; the other styles read the same table. The total must add up
everywhere ("47 min 10 s" on all three pages).

## 5. Words

- One short note per step for "what is happening", written so a 12-year-old follows it, but with the real terms.
- One "done" line per step.
- A reason for each wrong-order press.
- One big idea.

## 5b. People

If people appear, list the cast in the spec (who each person is, and their role in each step) and every pose that
teaches something, with its source wording ("arms straight, shoulders over the hands", ERC 2025 Fig. 7). Those
become the skeleton's tests and the checks for each illustration (`references/illustrated-people.md`).

## 6. Check it with the user

For clinical subjects, show the station list, the order and the numbers before building. It is far cheaper to fix a
table than three pages and two videos.
