import { createHash, randomBytes } from "node:crypto";
import { qualifyManagedFixtureArchive } from "./managed-fixture-archive.ts";
import { packManagedFixtureArchive } from "./managed-fixture-zip.ts";

/** Exact installed manager serialization functions. Source generation does not
 * execute them in EasyEDA or qualify a native import, page or electrical net. */
export const MANAGED_SCHEMATIC_FIXTURE_PROFILE = Object.freeze({
  schema: "easyeda-pro-control.sch209-fixture-template.v1", application: "3.2.209.8a704eab",
  source: Object.freeze({ relativePath: "pro-mgr/3.2.185.bf63a159/js/pro-mgr.js", bytes: 2_196_424,
    sha256: "b3260ec9d98d6cad5f65a6234aa839b32f6bf5954cb03de0bd6ce003577b388d" }),
  sourceMethods: Object.freeze([
    Object.freeze({ name: "CF.metaData", start: 1_502_028, end: 1_502_114, sha256: "9521f6d1b5b43da319cc44392f66dcdd0e6d7f747b4c708c4d058e75109d4a5a" }),
    Object.freeze({ name: "RF.metaData", start: 1_513_205, end: 1_513_293, sha256: "9cee89b5de3fce917d342adf3852518de0058f23aadf1b0308d88863e04f64cc" }),
    Object.freeze({ name: "vF.onText", start: 1_511_242, end: 1_511_520, sha256: "ac43581bbb77484818872aa6056ac50469c49b29f349b00e990e9b8f860da094" }),
    Object.freeze({ name: "vF.onWire", start: 1_512_188, end: 1_512_458, sha256: "32076fd438a20ea2da362feb677061c208e1d927658c85e888fbe19fae3b8328" }),
    Object.freeze({ name: "vF.onBus", start: 1_511_907, end: 1_512_188, sha256: "a6838c681a10fb9b7f4103d70782a76bd657e76ca4e9e458e84bebee1d883055" }),
    Object.freeze({ name: "Me", start: 1_103_136, end: 1_103_270, sha256: "e377888550ee81603777002178722a1e55bbf37dc649d8a5037c56731f3db5f6" }),
    Object.freeze({ name: "rs", start: 1_103_270, end: 1_103_330, sha256: "bf39322d94165a08d9066d96e96641f30d78f09ed2b4a68f9570348618f2a370" }),
    Object.freeze({ name: "hD", start: 1_103_330, end: 1_103_521, sha256: "61acecaf691521a38b5094ebb945c215518e37b513727b363781168d9ccf0e6c" }),
    Object.freeze({ name: "DF.encodeText", start: 1_503_208, end: 1_503_276, sha256: "6f6afaee8f14ffb6e1f6202d86399c7df110f8d30dcb12c4741fbdff844b9f2a" }),
    Object.freeze({ name: "DF.encodeWire", start: 1_503_552, end: 1_503_620, sha256: "82ca473c4e0445cb4ebcb07e97bde791e8fa33a7e7cbc7d6faccdfe284504baa" }),
    Object.freeze({ name: "DF.encodeBus", start: 1_503_486, end: 1_503_552, sha256: "2d17bb694dbe4ff46ba021ca68b9aa2e2eeea59092ea8a8a443fe7ab43a014b1" }),
    Object.freeze({ name: "DF.encodeLine", start: 1_503_418, end: 1_503_486, sha256: "e19ff3f3b483b7cfb73da32c59e9806a4ff6cac15f9f8fea6337cf1fde85a27f" }),
  ]),
});

export const MANAGED_SCHEMATIC_FIXTURE_TEXT = Object.freeze({ groupId: 0, locked: false, zIndex: null,
  x: 0, y: -200, rotation: 0, value: "Disposable schematic fixture", color: "#000000", fillColor: null,
  fontFamily: "Arial", fontSize: 20, strikeout: false, underline: false, italic: false, fontWeight: false,
  align: "LEFT_TOP", version: "2.0" });
export const MANAGED_SCHEMATIC_FIXTURE_GROUP = Object.freeze({ groupId: 0, locked: false, zIndex: null });
export const MANAGED_SCHEMATIC_FIXTURE_WIRE_LINE = Object.freeze({ startX: 0, startY: 0, endX: 100, endY: 0,
  strokeColor: "#008800", strokeStyle: "SOLID", fillColor: null, strokeWidth: 2, fillStyle: null });
export const MANAGED_SCHEMATIC_FIXTURE_BUS_LINE = Object.freeze({ startX: 0, startY: 100, endX: 100, endY: 100,
  strokeColor: "#0000FF", strokeStyle: "SOLID", fillColor: null, strokeWidth: 4, fillStyle: null });

