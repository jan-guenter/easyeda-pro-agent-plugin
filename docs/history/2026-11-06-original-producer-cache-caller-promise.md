# Original producer cache caller and Promise custody

The original same-worker producer collector now distinguishes the six pinned
direct `bb.put` caller frames: flow parsing, local upload, detached local Save,
sync head index, local opening head index and cloud opening head index. The
complete original worker and each literal caller function remain source-pinned.
The immediate caller must have the exact original script, function location,
call location and retained frame ID. Unknown or aliased caller paths stay held;
this lexical roster does not claim alias completeness.

An inert Inspector regression initially refused the AST call-start coordinate.
V8 actually reports the suspended caller at the `put` property: the flow case
is column6379, rather than call-expression column6368. The implementation now
uses exact property positions derived from the pinned AST. All six positions
are independently verified as actual V8 call points, and the original flow
callback produces the exact expected caller frame when its pinned code runs
on inert objects. No source range was widened.

Before retaining a head-entry marker, the fixed original caller program joins
its actual project, cache wrapper, selected namespace, native Cache candidate,
Response candidate, original qualified intrinsic tuple, request key and source
body/history-index reference. The generic observation receiver can now inspect
both original `project.cache` and `project.localCache`; the new caller join
keeps their namespace and source roles separate. It invokes no Cache method,
Response getter, serializer, callback or timer. Object identity is compared
inside that original realm, rather than by assuming independently serialized
Inspector object IDs are stable.

A second actual Inspector experiment found that raw
`callFrame.returnValue.objectId` handles expire after resume. The original
async `bb.put` return pause exposes its genuine Promise, so the collector now
captures that same object into its own retained object group while still
paused, using only the fixed return-this program. An inert Inspector
regression proves identity against the original async invocation after resume
and reads its actual pending state. The central owner binds the return handle,
consumes the capture and metadata attempts before dispatch, retains the
original persistent handle/state, and refuses copied markers. Pending remains
pending evidence. No Promise resolver, `then`, await, retry or continuation is
called by this capture.

The browser worker decoder requires zero own Promise properties and the exact
three V8 internal fields. Node's test runner adds its exact native async-hooks
symbol pair; the Inspector test explicitly checks that pair and projects only
those harness fields away. The worker decoder does not admit that alternate
shape. No Node or legacy version alias grants native ownership.

Production-Core/synthetic-child regressions exercise the actual registry,
fixed Pipe, original event/frame checks and consumed request paths. They cover
valid selected cache capture, foreign caller refusal before projection,
foreign target refusal before marker issuance, original Promise retention and
original Job-only cleanup. The test's construction, source pause and native
replies are explicitly inert seams; they are not connected evidence.

The producer table is now121 fixed cases and223 CDP requests. The ten added
requests are two head-entry observations with three caller/join/property reads
each, plus two return-Promise observations with capture and metadata each.
Renderer reservations become1404 for Via and1002 for schematic, recognizing
only the exact preceding1394/992 unpublished reservation. Via Main remains
1109 normal/41 cleanup/1150 total; schematic readonly Main remains901/8/909.
The earlier intrinsic record's1109/41/1150 figure describes Via Main. Bounded
packed sections preserve the existing64KiB table decoder limit.

Validation:40 focused cases pass, comprising19 production-owner cases,16
collector/codec/boundary cases andfive inert descriptor/Inspector cases. Both
TypeScript projects and zero-warning strict targeted lint pass. Full temporary
helper generation is idempotent and its complete emitted C# compiles/passes
fixed worker, producer-codebook and original-owner refusal smokes under Linux
.NET10. Repository, MCP-contract and packaged-skill validation pass. No live
MCP, Windows process, native app, project edit, native cache method or Save was used.
Root owns final combined helper/pin generation and connected validation.

Original cache-call continuation, native put success and fulfillment of the
same retained Promise must still be joined before any startup or post-Save
cache completion claim. Every producer resume, complete upload frontier,
selected SQL grant, Save and saved/reopened claim remains blocked by its
separate original-owner proof.
