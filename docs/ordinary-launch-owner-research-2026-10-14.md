# Ordinary launch supervision after restart

Source-only assessment, 2026-10-14. No application, helper, bridge or project was
opened. No private journal was read. The smaller abandonment policy below is
implemented in the current source candidate; this note does not establish live
validation. The persistent-owner design remains a proposal.

## Recommendation

Implement explicit abandonment of unavailable supervision for an acknowledged
ordinary launch before building a persistent Windows owner. Keep abandonment
distinct from termination and from design recovery. A permanent block on every
later ordinary application start is a conservative product policy, not a
requirement of Windows Job objects or a consequence of the disclosed ordinary
startup contract. This conclusion is an engineering judgment from the source
below, not a claim that an absent process list proves closure.

The smaller policy changes the condition for a **new ordinary startup**. It
does not change the evidence required to prove termination, authorize a design
operation, recover C10, Save, copy a closed database or replay an old attempt.

## Reviewed baseline source

The following hashes describe the research baseline at commit
`d165e4075975f4c484c3417244e8630c7af32a08`, abbreviated `d165e407`, under
`plugins/easyeda-pro-control`. The current coordinator has changed to implement
the policy below and must not be reported as matching this baseline hash.

| File | SHA-256 |
| --- | --- |
| `server/src/ordinary-launch.ts` | `f7f5694868a45453e79ccd5a48c8cde09deac117e625f00ddad7deda6b4c099b` |
| `scripts/windows-authority.ps1` | `811d22eca033a31b58a9963ee7d51d2a3ed8182a0d859e511a42cbae68786c65` |
| `server/src/windows-runtime.ts` | `8c2d4c341c27f9300ff1aba2bc8bc553f735a79603bc3e790ca00f9f1caf4a4b` |
| `server/src/windows-authority.ts` | `a46059fd9b3f01d9f6b547bd851eeff2e97c0f8cddedd3fb2cc06814eb043d11` |

`ordinary-launch.ts` pins installed package `3.2.206.715d940d`, executable,
`app.js`, `package.json`, `editor.ini` and the helper. Its limitations explicitly
allow ordinary existing-profile startup effects and do not promise isolation,
no project access, bridge authentication or design admission. The baseline's
`operations.every(complete)` check nevertheless requires every historical
attempt to have a termination or nondispatch receipt before a new operation.
[Coordinator source](../plugins/easyeda-pro-control/server/src/ordinary-launch.ts)

The helper creates `CreateJobObject(IntPtr.Zero, null)` at line 45. The separate
`Id` GUID is only a managed label. `AssertLimits` requires zero limit flags, and
there is no `SetInformationJobObject` or termination API implementation. Its
`Dispose` closes the Job and root handles. The stdin-EOF `finally` at lines 519–522
does not observe completion or emit a receipt. Normal facade shutdown calls
runtime `release`, which clears ownership and releases that transport without
calling `observeLaunchTermination`.
[Helper](../plugins/easyeda-pro-control/scripts/windows-authority.ps1),
[runtime](../plugins/easyeda-pro-control/server/src/windows-runtime.ts),
[shutdown registration](../plugins/easyeda-pro-control/server/src/index.ts)

