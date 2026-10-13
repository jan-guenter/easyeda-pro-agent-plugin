/* oxlint-disable import/max-dependencies -- The typed action coordinator selects independently reviewed schematic, PCB, batch, stack and copper proof implementations. */
import { z } from "zod";
import { buildDesignOperationCallExpression, compileDesignOperation, designOperationSchema } from "./design-operations.ts";
import type { CompiledDesignOperation } from "./design-operations.ts";
import { buildSchematicOperationCallExpression, compileSchematicOperation, schematicOperationSchema } from "./schematic-operations.ts";
import type { CompiledSchematicOperation } from "./schematic-operations.ts";
import { buildDesignNativeAdapter } from "./design-native-adapter.ts";
import { assertDesignSourceProfileSupported, buildInverseDesignOperation, verifyDesignSourceEffect } from "./design-source-proof.ts";
import { buildSchematicNativeComponentWriteExpression } from "./schematic-native-adapter.ts";
import { buildSchematicNativeWireAdapter, verifySchematicNativeWireEffect } from "./schematic-native-wire.ts";
import type { SchematicNativeSnapshot } from "./schematic-native-adapter.ts";
import { assertSchematicSourceProfileSupported, buildInverseSchematicOperation, prepareSchematicSourceOperation, verifySchematicSourceEffect } from "./schematic-source-proof.ts";
import type { NativeSourceDelta, NativeSourceSnapshot } from "./document-source.ts";
import { buildDesignStackAdapter, compileDesignStackOperation, designStackOperationSchema, expectedDesignStackSource, inverseDesignStackOperation, verifyDesignStackSourceEffect } from "./design-stack-adapter.ts";
import { buildDesignCopperAdapter, buildDesignCopperClearAdapter } from "./design-copper-adapter.ts";
import { buildDesignBatchAdapter, compileDesignBatchOperation, designBatchOperationSchema, inverseDesignBatchOperation, verifyDesignBatchSourceEffect } from "./design-batch-adapter.ts";
import { assertSchematicElectricalSupported, buildSchematicElectricalAdapter, inverseSchematicElectricalOperation, isSchematicElectricalAction, verifySchematicElectricalEffect } from "./schematic-electrical-adapter.ts";
import { assertSchematicComponentCreateSupported, buildSchematicComponentCreate, verifySchematicComponentCreate } from "./schematic-component-create.ts";
import type { SchematicComponentCreateAdapter } from "./schematic-component-create.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import { compareDocumentSources } from "./document-source.ts";
import { assertFootprintProfileSupported, compileFootprintOperation, expectedFootprintSource, footprintOperationSchema, inverseFootprintOperation, verifyFootprintSourceEffect } from "./footprint-action.ts";
import type { FootprintScope } from "./footprint-action.ts";
import { buildFootprintPublicLineExpression } from "./footprint-public-line.ts";
import { buildFootprintPublicGeometryExpression } from "./footprint-public-geometry.ts";
import { buildFootprintPadHistoryExpression } from "./footprint-pad-history.ts";
import { projectFootprintPadHistory } from "./footprint-pad-persistence.ts";
import { assertSymbolProfileSupported, buildSymbolNativeAdapter, inverseSymbolOperation, verifySymbolSourceEffect } from "./symbol-action.ts";
import type { SymbolScope } from "./symbol-action.ts";
import { MODEL_TRANSFORM_ACTION_PROFILE, buildModelTransformAdapter, compileModelTransformOperation, expectedModelTransformSource, inverseModelTransformOperation, modelTransformOperationSchema, verifyModelTransformSourceEffect } from "./model-transform-action.ts";
import type { CompiledModelTransformOperation } from "./model-transform-action.ts";
import { PCB_TEXT_ACTION_PROFILE, buildPcbTextAdapter, compilePcbTextOperation, expectedPcbTextSource, inversePcbTextOperation, pcbTextOperationSchema, verifyPcbTextSourceEffect } from "./pcb-text-action.ts";
import { PCB_TEXT_LIFECYCLE_PROFILE, assertPcbTextLifecycleSupported, buildPcbTextLifecycleAdapter, compilePcbTextLifecycleOperation, inversePcbTextLifecycleOperation, pcbTextLifecycleOperationSchema, verifyPcbTextLifecycleSourceEffect } from "./pcb-text-lifecycle.ts";
import { SCHEMATIC_LAYOUT_PROFILE, buildSchematicLayoutAdapter, buildSchematicLayoutAdapterCooperatively, compileSchematicLayoutBatch, expectedSchematicLayout, expectedSchematicLayoutCooperatively, inverseSchematicLayout, inverseSchematicLayoutCooperatively, schematicLayoutBatchSchema, verifySchematicLayoutEffect, verifySchematicLayoutEffectCooperatively } from "./schematic-layout-batch.ts";
import type { SchematicLayoutEvidence } from "./schematic-layout-batch.ts";
import type { SchematicLayoutConstructorWitness } from "./schematic-layout-constructor-witness.ts";
import type { SchematicWireGroupRepairDescriptor } from "./schematic-layout-wire-groups.ts";
import { yieldProofEventLoop } from "./cooperative-proof.ts";
import type { FlatDisplayRuntimeGuard } from "./flat-display-runtime.ts";

