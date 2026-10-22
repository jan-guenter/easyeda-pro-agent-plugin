# PCB String producer callback admission

This source-only batch adds private selectors and metadata checks for six
callbacks behind the existing producer wrappers. It does not register a tool,
run a native callback, qualify a writer or expand either native request budget.

## Source and function metadata

The complete worker asset remains pinned to 2,181,284 bytes, SHA-256
`b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928`.
Its bytes were read as inert UTF-8, not evaluated. Each callback excerpt, byte
length and hash was compared with the pinned asset at the listed UTF-16 offset.

| Callback | UTF-16 offset | Bytes | V8 line / column, zero-based |
| --- | ---: | ---: | --- |
| uploadStructure Nd.e | 2104024 | 193 | 110 / 89838 |
| structure QA.e | 2104240 | 817 | 110 / 90054 |
| cooperation ZA.e | 2103729 | 172 | 110 / 89543 |
| bufferedStream t | 2012435 | 60 | 109 / 165146 |
| bufferedStream o | 2029834 | 102 | 110 / 15658 |
| bufferedStream c | 2029936 | 120 | 110 / 15766 |

`current-pcb-string-producer-callback-scope.ts` checks callback text, class,
name, arity, strict-class own-property shape, function location and scope-list
metadata. The location profiles were exercised in Node 24.18.0's actual V8
inspector using synthetic factories at the same source positions. That is not
an observation of EasyEDA's V8 build. Async arrows report their `async` start;
named functions report their parameter opening position. The regular `o`
function is strict because its definition is inside a class method; it has a
prototype but no own `arguments` or `caller` properties.

The six fixed selectors in `current-pcb-string-producer-callback-program.ts`
follow the original project wrappers and their freshly acquired scopes. QA
selection also retains the original Nd wrapper, its selected QA function and
the expected delay/leading parameters. No global/module variable scope is
enumerated. Selected callbacks still require their independent metadata check.

## Limits of receiver inspection

For `o` and `c`, the fixed observer compares three fresh scope snapshots: the
upload wrapper, buffer callback and drain callback. Each must retain the same
`a === PROJECT`, `t`, `o`, `c`, 500 ms delay and timer/promise/resolver values.
This checks captured references and equal scalar snapshots, not atomicity or
callback completion. Every original-owner, completion and execution flag remains
false. A future owner must bind the original worker, context and function
handles and invalidate them after context loss. It must reacquire V8 scope
wrappers for every phase; old scope wrappers retain stale scalar values.

The other four callbacks are arrows that capture class-constructor `this`.
The synthetic inspector does not expose that lexical receiver. Two different
class instances produce callbacks with identical source and function location,
but different hidden receivers. Matching the callback retained by a PROJECT
wrapper therefore cannot establish the arrow's original receiver: a same-source
foreign callback could have been assigned there. The decoder explicitly refuses
an attempted arrow-owner scope selection with
`PCB_STRING_PRODUCER_CALLBACK_LEXICAL_THIS_UNAVAILABLE`. It does not select an
unrelated closure, invoke the arrow, pause the debugger or claim that source
matching resolves the ambiguity. A qualified construction/provenance mechanism
is still needed before these callbacks can authorize a writer.

## Remaining producer and publication requirements

This batch does not inspect or qualify the raw feature flag, native enum
objects, readiness/read-only/sync implementation, manager-tree methods, backend
receiver or `setProfile` effect. The source-derived distinctions remain:

- The cooperation gate's `jr` comes from `L1.IS_PRIVATE`, not `IS_OFFLINE`.
  ZA.e itself only rechecks read-only state. An earlier buffered batch still
  needs separate exclusion.
- Structure's task2 promise is removed on success and failure. Nd discards the
  callback result. QA's outer promise can remain unresolved if its async timer
  callback rejects. Empty task sets are not successful structure-write evidence.
- Upload's thunk skips its action when `isBatchUpload` is true. Drain clears its
  scheduling fields before the upload await, catches errors, then resolves and
  removes its task. Null fields are not upload-completion evidence.
- Successful upload starts an unawaited local cache-cleanup IIFE. Neither its
  returned upload promise nor task1 covers that work. Full closed SQL and
  replay-cache exclusion after original Job termination remain necessary.
- The publisher route, native handler outcome, sender identity and compiler
  publisher inventory remain unqualified. Local bus self-delivery passes the
  original object, so a later descriptor-copy observer cannot exclude Proxy
  behavior or prove trusted payload provenance by itself.

## Verification

Three focused tests pass under Node 24.18.0 with core dumps disabled and the
builtin isolation preload, using a private temporary root. They cover all six
metadata profiles, exact selectors, real effect-checked scope observations,
same-source foreign-instance ambiguity, wrong script/callback/owner references,
hostile getters/Proxies and released object handles. Vendor callback bodies are
compiled in synthetic factories but never invoked. No debugger pause occurs.
Strict type-aware lint reports zero warnings; TypeScript passes. An initial
profile test caught an incorrect async-arrow location adjustment; the corrected
profile and all six pinned-asset checks pass. These are source and synthetic
inspector results only, not connected EasyEDA validation.
