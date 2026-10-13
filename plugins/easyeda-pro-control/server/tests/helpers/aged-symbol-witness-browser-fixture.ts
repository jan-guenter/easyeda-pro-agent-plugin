import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import { buildAgedSymbolWitnessReadExpression } from "../../src/aged-symbol-witness.ts";


type Bag = Record<string, unknown>;
export const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), ownerUuid: "c".repeat(32), targetUuid: "f".repeat(32), activeUuid: "1".repeat(32), createdAtLiteral: "2026-10-12 01:00:00" };
export const controlScope = { createdAtLiteral: target.createdAtLiteral, referenceUtcMs: 1_800_000_000_000 };
const actorUuid = "c".repeat(32), client = "d".repeat(16), time = 1_800_000_000_000;
interface Call { args: unknown[]; receiver: unknown; kind: "project" | "clock" }
export interface Fixture {
  host: Bag; project: Bag; actor: Bag; startup: Bag; cookies: Bag; ui: Bag; tabs: Bag; tab: Bag; sandbox: Bag; calls: Call[];
  clears: number; onCall?: (call: Call, index: number) => unknown; fireTimeout: () => void; run: () => Promise<unknown>;
}

function SyntheticDate(input?: number | string): Date { return input === undefined ? new Date() : new Date(input); }
const dateMethods = ["getTime", "toISOString", "getTimezoneOffset", "getFullYear", "getMonth", "getDate", "getHours", "getMinutes", "getSeconds", "getMilliseconds"] as const;
Object.defineProperty(SyntheticDate, "prototype", { value: Object.fromEntries(dateMethods.map((name) => [name, Date.prototype[name]])) });
Object.defineProperty(SyntheticDate, "now", { value: (): number => Date.now(), configurable: true });

export function fixture(): Fixture {
  // oxlint-disable-next-line eslint/prefer-const -- RPC callbacks require the assembled circular fixture.
  let state: Fixture;
  const actor: Bag = { uuid: actorUuid, username: "synthetic-user", nickname: "Synthetic Name" }, calls: Call[] = [], cookies: Bag = { userInfo: actor }, startup: Bag = { ...actor };
  const project: Bag = { projectId: target.projectUuid, branchUuid: target.branchUuid, isV2Format: false };
  const tab: Bag = { tabId: `${target.activeUuid}@${target.projectUuid}`, data: { doctype: 3, pid: target.projectUuid, owner: target.ownerUuid }, isUnSaved: false };
  const tabs: Bag = { isOpenProjectDoc: true, isOpenOtherDoc: true, getActiveTab(): string { return `${target.activeUuid}@${target.projectUuid}`; }, getFilterTabs(): Bag[] { return [tab]; }, hasTabUnSaved(): boolean { return false; }, isTabUnSaved(): boolean { return false; } };
  function fallback(call: Call): unknown {
    if (call.kind === "clock") { return time + calls.length; }
    if (call.args[0] === "/PrjDB/project/getClient") { return { message: client }; }
    if (call.args[0] === "/PrjDB/project/getMaxTicket") { return { message: 42 }; }
    assert.equal(call.args[0], "/PrjDB/project/getData");
    return { message: { uuid: target.projectUuid, currentBranch: target.branchUuid, isV2Format: false, owner: { uuid: target.ownerUuid } } };
  }
  function bus(kind: "project" | "clock"): Bag {
    return { rpcCall(...args: unknown[]): Promise<unknown> {
      const call: Call = { args, receiver: this, kind }; calls.push(call);
      return Promise.resolve(state.onCall?.(call, calls.length) ?? fallback(call));
    } };
  }
  const host: Bag = { currentProject: project, loginedUserInfo: startup, sessionStorageTabs: new Set(), globalVariableCookieData: cookies,
    messageBus: bus("project"), concurrentBus: bus("clock"), urlCmd: null, isHistoryMode: false };
  const ui: Bag = { tabBar: tabs, gVars: host, concurrentDesign: { _isConcurrentStrictMode: false, getIframeDisableStatusPanelPcb(): Bag { return { disable: false }; } } };
  const sandbox: Bag = { UI: ui, gVars: host, Date: SyntheticDate, Object, Set, Reflect, Array,
    location: { href: "https://client/editor?cll=warn#", origin: "https://client" },
    document: { nodeType: 9, URL: "https://client/editor?cll=warn#" },
    PRO_EDITOR_MODE: "CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM",
    setTimeout(callback: () => void, delay: number): number { assert.equal(delay, 10_000); state.fireTimeout = callback; return 7; },
    clearTimeout(id: unknown): void { assert.equal(id, 7); state.clears += 1; },
  };
  state = { host, project, actor, startup, cookies, ui, tabs, tab, sandbox, calls, clears: 0,
    fireTimeout(): never { throw new Error("no timer"); },
    async run(): Promise<unknown> {
      const result: unknown = runInNewContext(`globalThis.top=globalThis;globalThis.window=globalThis;globalThis.document.defaultView=globalThis;${buildAgedSymbolWitnessReadExpression(target, controlScope, actor)}`, sandbox, { timeout: 1000 });
      return await result;
    },
  };
  return state;
}
