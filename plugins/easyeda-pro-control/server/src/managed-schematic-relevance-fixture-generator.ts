import { createHash, randomBytes } from "node:crypto";
import { qualifyManagedFixtureArchive } from "./managed-fixture-archive.ts";
import { readManagedLibraryZip } from "./managed-library-files-zip.ts";
import { packManagedFixtureArchive } from "./managed-fixture-zip.ts";
import { MANAGED_SCHEMATIC_FIXTURE_PROFILE, generateManagedSchematicFixtureArchiveData } from "./managed-schematic-fixture-generator.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const MANAGED_SCHEMATIC_RELEVANCE_FIXTURE_KIND = "schematic-text-wire-bus-relevance";
/** Parent is filled with the fresh source WIRE ID. Only Wire has the native
 * default Relevance attribute. BUS has isWire false and gets no such child. */
export const MANAGED_SCHEMATIC_RELEVANCE_ATTRIBUTE = freezeDeep({ groupId: 0, locked: false, zIndex: 1,
  key: "Relevance", value: "[]", keyVisible: false, valueVisible: false, x: 0, y: 0, rotation: 0,
  color: "#000000", fillColor: null, fontFamily: "Arial", fontSize: 20, strikeout: false, underline: false,
  italic: false, fontWeight: false, align: "LEFT_TOP", version: "2.0" });
