/* oxlint-disable import/max-dependencies -- Navigation composes existing receipt, history and native-profile guards with imported-header evidence. */
import { dirname, join } from "node:path";
import { z } from "zod";
import { controlDataDirectory, controlRootCapability } from "./artifacts.ts";
import { verifyCheckpoint } from "./checkpoint.ts";
import { normalizeEasyedaProjectPath } from "./core.ts";
import type { ExpectedContext } from "./engine.ts";
import { isNativeDocumentDeleted, readNativeHistoryCheckpoint } from "./native-history.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { verifyLibraryNativeProfile } from "./library-native-profile.ts";
import { DEVICE_NATIVE_HOST_GUARD } from "./device-runtime-guard.ts";
import { RECOVERY_NAVIGATION_FAILURE_STAGES } from "./native-diagnostics.ts";
import { nativeLibraryHeaderEvidence } from "./native-library-header-evidence.ts";
import type { NativeLibraryHeaderEvidence } from "./native-library-header-evidence.ts";
import { PCB_NAVIGATION_PREFERENCE_GUARD, PCB_NAVIGATION_PREFERENCE_REFUSAL } from "./pcb-navigation-preferences.ts";

const PROFILE = "easyeda-pro-control.recovery-navigation.v1";
const checkpointBindingSchema = z.object({ schema: z.literal("easyeda-pro-control.checkpoint.v2"), source: z.string().min(1).max(4096),
  checkpoint: z.string().min(1).max(4096), receiptPath: z.string().min(1).max(4096), checkpointSha256: z.string().regex(/^[a-f0-9]{64}$/u) });
const targetSchema = z.object({
  projectUuid: z.string().regex(/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u),
  projectPath: z.string().min(1).max(4096),
  documentUuid: z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/u),
  documentType: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  libraryOwnerUuid: z.string().min(1).max(256).optional(),
  libraryName: z.string().min(1).max(512).optional(),
}).strict().refine((value) => [2, 4].includes(value.documentType) ?
  value.libraryOwnerUuid !== undefined && value.libraryName !== undefined : value.libraryOwnerUuid === undefined && value.libraryName === undefined,
"Library navigation needs exact owner/name only for library editor targets.");
export type RecoveryNavigationTarget = z.infer<typeof targetSchema>;

/** Inputs come only from a loaded, sealed journal, never from navigation tool arguments. */
export function deriveRecoveryNavigationTarget(expectedContext: ExpectedContext, checkpoint: NativeHistorySnapshot): RecoveryNavigationTarget {
  const documentUuid = expectedContext.document.uuid ?? expectedContext.document.documentUuid;
  const library = [2, 4].includes(expectedContext.document.documentType);
  const asset = checkpoint.documents.find((document) => document.uuid === documentUuid && !isNativeDocumentDeleted(document));
  const meta = asset?.records.find((record) => record.id === "META" && record.type === "META");
  const target = targetSchema.parse({
    projectUuid: expectedContext.project.uuid ?? expectedContext.project.projectUuid,
    projectPath: normalizeEasyedaProjectPath(expectedContext.project.path),
    documentUuid,
    documentType: expectedContext.document.documentType,
    ...(library ? { libraryOwnerUuid: checkpoint.projectOwnerUuid, libraryName: meta?.body["title"] } : {}),
  });
  if ((expectedContext.project.uuid !== undefined && expectedContext.project.projectUuid !== undefined && expectedContext.project.uuid !== expectedContext.project.projectUuid) ||
      (expectedContext.document.uuid !== undefined && expectedContext.document.documentUuid !== undefined && expectedContext.document.uuid !== expectedContext.document.documentUuid)) {
    throw new Error("Recovery navigation journal identity aliases disagree.");
  }
  const documents = checkpoint.documents.filter((document) => document.uuid === target.documentUuid && !isNativeDocumentDeleted(document));
  if (checkpoint.projectUuid !== target.projectUuid || documents.length !== 1 ||
      documents[0]?.docType !== ({ 1: "SCH_PAGE", 2: "SYMBOL", 3: "PCB", 4: "FOOTPRINT" }[target.documentType]) ||
      (library && expectedContext.document["parentLibraryUuid"] !== undefined && expectedContext.document["parentLibraryUuid"] !== target.libraryOwnerUuid)) {
    throw new Error("Recovery navigation target is not an existing checkpoint document.");
  }
  return target;
}

