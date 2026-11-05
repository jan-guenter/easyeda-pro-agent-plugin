# PCB spatial reader implementation

This unpublished batch starts from main
`f06279f1c13f25812e4a68e5ccfd10c133233dd0`, after the
[PR169 installation and autonomous handoff](2026-11-05-pr169-publication-and-autonomous-handoff.md).
It does not change that installed payload. No CAD application or controller
was launched for this work. Private evidence is retained separately from Git.

The sections before "Source integration continuation" retain the initial work
snapshot. Later sections record the implemented contract and supersede its
in-progress statements.

## Contract and installed source

The official [point getter](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_document.getprimitiveatpoint.html)
describes front-end picking, and the
[region getter](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_document.getprimitivesinregion.html)
distinguishes enclosure from contact through `leftToRight`. These beta contracts
do not establish the installed handlers' effects. The earlier
[feasibility investigation](2026-11-04-cbb-and-pcb-hit-reader-feasibility.md)
retains the point serializer's losses and the region getter's selection writes.

The fixed profile in `current-pcb-209-spatial-source-profile.ts` qualifies the
complete installed `pro-pcb/3.2.195.6b67774e/js/pcb.js`, SHA-256
`a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b`,
plus exact bounded UTF-16 source spans. Its parent application profile is
`3.2.209.8a704eab`. Matching source bytes do not establish a live original owner
or enable a route.

Point capture starts at the original registered point RPC callback, follows
the fixed `rpcService` wrapper's handler, then selects the anonymous module
closure. An exact source-shaped Node 24 inspector extraction observed
`Closure (rZe)`, `Closure`, `Global`, including the otherwise easy-to-miss
registration closure. The standalone decoder test also checks the fixed point
function location using an actual inspector function. These are local V8 tests,
not observations of an embedded EasyEDA execution context.

## Implemented private pieces

The batch contains strict point/region data contracts, passive original callback
and binding capture, fixed function/scope decoders and an original-transport
runner. The runner consumes one attempt, checks its original callbacks/context
around awaits, decodes before a later hook can alter reply aliases, and releases
its original object group before returning data. Source drift, owner drift and
failed release withhold the observation. Independent review found a copied
transport receiver defect; retaining the original receiver and callback
references fixed it. A private-field class regression covers that failure.

The restricted kernel starts with standalone Via scenes, bounded ordered
identities, unchanged observed selection and retained scene descriptors. Region
queries reject objects whose boxes cross the requested boundary. This is a
narrow native task equivalent, not full mathematical intersection or public
SDK instance parity. Other primitive families and incomplete trees refuse.

Native picking also has derived-state effects. Smart mode changes pad selection;
an absent camera/filter manager can initialize state; stale String bounds can
update geometry; R-tree searches can flush pending/empty entries; and normal
visibility reads write the numeric `D0.code` scratch field. Node's real inspector
refuses the source-shaped scratch store under `throwOnSideEffect:true`, including
a same-value store. A callable native path therefore needs explicit source
qualification and bounded scratch effects. An unconditionally successful
zero-existing-state-write claim would be false. Further shared math scratch
qualification remains work in this batch.

## Qualification and integration gates