export const MANAGED_SCHEMATIC_RELEVANCE_FIXTURE_PROFILE = freezeDeep({
  schema: "easyeda-pro-control.sch209-relevance-fixture-template.v1", base: MANAGED_SCHEMATIC_FIXTURE_PROFILE,
  managerMethods: [
  {
    "name": "vF.onAttr",
    "start": 1_508_734,
    "end": 1_509_069,
    "sha256": "4c5fe595effb50c5f4d85ab522a02687c4be21afc8bf47bcbba6d43db8a1f79a"
  },
  {
    "name": "DF.encodeAttr",
    "start": 1_502_431,
    "end": 1_502_499,
    "sha256": "748abc14e56b230036b70515c22c71a4e6c719786889ba21c3d47bbd7f451112"
  }
],
  native: [
  {
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
    "bytes": 6_289_622,
    "sha256": "e7fdbc30cadd14fb87c5a50d2c5563241b4cf373d6eea8f7d0c9e7e59588d72c",
    "methods": [
      {
        "name": "NetGroup.constructor",
        "start": 3_911_143,
        "end": 3_911_439,
        "sha256": "7558f047a9f72fde681eee46fd0d0c499184f5ec17fa49bb23223a357b2c1af6"
      },
      {
        "name": "NetGroup.get:isWire",
        "start": 3_915_337,
        "end": 3_915_376,
        "sha256": "8817b9db8716637543624a8ea7c0507399cfc69d3c1b24f86df20f6149eea195"
      },
      {
        "name": "NetGroup.onChildChange",
        "start": 3_916_480,
        "end": 3_916_872,
        "sha256": "5b8f17dd15628cc97b9e715b9f01b82f29dfa8aa306b57ba3babd4ff5d08c0e1"
      },
      {
        "name": "Container.constructor",
        "start": 1_739_560,
        "end": 1_739_695,
        "sha256": "7c974bd8b2f79ac5ed5bc794f5e195e5639c7afbfd6c106849c5a113e0a86b9e"
      },
      {
        "name": "Container.get:visible",
        "start": 1_739_906,
        "end": 1_739_941,
        "sha256": "335c6409536336c1a4a8ef194ae4f6ad8c45ae3d8d6a757d85a5c6e7973215fa"
      },
      {
        "name": "Container.appendChild",
        "start": 1_742_155,
        "end": 1_742_215,
        "sha256": "6e1fcc3f7bf6a08e71ffb8f02308900e46c74da49c917d93c386c89f162cc43c"
      },
      {
        "name": "Container.handleInsertChild",
        "start": 1_741_713,
        "end": 1_742_135,
        "sha256": "06c903cb63cbdaed92ae53158b9363dc285cdb744ce3ae6cd8a6f7a16b2994a7"
      },
      {
        "name": "Container.handleRemoveChild",
        "start": 1_741_299,
        "end": 1_741_713,
        "sha256": "ad54f20a620a2d738bf48d35a9b26189cd57351f8fd8d83c112972c5e6536806"
      },
      {
        "name": "Container.onChildZIndexChange",
        "start": 1_740_207,
        "end": 1_740_471,
        "sha256": "26168bcd4b2f5979f402e6e93d4adf3a6da6f667e586bde2977dab71bb14e9c5"
      },
      {
        "name": "Container.onChildChange",
        "start": 1_742_135,
        "end": 1_742_155,
        "sha256": "c2e3dc641874e1de8e9f2e84602f6eabbbc3420d094b94dac3ce3294b200a6c3"
      },
      {
        "name": "Model.constructor",
        "start": 1_731_082,
        "end": 1_731_292,
        "sha256": "73700a504542f241c82a9dc9a1da1ea1333c0ccf1776a5966540a8cc2d5d8a1d"
      },
      {
        "name": "Model.get:parent",
        "start": 1_732_764,
        "end": 1_732_797,
        "sha256": "86021a24c76d9ee4c0d4dc7dd9c6f5289e60c29dab20b0ddefd0762987b40536"
      },
      {
        "name": "Model.set:parent",
        "start": 1_732_797,
        "end": 1_733_056,
        "sha256": "ef4fad93c63453f248efba3dd07ef5955606cebc693307b24e895e67b3e31543"
      },
      {
        "name": "Model.get:visible",
        "start": 1_737_716,
        "end": 1_737_751,
        "sha256": "1642b65fd3340fe4ca30b3f38a490ae1294740e8b0cdfa3ae18bbe860cb4b335"
      },
      {
        "name": "Model.remove",
        "start": 1_739_084,
        "end": 1_739_138,
        "sha256": "72da2c6098f92eaf811ec1ae84886d9cd622b477a522b0e9ddd3bc45b2f0ca21"
      },
      {
        "name": "Model.onConnectedChange",
        "start": 1_734_641,
        "end": 1_735_089,
        "sha256": "f13eb30534d490112f34de0bc94cc4127acb6b9f0fa22cc581a907965678d916"
      },
      {
        "name": "Model.onParentChange",
        "start": 1_733_150,
        "end": 1_733_203,
        "sha256": "8e27df65ed8bf9a27994db16125275ef9e3280704511d4b5e2105b9f965abf1c"
      },
      {
        "name": "NetName.isKey",
        "start": 3_928_396,
        "end": 3_928_455,
        "sha256": "1e2f28fb434cb65edaf03199851653c120e7beeccdd5548af0415968f18637b9"
      },
      {
        "name": "Decoder.handleModelData",
        "start": 4_432_829,
        "end": 4_433_039,
        "sha256": "1b1603f8308b90c55b62710ff3e451f61fc36278f1a12cb0e5e43aae541e5eb6"
      },
      {
        "name": "Decoder.modifyCustomAttr",
        "start": 4_433_039,
        "end": 4_433_326,
        "sha256": "34783ace83b76875c91d4dee535015a339bdf5f3da06d0c5a87e88f3aab29df3"
      },
      {
        "name": "Decoder.tryAddNetGroupAttr",
        "start": 4_441_705,
        "end": 4_441_941,
        "sha256": "963d0bce76d3dba9054326998be483f41b21373d0bb8b455427e740202c8ea4d"
      },
      {
        "name": "Decoder._handleAttrOrNetName",
        "start": 4_442_730,
        "end": 4_443_306,
        "sha256": "ad8544c1e6b160499db08ed284615d44eb7ba88cbb413eff9c3db3d102ef122c"
      },
      {
        "name": "NetGroupDecoder.commit",
        "start": 4_443_306,
        "end": 4_444_140,
        "sha256": "b58cc7aebad6948327015c6469d1adec791f30f81ac2b5ec5c40125cef489bf5"
      },
      {
        "name": "predicate.jr",
        "start": 1_691_373,
        "end": 1_691_419,
        "sha256": "cae4fb1a273ef684262172e3a7b8c91edf9c6bf39a6599385efebcb0e1fff771"
      },
      {
        "name": "predicate.vr",
        "start": 1_691_272,
        "end": 1_691_324,
        "sha256": "8555e9b6c80f9b8130e8450013f65972a1b1e9dcfa64665f9616056961bd2635"
      },
      {
        "name": "predicate.Sn",
        "start": 1_691_465,
        "end": 1_691_512,
        "sha256": "511a1f21d16ee66cf78743f8288e25cb27cb86ef8aa08e6d0477cb71d3745f15"
      },
      {
        "name": "predicate.rm",
        "start": 1_692_049,
        "end": 1_692_103,
        "sha256": "57605df7c5bf0bf89af099040703d129c35540ac98adec3ea4a191ba9f2010ee"
      }
    ]
  },
  {
    "relativePath": "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
    "bytes": 6_472_538,
    "sha256": "b88ad265bb2bc7febb90af92a6f37189b3f90be7cd1f1427522c8f2435dfb4bd",
    "methods": [
      {
        "name": "NetGroup.constructor",
        "start": 3_964_788,
        "end": 3_965_084,
        "sha256": "7558f047a9f72fde681eee46fd0d0c499184f5ec17fa49bb23223a357b2c1af6"
      },
      {
        "name": "NetGroup.get:isWire",
        "start": 3_968_982,
        "end": 3_969_021,
        "sha256": "8817b9db8716637543624a8ea7c0507399cfc69d3c1b24f86df20f6149eea195"
      },
      {
        "name": "NetGroup.onChildChange",
        "start": 3_970_125,
        "end": 3_970_517,
        "sha256": "78a1b8b5d09354cf6b3d152b1a7529da2a2665f7b61657a59e58951ffdba49f6"
      },
      {
        "name": "Container.constructor",
        "start": 1_936_114,
        "end": 1_936_249,
        "sha256": "7c974bd8b2f79ac5ed5bc794f5e195e5639c7afbfd6c106849c5a113e0a86b9e"
      },
      {
        "name": "Container.get:visible",
        "start": 1_936_460,
        "end": 1_936_495,
        "sha256": "335c6409536336c1a4a8ef194ae4f6ad8c45ae3d8d6a757d85a5c6e7973215fa"
      },
      {
        "name": "Container.appendChild",
        "start": 1_938_709,
        "end": 1_938_769,
        "sha256": "6e1fcc3f7bf6a08e71ffb8f02308900e46c74da49c917d93c386c89f162cc43c"
      },
      {
        "name": "Container.handleInsertChild",
        "start": 1_938_267,
        "end": 1_938_689,
        "sha256": "06c903cb63cbdaed92ae53158b9363dc285cdb744ce3ae6cd8a6f7a16b2994a7"
      },
      {
        "name": "Container.handleRemoveChild",
        "start": 1_937_853,
        "end": 1_938_267,
        "sha256": "ad54f20a620a2d738bf48d35a9b26189cd57351f8fd8d83c112972c5e6536806"
      },
      {
        "name": "Container.onChildZIndexChange",
        "start": 1_936_761,
        "end": 1_937_025,
        "sha256": "26168bcd4b2f5979f402e6e93d4adf3a6da6f667e586bde2977dab71bb14e9c5"
      },
      {
        "name": "Container.onChildChange",
        "start": 1_938_689,
        "end": 1_938_709,
        "sha256": "c2e3dc641874e1de8e9f2e84602f6eabbbc3420d094b94dac3ce3294b200a6c3"
      },
      {
        "name": "Model.constructor",
        "start": 1_927_636,
        "end": 1_927_846,
        "sha256": "3fd73007271c815bdde9543e1009e67dfb83d39764163db00ac92f61fc8180e0"
      },
      {
        "name": "Model.get:parent",
        "start": 1_929_318,
        "end": 1_929_351,
        "sha256": "86021a24c76d9ee4c0d4dc7dd9c6f5289e60c29dab20b0ddefd0762987b40536"
      },
      {
        "name": "Model.set:parent",
        "start": 1_929_351,
        "end": 1_929_610,
        "sha256": "ef4fad93c63453f248efba3dd07ef5955606cebc693307b24e895e67b3e31543"
      },
      {
        "name": "Model.get:visible",
        "start": 1_934_270,
        "end": 1_934_305,
        "sha256": "1642b65fd3340fe4ca30b3f38a490ae1294740e8b0cdfa3ae18bbe860cb4b335"
      },
      {
        "name": "Model.remove",
        "start": 1_935_638,
        "end": 1_935_692,
        "sha256": "72da2c6098f92eaf811ec1ae84886d9cd622b477a522b0e9ddd3bc45b2f0ca21"
      },
      {
        "name": "Model.onConnectedChange",
        "start": 1_931_195,
        "end": 1_931_643,
        "sha256": "f13eb30534d490112f34de0bc94cc4127acb6b9f0fa22cc581a907965678d916"
      },
      {
        "name": "Model.onParentChange",
        "start": 1_929_704,
        "end": 1_929_757,
        "sha256": "8e27df65ed8bf9a27994db16125275ef9e3280704511d4b5e2105b9f965abf1c"
      },
      {
        "name": "NetName.isKey",
        "start": 4_293_048,
        "end": 4_293_107,
        "sha256": "1e2f28fb434cb65edaf03199851653c120e7beeccdd5548af0415968f18637b9"
      },
      {
        "name": "Decoder.handleModelData",
        "start": 4_655_598,
        "end": 4_655_808,
        "sha256": "1b1603f8308b90c55b62710ff3e451f61fc36278f1a12cb0e5e43aae541e5eb6"
      },
      {
        "name": "Decoder.modifyCustomAttr",
        "start": 4_655_808,
        "end": 4_656_095,
        "sha256": "34783ace83b76875c91d4dee535015a339bdf5f3da06d0c5a87e88f3aab29df3"
      },
      {
        "name": "Decoder.tryAddNetGroupAttr",
        "start": 4_664_474,
        "end": 4_664_710,
        "sha256": "6fa61bff188b92c1a30ac19c018415d005571348e1c70dc367897e379644e795"
      },
      {
        "name": "Decoder._handleAttrOrNetName",
        "start": 4_665_499,
        "end": 4_666_075,
        "sha256": "d99f517adaece13c38738a8084ef1b8d12ed871832e5538d7235cfaa8d763a5c"
      },
      {
        "name": "NetGroupDecoder.commit",
        "start": 4_666_075,
        "end": 4_666_909,
        "sha256": "6e4d06929d777e61d0480a074741dd474fcc83178f20e47b681b069f3ec54190"
      }
    ]
  }
],
  sourceWireRelevanceAttributes: 1, sourceBusRelevanceAttributes: 0, sameKeySourceAttributeReplacesDifferentIdDefault: true,
});
/** Transform only the newly generated in-memory data, never an existing
 * archive, SQLite file or original fixture result. Earlier v1 stays unchanged. */
