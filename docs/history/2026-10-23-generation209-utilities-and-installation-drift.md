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

## Final publication and installation — 2026-10-23

The corrected frozen payload `f87b66225680528ccb5a3cd4bd1cefaab6c6c8fd`
passed the complete required verification. Local facade results were 12,391
passes, four skips and zero failures; all 424 bridge tests passed. Strict types,
type-aware lint, generated coverage, compatibility, repository/privacy, plugin
and all seven skill validators passed. The final rebuild reproduced both
committed bundles without a diff. The complete local verification log has
SHA-256 `4b220fee89088657c7356792b3e01575c63a8a45b884ac1a027b656598f0b5b7`.

Exact-payload CI39936701092 passed all eight facade shards and required
`test-build`: 12,390 passes, five platform/source skips and zero failures.
Its build job also passed 424 bridge tests. Windows CI39936701205 passed.
[PR103](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/103)
merged through protected main at10:37:27Z as
`722c4ae6aeeab35d0cdf9bdc29193f2f5ff05d35`. No protection was bypassed.
The batch changed 42 files. Main CI39940421645 was still running at the
installation handoff; main Windows CI39940421622 had passed. The plugin tree
is identical to the fully tested PR payload.

The official Git marketplace remains
`https://github.com/jan-guenter/easyeda-pro-agent-plugin.git`, ref `main`.
Its refreshed HEAD equals the merged commit. Official installation and listing
confirm `0.3.0+codex.20261023094500` installed and enabled. Independent inspection
verified all 1,774 files, 42 directories, 36,754,986 bytes and exact modes:

- Plugin tree: `ab7e8fcb1ca4fd3986d59a08772054666c56bec4`.
- File inventory: `dff6efe0e669a313eef4bb9854f6c1e7dda4bac0c0f8f839e5b15a7f4fe36e20`.
- Facade source: `4832ab1301bf810eb0f977973013ae416f8ff59013f6f8e6e48c748765c6b478`.
- Server bundle: `11bd1b04dddb760e8be65740f73fb1c0a557b22c97081f419a2cbccc5ce4341a`.

The installed dependency-free probe passed 26 tools and ten queries under its
private synthetic206 profile, with clean EOF, no stderr, no upstream execution
and no non-stdio sockets in its samples. This is package verification, not
admission of the actual host or connected209 validation. The new209 six-tool
registration passed the separate bundled-startup regression.

### Installer anomaly and successful recovery

The first official add reported success, but subsequent listing and independent
inspection found no installed version and an empty cache parent. Those CLI
calls ran inside the repository, which exports a local marketplace with the
same name as the configured Git marketplace. A neutral-directory listing
resolved the expected Git source and showed the candidate as available but not
installed. Only after confirming that absence, the official add was repeated
from the private neutral directory. Subsequent neutral-directory listing,
independent byte/mode verification and the installed probe all succeeded.

