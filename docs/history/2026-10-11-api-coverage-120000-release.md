# Candidate 120000 published and installed

Candidate `0.3.0+codex.20261011120000` continues draft PR9. The broader API task
is unfinished. Only named disposable projects were used; the production project
and its record were not accessed.

## Implemented changes

- Closed free-PCB creation adds one META-only document with an absent board name,
  original returned UUID, exact worker defaults and unchanged peer proof. It
  neither initializes a canvas nor opens, saves or automatically deletes it.
- Creation and closed PCB/schematic rename now compare checkpoint-bound raw
  per-document record chains. Review demonstrated that the previous materialized
  proof could miss a peer's extra header. Exact repeated/stale/tombstoned records
  are now retained. Peers must be unchanged and the intended target must have
  exactly its independently reconstructed DOCHEAD/META pair or suffix.
  EDIT_HEAD, chunk boundaries and interdocument packaging are not part of this
  per-document commitment. Older prepared rename plans fail closed on rederivation.
- `pcb.text.modify` admits existing top-silkscreen default-font x/y/text changes
  with a complete inverse. Pours, inherited text, other styles/layers/fonts and
  create/delete remain excluded. This is not public String-wrapper parity.
- PCB source merging and physical-stack persistence capture the exact ordinary
  editor frame and receiver. Rechecks around every await prevent a late source
  reply from selecting a different current tab for the write. There is no claim
  of an atomic editor lock.
- Every PCB dispatch pins the reviewed UI. Native acknowledgments are retained
  before post-dispatch implementation verification, including lifecycle manager
  verification that itself checks UI bytes. A failed check never grants replay.
- Bounded journal caches retain resident entries when full and decline new
  admission. Fresh journal/artifact content hashing remains mandatory. Three
  PCB reader coordinators no longer receive a duplicate outer status call;
  their own initial/final runtime and context checks remain.
- Offline library discovery exposes complete execution limits separately from
  structurally valid schemas. Skills document the narrower writers and recovery.

The inventory contains 774 method paths: 192 public subsets, 95 native
equivalents, two lifecycle-only methods, eight blocked methods and 477 omissions.
It has 346 available guarded routes, nine blocked routes and three partially
blocked routes. The package has 175 fixed readers, 26 tools, seven skills,
106 design schemas and 68 library/lifecycle schemas. Counts are not live coverage.

## Disposable evidence

Installed103000 passed Line-only and combined five-family nonempty-net reads,
one track type lookup and two inherited neutral footprint-Line type lookups.
The empty-net inherited lines did not enter the nonempty net result. Root and
independent review accepted all 819 retained inputs, 18 documents, 383 current
records, complete native source/inventory/context and unchanged full SQLite.
The report hash is
`ca219dabd497488f7bf998d12c568e2bf91e1fb39b3c2ddd1ceb084fb8019de3`.
Normal close and the maintained closed-file verifier passed. No Save or writer
ran on this fixture. These cases do not validate nonempty standalone Pad/Arc,
connectivity, public stubs or the new candidate's latency changes.

A separate blank native project now has two ordinary PCBs and one schematic
child page. Native default drawing-frame symbol/device records remain present;
no copy/import/placement was performed. Its strict immutable checkpoint has
10 documents, 69 current records and 86 raw occurrences. Pure preparation of
both rename targets and free-PCB creation passed. The editor closed normally
and the saved state remained exact. Runtime tab/DOM admission and actual writers
remain untested. No installed103000 container rename was dispatched after the
history-proof gap was found. Do not run that older path or replay fixture setup.

## Verification and release state

Local verification passed 3,138 facade tests with one platform-specific skip
and zero failures, plus 424 bridge tests. Both strict type-aware linters and
all type checks have zero diagnostics. Dependency signatures and security
audits, reproducible facade and synthetic bridge builds, compatibility checks,
repository/privacy checks, seven official skill validators, the official plugin
validator, workflow lint and the offline doctor pass. The first full run found
one outdated startup-catalog count, 105 instead of 106. After correcting that
expectation, its focused tests and the complete serial suite passed. No test
or deadline was removed.

The package binds 183 source files to
`af63440d85da4211bf626de595645449daeea771076c7c9a93e6672d7764c32f`
and three runtime files to
`3687ff1bcce31ae380f42b11a9d2eae27a913817c22f96b3d4d2f8dd90b44992`.
The compatibility manifest hash is
`7ea4fa1d08bf9745ad05392b3c6ddb55130f8ed1880e0f6d8356e97969a67f70`.
External runtime pins are unchanged. Independent source reviews accepted the
history, creation, frame-binding, acknowledgment, cache and discovery changes.

Payload `c1182b68c91c7109b4a501d7615b26adbd9b7a12` passed
[CI38137714430](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/38137714430):
3,135 facade tests passed, four platform skips, zero failures, and 424 bridge
tests passed. The checkout log identifies tested merge
`73fb9dba4d7e39a1f2953c953185c0a269916ed5`; its complete tree
`a686776eafd44c646948f839236f5724ac7d2e27` equals the payload tree.

The official Git-marketplace upgrade installed and enabled
`0.3.0+codex.20261011120000` from
`https://github.com/jan-guenter/easyeda-pro-agent-plugin.git`, feature ref
`feature/api-execution-coverage`. The marketplace snapshot equals the payload.
The installer ran with umask022 and returned no errors. All 576 packaged files,
16,011,661 bytes and committed modes match, with no extra files and unchanged
inventory before/after the configured offline probe. Inventory hash:
`a8d588c3bb2b4df8a3a4ed880b0d98e06d57a9bce85e073366e40c3a9690cc3c`.
Installed report hash:
`f6e4583469211d72f9e4a5f1ef2b634d79e6fe0e120a0a4eefe8353577c04348`.

The actual cached bundle's configured startup hands ambient Node26.7.0 to
pinned Node24.18.0. The isolated offline probe checked all coverage rows,
175 fixed readers, 15 native readers, all 68 library capability descriptors,
the 106/68 operation schemas, seven skills and 26 tools. New creation, rename
history and PCB-text restrictions were checked separately from structural
schema acceptance. All 449 process samples show no upstream child or nonstdio
socket; the synthetic upstream sentinel stayed absent and stderr was empty.
This is offline installation evidence, not connected admission or a continuous
system-call trace. No live call followed installation. The old host is intact,
all editors are closed and there is no pending CAD journal.

## Next connected work

Start a fresh Codex chat and reprove the actual package and authenticated
contained editor, as required by the validation-and-release skill. Leave
the old host alone. Use the prepared plain fixture, keep only its other clean
PCB active, and rederive each plan from a fresh complete checkpoint. Run rename
and explicit inverse transactions separately, then closed free-PCB creation.
Do not open targets, Save or infer a returned identity to repair an ambiguous
result. Inspect/reconcile the original journal. Text modification needs its own
simple native-prepared standalone-text fixture and complete save/reopen proof.
Normal contained editor restart can resolve fixture frame state on the same
installed package; it does not require another plugin publication.
