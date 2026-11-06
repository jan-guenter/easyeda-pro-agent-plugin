/** Fixed new Component plus its complete local footprint data. This is
 * archive generation, not a native cache/importability/geometry assertion. */
import { createHash, randomBytes } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { qualifyManagedFixtureArchive } from "./managed-fixture-archive.ts";
import { packManagedFixtureArchive } from "./managed-fixture-zip.ts";
import { MANAGED_PAD_FIXTURE_BODY, MANAGED_PAD_FIXTURE_PROFILE } from "./managed-pad-fixture-generator.ts";

export const MANAGED_COMPONENT_FIXTURE_KIND = "component-circular-smt-pad";
export const MANAGED_COMPONENT_FIXTURE_FIELDS = Object.freeze(["partitionId", "groupId", "layerId", "x", "y", "angle", "attrs", "locked", "zIndex", "specialColor", "layerIdReplacements"]);
export const MANAGED_COMPONENT_FIXTURE_BODY = freezeDeep({ partitionId: "", groupId: 0, layerId: 1, x: 0, y: 0, angle: 0,
  attrs: {}, locked: false, zIndex: null, specialColor: null, layerIdReplacements: {} });
export const MANAGED_COMPONENT_FIXTURE_ATTRIBUTE_FIELDS = Object.freeze(["partitionId", "groupID", "parentId", "layerId", "x", "y", "key", "value", "keyVisible", "valueVisible", "fontFamily", "fontSize", "strokeWidth", "bold", "italic", "origin", "angle", "reverse", "expansion", "mirror", "locked", "zIndex", "specialColor"]);
/** GroupID is the actual current ATTR codec spelling. sb.feed reads groupId;
 * both missing groupId and numeric zero resolve to no group through Xa. */
