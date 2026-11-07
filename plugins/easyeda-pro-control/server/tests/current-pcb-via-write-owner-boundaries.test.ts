/* oxlint-disable import/max-dependencies -- Compare original owner issuance with the independent fixed/native grammars, SDK metadata and released capacities. */
import assert from "node:assert/strict";
import { gunzipSync } from "node:zlib";
import { captureCurrentPcbStringClockReply } from "../src/current-pcb-string-clock-reply.ts";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { CURRENT_PCB_VIA_WRITE_FUNCTION, CURRENT_PCB_VIA_WRITE_SDK_METHODS } from "../src/current-pcb-via-write-program.ts";
import { currentPcbViaWriteCommand, currentPcbViaWriteNativeRequest } from "../src/current-pcb-via-write-protocol.ts";
import { CURRENT_PCB_VIA_WRITE_NATIVE_PROFILE as PROFILE } from "../src/current-pcb-via-write-native-profile.ts";
import { decodeCurrentPcbViaSdkMethod, decodeCurrentPcbViaSdkTuple, qualifyCurrentPcbViaSdkSource } from "../src/current-pcb-via-write-sdk-source.ts";
import { applyCurrentPcbViaWriteNativeFragment } from "../src/current-pcb-via-write-native-fragment.ts";
import { applyManagedFixtureRegistrationNativeFragment } from "../src/managed-fixture-registration-native-fragment.ts";
import { applyCurrentProjectStructureNativeFragment } from "../src/current-project-structure-native-fragment.ts";
import { diagnosticNativeRequest } from "../src/current-pcb-diagnostic-protocol.ts";
import { spatialDiagnosticNativeRequest } from "../src/current-pcb-spatial-protocol.ts";
import { currentSelectedFileMainSqlFenceNativeCases, currentSelectedFileMainSqlFenceNativeSource, currentSelectedFileMainSqlFenceWire } from "../src/current-selected-file-main-sql-fence-native.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SOURCE as SOURCE, qualifyCurrentSelectedFileMainSqlFenceSource } from "../src/current-selected-file-main-sql-fence-source.ts";
import { currentPcbViaWorkerNativeCases, currentPcbViaWorkerWire } from "../src/current-pcb-via-worker-wire.ts";
import { requireCurrentSelectedFileMainSqlFenceBootstrap } from "../src/current-selected-file-main-sql-fence-bootstrap.ts";

const rawWindowsPath = String.raw`C:\Synthetic\Codex_via_only_1111111111111111.eprj2`;
const target = { rawWindowsPath, projectUuid: createHash("sha256").update(rawWindowsPath).digest("hex"), branchUuid: "b".repeat(32), documentUuid: "c".repeat(32), expectedSourceSha256: "d".repeat(64) };
const operation = { operationId: "pcb209-via-write-one-test", via: { netName: "", xMil: 1, yMil: 2, holeDiameterMil: 3, diameterMil: 4,
  viaType: 0, designRuleBlindViaName: "", solderMaskExpansion: { topSolderMask: 0, bottomSolderMask: 0 }, primitiveLock: false } } as const;
