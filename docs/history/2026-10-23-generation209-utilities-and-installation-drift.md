# Generation209 utilities and installation drift

## Scope and starting state

Candidate plugin: `0.3.0+codex.20261023094500`, based on main
`ee31fa105bfb1f3ab4e8bb9ced0b65230e9a7f28`. This batch follows
[the selected-geometry/startup-PCB release](2026-10-23-selected-geometry-startup-pcb-batch.md).
Its local post-install history addition was preserved. Repository instructions,
human usage and dated findings remain separate; no production project was read,
hashed, opened or edited.

The restarted084000 facade selected offline-only mode because its configured
PCB bundle no longer existed. Independent admission inspection found the
installed plugin unchanged: 1,766files,42directories,36,653,457bytes, inventory
`36b7c557a86a404c926ca0aed8cec28f6cf407911fb0082ef22aff28ae91d79b`.
Actual Node24.18.0 and process selectors agreed with the installed snapshot.
The previous main CI39928774811 passed at09:15:16Z. Application assets changed
around09:17Z to3.2.209; old PCB3.2.193 and API0.3.50 paths were absent. These
observations establish replacement, not who initiated it or whether it was
automatic. No competing facade, hotpatch or live fallback was attempted.

## Implemented batch

- Offline status retains its startup failure code and adds bounded metadata
  diagnostics for the current private configuration, application version,
  selected file roles and available PCB/API directory names. No executable,
  bridge, upstream, credential, design or configuration mutation is involved.
  Candidate names and file presence never establish compatibility. Oversized
  listings return no partial candidate list; unsafe paths and malformed
  versions refuse. Restored files cannot promote the existing offline process.
- A separate `public-utilities-only` catalog registers exactly six tools for
  the new selector pair: API, discover, status, calculate, system and launch.
  Status disables design, navigation, native adapters, Save and recovery.
  Every older native/private/design tool is absent from this catalog, including
  project opening, metadata writers and worker diagnostics.
- Exact209 public-runtime admission supports the existing16bounded Math and
  18Unit/Environment operations. Common facade/upstream/bridge/dispatcher checks
  remain intact. Responses report the actually selected API provenance; offline
  descriptors retain both reviewed generations and no connected-validation claim.
  The shared206 native validator and old global compatibility tuple are unchanged.
- Explicit `--target public-utilities-209` migration accepts only the old206
  or already-selected exact209 pair. It checks the package and four bundle
  hashes repeatedly, preserves an exact private backup and atomically changes
  only the PCB/API selectors. The existing control root, Node, upstream,
  credentials and journals are preserved. The old default migration remains206.
- Ordinary launch selects a separate209 installation profile only in its
  coordinator. The exported old profile and default verifier remain206-only
  for diagnostic consumers. Original selectors are retained through awaits;
  a valid original launch acknowledgment is retained before a later refusal.
  Local inspection remains possible after selector drift. Existing-profile
  startup is not isolated, project-free or a design-readiness proof.
- [Ratline source and finite-role groundwork](2026-10-23-generation209-ratline-capture.md)
  records both complete new assets and12source spans. The old completion flag
  no longer exists. The new supplied-data model grants no original ownership,
  completed callback, baseline, capture, execution or Save authority.

Independent review caught and fixed an unintended Node version subprocess in
the diagnostic wrapper, a launcher acknowledgment-retention gap, a local-inspect
regression and a final synchronous selector-check gap. Utility admission and
migration received a separate independent review. These are source/synthetic
results, not connected209 execution.

## New installation identities and reviewed public source

The private installation paths are intentionally omitted. All sources below
are application-code assets, not user documents.

| Role | Version or bytes | SHA-256 |
| --- | --- | --- |
| App package |3.2.209.8a704eab;248bytes|`c63c12edae82c39c1fb2c0f0dd0e27678b83526c89ea174b3b79655711da8e51`|
| Executable |222,989,936bytes|`8770f2cea950d9483f230f961b486e5ceaeffd619e2c2816957cb6ff3fd0bb38`|
| App bootstrap |2,657,192bytes|`52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c`|
| Startup selector |8,031bytes|`ced74cf98aedf6b04d0f23871b945f4155978d7e35edbc1704b8cdaf566623f9`|
| PCB implementation |3.2.195.6b67774e|`a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b`|
| Public API |0.3.59.1ca9efb5|`e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1`|
| API adapter |0.3.59.1ca9efb5|`d2b384470013c991733c92c281a3f4e440d7c711a62a4dd27b9288d26d9a6cb0`|
| API declarations |0.3.59.1ca9efb5|`0a6910f4108f3d09733a9de9176b20c41ccd2a87fc4e335f8d6d656eb054ba72`|

Public API source spans below are half-open JavaScript UTF-16 offsets, not byte
offsets or accepted debugger breakpoints:

| Source | Start–end | Slice SHA-256 |
| --- | --- | --- |
| Complete local D3/Martinez/Math closure |1852132–1873925|`0b9e51e5a5d631c430adffda953ffe27f37f8f4867ed1849a03aa667cf50a077`|
| Math class |1870166–1873466|`5d0be00ac117a7c4dd2ac3bd9ed736e650a1ebc8b335ab969f80a3d7f35f6a1e`|
| Unit class |1325699–1326063|`e90dbf6aea41f0b55c1762471aacb1ff3c5bd0ac57c62934590b4a1e2e267352`|
| Unit rounding |469727–470065|`fe896a3079ca86085a0540f86653423fae520b0e1da08d24a3c895b34c55e9c6`|
| Environment class |1817202–1817815|`f6e7808f21650245a2736363ae49edb27786c128f0b70fb28b0e1352e582eabf`|
| Current version |471102–471291|`0a8350ec0dc47c9e7157ad3ba0c1f628ca18c16c69cd66e0b2b3ad0352939fd8`|
| Version gte/lte |471474–471664 /471664–471854|`1ec5b0833aaa467a3fd5dd51a6d7713f688f6fd259bb6e6795d43d8c88fac8be` / `a3834dc976d6bd008927c8774c228dbe0ef761f711e74357b2bb4ac8bd2528ca`|
| Compile date |471854–472002|`ec059a5cc5b4074b4f401fa4a90d557c3d776bea9b29782c5bde2d47f6fa1fe2`|

