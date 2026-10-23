import assert from "node:assert/strict";
import { test } from "node:test";
import { readPublicSystemCatalog } from "../src/public-system-catalog-runtime.ts";
import { PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES,
  PUBLIC_SYSTEM_FOOTPRINT_ORIGIN, PUBLIC_SYSTEM_FOOTPRINT_TIMEOUT_MS } from "../src/public-system-footprint.ts";

const assetUuid = "a".repeat(32), footprintUuid = "c".repeat(32), symbolUuid = "b".repeat(32);
const metadata = { uuid: assetUuid, owner: { uuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY }, display_title: "Test", tags: { parent_tag: [], child_tag: [] } };
const symbolRequest = { action: "get-symbol", symbolUuid: assetUuid, confirmNetwork: true };
const symbolUrl = `${PUBLIC_SYSTEM_FOOTPRINT_ORIGIN}/api/v2/components/${assetUuid}`;
const symbolRaw = { success: true, code: 0, result: { ...metadata, public: true, path: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, docType: 2 } };
function response(body: BodyInit | null = JSON.stringify(symbolRaw), options: { url?: string; status?: number;
  contentType?: string; contentLength?: string; redirected?: boolean } = {}): Response {
  const result = new Response(body, { status: options.status ?? 200, headers: { "content-type": options.contentType ?? "application/json",
    ...(options.contentLength === undefined ? {} : { "content-length": options.contentLength }) } });
  Object.defineProperty(result, "url", { value: options.url ?? symbolUrl });
  Object.defineProperty(result, "redirected", { value: options.redirected ?? false }); return result;
}

void test("catalog transport dispatches one fixed anonymous request per action, using sample-qualified form POST", async (context) => {
  let calls = 0; const signals: AbortSignal[] = [];
  const deviceUrl = `${PUBLIC_SYSTEM_FOOTPRINT_ORIGIN}/api/v2/devices/${assetUuid}`, searchUrl = `${PUBLIC_SYSTEM_FOOTPRINT_ORIGIN}/api/v2/components/search`;
  const payloads = [{ url: symbolUrl, body: symbolRaw }, { url: deviceUrl, body: { success: true, code: 0,
    result: { ...metadata, project_uuid: "", symbol_type: 2, footprint_type: 4, attributes: { Symbol: symbolUuid, Footprint: footprintUuid } } } },
  { url: searchUrl, body: { success: true, code: 0, result: { uid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, page: "1", pageSize: "1", count: 100, totalPage: 1,
    lists: { lcsc: [{ ...metadata, ownerUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, docType: 4 }], mine: [], user: [] } } } }];
  context.mock.method(globalThis, "fetch", (input: unknown, init: RequestInit): Promise<Response> => {
    const selected = payloads[calls]; assert.ok(selected); calls += 1; assert.equal(input, selected.url);
    const search = selected.url === searchUrl;
    assert.equal(init.method, search ? "POST" : "GET");
    assert.deepEqual(init.headers, { accept: "application/json", path: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY,
      ...(search ? { "content-type": "application/x-www-form-urlencoded;charset=UTF-8" } : {}) });
    assert.equal(init.credentials, "omit"); assert.equal(init.redirect, "error"); assert.equal(init.cache, "no-store");
    assert.equal(init.referrerPolicy, "no-referrer");
    if (search) {
      assert.equal(init.body, `path=${PUBLIC_SYSTEM_FOOTPRINT_LIBRARY}&uid=${PUBLIC_SYSTEM_FOOTPRINT_LIBRARY}&page=1&pageSize=1&docType%5B%5D=4&wd=R%26%2F0603`);
    } else { assert.equal(init.body, undefined); }
    assert.ok(init.signal instanceof AbortSignal); signals.push(init.signal);
    return Promise.resolve(response(JSON.stringify(selected.body), { url: selected.url }));
  });
  const symbol = await readPublicSystemCatalog(symbolRequest); assert.equal(symbol["ok"], true);
  const device = await readPublicSystemCatalog({ action: "get-device", deviceUuid: assetUuid, confirmNetwork: true }); assert.equal(device["ok"], true);
  const search = await readPublicSystemCatalog({ action: "search-footprints", query: "R&/0603", page: 1, pageSize: 1, confirmNetwork: true }); assert.equal(search["ok"], true);
  assert.equal(calls, 3); assert.ok(signals.every((signal) => signal.aborted));
  await assert.rejects(readPublicSystemCatalog({ ...symbolRequest, confirmNetwork: false }));
  await assert.rejects(readPublicSystemCatalog({ ...symbolRequest, url: "https://private.invalid" })); assert.equal(calls, 3);
});

