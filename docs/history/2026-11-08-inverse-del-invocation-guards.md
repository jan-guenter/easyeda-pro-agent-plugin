# DEL descriptor guards within one invocation

The fresh DEL preparation introduced in `d7c21ba7` retained every descriptor
snapshot, but its dependency graph repeatedly rechecked shared predecessors.
The standalone configured Inspector case took about 88 seconds in its first
sealed run. Integration exposed longer CPU-bound traversal of the same graph.
Those observations concern inert tests, not an original app operation.

Each fixed helper now creates a private linked visited set. Stored guards pass
that same set explicitly to their dependencies, checking each exact guard
function once during that synchronous invocation. An active repeated function
is a cycle and refuses. A fixed 512-entry ceiling also refuses. No global store,
caller selector or owner-issued permit is introduced.

Every descriptor, prototype, source binding and selected native Map check remains
in place. A directly called stored guard creates a fresh set by default. No
visited set is consulted across helpers, awaits or separate calls. The old GET
guards remain unused, and the fixed 23 projections, 112 property packets and
23 helper-source receipts remain unchanged. Native codebooks must retain the
new exact helper bytes; request counts and purpose authority do not change.

The focused actual Node24 Inspector test retains both RPC profiles and all
previous descriptor/accessor/Proxy refusals. It adds a cycle in the private
receipt dependency graph, proves refusal, restores the exact guard and proves
success again. It also calls the selected method guard directly, changes the
original readiness descriptor between calls, proves refusal, then restores it
and proves success. Reflection still uses `throwOnSideEffect:true`. Development
runs completed in approximately 13–16 seconds here; that is an inert local timing
observation, not a runtime latency bound.

The source base is `d7c21ba7`, and the exact test worktree is
`/root/work/easyeda-pro-agent-plugin-fixture-import`. The final tracked and
nonignored untracked payload, patch and focused/type/lint logs are sealed in the
private `inverse-del-invocation-guards-20261108` record. Its first introducing
Git commit records this source correction; later integration is separate from
the sealed test payload. There are no Core, pipe, native/generator, helper/pin,
bundle or capability changes and no app/live/Windows calls.
