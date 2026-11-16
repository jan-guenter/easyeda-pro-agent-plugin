# Windows metadata driver with a fixed Linux evidence broker

The v1 maintained helper deliberately refuses Windows proof execution because
file flush alone did not establish NTFS directory durability. That refusal and
the v1 Linux contract remain. A distinct v2 Windows plan now selects one fixed
Linux evidence backend, with no duplicate NTFS evidence directory or arbitrary
program/path/RPC fields in the data plane.

The builtin-only module emits a fixed Python program through the already selected
WSL distro. It exclusively preallocates fixed journal/control files and retains
original Linux file, evidence-directory and parent-directory FDs before any CLI
owner. A retained-FD mnt_id/bounded-mountinfo observation and descriptor recheck
qualify ext4/xfs/btrfs under a separate local-persistent-linux.v1 profile; DrvFS,
9p, network/FUSE, tmpfs and unknown filesystems refuse before CLI allocation.
No mount, disk, system permission or global configuration changes occur.

Serial sequence/offset-bound byte chunks receive file+directory-sync ACKs.
Unknown append ACKs retain the original request and bytes rather than resend.
Flush settles original pending suffixes/syncs only. The coordinator awaits that
barrier and rechecks failure/stopped state before its same four metadata/session
calls and positive completion. Original CLI EOF remains independent of broker
I/O; original facade pidfds, Windows handles, watcher settlement and actionable
nonce controls remain owned through failure. Pre-owner broker controls expose
only status/original stdin EOF, not arbitrary IPC or process selectors.

Two inert tests cover strict v2 fields and v1 refusal, nontrivial multi-chunk
raw-byte fidelity, durable ACK gating, original broker close 0, and refusal of a
traversal journal before an outside write with original failed-child close 1.
The ordering case also delays its original close ACK and advances only a fixture
clock: timeout stays incomplete, then the SAME original ACK settles and joins
close 0 without a second close or an invalid post-close flush. Production
deadlines remain unchanged. The existing six helper cases also pass after async
barrier integration. Local
broker fixtures use a private native-filesystem TMPDIR. Both TypeScript configurations pass; strict type-aware lint on all six affected
source/test files has zero warnings/errors, repository validation passes, and all
seven skills validate. The unchanged dependency lock reuses prior npm ci and
audit/signature receipts. Outgoing privacy is checked before handoff.

This is source/inert evidence, not an actual Windows CLI, facade, native/app or
installation run. V2's Windows workspace identity/emptiness is a separate
non-durable NTFS observation. No full installed V2, loaded-JavaScript-memory,
continuous whole-package, desktop-registry refresh or live-CAD admission claim
follows. Actual Windows metadata acceptance remains gated on parent approval of
a frozen payload and a later original-handle proof.


An actual Windows Node 24.10.0 default-preview process also loads the maintained
v2 module graph and plan: preview.v2, ownerStarted:false, original process handle
held through observed exit 0. This performs no Codex CLI/app-server connection,
workspace/evidence allocation or Windows/WSL broker execution. It is a portable
module/preview observation, not Windows runtime acceptance.

## Subsequent PR review corrections

All thirteen public CI checks passed for
`3ca37a792ae772c8db826a329f88c6e8a36b0eb5`. CodeRabbit nevertheless reported
three valid broker recovery/concurrency issues, so that head was not merged.
A failed control-file sync could terminate the broker and lose retained
evidence custody; a downgraded close ACK could leave Python and the coordinator
in incompatible states; and status bytes queued after a flush request could
make a healthy prefix acknowledgment look incomplete.

The broker now reports recoverable negative control ACKs, advances the control
read offset only after the actual positive ACK, and derives its closing state
from the ACK actually sent after protocol synchronization. A negative close ACK
leaves both peers able to settle the original evidence. Journal metrics apply
once inside the original serialized receive queue. Concurrent flush callers
share one bounded drain barrier that joins late status suffixes without resetting
its deadline or replaying an unknown acknowledgment. Failure remains sticky for
normal metadata execution, while original cleanup can finish.

All six focused broker checks pass on a private supported persistent Linux
filesystem, with zero skips. The three new cases use the actual fixed Python
program with one-shot syscall failures, or delay the original prefix ACK while
queuing concurrent status bytes/callers. Both facade TypeScript projects and
strict type-aware lint on the two affected files pass with zero warnings/errors.
Full outgoing-history privacy scanning passes. No actual CLI, native owner or
EasyEDA process was started. The new exact-head CI/review and installed Windows
V2 acceptance remain required.
