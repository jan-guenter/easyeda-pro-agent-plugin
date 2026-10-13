# Non-mutating flat schematic topology candidate

This review covers `server/src/schematic-flat-topology.ts` and its focused tests.
The module is a source-reviewed candidate, not a connected execution acceptance.
No CAD call, project read, Save, navigation, process change or journal change was
performed during this work. The old `schematic-topology` exporter remains disabled.

The candidate profile is
`easyeda-pro-control.schematic-flat-named-wire-topology.v1`. It does not call the
compiled AST, `getSchPinNet`, a netlist exporter, a compiler, or an editor action.
It reads current native models synchronously and checks their endpoint membership
against a separate reconstruction from their complete serialized source.

## Exact supported domain

All pages of one independently declared schematic must already be loaded. Each
must belong to the same current project and schematic, have its ordinary
`pageUuid@projectUuid` tab, and be outside a running native transaction. The active
page and tab must stay unchanged. Every page and every used library template must
report consistency state `initialized`; loading or incomplete models are refused.
Readonly variant pages are refused.

Only ordinary `part` symbols and pinless drawing-frame `sheet` symbols are
accepted. Every part must have one matching part in its already-loaded project
library template. Missing templates and multipart parts are refused. All current
pins come from both `getShapes("Pin")` and `traversePins`; their sets must agree.
Their global origins, numbers, native attributes and no-connect attributes are
captured. Hidden pins are not filtered out.

All components must have distinct nonempty Unique IDs, unique annotated
designators and `Convert to PCB = yes`. Multipart, reuse and instance attributes
are refused. Hierarchical symbols, ports, flags, buses, bus entries, masks,
standalone net labels and combinations are refused. Only literal simple ASCII
wire names are accepted. Every wire must have exactly one stored `NET` name.
There are no generated-name, alias-priority or case-folding guesses.

Both `defaultNetName` and `netLabelInterPageConnection` must be true. Every wire
segment must have two distinct integer-coordinate endpoints and be orthogonal.
Unsplit crossings, endpoints or pins on segment interiors, conflicting names at
a contact, a connected no-connect pin, and coincident pins without a named wire
are refused. A proved isolated pin has an empty net, not an invented name.

The verifier checks complete declared page, source component, wire, line and NET
inventories. Every source LINE must belong to a represented wire. Source pin
attributes and NET attributes with missing native owners are refused. Stored
component and pin attributes cannot disappear from the capture. Actual native
contact sets must exactly equal independently reconstructed wire-endpoint and
pin-origin sets. Each contact object must also belong to the exact current native
shape manager and ID manager. A stale or incomplete native contact index fails.

The proof contains the profile, explicit authority
`complete-native-source-and-endpoint-membership`, `compiledCacheUsed: false`,
complete page source hashes, an observation hash, component and pin counts, and
the normalized Unique ID/designator/pin-number/net topology. Caller-supplied JSON
passed through the verifier has no authority to execute a design transaction.

## Installed source evidence

The reviewed installed file is
`/mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-sch/3.2.149.35ae2987/js/sch.js`.
Its SHA-256 is
`3f50136fb4ba2d5593beac7ef3e20ebe5275177b56bbcfdd297e79f176a6618f`
and its size is 6,431,214 bytes. Offsets below are zero-based, half-open UTF-16
string ranges obtained by parsing that exact bundle. Slice hashes are SHA-256 of
the UTF-8 encoded slice, not file byte ranges.

| Function or method | Range | Slice SHA-256 |
| --- | --- | --- |
| `bJe`, native wire names | 3962648..3964690 | `4a17ed9ac9ee1f82af0c187fb65a342ccd2fa825fab7d76673c1d8a1cd76dea9` |
| `gJe`, literal wire name conversion | 3960071..3960207 | `1f660b6ce6ae5ba26b91d30124ef4437b547ea82068bb1268cea9bdb18eab7e1` |
| `vJe`, native pin connectivity | 3968052..3970393 | `7a78261cbcafe51faba1ae1b3983cee933fc4b9dd6fa9116aa3a1f2825701826` |
| `buildNetPointsIndexes` | 4128293..4129249 | `63f52b0150d335b1ecf2f173b990ad9085ed861707f24b6209164bbdf793de05` |
| `getNetPoint` | 4132054..4132140 | `66892893243b50ae2260937c7ea47f3348a369fdc9dbb3edd2ec7489d935da33` |
| `getSchPinNet`, cached lookup | 4443957..4444190 | `57bcc0416f290eff42bb2448cb0e2bd2c6bf0e3f3d415b42a1e7cedb58ee7f81` |
| Pin `getConsistencyData` | 5650240..5650477 | `639ea6a7ebc1759926d4407897641d5fb81076fec0082b7af458124c2f7f2cca` |
| `gT`, final netlist component/pin projection | 5728459..5732133 | `6b397d8ad9b88c290643a9b4b3de9d1ba46a29c650d57d5ea55eaf5a5ce405bc` |
| `S0`, page-prefix naming | 6307512..6307627 | `40bea07f2870faacd767cac2eb0dc1dcaebcaf229cfa6ac673c266254b273ea9` |
| `Fd`, generated-name substitution | 6402533..6402685 | `375113cb4d1e16aa3340c6ade4bf82328d2872565125de8da75572d52bb62ba1` |

