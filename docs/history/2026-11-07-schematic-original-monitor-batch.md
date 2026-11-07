# Original underline monitor batch

The Relevance7 callback observer now carries the original held AST call through
its synchronous view, bbox and attribute-watcher calls to the original held
history callback. `continueOriginalMonitorsToHistory()` uses the same callback
origin, pending Modify request and original event stream.

Before the AST body runs, four exact function-call breakpoints are acknowledged
on the original active-history functions. Every continuation consumes a separate
original reservation and joins its actual write ACK and `Debugger.resumed`, even
when the next pause arrives before the ACK. A reserved but unsubmitted request
cannot accept a resumed event. History remains held before its body.

Each pause has its own source-frame and receiver proof. The AST flag change is
separate from the earlier underline change. The view callback admits exactly the
selected Text in the original empty native Set and either the source-created
`{underline:true}` dictionary or replacement of the original own null. Added
field order, all descriptor flags, prototypes, Symbol fields and unrelated
snapshot entries remain exact. Subsequent stages reprove dictionary contents
and Set membership. The old immutable snapshot proofs remain unchanged and
still reject these partial effects.

The bbox body can continue only after the actual lexical bbox map and native
Object prototype both lack `underline`. The attribute-watcher body can continue
only after its actual lexical map and native Object prototype both lack `Text`,
and the selected model retains its own `modelType:"Text"`. No bbox callback,
attribute callback, formula branch or application getter is invoked by these
checks. Unknown objects receive correlated nonProxy metadata before descriptor
reads. Inspector aliases are joined by JavaScript reference equality.

The separate own7 grammar derives 64 reserved requests: 50 readonly observations,
four arms, four resumes and six controls. Six-record display, Wire and the other
native purposes cannot encode this lane. Its receipt leaves Modify and Save
false; history command construction, normal completion events, consistency and
publication, worker TEXT delivery and final Modify verification still need their
original continuations.

Validation: 25 focused cases pass, including actual source-preserving Node
24.18.0 Inspector execution for both pinned SCH bundles, event/ACK orderings,
exact partial deltas, hook refusals, distinct-purpose routing and complete native
source idempotence/bounds. Both TypeScript projects and changed strict lint pass.
The complete schematic C#5 source compiles on Linux and its new fixed codec smoke
passes without constructing an owner. No EasyEDA, Windows process, MCP, saved
project, installed artifact or generated tracked helper was used or changed.
