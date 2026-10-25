# Ratline prefix timing and native origin observations

## Installed admission and disposable case

The restarted host loaded `0.3.0+codex.20261025022904`, published as main
`6ea779df32877160707d2e7b538d733f4540c46b` in
[the previous release](2026-10-25-ratline-native-held-import-integration.md).
Independent admission checked its original process and lease, pinned Node,
all 1,940 installed files and modes, 694 source files and three bundle entries.
The prior host had exited. Status reported no incomplete operations; its
401-journal scan took 53,585 ms. The previous main Linux CI `40156758076`
has also completed successfully.

One fresh disposable `ratline-held-import` launch qualified the browser,
root frame and complete UI source. Its single project capture returned
`PCB_WORKER_STARTUP_INITIAL_PAUSE_DEADLINE`. No constructor packet was
published and no PCB/ratline observation was attempted.

Inspection retained all seven project-worker source stages as qualified and
resumed, with `Inspector.workerScriptLoaded` recorded as the first event
failure. Those flags can include cleanup resumes. They do not establish
normal progression through all seven stages or make the notification the
primary cause of this failure.

The transport retains its first failure. The outward deadline error therefore
supports a watchdog-first failure, while the exact expired stage, substep and
elapsed interval were not recorded. The later notification can be rejected
because the transport has already failed. This differs from the earlier
[notification case](2026-10-24-through-2026-10-25-worker-notification-and-ratline.md)
and must not be assigned its cause merely because the same event appears.

One normal close was acknowledged. The retained original root exited and its
Job became empty; the helper released with no pending replies or publication
settlement. Independent review and a fresh closed-file read found unchanged
disposable bytes, descriptor identity and timestamps, with no sidecars. This
was not a new logical-SQL comparison. No explicit Save, edit, restoration,
forced exit, prompt choice or production-project access occurred. The case is
terminal and must not be replayed.

The independent admission receipt has SHA256
`8b619736d12093c6545cb2b76d697af7e2dbca2bb1a6cd80ddd28f054e165576`.
The independent terminal review receipt has SHA256
`1715772843f0aa856bd36e7947061765ccb1e0de16e5a77a8eaec6f75ec2ecf7`.
Private evidence retains the complete requests, replies and original failures.

## Initial batch plan

- Replace the uncomposable 209 pause windows with fixed windows derived from
  each phase's serial requests and owner checks. Preserve individual request
  bounds, legacy limits and original one-shot cleanup.
- Retain the first failure's phase, substep and timing before cleanup, and
  distinguish normal from cleanup resumes in diagnostics.
- Correct shared status descriptions to include all three startup purposes
  without changing registration or execution authority.
- Add a bounded native worker creation-origin observation to the first held
  ratline import. Retain original debugger/session/source identities; keep
  the final import paused and full Worker-target, startup and writer claims
  separate. Missing or unqualified custom-runtime evidence is not a reason
  to substitute URL/name matching or broaden accepted source locations.

At this planning point, implementation, focused checks and release results
were pending, and no new candidate had been installed. Full subordinate
continuation, callback and publication completion, complete live/source/SQL
membership, blocked writers and remaining API adapters remain backlog.

## Native origin research

The disposable browser reports Chromium `146.0.7680.188`, V8 `14.6.202.33`
and custom Electron `41.2.1-jlc-sa-win-x64.6`. The reported Chromium revision
was not found in the upstream mirror. The matching release's source supplies
a mechanism to investigate, not proof of this custom binary's behavior.

