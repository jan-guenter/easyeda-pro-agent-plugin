# API coverage candidate and remaining acceptance

Candidate snapshot: `0.3.0+codex.20261010135410` on
`feature/api-execution-coverage`. Published and installed as a draft candidate;
this is not a completed connected validation release.

## Local verification

Clean installation used the pinned Node 24.18.0 / npm 11.16.0 toolchain with core
dumps disabled. Full `npm run verify` passed: 1170 facade tests, one existing
platform-specific skip, zero failures, and 424 bridge tests. The suite ran with
hostile inherited descriptors 142/145. Both strict TypeScript checks and all
strict type-aware lint checks had zero diagnostics.

All seven official skill checks, packaged skill checks, plugin/repository
validators, privacy scan, actionlint and offline doctor passed. Dependency audit
reported zero vulnerabilities; 151 registry signatures and 40 attestations
verified. The sanitizer remains 1440 bytes with its original digest and mode.

The maintained manifest binds 138 source files to
`e9917ba6c298676033b7e79b11bf57e91b2510e04cc274580365bc65557b6d67`
and the reproducible three-file runtime bundle to
`c1116e11c613d99e4ef4633efa2badc3af85b3d5faefc446b379d55d7afdd74f`.
External runtime and native implementation pins were not changed. The new SDK
route also verifies the already reviewed UI, project-manager/worker and
schematic implementation files before dispatch and result publication.

These are offline results, not disposable-project live acceptance.

## Publication and installation

Payload commit `5a3279e490795117c257cdbddff088bcdac5e041` is published in
[draft PR #9](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/9).
[GitHub CI run 38058208209](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/38058208209)
passed all required checks, including tests, reproducible bundles, private bridge
fixture, repository checks, packaging and artifact upload. Subsequent root-only
evidence updates leave the plugin payload unchanged.

The official Codex CLI installed and enabled the candidate from the Git
marketplace `https://github.com/jan-guenter/easyeda-pro-agent-plugin.git`, using
the `feature/api-execution-coverage` ref. The marketplace checkout resolves to
the tested payload commit. No manual cache edits were made.

All 459 tracked plugin files, totaling 13280703 bytes, match the installed cache
byte-for-byte with their committed modes. An isolated synthetic-profile probe
launched the cached `.mcp.json` command and verified the pinned Node handoff,
26 tools, seven skills, 774 inventoried method paths, 158 fixed SDK methods,
749/806 declaration signatures and 105/68 design/library schemas. It verified
typed data validation, rejection of caller code and visibility of the new safety
refusals. There was no upstream child, non-stdio socket or live EasyEDA call.

The chat's existing September facade process was neither replaced nor stopped.
Installed-file equality and isolated startup do not prove loaded live admission.
The PR stays draft and the marketplace stays on the candidate ref until the
connected acceptance below is completed; main has not been updated.

## Implemented scope

- A deterministic inventory covers all 774 distinct mounted methods across the
  two pinned declaration snapshots, retaining every overload. It reports 186
  public subsets, 70 native task equivalents, 4 lifecycle-only methods,
  8 implemented-but-blocked methods and 506 omissions. Internal lifecycle
  methods are not standalone caller authority.
- The fixed SDK reader exposes 158 methods with exact argument discovery,
  bounded data projections, runtime/session/context gates, two observations,
  explicit unavailable fields and no automatic retry. It does not accept
  arbitrary methods, JavaScript, callbacks or file transfers.
- Every omission names its blocker and required implementation. There are no
  remaining generic, unreviewed plain-read/pure-calculation classifications.
  Stateful mutations, asset ownership, callback resources, actual installed
  stubs and newer-runtime methods still require the work named in the inventory.
- An ordinary project-symbol metadata candidate has compiler/effect tests but
  is not connected to the live executor. Journal integration and disposable
  saved/reopened/inverse evidence remain required; it is not counted as coverage.
- The reusable disposable reader-validation runner defaults to no dispatch.
  Explicit execution brackets every fixed request with exact document source
  and whole saved-project checkpoint checks, using the already owned facade.

The inventory is not a claim of all-overload support or current-generation live
validation. See [coverage](api-coverage-inventory-2026-10-10.md),
[feasibility](api-execution-feasibility-2026-10-10.md),
[independent review](api-coverage-review-2026-10-10.md) and
[fixture runner](disposable-sdk-validation.md).

## Safety correction

Installed schematic netlist generation can annotate Designator/Unique ID and
invoke Save All. Six existing File-returning export routes also reach hidden
Save All. These are refused before dispatch, including the former exact
schematic-topology reader and topology-dependent schematic transactions.
Simulation export separately requires an unsupported NGSPICE editor.

Historic matching output and persistence tests did not prove absence of those
internal saves. They remain historical evidence, not authority to re-enable
the paths. No user design was opened, edited, saved, restored or inspected to
investigate this finding. No historical operation should be replayed.

## Connected acceptance handoff

The running chat's host-owned facade still loads the September snapshot. The
control skill requires supported fresh-chat pickup after installing an update;
do not kill that owner, patch the cache, change the data root or start a competing
gateway. Installing a candidate does not replace the current process.

After supported pickup:

1. Verify the actual loaded candidate identity, exact tool catalog, reviewed
   external tuple and authenticated session. Stop on drift or an unresolved
   journal. Installed-file equality alone is insufficient.
2. Discover the editor/process state without changing it. Use only explicitly
   identified disposable projects. Do not open, close, save, restore or modify
   the user's production project as a setup shortcut. If switching would require
   a production-project Save/Discard decision, stop and request the user's direction.
3. Establish disposable schematic, symbol, PCB and footprint fixtures through
   maintained setup routes. Capture complete source and checkpoint evidence.
   Existing known disposable fixtures may be used after independently proving
   their identity and current clean recovery state; never replay old edits.
4. Build typed plans from `api sdk-reads` and run the maintained fixture runner
   through the same facade. Cover nonempty primitive families, explicit-ID and
   filtered enumeration, current-project membership, undefined results, units,
   rules, polygons and the pinned mapper limitations. Retain each exact request
   and verified source/checkpoint invariance. No Save is part of reader tests.
5. Diagnose refusals without retrying ambiguous calls. Add source-backed fixes,
   focused regression tests and a new installed snapshot as needed. Revalidate
   only the new required cases under the correctly loaded version.
6. Restore topology only with a reviewed non-mutating compiled-graph adapter
   and fixtures for hierarchy, multipart identity, reused blocks, duplicate or
   missing IDs, disconnected pins and no-connects. Do not weaken the current
   electrical proof or route through the hidden-Save exporter.
7. Integrate remaining feasible writers one transaction family at a time.
   Validate exact effects, complete durable collateral invariance,
   save/close/reopen and supported inverse/recovery on disposable projects.
   Candidate compiler code alone does not authorize dispatch.
8. Publish current-generation evidence, rerun complete local and GitHub checks,
   and merge the candidate only after its declared acceptance is satisfied.

No connected test, completed coverage of every feasible writer, or finished
user request is claimed by this candidate handoff.
