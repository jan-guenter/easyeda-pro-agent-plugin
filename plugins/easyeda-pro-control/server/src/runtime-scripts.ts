import { buildExactReadExpression } from "./exact-readers.ts";

export interface ExpectedContext {
  project?:
    | {
        uuid?: string | undefined;
        projectUuid?: string | undefined;
      }
    | undefined;
  document?:
    | {
        uuid?: string | undefined;
        documentUuid?: string | undefined;
        documentType?: number | undefined;
        tabId?: string | undefined;
      }
    | undefined;
}

export interface ExactSaveGuard {
  readonly expectedSnapshotSha256: string;
  readonly request: unknown;
}

type MutationState = "before" | "after";
type WritableField = "layer" | "x" | "y" | "rotation" | "primitiveLock";
type ComponentPatch = Partial<Record<WritableField, unknown>>;

function isWritableField(value: string | undefined): value is WritableField {
  return (
    value === "layer" ||
    value === "x" ||
    value === "y" ||
    value === "rotation" ||
    value === "primitiveLock"
  );
}

function isMissingString(value: string | undefined): boolean {
  return value === undefined || value.length === 0;
}

function stringKind(value: unknown): string | undefined {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    !("kind" in value) ||
    typeof value.kind !== "string"
  ) {
    return undefined;
  }
  return value.kind;
}

interface TargetChange {
  primitiveId?: unknown;
  pointer?: unknown;
  before: unknown;
  after: unknown;
}

interface ReopenOptions {
  allowDifferentActiveDocument?: boolean;
}

function jsString(value: unknown): string {
  const encoded = JSON.stringify(String(value));
  if (encoded === undefined) {
    throw new Error("String serialization unexpectedly returned undefined.");
  }
  return encoded;
}

export const CONTEXT_PROBE_CODE = `
return await (async () => {
  const scalar = (value) => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
    return undefined;
  };
  const pick = (source, keys) => {
    const out = {};
    if (!source || typeof source !== "object") return out;
    for (const key of keys) {
      const value = scalar(source[key]);
      if (value !== undefined) out[key] = value;
    }
    return out;
  };
  const call = async (paths) => {
    for (const path of paths) {
      const parts = path.split(".");
      let owner = eda;
      for (let index = 0; index < parts.length - 1; index += 1) owner = owner?.[parts[index]];
      const fn = owner?.[parts.at(-1)];
      if (typeof fn === "function") {
        try { return await fn.call(owner); } catch (_) {}
      }
    }
    return undefined;
  };
  const project = await call(["dmt_Project.getCurrentProjectInfo"]);
  const document = await call(["dmt_SelectControl.getCurrentDocumentInfo"]);
  const pcb = await call(["dmt_Pcb.getCurrentPcbInfo"]);
  const schematic = await call(["dmt_Schematic.getCurrentSchematicInfo"]);
  const rawDocumentType = scalar(document?.documentType) ?? scalar(document?.docType);
  const documentType = Number.isInteger(Number(rawDocumentType)) ? Number(rawDocumentType) : undefined;
  return {
    ok: true,
    project: pick(project, ["uuid", "projectUuid", "name", "title", "path"]),
    document: { ...pick(document, ["uuid", "documentUuid", "title", "tabId", "id"]), documentType },
    pcb: pick(pcb, ["uuid", "documentUuid", "title", "tabId"]),
    schematic: pick(schematic, ["uuid", "documentUuid", "title", "tabId"]),
  };
})();`;

export const PROJECT_CONTEXT_PROBE_CODE = `
return await (async () => {
  const api = eda.dmt_Project;
  if (!api?.getCurrentProjectInfo) throw new Error("project context API is unavailable");
  const value = await api.getCurrentProjectInfo();
  const scalar = (item) =>
    item === null || ["string", "number", "boolean"].includes(typeof item) ? item : undefined;
  const project = {};
  for (const key of ["uuid", "projectUuid", "name", "title", "path"]) {
    const item = scalar(value?.[key]);
    if (item !== undefined) project[key] = item;
  }
  return { ok: true, project };
})();`;

