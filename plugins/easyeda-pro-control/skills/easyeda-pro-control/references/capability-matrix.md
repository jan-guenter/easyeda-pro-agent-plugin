# Capability matrix

This matrix describes the current facade, not every feature visible in EasyEDA. Recheck the installed tuple before each private call.

| Capability | Label | Controlled path and proof |
|---|---|---|
| Facade, upstream, bridge, and active context | `public-supported` | `easyeda_control_status` and `easyeda_control_context`; sole lease, no implementation drift, exact project path/UUID and document UUID/type/tab |
| Facade-owned exact reads | `private-version-pinned` reader | `easyeda_control_exact_read`; exact context at entry and after each run, generated reviewed source, strict typed payload, two equal samples; active tab must remain unchanged because switch-away/back is undetectable |
| Schematic component state | exact-read supported with adapter limits | Component identity, normal associations, CBB/project and symbol UUIDs, adapter-filtered properties, pose, optional pins and bounds; Component3 removes `3D Model`, title/transform, Channel ID, Group ID, Reuse Block, supplier, and supplierId property keys, while pin `OtherProperty` and CBB library ownership are unavailable |
| Schematic compiled connectivity | exact-read supported with limitation | JLCEDA compiled component/pin/net map, accepted only after exact all-page `part` identity and public pin-number-set correlation; no claim of complete wire geometry because installed net APIs are stubs and wire adapters hide failures |
| PCB component state | exact-read supported | Component identity, binding metadata, pose/layer/lock, optional bounds and transformed pin centers/nets; blank adapter association placeholders are canonicalized to `null` |
| Direct pad and hole state | exact-read supported | `pcb_PrimitivePad` is the single physical-pad authority for component-owned and standalone pads; component summaries correlate parent identity without creating a second pad count, and the pinned mapper's `undefined` zero-pad sentinel is canonicalized to `[]`; transformed component-pin wrappers are never drill/land authority |
| PCB primitive inventory | exact-read supported with adapter limits | Every ID returned by each pinned public family enumerator plus supported state for pads, vias, lines, arcs, polylines, regions, pours, derived poured fill pieces, and fills; poured parent IDs are correlated rather than double-counted; region rule types and fill modes are omitted because the adapter drops or hardcodes them; arc coordinates/angles and via radii are adapter-normalized to one decimal and are not raw persisted precision |
| PCB rules and group identities | exact-read supported | Rule config, net/net-to-net/region rules, net classes, differential pairs, equal-length groups, pad-pair groups and lengths, net names; fallback config name is not persistence proof |
| Generic upstream reads | advisory | `easyeda_control_read` or `_read_batch`; target arguments and before/after context are checked, but an asynchronous call is not bound to one tab throughout |
| Captures | visual evidence | `easyeda_control_capture`; exact starting context, non-interlaced PNG chunk/CRC/zlib/scanline validation, hashes; inferred-A4 is diagnostic only |
| One existing PCB component pose/layer/lock | runtime-disabled experimental writer | The narrow state machine and test fixtures exist, but production supplies no private-writer validation flag, so planning refuses before checkpointing, lifecycle calls, or mutation. A connected sacrificial-board save/reopen, invariant, and rollback validation is required before this can become `private-version-pinned`. |
| Multiple PCB components | `unsupported` | The disabled candidate writer rejects multi-target plans to avoid unrecoverable partial state. |
| Schematic mutation | `unsupported` by guarded plans | Public modify may clear hidden properties omitted by its mapper; add a complete lossless reader/writer plus sacrificial persistence proof first |
| PCB binding or footprint replacement | `unsupported` by guarded plans | Use a valid project device and a separately reviewed ECO; pose modify does not replace or rebuild a footprint |
| Primitive create/delete, pads, tracks, vias, regions, pours, or fills | `unsupported` by guarded plans | Generated IDs and complete inverse/collateral proof are not yet modeled |
| Net-class, numeric-rule, pair-profile, or stack write | `unsupported` by guarded plans | Exact read exists, but no constrained writer is admitted; stack entry remains a visible Layer Manager gate |
| Library symbol, footprint, device, or 3D-model mutation | `unsupported` by facade; historical private recipes only | Add an asset-specific facade workflow with exact library identity, saved/reopened geometry, duplicate audit, and current installed-source review before use |
| Schematic-to-PCB ECO | `visible-ui-gate` | Native import dialog; inspect every row and option, apply one scoped selection, audit global identities and counts |
| Itemized ERC/DRC disposition | `visible-ui-gate` | Native run and saved itemized report; aggregate counts are insufficient |
| PCB DSN route-context export | `private-version-pinned`, active-context/best-effort | `easyeda_control_export`; pinned API/adapter tuple, pre/post exact context, fresh private path, exclusive durable write, hash receipt, and hash-bound failure artifact when a post-write check fails. `getDsnFile` has no document argument, so switch-away/back cannot be excluded |
| Gerber, netlist, PDF, pick-and-place, or BOM file export | `unsupported` by guarded exporter | Installed wrapper arguments or output semantics are unproven; add facade-owned serialization and live tests first |
| DSN/SES import | `visible-ui-gate` | External-router import plus exact net/layer/via/rule/global-copper audit |
| Manufacturing submission or purchase | `unsupported` | Artifact generation never grants fabrication or purchasing authority |
| Standalone unrestricted JavaScript | structurally `unsupported` | The facade tool always refuses and has no environment opt-in; arbitrary collateral effects and orphan recovery cannot be bounded. |
| Save/reopen guarded PCB edit | runtime-disabled experimental lifecycle | Unit-tested around the disabled candidate writer; not callable in production until the connected writer validation gate is deliberately enabled. |
| Checkpoint and managed evidence | `public-supported` | SQLite online backup, `quick_check`, canonical logical dump, self-hashed receipts, exclusive durable files, bounded symlink-safe reads |
| Database restore | `unsupported` by facade | Separate explicit authorization, EasyEDA closed, exact backup validation, extra current backup, reopen audit |

## Adding a capability

Do not route an unsupported action through raw JavaScript merely because the API can be called. Add it only after the facade has a narrow typed request, facade-generated code or a reviewed typed upstream call, exact target readback, collateral invariants, a complete inverse or transactional create-ID model, lifecycle tests, and a connected sacrificial save/reopen test for the pinned tuple.
