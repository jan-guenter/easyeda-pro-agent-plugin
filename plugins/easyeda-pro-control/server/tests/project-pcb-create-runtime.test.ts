import assert from "node:assert/strict";
import { test } from "node:test";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { nativeFailureCategory } from "../src/native-diagnostics.ts";
import { PCB_CREATE_NATIVE_GUARD_CODES } from "../src/metadata-native-diagnostics.ts";
import { prepareProjectPcbCreate } from "../src/project-pcb-create.ts";
import { buildProjectPcbCreateExpression, buildProjectPcbCreateReadbackExpression, validateProjectPcbCreateReadback } from "../src/project-pcb-create-runtime.ts";
import { PCB_CREATE_CONTEXT as CONTEXT, PCB_CREATE_ID as CREATED, PCB_CREATE_OPERATION as OPERATION, PcbCreateDomNode, pcbCreateDom, pcbCreateHistory } from "./project-pcb-create-fixture.ts";

type Value = Record<string, unknown>;
void test("closed PCB creation diagnostics expose only exact fixed stage and guard codes", () => {
  for (const stage of ["host", "before-read", "permission", "closed-target", "create", "after-read"]) {
    for (const code of PCB_CREATE_NATIVE_GUARD_CODES) {
      const message = `Closed free PCB creation refused at ${stage}:${code}`;
      assert.equal(nativeFailureCategory(message), `native-pcb-create:${stage}:${code}`);
      for (const suffix of [" private-design", "\n", "\0", ":SECRET"]) { assert.equal(nativeFailureCategory(message + suffix), null); }
    }
  }
  assert.equal(nativeFailureCategory("Closed free PCB creation refused at unknown:CONTEXT"), null);
  assert.equal(nativeFailureCategory("Closed free PCB creation refused at host:PRIVATE"), null);
});
interface Options {
  readonly frameFault?: string; readonly tree?: unknown; readonly denied?: boolean; readonly acknowledgment?: Value | null;
  readonly replaceAt?: number; readonly replacement?: "host" | "ui" | "tabs" | "permission" | "bus" | "editor-top" | "project-api" | "select-api" | "editor-api" | "document";
  readonly faultAt?: string; readonly fault?: "project" | "branch" | "context" | "dirty" | "history" | "format" | "concurrent" | "foreign-tab";
  readonly postWriteDrift?: boolean; readonly queuedFinalDrift?: boolean; readonly throwValue?: unknown;
}
function pcb(uuid: string, title: string): Value { return { uuid, project_uuid: "project", display_title: title, docType: 3, source: "", board: "", parent_uuid: "" }; }
function fixture(options: Options = {}): { readonly run: () => Promise<unknown>; readonly readback: () => Promise<unknown>; readonly calls: string[]; readonly writes: () => number; readonly boundaries: () => number } {
  const plan = prepareProjectPcbCreate(OPERATION, pcbCreateHistory(), CONTEXT);
  const calls: string[] = [];
  const frameDocument = pcbCreateDom(options.frameFault), raw: Value[] = [{ tabId: "active@project", data: { doctype: 3, pid: "project" }, isUnSaved: false }];
  let boundaries = 0, dirty = false, writes = 0;
  let current = structuredClone(CONTEXT.document);
  const permission = { isConcurrentStrictMode: false, getIframeDisableStatusPanelPcb: (): { disable: false } => ({ disable: false }) };
  const host = { isHistoryMode: false, currentProject: { projectId: "project", branchUuid: "branch", isV2Format: false }, messageBus: { rpcCall: (topic: string, args: unknown): Promise<unknown> => {
    calls.push(topic); fault(topic);
    if (topic === options.faultAt && Object.hasOwn(options, "throwValue")) { throw options.throwValue; }
    if (topic === "/PrjDB/pcb/addData") {
      assert.deepEqual(args, [{ title: "PCB8", board: "", parent_uuid: "" }, "project"]); writes += 1;
      if (options.postWriteDrift === true) { host.currentProject.projectId = "foreign"; }
      return complete({ message: Object.hasOwn(options, "acknowledgment") ? options.acknowledgment : pcb(CREATED, "PCB8") });
    }
    if (topic === "ui/hasDocCreatePermission") { assert.deepEqual(args, { projectId: "project", showMsg: false }); return complete({ message: options.denied !== true }); }
    assert.deepEqual(args, ["project"]);
    if (topic === "/PrjDB/project/getData") { return complete({ message: { uuid: "project", owner: { uuid: "owner" }, currentBranch: "branch", isV2Format: false } }); }
    assert.equal(topic, "/PrjDB/pcb/getAllKVDatas");
    return complete({ message: { active: pcb("active", "PCB1"), peer: pcb("peer", "PCB7"), ...(writes === 0 ? {} : { [CREATED]: pcb(CREATED, "PCB8") }) } });
  } } };
  function fault(point: string): void {
    if (point !== options.faultAt) { return; }
    if (options.fault === "project") { host.currentProject.projectId = "foreign"; }
    if (options.fault === "branch") { host.currentProject.branchUuid = "foreign"; }
    if (options.fault === "context") { current = { ...current, uuid: "foreign" }; }
    if (options.fault === "dirty") { dirty = true; }
    if (options.fault === "history") { host.isHistoryMode = true; }
    if (options.fault === "format") { host.currentProject.isV2Format = true; }
    if (options.fault === "concurrent") { permission.isConcurrentStrictMode = true; }
    if (options.fault === "foreign-tab") { raw.push({ tabId: "foreign@project", data: { doctype: 3, pid: "project" } }); }
  }
  const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => { calls.push("project"); return complete(CONTEXT.project); } },
    dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => { calls.push("document"); fault("document"); return complete(current); } },
    dmt_EditorControl: { getSplitScreenTree: (): Promise<unknown> => { calls.push("tree"); fault("tree");
      if (options.queuedFinalDrift === true) { queueMicrotask(() => { queueMicrotask(() => { frameDocument.children.push(new PcbCreateDomNode("DIV", { class: "editframe" })); }); }); }
      return complete(options.tree ?? { tabs: [{ tabId: "active@project", documentType: 3, parentProjectUuid: "project" }] }); } } };
  const native = { PRO_EDITOR_VERSION: "3.2", document: frameDocument, gVars: host, UI: { concurrentDesign: permission,
    tabBar: { getFilterTabs: (): Value[] => raw, getActiveTab: (): string => "active@project", hasTabUnSaved: (): boolean => dirty, isTabUnSaved: (): boolean => dirty } } };
  async function complete(value: unknown): Promise<unknown> {
    await Promise.resolve(); boundaries += 1;
    if (boundaries === options.replaceAt) {
      const replacements = { host: (): void => { native.gVars = { ...host }; }, ui: (): void => { native.UI = { ...native.UI }; },
        tabs: (): void => { native.UI.tabBar = { ...native.UI.tabBar }; }, permission: (): void => { native.UI.concurrentDesign = { ...permission }; },
        bus: (): void => { host.messageBus = { ...host.messageBus }; }, "editor-top": (): void => { Reflect.set(native, "EDITOR_TOP", { gVars: host }); },
        document: (): void => { native.document = pcbCreateDom(); }, "project-api": (): void => { eda.dmt_Project = { ...eda.dmt_Project }; },
        "select-api": (): void => { eda.dmt_SelectControl = { ...eda.dmt_SelectControl }; }, "editor-api": (): void => { eda.dmt_EditorControl = { ...eda.dmt_EditorControl }; } };
      assert.ok(options.replacement); replacements[options.replacement]();
    }
    return value;
  }
  const run = (readback: boolean): Promise<unknown> => {
    // oxlint-disable-next-line typescript/no-implied-eval, no-new-func -- Run only fixed compiler output against isolated native doubles.
    const execute = new Function("eda", "globalThis", `return ${readback ? buildProjectPcbCreateReadbackExpression(plan, CONTEXT, CREATED) : buildProjectPcbCreateExpression(plan, CONTEXT)};`);
    // oxlint-disable-next-line typescript/no-unsafe-call -- Generated output remains unknown until strict envelope validation.
    const result: unknown = execute(eda, native); return Promise.resolve(result);
  };
  return { run: (): Promise<unknown> => run(false), readback: (): Promise<unknown> => run(true), calls, writes: (): number => writes, boundaries: (): number => boundaries };
}
void test("free PCB creation calls only one exact project-qualified add and returns identity before any readback", async () => {
  const value = fixture();
  const plan = prepareProjectPcbCreate(OPERATION, pcbCreateHistory(), CONTEXT);
  assert.deepEqual(decodeExactReadEnvelope(await value.run()), { kind: "project-pcb-create", createdId: CREATED, targetId: CREATED });
  assert.equal(value.calls.at(-1), "/PrjDB/pcb/addData");
  const readback = decodeExactReadEnvelope(await value.readback());
  assert.equal(validateProjectPcbCreateReadback(readback, CREATED)["targetClosed"], true);
  assert.equal(value.writes(), 1);
  assert.equal(/(?:addData|createPcb|openDocument|deletePcb|save)\(/u.test(buildProjectPcbCreateReadbackExpression(plan, CONTEXT, CREATED)), false);
  assert.equal(/(?:createPcb|openDocument|deletePcb|save)\(/u.test(buildProjectPcbCreateExpression(plan, CONTEXT)), false);
  assert.throws(() => buildProjectPcbCreateReadbackExpression(plan, CONTEXT, "active"));
});
void test("all awaited pre-write and readback boundaries reject replaced native receivers", async () => {
  const baseline = fixture(); await baseline.run(); const writeBoundary = baseline.boundaries(); await baseline.readback();
  for (const replacement of ["host", "ui", "tabs", "permission", "bus", "editor-top", "document", "project-api", "select-api", "editor-api"] as const) {
    for (let replaceAt = 1; replaceAt < writeBoundary; replaceAt += 1) {
      const value = fixture({ replacement, replaceAt }); await assert.rejects(value.run(), /:CONTEXT$/u); assert.equal(value.writes(), 0);
    }
    for (let replaceAt = writeBoundary + 1; replaceAt <= baseline.boundaries(); replaceAt += 1) {
      const value = fixture({ replacement, replaceAt }); await value.run(); await assert.rejects(value.readback(), /:CONTEXT$/u); assert.equal(value.writes(), 1);
    }
  }
});
for (const faultAt of ["/PrjDB/project/getData", "/PrjDB/pcb/getAllKVDatas", "ui/hasDocCreatePermission", "tree", "document"]) {
  for (const fault of ["project", "branch", "context", "dirty", "history", "format", "concurrent", "foreign-tab"] as const) {
    void test(`PCB creation refuses ${fault} after ${faultAt} without native add`, async () => {
      const value = fixture({ faultAt, fault }); await assert.rejects(value.run()); assert.equal(value.writes(), 0);
    });
  }
}
void test("PCB creation retains the container DOM guard against hidden, pooled and orphan editors", async () => {
  for (const frameFault of ["duplicate-root", "duplicate-body", "outside-root", "anonymous-export", "marker-free-export", "schematic-orphan", "panel-pool", "static-frame", "unknown-static", "missing-canvas", "from-file", "json-cache", "wrong-id", "wrong-src"]) {
    const value = fixture({ frameFault }); await assert.rejects(value.run(), /EDITOR_FRAME_STATE/u); assert.equal(value.writes(), 0);
  }
  const queued = fixture({ queuedFinalDrift: true }); await assert.rejects(queued.run(), /EDITOR_FRAME_STATE/u); assert.equal(queued.writes(), 0);
  const active = { tabId: "active@project", documentType: 3, parentProjectUuid: "project" }, cycle: Value = {}; cycle["children"] = [cycle];
  for (const tree of [{ tabs: [active, active] }, { tabs: [] }, { children: [] }, cycle, { children: [{ tabs: [active] }, { tabs: [{ tabId: "hidden@project", documentType: 3, parentProjectUuid: "project" }] }] }]) {
    const value = fixture({ tree }); await assert.rejects(value.run()); assert.equal(value.writes(), 0);
  }
});
void test("denied permission, malformed acknowledgment and post-write drift do not cause retries", async () => {
  const denied = fixture({ denied: true }); await assert.rejects(denied.run(), /PROJECT_PERMISSION/u); assert.equal(denied.writes(), 0);
  for (const acknowledgment of [null, {}, { uuid: "active" }, { uuid: CREATED, project_uuid: "foreign" }]) {
    const value = fixture({ acknowledgment }); await assert.rejects(value.run(), /ACK_INVALID/u); assert.equal(value.writes(), 1);
  }
  const changed = fixture({ postWriteDrift: true }); await changed.run(); await assert.rejects(changed.readback(), /PROJECT_DRIFT/u); assert.equal(changed.writes(), 1);
});
void test("PCB native errors never expose foreign text or invoke error message accessors", async () => {
  let reads = 0;
  const accessor = Object.defineProperty({}, "message", { get: (): string => { reads += 1; return "private detail"; } });
  for (const throwValue of [accessor, new Error("private detail"), null, undefined]) {
    const value = fixture({ faultAt: "/PrjDB/project/getData", throwValue });
    await assert.rejects(value.run(), { message: "Closed free PCB creation refused at before-read:EXCEPTION" }); assert.equal(value.writes(), 0);
  }
  assert.equal(reads, 0);
});
