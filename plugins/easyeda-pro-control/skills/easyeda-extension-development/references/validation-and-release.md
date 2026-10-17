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

## Historical evidence performance

Repeated admission can spend substantial time parsing the same historical SQL
snapshots. Reuse only deterministic digest results whose complete input bytes,
paths and file identities are freshly checked on each call. Keep journal,
claim, sidecar and pinned-reader checks outside that reuse decision. Never cache
process ownership, bridge admission, quarantine clearance or writer authority.
Bound memory retention; expiry of a pure digest entry is a reason to evict or
recompute it, not evidence that a freshly verified file became unsafe. Test a
warm hit against changed bytes and sidecars, and measure connected latency
separately before claiming a speedup.

Parallel file hashing needs a shared bound across journal and phase batches,
not a separate limit multiplied by each caller. Reserve before opening files,
release after descriptor cleanup, and drain scheduled sibling checks on failure.
Keep cold journal parsing and selected-result ordering deterministic. Tests
should hold reads and closes independently to prove the limit and failure drain.

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

For post-write reopening, retain the successful operation's actual closed
checkpoint, raw copy and complete SQL inventory before retiring its owner.
Revalidate the closed source before releasing captures: release advances the
native lifecycle and invalidates the old copy authority. After release, the
original snapshot remains historical evidence, not permission to reuse those
handles. A new verification owner must bind its pre-open raw-byte check to that
post-edit snapshot, exclude both persistent upload-cache namespaces, and collect
saved content in the newly admitted generation. Compare its final closed SQL
inventory with the post-edit inventory. A failed write or partial snapshot must
not receive a continuation, and a copied journal cannot reconstruct one.

Reopened serialization can depend on native cache loading. Trace the cache
producer and replay parser as well as the final serializer. On the pinned current
worker, cached per-document history excludes EDIT_HEAD and may synthesize a
different DOCHEAD user. Model exact supported alternatives from complete source;
never ignore a differing field or change the persisted SQL actor. Report the
matched serialization separately from observed cache provenance. A later model
correction cannot turn a stopped original read into successful lifecycle evidence.

Admit the saved verifier's supported input before dispatching its writer. A
materialized empty symbol can still have tombstoned drawing atoms in raw history;
check the complete original SQL history when cache replay excludes those atoms.
Reserve the next edit's row, chunk, byte and ticket capacity, and bound the whole
serialized saved result rather than only the caller's string lengths. A known
post-write limit failure belongs in preflight, not recovery.

For a disposable forward/inverse orchestrator, make continuation requests name
the exact expected phase. A lost response must not turn a repeated request into
the next mutation. Preserve the real stage owners and allow polling only for
explicitly pending observations. Derive the inverse from the original initial
metadata and the successfully verified post-edit snapshot, with fresh clock
qualification; do not register shape-compatible copies as authority. Diagnostic
closed-state classification must not revive a failed writer, replace missing
post-dispatch evidence, or authorize a blind inverse.

The ordinary launcher's `observe-application` action is a separate diagnostic
for a named historical operation after restart. Its two matching same-name
presence samples cannot restore original handles or prove termination. Keep
historical state separate from observed presence; neither result may create a
receipt, clear an unresolved attempt or grant relaunch authority.

Explicit `abandon-supervision` is a different ordinary-startup policy. Require a
successful historical launch and its exact digest, no current retained owner,
explicit acceptance of unknown descendants, unchanged installation/journal,
clear quarantine and two absent samples. Preserve originals and append a
distinct abandonment receipt. Keep ambiguous launches blocked and the old ID
consumed; do not admit this receipt to any design or termination-proof consumer.

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

When a runtime interface gains an optional method, test the production factory's
forwarder through the real engine and retained runtime, not only a mock that
already implements the method. Current clock sampling once passed its leaf
tests but failed live because the factory omitted the callback. Pin the
forwarded method's identity and receiver; missing wiring must not be repaired by
accepting copied captures or weakening original-owner checks.

Distinguish a historical clock endpoint from a currently owned observation.
Legitimate capture/release steps can invalidate an earlier live token's lifecycle
epoch without changing its recorded timestamp. Seal historical values only
after their original live checks pass, and bind later use to a fresh original
owner and observation. Test the composed path with real issuer capture/release
interposition; an always-current mock misses this failure. Do not weaken shared
epoch guards or reconstruct ownership from saved clock JSON.

## Compatibility upgrade

Changing the facade's own source/bundle projections is not permission to change
external runtime pins. Capture installed declaration and implementation bytes,
review changed signatures/source paths and test against a disposable project.
Use fixed bounded validation calls until the new tuple is admitted; no raw-code
fallback. Never update a checksum solely because an admission check refused it.

Trace helper runtime dependencies as well as the calling adapter. A new Date
compiler can still invoke a native scratch helper pinned to an older Electron
executable and DLL set. Check the complete fixed runtime inventory and version
assertions before a one-shot live attempt. Keep historical helper bytes and
evidence validators intact when adding a new runtime profile; reproduce the
new helper separately in CI. Passing schema/compiler tests does not establish
that its process can start on the installed application version.

Compatibility can be capability-specific. The supplied-coordinate math profile
admits its reviewed API 0.3.50 closure without changing the older design tuple.
The local environment/unit profile shares exact identity checks but fixes its
own reviewed methods and effects, including a compiled-date local-cache write.
New or unknown configured generations register reference, discovery, status,
calculation, local-system, shortcut/extension-index/editor-shell/identity-context observers and the
separate ordinary launcher. Bridge execution requires exact hashes and an
authenticated session. Launch instead requires exact installed/profile-specific
code admission, explicit existing-profile effects and durable attempt tracking;
it does not prove profile isolation or connection. Keep registration separate from runtime
admission; adding a method to discovery must not expose unrelated old adapters.
The identity-context observer is native UI metadata only. Its project/branch
fields and canonical active-document subset do not admit legacy context readers,
project-manager RPCs, file paths, navigation or transactions.

The current shortcut reader calls only `sys_ShortcutKey.getShortcutKeys`.
Its optional `includeSystem` defaults false; preserve the actual raw keys,
including mixed-case system names and empty tokens that differ from the
declaration union. Shortcut scopes are not document-type enums. Bound and copy
both complete samples, retain public/RPC/locale owners, and pin the delegated
UI implementation as well as the API. Output bounds do not bound or cancel
the vendor's preceding enumeration. Registration, callbacks and keyboard input
remain outside that reader. Prior201500 launch/authentication and Start Page
shell/context observations do not validate this new route or the shared
UI-verifier refactor.

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

After a marketplace upgrade, inspect the installed version and files before
issuing another plugin add. The upgrade may already have refreshed an enabled
plugin. A later redundant add error does not undo verified installed bytes;
retain the error and verify actual state before any retry or repair.

Research baseline: [official SDK repository](https://github.com/easyeda/pro-api-sdk),
[official type-package guide](https://prodocs.easyeda.com/en/api/guide/ancillary-projects/pro-api-types.html),
[API version policy](https://prodocs.easyeda.com/en/api/guide/stability.html).
See the repository's dated interface/reliability research for the pinned
declarations, detailed inventory and version-specific findings. Recheck current
official sources when upgrading; do not silently refresh this baseline.
