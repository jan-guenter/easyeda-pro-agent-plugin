import { randomBytes } from "node:crypto";
import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { compileDesignOperation, designOperationBatchSchema, designOperationSchema } from "./design-operations.ts";
import type { DesignOperation } from "./design-operations.ts";
import { buildExpectedDesignSource, buildInverseDesignOperation, verifyDesignSourceEffect } from "./design-source-proof.ts";
import type { DesignSourceIds } from "./design-source-proof.ts";
import { buildReviewedNativeSourceMerge } from "./design-native-adapter.ts";
import type { DesignNativeAdapter } from "./design-native-adapter.ts";
import { compareDocumentSources } from "./document-source.ts";
import type { NativeSourceDelta, NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";
import { buildDesignRulePublicAdapter, isDesignRuleAction } from "./design-rule-public-adapter.ts";

export const DESIGN_BATCH_OPERATION_PROFILE = "easyeda-pro-control.pcb-batch.v1";
export const designBatchOperationSchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/u), action: z.literal("pcb.batch"),
  operations: z.array(designOperationSchema).min(1).max(256),
}).strict().superRefine((batch, context) => {
  const checked = designOperationBatchSchema.safeParse({ operations: batch.operations });
  if (!checked.success) {
    for (const issue of checked.error.issues) { context.addIssue({ code: "custom", path: issue.path, message: issue.message }); }
  }
  for (const [index, operation] of batch.operations.entries()) {
    if (operation.action === "pcb.pour.rebuild") { context.addIssue({ code: "custom", path: ["operations", index, "action"], message: "Derived copper rebuild is a separate transaction, not a source-merge batch step." }); }
  }
});
export type DesignBatchOperation = z.infer<typeof designBatchOperationSchema>;
export type DesignBatchCreatedIds = Readonly<Record<string, string>>;
export interface CompiledDesignBatchOperation {
  readonly profile: typeof DESIGN_BATCH_OPERATION_PROFILE;
  readonly id: string;
  readonly action: "pcb.batch";
  readonly documentType: 3;
  readonly resultKind: "boolean";
  readonly operation: DesignBatchOperation;
}
export interface DesignBatchStepProof {
  readonly id: string;
  readonly action: string;
  readonly targetId: string | null;
  readonly createdId: string | null;
  readonly beforeSha256: string;
  readonly afterSha256: string;
  readonly delta: NativeSourceDelta;
}
export interface DesignBatchAdapter extends DesignNativeAdapter {
  /** Retain this map in the journal before dispatch; never regenerate at readback. */
  readonly createdIds: DesignBatchCreatedIds;
  readonly stepProofs: readonly DesignBatchStepProof[];
  readonly batchOperation: DesignBatchOperation;
}

export function compileDesignBatchOperation(input: unknown): CompiledDesignBatchOperation {
  const operation = designBatchOperationSchema.parse(input);
  return { profile: DESIGN_BATCH_OPERATION_PROFILE, id: operation.id, action: operation.action, documentType: 3, resultKind: "boolean", operation };
}

function createSteps(operation: DesignBatchOperation): readonly DesignOperation[] {
  return operation.operations.filter((entry) => compileDesignOperation(entry).effect.identity === "create");
}

function validateCreatedIds(operation: DesignBatchOperation, before: NativeSourceSnapshot, createdIds: DesignBatchCreatedIds): void {
  const wanted = createSteps(operation).map((entry) => entry.id).toSorted();
  if ((Object.getPrototypeOf(createdIds) !== Object.prototype && Object.getPrototypeOf(createdIds) !== null) ||
      Object.getOwnPropertySymbols(createdIds).length > 0 || canonicalJson(Object.keys(createdIds).toSorted()) !== canonicalJson(wanted)) {
    throw new Error("Batch creation identities must be the exact journal-owned mapping.");
  }
  const used = new Set(before.objects.map((object) => object.id));
  for (const descriptor of Object.values(Object.getOwnPropertyDescriptors(createdIds))) {
    const value: unknown = descriptor.value;
    if (!Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true || typeof value !== "string" || !/^[a-f0-9]{16}$/u.test(value) || used.has(value)) {
      throw new Error("Batch creation identity is malformed, duplicated or already present.");
    }
    used.add(value);
  }
}

