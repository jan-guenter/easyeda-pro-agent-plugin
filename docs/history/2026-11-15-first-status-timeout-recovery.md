# First status timeout recovery, 15 November 2026

An original controller retired generation9 with lease release, original EOF and
exit0 observed. Generation10 loaded the exact private batched payload and kept
its original process handle, then its first status request exceeded the caller's
180-second deadline. No application or native writer was allocated or dispatched.
The status result remains unknown; neither admission nor persistence is claimed.
The older running manager has no metadata-status interruption recovery route.

The maintained manager now classifies only an empty-argument first caller status
and offers a fixed same-client session-counter observation after its interruption.
Counter0 permits original retirement preflight, never normal work or status replay.
Original connection/generation/request, complete result retention and cleanup
budgets remain mandatory. Each new observation clears its prior settlement marker
before awaiting a reply. Ambiguous retirement still cannot retry or replace an owner.

The actual SDK timeout/late-callback regression verifies wrong identities, rejected
normal replay, refusal before fresh zero-counter proof, preserved unknown outcome,
and original child EOF/exit0 after retirement. All41 focused manager cases passed
without skips; both TypeScript projects passed. Strict type-aware lint reported zero warnings/errors; repository, MCP-contract
and all-skill validation passed. The final unchanged recovery source passed
both TypeScript projects and all41 focused manager cases without skips. The test fixture
now resolves its SDK module using the actual dependency installation rather than
requiring a repository-local node_modules directory.

The recovery code applies to new manager processes. It cannot retroactively add
an endpoint to the original older manager or reconstruct its unfinished request.
