import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";
import { currentFootprintCopyDependencyNativeCases, currentFootprintCopyProducerNativeCases, currentPcb209RatlineWorkerStartupNativeParentCases, currentPcb209WorkerStartupNativeCases, currentPcb209WorkerStartupNativeParentCases, currentPcbWorkerStartupNativeCases, currentPcbWorkerStartupNativeParentCases,
  currentPcbWorkerStartupNativeSource } from "../src/current-pcb-worker-startup-native.ts";
import { currentFootprintCopyPreparationWire, currentPcb209RatlineWorkerStartupWire, currentPcb209WorkerStartupWire, currentPcbWorkerStartupWire } from "../src/current-pcb-worker-startup-wire.ts";
import { CURRENT_PCB_209_RATLINE_OPENING_FUNCTION } from "../src/current-pcb-209-ratline-opening-program.ts";
import { CURRENT_PCB_WORKER_STARTUP_UI_ACTOR_CLOCK_FUNCTION, CURRENT_PCB_WORKER_STARTUP_WORKER_ACTOR_CLOCK_FUNCTION, currentPcbWorkerStartupUiActorCommand } from "../src/current-pcb-worker-startup-actor.ts";
import { CURRENT_PCB_WORKER_STARTUP_CHANNEL_CALLS } from "../src/current-pcb-worker-startup-channel-observation.ts";