[DedicatedWorker::Start](https://raw.githubusercontent.com/chromium/chromium/146.0.7680.188/third_party/blink/renderer/core/workers/dedicated_worker.cc)
captures a creation stack before requesting the worker host.
[WorkerGlobalScope::RunWorkerScript](https://raw.githubusercontent.com/chromium/chromium/146.0.7680.188/third_party/blink/renderer/core/workers/worker_global_scope.cc)
sets it as an external async parent during initial script evaluation.
The version-pinned [V8 debugger agent](https://raw.githubusercontent.com/v8/v8/f09a91282a26caa91d016c962d785d852cfdec36/src/inspector/v8-debugger-agent-impl.cc)
can include that external stack ID and originating debugger ID in the
instrumentation pause. This supports a fixed parent-session lookup to test
the creation link independently of worker names and URLs. The implementation
retains the original observations, compares exact source locations and leaves
complete Worker-target identity false, including when the comparison matches.

## Implementation and independent review

The batch implements fixed 209 pause windows derived from the serial await
graph. Bootstrap and intermediate source windows are 12 and 14 seconds; the
final project source has 68 seconds including eight breakpoint allocations.
Construction arming has 50 seconds. Its nine pause windows are 24, 26, 20, 32,
32, 32, 26, 20 and 16 seconds. Each window starts at its original event, with
monotonic expiry checks. Individual two-second requests and owner checks, the
206 five-second pause limit, and independent project-open/launch deadlines
remain unchanged. These are upper bounds, not permission to extend another
deadline or assurances of connected performance.

First-failure diagnostics retain stage, substep, elapsed/allowed time and
construction progress before cleanup. Resume provenance records normal or
cleanup attempts. A later rejected event can identify the preceding failure.
The earlier live case cannot retroactively receive these missing observations.

The first-child origin observer retains both original constructor pauses,
the first qualified child pause, and one native stack reply when available.
Fixed depth-one capture is armed in both realms. Only the original child's
external ID naming the original PCB debugger can select that one lookup.
Exact frame/scope/location comparison produces a diagnostic reason; it does
not grant complete native identity, continuation or writer authority. Four
complete observations each have a 64 KiB cap, with a 288 KiB result cap and
the unchanged 512 KiB public-response cap. Inspect returns raw evidence once,
either in the published result or as retained unpublished evidence.

Native accounting now reserves 318 normal and 43 cleanup requests. The final
child import remains held. A valid late original reply after an uncertain
non-allocation write now closes its pending record without restoring authority.
Independent review also caught and corrected a missing per-request origin
lookup deadline. That lookup now uses the fixed 2,500 ms ordinary ratline
request limit and cannot be retried after timeout.

Focused timing checks passed 32 tests and capability-scope checks passed three.
Native protocol/budget checks passed 20 tests, channel checks passed 14, and
the required native-consumer suite passed seven. Origin, bootstrap, lifecycle
and schema changes passed 45 distinct focused cases across bounded runs.
Development failures exposed synthetic fixture omissions and a null-prototype
round-trip assertion; their logs remain retained, and corrected affected suites
passed. No full local suite was repeated. The 930,350-byte native
helper compiled on Windows and completed its empty-Job/pipe smoke check with
`processLaunched:false`; both helper consumers pin SHA256
`6ce75be69d47437d6bdb1dc2a91572c64c18392ada94630e72b961722f4e803a`.
Independent timing and origin reviews found no unresolved issues. Their
private receipt digests are
`906c7399c137cad8be8cd6577dcd5f23b946ebe832dccfc8561da0efe2dd24de` and
`095304a06faa6f39610f8ebbd883ee1a2408c835c25c8bbc43e3c029c50ff35f`.
These checks are offline or native-helper checks, not new EasyEDA execution.

## Release candidate

`0.3.0+codex.20261025034840` combines the timing, diagnostics, native-origin,
late-reply accounting and operating-reference changes. Mandatory non-suite
verification passed on Node 24.18.0/npm 11.16.0 with core dumps disabled:
clean install, dependency tree/signatures/security audit, types, strict
type-aware lint, bridge types/lint, coverage, native generators/sanitizer,
build, compatibility and repository/MCP/all-skill validation. All seven skills
also passed the official skill validator; the official plugin validator passed.
The first full lint run exposed an exhaustive-switch omission. Both new
internal commands now remain explicitly refused by the child-start gate;
independent review accepted the correction and the final full lint passed.

Both bundles reproduce exactly. Source 697 has SHA256
`2d20bd19f1e8a90ff32e4092707cc34f142079b79d4c6aabe3461159b4577a98`;
the three-entry bundle projection is
`cd6093d257e52ca5b9a0a5c0dce091aff2c1ced61f91755860e282d938533a43`.
Only the facade projections and review time changed in compatibility metadata;
external pins remain unchanged. Exact-commit CI is the remaining release gate.
The loaded host remains `0.3.0+codex.20261025022904`; the candidate has not been
installed or exercised against EasyEDA.

### CI fixture correction

The first PR122 payload, `4cc0a4b0831368eb65565acc970a25de24c4e08b`,
passed build/bridge and Windows checks but failed facade shard 2. The protocol
adapter fixture still expected the former 358 total and 315 normal ratline
requests. Its two assertions now require the derived 361 and 318 limits.
The affected 11-test suite and strict targeted lint passed. A search of all
facade and bridge tests found no other stale ratline budget, arm-count or
helper-pin expectations. Runtime source, bundles, guards and install version
are unchanged; a new final-commit CI run remains required. The original failure
log is retained privately.

The next payload, `c606569fab202936a2935f69c4d85f512fe906a1`, passed
seven facade shards, build/bridge and Windows checks. Shard 3 exposed one
further stale assertion: a late event after abort now correctly includes
`priorFailureCode:"ABORTED"`. Its existing-worker fixture now requires that
field. All nine affected tests and targeted strict lint passed; related
status/bootstrap/event assertions were audited without further corrections.
The entire second CI run reached a terminal result, so this correction covers
its only failing test. Runtime source, bundles, pins and version remain
unchanged. The final candidate still requires a green exact-commit CI run.