`vJe` gets all native pins without a visibility filter. It reads the point at
each pin's global origin, then uses an unmasked wire's explicit net name or its
generated name. It has no pin-name or power-pin-type branch that creates a global
connection without a wire. Its bus and special-symbol branches are outside this
profile. `gT` writes a pin's net only when its origin pin has a wire; otherwise it
writes an empty string. The candidate still refuses coincident pin-only contacts
instead of relying on a potentially confusing unnamed-node interpretation.

`bJe` collects native Name attributes, while their stored source key is `NET`.
`gJe` performs HTML decoding, excluded by the candidate's literal-name alphabet.
`S0` prefixes local names when inter-page connection is disabled, so that setting
is refused. `Fd` can substitute a designator/pin-derived name when default naming
is disabled, so that setting is also refused. With no aliases, ports, flags,
hierarchy or generated names, each admitted contact has one unambiguous literal
name. This is a restricted direct-native proof, not an execution of `gT` or proof
that a currently cached compiled graph is fresh.

## Getters and serialization are not automatically harmless

Source review found two mutating getters. Neither is used by the candidate.

| Getter | Range | Slice SHA-256 | Effect |
| --- | --- | --- | --- |
| Symbol `multiPart` | 6248265..6248689 | `11e6c3729d01f7ce380d2cf0e58731bb1b00f5ad265121af892a08a39485ac11` | Can append a missing Multi-Part Group attribute. |
| Library shape manager `parts` | 4386824..4386957 | `08d487253f5b11f4623651d42a2c060c5c0a9beebe150f6a2a12bd867176a0f1` | Sorts the internal part array and clears its sort flag. |

The replacement reads `componentCache.symbolTemplate[symbolUuid]`, enumerates
its `shapeManager.getModels("Symbol")`, and checks the single returned object
against the pure `getPart` map lookup. It does not load a missing template.
`getPart` at 4386957..4386994 is a direct `_partIdMap` lookup, slice hash
`68c2fdc38ec3a71706a333eba527a3f0ff2f2e2e2f2daf0dc5b8a766ca58eb31`.
The symbol UUID getter at 6244707..6244961 only reads its stored UUID or cached
device attributes, slice hash
`54cd22d00aad8532862ab075d8b7adbd3b1cb6628f40c12028cfb3e567adb534`.
That cached attribute method is a direct lookup at 5849331..5849451, hash
`199b4b6d9a2109b6a883d6d76526adbfe11616c2df85c7b7bd27a3e9e24aca23`.

Native source serialization at 4660290..4660585 iterates its complete source ID
map and sends each model's `uploadTo` result to a temporary encoder. Its hash is
`63f7b6234e36b34a32ff6922278fe4ec09649b33b1a7d03ca57188f66ce00ecd`.
The candidate checks that map before serialization and rejects missing models or
unreviewed model types. Images and tables are rejected before serialization,
including images inherited within drawing frames. In particular, an Image
`contentHash` getter can upload an image blob through its consistency manager.
Its presence must never be dismissed as merely visual.

Pinless drawing frames use the same Symbol `uploadTo` component branch as other
schematic symbols. That method at 6250578..6250772 only sends the symbol's current
consistency data to the supplied encoder, hash
`588054f6c3d04130e5ff0eafff8d8bdf1bbfcfe25d9b1996aff4962c36806a3f`.
Symbol consistency data at 6249535..6249725 copies part ID, pose and common fields,
hash `5e5735580d253846ee80a1461238986bbb462dd5b2bc10eae511222b288e2417`.
The common-field helper at 1921244..1921630 writes only to that new result object
for a schematic model, hash
`71ba3ff796a1f52b2772ae0ed35d979112f417bf5d687af085921a85290b3066`.
Drawing-frame electrical pins, unknown serialized objects and grouped objects
remain refused. Source graphic LINEs are not treated as harmless decoration;
every LINE needs its represented WIRE owner.

Drawing-frame `@Update Date` and `@Update Time` values derive from current page
metadata and can differ from their stored attribute values.
The candidate follows the maintained native-reader convention for those two exact
sheet attributes only. It validates the observed value's date/time shape, key and
owner, then compares the stored consistency-body value. No other attribute or
source field receives timestamp normalization.

## Why a cached-AST replacement was rejected

`getSchPinNet` reads `astPureSheet.typeSymbols` and returns `nlNet[0]` or
`net[0]`. It does not reconstruct native connectivity. The debug export
`getNlSymbolCollects` is `Ua`; even its apparently read-only mode can rewrite
shared `purepins[].nlNet` and global caches. Its range is 6315524..6321345,
hash `705d7fe10559a6c88b13e4ac9b20c5f7335147226fb5bb61b6ea86172713533d`.