void test("device and symbol searches use separate fixed paths and filters, without tags or follow-up source requests", async (context) => {
  let calls = 0;
  const signals: AbortSignal[] = [];
  const query = "10k & 1/2W";
  const commonBody = `path=${PUBLIC_SYSTEM_FOOTPRINT_LIBRARY}&uid=${PUBLIC_SYSTEM_FOOTPRINT_LIBRARY}&page=2&pageSize=1`;
  context.mock.method(globalThis, "fetch", (input: unknown, init: RequestInit): Promise<Response> => {
    const isDevice = calls === 0; calls += 1;
    const url = `${PUBLIC_SYSTEM_FOOTPRINT_ORIGIN}${isDevice ? "/api/devices/search" : "/api/v2/components/search"}`;
    assert.equal(input, url); assert.equal(init.method, "POST");
    assert.equal(init.body, `${commonBody}${isDevice ? "" : "&docType%5B%5D=2"}&wd=10k+%26+1%2F2W`);
    assert.deepEqual(init.headers, { accept: "application/json", path: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY,
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8" });
    assert.equal(init.credentials, "omit"); assert.equal(init.redirect, "error"); assert.equal(init.cache, "no-store");
    assert.equal(init.referrerPolicy, "no-referrer"); assert.ok(init.signal instanceof AbortSignal); signals.push(init.signal);
    const item = isDevice ? { ...metadata, project_uuid: "", symbol_type: 2, footprint_type: 4,
      attributes: { Symbol: symbolUuid, Footprint: footprintUuid },
      symbol_info: { uuid: symbolUuid, dataStr: "UNPROJECTED_SOURCE", dataStrId: "https://private.invalid" } } :
      { ...metadata, ownerUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, docType: 2 };
    return Promise.resolve(response(JSON.stringify({ success: true, code: 0, result: { uid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY,
      page: "2", pageSize: "1", count: 5200, totalPage: 52, lists: { lcsc: [item], mine: [], user: [] } } }), { url }));
  });
  for (const action of ["search-devices", "search-symbols"]) {
    const result = await readPublicSystemCatalog({ action, query, page: 2, pageSize: 1, confirmNetwork: true });
    assert.equal(result["ok"], true); assert.equal(result["returnedCount"], 1);
    assert.doesNotMatch(JSON.stringify(result), /UNPROJECTED_SOURCE|private\.invalid/u);
  }
  assert.equal(calls, 2); assert.ok(signals.every((signal) => signal.aborted));
  for (const action of ["search-devices", "search-symbols"]) {
    await assert.rejects(readPublicSystemCatalog({ action, query, page: 2, pageSize: 1, confirmNetwork: true, withPackage: true }));
  }
  assert.equal(calls, 2);
});

void test("catalog transport refuses unsafe or malformed remote responses, without retry or raw error disclosure", async (context) => {
  const replies = [response(null), response("{}", { status: 401 }), response("{}", { status: 429 }), response("{}", { status: 302 }),
    response("{}", { redirected: true }), response("{}", { url: "https://private.invalid/secret" }), response("PRIVATE", { contentType: "text/html" }),
    response("{not-json"), response(JSON.stringify({ success: false, code: 404, message: "PRIVATE_VENDOR_ERROR" })),
    response(JSON.stringify({ ...symbolRaw, result: { ...symbolRaw.result, uuid: footprintUuid } })), response(new Uint8Array([0xC0, 0xAF])),
    response("{}", { contentLength: "-1" }), response("{}", { contentLength: String(PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES + 1) }),
    response("x".repeat(PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES + 1))];
  let calls = 0;
  context.mock.method(globalThis, "fetch", (): Promise<Response> => { const next = replies[calls]; calls += 1; assert.ok(next); return Promise.resolve(next); });
  for (const [index] of replies.entries()) {
    await assert.rejects(readPublicSystemCatalog(symbolRequest), { message: "PUBLIC_SYSTEM_CATALOG_REQUEST_REFUSED" }); assert.equal(calls, index + 1);
  }
});

void test("catalog transport aborts an unfinished stream by its deadline, without retry", async (context) => {
  const originalSetTimeout = globalThis.setTimeout;
  context.mock.method(globalThis, "setTimeout", (callback: () => void, delay: number): ReturnType<typeof setTimeout> => {
    assert.equal(delay, PUBLIC_SYSTEM_FOOTPRINT_TIMEOUT_MS); return originalSetTimeout(callback, 1);
  });
  let calls = 0;
  context.mock.method(globalThis, "fetch", (_input: unknown, init: RequestInit): Promise<Response> => {
    calls += 1; assert.ok(init.signal instanceof AbortSignal); const signal = init.signal;
    return Promise.resolve(response(new ReadableStream<Uint8Array>({ start(controller): void {
      signal.addEventListener("abort", () => { controller.error(new Error("PRIVATE_ABORT")); }, { once: true });
    } })));
  });
  const keepAlive = originalSetTimeout(() => { assert.fail("Synthetic deadline did not settle within one second"); }, 1000);
  try { await assert.rejects(readPublicSystemCatalog(symbolRequest), { message: "PUBLIC_SYSTEM_CATALOG_REQUEST_REFUSED" }); }
  finally { clearTimeout(keepAlive); }
  assert.equal(calls, 1);
});

void test("catalog transport suppresses network errors and checks the deadline after synchronous projection", async (context) => {
  const mock = context.mock.method(globalThis, "fetch", (): Promise<Response> => Promise.reject(new Error("PRIVATE_NETWORK_ERROR")));
  await assert.rejects(readPublicSystemCatalog(symbolRequest), { message: "PUBLIC_SYSTEM_CATALOG_REQUEST_REFUSED" });
  assert.equal(mock.mock.callCount(), 1);
  mock.mock.mockImplementation(() => Promise.resolve(response()));
  let observations = 0;
  context.mock.method(performance, "now", (): number => { observations += 1; return observations >= 6 ? PUBLIC_SYSTEM_FOOTPRINT_TIMEOUT_MS : 0; });
  await assert.rejects(readPublicSystemCatalog(symbolRequest), { message: "PUBLIC_SYSTEM_CATALOG_REQUEST_REFUSED" });
  assert.equal(mock.mock.callCount(), 2); assert.equal(observations, 6);
});
