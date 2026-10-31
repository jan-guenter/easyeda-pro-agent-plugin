# Read-only disposable upload-cache qualification

Use this route to investigate the native `caches` getter and `CacheStorage.match`
on the pinned EasyEDA Pro 3.2.209 UI realm, without opening the selected project
or running a footprint copy. It retains one original getter/constructor/
prototype/match tuple across a first observation and a separately requested
fresh observation. Both observations read both upload-cache namespaces.

This is a separate public validation purpose, `footprint-held-cache209`. It is
not the private held-saved generation, the older saved profile, combined worker
validation or ordinary design control. Source implementation, focused offline
checks and native compilation do not establish a connected result. Query the
actual installed catalog before choosing the route. An earlier installation
may not expose it.

## Discover and validate offline

Ask `easyeda_control_api` for the schema and current limits:

```json
{"request":{"action":"footprint-held-cache","query":{"includeSchemas":true}}}
```

Validate each exact inner request before execution:

```json
{"request":{"action":"footprint-held-cache-validate","query":{"request":{"action":"inspect","operationId":"footprint-held-cache-example-01"}}}}
```

These calls are offline. They allocate no native owner, launch no app, read no
selected project and grant no runtime or replay authority. Do not pass the
outer execution wrapper to the inner validator.

Execute through `easyeda_control_pcb209_worker_startup` using:

```json
{"request":{"action":"footprint-held-cache","request":{"action":"inspect","operationId":"footprint-held-cache-example-01"}}}
```

The tool name is shared with other startup investigations; this wrapper does
not create or capture a project worker. Each launch purpose is sealed before
allocation. An ordinary app, previous owner, copied packet or historical
journal cannot be upgraded to it.

## Select the exact disposable target

Use a new operation ID beginning `footprint-held-cache-`, containing only
lowercase letters, digits and hyphens, with 24 to 80 characters total. The
suffix starts with a letter or digit. Retain the same ID and original Codex
session through cleanup; changing IDs does not reset a consumed attempt.

The `launch` inner request has exactly these fields:

| Field | Required value |
| --- | --- |
| `action` | `"launch"` |
| `operationId` | A fresh ID under the prefix above |
| `target.rawWindowsPath` | The exact canonical absolute Windows path to the already registered disposable `.eprj2` file |
| `target.projectUuid` | The 64 lowercase hexadecimal SHA-256 of that exact UTF-8 path string |
| `target.documentUuid` | The existing checkpoint-member PCB UUID, 16 or 32 lowercase hexadecimal characters |
| `target.expectedSourceSha256` | The current complete file's 64 lowercase hexadecimal SHA-256 |
| `confirmValidationOnly` | `true` |
| `confirmDiagnosticLaunch` | `true` |
| `confirmDisposableProject` | `true` |
| `acceptExistingProfileEffects` | `true` |
| `acceptCacheReadEffects` | `true` |

Do not normalize, recase or substitute the path after calculating the project
identity. Caller-supplied branch IDs, runtimes, engine tuples, receivers,
callbacks, script text and qualification flags are rejected. The controller
derives the default branch from the actual complete closed-file SQL inventory.
The document selects and verifies the disposable checkpoint member; this route
does not navigate to that PCB.

Launch first creates and verifies a managed checkpoint and completes the SQL
reader. The separate factory independently verifies those original references,
the current source/checkpoint and machine runtime before allocating its helper.
The factory retains the actual owner before installing helper listeners, so a
later factory failure does not make an allocated helper disappear. Matching
JSON cannot reconstruct that custody.

The route then launches EasyEDA itself and automatically qualifies the original
browser engine, page, UI source and parent realm. It requires the source-qualified
Start Page with no active project/PCB transition. There are no public browser,
frame, worker or project-opening actions in this grammar. Do not manually open
the target to satisfy a refusal.

