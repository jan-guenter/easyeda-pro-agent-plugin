# Managed import and original cleanup through the actual dispatcher

Before connected import, a new integration fixture composes the actual
`EasyedaControlEngine`, production `UpstreamEasyedaClient` scope/call path,
`ManagedFixtureImportCoordinator`, original `WindowsControlRuntime` forwarding
receiver/validator and maintained tracked cleanup. Its HMAC gateway performs a
real authentication/lease lifecycle against synthetic loopback peers. No MCP
child, Windows helper, CAD application, user bridge or project is started,
connected, opened or adopted. Native process/Job observations remain synthetic.

The environment GET and importer use distinct managed journals/captures within
one original authenticated scope. The test verifies their exact shared session
and HMAC dispatch binding, distinct operation-bound authority, retained pending
Promise, lost original artifact acknowledgment, original session closure, no
remaining lease and no replay. Cleanup runs through the public coordinator action
schema, rather than bypassing it with a bare fake cleanup callback.

The actual composition exposed three production gaps hidden by fake dispatchers:

1. A watcher refusal correctly completed the importer without dispatch, but its
   last actual native call was the successful completed environment read. The
   generic completed-journal refusal made that required cleanup unavailable.
   A separate accessor now admits only the exact original entered-and-settled
   `managed-fixture-import209-v1` environment call, phase
   `actual-config-directory-preflight`, its derived `-environment` identity and
   the original immutable plan/capture/session/validator. Generic completed
   journals still refuse. Copied JSON and an environment refused before actual
   entry cannot qualify. The accessor supplies only the existing cleanup owner;
   it does not release a lease, clear quarantine or issue writer authority.
2. `beforeDispatch` completion was incorrectly treated as proof the dispatcher
   entered. The engine now records that boundary in its private original-journal
   WeakMap and checks its captured upstream receiver/method again after the
   pre-dispatch callback. A changed dispatcher refuses and clears its unused
   marker/capture before native entry. The coordinator selects its last native
   journal from actual engine facts. A distinct refusal inside the actual
   upstream method before SDK client entry remains conservatively quarantined
   under the original importer; it is never mislabeled as no effects.
3. The importer accepted only64hex cleanup nonces, while maintained cleanup
   issues technical restart/original-dispatch strings. Its action schemas now
   use the maintained32..512character transport bound. The original class still
   authenticates the exact nonce against its retained object, process, phase,
   validator and original HMAC session. No nonce string alone creates authority.

The regression reaches both successful and ambiguous importer paths, a watcher
refusal, a post-callback dispatcher replacement, upstream pre-client reproof
failure, publication settlement and a refused never-entered environment. It also
completes original environment cleanup followed by destination/owner release
without selecting an unissued importer source. Partial import acceptance,
registration, complete closed SQL, saved contents and broader writer eligibility
remain false.

Node24.18.0/npm11.16.0 ran with soft core limit zero. All95 focused tests,
strict types and zero-warning targeted type-aware lint passed. Repository,
package/MCP and all-seven-skill validators passed. Isolated offline npm ci
installed151 packages and reported zero vulnerabilities.
The initially failing composition output was retained outside the package. No
bundle, generated API coverage, compatibility manifest, installation or
publication is included. The parent must still perform the actual connected
admission and native lifecycle with its single original owner.
