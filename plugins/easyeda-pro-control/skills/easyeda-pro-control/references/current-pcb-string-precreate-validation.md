# Disposable PCB String precreate observations

Use `easyeda_control_pcb_string_precreate_validation` only to qualify the fixed
combined PCB/worker observation path on an explicitly disposable project. It
does not create a String, invoke Save or establish writer eligibility. The
separate diagnostic workflow retains its original mutually exclusive branches.
Read [native diagnostic validation](current-pcb-diagnostic-validation.md) for
startup effects, opening restrictions, original-process cleanup and lost replies.

## Contract and original purpose

Query the offline contract before launch:

```json
{"request":{"action":"pcb-string-precreate-validation","query":{"includeSchemas":true}}}
```

Validate each inner request with `pcb-string-precreate-validation-validate`,
using `query:{"request":...}`. Discovery does not execute or grant authority.

Use a new `operationId` beginning `string-precreate-`. The purpose is sealed in
the launch intent and retained native owner; it is not a caller-selectable mode,
budget or expression. Do not use a diagnostic operation, copy its evidence, or
try to upgrade an existing owner. Both purposes share launch exclusion,
including incomplete journal reservations.

The installed version and actual process must first match the reviewed payload.
Keep that Codex facade alive through cleanup and durable receipt settlement.
Historical records cannot reconstruct ownership after restart.

Installed055237 passed disposable project opening, PCB-frame/full-source
qualification and direct-child project-worker/full-source qualification. Its
optional common observation stopped during constructor metadata, before
precreate, create or Save. The following source update is not connected proof.
Original normal closure, whole-Job termination and release passed, with unchanged
closed fixture bytes. This is partial connected evidence; neither the observation
nor a writer lifecycle completed. The case is terminal and must not be replayed.

## Fixed sequence

All calls below use the new tool's `request` object.

1. `launch`: supply the new operation ID, `confirmValidationOnly:true`,
   `confirmDiagnosticLaunch:true` and `acceptExistingProfileEffects:true`.
   Startup uses the existing EasyEDA profile. It may restore tabs, run
   extensions, contact services and persist data; it is not isolated.
2. Retain the returned `bindingSha256`. Subsequent native actions take it as
   `expectedBindingSha256` with the same operation ID.
3. `browser-observation`, then `inspect-frames` using an actual returned page
   target. Do not guess or adopt target/context IDs.
4. `inspect-script` with the observed root frame and `family:"ui"`.
   This purpose does not accept a different script family.
5. `open-project` with the exact disposable `rawWindowsPath`, path-derived
   `projectUuid`, checkpoint-member PCB `documentUuid` and
   `expectedSourceSha256`; also supply `confirmDisposableProject:true` and
   `acceptNormalOpenEffects:true`. The facade seals the branch and checkpoint.
6. After the accepted project result, `open-pcb` with
   `acceptNormalOpenEffects:true`, then `observe-pcb-opening`. Continue only
   after the original PCB frame, DOM owner, full source, context and tab identity
   have been accepted. An opening acknowledgment alone is insufficient.
7. `inspect-workers`, then `inspect-worker-script` using a target from that
   retained direct-child inventory. The worker's full source and original
   context must pass. No alternate attachment or worker selection after failure.
8. Optionally call `observe-common-baseline` once, before any precreate attempt.
   It uses the complete SQL inventory retained during this operation's original
   pre-open checkpoint, then reads common state from the original PCB context.
   It accepts no checkpoint, observation or SQL inventory from the caller.
   The result compares the surviving common and metadata records with that
   historical snapshot. It does not establish a complete PCB baseline or allow
   writing. A refusal consumes the stage. Only an explicitly retained stored-state
   comparison refusal, after successful reads, group release and fresh identity
   checks, permits the separate precreate read. Its failure and result records
   must first be published or settled from the original bytes. Other failures
   require normal cleanup. Do not retry or open again to bypass a refusal.
9. `observe-string-precreate` once. It accepts no caller program or selector.
   It retains two matching versioned sweeps, then selected original-worker
   producer state, fixed move/startup observations, a finite-effect report and
   six paired UI/worker/PCB actor-clock samples. Failure in
   any part stops the stage; do not retry a component separately.
10. `observe-window`, `normal-close` with that observed `hwnd` and
   `confirmNormalClose:true`, then `observe-termination` until original root
   exit and whole-Job emptiness are proved. Finish with `release-closed` and any
   required `settle-records`. Leave unexpected Save/Discard prompts unanswered.

