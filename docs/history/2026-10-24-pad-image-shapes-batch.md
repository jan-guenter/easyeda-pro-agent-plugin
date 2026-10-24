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

## Terminal publication and installation — 2026-10-24

The corrected final head `93451e921d3cd5785f49c706b94d4f5b66b758aa` passed
[Linux CI40054602278](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/40054602278)
and [Windows CI40054602309](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/40054602309).
All eleven jobs passed. The complete facade suite recorded 12,576 tests:
12,571 passed, five expected mounted-Windows/PowerShell skips, and zero
failures, cancellations or todo cases. The bridge suite passed 424 tests in
28 files. Committed bundle reproducibility, reviewed facade fingerprints,
Windows recovery, all-purpose compilation and suspended synthetic-child
admission passed. Independent comparison checked all 640 source files and
three bundles against committed Git objects. CI summary SHA-256:
`daa3a3d4449dfade5cb4c6e2c94338023286ecac041b7150c0d1e4d9bb812b35`.

The initial Linux run40054357106 was cancelled by the corrective push; all
eight facade shards were cancelled and its aggregate failed. Its successful
build and the first Windows failure remain retained as nonrelease evidence.
After the pin correction, the two existing native/smoke regression files
passed 11/11 checks. No duplicate complete local suite was run.

[PR113](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/113)
merged normally through protected main at 02:46:12 UTC as
`eaa4c9be57c5f9d4bf6438e434009f5e4c99a43c`. The entire merged tree
`71f888eb34e62104bad83c6a300acf2af47c022d` and plugin subtree
`f909a49b2ae6ba82c3f9f2307dd48a7cd39d13da` exactly match the tested head.
Automatic main Windows CI40055553601 passed; automatic Linux CI40055553573
was still running at this receipt. The complete final PR evidence above
qualifies the identical merged payload; do not call the unfinished main run
successful or start another complete local suite to duplicate it.

The official CLI upgraded the existing Git marketplace
`https://github.com/jan-guenter/easyeda-pro-agent-plugin.git` with installer
umask022. It returned no upgrade errors, and its listing confirms
`0.3.0+codex.20261024022500` installed and enabled. The marketplace checkout
HEAD equals merged main; its only untracked entry is the CLI-owned install
marker. A preexisting stale-arg0-directory permission warning remains in the
CLI log. No cache repair, repeated add or manual installed-file edit occurred.

The maintained installed-payload verifier passed all **1,827 files, 42
directories and 39,404,708 bytes**, including exact committed modes. Inventory
SHA-256: `b74f0c08b72a67740155bd1df72c5e7e04f853eb3a433c7fa25e7c14a3a31917`.
Independent post-install hashing reconfirmed the 640-source/three-bundle
projections and manifest `e7b4718edbf6b4a80818bd2dfcffe3f63cfee289110b3ddf15eca535824d644f`.
Private independent receipt SHA-256:
`6fe5300ab45a15303cb1ab71e2a476f7d81322c9d5a0f89855217fc985bd4417`.

One maintained dependency-free offline probe passed 26 tools and ten queries
in its private synthetic legacy profile. Its own child1729808 closed on stdin
EOF with exit0 and no stderr. Two isolation samples found no descendants or
non-stdio sockets; this was not continuous observation. The probe did not
select the live control root or admit the actual host. The actual209 profile
still exposes thirteen tools. Offline probe evidence is retained at
`/tmp/easyeda-installed-offline-probe-8G1a3m`; release receipts are under
`/root/.cache/easyeda-011500-live-20261024-uqlRDznG`.

The original host1708551, parent1707264, start ticks10168818 remains alive
with its011500 command line. Its old working-directory path is now deleted
by official cache pruning; that does not unload its existing code. No host
was killed, rebound or hotpatched. **A fresh session must load and admit22500
before its new live stages are used.** The completed011500 case remains
terminal; no CAD operation, recovery, edit or Save is pending. The excluded production project was not opened or edited.

This terminal appendix is deliberately retained locally for inclusion in the
next grouped change, with publication/install results also recorded on PR113.
It does not justify another release or restart by itself.

## Next grouped work after fresh admission

Publication and installation in remaining-work item1 are complete. First
admit the actual22500 host and validate its new Pad/Image stages on the
disposable fixture. Keep populated special groups and Image/Picture paths
distinct from empty-domain observations. Do not replay the011500 case.

The next useful implementation batch is complete native Arc geometry plus
serialized Poured copper contours, with historical queries. A private source
plan is retained at
`/root/.cache/easyeda-pcb-next-reader-batch-20261024-ij3hemaj/plan.md`, SHA-256
`c282b2960eaa720eff4849282787a48f0f64aac643d1b8d4f8888b02f4f10b26`.
Its final audit correction supersedes its initial provisional rule-reader
recommendation. Current rule getters rewrite shared blind-via `used` flags;
they need an explicit derived-usage refresh contract and partial-failure
handling. No default correction was found on that path. Polygon collection
serializers can create child models/controllers and remain outside passive
reads. Poured serialization can omit an ellipse's second radius, so preserve
its projection limits rather than claiming arbitrary geometric completeness.

The helper has 44,664 bytes left under its unchanged1MiB limit. The private
plan proposes one deterministic, bounded embedded compression mechanism
that preserves exact decompressed program bytes and hashes; its estimated
50,648-byte saving excludes decoder overhead. This is an unimplemented
packaging proposal, not a tested capability or permission to raise limits.
Review and implement it together with the next useful reader batch.

Remaining-work items2–5 above continue to cover assets and unsupported Pad
encodings, writer ownership/baselines, consumed Save and complete reopened
SQL checks, editing/routing/rules, libraries and manufacturing exports. The
maintained inventory records 506 omissions across project/document73,
library57, PCB135, schematic94, system146 and panel1 methods. These include
unavailable vendor methods and stubs; they are not 506 promised feasible
implementations. Per-method reasons remain in `api-coverage.json`.

The first terminal-note repository check rejected a production-project name
in this new appendix. It was removed from the public notes; the original
failed validator log is retained privately. The plugin payload was unaffected.
The corrected repository/privacy, plugin/MCP and all-seven-skill checks passed;
`terminal-doc-validation-final.log` retains those results. PR113's body and
installation comment were updated consistently. Only this terminal history
appendix remains uncommitted for the next grouped change.
