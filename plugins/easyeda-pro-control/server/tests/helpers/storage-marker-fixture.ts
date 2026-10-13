/* oxlint-disable eslint/max-classes-per-file -- Independent browser receiver prototypes are required by this synthetic fixture. */
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import { STORAGE_MARKER_DESCRIPTOR, buildStorageMarkerCreateExpression, buildStorageMarkerReadExpression } from "../../src/storage-marker.ts";

export const marker = { profile: STORAGE_MARKER_DESCRIPTOR, namespaceNonce: "a".repeat(64), keyNonce: "b".repeat(64), bodyNonce: "c".repeat(64) };
export const cacheName = `easyeda-pro-agent.storage-continuity.v1.${marker.namespaceNonce}`;
export const markerKey = `https://client/.easyeda-pro-agent/storage-continuity/v1/${marker.keyNonce}`;
export type Bag = Record<string, unknown>;
export interface Call { readonly kind: string; readonly receiver: unknown; readonly args: unknown[] }
export interface Entry { body: Uint8Array; headers: Record<string, string> }
export interface Fixture {
  sandbox: Bag;
  host: Bag;
  ui: Bag;
  tabs: Bag;
  tab: Bag;
  storage: object;
  cache: object;
  controller: { value: unknown };
  entries: Map<string, Entry>;
  exists: boolean;
  calls: Call[];
  onCall: ((call: Call, index: number) => void) | undefined;
  overrides: Map<number, unknown>;
  response: (() => unknown) | undefined;
  lastResponse: Response | undefined;
  bodyChunks: Uint8Array[] | undefined;
  cancellations: number;
  cleared: number;
  timeout: () => void;
  run: (create?: boolean, input?: unknown) => Promise<unknown>;
}

