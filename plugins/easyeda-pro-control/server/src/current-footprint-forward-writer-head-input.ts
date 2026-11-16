/* oxlint-disable import/max-dependencies -- This data-only preparation joins the existing checkpoint, completed reader, source plan and head reference; none supplies a native owner. */
/** Distinct full-writer input. A genuine completed before reader is consumed
 * before its own full native allocation; historical v2 providers stay separate.
 * This module creates no EasyEDA application, writer, or continuation authority. */
import { types } from "node:util";
import { canonicalJson } from "./core.ts";
import type { z } from "zod";
import { prepareCurrentDisposableOpenCheckpoint, verifyCurrentDisposableOpenCheckpoint, verifyHistoricalCurrentDisposableOpenCheckpoint } from "./current-disposable-open-checkpoint.ts";
import type { CurrentDisposableOpenCheckpoint } from "./current-disposable-open-checkpoint.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import type { CurrentPcbDiagnosticLifecycleOptions } from "./current-pcb-diagnostic-lifecycle.ts";
import type { CurrentPcbDiagnosticInstallationOptions } from "./current-pcb-diagnostic-installation.ts";
import { prepareCurrentFootprintSourcePlan } from "./current-footprint-source-plan.ts";
import { prepareCurrentFootprintCopyHeadReference, requireCurrentFootprintCopyHeadReference } from "./current-footprint-copy-head-reference.ts";
import type { CurrentFootprintForwardHeadSource } from "./current-footprint-forward-head-origin.ts";
import { readExactSqlInventory, readerCompletion } from "./sqlite-inventory.ts";
import { loadRuntimeMachineProfile } from "./machine-profile.ts";
import type { MachineProfile } from "./machine-profile.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

import {currentFootprintForwardWriterHeadInputRequestSchema} from "./current-footprint-forward-writer-input-contract.ts";

export {currentFootprintForwardWriterHeadInputRequestSchema} from "./current-footprint-forward-writer-input-contract.ts";

type Request = Readonly<z.infer<typeof currentFootprintForwardWriterHeadInputRequestSchema>>;
export interface CurrentFootprintForwardWriterHeadInput {
  readonly profile: "private.current-footprint-forward-writer-head-input.v1";
  readonly executionAuthorized: false;
}
interface Prepared {
  readonly checkpoint: CurrentDisposableOpenCheckpoint;
  readonly checkpointText: string;
  readonly source: CurrentFootprintForwardHeadSource;
  readonly sourcePlanText: string;
  readonly completion: ReturnType<typeof readerCompletion>;
  readonly sealedTarget: Readonly<z.infer<typeof currentDisposableOpenSealedTargetSchema>>;
  readonly runtime: MachineProfile["runtime"];
}
interface InputRecord {
  readonly request: Request;
  readonly options: CurrentPcbDiagnosticLifecycleOptions;
  readonly birthOptions: CurrentPcbDiagnosticInstallationOptions;
  readonly guards: readonly unknown[];
  attempted: boolean;
  failed: boolean;
  prepared: Prepared | null;
  pending: Promise<Readonly<{ prepared: true; executionAuthorized: false }>> | null;
  allocation: object | null;
}
const records = new WeakMap<CurrentFootprintForwardWriterHeadInput, InputRecord>();
function need(value: boolean): asserts value { if (!value) { throw new Error("FORWARD_WRITER_HEAD_INPUT"); } }
function original(input: CurrentFootprintForwardWriterHeadInput): InputRecord {
  const record = records.get(input); need(record !== undefined); return record;
}
function current(record: InputRecord): void {
  need(!record.failed && record.options.assertAllowed === record.guards[0] && record.options.assertLocalAllowed === record.guards[1] &&
    record.options.assertOtherLaunchesSettled === record.guards[2]);
  record.options.assertLocalAllowed();
  const prepared = record.prepared;
  if (prepared !== null) {
    need(canonicalJson(prepared.checkpoint) === prepared.checkpointText && readerCompletion(prepared.source.before) === prepared.completion &&
      Object.isFrozen(prepared.source.before) && prepared.source.before.checkpointSha256 === prepared.checkpoint.checkpoint.checkpointSha256 &&
      canonicalJson(prepared.source.sourcePlan) === prepared.sourcePlanText);
    requireCurrentFootprintCopyHeadReference(prepared.source.reference, prepared.source.before, prepared.source.sourcePlan);
  }
}
/** Create a recoverable local input before its first asynchronous preparation.
 * Its distinct request namespace transfers data only, never a v2 provider/birth. */
