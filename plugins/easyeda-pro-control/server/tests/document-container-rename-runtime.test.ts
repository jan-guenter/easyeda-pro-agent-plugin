import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import type { ExpectedContext } from "../src/engine.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "../src/native-history.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { prepareDocumentContainerRename } from "../src/document-container-rename.ts";
import { buildDocumentContainerRenameExpression, buildDocumentContainerRenameReadbackExpression, validateDocumentContainerRenameReadback } from "../src/document-container-rename-runtime.ts";

type Value = Record<string, unknown>;
type Kind = "pcb" | "schematic";
class DomNode {
  public readonly children: DomNode[];
  public readonly attributes: Record<string, string>;
  public readonly tagName: string;
  public constructor(tagName: string, attributes: Record<string, string> = {}, children: DomNode[] = []) { this.tagName = tagName; this.attributes = attributes; this.children = children; }
  public get id(): string { return this.attributes["id"] ?? ""; }
  public get classList(): { contains: (name: string) => boolean } { return { contains: (name): boolean => (this.attributes["class"] ?? "").split(" ").includes(name) }; }
  public getAttribute(name: string): string | null { return this.attributes[name] ?? null; }
  public hasAttribute(name: string): boolean { return Object.hasOwn(this.attributes, name); }
  public contains(node: DomNode): boolean { return this === node || this.children.some((child) => child.contains(node)); }
  private matches(selector: string): boolean {
    if (selector.startsWith("#")) { return this.id === selector.slice(1); }
    if (selector.startsWith(".")) { return this.classList.contains(selector.slice(1)); }
    if (selector === "iframe") { return this.tagName === "IFRAME"; }
    if (selector === "[id^=\"frame_\"]") { return this.id.startsWith("frame_"); }
    if (selector === "iframe[src*=\"entry=\"]") { return this.tagName === "IFRAME" && (this.attributes["src"] ?? "").includes("entry="); }
    if (selector === "[c_doctype]" || selector === "[c_dbid]") { return this.hasAttribute(selector.slice(1, -1)); }
    throw new Error("The test DOM only models the fixed selector inventory.");
  }
  public querySelectorAll(selector: string): DomNode[] {
    const all: DomNode[] = [];
    for (const child of this.children) { if (selector.split(",").some((part) => child.matches(part))) { all.push(child); } all.push(...child.querySelectorAll(selector)); }
    return all;
  }
}
function dom(fault?: string): DomNode {
  const frame = new DomNode("IFRAME", { id: "frame_active@project", class: "editframe un_ruler", c_dbid: "active@project", c_doctype: "3", src: "editor?entry=pcb", "pcb-canvas": "true" });
  const body = new DomNode("DIV", { uuid: "active@project", class: "tabbar-panel ruler-theme" }, [new DomNode("DIV", { class: "top_tab_tips" }), frame, new DomNode("DIV", { class: "bottom-layer-bar" })]);
  const root = new DomNode("DIV", { id: "tabbar_bodies" }, [...["commandWin", "exitSmartSizeTool", "exitPadShapeTool", "project-blank-page", "assembly-variant-page"].map((id) => new DomNode("DIV", { id })), body]);
  const document = new DomNode("DOCUMENT", {}, [root, new DomNode("DIV", { id: "tab_page1" })]);
  if (fault === "duplicate-root") { document.children.push(new DomNode("DIV", { id: "tabbar_bodies" })); }
  if (fault === "duplicate-body") { root.children.push(body); }
  if (fault === "outside-root") { document.children.push(new DomNode("DIV", { class: "editframe", c_dbid: "page@project" })); }
  if (fault === "anonymous-export") { root.children.push(new DomNode("DIV", {}, [new DomNode("IFRAME", { class: "editframe", id: "frame_export_target" })])); }
  if (fault === "marker-free-export") { body.children.push(new DomNode("DIV", {}, [new DomNode("IFRAME")])); }
  if (fault === "schematic-orphan") { root.children.push(new DomNode("DIV", { uuid: "page@project" }, [new DomNode("DIV", { class: "editframe", c_dbid: "page@project" })])); }
  if (fault === "panel-pool") { root.children.push(new DomNode("DIV", { uuid: "sheet-1", class: "tabbar-panel ruler-theme blankIframeDiv" }, [new DomNode("IFRAME", { id: "frame_sheet-1", class: "editframe", c_dbid: "sheet-1", c_doctype: "26", blankIframe: "panel", src: "editor?entry=panel" })])); }
  if (fault === "static-frame") { const first = root.children[0]; assert.ok(first); first.children.push(new DomNode("IFRAME")); }
  if (fault === "unknown-static") { const first = root.children[0]; assert.ok(first); first.attributes["id"] = "unknown"; }
  if (fault === "missing-canvas") { delete frame.attributes["pcb-canvas"]; }
  if (fault === "from-file") { frame.attributes["fromFile"] = "true"; }
  if (fault === "json-cache") { frame.attributes["jsonCacheReady"] = "true"; }
  if (fault === "wrong-id") { frame.attributes["c_dbid"] = "target@project"; }
  if (fault === "wrong-src") { frame.attributes["src"] = "editor?entry=panel"; }
  return document;
}
const CONTEXT: ExpectedContext = { project: { uuid: "project", path: "/fixture/project.eprj2" }, document: { uuid: "active", documentType: 3,
  tabId: "active@project", parentProjectUuid: "project" } };