/**
 * Establishes one immutable identity for the current EasyEDA renderer realm.
 * A reload or process restart creates a new performance time origin and a new
 * nonce, which lets orphan recovery prove that code from the former realm can
 * no longer be running.
 */
export const RUNTIME_IDENTITY_PROBE_CODE = `
return await (async () => {
  const KEY = "__easyedaProControlRuntimeIdentityV1";
  const host = globalThis;
  const timeOrigin = Number(host.performance?.timeOrigin);
  if (!Number.isFinite(timeOrigin) || timeOrigin <= 0) {
    throw new Error("EasyEDA renderer performance.timeOrigin is unavailable");
  }
  let generation = host[KEY];
  if (typeof generation !== "string" || generation.length < 24) {
    const randomPart = typeof host.crypto?.randomUUID === "function"
      ? host.crypto.randomUUID()
      : [Date.now().toString(36), Math.random().toString(36).slice(2), Math.random().toString(36).slice(2)].join("-");
    generation = ["easyeda-renderer", String(timeOrigin), randomPart].join(":");
    Object.defineProperty(host, KEY, {
      value: generation,
      writable: false,
      configurable: false,
      enumerable: false,
    });
  }
  const processId = Number(host.process?.pid);
  return {
    ok: true,
    kind: "runtime-identity",
    generation,
    timeOrigin,
    processId: Number.isInteger(processId) && processId > 0 ? processId : null,
  };
})();`;

export function wrapWithContextGuard(
  source: string,
  expectedContext: ExpectedContext,
): string {
  const expectedProjectUuid =
    expectedContext?.project?.uuid ??
    expectedContext?.project?.projectUuid ??
    "";
  const expectedDocumentUuid =
    expectedContext?.document?.uuid ??
    expectedContext?.document?.documentUuid ??
    "";
  const expectedDocumentType = expectedContext?.document?.documentType;
  const expectedTabId = expectedContext?.document?.tabId ?? "";
  if (
    !expectedProjectUuid ||
    !expectedDocumentUuid ||
    !Number.isInteger(expectedDocumentType) ||
    !expectedTabId
  ) {
    throw new Error(
      "A guarded runtime call requires project uuid, document uuid, integer documentType, and tabId.",
    );
  }
  return `
return await (async () => {
  const EXPECTED_PROJECT_UUID = ${jsString(expectedProjectUuid)};
  const EXPECTED_DOCUMENT_UUID = ${jsString(expectedDocumentUuid)};
  const EXPECTED_DOCUMENT_TYPE = ${Number(expectedDocumentType)};
  const EXPECTED_TAB_ID = ${jsString(expectedTabId)};
  const projectApi = eda.dmt_Project;
  const documentApi = eda.dmt_SelectControl;
  if (!projectApi?.getCurrentProjectInfo || !documentApi?.getCurrentDocumentInfo) {
    throw new Error("required context APIs are unavailable");
  }
  const project = await projectApi.getCurrentProjectInfo();
  const document = await documentApi.getCurrentDocumentInfo();
  const projectUuid = String(project?.uuid ?? project?.projectUuid ?? "");
  const documentUuid = String(document?.uuid ?? document?.documentUuid ?? document?.id ?? "");
  const documentType = Number(document?.documentType ?? document?.docType);
  const tabId = String(document?.tabId ?? "");
  if (projectUuid !== EXPECTED_PROJECT_UUID || documentUuid !== EXPECTED_DOCUMENT_UUID || documentType !== EXPECTED_DOCUMENT_TYPE || tabId !== EXPECTED_TAB_ID) {
    throw new Error("active EasyEDA context does not match the guarded operation");
  }
  return await (async () => {
${source}
  })();
})();`;
}

