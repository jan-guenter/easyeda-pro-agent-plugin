# Test temporary roots and validation closure

Draft source changes dated 2026-10-19. This batch fixes temporary-path assumptions
and package-check cleanup. It does not change live EasyEDA process ownership,
editor behavior or writer admission.

## Temporary paths

The preceding local release run filled the 48 GiB `/tmp` mount. Setting `TMPDIR`
redirected most fixtures, but 23 test allocations and the package validator still
selected `/tmp` directly. Those allocations now use the canonical directory
returned by `realpath(os.tmpdir())`. Two in-memory bridge build tests also use
their owned fixture directories as working directories.

The shared test helper accepts only a single path-segment prefix, creates a
fresh directory with `mkdtemp`, and checks its canonical path and directory type.
On POSIX it also checks owner identity and mode `0700`. It does not claim that
POSIX mode bits establish Windows ACL privacy. The TMPDIR symlink test explicitly
skips Windows, whose temporary-directory environment and link permissions differ.

Literal `/tmp` values used only as parser examples or hostile supplied data remain
unchanged. Existing descriptor/path identity checks and private cleanup rules are
unchanged. New tests verify that unknown root contents and unknown contents of an
expected child directory prevent recursive cleanup. Historical evidence directories
were not removed or relocated by this batch.

## Original failure diagnostics

Fourteen activation/close transaction cases previously accepted any rejected
execution promise before asserting recovery behavior. A setup failure before
dispatch could therefore disappear behind an invalid operation ID or a zero-call
assertion.

Those cases now require their intended original dispatch boundary before recovery
assertions run. If the boundary was not reached, an `AggregateError` retains both
the original rejected value and the secondary assertion. Its `cause` is the original
failure. This improves diagnostics without admitting a different runtime result or
weakening the transaction assertions.

## Package validator closure

The package validator now finalizes its original client and transport after either
success or connection/catalog failure. The pinned MCP SDK's standard stdio close
sends EOF and later escalates to signals. A small validation-only transport instead
retains its original `ChildProcess`, uses the SDK's JSON-RPC framing and sends stdin
EOF without process adoption, detachment or signals.

The SDK can call `client.close()` without awaiting it after initialization failure.
The validation transport therefore records close failures without rejecting that
detached promise. The validator must separately await `verifyClosed()`, which
rethrows the retained error. A timeout or unsuccessful exit remains a failure even
if the child exits later.

The 10-second EOF deadline is a reporting deadline, not permission to terminate the
child. On uncertainty the validator reports failure and retains its original handles
and smoke directory. It can consequently remain running until that original child
closes. The directory is removed only after successful closure verification and the
existing private, empty-directory checks. Original operation errors and cleanup
errors remain separate report entries. Child stderr is drained but arbitrary child
output is not embedded in the validation report.

This transport is used only by package validation. It does not replace the live
facade's upstream transport or alter its process-control authority.

## Focused verification

- The affected fixture suite passed 219 tests with no failures or skips.
- The final helper/transport run passed 10 tests. Five helper cases overlap the
  preceding run; these counts must not be added as distinct tests.
- Transport cases cover framing, original EOF closure, failed spawn, unsuccessful
  exit, SDK initialization rejection and EOF timeout. The timeout test lets its
  original synthetic child exit naturally and does not leak or kill it.
- Corrected global TypeScript checks and strict type-aware lint passed.
- One package-validator smoke passed all 81 checks and listed 46 tools. Stderr was
  empty and its owned smoke directory was removed after verified EOF closure.
- Independent source review accepted the final helper, transport and validator
  changes. Intermediate lint/type diagnostics remain retained rather than being
  relabeled as passing runs.

These are local source and isolated validation results, not a full-suite release,
new installed package or connected EasyEDA evidence. Full temporary-root retention
policy is unchanged; failed-run evidence must not be broadly deleted to recover
space.
