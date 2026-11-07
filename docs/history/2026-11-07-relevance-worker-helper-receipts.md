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
