/* oxlint-disable import/max-dependencies -- Independent finite codecs and exact source restoration are compared in one source-only composition regression. */
/** Fixed source/codecs only. No helper is written, compiled or launched. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";
import { generateWorkerStartupProtocol } from "../../scripts/generate-worker-startup-protocol.ts";
import { currentPcbDiagnosticCSharpCompilerInput, expandCurrentPcbDiagnosticCSharpStorage } from "../src/current-pcb-diagnostic-csharp-storage.ts";
import { CURRENT_PCB_DIAGNOSTIC_HELPER_SOURCE_MAX_BYTES as MAXIMUM } from "../src/current-pcb-diagnostic-helper-source-profile.ts";
import { currentSchematicDisplayNativeCommand as sixCommand } from "../src/current-schematic-display-native-command.ts";
import { currentSchematicDisplayWriteNativeRequest as sixEncode } from "../src/current-schematic-display-write-protocol.ts";
import { CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PROFILE as SIX } from "../src/current-schematic-display-write-native-profile.ts";
import { currentSchematicRelevanceDisplayNativeCommand as command, validateCurrentSchematicRelevanceDisplayNativeCommand as validate } from "../src/current-schematic-relevance-display-native-command.ts";
import { currentSchematicRelevanceDisplayWriteNativeRequest as encode } from "../src/current-schematic-relevance-display-write-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_NATIVE_PROFILE as PROFILE } from "../src/current-schematic-relevance-display-write-native-profile.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_NAVIGATION_FUNCTION as NAVIGATION, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_STAGE_FUNCTION as STAGE, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_START_FUNCTION as START } from "../src/current-schematic-relevance-display-write-programs.ts";
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
  assert.equal(PROFILE.renderer.total, SIX.renderer.total + 18); assert.equal(PROFILE.renderer.structureObservation, SIX.renderer.structureObservation + 18);
  const old = sixCommand("start", "original-binding"); assert.throws(() => encode(wire({ id: 1, ...old, sessionId: "original-session" })));
  assert.throws(() => command("capture", "original-binding", args.target, { ...args.operation, peers: args.operation.peers.slice(0, 5) }));
});
void test("combined seven-record native source is idempotent, bounded and retains exact packed program bytes", async () => {
  assert.equal(process.versions.node, "24.18.0");
  const source = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8"); const first = generateWorkerStartupProtocol(source), second = generateWorkerStartupProtocol(first);
  assert.ok(second === first, "Complete fixed generation must remain byte-identical on its second pass."); assert.ok(Buffer.byteLength(first) <= MAXIMUM); const compiler = currentPcbDiagnosticCSharpCompilerInput(first); assert.ok(Buffer.byteLength(compiler) <= MAXIMUM);
  const expanded = expandCurrentPcbDiagnosticCSharpStorage(first);
  assert.equal(expanded.split("        'schematic-relevance-display-native' {").length, 2);
  assert.equal(expanded.split("    [EasyedaDiagnosticOwner]::VerifySchematicRelevanceDisplaySmoke()\n").length, 2);
  assert.match(compiler, /schematicStartupCalls>=\(schematicRelevanceDisplayWrite209\?8:7\)/u);
  const oldAdmission = compiler.slice(compiler.indexOf("public void AdmitSchematicDisplayAction("), compiler.indexOf("void SchematicDisplayDiscovery("));
  assert.match(oldAdmission, /\bschematicDisplayWrite209\b/u); assert.doesNotMatch(oldAdmission, /\bSchematicDisplayFamily\b/u);
  const ownEncoder = compiler.slice(compiler.indexOf("public static string SchematicRelevanceDisplayProtocolMessage("), compiler.indexOf("public void SendSchematicRelevanceDisplayNative("));
  assert.ok(ownEncoder.includes(`id>${String(PROFILE.renderer.total)}||`));
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
