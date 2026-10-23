# Worker startup, callback binding and clock accounting, 2026-10-23

## Scope and starting point

This combined source batch starts at `67a3329503a2f05990b4f1591171ebdcaa0aa83b`
from PR97, following the documentation reorganization and Vitest audit fix. Work is
on `feature/worker-startup-batch-20261023`. Status belongs here, not in `AGENTS.md`
or the human `README.md`. The separate
[integration plan](2026-10-23-worker-startup-integration-plan.md) records the
remaining native-owner wiring.

No EasyEDA MCP tool was called during this batch. No replacement gateway was started,
and no EasyEDA process, project, design, Save, restoration or profile change was
performed. The excluded production project was not inspected, hashed or opened.
Windows compilation below is a no-application smoke, not connected validation.

## Implemented components

- Separate startup transport: waiting-worker attachment, before-script
  instrumentation, complete pinned source qualification and original constructor
  capture. Late worker attachments and breakpoint acknowledgments remain owned
  for cleanup. Ordinary diagnostic no-pause behavior is unchanged.
- Original-construction/current-assignment proof: four PROJECT wrappers and the
  nested debounce wrapper are checked against the retained constructor callbacks,
  their exact source locations and V8 scopes. Twenty fixed requests establish
  this relation; later checks reprove the current PROJECT and wrapper identities.
- Fixed startup wire and generated C# encoder: 35 literal command cases accept
  only bounded identifiers at the native boundary. Arbitrary programs, altered
  effect flags, extra fields and unsupported breakpoint locations are rejected.
  Startup is a separate native purpose, not an upgrade of a diagnostic owner.
- Retained native channel adapter: serialized send, poll, parent-identity and
  termination checks share the original request counter. Strict framed replies
  and observed child sessions retain late allocation evidence. A separate
  callback delivers parent navigation events to their original observer.
- Clock coordinator and ledger: an original native clock, one durable server-time
  reservation/result and the Save clock plan must agree. Missing replies do not
  permit retry. Failure-only historical evidence can be recorded after owner
  loss, without claiming that owner is current or that its RPC was cancelled.

These pieces expose no public writer, clock action, generic debugger or Save
route. Current callback relations do not prove continuous ownership, foreign
subscriber absence, native channel isolation, destination containment, stable
baseline eligibility, queue completion or saved/reopened content.

## Review corrections retained

1. Sequential native placeholder replacement could rewrite an object handle
   resembling a later placeholder. The encoder now concatenates fixed literal
   segments and each identifier once; native smoke covers the collision.
2. A first worker attachment arriving after a lost auto-attach acknowledgment
   could remain waiting after an earlier empty cleanup. The original late
   attachment now receives its once-only release from that waiting state.
3. An extra transport timeout could hide a late construction-breakpoint ID from
   its owning runner. The runner now receives the original pending allocation;
   cleanup retains unresolved breakpoints rather than resuming past them.
4. A pending server-time request whose owner was lost could not append stopped
   evidence. A separate original-instance historical accessor fixes that path;
   successful result admission still requires current ownership.
5. Polling could overlap an original native termination or identity request.
   All native callbacks now share the channel queue. A mistakenly asynchronous
   parent observer is rejected without leaving its Promise rejection unhandled.

## Dependency correction