export function managedComponentFixtureHiddenAttribute(parentId: string, key: "Footprint" | "Designator", value: string): Readonly<Record<string, unknown>> {
  if (!(parentId === "" || /^[a-f0-9]{16}$/u.test(parentId)) || !(key === "Footprint" || key === "Designator") ||
    typeof value !== "string" || value.length === 0 || value.length > 64 || !value.isWellFormed()) { throw new Error("Generated Component attribute data differs."); }
  return freezeDeep({ partitionId: "", groupID: 0, parentId, layerId: 3, x: null, y: null, key, value, keyVisible: false, valueVisible: false,
    fontFamily: "default", fontSize: 50, strokeWidth: 8, bold: false, italic: false, origin: "LEFT_BOTTOM", angle: 0, reverse: false, expansion: 0, mirror: false,
    locked: false, zIndex: null, specialColor: null });
}
export const MANAGED_COMPONENT_FIXTURE_FOOTPRINT_META = freezeDeep({ title: "DisposableCircularPad", description: "", source: "", tags: [] });
export const MANAGED_COMPONENT_FIXTURE_PROFILE = freezeDeep({ schema: "easyeda-pro-control.pcb209-component-circular-pad-fixture-template.v1",
  pad: MANAGED_PAD_FIXTURE_PROFILE, files: [
  {
    "relativePath": "pro-pcb/3.2.195.6b67774e/js/pcb.js",
    "bytes": 10_991_441,
    "sha256": "a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b",
    "methods": [
{
  "name": "np.getAlign",
  "start": 4_029_699,
  "end": 4_029_983,
  "sha256": "b7799071282612da12c0ddd9fb949b5347bd80832078db1641db6002ba5913e7"
},
{
  "name": "Tl.enum",
  "start": 2_767_794,
  "end": 2_768_065,
  "sha256": "054cfba5993342e89f0b424248adba870623e7219fadd689e0c364f2221d2afc"
},
      {
        "name": "Jg.getCOMPONENT",
        "start": 4_003_993,
        "end": 4_004_308,
        "sha256": "70cefe28aaff6eb2918f18d589327bb413aa506c39bf20fbf5679dc4f57fac86"
      },
      {
        "name": "Jg.getATTR",
        "start": 4_003_061,
        "end": 4_003_627,
        "sha256": "f4bfcf41ce711df1bc66fcadf15bc98ae7cbaac46e526696b7b0ed131dce9275"
      },
      {
        "name": "uF.constructor",
        "start": 4_194_347,
        "end": 4_194_469,
        "sha256": "75fb01ca090baecb85830c7be9c0ca8265c3c8967030838890b5217d2e3c666a"
      },
      {
        "name": "uF.feed",
        "start": 4_194_469,
        "end": 4_194_934,
        "sha256": "26a4440c7ffbe1921ed3fbdb5974fe380ee373a09f6da789b0b239b699653eb1"
      },
      {
        "name": "uF.check",
        "start": 4_195_237,
        "end": 4_195_366,
        "sha256": "7700872561148ba5e81d29b165baa99c45ffc57791ec65f2f1717704dee261b3"
      },
      {
        "name": "uF.getFootprint",
        "start": 4_195_440,
        "end": 4_195_767,
        "sha256": "15a58f9bca4184b0ca0764a8f621d8d78ab12dad2a24cfbdcbed5ef999495a0e"
      },
      {
        "name": "uF.canBuild",
        "start": 4_195_943,
        "end": 4_196_035,
        "sha256": "d48d3c02456292f8901af600e198091ae1712771af97a90d3cd8c33d972aa835"
      },
      {
        "name": "uF.filterAttr",
        "start": 4_196_035,
        "end": 4_196_206,
        "sha256": "53594726e5798370774a24c97f570ca7911753bc3c4dd5e1a7c0e75952533fc2"
      },
      {
        "name": "uF.finish",
        "start": 4_196_206,
        "end": 4_198_625,
        "sha256": "00b36c16077d11ce9863d024afc157e29353286ee01dd10474136598415cc383"
      },
      {
        "name": "uF.addAttribute",
        "start": 4_195_863,
        "end": 4_195_909,
        "sha256": "d74f32d1962bb83c7ff3f3b500bd0e998089a78c1cc7c0b5aa757c9ecb3799bd"
      },
      {
        "name": "Dm.add",
        "start": 4_313_408,
        "end": 4_313_624,
        "sha256": "4866f025b3608313431b42210399992b4e8d2c92fcfe6afff7e79af945360640"
      },
      {
        "name": "Dm.getItem",
        "start": 4_314_710,
        "end": 4_314_755,
        "sha256": "bb30d9492f33465dbca295c37e75090a6fca166418b27384a08e5e3b32bbd80b"
      },
      {
        "name": "lC.constructor",
        "start": 4_301_691,
        "end": 4_302_065,
        "sha256": "b8c51a723bb111230b81df266817ff4fb4fc5e5d141bf581cb9fb87b6f80ad31"
      },
      {
        "name": "lC.parse",
        "start": 4_302_929,
        "end": 4_303_598,
        "sha256": "855bef6dcab78661715dcefe7725f518ecab828ee0f16021cd4cc48f1b980005"
      },
      {
        "name": "lC.attrHandle",
        "start": 4_304_525,
        "end": 4_305_091,
        "sha256": "cf7bd4d9eb65211a38c1d7c5144ddbf2e8ba6bea6277bd7b7e20e19e3e56309d"
      },
      {
        "name": "lC.clone2Template",
        "start": 4_305_720,
        "end": 4_306_195,
        "sha256": "29d16dc6eba5b74049a8464363f48eac4f3288ea7ea73f01f4b96c805956f29f"
      },
      {
        "name": "lC.formatParseBuild",
        "start": 4_306_195,
        "end": 4_306_786,
        "sha256": "0ebc100158633356ff219f1ad2165c17c75d7c453842eb149a992a17c92f7aa4"
      },
      {
        "name": "lC.rebuildComponent",
        "start": 4_302_827,
        "end": 4_302_929,
        "sha256": "a2224f0831f6c891c5aa50199643d48fbc4ae652bd2ef75db8d0582943982bc0"
      },
      {
        "name": "lC.updateBBox",
        "start": 4_303_854,
        "end": 4_304_158,
        "sha256": "90c7b9030195cec773cabc64ccf4a1031cc1dc998ec4aa166cee6f65ce30ae61"
      },
      {
        "name": "lC.recordLayeredBbox",
        "start": 4_304_158,
        "end": 4_304_350,
        "sha256": "22ac80a9d72f6b02d6d0542bdcf1970a0f9994a8c0f4046eb587b6559ab7c977"
      },
      {
        "name": "sb.feed",
        "start": 4_032_124,
        "end": 4_033_025,
        "sha256": "1f8b7c7d2855bb0449abf3eb8f053343aea27e6fed3f746669da2c83b5463f97"
      },
      {
        "name": "sb.check",
        "start": 4_033_025,
        "end": 4_033_481,
        "sha256": "128a644b63af80eca716aba3df96d798acccfda4e429ac9b75d3cac2681f1034"
      },
      {
        "name": "sb.finish",
        "start": 4_033_481,
        "end": 4_034_323,
        "sha256": "a4ef4a015f1c107df55c4a125745cc518f8d77deeaa7115393cfd2fb38bcbcd5"
      }
    ]
  },
  {
    "relativePath": "pro-mgr/3.2.185.bf63a159/js/pro-mgr.js",
    "bytes": 2_196_424,
    "sha256": "b3260ec9d98d6cad5f65a6234aa839b32f6bf5954cb03de0bd6ce003577b388d",
    "methods": [
      {
        "name": "Xa.onDocHead",
        "start": 1_521_760,
        "end": 1_524_826,
        "sha256": "16bf27792379b83ca4575c9d29a0af5340abb6bafbdc5ae76dd4e788952d49d6"
      },
      {
        "name": "Xa.parseFootprint",
        "start": 1_531_653,
        "end": 1_532_244,
        "sha256": "e635da30572514b8845a2e2a3d44aec3f8c7fc94fe0cd01e0d35d2a7348ac892"
      },
      {
        "name": "Xa.parsePcb",
        "start": 1_529_452,
        "end": 1_530_556,
        "sha256": "6d1488a2ec2bb3c5edabc100d6d79bbc11ba977b25b39e78cdfe705f585c4605"
      },
      {
        "name": "Qr.upload",
        "start": 1_965_585,
        "end": 1_966_177,
        "sha256": "fce4a94d5fb36c15229601fb6aefaf2e3963c0a542c022160c9d4a170ea44f2b"
      },
      {
        "name": "Qr.buildStructure",
        "start": 1_947_499,
        "end": 1_947_768,
        "sha256": "7b71833cafddd70d5e503c953de3240333996ce26268d298029fc69dce37d88a"
      }
    ]
  }
],
  completeSourceDocuments: ["FOOTPRINT", "PCB"], explicitHiddenFootprintAndDesignatorAttributes: true,
  nativeComponentCacheQualified: false, nativeIndexQualified: false, nativeImportabilityVerified: false,
});
function record(type: string, body: Readonly<Record<string, unknown>>, id?: string, ticket?: number): string {
  return `${JSON.stringify({ type, ...(ticket === undefined ? {} : { ticket }), ...(id === undefined ? {} : { id }) })}||${JSON.stringify(body)}|\n`;
}
function attr(parentId: string, key: "Footprint" | "Designator", value: string): Readonly<Record<string, unknown>> {
    const body = managedComponentFixtureHiddenAttribute(parentId, key, value);
    if (JSON.stringify(Object.keys(body)) !== JSON.stringify(MANAGED_COMPONENT_FIXTURE_ATTRIBUTE_FIELDS)) { throw new Error("Fixed Component ATTR field roster differs."); } return body;
}

