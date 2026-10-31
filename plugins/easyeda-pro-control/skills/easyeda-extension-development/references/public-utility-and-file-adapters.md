# Public utility and file adapter boundaries

Use this reference when extending UI-backed getters or public methods accepting
Files. Start from the exact installed API and UI implementations, not only the
declaration. The maintained routes are described in the control skill's
[utility contract](../../easyeda-pro-control/references/current-utility-readers.md#language-and-api-page-viewport-readers)
and [netlist-file contract](../../easyeda-pro-control/references/current-netlist-files.md).

## Trace both sides of a UI getter

On API0.3.59/UI3.2.198, `getCurrentTheme`, `getFrontendDataUnit` and
`getSystemLibraryUuid` call the shared extension RPC bus. Their UI handlers read
an existing active-theme field, the global toolbar unit store and a fixed UUID,
respectively. They do not resolve a document. This qualifies only those getter
closures; neighboring library and unit methods can have different effects.
The beta `getSelectedLibraryRowInfo` callback returns a fresh three-field object
from independently retained UI row and library state. The bounded reader accepts
only a reported system-library UUID and known types. That does not prove the
asset belongs to that library, even when both samples match. Preserve the false
ownership and row-provenance flags; do not use this report as lookup authority.
`getCurrentLanguage` uses a separately reviewed legacy bus path. Its public
result is an SDK-resolved language, including a fallback when the provider
returns an unknown or missing value. Keep `fallbackPossible:true`,
`providerSuccessVerified:false` and `cachedMessageBusIdentityVerified:false`;
the result does not prove the raw UI preference or provider success.

Pin the API, UI and both module selectors. Retain the extension instance,
namespace, complete method prototype chain, editor frame/document, UI and host
objects and shared RPC receiver around each await. Read method data descriptors
without invoking accessors. A replacement getter can return the same function
while adding effects, so value equality alone cannot validate an unchanged
method. Preserve the real receiver when calling the captured public method.

The language reader separately retains the legacy bus association between the
editor root and host. Its API-private cached bus cannot be inspected directly;
do not claim that checking the visible association proves the private cache.
The legacy RPC keeps its own 300-second timeout bookkeeping. An earlier
outer deadline or successful reply does not cancel that bookkeeping.

The pinned MessageBus2 `rpcCall` defaults to zero timeout. An outer transport
timeout does not stop its promise or a generated program from making a later
second call. Use a captured monotonic clock with finite, nondecreasing readings
and an expiry check before and after awaits. A cooperative timer alone can fire
late behind synchronous work or microtasks. Clear the timer on terminal paths;
do not call the timer, executor or transport limits cancellation of vendor work.

## File input is not automatically independent of a project

The beta [netlist comparison API](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_tool.netlistcomparison.html)
declares several input forms. The installed string form resolves a document
UUID and can reach PCB workers. Its `.enet` branch can decode against the current
project and resolve footprint/device references. An object overload in the
declaration does not prove that the installed dispatcher implements it.
The managed route therefore accepts only two Files using a recognized Allegro
subset and lowercase `.tel` extensions. Caller format labels must not select an
unreviewed parser.

The installed parser silently drops some malformed rows, duplicate components
and unknown pin references. Recognize the whole supported input before File
construction; reject unsupported content without stripping it. Bounds must apply
to input bytes and decoded components, nets and pins, not just the final reply.
Use exclusive managed publication from supplied text and exact descriptor-bound
reads. Preserve existing artifacts after partial failure and disclose local
persistence.

The installed comparator emits `NET`/`COMPONENT` and `net1`/`net2`, differing
from its declaration's names. It compares footprint/designator and net/pin
memberships but omits device values and properties. Derive the expected complete
membership difference independently, retain raw vendor output and reject any
disagreement. Never convert `false`, `undefined` or partial parsing into an empty
successful comparison.

Test the generated program with its real receiver and strict malformed/late
results. Also invoke the actual runtime callback to test managed-file tampering,
UI selector drift, authentication and result bounds. Registration tests should
exercise the real serialization gate and prove offline preparation does not
start or authenticate the app. Synthetic extracted-parser tests do not validate
browser FileReader, IPC, a connected app or saved state; report those separately.

## Reusable library archive files

The offline [supplied-library workflow](../../easyeda-pro-control/references/current-library-files.md#read-reusable-library-archive-sources)
recognizes bounded `.elibz2` footprint2 and symbol2 archives. Its complete source
index binds the exact archive, manifest, native `.elibu` member, selected metadata
and original bodies. Keep the exporter-inserted copied header and synthesized
META distinct from the original source bytes. A declared docType2 symbol does
not prove its original subtype or enable the existing standalone pin inspector.
Device dependency closure, panel framing and legacy conversion remain separate.

On the pinned UI, the four public library-file exporters can return incomplete
archives after a failed metadata or source read. A genuine awaited File proves
only that the builder returned a File. The ordinary library worker also keys
retained canvases by UUID without the requested library path, so it can package
unsaved source from a previously retained canvas. An empty editor does not prove
that the original worker has no retained canvas. Project/local history routes
can initialize SQL tables or schema, and online routes have no reviewed total
byte or elapsed bound. The offline decoder grants no live-export route.

Before adding one, qualify the original public receiver, MessageBus, library
route and worker/canvas ownership. Journal once before dispatch, reject failure
objects and undefined, verify the original genuine File getters, and validate
complete UUID/docType/source membership before exclusive managed publication.
An outer timeout cannot cancel compression, history fetches or the pending
public call. Do not turn archive hashes into asset ownership, remote freshness,
saved geometry, complete dependencies or importability claims.
