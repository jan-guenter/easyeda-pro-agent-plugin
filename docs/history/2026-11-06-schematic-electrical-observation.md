# Pure current209 component, pin and contact observation

The existing authenticated `schematic-page-read` wrapper now accepts the fixed
`native.sch_Page.observeComponentsPinsNets` operation with empty arguments. It
returns one aggregate native DTO containing raw component/pin state, literal
Wire/Bus names and existing endpoint-cache membership. Its source is directly
reachable through the existing registered callback and offline argument discovery.
It opens no page, starts no application and grants no writer or Save authority.

The original ordinary type-1 project/branch/page/parent/tab and complete current209
UI/SCH source pins remain mandatory. The observer reads the complete root Symbol
family and its original `shapes`, `_attrMap` and pin `_attrIdMap`. It proves their
reciprocal complete child/tree/ID memberships. Pin IDs can be inherited and absent
from the source index; this is reported explicitly rather than incorrectly
claiming every placed-pin child is a stored source record. Raw own data fields
preserve absence, `undefined`, scalar values and `null`, including the separate
symbol, block and variant backing values and no-connect backing state. Effective
attribute getters are never evaluated.

The existing mature Wire/Bus readers supply literal name/line DTOs under their
unchanged predicates. The new observer reads only the already-built original
`netPointManager._netPointData.points` Set, including original member Sets and
raw point values. It requires every observed placed pin exactly once and every
observed Wire/Bus line in one or two cached contact nodes, with exact original
model/group identities. These are observations of cached native memberships,
not inferred global net names or complete topology. Native tolerance, cache
freshness, hierarchy and cross-sheet semantics remain unproved. BusEntry and
unsupported component kinds refuse whole rather than returning partial data.

Every collection is compared across two synchronous observations. The final
retained reproof reads original backing fields, Maps, Sets, tree positions and
coordinates after the wrapper's last source-reader callback. It independently
refuses late changes to raw values, map contents/identities, cache member Sets,
points, wire names/geometry and source-ID membership. It invokes no compiled AST,
getSchPinNet, getValue/instance getter, parts sorting, source encoder, lazy contact
getter, contact rebuild/refresh, annotation, source write or Save. Output remains
bounded to2MiB,256 components,4096 pins,8192 attributes/contact nodes and256
Wire/Bus groups. Independently complete empty inventories are accepted.

## Installed source evidence

The complete `pro-sch/3.2.193.5dbe8bb3/js/sch-main.js` source is6,289,622bytes,
SHA-256 `e7fdbc30cadd14fb87c5a50d2c5563241b4cf373d6eea8f7d0c9e7e59588d72c`.
The existing full `sch.js` and UI pins are also required before and after reads.
Additional examined zero-based UTF-16 offsets are:

| Source behavior | Start | End |
| --- | ---: | ---: |
| Symbol backing constructor | 1815769 | 1816039 |
| Copying Symbol getAttr | 1825646 | 1825719 |
| Copying Symbol getShapes | 1825927 | 1826067 |
| Pin backing constructor | 3707914 | 3708277 |
| Copying source-ID reader | 4455726 | 4455784 |
| Contact rebuild and lazy getter, excluded | 3942638 | 3943921 |
| Compiled-cache pin-net getter, excluded | 4239145 | 4239378 |

The contact getter can run `analyzeNetPointData`, which rebuilds indexes and
assigns `_netPointData`. The pin-net getter dereferences a compiled AST through
`astPureSheet`/`astProject`. Those paths are excluded from this pure observer.
Complete installed source identity supplies static qualification, not original
native process custody or connected validation.

## Display transaction boundary

The existing flat-display transaction requires complete normalized native
source, independently verified topology and saved/checkpoint/persistence proofs.
The current structure-completion workflow still leaves complete upload frontier,
originating-write eligibility and complete SQL effect false. This raw observation
cannot substitute for those proofs. Existing topology, display/writer and Save
guards remain unchanged; no bypass flag, caller proof, dormant writer or falsely
completed transaction was added. A later admitted display lifecycle can consume
this aggregate as an additional observation without upgrading its authority.

Node24.18.0/npm11.16.0 with soft core limit zero ran focused source/DTO/route
regressions, strict types and zero-warning targeted type-aware lint. Synthetic
fixtures make effective getters, compilers, source serializers and cache rebuilds
throw if invoked. Tests cover nonempty and genuinely empty rosters, backing-field
presence, no-connect state, unsupported/missing/contradictory caches, last-callback
mutations, transport contradictions and the production authenticated registered
callback. The final focused run passed213 tests, strict types and targeted type-aware lint
passed with zero warnings, and repository/package/MCP/all-seven-skill validators
passed. No connected
CAD call, native owner, production project, Save, bundle/coverage/compatibility
regeneration, installation or publication occurred in this worktree.
