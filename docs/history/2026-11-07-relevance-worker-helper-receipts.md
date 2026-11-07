# Original seven-record worker helper receipts

The source-only receipt cursor retains the exact original submitted command,
original raw reply and same-worker scriptParsed identity. It admits only the
fixed seven-record function/expression catalogue. Its fixed source reader accepts
an actual queued script ID and completes exact source qualification before the
receipt returns. Copied commands, missing source events, substituted source,
getters and Proxies refuse. It polls no event stream and resumes no worker.

The seven-record controller exposes registerSubmitted(source,command) and
verifyOriginalHelperReceipt(source,command,raw,read). The final reader is an
internal original-owner binding, not caller code. Library startup can use its
own finite source-read sender. Other post-bootstrap producers still require
original command registration and their own native source-read integration;
this commit does not grant a writer or claim a completed producer frontier.
The old six-record and Wire controllers retain their existing source policy.

Setup receipts consume only the next registered setup helper. An original
source-held callback can drain this queue before returning, and the final
bootstrap drain retains its consumed index. The actual source-held assertion
expires when that callback exits. Seven-record setup admits the fixed polling
capture and pristine library capture in addition to the unchanged base roster.

Verification used pinned Node 24.18.0, isolated tests and no app, native owner or
MCP calls. Fourteen focused receipt/controller cases and both typechecks passed.
Changed strict type-aware lint passed. Native/runtime compilation and tracked
helper/pin emission were not performed for this receipt slice.

The later source mount adds a distinct seven-record getScriptSource sender and
private original session binding. Its finite source-read allowance is derived
from the complete fixed lane budgets. Each worker helper submission is retained
before its actual pipe write. Its original reply clears that request slot, then
the matching source receipt must finish before the helper result is returned to
the observer. Library helpers retain their original dedicated receipt reader;
the generic pipe hook excludes that lane. Setup declarations keep their original
incremental queue, while fixed armed conditions are registered before PROJECT
resumes.

The event reader and reply receipt share one ordered source queue. An event
arriving before the original reply waits for that exact acknowledgement and
uses its command's original reader. Persistent fixed conditions can be checked
without a subsequent helper call. There is no speculative native poll, arbitrary
empty-source allowance or new source decoder limit. The six-record and Wire
controller policy remains unchanged.

This mount's isolated checks include six receipt cases, the real Node stream
case holding navigation and a helper result until its separate source reply,
four own7 selector/wire cases, and seven catalogue/composition cases. Both
TypeScript projects and changed strict lint passed. Private pinned-Node two-pass
generation was byte-identical: stored helper1,557,762bytes, compact compiler
input2,095,243bytes and exact review source2,136,978bytes on this branch. The full
C#5 body compiled with zero warnings/errors. The compiler test invoked no owner
constructor or app. No tracked helper/pins/bundles were emitted, and there is no
connected execution or completed Save-drain claim.