const samples = currentPcbWorkerStartupNativeCases();
void test("ratline PCB program is purpose-specific and wire callers cannot provide remaining time", () => {
  const ratline = currentPcb209RatlineWorkerStartupNativeParentCases();
  for (const sample of ratline) {
    const wire = currentPcb209RatlineWorkerStartupWire(sample, 256);
    assert.equal(Object.hasOwn(wire.request, "nativeRemainingMilliseconds"), false);
    if (sample.method === "Runtime.callFunctionOn" && sample.params.functionDeclaration === CURRENT_PCB_209_RATLINE_OPENING_FUNCTION) {
      assert.throws(() => currentPcb209WorkerStartupWire(sample, 256));
      assert.throws(() => currentPcbWorkerStartupWire(sample, 256));
      assert.throws(() => currentPcb209RatlineWorkerStartupWire({ ...sample, params: { ...sample.params,
        arguments: [...sample.params.arguments, { value: 3_600_000 }] } }, 256));
      assert.throws(() => currentPcb209RatlineWorkerStartupWire({ ...sample, nativeRemainingMilliseconds: 3_600_000 }, 256));
    }
  }
  for (const sample of currentPcb209WorkerStartupNativeParentCases()) {
    if (sample.method === "Runtime.callFunctionOn" && ["pcb-preflight", "pcb-open-document", "pcb-observe"].includes(String(currentPcb209WorkerStartupWire(sample, 256).request["parentPhase"]))) {
      assert.throws(() => currentPcb209RatlineWorkerStartupWire(sample, 256));
    }
  }
});
void test("startup parent grammar retains browser-global reads and exact sealed opener, never caller code", () => {
  const parents = currentPcbWorkerStartupNativeParentCases(); assert.equal(parents.length, 11);
  for (const sample of parents) {
    const result = currentPcbWorkerStartupWire(sample, 256);
    assert.deepEqual(result.command, { id: 256, ...sample });
    assert.equal(result.request["action"], "worker-startup-parent");
    assert.ok(!Object.hasOwn(result.request, "functionDeclaration"));
    assert.throws(() => currentPcbWorkerStartupWire({ ...sample, params: { ...sample.params, extra: true } }, 256));
    if (sample.method === "Target.getTargets") {
      assert.ok(!Object.hasOwn(result.request, "sessionId"));
      assert.throws(() => currentPcbWorkerStartupWire({ ...sample, sessionId: "parent" }, 256));
    }
    if (sample.method === "Runtime.callFunctionOn" && sample.params.arguments.length === 2) {
      for (const patch of [{ functionDeclaration: `${sample.params.functionDeclaration} ` }, { uniqueContextId: "bad\ncontext" },
        { arguments: [{ value: { ...sample.params.arguments[0].value, projectUuid: "0".repeat(64) } }, sample.params.arguments[1]] },
        { throwOnSideEffect: true }, { awaitPromise: false }]) {
        assert.throws(() => currentPcbWorkerStartupWire({ ...sample, params: { ...sample.params, ...patch } }, 256));
      }
      let hooks = 0;
      const parameters = { ...sample.params };
      Object.defineProperty(parameters, "functionDeclaration", { get: (): never => { hooks += 1; throw new Error("Unexpected getter"); } });
      assert.throws(() => currentPcbWorkerStartupWire({ ...sample, params: parameters }, 256)); assert.equal(hooks, 0);
    }
  }
});
void test("startup wire preserves every fixed command and strips native program text", () => {
  assert.equal(samples.length, 40);
  for (const sample of samples) {
    const wire = currentPcbWorkerStartupWire(sample, 1);
    assert.deepEqual(wire.command, { id: 1, ...sample });
    assert.equal(wire.request["action"], "worker-startup-send");
    assert.equal(wire.request["method"], sample.method);
    for (const key of ["params", "functionDeclaration", "expression", "objectGroup", "arguments", "lineNumber", "columnNumber"]) {
      assert.ok(!Object.hasOwn(wire.request, key));
    }
    assert.ok(Object.isFrozen(wire) && Object.isFrozen(wire.command.params) && Object.isFrozen(wire.request));
  }
});
void test("startup channel wire reconstructs only the three fixed observation programs", () => {
  for (const [phase, expected] of Object.entries(CURRENT_PCB_WORKER_STARTUP_CHANNEL_CALLS)) {
    const sample = samples.find(value => value.method === "Runtime.callFunctionOn" && value.params.functionDeclaration === expected.program);
    assert.ok(sample?.method === "Runtime.callFunctionOn");
    const wire = currentPcbWorkerStartupWire(sample, 175);
    assert.equal(wire.request["startupPhase"], `channel-${phase}`);
    assert.equal(wire.request["action"], "worker-startup-send");
    assert.equal(sample.params.arguments.length, expected.arguments);
    assert.equal(sample.params.returnByValue, expected.returnByValue);
    assert.equal(Object.hasOwn(wire.request, "functionDeclaration"), false);
    for (const patch of [{ uniqueContextId: "caller-context" }, { arguments: [{ value: "caller-receiver" }] },
      { objectGroup: "foreign-group" }, { awaitPromise: true }, { throwOnSideEffect: false }]) {
      assert.throws(() => currentPcbWorkerStartupWire({ ...sample, params: { ...sample.params, ...patch } }, 175));
    }
  }
});
void test("startup actor wire admits only exact fixed UI and original-receiver worker programs", () => {
  const ui = currentPcbWorkerStartupUiActorCommand("parent-session", "original-context");
  const worker = samples.find(sample => sample.method === "Runtime.callFunctionOn" &&
    sample.params.functionDeclaration === CURRENT_PCB_WORKER_STARTUP_WORKER_ACTOR_CLOCK_FUNCTION);
  assert.ok(worker?.method === "Runtime.callFunctionOn");
  const uiWire = currentPcbWorkerStartupWire(ui, 100), workerWire = currentPcbWorkerStartupWire(worker, 101);
  assert.equal(uiWire.request["action"], "worker-startup-parent"); assert.equal(uiWire.request["parentPhase"], "actor-clock");
  assert.equal(workerWire.request["action"], "worker-startup-send"); assert.equal(workerWire.request["startupPhase"], "actor-clock");
  assert.equal(uiWire.request["uniqueContextId"], "original-context");
  assert.equal(Object.hasOwn(uiWire.request, "functionDeclaration"), false);
  assert.equal(Object.hasOwn(workerWire.request, "functionDeclaration"), false);
  for (const patch of [{ functionDeclaration: `${ui.params.functionDeclaration} ` }, { arguments: [{ value: "caller-target" }] },
    { objectId: "caller-receiver" }, { awaitPromise: true }, { throwOnSideEffect: false }, { returnByValue: false },
    { uniqueContextId: "foreign\ncontext" }]) {
    assert.throws(() => currentPcbWorkerStartupWire({ ...ui, params: { ...ui.params, ...patch } }, 100));
  }
  for (const patch of [{ uniqueContextId: "caller-context" }, { arguments: [] }, { arguments: [{ value: "caller-bus" }] },
    { objectGroup: "foreign-group" }, { awaitPromise: true }, { throwOnSideEffect: false }, { returnByValue: false }]) {
    assert.throws(() => currentPcbWorkerStartupWire({ ...worker, params: { ...worker.params, ...patch } }, 101));
  }
});
void test("startup wire refuses extra keys, program changes, effects and arbitrary breakpoint coordinates", () => {
  for (const sample of samples) {
    assert.throws(() => currentPcbWorkerStartupWire({ ...sample, extra: 1 }, 1));
    assert.throws(() => currentPcbWorkerStartupWire({ ...sample, params: { ...sample.params, extra: 1 } }, 1));
    if (sample.method === "Runtime.callFunctionOn") {
      for (const patch of [{ functionDeclaration: `${sample.params.functionDeclaration} ` }, { throwOnSideEffect: false },
        { returnByValue: !sample.params.returnByValue }, { arguments: [...sample.params.arguments, { objectId: "extra" }] }]) {
        assert.throws(() => currentPcbWorkerStartupWire({ ...sample, params: { ...sample.params, ...patch } }, 1));
      }
    }
    if (sample.method === "Debugger.setBreakpoint") {
      assert.throws(() => currentPcbWorkerStartupWire({ ...sample, params: { location: { ...sample.params.location, columnNumber: 1 } } }, 1));
    }
  }
});
void test("startup wire refuses accessors and proxies without invoking caller hooks", () => {
  const sample = samples[0]; assert.ok(sample !== undefined); let hooks = 0;
  const hostile = { ...sample };
  Object.defineProperty(hostile, "params", { get: (): never => { hooks += 1; throw new Error("Getter executed"); } });
  assert.throws(() => currentPcbWorkerStartupWire(hostile, 1));
  assert.throws(() => currentPcbWorkerStartupWire(new Proxy(sample, { ownKeys: (): never => { hooks += 1; throw new Error("Proxy executed"); } }), 1));
  assert.equal(hooks, 0);
});
void test("startup identifiers and budget are bounded; placeholder-shaped handles stay distinct", () => {
  const sample = samples.find(value => value.method === "Runtime.callFunctionOn" && value.params.arguments.length === 1);
  assert.ok(sample?.method === "Runtime.callFunctionOn");
  const wire = currentPcbWorkerStartupWire({ ...sample, params: { ...sample.params,
    objectId: "__startup_argument0__", arguments: [{ objectId: "different" }] } }, 256);
  assert.equal(wire.request["objectId"], "__startup_argument0__");
  assert.equal(wire.request["argument0"], "different");
  for (const id of [0, -0, -1, 257, 1.1, Number.NaN, Number.POSITIVE_INFINITY]) { assert.throws(() => currentPcbWorkerStartupWire(sample, id)); }
  for (const sessionId of ["", "a".repeat(129), "bad\n", null, 4]) { assert.throws(() => currentPcbWorkerStartupWire({ ...sample, sessionId }, 1)); }
});
void test("native startup source is generated exactly and keeps the distinct purpose boundary", async () => {
  const native = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  const generated = currentPcbWorkerStartupNativeSource();
  assert.ok(native.includes(generated));
  assert.ok(!generated.includes("parameters.Replace("));
  assert.ok(generated.includes("smoke-placeholder") && generated.includes("smoke-parity"));
  assert.ok(native.includes("if(!workerStartup || stringPrecreate)throw Error(\"startup-purpose\")"));
  assert.ok(native.includes("if (($StringPrecreate -and $WorkerStartup) -or ($Layers209 -and ($StringPrecreate -or $WorkerStartup)))"));
  assert.ok(native.includes("[EasyedaWorkerStartupProtocol]::VerifySmoke()"));
  assert.ok(native.includes("if ($startupPurpose -and @('Browser.getVersion'"));
});

