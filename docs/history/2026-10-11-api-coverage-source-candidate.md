# API coverage source candidate, 2026-10-11

This records the frozen source changes reviewed above commit
`b725a82870cf1d344d1d258c2c3615a607172d78` and their subsequent offline build
verification as `0.3.0+codex.20261011071500`. It is not publication,
installation or connected acceptance evidence. Base release and external
compatibility pins are unchanged. Later release evidence must identify its own
exact package, loaded process and disposable validation results.

The changes are limited to one new native-equivalent reader, a PCB inventory
consumer correction, disabled panel-setting admission and fixed navigation
failure categories. Root separately updated the capability and adapter skill
references to record their boundaries and installed010000 Wire/Bus evidence.
No user project was inspected or
modified to prepare this source review.

## Changes and contracts

`eda.pcb_Layer.getCurrentLayer` is now a native task equivalent. The adapter
correlates the canonical native `ACTIVE_LAYER` identity with the existing
public `getAllLayers` nine-field projection. It checks complete source, context
and fingerprint evidence across two `source / layers / source` cycles. The
installed public `getCurrentLayer` body remains empty and is never invoked.
Noncanonical layer aliases refuse. Bounded color strings remain raw SDK data,
including the pinned serializer's malformed `#a.492f` value. They are not
repaired or certified as CSS. See the [active-layer source report](2026-10-11-pcb-active-layer-reader.md)
for full producer offsets, hashes and limitations.

The PCB net-membership consumer now accepts the actual exact-inventory
component contract: enumeration status, count and IDs. The producer does not
emit component state rows. Source component IDs, complete pad enumeration and
reciprocal component-pad correlation still prove the owners, including padless
components and empty-net component pads. The correction does not infer owner
state from names or prefixes and does not weaken family completeness checks.
Tests exercise the real generated inventory producer, transport decoder and
validator before both membership and type consumers.

One canonical `PANELIZE` record is admitted only when disabled, with one row,
one column, zero spacing and outline-only enabled. All ten source settings and
strict nested structures remain committed. Dormant nested flags do not generate
members. The pinned PCB serializer and `applyPanelize` implementation were
independently inspected: disabled application clears derived panel state and
returns before copies, stamps, borders or marks are generated. The adapter
does not execute that decoder or action. Enabled, malformed, nondefault and
descendant panel state still refuses.

Navigation catches now retain one fixed stage for each native boundary when
upstream execution drops the bridge error code. They discard raw messages,
paths, causes, stacks and coercion/accessor values. Exact existing refusal and
lifecycle-timeout messages remain classified. A timeout still leaves execution
unsettled and requires the existing quarantine/reconciliation path. Open and
Activate are not retried. This improves retained diagnosis; it does not explain
or claim to fix the earlier unclassified native open exception.

## Independent review

The review covered every changed runtime file and the new reader, plus their
integration tests. It traced the component producer's identity-only output into
the complete source/pad-owner checks. It inspected the complete generated
navigation program, stage classifier, upstream error handling tests and
retained-journal tests. It also checked the new SDK route's strict selector,
specialized dispatch, generic-dispatch refusal, offline catalog and exhaustive
coverage classification.

No new actionable runtime defect was found in the frozen changes. A separate
reviewer accepted the complete active-layer module and integration. Review
does not replace the connected checks listed below.

Focused evidence retained before the release dependency-refresh window:

- 354 active-layer, SDK reader/catalog, registered routing and coverage tests
  passed, with no failures or skips. The new active-layer file contains 136 of
  these tests.
- The PCB reviewer reported 355 membership, type and exact-reader tests
  passing after the final panel-setting correction.
- The navigation reviewer reported 48 navigation, project-open and diagnostic
  tests, plus 12 targeted core pipeline tests, passing. The generated native
  failure tests include exceptions after an effect, raw-message suppression,
  retained failure artifacts and unsettled lifecycle timeouts.
- TypeScript checks and strict type-aware lint of edited runtime/test files
  passed with no warnings. The maintained generator verified all 774 method
  paths, and `git diff --check` passed.

These groups can overlap and are not presented as a full-suite total. They are
offline tests. The subsequent full-suite results follow. Installed-package
parity and CI results remain separate evidence.

## Offline release verification

The exact Node 24.18.0 and npm 11.16.0 toolchain ran with zero soft and hard core
limits. Clean `npm ci --ignore-scripts`, the complete dependency tree, 151
registry signatures, 40 attestations and a zero-vulnerability audit passed.
The package manifest and lockfile are unchanged.

