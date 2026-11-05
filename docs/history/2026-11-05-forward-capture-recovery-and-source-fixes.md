# 2026-11-05 forward capture stall and source recovery work

Initial checkpoint, preserved before the terminal updates below. This records the evidence available at the draft cut. Original controller closure and recovery remain pending. The selected running payload was kept unchanged throughout the investigation.

One disposable forward capture was dispatched once from the frozen, unpublished `0.3.0+codex.20261104190023` candidate, commit `15dc1cc6fed3bb90cfebfff3e3ea3bf3cd45da8c`. The original main, browser, frame and UI-source stages had completed before capture. Capture did not return before its 3,720,000 ms SDK deadline. The manager retained a dispatched request-timeout record and the original connection, blocked normal work and replacement, and kept the capture outcome unknown. The timeout did not cancel the facade callback, free its gate or prove process exit.

A supported same-connection inspection after timeout confirmed `busy:true`, an unsettled opening, and no published capture result. The original worker channel reported a fatal write failure with 13 retained replies. Its first recorded exchange failure was request 137, `Debugger.setBreakpoint`, refused with `pcb-diagnostic-forward-renderer-envelope`. Cache construction had attempted arming, sent one request, received no reply and remained unarmed. Its retained first failure was `CHANNEL_LOST`. These observations match the independently identified source-level arm wait; elapsed time alone was not used to diagnose the stall.

Source inspection found two separate defects. The fixed cache-command table inherited schema property order and encoded `sessionId` before `method`. The unchanged forward renderer guard requires the serialized envelope to begin with `id` followed by `method`. All fourteen original cache cases had this mismatch even though their decoded command values were valid. The corrected generator explicitly emits `method`, `params`, then `sessionId`, after strict parsing. It preserves command semantics, methods, source limits, launch purposes and counters. Generated C# smoke now checks the actual request-137 prefix for every case as well as its hashes. The regenerated helper is 1,041,942 bytes, SHA-256 `ad8a44744791fdba1c30c07554455cb7c271d1125a378edd4f6fa4566cb979c6`, leaving 6,634 bytes under the unchanged 1 MiB limit. Owner and smoke pins match. Windows execution of that C# smoke remains pending.

The second defect was an unbounded cache-arm wait on an allocation reply that the shared channel deliberately retains after fatal failure. The registered loss callback marked the cache runner failed but could not finish that await. Its enclosing capture and cleanup joins could therefore remain pending. The new isolated source change races only the caller's arm wait against channel loss and the existing two-second request deadline. It retains the original allocation Promise and any late breakpoint identity, preserves the first failure and permanently denies normal continuation, replay or cache cleanup dispatch while allocation is uncertain. It does not reject or remove the shared channel's allocation entry. Final release still requires the existing original root and whole-Job exit proof.

The original observe-termination cleanup request was submitted once after timeout. It has a retained intent and no returned result at the draft cut. In this frozen implementation, the facade queues that action behind capture through `bridgeGate`; it does not reach the lifecycle's busy guard immediately. Only inspection and the supported confirmed original-Job abort bypass that gate. The generated cleanup call has its own finite 3,720,000 ms caller deadline, which does not remove the queued facade task. No cleanup result or replacement permission is inferred from either timeout.

The user had separately authorized terminating the exact EasyEDA application processes. A read-only audit and the reviewed external helper held real process handles and checked creation identities, ancestry, pinned image path and image hash. The first helper run cancelled on confirmation EOF with no termination attempt. After correcting the wrapper's stdin wiring, the second run terminated each of the five verified held application handles once and observed all five exit with the distinct forced code `0x45445854`; no native error was reported. The helper did not target the gateway or its supervision helper, edit a lease or alter journals. This external intervention proves the selected application-handle exits only. It supplies no normal-close acknowledgment, whole-original-Job proof, original helper-release acknowledgment or sealed normal-close baseline.

A separate future manager source change permits bounded inspection and explicitly confirmed original abort while one exact forward capture is pending. It binds the retained original client, generation, request, operation and binding, serializes evidence and output, and admits no normal call, replay, launch, retirement or replacement through that lane. Its source limit is sixteen side calls per capture, each with a 120,000 ms SDK bound. It cannot add this route to the already running controller. The parallel structure-completion observers also remain unmounted source work; their native purpose, transport budget, cross-realm operation join and complete closed-SQL proof are still incomplete.

