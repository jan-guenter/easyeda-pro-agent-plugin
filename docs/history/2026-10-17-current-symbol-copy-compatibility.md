# Current symbol copy compatibility corrections

## ASCII title folding

The installed 181500 planner refuses every title containing uppercase `I`,
including unrelated peers. Source-only correction now admits printable ASCII
titles containing `I` when the complete inventory proves the same native rename
decisions under both applicable lowercase alternatives. This is not connected
copy validation or support for arbitrary Unicode titles.

The installed worker was read and independently rehashed before this change:
`assets/pro-mgr/3.2.184.355087e9/js/project-worker.js`, SHA-256
`b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928`.
The [original copy contract](2026-10-17-current-symbol-copy-contract.md) identifies
the pinned installation and the remaining copy effects. Reviewed offsets are
zero-based JavaScript string positions in the UTF-8 decoded worker:

- `l6`, 1371847, increments the final numeric underscore suffix or appends `_1`.
- `ir`, 1372052, checks candidates through its 501st collision, then returns
  an unchecked next candidate. The planner continues to refuse that exhaustion.
- `Ne`, 1845057, uses default-locale `toLocaleLowerCase` in local mode, otherwise
  lowercases the ASCII uppercase runs.
- `getDataByTitle`, 1931780, compares the folded requested title against all
  active symbol titles. `clone`, 1940076, calls `tryRename`; that method uses
  `ir` with `isRename`, which checks `getDataByTitle` result membership.

