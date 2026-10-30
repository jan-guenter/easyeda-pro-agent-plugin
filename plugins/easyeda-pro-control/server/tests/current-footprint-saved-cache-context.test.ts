/** Actual retained owner, discovery pipe and UI context/event/DOM pipeline.
 * Only source issuers and the helper's Windows peer are synthetic. No native
 * process/Job, browser, cache getter or CacheStorage method is invoked. */
/* oxlint-disable import/max-dependencies -- This regression joins the real owner/context pipeline with an inert helper and the existing main-construction fixture. */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import process from "node:process";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { fileURLToPath } from "node:url";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentFootprintCombinedNativeOwner } from "../src/current-pcb-diagnostic-owner.ts";
import { DIAGNOSTIC_REQUEST_LIMIT } from "../src/current-pcb-diagnostic-protocol.ts";
import { mainBackendModule } from "./helpers/footprint-main-backend-runner-fixture.ts";

const source = "const syntheticUiSource = true;\n";
const profile = { family: "ui", relativePath: "pro-ui/synthetic/js/ui.js", scriptBytes: Buffer.byteLength(source),
  scriptSha256: createHash("sha256").update(source).digest("hex") } as const;
const frame = { id: "root-frame", loaderId: "root-loader", url: "https://client/editor?cll=warn", urlFragment: "#", securityOrigin: "https://client" };
const childFrame = { id: "sensor-frame", loaderId: "sensor-loader", parentId: frame.id, url: "about:blank", securityOrigin: "://" };
const context = { id: 1, uniqueId: "root-context", origin: "https://client", name: "", auxData: { frameId: frame.id, isDefault: true, type: "default" } };
const script = { scriptId: "ui-script", url: `https://modules.synthetic/${profile.relativePath}`, executionContextId: context.id };
const style = "display:block;position:absolute;top:0;left:0;width:100%;height:100%;border:none;padding:0;margin:0;opacity:0;z-index:-1000;pointer-events:none";
const node = { nodeType: 1, nodeName: "OBJECT", localName: "object", backendNodeId: 91, frameId: childFrame.id,
  attributes: ["style", style, "tabindex", "-1", "type", "text/html", "aria-hidden", "true", "data", "about:blank"] };
