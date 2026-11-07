# Original cold observer after clock retirement

The genuine v2 worker now transfers its existing detached cache observer across
the original clock handoff. The constructor installs its private continuation
lease on the same native channel synchronously before consuming its old pause
subscription. Owned cache pauses bypass the clock event queue. They remain
paused until the clock unit has retired. Retry branches fail immediately before
a timer, reopen or second write.

`beginCurrentFootprintForwardColdTail(dependency, originalPendingCreate)` issues
one opaque token after the original clock retirement acknowledgement. It checks
the same worker lease, native session, pending create and physical request
cursor. Its private registry lookup is
`requireCurrentFootprintForwardColdTail(token)`. The returned binding retains
the original dependency, worker construction lease and session, and supplies
fixed read-only requests with current owner checks. Copied result data cannot
join this binding. A failed activation consumes its slot.

The fixed native continuation accepts the existing twenty cold phases and
three additional property/remove/resume shapes. It cannot forward source text
or arbitrary inspector methods. Its new native write role requires this v2
birth, the consumed original create, acknowledged clock retirement and a
healthy original ledger. That role also permits these observation commands
while the original main completion collector owns its separate cursor.

Before the 78-request allocation/create/clock unit begins, the channel and
native owner reserve the original observer's actual unspent normal and cleanup
requests. The v2-specific begin action carries only those bounded counters.
The old begin action refuses for v2, so it cannot omit that reservation. The
1175-request whole cursor and its 1105 normal/70 cleanup classes do not reset.
Two original parent proofs and one consumed native activation control add five
control slots and corresponding bounded reply envelopes.

Original whole-Job exit ends retained observer waits without fabricating a
debugger resume or native reply. The channel first verifies its original
termination callback, rejects its original pending requests and frees its
queue. The constructor then verifies that same channel's retained exit and
joins the observer outside the queue. This prevents a pending owner recheck
from waiting behind the exit join itself. Suspended cleanup releases its local
wait while refusing to resume an entry into its first cache write.

Validation used Node 24.18.0, npm 11.16.0 and core limit zero. Twenty-eight
focused construction/cache/allocation/paired-scheduler cases passed, including
real inert V8 cache callbacks and a separate synthetic native channel with the
real clock ledger and request/event decoder. The latter proves continuity,
counter and copied-token behavior, not native ownership. Eleven final focused
handoff/v2 routing cases passed after the exit join changes. Full TypeScript,
strict type-aware lint and repository/skill/MCP-contract validators passed.

The actual generated driver/core/phase were 95534/945442/43570 bytes. The real
C# graph compiled under .NET 10.0.113 and its empty-owner, codebook, alias
refusal and allocation-ledger smoke checks passed. No EasyEDA process, Windows
native Job or live CAD call was created. Shared generated files, graph pins,
bundles and compatibility metadata were not changed.

This token proves original continuation ownership. Whole producer exclusion,
the original buffered drain/local publish completion, selected locked-head SQL
eligibility and a v2 issuer joining the original two clocks remain required
before a footprint writer can dispatch. Existing writer gates remain false.
The continuation does not grant a main SQL slot, Save, inverse or production
scope.