Browser readiness reads the engine version once and observes at most sixteen
target inventories, with 250 ms between valid samples. The original admitted
backend path identifies its fixed local loading window. That window permits
waiting, including while one exact editor page is present, and must disappear
before selection. Two consecutive complete inventories must then match exactly
with one unattached editor page. A title change, another target field change,
loader return or transient empty/about:blank inventory resets the candidate.
Unrelated, malformed, duplicate or attached pages stop immediately. The same
sixteen samples and fifteen waits cover all transitions; one last unmatched
editor sample exhausts the bound.

V2 startup diagnostics retain every candidate classification, count and complete
inventory hash without exposing URLs, titles or new V1 fields. These inventory
hashes cover the exact JSON serialization used by the runtime comparison,
including field order. V1 used canonical JSON hashes. Historical V1
snapshots retain their original parser and meaning. Two matching samples are
sequential observations, not atomic stability or complete startup. Selection
still requires all original frame/source/Start Page checks. The exact target
comparison before frame capture remains unchanged, and later drift still
refuses. This is bounded waiting within one consumed launch. There is no retry
after return, frame capture or a failed launch. `inspect` retains its failing
stage and bounded observations.
One bounded startup packet and original binding are journaled on launch failure,
including a late failure after an accepted abort.
An exact frame-target refusal can also retain one separate private failure
packet with before/after complete-inventory hashes, target presence and fixed
changed-field flags. The original Error issues that packet through a private
WeakMap, and the controller consumes it once. It preserves the refusal message,
retains no raw titles or URLs, and fits the existing 8192-byte startup reserve
with the startup snapshot and binding. This evidence grants no owner or retry
authority and does not weaken the frame comparison.

Read-only describes the requested cache work. Existing-profile startup can
restore tabs, contact services, change shared state, migrate or automatically
persist files. The launch flags acknowledge those effects; they do not promise
profile isolation or unchanged storage. Leave unexpected Save/Discard choices
unanswered unless separately authorized.

## Observe and release in order

All continuation requests contain only `action` and the original `operationId`,
except `abort`, which also requires `confirmOriginalJob:true`.

| Action | When and what it proves |
| --- | --- |
| `launch` | Prepares the selected checkpoint, allocates the distinct original owner and qualifies its initial UI realm. It does not open the project. |
| `observe-first` | Once after launch. Qualifies the complete fixed native metadata roster, invokes the retained getter once, retains its receiver and samples both namespaces. |
| `observe-fresh` | Once after the first published result. Samples both namespaces again using the same retained tuple and sealed project/branch pair. |
| `release-cache` | Once after a first or fresh observation. Releases the original remote object group and requires its actual acknowledgment. |
| `normal-close` | Once for an original launched root. Attempts any still-unattempted held-group release, observes the original window and requests normal closure without a Save/Discard choice. |
| `observe-termination` | Separately observes original root exit and an empty original Job. Up to 240 observations are available; a close or abort acknowledgment is not exit. |
| `release-closed` | Only after original termination was observed. Releases retained native/helper resources and waits for helper closure. |
| `inspect` | Reads bounded retained status and journal summaries. It issues no new cache observation and cannot adopt a historical owner. |
| `settle-records` | Publishes this controller's retained unpublished evidence only. It retries no launch, cache call, close, abort or release. |

Each namespace sample brackets two noncreating `CacheStorage.match` calls with
three fixed inactive-project RPC observations. For branch `B` and project `P`,
the request URL is `https://client/upload/B`, with fixed cache names
`project_P_v6` and `localProject_P_v1`. A successful result requires no active
target project, no controlling service worker, and `undefined` from both
matches. No response body is read. There is no cache enumeration, cache
creation, clearing, deletion, network fallback or retry.

The first stage checks the complete pinned constructor, prototype, match and
getter metadata before invoking the getter. Later checks compare the actual
same-realm tuple and receiver rather than treating a received CDP object ID or
native-looking function string as identity proof. The fresh stage rejects a
different project/branch pair. These checks remain specific to the exact engine
tuple, including Chrome 146.0.7680.188 and the pinned EasyEDA/Electron build.