Focused verification is recorded by selection, without an invented combined unique-test total:

- The structure observer proof records 39 distinct tests across its six-file roster. Its separately reported worker/model/main selections overlap within that roster and are not added again.
- The manager pending-call selection passed seven actual-SDK tests using inert child peers. This is a selected regression batch, not the full manager suite or a connected EasyEDA test.
- The cache-construction selection passed ten tests, including the held-allocation loss/deadline and late-identity regression, plus maintained inert V8 breakpoint checks.
- The native cache-codec selection passed two tests covering all fourteen templates and closed grammar refusals. Those pure codec checks do not execute C# or a native application.

The corresponding source checks report clean types and strict targeted lint. The new source work has not repaired the frozen running controller, and no combined release/build, Windows smoke or fresh connected qualification is claimed for these fixes here.

At this draft cut, the original capture remains unknown, its observe-termination task remains queued, and genuine original termination, helper release, facade retirement and controller closure are unproved. A separate request for explicit permission for at most two normal SIGTERM signals to this one verified active facade remains unanswered; no such signal has been issued. The existing idle-host exception is not treated as authority for this active owner. Any later authorized closure must be appended with its actual result and retained identities. Historical evidence remains intact, and process exit alone cannot recreate ownership or authorize a replacement. This case has not reached source qualification, source sealing or complete closed-SQL baseline acceptance. No writer or explicit Save action was dispatched or granted.

## Terminal physical closure, appended 2026-11-05

The earlier pending-permission and physical-closure statements above describe the first draft cut. The user subsequently approved one bounded exception of at most two normal SIGTERM signals to the exact verified stalled facade. The reviewed second helper version refused optimized Python, independently fixed the original process identity, checked the pinned runtime and helper bytes, and retained the original pidfds throughout. The idle-host exception was not used to authorize this active-owner intervention.

The first SIGTERM was sent at 23:45:14 UTC on November 4. The original facade remained alive through the twenty-second observation window. One further approved SIGTERM was then sent through the same held pidfd, and its exit was observed at 23:45:34 UTC. The original Linux interop proxy also exited. A separate read-only Windows query, bound to the earlier exact broker creation identity, found that broker absent. That query exited normally with code zero in under one second. Proxy exit and broker absence are recorded separately. Exactly two SIGTERMs were sent to the facade; no SIGKILL, supervision-helper or other-process signal, manual lease change or journal edit was performed.

The original manager recorded `connection-closed` for the already queued observe-termination request. Its native outcome remains unknown, as does the earlier timed-out capture. After no owned facade process remained, the original manager accepted its supported local shutdown request. Root observed its execution session exit with code zero at 23:47:58 UTC. These observations establish terminal physical closure of the retained controller resources. They do not establish a successful capture, original whole-Job termination acknowledgment, formal native helper release or cooperative facade retirement. The external application termination remains ineligible for a normal-close source baseline.

The original thirteen-record journal was preserved. No source, route, seal or later cleanup stage was inserted, replayed or inferred. Typed historical relinquishment remains pending. Installed `0.3.0+codex.20261104120101` accepts this operation-ID grammar and original record roster, but its historical intent schema fixes an earlier original facade and installation tuple. Both producer digests in this frozen candidate's intent differ from those fixed literals, so the installed resolver is not compatible with this history. The newer source/seal actions were never invoked; that fact does not override the producer pins. Supporting this exact newer tuple requires separately reviewed recovery code while preserving released historical schemas and the existing fresh process, global-exclusion, raw-file, complete SQL and history checks. Physical closure alone supplies none of those missing proofs.

No writer or explicit Save was dispatched. The failed capture is never replayed. The frozen selected package may remain available for recovery comparison, without a live retained controller or reconstructed native authority. The source fixes and source-only verification reported above remain separate from publication, installation and a successful fresh native qualification.

## Exact-producer recovery adapter, appended 2026-11-05

The source-only adapter for this exact lost producer is now implemented. The released profile and its v1 historical intent/result declarations remain byte-for-byte unchanged. A separate strict producer alternative accepts only facade `bf9650e7c9b85c698e23fcbf08833dff71aef42f39f1da599e36d1ec5198f1a5` paired with installation `4c593053fa7991e49ec0fc7af317a769ee9aa6454d48ea01c31219464eb907d4`. It selects distinct v2 relinquishment intent/result markers from the private original snapshot, without a caller profile flag or arbitrary producer hash. Mixed pairs, digest drift and extra source/seal/later-stage records refuse. The older exact producer pair continues to use its immutable v1 markers.

