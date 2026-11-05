/** Actual factory/private registry with synthetic installation admission and
 * a real inert Node child. No Windows resource or application proof is minted. */
/* oxlint-disable import/max-dependencies -- The actual factory fixture joins real child pipes, explicit source admission and private registry getters; none can substitute for another boundary. */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import type { ChildProcessWithoutNullStreams } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { CURRENT_FOOTPRINT_COMBINED_READY, decodeCurrentFootprintCombinedReady } from "../../src/current-footprint-combined-ready.ts";
import type { CurrentFootprintCopyWindowsClockIssuer } from "../../src/current-footprint-copy-windows-clock.ts";
import type { CurrentPcbDiagnosticInstallationOptions } from "../../src/current-pcb-diagnostic-installation.ts";
import type { CurrentFootprintCombinedNativeOwner, CurrentFootprintCopyForwardNativeOwner, CurrentFootprintCopyForwardSavedNativeOwner, CurrentFootprintCopyNativeTarget, CurrentFootprintForwardExecutionNativeOwner, assertOriginalCurrentFootprintCopyForwardNativeOwner,
  assertOriginalCurrentFootprintCopyForwardSavedNativeOwner, assertOriginalCurrentFootprintForwardExecutionNativeOwner, currentFootprintCombinedFactoryFailureDiagnostics,
  currentFootprintCopyForwardFactoryFailureDiagnostics, currentFootprintCopyForwardSavedObservationAllocationOutcome,
  currentFootprintForwardExecutionBirthAllocationOutcome, currentFootprintForwardExecutionBirthFailureDiagnostics,
  requireCurrentFootprintCombinedUnlaunchedFactoryFailure, requireCurrentFootprintCopyForwardUnlaunchedFactoryFailure, requireCurrentFootprintForwardExecutionInputs, startCurrentFootprintCopySavedNativeOwner } from "../../src/current-pcb-diagnostic-owner.ts";

