# Original detached cache-maintenance return capture

This source increment follows `ee41d3b` and the
[cold producer roster](2026-11-06-cold-producer-roster.md). It observes the async
function that `uploadCloud` starts and then drops. The original bootstrap now
arms its two fixed breakpoints before `EP` registers project RPC services.
It invokes no application producer or Cache method. No EasyEDA application was
launched, no native application operation or writer/Save was dispatched and the
production project was not opened or edited.

The new
[observer](../../plugins/easyeda-pro-control/server/src/current-footprint-detached-cache-observer.ts)
receives only its original constructor-issued lease. At the actual entry it
retains the original project, upload batch, pending-data map and successful
native response as remote object references. It checks the original `m` caller
and fixed source site. At the actual implicit normal return it rechecks that
entire tuple against every retained entry, requiring exactly one unfinished
match. That return occurs after the original put and every delete await. An
empty `task1` or a stable poll cannot substitute for it. Tuple drift, duplicate
or unknown returns and the eight-entry bound fail closed.

`closeOriginalDetachedCacheProducer(originalConstructionPacket)` closes entry
admission and awaits those original returns. It retains the observer and native
breakpoints; it does not detach the worker. Subsequent entries stop before
their first cache write. A failed entry is unsafe to resume: normal observer
cleanup can remove its original breakpoint IDs but cannot resume that frame or
release its group. The original generation must then exit through its separately
authorized native cleanup. This increment adds no signal or original-Job
termination implementation and does not describe host closure as that proof.
Failures at a known normal-return pause can use its original cleanup resume,
because the awaited cache work has already completed. Unknown allocation,
unknown pause and missing acknowledgments retain custody.

The live result registry requires the exact retained result and its still-held
original constructor/observer. Cleanup makes that live lookup refuse; the
frozen result remains historical data. Complete upload-frontier, separate
head-index cache-put completion and execution authority remain false. This is
one producer's observed normal-return boundary, not a complete writer provider.

The [source profile](../../plugins/easyeda-pro-control/server/src/current-footprint-detached-cache-profile.ts)
pins the dropped function at worker UTF-16 `2024218..2024533`, SHA-256
`ad456d32d1566392b497d007ec7241c49ee7944d7dfeb54334cd0366cf14d1e0`,
and its original caller at `2023529..2024637`. Fixed breakpoint columns are
line 110, columns 10024 and 10322. The complete worker identity remains the
maintained `0e7a4743...` source pin. An offline V8 compile, without running the
vendor asset, confirmed its possible entry call site and implicit return site.
The first compile-only probe omitted `Runtime.enable` and refused; the corrected
probe completed. That is not embedded application validation.

The fixed native worker vocabulary grows from 20 to 26 shapes: two sites, a
fixed frame expression, two descriptor comparison programs and a separate
object-group release. Caller source, locations and group names remain absent
from native input. Shared TypeScript types include the new fixed expression and
group, while the legacy native encoder explicitly refuses the expression and
keeps its own grammar unchanged. The dedicated native cleanup lane admits its
original group release without borrowing normal capacity.

The derived additional capacity is 106 normal requests and four cleanup
requests: two allocations plus eight entries, each with its original frame and
admission, return frame, up to eight full-tuple comparisons and two resumes.
Dedicated worker totals are now 864 normal, 42 cleanup and 906 total; main
remains 59 normal and 27 cleanup. The original bootstrap pause gains the two
allocation windows. Helper controls derive from these bounds. Older native
purposes keep their original counters and lifetimes.

Verification used Node `24.18.0`, npm `11.16.0`, Linux x86-64 and core limit zero:

- Full TypeScript and strict type-aware lint passed.
- All 12 focused tests passed. Real synthetic V8 pauses prove delayed put and
  delete awaits precede the original normal return; changed response refuses
  completion; late original allocation remains retained without retry; and a
  closed producer cannot be resumed into its first cache write by cleanup.
  Existing cold roster, native codec and inert factory cases also pass. The
  native marker is an explicit synthetic seam. Initial test loading used the
  wrong module instance for the private lease registry and refused; the test
  loader was corrected to link both maintained modules to the same original
  compiled registry. No production ownership guard was changed for that failure.
- The complete transformed C# helper compiled under .NET SDK `10.0.113` and
  passed its empty native-birth, fixed-codec and writer-refusal smoke without
  Windows calls, an application process or a Job allocation. Output was
  1,129,490 helper bytes and 1,020,239 C# bytes.
- Repository, all-skill and MCP-contract validators, new local history links
  and whitespace checks passed.

No checked-in helper, bundles, compatibility projection or pins were regenerated;
the parent integration owns that single final generation and frozen-payload
verification. No connected effect or complete SQL/reopen proof is claimed.

The remaining path is deliberately narrower than general structure completion.
With the existing destination requirement `jr === false`, the pinned
`canWsPublish` body excludes cooperation publication. A FOOTPRINT change calls
the outer `uploadStructure` Nd, but that callback's explicit doctype allowlist
excludes FOOTPRINT, so QA and the actual structure body can remain unentered.
The next provider must still bind the selected parser callbacks, outer Nd
completion, buffered upload/drain and ticket timer to the sole planned create;
observe the separate dropped head-index cache put; reject retry branches before
further effects; and join a fresh original locked main head to the selected-file
SQL fence and actual request/completion tuple. The originating gates stay false.
