import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { NATIVE_RULE_REPORT_PROFILE, buildNativePcbDrcReadExpression, buildNativeRuleSnapshotReadExpression, buildNativeSchematicErcReadExpression, nativeRuleSnapshotSchema, verifyNativeRuleReport } from "../src/native-rule-report.ts";

const binding = { documentUuid: "sheet", tabId: "tab", projectUuid: "project" };
const leaf = { globalIndex: "error-id", errorType: "Physical Error", errorObjType: "Track", objs: ["line-id"], explanation: { str: "Width is {width}", param: { width: 3 } }, visible: false };
const pcbEvidence = { profile: NATIVE_RULE_REPORT_PROFILE, kind: "pcb-drc", document: binding, sourceBefore: "source", sourceAfter: "source", policyBefore: {}, policyAfter: {}, nativeReport: [{ name: "Physical Error", list: [{ name: "Track", list: [leaf] }] }], nativeCounts: null, execution: { source: "native-pcb-verbose", completed: true, actionSucceeded: null, groupStarted: 0, groupEnded: 0 } };

void test("itemized PCB reports retain invisible native leaves and reject aggregate substitutions and drift", () => {
  const report = verifyNativeRuleReport(pcbEvidence, binding);
  assert.equal(report.counts.error, 1);
  assert.deepEqual(report.items[0]?.native, leaf);
  assert.equal(report.zeroReportedViolations, false);
  assert.throws(() => verifyNativeRuleReport({ ...pcbEvidence, nativeReport: [{ name: "Physical Error", list: [{ count: 2 }] }] }, binding), /Aggregate-only/u);
  assert.throws(() => verifyNativeRuleReport({ ...pcbEvidence, sourceAfter: "changed" }, binding), /changed/u);
  assert.throws(() => verifyNativeRuleReport({ ...pcbEvidence, policyAfter: { changed: true } }, binding), /changed/u);
});

void test("PCB fixed call binds native source and project with no aggregate normalization", async () => {
  const text = '{"type":"DOCHEAD"}||{"uuid":"sheet","docType":"PCB","client":"volatile","updateTime":1,"version":"1"}|\n{"id":"line","type":"LINE"}||{"x":1}|\n';
  let called = 0;
  const value: unknown = runInNewContext(buildNativePcbDrcReadExpression(binding), { eda: {
    dmt_SelectControl: { getCurrentDocumentInfo: () => Promise.resolve({ documentType: 3, uuid: "sheet", tabId: "tab", parentProjectUuid: "project" }) },
    sys_FileManager: { getDocumentSource: () => Promise.resolve(text) },
    pcb_Drc: { getCurrentRuleConfiguration: () => Promise.resolve({ name: "test", config: {} }), check: (strict: boolean, ui: boolean, verbose: boolean) => { called += 1; assert.deepEqual([strict, ui, verbose], [true, false, true]); return Promise.resolve(pcbEvidence.nativeReport); } },
  } });
  assert.equal(verifyNativeRuleReport(await value, binding).items.length, 1);
  assert.equal(called, 1);
});