export const designActionSchema = z.union([designOperationSchema, schematicOperationSchema, designStackOperationSchema, designBatchOperationSchema, footprintOperationSchema, modelTransformOperationSchema, pcbTextOperationSchema, pcbTextLifecycleOperationSchema, schematicLayoutBatchSchema]);
export type DesignAction = z.infer<typeof designActionSchema>;
export type CompiledDesignAction = CompiledDesignOperation | CompiledSchematicOperation | ReturnType<typeof compileDesignStackOperation> | ReturnType<typeof compileDesignBatchOperation> | ReturnType<typeof compileFootprintOperation> | CompiledModelTransformOperation | ReturnType<typeof compilePcbTextOperation> | ReturnType<typeof compilePcbTextLifecycleOperation> | ReturnType<typeof compileSchematicLayoutBatch>;
export interface DesignActionState { readonly source: NativeSourceSnapshot; readonly schematic?: SchematicNativeSnapshot; readonly history?: NativeHistorySnapshot; readonly footprintScope?: FootprintScope; readonly symbolScope?: SymbolScope; readonly layoutTemplates?: Readonly<Record<string, SchematicNativeSnapshot>>; readonly layoutWireGroupRepair?: SchematicWireGroupRepairDescriptor; readonly layoutConstructorWitness?: SchematicLayoutConstructorWitness }
export interface ActionIds { readonly targetId?: string; readonly createdId?: string; readonly derivedResult?: unknown; readonly createdIds?: Readonly<Record<string, string>>; readonly componentCreate?: SchematicComponentCreateAdapter; readonly layoutCloneLifecycle?: true }
export interface PreparedDesignAction {
  readonly compiled: CompiledDesignAction;
  readonly code: string;
  readonly createdId?: string;
  readonly adapterProfile: string;
  readonly expectedSource?: NativeSourceSnapshot;
  readonly createdIds?: Readonly<Record<string, string>>;
  readonly componentCreate?: SchematicComponentCreateAdapter;
}

export function compileDesignAction(input: unknown): CompiledDesignAction {
  const action = designActionSchema.parse(input);
  if (action.action === "sch.layout.batch") { return compileSchematicLayoutBatch(action); }
  if (action.action === "pcb.text.modify") { return compilePcbTextOperation(action); }
  if (action.action === "pcb.text.create" || action.action === "pcb.text.delete") { return compilePcbTextLifecycleOperation(action); }
  if (action.action === "pcb.component.model-transform" || action.action === "footprint.model-transform") { return compileModelTransformOperation(action); }
  if (action.action === "pcb.batch") { return compileDesignBatchOperation(action); }
  if (action.action === "pcb.stack.replace") { return compileDesignStackOperation(action); }
  if (action.action.startsWith("footprint.")) { return compileFootprintOperation(action); }
  return action.action.startsWith("pcb.") ? compileDesignOperation(action) : compileSchematicOperation(action);
}
function layoutEvidence(before: DesignActionState): SchematicLayoutEvidence | undefined {
  return before.history === undefined ? undefined : { history: before.history, templates: before.layoutTemplates ?? {},
    ...(before.layoutConstructorWitness === undefined ? {} : { constructorWitness: before.layoutConstructorWitness }),
    ...(before.layoutWireGroupRepair === undefined ? {} : { wireGroupRepair: before.layoutWireGroupRepair }) };
}

