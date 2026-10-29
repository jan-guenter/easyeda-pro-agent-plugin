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
import type { CurrentPcbDiagnosticInstallationOptions } from "../../src/current-pcb-diagnostic-installation.ts";
import type { CurrentFootprintCombinedNativeOwner, currentFootprintCombinedFactoryFailureDiagnostics, requireCurrentFootprintCombinedUnlaunchedFactoryFailure } from "../../src/current-pcb-diagnostic-owner.ts";

type Mode = "ready" | "stderr-close" | "malformed" | "wrong-challenge" | "oversize-no-newline" | "stderr-delayed-close";
interface Module {
  readonly startCurrentFootprintCombinedNativeOwner: (options: CurrentPcbDiagnosticInstallationOptions) => Promise<CurrentFootprintCombinedNativeOwner>;
  readonly currentFootprintCombinedFactoryFailureDiagnostics: typeof currentFootprintCombinedFactoryFailureDiagnostics;
  readonly requireCurrentFootprintCombinedUnlaunchedFactoryFailure: typeof requireCurrentFootprintCombinedUnlaunchedFactoryFailure;
}
export async function combinedReadyFactoryFixture(mode: Mode): Promise<Readonly<{
  api: Module; options: CurrentPcbDiagnosticInstallationOptions; child: () => ChildProcessWithoutNullStreams;
  state: { writes: number; bytes: number; readySent: boolean };
}>> {
  const path = new URL("../../src/current-pcb-diagnostic-owner.ts", import.meta.url);
  const actualRequire = createRequire(path);
  const pluginRoot = fileURLToPath(new URL("../..", path)).replace(/\/$/u, "");
  const helper = await readFile(new URL("../../../scripts/pcb-diagnostic-owner.ps1", import.meta.url));
  const ownerSource = await readFile(path, "utf8");
  const raw = ownerSource.replaceAll("import.meta.url", JSON.stringify(path.href))
    .replace(/const HELPER_SHA256 = "[a-f\d]{64}";/u, `const HELPER_SHA256 = "${createHash("sha256").update(helper).digest("hex")}";`)
    .replace(/const HELPER_BYTES = [\d_]+;/u, `const HELPER_BYTES = ${String(helper.length)};`);
  const output = await transform(raw, { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} }, sourceOnly = Object.freeze({ syntheticSourceOnly: true });
  const options = Object.freeze({ pluginRoot, assetsRoot: "/synthetic-unused-assets", powershellSha256: "a".repeat(64), powershellBytes: 1, wslDistribution: "Synthetic" });
  const installation = Object.freeze({ paths: { powershellExecutable: "synthetic-inert-node-only" },
    plan: { schema: "easyeda-pro-control.pcb-diagnostic-installation.v1", files: [] }, facadeSha256: "a".repeat(64) });
  let original: ChildProcessWithoutNullStreams | null = null;
  const state = { writes: 0, bytes: 0, readySent: false };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-pcb-diagnostic-installation.ts") { return {
      verifyCurrentPcb209DiagnosticInstallation: (): Promise<unknown> => Promise.resolve(installation),
      verifyCurrentPcb209DiagnosticFacade: (): Promise<unknown> => Promise.resolve(installation),
      qualifyCurrentPcb209StartupActorInstallation: (): Promise<unknown> => Promise.resolve(sourceOnly),
      verifyCurrentPcb209WorkerBootstrapInstallation: (): Promise<void> => Promise.resolve(),
    }; }
    if (name === "./current-pcb-209-actor-clock-source.ts") { return { requireCurrentPcb209ActorClockSourceQualification: (value: unknown): void => { assert.equal(value, sourceOnly); } }; }
    if (name === "./current-footprint-combined-ready.ts") { return { decodeCurrentFootprintCombinedReady,
      CURRENT_FOOTPRINT_COMBINED_READY: { ...CURRENT_FOOTPRINT_COMBINED_READY, milliseconds: 5000, eofCleanupMilliseconds: 500 } }; }
    if (name !== "node:child_process") { return actualRequire(name) as unknown; }
    return { spawn: (executable: unknown, args: unknown): ChildProcessWithoutNullStreams => {
      assert.equal(executable, "synthetic-inert-node-only"); assert.equal(original, null);
      assert.ok(Array.isArray(args)); const encoded: unknown = args.at(-1); assert.equal(typeof encoded, "string"); assert.ok(typeof encoded === "string");
      const bootstrap = Buffer.from(encoded, "base64").toString("utf16le"), match = / -CombinedReadyChallenge '([a-f0-9]{32})'/u.exec(bootstrap);
      assert.ok(match?.[1] !== undefined);
      const packet = { challenge: match[1], schema: CURRENT_FOOTPRINT_COMBINED_READY.schema, helperInstance: "b".repeat(32), jobId: "c".repeat(32),
        creationState: "not-entered", processCreated: false, emptyJob: true, pipesChecked: true };
      const child = spawn(process.execPath, ["-e", `
const mode=${JSON.stringify(mode)},packet=${JSON.stringify(packet)};const readline=require('node:readline');
const input=readline.createInterface({input:process.stdin});
if(mode.startsWith('stderr'))process.stderr.write('private-synthetic-diagnostic');
else setTimeout(()=>{if(mode==='oversize-no-newline'){process.stdout.write('x'.repeat(513));return;}if(mode==='malformed')packet.processCreated=true;if(mode==='wrong-challenge')packet.challenge=(packet.challenge[0]==='0'?'1':'0')+packet.challenge.slice(1);process.stdout.write(JSON.stringify(packet)+'\\n');},20);
input.on('line',line=>{const q=JSON.parse(line);if(q.action!=='release-unlaunched')throw Error('Unexpected inert request');process.stdout.write(JSON.stringify({id:q.id,ok:true,result:{released:true,launchNeverAttempted:true}})+'\\n');});
input.on('close',()=>{if(mode==='stderr-delayed-close')setTimeout(()=>process.exit(1),1000);});
`], { stdio: ["pipe", "pipe", "pipe"] });
      original = child;
      child.stdout.on("data", () => { state.readySent = true; });
      const write = child.stdin.write.bind(child.stdin);
      // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Forward both synchronous Writable.write overloads and their original callbacks unchanged.
      child.stdin.write = (value: Uint8Array | string, encodingOrCallback?: BufferEncoding | ((error?: Error | null) => void), callback?: (error?: Error | null) => void): boolean => {
        state.writes += 1; assert.equal(typeof value, "string"); assert.ok(typeof value === "string"); state.bytes += Buffer.byteLength(value);
        if (typeof encodingOrCallback === "string") { return write(value, encodingOrCallback, callback); }
        return write(value, encodingOrCallback);
      };
      return child;
    } };
  }, loaded, loaded.exports]);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The actual maintained module exports these named functions; only installation/child fixtures are substituted, never its private registries.
  const api = loaded.exports as unknown as Module;
  return { api, options, state, child: (): ChildProcessWithoutNullStreams => { assert.ok(original !== null); return original; } };
}
