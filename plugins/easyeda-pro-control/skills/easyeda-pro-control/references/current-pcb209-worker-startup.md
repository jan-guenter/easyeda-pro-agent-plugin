# Disposable project-worker startup on 3.2.209

Use `easyeda_control_pcb209_worker_startup` to capture the original project
worker as an explicitly disposable, already registered local project opens.
This tool owns a separate native launch. It cannot attach to an ordinary
EasyEDA process or upgrade the `pcb209_opening` owner.

Discover `pcb209-worker-startup` with `query:{includeSchemas:true}` and validate
each inner request with `pcb209-worker-startup-validate`. The API wrapper is:

```json
{
  "request": {
    "action": "pcb209-worker-startup-validate",
    "query": {
      "request": {
        "action": "inspect",
        "operationId": "pcb209-startup-example-01"
      }
    }
  }
}
```

Validation is offline. It neither creates a journal nor grants authority.

## Original-owner sequence

1. `launch` requires a unique `pcb209-startup-*` operation ID and
   `confirmValidationOnly:true`, `confirmDiagnosticLaunch:true`, and
   `acceptExistingProfileEffects:true`. Retain the returned binding digest.
   Keep this Codex session alive until the original helper is released.
2. Call `browser-observation`, then `inspect-frames` with its observed page
   `targetId`, then `inspect-script` with the observed top-level `frameId` and
   `family:"ui"`. Use the original operation ID and `expectedBindingSha256`
   for each bound action. Each observation is consumed once.
3. `capture-project` takes `target:{rawWindowsPath,projectUuid,documentUuid,
   expectedSourceSha256}`, `confirmDisposableProject:true`,
   `acceptNormalOpenEffects:true`, and `acceptDebuggerPauseEffects:true`.
   The path must identify the registered disposable file; its exact raw-path
   hash identifies the project. The document is an existing checkpoint-member
   PCB. The coordinator derives the branch and creates its own checkpoint.
   It arms original worker capture before the single project opening. The
   target is the generated editor bootstrap. The preload import creates four
   fixed anonymous helper scripts before the project-worker import. All seven
   phases need separate paused-source qualification. Each helper must also
   match its original preload creator and ordered caller location. Constructor
   breakpoints are armed before the project script resumes.
4. After successful published capture, `observe-current-assignments` checks
   the current wrappers against retained constructor callbacks. After that
   published result, `observe-current-channel`, `observe-actor-clock` and
   `observe-footprint-state` are independent optional stages. Each takes only the same ID and binding.
   The channel stage reads relations, method locations and paired gates; it
   does not invoke publisher methods. The actor stage samples UI, worker,
   worker, UI identity and local Date values in that order. The footprint stage
   compares two own-data samples from the original constructor-captured footprint
   and consistency managers. It requires an own undefined captured user, the same
   16-character client and an unchanged maximum ticket. Constructor identities
   are retained from fixed lexical reads on the original project constructor
   frame; matching names or copied packets cannot replace them.
5. After a published footprint-state result, `observe-footprint-source` takes
   the same ID and binding plus `footprintUuid`. The footprint must belong to
   the original completed checkpoint. A separate read-only projection resolves
   its complete history, including ordinary record families, repeated fragments
   and tombstones. Ambiguous headers, actors, normalized identities or conflicting
   winners refuse before native dispatch. Copy/append eligibility is separate.
   Historical `pend`/`unique` fields and `DELETE_DOC`, `META_CREATE` or
   `META_MODIFY` effects remain outside this source projection.
   Two reads reconstruct source from the original live consistency entries and
   existing native Cache chunks. Four state samples bracket those reads. Every
   keyed record and exact body byte must match the independent checkpoint fold;
   the two complete source samples must also match each other's native order.
   Concurrent cache loading means checkpoint traversal cannot establish that
   order. The result therefore reports `checkpointByteOrderMatched:false` and
   `nativeOrderStable:true`, with comparison
   `complete-checkpoint-records-native-order` and route `native-cache-equivalent`;
   it does not dispatch `Tg.getStr`, a parser, cache writes or a network fallback.
   A missing cache entry refuses. This is source inspection, with no copy,
   delete, Save or persistence authority.