Native transaction dispatch starts asynchronous schematic parsing without
awaiting it. Parsing clears `shouldUpdateAst` before awaiting downstream work.
The downstream parser has RPC waits, while compilation publishes the aggregate
AST separately. Therefore matching aggregate counters or repeated cached reads
do not establish that every page's current source is included. This is a source
inference about permitted interleavings, not a reported live race reproduction.
Forcing the parser is also unsuitable as a read-only shortcut because that path
publishes further update events and delegates work outside the reviewed reader.

Key supporting ranges and hashes are `dispatchOnDidTransact`
4769845..4770047,
`0bcb6931ad5990b3fad23cb3c745b69048fbcb94bdc7ef67064992180044d303`;
`parseSchematicSymbolNet` 5645439..5645605,
`46009b95d743e3a9c75c9bc7bfb4fbe61048f09277aa6617aa28e5d8d869eb90`;
`Pg` 6366710..6366980,
`7f3f317a2d420d4d1b25dbfd602a23784557bc0a5932fba033ad4317c2c13b02`;
and `Zw` 3960767..3961742,
`066c5c75ac12599d13ae2b0c3f93515dff82464cf3c263d11c5fc4bed0a15534`.

## Coordinator integration and disposable validation

The pure module does not change any design executor gate. The separate
`schematic-flat-read.ts` coordinator now registers `schematic-flat-topology` as
a diagnostic reader. It implements the membership, declaration, source-pin,
context and repeated-capture checks below, with exact retained checkpoint
receipt/path/hash verification. The normal 4 MiB escaped transport limit and
the checkpoint scope's sixteen-page limit remain. It reports
`transactionTopology:false` and `currentGenerationLiveValidated:false`.

1. Independently read current project and schematic declarations through the
   reviewed `dmt_Project.getCurrentProjectInfo` and
   `dmt_Schematic.getCurrentSchematicInfo` paths. Validate project identity,
   schematic identity, every declared page UUID and parent identity, unique page
   membership, and the exact active ordinary tab. Do not derive completeness from
   `getSchDocs()` alone or from caller-provided page IDs.
2. If transaction authority already includes a complete checkpoint, independently
   derive its active schematic and all nondeleted SCH_PAGE members from each
   page's META record. Require agreement with current public declarations. The
   existing `deriveSchematicLayoutPageLoadScope` demonstrates this checkpoint
   binding; no loading or navigation belongs in the topology reader.
3. Recheck the independent declarations before and after each synchronous capture.
   The capture itself compares loaded native membership with that declared set,
   checks settings and native ownership, and verifies complete endpoint sets.
   Missing pages must fail. There must be no auto-load, compiler refresh or Save.
4. Validate two complete captures and require equal proof hashes, with context and
   installed source pins checked on both sides. These repeated reads supplement
   source/contact coverage; they do not justify trusting a cached AST.
5. Keep the new proof's profile and authority in every transaction artifact.
   Legacy type-1 journals that depended on the withdrawn compiled reader remain
   blocked without a separately reviewed, explicitly matching-profile recovery
   path. Never relabel native results as compiled-cache evidence.
6. On a disposable schematic, verify connected and disconnected pins, multiple
   pages and shared literal names, source/checkpoint invariance across the read,
   and every unsupported-family refusal. Test changed naming settings, missing
   pages, multipart libraries and generated/unnamed wires. Only then consider
   enabling a constrained new transaction path with matching lifecycle proof.

The public API bundle already reviewed by the repository is
`pro-api/0.2.53.aee2f57a/api-types.js`, SHA-256
`4da5b5184a78e2d3aca843dad6b147d7feb7ec1368160d73f49c4acbcf97dfdb`.
The delegated UI bundle is `pro-ui/3.2.149.43637efe/js/ui.js`, SHA-256
`12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a`.
Reuse the maintained whole-file verifiers; declaration presence alone does not
admit those runtime paths.

## Local test evidence and limits

The focused suite has 27 tests. It executes the generated capture against
synthetic native objects, then runs the independent schema and source/contact
verifier. Tests cover stale/missing/foreign contact members, missing pages and
source objects, naming settings, unsupported hierarchy and multipart parts,
no-connect contradictions, omitted electrical attributes, conflicting geometry,
unknown serializers, incomplete page/template initialization, exact frame-timestamp
normalization, and traps that fail if mutating getters execute.

These are unit and synthetic-runtime tests. They do not prove the candidate works
in a connected editor, preserves a live file, handles general schematic designs,
or replaces the old compiled-graph provenance. No such acceptance is claimed.

The coordinator adds eight offline tests for complete scope binding, missing or
conflicting pages, two-sample disagreement, context/profile/quarantine failures,
transport failure and substituted/corrupt checkpoint receipts. The combined
35-test run passes; connected disposable acceptance remains outstanding.