[Unicode SpecialCasing](https://www.unicode.org/Public/UCD/latest/ucd/SpecialCasing.txt)
defines default `I` to `i` and Turkish/Azeri `I` to dotless `ı`. Its Lithuanian
`I`/`J` alternatives require combining marks, excluded by printable ASCII.
Within the admitted alphabet, this leaves two lowercase alternatives. The model
constructs both inventory sets without reading or assuming the host locale.
It requires uniqueness under both and equal collision booleans for every checked
candidate. By induction from the unchanged source title and locale-independent
suffix transformation, both native alternatives follow the same candidate chain
and return the same unique name. Any disagreement refuses before a result.

The correction preserves the 512-character title bound, 4,096-title inventory
limit, 1 MiB aggregate title bound, exact source membership, duplicate refusal,
501-candidate search bound and original data-entry checks. Non-ASCII names remain
unsupported. Numeric `Infinity` suffixes formerly failed the uppercase-I rule;
an explicit finite-number check retains that refusal instead of accidentally
expanding numeric support while admitting uppercase titles.

Validation on pinned Node 24.18.0 with core limit zero: all ten direct naming
tests passed. They cover accepted uppercase source/peer titles, representative
`en`/`tr`/`az`/`lt` native lowercase behavior, collision disagreement in both
directions and at the last checked candidate, duplicate inventories and retained
limits. Changed-file strict type-aware Oxlint and project no-emit TypeScript
passed. The initial lint attempt found one lowercase continuation comment; that
comment was corrected before the clean run. No bundle, compatibility pin,
version, installed cache, fixture or live runtime was changed by this subtask.

## Document-level element numbering counters

The installed 181500 copy planner also rejects `ELE_PLACEHOLDER` rows. These
are retained native element-numbering counters, not drawing members of a PART.
Removing them would change the copied source. The correction keeps every raw
counter body, ID, ticket and supported first-arrival order. It does not add a
geometry editor or change any existing metadata projection policy.

The same independently hashed worker establishes the copy path:

- `getCanvasByConsistency`, 2146197, excludes metadata records but not element
  placeholders. Its clone call supplies neither `clearDelete` nor `needNum`.
- `compress`, 284133, enters placeholder aggregation only when `clearDelete`
  is set, at 288565. Without it, each stored counter reaches the ordinary raw
  record serializer. The copy path does not aggregate or discard these rows.
- `clone`, 1940076, passes the complete source canvas to `canvasString`, 1938805.
  The new destination has no old canvas. `oO`, 265925, excludes placeholders
  only while processing the old destination, not the incoming source map.
  `Ni`, 266811, emits added rows with their original type, ticket, ID and raw
  body. Existing source lineage headers are regenerated as already modeled.
- `setOrderNum`, 257123, treats a placeholder as a document-level step. It reads
  `dataType` and `max` and advances that family's numbering. It does not read
  a parent or part reference. The native encoder's `onPHolder`, 1314865,
  produces precisely those two fields.

The copy-only validator accepts exactly `dataType` and `max`, with a positive
safe-integer count. Its admitted counter families are ATTR, ELLIPSE, PIN, RECT,
ARC, CIRCLE, POLY, TEXT and BEZIER. Other families, extra fields, part/parent
references, missing or null bodies, tombstones and noninteger/unsafe counts
refuse. PART/CANVAS counters remain outside this subset. Reserving one count
per canvas row plus all admitted placeholder steps conservatively bounds every
native per-family counter within exact integer arithmetic. That is a local
admission bound, not a claim that native numbering uses a global counter.
For SYMBOL the native `TE` helper returns 1, so its initial `TE(type) - 1`
counter is zero. No additional positive initial offset is omitted from the bound.

Both the pre-copy source planner and created-copy saved projection use this
same validator. Ordinary drawing records still require the sole live PART and
their original parent checks. Exact append comparison and both saved-content
alternatives continue to require every counter row; changed, removed or
reordered rows cannot pass by dropping this internal record type.

All evidence here is source review and offline comparison. No new copy was
dispatched and no fixture was changed by this correction.

The corrected isolated plan and created-copy projection files pass all 48 tests
on pinned Node 24.18.0 with core limit zero. They cover unchanged counter rows
through both saved-header alternatives, changed/missing/reordered rows,
unknown fields and families, parent/part fields, tombstones, malformed counts
and aggregate overflow. The first plan-file run passed 11 of 12 tests; its sole
failure was the old assumption that an uppercase-I peer must always refuse.
That fixture now uses non-ASCII text to test the unchanged Unicode restriction.
Changed-file strict type-aware lint and project no-emit TypeScript pass.

An independent maintained-reader comparison of a retained disposable closed
snapshot now completes the pure copy plan with 18 source canvas records,
including four unchanged numbering counters. It uses complete retained SQL
and raw history, not a rewritten drawing or a newly queried live database.
This comparison grants no execution ownership, fresh live-source agreement,
clock qualification or persistence claim.

## Connected observation before release

The actual installed 181500 facade was independently admitted after restart.
Its original retained launcher opened the existing disposable validation project
and its PCB successfully. One exact-target `pcb_PrimitiveString.getAll` call
returned an empty array across two stable native samples. This validates only
the empty loaded-view observation path, not nonempty text fields, selected-ID
lookup, saved ownership or persistence. General String validation remains
unrecorded in discovery until representative evidence is available.

No copy baseline or copy write was attempted with the known-incompatible
181500 planner. No explicit Save, geometry edit, library edit or production
project access was requested. One original-owner normal close completed, followed
by proof that the retained root process and Job terminated. The closed disposable
file remains byte-identical to its prelaunch state. The corrected copy lifecycle still
requires a fresh installed runtime and disposable connected validation.

## Candidate 193000 release checks

Independent review accepted all four source edits, their generated bundle changes
and unchanged external compatibility pins. The package contains 1,339 files,
27,183,722 bytes, 42 directories and seven skills. Its inventory digest is
`c3f5087eaaa44a3c23f6ba647f2a4c06678c0b0c63c28aa55a7f1b567db0972c`.

All seven skills passed the installed skill-creator validator; the official
plugin validator passed. The archived engineering record is byte-exact, with
current instructions kept separately. Repository privacy and whitespace checks
passed. Full release verification and exact-payload GitHub CI must finish before
publication; installation proof is separate from connected copy validation.

## Saved-source handoff correction

Installed193000 was independently admitted and ran one disposable copy. The
native result returned a fresh UUID; normal closure proved the original root
and Job terminated. The complete closed SQL comparison found exactly the
intended new symbol, its two creation tickets and native structure bookkeeping.
The 18 drawing records, including four numbering counters, were preserved;
the source and existing documents were unchanged. No explicit Save ran.

The next `verification-start` request stopped before any verifier slot, launch
or navigation with `Current pre-edit history identity refused.` The saved-source
adapter passed `{projectUuid, branchUuid, symbolUuid}` into a shared decoder
whose contract requires exactly `{projectUuid, branchUuid}`. TypeScript's
structural assignment admitted the extra field, and the earlier test double
incorrectly required the larger object, masking the integration defect.

The adapter now explicitly projects the two history-identity fields. The shared
decoder stays strict; source/destination identity, original owner, SQL and
checkpoint checks are unchanged. A focused regression runs the production
saved-source preparation with synthetic private owners and asserts the exact
decoder input while retaining the source and destination UUIDs. It is offline
evidence, not a replacement live result.

The stopped operation remains stopped, with the copied symbol retained in the
disposable project. No copy, Save, inverse or reopening was retried. Its complete
copy lifecycle is still unvalidated. A fresh installed session can use the new
unused symbol for the separate drawn-symbol metadata workflow after fresh
preparation and all its own gates; it cannot resume this old operation from JSON.
Ordinary drawn-symbol editing remains blocked. Release verification and
installation results are recorded in AGENTS.md.
