# Ordinary schematic baseline: child clocks, library origins and stored sheets

Date: 2026-10-19. This note fixes the offline baseline projection used by the
separate disposable schematic rename lifecycle. It does not record a successful
connected rename, revive an old operation or enable a generic writer.

## Cause

The earlier projection required each active SCH container's direct `DOCHEAD`
time/version to dominate all historical child-sheet clocks. An actual disposable
baseline failed that requirement before any rename. Its retained closed copy has
20 documents, 59 history chunks, one schematic container and two child sheets.
The structure's container clock matches the newest child's clock, while its
direct SCH header is older. That is an expected native state, not sufficient
evidence of an unrelated edit. The private retained copy was inspected using the
maintained complete SQL reader and history decoder; private paths, identities,
titles, account fields and raw records are not copied into this repository.

The public API documents `modifySchematicName` as a name update returning a
promise. It does not specify the internal parent/child clock or durable SQL
relation. Those details require the exact installed implementation.
Source: [official schematic-name method](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_schematic.modifyschematicname.html).

## Pinned native rules

The primary implementation is installed
`pro-mgr/3.2.184.355087e9/js/project-worker.js`, SHA-256
`b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928`.
Offsets below are zero-based UTF-16 source offsets. This file was read as bytes,
not executed or modified.

| Implementation anchor | Observed rule |
| --- | --- |
| Consistency-manager `onDocHead`, 275156 | Invokes header callbacks for each parsed header. Its stored direct header fields advance only for a strictly newer time. Header callback execution is not conditional on replacing that direct header. |
| Base model `ar.setEditData`, 1857162 | Creates missing model metadata, or changes existing update time/version only when the incoming timestamp is strictly greater. Equal times retain the first observed version. |
| SCH `Dg.onDataChange`, 1909909 | Advances the SCH getter's ticket from SCH data records, including tombstones. Child tickets and direct DOCHEAD tickets do not replace that ticket. |
| SCH `Dg.get`, 1911033 | Returns the model's effective time/version and its separate SCH data ticket. |
| SCH_PAGE META callback, 2106505 | After recording a page's parent, propagates that page model's time/version to the parent, covering the first header that preceded parent association. |
| Worker `onHeadChange`, 2119165 | SCH headers update their container. SCH_PAGE headers update the page and propagate the incoming clock to its already-associated parent. |
| Structure `nr.schematic`, near 1810933 | Stores the container model's effective version/update time, not necessarily its direct SCH header. |

The referenced source is below EasyEDA's installed `resources/app/assets`
directory. Hash and offsets distinguish it from a later vendor build; the
existing runtime implementation pins remain unchanged.

## Bounded projection

The corrected model retains two distinct clocks:

- `maximumTargetHeaderTime` comes from the target's direct SCH headers.
- `maximumTargetNativeTime` also includes clocks propagated by historically
  associated ordinary child sheets.

The fold still requires positive monotone per-document header times, identical
versions for equal times within a document, ordinary local page metadata and a
stable historical parent. Every historical page must have an observed parent
that is active in the final complete schematic roster. An absent or inactive
parent, reparenting, inherited source or unsupported record shape refuses.

For those restrictions, every page's retained maximum reaches its stable
parent. Headers after association propagate directly; the first META propagates
the current page maximum after association. Deleted pages remain contributors:
deletion hides membership but does not erase their earlier parent clock. A
deleted parent or missing active parent is not silently omitted. An active
parent that appeared after a child's first association retains the earlier
model clock through native `setEditData`; no later direct header lowers it.

The effective parent time is the maximum of its direct and contributing child
times. The implementation first finds that maximum, then checks all children at
it for identical versions. A different version at the same final maximum
refuses rather than guessing replay order. Lower cross-document ties that are
superseded by a strictly newer clock cannot affect the final projected version.
Per-document ambiguous histories remain refused independently.

The projection still verifies the exact raw SCH header and source hash. Native
peer metadata and every selected structure copy must match the separately
derived effective clock. SCH data tickets retain their original computation.
No clock, version, header, tree row or child record is rewritten during
preparation.

