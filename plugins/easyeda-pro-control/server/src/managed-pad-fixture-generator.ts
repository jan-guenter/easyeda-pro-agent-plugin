import { createHash, randomBytes } from "node:crypto";
import { qualifyManagedFixtureArchive } from "./managed-fixture-archive.ts";
import { packManagedFixtureArchive } from "./managed-fixture-zip.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const MANAGED_PAD_FIXTURE_KIND = "circular-smt-pad-only";
export const MANAGED_PAD_FIXTURE_FIELDS = Object.freeze(["partitionId", "groupId", "netName", "layerId", "num", "centerX", "centerY", "padAngle",
  "hole", "defaultPad", "specialPad", "padOffsetX", "padOffsetY", "relativeAngle", "plated", "padType", "topSolderExpansion", "bottomSolderExpansion",
  "topPasteExpansion", "bottomPasteExpansion", "locked", "zIndex", "connectMode", "spokeSpace", "spokeWidth", "spokeAngle", "unusedInnerLayers", "padLen", "attrsMap"]);
export const MANAGED_PAD_FIXTURE_BODY = freezeDeep({ partitionId: "", groupId: 0, netName: "", layerId: 1, num: "1", centerX: 0, centerY: 0, padAngle: 0,
  hole: null, defaultPad: { padType: "ELLIPSE", width: 200, height: 200 }, specialPad: [], padOffsetX: 0, padOffsetY: 0, relativeAngle: 0,
  plated: false, padType: "NORMAL", topSolderExpansion: 0, bottomSolderExpansion: 0, topPasteExpansion: 0, bottomPasteExpansion: 0,
  locked: false, zIndex: null, connectMode: null, spokeSpace: null, spokeWidth: null, spokeAngle: null, unusedInnerLayers: [], padLen: 0, attrsMap: {} });

export const MANAGED_PAD_FIXTURE_PROFILE = freezeDeep({ schema: "easyeda-pro-control.pcb209-circular-smt-pad-fixture-template.v1",
  application: "3.2.209.8a704eab", source: { relativePath: "pro-pcb/3.2.195.6b67774e/js/pcb.js", bytes: 10_991_441,
    sha256: "a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b" }, sourceMethods: [
  {
    "name": "Jg.getPAD",
    "start": 3_997_685,
    "end": 3_998_536,
    "sha256": "bffc3434cda3b0e0432715570844e4d3b9905c9f35b34b87df348fa5722971c4"
  },
  {
    "name": "padDecoder.constructor",
    "start": 4_174_632,
    "end": 4_174_812,
    "sha256": "6096899fbec3a0bc75450a7b062b23695536e840c0fba6431f7635665b2e2320"
  },
  {
    "name": "padDecoder.feed",
    "start": 4_174_812,
    "end": 4_176_653,
    "sha256": "2a7254f594cd3e54735ca86079a66137569051d57f161ec14908a828274910d3"
  },
  {
    "name": "padDecoder.parseHole",
    "start": 4_177_878,
    "end": 4_178_025,
    "sha256": "eceb6924ef7363bd83082d8624add21ede1a8e989ace2895fb04ad4cd26a0e06"
  },
  {
    "name": "padDecoder.parseSpecialPad",
    "start": 4_178_025,
    "end": 4_178_743,
    "sha256": "564319a527e9a5dc4bb4580926fe3ebde7ee131eff247ead21cfe441a9d1fbd9"
  },
  {
    "name": "padDecoder.parseDefaultPad",
    "start": 4_178_743,
    "end": 4_179_091,
    "sha256": "d069043716a9670da9084c8d97886b8ac28322ccdbee9aa4fb8a72e212823a59"
  },
  {
    "name": "padDecoder.check",
    "start": 4_179_091,
    "end": 4_179_394,
    "sha256": "b2d53e3c70c521b3c0669e42d4509f075e28caf7b27f7e1fa6b9922db92d5b3d"
  },
  {
    "name": "padDecoder.padVerify",
    "start": 4_179_394,
    "end": 4_179_586,
    "sha256": "ca95074c6063131c72a7eae52b8c96744e141b7f1a86ae037eed85649fd8ffcf"
  },
  {
    "name": "padDecoder.initData",
    "start": 4_179_586,
    "end": 4_180_299,
    "sha256": "cc3ac8d2ab206c583c4f50752946dea2cc881a4567ec422ae846afa24d0a44f5"
  },
  {
    "name": "padDecoder.padCheck",
    "start": 4_180_299,
    "end": 4_180_701,
    "sha256": "d29890c9dac0c2b28e1b48d98c08922ee761916399997fb4932b5551ce74fe3d"
  },
  {
    "name": "padDecoder.prepareExpansion",
    "start": 4_180_701,
    "end": 4_180_935,
    "sha256": "d235a09ccee7da6ac57e76c06215f0af920c0cc64c3c0e81b8024e64fdec12ad"
  },
  {
    "name": "padDecoder.finish",
    "start": 4_180_935,
    "end": 4_181_997,
    "sha256": "0db44eb8c7a16e89d948141b301100ce983a8c3c8a2c5225be02136118670470"
  },
  {
    "name": "padDecoder.getItem",
    "start": 4_181_997,
    "end": 4_182_643,
    "sha256": "bfe87864732c3d998b490b34a15d14ac6af883accbdf2e273f507b8f3de126b7"
  },
  {
    "name": "HFe",
    "start": 3_550_733,
    "end": 3_551_039,
    "sha256": "002d9236511fe89f06b92368ed0c2f60ee6566b61cf83659ec3bcdd25e4108f2"
  },
  {
    "name": "LVe",
    "start": 4_010_381,
    "end": 4_010_495,
    "sha256": "215ef51fbc15a1124195480474fe8e46269991fbf2aa11820f660640035401b0"
  },
  {
    "name": "cGe",
    "start": 4_016_022,
    "end": 4_016_185,
    "sha256": "c7da482f26aadc87a1b0984925d832a1f52d60ae99fc5b0e16a0d094ff6e4167"
  },
  {
    "name": "Xa",
    "start": 4_008_089,
    "end": 4_008_157,
    "sha256": "bc1341d9e6df474c11207e6334a369c8fce0073074cf5d2e315d3f888bcb1290"
  },
  {
    "name": "decodeBase.isNumber",
    "start": 3_172_793,
    "end": 3_172_831,
    "sha256": "3122e6869d076a414188ff08869cf75016c1e7ac39dac7e3d225f370907aa283"
  },
  {
    "name": "$S",
    "start": 3_214_649,
    "end": 3_214_693,
    "sha256": "d9a5f0b23cdc1b6b02de9d09243d36a0d8497196c4d89bfc4626bce9412532ab"
  },
  {
    "name": "tC.class",
    "start": 3_416_257,
    "end": 3_418_900,
    "sha256": "cebc2fee9b240bc3882a9f64c47fb8c1484fe1b4c894a70a816a70f594e95551"
  },
  {
    "name": "ZCe.class",
    "start": 3_418_909,
    "end": 3_419_863,
    "sha256": "9e172b699c9f96927598c5a3d43f838e46635790c6b8ba353e854c6b480ec9f1"
  },
  {
    "name": "w8",
    "start": 3_549_318,
    "end": 3_549_390,
    "sha256": "bf90dc69648900b89ce35b910759d0fa914ad4ad3562e752f41e5cfb1559e238"
  },
  {
    "name": "l3",
    "start": 3_549_774,
    "end": 3_550_407,
    "sha256": "8f753b7b3daf3b06708c52ca780574d90141ba63f12ebe88a4511c1dfb866619"
  },
  {
    "name": "K3t",
    "start": 3_548_406,
    "end": 3_549_318,
    "sha256": "5e5987f8729ec15a622885ecb90f52446f0af8732a4ab1e2fa9e125469d71176"
  }
],
  nativeGeometry: { model: "tE", view: "Mi", family: "Pad", layerId: 1, centerX: 0, centerY: 0, radius: 10, rotation: 0, padType: 0,
    top: { model: "tC", type: "ELLIPSE", width: 20, height: 20 }, bottom: null, inner: null, hole: null, parent: null, locked: false } });

