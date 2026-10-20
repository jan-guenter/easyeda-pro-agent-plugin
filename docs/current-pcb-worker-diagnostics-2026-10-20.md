# Project-worker diagnostics

## Scope and current result

This batch adds a fixed project-worker read to the retained diagnostic workflow.
It observes an existing direct child worker, checks its complete source and
unique execution context, then reads selected own-data flags and queue counts.
It does not provide complete pending-work membership, a compiler owner, PCB
creation, Save or saved/reopened verification.

The installed `20041000` diagnostic launch was attempted once on 2026-10-20.
It returned `PCB_DIAGNOSTIC_OWNER_NATIVE_REFUSAL`. Original-owner inspection
offered no-process cleanup; that cleanup finished as `no-process-released` with
`launchRequestOutcome:"native-refused"`, `creationState:"returned-false"`,
`processCreated:false` and `released:true`. No browser/frame/worker observation
was dispatched. This qualifies that cleanup path, not a successful application
launch. The retained result does not identify a specific Windows failure cause.
The attempt is terminal and must not be replayed.

The source reader and its focused tests are separate evidence. They do not
establish support in the custom EasyEDA Electron build.

## Why the worker is reachable only through its parent

The pinned project-manager bundle creates a dedicated Worker during project
opening. Its bootstrap is `editor?entry=mgr-project-worker.js`; its constructor
name combines `project_`, the project ID and the window-tab ID. The ordinary
opening paths at offsets 1782782, 1785548 and 1786387 use this relation. The
worker publishes its project object as `self.PROJECT` at offset 2177102.
Offsets here are JavaScript string positions, not file byte positions.

