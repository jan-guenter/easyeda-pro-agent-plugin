# Controller output and exact publication recovery

This follows the [release ID and source-scope correction](2026-11-04-release-id-grammar-and-source-scope.md).
The complete review of `3da15a5bbda2e47e5594db2b58c0519c55064856`
found four further issues. All four were verified against their actual paths.
The previous unchanged head passed all eleven required GitHub CI jobs, with
14,107 facade passes, five expected platform skips, no failures and 424 bridge
passes. Those results do not validate the later corrections.

The manager now installs persistent output error/close handling before its
first publication. Each protocol line awaits its original write callback as
well as backpressure. A write admitted as true can therefore fail
asynchronously without an uncaught exception killing the original controller.
The failure is sticky and reaches the existing blocked/publication-fault path;
the same failed channel cannot publish another diagnostic or regain authority.
The focused isolated SDK-child regression proves retained original identity,
no implicit closure, durable bounded failure evidence and supported disposal
of its unused test child. Its synthetic output is bypassed only for fixture
cleanup; production has no channel-recovery switch.

Explicit terminal record settlement now handles a completion file left behind
when publication and cleanup both failed. It derives the path, byte count,
SHA-256 and exact serialized text from its original retained release record.
Only the maintained exact managed reader and matching text can recover that
artifact descriptor. The original owner, methods and helper acknowledgment are
checked around the await. Missing or different content rethrows the publication
error. The initial failed call remains failed; settlement neither retires
captures nor releases the helper again. Eight real managed-publication tests
with synthetic native transport cover exact, absent and different leftovers,
including failed validation/cleanup and unchanged intent bytes.

The forward-prewrite success schema now rejects canonical JSON plus its newline
above the same existing 4,268,032-byte publication limit. The fixed preparation
still fits the existing metadata margin; no allowance increased. An exact-bound
record parses, while one additional byte refuses before publication can retain
an impossible success plan. The ten-test source lifecycle slice passed,
including unchanged original managed evidence and available original cleanup.
Pure numeric declarations were then moved before the schemas without changing
the predicate; the final combined check covers the frozen source.

The connection guide now states every mandatory idle-legacy termination limit:
explicit user authority, no usable shutdown command, retired/reference-only/
ownership-conflict state, no native owner, immediate original PID/start,
executable, module and resource verification, and a retained pidfd through
observed exit. Existing prohibitions on SIGKILL, unrelated services, lease
removal, alternate roots and cache modification remain in force.

These nineteen focused checks are local controller/schema/publication evidence.
They prove no connected design mutation or native source qualification. Final
combined types, lint, reproducible build, exact-head CI and review remain release
gates. The separate source-sealing/content-reader batch remains unpublished.
No production design was opened, edited or saved during this follow-up.
