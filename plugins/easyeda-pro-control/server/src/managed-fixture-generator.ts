import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { qualifyManagedFixtureArchive } from "./managed-fixture-archive.ts";
import { packManagedFixtureArchive } from "./managed-fixture-zip.ts";

export const MANAGED_FIXTURE_GENERATOR_KINDS = ["via-only", "line-and-via"] as const;
export const MANAGED_FIXTURE_GENERATOR_PROFILE = Object.freeze({
  schema: "easyeda-pro-control.pcb209-fixture-template.v1", application: "3.2.209.8a704eab", sourceFormat: "native-json-records-2.0",
  sources: Object.freeze([
    Object.freeze({ relativePath: "pro-pcb/3.2.195.6b67774e/js/pcb.js", bytes: 10_991_441,
      sha256: "a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b" }),
    Object.freeze({ relativePath: "pro-mgr/3.2.185.bf63a159/js/pro-mgr.js", bytes: 2_196_424,
      sha256: "b3260ec9d98d6cad5f65a6234aa839b32f6bf5954cb03de0bd6ce003577b388d" }),
  ]),
  sourceMethods: Object.freeze([
    Object.freeze({ className: "Jg", method: "getVIA", start: 3_997_180, end: 3_997_685,
      sha256: "6b11b6d065800c7f869e361e4e2d741bf4e5d28d459c5ff7e1bc3cfc34268274" }),
    Object.freeze({ className: "Jg", method: "getLINE", start: 3_998_536, end: 3_998_861,
      sha256: "01fd8826264800511d677edf3c92381e6f9db5a842d7d529da439bb3322906c4" }),
    Object.freeze({ className: "u6", method: "feed", start: 4_167_179, end: 4_167_887,
      sha256: "041bffa65ea51ed0fa1423a7ad4b481c3c5d9712ac30427c22f9d84fdc687f9c" }),
    Object.freeze({ className: "u6", method: "check", start: 4_168_392, end: 4_168_583,
      sha256: "956bf8ca20ffc33fd9bed3d20e5358b54e3cab10b2442506a8be922dd738934f" }),
    Object.freeze({ className: "u6", method: "viaCheck", start: 4_168_583, end: 4_168_655,
      sha256: "499c7ec9bf1b930c713f09bf69982896582ecf5f9ef8a689b90cc12ccae1a8fe" }),
    Object.freeze({ className: "u6", method: "finish", start: 4_168_921, end: 4_169_670,
      sha256: "32d34c1f9ee82a57049efe09feac8e71f2ee7a1602ddf8870a7acaa05f16cf06" }),
    Object.freeze({ className: "e6", method: "feed", start: 4_083_760, end: 4_084_208,
      sha256: "234ab012aa78a11cc6e3b72a65ddb8dd82bcf082df1aef19e4f12b3cb9bfd704" }),
    Object.freeze({ className: "e6", method: "check", start: 4_084_532, end: 4_084_686,
      sha256: "51289ca49de1e7ebad88c65d30590dd0967cc37c9ae507f0a0422068d1098e0c" }),
    Object.freeze({ className: "e6", method: "finish", start: 4_084_686, end: 4_085_051,
      sha256: "884c8efa85cf4b4a858fa5081eb0a8a8c54f9cd1194d1260ada1f9b99155fe4f" }),
    Object.freeze({ className: "AF", method: "metaData", start: 1_501_715, end: 1_501_817,
      sha256: "45079add2473387b34b8a75d17c7f02dabb296d34c09df48da68f129f4a47dbb" }),
    Object.freeze({ className: "Xp", method: "pcb1", start: 1_921_941, end: 1_922_443,
      sha256: "01881b6f225c6e0f6e51b48378d7f405bf3148da5c2ebb177b751e1bcee17b20" }),
  ]),
});

const kindSchema = z.enum(MANAGED_FIXTURE_GENERATOR_KINDS);
export type ManagedFixtureGeneratorKind = z.infer<typeof kindSchema>;
export const MANAGED_FIXTURE_VIA_FIELDS = Object.freeze(["partitionId", "groupId", "netName", "ruleName", "centerX", "centerY",
  "holeDiameter", "viaDiameter", "viaType", "topSolderExpansion", "bottomSolderExpansion", "locked", "unusedInnerLayers", "zIndex"]);
export const MANAGED_FIXTURE_LINE_FIELDS = Object.freeze(["partitionId", "groupId", "netName", "layerId", "startX", "startY", "endX", "endY", "width", "locked", "zIndex"]);
export const MANAGED_FIXTURE_VIA_BODY = Object.freeze({ partitionId: "", groupId: 0, netName: "", ruleName: "", centerX: 0, centerY: 0, holeDiameter: 100,
  viaDiameter: 200, viaType: "NORMAL", topSolderExpansion: 0, bottomSolderExpansion: 0, locked: false, unusedInnerLayers: Object.freeze([]), zIndex: null });
