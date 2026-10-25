import assert from "node:assert/strict";
import { createHash, webcrypto } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { test } from "node:test";
import vm from "node:vm";
import { readExactUtf8Artifact } from "../src/artifacts.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { buildNetlistFilesProgram, validateNetlistFilesResult } from "../src/netlist-files-program.ts";
import { prepareNetlistFile } from "../src/netlist-files-runtime.ts";
import { NETLIST_FILES_FORMAT, NETLIST_FILES_MAX_INPUT_BYTES, NETLIST_FILES_METHOD, expectedNetlistDifferences,
  netlistCompareFilesRequestSchema, netlistFilesRequestSchema, netlistManagedFileSchema, parseNetlistFileText,
  queryNetlistFiles, validateNetlistFileContents, validateNetlistFilesArguments } from "../src/netlist-files.ts";
import type { NetlistDifference, NetlistManagedFile } from "../src/netlist-files.ts";

const original = "$PACKAGES\r\n'R_0603' ! 'RES' ! '10k' ; R1 R2 \r\n$A_PROPERTIES\r\nCODE 'TEST' ; R1\r\n$NETS\r\nGND ; R1.1 R2.1\r\n'POWER_3V3' ; R1.2\r\n$SCHEDULE\r\n$END\r\n";
const changed = original.replace("R1.1 R2.1", "R1.1").replace("'POWER_3V3' ; R1.2", "'POWER_3V3' ; R1.2 R2.1");
function file(text: string, name = "test.tel"): NetlistManagedFile {
  return { schema: "easyeda-pro-control.netlist-file.v1", format: NETLIST_FILES_FORMAT, name,
    path: "/synthetic/not-used-by-program.tel", bytes: Buffer.byteLength(text), sha256: createHash("sha256").update(text).digest("hex") };
}
function request(left = original, right = changed): unknown { return { action: "compare-files", left: file(left), right: file(right) }; }

void test("Allegro subset retains complete pin and footprint memberships across CRLF and vendor line continuation", () => {
  const model = parseNetlistFileText(original);
  assert.deepEqual([model.componentCount, model.pinCount, model.netCount], [2, 3, 2]);
  assert.deepEqual([...model.packages], [["R_0603", ["R1", "R2"]]]);
  assert.deepEqual([...model.nets], [["GND", ["R1.1", "R2.1"]], ["POWER_3V3", ["R1.2"]]]);
  assert.deepEqual(parseNetlistFileText(original.replace("R1.1 R2.1", "R1.1 ,\r\n        R2.1")), model);
});

void test("full recognition refuses vendor silent drops, duplicate/overwritten pins and unsupported parser forms", () => {
  const invalid = [
    "garbage", "$PACKAGES\n$NETS\n$END\n", original.replace("$END", ""), original.replace("$NETS", " $NETS"),
    original.replace("R1 R2", "R1 R1"), original.replace("R1.1 R2.1", "R1.1 R1.1"), original.replace("R1.1 R2.1", "R1.1 R9.1"),
    original.replace("R1.2", "R1.1"), original.replace("GND ;", "__proto__ ;"), original.replace("R1.2", "R1.constructor"),
    original.replace("R1.2", "R1.2:F1"), original.replace("$NETS", "$FUNCTIONS\n$NETS"), original.replace("CODE 'TEST'", "Designator R9"),
    original.replace("R1 R2", "R1\tR2"), original.replace("10k", "10 k"), original.replace("10k", "10µ"),
    original.replace("$SCHEDULE", "$SCHEDULE\nignored data"), original.replace("$END", "$END\n$NETS"),
    original.replace("$END", "$END\ntrailing data"), original.replace("GND ;", "GND ; ;"),
  ];
  for (const input of invalid) { assert.throws(() => parseNetlistFileText(input), /Netlist input refused/u); }
});