6. After the published source result, optional `prepare-footprint-copy` takes
   only the same ID and binding. It retains that exact original opening, source
   packet, source plan and completed SQL reader, then publishes the preparation's
   checkpoint, source, plan and native-argument hashes. Reserve eight remaining
   normal requests through224, preserving32 cleanup slots. The stage is consumed
   before preparation and cannot be retried after a capacity or ownership refusal.
   This is an observation-purpose plan. It does not qualify a copy launch,
   producer, actor/clock source, complete writer budget, native create or saved
   result. No caller plan, name, source text or native handle is accepted.
7. Use `observe-window`, then one `normal-close` with the observed `hwnd` and
   `confirmNormalClose:true`. Separately call `observe-termination` and
   `release-closed`. Complete any offered `settle-records` using the retained
   intent digest. Release requires original root exit and an empty original Job.

The parent discovery and startup channel share one monotonic request counter
with a fixed256-command limit. Handoff does not reset it. This is sufficient
for the defined startup stages; it does not admit the private common-state
reader, whose complete bounded sequence needs up to3090 commands, or its
empty-root bracket, which raises that sequence to3099 commands. Use the
[separate empty-baseline purpose](current-pcb209-empty-baseline.md) when that
observation is needed; choose it before launch. This constructor owner cannot
be upgraded.

Use the inspected channel's `nextRequestId` to choose optional observations.
Keep normal work through request224, leaving32 slots for cleanup. Assignments,
channel, actor and footprint-state stages cost23,24,35 and15 requests respectively,
including their final owner checks. At next ID `N`, require `N + cost - 1 <= 224`, then inspect
again after the stage. The first three fit only when `N <= 143`; all four require `N <= 128`. The seven-phase
startup's conservative bound remains186 requests. Four footprint constructor
reads consume four existing reserve slots; the reserve is76 instead of80.
Actual usage can be lower. These counts are not measured timing or permission
to reset the counter.

The default startup channel counts data, pending-reply and empty idle polls
separately. Empty idle polling backs off to250ms; new requests wake it immediately.
The channel has a non-resettable one-hour lifetime starting at its construction.
This is separate from native launch timing. Inspect `failureCode` and the three
poll counters before attributing a failure to a budget. Expiry stops channel
commands; original native normal-close, termination and release remain available.

The source stage needs 65 additional requests, including original method and
native-intrinsic qualification. Its capacity check requires `nextRequestId <= 160`
before recording intent and again before dispatch. Choose source inspection
before spending the budget on optional channel or actor observations. There is
no guarantee that every optional stage fits one launch. The reader caps source
at 2MiB, cached history at 64 keys and 8MiB total, and drawing atoms at 4,096.
Its JSON observation has a separate bound, so heavily escaped source can refuse
below the content limit. It retains complete evidence or refuses; it never
returns a truncated source as success.

If copy preparation is the intended observation, reserve its additional eight
requests along with the source stage: require `nextRequestId <= 152` before
source inspection. Optional actor/channel work can prevent that combination
from fitting. Private producer and actor compositions have no mounted action
in this purpose and cannot be appended through caller code or a larger counter.

## Interpreting results and failures

The exact209 source and breakpoint profiles differ from the old206 route.
Do not substitute old worker source, debugger coordinates, packet profiles or
operation prefixes. A successful source comparison proves only the observed
bytes. A constructor packet remains tied to its original in-memory owner;
matching JSON and historical receipts cannot recreate it.

The `workerScriptLoadedObserved` diagnostic records one parameterless Chromium
notification after the original worker completed all seven source resumes.
Chromium emits it even after failed top-level evaluation. It proves neither
constructor capture nor callback, startup or persistence completion. Continue
only from a successful published constructor packet, never from this flag.
Early, duplicate, malformed and foreign notifications still cause refusal.

Current assignment and channel observations are sequential samples. They do
not prove continuous wrapper ownership, native BroadcastChannel peers,
contained publication destinations or queue completion. The actor stage's
local Date bracket is not a native/server clock proof or a future Save clock.
Footprint state does not call the asynchronous source getter or prove its cache
branch, backend actor, copy/delete completion, closed SQL or saved/reopened data.
The optional native-cache source reader uses current consistency links rather
than invoking that vendor getter. It proves the observed source equivalence
only for its supported profile. Neither route enables a footprint writer.
The installed SDK declares `lib_Footprint.getDocumentSource`, but its RPC handler
is absent from the pinned UI registration. This source-inspection task equivalent
does not establish that wrapper's output format or make the public call usable.

Project opening can restore tabs, migrate files, replay caches, use network
services and automatically persist or Save. Debugger pauses alter application
timing. The tool offers no explicit Save, CAD edit, PCB-worker/ratline capture,
complete live/source/SQL baseline or writer eligibility. A PCB already opening
as part of restoration may create an unexpected worker and cause refusal.
Do not disable threading or use another launch purpose to evade that result.

