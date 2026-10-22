# PCB clock preparation and String source model

Candidate: `0.3.0+codex.20261018163148`.
This is an implementation record, not connected rename or String-writer proof.

## Closed-clock admission

The former PCB scratch stage nested ten baseline validations, each performing
seven whole-history admission scans, plus two separate scans: 72 in its successful
path. The new path performs four fresh combined admission scans: entry, before
scratch dispatch, after retaining the original return, and before result issuance.
This is a source-derived call-count change, not measured live performance.

Between those boundaries, fixed readers still verify the original capture,
helper, methods, no-dispatch scope, checkpoint, raw copy, file identities and
SQLite sidecar absence. Opening and selected-case journals are rechecked after
each full scan. Only bounded read-only journal checks follow that scan before
dispatch or acceptance. There is no reusable admission token, cache of authority,
caller-selected bypass or change to other baseline callers. External filesystem
writers are not atomically excluded by sequential checks.

One-shot attempts remain consumed on failure. Raw scratch returns are retained
before acceptance checks, including when a new blocker rejects the result.
Review corrected late-await binding and journal-equality gaps before acceptance.

## STRING groundwork

The new offline model preserves complete supplied source, headers, peer bodies,
unknown fields and row order. It correlates all three existing String readers,
uses the actual native rounding/framing and rejects ambiguous ownership/encoding.
Input validation bounds aggregate escaped JSON bytes before serializing compound
observations. It does not establish source provenance, parent ownership, a live
receiver or persistence and explicitly reports `writerSupported:false`.

The current native modify handler overwrites some omitted fields. A later narrow
edit must reconstruct complete native arguments from a verified baseline; sending
only x/y/text is unsafe. The extension-development skill now records this finding.
See [source expressions and limits](2026-10-18-current-pcb-string-source-model.md).

Further source research found that `FileSource({})` can repair shared rules and
delete incomplete differential-pair selectors through the live compiler. It also
omits stored sections and regenerates headers. The method remains disabled; the
next observer work starts with a fixed state/effect preflight, not a transport
wrapper. See the [pinned-source audit](2026-10-18-current-pcb-filesource-observer-research.md).

## Verification and remaining work

Root and independent reviews accepted both source increments. Focused synthetic
tests, types and zero-warning type-aware lint passed. Pinned dependency install,
dependency tree, registry signatures/attestations, vulnerability audit, release
build, compatibility, repository checks and all seven official skill checks
passed. The full verification run passed 11,166 facade tests (four platform skips)
and 424 bridge tests, then failed its skill check on a link crossing the skill
package boundary. That documentation link was corrected; the failed run remains
recorded. Focused final skill/plugin/repository validators and all seven official
skill checks passed afterward. Source, bundles and pins did not change.
Exact-payload GitHub CI and installation remain pending at this
draft. Source455/90a764e8 and runtime3/a10bf36c are sealed;
external compatibility pins and bridge identity are unchanged.

The installed152547 disposable workflow has completed opening, baseline capture
and original normal closure. Inspection returned immediately during a busy phase.
Clock preparation exceeded the MCP response's 600-second limit. Subsequent
inspection still reports busy, without a recorded failed phase. The original
handler is retained; timeout is not cancellation and does not permit replay.
No rename, explicit Save or inverse has been sent. These observations do not
validate this candidate's new clock path.

Remaining work: finish the PCB rename lifecycle; resolve the current exact-frame
observer's rule-repair and completeness blockers, then create a nonempty
disposable String fixture; implement the
separate String-edit and schematic-container rename lifecycles. Broader CAD,
library, routing/rules, ECO/dialog/export and platform/bootstrap work remains
documented backlog. Production designs are excluded.
