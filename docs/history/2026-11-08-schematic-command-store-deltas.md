# Remaining schematic command-store comparisons

The fixed recipe table covers the remaining menu `undo=false`, menu
`redo=true`, toolbar `undo=false`, and toolbar `redo=true` calls. Both pinned
UI functions use `e0.setDisableCmd`. Each actual `[this,t,e,e0]` frame must
still match the retained source-qualified target function as its receiver,
the fixed command and boolean, and the original prepared main store.
These calls arrive through the original wrapper's `target.apply(target,...)`;
the earlier direct `file_save` call's global receiver is not reused.

Each command uses a fresh 19-object descriptor snapshot only after the caller
has proved the preceding source delta and retained the original object
mapping. The leaf does not authorize replacing a failed prior proof with a
new baseline. Before each command, the writer must also retain its original
qualified native inputs, constructor/method source joins, and queued-event
hold. An unexpected queued notification remains a refusal.

The named comparisons retain all prototype, string-key, symbol-key and
descriptor fields, the four store identities, dictionary mapping, and four
ordered watcher Maps. They permit only the selected value assignment and the
source's conditional ticket increments. A ticket already different from its
checkpoint stays unchanged; the checkpoint itself never changes here. A
separate before recipe requires the exact untouched entry state. Progress
zero is the value write before notify, one is after the optional value notify,
and two is after the mandatory main notify. Progress one refuses when the
value was already equal. The generic `SAME` comparison is unchanged.

Three fixed queue recipes retain the complete existing status snapshot while
requiring menu index 2/end 3, toolbar index 3/end 3, or the source's disposed
index 3/end 3 with `current` and `args` equal to `undefined`. These recipes
do not invoke a status callback or dispose the queue.

One mapped-descriptor test passed with no skips. It executes hash-qualified
copies of the five pinned UI store/function fragments on an inert graph,
leaves all queued watcher bodies uninvoked, and exercises all four calls.
Counterexamples cover wrong receiver/store mapping, extra ticket changes,
checkpoint changes, unknown symbol changes/additions, replaced or reordered
Map entries, and accessor replacement with zero getter calls. The same case
checks the three exact queue states and their refusals. Both TypeScript
projects and changed-file strict lint passed.

No Core, controller, native encoder, helper artifact, or lifecycle permission
changed. All continuation, queued-notification completion, Modify completion,
and Save flags remain false. Actual callback/notification observation and
finite native mounting belong to the original writer adapter.
