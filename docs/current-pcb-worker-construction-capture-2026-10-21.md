# Private original worker-construction capture

This batch implements a fixed, one-shot constructor capture in
`current-pcb-worker-construction-contract.ts` and
`current-pcb-worker-construction-runner.ts`. It is not registered with MCP or the
native diagnostic pipe. Existing diagnostic/precreate purposes still prohibit
debugger pauses. Nothing here authorizes a String create, Save or production
design access.

## What is implemented

The pinned project-worker asset is 2,181,284 bytes, SHA-256
`b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928`.
The contract fixes eight breakpoint locations and expects nine original debugger
events: JP constructor end; bufferedStream entry; Gd constructor end; ZA entry;
Nd entry; QA entry; Nd entry again; Lg constructor end; and bootstrap after
`self.PROJECT=TP` but before `EP(TP)`.

The runner retains actual remote identities for the JP receiver, its channel and
onmessage arrow, the shared Gd/Lg receiver, four constructor-created arrow
arguments, and the QA debounce wrapper passed into the second Nd call. Each
factory pause requires the original constructing caller on the same pinned
script's stack. Callback descriptions and function locations are checked using
the existing strict source decoders. Receiver equality is tested on the original
remote objects; final bootstrap requires `globalThis.PROJECT` to be that receiver
and its own `workerBus` to be the retained JP receiver.

The packet is issued by an in-process owner, not reconstructed from caller JSON.
Copies refuse. Reuse, owner change, release, unexpected events or transport
substitution invalidate it. A future consumer must call `requireOriginal` at its
own operation boundary; retaining returned object IDs alone is not authority.
The transport is an explicit trusted dependency which must own the actual
target/session and re-attest the complete source and runtime. The synthetic test
transport is not an implementation of native runtime admission.

## Pause and cleanup rules

Original transport methods are captured from own data descriptors. Replies and
pause events are bounded immutable copies before subsequent awaited checks.
Breakpoint identities are retained on arrival, before a post-dispatch ownership
check can fail. Each breakpoint removal and resume is reserved once, including
ambiguous outcomes; neither is replayed. Failures remove known breakpoints before
resuming the original pause. The pause watchdog uses the same retained transport,
not a new target or attachment.

A malformed or missing set-breakpoint reply can leave an unidentified breakpoint.
That uncertainty blocks release. A missing resume event leaves the owner retained
and blocks release. Lost transport cannot establish that a worker resumed; this
module does not claim otherwise. A late pause during group cleanup is resumed
and observed before the listener can be removed. Additional uncertainty preserves
the listener and reports failure rather than claiming cleanup succeeded.

## Focused evidence

Real Node inspector tests execute only inert, exact constructor/factory excerpts
at their pinned line/column locations, with synthetic dependencies. They do not
execute the full vendor asset, call its retained callbacks, start EasyEDA, connect
to a backend or inspect a design. Tests cover the complete nine-event capture,
copy/replay refusal, owner loss during a pause and immediately after breakpoint
creation, transport replacement, late actual pause during release, retained
event mutation and a lost resume acknowledgement. The separate fixture test
checks exact excerpt lengths, hashes and source coordinates.

This proves the private runner can retain original JavaScript identities from
real debugger events. It does not prove that EasyEDA's current native launcher
can supply those events or that the channel is exclusive.

## Concrete integration gaps and next route

1. Add a distinct native launch purpose with a durable intent and original
   process/Job ownership. Intercept the project worker before its first bootstrap
   executes. Admit its exact complete source and execution context, then install
   only this fixed breakpoint set. The existing post-start no-pause attachment
   cannot recover past constructor events; do not relax that purpose's policy.
2. Give that purpose an independently bounded original-session resume path and
   explicit retained cleanup state for lost acknowledgements, unidentified
   breakpoints and session loss. The native owner must never detach or close a
   possibly paused worker merely because this TypeScript runner timed out.
3. Bind retained constructor arrows through the installed wrapper closure chains
   to the current PROJECT fields. Constructor/factory capture supplies genuine
   arrow identities, but does not yet prove each final wrapper assignment.
4. Qualify the native BroadcastChannel constructor/prototype and the original
   publisher/channel naming path. Prove peer exclusion with a separate launch
   profile/partition and contained destinations; JavaScript identity does not
   establish native channel ownership or exclude another process's peer.
5. Compose that original capability with the finite-effect checks, original SQL
   baseline, actor/clock provenance and journal-before-dispatch lifecycle. Only
   then add the exact disposable create/Save dispatch and complete closed SQL,
   reopen, visual verification and final closure.

A separate controlled startup/profile architecture is the practical route to
the missing provenance. Further post-bootstrap observation cannot reconstruct
hidden lexical receivers or prove who else owns a native communication channel.
All five corresponding authority flags remain false in this runner's packet.