After a timeout or lost reply, use `inspect`; do not repeat capture or the
consumed observation. Retain the original process owner for supported cleanup.
`firstFailure` preserves the first error's stage, substep, elapsed/allowed
pause time and construction progress before cleanup. A later
`firstEventFailure.priorFailureCode` identifies an event rejected after an
existing failure; do not treat it as the original cause. Per-stage
`resumeOrigin` distinguishes normal and cleanup resume attempts. A source marked
qualified and resumed can still belong to a failed capture.
For source-transfer failures, `firstFailure.reason` distinguishes a deadline
from refused source bytes. `sourceTransfer` records the selected delivery limit
and remaining original pause time. A late reply does not revive the attempt.

For a failed assignment observation, inspect `constructionAssignments` in the
startup transport status. It retains the fixed step, completed reply count and
last bounded immutable reply with its digest and byte length, captured before
decoding and the following owner check. The step distinguishes function metadata,
scope enumeration and callback-relation checks. A retained reply is diagnostic
evidence; it neither qualifies the assignment nor permits another attempt.

For a failed footprint source capture, inspect
`workerStartupOpeningState.transport.firstRejectedFootprintSourceReply` first.
That transport parses the reply before the construction reader receives it.
The reader also retains `firstRejectedSourceReply` for failures at its own
boundary. Each preserves the first rejected reply before strict parsing, or
explicitly reports that it was malformed or too large to retain. These supply
diagnostic evidence only. A later channel failure does
not establish why an earlier source reply failed, and a missing raw reply cannot
be reconstructed from the error label.

For a rejected ratline continuation capture, inspect
`workerStartupContinuationRejectedCaptureReplyEvidence`. Its original PCB and
worker owners retain the first rejected reply separately, with the fixed pause
site, program or selector, request number, complete bounded data and digest.
`reply-validation` distinguishes decoding from the preceding owner reproof.
Each raw copy has a32KiB limit plus fixed structural limits; malformed or
oversized data remains explicitly unavailable. These copies stay outside the
closed status diagnostics and grant no capture or retry authority. An upstream
transport or owner refusal can prevent a reply reaching this boundary; absence
does not identify that missing reply or the cause of a prior failure.

The209 function-metadata profile requires the three own properties reported by
its V8 build for the regular debounce wrapper: `length`, `name` and `prototype`.
The inherited `arguments` and `caller` properties are not own descriptors.
Do not infer strict mode from their absence or substitute a different engine's
property roster. Function source, location, scope and callback-relation checks
still apply; the older generation retains its separate descriptor contract.

The 209 pause windows account for serial owner checks, source reads and
breakpoint allocation. The project opener now adds the finite deliberate
capture graph to its ordinary opening allowance: 651 seconds for capture,
45 seconds for opening and 25 seconds for delivery give a 696-second native
deadline and 721-second host wait. Small control requests and owner
checks retain their two-second limits. The209 script-transfer limit derives from
the pinned source size, JSON framing and native64KiB polling, capped by the
remaining original pause. The project script's ceiling is6,540ms. This does not
extend the stage or launch clocks or promise that every subordinate maximum fits.
The default purpose has the separate channel-construction lifetime described
above. The empty and ratline purposes retain their own one-hour native launch
clock and60-second cleanup reserve. These are conservative source
bounds, not measured completion times. A native opening timeout now identifies
`native-open-project`; it does not report the last root-binding check as the
awaited operation. The generic opener and 206 pause limits are unchanged.

Phase diagnostics distinguish bootstrap, preload, four helper copies and the
project script. Failed target and script events retain bounded classifications
and digests rather than private URLs or source text. Unsupported events retain
a fixed method classification or method digest, session relation, startup phase
and last fixed command. These diagnostics do not make the event acceptable. The preload-log flag now
requires all four helper phases to have completed without a prior failure.
Older snapshots could set it during cleanup; do not apply the new meaning to
their historical results. The flag alone does not prove constructor capture.
Generic project-opening consumption remains true through
cleanup and historical inspection, including when constructor capture failed.
Consumption does not imply a published successful opening result.
Normal close does not prove discard or unchanged files. Leave Save/Discard
prompts unanswered. Do not restart Codex while a live owner still needs cleanup.
Source tests and a successful installation are separate from connected
validation of this route.