Final `npm run verify` passed with inherited descriptors 142 and 145 confirmed
inside Node. It ran 2,803 facade tests: 2,802 passed, one existing platform skip,
zero failures and zero cancellations. All 424 bridge tests passed across 28
files. Both TypeScript configurations, bridge types, strict type-aware lint,
774-path coverage, sanitizer, package checks and seven packaged skills passed.
The standalone repository/privacy validator passed 165 checks, the package
validator 65, and the sequential offline doctor 45. All seven official skill
checks and actionlint passed. The optional official plugin validator is not
installed; maintained plugin/repository checks were still run.

The maintained compatibility updater changed only the facade source/bundle
projections and review timestamp. Full-object comparison after excluding those
two fields proves every external pin unchanged. The source closure contains
167 files with SHA-256
`ccf96ca5134df9abb4289016bc99c2965389cc59f23597d08dddc38eff94d9e6`.
The three-file runtime closure is
`f7e57346975b1b614d9d7761b4b6c322468cfc66f41e5ee5e5c44e628d8b3c3e`.
The final manifest is
`38d485a4739b9df8d35e2edee27a29de975f912fda42e616a74650d4507eba27`.

A separate rebuild exactly reproduced both facade bundles and bundled-license
inventory. The sanitizer retains its original 1440-byte binary and SHA-256
`a8b52e8439bdb479a5621052ab03e9030d67b7948c6e2cc448ee5d7bb1dc9b41`.
Two synthetic private bridge builds with one disposable token were also
byte-identical. No actual local authentication archive or bridge receipt was
changed, and neither test extension was imported.

Three unsuccessful checks remain retained, not overwritten:

- The first full verification stopped on one outdated exhaustive native-reader
  expectation. Its literal set omitted the newly registered active-layer
  reader. One expected string was added, without changing runtime behavior or
  guards. The focused test and the entire verification suite then passed.
- The first synthetic bridge build refused an output directory inside the
  control-data root but outside its reserved build subtree. Only the disposable
  token existed. The output guard ran before token/output acquisition. A new
  private temporary fixture directory, as used by CI, passed both builds.
  No path guard or control-root configuration was changed.
- The first repository check caught a production-project name in a negative
  "not inspected" sentence in the new root-only report. That name was replaced
  with generic wording. Repository/privacy and doctor checks then passed.

Logs use exclusive files with mode 0600 in one private 0700 evidence directory.
These hashes bind both failed and successful attempts.

| Log | Result | SHA-256 |
| --- | --- | --- |
| `01-dependencies.log` | pass | `4919510bf69b2b8bcc5ef9cbffcc1a727f6900e15d822f1f7ce87557a576eb88` |
| `02-build-manifest.log` | pass | `df03e6c9051991706badf89f2988151fe62176758eec7b50dac7453a140be39b` |
| `03-full-verify.log` | stale test expectation | `e8de57e77354e96e88a0ac604afbeaba42a7c651bf54b2661cc9ae6ccbe8b168` |
| `04-official-workflow-checks.log` | pass | `60b7974e09c80cdf7f87b1244b475138f9c73afb3067a34c0dbf1838e8d5295d` |
| `05-native-expectation-focused.log` | pass | `4cfa76798a5c9b763ca8dbac8c9d14431ab5dc6cfc396f4766d0cfccefa4d5c7` |
| `06-full-verify.log` | pass | `fec4d239f07d0e0fd0ec0d3225930a60b81fa9dddcb5bba8c0620617a08a79b7` |
| `07-bridge-reproducibility.log` | output-scope refusal | `f61e104472e58f08bcab65c30f6ed01d3ad8e8821422baa3a76d8e2d19a56da8` |
| `08-bridge-reproducibility.log` | pass | `4f3e09cde011aeefd468dd026dd2d0198d5a01387bf5eb3e3e04e7acb18e2d5d` |
| `09-facade-reproducibility.log` | pass | `ff7891d6843bd7b91549c681940d183656b8a1f1cc399a03bd42bbd9fea5e080` |
| `10-repository-doctor.log` | prose privacy refusal, doctor not reached | `a77fec4921f5cbb355de13fb142bec21338ee489445276c748d74e91779cdc25` |
| `11-repository-doctor.log` | pass | `59d4f8215c7941e229ccc648a00b7affcd6be6de413f0e54b6a428bcce52710e` |

