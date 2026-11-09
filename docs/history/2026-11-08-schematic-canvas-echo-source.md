# 2026-11-08 schematic canvas echo source

The selected SCH canvas receiver belongs to the page publisher. Main O9 and
child _7 construct fse/Rle with `docManager.uuid` first and project-manager UUID
second; pse/kle pass those to XE/MP as `uuid` and `path` respectively. Therefore
the publisher UUID and `publishPendData` message[3] are the page UUID. The
project UUID belongs to the project-channel path. Treating message[3] as the
project UUID would refuse the actual selected publisher. This source leaf
records the distinction without changing runtime bindings.

The registered callback is main 775627..775691 or child 1799039..1799103:
when onUpdate is absent it forwards the received rows through
`pushOnLine(rows, this.uuid)`. The selected manager constructor supplies
onUpdate as undefined. Sheet topics uDe/K5e inherit the namespace's
`/pro-mgr/canvas/{uuid}/update` template. The existing xC/e2 factory supplies
the project-channel bus. Matching source alone does not prove a live callback,
subscription roster, page publisher, channel or consistency-manager identity.

The nine-field canvas row maps through publishLine to the same UI CM's
remoteChange only if the original channel canPush branch is true. Given the
original unique ID and exact pending client/ticket pair, remoteChange suppresses
publishChange and deletes that pair. A same-unique entry with a different pair
can also suppress publication while retaining the entry; suppression alone is
not original-operation completion. Foreign unique IDs or missing entries can
publishChange. Pending=true separately avoids a docMaxTicket write. A blocked
channel caches the row instead of proving CM delivery.

Eight missing source/metadata roles per variant pin initProject, the callback,
pushOnLine, publishLine, channel.canPush and actual bus subscribe/task running/
async execute. Existing CM and broadcast profiles are reused as data. The
actual subscribe constructor sets unsafe=true; a runtime must still prove that
field before excluding the clone branch. The async task executes its callback
without awaiting it. The worker timer's publishTask Promise resolves after
workerBus.publish returns; its source does not join UI message delivery or the
UI task Promise. Those receipts remain separate runtime obligations.

The complete tested runtime/test tree is
`57a37ce07d5462066117916da4b78c0906e1bf78`, based on
`0aec4cdc`; this record is added afterward. Final Node 24.18.0 checks passed
two focused cases with zero skips, both TypeScript configurations, and strict
type-aware three-file lint (all exit 0). The cases cover all sixteen actual
uninvoked V8 profiles plus exact source-fragment forwarding/suppression branches.
Initial type/lint failures are retained privately and fixed before the sealed
checks. No original app, native owner, C#, Windows, MCP or CAD operation ran.
No receiver, echo suppression, continuation, Modify, Save or helper-payload
claim is issued.