type Mode = "ready" | "stderr-close" | "malformed" | "wrong-challenge" | "oversize-no-newline" | "stderr-delayed-close" | "resource-traffic" | "saved-admission-failure" | "saved-spawn-refusal" | "execution-inputs";
export interface SyntheticForwardFactoryOwner extends CurrentFootprintCopyForwardNativeOwner {
  syntheticForwardExecutionSetupForTest: (target: object, main: object) => void;
  syntheticForwardExecutionTransitionForTest: (mode: "close" | "abort" | "cleanup" | "source" | "main") => void;
  syntheticClockIssuerForTest: (issuer: CurrentFootprintCopyWindowsClockIssuer) => void;
  syntheticForwardRequestForTest: (request: Readonly<Record<string, unknown>>) => Promise<Readonly<Record<string, unknown>>>;
  syntheticForwardFrameForTest: (frame: Buffer) => Promise<void>;
  syntheticForwardControlsForTest: (normal: number, cleanup: number) => void;
  syntheticForwardRouteForTest: (channel: object, opening: object, result: object) => void;
}
export interface SyntheticForwardSavedFactoryOwner extends CurrentFootprintCopyForwardSavedNativeOwner {
  syntheticForwardRequestForTest: (request: Readonly<Record<string, unknown>>) => Promise<Readonly<Record<string, unknown>>>;
  syntheticForwardFrameForTest: (frame: Buffer) => Promise<void>;
}
export interface SyntheticForwardExecutionFactoryOwner extends CurrentFootprintForwardExecutionNativeOwner {
  syntheticForwardRequestForTest: (request: Readonly<Record<string, unknown>>) => Promise<Readonly<Record<string, unknown>>>;
  syntheticForwardExecutionSetupForTest: (target: object, main: object) => void;
  syntheticForwardMainUiForTest: (opening: object, result: object) => void;
}
interface Module {
  readonly startCurrentFootprintCombinedNativeOwner: (options: CurrentPcbDiagnosticInstallationOptions) => Promise<CurrentFootprintCombinedNativeOwner>;
  readonly currentFootprintCombinedFactoryFailureDiagnostics: typeof currentFootprintCombinedFactoryFailureDiagnostics;
  readonly requireCurrentFootprintCombinedUnlaunchedFactoryFailure: typeof requireCurrentFootprintCombinedUnlaunchedFactoryFailure;
  readonly startCurrentFootprintCopyForwardNativeOwner: (options: CurrentPcbDiagnosticInstallationOptions) => Promise<SyntheticForwardFactoryOwner>;
  readonly assertOriginalCurrentFootprintCopyForwardNativeOwner: typeof assertOriginalCurrentFootprintCopyForwardNativeOwner;
  readonly currentFootprintCopyForwardFactoryFailureDiagnostics: typeof currentFootprintCopyForwardFactoryFailureDiagnostics;
  readonly requireCurrentFootprintCopyForwardUnlaunchedFactoryFailure: typeof requireCurrentFootprintCopyForwardUnlaunchedFactoryFailure;
  readonly startCurrentFootprintCopySavedNativeOwner: typeof startCurrentFootprintCopySavedNativeOwner;
  readonly CurrentFootprintCopyForwardSavedNativeOwner: typeof CurrentFootprintCopyForwardSavedNativeOwner;
  readonly startCurrentFootprintCopyForwardSavedObservationOwner: (writer: SyntheticForwardFactoryOwner, after: object) => Promise<SyntheticForwardSavedFactoryOwner>;
  readonly assertOriginalCurrentFootprintCopyForwardSavedNativeOwner: typeof assertOriginalCurrentFootprintCopyForwardSavedNativeOwner;
  readonly currentFootprintCopyForwardSavedObservationAllocationOutcome: typeof currentFootprintCopyForwardSavedObservationAllocationOutcome;
  readonly requireCurrentFootprintForwardExecutionInputs: typeof requireCurrentFootprintForwardExecutionInputs;
  readonly startCurrentFootprintForwardExecutionNativeOwner: (options: CurrentPcbDiagnosticInstallationOptions) => Promise<SyntheticForwardExecutionFactoryOwner>;
  readonly assertOriginalCurrentFootprintForwardExecutionNativeOwner: typeof assertOriginalCurrentFootprintForwardExecutionNativeOwner;
  readonly currentFootprintForwardExecutionBirthAllocationOutcome: typeof currentFootprintForwardExecutionBirthAllocationOutcome;
  readonly currentFootprintForwardExecutionBirthFailureDiagnostics: typeof currentFootprintForwardExecutionBirthFailureDiagnostics;
}
/** Exercise the real owner factories, private registries and transport counters
 * with synthetic installation/SQL seams and an inert Node child. Fixed modes
 * model readiness, failure and saved-owner birth without Windows resources.
 * Callers must retain the returned child through cleanup; the fixture issues
 * no native application ownership, real closed-SQL proof or writer authority.
 */
