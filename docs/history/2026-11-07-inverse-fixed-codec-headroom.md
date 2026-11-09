# Inverse fixed-codec headroom and reply residual

Eight existing inverse serializers now share their fixed table lookup and
field encoding. Each original key/selector derivation remains in its own
source module. Numeric ticket/push-ID, reply-topic, peer UUID and native-origin
checks remain fixed sibling scalar functions. The new selector helper removes
only the original compiled selector names before the unchanged strict field
check. Pipe input cannot supply a table, selector list, namespace or function.
All native request ledgers, action counts, purpose checks and source grants are
unchanged.

All 28 inverse C#5 codec smoke methods pass, retaining every original expanded
message hash. The public API smoke additionally rejects an unknown field and
a missing stage selector; the worker-clock smoke rejects a string-valued numeric
slot. Changed strict lint and the focused source/graph checks pass. The six
released role hashes and the inverse-only historical Via-block hash remain
unchanged.

Pinned Node 24.18.0 private generation on canonical `406537eb` measured compiler
input 2087927 bytes (SHA256
`a3ceda22407e9e4172ee1229ea839da4d96feb83bff00c2eb76df69213f9805a`),
original review 2127884 bytes, and stored helper 1489039 bytes. This saves 8836
compiler bytes and leaves 9225 beneath the unchanged 2097152-byte compiler cap.
The stored helper cap and V2 review-source contract are unchanged. No tracked
helper, pins, bundle or official version was emitted.

The next UI completion proof must retain a specific source-defined residual:
Li's `subscribeOnce` calls `task.cancel()` while `onReceivedPublish` is already
executing that task. That same delivery leaves the original reply queue with
one task whose callback is null and `isRunning` is false. It does not remove the
bucket on that pass. An actual pinned-source regression verifies the fulfilled
result, same queue/task identity and canceled state after source IGIVE/PUBLISH.
The outer initialized GET service is a persistent subscriber; its one-shot
reply pull is a different task. No whole-bus emptiness, manual cleanup, UI
completion or deletion authority follows from these source facts.

The genuine row plan also preserves different row shapes: the worker/F2 raw
row has 16 fields, while `tgt` produces the 15-field formatted M8 row. Runtime
completion must compare both exact tagged shapes and retain original Promise,
callback and queue custody.