function allocateCreatedIds(operation: DesignBatchOperation, before: NativeSourceSnapshot): DesignBatchCreatedIds {
  const used = new Set(before.objects.map((object) => object.id));
  const entries: [string, string][] = [];
  for (const step of createSteps(operation)) {
    const id = randomBytes(8).toString("hex");
    if (used.has(id)) { throw new Error("Fresh batch identity collided; no native operation was dispatched."); }
    used.add(id);
    entries.push([step.id, id]);
  }
  return Object.freeze(Object.fromEntries(entries));
}

function lockedBaseline(before: NativeSourceSnapshot): readonly NativeSourceObject[] {
  const ids = new Set(before.objects.filter((object) => object.body["locked"] === true).map((object) => object.id));
  // Preserve descendants of a locked component, even when the child itself is
  // Unlocked. Closure also covers any future nested parent records.
  const children = new Map<string, string[]>();
  for (const object of before.objects) {
    const parentId = object.body["parentId"];
    if (typeof parentId === "string") {
      const siblings = children.get(parentId) ?? [];
      siblings.push(object.id);
      children.set(parentId, siblings);
    }
  }
  for (const id of ids) {
    for (const child of children.get(id) ?? []) { ids.add(child); }
  }
  return before.objects.filter((object) => ids.has(object.id));
}

function resolveStep(operation: DesignOperation, created: ReadonlyMap<string, string>): DesignOperation {
  if (!("target" in operation) || !("resultOf" in operation.target)) { return operation; }
  const primitiveId = created.get(operation.target.resultOf);
  if (primitiveId === undefined) { throw new Error("Batch result reference has no prior journal-owned creation."); }
  return designOperationSchema.parse({ ...operation, target: { primitiveId } });
}

interface Simulation {
  readonly expected: NativeSourceSnapshot;
  readonly stepProofs: readonly DesignBatchStepProof[];
  readonly inverseSteps: readonly DesignOperation[] | undefined;
}

function simulate(operation: DesignBatchOperation, before: NativeSourceSnapshot, createdIds: DesignBatchCreatedIds, collectInverse: boolean): Simulation {
  validateCreatedIds(operation, before, createdIds);
  const locked = lockedBaseline(before);
  const created = new Map<string, string>();
  const stepProofs: DesignBatchStepProof[] = [];
  let inverseSteps: DesignOperation[] | undefined = collectInverse ? [] : undefined;
  let current = before;
  for (const step of operation.operations) {
    const resolved = resolveStep(step, created);
    const compiled = compileDesignOperation(resolved);
    const targetId = "target" in resolved && "primitiveId" in resolved.target ? resolved.target.primitiveId : undefined;
    const createdId = compiled.effect.identity === "create" ? createdIds[step.id] : undefined;
    const ids: DesignSourceIds = { ...(targetId === undefined ? {} : { targetId }), ...(createdId === undefined ? {} : { createdId }) };
    const next = buildExpectedDesignSource(resolved, current, ids);
    const delta = verifyDesignSourceEffect(compiled, current, next, ids);
    const nextObjects = new Map(next.objects.map((object) => [object.id, object]));
    if (locked.some((object) => canonicalJson({ object: nextObjects.get(object.id) }) !== canonicalJson({ object }))) {
      throw new Error("PCB batch cannot modify an initially locked record or its descendants; explicit unlock is a separate operation.");
    }
    if (inverseSteps !== undefined) {
      try {
        const inverse = buildInverseDesignOperation(resolved, current, ids);
        if (inverse === undefined) { inverseSteps = undefined; }
        else { inverseSteps.push(inverse); }
      } catch { inverseSteps = undefined; }
    }
    stepProofs.push({ id: step.id, action: step.action, targetId: targetId ?? null, createdId: createdId ?? null,
      beforeSha256: current.sha256, afterSha256: next.sha256, delta });
    if (createdId !== undefined) { created.set(step.id, createdId); }
    current = next;
  }
  return { expected: current, stepProofs, inverseSteps };
}