export function buildComponentMutationCode(
  documentType: number,
  targetChanges: readonly TargetChange[],
  stateName: unknown,
): string {
  if (documentType !== 3 || (stateName !== "before" && stateName !== "after")) {
    throw new Error(
      "Exact component mutation currently requires PCB type and before/after state.",
    );
  }
  const mutationState: MutationState = stateName;
  if (targetChanges.length === 0) {
    throw new Error(
      "Exact component mutation requires declared target changes.",
    );
  }
  const patches = new Map<string, ComponentPatch>();
  const preconditions = new Map<string, ComponentPatch>();
  const preconditionStateName = mutationState === "after" ? "before" : "after";
  for (const change of targetChanges) {
    const pointer = typeof change.pointer === "string" ? change.pointer : "";
    const match = /^\/([^/]+)$/u.exec(pointer);
    const field = match?.[1];
    if (!isWritableField(field)) {
      continue;
    }
    const primitiveId =
      typeof change.primitiveId === "string" ? change.primitiveId : "";
    if (!/^[A-Za-z0-9._:-]{1,160}$/u.test(primitiveId)) {
      throw new Error(
        "Exact component mutation contains an invalid primitive ID.",
      );
    }
    const writableField = field;
    const value = change[mutationState];
    const preconditionValue = change[preconditionStateName];
    for (const candidate of [value, preconditionValue]) {
      if (
        ["x", "y", "rotation"].includes(writableField) &&
        (typeof candidate !== "number" || !Number.isFinite(candidate))
      ) {
        throw new Error(`PCB component field ${writableField} must be finite.`);
      }
      if (writableField === "layer" && candidate !== 1 && candidate !== 2) {
        throw new Error(
          "PCB component layer must be exactly 1 (Top) or 2 (Bottom).",
        );
      }
      if (writableField === "primitiveLock" && typeof candidate !== "boolean") {
        throw new Error("PCB component primitiveLock must be boolean.");
      }
    }
    const patch = patches.get(primitiveId) ?? {};
    const precondition = preconditions.get(primitiveId) ?? {};
    if (Object.hasOwn(patch, writableField)) {
      throw new Error(
        `Exact component mutation repeats ${primitiveId}${pointer}.`,
      );
    }
    patch[writableField] = value;
    precondition[writableField] = preconditionValue;
    patches.set(primitiveId, patch);
    preconditions.set(primitiveId, precondition);
  }
  const records = [...patches.entries()]
    .toSorted(([left], [right]) => left.localeCompare(right))
    .map(([primitiveId, patch]) => ({
      primitiveId,
      patch,
      precondition: preconditions.get(primitiveId),
    }));
  if (records.length === 0) {
    throw new Error(
      "Every exact component mutation needs at least one writable top-level field.",
    );
  }
  if (records.length !== 1) {
    throw new Error(
      "A guarded component mutation is limited to exactly one PCB component so a failed modify cannot leave an unclassified partial multi-component state.",
    );
  }
  const serialized = JSON.stringify(records);
  const apiName = "pcb_PrimitiveComponent";
  return `
return await (async () => {
  const PATCHES = ${serialized};
  const api = eda.${apiName};
  if (!api || typeof api.modify !== "function") throw new Error("${apiName}.modify is unavailable");
  if (PATCHES.length !== 1) throw new Error("guarded component mutation requires exactly one component");
  const assertExactContext = async (stage) => {
    const projectApi = eda.dmt_Project;
    const documentApi = eda.dmt_SelectControl;
    if (!projectApi?.getCurrentProjectInfo || !documentApi?.getCurrentDocumentInfo) {
      throw new Error("component mutation context APIs are unavailable at " + stage);
    }
    const [project, document] = await Promise.all([
      projectApi.getCurrentProjectInfo(),
      documentApi.getCurrentDocumentInfo(),
    ]);
    const projectUuid = String(project?.uuid ?? project?.projectUuid ?? "");
    const documentUuid = String(document?.uuid ?? document?.documentUuid ?? document?.id ?? "");
    const documentType = Number(document?.documentType ?? document?.docType);
    const tabId = String(document?.tabId ?? "");
    if (
      projectUuid !== EXPECTED_PROJECT_UUID ||
      documentUuid !== EXPECTED_DOCUMENT_UUID ||
      documentType !== EXPECTED_DOCUMENT_TYPE ||
      tabId !== EXPECTED_TAB_ID
    ) {
      throw new Error("active EasyEDA context changed " + stage);
    }
  };
  const record = PATCHES[0];
  await assertExactContext("immediately before component precondition read");
  if (typeof api.get !== "function") throw new Error("${apiName}.get is unavailable");
  // api.get is active-context bound and yields. Re-prove the exact context
  // after it resolves, then compare synchronous state getters and invoke
  // modify before the next await. This is a last-moment optimistic
  // precondition, not an API CAS; switch-away-and-back remains undetectable.
  const current = await api.get(record.primitiveId);
  if (!current || Array.isArray(current)) {
    throw new Error("component precondition read did not return exactly one primitive");
  }
  await assertExactContext("after component precondition read and immediately before component modify");
  const getterByField = {
    layer: "getState_Layer",
    x: "getState_X",
    y: "getState_Y",
    rotation: "getState_Rotation",
    primitiveLock: "getState_PrimitiveLock",
  };
  for (const field of Object.keys(record.precondition).sort()) {
    const getter = current[getterByField[field]];
    if (typeof getter !== "function") {
      throw new Error("component precondition getter is unavailable for " + field);
    }
    const actual = getter.call(current);
    if (actual && typeof actual.then === "function") {
      throw new Error("component precondition getter unexpectedly became asynchronous for " + field);
    }
    if (!Object.is(actual, record.precondition[field])) {
      throw new Error("component precondition changed before modify for " + field);
    }
  }
  // Pass the exact object whose synchronous state was preconditioned. The
  // pinned adapter accepts an object directly; passing an ID would perform a
  // second hidden awaited get() after this last context/state proof.
  const pendingResult = api.modify(current, record.patch);
  const result = await pendingResult;
  await assertExactContext("after component modify");
  if (!result || typeof result.getState_PrimitiveId !== "function") {
    throw new Error("component modify did not return a primitive for " + record.primitiveId);
  }
  const returnedId = String(await result.getState_PrimitiveId());
  if (returnedId !== record.primitiveId) {
    throw new Error("component modify returned the wrong primitive");
  }
  return { ok: true, kind: "exact-component-mutation", state: ${jsString(
    mutationState,
  )}, documentType: ${documentType}, applied: [{ primitiveId: returnedId, fields: Object.keys(record.patch).sort() }] };
})();`;
}