Every dispatch stage is consumed once, including failed or uncertain attempts.
Never repeat opening or launch under a fresh ID to evade that consumed state.
Use local `inspect` to retrieve retained results. Its observation selector is
one of `browser`, `frames`, `script`, `pcb-opening`, `workers`, `worker-script`,
`common-baseline` or `string-precreate`. The original cleanup and receipt-settlement paths remain
available after a refusal. Do not disconnect the native pipe to close EasyEDA.

After an observation failure, retain `inspect.observationFailure` when present.
Its fixed phase and optional leaf stage/reason describe the primary refusal;
`cleanupFailed` separately reports object-group cleanup. A later
`diagnosticFailureObservation` with reason `input` can be the owner's synthetic
invalidation, even when its last request was a successful model release. Do not
substitute that label for the primary cause. A published failure record survives
restart as evidence only, not ownership; if publication failed while the original
owner remains, use the existing same-byte settlement path rather than repeating
observation. Older cases without this record retain their unknown cause.

## What the result establishes

Each sweep includes compiler state, pending-producer samples, raw Strings,
root inventory, renderer/channel identity, worker/channel identity, selected
empty-producer memberships and raw producer markers. Lazy FP/MI managers retain
distinct absent, undefined, null and present states. An unavailable manager
leaves named baseline conditions unmet; it is never initialized or represented
as proven empty. The runner compares the exact sealed project,
branch, PCB and original window, and the compiler's unique token. It checks
target/frame identity around each sweep and releases its private object group.
The String owner has a fixed3309request ceiling. The no-common path uses215;
the optional common stage uses a variable number of bounded graph packets,
including at most512 packets per graph and one final native result. The separate
diagnostic ceiling remains103. This raises the count of short reads, not their
deadlines, permitted effects or64MiB session byte limit.
The added requests qualify fixed source-owned instance constructors
against the already-admitted original script, exact function location and own
class metadata. V8 can omit top-level-only class bindings from a retained closure;
do not retry an absent binding or replace the check with a matching class name.
Each leaf rechecks its instance/prototype/constructor association. This is not
proof of the original lexical binding. There is no caller-controlled extension.
Inherited-class prototype metadata uses its pinned immediate parent name, not
always `Object`. Do not broaden this to accepting arbitrary prototype names.
The teardrop owner is discovered through six original bound callbacks, with exact
target source/location and empty bound arguments, shared receiver identity and
registry reproof. The pinned Save closure does not retain `Zec`; matching class
names cannot replace this association. No callback or constructor is invoked.

The four model samples retain their combined128KiB limit. Each versioned sweep
is bounded to208KiB; its pair to424KiB. Worker and actor sections each allow
128KiB. Move/startup and finite-effect sections each allow16KiB, giving a712KiB
V3 journal result. Historical V2 retains its680KiB bound. Initial and inspect responses return a
compact summary with the complete record path, result hash, byte count and
publication status. Read that record when details are needed; summary-only
output is not missing evidence. Historical V1 retains its original384KiB bound.
Over-budget evidence refuses, never truncates or downgrades to an older version.

The worker collector uses58 fixed requests, qualifies eight gate/publisher
methods and six callbacks, and reads seven selected producer states. Its
failure leaf retains the phase, request ordinal, cleanup outcome and retained
sample names. Actor/clock sampling uses UI, worker, PCB, PCB, worker, UI; it
compares cached/startup account values with the worker's retained user and exact
JSON field order. Local clocks do not prove backend actor identity, the Windows
clock, Save server time or future use of the sampled user.

Move/startup collection uses12 fixed requests in the original PCB context. It
reacquires the retained V8 scopes, preserves the original replies before owner
callbacks and releases its own object group. The finite-effect report joins
original worker/move packets; it is a list of observed inputs and unresolved
destinations, not proof of complete effects or startup completion. In particular,
late timer samples cannot prove the earlier startup ratline worker's delivery.

Matching sweeps are non-atomic sampled evidence. Matching channel names and
source-shaped bus references do not prove actual message delivery, channel
lifetime, storage partition, exclusive publishers, complete latent callbacks or
queue completion. The result is not a complete saved model or a writer token.
All complete-source, publication, Save and execution authority flags stay false.

## Writer work that remains separate