The working-directory/source collision is a supported hypothesis, not a proved
internal CLI cause; the failed first installation claim is retained here.
No cache files were manually created, repaired or edited. Future maintenance
should resolve the configured Git source from a neutral directory and verify
its installed bytes, not rely on installer stdout. The
[official plugin documentation](https://developers.openai.com/plugins/build/plugins)
describes local and Git marketplace sources, cache installation and source
resolution; it does not establish the cause of this observed anomaly.

### Completed profile migration and restart boundary

The explicit reviewed `--target public-utilities-209` migration completed once
after successful installed-payload verification. It retained an exact private
mode0600 backup. Independent post-comparison proved only these values changed:

- PCB selector: `3.2.193.682ed44e` → `3.2.195.6b67774e`.
- Public API selector: `0.3.50.ab46409c` → `0.3.59.1ca9efb5`.

Previous profile SHA-256:
`d935c7a418320dfbebcf4bedeb96328645dcd9862944de78a6bfb54d1c98ceb7`.
New profile SHA-256:
`a080fa71eb45454bd4f53721803f01bdde6ddb5f30eff54650d20afe70a7cb67`.
All other configuration fields were unchanged. No credential, journal,
application or design action occurred. The old084000 offline facade was not
promoted, replaced or terminated; no live calls followed installation.

A fresh Codex session is required to load094500 and prove its actual process
and six-tool catalog before ordinary launch or utility calls. Do not repeat
the completed migration, install or pure package probe as live acceptance.
These post-release observations remain a local history append for the next
substantive batch; they do not change the installed Git payload.

## Follow-on research: public routes before more native machinery

The new declaration inventory is not a new working implementation inventory.
Read-only inspection of the exact209 API found 18 immediate `INTERNAL_ERROR`
stubs: all 15 methods in `dmt_SourceBoard/Pcb/Project/Schematic`, plus
`sch_SourceDrc.check`, `sch_SourceNet.getConnections` and
`sch_SourceNetlist.getNetlistInRegion`. The other 29 new source-design methods
and four readiness methods have RPC wrappers, but their inspected routes are
absent from the installed UI dispatch registry and current manager/schematic
implementations. This is a concrete source blocker, not a connected test.
The [project readiness contract](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_project.waitforready.html)
specifies EDA4.1.79; source declarations identify4.1.83. Virtual-open is a stub
here and its documented shared storage would not provide project isolation.

Evidence uses the API hash above. UTF-16 spans: document-tree stubs
1323589–1324803; connectivity stubs1625069–1625345; source RPC transport
1619950–1623670; readiness wrappers at427084 and1317470. Current UI
`3.2.198.2800f583` has SHA-256
`3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6`;
its inspected public dispatch registry is17440000–17446000. These offsets are
research locations, not qualified debugger breakpoints or execution authority.

Useful next209 work is a bounded public-library batch alongside the three
language/viewport candidates above:

1. `lib_Footprint.get`: reuse the strict library-operation descriptor and
   metadata result handling, with explicit footprint and library IDs. Add
   separately pinned209 admission; do not enable the legacy executor wholesale.
2. `lib_Symbol.get`: existing descriptor/executor code is reusable, but its UI
   getter constructs a document manager to enumerate subparts. Qualify that
   callback lifecycle and report cache observations honestly. The shared cache
   has a30-second TTL; matching repeated samples are not independent freshness.
3. `lib_Symbol.getRenderImage`: add a fixed Blob/PNG adapter and managed image
   evidence, without weakening the existing File-only export contract. Initially
   omit `subPartName`: unknown names silently fall back to the first part.
   Rendering starts an unawaited image-cache write and lacks an image-error
   completion handler, so one outstanding request and retained late-result
   handling are required. No blind timeout retry. Footprint rendering needs a
   separate hidden-preview-iframe lifecycle and is outside this first batch.

Current UI source locations: footprint getter17391335–17391793; symbol getter
17378332–17378842; symbol render17381438–17382041 and generator15572268;
image-cache persistence15554624→15554159; shared cache6155715. Public API
wrappers are at1341604,1331670 and1333416 respectively. Complete the exact
component-GET backend branch review before admitting external library calls:
getters can reach local or remote services and may initialize local libraries.
No public-method name alone establishes a pure or project-independent read.

For PCB work, the smallest useful native milestone is a new209-only disposable
startup capture through actual ratline result delivery and original-owner
cleanup—not another observer-only release or a Save route. It needs reviewed
project/UI/opening/context sources, fixed executable capture locations, actual
Worker/bridge/onmessage and project-canvas receiver bindings, a closed
role-aware runner and native encoder. Preserve the existing256-request purpose;
give the new purpose its own generated budget. Batch these prerequisites before
publishing. Full common/source/SQL baseline and create/Save remain later work;
dynamic-copper completion is required before claiming complete startup, but not
for an explicitly partial ratline-result capture. No research here executed the
application or changed a project.