export function generateManagedSchematicRelevanceFixtureArchiveData(): Readonly<{ name: string; bytes: Buffer; metadata: Readonly<Record<string, unknown>> }> {
  const base = generateManagedSchematicFixtureArchiveData(), original = qualifyManagedFixtureArchive(base.bytes);
  const source = readManagedLibraryZip(base.bytes).get(original.source.member);
  if (source === undefined) { throw new Error("Fresh schematic source member missing."); }
  const suffix = original.manifest.title.slice("Codex_schematic_".length), title = `Codex_schematic_relevance_${suffix}`;
  const attrId = `0${randomBytes(8).toString("hex").slice(1)}`, wireId = base.metadata["wireId"];
  if (typeof wireId !== "string" || !/^0[a-f0-9]{15}$/u.test(wireId) || Object.values(base.metadata).includes(attrId)) { throw new Error("Fresh schematic Relevance identities differ."); }
  const { groupId, locked, zIndex, ...fields } = MANAGED_SCHEMATIC_RELEVANCE_ATTRIBUTE;
  const body = { groupId, locked, zIndex, parentId: wireId, ...fields };
  const attr = `${JSON.stringify({ type: "ATTR", ticket: 7, id: attrId })}||${JSON.stringify(body)}|\n`;
  const bytes = packManagedFixtureArchive(Buffer.from(JSON.stringify({ title, cbb_project: false, editorVersion: "3.2.209" })), Buffer.concat([source, Buffer.from(attr)]));
  const profileText = JSON.stringify(MANAGED_SCHEMATIC_RELEVANCE_FIXTURE_PROFILE), qualification = qualifyManagedFixtureArchive(bytes);
  return Object.freeze({ name: `${title}.epro2`, bytes, metadata: Object.freeze({ ...base.metadata,
    schema: "easyeda-pro-control.generated-schematic-relevance-fixture-archive.v1", fixtureKind: MANAGED_SCHEMATIC_RELEVANCE_FIXTURE_KIND, title,
    wireRelevanceAttrId: attrId, sourceTemplateProfile: MANAGED_SCHEMATIC_RELEVANCE_FIXTURE_PROFILE,
    sourceTemplateProfileSha256: createHash("sha256").update(profileText).digest("hex"), archiveSha256: qualification.archiveSha256,
    qualificationSha256: qualification.qualificationSha256, sourceWireRelevanceAttributes: 1, sourceBusRelevanceAttributes: 0,
    nativeDefaultAttributeReplacementVerified: false, completeSourceVerified: false, executionAuthorized: false }) });
}