## Frozen runtime identity

Paths below are relative to `plugins/easyeda-pro-control`.

| File | SHA-256 |
| --- | --- |
| `server/src/engine.ts` | `a4601418017b1abf502443a3a895939987006d9b9f43c9c2bb0ac6b44d62f61a` |
| `server/src/index.ts` | `35b8a582918a20e629704dde90b318af1ff9b48632940c68fb5876c504a846dd` |
| `server/src/native-diagnostics.ts` | `865286edaf5a864ca316689f128d42232c13298f69a317b11ef76af9c0949ed9` |
| `server/src/pcb-active-layer-read.ts` | `46bac3f68e1806987aa3b3cc2fd1955bd2c9704a85ab3a49a0a96a06208f46ef` |
| `server/src/pcb-net-membership.ts` | `92a2c0003c9bf5f5c4d261f8eddc9acc55d8e2b64d1ce39daa3f4e011412b26c` |
| `server/src/public-sdk-catalog.ts` | `5e1aafe979e4e3292c38d00a72c6de42cbd2e6b63cf7b3a82499d2c3230e4c4b` |
| `server/src/public-sdk-read.ts` | `a092a4136f0b8c9f624f3fbbb2afd2f085f2b6fcb73f34467259d2b0004f85f6` |
| `server/src/recovery-navigation.ts` | `68ed8d24d3056dfa3942d07995259c13b44458268814cde5794d4e26b415f441` |
| `api-coverage.json` | `33f6068e4ae7fb6d123755c80ea62e2c79785975efd29d335dff284c5fa3d7ba` |

The inventory classifies 193 public subsets, 88 native equivalents, two internal
lifecycle methods, eight blocked methods and 483 omissions. Inventory entries
still grant no execution authority or full-overload support.

## Remaining acceptance and omissions

The changed active-layer and PCB membership coordinators need fresh-generation
disposable execution after supported installation and loaded-runtime admission.
Publication remains held while a separate live selected-ID discrepancy is
investigated. Passing this source/build verification does not resolve its cause
or authorize copying, pasting or editing a design.
The ordinary fixture's public Line inventory includes inherited empty-net
silkscreen children absent from standalone source `LINE` records. Line-filtered
membership and the all-family type lookup therefore remain unsupported for
that case. No prefix inference, filtering away children or invented source rows
may hide this missing ownership proof. Narrower filters still require their
own complete selected-family proof and connected evidence.

Nonempty flat electrical-topology validation remains a separate fixture task.
Historical empty results or synthetic tests do not establish nonempty coverage.
The current disabled-panel and raw-color observations do not authorize any PCB
write, Save, settings change or source restoration.

The remaining 483 omissions retain concrete reasons in the generated inventory.
This source candidate does not claim that every declaration is callable, that
all feasible writers are finished, or that the user's complete request has
reached its final release state.

## Final combined verification after the selection correction

This section supersedes the earlier source-count, runtime-hash and final-check
statements for candidate `0.3.0+codex.20261011071500`. The earlier results and
failed attempts remain historical evidence. They do not cover the selection
adapter added afterward. This section still makes no publication, installation
or connected-admission claim.

The additional correction gives the deprecated
`eda.sch_SelectControl.getSelectedPrimitives_PrimitiveId` a type-1-only explicit
equivalent. It invokes the documented modern public replacement, never the
obsolete iframe route or its false-empty fallback. Native page, project, tab,
receiver and readiness checks surround the await. The bounded unique IDs retain
the replacement's parent-group normalization and are not complete ownership,
physical LINE, source, connectivity or persistence evidence. The
[selection report](2026-10-11-schematic-selection-replacement.md) records the
exact source trace and limitations.

Independent review rehashed the pinned API, UI and schematic bundles and
matched the regression producers to the installed modern handler and legacy
shim. All 292 isolated selection, SDK reader/catalog, diagnostic and native-ID
tests passed. Root and independent review accepted the final module, tests,
authority labels and exhaustive native-reader expectation before rebuilding.

The combined candidate then passed the entire `npm run verify` under Node
24.18.0, npm 11.16.0 and zero soft and hard core limits, with inherited
descriptors 142 and 145. It ran 2,822 facade tests, with 2,821 passes, one existing
platform skip, zero failures and zero cancellations. All 424 bridge tests
passed across 28 files. Strict TypeScript and type-aware lint passed with no
warnings, as did generated coverage, the sanitizer, compatibility checks, seven
packaged skills and all 65 package checks. Separate repository/privacy checks
passed all 165 cases; the sequential offline doctor passed all 45. Seven
official skill validations and actionlint also passed. The optional official
plugin validator remains unavailable.