export function assertDesignActionSupported(input: unknown, before: DesignActionState, ids: ActionIds = {}): void {
  const action = designActionSchema.parse(input);
  if (action.action === "sch.layout.batch") { expectedSchematicLayout(action, before.source, before.schematic, ids.createdIds, layoutEvidence(before)); return; }
  if (action.action === "pcb.text.create" || action.action === "pcb.text.delete") { assertPcbTextLifecycleSupported(action, before.source, ids); return; }
  if (action.action === "pcb.text.modify") {
    if (ids.targetId !== undefined && ids.targetId !== action.target.primitiveId) { throw new Error("Standalone PCB text target disagrees with its journal identity."); }
    expectedPcbTextSource(action, before.source);
  }
  else if (action.action === "pcb.component.model-transform" || action.action === "footprint.model-transform") {
    if (action.action === "footprint.model-transform" && before.footprintScope === undefined) { throw new Error("Footprint model editing requires checkpoint-bound library scope."); }
    if (action.action === "pcb.component.model-transform" && ids.targetId !== undefined && ids.targetId !== action.target.primitiveId) { throw new Error("Model-transform component target disagrees with its journal identity."); }
    expectedModelTransformSource(action, before.source);
  }
  else if (action.action === "pcb.batch") { compileDesignBatchOperation(action); }
  else if (action.action === "pcb.stack.replace") { expectedDesignStackSource(action, before.source); }
  else if (action.action.startsWith("footprint.")) {
    if (before.footprintScope === undefined) { throw new Error("Footprint editing requires checkpoint-bound library scope."); }
    assertFootprintProfileSupported(action, before.source, ids);
  }
  else if (action.action.startsWith("pcb.")) { assertDesignSourceProfileSupported(action, before.source, ids); }
  else if ("documentType" in action && action.documentType === 2) {
    if (before.symbolScope === undefined) { throw new Error("Symbol editing requires checkpoint-bound library scope."); }
    assertSymbolProfileSupported(action, before.source, ids);
  }
  else if (action.action === "sch.component.create") {
    if (before.history === undefined) { throw new Error("Component creation needs the complete hash-verified project checkpoint."); }
    assertSchematicComponentCreateSupported(action, before.source, before.schematic, before.history);
  }
  else if (isSchematicElectricalAction(action.action)) { assertSchematicElectricalSupported(action, before.source, before.schematic, ids); }
  else { assertSchematicSourceProfileSupported(action, before.source, ids, before.schematic); }
}

export async function assertDesignActionSupportedCooperatively(input: unknown, before: DesignActionState, ids: ActionIds = {}): Promise<void> {
  const captured = structuredClone({ action: designActionSchema.parse(input), before, ids });
  if (captured.action.action === "sch.layout.batch") {
    await expectedSchematicLayoutCooperatively(captured.action, captured.before.source, captured.before.schematic,
      captured.ids.createdIds, layoutEvidence(captured.before));
    return;
  }
  assertDesignActionSupported(captured.action, captured.before, captured.ids);
}

/** Only typed data and journal-owned state enter these maintained code builders. */
export function prepareDesignAction(input: unknown, before: DesignActionState, ids: ActionIds = {}): PreparedDesignAction {
  const action = designActionSchema.parse(input);
  assertDesignActionSupported(action, before, ids);
  return prepareSupportedDesignAction(action, before, ids);
}

