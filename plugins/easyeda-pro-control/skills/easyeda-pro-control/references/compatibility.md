# Compatibility

EasyEDA Pro's public wrappers and private message buses change across builds. A compatibility claim must name the entire tuple used to establish it.

## Historical evidence baseline

The first compatibility corpus for this skill came from this exact tuple:

| Component | Observed version |
|---|---|
| EasyEDA Pro application | `3.2.149.88089769` |
| PCB editor bundle | `3.2.149.5378b690` |
| Public API bundle | `0.2.53.aee2f57a` |
| Upstream MCP server | `1.0.0-rc.1` |
| Authenticated bridge extension manifest | `0.3.0` |
| Bridge runtime protocol reported version | `1.0.0-rc.1` |
| Node.js | `24.18.0` |
| Descriptor sanitizer | schema and SHA-256 from `server/src/descriptor-sanitizer-identity.ts` |
| Sandbox kernel boundary | Linux x86_64, Linux 5.9 or newer, working `close_range(2)`, `execveat(2)`, and readable `security.capability` xattr |

This table records evidence. It does not make later builds compatible. On any mismatch, public reads may proceed only through the bounded validation workflow. Treat every private operation as unavailable until installed-source inspection and disposable-fixture validation reconfirm it. An inverse is not permission to validate a writer on a user design.

The pinned installed-file hashes are PCB `js/pcb.js` `65401cdc0a8f244db2ff2d8da88fd835b6e1fb3a3ecdbcfd975781502cb04b54`, public API entry `api.js` `5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc`, public API adapter `api-types.js` `4da5b5184a78e2d3aca843dad6b147d7feb7ec1368160d73f49c4acbcf97dfdb`, and declarations `api-types.d.ts` `32a0d2f8b4bc3d7b2b93b33499d9d768b0c23c77f45843a65166cf4e8ad6dab1`.

## Current read admission, 2026-09-11

Facade release `0.3.0` uses operation schema `easyeda-pro-control.operation.v2`.
Dispatcher `ded07x99dcxb504` with source `loader_status` and 67 methods is
connected-read-admitted, superseding historical dispatcher `d18b6xd531xe6ca`.
The observed application is `3.2.149.88089769` and bridge protocol is `1.0.0`.
Upstream server and health extension identity remain `1.0.0-rc.1`. The installed
bundle hashes above are unchanged. Authentication, exact context and PCB and
schematic public reads passed against an independently decoded saved disposable
project. Installed-source review supports the existing exact-reader paths;
each live exact-reader result must still meet its own double-sample contract.
Exact reads require the complete runtime and installed-file fingerprint.
The legacy writer remains runtime-disabled. The source package's separate typed
executor uses operation-specific source/durable and retained execution-authority
proof. Its reported live coverage is in capability-matrix.md. Native UI proof is
separate. Future mismatches fail closed.

Live schematic-component and in-memory topology checks passed, with four
expected topology endpoints and two equal samples. The revised PCB component and
inventory readers passed with two components, four direct pads, one outline,
four exact global-ID pad-parent correlations and the expected net endpoints.
Both samples matched and the evidence receipt verified. The lossless rule
recheck passed with equal samples and no placeholders. Earlier placeholder-bearing PCB-rule output is not
complete evidence; empty fixture collections do not establish populated coverage.

Health's `easyeda_version` comes from the authenticated handshake, using native
`sys_Environment.getEditorCurrentVersion()` with its receiver preserved. The
separate `system.getStatus()` does not report an application version, so
`bridgeEasyedaVersion` is explicitly null in the reviewed manifest. Absence is
not replaced with health data; a present bridge version must be a nonempty
string equal to health, and private comparison pins its exact presence or
absence. Missing health version remains an error.

The public project getter omits a file path. Context resolves only the exact
observed project ID in the native `GET https://client/api/client/projectPaths`
registry, verifies SHA-256 of the original Windows path against that ID, and
rechecks active project/document identity afterward. Schematic context compares
the active document with `getCurrentSchematicPageInfo()`, then proves its parent
against `getCurrentSchematicInfo()`. It does not equate a container with a page.

`easyeda_control_status` gates the facade source/bundle hash and relative file set, the reviewed manifest's own path/size/schema/timestamp/SHA-256, upstream launcher and entrypoint, descriptor-sanitizer schema/hash, Bubblewrap executable, implementation tree, detected dependency lockfile, complete tool count/catalog hash, bridge extension, application version, method registry, dispatcher source/build/count, PCB editor implementation, public API entry, public API adapter, and declarations. The upstream cannot report readiness unless its sanitized launch succeeds; the offline doctor separately runs the sanitizer directly against the reviewed Bubblewrap descriptor. Private plans journal that complete stable fingerprint, so replacing only the compatibility manifest invalidates an in-flight operation. They are accepted only when the tuple matches the runtime-loaded plugin-root `reviewed-compatibility.json`. That external manifest is deliberately excluded from the facade composite so it can pin both source-tree and built-bundle modes without a hash cycle; its separately pinned digest closes that cycle operationally.

The manifest is a reviewed drift gate, not an attacker-authenticity boundary: it is unsigned and writable by the same user who owns the plugin. A same-user attacker who can replace both code and manifest is outside this trust model. A later build remains unavailable for private automation until installed evidence, this record, and both manifest modes are deliberately updated.