/** Verify the retained artifact independently of the current saved design state.
 * A changed live database is expected during recovery and is NOT declared clean.
 */
export async function prepareRecoveryNavigation(input: {
  readonly expectedContext: ExpectedContext;
  readonly preCheckpoint: unknown;
  readonly assetsRoot: string;
  readonly navigation?: Omit<RecoveryNavigationOptions, "checkpointProjectOwnerUuid">;
  /** Exact unchanged-project opening or sealed display-only imported-peer recovery. */
  readonly libraryAtomHeaders?: "preserve";
}): Promise<{ readonly target: RecoveryNavigationTarget; readonly code: string; readonly checkpointSha256: string;
  readonly libraryHeaderEvidence?: NativeLibraryHeaderEvidence }> {
  const captured = structuredClone(input), libraryAtomHeaders = captured.libraryAtomHeaders;
  if (libraryAtomHeaders === "preserve" && ![1, 3].includes(captured.expectedContext.document.documentType)) {
    throw new Error("Imported library history is only admitted by unchanged-project navigation, not library recovery.");
  }
  await verifyLibraryNativeProfile(captured.assetsRoot);
  // This projection is only the sealed-journal binding. verifyCheckpoint below
  // Validates the complete on-disk receipt, file identities and content hashes.
  const preCheckpoint = checkpointBindingSchema.parse(captured.preCheckpoint);
  const source = normalizeEasyedaProjectPath(captured.expectedContext.project.path);
  if (normalizeEasyedaProjectPath(preCheckpoint.source) !== source) {
    throw new Error("Recovery navigation checkpoint belongs to another saved path.");
  }
  const verified = await verifyCheckpoint(preCheckpoint.receiptPath, {
    expectedSource: source,
    controlRoot: await controlRootCapability(),
    artifactRoots: [join(dirname(source), "backups"), join(controlDataDirectory(), "checkpoints")],
  });
  if (!verified.checkpointMatchesReceipt || verified.checkpointSha256 !== preCheckpoint.checkpointSha256 ||
      verified.checkpoint !== preCheckpoint.checkpoint || verified.receiptPath !== preCheckpoint.receiptPath ||
      normalizeEasyedaProjectPath(verified.source) !== source) {
    throw new Error("Recovery navigation retained checkpoint verification failed.");
  }
  const projectUuid = captured.expectedContext.project.uuid ?? captured.expectedContext.project.projectUuid;
  if (projectUuid === undefined) { throw new Error("Recovery navigation project identity is missing."); }
  const checkpoint = await readNativeHistoryCheckpoint({ checkpointPath: verified.checkpoint,
    expectedSha256: verified.checkpointSha256, projectUuid,
    ...(libraryAtomHeaders === "preserve" ? { libraryAtomHeaders: "preserve" as const } : {}) });
  const libraryHeaderEvidence = libraryAtomHeaders === "preserve" ? await nativeLibraryHeaderEvidence(checkpoint,
    { checkpointSha256: verified.checkpointSha256, projectUuid }) : undefined;
  const target = deriveRecoveryNavigationTarget(captured.expectedContext, checkpoint);
  const navigation: RecoveryNavigationOptions = {
    ...(captured.navigation?.navigate === undefined ? {} : { navigate: captured.navigation.navigate }),
    ...(captured.navigation?.requireExclusiveTabs === undefined ? {} : { requireExclusiveTabs: captured.navigation.requireExclusiveTabs }),
    ...(captured.navigation?.requireEditorReadiness === undefined ? {} : { requireEditorReadiness: captured.navigation.requireEditorReadiness }),
    ...(checkpoint.projectOwnerUuid === undefined ? {} : { checkpointProjectOwnerUuid: checkpoint.projectOwnerUuid }),
  };
  return { target, code: buildRecoveryNavigationCode(target, navigation), checkpointSha256: verified.checkpointSha256,
    ...(libraryHeaderEvidence === undefined ? {} : { libraryHeaderEvidence }) };
}

/** Fixed DMT navigation only. The caller dispatches this through retained Job +
 * authenticated-session orphan tracking, then independently asserts live context.
 * It never closes, saves, imports, creates or discards anything.
 */
