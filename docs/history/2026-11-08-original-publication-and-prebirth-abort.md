# Original publication and prebirth abort recovery

Two further supplied review findings were verified and fixed in the existing
metadata reader and Via coordinator. Public contracts, native helpers, resource
limits and saved-acceptance guards are unchanged.

A failed exclusive relinquishment-intent publication can remove its original
incomplete file while leaving its securely managed directory. The real receipt
reader previously treated that validated empty slot as corruption, blocking the
original pending publication forever. It now treats an empty descriptor-validated
slot as no receipt and rechecks the original historical snapshot before returning.
A nonempty slot without `intent.json` still refuses. No historical native owner,
release ACK or runtime permission is reconstructed.

The Via coordinator also had a scheduling race after preparation created its
workflow but before the awaiting execute continuation resumed. An abort could win
that interval, and the prebirth guard then entered the actual-execution catch,
incorrectly marking an execution failure and demanding a nonexistent workflow
failure-publication source. The abort guard now runs outside that catch and marks
the requested execution settled. Actual `workflow.execute()` failures keep their
existing failure handling. Abort/shutdown join the original unused workflow
without fabricating a failure source. The new schematic outer coordinator must
preserve this distinction when it is mounted.

Fourteen focused tests pass. The new storage regression uses the real managed
publisher, forces its final validation failure after file write/sync, observes
cleanup leaving an empty directory, uses the real secure receipt reader and then
publishes/reads the original intent successfully. A nonempty result-only slot
refuses. Only the historical snapshot issuer is an explicit inert fixture seam;
there is no native allocation. The scheduling regression queues an actual abort
microtask during the fixture workflow's construction, before execute resumes. It
proves execution never runs, failure publication never starts, and abort plus
shutdown settle with no active reservation. Existing actual-execution failure and
lost-sidecar cases still pass. Both TypeScript configurations, changed-file strict
lint and whitespace checks pass. No tracked native artifact or live process was
changed.
