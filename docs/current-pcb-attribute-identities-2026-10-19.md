# Current PCB Attribute identities

Research date: 2026-10-19. This adds a narrow current-runtime reader candidate
to the existing PCB identity adapter. The later installed case below records
scoped connected validation, not saved membership, complete ownership or writer
authority. Research used inert
installed source and official documentation; no CAD call or example was run.

## Contract and exact sources

The existing coverage inventory already lists legacy public subsets for
`pcb_PrimitiveAttribute.get`, `getAll` and `getAllPrimitiveId`. The gap is the
separately pinned current-runtime identity reader, not a wholly omitted SDK
method. Legacy routes stay unchanged.

The official [getAll documentation](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitiveattribute.getall.html)
marks the method beta and accepts optional parent ID, layer and lock filters.
It returns Attribute objects. The installed declaration also defines
`getAllPrimitiveId` with those three optional arguments and a string-array
result. Its dedicated documentation URL was inaccessible during this review;
the declaration and actual implementation establish the pinned signature.
The new adapter accepts only empty arguments and does not construct public SDK
objects or claim complete public-method parity.

Installed source paths are relative to `resources/app/assets/`. Offsets below
are zero-based JavaScript UTF-16 positions, not byte offsets.

| File | SHA-256 |
| --- | --- |
| `pro-api/0.3.50.ab46409c/api.js` | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |
| `pro-api/0.3.50.ab46409c/api-types.d.ts` | `d5fe990034c55001302ea6c3f704c2d4b88cdf23253cc5293b3bad62a32b9def` |
| `pro-pcb/3.2.193.682ed44e/js/pcb.js` | `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33` |

## Native getter and its effects

API `getAllPrimitiveId` at1492089 calls `getAll` at1492186 and maps its returned
objects to IDs. The public mapper flattens native component groups and applies
filters after constructing Attribute objects. It adds the enclosing group's
parent ID to each public object; it does not independently prove that parent.

PCB `attribute-getAll` at10411443 calls `gr.getAllItem()` and returns one
`{ attrs, parentPrimitiveId }` group for each existing component view. `attrs`
comes from `component.toJSON().ATTR`; `parentPrimitiveId` is the component's
native global ID. Manager `rL` at8002758 uses `Ms`; inherited `iu.getAllItem`
at7946904 iterates only existing `stateWatcher` views. It does not initialize
missing views. This is not complete persisted component or attribute membership.

The callback serializes the whole component before discarding non-attribute
fields. The read chain is the same one used by the current Component reader:

- `Le.toJSON` at7397863 reads existing footprint/device caches, attributes,
  pads, vias and pad lengths. Footprint/device lookup at4312086/4026747 is a
  Map read, not the neighboring asynchronous loading paths. Missing required
  cache state can throw and must not become an empty success.
- `Le.attributes` at7388086 copies the current attribute values. `yr.toJSON`
  at7384285 reads text/model fields, existing font cache and its parent's raw
  attribute map. `attrsMapSource` at4314525 returns the backing map without
  formula evaluation. The identity adapter does not project those values.
- `yr.getFontCache` at7381314 uses existing font-template/cache lookup.
  `getFontTemplate` at3978262 is a Map read; `getFontCache` at3977492 scans
  existing entries. This path does not invoke font extraction, upload, setters
  or text-box refresh. `getTextValue` at7380532 builds a local string.
- `getPads` at7391299 returns existing children; `getVias` at7391475 filters
  existing children into a new array. `MR.getInstance` at4185266 may allocate
  an empty pad-length singleton. `getPadLen` at4185703 only reads its maps.

These inert source observations found no design mutation, library/asset fetch,
Save, render command or queued persistence on the getter path. Existing RPC
bookkeeping and the empty singleton allocation remain incidental effects.
Native enumeration and serialization happen before output limits; the observer
deadline does not cancel that vendor work. See the fuller
[Component/Pad review](current-pcb-component-pad-research-2026-10-14.md).

## Adapter boundary

The existing captured ordinary PCB frame, exact project/branch/document/tab,
native receiver and before/after identity checks remain mandatory. Invoke only
the fixed native Attribute getter with an empty object. Never expose its topic
or arbitrary arguments to a caller.

Retain each parent group and its ordered IDs, including empty groups, in both
samples. Compare this complete representation before returning a flattened ID
array and `attributeParentGroups`. Equal flat IDs alone could hide reparenting
or a changed empty group. The parent grouping is an observed native association,
not reciprocal model ownership or complete stored ownership.

Bound the outer group count, each child count and total child count before
flattening. Limits are20,000 groups,20,000 total IDs,256 characters per ID and
393,216 UTF-8 bytes of evidence. Reject sparse/accessor/inherited or malformed
projected data, duplicate parents, duplicate attributes, parent/attribute ID
collisions and changing ordered associations. Do not truncate or infer a parent
from an ID prefix. Ignore unprojected attribute fields without invoking getters.

Other identity response shapes remain unchanged. Positive type lookup still
accepts only Line/Arc/Via. Parent/layer/lock filters, Attribute fields, source
ownership, selection changes, geometry edits and persistence remain excluded.
Fill/Polyline/Region stay disabled because their serializer can rebuild native
children; this addition does not alter that decision or enable FileSource.

## Focused verification

Synthetic tests exercise the generated fixed native RPC program and response
validator with cross-realm DTOs. They cover ordered/empty groups, parent changes
with unchanged flattened IDs, duplicates/collisions, malformed descriptors,
pre-flatten aggregate bounds, byte limits and strict empty arguments. These are
adapter tests, not execution of the native vendor callback or a populated live
board. The separately admitted nonempty case below supplies scoped live evidence.

## Installed023200 populated disposable case

The restarted installed `0.3.0+codex.20261019023200` facade passed exact process,
source, bundle and installed-file admission. Its authenticated current runtime
then opened the selected disposable PCB through the original retained launcher.
One Attribute ID request returned two matching samples: six unique attributes
in two ordered component groups, three attributes per group. The runtime checked
the exact target and fingerprint before and after the observation. Observation
commitment: `c3795321f18d94bc2d56800fb53d7a4fd5a862fea513795d9356ab8411a13d0f`.

One normal-close request was acknowledged. A separate original root/Job
termination observation passed. The closed disposable file remained598,016bytes
with SHA-256`e4434cc5d6a5a2d19729093485406e486499790e5f32d994a1d35bb5709d5b4d`,
byte-identical to its retained earlier closed copy, with no SQLite sidecars.
No explicit Save, design edit, restoration or production-design access ran.
The case is completed and must not be replayed.

This validates populated ID/group observation on that payload and fixture.
It does not validate the new Attribute geometry/value methods, empty-group live
behavior, filters, reciprocal ownership, complete persisted membership or a
later runtime. Unchanged closed bytes are a separate case result, not a
persistence guarantee of the reader.