export function buildDsnExportCode(
  fileName: string,
  expectedContext: ExpectedContext,
): string {
  const expectedProjectUuid =
    expectedContext?.project?.uuid ?? expectedContext?.project?.projectUuid;
  const expectedDocumentUuid =
    expectedContext?.document?.uuid ?? expectedContext?.document?.documentUuid;
  const expectedDocumentType = expectedContext?.document?.documentType;
  const expectedTabId = expectedContext?.document?.tabId;
  if (
    isMissingString(expectedProjectUuid) ||
    isMissingString(expectedDocumentUuid) ||
    expectedDocumentType !== 3 ||
    isMissingString(expectedTabId) ||
    typeof fileName !== "string" ||
    fileName.length === 0 ||
    fileName.length > 180
  ) {
    throw new Error(
      "Facade DSN export requires exact type-3 context and a bounded file name.",
    );
  }
  return `
return await (async () => {
  const manufacture = eda.pcb_ManufactureData;
  if (!manufacture || typeof manufacture.getDsnFile !== "function") {
    throw new Error("pcb_ManufactureData.getDsnFile is unavailable");
  }
  // Invoke synchronously before the first yield in this body. This proves which
  // context started generation, but the installed API accepts no document or
  // tab argument. A switch away and back while generation is pending cannot be
  // excluded, so callers must treat the bytes as active-context/best-effort.
  const pendingFile = manufacture.getDsnFile(${jsString(fileName)});
  const file = await pendingFile;
  if (!file || typeof file.arrayBuffer !== "function") {
    throw new Error("getDsnFile did not return a File");
  }
  const documentApi = eda.dmt_SelectControl;
  const projectApi = eda.dmt_Project;
  if (!documentApi?.getCurrentDocumentInfo || !projectApi?.getCurrentProjectInfo) {
    throw new Error("post-export context APIs are unavailable");
  }
  const project = await projectApi.getCurrentProjectInfo();
  const document = await documentApi.getCurrentDocumentInfo();
  const projectUuid = String(project?.uuid ?? project?.projectUuid ?? "");
  const documentUuid = String(document?.uuid ?? document?.documentUuid ?? document?.id ?? "");
  const documentType = Number(document?.documentType ?? document?.docType);
  const tabId = String(document?.tabId ?? "");
  if (
    projectUuid !== ${jsString(expectedProjectUuid)} ||
    documentUuid !== ${jsString(expectedDocumentUuid)} ||
    documentType !== 3 ||
    tabId !== ${jsString(expectedTabId)}
  ) {
    throw new Error("active EasyEDA context changed while generating the DSN");
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  let base64 = "";
  const chunkSize = 24576;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    base64 += btoa(String.fromCharCode(...bytes.subarray(offset, offset + chunkSize)));
  }
  return {
    ok: true,
    kind: "pcb-dsn",
    base64,
    byteLength: bytes.length,
    fileName: String(file.name ?? ${jsString(fileName)}),
    document: { uuid: documentUuid, documentType, tabId },
    project: { uuid: projectUuid },
  };
})();`;
}

