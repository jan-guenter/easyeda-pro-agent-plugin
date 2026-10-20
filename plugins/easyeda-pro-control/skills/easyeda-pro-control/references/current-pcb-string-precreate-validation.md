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

Installed20202000 passed one disposable project opening, PCB-frame/full-source
qualification and direct-child project-worker/full-source qualification. Its
combined observation stopped at the pending-work reader, before create or Save.
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
8. `observe-string-precreate` once. It accepts no caller program or selector.
   It retains two matching sweeps from the original PCB and worker contexts.
9. `observe-window`, `normal-close` with that observed `hwnd` and
   `confirmNormalClose:true`, then `observe-termination` until original root
   exit and whole-Job emptiness are proved. Finish with `release-closed` and any
   required `settle-records`. Leave unexpected Save/Discard prompts unanswered.

Every dispatch stage is consumed once, including failed or uncertain attempts.
Never repeat opening or launch under a fresh ID to evade that consumed state.
Use local `inspect` to retrieve retained results. Its observation selector is
one of `browser`, `frames`, `script`, `pcb-opening`, `workers`, `worker-script`
or `string-precreate`. The original cleanup and receipt-settlement paths remain
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
root inventory, renderer/channel identity, worker/channel identity and selected
empty producer memberships. The runner compares the exact sealed project,
branch, PCB and original window, and the compiler's unique token. It checks
target/frame identity around each sweep and releases its private object group.
The full supported route has a fixed 90-request limit; the diagnostic route
remains at 64. There is no caller-controlled extension.

The four existing diagnostic samples retain their combined 128 KiB limit.
Each complete sweep is bounded to 184 KiB; the paired result is bounded to
384 KiB. Over-budget results refuse, never truncate. The shared transport and
source limits still apply.

Matching sweeps are non-atomic sampled evidence. Matching channel names and
source-shaped bus references do not prove actual message delivery, channel
lifetime, storage partition, exclusive publishers, complete latent callbacks or
queue completion. The result is not a complete saved model or a writer token.
All complete-source, publication, Save and execution authority flags stay false.

## Writer work that remains separate

The package contains dormant fixed create/Save programs, publication-capture
instrumentation, post-create/post-Save readers and supplied-data SQL/history
comparators. Separate private runners now collect raw common presentation,
rules, routing preferences and empty font/blob holders, and inspect selected
move, structure, debounce, cooperation and upload producer closures. This tool
does not dispatch those runners or any writer program. The common-state graph
preserves aliases, field order, undefined and signed zero; it is not the saved
format or proof that stored and live state match.

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
