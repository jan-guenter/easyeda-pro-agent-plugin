# Original saved schematic reader workflow

The saved seven-record schematic reader now has a complete source coordinator:
`CurrentSchematicRelevanceSavedReadbackWorkflow(options, genuineSavedPlan)`.
It owns its journal and accepts no replacement owner, transport, callback table,
file path or target selector. Repeating `execute()` returns the same original
Promise, including failure. A second workflow cannot consume the same plan.

The successful route reserves an exclusive journal before factory allocation,
launches the separate original reader, installs the readonly Main fence and early
actor exclusion, qualifies the original UI, observes both complete cache rounds,
publishes and rechecks its complete backup, invalidates only the two selected
namespaces, arms cold loading, registers the exact saved path, opens the project
and page, collects the actual cold receipt, and observes the seven-record scene.
It then acknowledges normal close, independently proves original root/Job exit,
releases the original helper, captures the closed file through retained
read-only descriptors and complete SQL/raw-history comparison, and performs the
existing final five-original-receipt acceptance join. Only that last result
claims persistence and reopen verification. This route invokes no Save.

## Durable records and cleanup

The distinct `private.current-schematic-relevance-saved-readback-record.v1`
grammar uses an exclusive `sch209-relevance-readback-<random>` operation identity.
It retains the writer identity as historical data without using its owner or
journal authority. The 17 stages each have an intent before their effect and a
result afterward. Sequence, previous-record hash, operation identity, unique
phase, exact artifact bytes and complete managed manifest are rechecked at each
boundary. JSON records cannot recreate any native, cache, cold or acceptance
token. The normal path has 35 records; a failure after the last stage intent plus
all eight cleanup records fits 43, below the fixed 48-record ceiling. Each record
is limited to 65,536 bytes.

A pending durable publication is joined and only its original retained candidate
can settle before cleanup begins. Lost acknowledgments do not permit phase or
native replay. No-resource and original no-root helper closure have separate
records and make no exit claim. A failed capture must acknowledge its actual
original descriptor closure before cleanup can complete.

Failure with an original root may dispatch the new, once-only
`abortSchematicSavedReadback(true)` outside the observer's busy lane. Both Core and
the schematic native layout bind it to the retained original owner/Job. Its wire
accepts no PID, path or caller-supplied native selector; false confirmation,
repeated abort and later normal work refuse. It never signals the helper or
manager. An unknown abort acknowledgment remains consumed and grants no exit,
Save/discard, persistence or readback acceptance. Original request settlement,
root exit, empty Job, helper release and descriptor closure remain independent
requirements. The user already authorized original EasyEDA process termination;
no new approval was inferred from this implementation.

Each termination round is bounded to 40 observations with 250 ms between them.
Failure cleanup retains one round, and `settleCleanup()` can join at most one
additional round after exhaustion. Thus success followed by failure cleanup and
that one settlement cannot exceed 120 readonly observations. No round redispatches
the abort or helper release. Typed cleanup status is diagnostic; historical
resource closure is derived from this workflow's original private resources and
grants no native continuation or saved acceptance.

## Verification and limits

Eleven focused source tests exercise the actual coordinator and real journal
publication/artifacts under explicit synthetic native/plan registries, plus the
production Core and real synthetic child byte streams. They cover every success
stage, copied results, journal hash/order/terminal refusal, prototype replacement
with zero getter effects, pending cache cancellation, unknown abort ACK,
no-resource/no-root cleanup, lost or blocked original publication, bounded extra
exit settlement, unknown descriptor-close ACK and pre-allocation cancellation.
The original abort test confirms the pending pipe request settles and requires
separate observed termination and helper release. These fixtures issue no app or
native authority.

Both TypeScript configurations and changed-file strict lint pass. Two-pass
schematic generation is byte-exact. Linux .NET with C# language version 5 compiled
the complete schematic layout and ran the original saved-reader fixed-codec
smokes, including the new no-root/cleanup-only abort refusals. The private helper
is 1,495,069 bytes and its actual compiler input is 2,057,625 bytes, below each
unchanged 2 MiB limit. Existing purposes and released six-role artifacts were not
modified; no tracked helper, pin or bundle was regenerated.

The first focused test run retained three fixture failures: its unused synthetic
Promise was rejected during non-pending cleanup, and the repair fixture introduced
a second artificial lost ACK. Corrected test-only settlement behavior passed;
production cleanup guards were not relaxed. No connected saved schematic reader
was run, and this source result supplies no new connected validation or release
claim.

## 2026-11-08 source provenance correction

The Git checkpoint introducing this record and its source/test changes is
`969561fec95135a47035735b1a287513a567eb42`; its committed tree is
`f0991aabf4cd3af3400932affb4d11a1cdf90139`. Its Git author timestamp is
`2026-11-08T00:14:51+01:00`. These identify the committed increment only.
The complete test-time worktree was not sealed in the retained evidence and
cannot be reconstructed from it. The reported checks above keep their original
scope and observations; they are not attributed to this commit or a later tree.
See the [PR190 attribution correction](2026-11-08-pr190-history-attribution.md) for the evidence limits.
