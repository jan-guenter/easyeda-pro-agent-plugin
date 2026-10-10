import { z } from "zod";
import { assertExpectedFingerprint, canonicalJson, normalizeEasyedaProjectPath, sha256Json } from "./core.ts";
import { parseDocumentSource } from "./document-source.ts";
import { assertExactTransportValue, validateExactReadPayload } from "./exact-readers.ts";
import { validatePublicSdkReadPayload, validatePublicSdkReadRequest } from "./public-sdk-read.ts";
import type { PublicSdkReadRequest } from "./public-sdk-read.ts";

const text = z.string().min(1).max(4096);
const hash = z.string().regex(/^[a-f0-9]{64}$/u);
const documentType = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);
const stepSchema = z.object({ id: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.-]{0,127}$/u), request: z.unknown() }).strict();
const contextSchema = z.object({
  project: z.object({ uuid: text, path: text }).strict(),
  document: z.object({ uuid: text, documentType, tabId: text, parentProjectUuid: text.optional(), parentLibraryUuid: text.optional() }).strict(),
}).strict();
const planSchema = z.object({
  schema: z.literal("easyeda-pro-control.disposable-sdk-validation-plan.v1"),
  fixture: z.object({ category: z.literal("disposable"), projectUuid: text, projectPath: text,
    attestation: z.literal("This project is disposable and is authorized for SDK read validation.") }).strict(),
  expectedContext: contextSchema,
  expectedFingerprint: z.record(z.string(), z.unknown()),
  checkpoint: z.object({ receiptPath: text, sourceSha256: hash, sourceDumpSha256: hash }).strict(),
  baselineSourceSha256: hash,
  steps: z.array(stepSchema).min(1).max(256),
}).strict();
type PlanData = z.infer<typeof planSchema>;
export interface DisposableSdkValidationPlan extends Omit<PlanData, "steps"> {
  readonly steps: readonly { readonly id: string; readonly request: PublicSdkReadRequest }[];
}
export interface DisposableSdkFacade {
  /** These adapters must call the already owned facade, not an upstream tool or
   * a second launcher. Return the facade's complete structured payload: the
   * outer evidence wrapper's result for reads, and checkpoint verification for
   * verifyCheckpoint. Missing/truncated results are rejected here.
   */
  readonly verifyCheckpoint: (receiptPath: string) => Promise<unknown>;
  readonly exactSource: (request: { kind: "schematic-source" | "symbol-source" | "pcb-source" | "footprint-source" },
    expectedContext: PlanData["expectedContext"], expectedFingerprint: Record<string, unknown>) => Promise<unknown>;
  readonly sdkRead: (request: PublicSdkReadRequest, expectedContext: PlanData["expectedContext"], expectedFingerprint: Record<string, unknown>) => Promise<unknown>;
}
export interface DisposableSdkValidationOptions {
  readonly mode?: "dry-run" | "execute";
  readonly facade?: DisposableSdkFacade;
  /** Persist through the caller's maintained exclusive evidence mechanism.
   * A failed observer stops the run; it never permits a replay.
   */
  readonly record?: (event: Readonly<Record<string, unknown>>) => Promise<void>;
}

function plainJson(value: unknown): void {
  assertExactTransportValue(value);
  if (value !== null && typeof value === "object") {
    if (!Array.isArray(value)) {
      const prototype: unknown = Object.getPrototypeOf(value);
      if (prototype !== Object.prototype && prototype !== null) { throw new Error("Validation accepts plain JSON only."); }
      if (["__proto__", "prototype", "constructor"].some((key) => Object.hasOwn(value, key))) { throw new Error("Validation JSON contains a reserved key."); }
    }
    for (const child of Object.values(value)) { plainJson(child); }
  }
}

export function parseDisposableSdkValidationPlan(input: unknown): DisposableSdkValidationPlan {
  plainJson(input);
  if (Buffer.byteLength(JSON.stringify(input), "utf8") > 1_048_576) { throw new Error("Validation plan exceeds its byte bound."); }
  const plan = planSchema.parse(input);
  assertExpectedFingerprint(plan.expectedFingerprint);
  const path = normalizeEasyedaProjectPath(plan.expectedContext.project.path);
  if (normalizeEasyedaProjectPath(plan.fixture.projectPath) !== path || plan.fixture.projectUuid !== plan.expectedContext.project.uuid) { throw new Error("Disposable fixture and expected project identity differ."); }
  const document = plan.expectedContext.document;
  if (document.parentProjectUuid !== undefined && document.parentProjectUuid !== plan.fixture.projectUuid) { throw new Error("Document parent and disposable project identity differ."); }
  if ([2, 4].includes(document.documentType) && (document.parentLibraryUuid === undefined || document.tabId !== `${document.uuid}@${plan.fixture.projectUuid}`)) {
    throw new Error("Library validation requires the observed library owner and exact project-library tab.");
  }
  if (new Set(plan.steps.map((step) => step.id)).size !== plan.steps.length) { throw new Error("Validation step IDs must be unique."); }
  const steps = plan.steps.map((step) => ({ id: step.id, request: validatePublicSdkReadRequest(step.request, plan.expectedContext.document.documentType) }));
  return structuredClone({ ...plan, steps });
}

