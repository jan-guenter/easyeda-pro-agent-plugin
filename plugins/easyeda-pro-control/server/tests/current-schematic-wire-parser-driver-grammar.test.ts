import assert from "node:assert/strict";
import { setImmediate as turn } from "node:timers/promises";
import { test } from "node:test";
import { CurrentSchematicWireParserDriver } from "../src/current-schematic-wire-parser-driver.ts";
import type { CurrentSchematicWireParserDriverCommand } from "../src/current-schematic-wire-parser-driver.ts";
import {
  CURRENT_SCHEMATIC_WIRE_PARSER_DRIVER_REQUESTS as LIMIT,
  currentSchematicWireParserDriverCases as cases,
  currentSchematicWireParserDriverTemplate as template,
  validateCurrentSchematicWireParserDriverControl as validate,
} from "../src/current-schematic-wire-parser-driver-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_PARSER_HELPERS as SOURCE } from "../src/current-schematic-wire-parser-source.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

void test("Wire parser controls are fixed, source-bound and losslessly substitutable", () => {
  assert.equal(LIMIT.normal + LIMIT.cleanup, LIMIT.total); assert.equal(LIMIT.total, 276);
  const phases = new Set<string>();
  for (const command of cases()) {
    assert.deepEqual(validate(command), command); const fixed = template(command); assert.ok(!phases.has(fixed.phase)); phases.add(fixed.phase);
    let text = fixed.template;
    for (const [name, value] of Object.entries(fixed.values)) { text = text.replaceAll(`__wireparserdriver_${name}__`, value); }
    assert.deepEqual(JSON.parse(text), { method: command.method, params: command.params });
    assert.ok(Object.isFrozen(fixed.values) && Object.isFrozen(fixed.fields));
    assert.throws(() => validate({ ...command, params: { ...command.params, callerCode: "no" } }));
    if (command.phase === "wire-parser-driver-arm") {
      assert.throws(() => validate({ ...command, params: { location: { ...command.params.location, columnNumber: 0 } } }));
      assert.throws(() => validate({ ...command, params: { ...command.params, condition: "caller" } }));
    }
  }
  assert.throws(() => validate({ phase: "wire-parser-driver-evaluate", method: "Runtime.evaluate", params: { expression: "caller" } }));
});

void test("Wire parser original exit joins the exact outstanding arm and public settlement", async context => {
  const source = await readConfiguredEasyedaAsset(SOURCE[0].relativePath);
  if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  const held = Promise.withResolvers<unknown>(); const entered = Promise.withResolvers<null>();
  const sent: CurrentSchematicWireParserDriverCommand[] = []; const failures: unknown[] = [];
  let exited = false;
  const driver = new CurrentSchematicWireParserDriver({ sessionId: "123.1", scriptId: "123", holder: "123.2", native: "123.3", variant: 0, source: { scriptSource: source } }, {
    request: (command): Promise<unknown> => {
      sent.push(command);
      if (command.phase === "wire-parser-driver-arm") { entered.resolve(null); return held.promise; }
      return Promise.reject(new Error("explicit closed fixture transport"));
    },
    assertCurrent: (): void => { assert.equal(exited, false); },
    assertOriginalExit: (): void => { assert.equal(exited, true); },
    fail: (cause: unknown): void => { failures.push(cause); },
  });
  const pending = driver.run(); const rejected = assert.rejects(pending); await entered.promise;
  const armed = driver.arm(); const armRejected = assert.rejects(armed);
  exited = true; const retired = driver.retireAfterOriginalExit(); assert.equal(driver.retireAfterOriginalExit(), retired);
  let retiredSettled = false;
  const joined = (async (): Promise<void> => { await retired; retiredSettled = true; })();
  await turn(); assert.equal(retiredSettled, false); assert.equal(sent.length, 1);
  const originalCause = new Error("original outstanding request rejected at exit"); held.reject(originalCause);
  await Promise.all([rejected, armRejected, joined]);
  assert.equal(driver.run(), pending); assert.equal(driver.arm(), armed);
  const retained = driver.retained(); assert.equal(retained.firstFailure?.cause, failures[0]);
  assert.equal(retained.attempts[0]?.pending, held.promise); assert.equal(retained.attempts[0]?.cause, originalCause); assert.equal(retained.attempts.length, 2);
  assert.equal(retained.attempts[1]?.command.method, "Runtime.releaseObjectGroup");
  assert.equal(retained.attempts.filter(row => row.command.method === "Debugger.resume").length, 0);
});

void test("Wire parser foreign pause is retained and cannot cause a cleanup resume", async context => {
  const source = await readConfiguredEasyedaAsset(SOURCE[0].relativePath);
  if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  const sent: CurrentSchematicWireParserDriverCommand[] = []; let ordinal = 0; let exited = false;
  const driver = new CurrentSchematicWireParserDriver({ sessionId: "123.1", scriptId: "123", holder: "123.2", native: "123.3", variant: 0, source: { scriptSource: source } }, {
    request: (command): Promise<unknown> => {
      sent.push(command);
      if (command.phase === "wire-parser-driver-arm") { ordinal += 1; return Promise.resolve({ breakpointId: `123.${String(ordinal)}`, actualLocation: command.params.location }); }
      return Promise.resolve({});
    },
    assertCurrent: (): void => { assert.equal(exited, false); },
    assertOriginalExit: (): void => { assert.equal(exited, true); },
    fail: (): void => {
      // The original refusal remains in the driver journal.
    },
  });
  await driver.arm(); const pending = driver.run(); const rejected = assert.rejects(pending);
  const raw = { sessionId: "123.1", method: "Debugger.paused", params: { hitBreakpoints: ["999.1"], callFrames: [{ callFrameId: "123.9" }] } };
  assert.equal(driver.observe(raw), true); await rejected;
  assert.ok(driver.retained().events.some(row => row === raw));
  assert.equal(sent.filter(row => row.method === "Debugger.resume").length, 0);
  assert.equal(sent.filter(row => row.method === "Debugger.removeBreakpoint").length, 12);
  assert.equal(driver.inspect().nativeOwnerJoined, false);
  exited = true; await driver.retireAfterOriginalExit();
});
