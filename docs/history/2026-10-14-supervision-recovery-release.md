# Ordinary-launch supervision recovery

Candidate `0.3.0+codex.20261014011500` adds `abandon-supervision` to the existing
ordinary launcher. It resolves a policy dead end after a facade restart loses
the original Windows process/Job handles. It does not restore those handles or
prove that their process tree terminated.

## Contract

Inspect the successful historical launch and use its `launchedSha256` as
`expectedLaunchedSha256`. The strict request also requires
`confirmAbandonSupervision:true` and `acceptUnobservedDescendants:true`.
Ordinary startup/recovery must be within the user's authorized task.

The coordinator refuses unknown/ambiguous launches, any current retained launch,
current uncertainty, stale digests, changed installation, nonabsent or changing
process samples, quarantine and journal drift. It uses the existing pinned
diagnostic helper for two absent same-name samples, then exclusively appends
`abandonment.json` bound to the original intent and launch. Original records and
the consumed operation ID remain unchanged. The returned state is
`supervision-abandoned`; identity, retained-authority, termination and design
claims remain false.

A separate new-ID launch still requires both ordinary-startup confirmations,
the reviewed executable/profile/helper, global admission, durable intent and
the native same-name check immediately before creation. Abandonment does not
launch, close, kill, navigate, select Save/Discard or repair a design journal.

This deliberately relaxes the previous ordinary-startup policy that required
original-Job termination proof forever. Differently named descendants or outside
work may remain. It does not relax any design quarantine, closed-file or
termination-proof requirement. See the [research and alternatives](2026-10-14-ordinary-launch-owner-research.md).

## System-library lookup remains omitted

The candidate LCSC lookup adapter was removed before release. Source review
traced a network-disabled request through the local device-update router. During
concurrent library refresh, that route can open and initialize or migrate the
system-library database. A renderer mode/network check cannot atomically prevent
the fallback. The normal HALF_OFFLINE path refuses library modification, but its
guard is not stable across this refresh interval.

This is a source-derived reachable path, not an observed live mutation. No lookup
was dispatched. The [backend review](2026-10-14-system-device-backend-effects.md)
records exact implementation hashes, offsets and remaining work. API coverage
now reports this concrete reason instead of the general library-scope omission.
A reviewed remote-only adapter or an explicit library-effects contract is needed.

## Validation and limits

The preceding installed002000 generation was independently admitted after a
real Codex restart and completed application-presence observation: two absent
samples, historical state unchanged, no termination/relaunch claim. That is
live validation of the diagnostic only, not abandonment or a new startup.

Focused coordinator tests exercise successful abandonment across a simulated
restart, unchanged original receipts, consumed IDs, separately guarded new
startup, current-owner/ambiguous-state refusal, input confirmations, digest and
presence refusals, quarantine and a final-gate journal change. Existing bundled
startup tests cover the public catalog/schema path. Build, strict lint/types,
package/privacy checks and required GitHub CI remain release gates.

Local focused coordinator, bundled-startup, facade-mode and coverage tests pass.
Full types, zero-warning strict type-aware lint, build, compatibility, inventory,
package/repository privacy and all seven custom/official skill checks pass.
Independent source review accepts the abandonment contract. Required GitHub CI,
publication and official installation are pending at this source checkpoint.

No Windows helper, external compatibility pin, bridge or dependency changed.
The exhaustive inventory remains774distinct SDK methods:211public,
30native,82blocked,451omitted. There are309guarded routes,94blocked and2partial;
ten current restricted tools,35legacy tools and seven skills. This application
workflow adds no SDK method coverage. Live abandonment/startup and shortcut
execution, a safe catalogue adapter, retained-owner continuity and broader CAD
families remain backlog.

Final commit, CI and exact installed evidence belong to the release PR delivery
receipt. No new-source live validation or completed installation is claimed by
this source checkpoint. No production project or project record was accessed.