const consistencySchema = z.object({ stable: z.literal(true), attempts: z.literal(2), snapshotSha256: hash,
  contextBinding: z.object({ level: z.literal("active-context-stability-required"), preAndPostChecked: z.literal(true), switchAwayAndBackDetectable: z.literal(false) }).strict(),
}).strict();
const verifiedCheckpointSchema = z.object({ ok: z.literal(true), source: text, receiptPath: text, checkpoint: text,
  checkpointMatchesReceipt: z.literal(true), sourceEqualsCheckpoint: z.literal(true), sourceMatchesReceipt: z.literal(true), sourceChanged: z.literal(false),
  sourceSha256: hash, sourceDumpSha256: hash, checkpointSha256: hash, checkpointDumpSha256: hash,
}).catchall(z.unknown());

function checkpointProof(value: unknown, plan: DisposableSdkValidationPlan): void {
  plainJson(value);
  const proof = verifiedCheckpointSchema.parse(value);
  if (normalizeEasyedaProjectPath(proof.source) !== normalizeEasyedaProjectPath(plan.fixture.projectPath) ||
      proof.receiptPath !== plan.checkpoint.receiptPath || proof.sourceSha256 !== plan.checkpoint.sourceSha256 ||
      proof.sourceDumpSha256 !== plan.checkpoint.sourceDumpSha256 || proof.checkpointDumpSha256 !== proof.sourceDumpSha256) { throw new Error("Checkpoint is not the unchanged exact disposable-project baseline."); }
}
function sourceKind(type: 1 | 2 | 3 | 4): "schematic-source" | "symbol-source" | "pcb-source" | "footprint-source" {
  switch (type) {
    case 1: { return "schematic-source"; }
    case 2: { return "symbol-source"; }
    case 3: { return "pcb-source"; }
    case 4: { return "footprint-source"; }
    default: { throw new Error("Unsupported validation document type."); }
  }
}
function stablePayload(value: unknown, sdk = false): Record<string, unknown> {
  plainJson(value);
  const parsed = z.object({ read_consistency: consistencySchema }).catchall(z.unknown()).parse(value);
  const { read_consistency: consistency, ...rest } = parsed;
  const { authority: _authority, ...withoutAuthority } = rest;
  const observed = sdk ? withoutAuthority : rest;
  if (sha256Json(observed) !== consistency.snapshotSha256) { throw new Error("Read consistency hash does not match the complete response."); }
  return observed;
}
function sourceProof(value: unknown, plan: DisposableSdkValidationPlan): string {
  const payload = stablePayload(value);
  const type = plan.expectedContext.document.documentType;
  validateExactReadPayload(payload, { kind: sourceKind(type) });
  const parsed = z.object({ source: z.string() }).catchall(z.unknown()).parse(payload);
  const snapshot = parseDocumentSource(parsed.source);
  // The pinned footprint editor exports PCB, not its durable FOOTPRINT type.
  // Facade context checks bind editor type, UUID, project-library tab and owner.
  // Never rewrite this header or its source hash.
  const expectedDocType = new Map([[1, "SCH_PAGE"], [2, "SYMBOL"], [3, "PCB"], [4, "PCB"]]).get(type);
  if (snapshot.document["uuid"] !== plan.expectedContext.document.uuid || snapshot.document["docType"] !== expectedDocType || snapshot.sha256 !== plan.baselineSourceSha256) {
    throw new Error("Source read is not the exact unchanged disposable document.");
  }
  return snapshot.sha256;
}
function readProof(value: unknown, request: PublicSdkReadRequest): string {
  const wrapper = z.object({ authority: z.literal("public-sdk-observation-not-complete-design-proof") }).catchall(z.unknown()).parse(value);
  const payload = stablePayload(wrapper, true);
  const { assurance: _assurance, publicApiSha256: _publicApiSha256, liveValidation: _liveValidation, limitations: _limitations, ...raw } = payload;
  const expected = validatePublicSdkReadPayload(raw, request);
  if (canonicalJson(payload) !== canonicalJson(expected)) { throw new Error("SDK observation metadata differs from the exact maintained validator output."); }
  return sha256Json(payload);
}

