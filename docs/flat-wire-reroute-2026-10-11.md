# Sealed flat schematic wire rerouting

Reviewed 2026-10-11. This note describes a source/offline-tested native task
equivalent, not connected validation or public wrapper parity. No project was
opened, edited, saved or inspected while developing this profile.

## Documented contract and implementation boundary

The official [`SCH_PrimitiveWire.modify` documentation](https://prodocs.easyeda.com/en/api/reference/pro-api.sch_primitivewire.modify.html)
describes a beta method accepting a primitive ID or instance plus optional
`line`, `net`, `color`, `lineWidth` and `lineType`, returning
`Promise<ISCH_PrimitiveWire | undefined>`. The new profile accepts only an
existing literal WIRE ID and explicit geometry/style fields. It returns the
maintained transaction acknowledgment; it does not return a public primitive
instance or implement arbitrary style/net changes.

The current [`SCH_Net.getAllNets` documentation](https://prodocs.easyeda.com/en/api/reference/pro-api.sch_net.getallnets.html)
describes a net-information array and newer availability. That declaration does
not establish an implementation in the pinned older editor. Its installed
wrapper returns a constant empty array. The old compiled-netlist route is also
unsuitable for a read: it can annotate Designator/Unique ID and Save All.

## Pinned implementation evidence

Offsets below are UTF-16 string offsets, not UTF-8 byte offsets. The reviewed
assets are installation code, not design data.

| Asset | SHA-256 |
| --- | --- |
| `pro-sch/3.2.149.35ae2987/js/sch.js` | `3f50136fb4ba2d5593beac7ef3e20ebe5275177b56bbcfdd297e79f176a6618f` |
| `pro-api/0.2.53.aee2f57a/api.js` | `5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc` |
| `pro-ui/3.2.149.43637efe/js/ui.js` | `12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a` |

- `setLines`, 3928875: existing LINE IDs select existing models; supplied
  properties update those models. Missing/surplus IDs create/delete models.
  Requiring the same exact ID set/count avoids those branches.
- `sortChildrenByCategory`, 3923364: children are ordered as LINEs, junctions,
  dangling dots, custom attributes and NET names. Equal LINE count alone does
  not establish unchanged attribute order.
- `buildNetPointsIndexes`, 4128293: endpoint/pin membership comes from complete
  native models. `wireNetGroup` is assigned as ordinary data on an existing
  point node. `getNetPoint`, 4132054, only searches the existing index.
- `refreshNetPoint`, 4131035, and junction update, 4130220: geometry refresh
  recreates generated markers. Markers have random IDs, `cx/cy`, a reciprocal
  `connectionPointNode`, per-LINE ID indexes and group/global membership.
- Junction class `YA`, 4253661, and UnConnectDot class `WA`, 4315455:
  `notAddHistory=true`, `getConsistencyData()` returns undefined, radii are
  2.5 and 1 respectively. Their connect hooks register global sets; normal
  model connection registers each ID in the document ID manager.
- Group `junctionModels` and `unConnectDotModels` getters, 3925936/3926017,
  lazily create sets. Guards inspect the private own data slots instead of
  invoking these getters. Global sets are eagerly initialized. Per-LINE
  indexes are plain dictionaries of `Set<string>`, not `Map` instances.
- `bJe`, 3962648–3964690, and `vJe`, 3968052–3970393: simple explicit wire names
  and all native pins underpin the existing bounded flat connectivity proof.
  A net-name comparison alone could miss physical disconnection.
- `getSchPinNet`, 4443957–4444190, reads cached compiled data. It is only a
  separately compared observation, not the new topology authority. `w3`,
  6393864, can annotate and `saveAllFiles`; this profile never invokes it.

## Admitted operation

`easyeda-pro-control.flat-wire-reroute.v1` is stored only in the facade-created
`plan.flatWire`. It is mutually exclusive with `plan.flatDisplay`. Public
schemas accept neither binding, and a caller-supplied topology override refuses.

The profile requires one complete ordinary project-owned schematic page, a
checkpoint-bound owner/branch and loaded single-part templates. It inherits
the flat reader's complete-source, endpoint, pin and no-connect checks, with
integer nonzero orthogonal geometry and bounded intersection work. Hierarchy,
variants, buses, multipart ambiguity and missing loaded pages still refuse.

One unlocked WIRE may change only its existing LINE endpoints. The root WIRE,
all LINE IDs/count, explicit line styles, literal NET name and every ATTR field
remain exact. The sole supported wire attributes are hidden Relevance `[]` and
one NET. Both before/after category orders must already agree with the native
source-derived ordering model. A no-op refuses.

Preparation projects the whole source, reconstructs every endpoint and pin,
and reruns the independent flat topology verifier. It additionally preserves
a **multiset** of contact vertices keyed by sorted incident LINE/pin IDs. This
keeps both endpoints of an isolated LINE and catches same-name island
disconnections. Pin contacts and contacts involving any foreign WIRE also
retain their coordinates. Unsplit intersections and interior contacts refuse.

The initial marker profile excludes shared-WIRE endpoints and pin-bearing
junctions. Their parent depends on native insertion/global z order; this
implementation does not guess that order. Target-owned wire-only junctions and
dangling dots are checked against their complete predicted contact graph.
Canonical categorization is still required, so a marker-free pin-to-pin group
may refuse rather than gain an unsupported ordering exception.

## Runtime and lifecycle proof

The fixed writer uses `setLines`, never the public wrapper, source import,
compiler, annotation or Save All. Before mutation, after all awaited metadata
and payload work, and inside its own native action callback, it rechecks the
exact project/page/shape/action receivers, unchanged complete source/native
observation, contact indexes and target `setLines` method identity.

Marker guards read only existing state. Every expected marker must have exact
class, coordinates, radius, parent, live ID registration, source-ID exclusion,
connection node, private group set, global set and per-LINE index membership.
Unknown/duplicate/orphan generated children refuse. The same proof runs after
the normal geometry update, after awaited action completion, and immediately
before Save. Guards never refresh/analyze/rebuild native indexes themselves.

The exact inverse preserves original sorted LINE ID-to-segment association,
not just a geometry multiset. It is available only while a fresh complete
durable checkpoint remains the original baseline. If native persistence has
already stored the forward effect, unsaved rollback refuses. A separately
requested reverse edit would require a new transaction and its own preflight.

Apply, commit, reconciliation, runtime rebind and original-target opening use
the same sealed binding. Complete library-header peer evidence is retained
where present. Existing no-repeat Save and inverse intents remain mandatory.
Retained successful Save recovery additionally requires its original exact
flat synchronous-guard acknowledgment, full effect, complete topology and
whole-project persistence. Recovery performs no repeat write, Save or navigation.
An attempted Save without its success acknowledgment remains unresolved.

Lifecycle acceptance is a point-in-time source/checkpoint proof, not an atomic
lock on the live editor or current project file through the response. Commit
checks the reopened snapshot and a later immutable checkpoint; retained-Save
reconciliation also reads final source, but does not reverify the current file
after that final read. Concurrent user or native changes remain outside that
completed observation. This profile does not strengthen or relax that inherited
coordinator boundary.

Old wire journals are not migrated or reinterpreted. Generic type-1 topology
execution stays disabled. Display-only profiles retain their old discriminator,
operation admission and proofs. No global source/topology comparison is relaxed.

## Verification and remaining limits

Synthetic tests cover pure admission, identity/style/name/count refusals,
same-name disconnection, geometry contacts, exact inverse, before/after durable
classification, generated native execution, moving wire-only junctions, marker
corruption, final Save checks, complete encrypted SQLite coordinator paths,
ambiguous Save refusal and inverse dispatch-time checkpoint races. Native
observations/dispatch in coordinator tests are explicit isolated seams; runtime
tests execute only maintained generated code against synthetic models.

These tests do not establish connected timing, native asynchronous subscriber
behavior or saved/reopened editor acceptance. That evidence must come from a
fresh installed generation and an explicitly identified disposable project.
No test or recovered historical journal authorizes a production writer.