export function createCurrentFootprintForwardWriterHeadInput(request: unknown, options: CurrentPcbDiagnosticLifecycleOptions): CurrentFootprintForwardWriterHeadInput {
  need(options !== null && typeof options === "object" && !types.isProxy(options) && Object.isFrozen(options) && Object.getPrototypeOf(options) === Object.prototype);
  const allowed = new Set(["pluginRoot","assetsRoot","powershellSha256","powershellBytes","wslDistribution","assertAllowed","assertLocalAllowed","assertOtherLaunchesSettled"]);
  for (const key of Reflect.ownKeys(options)) {
    const descriptor = Object.getOwnPropertyDescriptor(options,key);
    need(typeof key === "string" && allowed.has(key) && descriptor !== undefined && Object.hasOwn(descriptor,"value"));
  }
  const guards = Object.freeze<readonly unknown[]>([options.assertAllowed,options.assertLocalAllowed,options.assertOtherLaunchesSettled]);
  need(guards.every(guard => typeof guard === "function" && !types.isProxy(guard)));
  const selected = freezeDeep(currentFootprintForwardWriterHeadInputRequestSchema.parse(captureCurrentPcbStringClockReply(request).value));
  const birthOptions = Object.freeze({ pluginRoot: options.pluginRoot, assetsRoot: options.assetsRoot, powershellSha256: options.powershellSha256,
    powershellBytes: options.powershellBytes, ...(options.wslDistribution === undefined ? {} : { wslDistribution: options.wslDistribution }) });
  const input: CurrentFootprintForwardWriterHeadInput = Object.freeze({ profile: "private.current-footprint-forward-writer-head-input.v1", executionAuthorized: false });
  records.set(input,{request:selected,options,birthOptions,guards,attempted:false,failed:false,prepared:null,pending:null,allocation:null});
  return input;
}
/** Own exactly one original preparation Promise, including failures. The
 * caller retains input synchronously before this method can allocate a reader. */
export function prepareCurrentFootprintForwardWriterHeadInput(input: CurrentFootprintForwardWriterHeadInput): Promise<Readonly<{ prepared: true; executionAuthorized: false }>> {
  const record=original(input); need(!record.attempted && record.allocation===null); record.attempted=true;
  const pending=(async ():Promise<Readonly<{prepared:true;executionAuthorized:false}>> => {
    try {
      current(record); await record.options.assertAllowed(); current(record);
      await record.options.assertOtherLaunchesSettled(); current(record);
      const checkpoint=await prepareCurrentDisposableOpenCheckpoint(record.request.target); current(record);
      const configured=await loadRuntimeMachineProfile(); current(record);
      await verifyCurrentDisposableOpenCheckpoint(checkpoint,record.request.target); current(record);
      const before=await readExactSqlInventory({checkpointPath:checkpoint.checkpoint.checkpoint,expectedSha256:checkpoint.checkpoint.checkpointSha256,runtime:configured.profile.runtime});
      current(record); const completion=readerCompletion(before);
      need(completion.observedChildClose && completion.exitCode===0 && completion.exitSignal===null && before.checkpointSha256===checkpoint.checkpoint.checkpointSha256);
      await verifyCurrentDisposableOpenCheckpoint(checkpoint,record.request.target); current(record);
      const target=currentDisposableOpenSealedTargetSchema.parse({...record.request.target,branchUuid:checkpoint.targetEvidence.branchUuid});
      const sourcePlan=await prepareCurrentFootprintSourcePlan(before,{projectUuid:target.projectUuid,branchUuid:target.branchUuid,footprintUuid:record.request.footprintUuid}); current(record);
      const reference=await prepareCurrentFootprintCopyHeadReference(before,sourcePlan); current(record);
      await verifyCurrentDisposableOpenCheckpoint(checkpoint,record.request.target); current(record);
      record.prepared=Object.freeze({checkpoint,checkpointText:canonicalJson(checkpoint),source:Object.freeze({before,sourcePlan,reference,rawWindowsPath:target.rawWindowsPath}),
        sourcePlanText:canonicalJson(sourcePlan),completion,sealedTarget:freezeDeep(target),runtime:freezeDeep({...configured.profile.runtime})});
      current(record); return Object.freeze({prepared:true,executionAuthorized:false});
    } catch(error) { record.failed=true; throw error; }
  })();
  record.pending=pending; return pending;
}
/** Return the actual immutable options object for this input's future birth.
 * Equal caller options or historical data cannot replace this identity. */
