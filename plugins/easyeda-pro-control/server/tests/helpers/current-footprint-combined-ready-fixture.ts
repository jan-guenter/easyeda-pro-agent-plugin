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
import type { CurrentFootprintCombinedNativeOwner, CurrentFootprintCopyForwardNativeOwner, CurrentFootprintCopyForwardSavedNativeOwner, CurrentFootprintCopyNativeTarget, assertOriginalCurrentFootprintCopyForwardNativeOwner,
  assertOriginalCurrentFootprintCopyForwardSavedNativeOwner, currentFootprintCombinedFactoryFailureDiagnostics,
  currentFootprintCopyForwardFactoryFailureDiagnostics, currentFootprintCopyForwardSavedObservationAllocationOutcome,
  requireCurrentFootprintCombinedUnlaunchedFactoryFailure, requireCurrentFootprintCopyForwardUnlaunchedFactoryFailure, startCurrentFootprintCopySavedNativeOwner } from "../../src/current-pcb-diagnostic-owner.ts";

type Mode = "ready" | "stderr-close" | "malformed" | "wrong-challenge" | "oversize-no-newline" | "stderr-delayed-close" | "resource-traffic" | "saved-admission-failure" | "saved-spawn-refusal";
export interface SyntheticForwardFactoryOwner extends CurrentFootprintCopyForwardNativeOwner {
  syntheticClockIssuerForTest: (issuer: CurrentFootprintCopyWindowsClockIssuer) => void;
  syntheticForwardRequestForTest: (request: Readonly<Record<string, unknown>>) => Promise<Readonly<Record<string, unknown>>>;
  syntheticForwardFrameForTest: (frame: Buffer) => Promise<void>;
}
export interface SyntheticForwardSavedFactoryOwner extends CurrentFootprintCopyForwardSavedNativeOwner {
  syntheticForwardRequestForTest: (request: Readonly<Record<string, unknown>>) => Promise<Readonly<Record<string, unknown>>>;
  syntheticForwardFrameForTest: (frame: Buffer) => Promise<void>;
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
}
/** Exercise the real owner factories, private registries and transport counters
 * with synthetic installation/SQL seams and an inert Node child. Fixed modes
 * model readiness, failure and saved-owner birth without Windows resources.
 * Callers must retain the returned child through cleanup; the fixture issues
 * no native application ownership, real closed-SQL proof or writer authority.
 */
