# Original head-cache Promise and zero-retry fences

This source increment follows `1b00a14` and the
[detached maintenance return capture](2026-11-06-detached-cache-return-capture.md).
The same original bootstrap observer now covers `syncCloud`'s separate dropped
head-index cache put and stops both cache-write and history-upload retry
branches. No application was launched, no native application operation or
writer/Save was dispatched, and the production project was not opened or edited.

The original `bb.put` entry must have the selected `syncCloud` caller and the
original project cache namespace. Its tuple retains that wrapper, key and
actual Response object. The original outer return exposes its actual pending
Promise through V8's `returnValue`; the observer retains that same Promise in
its own object group. The inner `n` normal-return breakpoint follows the
original native Cache.put await and joins the full original tuple. Closing the
producer awaits both observations, crosses a final same-worker inspector
barrier, then requires that original Promise's native `[[PromiseState]]` be
fulfilled with an undefined result. No Promise method, `awaitPromise`, cache
method, substitute Promise or stable polling supplies this outcome.

Three head-only breakpoint conditions use primitive string length/index reads
to recognize the index-key suffix. Their fixed conditions are reconstructed
inside the native helper and cannot arrive as caller source. The descriptor
program separately binds the exact branch and original project cache wrapper.
The two-head-put bound permits startup plus one forward append. Unknown,
duplicate, foreign or changed tuples fail closed. Closing entry admission also
stops a later head put before its first cache effect.

The two retry fences stop at the original `bb.put` catch branch and the failed
history-response branch before another timer, reopen or upload attempt. A
refused entry or retry frame cannot be resumed by ordinary observer cleanup;
it requires the original generation's separately authorized native exit. No
termination implementation or permission is inferred by this source component.

The new result is
`private.current-footprint-detached-cache-observation.v2`. The old v1 interface
and its explanatory false field remain unchanged. V2 reports the number of
original head puts and their actual fulfilled Promises; complete upload
frontier and execution authority remain false. Its live lookup still requires
the exact original result and observer and refuses after cleanup.

The fixed source sites are line 106 columns 55920/56424/56166 for head entry,
Promise return and native success return, column 56176 for cache retry, and
line 110 column 9462 for the history failure branch. Complete source identity
and actual allocation locations remain mandatory. The fixed worker codebook
now has 36 shapes. Its derived 139 normal and nine cleanup reservations include
seven allocations, eight maintenance pairs, two head-put triples, complete
tuple comparisons, two barriers and original Promise reads. The dedicated
worker total is 897 normal plus 47 cleanup, 944 total; main remains 59 plus 27.
Older native purposes keep their original grammar, counters and lifetimes.

Verification used exact Node `24.18.0`, npm `11.16.0`, Linux x86-64 and core limit
zero. TypeScript and strict type-aware lint passed. All 15 focused tests passed,
including actual synthetic V8 pending-Promise retention and fulfillment, cache
retry rejection before a second write, history failure rejection before cache
maintenance, late original allocation and no-resume cleanup. The first cache
failure case exposed an unhandled failure-signal rejection when the initial
barrier failed; the signal's rejecting wait is now installed only when its
original race consumer exists. The final failure case passes without relaxing
ownership or retry guards. These tests use an explicit synthetic native marker
and establish no connected ownership or application effect.

The complete transformed helper compiled and passed its empty native-birth,
fixed-codec and writer-refusal smoke under .NET SDK `10.0.113`. Emission is
1,130,578 helper bytes and 1,021,327 C# bytes; no Windows calls, application
process or Job was allocated. Repository, all-skill and MCP-contract validators
also passed. No checked-in helper, bundles, compatibility projection or pins
were regenerated; the parent integration owns final generation and exact-payload
verification.

The next required join is the narrow FOOTPRINT/local/locked-head provider. It
must transfer these same original observer events and fixed command custody
across the original construction-to-clock/allocation handoff, retain selected
parser/outer-Nd/buffered-drain/ticket-timer continuations, and join the new
pre-connection selected-file SQL fence to the existing actual v2 opening,
paired clocks, request/completion, complete SQL and cache-excluded reopen.
Mounting the observers on a v2 dependency without that handoff would strand
their original subscription. The released observation purpose and writer gates
remain unchanged until those proofs and complete budgets exist.
