/* oxlint-disable unicorn/prefer-top-level-await -- The Inspector worker must keep observing original main-thread pauses while settlement is retained. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { parentPort, workerData } from "node:worker_threads";
import { z } from "zod";
import { CurrentSchematicWireParserDriver, consumeCurrentSchematicWireParserDriverData as consume } from "../../src/current-schematic-wire-parser-driver.ts";
import type { CurrentSchematicWireParserDriverCommand } from "../../src/current-schematic-wire-parser-driver.ts";

const config = z.strictObject({ key: z.string(), scriptId: z.string(), variant: z.union([z.literal(0), z.literal(1)]),
  source: z.string(), mode: z.enum(["complete", "wrong-path", "publication", "rpc-error", "idle-tab", "foreign-caller"]) }).parse(workerData);
const port = parentPort ?? (() : never => { throw new Error("worker port"); })();
port.on("message", () => {
  // Retain the worker while an original main-thread source frame is held.
});
const session = new Session(); session.connectToMainThread();
let driver: CurrentSchematicWireParserDriver | null = null;
let originalExited = false; let stopped = false;
session.on("Debugger.scriptParsed", event => { driver?.observe({ sessionId: "123.4", method: "Debugger.scriptParsed", params: event.params }); });
session.on("Debugger.paused", event => { driver?.observe({ sessionId: "123.4", method: "Debugger.paused", params: event.params }); });
session.on("Debugger.resumed", (event: unknown) => {
  const raw = z.object({ params: z.unknown() }).parse(event);
  driver?.observe({ sessionId: "123.4", method: "Debugger.resumed", params: raw.params });
});
async function post(command: CurrentSchematicWireParserDriverCommand): Promise<unknown> {
  const pending: unknown = Reflect.apply(session.post.bind(session), session, [command.method, command.params]);
  return await pending;
}
async function cleanup(): Promise<void> {
  if (stopped) { return; } stopped = true;
  // Fixture-only exit assertions and disposal issue no native admission.
  originalExited = true;
  if (driver !== null) {
    const retired = driver.retireAfterOriginalExit(); assert.equal(driver.retireAfterOriginalExit(), retired); await retired;
  }
  try { await session.post("Debugger.resume"); } catch {
    // The explicit inert source fixture may already have returned.
  }
  session.disconnect(); port.close();
}
async function main(): Promise<void> {
  await session.post("Debugger.enable"); const roots: string[] = [];
  for (const name of ["holder", "native"]) {
    const result = await session.post("Runtime.evaluate", { expression: `globalThis.${config.key}.${name}` });
    assert.ok(result.result.objectId !== undefined); roots.push(result.result.objectId);
  }
  const holder = roots[0]; const native = roots[1]; assert.ok(holder !== undefined && native !== undefined);
  const failures: unknown[] = [];
  const current = new CurrentSchematicWireParserDriver({ sessionId: "123.4", scriptId: config.scriptId, holder, native,
    variant: config.variant, source: { scriptSource: config.source } }, {
    request: post, assertCurrent: (): void => { assert.equal(originalExited, false); },
    assertOriginalExit: (): void => { assert.equal(originalExited, true); }, fail: (cause: unknown): void => { failures.push(cause); },
  });
  driver = current;
  const pending = current.run(); assert.equal(driver.run(), pending);
  const armed = driver.arm(); assert.equal(driver.arm(), armed); await armed; port.postMessage({ ready: true });
  try {
    const result = await pending;
    assert.equal(driver.observe({ sessionId: "123.4", method: "Debugger.paused", params: {} }), false);
    assert.equal(driver.run(), pending); assert.throws(() => consume(structuredClone(result), current));
    assert.equal(consume(result, driver), result.parser); assert.throws(() => consume(result, current));
    assert.equal(result.objectGroupReleased, false); assert.equal(driver.inspect().objectGroupReleased, false);
    const finished = driver.finish(); assert.equal(driver.finish(), finished); await finished;
    const retained = driver.retained();
    port.postMessage({ ...driver.inspect(), sources: result.allTwentyTwoGeneratedSourcesCompared, sourceChecks: retained.attempts.filter(row => row.command.method === "Debugger.getScriptSource").length,
      removed: result.allAllocatedBreakpointsRemoved, released: driver.inspect().objectGroupReleased, attempts: retained.attempts.length, events: retained.events.length,
      sameAst: result.parser.sameAstPublishedCompared, promises: result.parser.normalReturnPromisesCompared,
      nativeOwnerJoined: result.originalNativeOwnerJoined, originalWholeScriptOriginJoined: result.originalWholeScriptOriginJoined });
  } catch (error) {
    const retained = driver.retained(); assert.ok(driver.inspect().failed); assert.equal(driver.run(), pending);
    assert.equal(retained.firstFailure?.cause, error);
    const sentResumes = retained.attempts.filter(row => row.command.method === "Debugger.resume").length;
    port.postMessage({ error: String(error), ...driver.inspect(), attempts: retained.attempts.length, sentResumes,
      firstCauseRetained: retained.firstFailure?.cause === error });
  } finally { await cleanup(); }
}
void (async (): Promise<void> => {
  try { await main(); }
  catch (error) { port.postMessage({ fixtureError: String(error) }); await cleanup(); }
})();