void test("native 209 cases preserve every command except the reviewed serial site and refuse the other generation", () => {
  const current = currentPcb209WorkerStartupNativeCases(); assert.equal(current.length, samples.length + 11);
  let differences = 0;
  for (const [index, legacy] of samples.entries()) {
    const selected = current[index]; assert.ok(selected !== undefined);
    assert.deepEqual(currentPcb209WorkerStartupWire(selected, 256).request, currentPcbWorkerStartupWire(legacy, 256).request);
    if (legacy.method === "Debugger.setBreakpoint" && legacy.params.location.columnNumber === 145_558) {
      assert.equal(selected.method, "Debugger.setBreakpoint");
      if (selected.method !== "Debugger.setBreakpoint") { assert.fail("Expected serial breakpoint"); }
      assert.deepEqual(legacy.params.location, { scriptId: "__startup_scriptId__", lineNumber: 108, columnNumber: 145_558 });
      assert.deepEqual(selected.params.location, { scriptId: "__startup_scriptId__", lineNumber: 108, columnNumber: 145_582 });
      assert.throws(() => currentPcb209WorkerStartupWire(legacy, 256));
      assert.throws(() => currentPcbWorkerStartupWire(selected, 256)); differences += 1;
    } else { assert.deepEqual(selected, legacy); }
    assert.throws(() => currentPcb209WorkerStartupWire({ ...selected, generation: "209" }, 256));
    assert.throws(() => currentPcb209WorkerStartupWire(selected, 257));
  }
  assert.equal(differences, 1);
});