export function buildSaveReopenCode(
  expectedContext: ExpectedContext,
  exactGuards: readonly ExactSaveGuard[],
): string {
  const expectedUuid =
    expectedContext?.document?.uuid ?? expectedContext?.document?.documentUuid;
  const expectedType = expectedContext?.document?.documentType;
  const expectedTabId = expectedContext?.document?.tabId;
  if (
    isMissingString(expectedUuid) ||
    typeof expectedType !== "number" ||
    !Number.isInteger(expectedType)
  ) {
    throw new Error(
      "save/reopen requires expectedContext.document uuid and documentType.",
    );
  }
  if (![1, 3].includes(expectedType)) {
    throw new Error(
      "exact save/reopen currently supports schematic (1) and PCB (3) documents only; library documents require a version-pinned library workflow.",
    );
  }
  if (isMissingString(expectedTabId)) {
    throw new Error("save/reopen requires expectedContext.document.tabId.");
  }
  if (exactGuards.length === 0 || exactGuards.length > 8) {
    throw new Error("save/reopen requires between one and eight exact guards.");
  }
  const guardReaders = exactGuards.map((guard, index) => {
    if (!/^[a-f0-9]{64}$/u.test(guard.expectedSnapshotSha256)) {
      throw new Error(`save/reopen exact guard ${index} has an invalid SHA-256.`);
    }
    return `async () => await ${buildExactReadExpression(guard.request)}`;
  });
  const expectedGuardHashes = exactGuards.map(
    (guard) => guard.expectedSnapshotSha256,
  );
  const guardLabels = exactGuards.map(
    (guard, index) => stringKind(guard.request) ?? `guard-${index}`,
  );
  return `
return await (async () => {
  const EXPECTED_UUID = ${jsString(expectedUuid)};
  const EXPECTED_TYPE = ${expectedType};
  const EXPECTED_TAB_ID = ${jsString(expectedTabId)};
  const readDocument = async () => {
    const api = eda.dmt_SelectControl;
    if (!api?.getCurrentDocumentInfo) throw new Error("DMT_SelectControl.getCurrentDocumentInfo unavailable");
    return await api.getCurrentDocumentInfo();
  };
  const uuidOf = (value) => String(value?.uuid ?? value?.documentUuid ?? value?.id ?? "");
  const typeOf = (value) => Number(value?.documentType ?? value?.docType);
  const stable = (value) => {
    if (value === null || typeof value !== "object") return value;
    if (Array.isArray(value)) return value.map((item) => stable(item));
    const result = {};
    for (const key of Object.keys(value).sort()) result[key] = stable(value[key]);
    return result;
  };
  const sha256Json = async (value) => {
    if (!globalThis.crypto?.subtle || typeof globalThis.TextEncoder !== "function") {
      throw new Error("Web Crypto SHA-256 is unavailable for the exact save guard");
    }
    const encoded = JSON.stringify(stable(value));
    if (encoded === undefined) throw new Error("exact save guard returned a non-JSON root");
    const digest = await globalThis.crypto.subtle.digest(
      "SHA-256",
      new globalThis.TextEncoder().encode(encoded),
    );
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  };
  const EXACT_GUARD_READERS = [${guardReaders.join(",\n")}];
  const EXPECTED_GUARD_HASHES = ${JSON.stringify(expectedGuardHashes)};
  const EXACT_GUARD_LABELS = ${JSON.stringify(guardLabels)};
  const observedGuardHashes = [];
  for (let pass = 0; pass < 2; pass += 1) {
    const passHashes = [];
    for (let index = 0; index < EXACT_GUARD_READERS.length; index += 1) {
      const payload = await EXACT_GUARD_READERS[index]();
      const hash = await sha256Json(payload);
      if (hash !== EXPECTED_GUARD_HASHES[index]) {
        throw new Error("exact save guard changed before save: " + EXACT_GUARD_LABELS[index]);
      }
      passHashes.push(hash);
    }
    observedGuardHashes.push(passHashes);
  }
  if (JSON.stringify(observedGuardHashes[0]) !== JSON.stringify(observedGuardHashes[1])) {
    throw new Error("exact save guard was unstable across its two commit-bound passes");
  }
  const before = await readDocument();
  if (uuidOf(before) !== EXPECTED_UUID || typeOf(before) !== EXPECTED_TYPE || String(before?.tabId ?? "") !== EXPECTED_TAB_ID) {
    throw new Error("active document changed before save");
  }
  const editor = eda.dmt_EditorControl;
  if (!editor?.closeDocument || !editor?.openDocument || !editor?.activateDocument) {
    throw new Error("editor open/close/activate API unavailable");
  }
  let saveDocument;
  if (EXPECTED_TYPE === 1) {
    const api = eda.sch_Document;
    if (!api?.save) throw new Error("SCH_Document.save unavailable");
    saveDocument = async () => await api.save();
  } else if (EXPECTED_TYPE === 3) {
    const api = eda.pcb_Document;
    if (!api?.save) throw new Error("PCB_Document.save unavailable");
    saveDocument = async () => await api.save(EXPECTED_UUID);
  } else {
    throw new Error("exact save/reopen is unsupported for this document type");
  }
  // Invoke save synchronously in this continuation after the second complete
  // exact-guard pass and final context check. The public API exposes no CAS or
  // editor lock, so the runtime-disabled writer still requires connected proof.
  const savePending = saveDocument();
  const saved = await savePending;
  if (saved !== true) throw new Error("document save did not return exactly true");
  const closeTarget = String(before?.tabId ?? EXPECTED_UUID);
  const closed = await editor.closeDocument(closeTarget);
  if (closed !== true) throw new Error("closeDocument did not return exactly true");
  const tabId = await editor.openDocument(EXPECTED_UUID);
  if (!tabId) throw new Error("openDocument did not return a tab id");
  const activated = await editor.activateDocument(tabId);
  if (activated !== true) throw new Error("activateDocument did not return exactly true");
  const after = await readDocument();
  if (uuidOf(after) !== EXPECTED_UUID || typeOf(after) !== EXPECTED_TYPE) {
    throw new Error("reopened document identity mismatch");
  }
  return {
    ok: true,
    saved: true,
    closed: true,
    reopened: true,
    exactSaveGuard: {
      passes: 2,
      labels: EXACT_GUARD_LABELS,
      snapshotSha256: observedGuardHashes[1],
      saveInvokedInSameExecution: true,
      publicCompareAndSwapAvailable: false,
    },
    document: {
      uuid: uuidOf(after),
      documentType: typeOf(after),
      title: String(after?.title ?? ""),
      tabId: String(after?.tabId ?? tabId),
    },
  };
})();`;
}

