# Pad and Image shape reader batch

2026-10-24. Base main `a9f44a98b80cd257f0ecfdcccb1aae978421ef4d`.
This batch combines two new geometry observations, historical query support,
and the completed preceding selection/relations case. No production design
was opened or edited.

## Completed installed011500 case

The [selection and historical-query case](2026-10-24-011500-connected-selection-queries.md)
completed once through original normal close, retained process/Job termination
and helper release. Two populated Component child lists matched four global
Pad rows. Selection and Arc/String/Dimension/Image were empty-only observations.
Three post-release queries passed exact filtering, requested-ID order and
recorded child/selection projection checks. The closed disposable file remained
byte-exact, with no sidecars. No edit, explicit Save, prompt choice or forced
termination occurred. This case is terminal and must not be replayed.

The preceding release's automatic main CI40050687858 passed. Its earlier
pending statement is preserved in the [011500 handoff](2026-10-24-011500-selection-query-batch.md).
That handoff's terminal publication/install appendix is included in this batch.

## Combined implementation

- `observe-pad-shapes` retains complete supported Pad DTOs and an ordered
  special-style entry for each Pad. It accepts empty groups or the exact native
  top/inner/bottom selector sequence with ELLIPSE/OVAL/RECT shapes. These are
  style groups, not physical-layer expansion. See the
  [Pad source research](2026-10-24-pcb209-pad-special-shapes-research.md).
- `observe-image-shapes` retains Image/Picture placement DTOs and serialized
  vector M/L/A paths or opaque Picture references. Paths retain native units,
  already-applied transforms and serializer losses. References establish no
  asset-byte availability or content. See the
  [Image source research](2026-10-24-pcb209-image-shapes-research.md).
- Both are separate once-only stages under the original209 owner, with strict
  schemas, intent-before-dispatch, fixed native programs, source/context checks
  around awaits and original cleanup after failure. Each uses six local RPCs,
  256 rows and 393216-byte native/final bounds. Existing v1 functions and
  decoded results remain unchanged for historical reconstruction.
- Historical queries now reconstruct each new stage with its original decoder,
  then retain per-ID descriptors and units in returned-ID order. A single parsed
  roster and map avoid repeated whole-roster parsing. Existing snapshot query
  output remains unchanged. These queries make no live call and grant no owner
  or present-state authority.
- All six reader stages fit the unchanged103-request/64MiB diagnostic budget.
  The focused original-owner fixture observes69 CDP requests without ancillary
  frame checks,103 with them. No arbitrary command, expression or larger budget
  was added.

The README remains the short human entry point; reusable instructions live in
the control skill and its task references. Dated evidence and backlog remain
here. No work log was added to AGENTS.md.

## Review and verification

Main review covered both complete fixed programs/decoders, installed native
serializers, typed/native transport, owner retention, lifecycle/journal changes,
historical reconstruction and documentation. Independent review covered the
Pad/Image source contracts and the completed installed011500 case.

The first Image pure run passed4/9 tests. Generated regex escaping made valid
paths refuse. Corrected escaping preserved the strict grammar; all9 then passed.
The first focused integration run passed9/10: its synthetic Image response used
the Pad packet kind, and the Image decoder correctly rejected it. Correcting
that fixture passed the affected check. Original logs remain private. No guard
or test selection was relaxed. Pad's seven pure and two native parity cases
passed. These are offline results, not new-stage connected validation.

Pinned Node24.18.0/npm11.16.0/core0 dependency installation, full dependency
tree, signatures and vulnerability audit passed:151 verified signatures,
42 attestations and zero vulnerabilities. Final unchanged-payload checks,
exact-commit CI, protected publication and official installation follow below.

## Remaining work

1. Finish this combined release and official installation, then admit the actual
   new host in a fresh session. Validate its new readers on disposable data.
   Populated special Pad groups and Image/Picture descriptors need their own
   live cases; empty results cannot qualify those domains.