function compose(source: string): string { return applyCurrentPcbViaWriteNativeFragment(applyManagedFixtureRegistrationNativeFragment(applyCurrentProjectStructureNativeFragment(source))); }
function bytes(value: unknown): Buffer { return Buffer.from(`${JSON.stringify(value)}\0`); }
function property(name: string, value: Record<string, unknown>): Record<string, unknown> { return { name, value, writable: false, enumerable: false, configurable: true, isOwn: true }; }
function metadata(kind: "create" | "save"): Record<string, unknown> {
  return { result: [property("name", { type: "string", value: kind }), property("length", { type: "number", value: kind === "create" ? 9 : 0 })],
    internalProperties: [{ name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "api", lineNumber: 37, columnNumber: kind === "create" ? 41_170 : 139_882 } } },
      { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", objectId: "scopes" } }, { name: "[[Prototype]]", value: { type: "function", objectId: "prototype" } }] };
}
void test("new SDK wire contains fixed scalars only and cannot be spent by released103/384 grammars", () => {
  for (const stage of ["capture", "preflight", "create", "observe", "save"] as const) {
    const command = { id: PROFILE.renderer.total, ...currentPcbViaWriteCommand(stage, "original", { target, operation }), sessionId: "session" };
    const wire = currentPcbViaWriteNativeRequest(bytes(command)); assert.equal(wire["action"], "pcb-via-sdk"); assert.equal(wire["viaWritePhase"], stage);
    for (const field of ["functionDeclaration", "arguments", "via", "requestLimit", "purpose"]) { assert.equal(Object.hasOwn(wire, field), false); }
    assert.throws(() => diagnosticNativeRequest(bytes(command))); assert.throws(() => spatialDiagnosticNativeRequest(bytes(command)));
    assert.throws(() => currentPcbViaWriteNativeRequest(bytes({ ...command, id: PROFILE.renderer.total + 1 })));
    assert.throws(() => currentPcbViaWriteNativeRequest(bytes({ ...command, params: { ...command.params, functionDeclaration: `${CURRENT_PCB_VIA_WRITE_FUNCTION}\n` } })));
    assert.throws(() => currentPcbViaWriteNativeRequest(bytes({ ...command, params: { ...command.params, awaitPromise: false } })));
  }
  assert.equal(PROFILE.renderer.total, 3209); assert.deepEqual([PROFILE.main.normal, PROFILE.main.cleanup, PROFILE.main.total], [1120, 43, 1163]);
});
void test("fixed Via SDK retains its reviewed large-program schema and identical packed bytes", async () => {
  assert.ok(CURRENT_PCB_VIA_WRITE_FUNCTION.length > 16_384); assert.throws(() => captureCurrentPcbStringClockReply({ program: CURRENT_PCB_VIA_WRITE_FUNCTION }));
  const original = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8"); const generated = compose(original);
  const match = /static readonly string ViaSdkFunction=UnpackFixedProgram\(@"([A-Za-z\d+/=]+)",(\d+),@"([a-f\d]{64})",@"([a-f\d]{64})"\);/u.exec(generated);
  assert.ok(match !== null); const encoded = match[1]; const length = match[2]; const expected = match[3]; const compressed = match[4]; assert.ok(encoded !== undefined && length !== undefined && expected !== undefined && compressed !== undefined);
  const packed = Buffer.from(encoded, "base64"); assert.equal(packed.toString("base64"), encoded); assert.equal(createHash("sha256").update(packed).digest("hex"), compressed);
  // oxlint-disable-next-line node/no-sync -- Test-only expansion of one fixed generated program within the unchanged64KiB decoder bound.
  const unpacked = gunzipSync(packed); assert.equal(unpacked.length, Number(length)); assert.equal(unpacked.toString(), CURRENT_PCB_VIA_WRITE_FUNCTION); assert.equal(createHash("sha256").update(unpacked).digest("hex"), expected);
  assert.ok(packed.length < unpacked.length / 2); assert.ok(generated.includes("public static void VerifyPcbViaSdkWireSmoke()"));
  for (const stage of ["capture", "preflight", "create", "observe", "save"] as const) { const command = { id: 79, ...currentPcbViaWriteCommand(stage, "original", { target, operation }), sessionId: "session" }; const frame = Buffer.from(`${JSON.stringify(command)}\0`); const actual = currentPcbViaWriteNativeRequest(frame); assert.equal(actual["viaWritePhase"], stage); }
});
void test("retained SDK methods require exact original installed function locations, names and arity", () => {
  for (const kind of ["create", "save"] as const) { assert.equal(decodeCurrentPcbViaSdkMethod(metadata(kind), kind), "api"); }
  const native = metadata("create"); Reflect.set(native, "internalProperties", []); assert.throws(() => decodeCurrentPcbViaSdkMethod(native, "create"));
  const copied = metadata("create"); Reflect.set(copied, "result", [property("name", { type: "string", value: "create" }), property("length", { type: "number", value: 8 })]);
  assert.throws(() => decodeCurrentPcbViaSdkMethod(copied, "create")); assert.throws(() => decodeCurrentPcbViaSdkMethod(metadata("create"), "save"));
  const result = Array.from({ length: 9 }, (_value, index) => property(String(index), index === 3 || index === 6 ? { type: "function", className: "AsyncFunction",
    objectId: index === 3 ? "original-create" : "original-save", description: CURRENT_PCB_VIA_WRITE_SDK_METHODS[index === 3 ? "create" : "save"] } : { type: "object", objectId: `member${String(index)}` }));
  result.push(property("length", { type: "number", value: 9 }));
  const tuple = { result, internalProperties: [{ name: "[[Prototype]]", value: { type: "object", objectId: "array" } }] };
  assert.deepEqual(decodeCurrentPcbViaSdkTuple(tuple), { create: "original-create", save: "original-save" });
  result.pop(); assert.throws(() => decodeCurrentPcbViaSdkTuple(tuple));
});
void test("full API pin refuses small sources, proxies and getters before touching them", () => {
  let calls = 0; const rejected = (): never => { calls += 1; throw new Error("effectful source"); };
  assert.throws(() => { qualifyCurrentPcbViaSdkSource({ scriptSource: CURRENT_PCB_VIA_WRITE_SDK_METHODS.create }); });
  assert.throws(() => { qualifyCurrentPcbViaSdkSource(Object.defineProperty({}, "scriptSource", { get: rejected })); });
  assert.throws(() => { qualifyCurrentPcbViaSdkSource(new Proxy({}, { ownKeys: rejected, getPrototypeOf: rejected })); }); assert.equal(calls, 0);
});
void test("early fence vocabulary retains fixed source sites and admits no arbitrary conditions, SQL or caller programs", () => {
  const cases = currentSelectedFileMainSqlFenceNativeCases(); assert.equal(cases.length, 81);
  for (const command of cases) {
    const wire = currentSelectedFileMainSqlFenceWire(command, PROFILE.main.total); assert.equal(wire.request["action"], "main-send");
    for (const field of ["condition", "lineNumber", "functionDeclaration", "sql", "sessionId"]) { assert.equal(Object.hasOwn(wire.request, field), false); }
    assert.throws(() => currentSelectedFileMainSqlFenceWire({ ...command, extra: "caller" }, 1));
  }
  assert.match(currentSelectedFileMainSqlFenceNativeSource(), /EasyedaDiagnosticFixedTable\.Load/u);
  assert.equal(SOURCE.sites.import.breakpointColumnNumber, 20_050); assert.equal(SOURCE.sites.afterImports.breakpointColumnNumber, 20_158);
  assert.throws(() => qualifyCurrentSelectedFileMainSqlFenceSource("copied-source"));
});
void test("matching bootstrap and owner JSON cannot mint original native ownership or observation packets", async () => {
  assert.throws(() => requireCurrentSelectedFileMainSqlFenceBootstrap({ profile: "private.selected-file-main-sql-fence-bootstrap.v1", executionAuthorized: false }, {}));
  const owner = await import("../src/current-pcb-via-write-owner.ts");
  const central = await import("../src/current-pcb-diagnostic-owner.ts");
  assert.throws(() => { central.requireOriginalCurrentPcbViaUploadRequestDispatched({profile:"private.current-pcb-via-save-producer-origin.v1"},{},{}); }, /ORIGINAL/u);
  assert.throws(() => central.requireOriginalCurrentProjectSyncQuiesceOrigin({profile:"private.current-pcb-via-project-sync-quiesce-origin.v1"},{},{}), /ORIGINAL/u);
  assert.throws(() => Reflect.apply(central.requireOriginalCurrentPcbViaSaveWorkerOrigin, undefined, [{ profile: "private.current-pcb-via-save-worker-origin.v1" }, {}, {}]), /SAVE_WORKER_ORIGINAL/u);
  assert.throws(() => central.consumeOriginalCurrentProjectStructureBodyReservation({profile:"private.current-project-structure-body-reservation.v1"},{},{}), /ORIGINAL_RESERVATION/u);
  assert.throws(() => central.consumeOriginalCurrentProjectStructureMainPublication({profile:"private.current-project-structure-main-publication.v1"},{},{}), /PUBLICATION_ORIGINAL/u);
  assert.throws(() => central.consumeOriginalCurrentProjectHistorySqlCompletion({ profile: "private.current-project-history-sql-completion.v1" }, {}, {}), /ORIGINAL_COMPLETION/u);
  assert.throws(() => Reflect.apply(central.requireOriginalCurrentPcbViaMainOrigin, undefined, [{ profile: "private.current-pcb-via-main-origin.v1" }, {}, {}]), /MAIN_ORIGINAL/u);
  const forged: unknown = Object.create(owner.CurrentPcbViaWriteOwner.prototype);
  // Deliberate untyped runtime forgery; no constructor or native process runs.
  assert.throws(() => Reflect.apply(owner.assertOriginalCurrentPcbViaWriteOwner, undefined, [forged]));
  assert.throws(() => Reflect.apply(owner.originalCurrentPcbViaWriteNoResource, undefined, [{}]), /ORIGINAL_PLAN/u);
  assert.throws(() => Reflect.apply(owner.requireOriginalCurrentPcbViaWriteNoResourceProof, undefined, [{ profile: "private.current-pcb-via-write-no-resource.v1" }, {}]), /ORIGINAL_PLAN/u);
  const start: unknown = Reflect.get(owner.CurrentPcbViaWriteOwner.prototype, "startViaWriteGeneration"); assert.ok(typeof start === "function");
  await assert.rejects(async (): Promise<void> => { const pending: unknown = Reflect.apply(start, forged, [{}]); assert.ok(pending instanceof Promise); await pending; }, /ORIGINAL_PLAN/u);
  const page: unknown = Reflect.get(owner.CurrentPcbViaWriteOwner.prototype, "observeViaWriteStartPage"); assert.ok(typeof page === "function");
  assert.throws(() => Reflect.apply(page, forged, [{}]), /ORIGINAL_FACTORY/u);
  for (const lookup of [owner.requireOriginalCurrentPcbViaNativeObservation, owner.requireOriginalCurrentPcbViaSceneObservation, owner.requireOriginalCurrentPcbViaWriteStage]) {
    assert.throws(() => Reflect.apply(lookup, undefined, [forged, {}, {}, "before"]));
  }
});
void test("composed native fragment is idempotent and keeps old births, caps and primitive methods separate", async () => {
  const original = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  const generated = compose(original); assert.equal(compose(generated), generated);
  const earlierVia = generated.replace(`return pcbViaWrite209?${String(PROFILE.renderer.total)}:spatial209?384:`, "return pcbViaWrite209?766:spatial209?384:").replace(`$requestLimit=if ($PcbViaWrite209) {${String(PROFILE.renderer.total)}}`, "$requestLimit=if ($PcbViaWrite209) {766}");
  assert.equal(compose(earlierVia), generated); assert.ok(Buffer.byteLength(generated) < 2 * 1024 * 1024);
  for (const text of ["EasyedaPcbViaWriteBirth", "CreatePcbViaWrite209()", "via-old-birth-smoke", "via-retain-main-until-exit", "viaConstructionComplete", "stage==\"save\"", "pcb-diagnostic-conflicting-via-purpose",
    `return pcbViaWrite209?${String(PROFILE.renderer.total)}:spatial209?384:componentSpatial209?419:workerStartup?256:stringPrecreate?3309:103`, "viaSdkProperties>=3", "SendPcbViaSpatial", "via-main-precreate-required", "via-main-precreate-original-enrollment", "VerifyViaMainPrecreateSmoke", "VerifyPcbViaMainLiveHistorySmoke", "viaHistoryStep!=20", "viaBeginArms.Count!=4", "viaHistoryArms.Count!=9", "viaStructureMainArms.Count!=9"]) { assert.ok(generated.includes(text), text); }
  assert.equal(generated.includes("sqlite3.Database="), false); assert.equal(generated.includes("Object.setPrototypeOf(sc.Database"), false);
  assert.throws(() => compose(original.replace("[switch]$StringPrecreate,", "[switch]$ForeignPurpose,")), /ANCHOR/u);
});

void test("all119 fixed worker cases retain native session custody and cannot cross released grammars", () => {
  const cases = currentPcbViaWorkerNativeCases(); assert.equal(cases.length, 119);
  for (const fixed of cases) {
    const wire = currentPcbViaWorkerWire(fixed, PROFILE.renderer.total);
    const encoded = bytes({ id: PROFILE.renderer.total, ...wire.command, viaWorkerCommand: true, sessionId: "original-worker" });
    assert.deepEqual(currentPcbViaWriteNativeRequest(encoded), wire.request);
    for (const key of ["sessionId", "code", "functionDeclaration", "condition", "lineNumber", "columnNumber", "sql", "topic"]) { assert.equal(Object.hasOwn(wire.request, key), false); }
    assert.throws(() => diagnosticNativeRequest(encoded)); assert.throws(() => spatialDiagnosticNativeRequest(encoded));
    assert.throws(() => currentPcbViaWorkerWire({ ...fixed, sessionId: "caller-worker" }, 1));
    assert.throws(() => currentPcbViaWriteNativeRequest(bytes({ id: 1, ...wire.command, viaWorkerCommand: true, sessionId: "original-worker", extra: true })));
  }
});