Windows confirms that a null Job name creates an unnamed object. Only named
Jobs can be reopened through `OpenJobObject`. Closing the last handle does not
kill members without the kill-on-close flag; the object remains until associated
processes also exit. Therefore cleanup is neither a termination request nor
termination evidence. The existing GUID cannot reopen this unnamed Job.
[CreateJobObject](https://learn.microsoft.com/en-us/windows/win32/api/jobapi2/nf-jobapi2-createjobobjectw),
[Job objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects)

## Small explicit recovery policy

Implemented candidate request. Copy `expectedLaunchedSha256` from the exact
operation's `inspect` result; the placeholder below is not a usable digest.

```json
{
  "action": "abandon-supervision",
  "operationId": "the-existing-operation",
  "expectedLaunchedSha256": "<inspected launchedSha256>",
  "confirmAbandonSupervision": true,
  "acceptUnobservedDescendants": true
}
```

This action requires authority to relinquish supervision. It is not inferred
from `inspect`, `observe-application`, a disconnected bridge or an absent
same-name process. The boolean fields express that explicit action; they are
not a new technical proof.

The candidate keeps the first implementation narrow:

1. Accept only a valid, acknowledged `launched.json` whose original owner is
   unavailable to this coordinator. Do not abandon its current retained launch,
   a current uncertain operation, an empty reservation or an intent-only
   `launch-unknown` record. An unacknowledged dispatch can still be ambiguous;
   no absence-based retirement of that case is proposed.
2. Retain serialization, the facade lease, bridge quarantine, global allocation
   exclusions, exact installation checks and the final journal recheck. Require
   two matching same-name **absence** samples through the existing pinned
   diagnostic helper. Starting that helper does not launch, adopt, close or
   terminate EasyEDA. Any presence or changed sample refuses abandonment.
3. Exclusively append a bounded `abandonment.json`, bound to the exact
   intent and launched-record hashes. Preserve all original records and IDs.
   Validate the new record on every inventory read, including contradictory
   terminal states. A valid existing abandonment is inspected, never repeated.
4. Return a distinct `supervision-abandoned` state with `attemptConsumed:true`,
   `terminationProved:false`, `originalLaunchIdentityVerified:false`,
   and `designExecutionAuthorized:false`. The latter identity and design fields
   are retained in the nested abandonment receipt. No retained-handle authority
   is granted.
   Describe the lost proof honestly; do not mint `terminated.json` or present
   abandonment as a repaired launch.
5. Let a separate ordinary-startup settlement predicate accept this receipt.
   Keep the old operation ID consumed permanently. A new launch still requires
   a different ID, both existing explicit startup confirmations, exact pins,
   all quarantine/allocation checks and both current same-name checks, including
   the helper's check immediately before process creation. A surviving same-name
   application still blocks startup.

The new receipt settles supervision policy, not application state. Same-name
absence does not exclude differently named descendants or outside services, and
is not continuous across awaits. A new ordinary start can have the documented
existing-profile effects even when old termination is unknown. This residual
risk must be disclosed and accepted. The candidate is explicitly weaker than
the former prerequisite of proven original-Job termination, but stricter than
pure relinquishment because same-name absence is mandatory. Neither difference
turns abandonment into proof of original-Job termination.

That stronger requirement remains appropriate wherever a caller needs closed
design files, no surviving writer or original execution-authority termination.
Ordinary startup already grants none of those claims. The shared design
recovery/closed-session proof APIs must not accept abandonment receipts.
[Separate authority contracts](../plugins/easyeda-pro-control/server/src/windows-authority.ts)

The small implementation is confined to coordinator/schema behavior, focused
tests and discovery/skill documentation. No native-helper change or daemon is
necessary. The v1 acknowledged launch can use this policy without being
converted into a v2 retained owner.

## Future continuity, if retained proof is required

A dedicated ordinary-only Windows owner can retain its original root and Job
across facade/client disconnection. Do not reconstitute generic design authority
by setting a new `WindowsControlRuntime` to `owned`.

Use a private, operation-bound owner/client protocol with fixed launch-once,
inspect, observe-termination and terminal-ack actions. Persist owner identity and
private reconnect material before dispatch. A restarted client authenticates
the original owner, which samples its retained root/Job. Keep the owner alive
until the facade acknowledges a durably published terminal receipt, even after
the application exits. Otherwise a lost reply recreates the lockout.

A local named pipe needs an explicit logon-SID ACL, first-instance enforcement,
remote-client rejection and bounded authenticated messages. Default pipe
permissions include broader readers. Pin the peer PID/start identity and helper
protocol; endpoint reachability alone is not ownership.
[Pipe security](https://learn.microsoft.com/en-us/windows/win32/ipc/named-pipe-security-and-access-rights),
[CreateNamedPipe](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-createnamedpipea),
[server PID](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-getnamedpipeserverprocessid)

Concrete work would be new ordinary-owner/client scripts and a TS adapter, v2
coordinator records, plus allocation/shutdown integration. Estimate 600–900
owner/client/adapter lines and 150–250 coordinator/glue lines. Bootstrap must
establish real Windows lifetime independence, not assume Node `detached` or
`unref` provides it. Source generations must survive marketplace cache pruning.
Owner failure can still lose the proof; old unnamed v1 records do not acquire
new handles retroactively. These are reasons to keep the explicit supervision
policy separate from automatic continuity, rather than delay practical recovery
until the larger owner implementation is complete.
