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

## 2026-11-08 source provenance correction

The Git checkpoint introducing this record and its source/test changes is
`256f415efa8f18c7d95026660f2ebfabb1df001d`; its committed tree is
`ef00e9dc8a318b686a30bde7317d33e3d3ee67fc`. Its Git author timestamp is
`2026-11-08T00:04:22+01:00`. These identify the committed increment only.
The complete test-time worktree was not sealed in the retained evidence and
cannot be reconstructed from it. The reported checks above keep their original
scope and observations; they are not attributed to this commit or a later tree.
See the [PR190 attribution correction](2026-11-08-pr190-history-attribution.md) for the evidence limits.
