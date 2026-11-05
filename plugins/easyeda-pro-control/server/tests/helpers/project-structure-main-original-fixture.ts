/** Actual combined factory, native capability registry, main core and structure
 * lease. Installation/source/Windows encoder replies are explicit synthetic
 * dependencies; an inert Node child owns only its original stdio. */
/* oxlint-disable import/max-dependencies -- The fixture joins actual private issuers across their existing module seams without manufacturing a capability. */
import assert from "node:assert/strict";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { CURRENT_PROJECT_STRUCTURE_MAIN_ORDER as ORDER } from "../../src/current-project-structure-main-source.ts";
import { validateCurrentProjectStructureMainCommand } from "../../src/current-project-structure-main-protocol.ts";
import type { CurrentProjectStructureMainObserver } from "../../src/current-project-structure-main-observer.ts";
import type { CurrentFootprintCopyMainBackendTransport } from "../../src/current-footprint-copy-main-backend-runner.ts";
import { mainBackendModule } from "./footprint-main-backend-runner-fixture.ts";
import { combinedReadyFactoryFixture } from "./current-footprint-combined-ready-fixture.ts";

type Mode = "core-post" | "observer-post" | "location" | "duplicate" | "malformed" | "late" | "channel";
/** Preserve actual class exports and private maps while changing only named
 * external source/native dependencies for this isolated construction test. */