The package contains dormant fixed create/Save programs, publication-capture
instrumentation, post-create/post-Save readers and supplied-data SQL/history
comparators. The optional common-baseline stage collects raw common presentation,
rules, routing preferences, compiler metadata and empty font/blob holders.
The combined tool now dispatches the original-worker structure, debounce,
cooperation and upload readers plus selected move/startup readers. Complete
publisher confinement and writer programs remain outside it. The common-state graph
preserves aliases, field order, undefined and signed zero; it is not the saved
format or proof that stored and live state match. The private common runner also
retains compiler document metadata and original reply text. Its supplied-data
relation accounts for every surviving target common/META row, raw winning clocks
and history occurrences, and project-tree metadata. Missing stored defaults or
unmodeled rows refuse. The original session retains its own five raw replies
and derives the winning historical DOCHEAD from its completed SQL reader.
Cloned packets, replacement observations and later SQL reads cannot recreate
that session. A later stored-state refusal retains any completed observation
separately from a successful join. This relation does not establish complete
asset ownership, current saved state or an atomic baseline.

The common reader now captures and rechecks descriptors and ordered Map/Set
membership across fixed-size packets. Each packet is new; it does not mutate
earlier packets, iterators or model objects. The final native result preserves
aliases, field order and scalar distinctions. Nested reproof spans several
calls, so a field can change after its check. It is not an atomic snapshot or a
writer baseline. The per-call cooperative deadline and effect checks still
refuse slow or unsupported graphs. They cannot interrupt a blocked intrinsic or
IPC call. Synthetic inspector measurements are not connected latency proof.
A transport deadline does not prove the reader stopped. Keep the
original owner through normal closure and observed whole-Job termination; an
absent window is not exit evidence. Do not repeat the read or disconnect its pipe.
`lastTerminationObservation` reports the last accepted original-root and Job
samples separately. Null means unknown. A partial result never permits release,
and an earlier sample is not a fresh observation after a later failure.

The retained precreate owner now joins its original actor samples to the original
completed pre-open SQL reader. Its private provenance token can be consumed by
the dormant ledger without reissuing or adopting copied evidence. Unresolved
String ledger reservations now block shared launch, bridge and native-edit
admission; JSON claiming completion cannot clear them. Native Windows clock
and Save-clock modules remain private. They are not public create/Save actions.
The fixed Save-time RPC changes its counter and
subscription, so even that observation needs a durable operation intent before
dispatch. Native clock sampling uses the retained original Job/root; it grants
neither a clocked-launch proof nor Save authority. The ledger still needs an
original-owner coordinator for dispatch,
publication, closure, reopen and final acceptance. Never adopt these modules'
JSON as an execution permit.

Raw producer markers preserve lazy managers and timer/notification state without
calling them empty or complete. They complement the selected empty predicates;
they do not override an unmet baseline condition or prove queue completion.

Pure host encoders now model selected native common-record bodies without calling
FileSource. Encoding can omit raw fields; compare the preserved raw graph as well
as encoded rows. Missing descriptor or mutable-unit evidence is a real limitation,
not permission to assume a default. The phase-specific asset relation separately
checks the default text-base manager and the empty custom font/blob holders.
An empty custom-font cache alone does not establish an empty text-base cache.
The default-font box prediction uses exact glyph rounding and matrix arithmetic;
it does not validate outlines, data-state flags, glyph-table provenance or rendering.

V8's retained internal scope wrappers can contain stale primitive bindings.
Producer sampling must reacquire the original function's scope list and selected
scope wrappers for each sample, especially across create or Save. Inspecting a
timer or promise does not establish queue completion: some wrappers retain them
after completion, while the buffered uploader clears them before upload finishes.
PCB and worker handles belong to distinct sessions; cleanup releases the private
object group separately in both, including after partial failure.

Fixed callback source/location profiles do not expose the captured `this` of
class arrows. Same-source callbacks from different instances can have different
hidden receivers. Keep the explicit receiver limitation until original construction
or equivalent provenance is established. Do not invoke callbacks or pause the
debugger to manufacture that proof.
The separate construction-capture component is an unregistered implementation
for a future pre-bootstrap owner. It does not change this tool's no-pause
contract or make its synthetic captured receivers available in EasyEDA.

The complete writer still needs an original-owner lifecycle that joins a full
baseline and producer inventory, one consumed create, actual publication,
one consumed Save, full closed SQL comparison, fresh reopened content and visual
acceptance. A canvas Save acknowledgment can precede backend persistence.
Do not treat it as saved-file proof.

The legacy FileSource exporter is not an innocent read: its rule-preference
fallback can repair live rules, its previous-track-width getter can assign a
default into the live model, and it does not supply every required record family.
The private preference reader preserves raw backing inputs without invoking
those getters or encoding their fallbacks. Do not call FileSource as a shortcut
to complete-source admission. Unsupported
baseline or callback conditions require a new implementation, not relaxed guards.
