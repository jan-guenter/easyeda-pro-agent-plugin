/** Genuine factory/main/capability registries and real managed publication.
 * Installation, UI/source collectors and inspector fragments are explicitly
 * synthetic. The inert child supplies native-control ACKs; no Windows app,
 * actual native inspector delivery or complete source qualification is proved. */
/* oxlint-disable import/max-dependencies -- Retain each real issuer/private-field engine and label the external source, inspector and process seams separately. */
import assert from "node:assert/strict";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { runInThisContext } from "node:vm";
import { setImmediate as nextTurn } from "node:timers/promises";
import type { TestContext } from "node:test";
import { transform } from "esbuild";
import { sha256Json, sha256Text } from "../../src/core.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE } from "../../src/current-footprint-copy-main-backend-source.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_COLLECTION_SITES } from "../../src/current-footprint-copy-main-request-protocol.ts";
import { CURRENT_FOOTPRINT_FORWARD_EXECUTION_OPENING_NORMAL_STAGES as STAGES,
  currentFootprintForwardExecutionOpeningRequestSchema, currentFootprintForwardExecutionOpeningResultSchema } from "../../src/current-footprint-forward-execution-opening-contract.ts";
import { CurrentFootprintForwardExecutionOpeningJournal } from "../../src/current-footprint-forward-execution-opening-journal.ts";
import type { CurrentFootprintCopyMainBackendObservation, CurrentFootprintCopyMainBackendRunner, CurrentFootprintCopyMainBackendTransport,
  requireCurrentFootprintCopyMainRequestOrigin, requireCurrentFootprintForwardMainRequestOrigin } from "../../src/current-footprint-copy-main-backend-runner.ts";
import type { CurrentFootprintCopyMainBackendCommand } from "../../src/current-footprint-copy-main-backend-contract.ts";
import type { isCurrentFootprintForwardExecutionMainCapability, issueCurrentFootprintForwardExecutionMainCapability,
  reproveCurrentFootprintForwardExecutionMainPublication, requireCurrentFootprintForwardExecutionMainNativeOwner } from "../../src/current-footprint-forward-execution-main-capability.ts";
import type { CurrentFootprintCopyMainRequestRunner, createCurrentFootprintForwardMainRequestRunner } from "../../src/current-footprint-copy-main-request-runner.ts";
import type { CurrentFootprintForwardExecutionOpeningProvider } from "../../src/current-footprint-forward-execution-opening.ts";
import { combinedReadyFactoryFixture } from "./current-footprint-combined-ready-fixture.ts";
import { mainBackendTransportFixture } from "./footprint-main-backend-runner-fixture.ts";
import { syntheticRequestSource } from "./footprint-main-request-collector-fixture.ts";
import { mainCompletionRunnerFixture } from "./footprint-main-completion-runner-fixture.ts";

interface SyntheticProvider extends CurrentFootprintForwardExecutionOpeningProvider {
  seedMainSourceForTest: (owner: object, opening: object, result: object, before: object, journal: object, publication: object, sealed: boolean) => void;
}
type MainApi = Readonly<{ CurrentFootprintCopyMainBackendRunner: typeof CurrentFootprintCopyMainBackendRunner;
  requireCurrentFootprintCopyMainRequestOrigin: typeof requireCurrentFootprintCopyMainRequestOrigin;
  requireCurrentFootprintForwardMainRequestOrigin: typeof requireCurrentFootprintForwardMainRequestOrigin }>;
type CapabilityApi = Readonly<{ isCurrentFootprintForwardExecutionMainCapability: typeof isCurrentFootprintForwardExecutionMainCapability;
  issueCurrentFootprintForwardExecutionMainCapability: typeof issueCurrentFootprintForwardExecutionMainCapability;
  reproveCurrentFootprintForwardExecutionMainPublication: typeof reproveCurrentFootprintForwardExecutionMainPublication;
  requireCurrentFootprintForwardExecutionMainNativeOwner: typeof requireCurrentFootprintForwardExecutionMainNativeOwner }>;
type RequestApi = Readonly<{ CurrentFootprintCopyMainRequestRunner: typeof CurrentFootprintCopyMainRequestRunner;
  createCurrentFootprintForwardMainRequestRunner: typeof createCurrentFootprintForwardMainRequestRunner }>;
