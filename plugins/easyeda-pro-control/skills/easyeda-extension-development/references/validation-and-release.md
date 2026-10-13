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

## Process-owning helper tests

For an adapter that launches a native helper, distinguish the transport child's
close event from observed termination of the owned native process and its Job.
A termination request, timeout or spawn exception is not proof of cleanup.
Retain the original failure and unresolved ownership even if a late event arrives;
do not upgrade the returned outcome or make the consumed attempt reusable.

Register acquired resources before fallible follow-up work. Test partial
construction, failed receipts and failed closes. Cleanup must attempt every owned
resource, retain the primary error and report required cleanup failures. Keep
the original process and Job handles until their exit observations are captured.
An empty Job observation alone does not substitute for the original root's exit.

## Public callback tests

Exercise the actual registered MCP callback as well as internal coordinators.
Check the installed SDK's schema normalization and error-output behavior. A raw
object shape can strip unknown keys before the callback, and an error response
can skip SDK output validation. Preserve strict nested input and validate bounded
error replies locally when that SDK requires it. Test malformed calls followed
by a valid call to detect accidental consumption of a one-attempt reservation.

Keep pure result-format tests, injected-I/O coordinator tests and tests using the
index's default owners separately labeled. A composed public route needs its own
race and lifecycle tests; passing its components does not establish that result.
Do not add a caller-selectable factory, execution verifier or test port to the
production route merely to make a positive test easier.

## Compatibility upgrade

Changing the facade's own source/bundle projections is not permission to change
external runtime pins. Capture installed declaration and implementation bytes,
review changed signatures/source paths and test against a disposable project.
Use fixed bounded validation calls until the new tuple is admitted; no raw-code
fallback. Never update a checksum solely because an admission check refused it.

Compatibility can be capability-specific. The supplied-coordinate math profile
admits its reviewed API 0.3.50 closure without changing the older design tuple.
The local environment/unit profile shares exact identity checks but fixes its
own reviewed methods and effects, including a compiled-date local-cache write.
New or unknown configured generations register reference, discovery, status,
calculation, local-system, fixed extension-index/editor-shell observers and the
separate ordinary launcher. Bridge execution requires exact hashes and an
authenticated session. Launch instead requires exact installed/profile-specific
code admission, explicit existing-profile effects and durable attempt tracking;
it does not prove profile isolation or connection. Keep registration separate from runtime
admission; adding a method to discovery must not expose unrelated old adapters.

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