function history(): NativeHistorySnapshot {
  const entries = [["active", "PCB", { title: "Active", source: "", parent: "", board: "", zIndex: null }],
    ["target", "PCB", { title: "Before", source: "", parent: "", board: "", zIndex: null }],
    ["schematic", "SCH", { title: "Before", source: "", board: "", zIndex: null }],
    ["page", "SCH_PAGE", { title: "Page", schematic: "schematic", source: "", zIndex: 1 }]] as const;
  const documents: NativeDocumentSnapshot[] = entries.map(([uuid, docType, body]) => {
    const metadata = { uuid, docType, client: "a".repeat(16), updateTime: 1, version: "1", editVersion: "3.2" };
    const records = [{ id: "META", type: "META", ticket: 1, client: null, body }];
    return { uuid, docType, metadata, records, semanticSha256: sha256Json({ uuid, docType, metadata, records: records.map(({ id, type, body: value }) => ({ id, type, body: value })) }) };
  });
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "project", projectOwnerUuid: "owner", branchUuid: "branch", headHistoryUuid: "head",
    checkpointSha256: "a".repeat(64), historyRowCount: 1, chunkCount: 1, plaintextBytes: 1, documents,
    semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}
interface FixtureOptions {
  readonly kind?: Kind; readonly fault?: string; readonly faultAt?: string; readonly acknowledgment?: boolean;
  readonly replaceAt?: number; readonly replacement?: "host" | "ui" | "tabs" | "permission" | "bus" | "editor-top" | "project-api" | "select-api" | "editor-api" | "document";
  readonly deferredWriterSwitch?: boolean; readonly tree?: unknown; readonly placeholder?: Value;
  readonly frameFault?: string;
  readonly queuedFinalFault?: "frame" | "dirty" | "project"; readonly throwValue?: unknown;
}
function fixture(options: FixtureOptions = {}): { readonly run: () => Promise<unknown>; readonly readback: () => Promise<unknown>; readonly calls: string[]; readonly writes: () => number; readonly boundaries: () => number } {
  const kind = options.kind ?? "pcb", targetUuid = kind === "pcb" ? "target" : "schematic";
  const plan = prepareDocumentContainerRename({ id: "rename", action: `document.${kind}.rename`, target: { uuid: targetUuid }, name: "After" }, history(), CONTEXT);
  const calls: string[] = [], frameDocument = dom(options.frameFault), raw: Value[] = [{ tabId: "active@project", data: { doctype: 3, pid: "project" }, isUnSaved: false }];
  if (options.placeholder !== undefined) { raw.push(options.placeholder); }
  let boundaries = 0, current = structuredClone(CONTEXT.document), dirty = false, title = "Before", writes = 0;
  const permission = { isConcurrentStrictMode: false, getIframeDisableStatusPanelPcb: (): { disable: boolean } => ({ disable: options.fault === "read-only" }) };
  const value = (): Value => ({ uuid: targetUuid, project_uuid: "project", source: "", board: "", ...(kind === "pcb" ? { docType: 3, parent_uuid: "", display_title: title } : { display_name: title }), ...(options.fault === "metadata" ? { source: "inherited" } : {}) });
  const host = { isHistoryMode: false, currentProject: { projectId: "project", branchUuid: "branch", isV2Format: false }, messageBus: { rpcCall: (topic: string, args: unknown): Promise<unknown> => {
    calls.push(topic); fault(topic);
    if (options.faultAt === topic && Object.hasOwn(options, "throwValue")) { throw options.throwValue; }
    if (topic === `/PrjDB/${kind}/updateData`) {
      assert.deepEqual(args, [{ uuid: targetUuid, [kind === "pcb" ? "title" : "name"]: "After" }, "project"]); writes += 1;
      return Promise.resolve().then(() => { title = "After"; fault("rename"); if (options.deferredWriterSwitch === true) { host.currentProject.projectId = "foreign"; }
        return complete({ message: { success: options.acknowledgment ?? true, result: value() } }); });
    }
    if (topic === `/PrjDB/${kind}/getData`) { return complete({ message: value() }); }
    assert.equal(topic, "/PrjDB/project/getData");
    return complete({ message: { uuid: "project", owner: { uuid: options.fault === "owner" ? "other" : "owner" }, currentBranch: "branch", isV2Format: false } });
  } } };
  function fault(point: string): void {
    if (options.faultAt !== point) { return; }
    if (options.fault === "context") { current = { ...current, uuid: "foreign" }; }
    if (options.fault === "project") { host.currentProject.projectId = "foreign"; }
    if (options.fault === "branch") { host.currentProject.branchUuid = "foreign"; }
    if (options.fault === "history") { host.isHistoryMode = true; }
    if (options.fault === "format") { host.currentProject.isV2Format = true; }
    if (options.fault === "concurrent") { permission.isConcurrentStrictMode = true; }
    if (options.fault === "dirty") { dirty = true; }
    if (options.fault === "target-open") { raw.push({ tabId: `${targetUuid}@project`, data: { doctype: 3, pid: "project" } }); }
  }
  const eda = {
    dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => { calls.push("project"); return complete(CONTEXT.project); } },
    dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => { calls.push("document"); fault("document");
      if (options.queuedFinalFault !== undefined && calls.filter((call) => call === "document").length === 4) {
        queueMicrotask(() => { queueMicrotask(() => {
          if (options.queuedFinalFault === "frame") { frameDocument.children.push(new DomNode("DIV", { class: "editframe", c_dbid: "target@project" })); }
          if (options.queuedFinalFault === "dirty") { dirty = true; }
          if (options.queuedFinalFault === "project") { host.currentProject.projectId = "foreign"; }
        }); });
      }
      return complete(current); } },
    dmt_EditorControl: { getSplitScreenTree: (): Promise<unknown> => { calls.push("tree"); fault("tree"); return complete(options.tree ?? { tabs: [{ tabId: "active@project", documentType: 3, parentProjectUuid: "project" }] }); } },
  };
  const native = { PRO_EDITOR_VERSION: "3.2", document: frameDocument, gVars: host, UI: { concurrentDesign: permission, tabBar: { getFilterTabs: (): Value[] => raw,
    getActiveTab: (): string => "active@project", hasTabUnSaved: (): boolean => dirty, isTabUnSaved: (): boolean => dirty } } };
  async function complete(result: unknown): Promise<unknown> {
    await Promise.resolve(); boundaries += 1;
    if (boundaries === options.replaceAt) {
      const replacements = { host: (): void => { native.gVars = { ...host }; }, ui: (): void => { native.UI = { ...native.UI }; },
        tabs: (): void => { native.UI.tabBar = { ...native.UI.tabBar }; }, permission: (): void => { native.UI.concurrentDesign = { ...permission }; },
        bus: (): void => { host.messageBus = { ...host.messageBus }; }, "editor-top": (): void => { Reflect.set(native, "EDITOR_TOP", { gVars: host }); },
        document: (): void => { native.document = dom(); },
        "project-api": (): void => { eda.dmt_Project = { ...eda.dmt_Project }; }, "select-api": (): void => { eda.dmt_SelectControl = { ...eda.dmt_SelectControl }; }, "editor-api": (): void => { eda.dmt_EditorControl = { ...eda.dmt_EditorControl }; } };
      assert.ok(options.replacement); replacements[options.replacement]();
    }
    return result;
  }
  const run = (readback: boolean): Promise<unknown> => {
    // oxlint-disable-next-line typescript/no-implied-eval, no-new-func -- Execute only the fixed compiler program against isolated native doubles.
    const execute = new Function("eda", "globalThis", `return ${readback ? buildDocumentContainerRenameReadbackExpression(plan, CONTEXT) : buildDocumentContainerRenameExpression(plan, CONTEXT)};`);
    // oxlint-disable-next-line typescript/no-unsafe-call -- Keep generated output unknown until exact envelope validation.
    const result: unknown = execute(eda, native); return Promise.resolve(result);
  };
  return { calls, writes: (): number => writes, boundaries: (): number => boundaries, run: (): Promise<unknown> => run(false), readback: (): Promise<unknown> => run(true) };
}
for (const kind of ["pcb", "schematic"] as const) {
  void test(`${kind} rename dispatches one project-qualified writer then a separate read-only readback`, async () => {
    const targetUuid = kind === "pcb" ? "target" : "schematic", value = fixture({ kind });
    assert.deepEqual(decodeExactReadEnvelope(await value.run()), { kind: "project-document-rename", targetId: targetUuid, createdId: null });
    assert.equal(value.calls.at(-1), `/PrjDB/${kind}/updateData`); assert.equal(value.writes(), 1);
    const plan = prepareDocumentContainerRename({ id: "rename", action: `document.${kind}.rename`, target: { uuid: targetUuid }, name: "After" }, history(), CONTEXT);
    const readback = decodeExactReadEnvelope(await value.readback());
    assert.equal(validateDocumentContainerRenameReadback(readback, plan)["childrenClosed"], true);
    assert.equal(value.writes(), 1); assert.equal(buildDocumentContainerRenameReadbackExpression(plan, CONTEXT).includes("/updateData"), false);
    assert.equal(/\b(?:save|Save|openDocument|modifyPcbName|modifySchematicName)\(/u.test(buildDocumentContainerRenameExpression(plan, CONTEXT)), false);
  });
}
void test("document rename rejects replaced receivers at every awaited pre-write boundary", async () => {
  const baseline = fixture(); await baseline.run();
  for (const replacement of ["host", "ui", "tabs", "permission", "bus", "editor-top", "project-api", "select-api", "editor-api", "document"] as const) {
    for (let replaceAt = 1; replaceAt < baseline.boundaries(); replaceAt += 1) {
      const value = fixture({ replacement, replaceAt }); await assert.rejects(value.run(), /:CONTEXT$/u); assert.equal(value.writes(), 0);
    }
  }
});
void test("post-write readback rejects receiver replacement without replaying the writer", async () => {
  const baseline = fixture(); await baseline.run(); const start = baseline.boundaries(); await baseline.readback();
  for (const replacement of ["host", "ui", "tabs", "permission", "bus", "editor-top", "project-api", "select-api", "editor-api", "document"] as const) {
    for (let replaceAt = start + 1; replaceAt <= baseline.boundaries(); replaceAt += 1) {
      const value = fixture({ replacement, replaceAt }); await value.run(); await assert.rejects(value.readback(), /:CONTEXT$/u); assert.equal(value.writes(), 1);
    }
  }
});
void test("the final synchronous proof refuses a queued orphan frame, dirty state or project switch", async () => {
  for (const queuedFinalFault of ["frame", "dirty", "project"] as const) {
    const value = fixture({ queuedFinalFault }); await assert.rejects(value.run(), /refused/u); assert.equal(value.writes(), 0);
  }
});
void test("caught RPC exceptions expose only static codes without invoking error-message getters", async () => {
  let getterReads = 0;
  const accessor = Object.defineProperty({}, "message", { get: (): string => { getterReads += 1; return "private fixture detail"; } });
  for (const throwValue of [new Error("private fixture detail"), accessor, null, undefined]) {
    const value = fixture({ faultAt: "/PrjDB/pcb/getData", throwValue });
    await assert.rejects(value.run(), { message: "Closed document rename refused at before-read:EXCEPTION" }); assert.equal(value.writes(), 0);
  }
  assert.equal(getterReads, 0);
});
void test("document rename excludes hidden child canvases, extra panes, cyclic and incomplete trees", async () => {
  const active = { tabId: "active@project", documentType: 3, parentProjectUuid: "project" }, cycle: Value = {}; cycle["children"] = [cycle];
  for (const tree of [{ tabs: [active, { tabId: "page@project", documentType: 1, parentProjectUuid: "project" }] },
    { children: [{ tabs: [active] }, { tabs: [{ tabId: "foreign@project", documentType: 3, parentProjectUuid: "project" }] }] },
    { tabs: [active, active] }, { tabs: [] }, { children: [] }, { tabs: [active], children: [{}] }, cycle]) {
    const value = fixture({ kind: "schematic", tree }); await assert.rejects(value.run(), /refused/u); assert.equal(value.writes(), 0);
  }
});
void test("actual DOM inventory refuses tabless orphan, schematic, export and pooled-panel editors", async () => {
  for (const frameFault of ["duplicate-root", "duplicate-body", "outside-root", "anonymous-export", "marker-free-export", "schematic-orphan", "panel-pool", "static-frame", "unknown-static", "missing-canvas", "from-file", "json-cache", "wrong-id", "wrong-src"]) {
    const value = fixture({ kind: "schematic", frameFault }); await assert.rejects(value.run(), /EDITOR_FRAME_STATE/u); assert.equal(value.writes(), 0);
  }
});
void test("invalid acknowledgment and post-write drift preserve a single dispatch without pretending success", async () => {
  const invalid = fixture({ acknowledgment: false }); await assert.rejects(invalid.run(), /ACK_INVALID/u); assert.equal(invalid.writes(), 1);
  const switched = fixture({ deferredWriterSwitch: true }); await switched.run(); await assert.rejects(switched.readback(), /PROJECT_DRIFT/u); assert.equal(switched.writes(), 1);
  const dirty = fixture({ fault: "dirty", faultAt: "rename" }); await dirty.run(); await assert.rejects(dirty.readback(), /DIRTY_TABS/u); assert.equal(dirty.writes(), 1);
});
for (const point of ["/PrjDB/pcb/getData", "/PrjDB/project/getData", "tree", "document"]) {
  for (const fault of ["context", "project", "branch", "history", "format", "concurrent", "dirty", "target-open"]) {
    void test(`document rename refuses ${fault} after ${point} before dispatch`, async () => {
      const value = fixture({ fault, faultAt: point }); await assert.rejects(value.run(), /refused/u); assert.equal(value.writes(), 0);
    });
  }
}