void test("native 209 launch fixes its encoder without a caller generation field or duplicate program table", async () => {
  const native = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  const generated = currentPcbWorkerStartupNativeSource();
  assert.equal(generated.split("public static class EasyedaWorkerStartupProtocol").length, 2);
  assert.ok(generated.includes("public static string Encode209("));
  assert.ok(generated.includes("static string EncodeCore("));
  assert.ok(!generated.includes("public static string EncodeCore("));
  assert.ok(generated.includes("return EncodeCore(id,method,sessionId,phase,fields,false);"));
  assert.ok(generated.includes("return EncodeCore(id,method,sessionId,phase,fields,true);"));
  assert.ok(native.includes("readonly bool workerStartup209;"));
  assert.ok(native.includes("if ($WorkerStartup209 -and ($StringPrecreate -or $WorkerStartup -or $Layers209))"));
  assert.ok(native.includes("elseif ($WorkerStartupEmpty209) {[EasyedaDiagnosticOwner]::CreateWorkerStartupEmpty209()} elseif ($WorkerStartup209) {[EasyedaDiagnosticOwner]::CreateWorkerStartup209()}"));
  assert.ok(native.includes("if ($WorkerStartupEmpty209 -and ($StringPrecreate -or $WorkerStartup -or $Layers209 -or $WorkerStartup209))"));
  assert.ok(native.includes("workerStartup209?EasyedaWorkerStartupProtocol.Encode209("));
  assert.ok(native.includes("[EasyedaWorkerStartupProtocol]::Verify209Smoke()"));
  assert.ok(native.includes('owner.RequestLimit!=256 || owner.nextRequest!=1'));
  assert.ok(native.includes('fields.Add("generation","209");bool extra=false;'));
  assert.ok(Buffer.byteLength(native) < 1_048_576);
});