void test("comparison independently checks added/removed net and package memberships, preserving quoted native net names", () => {
  const diff = expectedNetlistDifferences(parseNetlistFileText(original), parseNetlistFileText(changed));
  assert.deepEqual(diff, [
    { type: "NET", object: "'POWER_3V3'", net1: [], net2: ["R2.1"] },
    { type: "NET", object: "GND", net1: ["R2.1"], net2: [] },
  ]);
  const movedPackage = original.replace("'R_0603'", "'R_0805'");
  assert.deepEqual(expectedNetlistDifferences(parseNetlistFileText(original), parseNetlistFileText(movedPackage)), [
    { type: "COMPONENT", object: "R_0603", net1: ["R1", "R2"], net2: [] },
    { type: "COMPONENT", object: "R_0805", net1: [], net2: ["R1", "R2"] },
  ]);
  const valuesOnly = parseNetlistFileText(original.replace("10k", "100k").replace("'TEST'", "'OTHER'"));
  assert.deepEqual(expectedNetlistDifferences(parseNetlistFileText(original), valuesOnly), []);
});

void test("schemas exclude document overloads, caller paths at preparation, alternate parsers and oversized inputs", () => {
  assert.equal(netlistFilesRequestSchema.safeParse({ action: "prepare-file", name: "x.enet", text: original, confirmLocalArtifact: true }).success, false);
  assert.equal(netlistFilesRequestSchema.safeParse({ action: "prepare-file", name: "x.tel", text: original, confirmLocalArtifact: true, path: "/tmp/x.tel" }).success, false);
  assert.equal(netlistFilesRequestSchema.safeParse({ action: "prepare-file", name: "../x.tel", text: original, confirmLocalArtifact: true }).success, false);
  assert.equal(netlistFilesRequestSchema.safeParse({ action: "prepare-file", name: "x.tel", text: "X".repeat(NETLIST_FILES_MAX_INPUT_BYTES + 1), confirmLocalArtifact: true }).success, false);
  assert.equal(netlistCompareFilesRequestSchema.safeParse({ action: "compare-files", left: "document-uuid", right: file(original) }).success, false);
  assert.equal(netlistCompareFilesRequestSchema.safeParse({ action: "compare-files", left: { projectUuid: "p", documentUuid: "d" }, right: file(original) }).success, false);
  assert.equal(validateNetlistFilesArguments({ action: "prepare-file", name: "x.tel", text: "nonsense", confirmLocalArtifact: true })["valid"], false);
  assert.equal(queryNetlistFiles({ includeSchemas: true })["invocationEnabledByDiscovery"], false);
  assert.throws(() => validateNetlistFileContents(file(original), changed), /exact managed descriptor/u);
});

void test("recognized subset bounds decoded components, pins and nets before any vendor call", () => {
  const manyComponents = `$PACKAGES\nR ; ${Array.from({ length: 257 }, (_, index) => `R${index}`).join(" ")}\n$NETS\n$END\n`;
  assert.throws(() => parseNetlistFileText(manyComponents), /excessive components/u);
  const manyPins = `$PACKAGES\nR ; U1\n$NETS\nN ; ${Array.from({ length: 2049 }, (_, index) => `U1.${index}`).join(" ")}\n$END\n`;
  assert.throws(() => parseNetlistFileText(manyPins), /bound|excessive pin/u);
  const manyNets = `$PACKAGES\nR ; U1\n$NETS\n${Array.from({ length: 1025 }, (_, index) => `N${index} ; U1.${index}`).join("\n")}\n$END\n`;
  assert.throws(() => parseNetlistFileText(manyNets), /excessive nets/u);
});

interface Execution { readonly result: Record<string, unknown>; readonly calls: number; readonly timersCleared: number }
async function runProgram(methodBody: string, response: readonly NetlistDifference[] = expectedNetlistDifferences(parseNetlistFileText(original), parseNetlistFileText(changed))): Promise<Execution> {
  let deadline: (() => void) | undefined, elapsed = 0, timersCleared = 0;
  const sandbox = vm.createContext({ File, Blob, Uint8Array, TextEncoder, crypto: webcrypto, performance: { now: (): number => elapsed },
    advanceClock: (): void => { elapsed += 10_001; },
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- The fake browser timer must retain the callback to exercise deadline expiry during an awaited SDK call.
    setTimeout: (callback: () => void): number => { deadline = callback; return 1; },
    clearTimeout: (): void => { timersCleared += 1; }, expire: (): void => { deadline?.(); } });
  vm.runInContext(`globalThis.window=globalThis;globalThis.top=globalThis;
globalThis.location={href:'https://client/editor?cll=info',origin:'https://client'};
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href};
globalThis.PRO_EDITOR_MODE='CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';
globalThis.calls=0;globalThis.response=${JSON.stringify(response)};
globalThis._MSG_BUS2_EXTAPI_={rpcCall(){throw new Error('should not call synthetic RPC');}};
globalThis.gVars={extensionApiMessageBus2:_MSG_BUS2_EXTAPI_};globalThis.UI={gVars};
globalThis.eda={extensionUuid:'7e06d286b1ac846ef7eab9c7f2a9ee40',sys_Tool:{async netlistComparison(left,right){calls++;if(!(left instanceof File)||!(right instanceof File)||left.name!=='test.tel'||right.name!=='test.tel')throw new Error('input mismatch');${methodBody}}}};`, sandbox);
  const envelope: unknown = await vm.runInContext(`(async()=>{${buildNetlistFilesProgram(request(), original, changed)}})()`, sandbox) as unknown;
  const result = validateNetlistFilesResult(request(), original, changed, decodeExactReadEnvelope(envelope));
  const calls = vm.runInContext("calls", sandbox) as unknown;
  assert.equal(typeof calls, "number");
  return { result, calls: Number(calls), timersCleared };
}