The initial clean installation exposed one moderate advisory in transitive
`ip-address@10.7.3`, used through `express-rate-limit` and the MCP SDK. The
lockfile changes only that dependency to `10.7.4`, within its existing range.
The maintainer identifies that release as the fix for quadratic IPv6 zone parsing
in [GHSA-rxp7-6hxx-x8q5](https://github.com/beaugunderson/ip-address/security/advisories/GHSA-rxp7-6hxx-x8q5).
No public SDK, EasyEDA, bridge-runtime or dispatcher pin is changed to excuse
an admission failure.

## Verification in progress

The combined candidate version is `0.3.0+codex.20261022222322`. This section does
not claim that it has been published or installed.

Before the combined frozen-payload run, focused startup, assignment and clock
tests passed. The Windows `-CompileOnly -WorkerStartup` helper compiled, checked
its fixed encodings/purpose separation and reported no process launched and an
empty Job. The initial audit failure is retained separately from the patched
zero-vulnerability audit. Final integrated counts and delivery state will be
appended after source freeze.

## Remaining work, in dependency order

1. Integrate a genuine original startup owner and durable launch purpose. Arm it
   before the once-only disposable project opener; retain parent navigation,
   shared CDP IDs, the sole poll owner and cleanup through root/whole-Job exit.
2. Compose startup capture, actor/SQL collectors and the unique native clock on
   that same owner. The current startup and String native switches are mutually
   exclusive and must not be combined to bypass their purpose guards.
3. Prove actual channel/subscriber ownership, ratline completion, filesystem and
   network/upload/replay destinations, and stable full-baseline eligibility.
4. Add the fixed server-time sender, one-create/one-Save dispatch, publication
   collection and original terminal completion. Complete closed SQL, fresh
   reopen and visual checks on an explicitly disposable project.
5. Continue the broader API backlog with concrete omission reasons. The existing
   inventory remains 774 reviewed methods: 212 public subsets, 33 native
   equivalents, 79 blocked implementations and 450 omissions. Component work in
   this batch does not promote a method into connected execution support.
6. Publish/install a coherent verified payload, then admit the actual fresh
   plugin host and matching private bridge. Offline catalogs and no-app native
   compilation cannot replace that live admission.

## Integrated verification observations

The first full run completed 12,268 tests: 12,262 passed, four skipped and two
failed. One failure exposed a real synthetic-fixture read cap: the pinned helper
grew to 711,460 bytes, beyond that fixture's old 655,360-byte bound. The other
assertion still expected the two-purpose native request limit and omitted the
new, separate 256-request startup purpose. These failures are retained; neither
is connected EasyEDA evidence. The corrections preserve exact helper length/hash
admission and test the three-purpose limit and incompatible-switch guard.

The first repository validation also refused the added build command because
its exact script contract was stale. That contract now requires the generated
startup-protocol check and its two fixed commands; repository validation passes.

An initial private archive check found tar preserving group-write modes under
root despite umask022. No probe was launched from that tree. A fresh extraction
with `--no-same-permissions` verified all 1,746 Git files and exact 644/755 modes,
then passed the maintained offline catalog probe: 26 restricted tools, seven
skills, ten offline queries and clean owned-child exit, with no upstream child
or bridge socket. This intermediate package proof precedes the two fixture
corrections above and is not the final installation proof.

PR98 initially published implementation commit
`ca3b11673e6c98185a95c5839026f8675fa4940f`. Windows run39866671873 passed.
Linux run39866671812 exposed the same stale exact-build-script assertion in the
separate MCP-contract validator, after its other build checks passed. The
validator now requires the generated startup check and both fixed generator
commands. Runtime source, native helper, compatibility projections and bundles
remain frozen; this tooling correction does not enable a capability.

The detached package for that initial commit passed the maintained Git-byte/mode
verifier: 1,746 files, 42 directories and 35,798,889 bytes, inventory
`1044cc830292b35dd821d43f55d3171dea9a0d11152b9cb63566d1a15d3f8802`.
Its maintained offline probe passed 26 tools and ten queries; its original child
closed through stdin EOF with exit zero and no stderr. This is package evidence,
not admission of the running host; the tooling correction changes package bytes
and therefore needs a fresh final file comparison.

## Final local verification and handoff preparation

The corrected PR head is `025a8fded0e7fcb35d8567da56024a5707eac35a`.
The second complete local facade run finished 12,268 tests: 12,263 passed,
four skipped and one failed. The remaining unchanged common-packet inspector
test refused in its one-second budget guard during the final UTF-8 length check.
The identical four-test file then passed in isolation. Neither the failure nor
the follow-up is a connected result, and the production guard remains unchanged.
The hosted final shards use their existing concurrency-one setting. Do not call
this local full run green; retain the hosted result separately.

All 424 bridge tests passed. Root and bridge types, strict type-aware lint,
zero-vulnerability audit, 151 registry signatures, 40 attestations, sanitizer,
generated protocol, coverage inventory, repository/privacy, MCP-contract and
all seven installed skill validators passed. Both JavaScript bundles reproduced
byte-for-byte: server `36afb54e5499b63c4de516dd6625868f9735072eb711cd25ef4ea3331ce7b5df`
and supervisor `3fa897fcd3d47c629f3163bdc73aaa866888e927edaacaae90c13b6faaa15574`.
The source projection remains 609 files with digest
`89ed0c8625e33f2d1fc4313e07813acbbe867ddc39cbd30ed59228a17c6e9bd6`.
Final-head Windows run39867384814 passed all three no-application native purpose
smokes and the existing synthetic launch checks.

A read-only receipt check confirmed that the existing private bridge still names
the older 70-file derivative closure `3281712da24240fa4962fd47855795df71878bb651d820e0c73960875bc701f2`.
PR97's reviewed replacement is
`5f22ad229477ccb898ad6502cb47fd67d24171c9bededd330f118b527e4eb204`.
The receipt, existing key epoch, imported extension and running host were not
changed. After installing this batch, use a fresh chat to verify its actual
host, build the matching private bridge with the existing key through the
maintained workflow, and distinguish artifact equality from any required import
and authenticated admission. Do not rewrite the old receipt to claim the new
closure, rotate the key, terminate a host-owned gateway or bypass failed admission.

These appended delivery observations are a local handoff pending the next
documentation batch; they do not change the published plugin payload.

## Delivered payload and next-session entry

[PR98](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/98) merged at
2026-10-22 23:02:28 UTC as `07d84e4d1bc6d324813a0e1f3f9dd6db6b50af81`.
Its complete Git tree `b4ebc1bc1eec07b6091329cf030693698b728625` is identical to
the tested PR head. Final [PR CI39867384614](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/39867384614)
passed the build and all eight shards: 12,268 tests, 12,263 passes, five skips,
zero failures. The unchanged packet case that refused locally passed in CI.
[Windows39867384814](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/39867384814)
also passed. The initial failed/cancelled runs remain historical failures, not
successful attempts.

The official CLI upgraded only `easyeda-pro-agent` from
`https://github.com/jan-guenter/easyeda-pro-agent-plugin.git`, with umask022.
It reported no errors and refreshed the enabled plugin without a redundant add.
The marketplace checkout HEAD equals merged `07d84e4d`.
Installed version is `0.3.0+codex.20261022222322`.

The maintained installed-payload verifier checked every file against that exact
merge commit: 1,746 files, 42 directories, 35,799,158 bytes, expected 644/755 modes
and no extras. Plugin subtree is `5f42b2f6043947ee13fdfb95e2813fd4509a446c`;
inventory SHA256 is
`6d69ba8c46009f4ec501f7e2c25d3880977a47733e6cf57ae8fda1b3acc2875e`.
The installed offline probe passed 26 restricted tools and ten queries using its
own synthetic profile. Its original child219087 closed through stdin EOF with
exit zero, no signal and zero stderr; sampled isolation and post-close checks
passed. This does not admit the actual host or establish continuous isolation.
Private verification logs and final receipt copies are under
`/root/.cache/easyeda-startup-batch-20261023-yl6R64Yx`.

At handoff, automatic [main CI39869135917](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/39869135917)
is still running on that identical tree; main Windows39869135848 has passed.
Check the Linux result in the next chat. The exact-payload PR checks were green
before merge and installation; do not describe the pending main repeat as passed.

Start a fresh chat to load/admit the installed snapshot and handle the matching
private bridge receipt described above. Then continue the retained-owner and
before-open integration plan, followed by containment, full disposable lifecycle
proof and the documented API backlog. Publication and installation are complete;
these native/runtime and design-execution tasks are not. No public writer was
enabled, no live tool was called, and the excluded production project was not
read, hashed, opened or changed. Preserve this uncommitted delivery-note append
and batch it with the next documentation change rather than creating another
plugin version solely for the handoff.

## 2026-10-23 follow-up

Main CI39869135917 subsequently completed successfully for the same merged
`07d84e4d1bc6d324813a0e1f3f9dd6db6b50af81` payload. The pending statement above
records the earlier handoff, not the final CI outcome. The next combined owner
integration is recorded in [worker-startup-owner](2026-10-23-worker-startup-owner.md).
