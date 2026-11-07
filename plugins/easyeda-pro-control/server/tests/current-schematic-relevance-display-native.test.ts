import { currentProjectLibraryRefreshCases } from "../src/current-project-library-refresh-protocol.ts";
import { currentProjectSyncQuiesceNativeCases } from "../src/current-project-sync-quiesce-protocol.ts";
import { currentSchematicWireEditNativeRequest as wireEncode } from "../src/current-schematic-wire-edit-protocol.ts";
import { currentSchematicDisplayAccessorNativeCases } from "../src/current-schematic-display-accessor-protocol.ts";
import { currentSchematicDisplayActionNativeCases } from "../src/current-schematic-display-action-protocol.ts";
import { currentSchematicDisplayActionGuardCommand } from "../src/current-schematic-display-action-guard-protocol.ts";
/* oxlint-disable import/max-dependencies -- Independent finite codecs and exact source restoration are compared in one source-only composition regression. */
/** Fixed source/codecs only. No helper is written, compiled or launched. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";
import { generateSchematicEditNativeSource } from "../../scripts/schematic-edit-native-source.ts";
import { CURRENT_NATIVE_BASELINE } from "../../scripts/native-baseline-source.ts";
import { currentPcbDiagnosticCSharpReviewSource, currentPcbDiagnosticCSharpRuntimeCompilerInput, expandCurrentPcbDiagnosticCSharpReviewSource } from "../src/current-pcb-diagnostic-csharp-review-storage.ts";
import { CURRENT_PCB_DIAGNOSTIC_HELPER_SOURCE_MAX_BYTES as MAXIMUM } from "../src/current-pcb-diagnostic-helper-source-profile.ts";
import { currentSchematicDisplayNativeCommand as sixCommand } from "../src/current-schematic-display-native-command.ts";
import { currentSchematicDisplayWriteNativeRequest as sixEncode } from "../src/current-schematic-display-write-protocol.ts";
import { CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PROFILE as SIX } from "../src/current-schematic-display-write-native-profile.ts";
import { currentSchematicRelevanceDisplayNativeCommand as command, validateCurrentSchematicRelevanceDisplayNativeCommand as validate } from "../src/current-schematic-relevance-display-native-command.ts";
import { currentSchematicRelevanceDisplayWriteNativeRequest as encode } from "../src/current-schematic-relevance-display-write-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_NATIVE_PROFILE as PROFILE } from "../src/current-schematic-relevance-display-write-native-profile.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_NAVIGATION_FUNCTION as NAVIGATION, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_STAGE_FUNCTION as STAGE, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_START_FUNCTION as START } from "../src/current-schematic-relevance-display-write-programs.ts";
import { CURRENT_SCHEMATIC_WIRE_EDIT_NAVIGATION_FUNCTION as WIRE_NAVIGATION, CURRENT_SCHEMATIC_WIRE_EDIT_STAGE_FUNCTION as WIRE_STAGE, CURRENT_SCHEMATIC_WIRE_EDIT_START_FUNCTION as WIRE_START } from "../src/current-schematic-wire-edit-programs.ts";
import { prepareCurrentSchematicWireEditNativeSwitch } from "../src/current-schematic-wire-edit-native-fragment.ts";
import { data } from "./generated-schematic-relevance-display-fixture.ts";

const wire = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value)}\0`);
void test("seven-record calls and common readonly requests use their own fixed reservation and never the six-record stage", () => {
  const { args } = data();
  for (const phase of ["start", "navigate", "capture", "preflight", "modify", "observe", "save"] as const) {
    const original = command(phase, "original-binding", args.target, args.operation), raw = { id: PROFILE.renderer.total, ...original, sessionId: "original-session" };
    assert.deepEqual(validate(original), original); const encoded = encode(wire(raw)); assert.equal(encoded["action"], "schematic-relevance-display-native"); assert.equal(encoded["phase"], phase);
    assert.equal(Object.hasOwn(encoded, "functionDeclaration"), false); assert.ok(wire(raw).length <= 65_536);
    assert.throws(() => sixEncode(wire(raw))); assert.throws(() => encode(wire({ ...raw, id: PROFILE.renderer.total + 1 })));
    assert.throws(() => encode(wire({ ...raw, params: { ...original.params, functionDeclaration: "function(){return true}" } })));
  }
  const query = { id: PROFILE.renderer.total, method: "Target.getTargets" };
  assert.equal(encode(wire(query))["requestId"], PROFILE.renderer.total); assert.throws(() => sixEncode(wire(query)));
  assert.equal(PROFILE.renderer.total, SIX.renderer.total + 18 + PROFILE.renderer.modifyEntryObservation + PROFILE.renderer.startupPollingObservation + PROFILE.renderer.startupPollingHelperSources + PROFILE.renderer.startupLibraryObservation + PROFILE.renderer.startupLibrarySetupHelperSources + PROFILE.renderer.localUploadObservation + PROFILE.renderer.uploadRequestObservation + PROFILE.renderer.localCacheExtraObservation + PROFILE.renderer.submittedHelperSources); assert.equal(PROFILE.renderer.structureObservation, SIX.renderer.structureObservation + 18);
  const old = sixCommand("start", "original-binding"); assert.throws(() => encode(wire({ id: 1, ...old, sessionId: "original-session" })));
  assert.throws(() => command("capture", "original-binding", args.target, { ...args.operation, peers: args.operation.peers.slice(0, 5) }));
});
void test("combined seven-record native source is idempotent, bounded and retains exact packed program bytes", async () => {
  assert.equal(process.versions.node, "24.18.0");
  const source = await readFile(new URL(`../../${CURRENT_NATIVE_BASELINE.relativePath}`, import.meta.url), "utf8"); const first = generateSchematicEditNativeSource(source).helper, second = generateSchematicEditNativeSource(source).helper;
  assert.equal(expandCurrentPcbDiagnosticCSharpReviewSource(first).split("[switch]$SchematicWireEdit209").length, 2);
  assert.throws(() => prepareCurrentSchematicWireEditNativeSwitch("param([switch]$SchematicWireEdit209,[switch]$SchematicWireEdit209,)\n"), /SWITCH_DUPLICATE/u);
  assert.ok(second === first, "Complete fixed generation must remain byte-identical on its second pass."); assert.ok(Buffer.byteLength(first) <= MAXIMUM); const compiler = currentPcbDiagnosticCSharpReviewSource(first); assert.ok(Buffer.byteLength(currentPcbDiagnosticCSharpRuntimeCompilerInput(first)) <= MAXIMUM);
  const expanded = expandCurrentPcbDiagnosticCSharpReviewSource(first);
  assert.equal(expanded.split("        'schematic-relevance-display-native' {").length, 2);
  assert.equal(expanded.split("    [EasyedaDiagnosticOwner]::VerifySchematicRelevanceDisplaySmoke()\n").length, 2);
  assert.match(compiler, /schematicStartupCalls>=\(\(schematicRelevanceDisplayWrite209\|\|schematicWireEdit209\)\?8:7\)/u);
  const oldAdmission = compiler.slice(compiler.indexOf("public void AdmitSchematicDisplayAction("), compiler.indexOf("void SchematicDisplayDiscovery("));
  assert.match(oldAdmission, /\bschematicDisplayWrite209\b/u); assert.doesNotMatch(oldAdmission, /\bSchematicDisplayFamily\b/u);
  const ownEncoder = compiler.slice(compiler.indexOf("public static string SchematicRelevanceDisplayProtocolMessage("), compiler.indexOf("public void SendSchematicRelevanceDisplayNative("));
  assert.ok(ownEncoder.includes(`id>${String(PROFILE.renderer.total)}||`));
  assert.equal(expanded.split("        'schematic-wire-edit-native' {").length, 2);
  assert.equal(expanded.split("    [EasyedaDiagnosticOwner]::VerifySchematicWireEditSmoke()\n").length, 2);
  assert.match(compiler, /static int SchematicWireEditIndex\(string phase\)\{return Array.IndexOf\(new\[\]\{"start","navigate","capture","preflight","modify","observe"\}/u);
  assert.equal(WIRE_START, START); assert.equal(WIRE_NAVIGATION, NAVIGATION);
  assert.ok(compiler.includes("static string SchematicWireEditStart {get{return SchematicRelevanceDisplayStart;}}"));
  assert.ok(compiler.includes("static string SchematicWireEditNavigation {get{return SchematicRelevanceDisplayNavigation;}}"));
  const wirePrograms = [WIRE_STAGE];
  const wireRows = [...compiler.matchAll(/SchematicWireEdit(?:Start|Navigation|Stage)=UnpackFixedProgram\(@"([A-Za-z\d+/=]+)",(\d+),@"([a-f\d]{64})",@"([a-f\d]{64})"\)/gu)]; assert.equal(wireRows.length, 1);
  for (const [index, row] of wireRows.entries()) {
    const [, encoded, length, hash, gzipHash] = row; assert.ok(encoded !== undefined);
    const gzip = Buffer.from(encoded, "base64");
    // oxlint-disable-next-line node/no-sync -- Bounded immutable fixed-program parity, no process or helper write.
    const raw = gunzipSync(gzip, { maxOutputLength: 65_536 });
    assert.equal(raw.toString("utf8"), wirePrograms[index]); assert.equal(raw.length, Number(length));
    assert.equal(createHash("sha256").update(raw).digest("hex"), hash); assert.equal(createHash("sha256").update(gzip).digest("hex"), gzipHash);
  }
  const expected: Readonly<Record<string, string>> = { Start: START, Navigation: NAVIGATION, Stage: STAGE };
  const rows = [...compiler.matchAll(/static readonly string SchematicRelevanceDisplay(Start|Navigation|Stage)=UnpackFixedProgram\(@"([A-Za-z\d+/=]+)",(\d+),@"([a-f\d]{64})",@"([a-f\d]{64})"\);/gu)]; assert.equal(rows.length, 3);
  for (const row of rows) {
    const [, name, encoded, length, rawHash, packedHash] = row; assert.ok(name !== undefined && encoded !== undefined && length !== undefined);
    const compressed = Buffer.from(encoded, "base64");
    // oxlint-disable-next-line node/no-sync -- Bounded in-memory restoration of immutable source; no helper or native process.
    const raw = gunzipSync(compressed, { maxOutputLength: 65_536 });
    assert.equal(raw.length, Number(length)); assert.equal(raw.toString("utf8"), expected[name]);
    assert.equal(createHash("sha256").update(raw).digest("hex"), rawHash); assert.equal(createHash("sha256").update(compressed).digest("hex"), packedHash);
  }
});

void test("seven-record metadata and guards retain separate native verbs and reject the old marker", () => {
  const variants = [
    { command: currentSchematicDisplayAccessorNativeCases()[0], marker: "schematicRelevanceAccessorCommand", old: "schematicAccessorCommand", action: "schematic-relevance-display-accessor" },
    { command: currentSchematicDisplayActionNativeCases()[0], marker: "schematicRelevanceActionCommand", old: "schematicActionCommand", action: "schematic-relevance-display-action" },
    { command: currentSchematicDisplayActionGuardCommand("run", 0, "original-script"), marker: "schematicRelevanceActionGuardCommand", old: "schematicActionGuardCommand", action: "schematic-relevance-display-action-guard" },
  ];
  for (const row of variants) {
    const raw = { id: 1, ...row.command, [row.marker]: true, sessionId: "original-session" };
    assert.equal(encode(wire(raw))["action"], row.action); assert.throws(() => sixEncode(wire(raw)));
    assert.throws(() => encode(wire({ id: 1, ...row.command, [row.old]: true, sessionId: "original-session" })));
    assert.throws(() => encode(wire({ ...raw, callerCode: "return true" })));
  }
});

void test("all fixed polling commands retain the seven-record verb and refuse sibling encoders", () => {
  for (const fixed of currentProjectSyncQuiesceNativeCases()) {
    const raw = { id: 1, ...fixed, schematicRelevanceSyncQuiesceCommand: true, sessionId: "original-worker-session" };
    assert.equal(encode(wire(raw))["action"], "schematic-relevance-display-sync-quiesce");
    assert.throws(() => sixEncode(wire(raw))); assert.throws(() => wireEncode(wire(raw)));
    assert.throws(() => encode(wire({ ...raw, callerCode: "return true" })));
    assert.throws(() => encode(wire({ ...raw, schematicRelevanceSyncQuiesceCommand: false })));
  }
});

void test("library refresh commands use only their original schematic purpose frame", () => {
  for (const fixed of currentProjectLibraryRefreshCases()) {
    const raw = { id: 1, ...fixed, schematicRelevanceLibraryRefreshCommand: true, sessionId: "original-worker-session" };
    assert.equal(encode(wire(raw))["action"], "schematic-relevance-library-refresh");
    assert.throws(() => sixEncode(wire(raw))); assert.throws(() => wireEncode(wire(raw)));
    assert.throws(() => encode(wire({ ...raw, callerCode: "return true" })));
    assert.throws(() => encode(wire({ ...raw, schematicRelevanceLibraryRefreshCommand: false })));
  }
});