void test("fixed program constructs exact Files and requires two complete SDK membership samples", async () => {
  const outcome = await runProgram("return response;");
  assert.equal(outcome.result["ok"], true); assert.equal(outcome.result["equalInScope"], false);
  assert.equal(outcome.calls, 2); assert.equal(outcome.timersCleared, 1);
  assert.equal(outcome.result["method"], NETLIST_FILES_METHOD);
  assert.equal(outcome.result["cadAuthority"], false);
});

void test("false, undefined, empty-after-failed-parse, unknown fields and partial SDK output refuse without resampling", async () => {
  for (const body of ["return false;", "return undefined;", "return [];", "return response.slice(0,1);", "return response.map(row=>({...row,extra:1}));", "return response.map(row=>({...row,type:'Net'}));"]) {
    const outcome = await runProgram(body);
    assert.equal(outcome.result["ok"], false); assert.equal(outcome.calls, 1);
    assert.equal(outcome.timersCleared, 1);
  }
});

void test("owner drift and expired observations stop before the second public call", async () => {
  for (const body of ["eda.sys_Tool={};return response;", "gVars.extensionApiMessageBus2={};return response;", "expire();return response;", "advanceClock();return response;",
    "Object.setPrototypeOf(eda.sys_Tool,{});return response;", "Object.setPrototypeOf(_MSG_BUS2_EXTAPI_,{});return response;"]) {
    const outcome = await runProgram(body);
    assert.equal(outcome.result["ok"], false); assert.equal(outcome.calls, 1); assert.equal(outcome.timersCleared, 1);
  }
});

void test("receiver decoder refuses a copied success with missing or extra differences and foreign input hash", () => {
  const differences = expectedNetlistDifferences(parseNetlistFileText(original), parseNetlistFileText(changed));
  const success = { ok: true, kind: "netlist-files-comparison", method: NETLIST_FILES_METHOD,
    leftSha256: file(original).sha256, rightSha256: file(changed).sha256, samplesMatched: true, independentMembershipMatched: true, differences };
  assert.equal(validateNetlistFilesResult(request(), original, changed, success)["ok"], true);
  for (const bad of [{ ...success, differences: [] }, { ...success, differences: [...differences, differences[0]] }, { ...success, leftSha256: "0".repeat(64) }]) {
    assert.throws(() => validateNetlistFilesResult(request(), original, changed, bad));
  }
});

void test("offline preparation publishes exact managed bytes and later descriptor reads detect tampering", async () => {
  const prepared = await prepareNetlistFile({ action: "prepare-file", name: "input.tel", text: original, confirmLocalArtifact: true });
  const artifact = netlistManagedFileSchema.parse(prepared["file"]);
  const bytes = await readFile(artifact.path), verified = await readExactUtf8Artifact(artifact);
  assert.equal(bytes.toString(), original);
  assert.equal(verified.text, original);
  const secondPrepared = await prepareNetlistFile({ action: "prepare-file", name: "input.tel", text: original, confirmLocalArtifact: true });
  const second = netlistManagedFileSchema.parse(secondPrepared["file"]);
  assert.notEqual(second.path, artifact.path);
  await writeFile(artifact.path, changed, { mode: 0o600 });
  await assert.rejects(readExactUtf8Artifact(artifact), /byte length|SHA-256/u);
});
