# PCB String latent producer closures

This source-only batch supplies fixed selectors, scope decoders and raw closure
observations. Nothing dispatches them through EasyEDA yet. No writer, Save,
completion claim or extra SDK coverage follows from these modules.

## Exact sources

The inspected files are the installed vendor assets. Offsets are UTF-16, not
UTF-8 bytes. The enclosing owner still has to admit the complete asset and its
original frame or worker before using any location below.

- PCB `pro-pcb/3.2.193.682ed44e/js/pcb.js`, 10,976,299 bytes,
  SHA-256 `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33`.
- Worker `pro-mgr/3.2.184.355087e9/js/project-worker.js`, 2,181,284 bytes,
  SHA-256 `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928`.

| Selected function | Original factory | Function location | Selected lexical scopes |
| --- | --- | --- | --- |
| PCB `eL` | 7,885,835 | 7,885,891 | `Closure` |
| `uploadStructure`, `structure` serial wrapper | `Nd` at 1,847,033 | 1,847,074 | `Closure (Nd)` |
| `structure` serial callback | `QA` at 2,011,134 | 2,011,184 | `Block (QA)`, `Closure (QA)` |
| `bufferedPendDataStream` | `ZA` at 1,856,028 | 1,856,082 | `Closure (ZA)` |
| `bufferedUploadCloud` | `bufferedStream` at 2,029,648 | 2,029,707 | `Closure (bufferedStream)` |

`current-pcb-string-producer-scope.ts` also pins each returned function's exact
source bytes and hash. It checks all ordinary function property descriptors,
the original script ID and V8 function location before returning leading scope
handles. Only QA needs two leading scopes. Its default parameters put `e/t/s`
outside the block holding `r/i`. Missing or optimized-away variables refuse.
No caller may provide code, field names, function paths or scope indices.
The descriptor copier has a total 512-node/64-KiB string-and-key budget in
addition to depth 9, 32 own keys per node and 4-KiB string limits.

Inert Acorn parsing of both complete assets confirms that the outer IIFEs and
the `eL`, `Nd`, `QA` and `ZA` factories have no strict directive. The ordinary
returned `eL` and `QA` functions therefore retain their native own
`arguments/caller/prototype` properties. `bufferedStream` is a strict class
method, but its returned arrow has only `length/name` own properties. The
source contract does not infer strictness from an extracted fragment alone.

## What the fields mean

The PCB move closure retains timer `o`, selection array `t`, builder `e` and
command `r`. Normal completion clears the timer, builder and command, but does
not reset the selection array. A visible idle tool is not evidence about this
closure, and a retained selection need not mean the timer is still active.

`Nd` retains an in-flight promise `t`, queued promise `s` and last arguments `r`.
It clears the promise references in its completion paths but leaves the last
arguments. The observer returns the dense argument count, not argument values.
A present promise marker says a reference is retained; it does not inspect the
promise's internal state or invoke `then`. Only the exact realm Promise
prototype is accepted. Own promise metadata is not inspected or promoted to
completion evidence. This also permits Node's synthetic async-hook symbols.

`QA` retains timer `r` and resolver `i` after its returned promise settles.
`present/present` therefore means retained schedule markers, not necessarily a
pending timer. The observed default delay must be 300 and leading mode false.
The pure interpretation preserves mixed marker states separately. It does not
declare them idle or repair them.

`ZA` owns a dense batch array `s` and two timers `r/i`. Its first timer schedules
the second; the second invokes the callback, clears the array, then clears `i`.
An exception can interrupt that sequence. The observer retains all three fields
and requires the original 10 ms delay.

`bufferedStream` owns timer `r`, promise `i`, resolver `n`, project `a` and the
fixed 500 ms delay. Its upload callback clears all three fields before awaiting
the upload function. The old promise remains in project `task1` through that
await. Null closure fields alone therefore cannot prove upload completion.
The observer does not invoke upload, delete tasks, settle promises or flush
timers. The source's `o/c/t` callback bodies still need their own original
relationship admission before any writer can rely on them.

## Scope wrappers are snapshots

Actual Node 24.18.0 inspector tests expose a subtle trap. A previously obtained
V8 internal scope wrapper can keep scalar values from its acquisition. A
retained `Nd` scope still returned its former null `t` after a new pending call
had assigned a promise. Fresh `[[Scopes]]` and scope descriptors returned the
new promise. The same function handle remained original throughout.

Acquire new function-property, scope-list and selected-scope handles for every
sample and phase. Retain the original function and source owner, not the old
scope values. Release only the owned remote-object group. Object values inside
a scope can remain live references while its scalar bindings are snapshots;
these reads are not atomic and must never be advertised as such.

The current diagnostic Save-handler scope contains retained class/manager
objects rather than these changing scalar bindings. This finding does not by
itself prove that diagnostic evidence was wrong. New closure readers must
account for it, and any future cross-phase writer must reacquire its scopes.

## Integration and omissions

The new programs and `CurrentPcbStringProducerRunner` are unregistered. A separate writer owner must retain the
already admitted original PCB Save-handler scope and callback for selecting
`eL`, and the original worker's exact project for its four selected fields.
For each function it must check exact bytes/location, reacquire leading scopes,
perform the fixed effect-checked read, and release the owned group. QA's parent
`Nd.e` reference is checked again; worker project, branch and window identity
must match across samples. A separate renderer/worker association remains
required because the move observation carries a document, not worker identity.

The dormant one-shot runner composes six observations in 34 fixed commands.
It obtains the original PCB callback and Save-handler scopes, the selected move
function, four worker functions and the nested QA function using only compiled
selectors. Mutable lexical scope wrappers are fresh for each observation,
including a fresh serial scope before selecting QA. The original admitted PCB
and worker session/context/script IDs and the target identity are copied into
the runner. Its private transport must recheck both original owners before and
after every normal request. No handles come from public tool arguments.

One private object-group name exists in two different sessions. Successful
observation includes a separate release in each. Failure attempts cleanup for
every session where a request started, even if the other release fails, and
withholds the result. No failed phase can be retried on the same runner. A
final original-owner check precedes return. This adds no native protocol action
and does not change either existing live owner request budget.

`current-pcb-string-producer-observation.ts` joins supplied worker identities,
retains all raw observations and labels stale markers without inferring
completion. It leaves original owner, full producer inventory, atomic snapshot,
renderer/worker association, queue completion, Save and execution authority
false. Original callback/source relationships, queued message delivery,
publisher/subscriber admission, full model/assets and the complete durable
effect are still separate requirements. No generic scope inspection is exposed.

Tests use exact small returned-function excerpts in synthetic factory contexts
and actual in-process V8 inspector calls with `throwOnSideEffect:true`. They
cover all five fixed locations, QA's two-scope layout, stale scope wrappers,
retained QA markers, the active-upload/null-fields interval, malicious getters,
proxy refusal without executing traps, source drift and malformed replies.
They run no EasyEDA process, open no project and issue no native Save.