export function currentFootprintForwardWriterHeadInputBirthOptions(input: CurrentFootprintForwardWriterHeadInput): CurrentPcbDiagnosticInstallationOptions {
  const record=original(input); current(record); need(record.prepared!==null && record.allocation===null); return record.birthOptions;
}
/** The genuine full factory consumes input before any allocation await. */
export function consumeCurrentFootprintForwardWriterHeadInput(input: CurrentFootprintForwardWriterHeadInput, options: CurrentPcbDiagnosticInstallationOptions, allocation: object): void {
  const record=original(input); need(record.prepared!==null && record.allocation===null && record.birthOptions===options);
  record.allocation=allocation; current(record);
}
/** Reverify the original source before the factory can allocate or return.
 * A failed reproof burns this input; it never loses the factory's native owner. */
export async function verifyCurrentFootprintForwardWriterHeadInput(input: CurrentFootprintForwardWriterHeadInput, allocation: object): Promise<void> {
  const record=original(input); need(record.allocation===allocation && record.prepared!==null);
  try { current(record); await verifyCurrentDisposableOpenCheckpoint(record.prepared.checkpoint,record.request.target); current(record); need(record.allocation===allocation); }
  catch(error) { record.failed=true; throw error; }
}
/** Original same-reader data only. Core additionally proves its exact full
 * allocation/owner and retains that check around every live dispatch await. */
export function requireCurrentFootprintForwardWriterHeadInput(input: CurrentFootprintForwardWriterHeadInput, allocation: object): CurrentFootprintForwardHeadSource {
  const record=original(input); current(record); need(record.allocation===allocation && record.prepared!==null); return record.prepared.source;
}
/** Read local phase information without issuing ownership or a retry. */
export function currentFootprintForwardWriterHeadInputStatus(input: CurrentFootprintForwardWriterHeadInput): Readonly<{attempted:boolean;prepared:boolean;consumed:boolean;failed:boolean;executionAuthorized:false}> {
  const record=original(input); return Object.freeze({attempted:record.attempted,prepared:record.prepared!==null,consumed:record.allocation!==null,failed:record.failed,executionAuthorized:false});
}

/** Immutable request scope for readonly comparison, not a sealed native UI target. */
export function requireCurrentFootprintForwardWriterHeadInputScope(input: CurrentFootprintForwardWriterHeadInput, allocation: object): Readonly<{operationId:string}> {
  const record=original(input); current(record); need(record.allocation===allocation && record.prepared!==null); return record.request;
}

/** Original prepared data for the distinct full opening coordinator. This is
 * not an owner/continuation token and cannot substitute for factory consumption. */
export function requireCurrentFootprintForwardWriterPreparedInput(input:CurrentFootprintForwardWriterHeadInput):Readonly<{
  request:Request;checkpoint:CurrentDisposableOpenCheckpoint;sealedTarget:Prepared["sealedTarget"];runtime:MachineProfile["runtime"];source:CurrentFootprintForwardHeadSource;
}> {
  const record=original(input);current(record);need(record.prepared!==null);
  return Object.freeze({request:record.request,checkpoint:record.prepared.checkpoint,sealedTarget:record.prepared.sealedTarget,runtime:record.prepared.runtime,source:record.prepared.source});
}
/** Before navigation reprove the actual source; after navigation reprove only
 * its retained managed backup, never mint another baseline or reader. */
export async function verifyCurrentFootprintForwardWriterPreparedInput(input:CurrentFootprintForwardWriterHeadInput,historical:boolean):Promise<void> {
  const record=original(input);current(record);need(record.prepared!==null);const prepared=record.prepared;
  await (historical?verifyHistoricalCurrentDisposableOpenCheckpoint(prepared.checkpoint,record.request.target):verifyCurrentDisposableOpenCheckpoint(prepared.checkpoint,record.request.target));
  current(record);need(record.prepared===prepared);
}
