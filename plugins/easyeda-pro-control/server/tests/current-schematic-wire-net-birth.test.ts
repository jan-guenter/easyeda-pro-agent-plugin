import assert from "node:assert/strict";
import { Session } from "node:inspector";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { z } from "zod";
import { CurrentSchematicWireEventObserver } from "../src/current-schematic-wire-event-observer.ts";
import { CURRENT_SCHEMATIC_WIRE_NET_BIRTH_FLAGS as FLAGS, CURRENT_SCHEMATIC_WIRE_NET_BIRTH_HELPER as HELPER, CURRENT_SCHEMATIC_WIRE_NET_BIRTH_REQUESTS as LIMIT, validateCurrentSchematicWireNetBirthCommand as validate } from "../src/current-schematic-wire-net-birth-protocol.ts";
import type { CurrentSchematicWireNetBirthCommand as Command } from "../src/current-schematic-wire-net-birth-protocol.ts";
import { CurrentSchematicWireNetBirthReader } from "../src/current-schematic-wire-net-birth-reader.ts";
import { CURRENT_SCHEMATIC_WIRE_NET_BIRTH_SOURCE as SOURCE } from "../src/current-schematic-wire-net-birth-source.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

const target = Object.freeze({ projectUuid: "a".repeat(64), pageUuid: "b".repeat(32) });
const remote = z.object({ result: z.object({ objectId: z.string() }) });
const replySource = z.strictObject({ scriptSource: z.string() });
const parsedScript = z.object({ params: z.object({ scriptId: z.string(), url: z.string(), length: z.number() }) });
const armed = z.object({ breakpointId: z.string() });
const frame = z.object({ callFrameId: z.string() });
const pauseParams = z.object({ callFrames: z.array(frame).min(2) });
const pause = z.object({ params: pauseParams });

function originalActors(source: string, variant: 0 | 1): string {
  let text = source.replaceAll(/[^\r\n]/gu, value => " ".repeat(value.length));
  const place = (start: number, body: string): void => {
    assert.match(text.slice(start, start + body.length), /^ +$/u);
    text = text.slice(0, start) + body + text.slice(start + body.length);
  };
  const original = SOURCE[variant];
  const page = "const pageMethods={";
  const root = "const inheritedMethods={";
  const initStart = original.caller.start - 46;
  place(original.page.start - page.length, `${page}${source.slice(original.page.start, original.page.end)}};`);
  place(initStart - root.length, `${root}${source.slice(initStart, original.caller.end + 2)}};`);
  return `${text}
    const empty={init(){}}, dispatcher={_size:0,_listenerSubscriptions:[]}, page={...pageMethods,...inheritedMethods};
    const bbox={...empty,_onUpdate:dispatcher}, net={...empty}, shapes={docManager:page,netPointManager:net,bboxMonitor:bbox};
    net.shapeManager=shapes; bbox.shapeManager=shapes;
    shapes.modelHelpers={netGroup:{correctNetNamesValueVisibleForOnes144542(){}}}; shapes.diffPairsFlagSymbolWatcher=empty;
    shapes.baseWatch=()=>{dispatcher._size=1;}; shapes.actionRunner={add(){}};
    page.shapeManager=shapes; page.gridAdsorption=empty; page.profileSetting=empty;
    page.consistencyImpl={async init(cb){await cb();},uploadImpl:{watch(){}}};
    page.uuid="${target.pageUuid}"; page.project_uuid="${target.projectUuid}";
    globalThis.nativeTuple=[Object.getOwnPropertyDescriptor,Object.getOwnPropertyDescriptors,Object.getPrototypeOf,Object.is,Object.hasOwn,Reflect.ownKeys,Reflect.apply,Array.isArray,Map.prototype.get,Map.prototype.has,Map.prototype.forEach,Object.getOwnPropertyDescriptor(Map.prototype,"size").get,Set.prototype.has,Set.prototype.forEach,Object.getOwnPropertyDescriptor(Set.prototype,"size").get,Object.prototype,Array.prototype,Map.prototype,Set.prototype];
    globalThis.openBirth=()=>page.init();
    globalThis.watchCount=()=>dispatcher._size;
  `;
}