## Write and saved-result boundaries

SQL preparation, exact-time binding and the fixed native writer now require the
new document clock to be strictly greater than both retained clocks. The
complete SQL relation binds the old structure to the original effective native
metadata while separately binding the direct header and source hashes. It no
longer incorrectly requires the old structure to equal the older direct header.

The existing saved-source projection remains exact. It requires the new SCH
clock/version to equal the verified write time, the ticket to equal the original
global maximum plus one, every other container unchanged and the complete child
roster/startup premises unchanged. Saved observations compare those projections,
and later closed SQL must remain completely equal. This fix does not relax
one-shot dispatch, original-reader identity, actor/clock provenance, termination,
upload replay exclusion, permissions or queue/subscriber claims.

## Locally stored ordinary library templates

The next retained-copy refusal came from a blanket nonempty symbol-source
exclusion. Count-only inspection found six active local symbol documents: three
unreferenced ordinary symbols with empty source, and three referenced ordinary
symbols with canonical two-ID library origins. The latter have explicit types
2, 18 and 20, one PART each, and complete local component references. No source
identities or template content are reproduced here.

The same pinned worker's Symbol model records `source` and `docType` exactly
(`_g.onDataChange`, near 1928803). Its getter supplies the exact type and source
or empty string (near 1930636). `getDataByTitle`, near 1931780, resolves local
metadata by normalized title, not by fetching the origin. The worker's general
source parser accepts a pipe-delimited origin (`e6`, 1370431; `Hl`, 1372266), but
this adapter admits only empty source or exactly two lowercase 32-hex IDs
separated by one pipe. Other origin encodings remain unsupported.

Pinned `pro-sch/3.2.192.b79ad524/js/sch-main.js`, SHA-256
`d9d6a955bf40d57daf9f27f31e0fff3191715ff50582418ad0922beb71b424bd`,
contains the relevant consumer: `b6`, 5745153, filters local title-query results
strictly by block-symbol type, not source. `qZe`, 3636930, uses that result to
associate reuse blocks. The ordinary projection uses already-present AST
symbol/pin references (`jZe`, 3632985; `YZe`, 3634893; `WZe`, 3635840), without
an origin lookup. Therefore this bounded admission is for stored provenance on
ordinary templates, not imported schematic/page containers or a template-fetch
capability. Every active type-17 reuse/block symbol still refuses, even with an
empty source or a title that does not currently match a schematic.

Referenced templates must still pass the unchanged shared startup selector:
complete local symbols, supported explicit types, one matching local PART and
the existing component/device/footprint premises. No default type, missing
source, source repair or remote retrieval is inferred.

## Stored sheet shape is not the native getter shape

The private inventory's 26 structure copies each contain two sheet entries,
all without a stored `docType` field. In the pinned worker, `nr.sheet`, near
1811070, projects the sheet model's `docType`; the page's data-change and base
edit-data handlers never assign it. JSON therefore omits that undefined field.
The separate page getter, near 1919022, returns constant type 1.

The executable child-roster preparation now requires the native stored omission
and separately constructs the getter's constant type 1. It does not insert or
normalize a durable field. An explicit stored 1 also refuses: without a native
hydration path that preserves it, the next native tree serialization would
remove it, violating the title-only unchanged-child relation. The generic pure
structure relation continues to preserve optional fields, but that data-only
support does not grant executable lifecycle eligibility.

## Unchanged child title observations

The next refusal exposed a separate policy mix-up: unchanged child title fields
used the container rename writer's no-capital-I restriction. Count-only inspection
found one ordinary printable-ASCII child title containing capital I, and one
without it. There was no non-ASCII title to support a Unicode-domain expansion.

Worker `Ne`, 1845057, chooses either locale lowercasing or ASCII uppercase
replacement. `Fe`, 1654779, selects locale lowercasing for the local desktop.
The page getter at 1919022 returns this normalized title and the exact original
display spelling. SCH `mM`, 5446807, passes those fields into its child AST;
`N1`, 5469012, rebuilds the container without independently renaming children.
Thus the Linux process cannot infer a native locale from the source spelling.