void test("startup compile-only packing retains every legacy,209 and parent expected command byte", () => {
  const generated = currentPcbWorkerStartupNativeSource();
  const begin = generated.indexOf("static string[] SmokeExpected()"),
    end = generated.indexOf("static void VerifySmokeCore(bool workerStartup209)");
  assert.ok(begin > 0 && end > begin);
  const decoder = generated.slice(begin, end), encoded = /const string encoded=@"([A-Za-z\d+/=]+)";/u.exec(decoder)?.[1];
  assert.ok(encoded !== undefined);
  // oxlint-disable-next-line node/no-sync -- Decodes one bounded deterministic test-only generated constant in memory.
  const decoded = gunzipSync(Buffer.from(encoded, "base64"));
  assert.equal(/bytes=new byte\[(\d+)\]/u.exec(decoder)?.[1], String(decoded.length));
  assert.ok(decoder.includes(createHash("sha256").update(decoded).digest("hex")));
  assert.ok(decoder.includes("System.Convert.ToBase64String(packed)==encoded"));
  assert.ok(decoder.includes("new System.Text.UTF8Encoding(false,true)"));
  const commands = decoded.toString("utf8").split("\0"), expected: string[] = [];
  for (const [index, sample] of samples.entries()) {
    const current = currentPcb209WorkerStartupNativeCases()[index]; assert.ok(current !== undefined);
    for (const value of [current, sample]) {
      const text = JSON.stringify({ id: 1, method: value.method, params: value.params, sessionId: value.sessionId });
      if (!expected.includes(text)) { expected.push(text); }
    }
  }
  const footprintCases = [...currentPcb209WorkerStartupNativeCases().slice(samples.length), ...currentFootprintCopyDependencyNativeCases(), ...currentFootprintCopyProducerNativeCases()];
  for (const sample of footprintCases) {
    expected.push(JSON.stringify({ id: 1, method: sample.method, params: sample.params, sessionId: sample.sessionId }));
  }
  for (const [index, sample] of currentPcbWorkerStartupNativeParentCases().entries()) {
    const current = currentPcb209WorkerStartupNativeParentCases()[index]; assert.ok(current);
    for (const value of [current, sample]) {
      const text = JSON.stringify({ id: 256, method: value.method, params: value.params,
        ...(value.sessionId === undefined ? {} : { sessionId: value.sessionId }) });
      if (!expected.includes(text)) { expected.push(text); }
    }
  }
  for (const sample of currentPcb209RatlineWorkerStartupNativeParentCases()) {
    const wire = currentPcb209RatlineWorkerStartupWire(sample, 256);
    const opening = sample.method === "Runtime.callFunctionOn" && sample.params.functionDeclaration === CURRENT_PCB_209_RATLINE_OPENING_FUNCTION;
    const params = opening ? { ...sample.params, arguments: [...sample.params.arguments, { value: wire.request["parentPhase"] === "pcb-open-document" ? 1234 : 0 }] } : sample.params;
    const text = JSON.stringify({ id: 256, method: sample.method, params,
      ...(sample.sessionId === undefined ? {} : { sessionId: sample.sessionId }) });
    if (!expected.includes(text)) { expected.push(text); }
  }
  assert.deepEqual(commands, expected);
  const packedInputs = /string\[\] result=UnpackFixedProgram\(@"([A-Za-z\d+/=]+)",(\d+),(\d+),@"([a-f\d]{64})"\)\.Split\('\\0'\);/u.exec(decoder);
  assert.ok(packedInputs?.[1] !== undefined);
  const compressedInputs = Buffer.from(packedInputs[1], "base64");
  assert.equal(String(compressedInputs.length), packedInputs[2]);
  assert.equal(compressedInputs.toString("base64"), packedInputs[1]);
  // oxlint-disable-next-line node/no-sync -- Bounded fixed compile-only inputs must independently match every original wire field and expected command.
  const decodedInputs = gunzipSync(compressedInputs);
  assert.equal(String(decodedInputs.length), packedInputs[3]); assert.ok(decodedInputs.length <= 65_536);
  assert.equal(createHash("sha256").update(decodedInputs).digest("hex"), packedInputs[4]);
  const rows = decodedInputs.toString("utf8").split("\0").map(row => row.split("\t"));
  const families = [samples, footprintCases, currentPcbWorkerStartupNativeParentCases(), currentPcb209RatlineWorkerStartupNativeParentCases()] as const;
  let offset = 0;
  for (const [kind, cases] of families.entries()) {
    for (const [index, sample] of cases.entries()) {
      const row = rows[offset]; offset += 1; assert.ok(row);
      const worker = kind < 2;
      let wire;
      if (kind === 1) { wire = currentFootprintCopyPreparationWire(sample, 1); }
      else if (kind === 3) { wire = currentPcb209RatlineWorkerStartupWire(sample, 256); }
      else { wire = currentPcbWorkerStartupWire(sample, worker ? 1 : 256); }
      const omit = worker ? ["action", "requestId", "method", "sessionId", "startupPhase"] : ["action", "requestId", "method", "parentPhase"];
      const fields = Object.entries(wire.request).filter(([key]) => !omit.includes(key));
      assert.deepEqual(row.slice(7), fields.flatMap(([key, value]) => [key, typeof value === "number" ? "N" : "S", String(value)]));
      const remaining = kind === 3 && wire.request["parentPhase"] === "pcb-open-document" ? 1234 : 0;
      assert.deepEqual(row.slice(0, 4), [String(kind), sample.method, worker ? sample.sessionId : "", String(wire.request[worker ? "startupPhase" : "parentPhase"])]);
      assert.equal(row[6], String(remaining));
      let current = sample;
      if (kind === 0) { const item = currentPcb209WorkerStartupNativeCases()[index]; assert.ok(item); current = item; }
      else if (kind === 2) { const item = currentPcb209WorkerStartupNativeParentCases()[index]; assert.ok(item); current = item; }
      for (const [column, command] of [[4, sample], [5, current]] as const) {
        const opening = kind === 3 && command.method === "Runtime.callFunctionOn" && command.params.functionDeclaration === CURRENT_PCB_209_RATLINE_OPENING_FUNCTION;
        const params = opening ? { ...command.params, arguments: [...command.params.arguments, { value: remaining }] } : command.params;
        assert.equal(commands[Number(row[column])], JSON.stringify({ id: worker ? 1 : 256, method: command.method, params,
          ...(command.sessionId === undefined ? {} : { sessionId: command.sessionId }) }));
      }
    }
  }
  assert.equal(rows.length, offset);
  assert.ok(generated.includes(`counts[0]==${String(samples.length)} && counts[1]==${String(footprintCases.length)} && counts[2]==${String(families[2].length)} && counts[3]==${String(families[3].length)}`));
  for (const code of ["smoke-parity", "smoke-footprint-parity", "smoke-footprint-legacy", "smoke-parent-parity", "smoke-ratline-parent-parity"]) {
    assert.equal(generated.match(new RegExp(`"${code}"`, "gu"))?.length, 1);
  }
  assert.equal(generated.split("SmokeExpected()").length - 1, 2);
  assert.equal(generated.split("SmokeInputs()").length - 1, 2);
});