interface ProviderModule {
  readonly CurrentFootprintForwardExecutionOpeningProvider: new (...args: ConstructorParameters<typeof CurrentFootprintForwardExecutionOpeningProvider>) => SyntheticProvider;
}
interface Gate {
  calls: number;
  holdAt: number;
  readonly entered: PromiseWithResolvers<null>;
  readonly release: PromiseWithResolvers<null>;
  wait: () => Promise<void>;
}
type ActualOwner = Awaited<ReturnType<Awaited<ReturnType<typeof combinedReadyFactoryFixture>>["api"]["startCurrentFootprintForwardExecutionNativeOwner"]>>;
export async function forwardMainAuthorityFixture(context: TestContext, suffix: string, sealed = true,
  nativeMode: "ordinary" | "bad-accounting" | "held-allocation" = "ordinary"): Promise<Readonly<{
  owner: ActualOwner;
  factory: Awaited<ReturnType<typeof combinedReadyFactoryFixture>>;
  main: CurrentFootprintCopyMainBackendRunner;
  construction: CurrentFootprintCopyMainBackendObservation;
  mainApi: MainApi;
  capabilityApi: CapabilityApi;
  requestApi: RequestApi;
  provider: SyntheticProvider;
  journal: CurrentFootprintForwardExecutionOpeningJournal;
  gate: Gate;
  injectPartialFrame: () => void;
  waitForAllocationPoll: () => Promise<void>;
  releaseHeldAllocationPoll: () => void;
}>> {
  const ownerExports: Record<string, unknown> = {};
  const base = mainBackendTransportFixture(); const completion = mainCompletionRunnerFixture();
  const qualifiedBackend = Object.freeze({ profile: "private.current-footprint-copy-main-backend-source.v1", sha256: CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE.sha256, runtimeBound: false, executionAuthorized: false });
  const gate: Gate = { calls: 0, holdAt: 0, entered: Promise.withResolvers<null>(), release: Promise.withResolvers<null>(),
    async wait(): Promise<void> { this.calls += 1; if (this.calls === this.holdAt) { this.entered.resolve(null); await this.release.promise; } } };
  const names = ["current-footprint-copy-main-backend-runner.ts", "current-footprint-forward-execution-main-capability.ts",
    "current-footprint-copy-main-request-runner.ts", "current-footprint-copy-main-completion-runner.ts", "current-footprint-forward-execution-opening.ts"];
  const outputs = new Map<string, string>(); const cache = new Map<string, { exports: Record<string, unknown> }>();
  for (const name of names) {
    const url = new URL(`../../src/${name}`, import.meta.url); let source = await readFile(url, "utf8");
    if (name === "current-footprint-forward-execution-opening.ts") {
      // Seed only external collector results. Production admission, captured
      // Receiver checks, managed publication and native registries stay real.
      source = source.replace("  public constructor(input: CurrentPcbDiagnosticLifecycleOptions)", `  public seedMainSourceForTest(owner: object, opening: object, result: object, before: object, journal: object, publication: object, sealed: boolean): void {
        this.#owner=owner as never;this.#opening=opening as never;this.#openingResult=result as never;this.#prepared={before} as never;
        this.#journal=journal as never;this.#result=publication as never;this.#stage=sealed?'sealed':'ui-source';
        this.#journalCurrent=captureCurrentFootprintForwardExecutionReceiver(journal,journalPrototypes,['reserve','append','settle','waitForCurrentPublication','assertCurrent','retained','reservationOutcome']);
      }
      public constructor(input: CurrentPcbDiagnosticLifecycleOptions)`);
      source = `import {wait as syntheticPublicationWaitForTest} from './synthetic-publication-gate-for-test';\n${source}`;
      const publicationAnchor = "await this.#journalRequired().assertCurrent(); this.#current();\n    const owner =";
      assert.equal(source.split(publicationAnchor).length, 2, "Expected exactly one original publication gate anchor.");
      source = source.replace(publicationAnchor, "await this.#journalRequired().assertCurrent(); await syntheticPublicationWaitForTest(); this.#current();\n    const owner =");
    }
    const output = await transform(source, { loader: "ts", format: "cjs", target: "node24", supported: { "dynamic-import": false } }); outputs.set(`./${name}`, output.code);
  }
  const sourceRequire = createRequire(new URL("../../src/current-footprint-copy-main-backend-runner.ts", import.meta.url));
  function load(name: string): Record<string, unknown> {
    const found = cache.get(name); if (found !== undefined) { return found.exports; }
    const output = outputs.get(name); assert.ok(output !== undefined);
    const exports: Record<string, unknown> = {}; const loaded = { exports }; cache.set(name, loaded);
    const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output}\n})`); assert.ok(typeof evaluate === "function");
    Reflect.apply(evaluate, undefined, [(specifier: string): unknown => {
      if (outputs.has(specifier)) { return load(specifier); }
      if (specifier === "./current-pcb-diagnostic-owner.ts") { return ownerExports; }
      if (specifier === "./synthetic-publication-gate-for-test") { return { wait: (): Promise<void> => gate.wait() }; }
      if (specifier === "./current-footprint-copy-main-request-origin.ts") { return load("./current-footprint-copy-main-backend-runner.ts"); }
      if (specifier === "./current-footprint-copy-main-completion-origin.ts") { return load("./current-footprint-copy-main-backend-runner.ts"); }
      if (specifier === "./current-footprint-copy-main-backend-source.ts") {
        const actual: unknown = sourceRequire("./current-footprint-copy-main-backend-source.ts"); assert.ok(actual !== null && typeof actual === "object");
        return { ...actual,
          qualifyCurrentFootprintCopyMainBackendSource: (value: unknown): object => { assert.equal(value, "synthetic-complete-app-source"); return qualifiedBackend; },
          requireCurrentFootprintCopyMainBackendSource: (value: unknown): void => { assert.equal(value, qualifiedBackend); } };
      }
      if (specifier === "./current-footprint-copy-main-request-source.ts") { return {
        qualifyCurrentFootprintCopyMainRequestSource: (): object => syntheticRequestSource,
        requireCurrentFootprintCopyMainRequestSource: (value: unknown): void => { assert.equal(value, syntheticRequestSource); } }; }
      if (specifier === "./current-footprint-copy-main-completion-source.ts") {
        const actual: unknown = sourceRequire("./current-footprint-copy-main-completion-source.ts"); assert.ok(actual !== null && typeof actual === "object");
        return { ...actual, qualifyCurrentFootprintCopyMainCompletionSource: (): object => completion.source,
          requireCurrentFootprintCopyMainCompletionSource: completion.requireSource };
      }
      return sourceRequire(specifier) as unknown;
    }, loaded, exports]);
    return loaded.exports;
  }
  const mainExports = load("./current-footprint-copy-main-backend-runner.ts");
  const capabilityExports = load("./current-footprint-forward-execution-main-capability.ts");
  for (const key of ["CurrentFootprintCopyMainBackendRunner", "requireCurrentFootprintForwardMainRequestOrigin", "captureOriginalCurrentFootprintForwardMainCursor"]) { assert.equal(typeof mainExports[key], "function"); }
  assert.equal(typeof capabilityExports["issueCurrentFootprintForwardExecutionMainCapability"], "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- These are the actual maintained VM modules and their private maps, not fabricated registry/capability entries.
  const mainApi = mainExports as unknown as MainApi;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Same original module graph; only source/inspector collectors are synthetic.
  const capabilityApi = capabilityExports as unknown as CapabilityApi;
  const requestExports = load("./current-footprint-copy-main-request-runner.ts");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The real private-field collector shares the exact original issuer module above.
  const requestApi = requestExports as unknown as RequestApi;
  const providerExports = load("./current-footprint-forward-execution-opening.ts"); assert.equal(typeof providerExports["CurrentFootprintForwardExecutionOpeningProvider"], "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Only the labelled source-collector seed method is added; actual provider admission and captured getter execute unchanged.
  const providerApi = providerExports as unknown as ProviderModule;
  let suppliedInputs: Awaited<ReturnType<typeof combinedReadyFactoryFixture>>["executionInputs"] | null = null;
  let owned: object | null = null;
  const factory = await combinedReadyFactoryFixture("execution-inputs", "forward-execution", false, { modules: {
    "./current-footprint-copy-main-backend-runner.ts": mainExports,
    "./current-footprint-forward-execution-main-capability.ts": capabilityExports,
    "./current-footprint-copy-preparation-runtime.ts": { requireCurrentFootprintCopyOwned: async (preparation: unknown, opening: unknown): Promise<object> => {
      assert.ok(suppliedInputs !== null && owned !== null); assert.equal(preparation, suppliedInputs.preparation); assert.equal(opening, suppliedInputs.opening); await Promise.resolve(); return owned;
    } },
  }, childProgram: `
