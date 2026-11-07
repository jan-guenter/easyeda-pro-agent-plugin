# Original schematic disposal preparation

The source-only own7 controller now has a separate readonly collector for the
original transaction's two temporary listener jobs. It starts from the retained
`canRecord` entry and joins the original history recorder, disposable store,
document emitter, complete listener roster and both reverse-owner Sets. The
collector qualifies every newly followed object and prototype through native
Inspector metadata first. It invokes no application getter, listener, disposal
method or continuation.

The collector qualifies the exact pinned `tn.dispose` functions and their
nearest `i` and `e` closure bindings. It also qualifies the original event-removal
arrow in both full schematic scripts and joins its nearest `t` binding to the
same document-listener job. An independent inert execution of the actual
source observed `Closure (tn)` with `i` and `e`, and `Block (get event)` with `t`.
That experiment establishes the metadata shape without establishing an
application receiver or callback delivery.

A fresh snapshot retains complete own descriptors and prototypes for the
qualified graph. Separate native collection checks retain the two store members,
each job's sole reverse owner and the complete document-listener order. The
snapshot does not replace or weaken an earlier transaction snapshot. All
receipts keep disposal, continuation, publication and Save authority false.
Native command mounting and the original disposal/record/publication path remain
separate implementation work.

Focused checks cover both actual uninvoked source arrows, a synthetic graph
under Inspector side-effect checks, refusal of an added reverse owner, zero
listener/disposal calls, and rejection of injected programs or resume commands.
The synthetic VM test caught an initially incorrect same-realm assumption for
private returned arrays. The new collector validates their complete owned
indices without requiring an application Array prototype. Original application
arrays and Sets retain their explicit prototype checks. The earlier refusal
and lint corrections remain in private logs.
