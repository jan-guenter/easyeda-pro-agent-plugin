# SDK and adapter engineering

## Version and interface discovery

Identify EasyEDA Pro versus Standard first. Pro exposes instantiated namespaces
on each extension's own `eda` object. Look up the mounted instance name, not only
its uppercase declaration class. An installed union mount can expose distinct
component classes; preserve those alternatives and overloads in the research.
Do not merge every method/return field into one guessed object. [Pro invocation](https://prodocs.easyeda.com/en/api/guide/invoke-apis.html).

Record application version, public declaration version/hash and implementation
bundle/hash independently. The npm package with the same numeric version can
differ from an installed suffixed build. Official patch releases can correct
types independently of application changes. [Version policy](https://prodocs.easyeda.com/en/api/guide/stability.html).

Use the offline catalog to narrow the search, then inspect parameter types,
enum values, native units, nullable/default behavior and returned promise. Latest
`sys_Help` can provide method/type details, but the reviewed 0.2.53 installation
has no such mount. New `sys_ExternalApi` registrations are another trust boundary,
not permission to run another extension's code. [Help reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_help.help.html),
[external API reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_externalapi.html).

## Package and runtime

`extension.json` binds UUID, entrypoint, activation events, editor compatibility,
menus and dependencies. An SDK-built `.eext` is an import artifact; neither its
manifest nor import acknowledgment proves runtime activation or authentication.
External interaction is an explicit permission concern. Keep bridge keys and
generated private archives outside the repository; do not use broad CORS,
adjacent-port fallback or raw-secret transport from a demo. [Manifest reference](https://prodocs.easyeda.com/en/api/guide/extension-json.html),
[official external integration example](https://github.com/easyeda/eext-external-tool-integration-demo).

Pro's extension environment is not unrestricted Node or DOM. Use supplied
system/file/network APIs, package resources and documented inline-frame support.
Review these calls for data disclosure and lifecycle effects. A standalone
script has a throw-away extension context and lacks some packaged capabilities;
it is not a substitute for this plugin's authenticated executor. [Initialization guide](https://prodocs.easyeda.com/en/api/guide/how-to-start-for-ai.html),
[inline-frame guide](https://prodocs.easyeda.com/en/api/guide/inline-frame.html).

Keep method receivers when wrappers depend on `this`; test callback positions,
protocol arguments and timer cancellation. Await the actual queued native action,
not just a wrapper that returns before its `done()` callback. Isolate errors at
the protocol boundary without swallowing native failures or printing private
source/credentials. Main-thread computations must yield cooperatively while
retaining exact context/source checks; never relax the checks for speed.

An awaited current-document getter and a later current-document setter can
select different PCB frames. Capture the exact ordinary iframe and its native
receiver first; after each await, synchronously recheck the sealed project,
branch, tab, frame and writable state before using that captured receiver.
Pin both the UI frame registry and native PCB implementation. Check stack
changes before their first physical-layer mutation, not only inside a later
source merge. Receiver binding is not an atomic source compare-and-swap;
independent post-effect and durable proofs remain necessary.

Large journal directories can defeat a cache that evicts the oldest entry for
every new scan result. Test more entries than the cache cap. Preserve useful
resident entries when declining a new admission, but still rehash current journal
and artifact bytes on every use. File size, timestamps and an open descriptor do
not prove that file contents stayed unchanged. Synthetic cache improvements
must not be reported as measured connected latency improvements.

## Narrow execution contract

Use literal action discriminators, bounded strings/arrays/numbers, strict nested
objects and explicit units. Preserve native empty-string versus null semantics.
Validate compound refinements with the exact parser; JSON Schema alone omits
some constraints. Bound responses and transfer complete large evidence through
managed artifacts with hashes, receipts and pagination.

For reads, require double-sampled complete results and reject truncation,
placeholder/depth-limit markers and session changes. For edits, enumerate exact
records and electrical consequences before dispatch. A returned ID is not proof;
compare native source, connected endpoints and the complete durable selected
branch. Creation IDs belong to the original journal. Existing descendants,
library templates and inherited instances need explicit scope.

Public API stubs or lossy mappers can justify a reviewed, version-pinned native
adapter—not arbitrary private invocation. Preserve unknown fields, parent/child
order, hidden attributes and locks. Geometric contact is not native connectivity.
Define unsupported shapes up front. If a general inverse cannot preserve exact
identity, say it is unavailable; do not advertise automatic rollback.

Review full-load and incremental decode separately. The pinned PCB text decoder
is instantiated per record during source merge but reused by record type during
reopen. Its clear method leaves specialColor intact, and a null input does not
assign that field. A null STRING following a black STRING therefore reloads as
black despite correct stored null. A single-record constructor test misses this
bug. Test mixed ordered records through both lifecycles, preserve the raw order,
and never turn one observed conversion into global null/color equivalence.

Test stored and exported representations independently. Native page exports omit
the stored META record and can include an unstored origin CANVAS or initialized
drawing-frame order. A synthetic fixture that copies saved records verbatim into
source can hide a universal admission failure. Preserve raw evidence and prove
each allowed encoding difference; a comparison projection is not a saved
checkpoint. Apply the same boundary through preflight, rollback and reconciliation.

Keep native membership separate from SDK getter projection. A schematic page's
root-family set excludes inherited drawing-frame descendants that remain in its
full ID index. A symbol editor instead owns Pins beneath its PART. Prove the
reciprocal tree, family set, index and source membership for the actual scene;
do not reuse a page-root fixture for symbol enumeration. Inspect getters for
side effects: the pinned symbol `parts` getter sorts its backing array.

Do not compose a public enumeration that turns exceptions into `[]` with a
getter that drops custom attributes and call the result complete. A native
equivalent may prove bounded membership and each retained field, while refusing
unrepresentable attributes. Label it as that narrower equivalent. Preserve
signed zero during in-memory scalar reproof, and distinguish SDK coordinate/
rotation conventions from stored records even when field names match.

Separate live mutation, queued uploads and durable state in coordinator tests.
EasyEDA may persist a forward effect or inverse later without an agent Save.
An upload barrier is not a flush command. Test inverse intent consumption,
auto-persistence between preflight and dispatch, live-only restoration, and
read-only reconciliation after delayed persistence. Retain the fresh checkpoint,
raw observer and complete proof, not only a success flag or their summary hashes.

Test adapters against the maintained producer, not only a hand-written fixture.
PCB component inventory is identity-only; it has no per-component state map.
Inherited footprint drawing lines can appear in inventory without standalone
LINE source records. An ID prefix does not prove parent ownership. A disabled
PANELIZE record is safe to admit only when its full canonical shape is checked
and the pinned native path returns before generating panel geometry.

Preserve public layer color strings as bounded raw data. The pinned fractional
RGB formatter can emit malformed strings on disabled custom layers. Do not
silently repair them or label them valid CSS. Active-layer selection needs both
the canonical source identity and matching public layer state, not just an ID.

Check deprecated getters for silent failure. On the pinned tuple, the old
schematic selected-ID getter turns a missing obsolete iframe-command response
into an empty list. Its declared replacement uses the modern selection manager
and promotes selected wire segments to parent groups. An explicit replacement
adapter must identify that route, retain the returned group semantics and refuse
missing results. Never call a swallowed error proof of an empty selection.
