# Daily-engine integration — the plan generator behind the coach surface

`organvm/daily-engine` (private) is a deterministic training/day engine whose
every card is verified by a suite of checked invariants (pain gates on every
card, literal instructions, computed durations, no-repeat rules,
evidence-gated progression) before it renders. This interface is the
partner-facing surface; the engine is the machine that can generate what the
surface delivers.

## The fit

- **Free-plan generation (funnel L2):** capture-form intake → per-client state
  seed → a predicate-checked week of daily cards, rendered for the coach to
  personalize and deliver by hand. The engine composes for whatever the client
  has — mat, gym, garage, pool, outdoors (`context` + `equipment_available`
  are data).
- **Check-in loop (L3):** `open` (readiness) / `log` (session → next-day flag
  decided from evidence) / weekly `review` (progress/hold/deload table the
  coach reads before each conversation).
- **Progression (VIP):** the engine's Rule-8 gate proposes; the coach disposes.

## Boundaries

Per-client data lives in private instance directories owned by the coach's
operation — never in a repo (the engine ships an `audit.sh` firewall proving
its own repo carries no personal data). The engine generates artifacts only:
the coach fires every send, offer, and delivery himself.

## Shipped: the week-one viewer (Field Ops)

The L2 lane is now code on both sides. Engine-side, ONE command produces the
deliverable — `tools/intake_from_form.py` (capture-form answers → intake,
red-flag refusal built in) then `tools/render_week.py` (intake →
`week-one.md` + `week-one.json`, refused entirely if any check fails on any
day). Surface-side, the **Field Ops** terminal renders `week-one.json`:

- `src/weekone.js` — pure renderer; a malformed packet (≠ 7 days, stripped
  stop signals, wrong schema) throws and an error state renders instead — a
  partial plan is never shown as if it were whole. Every field is escaped:
  loaded packets are untrusted input.
- `public/data/demo/week-one.json` — the committed SYNTHETIC demo (see its
  README for the exact deterministic generator command).
- Real client packets load by drag-drop / file picker and render **in this
  browser only** — nothing is uploaded, nothing is stored, client data never
  enters any repo. The boundary above holds by construction.

## Spec

The full instance spec (intake → state mapping, funnel table, starter-pack
plan) lives at `organvm/daily-engine:instances/rob-fitness/INTEGRATION.md`.