export async function combinedReadyFactoryFixture(mode: Mode, purpose: "combined" | "forward" | "forward-execution" = "combined", savedObservation = false,
  supplied: Readonly<{ modules?: Readonly<Record<string, unknown>>; childProgram?: string;
    launchTarget?: Readonly<{ windowsPath: string; sha256: string }> }> = {}): Promise<Readonly<{
  api: Module; options: CurrentPcbDiagnosticInstallationOptions; child: () => ChildProcessWithoutNullStreams;
  state: { writes: number; bytes: number; readySent: boolean; actions: string[] };
  executionInputs: Readonly<{ opening: object; result: object; preparation: object; owned: object; checkpoint: object; runtime: object; target: object; main: object }>;
  seedSyntheticClosedSnapshot: (writer: SyntheticForwardFactoryOwner, after: object) => void;
}>> {
  const path = new URL("../../src/current-pcb-diagnostic-owner.ts", import.meta.url);
  const actualRequire = createRequire(path);
  const pluginRoot = fileURLToPath(new URL("../..", path)).replace(/\/$/u, "");
  const helper = await readFile(new URL("../../../scripts/pcb-diagnostic-owner.ps1", import.meta.url));
  let ownerSource = await readFile(path, "utf8");
  if (purpose === "forward" || purpose === "forward-execution") {
    // An explicit synthetic command seam reaches actual original counters and
    // Pipe callbacks. It proves no Windows handle, app launch or writer route.
    ownerSource = ownerSource.replace("  public status():", "  public syntheticForwardRequestForTest(request: RecordValue): Promise<RecordValue> { return this.#request(request); }\n" +
      "  public syntheticForwardControlsForTest(normal: number, cleanup: number): void { const {ledger,role}=this.#forwardResources(); ledger.syntheticControlsForTest(role,this,normal,cleanup); }\n" +
      "  public syntheticForwardRouteForTest(channel: object, opening: object, result: object): void { this.#binding={helperInstance:'b'.repeat(32),jobId:'c'.repeat(32),rootPid:123,rootCreated:'123456789012345'}; this.#stagedContext={script:()=>{throw new Error('SYNTHETIC_ROUTE_GATE_PASSED');}} as never;this.#startupChannel=channel as never;this.#startupHandoff={channel,dependency:{},opening:{}} as never;this.#footprintUiSource={} as never;this.#footprintUiRunner={} as never;this.#footprintUiPacket={} as never;this.#footprintUiOpening=opening as never;this.#footprintUiOpeningResult=result as never;this.#footprintUiReproofAttempted=true;this.#footprintUiAttempted=false;this.#footprintClockRegistrationAttempted=false;this.#footprintManagerAttempted=false; }\n" +
      "  public syntheticForwardFrameForTest(frame: Buffer): Promise<void> { return new Promise<void>((resolve,reject)=>{void this.#sendFrame(frame,cause=>{if(cause===undefined||cause===null){resolve();}else{reject(cause);}});}); }\n" +
      "  public syntheticClockIssuerForTest(issuer: CurrentFootprintCopyWindowsClockIssuer): void { this.#footprintWindowsClock=issuer; }\n" +
      "  public syntheticForwardClosedSourceForTest(source: CurrentFootprintCopyNativeTarget): void { this.#footprintSourceBinding=source; this.#footprintSourceBindingText=canonicalJson({...source,before:undefined}); }\n  public status():");
  }
  if (mode === "execution-inputs") {
    ownerSource = ownerSource.replace("  public status():", `  public syntheticForwardExecutionSetupForTest(target: object, main: object): void {
      this.#binding={helperInstance:'b'.repeat(32),jobId:'c'.repeat(32),rootPid:123,rootCreated:'123456789012345'};
      this.#launchSucceeded=true;this.#mainAttached=true;this.#mainRunner=main as never;
      this.#projectOpeningTarget=target as never;this.#startupHandoff={dependency:{}} as never;
    }
    public syntheticForwardExecutionTransitionForTest(mode: string): void {
      if(mode==='close')this.#closeConsumed=true;
      else if(mode==='abort')this.#combinedAbortAttempted=true;
      else if(mode==='cleanup')this.#forwardCleanupOnly=true;
      else if(mode==='source'){this.#footprintSourceBinding={...this.#footprintSourceBinding} as never;this.#footprintSourceBindingText=canonicalJson({...this.#footprintSourceBinding,before:undefined});}
      else if(mode==='main')this.#mainRunner={...this.#mainRunner} as never;
      else throw new Error('Unknown synthetic transition');
    }
    // Synthetic external UI collector evidence only. Production still requires
    // its actual original route/source/reproof issuer before source publication.
    public syntheticForwardMainUiForTest(opening: object, result: object): void {
      this.#footprintUiOpening=opening as never;this.#footprintUiOpeningResult=result as never;this.#forwardExecutionUiReproofSucceeded=true;
    }
    public status():`);
  }
  const raw = ownerSource.replaceAll("import.meta.url", JSON.stringify(path.href))
    .replace(/const HELPER_SHA256 = "[a-f\d]{64}";/u, `const HELPER_SHA256 = "${createHash("sha256").update(helper).digest("hex")}";`)
    .replace(/const HELPER_BYTES = [\d_]+;/u, `const HELPER_BYTES = ${String(helper.length)};`);
  const output = await transform(raw, { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} }, sourceOnly = Object.freeze({ syntheticSourceOnly: true });
  const options = Object.freeze({ pluginRoot, assetsRoot: "/synthetic-unused-assets", powershellSha256: "a".repeat(64), powershellBytes: 1, wslDistribution: "Synthetic" });
  const installation = Object.freeze({ paths: { powershellExecutable: "synthetic-inert-node-only" },
    plan: { schema: "easyeda-pro-control.pcb-diagnostic-installation.v1", files: supplied.launchTarget === undefined ? [] : [{ ...supplied.launchTarget, bytes: 1 }] }, facadeSha256: "a".repeat(64) });
  let original: ChildProcessWithoutNullStreams | null = null;
  let selectedAfter: object | null = null, selectedWriter: SyntheticForwardFactoryOwner | null = null;
  const checkpoint = Object.freeze({ sourceSha256: "d".repeat(64) });
  const state: { writes: number; bytes: number; readySent: boolean; actions: string[] } = { writes: 0, bytes: 0, readySent: false, actions: [] };
  const executionCheckpoint = Object.freeze({ source: "/mnt/c/Synthetic/validation.eprj2", receiptPath: "/synthetic/receipt.json",
    checkpointSha256: "d".repeat(64), sourceSha256: "d".repeat(64) });
  const executionBefore = Object.freeze({ checkpointSha256: "d".repeat(64), logicalSha256: "e".repeat(64) });
  const executionSource = Object.freeze({ projectUuid: "a".repeat(64), branchUuid: "b".repeat(32) });
  const executionOwned = Object.freeze({ before: executionBefore, sourcePlan: Object.freeze({ source: executionSource }),
    copyPlan: Object.freeze({}), nativeArguments: Object.freeze({}), headReference: Object.freeze({}), sourceAssets: Object.freeze({}) });
  const executionInputs = Object.freeze({ opening: Object.freeze({}), result: Object.freeze({}), preparation: Object.freeze({}), owned: executionOwned,
    checkpoint: executionCheckpoint, runtime: Object.freeze({}),
    target: Object.freeze({ rawWindowsPath: String.raw`C:\Synthetic\validation.eprj2`, projectUuid: "a".repeat(64), branchUuid: "b".repeat(32) }),
    main: { retained: (): object => Object.freeze({ completed: true, failed: false, pendingReplies: 0, requestOriginIssued: false,
      releaseAttempted: false, released: false, sourceQualified: true }) } });
  const capacityPath = new URL("../../src/current-footprint-copy-forward-capacity.ts", import.meta.url);
  const capacitySource = await readFile(capacityPath, "utf8");
  const capacityRaw = capacitySource.replace("  public consumeControl(",
    "  public syntheticControlsForTest(role: CurrentFootprintCopyForwardRole, original: object, normal: number, cleanup: number): void { const held=this.#original(role,original); held.normalControls+=normal;held.cleanupControls+=cleanup;held.controls+=normal+cleanup; }\n  public consumeControl(");
  const capacityOutput = await transform(capacityRaw, { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const capacityLoaded: { exports: Record<string, unknown> } = { exports: {} };
  const capacityEvaluate: unknown = runInThisContext(`(function(require,module,exports){${capacityOutput.code}\n})`); assert.ok(typeof capacityEvaluate === "function");
  Reflect.apply(capacityEvaluate, undefined, [createRequire(capacityPath), capacityLoaded, capacityLoaded.exports]);
  const mainAccountingPath = new URL("../../src/current-footprint-copy-forward-main-accounting.ts", import.meta.url);
  const mainAccountingOutput = await transform(await readFile(mainAccountingPath, "utf8"), { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const mainAccountingLoaded: { exports: Record<string, unknown> } = { exports: {} }, mainAccountingRequire = createRequire(mainAccountingPath);
  const mainAccountingEvaluate: unknown = runInThisContext(`(function(require,module,exports){${mainAccountingOutput.code}\n})`); assert.ok(typeof mainAccountingEvaluate === "function");
  Reflect.apply(mainAccountingEvaluate, undefined, [(name: string): unknown => name === "./current-footprint-copy-forward-capacity.ts" ? capacityLoaded.exports : mainAccountingRequire(name) as unknown,
    mainAccountingLoaded, mainAccountingLoaded.exports]);
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (supplied.modules !== undefined && Object.hasOwn(supplied.modules, name)) { return supplied.modules[name]; }
    if (purpose === "forward-execution" && name === "./current-footprint-forward-native-graph.ts") { return {
      // This inert-child fixture exercises real factory/counter custody. The
      // Separate graph tests exercise actual descriptor/hash/role selection.
      captureCurrentFootprintForwardNativeGraph: (distribution: unknown, challenge: unknown): Promise<object> => {
        assert.equal(distribution, "Synthetic"); assert.equal(typeof challenge, "string"); assert.match(String(challenge), /^[a-f\d]{32}$/u);
        return Promise.resolve(Object.freeze({ verify: (): Promise<void> => Promise.resolve(),
          bootstrap: `$ErrorActionPreference='Stop';# synthetic fixed graph, never executed\n& {} -WorkerStartupFootprintForwardExecution209 -CombinedReadyChallenge '${String(challenge)}'` }));
      },
    }; }
    if (name === "./current-footprint-copy-forward-main-accounting.ts") { return mainAccountingLoaded.exports; }
    if (name === "./current-footprint-copy-forward-capacity.ts") { return capacityLoaded.exports; }
    if (name === "./current-pcb-diagnostic-installation.ts") { return {
      verifyCurrentPcb209DiagnosticInstallation: (): Promise<unknown> => mode === "saved-admission-failure" && selectedWriter !== null ?
        Promise.reject(new Error("Synthetic saved admission failed")) : Promise.resolve(installation),
      verifyCurrentPcb209DiagnosticFacade: (): Promise<unknown> => Promise.resolve(installation),
      qualifyCurrentPcb209StartupActorInstallation: (): Promise<unknown> => Promise.resolve(sourceOnly),
      verifyCurrentPcb209WorkerBootstrapInstallation: (): Promise<void> => Promise.resolve(),
    }; }
    if (mode === "execution-inputs" && name === "./current-pcb-209-worker-startup-opening.ts") {
      const actual: unknown = actualRequire(name); assert.ok(actual !== null && typeof actual === "object");
      return { ...actual, requireCurrentFootprintCopyOpening: async (opening: unknown, result: unknown): Promise<void> => {
        assert.equal(opening, executionInputs.opening); assert.equal(result, executionInputs.result); await Promise.resolve();
      } };
    }
    if (mode === "execution-inputs" && name === "./current-footprint-copy-preparation-runtime.ts") {
      return { requireCurrentFootprintCopyOwned: async (preparation: unknown, opening: unknown): Promise<object> => {
        assert.equal(preparation, executionInputs.preparation); assert.equal(opening, executionInputs.opening); await Promise.resolve(); return executionInputs.owned;
      } };
    }
    if (mode === "execution-inputs" && name === "./artifacts.ts") {
      const actual: unknown = actualRequire(name); assert.ok(actual !== null && typeof actual === "object");
      return { ...actual, controlRootCapability: (): Promise<object> => Promise.resolve(Object.freeze({})) };
    }
    if (mode === "execution-inputs" && name === "./checkpoint.ts") {
      return { verifyCheckpoint: (): Promise<object> => Promise.resolve(Object.freeze({ ok: true, sourceChanged: false, sourceMatchesReceipt: true,
        checkpointMatchesReceipt: true, sourceEqualsCheckpoint: true, sourceSha256: executionCheckpoint.sourceSha256, checkpointSha256: executionCheckpoint.checkpointSha256 })) };
    }
    if (name === "./current-footprint-copy-closed-snapshot.ts" && savedObservation) { return {
      requireCurrentFootprintCopyClosedSnapshot: (writer: unknown, after: unknown): object => {
        assert.ok(selectedWriter !== null); assert.equal(writer, selectedWriter); assert.equal(after, selectedAfter);
        return Object.freeze({ checkpoint });
      },
      captureCurrentFootprintCopyClosedSnapshot: (): never => { throw new Error("Synthetic SQL capture is not implemented"); },
    }; }
    if (name === "./current-pcb-209-actor-clock-source.ts") { return { requireCurrentPcb209ActorClockSourceQualification: (value: unknown): void => { assert.equal(value, sourceOnly); } }; }
    if (name === "./current-footprint-combined-ready.ts") { return { decodeCurrentFootprintCombinedReady,
      CURRENT_FOOTPRINT_COMBINED_READY: { ...CURRENT_FOOTPRINT_COMBINED_READY, milliseconds: 5000, eofCleanupMilliseconds: 500 } }; }
    if (name !== "node:child_process") { return actualRequire(name) as unknown; }
    return { spawn: (executable: unknown, args: unknown): ChildProcessWithoutNullStreams => {
      assert.equal(executable, "synthetic-inert-node-only");
      assert.ok(Array.isArray(args)); const encoded: unknown = args.at(-1); assert.equal(typeof encoded, "string"); assert.ok(typeof encoded === "string");
      const bootstrap = Buffer.from(encoded, "base64").toString("utf16le"), match = / -CombinedReadyChallenge '([a-f0-9]{32})'/u.exec(bootstrap);
      const saved = bootstrap.includes(" -WorkerStartupFootprintSaved209");
      if (saved) { assert.equal(savedObservation, true); assert.ok(original !== null); assert.equal(original.exitCode, 0); assert.equal(match, null); }
      else { assert.equal(original, null); assert.ok(match?.[1] !== undefined); }
      assert.equal(bootstrap.includes(" -WorkerStartupFootprintForward209 "), !saved && purpose === "forward");
      assert.equal(bootstrap.includes(" -WorkerStartupFootprintForwardExecution209 "), !saved && purpose === "forward-execution");
      assert.equal(bootstrap.includes(" -WorkerStartupFootprintCombined209 "), !saved && purpose === "combined");
      if (saved && mode === "saved-spawn-refusal") { throw new Error("Synthetic saved spawn unresolved"); }
      const packet = { challenge: match?.[1] ?? "", schema: CURRENT_FOOTPRINT_COMBINED_READY.schema, helperInstance: "b".repeat(32), jobId: "c".repeat(32),
        creationState: "not-entered", processCreated: false, emptyJob: true, pipesChecked: true };
      const child = spawn(process.execPath, ["-e", supplied.childProgram === undefined ? `
const mode=${JSON.stringify(mode)},packet=${JSON.stringify(packet)},saved=${JSON.stringify(saved)};const readline=require('node:readline');
const input=readline.createInterface({input:process.stdin});let rendererId=1,rendererSession;
if(mode.startsWith('stderr'))process.stderr.write('private-synthetic-diagnostic');
else if(!saved)setTimeout(()=>{if(mode==='oversize-no-newline'){process.stdout.write('x'.repeat(513));return;}if(mode==='malformed')packet.processCreated=true;if(mode==='wrong-challenge')packet.challenge=(packet.challenge[0]==='0'?'1':'0')+packet.challenge.slice(1);process.stdout.write(JSON.stringify(packet)+'\\n');},20);
input.on('line',line=>{const q=JSON.parse(line);let result;
if(q.action==='release-unlaunched')result={released:true,launchNeverAttempted:true};
else if(mode==='resource-traffic'&&(q.action==='send'||q.action==='worker-startup-send'||q.action==='worker-startup-parent'||q.action==='main-send'||q.action==='saved-cache-native')){if(q.action!=='main-send'){rendererId=q.requestId;rendererSession=q.sessionId;}result={written:true};}
else if(mode==='resource-traffic'&&q.action==='poll')result={bytes:Buffer.from(JSON.stringify({id:rendererId,...(rendererSession===undefined?{}:{sessionId:rendererSession}),result:{}})+'\\0').toString('base64')};
else if(mode==='resource-traffic'&&q.action==='main-poll')result={bytes:Buffer.from('{}\\0').toString('base64'),receivedBytes:4,frames:1};
else if(mode==='resource-traffic'&&q.action==='worker-startup-reprove')result={current:true};
else if(mode==='resource-traffic'&&['termination','window','normal-close','main-close-detach','combined-abort'].includes(q.action))result={syntheticCleanup:true};
else throw Error('Unexpected inert request');
process.stdout.write(JSON.stringify({id:q.id,ok:true,result})+'\\n');});
input.on('close',()=>{if(mode==='stderr-delayed-close')setTimeout(()=>process.exit(1),1000);});
` : `const packet=${JSON.stringify(packet)};${supplied.childProgram}`], { stdio: ["pipe", "pipe", "pipe"] });
      original = child;
      child.stdout.on("data", () => { state.readySent = true; });
      const write = child.stdin.write.bind(child.stdin);
      // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Forward both synchronous Writable.write overloads and their original callbacks unchanged.
      child.stdin.write = (value: Uint8Array | string, encodingOrCallback?: BufferEncoding | ((error?: Error | null) => void), callback?: (error?: Error | null) => void): boolean => {
        state.writes += 1; assert.equal(typeof value, "string"); assert.ok(typeof value === "string"); state.bytes += Buffer.byteLength(value);
        const request: unknown = JSON.parse(value);
        assert.ok(request !== null && typeof request === "object" && "action" in request && typeof request.action === "string"); state.actions.push(request.action);
        if (typeof encodingOrCallback === "string") { return write(value, encodingOrCallback, callback); }
        return write(value, encodingOrCallback);
      };
      return child;
    } };
  }, loaded, loaded.exports]);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The actual maintained module exports these named functions; only installation/child fixtures are substituted, never its private registries.
  const api = loaded.exports as unknown as Module;
  return { api, options, state, executionInputs, child: (): ChildProcessWithoutNullStreams => { assert.ok(original !== null); return original; },
    seedSyntheticClosedSnapshot: (writer, after): void => {
      assert.equal(savedObservation, true); api.assertOriginalCurrentFootprintCopyForwardNativeOwner(writer);
      selectedWriter = writer; selectedAfter = after;
      const source = Object.freeze({ operationId: "footprint-copy-synthetic", source: "/synthetic-unused/validation.eprj2", checkpoint, before: after,
        target: Object.freeze({ rawWindowsPath: "C:\\Synthetic\\validation.eprj2", projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16), expectedSourceSha256: "d".repeat(64) }),
        runtime: Object.freeze({ nodeExecutable: process.execPath, nodeVersion: "24.18.0", nodeSha256: "e".repeat(64) }) });
      // Only this transformed fixture supplies a synthetic closed-SQL seam. The
      // Maintained factory and all original resource/owner registries stay real.
      const selected: unknown = writer; assert.ok(selected !== null && typeof selected === "object" && "syntheticForwardClosedSourceForTest" in selected && typeof selected.syntheticForwardClosedSourceForTest === "function");
      Reflect.apply(selected.syntheticForwardClosedSourceForTest, writer, [source satisfies Omit<CurrentFootprintCopyNativeTarget, "checkpoint" | "before"> & { checkpoint: object; before: object }]);
    } };
}