void test("native packed programs retain exact opener and source JSON bytes within the fixed helper bound", () => {
  const generated = currentPcbWorkerStartupNativeSource();
  const source = currentPcb209WorkerStartupNativeCases().find(command =>
    command.method === "Runtime.callFunctionOn" && command.params.awaitPromise);
  const opener = currentPcb209WorkerStartupNativeParentCases().find(command =>
    command.method === "Runtime.callFunctionOn" && command.params.awaitPromise && command.params.arguments[1]?.value === "open-project");
  const pcbOpener = currentPcbWorkerStartupNativeParentCases().find(command =>
    command.method === "Runtime.callFunctionOn" && command.params.awaitPromise && command.params.arguments[1]?.value === "open-document");
  assert.ok(source?.method === "Runtime.callFunctionOn" && opener?.method === "Runtime.callFunctionOn" && pcbOpener?.method === "Runtime.callFunctionOn");
  const expected = new Map([
    ["UiActorClockFunction", CURRENT_PCB_WORKER_STARTUP_UI_ACTOR_CLOCK_FUNCTION],
    ["PcbOpeningFunction", pcbOpener.params.functionDeclaration],
    ["ProjectOpening209Function", opener.params.functionDeclaration],
    ["RatlinePcbOpening209Function", CURRENT_PCB_209_RATLINE_OPENING_FUNCTION],
    ["FootprintSourceFunctionJson", JSON.stringify(source.params.functionDeclaration)],
  ]);
  const matches = [...generated.matchAll(/static readonly string (UiActorClockFunction|PcbOpeningFunction|ProjectOpening209Function|RatlinePcbOpening209Function|FootprintSourceFunctionJson)=UnpackFixedProgram\(@"([A-Za-z\d+/=]+)",(\d+),(\d+),@"([a-f\d]{64})"\);/gu)];
  assert.equal(matches.length, expected.size);
  for (const match of matches) {
    const [name, encoded, compressedLength, decodedLength, hash] = match.slice(1);
    assert.ok(name !== undefined && encoded !== undefined);
    const packed = Buffer.from(encoded, "base64");
    assert.equal(packed.toString("base64"), encoded); assert.equal(String(packed.length), compressedLength);
    // oxlint-disable-next-line node/no-sync -- Decodes bounded fixed generated constants to compare independent command bytes.
    const decoded = gunzipSync(packed);
    assert.equal(String(decoded.length), decodedLength); assert.ok(decoded.length <= 65_536);
    assert.equal(createHash("sha256").update(decoded).digest("hex"), hash);
    assert.equal(decoded.toString("utf8"), expected.get(name));
  }
  assert.ok(generated.includes('count==bytes.Length && stream.ReadByte()==-1,"program-bytes"'));
  assert.ok(generated.includes("System.Convert.ToBase64String(packed)==encoded"));
  assert.ok(generated.includes("new System.Text.UTF8Encoding(false,true).GetString(bytes)"));
  assert.ok(generated.includes('+FootprintSourceFunctionJson+'));
});