/** Pure deterministic replay; creates require the already journaled exact map. */
export function expectedDesignBatchSource(input: unknown, before: NativeSourceSnapshot, createdIds: DesignBatchCreatedIds = {}): NativeSourceSnapshot {
  return simulate(designBatchOperationSchema.parse(input), before, createdIds, false).expected;
}

export function verifyDesignBatchSourceEffect(input: unknown, before: NativeSourceSnapshot, after: NativeSourceSnapshot, createdIds: DesignBatchCreatedIds = {}): NativeSourceDelta {
  const expected = expectedDesignBatchSource(input, before, createdIds);
  if (canonicalJson(expected) !== canonicalJson(after)) { throw new Error("PCB batch source differs from its sequential typed effects or changed unrelated records."); }
  return compareDocumentSources(before, after);
}

/** Allocate all identities and validate every intermediate effect before one
 * guarded native source merge. No individual step is sent to EasyEDA.
 */
export function buildDesignBatchAdapter(input: unknown, before: NativeSourceSnapshot, journalCreatedIds?: DesignBatchCreatedIds): DesignBatchAdapter {
  const operation = designBatchOperationSchema.parse(input);
  const createdIds = journalCreatedIds ?? allocateCreatedIds(operation, before);
  const simulated = simulate(operation, before, createdIds, false);
  if (operation.operations.some((entry) => isDesignRuleAction(entry.action))) {
    const programs: string[] = [];
    const created = new Map<string, string>();
    let current = before;
    for (const step of operation.operations) {
      const resolved = resolveStep(step, created);
      const compiled = compileDesignOperation(resolved);
      const createdId = compiled.effect.identity === "create" ? createdIds[step.id] : undefined;
      const targetId = "target" in resolved && "primitiveId" in resolved.target ? resolved.target.primitiveId : undefined;
      const next = buildExpectedDesignSource(resolved, current, { ...(createdId === undefined ? {} : { createdId }), ...(targetId === undefined ? {} : { targetId }) });
      const adapter = isDesignRuleAction(resolved.action) ? buildDesignRulePublicAdapter(resolved, current) : buildReviewedNativeSourceMerge(current, next);
      programs.push(`if (await (async () => {${adapter.code}\n})() !== true) throw new Error("Typed mixed batch step failed");`);
      if (createdId !== undefined) { created.set(step.id, createdId); }
      current = next;
    }
    const admission = buildReviewedNativeSourceMerge(before, before), code = `${programs.join("\n")}\nreturn true;`;
    if (Buffer.byteLength(code, "utf8") > 8 * 1024 * 1024) { throw new Error("Mixed rule/geometry batch exceeds the reviewed request bound; split the batch."); }
    return { ...admission, expected: simulated.expected, code, batchOperation: operation,
      createdIds: Object.freeze({ ...createdIds }), stepProofs: simulated.stepProofs };
  }
  return { ...buildReviewedNativeSourceMerge(before, simulated.expected), batchOperation: operation,
    createdIds: Object.freeze({ ...createdIds }), stepProofs: simulated.stepProofs };
}

/** Undefined means no verified batch inverse; it does not authorize or promise
 * automatic checkpoint restoration. Deletes and unsupported inverses retain
 * their ordinary explicit recovery requirement.
 */
export function inverseDesignBatchOperation(input: unknown, before: NativeSourceSnapshot, createdIds: DesignBatchCreatedIds = {}): DesignBatchOperation | undefined {
  const operation = designBatchOperationSchema.parse(input);
  const simulated = simulate(operation, before, createdIds, true);
  if (simulated.inverseSteps === undefined) { return undefined; }
  const candidate = designBatchOperationSchema.parse({ id: `inverse-${sha256Json(operation).slice(0, 32)}`, action: "pcb.batch",
    operations: simulated.inverseSteps.toReversed() });
  try {
    const restored = expectedDesignBatchSource(candidate, simulated.expected);
    return canonicalJson(restored) === canonicalJson(before) ? candidate : undefined;
  } catch { return undefined; }
}
