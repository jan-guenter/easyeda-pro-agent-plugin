# Historical validation and operation inspection

## Changes

The aged-v2 historical terminal checker now reuses a completed semantic
calculation after freshly checking its complete file dependency set. The set
contains 69 roles across at most 67 files: the journal, 44 phase artifacts, terminal,
evidence, three raw database copies, three checkpoint/receipt pairs, compatibility
manifest and three packaged compiler assets. Every reuse still verifies bytes,
file identities, database sidecar absence, the control root and runtime.

The cache holds at most four entries and 32 MiB of encoded data, with a fixed
ten-minute lifetime. A failed reuse evicts the entry and refuses that request;
it does not retry the cold validator in the same call. The raw admission scan
still checks all journal and ordinary phase bytes. No live ownership, admission
decision, edit permission or historical continuation is cached.

Review also found a correctness issue shared with the older locked-v1 cache.
After a successful cold validation, asynchronous cache enrollment could become
ineligible and return the earlier result. Evidence could change during that
interval. Both wrappers now finish that fallback with one fresh fixed cold
validation, followed only by synchronous result checks. It is not enrolled.
Known contradictions and cleanup failures remain hard refusals.

## Validation so far

The cache patch passed 319 focused tests, strict types and type-aware lint with
zero warnings. Tests include the maintained synthetic lifecycle and actual
historical replay/byte observers, plus explicitly labeled mocked race controls.
They access no EasyEDA application or production project.

In the synthetic aged fixture, cold qualification launched 18 SQL-reader children
and took about 20.1 seconds; warm fresh-byte verification launched none and took
about 2.25 seconds. Combined admission took about 21.7 seconds cold and 3.92 seconds
warm. These are fixture measurements, not connected performance claims.

The actual running 140500 phase exceeded the MCP client's 600-second response
deadline. That did not establish cancellation: the original facade continued
working and later produced its scratch-reference intent. Its original operation
must be inspected, not replayed or rebound.

That original phase subsequently completed successfully. The case was then
retired through its offered closed-baseline cleanup, without relaunching or
attempting a rename. The original process termination and capture release are
recorded. A final descriptor-stable read matches the 598,016-byte baseline
exactly, with no database sidecars. This validates cleanup of that attempt, not
the rename writer. The disposable fixture remains in place; production designs
and records were not accessed.

PCB rename inspection now runs outside the mutation queue and before the
coordinator's busy rejection. Strictly validated `inspect` requests can return
detached retained snapshots while a one-shot phase is pending. They create no
owner, restore no continuation and grant no edit permission. Begin, advance and
cleanup remain serialized. Twelve focused behavior tests, strict types and
type-aware lint passed, including the actual registration callback with a held
serialization gate. Independent review accepted both fixes.

## Remaining work

- Run one new disposable PCB rename case after the updated plugin is installed,
  loaded in a fresh session and admitted. The retired case cannot be resumed.
  Its baseline and clock check are not connected writer validation.
- Validate all three current String readers on a nonempty disposable PCB.
  The current SDK callback is known, but creation still needs an exact native
  source model, queue prerequisites, complete stored-effect model and saved
  canvas readback. Do not enable the legacy decoder-based writer.
- Add broader schematic/PCB, footprint/device/3D, routing/copper/stack/rule,
  ECO/dialog and export adapters under their method-specific coverage reasons.
- Bundle/bootstrap the upstream MCP and admit additional runtime/platform tuples.
- Profile remaining large-history scanning costs. This patch does not skip
  complete byte checks or establish a bounded total time for every live phase.

Publication, installation and connected results are not implied by these source
and synthetic checks. Production designs and records remain outside this work.
