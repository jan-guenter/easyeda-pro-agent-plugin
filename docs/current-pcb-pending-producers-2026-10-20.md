# PCB pending-producer observation

## Implemented scope

`current-pcb-diagnostic-pending-program.ts` adds one immutable, descriptor-only
read of the already source-admitted PCB Save-handler closure. It reads upload
buffers, the current command's pending upload count, teardrop queues and a local
worker relationship. It calls no vendor method, callback, timer, factory, Save
or compiler getter. The separate decoder accepts only its bounded JSON reply.

The model-observation runner integrates this fixed `Runtime.callFunctionOn`
with the compiler and raw-String samples. It uses the original admitted
scope-zero handle and callback argument, brackets requests with the same
owner/context checks, and releases the original object group before accepting
the composite. The native helper embeds the exact program. No caller code,
class name, property path or remote handle becomes public input. These separate
samples are not atomic, and connected validation is still pending.

The program is 10,692 UTF-8 bytes, SHA-256
`b99cbde9a9b72274458fea3b11dadd09f36b7e600cee3b67de2bdf632a921f68`.
Its reply limit is 8,192 bytes. Counts are limited to 65,536, and command undo/redo
array lengths to 50. Scalar worker allocation counters use nonnegative safe
integers and reject negative zero.

## Primary installed-source trace

The source was read as text, never imported or evaluated:

`C:\Program Files\easyeda-pro\resources\app\assets\pro-pcb\3.2.193.682ed44e\js\pcb.js`

The reviewed complete file is 10,976,299 bytes, SHA-256
`217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33`.
Offsets below are zero-based UTF-16 offsets. The existing
[model-observation note](current-pcb-model-observation-2026-10-20.md) records
the original closure's source/location admission.

| Producer | Source evidence | Observation |
| --- | --- | --- |
| `qI` copper upload buffer | `4721332` onward, constructor and `upload()` | Optional static `proxy`, own `data` Set count |
| `e5` plane upload buffer | `4839362` onward, constructor and `upload()` | Optional static `proxy`, own `data` Set count |
| `pE` board upload buffer | `4852802` onward, constructor and `upload()` | Optional static `proxy`, own boolean `flag` |
| `De` compound command | `7916642..7921600` | Own command count, waiting-upload count, ID-map count and six flags |
| `Xe` command manager | Class `kde` at `7922234` onward; instance at `10792658` | Undo/redo array lengths and current nullable `De` stack |
| `Zec` teardrop manager | Class `Sfe` at `9092135..9097834`; instance at `10793180` | Three Set counts, `isMove`, `suspend`, timer-presence marker |
| `Of` renderer worker registry | `Cw` at `6436177` onward, alias after class | Worker, bridge, ratline, thread-bus and state-entry counts; allocation counters |
| `FP` dynamic copper | `ON` at `6438262..6439980`, alias `FP` | Original worker ID, bus presence and local registry identity comparison |
| Worker bridge | `Xve` at `13081`, `Cet` at `13743`; selected by `EYe=fd(Xb())` at `6434872` | Raw `bus` and `worker` references, never `rpcCall()` |

The two upload-buffer factories allocate on demand. The reader preserves
absent, undefined, null and present separately. It does not turn an unconstructed
buffer into an observed empty Set. Both upload methods call compiler operations
and then clear their Set. A zero count is therefore not an upload-completion
signal.

`De.upload()` invokes board, copper and plane buffer uploads after its command
loop. `increaseUpload()` copies and empties `waitingUploadStack` before invoking
those command uploads. The observer reads the current command's raw arrays and
flags, not normalized getters or command payloads. Historical undo/redo commands
remain opaque, so their lengths are not a complete inventory of pending work.

`Sfe.flushService()` schedules a zero-delay timeout. The callback can remove and
add teardrops, clear Sets, request incremental uploads and publish additional
work. `suspend:true` does not mean idle: that branch performs the immediate
merge/remove/add sequence. The reader reports the flag verbatim. It does not
infer timer execution or downstream completion from a null field. The HTML
timer specification schedules callbacks as tasks and does not promise exact
delivery time, so an elapsed delay cannot supply completion evidence.
[HTML timer algorithm](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers)

## Worker association has a narrower meaning here

`Cw.addWorker()` stores the Worker in `map[id]`, constructs a `Cet` bridge using
the current PCB message bus, stores that bridge in `busMap[id]`, then advances
its counter. `ON.addWorker()` retains the returned bridge and the allocated
ID before awaiting worker initialization.

For a present dynamic-copper ID, the reader compares these original local
references:

```text
FP.manager.workerName -> Of.manager.map[id] <- FP.manager._bus.worker
FP.manager._bus      == Of.manager.busMap[id]
FP.manager._bus.bus  == MSG_BUS_PCB.messageBus
```

ID 0 is valid and remains present. The observer reports `matched` only for the
three reference equalities plus the reviewed bridge prototype shape. Missing
registry, worker or bridge, and each unequal reference, have separate outcomes.
A malformed descriptor, unexpected class or collection encoding refuses.

This does not associate the JavaScript Worker object with a CDP target or prove
that the worker remains alive. It also does not bind a renderer to the separate
project database worker. The local registry can retain a worker after its work
has stopped, and a bus can exist while initialization is still pending.
`projectWorkerAssociationVerified`, `workerLivenessVerified` and all completion
or execution-authority claims remain false.

## Effect checking and bounded output

The fixed program requires `throwOnSideEffect:true`, `returnByValue:true` and
`silent:true`; `awaitPromise`, `generatePreview` and `userGesture` are false.
It reselects the original Save callback before and after observation and
rechecks the retained descriptor owners before returning.

Only exact own data descriptors are read. Set/Map sizes use their intrinsic
accessors, never instance methods. Collection entries, command payloads,
worker messages, paths, document titles, primitive values and client identity
are not serialized. Key counts still require bounded-result enumeration of the
already selected raw registry objects; this is not a constant-time proof.

The existing non-pausing route depends on V8's internal scope wrapper. This
leaf does not add a paused-frame fallback or arbitrary scope traversal.
`Runtime.callFunctionOn` supports effect checking and by-value returns; the
owner must still enforce its deadline and original object-group release.
[CDP Runtime contract](https://chromedevtools.github.io/devtools-protocol/tot/Runtime/#method-callFunctionOn),
[V8 scope representation](https://github.com/v8/v8/blob/14.6.172/src/inspector/value-mirror.cc)

## Verification and remaining work

Four focused tests pass under pinned Node 24.18.0. They cover optional producers,
worker ID 0, each structural mismatch, malformed raw fields, payload/getter
exclusion, duplicate keys, invented authority and hostile transport objects.
One real in-process Node inspector test executes the fixed program on synthetic
objects with effect checking enabled. A mutating proxy is rejected without
running its side effect. This does not qualify EasyEDA's Electron/V8 build or
original live scope admission. Strict targeted type-aware lint and full plugin
TypeScript checks pass.

Still required before writer enablement:

- Disposable connected qualification of the integrated owner/protocol/native route.
- Renderer-to-project-worker and CDP worker association, plus retained original
  completion evidence rather than matching counters.
- Other producer families and command-history payloads where relevant. This
  bounded snapshot deliberately does not claim a complete producer inventory.
- Full raw String/model membership, one-shot mutation and Save ownership,
  complete closed SQL/content checks and fresh saved/reopened verification.

No application, design, project record or live control data was accessed.