/** The same two proofs as synchronous preparation, on private captured inputs.
 * Caller changes during a yielded turn cannot change the validated action,
 * source/native state, checkpoint/template evidence or creation identities.
 */
export async function prepareDesignActionCooperatively(input: unknown, before: DesignActionState, ids: ActionIds = {}, flatGuard?: FlatDisplayRuntimeGuard): Promise<PreparedDesignAction> {
  const captured = structuredClone({ action: designActionSchema.parse(input), before, ids, flatGuard });
  if (captured.flatGuard !== undefined && captured.action.action !== "sch.layout.batch" && captured.action.action !== "sch.wire.modify") { throw new Error("Flat guard requires its exact layout action or sealed wire reroute."); }
  if (captured.flatGuard !== undefined && captured.action.action === "sch.wire.modify") {
    assertDesignActionSupported(captured.action, captured.before, captured.ids);
    const adapter = buildSchematicNativeWireAdapter(captured.action, captured.before.source, captured.before.schematic, captured.flatGuard);
    return finishPreparedDesignAction(captured.action, captured.ids, { compiled: compileSchematicOperation(captured.action),
      expression: adapter.expression, adapterProfile: adapter.profile, expectedSource: adapter.expected, sourceAdapter: false });
  }
  if (captured.action.action === "sch.layout.batch") {
    await assertDesignActionSupportedCooperatively(captured.action, captured.before, captured.ids);
    const adapter = await buildSchematicLayoutAdapterCooperatively(captured.action, captured.before.source,
      captured.before.schematic, captured.ids.createdIds, layoutEvidence(captured.before), captured.flatGuard);
    const prepared = finishPreparedDesignAction(captured.action, captured.ids, {
      compiled: compileSchematicLayoutBatch(captured.action), expression: `(async () => {${adapter.code}\n})()`,
      adapterProfile: adapter.profile, expectedSource: adapter.expected, createdIds: adapter.createdIds, sourceAdapter: true,
    });
    await yieldProofEventLoop();
    return prepared;
  }
  assertDesignActionSupported(captured.action, captured.before, captured.ids);
  return prepareSupportedDesignAction(captured.action, captured.before, captured.ids);
}

