# DEL preparation with the original getter tuple

The original RPC function tuple has four entries. Its third entry is the
already-qualified `Lo.messageBus` getter function. DEL manager preparation
uses the constructor and RPC function, and retains that getter without calling
or traversing it. The earlier test supplied null in that slot, concealing an
unnecessary metadata read that made real composition exceed the fixed 112
property packets and refuse completion.

The collector now omits only that unused retained getter's metadata reread.
All consumed values retain their existing metadata, source and descriptor
checks. The fixture supplies a function in the original slot. Both installed
source profiles complete with the original 23 projections, 112 properties and
23 helper receipts; the 158-CDP/160-control bounds and emitted programs remain
unchanged. No guard, caller flag, helper bound or runtime authority is added.

Pinned Node 24.18.0 checks in an unsealed worktree returned exit 0 for both
TypeScript configurations, strict lint on the collector/test and both focused
cases with configured sources and no skips. The separate deeper method and
forwarding drafts were excluded. No application, native owner, C# process or
closed MCP connection was invoked, and no helper, pin or bundle was emitted.

## 2026-11-08 source identity qualification

The implementation was subsequently recorded in commit
`2db30e8c0b56a2bfb92a24f3f63907843bde42d6`, based on
`415f9127f02c2b2c48072afc03542d96d9af0509`. Its source changes remove the
redundant getter metadata read from the delete-manager collector and supply
the retained function slot in the configured-source regression. The commit
also adds this history record and its index entry.

The earlier checks ran before that commit in an unsealed worktree. An exact
snapshot of every uncommitted file at each check cannot be recovered from the
retained record. The later commit identifies the implementation, not an exact
sealed test payload. The check results above remain recorded with that limit;
the excluded deeper method and forwarding drafts are not covered by them.
These were configured-source fixture checks, not execution of an actual
application function tuple or a native owner.
