# Footprint preparation repair and native integration

This continues [the preparation runtime record](2026-10-28-footprint-preparation-runtime.md).
Only the disposable validation project was used. The excluded production project
was not accessed. This record distinguishes completed connected observations
from source implementation and tests; it does not certify a working copy writer.

## Installed preparation attempt

The restarted host loaded `0.3.0+codex.20261028084035`. Independent verification
matched its actual process to the installed source and runtime projections.
Both follow-up main CI runs from the preceding release completed successfully.

The new actor collection passed in 37,691 milliseconds, including 26,514
milliseconds for its UI pair and 9,394 milliseconds for the worker pair. The
ordered observations and zone checks passed under the new 70-second profile.
The earlier 10-second refusal remains a failure of that original attempt.

Original worker construction, assignments, footprint state, source reads and
copy-plan preparation passed. The source contained four cache keys and 46
records; two native reads agreed and the checkpoint comparison passed. The
next producer-binding stage stopped with `PCB_WORKER_STARTUP_WIRE` before any
copy, delete or explicit Save. It was not replayed.

Normal close, retained root and Job exit, and helper release were observed.
The complete closed disposable file remained byte-identical to its prelaunch
copy, with no sidecars. The final operation was released. A pipe/poll failure
after application closure remains recorded separately; successful cleanup does
not turn the failed binding stage into a success.

## Implementation batch

The wire encoder omitted four fixed producer commands that the implemented
binding collector already used. An original-constructor regression reproduced
the refusal at the native boundary. The encoder now recognizes method capture,
method recheck, lexical capture and lexical recheck under the footprint purpose.
Legacy startup routes still reject them. Fixed code, arguments, flags and
original handles are checked on both sides of the transport.

Producer, dependency and manager collectors now unwrap V8's actual internal
scope object before selecting lexical bindings. Focused Node inspector tests
exercise real scope metadata and reject substituted references. These tests
are not observations of EasyEDA's embedded V8.

The execution integration adds original parser registration and upload-callback
relationships, a distinct native command vocabulary and transaction-clock event
handoff. The original nine-pause preparation profile remains separate from the
eleven-pause execution construction profile. Parent Worker construction and a
one-use diagnostic message establish the intended Worker-to-target association
before the held parent may continue. The message is intercepted and removed by
the original child observer; it is not a vendor command or an application edit.

Destination qualification retains the original project and API objects, exact
notification and HTTP-route functions, fixed relative history routes, and empty
tracked upload queues. It does not establish native HTTP backend ownership, cache
namespace provenance or callback completion. Windows clock observations retain
their own native owner and phase; they cannot stand in for the clock results
actually used by native document construction.

Compile-only native test inputs are stored in a bounded, hashed compressed
table. Every original field, expected command and legacy refusal is retained.
This compile-only compression does not change production encoding or the helper
size ceiling.

The new `footprint-copy-route-preparation` wrapper exposes the combined startup
and route observation from a separately launched disposable owner. Its strict
offline discovery and validation agree with the registered callback. It cannot
upgrade an existing purpose or accept caller programs, request limits, create
or Save. A combined observation records its intent before reading the original
state, producers, callbacks, destinations, manager route and Windows clock.

## Remaining work

The corrected producer/dependency/manager preparation and new native startup
integration still need connected validation from an installed snapshot. Copy
dispatch remains unavailable until backend actor and destination qualification,
the complete native request budget, durable one-shot dispatch, original clock
results, full closed SQL comparison, and independent saved-generation readback
are composed and validated. The supported delete/inverse lifecycle is also
unfinished.

The broader backlog remains other library writers, PCB opening and copper
lifecycles, schematic connectivity editing and manufacturing exports. Existing
task-equivalent readers and scoped writers do not imply coverage of those
remaining API families.

## Validation and publication

Candidate `0.3.0+codex.20261028111845` is frozen. Its 828-file source projection
is `bfe05b65321d37e2ff12096c5cb1e130203d287fd42721ce8a0ff3431d35d116`;
the three-file runtime projection is
`98fdb2ad5e63bc90c6a6f2afcff076521b95d0cd5dbc3c2e3d14354e539d3036`.
External compatibility pins, sanitizer identity and private bridge identity are
unchanged. Independent review matched the complete source projection and both
native helper consumers.

The native helper is 1,043,051 bytes, SHA256
`799271e6a46d1f537515f2e617a7764e86e1e44bf36a1fbd5da4e8a988732340`.
Final Windows PowerShell CompileOnly passed with an empty Job, checked pipes,
zero stderr and no application launch. It includes all twenty fixed parent
command cases and the separate clock phase/refusal checks. An earlier compile
passed an intermediate helper; it is not the final source proof.

