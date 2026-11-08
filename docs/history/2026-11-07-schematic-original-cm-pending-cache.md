# Original schematic CM to held pending cache

`continueOriginalConsistencyToPendingCache()` now owns eight original body
continuations: publisher localChange, CM localChange, CM remoteChange, the
original parse callback, handler onAddOrUpdate, handler addTask, task addTask,
and publisher cachePendData. The final pending-cache body remains held. One
existing controller/event stream reserves, submits and joins each actual
ACK/resumed pair and source-qualified successor.

The exact new delta recipe permits only manager maxNum.TEXT=1,
allOrderNum[originalTextId]=1, transient cacheNum=1 followed by its original null
reset, CM maxTicket incremented once, and the one original
`tempLocalIds[pageUuid][textId]=[client,ticket]` tuple. Source local remoteChange
uses c=true, so docMaxTicket stays unchanged. Every old own descriptor,
unknown field/Symbol, reference, prototype and unrelated map entry remains
exact. Original private snapshot recipes are not relaxed.

Before source writes, original native Object.isExtensible and its constructor
are retrieved from the completed prefix receipt without another command. The
three original empty dictionaries must be extensible and have no inherited
planned key hooks; written scalar descriptors must be standard writable data.
The current publisher headType getter is selected and qualified independently
on both real source variants before its body can be read. Native console.error
is separately qualified for the original parse error branch.

Actual parse callback and handler/task lexical receivers are joined at their
entries. The parsed fifteen-field JSON object is compared with the original
source serializer object (whose undefined groupId is omitted by JSON). Its
complete original packet/data descriptors are then snapshotted and reproved.
The source's pending/local/shouldCommit=false branch returns before creating
an echo model task. Original running/currentAction getters exclude the number
change debounce while the original action remains willDidRun.

The new own7 lane reserves exactly 167 requests: fourteen before reads,
10/10/16/16/24/17/17/17 boundary reads, eight function-call arms, eight resumes
and ten controls. Existing six-row/Wire bounds and persisted schemas are
unchanged. The prefix's two new readonly handle fields use existing genuine
qualified metadata, with no new command or permission.

Validation: both pinned source variants execute the instrumented original
chain with exact deltas and the pending cache still empty. Inherited TEXT hooks
refuse before source execution with zero calls; unknown Symbol drift refuses.
43 focused source/controller/retained-pending pipe/profile cases pass, including
32 uninvoked actual helper metadata functions. Both TypeScript projects and
changed strict lint pass. Twice-identical generation and Linux full schematic
C#5 compile plus new/prior codec hash smokes pass. Compiler 1,922,221 bytes;
helper 1,402,792 bytes. No app, native owner, MCP connection, installed byte or
tracked generated native artifact changed.

Publication, the actual timer/Promise, native bus sender, matching worker TEXT,
normal completion, Modify, Save, reopen and persistence remain closed until
their subsequent original joins complete. No SDK ACK or empty map is used as
completion evidence.
