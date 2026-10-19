# Checkpoint and validation reliability batch

Candidate version: `0.3.0+codex.20261019111307`.

This batch combines the runtime checkpoint correction found during installed
schematic-rename validation with test infrastructure, package-process cleanup
and an additional PCB-text prerequisite. No new general writer is enabled.

## Changes

- [Checkpoint scratch and receipt freshness](checkpoint-artifact-scratch-2026-10-19.md):
  verification uses the already authorized artifact directory, preserves its
  original directory capability and checks the receipt again before returning.
- Pre-navigation failures: checkpoint preparation now preserves its original
  local cause and returns a fixed message with `dispatched:false`. It creates
  no synthetic journal and grants no retry or replacement process ownership.
- [Temporary paths and validation closure](test-validation-temporary-roots-2026-10-19.md):
  23 test allocations honor the temporary root, rejection tests retain original
  errors, and the validator uses original-child EOF closure with explicit final
  verification. Uncertain closure preserves the child and its directory.
- [PCB String publication](current-pcb-string-save-prerequisites-2026-10-19.md):
  an offline relation checks the exact one-record compiler envelope against the
  original create plans. Complete live observation, worker delivery and Save
  completion remain unproved; writing stays disabled.

The control skill now explains checkpoint failures before journal creation.
Plugin metadata also corrects its stale description of SCH rename: the disposable
lifecycle is implemented and registered, but connected validation has not passed.

## Installed validation attempt

The restarted100838 facade matched all496 source files, three runtime files and
the compatibility manifest. Complete installed comparison passed all1507files,
30,916,896bytes and42directories. The unchanged verifier first reached its120s
deadline from the Windows-mounted marketplace; a private Linux worktree at the
same merged-main commit completed the comparison. Both results are retained.
All18 application runtime pins and the scratch helper matched. The preceding
main Linux CI39238721171 also completed successfully.

The original launcher started EasyEDA, the bridge authenticated, and the context
observer reported Start Page with no current project. The one disposable opening
attempt then returned SQLite's disk-full error before its journal existed.
A pre-navigation checkpoint and receipt had been published. Together with the
maintained call path and full48GiB temporary mount, this identifies verification
scratch as the likely failure point; no native stack was captured.

One normal close was acknowledged, followed by retained root and Job termination.
The disposable source remained598016bytes with its original hash. There was no
opening replay, SCH rename, explicit Save, prompt choice, restoration or production
design access. The failed opening does not count as connected SCH validation.

Launch diagnostics attributed59.6s to the first admission scan and16.8–17.7s to
later admission checks, versus0.4s to application dispatch. The status scan covered
391journals in17.1s. These are observations of this run, not a comparative speedup.

## Remaining work

After publishing/installing this batch, a fresh Codex session must admit the actual
new host before a new-ID disposable SCH lifecycle. The old attempt is finished
and must not be replayed. PCB text still needs an exact live observer, complete
Save/worker/queue proof and a saved/reopened writer lifecycle. Populated Dimension
and Image cases, polygon identities, library/3D operations, layout/routing/ECO/
exports, bootstrap and additional platform adapters remain backlog.

## Release verification

Focused source checks passed for checkpoint behavior, opener errors, PCB text
publication and test/validator changes. Their individual reports distinguish
overlapping cases and retained failures. Full frozen verification, protected CI,
publication and installation are pending at this checkpoint.

The frozen source projection contains497files, SHA-256
`bf33e1438bc2614593cbd4bf06bf2ad5adc67c7c4405b4f526826d30784518f4`.
The three runtime files have composite SHA-256
`69d0abe8838d4c0290affb7e5b6d11f92eaf0c48de4a920ebe10173746486d87`;
the manifest is
`911c785f6e56f0cdfc5213e363500a7f78b357a60c3480ee249e7e6f8c1726cb`.
External runtime/bridge pins are unchanged. Dependency installation/listing,
151 registry signatures,40 attestations, zero-vulnerability audit, sanitizer,
build and compatibility checks passed. Repository validation and all seven
skill validators passed. Root and independent agent reviews accepted the
first-party source and privacy checks; these are not human-review claims.