function record(type: string, body: Readonly<Record<string, unknown>>, id?: string, ticket?: number): string {
  return `${JSON.stringify({ type, ...(ticket === undefined ? {} : { ticket }), ...(id === undefined ? {} : { id }) })}||${JSON.stringify(body)}|\n`;
}
/** New generated data, without a library, Component or placed-pad dependency.
 * The pinned Pad decoder divides positions and style dimensions by ten. */
export function generateManagedPadFixtureArchiveData(): Readonly<{ name: string; bytes: Buffer; metadata: Readonly<Record<string, unknown>> }> {
  if (JSON.stringify(Object.keys(MANAGED_PAD_FIXTURE_BODY)) !== JSON.stringify(MANAGED_PAD_FIXTURE_FIELDS)) { throw new Error("Fixed Pad codec field roster changed."); }
  const client = randomBytes(8).toString("hex"), documentUuid = randomBytes(16).toString("hex"), padId = randomBytes(8).toString("hex"),
    title = `Codex_circular_smt_pad_${randomBytes(8).toString("hex")}`;
  const generatedAtEpochMs = Date.now();
  if (!Number.isSafeInteger(generatedAtEpochMs) || generatedAtEpochMs < 1 || new Set([client, documentUuid, padId]).size !== 3) { throw new Error("Fresh Pad fixture identities or clock differ."); }
  const source = record("DOCHEAD", { docType: "PCB", client, uuid: documentUuid, updateTime: generatedAtEpochMs, version: String(generatedAtEpochMs), editVersion: "3.2.209" }) +
    record("META", { title: "PCB1", parent: "", source: "", board: "", zIndex: null }, "META", 1) + record("PAD", MANAGED_PAD_FIXTURE_BODY, padId, 2);
  const bytes = packManagedFixtureArchive(Buffer.from(JSON.stringify({ title, cbb_project: false, editorVersion: "3.2.209" })), Buffer.from(source));
  const qualification = qualifyManagedFixtureArchive(bytes); const profileText = JSON.stringify(MANAGED_PAD_FIXTURE_PROFILE);
  const sourceTemplateProfileSha256 = createHash("sha256").update(profileText).digest("hex");
  return Object.freeze({ name: `${title}.epro2`, bytes, metadata: Object.freeze({ schema: "easyeda-pro-control.generated-pad-fixture-archive.v1",
    fixtureKind: MANAGED_PAD_FIXTURE_KIND, title, client, documentUuid, padId, generatedAtEpochMs, sourceTemplateProfile: MANAGED_PAD_FIXTURE_PROFILE,
    sourceTemplateProfileSha256,
    archiveSha256: qualification.archiveSha256, qualificationSha256: qualification.qualificationSha256, newDataOnly: true, existingProjectRead: false,
    sqliteAccessed: false, nativeImportExecuted: false, nativeSceneVerified: false, nativeImportabilityVerified: false, currentInstalledSourcesVerified: false,
    componentDependency: false, executionAuthorized: false }) });
}