Dependencies did not change after the earlier clean install and audit, so no
second `npm ci` was run. A standalone rebuild exactly reproduced both bundles
and the bundled-license inventory. Full-object manifest comparison again
proved every external pin unchanged after excluding only facade projections
and review time. The review timestamp is `2026-10-11T07:30:32.315Z`.

| Final artifact | SHA-256 |
| --- | --- |
| Source closure, 168 files | `3201c619f8fc60aa0b6dfe7039abec95d50171babd0fdff0e79ab3706b312eab` |
| Runtime closure, three files | `0e508367f28be20e896e3a37fef53d8e6ef309f6e7c4457049a6e7f1a0a0932c` |
| `reviewed-compatibility.json` | `8f08608f14e2019b1bcd72d6213a9d378709c49e33924fe682b7b6c7d02659a4` |
| `server/dist/server.mjs` | `90c2f3c599fb3ff1fc0684ef49229cdaf4a52356934ec1b96d8a81c86f471c0c` |
| `server/dist/upstream-supervisor.mjs` | `2719bdace1d6e35e26106c6de0507eaf944ee99ff9248a57aa449b9b38230c11` |
| `licenses/bundled-runtime.json` | `9dca8857af721d912309a85d39d6ff176f26019160a34685bfa4d394f9690e3a` |
| `api-coverage.json` | `5099ee45a23fc808b0add709be842ad7aedc8b444a1cb9b9a0953c895522fd19` |
| `server/src/schematic-selection-read.ts` | `1a85df5059411109085faf9e78ad287f2725b0199e78bc0270a7da0f252999f8` |

The generated inventory retains 774 paths: 192 public subsets, 89 native
equivalents, two internal lifecycle methods, eight blocked methods and 483
omissions. The 175 fixed SDK readers include 15 explicit native equivalents.
These counts describe implemented routes, not connected coverage or complete
declared-contract support.

The unchanged bridge and dependencies retain the earlier two-build synthetic
reproducibility evidence. No actual local authentication archive or bridge
receipt was refreshed. The sanitizer remains byte-identical to its earlier
recorded hash.

One additional unsuccessful check is retained. Log 15 stopped before coverage
generation or building because the shell-only core-limit check omitted trailing
whitespace from its regular expression. Node reported zero soft and hard limits.
The check was corrected to the CI row expression; no runtime guard changed.
The subsequent build and complete verification passed in separate exclusive
logs. All logs below are mode 0600 in the same private 0700 evidence directory.

| Log | Result | SHA-256 |
| --- | --- | --- |
| `14-independent-selection-review.log` | 292 tests passed | `2598b9258a9df11ebc56a4f618998566b1b689f8813d03712e7d6e7dbf811bdf` |
| `15-final-build-manifest.log` | shell-only core-limit formatting refusal | `aa961c172dd2a437add2e3841020de7f94bbaefd0b11ae6dbffb131f0163c1a0` |
| `16-final-build-manifest.log` | pass | `a79263c6fd12c2ac3e6bf22771cb0563d81e3c2d903e471b6854c027881bbf60` |
| `17-final-manifest-pins.log` | external pins unchanged | `70e69907e715b64b445708df6bd3a914630c20e8356496afe82c8220e118b4f8` |
| `18-final-full-verify.log` | pass | `996d12e36fd8d8950d2f8e447ce9319d60569cbff544c74388d586686926a88a` |
| `19-final-official-workflow-checks.log` | pass | `fd0ea7459b5ec90857258fbfb07476e902704408568f474266e5683c22444b52` |
| `20-final-facade-reproducibility.log` | pass | `2dd70290be4b8ed1fa4b067123625b5597464fd8a85b10c055a8dd1e203aa2af` |
| `21-final-repository-doctor.log` | pass | `65235024cc11693d87dfdfef712b4f2c129aa8c5cdc1c8386c01e674a4ba6f9f` |

### Connected-validation limits

The selection investigation has a source-backed correction, so the earlier
statement that this discrepancy is still under investigation is historical.
The already-installed modern getter returned the selected component in two
stable samples. That observation does not validate the new deprecated-name
adapter. The exact swallowed branch of the failed legacy call remains unknown.