function prepareSupportedDesignAction(action: DesignAction, before: DesignActionState, ids: ActionIds): PreparedDesignAction {
  let compiled: CompiledDesignAction;
  let expression: string;
  let adapterProfile = "public-positional-api";
  let createdId: string | undefined;
  let sourceAdapter = false;
  let expectedSource: NativeSourceSnapshot | undefined;
  let createdIds: Readonly<Record<string, string>> | undefined;
  let componentCreate: SchematicComponentCreateAdapter | undefined;
  if (action.action === "sch.layout.batch") {
    compiled = compileSchematicLayoutBatch(action);
    const adapter = buildSchematicLayoutAdapter(action, before.source, before.schematic, ids.createdIds, layoutEvidence(before));
    expression = `(async () => {${adapter.code}\n})()`;
    adapterProfile = adapter.profile; expectedSource = adapter.expected; createdIds = adapter.createdIds; sourceAdapter = true;
  } else if (action.action === "pcb.text.modify") {
    compiled = compilePcbTextOperation(action);
    const adapter = buildPcbTextAdapter(action, before.source, before.history);
    expression = `(async () => {${adapter.code}\n})()`;
    adapterProfile = PCB_TEXT_ACTION_PROFILE; expectedSource = adapter.expected; sourceAdapter = true;
  } else if (action.action === "pcb.text.create" || action.action === "pcb.text.delete") {
    compiled = compilePcbTextLifecycleOperation(action);
    const adapter = buildPcbTextLifecycleAdapter(action, before.source, before.history, ids);
    expression = `(async () => {${adapter.code}\n})()`;
    adapterProfile = PCB_TEXT_LIFECYCLE_PROFILE; createdId = adapter.createdId; expectedSource = adapter.expected; sourceAdapter = true;
  } else if (action.action === "pcb.component.model-transform" || action.action === "footprint.model-transform") {
    compiled = compileModelTransformOperation(action);
    const adapter = buildModelTransformAdapter(action, before.source, before.footprintScope);
    expression = `(async () => {${adapter.code}\n})()`;
    adapterProfile = MODEL_TRANSFORM_ACTION_PROFILE; expectedSource = adapter.expected; sourceAdapter = true;
  } else if (action.action.startsWith("footprint.")) {
    if (before.footprintScope === undefined) { throw new Error("Missing exact footprint library scope."); }
    compiled = compileFootprintOperation(action);
    if (!action.action.endsWith(".create")) { expectedSource = expectedFootprintSource(action, before.source, ids); }
    if (action.action.startsWith("footprint.line.")) {
      expression = buildFootprintPublicLineExpression(action, before.source, before.footprintScope, ids);
      adapterProfile = "easyeda-pro-control.footprint-public-line.v1";
    } else if (action.action.startsWith("footprint.pad.")) {
      expression = buildFootprintPadHistoryExpression(action, before.source, before.footprintScope, ids);
      adapterProfile = "easyeda-pro-control.footprint-pad-history.v1";
    } else {
      expression = buildFootprintPublicGeometryExpression(action, before.source, before.footprintScope, ids);
      adapterProfile = "easyeda-pro-control.footprint-public-geometry.v1";
    }
  } else if (action.action === "pcb.batch") {
    compiled = compileDesignBatchOperation(action);
    const adapter = buildDesignBatchAdapter(action, before.source, ids.createdIds);
    expression = `(async () => {${adapter.code}\n})()`;
    adapterProfile = "easyeda-pro-control.pcb-batch.v1";
    expectedSource = adapter.expected;
    createdIds = adapter.createdIds;
    sourceAdapter = true;
  } else if (action.action === "pcb.stack.replace") {
    compiled = compileDesignStackOperation(action);
    const adapter = buildDesignStackAdapter(action, before.source);
    expression = `(async () => {${adapter.code}\n})()`;
    adapterProfile = adapter.profile;
    expectedSource = adapter.expected;
    sourceAdapter = true;
  } else if (action.action === "pcb.pour.rebuild" || action.action === "pcb.pour.clear-derived") {
    compiled = compileDesignOperation(action);
    const adapter = action.action === "pcb.pour.rebuild" ? buildDesignCopperAdapter(action, before.source, ids) : buildDesignCopperClearAdapter(action, before.source, ids);
    expression = `(async () => {${adapter.code}\n})()`;
    adapterProfile = adapter.profile;
  } else if (action.action.startsWith("pcb.")) {
    compiled = compileDesignOperation(action);
    const adapter = buildDesignNativeAdapter(action, before.source, ids);
    if (adapter === undefined) { expression = buildDesignOperationCallExpression(action); }
    else {
      expression = `(async () => {${adapter.code}\n})()`;
      adapterProfile = adapter.profile;
      createdId = adapter.createdId;
      expectedSource = adapter.expected;
      sourceAdapter = true;
    }
  } else if ("documentType" in action && action.documentType === 2) {
    if (before.symbolScope === undefined) { throw new Error("Missing exact symbol library scope."); }
    compiled = compileSchematicOperation(action);
    const adapter = buildSymbolNativeAdapter(action, before.source, before.symbolScope, ids);
    expression = `(async () => {${adapter.code}\n})()`;
    adapterProfile = adapter.profile; createdId = adapter.createdId; expectedSource = adapter.expected; sourceAdapter = true;
  } else {
    if (action.action === "sch.component.create") {
      if (before.history === undefined) { throw new Error("Missing project library checkpoint."); }
      if (ids.createdId !== undefined || ids.componentCreate !== undefined) { throw new Error("Prepared component creation cannot be regenerated or redispatched during reconciliation."); }
      compiled = compileSchematicOperation(action);
      componentCreate = buildSchematicComponentCreate(action, before.source, before.schematic, before.history);
      expression = componentCreate.expression; createdId = componentCreate.createdId;
      expectedSource = componentCreate.expected; adapterProfile = componentCreate.profile;
    } else if (isSchematicElectricalAction(action.action)) {
      compiled = compileSchematicOperation(action);
      const adapter = buildSchematicElectricalAdapter(action, before.source, before.schematic, ids);
      expression = adapter.expression;
      adapterProfile = adapter.profile;
      createdId = adapter.createdId;
    } else {
      compiled = prepareSchematicSourceOperation(action, before.source, before.schematic, ids);
      if (action.action === "sch.component.modify") {
      if (before.schematic === undefined || ids.targetId === undefined) { throw new Error("Complete native component baseline is required."); }
      expression = buildSchematicNativeComponentWriteExpression(action, before.schematic, ids.targetId);
      adapterProfile = "schematic-native-component";
      } else if (action.action === "sch.wire.modify") {
        const adapter = buildSchematicNativeWireAdapter(action, before.source, before.schematic);
        expression = adapter.expression; adapterProfile = adapter.profile; expectedSource = adapter.expected;
      } else { expression = buildSchematicOperationCallExpression(action); }
    }
  }
  const prepared = finishPreparedDesignAction(action, ids, { compiled, expression, adapterProfile, sourceAdapter,
    ...(createdId === undefined ? {} : { createdId }), ...(createdIds === undefined ? {} : { createdIds }),
    ...(expectedSource === undefined ? {} : { expectedSource }), ...(componentCreate === undefined ? {} : { componentCreate }) });
  if (compiled.documentType !== 3 || !sourceAdapter) { return prepared; }
  const history = before.history;
  if (history !== undefined && (history.profile !== "easyeda.native-history.linear-gcm-gzip.v1" ||
      !/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u.test(history.projectUuid) || !/^[a-f0-9]{32}$/u.test(history.branchUuid) ||
      !/^[a-f0-9]{64}$/u.test(history.checkpointSha256) ||
      history.documents.filter((row) => row.uuid === before.source.document["uuid"] && row.docType === "PCB" && !isNativeDocumentDeleted(row)).length !== 1)) {
    throw new Error("PCB source-adapter scope requires the journal-owned complete checkpoint and exact native project branch.");
  }
  // Offline source preparation remains available without a database. Its null
  // Scope cannot pass the runtime receiver guard. Live execution always supplies
  // The immutable checkpoint; do not infer a branch from current mutable UI.
  return { ...prepared, code: `const EXPECTED_PCB_PROJECT_UUID=${JSON.stringify(history?.projectUuid ?? null)};\nconst EXPECTED_PCB_BRANCH_UUID=${JSON.stringify(history?.branchUuid ?? null)};\n${prepared.code}` };
}

