import assert from "node:assert/strict";
import { test } from "node:test";
import { readPublicSystemCatalog } from "../src/public-system-catalog-runtime.ts";
import { PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES,
  PUBLIC_SYSTEM_FOOTPRINT_ORIGIN, PUBLIC_SYSTEM_FOOTPRINT_TIMEOUT_MS } from "../src/public-system-footprint.ts";
import { PUBLIC_SYSTEM_LOOKUP_FOOTPRINT_PATH, PUBLIC_SYSTEM_LOOKUP_LCSC_PATH } from "../src/public-system-library-lookups.ts";
import { asset, deviceCandidate, deviceMetadata, envelope, footprintCandidate, footprintMetadata, footprintNameRequest,
  lcscRequest, lookupResponse, serializedEnvelope } from "./public-system-library-lookups-fixture.ts";

const refused = { message: "PUBLIC_SYSTEM_LOOKUP_REQUEST_REFUSED" };
void test("catalog runtime uses exact anonymous lookup bodies and metadata URLs under one original signal", async (context) => {
  const calls: unknown[] = [], signals: AbortSignal[] = [];
  let isFootprint = true;
  const mock = context.mock.method(globalThis, "fetch", (input: unknown, init: RequestInit): Promise<Response> => {
    assert.equal(typeof input, "string"); assert.ok(init.signal instanceof AbortSignal); signals.push(init.signal); calls.push(input);
    assert.equal(init.credentials, "omit"); assert.equal(init.redirect, "error"); assert.equal(init.cache, "no-store"); assert.equal(init.referrerPolicy, "no-referrer");
    const initial = calls.length % 2 === 1;
    const lookupPath = isFootprint ? PUBLIC_SYSTEM_LOOKUP_FOOTPRINT_PATH : PUBLIC_SYSTEM_LOOKUP_LCSC_PATH;
    const metadataPath = `/api/v2/${isFootprint ? "components" : "devices"}/${asset}`;
    assert.equal(input, `${PUBLIC_SYSTEM_FOOTPRINT_ORIGIN}${initial ? lookupPath : metadataPath}`);
    assert.equal(init.method, initial ? "POST" : "GET");
    assert.deepEqual(init.headers, initial ? { accept: "application/json", "content-type": isFootprint ? "application/json" : "application/json;charset=utf-8" } :
      { accept: "application/json", path: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY });
    if (initial) { assert.equal(init.body, JSON.stringify(isFootprint ? { titles: [footprintNameRequest.name], docType: 4, user_uuids: [PUBLIC_SYSTEM_FOOTPRINT_LIBRARY] } :
      { codes: lcscRequest.lcscIds, path: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY })); }
    else { assert.equal(init.body, undefined); }
    const initialResult = isFootprint ? { [footprintNameRequest.name]: [footprintCandidate()] } : [deviceCandidate()];
    const metadataResult = isFootprint ? footprintMetadata() : deviceMetadata();
    return Promise.resolve(lookupResponse(input, serializedEnvelope(initial ? initialResult : metadataResult)));
  });
  const footprintResult = await readPublicSystemCatalog(footprintNameRequest); assert.equal(footprintResult["returnedCount"], 1);
  isFootprint = false; const deviceResult = await readPublicSystemCatalog(lcscRequest); assert.equal(deviceResult["returnedCount"], 1);
  assert.equal(mock.mock.callCount(), 4); assert.equal(signals[0], signals[1]); assert.equal(signals[2], signals[3]);
  assert.notEqual(signals[0], signals[2]); assert.ok(signals.every(signal => signal.aborted));
  for (const request of [footprintNameRequest, lcscRequest]) {
    for (const change of [{ confirmNetwork: false }, { confirmNetwork: undefined }, { url: "https://private.invalid" }, { owner: asset }, { retries: 1 }]) {
      await assert.rejects(readPublicSystemCatalog({ ...request, ...change }));
    }
  }
  assert.equal(mock.mock.callCount(), 4);
});

void test("runtime validates every initial candidate before followups, retains five matches and refuses six", async (context) => {
  let calls = 0, count = 5;
  const ids = Array.from({ length: 6 }, (_, i) => String(i).repeat(32));
  context.mock.method(globalThis, "fetch", (input: unknown): Promise<Response> => {
    calls += 1; const url = String(input); const id = url.slice(-32);
    const result = url.endsWith(PUBLIC_SYSTEM_LOOKUP_LCSC_PATH) ? ids.slice(0, count).map(uuid => deviceCandidate(uuid)) : deviceMetadata(id);
    return Promise.resolve(lookupResponse(url, serializedEnvelope(result)));
  });
  const result = await readPublicSystemCatalog(lcscRequest); assert.equal(result["returnedCount"], 5); assert.equal(calls, 6);
  count = 6; await assert.rejects(readPublicSystemCatalog(lcscRequest), refused); assert.equal(calls, 7);
  count = 0; const empty = await readPublicSystemCatalog(lcscRequest); assert.equal(empty["returnedCount"], 0); assert.equal(calls, 8);
});

void test("later metadata failure refuses the entire result and never fetches a subsequent candidate", async (context) => {
  const ids = [asset, "d".repeat(32), "e".repeat(32)]; let calls = 0;
  context.mock.method(globalThis, "fetch", (input: unknown): Promise<Response> => {
    calls += 1; const url = String(input);
    const raw = calls === 1 ? envelope(ids.map(uuid => deviceCandidate(uuid))) : envelope({ ...deviceMetadata(ids[calls - 2]),
      ...(calls === 3 ? { owner: { uuid: "f".repeat(32) } } : {}) });
    return Promise.resolve(lookupResponse(url, JSON.stringify(raw)));
  });
  await assert.rejects(readPublicSystemCatalog(lcscRequest), refused); assert.equal(calls, 3);
});