export async function combinedReadyFactoryFixture(mode: Mode, purpose: "combined" | "forward" = "combined", savedObservation = false): Promise<Readonly<{
  api: Module; options: CurrentPcbDiagnosticInstallationOptions; child: () => ChildProcessWithoutNullStreams;
  state: { writes: number; bytes: number; readySent: boolean; actions: string[] };
  seedSyntheticClosedSnapshot: (writer: SyntheticForwardFactoryOwner, after: object) => void;
}>> {
  const path = new URL("../../src/current-pcb-diagnostic-owner.ts", import.meta.url);
  const actualRequire = createRequire(path);
  const pluginRoot = fileURLToPath(new URL("../..", path)).replace(/\/$/u, "");
  const helper = await readFile(new URL("../../../scripts/pcb-diagnostic-owner.ps1", import.meta.url));
  let ownerSource = await readFile(path, "utf8");
  if (purpose === "forward") {
    // An explicit synthetic command seam reaches actual original counters and
    // Pipe callbacks. It proves no Windows handle, app launch or writer route.
    ownerSource = ownerSource.replace("  public status():", "  public syntheticForwardRequestForTest(request: RecordValue): Promise<RecordValue> { return this.#request(request); }\n" +
      "  public syntheticForwardFrameForTest(frame: Buffer): Promise<void> { return new Promise<void>((resolve,reject)=>{void this.#sendFrame(frame,cause=>{if(cause===undefined||cause===null){resolve();}else{reject(cause);}});}); }\n" +
      "  public syntheticClockIssuerForTest(issuer: CurrentFootprintCopyWindowsClockIssuer): void { this.#footprintWindowsClock=issuer; }\n" +
      "  public syntheticForwardClosedSourceForTest(source: CurrentFootprintCopyNativeTarget): void { this.#footprintSourceBinding=source; this.#footprintSourceBindingText=canonicalJson({...source,before:undefined}); }\n  public status():");
  }
  const raw = ownerSource.replaceAll("import.meta.url", JSON.stringify(path.href))
    .replace(/const HELPER_SHA256 = "[a-f\d]{64}";/u, `const HELPER_SHA256 = "${createHash("sha256").update(helper).digest("hex")}";`)
    .replace(/const HELPER_BYTES = [\d_]+;/u, `const HELPER_BYTES = ${String(helper.length)};`);
  const output = await transform(raw, { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} }, sourceOnly = Object.freeze({ syntheticSourceOnly: true });
  const options = Object.freeze({ pluginRoot, assetsRoot: "/synthetic-unused-assets", powershellSha256: "a".repeat(64), powershellBytes: 1, wslDistribution: "Synthetic" });
  const installation = Object.freeze({ paths: { powershellExecutable: "synthetic-inert-node-only" },
    plan: { schema: "easyeda-pro-control.pcb-diagnostic-installation.v1", files: [] }, facadeSha256: "a".repeat(64) });
  let original: ChildProcessWithoutNullStreams | null = null;
  let selectedAfter: object | null = null, selectedWriter: SyntheticForwardFactoryOwner | null = null;
  const checkpoint = Object.freeze({ sourceSha256: "d".repeat(64) });
  const state: { writes: number; bytes: number; readySent: boolean; actions: string[] } = { writes: 0, bytes: 0, readySent: false, actions: [] };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-pcb-diagnostic-installation.ts") { return {
      verifyCurrentPcb209DiagnosticInstallation: (): Promise<unknown> => mode === "saved-admission-failure" && selectedWriter !== null ?
        Promise.reject(new Error("Synthetic saved admission failed")) : Promise.resolve(installation),
      verifyCurrentPcb209DiagnosticFacade: (): Promise<unknown> => Promise.resolve(installation),
      qualifyCurrentPcb209StartupActorInstallation: (): Promise<unknown> => Promise.resolve(sourceOnly),
      verifyCurrentPcb209WorkerBootstrapInstallation: (): Promise<void> => Promise.resolve(),
    }; }
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
      assert.equal(bootstrap.includes(" -WorkerStartupFootprintCombined209 "), !saved && purpose === "combined");
      if (saved && mode === "saved-spawn-refusal") { throw new Error("Synthetic saved spawn unresolved"); }
      const packet = { challenge: match?.[1] ?? "", schema: CURRENT_FOOTPRINT_COMBINED_READY.schema, helperInstance: "b".repeat(32), jobId: "c".repeat(32),
        creationState: "not-entered", processCreated: false, emptyJob: true, pipesChecked: true };
      const child = spawn(process.execPath, ["-e", `
const mode=${JSON.stringify(mode)},packet=${JSON.stringify(packet)},saved=${JSON.stringify(saved)};const readline=require('node:readline');
const input=readline.createInterface({input:process.stdin});
if(mode.startsWith('stderr'))process.stderr.write('private-synthetic-diagnostic');
else if(!saved)setTimeout(()=>{if(mode==='oversize-no-newline'){process.stdout.write('x'.repeat(513));return;}if(mode==='malformed')packet.processCreated=true;if(mode==='wrong-challenge')packet.challenge=(packet.challenge[0]==='0'?'1':'0')+packet.challenge.slice(1);process.stdout.write(JSON.stringify(packet)+'\\n');},20);
input.on('line',line=>{const q=JSON.parse(line);let result;
if(q.action==='release-unlaunched')result={released:true,launchNeverAttempted:true};
else if(mode==='resource-traffic'&&(q.action==='send'||q.action==='main-send'||q.action==='saved-cache-native'))result={written:true};
else if(mode==='resource-traffic'&&q.action==='poll')result={bytes:Buffer.from(JSON.stringify({id:1,result:{}})+'\\0').toString('base64')};
else if(mode==='resource-traffic'&&q.action==='main-poll')result={bytes:Buffer.from('{}\\0').toString('base64'),receivedBytes:4,frames:1};
else if(mode==='resource-traffic'&&q.action==='worker-startup-reprove')result={current:true};
else if(mode==='resource-traffic'&&['termination','window','normal-close','main-close-detach','combined-abort'].includes(q.action))result={syntheticCleanup:true};
else throw Error('Unexpected inert request');
process.stdout.write(JSON.stringify({id:q.id,ok:true,result})+'\\n');});
input.on('close',()=>{if(mode==='stderr-delayed-close')setTimeout(()=>process.exit(1),1000);});
`], { stdio: ["pipe", "pipe", "pipe"] });
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
  return { api, options, state, child: (): ChildProcessWithoutNullStreams => { assert.ok(original !== null); return original; },
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