void test("original page initialization selects its roots immediately before baseWatch", async context => {
  const session = new Session();
  session.connect();
  context.after(() => { session.disconnect(); });
  const post = (method: string, params: unknown): unknown => {
    const observed: { error?: Error | null; reply?: unknown } = {};
    const callback = (error: Error | null, value?: unknown): void => { observed.error = error; observed.reply = value; };
    Reflect.apply(session.post.bind(session), session, [method, params, callback]);
    assert.equal(observed.error, null);
    return observed.reply;
  };
  post("Runtime.enable", {});
  post("Debugger.enable", {});

  for (const variant of [0, 1] as const) {
    const source = await readConfiguredEasyedaAsset(SOURCE[variant].relativePath);
    if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
    const proof = Object.freeze({ scriptSource: source });
    const scriptName = `wire-net-birth-${variant}.js`;
    const scripts: z.infer<typeof parsedScript>["params"][] = [];
    const parsed = (e: unknown): void => { scripts.push(parsedScript.parse(e).params); };
    session.on("Debugger.scriptParsed", parsed);
    const vm = createContext({});
    runInContext(originalActors(source, variant), vm, { filename: scriptName });
    const script = scripts.find(row => row.url === scriptName);
    assert.ok(script !== undefined);
    const { scriptId } = script;
    const profile = SOURCE[variant];
    const breakpoint = armed.parse(post("Debugger.setBreakpoint", {
      location: { scriptId, lineNumber: profile.page.lineNumber, columnNumber: profile.page.held }, condition: "",
    })).breakpointId;
    const owner = Object.freeze({});
    const observer = new CurrentSchematicWireEventObserver(owner);
    const captured: { commands: { command: Command; reply: unknown }[]; event?: ReturnType<typeof observer.captureObject>; native?: string; helper?: string; failure?: unknown } = { commands: [] };
    const selectedSession = "wire-net-birth-fixture";
    const held = (notification: unknown): void => {
      try {
        const original = pause.parse(notification);
        assert.ok(typeof notification === "object" && notification !== null);
        captured.event = observer.captureObject({ ...notification, sessionId: selectedSession }, owner);
        const [page, caller] = original.params.callFrames;
        assert.ok(page !== undefined && caller !== undefined);
        const inspect = (command: Command): unknown => {
          const reply = post(command.method, command.params);
          captured.commands.push({ command, reply });
          return reply;
        };
        const first = remote.parse(inspect(validate({ phase: "wire-net-birth-frame", role: "page", method: "Debugger.evaluateOnCallFrame",
          params: { ...FLAGS, callFrameId: page.callFrameId, expression: "[this]", returnByValue: false, includeCommandLineAPI: false } }))).result.objectId;
        const second = remote.parse(inspect(validate({ phase: "wire-net-birth-frame", role: "caller", method: "Debugger.evaluateOnCallFrame",
          params: { ...FLAGS, callFrameId: caller.callFrameId, expression: "[this]", returnByValue: false, includeCommandLineAPI: false } }))).result.objectId;
        captured.native = remote.parse(post("Debugger.evaluateOnCallFrame", {
          callFrameId: page.callFrameId, expression: "globalThis.nativeTuple", objectGroup: FLAGS.objectGroup, throwOnSideEffect: true,
        })).result.objectId;
        const earlier = scripts.length;
        const roots = remote.parse(inspect(validate({ phase: "wire-net-birth-helper", method: "Runtime.callFunctionOn", params: {
          ...FLAGS, objectId: first, functionDeclaration: HELPER,
          arguments: [{ objectId: captured.native }, { objectId: second }, { value: target.projectUuid }, { value: target.pageUuid }],
          returnByValue: false, awaitPromise: false, userGesture: false,
        } }))).result.objectId;
        const helpers = scripts.slice(earlier).filter(row => row.url === "" && row.length === HELPER.length + 2);
        const [helper] = helpers;
        assert.ok(helpers.length === 1 && helper !== undefined);
        captured.helper = helper.scriptId;
        const helperProof = inspect(validate({ phase: "wire-net-birth-helper-source", method: "Debugger.getScriptSource", params: { scriptId: helper.scriptId } }));
        assert.equal(replySource.parse(helperProof).scriptSource, `(${HELPER})`);
        inspect(validate({ phase: "wire-net-birth-properties", method: "Runtime.getProperties",
          params: { objectId: roots, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }));
      } catch (error) { captured.failure = error; }
      finally { post("Debugger.resume", {}); }
    };
    session.on("Debugger.paused", held);
    const completed: unknown = runInContext("openBirth()", vm);
    await completed;
    session.off("Debugger.paused", held);
    post("Debugger.removeBreakpoint", { breakpointId: breakpoint });
    session.off("Debugger.scriptParsed", parsed);
    assert.equal(captured.failure, undefined);
    assert.equal(captured.commands.length, LIMIT.total);
    assert.equal(runInContext("watchCount()", vm), 1);
    const { event, native, helper } = captured;
    assert.ok(event !== undefined && native !== undefined && helper !== undefined);
    let accepted = 0;
    let owned = true;
    const input = { event, target, source: proof, scriptId, sessionId: selectedSession, native, breakpoint };
    const reader = new CurrentSchematicWireNetBirthReader(input, {
      request: (command): Promise<unknown> => {
        const actual = captured.commands[accepted];
        accepted += 1;
        assert.ok(actual !== undefined);
        assert.deepEqual(actual.command, command);
        return Promise.resolve(actual.reply);
      },
      assertOriginalHeldBirth: (currentEvent, arm, selected): void => {
        assert.equal(owned, true);
        assert.equal(observer.requireOriginal(currentEvent, owner), event);
        assert.equal(arm, breakpoint);
        assert.equal(selected, target);
      },
      assertOriginalSourceReceipt: (packet, binding): void => {
        assert.equal(packet, proof);
        assert.deepEqual(binding, { scriptId, sessionId: selectedSession, variant });
      },
      requireOriginalHelperScript: (): string => helper,
    });
    const pending = reader.readOriginal();
    assert.equal(reader.readOriginal(), pending);
    const receipt = await pending;
    assert.equal(receipt.originalNativeOwnerJoined, false);
    assert.equal(receipt.originalWatchRegistrationObserved, false);
    assert.equal(reader.requireOriginalWatchInput(receipt).source, proof);
    assert.throws(() => reader.requireOriginalWatchInput(structuredClone(receipt)));
    assert.equal(accepted, LIMIT.total);
    owned = false;
    assert.throws(() => reader.requireOriginalWatchInput(receipt));
    post("Runtime.releaseObjectGroup", { objectGroup: FLAGS.objectGroup });
  }
});
