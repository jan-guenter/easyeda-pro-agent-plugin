/** Offline fixed transport protocol/source checks. No native owner, XHR,
 * application, original body reservation or publication token is issued. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { Script, runInNewContext } from "node:vm";
import { parse } from "acorn";
import { z } from "zod";
import { CURRENT_PROJECT_STRUCTURE_TRANSPORT_CALL_FLAGS as FLAGS, CURRENT_PROJECT_STRUCTURE_TRANSPORT_GROUP as GROUP,
  currentProjectStructureTransportNativeCases, validateCurrentProjectStructureTransportCommand } from "../src/current-project-structure-transport-protocol.ts";
import { CURRENT_PROJECT_STRUCTURE_TRANSPORT_PROGRAMS as PROGRAMS } from "../src/current-project-structure-transport-programs.ts";
import { CURRENT_PROJECT_STRUCTURE_TRANSPORT_CONDITION as CONDITION, CURRENT_PROJECT_STRUCTURE_TRANSPORT_SITES as SITES,
  CURRENT_PROJECT_STRUCTURE_TRANSPORT_SOURCE as SOURCE, qualifyCurrentProjectStructureTransportSource } from "../src/current-project-structure-transport-source.ts";
import { originalProjectStructureLivenessSource as liveness, originalProjectStructureTransportSource as original } from "./helpers/project-structure-transport-source-fragment.ts";

void test("fixed transport source distinguishes actual send, implicit return and caught synchronous failure", () => {
  assert.equal(Buffer.byteLength(original), SOURCE.transport.bytes); assert.equal(createHash("sha256").update(original).digest("hex"), SOURCE.transport.sha256);
  const ast = parse(original, { ecmaVersion: "latest" }); const sends: number[] = []; const catches: number[] = []; const returns: number[] = [];
  const nodeSchema = z.looseObject({ type: z.string(), start: z.number().int(), end: z.number().int() }), unknownArray = z.array(z.unknown());
  const visit = (input: unknown): void => {
    if (Array.isArray(input)) { for (const child of unknownArray.parse(input)) { visit(child); } return; }
    const parsed = nodeSchema.safeParse(input); if (!parsed.success) { return; } const node = parsed.data;
    if (node.type === "CallExpression") { const callee = nodeSchema.parse(node["callee"]); if (callee.type === "MemberExpression") { const receiver = nodeSchema.parse(callee["object"]); const property = nodeSchema.parse(callee["property"]); if (receiver.type === "Identifier" && receiver["name"] === "p" && property.type === "Identifier" && property["name"] === "send") { sends.push(node.start); } } }
    if (node.type === "CatchClause") { const body = nodeSchema.parse(node["body"]); const first = nodeSchema.parse(unknownArray.parse(body["body"])[0]); catches.push(first.start); }
    if (node.type === "VariableDeclarator") { const id = nodeSchema.parse(node["id"]), init = nodeSchema.safeParse(node["init"]); if (id.type === "Identifier" && id["name"] === "l" && init.success && init.data.type === "ArrowFunctionExpression") { returns.push(init.data.end - 1); } }
    for (const child of Object.values(node)) { visit(child); }
  };
  visit(ast); assert.equal(sends.length, 2); assert.equal(sends[1], SITES.send.offset - SOURCE.transport.start); assert.ok(catches.includes(SITES.failed.offset - SOURCE.transport.start)); assert.deepEqual(returns, [SITES.returned.offset - SOURCE.transport.start]);
  assert.throws(() => { qualifyCurrentProjectStructureTransportSource(original); }, /TRANSPORT_SOURCE/u);
});
void test("finite transport grammar contains no failure resume or caller source/condition/target/grant", () => {
  const cases = currentProjectStructureTransportNativeCases(); assert.equal(cases.length, 16);
  for (const command of cases) { assert.doesNotThrow(() => validateCurrentProjectStructureTransportCommand(command)); assert.throws(() => validateCurrentProjectStructureTransportCommand({ ...command, grant: true })); }
  assert.throws(() => validateCurrentProjectStructureTransportCommand({ phase: "project-structure-transport-resume", role: "failed", method: "Debugger.resume", params: {} }));
  assert.throws(() => validateCurrentProjectStructureTransportCommand({ phase: "project-structure-transport-capture", method: "Runtime.callFunctionOn", params: { ...FLAGS, uniqueContextId: "original", functionDeclaration: `${PROGRAMS.capture} `, arguments: [], returnByValue: false } }));
  const route = `/api/v4/projects/${"a".repeat(64)}/branches/${"b".repeat(32)}/structures`;
  assert.equal(runInNewContext(CONDITION, { e: "POST", t: route }), true); assert.equal(runInNewContext(CONDITION, { e: "GET", t: route }), false); assert.equal(runInNewContext(CONDITION, { e: "POST", t: `${route}/unknown` }), false); assert.equal(runInNewContext(CONDITION, {}), true);
  assert.ok(GROUP.includes("structure-transport"));
});
void test("readonly capture rejects accessor constructors without invoking hooks and every program compiles inertly", () => {
  let hooks = 0; const fixture = { get XMLHttpRequest(): never { hooks += 1; throw new Error("getter"); } };
  for (const source of Object.values(PROGRAMS)) { assert.doesNotThrow(() => new Script(`(${source})`)); }
  assert.throws(() => runInNewContext(`(${PROGRAMS.capture})()`, fixture)); assert.equal(hooks, 0);
});

void test("the original nonprivate liveness branch returns without yielding to an application RPC", async () => {
  assert.equal(Buffer.byteLength(liveness), SOURCE.liveness.bytes); assert.equal(createHash("sha256").update(liveness).digest("hex"), SOURCE.liveness.sha256);
  let calls = 0; const forbidden = (): never => { calls += 1; throw new Error("unexpected application RPC"); };
  const pending: unknown = runInNewContext(`(function(qh){${liveness};return j6();})(false)`, { oo: forbidden, J1: forbidden, Ge: Object.freeze({ messageBus: Object.freeze({ rpcCall: forbidden }) }) });
  assert.equal(await pending, true); assert.equal(calls, 0); assert.equal(SITES.send.length, 17); assert.ok(SITES.send.expression.endsWith(",qh]"));
});
