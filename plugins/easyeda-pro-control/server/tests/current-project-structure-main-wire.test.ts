import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";
import { currentFootprintCopyMainBackendWire } from "../src/current-footprint-copy-main-backend-wire.ts";
import { currentFootprintCopyMainRequestWire } from "../src/current-footprint-copy-main-request-wire.ts";
import { currentProjectStructureMainNativeCases, currentProjectStructureMainNativeSource } from "../src/current-project-structure-main-native.ts";
import { currentProjectStructureMainWire } from "../src/current-project-structure-main-wire.ts";

void test("fixed structure codebook reconstructs every exact program without carrying source or locations on the wire", () => {
  const cases = currentProjectStructureMainNativeCases(), source = currentProjectStructureMainNativeSource(); assert.equal(cases.length, 42);
  const packed = /UnpackFixedProgram\(@"([A-Za-z\d+/=]+)",(\d+),@"([a-f\d]{64})",@"([a-f\d]{64})"\)/u.exec(source);
  assert.ok(packed?.[1] !== undefined && packed[2] !== undefined && packed[3] !== undefined && packed[4] !== undefined);
  const bytes = Buffer.from(packed[1], "base64"); assert.equal(createHash("sha256").update(bytes).digest("hex"), packed[4]);
  // oxlint-disable-next-line node/no-sync -- At most64KiB of fixed in-memory codec text is decoded, never filesystem or application data.
  const decoded = gunzipSync(bytes); assert.equal(decoded.length, Number(packed[2])); assert.ok(decoded.length <= 65_536);
  assert.equal(createHash("sha256").update(decoded).digest("hex"), packed[3]);
  const [common, ...rows] = decoded.toString("utf8").split("\0"); assert.ok(common !== undefined); assert.equal(rows.length, cases.length);
  const phases = new Set<string>();
  for (const [index, command] of cases.entries()) {
    const row = rows[index], wire = currentProjectStructureMainWire(command, 73); assert.ok(row !== undefined);
    const [phase, method, fields, template] = row.split("\t"); assert.ok(phase !== undefined && fields !== undefined && template !== undefined);
    assert.equal(phase, wire.request["phase"]); assert.equal(method, command.method); assert.equal(phases.has(phase), false); phases.add(phase);
    const reconstructed: string = template.replaceAll("__structure_shared_program_text__", common).replaceAll(/"__structure_([A-Za-z\d]+)__"/gu, (_, name: string): string => {
      assert.ok(fields.split(",").includes(name)); return JSON.stringify(wire.request[name]);
    });
    assert.ok(typeof reconstructed === "string");
    assert.equal(`{"id":73,${reconstructed.slice(1)}`, JSON.stringify({ id: 73, method: command.method, params: command.params }));
    for (const forbidden of ["functionDeclaration", "expression", "lineNumber", "columnNumber", "sessionId", "url", "condition"]) {
      assert.equal(Object.hasOwn(wire.request, forbidden), false);
    }
    assert.throws(() => currentFootprintCopyMainBackendWire(command, 73)); assert.throws(() => currentFootprintCopyMainRequestWire(command, 73));
  }
});

void test("structure transport separately bounds helper text and rejects foreign source, coerced clocks and hostile input without hooks", () => {
  const command = currentProjectStructureMainNativeCases().find(value => value.phase === "structure-main-join" && value.stage === "controller");
  assert.ok(command?.phase === "structure-main-join"); const planArg = command.params.arguments[2]; assert.ok(planArg !== undefined && "value" in planArg);
  const withPlan = (plan: unknown): unknown => ({ ...command, params: { ...command.params, arguments: [...command.params.arguments.slice(0, 2), { value: plan }] } });
  assert.throws(() => currentProjectStructureMainWire(withPlan({ ...planArg.value, structureText: "x".repeat(32_768) }), 1), /WIRE_BYTES/u);
  assert.throws(() => currentProjectStructureMainWire(withPlan({ ...planArg.value, ticket: "101" }), 1));
  assert.throws(() => currentProjectStructureMainWire({ ...command, params: { ...command.params, functionDeclaration: "function(){return true}" } }, 1));
  for (const id of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 2_147_483_648]) { assert.throws(() => currentProjectStructureMainWire(command, id)); }
  let hooks = 0;
  assert.throws(() => currentProjectStructureMainWire(new Proxy({}, { ownKeys: (): never => { hooks += 1; throw new Error("proxy"); } }), 1));
  assert.throws(() => currentProjectStructureMainWire({ get phase(): never { hooks += 1; throw new Error("getter"); } }, 1)); assert.equal(hooks, 0);
});
