# EasyEDA API execution coverage

The complete machine-readable inventory is
[api-coverage.json](../../plugins/easyeda-pro-control/api-coverage.json).
It has one row for every mounted method found in either pinned SDK snapshot.
Each row retains all declarations, route details or a concrete omission reason,
source/test references and the next requirement for implementing the method.

The inventory covers 774 distinct method paths. The reviewed installed SDK has
697, the newer official reference has 773, and one older dialog method appears
only in the reviewed SDK. These counts are method paths, not overload counts.
The original 749 and 806 declaration signatures remain in the inventory.
As of installed030626 and the current October12 source inventory, there are 193
public subsets, 30 native equivalents, no lifecycle-only methods, 82 blocked
methods and 469 omissions. The fixed SDK-read catalog has 182 routes, including
21 native equivalents. The 274 guarded, 94 blocked and two partially blocked
execution routes are counted separately from methods. These are implementation counts,
not live-test counts. The [connected ledger](2026-10-11-through-2026-10-19-api-connected-validation-ledger.md)
records subsequent generation-specific validation of the adapters discussed below.

The current restriction blocks design transactions for schematic-page, symbol
and PCB document types, plus eight symbol/page/container metadata operations.
Their native Save and metadata paths can queue a later `project_structures`
write. Existing record comparisons alone do not prove its completion or exact
effect. Footprint transactions retain their separate guards. The
[030626 restriction](2026-10-12-api-coverage-030626-release.md) lists the exact
operations, and the [completion work](2026-10-12-project-structure-save-completion.md)
records implementation progress. Synthetic tests of the new internal coordinator
have not restored any blocked route. Earlier adapter and fixture descriptions
below retain their historical scope; they do not override this restriction.

The October11 additions include three mappings to existing footprint-only
String create/modify/delete actions and two closed ordinary PCB/schematic rename
adapters. Footprint text is not PCB type-3 text or full public-API parity.
Container rename has independent frame inventory, one other clean PCB, exact
whole-project record/provenance proof and original-acknowledgment recovery. It
does not perform Save or claim connected acceptance. Concrete remaining native
effects are in the [October11 review](2026-10-11-api-remaining-method-effects.md).
A later source candidate adds narrow PCB type-3 x/y/text modification and
closed free-PCB creation. It also strengthens creation/container rename with
exact checkpoint-bound per-document raw occurrence chains. New writers are
offline-tested, not connected-validated. See the
[closed creation contract](2026-10-11-closed-free-pcb-create-research.md).

Component-property names have a separate fixed native equivalent for the exact
active ordinary schematic page. It includes all direct component attribute
keys, including inherited/generated attributes, frames and flags. Complete
tree/index/source/family/attribute membership must agree. Structural GROUP
records, nonreciprocal junction aliases and hierarchical instances refuse.
The installed broken public wrapper is not invoked. This is a property-name
observation, not a complete source, connectivity or persistence proof. See the
[source review and limits](2026-10-10-component-property-reader-review.md).

Two further native equivalents expose ordinary page-root Text state through
`sch_PrimitiveText.get/getAll`. Both return a sorted array of 14 fixed native
fields, with unconverted Y coordinates, nullable styles and raw horizontal and
vertical alignment. They do not claim SDK getter parity. The installed singular
and collection wrappers disagree on alignment and can return before their
callbacks finish. Complete bounded tree/index/source/family ownership and two
scalar captures guard the replacement. Descendant Text, symbol editors,
structural GROUP records and incomplete selected-ID sets refuse. Source and
adversarial tests pass. Installed223200 returned the expected fourteen fields for
one root Text through both methods, with complete native and saved-project
invariance. Coverage is that null-style/alignment fixture, not arbitrary rendering
or later-generation admission.

Four native Wire/Bus `get/getAll` routes return group identities, every line's
native points and nullable style, every literal NET name and custom attribute
identities. They do not collapse heterogeneous styles or choose a first net name.
Complete tree/index/source/child membership, two captures and late scalar/type
reproof replace the swallowed-error public wrappers. No compiler or serializer
is called. Installed010000 subsequently passed a nonempty Wire/Bus fixture with
complete native and saved-state invariance; newer generations remain separate.
Installed233100 refused populated Wire state because the adapter confused
serialized style strings with native numeric enums. The source fix preserves
the string DTO and compares raw numeric values for drift. Native and saved
fixture state stayed unchanged after the refusal; this is not successful reader
validation.

`pcb_Net.getAllPrimitivesByNet` now has a filtered native identity adapter for
Line, Arc, Via, standalone Pad and ComponentPad. Filters and a nonempty net are
required. Two complete source/inventory/source cycles prove every requested
family before net filtering, including PAD_NET/component ownership. Unfiltered
membership and other native shapes remain unsupported; this is not SDK class
parity, connectivity or persistence proof. Installed071500 passed ComponentPad/Via
and empty Pad/Arc cases. Installed103000 subsequently passed Line-only and
combined five-family nonempty-net membership, with complete native and saved
invariance. Nonempty standalone Pad/Arc and newer generations remain separate.
Ordinary text, reviewed metadata and BOARD outlines are admitted. Pinned source
review distinguishes BOARD drawing controllers from electrical Track/ArcTrack
models. Complete electrical-family correspondence remains mandatory; outline
geometry is not returned or validated.