export interface RecoveryNavigationOptions {
  readonly navigate?: boolean;
  readonly requireExclusiveTabs?: boolean;
  /** Existing-project opening must wait for the same auxiliary identity and
   * parent ownership that the independent context reader requires. Observation
   * never repeats Open/Activate or hides a contradictory identity.
   */
  readonly requireEditorReadiness?: boolean;
  /** Independently decoded checkpoint owner; never part of caller or sealed-target inputs. */
  readonly checkpointProjectOwnerUuid?: string;
}
export function buildRecoveryNavigationCode(value: RecoveryNavigationTarget, options: RecoveryNavigationOptions = {}): string {
  const target = targetSchema.parse(value);
  if (options.requireEditorReadiness === true && ![1, 3].includes(target.documentType)) {
    throw new Error("Existing-project editor readiness supports only schematic pages and PCB documents.");
  }
  const checkpointProjectOwnerUuid = z.string().min(1).max(64).optional().parse(options.checkpointProjectOwnerUuid);
  if (target.projectPath !== normalizeEasyedaProjectPath(target.projectPath)) {
    throw new Error("Recovery navigation path must be canonical.");
  }
  return `return await (async () => {
    const target = ${JSON.stringify(target)};
    const checkpointProjectOwnerUuid = ${JSON.stringify(checkpointProjectOwnerUuid ?? null)};
    const fail = (stage) => { throw new Error("Recovery navigation refused: " + stage); };
    const knownFailures = new Set(${JSON.stringify(RECOVERY_NAVIGATION_FAILURE_STAGES)}.map(stage => "Recovery navigation refused: " + stage));
    knownFailures.add('NATIVE_LIFECYCLE_OPEN_TIMEOUT');
    knownFailures.add('NATIVE_LIFECYCLE_CLOSE_TIMEOUT');
    knownFailures.add('DEVICE_NATIVE_HOST_AMBIGUOUS');
    knownFailures.add('DEVICE_NATIVE_BUS_MISSING');
    knownFailures.add(${JSON.stringify(PCB_NAVIGATION_PREFERENCE_REFUSAL)});
    const classifiedError = (error, stage) => {
      let message;
      try {
        if (error !== null && typeof error === 'object') message = Object.getOwnPropertyDescriptor(error, 'message')?.value;
      } catch (_) {}
      return new Error(typeof message === 'string' && message.length <= 512 && knownFailures.has(message) ? message : "Recovery navigation refused: " + stage);
    };
    // Native exceptions otherwise lose their code in the upstream execute tool.
    // Keep only a fixed boundary, never raw messages, accessors, stacks or causes.
    const nativeCall = async (stage, call) => {
      try { return await call(); } catch (error) { throw classifiedError(error, stage); }
    };
    try {
    ${PCB_NAVIGATION_PREFERENCE_GUARD}
    const project = eda.dmt_Project, select = eda.dmt_SelectControl, editor = eda.dmt_EditorControl;
    if (typeof project?.getCurrentProjectInfo !== "function" || typeof project?.openProject !== "function" ||
        typeof select?.getCurrentDocumentInfo !== "function" || typeof editor?.openDocument !== "function" ||
        typeof editor?.activateDocument !== "function" || typeof eda.sys_ClientUrl?.request !== "function") fail("api-unavailable");
    const library = target.documentType === 2 || target.documentType === 4;
    const requireEditorReadiness = ${JSON.stringify(options.requireEditorReadiness === true)};
    if (requireEditorReadiness && (target.documentType === 1 ?
      typeof eda.dmt_Schematic?.getCurrentSchematicInfo !== 'function' || typeof eda.dmt_Schematic?.getCurrentSchematicPageInfo !== 'function' :
      typeof eda.dmt_Pcb?.getCurrentPcbInfo !== 'function')) fail('editor-readiness-api');
    const libraryApi = target.documentType === 2 ? eda.lib_Symbol : eda.lib_Footprint;
    if (library && (target.documentType === 2 ? typeof libraryApi?.openInEditor !== "function" : typeof libraryApi?.get !== "function" || typeof editor.openLibraryDocument !== "function")) fail("library-api-unavailable");
    const libraryIdentity = async () => {
      if (!library) return;
      if (target.documentType === 2) {
        ${DEVICE_NATIVE_HOST_GUARD}
        if (host.currentProject?.projectId !== target.projectUuid) fail("library-identity-drift");
        const value = (await nativeCall('native-library-info', () => bus.rpcCall('/PrjDB/symbol/getData',[target.documentUuid,target.projectUuid]))).message;
        if (host.currentProject?.projectId !== target.projectUuid || value?.uuid !== target.documentUuid || value?.project_uuid !== target.projectUuid || value?.owner?.uuid !== target.libraryOwnerUuid || value?.display_title !== target.libraryName) fail("library-identity-drift");
        return;
      }
      const value = await nativeCall('native-library-info', () => libraryApi.get(target.documentUuid,target.projectUuid));
      if (value?.uuid !== target.documentUuid || value?.libraryUuid !== target.libraryOwnerUuid || value?.name !== target.libraryName) fail("library-identity-drift");
    };
    const identity = (item, primary, alias) => {
      if (item === undefined || item === null) return undefined;
      if (typeof item !== "object" || Array.isArray(item)) fail("identity-shape");
      const left = item[primary], right = item[alias];
      if (left !== undefined && right !== undefined && left !== right) fail("identity-alias");
      const result = left ?? right;
      if (typeof result !== "string" || result.length === 0) fail("identity-missing");
      return result;
    };
    const path = (raw) => {
      if (typeof raw !== "string" || raw.length === 0 || raw.length > 4096 || /[\\x00-\\x1f]/.test(raw)) fail("registry-path");
      let result = raw.replaceAll("\\\\", "/");
      const drive = /^([a-zA-Z]):\\/(.*)$/.exec(result);
      if (drive) result = "/mnt/" + drive[1].toLowerCase() + "/" + drive[2];
      if (!result.startsWith("/") || result.split("/").some((part) => part === "." || part === "..")) fail("registry-path");
      return result;
    };
    const registryPath = async () => {
      const url = "https://client/api/client/projectPaths";
      const response = await nativeCall('native-registry-request', () => eda.sys_ClientUrl.request(url, "GET"));
      return await nativeCall('native-registry-read', async () => {
      if (response?.ok !== true || response.url !== url || typeof response.body?.getReader !== "function") fail("registry-response");
      const reader = response.body.getReader(), decoder = new TextDecoder("utf-8", { fatal: true });
      let text = "", bytes = 0;
      try {
        for (;;) {
          const part = await reader.read();
          if (part.done) break;
          if (!(part.value instanceof Uint8Array)) fail("registry-chunk");
          bytes += part.value.byteLength;
          if (bytes > 2097152) { await reader.cancel(); fail("registry-bound"); }
          text += decoder.decode(part.value, { stream: true });
        }
        text += decoder.decode();
      } finally { reader.releaseLock(); }
      let envelope;
      try { envelope = JSON.parse(text); } catch (_) { fail("registry-json"); }
      const entries = envelope?.success === true ? envelope.result : undefined;
      if (!entries || typeof entries !== "object" || Array.isArray(entries) || !Object.prototype.hasOwnProperty.call(entries, target.projectUuid)) fail("registry-membership");
      if (path(entries[target.projectUuid]?.path) !== target.projectPath) fail("registry-target-mismatch");
      });
    };
    const exclusiveTabs = async (activeProject) => {
      if (!${JSON.stringify(options.requireExclusiveTabs === true)}) return;
      if (typeof editor.getSplitScreenTree !== "function") fail("tab-tree-api");
      const tree = await nativeCall('native-tab-tree', () => editor.getSplitScreenTree()), pending = [{ value: tree, depth: 0 }], seen = new Set();
      let tabs = 0;
      while (pending.length) {
        const item = pending.pop(), node = item.value;
        if (!node || typeof node !== "object" || Array.isArray(node) || seen.has(node) || item.depth > 16 || seen.size >= 128) fail("tab-tree-shape");
        seen.add(node);
        if (node.children !== undefined) {
          if (!Array.isArray(node.children) || node.children.length === 0 || node.tabs !== undefined) fail("tab-tree-branch");
          for (const child of node.children) pending.push({ value: child, depth: item.depth + 1 });
        } else {
          if (!Array.isArray(node.tabs)) fail("tab-tree-leaf");
          for (const tab of node.tabs) {
            tabs += 1;
            if (tabs > 256 || !tab || typeof tab !== "object" || Array.isArray(tab) || typeof tab.tabId !== "string") fail("tab-record");
            const data = tab.data;
            if (data !== undefined && (!data || typeof data !== "object" || Array.isArray(data))) fail("tab-data");
            if (tab.documentType !== undefined && data?.doctype !== undefined && tab.documentType !== data.doctype) fail("tab-type-alias");
            const type = tab.documentType ?? data?.doctype;
            const start = tab.tabId === "tab_page1" && type === -1 && tab.isAbleDelete === false &&
              tab.parentProjectUuid === undefined && tab.parentLibraryUuid === undefined && data?.pid === undefined && data?.owner === undefined;
            const ownedTarget = identity(activeProject, "uuid", "projectUuid") === target.projectUuid &&
              tab.tabId.split("@")[0] === target.documentUuid && type === target.documentType &&
              (library ? tab.tabId === target.documentUuid + '@' + target.projectUuid &&
                (tab.parentLibraryUuid === target.libraryOwnerUuid || data?.owner === target.libraryOwnerUuid) &&
                (tab.parentLibraryUuid === undefined || tab.parentLibraryUuid === target.libraryOwnerUuid) &&
                (data?.owner === undefined || data.owner === target.libraryOwnerUuid) &&
                (tab.parentProjectUuid === undefined || tab.parentProjectUuid === target.projectUuid) &&
                (data?.pid === undefined || data.pid === target.projectUuid) :
                (tab.parentProjectUuid === target.projectUuid || data?.pid === target.projectUuid) &&
                (tab.parentProjectUuid === undefined || tab.parentProjectUuid === target.projectUuid) &&
                (data?.pid === undefined || data.pid === target.projectUuid) && tab.parentLibraryUuid === undefined &&
                (data?.owner === undefined || (checkpointProjectOwnerUuid !== null && data.owner === checkpointProjectOwnerUuid)));
            if (!start && !ownedTarget) fail("unrelated-editor-tab");
          }
        }
      }
    };
    const inspect = async () => {
      const p = await nativeCall('native-project-info', () => project.getCurrentProjectInfo()),
        observedDocument = await nativeCall('native-document-info', () => select.getCurrentDocumentInfo());
      await exclusiveTabs(p);
      // Native Start Page has this exact observed non-document sentinel. A UUID
      // "0" with any real editor type, other tab or disagreeing alias is not empty.
      const emptyZero = observedDocument?.uuid === "0" && observedDocument.documentType === 0 && observedDocument.tabId === "0" &&
        (observedDocument.documentUuid === undefined || observedDocument.documentUuid === "0");
      // The pinned UI creates this one fixed Start Page, not a tab_page counter.
      const startPage = observedDocument?.uuid === "tab_page1" &&
        observedDocument.documentType === -1 && observedDocument.tabId === "tab_page1" &&
        (observedDocument.documentUuid === undefined || observedDocument.documentUuid === "tab_page1") &&
        observedDocument.parentProjectUuid === undefined && observedDocument.parentLibraryUuid === undefined;
      const d = emptyZero || startPage ? undefined : observedDocument;
      const projectUuid = identity(p, "uuid", "projectUuid"), documentUuid = identity(d, "uuid", "documentUuid");
      if (projectUuid !== undefined && projectUuid !== target.projectUuid) fail("other-project-active");
      if (documentUuid !== undefined && (documentUuid !== target.documentUuid || d.documentType !== target.documentType)) fail("other-document-active");
      if (documentUuid !== undefined && projectUuid === undefined) fail("document-without-project");
      if (documentUuid !== undefined && library && (d.parentLibraryUuid !== target.libraryOwnerUuid || d.tabId !== target.documentUuid + '@' + target.projectUuid)) fail("library-context-owner");
      if (p?.path !== undefined && path(p.path) !== target.projectPath) fail("active-project-path");
      return { projectUuid, documentUuid, tabId: d?.tabId };
    };
    // Public activation can acknowledge before the selected document becomes
    // observable. Only an absent document may settle; inspect still rejects
    // foreign identities, paths, owners and unrelated tabs immediately.
    const inspectActivated = async (tabId) => {
      const matches = value => value.projectUuid === target.projectUuid && value.documentUuid === target.documentUuid && value.tabId === tabId;
      let value = await inspect();
      if (matches(value)) return value;
      if (value.projectUuid !== target.projectUuid || value.documentUuid !== undefined) fail("activate-readback");
      const timers = globalThis.window?.top;
      if (typeof timers?.setTimeout !== 'function' || typeof timers?.clearTimeout !== 'function') fail("api-unavailable");
      let deadline, pollTimer, rejectDeadline;
      const expired = new Promise((resolve,reject) => { rejectDeadline = reject; }); expired.catch(() => {});
      try {
        deadline = timers.setTimeout(() => rejectDeadline(new Error('NATIVE_LIFECYCLE_OPEN_TIMEOUT')),15000);
        for (let attempt = 0; attempt < 300; attempt++) {
          await Promise.race([new Promise(resolve => { pollTimer = timers.setTimeout(() => { pollTimer = undefined; resolve(); },50); }),expired]);
          value = await Promise.race([inspect(),expired]);
          if (matches(value)) return value;
          if (value.projectUuid !== target.projectUuid || value.documentUuid !== undefined) fail("activate-readback");
        }
        throw new Error('NATIVE_LIFECYCLE_OPEN_TIMEOUT');
      } finally {
        if (deadline !== undefined) timers.clearTimeout(deadline);
        if (pollTimer !== undefined) timers.clearTimeout(pollTimer);
      }
    };
    // Selection can appear before the schematic page/container or PCB manager.
    // Only absent readiness evidence may settle. Present conflicting evidence
    // fails immediately, including ownership that the ordinary context probe
    // would otherwise reject just after a successful one-shot navigation.
    const observeEditorReadiness = async (tabId) => {
      if (!requireEditorReadiness) return;
      const timers = globalThis.window?.top;
      if (typeof timers?.setTimeout !== 'function' || typeof timers?.clearTimeout !== 'function') fail('editor-readiness-api');
      const selected = async () => {
        const current = await inspect();
        if (current.projectUuid !== target.projectUuid) fail('editor-readiness-project');
        if (current.documentUuid === undefined) return false;
        if (current.documentUuid !== target.documentUuid || current.tabId !== tabId) fail('editor-readiness-document');
        const value = await nativeCall('native-document-info', () => select.getCurrentDocumentInfo());
        if (value === undefined || value === null) return false;
        if (identity(value, 'uuid', 'documentUuid') !== target.documentUuid || value.documentType !== target.documentType || value.tabId !== tabId ||
            value.parentLibraryUuid !== undefined || (value.parentProjectUuid !== undefined && value.parentProjectUuid !== target.projectUuid)) fail('editor-readiness-owner');
        return value.parentProjectUuid === target.projectUuid;
      };
      const auxiliary = async () => {
        if (target.documentType === 3) {
          const value = await nativeCall('native-pcb-info', () => eda.dmt_Pcb.getCurrentPcbInfo());
          const uuid = identity(value, 'uuid', 'documentUuid');
          if (uuid === undefined) return false;
          if (uuid !== target.documentUuid || (value.tabId !== undefined && value.tabId !== '' && value.tabId !== tabId)) fail('editor-readiness-pcb');
          return true;
        }
        const schematic = await nativeCall('native-schematic-info', () => eda.dmt_Schematic.getCurrentSchematicInfo());
        const page = await nativeCall('native-schematic-page-info', () => eda.dmt_Schematic.getCurrentSchematicPageInfo());
        const schematicUuid = identity(schematic, 'uuid', 'documentUuid'), pageUuid = identity(page, 'uuid', 'documentUuid');
        if (pageUuid !== undefined && (pageUuid !== target.documentUuid ||
            (page.tabId !== undefined && page.tabId !== '' && page.tabId !== tabId))) fail('editor-readiness-page');
        if (schematicUuid !== undefined && page?.parentSchematicUuid !== undefined && page.parentSchematicUuid !== schematicUuid) fail('editor-readiness-container');
        return schematicUuid !== undefined && pageUuid === target.documentUuid && page.parentSchematicUuid === schematicUuid;
      };
      let deadline, pollTimer, rejectDeadline;
      const expired = new Promise((resolve,reject) => { rejectDeadline = reject; }); expired.catch(() => {});
      const bounded = promise => Promise.race([promise,expired]);
      const pause = () => new Promise(resolve => { pollTimer = timers.setTimeout(() => { pollTimer = undefined; resolve(); },50); });
      try {
        deadline = timers.setTimeout(() => rejectDeadline(new Error('NATIVE_LIFECYCLE_OPEN_TIMEOUT')),15000);
        let stable = 0;
        for (let attempt = 0; attempt < 300; attempt++) {
          const before = await bounded(selected()), ready = await bounded(auxiliary()), after = await bounded(selected());
          if (before && ready && after) { stable += 1; if (stable === 2) return; } else stable = 0;
          await bounded(pause());
        }
        throw new Error('NATIVE_LIFECYCLE_OPEN_TIMEOUT');
      } finally {
        if (deadline !== undefined) timers.clearTimeout(deadline);
        if (pollTimer !== undefined) timers.clearTimeout(pollTimer);
      }
    };
    await inspect();
    await registryPath();
    if (${JSON.stringify(options.navigate === false)}) {
      const current = await inspect();
      if (current.documentUuid !== undefined) { await libraryIdentity(); await inspect(); }
      return { ok: true, schema: ${JSON.stringify(PROFILE)}, inspectedOnly: true, targetOpen: current.documentUuid === target.documentUuid,
        project: current.projectUuid === undefined ? null : { uuid: current.projectUuid, path: target.projectPath },
        document: current.documentUuid === undefined ? null : { uuid: current.documentUuid, documentType: target.documentType, tabId: current.tabId } };
    }
    let current = await inspect(), openedProject = false, openedDocument = false;
    if (current.projectUuid === undefined) {
      // Project restoration can activate a remembered PCB even for a SCH target.
      assertPcbNavigationPreferences();
      if (await nativeCall('native-open-project', () => project.openProject(target.projectUuid)) !== true) fail("open-project-result");
      openedProject = true;
      current = await inspect();
      if (current.projectUuid !== target.projectUuid) fail("open-project-readback");
      await registryPath();
    }
    if (current.documentUuid === undefined) {
      await libraryIdentity();
      current = await inspect();
      if (current.projectUuid !== target.projectUuid) fail("project-changed-before-document");
      if (current.documentUuid === undefined) {
        if([3,4].includes(target.documentType))assertPcbNavigationPreferences();
        const tabId = target.documentType === 2 ? await nativeCall('native-open-library', () => libraryApi.openInEditor(target.documentUuid,target.projectUuid)) : library ?
          await nativeCall('native-open-library', () => editor.openLibraryDocument(target.projectUuid,String(target.documentType),target.documentUuid)) :
          await nativeCall('native-open-document', () => editor.openDocument(target.documentUuid));
        openedDocument = true;
        if (typeof tabId !== "string" || tabId.length === 0 || tabId.length > 256) fail("open-document-result");
        // Native isOpenTab can return false while the opened target is already
        // selected. Its boolean alone neither proves nor disproves the effect.
        if([3,4].includes(target.documentType))assertPcbNavigationPreferences();
        const activated = await nativeCall('native-activate-document', () => editor.activateDocument(tabId));
        if (typeof activated !== "boolean") fail("activate-result");
        current = await inspectActivated(tabId);
      }
    }
    current = await inspect();
    await registryPath();
    await libraryIdentity();
    current = await inspect();
    if (current.projectUuid !== target.projectUuid || current.documentUuid !== target.documentUuid ||
        typeof current.tabId !== "string" || current.tabId.length === 0 || current.tabId.length > 256) fail("target-readback");
    await observeEditorReadiness(current.tabId);
    return { ok: true, schema: ${JSON.stringify(PROFILE)}, openedProject, openedDocument,
      project: { uuid: target.projectUuid, path: target.projectPath },
      document: { uuid: target.documentUuid, documentType: target.documentType, tabId: current.tabId } };
    } catch (error) { throw classifiedError(error, 'native-unexpected'); }
  })();`;
}