void test("SCH report requires successful action, exact counters, source invariance and owned-listener cleanup", async () => {
  type Observer = (value: unknown) => void;
  interface EventHandle { dispose: () => void; }
  for (const succeeds of [true, false]) {
    const listeners = new Map<string, { observer: Observer; active: boolean }[]>();
    const events = new Map<string, Set<Observer>>();
    const subscribeEvent = (key: string, observer: Observer): EventHandle => {
      const set = events.get(key) ?? new Set<Observer>(); set.add(observer); events.set(key, set);
      return { dispose: () => { set.delete(observer); } };
    };
    const publish = (key: string, value: unknown): void => { for (const entry of listeners.get(key) ?? []) {if (entry.active) {entry.observer(value);}} };
    const document = { uuid: "sheet", tabId: "tab", isSchSheetDoc: (): boolean => true, consistencyImpl: { getSourceCode: (): string => '{"id":"c1","type":"COMPONENT"}||{"x":1}|\n' } };
    const bus = {
      subscribe: (key: string, observer: Observer): { cancel: () => void; running: () => boolean } => {
        const entry = { observer, active: true }, values = listeners.get(key) ?? []; values.push(entry); listeners.set(key, values);
        return { cancel: () => { entry.active = false; }, running: () => entry.active };
      },
      rpcCall: (name: string, ui: boolean): Promise<unknown> => {
        assert.equal(name, "checkERC"); assert.equal(ui, false);
        publish("bottomBarLogGroupStart", "schDrcLog");
        publish("bottomBarLog", { type: "info", tabType: "schDrcLog", msg: ["Start checking."] });
        for (const observer of events.get("will") ?? []) {observer({ name: "designRule actionRunner" });}
        publish("bottomBarLog", { type: "warn", tabType: "schDrcLog", msg: '<a data-id="pin">Floating pin</a>' });
        for (const observer of events.get("did") ?? []) {observer({ action: { name: "designRule actionRunner" }, success: succeeds });}
        publish("bottomBarLog", { type: "info", tabType: "schDrcLog", msg: ["Finish checking.", "One warning."] });
        publish("bottomBarLogGroupEnd", "schDrcLog");
        return Promise.resolve({ message: { fatalError: 0, error: 0, warn: 1, info: 0 } });
      },
    };
    const native = { gVars: { messageBus: bus, currentProject: { projectId: "project" }, designRule: { FLOATING: { enforce: true, level: 2 } } }, docMemoryManager: { getActiveDoc: (): typeof document => document, getSchDocs: (): (typeof document)[] => [document] }, app: { actionRunner: { running: false, currentAction: null, onWillRun: (observer: Observer): EventHandle => subscribeEvent("will", observer), onDidRun: (observer: Observer): EventHandle => subscribeEvent("did", observer) } } };
    const pending: unknown = runInNewContext(buildNativeSchematicErcReadExpression(binding), { SCH: native });
    if (succeeds) {
      const evidence: unknown = await pending;
      assert.equal(verifyNativeRuleReport(evidence, binding).counts.warn, 1);
      assert.equal(verifyNativeRuleReport(evidence, binding).items.length, 1);
    } else {await assert.rejects(Promise.resolve(pending), /FAILED_NATIVE_CHECK/u);}
    assert.ok([...listeners.values()].flat().every((entry) => !entry.active));
    assert.ok([...events.values()].every((set) => set.size === 0));
  }
});

void test("calculation-scope snapshot observes unsaved inactive schematic sheets without running a checker", async () => {
  const active = { uuid: "sheet", tabId: "tab", isSchSheetDoc: (): boolean => true, consistencyImpl: { getSourceCode: (): string => '{"id":"c1","type":"COMPONENT"}||{"x":1}|\n' } };
  let inactiveX = 2;
  const inactive = { ...active, uuid: "other-sheet", tabId: "other-tab", consistencyImpl: { getSourceCode: (): string => `{"id":"c2","type":"COMPONENT"}||{"x":${inactiveX}}|\n` } };
  const realm = { SCH: { gVars: { currentProject: { projectId: "project" }, designRule: { FLOATING: { enforce: true, level: 2 } } }, docMemoryManager: { getActiveDoc: (): typeof active => active, getSchDocs: (): (typeof active)[] => [active, inactive] } } };
  const read = async (): Promise<ReturnType<typeof nativeRuleSnapshotSchema.parse>> => nativeRuleSnapshotSchema.parse(await runInNewContext(buildNativeRuleSnapshotReadExpression("schematic-erc", binding), realm));
  const before = await read(); inactiveX = 3;
  const after = await read();
  assert.notEqual(after.source, before.source);
  assert.deepEqual(after.policy, before.policy);
  assert.deepEqual(after.document, binding);
});
