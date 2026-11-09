# Captured utility joins for nested Main frames

The new fixed `current-main-captured-scope-frames.ts` table covers ten nested
Main frame roles. It removes only the `F5` operand from each raw expression and
reconstructs that one legacy tuple slot from the original SQL capture's utility
object. All other operands retain their original order and identity. Old command
literals, tuples, parsers, joins, clocks and absolute request bounds are unchanged.

| Role | Legacy size | Utility slot |
| --- | ---: | ---: |
| driver | 7 | 4 |
| registrationBind | 17 | 11 |
| registrationAfterExec | 8 | 5 |
| registrationOpened | 7 | 4 |
| beginCallback / historyCallback / structureCallback | 8 | 7 |
| beginRun / historyRun / structureRun | 7 | 6 |

The exported immutable rows contain original expression, raw expression, legacy
size, utility index and the fixed readonly normalizer program. Via BEGIN and
history original strings are fixed data with equality checks against the old
protocol exports. The normalizer does not import those protocols, preventing a
cycle when the protocols gain separate raw-frame variants.

Every program uses the unchanged original JOIN helpers. It rechecks the genuine
capture and descriptors, then explicitly ties capture slot 6 to the original
`util.types.isProxy` before calling that function on any raw input. The raw tuple
and object/function elements must be non-Proxy; its array prototype, complete
roster and data descriptor flags must match a dense debugger array. Original
sqlite, Date, Date.now and Date prototype/member operands are compared when
present. Complete original capture/descriptor checks repeat before return.
No application, SQL, Date/clock method, global mutation or resume occurs.

The original capture reference is private provenance required from the owning
runner. Matching capture data cannot grant that provenance. These helpers do not
claim trap-free reflection of an arbitrary Proxy capture. The returned tuple is
a v2 reconstruction for unchanged consumers, not proof that the old ambient-F5
expression executed.

## Readonly source inventory

The pinned app has exactly two AST identifier references to `F5`: its module
`require("util")` at UTF16 offset 1,318,933 and module `F5.promisify` at 1,321,142.
Neither occurs inside a nested function. The module `afterImports` pause can
capture F5 legitimately, so it and its native-member frame remain valid anchors.
The runner retains the original utility at SQL capture slot 4, native isProxy at
slot 6, sqlite at slot 3 and Date/now at slots 9/10. Nested frames must rejoin
these original values instead of relying on an unused module lexical.

Beyond the 23 SQL conditions, six Via frame roles and four driver/registration
roles reference ambient F5. Schematic main BEGIN/history/structure observers
reuse the same Via books and inherit that dependency. The v1 SQL fence also has
14 site frame arrays containing F5, its native-member frame, the seven-element
driver frame and the failure diagnostic. A full fixed-book enumeration gives 26
unique phase/role cases including that diagnostic; the registration book's three
duplicate entries account for 29 enumerated rows. Existing live-history frame
expressions themselves contain no F5 and do not need rewriting, although their
joins retain the same original SQL utility capture.

## Verification and boundary

Two focused Node 24.18.0 tests exercise all ten tuple reconstructions and signed
zero, the unchanged production driver capture/read consumer, raw Proxy trap-zero
refusal, slot-6 replacement hook-zero refusal, accessor-zero refusal, malformed
arrays/extra fields/symbols, sqlite drift and both Date/now drift. Both TypeScript
projects, strict changed-file lint, repository, MCP-contract and all-skill
validation pass for this leaf. The fixture
uses real capture/consumer programs and native Node util/date values with fake
sqlite constructors; it creates no native owner, app, SQLite connection, clock
invocation or original facade provenance. There is no connected proof.

This first source leaf does not mount phases or change Core, pipe, Main runner or
SQL fence files. The six Via raw-frame/rebase variants follow separately. Driver
and registration variants belong to the owning runner integration. No authority,
ceiling, installation, release, CI or CAD state changed.
