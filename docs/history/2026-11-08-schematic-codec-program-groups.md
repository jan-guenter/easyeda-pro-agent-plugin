# Bounded schematic program groups

The own7 UI codec source factory now splits a program pool only when its decoded
rows exceed the existing 65,536-byte table limit. Each group keeps the existing
raw and packed hashes, shape checks and byte limit. The unchanged `JoinPrograms`
helper preserves row order and its 384-program bound. A single oversized row
still refuses generation. Message tables, encoders and runtime authority are
unchanged.

Successful existing pools retain their exact emitted bytes. The focused checks
compare all nine historical complete class outputs and decode a new grouped pool
to verify its hashes, order, indexes, shared-program joins and oversized-row
refusal. Both tests passed with zero skips. Strict type-aware lint on the two
changed source/test files and both TypeScript projects exited zero.

The checked source base was `0133292cc25bc13951f74fcd990115b8fd816108`.
The staged runtime/test tree was sealed before the final checks as
`4756233a4c6ff15668925c8583168e50e54b002f`; this record and the history-index
link were added afterward. The first strict-lint attempt rejected two test
style issues. They were corrected before that seal and the final checks.
Node was 24.18.0, npm was 11.16.0 and the soft core limit was zero.

This is a source and Node verification record. It includes no C# compilation,
installed payload change, native allocation, app invocation, Modify completion,
Save or connected writer result. The new CM graph and its actual continuation
remain separate work.