The same fresh global/process exclusions, complete raw-file/SQL/history proof, original descriptor and digest joins, retained publication plan and exclusive sidecar writes remain mandatory. Capture, termination and helper-release outcomes stay unknown; all owner, writer and Save authority fields remain false. The original thirteen journal files were rechecked byte-for-byte unchanged. This source change does not itself write a historical marker or prove a normal-close baseline.

Five focused managed-history tests passed, comprising four maintained v1 cases and one added exact-producer case. The added case covers mixed/unknown producer refusal, injected caller profile refusal, extra source-stage refusal, fresh Windows-presence and file-proof refusals, v2 managed publication/read/global-blocker checks and preservation of all thirteen original files. An initial focused run exposed the old-only global dispatch predicate; the failure was retained and that predicate now selects only the two exact whole-object profiles before the unchanged full rereads. Types, strict targeted lint and independent source review passed. These five selected tests are not added to the earlier overlapping verification selections as a new combined unique-test total.

Typed live historical recovery remains pending. No new recovery call, marker publication, owner adoption, successful native qualification or Save is claimed. A separate read-only post-closure raw-file audit matched the registered source exactly and found no SQLite sidecars; it was a point-in-time raw comparison without a SQLite connection. The typed resolver must still collect its own fresh complete SQL/history and process-exclusion proof.

A stable trusted-producer capsule is future design work only. It could bind the original emitted contract, committed payload manifest and expected roster before launch, but would require authenticated pre-admitted payload provenance and original publication custody. Caller-supplied capsules or hashes would remain insufficient, and all fresh recovery guards would remain. This adapter implements only the two explicitly reviewed producer pairs.

The originating [PR167 release record](2026-11-04-pr167-controller-release.md) retains its earlier pending native checkpoint and links this continuation. The [operating reference](../../plugins/easyeda-pro-control/skills/easyeda-pro-control/references/current-footprint-forward-prewrite.md#historical-opening-without-its-original-owner) describes the strict recovery boundary.

## Typed historical recovery completed, 2026-11-05

The exact v2 resolver completed on the frozen, unpublished candidate at commit
`0ebd4c498a37148e61a9e69f7695126ab794b77e`, version
`0.3.0+codex.20261105000443`. The standalone frontend and its actual original
facade were independently admitted before dispatch. Complete Git comparison
covered all 2,568 packaged files, 51,376,133 bytes and committed modes. The
selected package stayed unchanged through recovery and retirement.

The resolver collected its own fresh Linux exclusions, both Windows absence
observations, completed independent SQLite readers and full materialized
history. Raw source, complete logical SQL and history matched the original
baseline, with no SQLite sidecars. Its versioned result relinquished the
historical startup blocker. The original thirteen records were independently
rechecked with identical bytes, modes, descriptor/path identities and roster.
The persisted result matched the returned result and its intent linkage;
the result's canonical SHA-256 is
`59062c35d81c8b0afd464d99d12fe3df7cb9ab4ac4d69820a8d65857d0453876`.

Capture, termination and helper-release outcomes remain `unknown`.
Termination proof, native resource release, original launch authority and all
execution, design and Save authority fields remain false. No original owner
was adopted, failed capture replayed, project restored or Save dispatched.
The earlier external process closure remains separate from formal native
termination and helper-release acknowledgment.

The fresh recovery facade then acknowledged cooperative retirement with zero
active calls, closed live admission and released its lease. Its original stdin
EOF, process exit with code zero, absence of a signal and stdio closure were
observed. The standalone manager remains between facades for the verified
installation/replacement sequence; retirement of this fresh facade supplies no
missing acknowledgment from the earlier lost producer.

This run took about 34 minutes between the retained call-intent timestamp and
response-file publication. That interval includes validation and publication
and is not a performance benchmark or duration guarantee. Repeated full-journal
validation is a concrete performance backlog item. The source fixes, later PR
corrections and fresh forward qualification retain their own validation scope;
this recovery does not establish connected coverage for them.
