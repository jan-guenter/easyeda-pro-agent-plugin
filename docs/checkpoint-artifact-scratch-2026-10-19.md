# Artifact-local checkpoint verification

## Failure and scope

A disposable project-opening attempt stopped with SQLite's disk-full error
before creating its operation journal. The ambient temporary filesystem was
full. A separately inspected pre-navigation checkpoint and receipt had already
been published, with matching logical-dump hashes. The source remained unchanged
after the original application process and Job exited.

The code path identifies checkpoint verification as the next copy operation:

1. `current-disposable-open-runtime.ts` calls checkpoint preparation before
   constructing and publishing its opening journal.
2. `prepareCurrentDisposableOpenCheckpoint` in
   `current-disposable-open-checkpoint.ts` creates the checkpoint, verifies its
   target and managed descriptor, then calls `unchanged`.
3. `unchanged` calls `verifyCheckpoint`. Previously, that method selected
   `os.tmpdir()` for a second full SQLite snapshot through `VACUUM INTO`.

The published checkpoint distinguishes this from a failure in initial checkpoint
creation. No native stack was retained, so the precise verification-stage
diagnosis is an inference from that evidence and the maintained call path.
The failed opening is not retried by this change.

## Implementation

`checkpoint.ts` now places verification scratch beside the already opened
checkpoint artifact. It checks the directory against the caller's artifact-root
policy, revalidates its original pathname and control-root capability, opens an
independent directory descriptor and requires the original device/inode identity.
There is no hard-coded workstation path, new environment setting, fallback
location or disk-full retry.

The existing snapshot protections are unchanged: readonly source access,
exclusive no-follow file creation, current-user ownership, mode0600, one link,
complete SQLite checks and hashes, and source generation/freshness checks.
After its complete comparison snapshot exists, verification unlinks that exact
file and retains only its descriptor. Cleanup never removes a replacement file
at the old name. Filesystem exhaustion in the admitted artifact directory still
fails; unrelated receipts, checkpoints and source files are not removed.

Independent review also found that verification did not recheck the receipt
after reading it. Final verification now reproves the original receipt path,
inode and stable metadata before the final artifact and source checks. Source
freshness remains the final check. A concurrent receipt replacement or rewrite
cannot return a successful result with a stale receipt path.

Because verification creates scratch, its policy must authorize the artifact
directory, not just the two individual receipt/checkpoint paths. No write is
redirected to the project directory or an ambient temporary directory.

## Verification

The combined checkpoint, freshness, byte-bound and new location suite passed
47 tests. New cases cover unusable ambient `TMPDIR`, artifact-directory
replacement, a replacement scratch filename, allocation failure without
collateral cleanup, file-only policy refusal, and concurrent receipt replacement
or rewrite. Final targeted strict type-aware lint and global typecheck pass.
The new fixture registers cleanup before setup and removes only its own newly
created private directory after closing the retained control capability. Earlier
evidence and failed-run directories were not deleted.

The first focused run passed five cases but stopped at mechanical lint issues;
the later47-test run passed and again stopped at two test-style findings. Those
findings were corrected without changing checkpoint guards. A final seven-case
run separately checks the corrected test cleanup. None of these tests opens
EasyEDA or proves a new installed/live opening lifecycle.
