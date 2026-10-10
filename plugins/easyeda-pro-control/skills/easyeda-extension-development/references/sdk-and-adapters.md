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

Test stored and exported representations independently. Native page exports omit
the stored META record and can include an unstored origin CANVAS or initialized
drawing-frame order. A synthetic fixture that copies saved records verbatim into
source can hide a universal admission failure. Preserve raw evidence and prove
each allowed encoding difference; a comparison projection is not a saved
checkpoint. Apply the same boundary through preflight, rollback and reconciliation.
