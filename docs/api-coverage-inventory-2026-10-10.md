# EasyEDA API execution coverage

The complete machine-readable inventory is
[api-coverage.json](../plugins/easyeda-pro-control/api-coverage.json).
It has one row for every mounted method found in either pinned SDK snapshot.
Each row retains all declarations, route details or a concrete omission reason,
source/test references and the next requirement for implementing the method.

The inventory covers 774 distinct method paths. The reviewed installed SDK has
697, the newer official reference has 773, and one older dialog method appears
only in the reviewed SDK. These counts are method paths, not overload counts.
The original 749 and 806 declaration signatures remain in the inventory.
The current source inventory has 191 public subsets, 77 native equivalents,
two lifecycle-only methods, eight blocked methods and 496 omissions. The fixed
SDK-read catalog has 164 routes. These are implementation counts, not live-test
counts.

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
inherit this topology dependency. Shared lifecycle routes explicitly retain the
type-1 block. An available route still needs actual compatibility, ownership,
context and operation admission; this inventory does not grant them.

Three separate routes describe the sealed flat-display exception: attribute
modify, text modify and internal journal-bound Save. Only existing stored
display patches on the sole page of an ordinary single-page schematic are
admitted. The profile retains full ownership, source/native endpoint, inverse
and durable-state proof. Batches may combine attribute and text display steps,
but cannot contain electrical or other layout steps. These routes do not call
the public modify wrappers or enable generic schematic transactions. Connected
apply/Save/reopen validation remains pending for the new source.

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
[disposable validation record](api-coverage-disposable-validation-2026-10-10.md).

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
membership and two stable
observations, without invoking those public wrappers or the compiler. Their
connected validation remains pending. See the
[source and contract review](schematic-id-reader-review-2026-10-10.md).

The fixed polygon-splitting subset constructs temporary public SDK objects from
bounded JSON arrays and returns exact ordered source arrays. It has no design
mutation or native-handle contract. The installed polygon `discretize` delegates
to an unconditional `Not implemented` throw. The omitted Pin `getAll` wrapper
swallows both RPC and required-attribute projection failures as an empty array;
an equivalent needs independent complete membership, not just JSON serialization.
These implementation facts and remaining adapter proposals are recorded in the
[next-adapter research](api-next-feasible-research-2026-10-10.md).

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

The separate [implementation feasibility review](api-execution-feasibility-2026-10-10.md)
records source-level findings for symbol metadata, hidden compiler Save,
interactive BOM resources and other stateful omissions. A disabled candidate is
not listed as implemented execution coverage.

This inventory contains no project files, private evidence or credentials.
A user design is not a validation fixture. Any connected execution tests must identify
the disposable project and report their observed phase separately from these
offline implementation and contract tests.