const flags = { writable: true, enumerable: false, configurable: true };
const baseline = JSON.stringify({ globalConstructor: flags, constructorPrototype: flags, prototypeConstructor: flags, match: flags });
function property(name: string, value: unknown, writable = true, enumerable = true, configurable = true): unknown {
  return { name, value, writable, enumerable, configurable, isOwn: true };
}
const replies = {
  capture: { result: { type: "object", subtype: "array", className: "Array", description: "Array(3)", objectId: "array" } },
  "array-properties": { result: [property("0", { type: "function", className: "Function", objectId: "constructor" }),
    property("1", { type: "object", className: "SyntheticCacheStorage", objectId: "prototype" }),
    property("2", { type: "function", className: "Function", objectId: "match" }),
    property("length", { type: "number", value: 3 }, true, false, false),
    property("descriptorBaseline", { type: "string", value: baseline }, false, false, false)],
  internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", description: "Array(0)", objectId: "array-prototype" } }] },
  "constructor-properties": { result: [] }, "match-properties": { result: [] }, recheck: { result: { type: "string", value: baseline } }, release: {},
};
async function fixture(t: TestContext, badOwner: boolean): Promise<Readonly<{ owner: CurrentFootprintCombinedNativeOwner; actions: string[] }>> {
  const path = new URL("../src/current-pcb-diagnostic-owner.ts", import.meta.url);
  const actualRequire = createRequire(path);
  const compiled = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const backend = await mainBackendModule(), original = Object.freeze({ syntheticOriginalSource: true });
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-footprint-copy-main-backend-runner.ts") { return { CurrentFootprintCopyMainBackendRunner: backend.Constructor }; }
    if (name === "./current-pcb-209-actor-clock-source.ts") {
      return { requireCurrentPcb209ActorClockSourceQualification: (value: unknown): void => { assert.equal(value, original); } };
    }
    if (name === "./current-footprint-copy-ui-source.ts") {
      return { qualifyCurrentFootprintCopyUiSource: (value: unknown): object => { assert.equal(value, source); return original; },
        requireCurrentFootprintCopyUiSource: (value: unknown): void => { assert.equal(value, original); } };
    }
    return actualRequire(name) as unknown;
  }, loaded, loaded.exports]);
  const value = loaded.exports["CurrentFootprintCombinedNativeOwner"]; assert.ok(typeof value === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The maintained export is checked above, with its real private-field constructor and UI context module unchanged.
  const Constructor = value as new (...args: unknown[]) => CurrentFootprintCombinedNativeOwner;
  const peer = `
import {createInterface} from 'node:readline';
import {mainBackendTransportFixture} from ${JSON.stringify(new URL("helpers/footprint-main-backend-runner-fixture.ts", import.meta.url).href)};
const main=mainBackendTransportFixture(),data=${JSON.stringify({ source, frame, childFrame, context, script, node, replies, badOwner })},queue=[];let attached=false;
const emit=(q,result)=>queue.push(JSON.stringify({id:q.requestId,...(q.sessionId?{sessionId:q.sessionId}:{}),result})+'\\0');
const event=(method,params)=>queue.push(JSON.stringify({sessionId:'root-session',method,params})+'\\0');
createInterface({input:process.stdin}).on('line',async line=>{const q=JSON.parse(line);let result;
try{
 if(q.action==='launch')result={helperInstance:'b'.repeat(32),jobId:'c'.repeat(32),rootPid:123,rootCreated:'123456789012345'};
 else if(q.action==='main-attach')result={attached:true};else if(q.action==='main-reprove')result={current:true};
 else if(q.action==='main-send'){await main.transport.send({phase:q.phase,method:q.method,params:{objectId:q.objectId}},q.requestId);result={written:true};}
 else if(q.action==='main-poll')result={bytes:await main.transport.poll(q.cleanup)};
 else if(q.action==='poll')result={bytes:Buffer.from(queue.shift()||'').toString('base64')};
 else if(q.action==='saved-cache-native'){emit(q,data.replies[q.phase]);result={written:true};}
 else if(q.action==='send'){
  let reply={};
  if(q.method==='Browser.getVersion')reply={protocolVersion:'synthetic',product:'synthetic',revision:'synthetic',userAgent:'synthetic',jsVersion:'synthetic'};
  else if(q.method==='Target.getTargets')reply={targetInfos:[{targetId:'root-target',type:'page',url:data.frame.url+'#',title:'Synthetic',attached}]};
  else if(q.method==='Target.attachToTarget'){attached=true;reply={sessionId:'root-session'};}
  else if(q.method==='Page.getFrameTree')reply={frameTree:{frame:data.frame,childFrames:[{frame:data.childFrame}]}};
  else if(q.method==='Runtime.enable')event('Runtime.executionContextCreated',{context:data.context});
  else if(q.method==='Debugger.enable'){event('Debugger.scriptParsed',data.script);reply={debuggerId:'debugger'};}
  else if(q.method==='Debugger.getScriptSource')reply={scriptSource:data.source};
  else if(q.method==='DOM.getFrameOwner')reply={backendNodeId:91};
  else if(q.method==='DOM.describeNode')reply={node:data.badOwner?{...data.node,nodeName:'IFRAME',localName:'iframe'}:data.node};
  else if(q.method!=='Page.enable')throw Error('unexpected method');
  emit(q,reply);result={written:true};
 }else throw Error('unexpected action');
 process.stdout.write(JSON.stringify({id:q.id,ok:true,result})+'\\n');
}catch{process.stdout.write(JSON.stringify({id:q.id,ok:false,error:'pcb-diagnostic-synthetic-refusal'})+'\\n');}
});`;
  const ready = fileURLToPath(new URL("helpers/current-footprint-combined-helper-ready.ts", import.meta.url));
  const child = spawn(process.execPath, ["--import", ready, "--input-type=module", "-e", peer], { stdio: ["pipe", "pipe", "pipe"] });
  t.after(async () => {
    if (child.exitCode !== null || child.signalCode !== null) { return; }
    const done = once(child, "close"); child.stdin.end(); await done;
  });
  const actions: string[] = [], write = child.stdin.write.bind(child.stdin);
  child.stdin.write = (chunk: unknown, ...rest: unknown[]): boolean => {
    assert.equal(typeof chunk, "string");
    if (typeof chunk !== "string") { throw new TypeError("Synthetic helper input must be a string."); }
    const q: unknown = JSON.parse(chunk); assert.ok(q !== null && typeof q === "object" && "action" in q);
    actions.push(String(q.action) + ("method" in q ? `:${String(q.method)}` : ""));
    const sent: unknown = Reflect.apply(write, undefined, [chunk, ...rest]); assert.ok(typeof sent === "boolean"); return sent;
  };
  const owner = new Constructor(child, (): Promise<void> => Promise.resolve(), original, null, undefined, undefined, "a".repeat(32));
  owner.start(); await owner.waitFootprintCombinedReady();
  await owner.launch({ executable: "C:\\Synthetic\\easyeda-pro.exe", executableSha256: "a".repeat(64), confirmDiagnosticLaunch: true });
  await owner.observeFootprintMainConstruction(); await owner.browserObservation(); await owner.inspectFrames("root-target");
  await owner.inspectScript(frame.id, profile);
  return { owner, actions };
}
void test("real owner prepares parent and ancillary DOM proof before the original UI metadata probe", async t => {
  const f = await fixture(t, false); const before = f.actions.length;
  const result = await f.owner.observeSavedCacheNative(), sent = f.actions.slice(before);
  assert.deepEqual(sent.filter(value => value.startsWith("send:")), ["send:Target.getTargets", "send:Page.getFrameTree", "send:DOM.getFrameOwner", "send:DOM.describeNode"]);
  assert.ok(sent.indexOf("send:DOM.describeNode") < sent.indexOf("saved-cache-native:Runtime.callFunctionOn"));
  assert.equal(sent.filter(value => value.startsWith("saved-cache-native:")).length, 6);
  assert.equal(result.nativeMatchQualified, false); assert.equal(result.replayTokenIssued, false);
  await assert.rejects(f.owner.observeSavedCacheNative(), /UNAVAILABLE/u);
});
void test("failed real ancillary proof is retained before runner construction and cannot dispatch cache metadata", async t => {
  const f = await fixture(t, true);
  await assert.rejects(f.owner.observeSavedCacheNative(), /CONTEXT_IDENTITY/u);
  const after = [...f.actions]; assert.equal(after.some(value => value.startsWith("saved-cache-native:")), false);
  assert.deepEqual(f.owner.status().savedCacheNativeObservation, { attempted: true, phase: "ancillary-owner", setupFailed: true, runnerCreated: false,
    nativeMatchQualified: false, replayTokenIssued: false, executionAuthorized: false });
  await assert.rejects(f.owner.observeSavedCacheNative(), /UNAVAILABLE/u); assert.deepEqual(f.actions, after);
});
void test("metadata preparation reserves four UI-proof and six probe/cleanup slots before any downstream request", async t => {
  const f = await fixture(t, false);
  while (f.actions.filter(value => value.startsWith("send:")).length < DIAGNOSTIC_REQUEST_LIMIT - 9) { await f.owner.getVersion(); }
  const before = [...f.actions];
  await assert.rejects(f.owner.observeSavedCacheNative(), /PROBE_UNAVAILABLE/u);
  assert.deepEqual(f.actions, before); assert.equal(f.owner.status().savedCacheNativeObservation, null);
});