The separate child policy is now explicitly
`ascii-fold-projection-requires-exact-native-match`. It prepares a bounded
printable-ASCII projection, including capital I, without asserting native locale
or normalization. The connected child getter and both original retained ASTs
must each match that complete projection before dispatch. The fixed writer and
saved-result relation continue to require those exact fields. A Turkic dotless-I
result refuses; it is not silently converted or accepted as equivalent. Container
and desired rename titles retain their earlier no-I policy. No child title is
edited, no locale changed and no native spelling inferred from a caller claim.

This is deliberately one conditional observed-output profile, not a claim that
all locales normalize identically. Unicode's Turkish/Azeri and Lithuanian rules
explain why a blanket ASCII-to-native equivalence claim would be wrong.
Sources: [Unicode 17 special casing](https://www.unicode.org/Public/17.0.0/ucd/SpecialCasing.txt),
[ECMAScript locale case transformation](https://tc39.es/ecma402/#sec-transformcase).

## Verification and limits

Synthetic regressions cover first-META propagation, later associated headers,
deleted-child propagation, newer direct clocks, unchanged own data tickets,
stale structures, equal-time conflicting versions and historical reparenting.
A complete synthetic rename/SQL/saved-source relation starts with a child-derived
clock, advances only the intended container and preserves its children and peer.
Another check refuses a proposed write time equal to the effective child clock,
even though it exceeds the direct header.
Additional regressions admit stored canonical ordinary origins for types 2, 18
and 20, reject malformed origins and reuse types, and distinguish omitted stored
sheet type from required native getter type. The complete synthetic saved-result
case combines child-derived time, a locally stored canonical library template
and omitted stored sheet type without changing the child, template or peer.
It also preserves an unchanged capital-I child title under the conditional
ASCII-fold profile. Generated getter/AST readers accept matching ASCII-folded
native-shaped observations and refuse dotless-I, dotted-I, inconsistent ASTs and
an attempted capital-I expansion of the container title policy. Saved observation
comparison separately refuses a changed dotless-I child result.

A separate private read-only diagnostic ran once on the retained disposable
closed copy using fresh original maintained SQL-reader ownership. Its initial
copy/source hashes and stopped-artifact pin passed, and the new metadata
preparation succeeded. The next child-roster step refused an inherited or
block-symbol/reuse template under its existing ordinary-symbol restriction.
The static startup selector and the diagnostic's final invariant checks were
not reached. The private failure output is retained; no lifecycle or writer was
dispatched, and no guard was weakened. That later eligibility blocker is separate
from child-clock projection. Neither the metadata result nor this diagnostic
revives the retired operation. Subsequent direct hash checks matched the source,
copy and stopped artifact. The real journal was first pinned after that failed
diagnostic; this is not evidence of its invariance since retirement.

A distinct diagnostic for the corrected ordinary baseline ran once. The complete
SQL inventory and corrected metadata preparation passed. Child-roster preparation
then refused a stored child title because its then-current contract reused the rename
writer's locale-invariant ASCII restriction. Consequently the static startup and
pure structure-projection steps were not reached; this is not a completed
ordinary-baseline result. Final checks confirmed all four pinned artifacts,
the source, closed copy, stopped artifact and now-pinned real journal, unchanged during
this diagnostic. Its private result is retained. No native actor/time provenance
or continuation of the retired case is claimed.

A third, separately reviewed diagnostic then completed once after the conditional
child-title correction. The maintained complete SQL reader, metadata projection,
complete child roster, static startup premises and pure structure projection all
passed: 20 documents, 59 chunks, one container, two children, three referenced
templates and 26 identical structure copies. Direct header and own data ticket
were preserved, the effective child clock matched, and the synthetic structure
projection preserved both child titles and absent stored document types. All four
before/final artifact pins matched. Its clock was explicitly synthetic, and no
actual native child normalization was observed. This result establishes offline
preparation for the retained copy, not a connected rename or old-case recovery.
A new installed-generation disposable lifecycle is still required for connected
validation.
