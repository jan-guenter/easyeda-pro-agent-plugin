# Dimension readers and schematic clock release checkpoint

Date: 2026-10-19. Candidate `0.3.0+codex.20261019070000` is built. Its full
verification is still running; publication and marketplace installation are
pending. This checkpoint records implemented scope and completed evidence,
not a released or live-admitted 070000 runtime.

## Dimension geometry

The current PCB geometry adapter now implements bounded
`pcb_PrimitiveDimension.get` and `getAll` reads through the existing captured
native `dimension-getAll` receiver. Both methods validate two complete ordered
family samples before returning results. Explicit IDs must all exist and the
response preserves caller order; a changed or malformed unrequested peer also
refuses the read. The complete family and request each have a 256-row bound.

Length, Radius and Protractor dimensions retain their native coordinate tuples
of eight, six and six values. Coordinates and line width are already in mil;
the adapter does not scale them again. It also reports type, layer, lock state
and precision. `canvasUnit` names the current canvas setting, not a coordinate
conversion factor or a verified annotation unit. The native getter overwrites
the per-annotation unit before returning it, so the adapter makes no rendered
measurement or annotation-text claim.

`getAll` accepts empty arguments only. `get` requires a distinct, nonempty ID
array; scalar IDs and SDK filter options remain outside this subset. The route
does not use the generic native `getByIds`, expand generic type lookup, change
selection, export source or enable a writer. It observes loaded views, not
complete saved membership. See the
[Dimension source contract](current-pcb-dimension-geometry-research-2026-10-19.md)
for exact implementation pins, offsets, units and omitted fields.

The geometry catalog now has 17 methods. Two current-native routes were added
alongside existing legacy methods. The inventory still contains 774 distinct
methods, including 450 omitted and 80 implemented-but-blocked methods. Route
counts are 346 guarded, 94 blocked and two partially blocked. Routes can belong
to different runtime profiles; these counts are not a callable-method total.

## Private schematic groundwork

Three new SCH-specific modules implement a fixed renderer clock observation,
original-owner clock preparation and complete stored-SQL effect comparison.
They remain private and unregistered. There is no callable schematic rename
writer in this candidate.

Clock preparation binds the original schematic startup and writer-transfer
owner, distinct Windows clock observations, actor expectations and fixed
document/backend time windows. Stored-effect verification requires the exact
original history followed by one supported `EDIT_HEAD`/SCH `DOCHEAD`/`META`
chunk. It compares the complete SQL relation, including peer assets and
unrelated tables. Copied plans, owners or completed-reader objects cannot
recreate authority, and a failed preparation cannot be rearmed.

These modules do not yet prove original native reply provenance, the worker's
actor/client, every persistence producer, queue completion, dispatch origin,
process closure or saved reopening. The clock plan supports only a locked
history head. See the
[SCH implementation and remaining lifecycle](current-schematic-rename-clock-and-stored-effect-2026-10-19.md).

## Polygon omissions have concrete causes

Current Fill, Polyline and Region identity enumeration remains unavailable.
The available family RPCs serialize polygons before returning IDs. That
serialization can rebuild model/view children. The original managers and
serializer-free selectors are lexical bindings that the reviewed extension
boundary does not expose.

The object-tree event is not an equivalent workaround. It applies different
parent-membership rules, sorts the result, has no correlated response and
changes the actual tree UI's loading state. It cannot prove the requested
complete family membership. These methods need a fixed, reviewed observer of
the original managers or a suitable vendor-supported endpoint. No arbitrary
code route, runtime patch or misleading partial substitute was added. The
[polygon investigation](current-pcb-polygon-identities-research-2026-10-19.md)
records the exact selectors, side effects and requirements for a future adapter.

## Completed live evidence belongs to 060000

Installed `0.3.0+codex.20261019060000` passed the separate disposable Attribute
geometry case. `getAll` returned six rows in two parent groups. `get` returned
two Designator attributes in reversed caller order. Each call compared two
complete matching samples, and the selected values and groups agreed between
the calls.

