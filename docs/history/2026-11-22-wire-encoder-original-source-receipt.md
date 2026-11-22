# Original Wire encoder source receipt

V5 Core retains the selected schematic bundle result from the original
title preparation read. The diagnostic pipe records that result only after
validating the complete frame against the pending request ID and session
and observing the original write acknowledgment. Its receipt names the
script and actual JSON frame size, excluding the delimiter. The existing
32 MiB source frame and 64 MiB session bounds still apply.

The encoder getter rechecks the original owner, operation arguments,
selected realm and script variant. It accepts the original successful
schematic result from the same active pipe and qualifies the complete known
bundle with the [encoder source checkpoint](2026-11-22-wire-encoder-source-checkpoint.md).
Copied results, helper-source replies, a different script or session, and
closed original pipes refuse. The getter issues no additional request.

The existing V5 native dispatch accepts only its mounted globals and title
lanes. The [encoder codebook](2026-11-22-wire-encoder-native-checkpoint-codebook.md)
still needs a native birth with its source-first cursor, bounded metadata
and membership transport, and actual helper-source and event custody.
Natural encoder, checker and upload execution, the exact returned source,
worker, Main, SQL and Save remain pending.