function primitiveId(): string {
  // A leading zero also keeps these IDs unchanged by the native legacy Me
  // Normalizer. Sixty random bits remain; all generated IDs are checked once.
  return `0${randomBytes(8).toString("hex").slice(1)}`;
}
function record(type: string, body: Readonly<Record<string, unknown>>, id?: string, ticket?: number): string {
  return `${JSON.stringify({ type, ...(ticket === undefined ? {} : { ticket }), ...(id === undefined ? {} : { id }) })}||${JSON.stringify(body)}|\n`;
}

/** New data only: one ordinary SCH container, one matching SCH_PAGE, a Text
 * and two disjoint one-segment Wire/Bus groups. No components, symbols, assets,
 * net labels or connectivity assertions are invented. It is deliberately a
 * separate generator until the complete native SCH import/open path qualifies. */
export function generateManagedSchematicFixtureArchiveData(): Readonly<{
  name: string; bytes: Buffer; metadata: Readonly<Record<string, unknown>>;
}> {
  const title = `Codex_schematic_${randomBytes(8).toString("hex")}`;
  const client = randomBytes(8).toString("hex");
  const schematicUuid = randomBytes(16).toString("hex");
  const pageUuid = randomBytes(16).toString("hex");
  const textId = primitiveId();
  const wireId = primitiveId(), wireLineId = primitiveId();
  const busId = primitiveId(), busLineId = primitiveId();
  const generatedAtEpochMs = Date.now();
  if (!Number.isSafeInteger(generatedAtEpochMs) || generatedAtEpochMs < 1 ||
      new Set([client, schematicUuid, pageUuid, textId, wireId, wireLineId, busId, busLineId]).size !== 8) {
    throw new Error("Fresh schematic fixture identities or creation clock are invalid.");
  }
  const head = (docType: "SCH" | "SCH_PAGE", uuid: string): string => record("DOCHEAD", { docType, client, uuid,
    updateTime: generatedAtEpochMs, version: String(generatedAtEpochMs), editVersion: "3.2.209" });
  const source = head("SCH", schematicUuid) + record("META", { title: "Schematic1", source: "", board: "", zIndex: null }, "META", 1) +
    head("SCH_PAGE", pageUuid) + record("META", { title: "Sheet1", schematic: schematicUuid, source: "", zIndex: 1 }, "META", 1) +
    record("TEXT", MANAGED_SCHEMATIC_FIXTURE_TEXT, textId, 2) + record("WIRE", MANAGED_SCHEMATIC_FIXTURE_GROUP, wireId, 3) +
    record("LINE", { lineGroup: wireId, ...MANAGED_SCHEMATIC_FIXTURE_WIRE_LINE }, wireLineId, 4) +
    record("BUS", { ...MANAGED_SCHEMATIC_FIXTURE_GROUP, busEntry: {} }, busId, 5) +
    record("LINE", { lineGroup: busId, ...MANAGED_SCHEMATIC_FIXTURE_BUS_LINE }, busLineId, 6);
  const manifest = Buffer.from(JSON.stringify({ title, cbb_project: false, editorVersion: "3.2.209" }), "utf8");
  const bytes = packManagedFixtureArchive(manifest, Buffer.from(source, "utf8")), qualification = qualifyManagedFixtureArchive(bytes);
  if (qualification.documents.length !== 2 || qualification.documents[0]?.documentType !== "SCH" ||
      qualification.documents[1]?.documentType !== "SCH_PAGE") { throw new Error("Generated schematic document roster changed."); }
  const sourceTemplateProfileSha256 = createHash("sha256").update(JSON.stringify(MANAGED_SCHEMATIC_FIXTURE_PROFILE)).digest("hex");
  return Object.freeze({ name: `${title}.epro2`, bytes, metadata: Object.freeze({
    schema: "easyeda-pro-control.generated-schematic-fixture-archive.v1", fixtureKind: "schematic-text-wire-bus", title,
    client, schematicUuid, pageUuid, textId, wireId, wireLineId, busId, busLineId, generatedAtEpochMs,
    sourceTemplateProfile: MANAGED_SCHEMATIC_FIXTURE_PROFILE,
    sourceTemplateProfileSha256,
    archiveSha256: qualification.archiveSha256, qualificationSha256: qualification.qualificationSha256,
    completeSuppliedDocumentRoster: true, newDataOnly: true, existingProjectRead: false, sqliteAccessed: false,
    nativeImportExecuted: false, nativeSceneVerified: false, nativeImportabilityVerified: false,
    connectivityVerified: false, currentInstalledSourcesVerified: false, executionAuthorized: false,
  }) });
}