The sanitizer identity is part of that drift gate. The facade supplies its exact
reviewed Bubblewrap file descriptor as `10`; the sanitizer checks exact mode and
absence of `security.capability`, closes descriptors `11` and above, and enters
that descriptor with `execveat(2)`. Do not infer sanitizer compatibility from a
successful pathname execution or from the Bubblewrap version string. A kernel,
filesystem, binary, schema, hash, mode, xattr, or descriptor-contract mismatch
fails closed and requires a deliberate compatibility review.

## Capability labels

- `public-supported` means the installed declarations expose the method, the current version passes a smoke test, and independent readback can prove its effect.
- `private-version-pinned` means the operation depends on an iframe, message bus, document manager, native action runner, misspelled handler name, or implementation object. Require the exact version tuple and a narrow verifier.
- `visible-ui-gate` means a native or operating-system dialog needs visible review or input. UI automation may assist with locating controls, but it does not remove the review gate unless the exact build and every selected row can be proved.
- `unsupported` means no controlled path can meet the required verification. Do not improvise a write.

Read [capability-matrix.md](capability-matrix.md) before selecting an operation path.

## Inspect the installed build

Check the installed `api-types.d.ts` before inventing an API signature. If the declaration is incomplete or a wrapper behaves differently, inspect the matching installed implementation bundle. Record the file hash or application version with the operation artifact.

Common adapter differences include:

- runtime namespaces such as `eda.pcb_PrimitivePad` where declarations use an uppercase class;
- UUID strings, objects, `undefined`, or no-op results from wrappers that describe similar operations;
- state exposed through `getState_Name`, lowercase fields, or uppercase fields;
- acronym variants such as `UniqueId` and `UniqueID`, `Bom` and `BOM`, or `pinType` and `PinType`;
- native responses wrapped in `{ message: value }`.

Known pinned adapter behaviors and defects are part of the contract: `sch_Net.getAllNets` and `getAllNetsName` are unconditional empty stubs; `sch_PrimitiveWire.getAll*` converts RPC failures to empty arrays; the Component3 mapper filters `3D Model`, title/transform, Channel ID, Group ID, Reuse Block, supplier, and supplierId from component `OtherProperty`, omits pin `OtherProperty`, and exposes CBB UUIDs while setting both `libraryUuid` fields to undefined; PCB and Component3 association mappers can emit blank placeholder objects, which exact readers canonicalize to `null`; PCB `getState_Pads` summaries expose footprint-local IDs and can include footprint vias, so exact readers instead correlate global physical-pad IDs through `getAllPinsByPrimitiveId`; `pcb_PrimitivePad` contains both component-owned and standalone pads; `pcb_PrimitivePoured` reuses parent pour IDs for derived fill groups; the PCB region mapper drops raw `NO_VIAS`; the PCB fill mapper hardcodes `fillMode`; arc coordinates/angles and via radii are rounded before exposure; and the transformed PCB component-pin wrapper has scaled at least one drill field by 0.1. Exact readers omit, correlate, label, or narrowly canonicalize those sources instead of turning them into false authority.

Schematic topology now uses the documented in-memory `SCH_ManufactureData.getNetlistFile(fileName, netlistType)` route with an explicit neutral name and `JLCEDA`. It shares the compiler with the deprecated getter but omits that getter's per-footprint `Footprint Name` lookups. File metadata/content and existing compiled UID/pin correlation remain strict. No file is saved and no fallback getter is called. This alternative passed the connected disposable-fixture check described above.

Normalize only the forms proven for the installed version. Then query the target collection independently.

The companion's object normalizer replaces nested objects beyond depth five with
`[MaxDepth]`, while preserving strings intact. Exact readers therefore return a
shallow versioned JSON envelope, checked against its UTF-8 byte count and a
4 MiB serialized-envelope bound before the facade decodes it. Existing field
validation and the two-sample comparison operate on the complete decoded data.
Missing envelopes, malformed JSON and normalization placeholders fail closed.
Generic reads retain their advisory normalization behavior. A stable result
containing placeholders is incomplete evidence, not an exact rule snapshot.

## Known private calls in the baseline

These spellings are implementation evidence, including their typos. They are not caller-invokable methods; only a specific maintained typed adapter may use a reviewed handler:

| Purpose | Private call |
|---|---|
| Read differential-pair manager | `rpcCall("getDifferentailPairList", ...)` |
| Apply differential-pair manager | `rpcCall("handleDifferentailManagerData", ...)` |
| Read physical stack | `rpcCall("PhysicalStackingConfig", ...)` |
| Rebuild a placed footprint | `publish("buttomCommand", { action: "recoverFootprint", ... })` |
| Read native schematic symbol inventory | `rpcCall("getAllSymbolMultipartBySchUuid", ...)` |
| Replace a schematic device | `rpcCall("sch/replaceDevice", ...)` |

Before a private publish call, inspect the installed implementation and prove that exactly one intended handler subscribes to it. Never infer success from a publish return value.

## Maintaining compatibility

When a version changes:

1. Record the new tuple.
2. Run status and context reads.
3. Smoke-test public getters against a known document.
4. Compare installed declarations and relevant implementation handlers.
5. Test candidate mutations only on a disposable fixture, never a real user design. An available inverse does not make production writer validation safe.
6. Add evidence for the new tuple before labeling the path supported.

Do not copy project UUIDs, component counts, coordinate conventions, fabrication data, or other project facts into this compatibility record.
