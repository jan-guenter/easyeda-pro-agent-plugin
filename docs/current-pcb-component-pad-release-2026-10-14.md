# Component and Pad reader release

Candidate: `0.3.0+codex.20261014163000`. Publication and installation are pending.

## Implemented scope

The current PCB identity and geometry tools add four empty-argument native
equivalents: Component and Pad `getAllPrimitiveId` and `getAll`.
Component output contains identity, layer 1/2, position, rotation and lock.
Pad output adds layer 1/2/12, pad number, raw nullable net, metallization and
pad type 0/1/2. Distances use mil and rotation uses degrees without public-wrapper
rounding. The existing exact target, retained receiver, ordered double-sample,
field and response bounds remain. Positive type lookup stays Line/Arc/Via-only.

The [research note](current-pcb-component-pad-research-2026-10-14.md) records
official documentation, installed-source hashes, callback paths and field
semantics. The control skill, offline schemas, tool descriptions and exhaustive
inventory expose the same limits. No new MCP tool is needed.

Opening diagnostics now retain an optional, fixed `upstreamCategory` instead
of collapsing all seven host categories into one label. Old journals still
parse without it. Unknown text stays unclassified; no raw exception text or
private payload is returned. This cannot recover the lost subtype of the
earlier connected failure or change quarantine and retirement requirements.

Inventory remains 774 distinct methods. Four additional guarded routes bring the
route count to 325; 94 blocked and 2 partial routes remain. Distinct-method status
counts do not change because these methods already had older-version adapters.
No external runtime pin, bridge payload, helper, dependency or writer gate changes.

## Connected evidence this round

Installed150000 launched EasyEDA itself and authenticated the bridge. Its shell
observer confirmed only the Start Page. One new opening of the selected disposable
PCB stopped after project dispatch, before document dispatch, with unknown
outcome. The fixed diagnostic reports `open-project` / `decode-result` /
`upstream-failure`; it does not identify the native cause. No explicit Save or
design edit was requested. No layer, identity or geometry call followed it.

The original facade retains the attempt for normal-close and terminal retirement.
Windows Computer Use failed before reaching the application because its
`sandboxCwd` was not accepted as a local file URI. The user was asked to close
EasyEDA normally without selecting Save or Discard. Closure and retirement are
pending; release installation and host restart remain on hold until retirement.
Production designs and their project records were not accessed.

## Remaining work and concrete omissions

- Complete retained-owner retirement of this uncertain opening, then diagnose
  current project-opening failure without replaying the consumed request.
- Validate current layer, identity and geometry readers on an active disposable
  PCB. Offline tests and earlier-generation evidence do not supply that result.
- Component libraries and attributes: the public path enriches native records
  using separate library/path data. The new native projection does not prove it.
- Component child/pin mappings: native serialization rewrites some child IDs
  and mixes pads with vias. Reciprocal ownership needs a separate adapter.
- Pad holes, shapes, mask and thermal rules: callbacks mix units and rounding;
  holeless rotation can be NaN and the public thermal mapper reads the wrong
  record level. These require explicit tagged projections, not blind copying.
- Filters, arbitrary-ID reads and broader type classification remain separate
  contracts. Loaded-view IDs cannot establish complete persisted membership.
- Current writers, native structure-job completion, complete SQL-effect proof,
  lifecycle recovery, library/3D association, ECO and operation-specific export
  implementations remain in the existing backlog. This release does not enable
  them or claim whole-SDK execution support.

## Verification

Focused reader suites pass 13/13; coverage/registration suites pass 35/35;
diagnostic tests pass 3/3. Independent reader review, full typechecking and
zero-warning type-aware lint pass. All 424 bridge tests pass. Dependency
signatures, security audit, sanitizer identity, repository/privacy and all seven
skill validators pass. Full aggregate verification, exact-head GitHub CI and
installed inventory verification remain pending. Their final receipts belong
to this release's pull request.

The initial aggregate found the startup regression's old identity/geometry
catalog counts (5/3). The expected counts are now 7/5; no startup, socket or
authority assertion changed. The corrected focused startup test passes. The
original aggregate retains that failure and is not release acceptance; the
corrected payload requires complete GitHub CI.
