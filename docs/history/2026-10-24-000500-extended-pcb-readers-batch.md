# Extended PCB reader batch and handoff

2026-10-24. Based on main
`1363bddb4b9a642cc2ca4d042b5c7f85bafbfc17`; intended plugin version
`0.3.0+codex.20261024000500`. This draft records the combined implementation
before final frozen verification. Publication and installation are pending.
It does not authorize replaying a historical EasyEDA action.

## Combined changes

- Added one original209-owner `observe-extended-primitives` stage for Component,
  Pad, Attribute, Dimension and Image. Two matching ordered projections use
  the retained target, qualified UI/PCB sources and original native receiver.
  One consumed attempt covers 14 local RPCs inside a fixed CDP call; intent,
  result and cleanup remain attached to that original owner.
- Added bounded DTO/ID results, Component metadata presence states and ordered
  Attribute parent groups. Metadata distinguishes absent, own-undefined and
  present strings. Pad geometry/configuration, Dimension canvas units and
  Image placement retain the installed native semantics and documented omissions.
- Integrated the fixed native protocol, helper generation, decoder, lifecycle,
  catalog and operating instructions. The new stage accepts no caller code,
  topics, filters or requested IDs. It preserves the existing transport budget
  and original cleanup paths.
- Added ten guarded routes: unfiltered `getAll` and same-row
  `getAllPrimitiveId` equivalents for the five families. The inventory now has
  383 runtime-guarded routes across 835 distinct methods. These counts describe
  scoped implementations, not complete public API contracts or live validation.
- Updated the dependency lock to body-parser 2.4.0, required qs 6.16.1 and
  fast-uri 3.1.9. All other package versions and direct dependency pins remain
  unchanged; fast-uri notices and the bundled-runtime inventory were updated.

The [extended-reader research](2026-10-24-pcb209-extended-reader-research.md)
records complete source commitments, callback effects, conversions, bounds and
unsupported domains. These are loaded stateWatcher views; empty results cannot
prove an empty board. Component serializers read existing caches and can fail
when cache entries are missing. The reader does not reconstruct missing assets.
All baseline, source-membership, reciprocal-ownership, connectivity, persistence,
execution and Save authority remain false.

The [dependency review](2026-10-24-dependency-advisory-updates.md) records the
new advisories and compatibility changes. The body-parser failure explains the
previous main CI failure despite all eight facade shards passing. Fast-uri
changes malformed-URI rejection and relative-reference normalization; these
changes affect the bundled Ajv dependency and require the combined build.

## Separate installed213000 live result

The previous installed generation completed its four-family primitive reader
on one disposable PCB: Line 1, Via 1, Arc 0 and parentless String 0. Independent
review verified the retained receipts and original normal-close, termination
and helper-release chain. The closed source matched its pre-open commitment.
See the [connected record](2026-10-24-213000-connected-pcb-primitives.md).

That case validates the recorded loaded-view projections only. It does not
validate this new five-family stage, a later bundle, complete model membership,
electrical connectivity or saved-state behavior. No production design was
opened or edited, and no agent Save or prompt choice occurred.

## Verification at this draft

The batch owner reports these focused checks passed: 9 pure-reader tests,
108 native/owner/pipe tests, 11 affected adapter tests, 95 lifecycle/schema tests
and 52 coverage tests. They overlap the required suite and are not summed as
independent coverage. The exact Windows helper compile-only check passed
without launching EasyEDA. The dependency audit reports zero vulnerabilities;
151 registry signatures and 42 attestations verify. Installed dependency files
were checked after a clean, hook-disabled install.

Final frozen types/lint, reproducible build, source/bundle compatibility checks,
required suites, protected GitHub CI, publication and official marketplace
installation remain pending. New payload commitments and terminal results will
be appended after those checks. No connected execution of the extended stage
has occurred.

## Remaining work

1. Finish this batch's frozen verification, protected publication and official
   installation. Admit the actual loaded payload before its first live use.
2. Validate the new five-family stage once in a disposable project, with populated
   families where feasible. Preserve explicit empty-only coverage; populated
   Arc/String and precision-edge cases from the earlier reader remain separate.
3. Implement source-qualified filters, exact requested-ID and selected-object
   reads, Component-to-Pad associations, remaining Pad layer/shape encodings,
   Image assets/full geometry and rendered text/Dimension observations.
4. Finish pre-open ratline/worker capture, receiver and publication ownership,
   complete common live/source/SQL baselines and actor-clock ownership.
5. Implement contained writer destinations and disposable create, consumed Save,
   close/reopen, full peer/SQL checks and operation-specific recovery before
   claiming those editing lifecycles.
6. Extend schematic/PCB editing, connectivity/rules/routing, library pin-to-pad
   mappings and manufacturing exports. Complete catalog geometry/assets,
   linked-asset ownership and bounded encrypted/compressed asset handling.
   Hidden annotation/SaveAll paths and installed native stubs remain omissions.

Further implementation should be batched before another installation requiring
a fresh session. Existing successful observations do not justify replay or
additional Save operations.

## Final freeze

The independent integration review found no blocker in original owner/method
identity, source/target admission, durable intent before dispatch, consumed-stage
behavior, bounded publication, journal linkage or cleanup. No live calls or
extra test campaign were needed for that review.

The pre-freeze full lint check found one direct member access on an awaited test
result. The test now names the result before inspecting it; no lint rule was
relaxed. A documentation correction assigns the empty pad-length singleton
allocation to the Component serializer. These findings preceded the final suite.

Required normal `npm ci`, complete dependency-tree validation, the zero-finding
audit, 151 signatures and 42 attestations passed under Node24.18.0/npm11.16.0
with soft core limit zero. Build, generated-protocol parity and compatibility
passed. External compatibility fields deep-compare equal to the starting commit.
The 636-source projection is
`11f7913cb8fdc5b7c6d151411c9e84564075a2977fc36e01a3ad6e98be2af24a`;
the three-bundle projection is
`84f08b72f2788388e41f7dbad3f1a6d3a212ad0f9eef375188647d1b47ac2a82`.
Final suite results, publication and installation are still pending at this
freeze point. The current host remains installed213000.

## Verification execution policy

Candidate `067b19912da64ca5305bdbd4a90dd6fb9dedffe0` passed every check in
[Linux CI40043582129](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/40043582129)
and [Windows CI40043582185](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/40043582185).
The complete facade suite ran across all eight CI shards, and the complete
bridge suite passed in the build job. The redundant local facade run was still
progressing without reported failures and was intentionally interrupted by
SIGINT to its identified isolated test coordinator. Its log and interruption
receipt are retained privately. Local `npm run verify` is incomplete, not a pass.

Following the user's request to reduce excessive testing, the lasting
verification rule now permits complete suite evidence from exact-final-commit
CI. Independent review confirms unchanged test selection and coverage: every
shard, build and Windows job must pass, source/bundle pins must match, and all
non-suite local checks remain mandatory. CI shard concurrency does not validate
local concurrency4. No runtime guard, test or source/bundle pin changes with
this policy correction. Final CI must run again for the policy/documentation
commit before release; the earlier green commit alone does not satisfy it.