| Installed source under `resources/app/assets/` | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-mgr/3.2.184.355087e9/js/pro-mgr.js` | 2,196,400 | `005584e02cd9b2d49fdb387b2f997c1c8d3f88b0c48a7531c8097c483ed0bd2e` |
| `pro-mgr/3.2.184.355087e9/js/project-worker.js` | 2,181,284 | `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928` |

Both installed files were read as inert text and rehashed. They were not imported
or executed. Parsing the complete worker source located `Gd` at
2011459–2034927, `Lg` at 2103244–2146905 and `ja` at 273992–298669, allowing
the selected fields to be traced to their constructors and assignments.

Chromium 146 retains child-worker records before its parent requests reporting.
Browser target discovery alone therefore does not establish a complete worker
inventory or the parent relationship. The adapter uses a child-attachment event
on the original retained page session. It never directly attaches to a worker
selected by name or URL.
[Child reporting implementation](https://github.com/chromium/chromium/blob/146.0.7680.188/third_party/blink/renderer/core/inspector/devtools_agent.cc#L332-L390),
[dedicated-worker target registration](https://github.com/chromium/chromium/blob/146.0.7680.188/content/browser/devtools/devtools_renderer_channel.cc#L149-L210).

The worker context has different metadata from an ordinary page. Chromium's
worker producer supplies the constructor name and full debugger URL, without
the page's frame/default-world auxiliary data. Requiring page-shaped context
metadata would reject a genuine worker.
[Worker context producer](https://github.com/chromium/chromium/blob/146.0.7680.188/third_party/blink/renderer/core/inspector/worker_thread_debugger.cc#L107-L122).

These are upstream contracts for the selected Chromium revision. They are not
connected observations of EasyEDA's custom build.

## Fixed observation and its limits

The new leaf, `current-pcb-diagnostic-worker-program.ts`, exports one immutable
expression and a strict by-value result decoder. The expression is 3,841 UTF-8
bytes with SHA-256
`dba64a7237d99363d35b134a7c4c6bfa312259f125fe2f7fb813db47b1ae4e52`.
No caller expression, field path, source hash or evaluation option is accepted.

The selected `PROJECT` instance has the `Lg`/`Gd` prototype chain; its consistency
manager has the `ja` prototype. Reads use own data descriptors. In particular,
`_branchUuid` and `_isV2Format` are read directly rather than invoking their
public getters. Map/Set size uses the explicitly selected intrinsic getter on
the exact native collection prototype. Decorated collections and subclasses
refuse.

The returned data is deliberately smaller than the native object:

- Validated opaque project, branch and window-tab IDs, never project paths or titles.
- Required boolean flags and separate absent/undefined states for optional flags.
- Sizes of nine named Sets, four direct Maps and all 27 maps in the three
  watcher groups.
- Own-key counts for the consistency manager's `uniqueIds` and the project's
  `orderCache`, without their values or names.
- Null, undefined or present labels for three exposed timers.

The program does not traverse task objects, upload buffers, cache values,
history, geometry or private design properties. It calls no vendor method.
It neither awaits promises nor clears or flushes queues. Some debounced jobs
live in closures, so even zero counts cannot prove quiescence. Output is bounded
to 16 KiB and each count to 65,536; those limits do not bound the cost of all
native reflection before a result is returned.

Evaluation selects the original `uniqueContextId` and fixes
`throwOnSideEffect:true`, `silent:true`, `returnByValue:true`, `awaitPromise:false`,
`includeCommandLineAPI:false`, `allowUnsafeEvalBlockedByCSP:false`,
`userGesture:false`, `generatePreview:false` and a 1,000 ms inspector timeout.
The protocol's effect check rejects execution when effects cannot be ruled out
and also disables breakpoints during evaluation. A unique context ID avoids
accidental context-ID reuse. Neither establishes original process ownership or
a sandbox.
[Runtime evaluation contract](https://github.com/ChromeDevTools/devtools-protocol/blob/master/pdl/js_protocol.pdl).

Upstream V8's effect checker explicitly classifies descriptor/prototype reads
and Map/Set size operations. The local Node inspector test checks the actual
expression with the effect check enabled. This is evidence for the tested Node
runtime, not proof of the custom Electron runtime or pristine application
intrinsics.
[V8 effect-check implementation](https://github.com/v8/v8/blob/14.6.172/src/debug/debug-evaluate.cc).

## Workflow integration

After `browser-observation` and `inspect-frames`, `inspect-workers` enables
direct-child discovery on the retained page session. It accepts at most 16
worker attachments and does not wait for or pause them. The public inventory
omits worker names and URLs.

`inspect-worker-script` selects one observed child target. It admits that
child's original session, single unique execution context and full pinned
worker source. `observe-worker-state` then takes one point-in-time sample with
the fixed read and pre/post original-parent target/frame checks. Local `inspect`
uses the corresponding `workers`, `worker-script` and `worker-state` observation
selectors to recover retained results without another native dispatch.

Child attachment before the discovery acknowledgment is retained but does not
authorize an early read. A changed target/context, detach, navigation, unexpected
pause or protocol failure invalidates inspection. The existing original-owner
normal-close, termination observation, release and durable receipt settlement
remain the cleanup path. Failure must not disconnect a live diagnostic pipe.
The complete path including the optional page-script check consumes exactly
32 protocol requests, within the existing lifetime bound. It is not a polling
interface.

See the maintained
[diagnostic workflow](../plugins/easyeda-pro-control/skills/easyeda-pro-control/references/current-pcb-diagnostic-validation.md)
for exact stages and cleanup.

## Focused evidence and remaining work

Five leaf tests pass under Node 24.18.0. They cover ordinary and nonempty queue
summaries, omitted private values, accessor/prototype/identity refusal, malformed
or oversized results, duplicate keys, signed zero and unsafe result wrappers.
An in-process `node:inspector` session executes the fixed read with side-effect
checking and rejects a proxy trap before its counter changes. It opens no TCP
listener and launches no helper or application. Full TypeScript and strict
type-aware lint pass for this leaf.

The initial decoder test exposed acceptance of signed-zero counts. The count
schema now rejects them; the final focused run passes. These tests do not claim
connected diagnostic or writer coverage.

The integrated focused run passed 135 diagnostic tests with no failures.
This includes the complete 32-request synthetic owner path, source drift,
effect-check refusal, context loss, publication settlement without evaluation
replay, and failed-creation error retention. Strict targeted type-aware lint
has no warnings. Earlier development runs caught missing captured-method entries,
a transient fixture syntax error and lint findings; those were corrected before
the passing combined run.

The native helper now embeds the exact worker expression and reconstructs the
fixed protocol fields itself. Its SHA-256 is
`8060c09d393064992c5640829c6ac565660263d888cd24503ff6c3dddbcd4c58`
at 48,607 bytes. Its reviewed `-CompileOnly` branch passed locally: compilation,
empty Job, pipe checks and protocol-program parity, zero stderr, no application
launch. Independent review matched the native/TypeScript expression and flags
and found no change to retained ownership, inheritance or cleanup guards.

Failed native creation now captures `GetLastWin32Error` immediately, and carries
that bounded numeric value through inspection and exact original no-process
cleanup. Bounded exception unwrapping retains only fixed native labels, not
paths or arbitrary exception text. This repairs the missing diagnostic evidence;
it does not establish or fix the particular cause of the earlier failure.

There is a concrete reachability omission. A Start Page session may have no
project worker. The diagnostic workflow has no retained-owner disposable-project
opening adapter, and its shared exclusion intentionally blocks ordinary/bridge
opening while it owns the application. No alternate opener or manual navigation
is supplied as a bypass. A qualifying worker already present in an authorized
session can be inspected; a clean Start Page cannot be turned into a PCB fixture
through this workflow yet.

Still required before PCB String writing: a qualified diagnostic launch,
scoped disposable-project opening, original renderer/compiler association,
complete native model and Save-participant observation, pending-producer interval
proof, a one-shot writer, full closed SQL effects and fresh saved/reopened
same-ID verification. The queue counts added here discharge none of those
requirements by themselves.

## Delivered release and installation

Version `0.3.0+codex.20261020053706` was published through
[PR 83](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/83).
The payload commit was `87ae78ea4f2e0146a9c91d434177872883d15d38`.
A history-only update produced final head
`1bdf53b5ee1d540e4336cbc3ba67f307469d02e5`; normal protected merge produced
`20a67ee0e20810a4f4a50c0b6cd474aa40da2b06`. All three complete trees match.
This section is post-delivery local handoff documentation, not part of that
already installed immutable payload.

The frozen local verification passed 11,759 facade tests, four platform skips,
zero failures and all 424 bridge tests. Types, strict zero-warning type-aware
lint, repository/privacy, MCP contracts, dependency checks and all seven skill
validators passed. The log SHA-256 is
`b2b6c14641819ed80e037a6e6b9687e61485b7fb3805b890e6ce9bd62b96bb81`.
[Final-head Linux CI](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/39376599868)
passed all eight shards and its final gate: 11,758 facade passes, five skips,
zero failures and 424 bridge passes.
[Final-head Windows CI](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/39376599866)
passed, including native compilation, empty-Job and pipe checks.
The superseded pre-merge-history run was cancelled, not counted as passing.
Automatic merged-main Windows CI `39377961592` passed; Linux `39377961737`
was still running when this checkpoint was written, with its build check green.

The official named Git marketplace upgrade installed and enabled the version
from `https://github.com/jan-guenter/easyeda-pro-agent-plugin.git`. The marketplace
checkout matches merged main. The maintained exact comparison passed 1,564
files, 42 directories, 32,137,842 bytes and all modes. Plugin tree:
`8293eded46957fbd877059a3ce18c46e2f0ad41d`; inventory SHA-256:
`c6ea3e08510020b81d95b0a4908db8e8e1dbe4b03a8fec2d85b6c96324fc7e70`.
Release evidence is retained in
`/root/.cache/easyeda-worker-diagnostic-release-0LVXl95L`.

One reviewed offline installation probe passed using the actual configured
launcher, ambient Node 26 and pinned Node 24. A private synthetic installation
with its PCB asset deliberately missing selected three offline-only tools;
50 configured policies and seven skills were present. One catalog query and
three worker argument validations passed. This is not the separate 25-tool
restricted-mode registration, a connected worker read or application launch.
The original child exited and closed with code zero after stdin EOF, without
signals, stderr or retained handles. Three complete installed inventories matched.
Two process samples found no child processes or non-stdio sockets; the upstream
sentinel remained absent. These are sampled observations, not continuous isolation.
Evidence is in `/root/.cache/easyeda-worker-offline-probe-gzUC6KQl`;
proof SHA-256 `3dc7b9f7e9958e09b2d701228c9d668bfe59df22b30147afe41250e5be34b17d`.
The probe is consumed and must not be rerun, imported or syntax-checked.

The existing host was left untouched. A fresh Codex session must load and admit
the new version before another live diagnostic case. No production project,
production record, CAD edit or Save was accessed or performed.