/** All source documents and ATTRs are explicit. The native footprint cache
 * otherwise adds missing Footprint/Designator defaults with unstored IDs. */
export function generateManagedComponentFixtureArchiveData(): Readonly<{ name: string; bytes: Buffer; metadata: Readonly<Record<string, unknown>> }> {
  const client = randomBytes(8).toString("hex"), documentUuid = randomBytes(16).toString("hex"), footprintUuid = randomBytes(16).toString("hex");
  const componentId = randomBytes(8).toString("hex"); const padId = randomBytes(8).toString("hex"); const footprintAttrId = randomBytes(8).toString("hex"); const designatorAttrId = randomBytes(8).toString("hex");
  const placedFootprintAttrId = randomBytes(8).toString("hex"); const placedDesignatorAttrId = randomBytes(8).toString("hex");
  const title = `Codex_component_circular_pad_${randomBytes(8).toString("hex")}`; const generatedAtEpochMs = Date.now();
  const identities = [client, documentUuid, footprintUuid, componentId, padId, footprintAttrId, designatorAttrId, placedFootprintAttrId, placedDesignatorAttrId];
  if (!Number.isSafeInteger(generatedAtEpochMs) || generatedAtEpochMs < 1 || new Set(identities).size !== identities.length ||
    JSON.stringify(Object.keys(MANAGED_COMPONENT_FIXTURE_BODY)) !== JSON.stringify(MANAGED_COMPONENT_FIXTURE_FIELDS)) { throw new Error("Fresh Component fixture identity/clock/codec roster differs."); }
  const head = (docType: "PCB" | "FOOTPRINT", uuid: string): string => record("DOCHEAD", { docType, client, uuid, updateTime: generatedAtEpochMs, version: String(generatedAtEpochMs), editVersion: "3.2.209" });
  const source = head("FOOTPRINT", footprintUuid) + record("META", MANAGED_COMPONENT_FIXTURE_FOOTPRINT_META, "META", 1) + record("PAD", MANAGED_PAD_FIXTURE_BODY, padId, 2) +
    record("ATTR", attr("", "Footprint", MANAGED_COMPONENT_FIXTURE_FOOTPRINT_META.title), footprintAttrId, 3) + record("ATTR", attr("", "Designator", "U?"), designatorAttrId, 4) +
    head("PCB", documentUuid) + record("META", { title: "PCB1", parent: "", source: "", board: "", zIndex: null }, "META", 1) + record("COMPONENT", MANAGED_COMPONENT_FIXTURE_BODY, componentId, 2) +
    record("ATTR", attr(componentId, "Footprint", footprintUuid), placedFootprintAttrId, 3) + record("ATTR", attr(componentId, "Designator", "U?"), placedDesignatorAttrId, 4);
  const bytes = packManagedFixtureArchive(Buffer.from(JSON.stringify({ title, cbb_project: false, editorVersion: "3.2.209" })), Buffer.from(source));
  const qualification = qualifyManagedFixtureArchive(bytes); const profileText = JSON.stringify(MANAGED_COMPONENT_FIXTURE_PROFILE);
  const sourceTemplateProfileSha256 = createHash("sha256").update(profileText).digest("hex");
  if (JSON.stringify(qualification.documents.map(doc => doc.documentType)) !== JSON.stringify(["FOOTPRINT", "PCB"])) { throw new Error("Generated Component complete document roster differs."); }
  return Object.freeze({ name: `${title}.epro2`, bytes, metadata: freezeDeep({ schema: "easyeda-pro-control.generated-component-fixture-archive.v1", fixtureKind: MANAGED_COMPONENT_FIXTURE_KIND,
    title, client, documentUuid, footprintUuid, componentId, padId, footprintAttrId, designatorAttrId, placedFootprintAttrId, placedDesignatorAttrId, generatedAtEpochMs,
    intendedOwnedPadId: componentId + padId, sourceTemplateProfile: MANAGED_COMPONENT_FIXTURE_PROFILE,
    sourceTemplateProfileSha256, archiveSha256: qualification.archiveSha256,
    qualificationSha256: qualification.qualificationSha256, completeSuppliedDocumentRoster: true, explicitCompleteAttributeRoster: true, newDataOnly: true,
    existingProjectRead: false, sqliteAccessed: false, nativeImportExecuted: false, nativeImportabilityVerified: false, nativeComponentCacheQualified: false,
    nativeIndexQualified: false, nativeGeometryVerified: false, executionAuthorized: false }) });
}