The private retained observation packet reports its stage, two namespace
matches, conformant metadata and the original tuple recheck. Public actions
return bounded inspection summaries, not that raw metadata packet.
`nativeQualificationIssued`,
`runtimeAdmissionGranted`, `replayTokenIssued` and `executionAuthorized` remain
false. The namespace absence flags are sequential point observations. Neither
the gap between first and fresh nor the period after fresh is continuously
observed. A mismatch or failed match is a consumed failed observation, not an
invitation to clear caches or try another namespace.

## Abort without a late normal continuation

Use `abort` with `confirmOriginalJob:true` only when termination of this original
diagnostic Job is authorized. It has a separate abort lane while an observation
is pending. The controller synchronously reserves the actual owner's cutoff
before its first settlement or journal await. That reservation stops queued and
later normal work, retains an opaque token tied to the original root, and makes
no native call. The controller then publishes durable abort intent and
dispatches that token once. A copied token, another owner, a second dispatch or
a released root cannot authorize a native write.

Intent-publication failure leaves abort consumed and undispatched. Use
`inspect` and the offered `settle-records`; evidence settlement cannot dispatch
the reserved abort. Do not send another abort or allocate another owner to
replace it. The original pending stage must settle before normal cleanup can
use its busy lane. An abort never clears another stage's busy flag. A late
successful observation cannot restore first/fresh eligibility or normal work.

Only the original retained Job can be terminated. The action accepts no PID,
window, replacement owner or force-kill target. A missing original root refuses
without inventing a binding. After dispatch or uncertainty, keep the owner
alive, observe actual root/Job termination separately, then `release-closed`.
Abort acknowledgment proves no discard, rollback or saved-state invariance.

## Failure and allocation cleanup

After a timeout, rejected metadata, context drift, missing acknowledgment or
publication failure, inspect first. Each attempted native stage remains
consumed. A failed release acknowledgment cannot be replaced by later process
exit or a fabricated release result. The original owner retains cleanup even
when an observation or evidence publication fails.

Use only the allocation cleanup actually offered by `inspect`:

| Action | Required original outcome |
| --- | --- |
| `cleanup-no-resource` | The genuine factory reports that allocation was never crossed. A missing owner or failed return alone is insufficient. This records no native exit or release proof. |
| `cleanup-unlaunched` | The original retained helper proves application launch was never attempted. It releases that helper without claiming application termination. |
| `cleanup-no-process` | The original helper proves its attempted launch produced no application process and offers that cleanup. |

An unresolved allocation remains reserved. Historical inspection reports data
only; a restarted facade cannot recover native ownership from operation IDs,
PIDs, tokens or journal JSON. Complete required cleanup and record settlement
before ending the session or starting another native generation.

## Limits and excluded authority

The fixed native/pipe budget is at most 34 discovery requests, eleven normal
held-cache requests and one cleanup request, for 45 normal and one cleanup
request in total. Physical IDs are global within that owner, not reset for each
phase. Each held reply is bounded to 32 KiB, with a 33,024-byte framed cleanup
reply bound and a 15-second outer request deadline. Unsupported or excessively
fragmented input can refuse; reserved cleanup capacity is not a universal
completion guarantee. Journals allow at most 512 records of 512 KiB each within
an 8 MiB aggregate operation ceiling. Normal progress cannot consume the fixed
cleanup record/byte reserve. Read `limits.journal` from offline discovery for
the derived normal, cleanup and once-retained raw-evidence partitions; they are
fixed limits, not caller overrides. Inspection returns bounded summaries rather
than raw constructor metadata.

This purpose supplies no worker capture, project open, copy/delete, native
transaction clock, arbitrary main-process request, CAD edit, explicit Save,
saved-copy proof or saved/reopened content verification. The full held-saved
writer composition remains private and unavailable through this wrapper. The
older saved profile's 353-request contract is unchanged. Cache qualification
does not close the wider SDK-method backlog.

For implementation and publication work, use
[$easyeda-extension-development](../../easyeda-extension-development/SKILL.md).
For original combined main/worker observations instead, use the distinct
[combined workflow](current-footprint-combined.md). Do not substitute either
purpose for the other.
