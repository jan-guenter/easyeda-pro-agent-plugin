/* oxlint-disable import/max-dependencies -- This focused inspector test joins the production runner, independent fixture and metadata replies to test their boundary together. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { runInContext } from "node:vm";
import { z } from "zod";
import type { CurrentPcbDiagnosticModelCommand } from "../src/current-pcb-diagnostic-model-runner.ts";
import { currentPcbTeardropFailureDetail } from "../src/current-pcb-teardrop-failure.ts";
import { observeCurrentPcbTeardropOwner } from "../src/current-pcb-teardrop-owner-runner.ts";
import { CURRENT_PCB_TEARDROP_TARGET_PROFILES, decodeCurrentPcbTeardropArguments } from "../src/current-pcb-teardrop-owner-scope.ts";
import { pcbStringObservationFixture } from "./helpers/current-pcb-string-observation-fixture.ts";
import { CURRENT_PCB_TEARDROP_SYNTHETIC_BINDING, currentPcbTeardropSources } from "./helpers/current-pcb-teardrop-fixture.ts";
import { teardropArgumentsReply } from "./helpers/current-pcb-teardrop-replies.ts";

function fixture(): string {
  let result = '(function(){var Xe={};var Sfe=class{constructor(){this.isMove=false;this.suspend=true;this.modify=new Set;this.task=new Set;this.modifyTears=new Set;this.timeoutId=null;}';
  result += "\n".repeat(4630); let column = 0;
  for (const index of [0, 1, 3, 2, 4, 5]) {
    const profile = CURRENT_PCB_TEARDROP_TARGET_PROFILES[index], source = currentPcbTeardropSources[index];
    assert.ok(profile !== undefined && source !== undefined);
    const start = profile.columnNumber - profile.name.length; assert.ok(start >= column);
    result += " ".repeat(start - column) + source; column = start + source.length;
  }
  return `${result}};var Zec=new Sfe;const tearsOwner=Zec;${CURRENT_PCB_TEARDROP_SYNTHETIC_BINDING}
globalThis.syntheticHandler=()=>Xe;})();`;
}
const remoteHandle = (value: unknown): string => z.object({ result: z.object({ objectId: z.string() }).loose() }).strict().parse(value).result.objectId;
const inspectedRemote = z.object({ objectId: z.string().optional() }).loose();
const inspectedProperty = z.object({ name: z.string(), value: inspectedRemote.optional() }).loose();
const inspectedInternal = z.object({ name: z.string(), value: inspectedRemote }).loose();
const inspected = z.object({ result: z.array(inspectedProperty), internalProperties: z.array(inspectedInternal).optional() }).strict();

void test("all six bound subscriptions recover one source-associated owner when Zec is absent from V8 scope", async () => {
  const session = new Session(); session.connect(); let contextId = 0, paused = false, scriptId = "";
  session.on("Runtime.executionContextCreated", ({ params }): void => { if (params.context.name === "pcb-string-observation-synthetic") { contextId = params.context.id; } });
  session.on("Debugger.scriptParsed", ({ params }): void => { if (params.url === "teardrop-targets.js") { scriptId = params.scriptId; } });
  session.on("Debugger.paused", (): void => { paused = true; });
  try {
    await session.post("Runtime.enable"); await session.post("Debugger.enable");
    const context = pcbStringObservationFixture(); runInContext(fixture(), context, { filename: "teardrop-targets.js", timeout: 1000 });
    const evaluate = async (expression: string): Promise<string> => {
      const reply: Promise<unknown> = session.post("Runtime.evaluate", {
        expression, contextId, returnByValue: false, throwOnSideEffect: true, silent: true, objectGroup: "teardrop-owner" });
      return remoteHandle(await reply);
    };
    const properties = async (objectId: string): Promise<z.infer<typeof inspected>> => inspected.parse(await
      session.post("Runtime.getProperties", { objectId, ownProperties: true }));
    const callback = await evaluate('MSG_BUS_PCB.messageBus.subscribed["pcb/saveCompiler"][0].callback'), handler = await evaluate("syntheticHandler");
    const handlerProperties = await properties(handler);
    const list = handlerProperties.internalProperties?.find(item => item.name === "[[Scopes]]")?.value.objectId;
    assert.ok(list !== undefined);
    const scopeList = await properties(list);
    const scope = scopeList.result[0]?.value?.objectId;
    assert.ok(scope !== undefined);
    const scopeProperties = await properties(scope);
    const names = new Set(scopeProperties.result.map(item => item.name));
    assert.ok(names.has("Xe")); assert.ok(!names.has("Zec")); assert.ok(!names.has("Sfe"));
    const commands: CurrentPcbDiagnosticModelCommand[] = [];
    const request = (command: CurrentPcbDiagnosticModelCommand): Promise<unknown> => {
      commands.push(command);
      if (command.method === "Runtime.getProperties") { return session.post(command.method, command.params); }
      assert.equal(command.method, "Runtime.callFunctionOn");
      return session.post(command.method, command.params);
    };
    const observe = (): Promise<string> => observeCurrentPcbTeardropOwner(request, scope, callback, scriptId);
    assert.ok(await observe()); assert.equal(commands.length, 21);
    const originalCallbacks = runInContext("[...teardropProof[1]]", context) as unknown;
    assert.ok(Array.isArray(originalCallbacks));
    // One same-class foreign instance is not the original owner of the other five.
    runInContext('const foreign=new teardropProof[0].constructor;MSG_BUS_PCB.messageBus.subscribed.SetSuspend[0].callback=teardropProof[2][1].bind(foreign)', context);
    await assert.rejects(observe(), (error: unknown) => {
      assert.equal(currentPcbTeardropFailureDetail(error)?.reason, "receiver"); return true;
    });
    runInContext('MSG_BUS_PCB.messageBus.subscribed.SetSuspend[0].callback=teardropProof[1][1];MSG_BUS_PCB.messageBus.subscribed.flushTearDrop[0].callback=teardropProof[2][4].bind(teardropProof[0],"extra")', context);
    await assert.rejects(observe(), (error: unknown) => {
      assert.equal(currentPcbTeardropFailureDetail(error)?.stage, "bound-metadata"); return true;
    });
    runInContext('MSG_BUS_PCB.messageBus.subscribed.flushTearDrop[0].callback=teardropProof[1][4];teardropProof[0].flushService=teardropProof[2][4]', context);
    await assert.rejects(observe(), (error: unknown) => { assert.equal(currentPcbTeardropFailureDetail(error)?.reason, "shadow"); return true; });
    runInContext("delete teardropProof[0].flushService", context);
    let swapped = false;
    await assert.rejects(observeCurrentPcbTeardropOwner(command => {
      if (command.modelPhase === "teardrop-owner" && !swapped) {
        swapped = true; runInContext("MSG_BUS_PCB.messageBus.subscribed.isMoveSwitch[0].callback=teardropProof[2][0].bind(teardropProof[0])", context);
      }
      return request(command);
    }, scope, callback, scriptId), (error: unknown) => { assert.equal(currentPcbTeardropFailureDetail(error)?.reason, "callback"); return true; });
    assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0); assert.equal(paused, false);
  } finally { await session.post("Runtime.releaseObjectGroup", { objectGroup: "teardrop-owner" }); session.disconnect(); }
});

void test("empty bound arguments require the complete own array inventory and fixed failure labels", () => {
  decodeCurrentPcbTeardropArguments(teardropArgumentsReply(), 0);
  const raw = JSON.stringify(teardropArgumentsReply());
  for (const bad of [raw.replace('"value":0', '"value":1'), raw.replace('"value":0', '"value":-0'), raw.replace('"name":"length"', '"name":"private"')]) {
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- assert.throws requires a synchronous error predicate.
    assert.throws(() => { decodeCurrentPcbTeardropArguments(JSON.parse(bad) as unknown, 0); }, (error: unknown) => {
      assert.deepEqual(currentPcbTeardropFailureDetail(error), { schema: "easyeda-pro-control.pcb-teardrop-owner-failure.v1", stage: "bound-arguments", topic: "isMoveSwitch", reason: "reply" }); return true;
    });
  }
});