void test("lookup runtime refuses malformed transport/envelopes without retries or metadata dispatch", async (context) => {
  const url = `${PUBLIC_SYSTEM_FOOTPRINT_ORIGIN}${PUBLIC_SYSTEM_LOOKUP_LCSC_PATH}`;
  const foreignCandidate = { ...deviceCandidate("d".repeat(32)), product_code: "C99" };
  const mixedResult = serializedEnvelope([deviceCandidate(), foreignCandidate]);
  const replies = [lookupResponse(url, null), lookupResponse(url, "{}", { status: 401 }), lookupResponse(url, "{}", { status: 429 }),
    lookupResponse(url, "{}", { status: 302 }), lookupResponse(url, "{}", { redirected: true }), lookupResponse("https://private.invalid", "{}"),
    lookupResponse(url, "PRIVATE", { contentType: "text/html" }), lookupResponse(url, "{broken"),
    lookupResponse(url, '{"success":false,"success":true,"code":0,"result":[]}'), lookupResponse(url, new Uint8Array([0xC0, 0xAF])),
    lookupResponse(url, "{}", { contentLength: "-1" }), lookupResponse(url, "{}", { contentLength: String(PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES + 1) }),
    lookupResponse(url, mixedResult),
    lookupResponse(url, JSON.stringify({ success: false, code: 0, message: "PRIVATE_VENDOR_ERROR" }))];
  let calls = 0;
  context.mock.method(globalThis, "fetch", (): Promise<Response> => { const next = replies[calls]; calls += 1; assert.ok(next); return Promise.resolve(next); });
  for (const [index] of replies.entries()) {
    await assert.rejects(readPublicSystemCatalog(lcscRequest), refused); assert.equal(calls, index + 1);
  }
});

void test("aggregate declared and decoded bytes include the initial lookup and refuse metadata overflow", async (context) => {
  const initialBody = JSON.stringify(envelope([deviceCandidate()])); let calls = 0, declared = true;
  context.mock.method(globalThis, "fetch", (input: unknown): Promise<Response> => {
    calls += 1; const url = String(input);
    return Promise.resolve(url.endsWith(PUBLIC_SYSTEM_LOOKUP_LCSC_PATH) ? lookupResponse(url, initialBody) :
      lookupResponse(url, declared ? "{}" : "x".repeat(PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES),
        declared ? { contentLength: String(PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES) } : {}));
  });
  await assert.rejects(readPublicSystemCatalog(lcscRequest), refused); assert.equal(calls, 2);
  declared = false; await assert.rejects(readPublicSystemCatalog(lcscRequest), refused); assert.equal(calls, 4);
});

void test("one monotonic deadline expires before followups and after delayed metadata without returning partial results", async (context) => {
  let calls = 0, expireAfterInitial = true, expired = false;
  const clock = context.mock.method(performance, "now", (): number => expired ? PUBLIC_SYSTEM_FOOTPRINT_TIMEOUT_MS : 0);
  context.mock.method(globalThis, "fetch", (input: unknown): Promise<Response> => {
    calls += 1; const url = String(input); const initial = url.endsWith(PUBLIC_SYSTEM_LOOKUP_LCSC_PATH);
    if (initial === expireAfterInitial) { expired = true; }
    const result = initial ? [deviceCandidate()] : deviceMetadata();
    return Promise.resolve(lookupResponse(url, serializedEnvelope(result)));
  });
  await assert.rejects(readPublicSystemCatalog(lcscRequest), refused); assert.equal(calls, 1);
  expired = false; expireAfterInitial = false; await assert.rejects(readPublicSystemCatalog(lcscRequest), refused); assert.equal(calls, 3);
  clock.mock.mockImplementation(() => Number.NaN); await assert.rejects(readPublicSystemCatalog(lcscRequest), refused); assert.equal(calls, 3);
});

void test("deadline aborts an unfinished metadata body and suppresses remote exceptions", async (context) => {
  const originalSetTimeout = globalThis.setTimeout; let calls = 0;
  context.mock.method(globalThis, "setTimeout", (callback: () => void, delay: number): ReturnType<typeof setTimeout> => {
    assert.equal(delay, PUBLIC_SYSTEM_FOOTPRINT_TIMEOUT_MS); return originalSetTimeout(callback, 1);
  });
  const mock = context.mock.method(globalThis, "fetch", (input: unknown, init: RequestInit): Promise<Response> => {
    calls += 1; assert.ok(init.signal instanceof AbortSignal); const signal = init.signal, url = String(input);
    const initialBody = serializedEnvelope([deviceCandidate()]);
    return Promise.resolve(lookupResponse(url, calls === 1 ? initialBody :
      new ReadableStream<Uint8Array>({ start(controller): void {
        signal.addEventListener("abort", () => { controller.error(new Error("PRIVATE_BODY_ERROR")); }, { once: true });
      } })));
  });
  const keepAlive = originalSetTimeout(() => { assert.fail("Synthetic deadline did not settle"); }, 1000);
  try { await assert.rejects(readPublicSystemCatalog(lcscRequest), refused); } finally { clearTimeout(keepAlive); }
  assert.equal(calls, 2);
  mock.mock.mockImplementation(() => Promise.reject(new Error("PRIVATE_NETWORK_ERROR")));
  await assert.rejects(readPublicSystemCatalog(lcscRequest), refused); assert.equal(mock.mock.callCount(), 3);
});