The complete installed declaration slices were also reviewed: Unit1428581–1432730,
Environment1297211–1302124, Math1367782–1383516. Source-extracted VM checks passed
32cases:16Math,6unit conversions and10environment observations. The two version
comparators received source review rather than a new VM case. Clipping retains
bounded inputs, internal scratch/counter changes and possible collapsed-segment
console warnings; no application/bootstrap, bridge, storage or DOM code ran.

Official [Unit documentation](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_unit.html)
describes conversion methods and distinguishes schematic data units from PCB
mil units. [Environment documentation](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_environment.html)
describes runtime metadata; user-info access remains excluded. These pages were
retrieved on2026-10-23. The Math page could not be fetched; no online Math
verification is claimed. Installed declarations and exact implementation are
the Math evidence.

Ordinary startup keeps the byte-identical old app bootstrap. Reviewed spans
include `sz`2652584–2655250, config merge1334400, local module serving2582341
and rewrite2630578. The changed selector and package were read completely;
the native helper still supplies no project arguments and retains original
Windows root/Job handles. This is not an OS/DLL closure or isolation proof.
The official [desktop startup FAQ](https://prodocs.easyeda.com/en/faq/others/#how-do-i-enter-the-command-line-to-start-the-editor)
describes starting the installed executable. The separate
[extension CLI](https://prodocs.easyeda.com/en/api/guide/cli.html) requires4.1.60+
and is not substituted for this3.2.209 launcher.

## Open work after this batch

1. Load the newly installed snapshot in a fresh session and prove its actual
   process/catalog, then validate209 ordinary launch, bridge authentication
   and the bounded public utility operations. None is connected-validated here.
2. Port actual project/PCB initialization and capture to209: original worker
   constructors, bridges, project-channel receiver, publishers, ratline result
   delivery, subordinate completion and dynamic-copper destinations. The model
   does not implement these captures.
3. Join the complete stable PCB/common/move/actor/native/server-clock baseline
   to those retained owners, then implement the fixed create/Save lifecycle,
   terminal completion, full closed SQL/reopened-content and visual acceptance.
4. Port/revalidate older native metadata/geometry workflows before enabling them
   on209. Selected geometry and prior startup-to-PCB additions retain only their
   earlier source/synthetic evidence; the replaced206 installation prevents
   using them as current live validation.
5. Continue the wider API backlog. The earlier inventory has79blocked
   implementations and449documented omissions; new-generation utility admission
   does not complete those families.

### Next declaration and public-read batch

A read-only audit of the exact installed0.3.59 declaration file found844mounted
signatures,811distinct method paths and113namespaces. Of those paths,61are
absent from both bundled declaration snapshots:47source-design methods,
fourproject/document readiness methods,fivePCB auto-job methods andfive
raytracer methods. Adding that separately named snapshot would expand the
current774-method union to835. Against reference0.4.26,109shared paths have
different raw signature sets; lexical differences alone are not semantic
compatibility findings. Keep the older and latest reference snapshots intact.

The next bounded public-read candidates are
[`sys_I18n.getAllSupportedLanguages`](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_i18n.getallsupportedlanguages.html),
[`sys_I18n.isLanguageSupported`](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_i18n.islanguagesupported.html)
and [`sys_Window.getViewportSize`](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_window.getviewportsize.html).
The reviewed installed closures copy/check a fixed52-language list or return
page viewport dimensions; they do not establish current connected support.
Preserve exact case-sensitive language matching and bounded finite dimensions,
and never label page dimensions as PCB or OS geometry. `sys_Help.help` is not
a no-network candidate: its installed implementation reads or fetches schema
files. This audit changed no code, application or project state.

## Verification and publication

Implementation and independent focused reviews are complete. The frozen build,
full required suite, exact-payload CI, publication, profile migration and official
marketplace installation are pending at this entry. Later results will be
appended without rewriting that boundary. No native/application launch occurred.

The first package check rejected the shortened manifest description because it
omitted the required explicit legacy typed-API/runtime-disabled and connected-read
boundary wording. That wording was restored, not the validator relaxed. A review
also found206-only leading labels in the generated utility coverage; the source
now lists both exact generations and the new profile/test provenance. The first
full suite was deliberately stopped before these source changes and is retained
as an incomplete, superseded run, not a passing final-payload result. Only the
owned verification process group was stopped; the offline host remained intact.

### First frozen verification result

Payload `8d82f348f673d173cb13e007225294ed01fefcf1` failed final local facade
verification:12,395tests,12,386passes,fivefailures,fourskips. CI39935001855
also found the stale calculation-scope assertion and three ordinary-launch
VM-fixture failures. The assertion still required the former206-only wording;
the VM fixture lacked the newly imported profile selector and injected verifier.
These are test integration defects, not passing evidence for this payload.

The fifth local failure was the unchanged packet reader's1,000ms wall-clock
guard, with the final exception stack identifying `budget` during UTF-8 size
checking. A single isolated run passed allfourpacket tests. Local default
file concurrency followed the32available CPUs; `npm test` now caps it atfour
to reduce contention. CI keeps its existing one-file-per-shard bound. No
production deadline, packet limit or test assertion was weakened. The corrected
payload requires a new frozen verification and exact-payload CI run.