const nativeMode=${JSON.stringify(nativeMode)},sites=${JSON.stringify(CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_COLLECTION_SITES)};
const readline=require('node:readline');process.stdout.write(JSON.stringify(packet)+'\\n');
let frames=0,receivedBytes=0,firstAllocation=true,held=null;const queue=[];
const input=readline.createInterface({input:process.stdin});input.on('line',line=>{const q=JSON.parse(line);let result;
if(q.action==='synthetic-release-held-allocation-poll'){if(held===null)throw Error('No original held poll');process.stdout.write(JSON.stringify(held)+'\\n');held=null;return;}
if(q.action==='main-reprove')result={current:true};else if(q.action==='main-send')result={written:true};
else if(q.action==='main-request-send'){
let reply={};if(q.phase==='request-driver-arm')reply={breakpointId:'bp-0'};
else if(q.phase.startsWith('request-site-')){const role=q.phase.slice('request-site-'.length),site=sites[role],index=['driver','context','controller','editHead'].indexOf(role);if(!site||index<0)throw Error('Unknown fixed request site');reply={breakpointId:'bp-'+index,actualLocation:{scriptId:q.scriptId,lineNumber:site.lineNumber,columnNumber:site.columnNumber}};}
else if(!['request-remove','request-release'].includes(q.phase))throw Error('Unimplemented inert main invocation');
queue.push(JSON.stringify({id:q.requestId,result:reply})+'\\0');result={written:true};}
else if(q.action==='main-poll'){
const text=queue.shift()||'';if(text!==''){frames+=1;receivedBytes+=Buffer.byteLength(text)+1;}
result={bytes:Buffer.from(text).toString('base64'),receivedBytes,frames};
if(text!==''&&firstAllocation){firstAllocation=false;if(nativeMode==='bad-accounting'){result.receivedBytes=0;result.frames=0;}if(nativeMode==='held-allocation'){held={id:q.id,ok:true,result};return;}}
}else throw Error('Unexpected inert main authority request');
process.stdout.write(JSON.stringify({id:q.id,ok:true,result})+'\\n');});
` });
  Object.assign(ownerExports, factory.api); suppliedInputs = factory.executionInputs;
  context.after(async () => {
    let child: ReturnType<typeof factory.child>;
    try { child = factory.child(); } catch (error) { if (error instanceof assert.AssertionError) { return; } throw error; }
    if (child.exitCode === null && child.signalCode === null) { const closed = once(child, "close"); child.stdin.end(); await closed; }
  });
  const owner = await factory.api.startCurrentFootprintForwardExecutionNativeOwner(factory.options);
  let partial = false;
  const transport: CurrentFootprintCopyMainBackendTransport = Object.freeze({
    assertCurrent: (): Promise<void> => owner.reproveFootprintMain(),
    async send(command: CurrentFootprintCopyMainBackendCommand, id: number): Promise<void> { await owner.sendFootprintMain(command, id); await base.transport.send(command, id); },
    async poll(cleanup: boolean): Promise<string> {
      await owner.pollFootprintMain(cleanup); const value = await base.transport.poll(cleanup);
      if (!partial || value === "") { return value; } partial = false;
      return Buffer.concat([Buffer.from(value, "base64"), Buffer.from([0xC2])]).toString("base64");
    },
  });
  const main = new mainApi.CurrentFootprintCopyMainBackendRunner(transport);
  const rawWindowsPath = String.raw`C:\Synthetic\validation.eprj2`;
  const projectUuid = sha256Text(rawWindowsPath);
  const target = Object.freeze({ ...factory.executionInputs.target, projectUuid });
  owner.syntheticForwardExecutionSetupForTest(target, main);
  const construction = await main.observe(); owner.syntheticForwardMainUiForTest(factory.executionInputs.opening, factory.executionInputs.result);
  const source = Object.freeze({ projectUuid, branchUuid: "b".repeat(32) });
  owned = Object.freeze({ ...factory.executionInputs.owned, sourcePlan: Object.freeze({ source }) });
  const operationId = `footprint-forward-execution-main-${suffix}`;
  // oxlint-disable-next-line typescript/unbound-method -- Invoke the actual sealer with its exact original factory receiver and explicitly synthetic source collectors.
  const sealedSource: unknown = Reflect.apply(owner.sealFootprintForwardExecutionSource, owner, [operationId, factory.executionInputs.opening, factory.executionInputs.result,
    factory.executionInputs.preparation, factory.executionInputs.checkpoint, factory.executionInputs.runtime]);
  assert.ok(sealedSource instanceof Promise); await sealedSource;
  const originalSource = owner.originalFootprintForwardExecutionSource();
  const selected = currentFootprintForwardExecutionOpeningRequestSchema.parse({ operationId,
    target: { rawWindowsPath, projectUuid, documentUuid: "c".repeat(16), expectedSourceSha256: "d".repeat(64) }, footprintUuid: "e".repeat(16),
    confirmDisposableProject: true, acceptExistingProfileEffects: true, acceptNormalOpenEffects: true, acceptDebuggerPauseEffects: true });
  const journal = new CurrentFootprintForwardExecutionOpeningJournal(selected); await journal.reserve();
  for (const stage of STAGES) {
    await journal.append(`${stage}-intent`, {});
    if (stage === "seal" && !sealed) { break; }
    await journal.append(stage === "launch" ? "binding" : `${stage}-result`, {});
  }
  const binding = journal.retained().records.find(record => record.kind === "binding"); assert.ok(binding !== undefined);
  const publication = Object.freeze(currentFootprintForwardExecutionOpeningResultSchema.parse({
    schema: "easyeda-pro-control.footprint-forward-execution-source-input.v2", purpose: "worker-startup-footprint-forward-execution209", operationId,
    bindingSha256: sha256Json(binding), checkpointSha256: "d".repeat(64), beforeSqlSha256: "e".repeat(64), sourcePlanSha256: "f".repeat(64),
    sourcePacketSha256: "1".repeat(64), preparationSha256: "2".repeat(64), originalOpeningRetained: true, sameWriterSourceSealed: true,
    wholeWriterReserved: false, routeAndClocksQualified: false, executionReady: false, executionAuthorized: false, saveAuthorized: false }));
  const provider = new providerApi.CurrentFootprintForwardExecutionOpeningProvider(Object.freeze({ ...factory.options,
    assertLocalAllowed: (): void => undefined, assertAllowed: (): Promise<void> => Promise.resolve(), assertOtherLaunchesSettled: (): Promise<void> => Promise.resolve() }));
  provider.seedMainSourceForTest(owner, factory.executionInputs.opening, factory.executionInputs.result, originalSource.owned.before, journal, publication, sealed);
  return Object.freeze({ owner, factory, main, construction, mainApi, capabilityApi, requestApi, provider, journal, gate,
    injectPartialFrame: (): void => { partial = true; },
    waitForAllocationPoll: async (): Promise<void> => {
      const deadline = AbortSignal.timeout(5000);
      while (!deadline.aborted) {
        const lastRequest = factory.state.actions.lastIndexOf("main-request-send");
        if (lastRequest !== -1 && factory.state.actions.slice(lastRequest + 1).includes("main-poll")) { return; }
        await nextTurn();
      }
      assert.fail("Original allocation poll was not dispatched");
    },
    // This controls only the inert peer's held original reply, not a native
    // Operation, new request, registry membership or production permission.
    releaseHeldAllocationPoll: (): void => { factory.child().stdin.write(`${JSON.stringify({ action: "synthetic-release-held-allocation-poll" })}\n`); },
  });
}
