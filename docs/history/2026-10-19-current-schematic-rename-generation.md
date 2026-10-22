# Fresh schematic generation and startup collection

The private SCH baseline now feeds a distinct project-only generation and
startup collector. The code connects retained ownership, launch, authentication,
cache observation, project opening and original-SQL readback. It is not exposed
as an MCP route and does not enable a rename. No live EasyEDA action was run for
this implementation.

## Original generation

`current-schematic-rename-generation-runtime.ts` consumes only the original
one-use SCH closed continuation. It retains the recipient before fallible
checks, verifies the ordinary launcher's original termination record, journals
one replacement launch, and records its original Windows launch/capture clocks.
It accepts only the later authenticated session on the unchanged gateway,
helper and runtime. A copied journal, PCB token or symbol token cannot supply
the missing owner.

The new generation observes both inactive upload-cache namespaces, then the
fixed project-only opener checks both again before navigation. Cache absence
is a point-in-time sequential observation, not permanent queue isolation.
Tracked dispatch retains its raw return before decoding and preserves orphan
evidence on uncertain completion. Consumed launch, capture, cache and opening
attempts cannot be replayed.

The initial PCB UUID remains the startup model's nonzero native-count witness.
It is not renamed or substituted for the target schematic. The schematic UUID,
project owner, complete metadata and children come from the original closed
SQL baseline. Known active-sheet startup effects still require their explicit
acknowledgment; no successful open alone sets `startupQualified`.

`current-schematic-rename-preopen-source.ts` binds the new generation's source
read to the original SCH baseline. It walks retained directory descriptors,
rejects symlinks and SQLite sidecars, verifies exact file identity and hashes
the complete bounded raw file cooperatively. It runs again in the tracked
pre-dispatch check. It does not reopen the file through SQLite, revive old
closed-session authority or promise that no later writer can change the file.

All partial stages preserve original handles for one normal-close cleanup.
A lost ordinary-close acknowledgment can still finish through original Job
termination observation, without another close. Captured cleanup requires the
original acknowledged close and its original termination proof. Journal drift
or failed release remains failure, not a repaired success. Cleanup leaves file
effects unverified.

## Startup collector

`current-schematic-rename-startup-runtime.ts` consumes the issued SCH generation,
its original SQL metadata projection and its original child roster. One generated
program retains the no-editor context, neutral source holders, SCH child manager,
both AST holders and dormant standardization panel around the fixed metadata
and child readers. It does not render, initialize children, flush queues, rename
anything or invoke Save.

The metadata reader obtains complete SCH peers, target, name availability,
client/ticket and UI actor/clock samples. The child reader obtains complete
sheet KV metadata and both existing child AST projections. The collector compares
both results with the actual baseline's original projections. It retains raw
results before publication, decoding and owner revalidation. Failed or timed-out
collection consumes its attempt, with partial metadata preserved if the later
child read fails.

Observed holders and matching samples do not establish backend producer identity,
startup-local-change exclusion, complete AST/source equivalence, global idle,
delayed subscriber completion or persistence. These flags stay false. Private
writer-owner transfer plumbing retains the same generation for a later owning
coordinator; no writer coordinator or public route consumes it yet.

## Offline evidence

Nineteen focused tests passed with Node 24.18.0, core dumps disabled,
`TMPDIR=/root/.cache` and the maintained isolation preload. Tests cover real
coordinator code with synthetic boundary I/O, the descriptor-bound raw-file
reader against temporary files, and complete generated startup programs in
native-shaped VMs. TypeScript and targeted strict type-aware Oxlint passed with
zero warnings. The separate initial-baseline slice passed 29 tests. None of
these tests is connected EasyEDA validation.

## Still required

- Bind original Windows/backend actor and clock qualification to SCH preparation.
- Journal exactly one rename before dispatch and retain any acknowledgment
  through failed readback. No retry or inverse is implied.
- Close the writer generation and verify its complete SQL effect, then reopen
  through a fresh qualified verification generation and close/compare again.
- Expose the scoped lifecycle only after source review and disposable validation.

Linked/reuse propagation, active editing sheets, inherited sources,
child-derived clocks, reparenting, broader titles and general inverse remain
excluded. See the [original owner and compiler report](2026-10-19-current-schematic-rename-owner.md)
and [initial baseline report](2026-10-19-current-schematic-rename-baseline.md).