async function observerModule(overrides: Readonly<Record<string, unknown>>): Promise<typeof CurrentProjectStructureMainObserver> {
  const path = new URL("../../src/current-project-structure-main-observer.ts", import.meta.url);
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const compiled = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  const sourceRequire = createRequire(path);
  Reflect.apply(evaluate, undefined, [(name: string): unknown => Object.hasOwn(overrides, name) ? overrides[name] : sourceRequire(name) as unknown, loaded, loaded.exports]);
  const result = loaded.exports["CurrentProjectStructureMainObserver"]; assert.equal(typeof result, "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- This checked export is the actual compiled observer with its original private fields and registries.
  return result as typeof CurrentProjectStructureMainObserver;
}
/** An original factory supplies the native capability. The test never writes
 * a private registry, substitutes the capability guard or accepts copied JSON. */
export async function mainStructureOriginalFixture(mode: Mode): Promise<Readonly<{
  observer: CurrentProjectStructureMainObserver; core: InstanceType<Awaited<ReturnType<typeof mainBackendModule>>["Constructor"]>;
  owner: Awaited<ReturnType<Awaited<ReturnType<typeof combinedReadyFactoryFixture>>["api"]["startCurrentFootprintCombinedNativeOwner"]>>;
  state: { replied: boolean; refused: boolean; dispatched: boolean; postChecks: number };
  failure: Error; removed: string[]; dispose: () => Promise<void>;
}>> {
  const failure = new Error("synthetic original main post-reproof failure"), removed: string[] = [], state = { replied: false, refused: false, dispatched: false, postChecks: 0 };
  let factory: Awaited<ReturnType<typeof combinedReadyFactoryFixture>> | null = null;
  const bridge: Record<string, unknown> = {};
  const invokeOwner = (name: string, args: unknown[]): unknown => {
      assert.ok(factory !== null); const original: unknown = Reflect.get(factory.api, name); assert.equal(typeof original, "function");
      if (typeof original !== "function") { throw new TypeError("Missing actual native-owner export"); }
      const result: unknown = Reflect.apply(original, undefined, args);
      if (name === "requireCurrentFootprintCombinedMainCapability" && state.replied && mode === "observer-post" && !state.refused) {
        state.postChecks += 1; if (state.postChecks === 2) { state.refused = true; throw failure; }
      }
      return result;
  };
  for (const name of ["requireCurrentFootprintCombinedMainCapability", "requireCurrentFootprintCombinedMainCleanup", "currentFootprintCombinedMainGenerationExited", "sendCurrentFootprintCombinedMainCommand"]) {
    bridge[name] = (...args: unknown[]): unknown => invokeOwner(name, args);
  }
  const source = Object.freeze({ profile: "private.current-project-structure-main-source.v1", embeddedV8Validated: false, executionAuthorized: false });
  const originalRequire = createRequire(new URL("../../src/current-project-structure-main-source.ts", import.meta.url));
  const actualSource: unknown = originalRequire("./current-project-structure-main-source.ts"); assert.ok(actualSource !== null && typeof actualSource === "object");
  const sourceSeam = { ...actualSource, qualifyCurrentProjectStructureMainSource: (): object => source,
    requireCurrentProjectStructureMainSource: (token: unknown): void => { assert.equal(token, source); } };
  const module = await mainBackendModule({ "./current-pcb-diagnostic-owner.ts": bridge, "./current-project-structure-main-source.ts": sourceSeam });
  const retained: { core: InstanceType<typeof module.Constructor> | null } = { core: null };
  class OriginalRunner extends module.Constructor {
    public constructor(transport: CurrentFootprintCopyMainBackendTransport) {
      super(Object.freeze({ ...transport, assertCurrent: async (): Promise<void> => {
        if (!state.refused && (state.replied && mode === "core-post" || state.dispatched && mode === "late")) { state.refused = true; throw failure; }
        await transport.assertCurrent();
      }, poll: async (cleanup: boolean): Promise<string> => {
        const bytes = await transport.poll(cleanup);
        if (Buffer.from(bytes, "base64").toString("utf8").includes('"breakpointId":"structure-')) { state.replied = true; }
        return bytes;
      } })); retained.core = this;
    }
  }
  const actualWire: unknown = originalRequire("./current-footprint-copy-main-backend-wire.ts"); assert.ok(actualWire !== null && typeof actualWire === "object");
  const fixturePath = fileURLToPath(new URL("footprint-main-backend-runner-fixture.ts", import.meta.url));
  const childProgram = `const f=require(${JSON.stringify(fixturePath)}).mainBackendTransportFixture(),queue=[],mode=${JSON.stringify(mode)};let arms=0,held=null,cleanupPolls=0;
process.stdout.write(JSON.stringify(packet)+'\\n');const input=require('node:readline').createInterface({input:process.stdin});
input.on('line',async line=>{const q=JSON.parse(line);let result;
if(q.action==='launch')result={helperInstance:'b'.repeat(32),jobId:'c'.repeat(32),rootPid:123,rootCreated:'123456789012345'};
else if(q.action==='main-attach')result={attached:true};else if(q.action==='main-reprove')result={current:true};
else if(q.action==='main-send'&&q.phase.startsWith('structure-main-')){let reply={};if(q.phase==='structure-main-arm'){arms++;reply={breakpointId:mode==='malformed'?'bad id':mode==='duplicate'?'structure-1':'structure-'+arms,actualLocation:{scriptId:q.scriptId,lineNumber:q.lineNumber+(mode==='location'?1:0),columnNumber:q.columnNumber}};}
const text=JSON.stringify({id:q.requestId,result:reply})+'\\0';if(mode==='late'&&q.phase==='structure-main-arm')held=text;else queue.push((mode==='channel'&&q.phase==='structure-main-arm'?JSON.stringify({method:'Debugger.resumed',params:{}})+'\\0':'')+text);result={written:true};}
else if(q.action==='main-send'){await f.transport.send({phase:q.phase,method:q.method,params:{objectId:q.objectId}},q.requestId);result={written:true};}
else if(q.action==='main-poll'){if(held!==null&&q.cleanup&&++cleanupPolls===2){queue.push(held);held=null;}result={bytes:queue.length?Buffer.from(queue.shift()).toString('base64'):await f.transport.poll(q.cleanup)};}
else if(q.action==='termination')result={terminated:true,originalRootExited:true,originalJobEmpty:true};
else if(q.action==='release')result={released:true};else throw Error('Unexpected inert helper action');process.stdout.write(JSON.stringify({id:q.id,ok:true,result})+'\\n');});`;
  factory = await combinedReadyFactoryFixture("ready", "combined", false, { childProgram,
    launchTarget: { windowsPath: "C:\\Reviewed\\easyeda-pro.exe", sha256: "a".repeat(64) }, modules: {
    "./current-footprint-copy-main-backend-runner.ts": { CurrentFootprintCopyMainBackendRunner: OriginalRunner },
    "./current-footprint-copy-main-backend-wire.ts": { ...actualWire, currentFootprintCopyMainBackendWire(input: unknown, id: number): unknown {
      if (input !== null && typeof input === "object" && "phase" in input && typeof input.phase === "string" && input.phase.startsWith("structure-main-")) {
        const command = validateCurrentProjectStructureMainCommand(input);
        if (command.phase === "structure-main-remove") { removed.push(command.params.breakpointId); }
        if (command.phase === "structure-main-arm") { state.dispatched = true; return { request: { action: "main-send", requestId: id, phase: command.phase, method: command.method,
          scriptId: command.params.location.scriptId, lineNumber: command.params.location.lineNumber, columnNumber: command.params.location.columnNumber } }; }
        return { request: { action: "main-send", requestId: id, phase: command.phase, method: command.method } };
      }
      const encode: unknown = Reflect.get(actualWire, "currentFootprintCopyMainBackendWire"); assert.ok(typeof encode === "function"); return Reflect.apply(encode, undefined, [input, id]) as unknown;
    } },
  } });
  const dispose = async (): Promise<void> => {
    assert.ok(factory !== null); const child = factory.child();
    if (child.exitCode === null && child.signalCode === null) { const closed = once(child, "close"); child.stdin.end(); await closed; }
  };
  try {
  const owner = await factory.api.startCurrentFootprintCombinedNativeOwner(factory.options);
  await owner.launch({ executable: "C:\\Reviewed\\easyeda-pro.exe", executableSha256: "a".repeat(64), confirmDiagnosticLaunch: true });
  const packet = await owner.observeFootprintMainConstruction(); const core = retained.core; assert.ok(core !== null);
  // The actual native factory's WeakMap issues this capability; no test object
  // Can satisfy its guards merely by carrying the same profile string.
  const capability = owner.combinedMainCapability();
  const lease = await core.issueStructureLease(capability, packet);
  const Observer = await observerModule({ "./current-project-structure-main-lease.ts": { requireCurrentProjectStructureMainLease: module.requireStructure },
    "./current-project-structure-main-source.ts": sourceSeam });
  const observer = new Observer(lease, { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), ticket: 101, structureText: "source-only comparison" });
  assert.throws(() => module.requireStructure({ ...lease })); assert.equal(ORDER.length, 11);
  return { observer, core, owner, state, failure, removed, dispose };
  } catch (error) { await dispose(); throw error; }
}