Inherited neutral footprint lines now have a separate narrow checkpoint-bound
proof. It requires explicit Footprint bindings, exact complete saved history and
matching native geometry on unlocked top-side zero-rotation components with
zero-origin libraries. No ID-prefix ownership guess is accepted. These inherited
lines can satisfy complete membership or a Line type result, but their empty
nets never enter a nonempty-net result. Installed103000 passed type lookups for
two inherited neutral lines and one track, with all18documents/383records and
the full saved SQLite unchanged. This is not connectivity or writer validation.

`pcb_Primitive.getPrimitiveTypeByPrimitiveId` classifies an existing literal ID
as Line, Arc, Via, Pad or ComponentPad only after complete all-five-family
source/inventory proof, including empty-net objects. Missing IDs, unsupported
families and identity collisions refuse. It does not call the installed empty
public stub or claim absence, geometry or connectivity. The three installed103000
Line cases above do not establish other classifications or later-generation
acceptance.

Two corrected inventory rows now identify existing capture workflows:
`dmt_EditorControl.getCurrentRenderedAreaImage` in visible-canvas capture and
`zoomToRegion` in region capture. Both require an explicit proven active tab,
bounded PNG evidence and before/after runtime/context checks. Region capture
changes the viewport. Neither is full source or visual acceptance, and standalone
zoom remains unavailable. These corrections do not add two SDK-read methods.

## What the statuses mean

| Status | Meaning |
|---|---|
| `implemented-public-subset` | A fixed maintained route invokes this method for the stated argument/result subset. It does not accept arbitrary class instances or all declared overloads. |
| `implemented-native-equivalent` | A maintained read or transaction performs the stated task through a reviewed native adapter. This does not claim the public SDK wrapper works. |
| `internal-lifecycle-only` | A journaled workflow can use this operation internally. This row supplies no unrestricted standalone authority. Separately mapped typed activation and inactive-clean close routes have their own exact tab/context guards. |
| `implemented-but-blocked` | Implementation exists, but every mapped route is currently refused by a required runtime guard. Code or schema presence is not callable support. |
| `omitted` | There is no supported route for this method. The row gives the actual blocker or the missing implementation work. |

No row claims complete support for every declared contract. No current-generation
connected validation is inferred from offline tests. Historical saved/reopened
wire validation is kept in the separate operation validation registry and remains
bound to its original profile and evidence.

Each route also reports `executionState`: available with runtime guards, blocked,
or partially blocked for specified document types. Generic ordinary schematic type-1
writes require the complete topology reader in `design-execution.ts`; that reader
is currently refused because the installed compiled-netlist path can annotate
parts and invoke global SaveAll. Those writes are implemented but blocked, not
advertised as callable. Independent type-2 symbol graphics and PCB routes do not
inherit this topology dependency, but their design transactions are now blocked
by the separate native structure-completion requirement. That requirement also
blocks sealed flat-display and wire transactions. An available route still needs actual compatibility, ownership,
context and operation admission; this inventory does not grant them.

Three separate blocked routes describe the earlier sealed flat-display exception: attribute
modify, text modify and internal journal-bound Save. Only existing stored
display patches on the sole page of an ordinary single-page schematic are
within that implemented profile. The profile retains full ownership, source/native endpoint, inverse
and durable-state proof. Batches may combine attribute and text display steps,
but cannot contain electrical or other layout steps. These routes do not call
the public modify wrappers or enable generic schematic transactions. Connected
observations from earlier releases do not establish the missing native
structure-completion proof or current execution authority.

The standalone `document.close` subset targets an inactive clean ordinary symbol,
PCB or footprint while a separate PCB/footprint remains active. It waits for
terminal cleanup, proves the complete database unchanged and invokes no Save or
reopen. Any post-dispatch failure retains quarantine until captured-runtime
termination is proved; recovery never repeats the close.

`document.page.create` is a native task equivalent, not invocation of the public
template-and-open wrapper. It adds one closed empty page to an existing ordinary
schematic using checkpoint-derived name/order defaults. Complete unchanged-peer
proof and the original native returned ID are required; neither an observed
addition nor a matching title grants replay or recovery attribution. The installed
182554 page-creation route passed a disposable complete-project test; that evidence
does not validate later source changes. See the
[disposable validation record](2026-10-10-api-coverage-disposable-validation.md).

`library.symbol.create` adds a closed empty ordinary project symbol while an
ordinary clean PCB is active. It proves the original returned ID, one META-only
addition and every unchanged peer. It does not initialize a PART, canvas or
template, open the editor, invoke Save, support classifications or supply an
automatic inverse. The native permission check may display a denial dialog.
Installed194400 passed one disposable native-persistence test with all17existing
documents unchanged. That test did not open a symbol editor or validate geometry.

