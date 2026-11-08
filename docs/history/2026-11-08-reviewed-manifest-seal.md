# Separate reviewed-manifest sealing

Inspection after the CI fixture repairs found a runtime issue in expected
fingerprint construction. Its internal whole-manifest seal reused the
256 KiB fingerprint artifact limit. The complete reviewed manifest now exceeds
that size because it records the growing source roster, even when the selected
runtime is the small bundled deployment.

Only the internally loaded reviewed manifest now uses a separate finite
4 MiB sealing bound. Its existing descriptor-only data traversal, structural
and depth limits, complete serialized comparison and reproof across awaits
remain in place. The expected fingerprint, local runtime identities, final
artifact and trailing-newline limit remain at256 KiB. There is no public size
override and no compatibility or runtime admission bypass.

A regression uses a complete2,000-file reviewed source roster larger than
256 KiB with a small bundled runtime fingerprint. Construction succeeds and
the resulting artifact stays below its original limit. Changing a source-file
digest during the local launcher await still refuses before construction can
complete. Existing exact artifact-size, getters, malformed data, ownership and
drift cases remain active.

The combined expected-fingerprint and inverse GET source checks passed48
cases. Both TypeScript configurations and changed strict type-aware lint
passed. These are synthetic local-I/O and source checks. No application,
project, connection or native writer was started.