The proposed function proof uses fixed original references, CDP descriptions
and exact function locations against the already admitted script. V8's
[inspector implementation](https://chromium.googlesource.com/v8/v8/+/1b0eb6cc3e3ced112127f928bd09dea0de605fdc/src/inspector/value-mirror.cc#457)
calls its internal function-description path, avoiding a page override of
`Function.prototype.toString`. Exact descriptions still need a pinned engine
profile and complete replies. Descriptions alone cannot distinguish a function
cloned into another lexical environment, so original script/location checks
remain necessary. Fixed reference identity must be rechecked after qualification
awaits and before each native call.

The complete fixed function catalog exceeds the existing 103-request opening
budget. A separately born spatial purpose with a fixed 256-request limit is
being implemented. No existing owner can gain that purpose or larger budget.
Native reconstruction, complete effects/qualification, original owner wiring,
bounded read batching, journal/schema registration and realistic disposable
geometry remain integration gates. The private reader is not registered in the
MCP/native protocol, and the two SDK methods remain omissions in the released
inventory. Full connected proof and saved/source invariants are not claimed.

The next release will require final non-suite checks, exact-head GitHub CI and
CodeRabbit review. No intermediate version or manual Codex restart is required
for this development work.

## Source integration continuation

The initial 256-request proposal was too small once the complete original
function catalog and opening work were counted. The separate purpose now has
384 total requests, including one reserved original group release. Its fixed
226-function catalog, capture, qualification, sixteen reads and release use 252
requests. The existing complete 103-request opening/source/reproof allowance
gives a 355-request upper bound, with 29 requests of headroom. Existing owners'
103-request limits remain unchanged. The
[transport note](2026-11-05-pcb-spatial-transport-limits.md) records the exact
helper identity, source-file growth and native smoke checks.

Source qualification now models bit-mask scratch, the existing math owner's
four-field box cache, fixed local rectangle scratch and the exact lexical
`BLe.JJ=0` branch. Other scratch scalars remain unchanged. Class parents,
prototype rosters, instance shadows and actual dispatch reference resolution
are checked before the hit calls. These are supported-subset invariants,
not a claim about every possible native geometry branch.

The source-backed Node inspector probe placed the original installed
definitions at their exact original source positions. All 226 real production
function metadata decoders passed, then twelve queries completed with 24 samples
over two Vias. Point queries selected the smaller Via; both region modes kept
the native insertion order. Views, index, layers and other scene holders were
synthetic. No application was opened and no connected proof was claimed.
The complete tuple reply was 357,110 JSON bytes; replacing every handle with
256 ASCII characters produced 409,426 bytes, below the unchanged 1 MiB frame
ceiling. The larger extraction artifact was not the reply-size measurement.

A separate whole-program inspector check found that the passive binding
program's `Object.defineProperty` and `Object.freeze` calls refuse under
`throwOnSideEffect:true`, even for its new private containers. Only that fixed
phase now uses false. The unchanged program then passes; its callback selection,
handler and function-array observations retain true. No vendor getter, callback
or hit routine runs during the binding construction. The read kernel separately
uses false for its explicit scratch effects. Standard renderer intrinsics and
source-defined bindings remain a declared trust assumption, not a verified
hostile-renderer sandbox.

The source now includes a strict `spatial` wrapper on the existing opening
tool, distinct launch/stage journal schemas and one bounded query batch. The
same original controller slot and retirement checks retain custody. Results
publish only after original group release and exact document/query matching;
failed publication can settle retained bytes without replay. Older journal
schemas and formerly broad operation prefixes retain their original authority.
The inventory adds two native equivalents with the narrow limits above, for
46 native equivalents and 481 omissions among the unchanged 835 methods.
Current-generation connected validation remains unrecorded.

The candidate cache version is `0.3.0+codex.20261105182454`; the installed
`0.3.0+codex.20261105085316` snapshot remains unchanged during development.
The first integrated build produced a 12,765,487-byte facade, above the former
12 MiB repository scan ceiling. The facade-only ceiling now matches the
installed verifier's existing 16 MiB bound. Its exact canonical path and reviewed
byte length/SHA remain required, all bytes are still privacy/secret-scanned,
and ordinary files retain their 8 MiB bound. Existing boundary, wrong-path,
wrong-hash and duplicate-review tests cover that contract. This is generated
first-party code growth, not a larger caller input or design-data allowance.

Changing the shared helper also exposed its coupling to the forward-source
generator. A new exact-input adapter reverses only the pinned spatial additions,
then proves the complete original helper hash/size before invoking the unchanged
released forward migration. All three forward-only generated files and their
pins remain byte-identical to main. The original failed build and the later
source-projection proof are retained; no historical transform was repinned or
source gate skipped.

| Retained private proof | SHA-256 |
| --- | --- |
| Real inspector callee qualification | `bc650485dcacbce957ca88e040e0220a4927d85f838c45eea4df421924684063` |
| Whole-program effect-flag comparison | `de8ecad925ffd01179a41e596a081ad453b34756b392ec6c30550699dc52457e` |
| Exact forward-source projection | `37ec1913815e67481b62994935de331743f0f489cc98b6a40f51f8dbe99baa89` |

## Local verification before review

The final local non-suite checks passed: build and generated-program parity,
strict TypeScript, type-aware Oxlint with zero warnings, bridge types/lint,
coverage regeneration checks, compatibility projections, plugin/MCP validation,
repository privacy/package validation and all seven skill validators. Dependency
tree, signature and vulnerability checks also passed. Focused regressions cover
the new readers, capture custody, lifecycle, native bounds and unchanged forward
projection. The full suites will run in exact-commit GitHub CI.

Final inspection corrected an extra trailing source blank line and raised the
synthetic offline catalog budget from 76 to 79 queries for its three new
spatial discovery/validation calls. Earlier check outcomes remain retained; the
final frozen package will be checked separately. No connected spatial result,
publication or installation is claimed by these local checks.