Two public editor lookups also have narrowed routes: tab-to-split-screen ID and
split-screen-to-tab identities. They require an existing owned selector, complete
checkpoint-member tab-tree ownership, direct-result parity and two unchanged
observations. They do not expose arbitrary open-project tabs or raw tab data.

## Reasons for omissions

Latest-only methods require a separately reviewed newer runtime. The catalog
does not change the current compatibility tuple. Reviewed native stubs include
stack preset methods, real-time DRC controls, the schematic net getters and
several generic PCB primitive getters. Their installed implementations return
constant empty values or do nothing. Existing native task equivalents are listed
where they exist.

Several apparent readers are also unsuitable as exact evidence. The installed
font-list wrapper and bus/wire ID readers convert failures to empty arrays. The
schematic text ID wrapper can return before its callback completes. Such behavior
must be fixed with a maintained reader, not hidden by labeling every `get*` name
read-only. Three new synchronous native equivalents now cover Text/Wire/Bus IDs
on the exact active ordinary type-1 page, with no net filters or symbol scenes.
They require complete connected tree/index proof, source-backed root-family
membership and two stable observations, without invoking those public wrappers
or the compiler. The installed214400 Wire path returned four expected groups with complete native and
saved-project invariance. Text had a separate210100 nonempty test; Bus remains
empty-only. Those results do not validate a later facade generation. See the
[source and contract review](2026-10-10-schematic-id-reader-review.md).

The fixed polygon-splitting subset constructs temporary public SDK objects from
bounded JSON arrays and returns exact ordered source arrays. It has no design
mutation or native-handle contract. The installed polygon `discretize` delegates
to an unconditional `Not implemented` throw. The public Pin `getAll` wrapper
swallows both RPC and required-attribute projection failures as an empty array.
A separate native equivalent now proves complete membership on one ordinary
project-symbol PART and compares all twelve explicit-ID getter fields with native
state. Its host schema requires sorted unique IDs, bounded supported values and
exact undefined-OtherProperty evidence. Multipart/inherited shapes, custom pin
attributes and unknown structures refuse; schematic component pins are outside
this route. It invokes no compiler, source serializer or Save. Installed214400
passed a two-Pin ordinary-symbol case with complete source and saved-project
invariance. Other shapes/enums and later generations remain untested. See the
[Pin contract review](2026-10-10-pin-enumeration-review.md).
These implementation facts and remaining adapter proposals are recorded in the
[next-adapter research](2026-10-10-api-next-feasible-research.md).

The schematic netlist, BOM and document export paths, plus PCB BOM, PDF and
netlist export paths, invoke implicit annotation and/or Save. They are refused
before dispatch until a nonmutating implementation or explicit whole-scope Save
lifecycle exists. Schematic simulation export requires the unadmitted NGSPICE
editor, not an ordinary type-1 schematic. These seven export schemas remain
discoverable but are not counted as execution coverage.

Events, timers and registrations require resource ownership, bounded queues and
disconnect cleanup. Files require managed byte transfer and verified inputs and
outputs. Message buses, network requests and extension services need fixed scoped
destinations rather than an arbitrary transport endpoint. Orders require separate
commercial authority and cannot be tested by placing a real order.

Other omissions are ordinary remaining engineering work. The inventory explicitly
labels missing read projections, typed navigation adapters and exact design-effect
verifiers. It does not claim these are impossible or exclude them merely because
the previous release lacked them. Creating a method wrapper without a complete
effect verifier would not finish those entries.

## Reproducing and maintaining the inventory

From the plugin package with the pinned Node toolchain:

```sh
node scripts/generate-api-coverage.ts --check
node --import ./scripts/test-isolation.ts --test server/tests/extension-api-coverage.test.ts
```

After reviewing an adapter or omission-policy change, regenerate with
`node scripts/generate-api-coverage.ts --write`. Tests require exact agreement
between the committed JSON, both declaration snapshots and maintained routes.
They check every route's source/test files, exhaustive coverage, schema-only
refusals, public/native distinctions and bounded complete pagination.

Use the offline `easyeda_control_api` coverage action to find methods and routes:

```json
{"request":{"action":"coverage","query":{"search":"pcb_PrimitiveArc.get","detail":true}}}
```

Then obtain the exact operation schema from its `operations` action, or the fixed
SDK-reader descriptor for newly implemented public reads. Querying coverage never
dispatches a method, changes a document or starts the bridge.

For example, the public-reader entry includes this exact schema query:

```json
{"request":{"action":"sdk-reads","query":{"method":"eda.pcb_PrimitiveArc.get","includeSchemas":true}}}
```

The separate [implementation feasibility review](2026-10-10-api-execution-feasibility.md)
records source-level findings for symbol metadata, hidden compiler Save,
interactive BOM resources and other stateful omissions. A disabled candidate is
not listed as implemented execution coverage.

This inventory contains no project files, private evidence or credentials.
A user design is not a validation fixture. Any connected execution tests must identify
the disposable project and report their observed phase separately from these
offline implementation and contract tests.