/** Default is a zero-call plan. Execute uses only the supplied already-owned
 * facade and stops on the first failure. No Save, open, close, write, generic
 * method path, raw code or retry capability exists in this interface.
 */
export async function runDisposableSdkValidation(input: unknown, options: DisposableSdkValidationOptions = {}): Promise<Record<string, unknown>> {
  const plan = parseDisposableSdkValidationPlan(input), planSha256 = sha256Json(plan);
  if (options.mode === undefined || options.mode === "dry-run") {
    return { schema: "easyeda-pro-control.disposable-sdk-validation.v1", mode: "dry-run", planSha256, liveDispatched: false, connectedValidation: false,
      fixture: plan.fixture, steps: plan.steps.map((step) => ({ id: step.id, method: step.request.method, requestSha256: sha256Json(step.request) })),
      sequence: "checkpoint + exact-source before and after each one-shot SDK read", noSaveNavigationWritesOrRetries: true };
  }
  if (options.mode !== "execute" || options.facade === undefined) { throw new Error("Execution needs an explicit mode and the already-owned facade adapter."); }
  const completed: Record<string, unknown>[] = [], facade = options.facade;
  let currentStep: string | null = null, phase = "not-started", sdkDispatches = 0;
  const record = async (event: Record<string, unknown>): Promise<void> => { await options.record?.(structuredClone({ planSha256, ...event })); };
  const sourceRequest = { kind: sourceKind(plan.expectedContext.document.documentType) };
  try {
    await record({ phase: "intent", fixture: plan.fixture, stepCount: plan.steps.length });
    for (const step of plan.steps) {
      currentStep = step.id;
      phase = "checkpoint-before";
      checkpointProof(await facade.verifyCheckpoint(plan.checkpoint.receiptPath), plan);
      phase = "source-before";
      sourceProof(await facade.exactSource(structuredClone(sourceRequest), structuredClone(plan.expectedContext), structuredClone(plan.expectedFingerprint)), plan);
      phase = "sdk-read-intent";
      await record({ phase, stepId: step.id, method: step.request.method, requestSha256: sha256Json(step.request) });
      phase = "sdk-read";
      sdkDispatches += 1;
      const payloadSha256 = readProof(await facade.sdkRead(structuredClone(step.request), structuredClone(plan.expectedContext), structuredClone(plan.expectedFingerprint)), step.request);
      phase = "source-after";
      sourceProof(await facade.exactSource(structuredClone(sourceRequest), structuredClone(plan.expectedContext), structuredClone(plan.expectedFingerprint)), plan);
      phase = "checkpoint-after";
      checkpointProof(await facade.verifyCheckpoint(plan.checkpoint.receiptPath), plan);
      const evidence = { id: step.id, method: step.request.method, requestSha256: sha256Json(step.request), payloadSha256,
        sourceSha256: plan.baselineSourceSha256, projectFileSha256: plan.checkpoint.sourceSha256, projectDumpSha256: plan.checkpoint.sourceDumpSha256 };
      await record({ phase: "step-completed", ...evidence });
      completed.push(evidence);
    }
    phase = "completed";
    await record({ phase, completed: completed.length });
    return { schema: "easyeda-pro-control.disposable-sdk-validation.v1", mode: "execute", outcome: "completed", planSha256, fixture: plan.fixture, sdkDispatches, completed,
      validation: "exact-requests-public-observation-and-source/checkpoint-invariance", writerValidation: false, noSaveNavigationWritesOrRetries: true };
  } catch {
    // Native/private error text is not suitable for an exported validation report.
    // The original facade retains its own failure/quarantine evidence.
    return { schema: "easyeda-pro-control.disposable-sdk-validation.v1", mode: "execute", outcome: "stopped", planSha256, fixture: plan.fixture,
      phase, currentStep, sdkDispatches, completed, connectedValidation: false, error: "Validation failed or produced incomplete evidence; inspect the original facade result. Do not replay an ambiguous call.",
      noSaveNavigationWritesOrRetries: true };
  }
}

export function disposableSdkPlanCommitment(input: unknown): string { return canonicalJson(parseDisposableSdkValidationPlan(input)); }