function finishPreparedDesignAction(action: DesignAction, ids: ActionIds,
  prepared: Omit<PreparedDesignAction, "code"> & { readonly expression: string; readonly sourceAdapter: boolean }): PreparedDesignAction {
  const { compiled, expression, adapterProfile, sourceAdapter, createdId, createdIds, expectedSource, componentCreate } = prepared;
  const code = `const rawResult = await ${expression};
const resultKind = ${JSON.stringify(compiled.resultKind)};
const sourceAdapter = ${sourceAdapter};
let result = rawResult, nativeSourceMerge;
if (sourceAdapter && rawResult?.nativeSourceMerge !== undefined) {
  const receipt = rawResult.nativeSourceMerge;
  if (receipt?.profile !== 'footprint-exact-frame.v1' || typeof receipt.acknowledgment !== 'boolean' || receipt.liveSourceVerified !== true || Object.keys(receipt).length !== 3) throw new Error('Invalid native source merge receipt');
  nativeSourceMerge = receipt; result = rawResult.value;
}
if (resultKind === "derived-copper") {
  const payload = {ok:true,kind:"typed-design-result",id:${JSON.stringify(action.id)},derivedResult:result};
  const json = JSON.stringify(payload), utf8Bytes = new TextEncoder().encode(json).byteLength;
  if (utf8Bytes > 3 * 1024 * 1024) throw new Error("Derived copper result exceeds transport bound");
  return {schema:"easyeda-pro-control.exact-json.v1",utf8Bytes,json};
}
if (resultKind === "boolean") {
  if (result !== true) throw new Error("Typed native operation did not return true");
  return {ok:true,kind:"typed-design-result",id:${JSON.stringify(action.id)},createdId:null,createdIds:${JSON.stringify(createdIds ?? null)},...(nativeSourceMerge === undefined ? {} : {nativeSourceMerge})};
}
const primitiveId = typeof result?.getState_PrimitiveId === "function" ? result.getState_PrimitiveId() :
  typeof result?.primitiveId === "string" ? result.primitiveId : sourceAdapter && result === true ? ${JSON.stringify(ids.targetId ?? null)} : null;
if (typeof primitiveId !== "string" || primitiveId.length === 0) throw new Error("Missing returned primitive identity");
return {ok:true,kind:"typed-design-result",id:${JSON.stringify(action.id)},primitiveId,createdId:resultKind === "created-primitive" ? primitiveId : null,...(nativeSourceMerge === undefined ? {} : {nativeSourceMerge})};`;
  return { compiled, code, adapterProfile, ...(createdId === undefined ? {} : { createdId }), ...(createdIds === undefined ? {} : { createdIds }), ...(expectedSource === undefined ? {} : { expectedSource }), ...(componentCreate === undefined ? {} : { componentCreate }) };
}