Required local checks used Node24.18.0, npm11.16.0 and zero soft core limit.
Dependency installation and inventory, registry signatures, security audit,
sanitizer verification, types, bridge types/lint, strict type-aware lint,
coverage, build, compatibility, repository, MCP-contract and skill checks passed.
All seven skill-creator metadata validations passed; the external plugin-creator
validator was unavailable. A second build reproduced both committed bundles
byte-for-byte.

Focused checks cover the actual registered callback and strict schema, real Node
scope metadata, original constructor/parent relations, callback and destination
bindings, phase-bound clocks, cleanup and native grammar. The final registration
group passed nine tests. Native/wire checks passed 21 of 22 on their first run;
the remaining check caught stale byte-count pins in both helper consumers.
Those pins were corrected and that check then passed. The native helper itself
did not change. Full lint found one integration test exceeding its dependency
limit; its narrowly explained exception was added and full lint then passed
with zero warnings.

The original transport refusal, earlier fixture failures and interrupted
development checks remain retained. Final cleanup review corrected pending
parent capture and peer-task settlement after original root/Job exit. This adds
no speculative debugger resume or retry. The parent regression exercises a
pending capture; the transport checks do not claim a complete connected
pending-peer scenario.

Complete facade and bridge suites are delegated to exact-commit GitHub CI.
Publication and installation are pending those results. No connected copy or
saved/reopened writer result is claimed.

### First complete CI run and fixture correction

Linux CI `40681338818` failed for candidate
`ea830bb245af205f033d7cd080246079f0ac4fdf`. Build verification, the bridge suite
and facade shards five and six passed; the other six facade shards failed.
Windows native CI `40681338755` passed. The original job logs are retained.

Every failed facade case was traced to older test fixtures missing the new
opening/lifecycle exports, or to an assertion for the previous native request
budget selector. Ten test files now supply the required bindings and assert the
new selector. Their 52 focused cases pass with zero lint warnings. The fixtures
retain their original assertions and no production guard was relaxed. A stale
numeric comment in the offline package probe was also corrected.

These corrections do not change the native helper or runtime bundles. Complete
CI must pass again on the final correction commit before publication.

## Publication and installation complete

Corrected payload `b0a89e4df921491298e2d78b5e6aa696080f1df5` passed
[Linux CI40683908241](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/40683908241)
and [Windows CI40683908235](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/40683908235).
All eight facade shards, build and aggregate jobs passed. Facade results were
13,308 passed, five expected platform skips and zero failures; all 424 bridge
tests passed. The corrected local types, strict type-aware lint, compatibility,
repository, MCP-contract and all-skill checks also passed. The native helper,
source projection and runtime bundles remained unchanged by the correction.

[PR140](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/140)
merged through the protected branch as
`5d5bd18a19279e62b2cc98d213294815ba93e1fc`. Its root tree
`2189cbe6f2e05aab6f781363a89a2c381a97c8fc` equals the tested candidate tree.
This batch changes 100 files. Independent comparison matched the complete CI
artifact to the candidate, including every regular file and mode.

The official Git marketplace
`https://github.com/jan-guenter/easyeda-pro-agent-plugin.git` was upgraded once.
Version `0.3.0+codex.20261028111845` is installed and enabled. The upgrade returned
an empty error list. The CLI's stale arg0-directory cleanup warning was
nonblocking; no redundant add or manual cache repair was performed.

Installed verification matched all 2,190 files, 42 directories and 43,369,430
bytes, with exact file and directory modes. Inventory SHA256:
`f863be5367946fe2bacb4172bacab418dd90c266650277b43cbc390622070fc0`.
The cached marketplace HEAD equals merged main. The installed offline probe
passed 38 queries / 40 JSON-RPC requests and exposed the expected 27 tools under
its synthetic profile. Its child closed through stdin EOF with exit zero and
no stderr. Sampled process/socket checks and post-close inventory passed;
these checks do not establish continuous isolation or connected admission.

The original host's PID, start time, executable and arguments remain unchanged.
It still runs `20261028084035`; the next live stage requires a fresh Codex chat
loading `20261028111845`. Use one new disposable `footprint-route-*` operation
to validate the combined route. The earlier preparation attempt is terminal
and must not be replayed. The new route has no connected result yet, and copy,
delete and saved/reopened execution remain unfinished. The excluded production
project was not accessed.

Automatic main follow-up Linux CI40685983189 was still running after installation;
Windows CI40685983067 passed. Exact-tree PR CI supplies the release evidence.
The previous release's main Linux CI40662639977 has also completed successfully.
This publication appendix is retained locally for the next substantive batch,
avoiding a new version solely to publish installation chronology.