export function buildActivateRecoveryTargetCode(
  expectedContext: ExpectedContext,
): string {
  const expectedProjectUuid =
    expectedContext?.project?.uuid ?? expectedContext?.project?.projectUuid;
  const expectedUuid =
    expectedContext?.document?.uuid ?? expectedContext?.document?.documentUuid;
  const expectedType = expectedContext?.document?.documentType;
  if (
    isMissingString(expectedProjectUuid) ||
    isMissingString(expectedUuid) ||
    typeof expectedType !== "number" ||
    !Number.isInteger(expectedType) ||
    ![1, 2, 3, 4].includes(expectedType)
  ) {
    throw new Error(
      "recovery target activation requires an exact supported document identity.",
    );
  }
  return `
return await (async () => {
  const EXPECTED_PROJECT_UUID = ${jsString(expectedProjectUuid)};
  const EXPECTED_UUID = ${jsString(expectedUuid)};
  const EXPECTED_TYPE = ${expectedType};
  const projectApi = eda.dmt_Project;
  const documentApi = eda.dmt_SelectControl;
  const editor = eda.dmt_EditorControl;
  if (!projectApi?.getCurrentProjectInfo || !documentApi?.getCurrentDocumentInfo || !editor?.openDocument || !editor?.activateDocument) {
    throw new Error("required recovery activation APIs are unavailable");
  }
  const uuidOf = (value) => String(value?.uuid ?? value?.documentUuid ?? value?.id ?? "");
  const typeOf = (value) => Number(value?.documentType ?? value?.docType);
  const project = await projectApi.getCurrentProjectInfo();
  const projectUuid = String(project?.uuid ?? project?.projectUuid ?? "");
  if (projectUuid !== EXPECTED_PROJECT_UUID) {
    throw new Error("active project changed before recovery target activation");
  }
  let document = await documentApi.getCurrentDocumentInfo();
  let openedOrActivated = false;
  if (uuidOf(document) !== EXPECTED_UUID || typeOf(document) !== EXPECTED_TYPE) {
    const targetTab = await editor.openDocument(EXPECTED_UUID);
    if (!targetTab) throw new Error("openDocument could not locate the recovery target");
    const activated = await editor.activateDocument(targetTab);
    if (activated !== true) throw new Error("activateDocument could not select the recovery target");
    openedOrActivated = true;
    document = await documentApi.getCurrentDocumentInfo();
  }
  if (uuidOf(document) !== EXPECTED_UUID || typeOf(document) !== EXPECTED_TYPE) {
    throw new Error("recovery target identity mismatch after activation");
  }
  const tabId = String(document?.tabId ?? "");
  if (!tabId) throw new Error("recovery target activation did not report a tab id");
  return {
    ok: true,
    kind: "activate-recovery-target",
    openedOrActivated,
    document: { uuid: uuidOf(document), documentType: typeOf(document), tabId },
  };
})();`;
}