export function verifyDesignAction(compiled: CompiledDesignAction, before: DesignActionState, after: DesignActionState, ids: ActionIds = {}): NativeSourceDelta {
  if (compiled.profile === SCHEMATIC_LAYOUT_PROFILE) { return verifySchematicLayoutEffect(compiled.operation, before.source, after.source, before.schematic, after.schematic, ids.createdIds, layoutEvidence(before), ids.layoutCloneLifecycle === true); }
  if (compiled.profile === PCB_TEXT_ACTION_PROFILE) { return verifyPcbTextSourceEffect(compiled.operation, before.source, after.source); }
  if (compiled.profile === PCB_TEXT_LIFECYCLE_PROFILE) { return verifyPcbTextLifecycleSourceEffect(compiled.operation, before.source, after.source, ids); }
  if (compiled.profile === MODEL_TRANSFORM_ACTION_PROFILE) { return verifyModelTransformSourceEffect(compiled.operation, before.source, after.source); }
  if (compiled.profile === "easyeda-pro-control.footprint-geometry.v1") { return verifyFootprintSourceEffect(compiled.operation, before.source, after.source, ids); }
  if (compiled.profile === "easyeda-pro-control.pcb-batch.v1") { return verifyDesignBatchSourceEffect(compiled.operation, before.source, after.source, ids.createdIds); }
  if (compiled.profile === "easyeda-pro-control.pcb-stack.v1") { return verifyDesignStackSourceEffect(compiled.operation, before.source, after.source); }
  if (compiled.profile === "easyeda-pro-control.pcb-operations.v1") { return verifyDesignSourceEffect(compiled, before.source, after.source, ids); }
  if (compiled.documentType === 2) { return verifySymbolSourceEffect(compiled.operation, before.source, after.source, ids); }
  if (compiled.action === "sch.component.create") {
    if (before.history === undefined || ids.componentCreate === undefined || ids.createdId !== ids.componentCreate.createdId) { throw new Error("Missing journaled component creation expectation or project assets."); }
    verifySchematicComponentCreate(compiled.operation, ids.componentCreate, before.source, after.source, before.schematic, after.schematic, before.history);
    return compareDocumentSources(before.source, after.source);
  }
  if (isSchematicElectricalAction(compiled.action)) { return verifySchematicElectricalEffect(compiled.operation, before.source, after.source, before.schematic, after.schematic, ids); }
  if (compiled.action === "sch.wire.modify") {
    const target = compiled.effect.target;
    if (ids.targetId !== undefined && (target === null || !("primitiveId" in target) || ids.targetId !== target.primitiveId)) { throw new Error("Native wire resolved target contradicts operation."); }
    return verifySchematicNativeWireEffect(compiled.operation, before.source, after.source, before.schematic, after.schematic);
  }
  const native = before.schematic !== undefined && after.schematic !== undefined ? { before: before.schematic, after: after.schematic } : undefined;
  return verifySchematicSourceEffect(compiled, before.source, after.source, ids, native);
}