void test("packed encoder tables retain every exact fixed segment and preserve each bounded decoder", () => {
  const generated = currentPcbWorkerStartupNativeSource();
  const templates = [...currentPcbWorkerStartupNativeCases(), ...currentPcb209WorkerStartupNativeCases(), ...currentFootprintCopyDependencyNativeCases(), ...currentFootprintCopyProducerNativeCases()]
    .map(sample => JSON.stringify(sample.params));
  const matches = [...generated.matchAll(/static readonly string\[\] (ParameterTextTable\d+)=UnpackFixedProgram\(@"([A-Za-z\d+/=]+)",(\d+),(\d+),@"([a-f\d]{64})"\)\.Split\('\\0'\);/gu)];
  assert.ok(matches.length > 0);
  const decodedTexts = new Set<string>(), tables = new Map<string, readonly string[]>();
  for (const match of matches) {
    const [name, encoded, packedLength, decodedLength, hash] = match.slice(1); assert.ok(name !== undefined && encoded !== undefined);
    const packed = Buffer.from(encoded, "base64"); assert.equal(String(packed.length), packedLength);
    // oxlint-disable-next-line node/no-sync -- One bounded deterministic encoder table, checked against independent fixed command cases.
    const decoded = gunzipSync(packed);
    assert.equal(String(decoded.length), decodedLength); assert.ok(decoded.length <= 65_536);
    assert.equal(createHash("sha256").update(decoded).digest("hex"), hash);
    const texts = decoded.toString("utf8").split("\0"); tables.set(name, texts);
    assert.ok(generated.includes(`Need(${name}.Length==${String(texts.length)},"parameter-count")`));
    for (const text of texts) {
      assert.ok(templates.some(template => template.includes(text))); assert.equal(decodedTexts.has(text), false); decodedTexts.add(text);
    }
  }
  const aliases = [...generated.matchAll(/static readonly string (ParameterText\d+)=(ParameterTextTable\d+)\[(\d+)\];/gu)];
  assert.equal(aliases.length, decodedTexts.size);
  const indices = new Set<string>();
  for (const alias of aliases) {
    const [name, table, index] = alias.slice(1); assert.ok(name !== undefined && table !== undefined && index !== undefined);
    const text = tables.get(table)?.[Number(index)]; assert.ok(text !== undefined && decodedTexts.has(text));
    const key = `${table}:${index}`; assert.equal(indices.has(key), false); indices.add(key);
    assert.ok(generated.includes(`parameters=${name}`) || generated.includes(`+${name}`));
  }
  assert.ok(generated.includes('expectedBytes>0 && expectedBytes<=65536 && packedBytes>0 && packedBytes<=65536,"program-bound"'));
});

void test("current209 footprint phases preserve fixed flags and refuse legacy, altered programs or argument counts", () => {
  for (const sample of currentPcb209WorkerStartupNativeCases().slice(samples.length)) {
    const wire = currentPcb209WorkerStartupWire(sample, 250);
    assert.throws(() => currentPcbWorkerStartupWire(sample, 250));
    if (sample.method === "Runtime.callFunctionOn") {
      assert.ok(String(wire.request["startupPhase"]).startsWith("footprint-"));
      for (const patch of [{ arguments: [...sample.params.arguments, { objectId: "foreign" }] },
        { functionDeclaration: `${sample.params.functionDeclaration} ` }, { throwOnSideEffect: !sample.params.throwOnSideEffect }, { awaitPromise: !sample.params.awaitPromise }]) {
        assert.throws(() => currentPcb209WorkerStartupWire({ ...sample, params: { ...sample.params, ...patch } }, 250));
      }
      assert.equal(sample.params.throwOnSideEffect, !sample.params.awaitPromise);
    } else if (sample.method === "Debugger.evaluateOnCallFrame") {
      assert.equal(sample.params.throwOnSideEffect, true);
      assert.equal(wire.request["selector"], "footprint-constructors");
      assert.throws(() => currentPcb209WorkerStartupWire({ ...sample, params: { ...sample.params, expression: `${sample.params.expression} ` } }, 250));
    } else { assert.fail("Unexpected footprint command"); }
  }
});