export function buildReopenOnlyCode(
  expectedContext: ExpectedContext,
  options: ReopenOptions = {},
): string {
  const expectedUuid =
    expectedContext?.document?.uuid ?? expectedContext?.document?.documentUuid;
  const expectedType = expectedContext?.document?.documentType;
  const expectedProjectUuid =
    expectedContext?.project?.uuid ?? expectedContext?.project?.projectUuid;
  const expectedTabId = expectedContext?.document?.tabId;
  const allowDifferentActiveDocument =
    options.allowDifferentActiveDocument === true;
  if (
    isMissingString(expectedProjectUuid) ||
    isMissingString(expectedUuid) ||
    typeof expectedType !== "number" ||
    !Number.isInteger(expectedType) ||
    ![1, 2, 3, 4].includes(expectedType) ||
    (!allowDifferentActiveDocument && isMissingString(expectedTabId))
  ) {
    throw new Error(
      "reopen-only recovery requires an exact supported document identity.",
    );
  }
  return `
return await (async () => {
  const EXPECTED_PROJECT_UUID = ${jsString(expectedProjectUuid)};
  const EXPECTED_UUID = ${jsString(expectedUuid)};
  const EXPECTED_TYPE = ${expectedType};
  const EXPECTED_TAB_ID = ${jsString(expectedTabId ?? "")};
  const ALLOW_DIFFERENT_ACTIVE_DOCUMENT = ${allowDifferentActiveDocument ? "true" : "false"};
  const projectApi = eda.dmt_Project;
  const documentApi = eda.dmt_SelectControl;
  const editor = eda.dmt_EditorControl;
  if (!projectApi?.getCurrentProjectInfo || !documentApi?.getCurrentDocumentInfo || !editor?.closeDocument || !editor?.openDocument || !editor?.activateDocument) {
    throw new Error("required reopen-only APIs are unavailable");
  }
  const uuidOf = (value) => String(value?.uuid ?? value?.documentUuid ?? value?.id ?? "");
  const typeOf = (value) => Number(value?.documentType ?? value?.docType);
  const project = await projectApi.getCurrentProjectInfo();
  const projectUuid = String(project?.uuid ?? project?.projectUuid ?? "");
  if (projectUuid !== EXPECTED_PROJECT_UUID) {
    throw new Error("active project changed before reopen-only recovery");
  }
  let before = await documentApi.getCurrentDocumentInfo();
  let openedForRecovery = false;
  if (!ALLOW_DIFFERENT_ACTIVE_DOCUMENT && (uuidOf(before) !== EXPECTED_UUID || typeOf(before) !== EXPECTED_TYPE || String(before?.tabId ?? "") !== EXPECTED_TAB_ID)) {
    throw new Error("active document or tab changed before reopen-only lifecycle call");
  }
  if (uuidOf(before) !== EXPECTED_UUID || typeOf(before) !== EXPECTED_TYPE) {
    const targetTab = await editor.openDocument(EXPECTED_UUID);
    if (!targetTab) throw new Error("openDocument could not locate the recovery target");
    const activatedTarget = await editor.activateDocument(targetTab);
    if (activatedTarget !== true) throw new Error("activateDocument could not select the recovery target");
    before = await documentApi.getCurrentDocumentInfo();
    if (uuidOf(before) !== EXPECTED_UUID || typeOf(before) !== EXPECTED_TYPE) {
      throw new Error("opened recovery target identity mismatch");
    }
    openedForRecovery = true;
  }
  const closeTarget = String(before?.tabId ?? EXPECTED_UUID);
  const closed = await editor.closeDocument(closeTarget);
  if (closed !== true) throw new Error("closeDocument did not return exactly true");
  const tabId = await editor.openDocument(EXPECTED_UUID);
  if (!tabId) throw new Error("openDocument did not return a tab id");
  const activated = await editor.activateDocument(tabId);
  if (activated !== true) throw new Error("activateDocument did not return exactly true");
  const after = await documentApi.getCurrentDocumentInfo();
  if (uuidOf(after) !== EXPECTED_UUID || typeOf(after) !== EXPECTED_TYPE) {
    throw new Error("reopen-only recovered document identity mismatch");
  }
  return {
    ok: true,
    saved: false,
    closed: true,
    reopened: true,
    openedForRecovery,
    document: { uuid: uuidOf(after), documentType: typeOf(after), tabId: String(after?.tabId ?? tabId) },
  };
})();`;
}
