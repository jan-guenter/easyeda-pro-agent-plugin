# Validation and release

## Evidence ladder

Keep these claims separate: declarations parsed; code implemented; offline
tests passed; reproducible bundle built; package installed; private extension
imported; authenticated runtime admitted; exact live effect proved; saved and
reopened source/full-project delta proved. A later stage requires its own
evidence. No stage is fabrication approval.

Repository validation uses pinned Node/npm, current applicable strict
TypeScript, strict type-aware Oxlint with zero warnings, signatures/security
audits, unit/adversarial tests, privacy/license checks and CI build parity.
Use documented narrow exceptions rather than disabling categories to pass.
Run every packaged skill's metadata/reference validator, not just the original
control entrypoint. Independently forward-test complex skills on realistic
cases without revealing the intended answer.

## Failure and recovery cases

Test missing methods, stub returns, lossy public fields, native empty-net
defaults, child order changes, ignored properties, auto-persistence and delayed
disk writes. Include slow compilation, synchronous navigation followed by
asynchronous readiness, stale/wrong owner, hanging getters and tab switching.
Observe readiness with a deadline and two coherent exact samples. Never repeat
navigation to hide a readiness race; inconsistent positive identity stops.

Include active placement previews in reader tests. Public collections can contain
models absent from persisted source; silently filtering them would turn incomplete
evidence into a false success. Test settled and in-progress states separately.
Native pin-cache exceptions must abort the snapshot with a fixed stage code, not
an empty-net fallback. Fixed diagnostic inventories should have parity tests
against every emitted guard and reject private suffixes or unknown labels.
Cancellation resolving a failure does not establish which earlier opaque guard
fired; new diagnostics cannot retroactively supply missing evidence.

Journal the possible write before dispatch. Save intent must persist immediately
before dispatch after authority proof. Missing/error acknowledgment consumes a
Save attempt; reconcile/rebind/restart cannot grant a second Save. A genuinely
pre-dispatch failure needs exact separately retained non-dispatch proof.
Supported already-saved recovery reuses its original source/checkpoint/lifecycle
receipts; all other cases stop for review. Do not delete or rewrite journals.

An orphan risk quarantines all bridge operations. Reconnection, copied PIDs,
another control directory or native edits cannot bypass it. Retained old-process
termination and a new authenticated contained session are required, followed by
original-journal reconciliation. Restoring a database is a separate destructive
action needing exact closed-file scope, authority, backup and independent proof.

## Compatibility upgrade

Changing the facade's own source/bundle projections is not permission to change
external runtime pins. Capture installed declaration and implementation bytes,
review changed signatures/source paths and test against a disposable project.
Use fixed bounded validation calls until the new tuple is admitted; no raw-code
fallback. Never update a checksum solely because an admission check refused it.

When publishing, preserve the immutable private bridge identity/key epoch and
reproduce all bundle/license inputs. A changed reviewed bridge source closure
can invalidate build receipts even when runtime output happens to match. Derive
and review the actual closure; never copy old evidence onto a new generation.
Import or activate changed runtime bytes only through the supported workflow.

After Git publication and marketplace installation, verify version, packaged
file inventory, metadata and offline catalog. Start a fresh Codex chat to load
the installed catalog. Do not kill the host-owned gateway, patch a loaded cache
or force a connected runtime onto a new source tree. Report any outstanding
live admission/import requirement explicitly.

Research baseline: [official SDK repository](https://github.com/easyeda/pro-api-sdk),
[official type-package guide](https://prodocs.easyeda.com/en/api/guide/ancillary-projects/pro-api-types.html),
[API version policy](https://prodocs.easyeda.com/en/api/guide/stability.html).
See the repository's dated interface/reliability research for the pinned
declarations, detailed inventory and version-specific findings. Recheck current
official sources when upgrading; do not silently refresh this baseline.
