# Compatibility

EasyEDA Pro's public wrappers and private message buses change across builds. A compatibility claim must name the entire tuple used to establish it.

## Evidence baseline

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

This table records evidence. It does not make later builds compatible. On any mismatch, public reads may proceed after a bounded smoke test. Treat every private operation as unavailable until installed-source inspection and a sacrificial or reversible test reconfirm it.

The pinned installed-file hashes are PCB `js/pcb.js` `65401cdc0a8f244db2ff2d8da88fd835b6e1fb3a3ecdbcfd975781502cb04b54`, public API entry `api.js` `5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc`, public API adapter `api-types.js` `4da5b5184a78e2d3aca843dad6b147d7feb7ec1368160d73f49c4acbcf97dfdb`, and declarations `api-types.d.ts` `32a0d2f8b4bc3d7b2b93b33499d9d768b0c23c77f45843a65166cf4e8ad6dab1`.

Facade release `0.3.0` uses operation schema `easyeda-pro-control.operation.v2`.
The reviewed connected baseline requires loader-reported source `loader_status`
and dispatcher build ID `d18b6xd531xe6ca`. The current fixed-receipt bridge
build `ded07x99dcxb504` is an unconnected `validation-required` candidate, not
a production-live build. Status may collect its actual live fingerprint after
import, and narrowly reviewed public generic reads may proceed after a bounded
smoke test against that fingerprint. Exact reads and private operations stay
fail-closed until connected evidence is reviewed and this manifest is
deliberately updated.

`easyeda_control_status` gates the facade source/bundle hash and relative file set, the reviewed manifest's own path/size/schema/timestamp/SHA-256, upstream launcher and entrypoint, implementation tree, detected dependency lockfile, complete tool count/catalog hash, bridge extension, application version, method registry, dispatcher source/build/count, PCB editor implementation, public API entry, public API adapter, and declarations. Private plans journal that complete stable fingerprint, so replacing only the compatibility manifest invalidates an in-flight operation. They are accepted only when the tuple matches the runtime-loaded plugin-root `reviewed-compatibility.json`. That external manifest is deliberately excluded from the facade composite so it can pin both source-tree and built-bundle modes without a hash cycle; its separately pinned digest closes that cycle operationally.

The manifest is a reviewed drift gate, not an attacker-authenticity boundary: it is unsigned and writable by the same user who owns the plugin. A same-user attacker who can replace both code and manifest is outside this trust model. A later build remains unavailable for private automation until installed evidence, this record, and both manifest modes are deliberately updated.

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

Known pinned adapter behaviors and defects are part of the contract: `sch_Net.getAllNets` and `getAllNetsName` are unconditional empty stubs; `sch_PrimitiveWire.getAll*` converts RPC failures to empty arrays; the Component3 mapper filters `3D Model`, title/transform, Channel ID, Group ID, Reuse Block, supplier, and supplierId from component `OtherProperty`, omits pin `OtherProperty`, and exposes CBB UUIDs while setting both `libraryUuid` fields to undefined; PCB and Component3 association mappers can emit blank placeholder objects, which exact readers canonicalize to `null`; the PCB component mapper emits `undefined` for a legitimate zero-pad list, which exact readers canonicalize to `[]`; `pcb_PrimitivePad` contains both component-owned and standalone pads; `pcb_PrimitivePoured` reuses parent pour IDs for derived fill groups; the PCB region mapper drops raw `NO_VIAS`; the PCB fill mapper hardcodes `fillMode`; arc coordinates/angles and via radii are rounded before exposure; and the transformed PCB component-pin wrapper has scaled at least one drill field by 0.1. Exact readers omit, correlate, label, or narrowly canonicalize those sources instead of turning them into false authority.

Normalize only the forms proven for the installed version. Then query the target collection independently.

## Known private calls in the baseline

These spellings are historical implementation evidence, including their typos. The current facade does not expose them as mutation tools:

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
5. Test candidate mutations only on a disposable asset or through an exact unsaved inverse.
6. Add evidence for the new tuple before labeling the path supported.

Do not copy project UUIDs, component counts, coordinate conventions, fabrication data, or other project facts into this compatibility record.
