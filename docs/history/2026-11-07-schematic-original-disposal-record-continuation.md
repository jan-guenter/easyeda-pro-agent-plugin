# Original schematic disposal and record continuation

The own-seven display callback can now continue from the original held
`canRecord` getter through the source-owned listener cleanup and `_record`,
stopping at the original DidRecord upload callback before its body. No upload,
UI publication, Modify completion or Save permission is issued by this batch.

The maintained observer exposes `prepareOriginalListenerDisposal()` and
`continueOriginalNormalRecordToUpload()`. The first uses the original disposal
cursor and its real correlated function, scope and non-Proxy metadata. The
second keeps the same controller and event reader and consumes seven separate
resume attempts. Each requires the original native write acknowledgement,
`Debugger.resumed`, and the exact next source/function breakpoint:

1. The original data subscription `IB.dispose` receiver.
2. The original history reset arrow and its history receiver.
3. The original event-removal closure and the original document subscription.
4. `_removeListenerSubscription`, with its actual module threshold equal to two.
5. The original `_record` history/command-group arguments.
6. The original WillRecord tab callback, with the independently qualified
   document classes and actual tab/type getters.
7. The original DidRecord upload callback, held before its body.

The earlier snapshots remain immutable. New delta programs admit only the
source-derived transitions: two exact store removals, both back-reference
Symbol deletions, three history callbacks reset to the already qualified
original idle function, removal/compaction of only the selected document
listener, clearing the selected batch stack, and insertion of that same stack
into the original empty undo array. Every peer descriptor, Symbol, prototype,
listener and collection entry remains exact. The redo array stays empty;
`maxLength >= 1` excludes the trimming path. The original one-command map/set
and six before/after attributes are reproved at every held entry.

The readonly preparation reserves 1,146 CDP requests and two native controls.
The continuation reserves 65 reads, seven function-call arms, seven resumes and
nine controls (88 total). Both use distinct own-seven markers/native actions;
the six-record and Wire purposes refuse this syntax. A reserved resume without
actual submission cannot consume a resumed event. Events before and after
resume acknowledgements are both covered on the same original lane.

Verification is offline. Both pinned source variants exercise the actual
inert disposal/record algorithms across listener compaction branches, holes and
peer counts, with an unknown history-field drift refusal. Fixed syntax tests
reject changed programs and extra fields. Controller regressions cover both
ACK/event orders and unsubmitted-resume refusal. The composed schematic source
remains deterministic and idempotent. Linux C#5 compilation checks the exact
emitted compiler and fixed codec hash vectors without allocating an owner or
running EasyEDA. No tracked native payload, installed bytes or source pins are
regenerated.

Remaining action frontiers include the real DidRecord uploader/serializer,
CM and no-echo receivers, native bus sender/timer and UI publication, normal
status callbacks, and the original matching worker TEXT/Nd wave. Those paths
remain held; this checkpoint does not claim a complete writer lifecycle.
