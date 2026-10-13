import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";

interface State {
  source: string;
  activeTab: string;
  identityTab: string;
  acknowledgment: unknown;
  writes: string[];
  onIdentityReply?: () => void;
  onSourceReply?: () => void;
  onDecode?: () => void;
}

// oxlint-disable-next-line typescript/explicit-function-return-type, typescript/explicit-module-boundary-types -- Keep the independently mutable nested synthetic host graph precisely inferred for receiver substitution tests; no live host or caller program is admitted.
export function pcbExactFrameFixture(documentUuid: string, source: string, projectUuid = "a".repeat(64)) {
  const branchUuid = "b".repeat(32), tabId = `${documentUuid}@${projectUuid}`;
  const state: State = { source, activeTab: tabId, identityTab: tabId, acknowledgment: true, writes: [] };
  const channel = { rpcCall: function rpcCall(this: unknown, topic: string, value: unknown): Promise<{ message: unknown }> {
    assert.equal(this, channel, "Keep the exact captured receiver");
    if (topic === "getTabIdAndDocType") { return Promise.resolve().then(() => { state.onIdentityReply?.(); return { message: { tabId: state.identityTab, docType: 3 } }; }); }
    if (topic === "FileSource") {
      const retained = state.source;
      return Promise.resolve().then(() => { state.onSourceReply?.(); return { message: retained }; });
    }
    assert.equal(topic, "pcb/decode");
    assert.equal(typeof value, "string");
    state.writes.push(String(value)); state.source = String(value); state.onDecode?.();
    return Promise.resolve({ message: state.acknowledgment });
  } };
  const attributes = new Map<string, string>([["c_dbid", tabId], ["c_doctype", "3"], ["src", "editor?entry=pcb"], ["pcb-canvas", "true"]]);
  const frames: unknown[] = [];
  const document = { querySelectorAll: (_selector: string): unknown[] => frames };
  const frame = { tagName: "IFRAME", id: `frame_${tabId}`, ownerDocument: document, isConnected: true,
    contentWindow: { MSG_BUS_PCB: { messageBus: channel } }, classList: { contains: (name: string): boolean => name === "editframe" },
    getAttribute: (name: string): string | null => attributes.get(name) ?? null, hasAttribute: (name: string): boolean => attributes.has(name),
    parentElement: { getAttribute: (name: string): string | null => name === "uuid" ? tabId : null } };
  frames.push(frame);
  const host = { currentProject: { projectId: projectUuid, branchUuid, isV2Format: false }, isHistoryMode: false };
  const tabs = { getActiveTab: (): string => state.activeTab, getTabById: (): unknown => ({ tabId, data: { doctype: 3, pid: projectUuid } }), getTabIframeSync: (): typeof frame => frame };
  const permission = { isConcurrentStrictMode: false, getIframeDisableStatusPanelPcb: (): unknown => ({ disable: false }) };
  const runtime = { gVars: host, UI: { tabBar: tabs, concurrentDesign: permission }, document,
    EXPECTED_PROJECT_UUID: projectUuid, EXPECTED_PCB_PROJECT_UUID: projectUuid, EXPECTED_PCB_BRANCH_UUID: branchUuid,
    EXPECTED_DOCUMENT_UUID: documentUuid, EXPECTED_DOCUMENT_TYPE: 3, EXPECTED_TAB_ID: tabId,
    eda: { sys_FileManager: { getDocumentSource: (): never => assert.fail("Do not select a mutable current-tab source"), setDocumentSource: (): never => assert.fail("Do not use the mutable current-tab setter") } } };
  const run = async (code: string, globals: Record<string, unknown> = runtime): Promise<unknown> => {
    const result: unknown = runInNewContext(`(async()=>{${code}})()`, globals);
    return await result;
  };
  return { attributes, channel, document, frame, frames, host, permission, runtime, state, tabs, tabId, run };
}
