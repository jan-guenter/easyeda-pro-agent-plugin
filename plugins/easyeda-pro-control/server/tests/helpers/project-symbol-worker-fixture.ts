import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import { buildWorkerBoundProjectSymbolMetadataExpression } from "../../src/project-symbol-metadata.ts";
import type { ProjectSymbolMetadataPlan } from "../../src/project-symbol-metadata.ts";

export type Bag = Record<string, unknown>;
export const expectedActor = { uuid: "a".repeat(32), username: "synthetic", nickname: "Synthetic" };
export const plan: ProjectSymbolMetadataPlan = { profile: "easyeda-pro-control.project-symbol-metadata.v1", projectUuid: "1".repeat(64), branchUuid: "2".repeat(32), ownerUuid: "3".repeat(32), targetUuid: "4".repeat(32),
  beforeProjectSha256: "a".repeat(64), beforeTitle: "Original", beforeDescription: "", beforeTags: [], beforeSource: "", peerTitles: [],
  desiredTitle: "Renamed", desiredDescription: "New description", headerEditVersion: "3.0" };
export const context = { project: { uuid: plan.projectUuid, path: "/synthetic/project.eprj2" }, document: { uuid: "5".repeat(32), documentType: 3, tabId: `${"5".repeat(32)}@${plan.projectUuid}` } };
export const expectedWorker = { projectUuid: plan.projectUuid, client: "b".repeat(16), maxTicket: 100, notBeforeMs: 1_800_000_000_000, notAfterMs: 1_800_000_060_000 };
interface Call { name: string; receiver: unknown; args: unknown[] }
export interface Fixture { host: Bag; startup: Bag; cached: Bag; cookies: Bag; sandbox: Bag; eda: Bag; tabs: Bag; metadata: Bag; calls: Call[]; updates: number; clockMs: number; client: string; ticket: number;
  rejectAt?: number;
  onCall?: (entry: Call, index: number) => void; afterResolve?: (entry: Call, index: number) => void;
  run: (source?: string) => Promise<unknown> }
export function fixture(): Fixture {
  const cached = { ...expectedActor }, calls: Call[] = [], metadata: Bag = { uuid: plan.targetUuid, project_uuid: plan.projectUuid, owner: { uuid: plan.ownerUuid },
    docType: 2, display_title: plan.beforeTitle, description: plan.beforeDescription, source: "", custom_tags: "[]" }, startup = { ...expectedActor };
  const cookies = { userInfo: cached };
  const host: Bag = { globalVariableCookieData: cookies, loginedUserInfo: startup,
    currentProject: { projectId: plan.projectUuid, branchUuid: plan.branchUuid, isV2Format: false }, isHistoryMode: false, urlCmd: null, sessionStorageTabs: new Set() };
  const peer = { tabId: context.document.tabId, documentType: 3, parentProjectUuid: plan.projectUuid, data: { doctype: 3, pid: plan.projectUuid } };
  const tabs: Bag = { isOpenProjectDoc: true, isOpenOtherDoc: true, getFilterTabs: (): unknown[] => [peer], getActiveTab: (): string => context.document.tabId,
    hasTabUnSaved: (): boolean => false, isTabUnSaved: (): boolean => false };
  const sandbox: Bag = { gVars: host, Object, Array, Set, Reflect, TextEncoder, PRO_EDITOR_VERSION: "3.0",
    PRO_EDITOR_MODE: "CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM",
    location: { href: "https://client/editor?cll=warn#", origin: "https://client" }, document: { nodeType: 9, URL: "https://client/editor?cll=warn#" },
    UI: { gVars: host, tabBar: tabs, concurrentDesign: { _isConcurrentStrictMode: false, isConcurrentStrictMode: false, getIframeDisableStatusPanelPcb: (): Bag => ({ disable: false }) } } };
  const eda: Bag = {};
  const state: Fixture = { host, startup, cached, cookies, sandbox, eda, tabs, metadata, calls, updates: 0, clockMs: expectedWorker.notBeforeMs + 1000, client: expectedWorker.client, ticket: expectedWorker.maxTicket,
    async run(source = buildWorkerBoundProjectSymbolMetadataExpression(plan, context, expectedActor, expectedWorker)): Promise<unknown> {
      sandbox["sdkArgument"] = eda;
      const result: unknown = runInNewContext(`globalThis.top=globalThis;globalThis.window=globalThis;globalThis.document.defaultView=globalThis;(async(eda)=>{return await ${source};})(globalThis.sdkArgument)`,
        sandbox, { timeout: 1000 }); return await result;
    } };
  sandbox["Date"] = class SyntheticDate extends Date { public static override now(): number { return state.clockMs; } };
  function reply(name: string, receiver: unknown, args: unknown[], value: unknown): Promise<unknown> {
    const entry = { name, receiver, args }; calls.push(entry); const index = calls.length; state.onCall?.(entry, index);
    // Two queued microtasks model drift after the native await's guard runs
    // But before the enclosing continuation starts its next guarded call.
    const result = index === state.rejectAt ? Promise.reject(new Error("synthetic native rejection")) : Promise.resolve(value);
    if (state.afterResolve !== undefined) { queueMicrotask(() => { queueMicrotask(() => state.afterResolve?.(entry, index)); }); }
    return result;
  }
  eda["dmt_Project"] = { getCurrentProjectInfo(this: unknown): unknown { return reply("project", this, [], context.project); } };
  eda["dmt_SelectControl"] = { getCurrentDocumentInfo(this: unknown): unknown { return reply("document", this, [], context.document); } };
  eda["dmt_EditorControl"] = { getSplitScreenTree(this: unknown): unknown { return reply("tree", this, [], { tabs: [peer] }); } };
  eda["lib_Symbol"] = { modify(): never { throw new Error("public modifier forbidden"); } };
  host["messageBus"] = { rpcCall(this: unknown, topic: string, args: unknown[]): unknown {
    let value: unknown;
    if (topic === "canAddLib") { value = { hasPermission: true }; }
    else if (topic === "/PrjDB/project/getData") { value = { uuid: plan.projectUuid, owner: { uuid: plan.ownerUuid }, currentBranch: plan.branchUuid, isV2Format: false }; }
    else if (topic === "/PrjDB/project/getClient") { value = state.client; }
    else if (topic === "/PrjDB/project/getMaxTicket") { value = state.ticket; }
    else {
      if (topic === "/PrjDB/symbol/updateData") { state.updates += 1; metadata["display_title"] = plan.desiredTitle; metadata["description"] = plan.desiredDescription; }
      else { assert.equal(topic, "/PrjDB/symbol/getData"); }
      value = structuredClone(metadata);
    }
    return reply(topic, this, args, { message: value });
  } };
  return state;
}