2. Implement remaining feasible Pad encodings and full image-asset handling.
   NGON has inconsistent installed native semantics; inner-only Pads can fail
   inside the native serializer; special POLYGON groups lack full paths.
   Asset ownership, availability, bytes and bounded decompression are separate
   work. Documented refusals remain in place.
3. Finish pre-open ratline/worker capture, receiver/publication ownership,
   complete live/source/SQL baselines and actor-clock ownership on209.
4. Finish contained writers, disposable creation, consumed Save, close/reopen,
   full peer/SQL checks and operation-specific recovery before enabling editing.
5. Extend schematic/PCB editing, connectivity/rules/routing, component pin-to-pad
   mapping, library assets and manufacturing exports. Hidden annotation/SaveAll
   and native stubs remain explicit omissions. Rendered text/Dimension checks
   and populated precision-edge reader validation are also unfinished.

Continue batching useful changes. Do not replay completed validation cases or
release a new version solely to commit terminal installation receipts.

## Final payload and local checks

Package `0.3.0+codex.20261024022500` freezes640 source files, projection
`5603d8db67ada8b43e9bf892dd9800a1603700712e32c89a38c42e2ad5e08aad`,
and three bundles, projection
`10245e2b529cd38671bc80548e4528a974ce092498bdc6fa91c81330a4ca228f`.
Only the facade projections and review time changed in compatibility metadata;
deep comparison proved all external pins unchanged. The generated inventory
retains835 distinct methods and506 omissions, with391 runtime-guarded routes.
The four added routes extend existing collection/ID methods; they do not
establish public SDK instance-getter execution.

Final local type checks, bridge types/lint, strict type-aware lint, coverage,
sanitizer/native generators, build, compatibility, all-skill, plugin/MCP and
repository/privacy checks passed. All seven installed skill-creator validators
and the available official plugin validator passed. Reproducible committed
bundles and full facade/bridge suites remain required through exact-commit CI.

The final1003912-byte helper SHA-256 is
`b3e1aae0f9197497ef3c85abf6707215b9351b936c547ac9cc18cb649eca9b95`.
Windows `CompileOnly -Layers209` passed once, exit0 with no stderr, empty Job,
pipes checked and no application launched. The helper was unchanged before
and after. Private receipt SHA-256:
`b2f02fa4490c7a6ae492b371a29801dc64c34b989b848696a3fa9f9f612c9692`.
Independent maximal-width request reconstruction stayed within65536 bytes:
Image25576, Pad28455. Neither check is connected reader validation.

The final frozen regression run passed316/316 tests across13 complete affected
files, including the entire lifecycle, owner/pipe/protocol, new readers,
historical queries, registration and coverage. No failures, skips, cancellations
or todo cases occurred. Manifest and both JavaScript bundles matched before
and after. Private summary SHA-256:
`5f5b36bb0e4febe111a224c6ea4280dab74c1c287c1cd45495e9f15d9d18cd9e`.
The complete facade and bridge suites will use exact-commit CI, as allowed by
the repository requirements, instead of a duplicate complete local run.

## Initial CI refusal and correction

The first head `e95511475d285b0e92235f9a730bcccf6cc47677` passed Linux build
verification and Windows compilation/empty-Job checks. Windows CI40054357122
then refused the synthetic suspended-image launch probe. Its separate smoke
script still pinned the previous967711-byte helper and old digest, so it
stopped at the size check before that probe's C# extraction or child creation.
The raw failed workflow log is retained. This head was not merged or installed.

The correction changes only the smoke script's two reviewed size/hash literals
to the already reviewed final helper. The1MiB ceiling and all launch/identity/
termination guards remain unchanged. The existing native regression already
checks both pin consumers; it is now included in the affected local checks,
and the reusable release guide calls out that dependency. No new test or
guard relaxation was needed. Final-head CI must pass separately.