export function initialProject(): Bag {
  return { projectId: undefined, title: undefined, isCBB: undefined, owner: "", isPublic: undefined, isPublish: undefined,
    ownerData: { nickname: "", uuid: "" }, projectManagerName: "", settings: undefined, branchUuid: "", branchNum: undefined, isV2Format: undefined };
}
export function fixture(): Fixture {
  // The single cache starts with the legacy seed name; only actual open binds a new one.
  let openedCacheName = cacheName;
  // The callbacks run only after the circular fixture has been assembled.
  // oxlint-disable-next-line eslint/prefer-const
  let state: Fixture;
  const emit = async (kind: string, receiver: unknown, args: unknown[], fallback?: unknown): Promise<unknown> => {
    const call = { kind, receiver, args }; state.calls.push(call);
    const index = state.calls.length; state.onCall?.(call, index);
    return await (state.overrides.has(index) ? state.overrides.get(index) : fallback);
  };
  const response = (entry: Entry): Response => {
    const chunks = state.bodyChunks ?? [entry.body]; let offset = 0;
    const stream = new ReadableStream<Uint8Array>({
      async pull(controller): Promise<void> {
        const next: unknown = await emit("body-read", controller, [], chunks[offset]); offset += 1;
        if (next === undefined) { controller.close(); }
        else { assert.ok(next instanceof Uint8Array); controller.enqueue(next); }
      },
      cancel(): void { state.cancellations += 1; },
    }, { highWaterMark: 0 });
    return new Response(stream, { headers: entry.headers });
  };
  class SyntheticCache {
    public keys(): Promise<unknown> {
      assert.equal(this, state.cache);
      return emit("keys", this, [], [...state.entries.keys()].map((key) => new Request(key)));
    }
    public async put(request: Request, value: Response): Promise<unknown> {
      assert.equal(this, state.cache); assert.equal(request.method, "GET");
      const body = new Uint8Array(await value.arrayBuffer());
      state.entries.set(request.url, { body, headers: Object.fromEntries(value.headers) });
      return emit("put", this, [request.url, [...request.headers], [...value.headers], [...body]]);
    }
  }
  class SyntheticStorage {
    public has(name: string): Promise<unknown> { assert.equal(this, state.storage); return emit("has", this, [name], state.exists && name === openedCacheName); }
    public open(name: string): Promise<unknown> {
      assert.equal(this, state.storage);
      assert.ok(!state.exists || name === openedCacheName, "SyntheticStorage supports only its one existing namespace");
      openedCacheName = name; state.exists = true;
      return emit("open", this, [name], state.cache);
    }
    public match(key: string, options: unknown): Promise<unknown> {
      assert.equal(this, state.storage);
      assert.ok(options !== null && typeof options === "object");
      const requestedName: unknown = Reflect.get(options, "cacheName");
      const entry = state.exists && requestedName === openedCacheName ? state.entries.get(key) : undefined;
      let value: unknown;
      if (state.response !== undefined) { value = state.response(); }
      else if (entry !== undefined) { value = response(entry); }
      if (value instanceof Response) { state.lastResponse = value; }
      return emit("match", this, [key, options], value);
    }
  }
  class SyntheticContainer {
    public value: unknown = null;
    public get controller(): unknown { return this.value; }
  }
  const container = new SyntheticContainer();
  class SyntheticNavigator {
    public readonly target = container;
    public get serviceWorker(): SyntheticContainer { return this.target; }
  }
  const tab: Bag = { tabId: "tab_page1", isAbleDelete: false, data: { doctype: -1 } };
  const tabs: Bag = { isOpenProjectDoc: true, isOpenOtherDoc: true, getActiveTab(): string { return "tab_page1"; }, getFilterTabs(): Bag[] { return [tab]; } };
  const host: Bag = { currentProject: initialProject(), sessionStorageTabs: new Set(), urlCmd: null, isHistoryMode: false };
  const cache = new SyntheticCache(), storage = new SyntheticStorage(), ui: Bag = { tabBar: tabs, gVars: host };
  const sandbox: Bag = {
    Object, Array, Reflect, Set, Uint8Array, Response, Request, Headers, ReadableStream, ReadableStreamDefaultReader,
    UI: ui, gVars: host, CacheStorage: SyntheticStorage, Cache: SyntheticCache, caches: storage,
    Navigator: SyntheticNavigator, navigator: new SyntheticNavigator(), ServiceWorkerContainer: SyntheticContainer,
    location: { href: "https://client/editor?cll=warn#", origin: "https://client" }, document: { nodeType: 9, URL: "https://client/editor?cll=warn#" },
    PRO_EDITOR_MODE: "CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM",
    setTimeout(callback: () => void, delay: number): number { assert.equal(delay, 10_000); state.timeout = callback; return 7; },
    clearTimeout(id: unknown): void { assert.equal(id, 7); state.cleared += 1; },
  };
  state = { sandbox, host, ui, tabs, tab, storage, cache, controller: container, entries: new Map(), exists: false, calls: [], overrides: new Map(),
    onCall: undefined, response: undefined, lastResponse: undefined, bodyChunks: undefined, cancellations: 0, cleared: 0,
    timeout(): never { throw new Error("timer unavailable"); },
    async run(create = false, input: unknown = marker): Promise<unknown> {
      const program = create ? buildStorageMarkerCreateExpression(input) : buildStorageMarkerReadExpression(input);
      const result: unknown = runInNewContext(`globalThis.top=globalThis;globalThis.window=globalThis;if(globalThis.document)globalThis.document.defaultView=globalThis;${program}`, sandbox, { timeout: 1000 });
      return structuredClone(await result);
    },
  };
  return state;
}
export function seed(state: Fixture): void {
  state.exists = true;
  state.entries.set(markerKey, { body: new TextEncoder().encode(marker.bodyNonce), headers: { "content-type": "application/octet-stream", "x-easyeda-pro-agent-marker": "1" } });
}
export async function settle(): Promise<void> { for (let index = 0; index < 100; index += 1) { await Promise.resolve(); } }