export async function verifyDesignActionCooperatively(compiled: CompiledDesignAction, before: DesignActionState, after: DesignActionState, ids: ActionIds = {}): Promise<NativeSourceDelta> {
  const captured = structuredClone({ compiled, before, after, ids });
  if (captured.compiled.profile === SCHEMATIC_LAYOUT_PROFILE) {
    const proof = await verifySchematicLayoutEffectCooperatively(captured.compiled.operation, captured.before.source, captured.after.source,
      captured.before.schematic, captured.after.schematic, captured.ids.createdIds, layoutEvidence(captured.before), captured.ids.layoutCloneLifecycle === true);
    return proof;
  }
  return verifyDesignAction(captured.compiled, captured.before, captured.after, captured.ids);
}

export async function inverseDesignActionCooperatively(action: unknown, before: DesignActionState, ids: ActionIds = {}): Promise<DesignAction | undefined> {
  const captured = structuredClone({ action: designActionSchema.parse(action), before, ids });
  if (captured.action.action === "sch.layout.batch") {
    const inverse = await inverseSchematicLayoutCooperatively(captured.action, captured.before.source, captured.before.schematic,
      captured.ids.createdIds, layoutEvidence(captured.before));
    return inverse;
  }
  return inverseDesignAction(captured.action, captured.before, captured.ids);
}

export function inverseDesignAction(action: unknown, before: DesignActionState, ids: ActionIds = {}): DesignAction | undefined {
  const input = designActionSchema.parse(action);
  if (input.action === "sch.layout.batch") { return inverseSchematicLayout(input, before.source, before.schematic, ids.createdIds, layoutEvidence(before)); }
  if (input.action === "pcb.text.modify") { return inversePcbTextOperation(input, before.source); }
  if (input.action === "pcb.text.create" || input.action === "pcb.text.delete") { return inversePcbTextLifecycleOperation(input, before.source, ids); }
  if (input.action === "pcb.component.model-transform" || input.action === "footprint.model-transform") { return inverseModelTransformOperation(input, before.source); }
  if (input.action.startsWith("footprint.")) {
    if (input.action === "footprint.pad.modify" || input.action === "footprint.pad.delete") {
      if (before.history === undefined) { return undefined; }
      const targetId = "primitiveId" in input.target ? input.target.primitiveId : ids.targetId;
      if (targetId === undefined) { return undefined; }
      const projection = projectFootprintPadHistory({ checkpoint: before.history, source: before.source, targets: [{ id: targetId, fields: [] }] });
      // The native history cannot restore discarded inactive legacy drill
      // Values or absent defaults through a live PAD model.
      if (projection.differences.length > 0) { return undefined; }
    }
    return inverseFootprintOperation(input, before.source, ids);
  }
  if (input.action === "pcb.batch") { return inverseDesignBatchOperation(input, before.source, ids.createdIds); }
  if (input.action === "pcb.stack.replace") { return inverseDesignStackOperation(input, before.source); }
  if ("documentType" in input && input.documentType === 2) { return inverseSymbolOperation(input, before.source, ids); }
  if (input.action === "sch.component.create" && ids.createdId !== undefined) { return designActionSchema.parse({ id: `inverse:${input.id}`, action: "sch.component.delete", target: { primitiveId: ids.createdId } }); }
  if (isSchematicElectricalAction(input.action)) { return inverseSchematicElectricalOperation(input, ids); }
  return input.action.startsWith("pcb.") ? buildInverseDesignOperation(input, before.source, ids) : buildInverseSchematicOperation(input, before.source, ids, before.schematic);
}