Normal closure and retained original root-process/Job termination completed.
The final closed file remained byte-identical at 598,016 bytes, with SHA-256
prefix `e4434cc5`, and had no sidecars. No edit, explicit Save, restoration or
production-design access occurred. Formulas and nondefault attribute styles
were not represented. This result validates that case on 060000; it does not
admit 070000 or validate Dimension geometry.

## Candidate verification and pins

Root and independent source reviews accepted Dimension and the private SCH
modules. The 77 focused Dimension/registration/coverage tests and 10 focused SCH
tests passed. Strict types and targeted type-aware lint passed with zero
warnings. Dependency/signature/security, build, compatibility, repository and
seven official skill-validation checks passed. The frozen full verification
run remains pending and has no passing final result at this checkpoint.

Historical live-case detail moved into an optional skill reference without
changing its content. All 81 skill links resolve. Current capabilities and
current-runtime limits remain in the main skill guidance.

| Candidate artifact | Count | SHA-256 |
| --- | ---: | --- |
| Facade source | 485 files | `76c9fafb5e962224f559bc9dbb3c760a4f436d5f51ea48baeb23bbc64f30fc38` |
| Runtime payload | 3 files | `2ac69694bfd4a9044d5a9f36c827989cae01ac996e75878cc55c5b809f3c13ea` |
| Reviewed compatibility manifest | 1 file | `1aa8266310964ea4ec0b3059cf89d05ca594855bd733b45fa34f221068b73794` |

External EasyEDA, upstream, bridge and dispatcher pins are unchanged. Updating
the facade's own hashes does not broaden external compatibility.

A new one-shot installed-payload probe is prepared but not run. After official
installation and approval, it is intended to check configured ambient-Node to
pinned-Node startup, 20 restricted tools, the 17-method geometry catalog,
Dimension argument acceptance and scalar/filter refusals using a synthetic
offline profile. Discovery must keep execution authorization false. Its
original child must exit through stdin EOF, and the complete installed
inventory must remain unchanged. This is planned offline evidence, not a live
Dimension result or a continuous network-isolation claim.

## Remaining priorities

1. Finish the frozen local verification and exact-payload GitHub CI. Publish
   only after required checks pass, install through the official Git marketplace
   and verify all installed bytes and modes. Review and run the new one-shot
   offline probe, then load and admit the actual installed facade in a fresh
   Codex session. No cache hotpatching or host-owned gateway termination.
2. Validate nonempty Dimension geometry and Dimension/Image identity cases on
   disposable data after fresh admission. Preserve complete samples, normal
   closure and unchanged closed-file evidence. Empty-family observations do
   not cover populated geometry.
3. Finish SCH original dispatch/reply retention, backend actor/client and
   complete producer qualification, one durable journaled mutation attempt and
   its acknowledgment. Bind the full stored SQL effect to original closure,
   fresh saved metadata, unchanged child roster and final closed SQL. A fixed
   wait cannot replace delayed subscriber completion. Register and live-test
   the disposable route only after those obligations are met.
4. Finish PCB text Save-participant, queue and worker observations before
   enabling its writer and complete persistence lifecycle. Existing public
   getters do not expose all required owners.
5. Revisit polygon identities when an exact original-manager observer is
   available. Keep the present concrete omissions until then.
6. Investigate admission projection-cache reuse as a performance hypothesis.
   Reuse may cover only bounded deterministic historical projections after
   fresh complete input-byte and file-identity checks. Never cache ownership,
   admission, quarantine clearance or writer authority. Measure cold/warm
   connected latency before claiming improvement; no such improvement is
   established by this release. The existing
   [admission timing diagnostics](status-admission-diagnostics-2026-10-19.md)
   add observation, not a faster scan.
7. Continue the broader schematic/PCB, component-library/3D, ECO/export,
   account, bootstrap and additional-platform backlog. Keep each operation's
   implementation, runtime admission and saved/reopened evidence separate.
