# Footprint owned-lifecycle prerequisites, 2026-10-26

This batch continues [footprint replay and startup compatibility](2026-10-26-footprint-replay-and-startup-compatibility.md)
from main `0c963c287774853e625a7f5ee32a3a49e32a2ed2`, installed as
`0.3.0+codex.20261026164500`. It adds preparation, saved-read and native-result
components for a future owned footprint copy. These components are unmounted;
this record does not claim an enabled copy writer or a completed saved lifecycle.

The selected combined release is `0.3.0+codex.20261026180000`. Its complete
release checks, CI and installation results will be recorded separately after
the payload is frozen. Production designs remain outside the validation scope.

## Restart admission

The actual host-owned164500 facade, its mapped Node24.18.0 executable and sole
upstream child were independently admitted. All2,062 installed files,42
directories and43,987,378 bytes matched committed contents and modes. The755
source-file projection was `c55ba40803c4ab9e8bf19ac6da61eed0f76f9bbb39f6b9109bee5088474df712`;
the three runtime files projected to
`a1be8f53a11154fc17c1d6963fb65e44b0c2927e530878b4ddda79b3b2d0a2dd`.
The status scan found no unfinished operation. No bridge connection or generic
writer admission was claimed. Independent restart review SHA-256:
`f324b09d244760ca156ee908459f9eacd22caeda5f6d7748e05fa14f18cf0b2f`.

## Disposable observations and startup work

The first case passed the assignment and footprint-state stages. Its footprint
source attempt stopped with `CAPTURE`; the failing raw reply was discarded by
that payload. Separate diagnosis identified exhaustion of the shared8,192-poll budget
and produced a correction, but the missing reply prevents attributing this
specific refusal to that limit. No successful footprint-source packet or copy
preparation was established by the case.

The original owner completed normal close, observed termination and released
its helper. The disposable project's 598,016 bytes remained exact. Its earlier
complete 35-table SQL audit was reused through the identical raw-file evidence,
not described as a new full SQL run. Independent terminal review SHA-256:
`d2faa1b6bdc44ca407e6431f78694eebf9a65e8e49d05476f137754b85d19f9c`.

A separate ratline case stopped during project capture, before ratline
continuation. Six bootstrap stages completed normally. Project source transfer
crossed its two-second deadline at 2,133ms; the project's source resumed only
during cleanup. This is a project-source failure, not an
observed ratline-worker result.

The second owner completed normal close, observed termination and released its
helper. Both cases retained all original journal records with no pending
publication settlement. Both closed files matched their respective baselines:
598,016 bytes, SHA-256
`e620d21af8ca0378b7a3960a10acdaadf894f216e93a034f698fd7e4795fb741`.
Second terminal independent review SHA-256:
`4315709e397e05e1dc77f51a5565c2f96483b95587f91855a87ced1f554180ba`.
No retry, explicit Save, design write, restore or force termination occurred.

## Polling, source transfer and failure diagnostics

The default startup channel formerly charged idle checks against the same
8,192-poll budget as active work. It now counts data, waiting and empty idle polls separately, backs idle
polling off to250ms and wakes it immediately for a new request. Byte, event,
frame and request limits remain cumulative. A non-resettable monotonic hour
starts at channel construction, separately from native launch timing. Fatal
channel expiry still permits original native normal-close, termination and
release. The first failure code is retained instead of becoming generic `POLL`.

The209 source-transfer allowance now derives from the pinned script byte count,
worst-case JSON framing,64KiB chunks and the existing20ms active poll cadence.
The project source gets at most6,540ms, capped by its original pause's remaining
time. Small commands and owner proofs keep their two-second limits. Stage,
opening and launch clocks remain unchanged; no caller can choose or reset them.
Retained failure diagnostics distinguish timeout from source refusal and include
the selected transfer limit. The original late reply remains consumed.

The footprint source reader now captures the first rejected raw reply before
strict parsing. It retains complete bounded inert data or an explicit
malformed/oversized result. This diagnostic grants no source or writer authority
and cannot retroactively explain the first case's discarded reply. These fixes
require fresh installed-runtime validation; neither consumed case was replayed.

## Original-owner preparation and bounded data

The new [preparation component](../../plugins/easyeda-pro-control/server/src/current-footprint-copy-preparation-runtime.ts)
retains the original209 opening, assignment/state/source packets, source plan
and completed checkpoint reader. It calls the captured private-field opening
method before serializing the source and again across awaited preparation.
Copied objects and caller-provided replacement methods cannot establish
ownership. A failed owner check consumes the source preparation; later owner
recovery cannot revive it. The token retains the original opening without
transferring its launch purpose or native leases.

The [native argument projection](../../plugins/easyeda-pro-control/server/src/current-footprint-copy-v2-native-arguments.ts)
separates `createArgument` from `expectedProjectUuid`. The pinned `Tg.create`
takes exactly one argument. The project UUID binds its receiver and is not a
second native parameter. Source selection, destination metadata and the
native-generated destination UUID remain separate.

The [capacity model](../../plugins/easyeda-pro-control/server/src/current-footprint-copy-v2-capacity.ts)
binds the original copy plan, SQL plan and checkpoint. It bounds both native
argument encodings, the two supported saved-content forms, nested CDP framing
and one successful saved-packet artifact. It records the maintained source and
saved observation request counts and cleanup allowance. These are modeled
components, not a reserved whole launch. The writer command, complete native
return, retained raw replies, partial-failure evidence and durable journal
publication still need their own combined reservation. The 18-byte destination
UUID bound does not cover native metadata.

## Saved-specific reader