export const MANAGED_FIXTURE_LINE_BODY = Object.freeze({ partitionId: "", groupId: 0, netName: "", layerId: 1, startX: 500, startY: 0, endX: 1500, endY: 0, width: 100, locked: false, zIndex: null });

function record(type: string, body: Readonly<Record<string, unknown>>, id?: string, ticket?: number): string {
  return `${JSON.stringify({ type, ...(ticket === undefined ? {} : { ticket }), ...(id === undefined ? {} : { id }) })}||${JSON.stringify(body)}|\n`;
}

/** Construct one entirely new root PCB from the separately reviewed 209 codec
 * field rosters. Geometry is fixed, with one ordinary through Via and optionally
 * one disjoint top-layer LINE, which the native editor represents as Track.
 * Coordinates are source units. The reviewed decoder divides positions by ten
 * and diameters by twenty when building its native model.
 * This produces a versioned input, not a connected importability assertion. */
export function generateManagedFixtureArchiveData(kindInput: unknown): Readonly<{
  name: string; bytes: Buffer; metadata: Readonly<Record<string, unknown>>;
}> {
  const kind = kindSchema.parse(kindInput), suffix = randomBytes(8).toString("hex");
  const title = `Codex_${kind.replaceAll("-", "_")}_${suffix}`;
  const client = randomBytes(8).toString("hex"), documentUuid = randomBytes(16).toString("hex"), viaId = randomBytes(8).toString("hex");
  const lineId = kind === "line-and-via" ? randomBytes(8).toString("hex") : null;
  const generatedAtEpochMs = Date.now();
  if (!Number.isSafeInteger(generatedAtEpochMs) || generatedAtEpochMs < 1 || new Set([client, documentUuid, viaId, lineId]).size !== 4) {
    throw new Error("Fresh fixture identities or creation clock are invalid.");
  }
  const via = { ...MANAGED_FIXTURE_VIA_BODY, unusedInnerLayers: [] };
  const line = { ...MANAGED_FIXTURE_LINE_BODY };
  if (JSON.stringify(Object.keys(via)) !== JSON.stringify(MANAGED_FIXTURE_VIA_FIELDS) || JSON.stringify(Object.keys(line)) !== JSON.stringify(MANAGED_FIXTURE_LINE_FIELDS)) {
    throw new Error("Fixed fixture geometry differs from the reviewed native field rosters.");
  }
  const source = record("DOCHEAD", { docType: "PCB", client, uuid: documentUuid, updateTime: generatedAtEpochMs,
    version: String(generatedAtEpochMs), editVersion: "3.2.209" }) +
    record("META", { title: "PCB1", parent: "", source: "", board: "", zIndex: null }, "META", 1) +
    record("VIA", via, viaId, 2) + (lineId === null ? "" : record("LINE", line, lineId, 3));
  const manifest = Buffer.from(JSON.stringify({ title, cbb_project: false, editorVersion: "3.2.209" }), "utf8");
  const sourceBytes = Buffer.from(source, "utf8");
  const bytes = packManagedFixtureArchive(manifest, sourceBytes), qualification = qualifyManagedFixtureArchive(bytes);
  const sourceTemplateProfileSha256 = createHash("sha256").update(JSON.stringify(MANAGED_FIXTURE_GENERATOR_PROFILE), "utf8").digest("hex");
  return Object.freeze({ name: `${title}.epro2`, bytes,
    metadata: Object.freeze({ schema: "easyeda-pro-control.generated-fixture-archive.v1", fixtureKind: kind, title, documentUuid,
      viaId, lineId, client, generatedAtEpochMs, sourceTemplateProfile: MANAGED_FIXTURE_GENERATOR_PROFILE,
      intendedNativeGeometry: { via: { id: viaId, family: "Via", centerX: 0, centerY: 0, outerRadius: 10, holeRadius: 5,
        startLayer: 1, endLayer: 2, locked: false },
      line: lineId === null ? null : { id: lineId, family: "Track", layer: 1, startX: 50, startY: 0, endX: 150, endY: 0, width: 10, locked: false } },
      archiveSha256: qualification.archiveSha256, qualificationSha256: qualification.qualificationSha256,
      sourceTemplateProfileSha256,
      newDataOnly: true, existingProjectRead: false, sqliteAccessed: false, nativeImportExecuted: false,
      nativeSceneVerified: false, nativeImportabilityVerified: false, currentInstalledSourcesVerified: false, executionAuthorized: false }) });
}