The new selection and active-layer adapters, and the corrected PCB membership
coordinator, still require fresh-generation disposable execution after
supported installation and loaded-runtime admission. Existing Wire/Bus evidence
belongs to installed010000. Captured PCB source/layer evidence and offline
producer replays do not establish connected execution of the new coordinators.
The inherited-Line ownership omission and pending nonempty flat-topology
validation remain as described above. No new writer, Save, restoration or
fabrication approval follows from these checks. Publication, CI and installed
package parity must be recorded separately against their exact commit.

## Published payload and GitHub verification

Payload `401ef941dd8253203c3721df16061fca902a9861` passed
[GitHub CI 38122060255](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/38122060255).
The actual tested PR merge `db4b12b3bdb7dfa16dec9d62a1db92ec3243d1bb`
has the same tree `a2132bad93057120624c212f31ef70daca30f543` as that payload.
The complete log has SHA-256
`1cc43305b52fddb6b86afbba42caa93431adb53db3d0e76aed289b093db350cf`.

CI reports 2,818 facade passes, four platform skips and zero failures, plus
424 bridge passes. The skips cover a Windows-mounted checkpoint fixture, two
installed-Windows-bundle presence checks, and the Windows desktop diagnostic.
Their producer regressions still ran. Both type-aware linters report zero
warnings and errors. Dependency audits, type checks, source fingerprints,
reproducible bundles and synthetic bridge archive, package/privacy checks and
artifact upload passed. Official Codex validators were absent on the runner;
all seven had passed locally, and maintained CI validators ran.

This is publication and CI evidence only. Installation and actual configured
offline startup still need their separate package-parity proof. No new connected
acceptance follows from CI. The draft PR remains open because the broader API
coverage task is unfinished.

## Installed package verification

The official Git-marketplace upgrade installed and enabled
`0.3.0+codex.20261011071500`. Its marketplace snapshot is the CI-tested payload
`401ef941dd8253203c3721df16061fca902a9861`. The installer inherited umask022;
evidence outputs were created separately under077. No cache edits or owner
termination occurred.

The independently reviewed offline verifier matches all 540 packaged files,
15,264,756 bytes and exact committed modes, without missing or extra files.
It repeats that inventory after probing. Inventory SHA-256 is
`aea6c04ce067d31bf58fbc525bd4ab28452eb15358b0c863b58755b39848b5a2`;
the complete verification report is
`937ca2be790d0b0026505595ad45c47c19864d335ac0b55307deccba5d717229`.
The helper exited successfully with empty stderr.

Actual configured bundled startup hands ambient Node26 to pinned Node24. It
exposes 26 tools, seven skills, 175 fixed readers, 15 explicit equivalents,
all 774 coverage entries, reviewed/latest SDK signatures749/806, and105/68
design/library schemas. Complete paginated catalogs, exact authority and
provenance, valid data, malformed inputs and caller-code refusal pass. Across
330 process observations there is no upstream child or nonstdio socket, and
the synthetic upstream sentinel remains absent. This is a sampled offline
startup proof, not a continuous syscall trace or connected admission.

The old facade remains loaded and was not modified. No live call followed the
upgrade. Fresh Codex pickup is required before connected validation of the new
readers. The broader request remains unfinished.

## Separate disposable import format finding

One native Paste command imported three library assets without placing a
component. Escape ended the tool. No second Paste, placement, wire or Save
followed. Native page snapshots are equal. Normal close and empty process
discovery prove the editor exited without a prompt choice; maintained offline
checkpoint verification proves exact byte, identity and logical-dump equality
with the retained import-only checkpoint.

Root and independent immutable-history review preserve all 73 appended raw
records. All nine existing documents and70records are unchanged. The three
new IDs are disjoint from existing documents. All19symbol and46footprint body
records match the copied source definitions; the single DEVICE record changes
only its two local asset-reference IDs. Exact bookkeeping changes are retained
separately. No source definitions were uploaded or published.

The maintained history decoder still rejects twelve serialized `firstTicket`
headers, including one inherited tombstone. The pinned native worker supports
these fields, but simply allowing or stripping them would lose provenance.
Earliest physical revision, serialized first ticket and cold-import order have
different rules, especially for zero and META. A narrow library-history parser
extension with separately hashed provenance is feasible follow-up work. It
must preserve deleted-record evidence and existing schematic-order refusals.
The raw diagnostic is not maintained after-state materialization, a completed
electrical fixture, nonempty connectivity coverage or a validated writer.