The new [saved reader](../../plugins/easyeda-pro-control/server/src/current-footprint-copy-v2-saved-read-runner.ts)
requires an original saved projection from a successful complete SQL comparison.
It derives the destination from that retained relationship, brackets two actual
cache-content reads with current-state checks, and compares the complete pair
against the exact saved projection. Original transport callbacks and their
descriptors are retained and checked across awaits. Failures retain arriving
diagnostics and consume the reader. Losing ownership after a completed packet
also invalidates later packet use, even if the transport subsequently recovers.

A separate [fixed cache program](../../plugins/easyeda-pro-control/server/src/current-footprint-copy-v2-saved-cache-read.ts)
supports the two source-derived actor serializations: the exact backend actor
triple, or the destination UUID alone. It does not loosen the generic source
reader or invoke the vendor parser/getter. The destination-only actor must match
the selected footprint before cache access. The complete SQL-bound projection
rejects a foreign backend actor. Numeric record IDs, raw body whitespace,
tombstones and equal-clock headers remain significant.

A matching candidate describes the returned serialization. It does not establish
which cache branch ran, native producer completion, original-generation closure,
persistent upload replay exclusion or a successfully reopened project. An
enclosing original owner must still supply those proofs and select this reader.

## Complete native-result relation

Pinned worker `0e7a4743` returns `{success:true,result:this.get(i)}` from
`Tg.create`. Its result is a 16-field metadata object, not a destination UUID.
The getter can return null. A failure response can follow allocation or other
effects, so failure does not prove no mutation or grant a retry.

The new [native-result decoder](../../plugins/easyeda-pro-control/server/src/current-footprint-copy-v2-native-result.ts)
accepts only a primitive string matching the proposed fixed native wrapper's
complete `JSON.stringify` envelope. That wrapper is not implemented by this
component. The decoder rejects duplicate keys, alternate encodings, incomplete
or extra fields, invalid Unicode, unsupported values and excessive bytes,
depth or node count without reflecting on caller objects. It retains every
captured field and the exact serialized reply.

The relation requires the original copy plan, a fresh destination absent from
the complete original history, matching project/owner UUIDs, exact destination
metadata and the expected metadata ticket. It preserves unknown bounded owner
data while explicitly leaving owner-detail verification false. The separately
required own-undefined native user path explains the serialized empty creator
and modifier objects. Source-derived minimum/maximum clock and version relations
cover increasing, equal and decreasing input clocks. Actual clock-window and
actor provenance remain unproved by supplied data.

The title must match a permitted native fold of the plan's ASCII title. Default
and Turkish/Azeri spellings are candidate matches; neither establishes the
actual locale. Decoded results retain their original plan by private identity.
They grant no dispatch, producer-completion or persistence authority.

## Focused verification

Four preparation groups, four saved-reader groups and three native-result groups
passed with Node24.18.0. Strict project types and the affected type-aware lint
checks passed. Independent review accepted all three components with the
unmounted limits above. Saved-reader tests execute the maintained fixed cache
program in synthetic VM/cache graphs backed by complete encrypted SQL fixtures.
Native-result tests execute exact pinned `get`, `setEditData` and `Ne` bodies
against synthetic state. These are offline results.

Earlier fixture and lint failures remain retained. The saved-cache fixture first
had a missing object brace; native-result fixtures initially lacked actor names
and reused the real owner UUID in a negative case. Those fixtures were corrected.
Type-narrowing and strict lint findings were fixed without broad rule exceptions.
Independent review also found and fixed the saved reader's completed-packet
owner-loss recovery gap. Final focused tests exercise the rejection.

Polling regressions cover more than8,192 idle checks, cumulative waiting/data
limits, immediate wakeup and native cleanup after channel expiry. Source-transfer
regressions cover a reply arriving after two seconds, the fixed deadline and
rejection of a late reply without replay. Strict types and affected type-aware
lint passed. These are synthetic regression results; the new installed behavior
still needs fresh connected validation.

The full local release checks, reproducible bundles, final compatibility
projections, exact-commit CI and installed-file proof remain pending. Complete
facade and bridge suites should run in the final GitHub workflow without a
duplicate full local campaign. No version bump, build or installation result is
implied by these focused checks.

## Remaining implementation and broader backlog

1. Bind a copy-specific launch and lifecycle publication to the original209
   opening, source and preparation. No successful preparation token from a real
   lifecycle-owned opening is claimed here.
2. Qualify the native create producer, destinations and actor/clock sources.
   Its internal `getProLibSource` crosses the UI bus into `FOOTPRINT.GET_STR`;
   lazy parsing, cache changes and scheduled cleanup still need accounted effects.
3. Reserve the whole writer, native reply, failure evidence, journal and cleanup
   sequence, then implement one consumed native create and connect the complete
   result decoder. A scalar UUID reservation is insufficient.
4. Retain original process/Job termination and the exact complete closed SQL
   effect. Bind a fresh verifier generation, exclude persistent upload replay,
   perform the saved-specific reads, and compare the final closed SQL inventory.
5. Prove the complete disposable lifecycle and any offered inverse before
   exposing a writer. Footprint deletion separately needs dependency/cascade and
   inverse models. Direct getter/parser replay, missing-cache fallback and the
   missing public SDK source handler remain unsupported by the cache reader.
6. Continue PCB Worker/CDP identity, callback/copper completion, full baselines
   and saved/reopened verification. Schematic connectivity, other library
   writers and manufacturing exports remain broader backlog; this batch does
   not establish their execution support.

The [coverage inventory](../../plugins/easyeda-pro-control/skills/easyeda-pro-control/references/capability-matrix.md)
and registered operation schemas remain the execution contracts. API discovery
and these implementation prerequisites do not enable additional methods.
