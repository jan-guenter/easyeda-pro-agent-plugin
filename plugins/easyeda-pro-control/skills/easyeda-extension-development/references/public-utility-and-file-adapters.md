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
`getCurrentLanguage` uses a different bus path and is not admitted by that review.

Pin the API, UI and both module selectors. Retain the extension instance,
namespace, complete method prototype chain, editor frame/document, UI and host
objects and shared RPC receiver around each await. Read method data descriptors
without invoking accessors. A replacement getter can return the same function
while adding effects, so value equality alone cannot validate an unchanged
method. Preserve the real receiver when calling the captured public method.

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
