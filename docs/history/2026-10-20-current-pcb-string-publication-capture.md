# Bounded worker subscription capture

This is dormant instrumentation, not a registered runtime or design writer.
`current-pcb-string-publication-capture.ts` provides fixed arm/read/finish
programs and supplied-result comparisons. No live call was made.

## Pinned source

The installed project worker was read inertly and hashed:

- Path: `pro-mgr/3.2.184.355087e9/js/project-worker.js`
- Size: 2,181,284 bytes.
- SHA256: `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928`.

Offsets below are JavaScript string offsets, not UTF8 byte offsets.

| Worker source | Consequence |
| --- | --- |
| `KP.subscribe` at 9926 | Appends a `wu(callback,true)` to the topic's subscriber array. |
| `wu.execute` at 8077 | Calls its callback with one argument, without copying when unsafe is true. Errors are caught by the task. |
| `KP.onReceivedPublish` at 10418 | Runs subscribers in order and later prunes cancelled tasks. Sender UUID is not passed to subscriber callbacks. |
| `JP` at 11669 | Routes incoming `PUBLISH` envelopes to that subscriber loop. |
| Native project callback at 2112940 | Calls `remoteChange`, then sets each document entry's `length` to zero. |

The native cancel and running bodies occur in more than one task class.
Admission therefore checks the exact original `wu` prototype and retained method
identities as well as their source text. Both native and observer tasks must
retain exactly the three ordinary own data fields `callback`, `unsafe` and
`isRunning`; own `running`, `execute` or `cancel` overrides are rejected. The
subscribe, execute, received and
project callback literals each match one occurrence in the pinned worker.

PCB `publishPendData` at 3145812 in source `217199c8…` publishes the four-item
envelope on `/pro-mgr/worker/batchPendData`. It subsequently clears the renderer's
pending arrays. Worker capture is not a claim about those original renderer
objects, sender identity, BroadcastChannel delivery completion, or native
`remoteChange` success.

## Instrumented interval

Arm requires the original admitted worker context and the sole original native
subscriber for the fixed topic. It verifies the project, branch, window, bus,
subscriber, prototype and method relationships, then appends exactly one observer.
It does not reorder the native subscriber or replace publisher/receiver methods.

Arm returns a private frozen remote object with closure-bound read/finish
methods. The owner must retain that exact CDP object ID in the original context.
The program does not store the handle in a global property. There is no arbitrary
topic, callback source, expression parameter or persistent cache.

The callback synchronously copies the complete delivered payload using own data
descriptors. It accepts bounded plain JSON-shaped values, refuses accessors and
unsupported values, and preserves every message, duplicate and order position.
Limits are 16 messages, 8,192 UTF8 bytes per payload, 65,536 total payload bytes,
2,048 visited nodes and depth eight. Overflow records a saturated count and
explicitly stops claiming an exact callback count or complete interval.
The reply cap is 196,608 bytes, including the second JSON escaping layer around
the retained raw payload strings; it is not a larger publication allowance.
Any late invocation through a retained callback is reported separately and
invalidates count exactness and interval completeness. It does not silently
rewrite the already closed interval's event count.

Own-descriptor checks avoid property getters but cannot detect JavaScript Proxy
traps during the callback. Unlike the separate CDP read, native callback execution
does not have `throwOnSideEffect`. `JP.post` also schedules a local self-delivery
of the same object, so BroadcastChannel structured cloning does not exclude
hostile local payloads. Original publisher/subscriber inventory, intrinsic
admission and that local path remain prerequisites before runtime exposure.
This limitation is not hidden behind the byte bounds or a successful fixture.

Read is synchronous and must use `throwOnSideEffect:true`. The focused test uses
an actual V8 inspector read on the retained synthetic remote handle. It is not a
browser/native-worker test. Arm and finish are explicitly instrumenting calls,
so they do not use the read-only policy or the precreate90 profile.

Finish calls only the original observer task's `cancel`. It verifies callback
null and running false, reporting `cancelled-tombstone-retained`; it does not
splice any native array, publish a cleanup message or cancel another task.
The normal native bus may prune that tombstone on a later publication. Peer,
method or owner drift leaves cleanup explicitly unresolved. No automatic retry
or repair is supplied.

## Raw bytes and limited projection

The observer runs after the native callback. Its raw JSON therefore includes
the source-derived document `length:0`. Captured JSON strings, their UTF8 hashes,
and the complete supplied snapshot hash are retained.

The separate supplied-data comparison accepts exactly one captured message in
a successfully finished interval. It removes only that exact `length:0` field
and compares every other field against the original one-String publication plan.
Extra messages, fields, records, documents or changed body bytes refuse.

This comparison does not infer that `length` was absent on the sender, that
native handling succeeded, or that no message was queued outside the interval.
Original owner, pristine publication, exclusive publisher, native handler
success, queue/delivery completion, create, Save and execution authority all
remain false. A future retained runtime owner must bracket actual create/Save
and join current worker/channel, command, complete-model, saved SQL and reopened
content evidence separately.
