import assert from "node:assert/strict";
import { test } from "node:test";
import { PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES,
  PUBLIC_SYSTEM_FOOTPRINT_ORIGIN, PUBLIC_SYSTEM_FOOTPRINT_TIMEOUT_MS } from "../src/public-system-footprint.ts";
import { PUBLIC_SYSTEM_SYMBOL_EXACT_PATH } from "../src/public-system-symbol-exact.ts";
import { PublicSystemSymbolExactRefusalError, readPublicSystemSymbolExact } from "../src/public-system-symbol-exact-runtime.ts";

const request = { action: "search-symbols-by-name", name: "R&/0603", confirmNetwork: true };
const url = `${PUBLIC_SYSTEM_FOOTPRINT_ORIGIN}${PUBLIC_SYSTEM_SYMBOL_EXACT_PATH}`;
const raw = { success: true, code: 0, result: { "R&/0603": [{ uuid: "a".repeat(32), docType: 2,
  owner: { uuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY }, display_title: "R&/0603" }] } };
function response(body: BodyInit | null = JSON.stringify(raw), options: { status?: number; url?: string;
  contentType?: string; contentLength?: string; redirected?: boolean } = {}): Response {
  const result = new Response(body, { status: options.status ?? 200, headers: { "content-type": options.contentType ?? "application/json",
    ...(options.contentLength === undefined ? {} : { "content-length": options.contentLength }) } });
  Object.defineProperty(result, "url", { value: options.url ?? url });
  Object.defineProperty(result, "redirected", { value: options.redirected ?? false }); return result;
}

void test("symbol title transport sends one fixed anonymous JSON request with an explicit system owner", async (context) => {
  const signals: AbortSignal[] = [];
  const mock = context.mock.method(globalThis, "fetch", (input: unknown, init: RequestInit): Promise<Response> => {
    assert.equal(input, url); assert.equal(init.method, "POST");
    assert.deepEqual(init.headers, { accept: "application/json", "content-type": "application/json" });
    assert.equal(init.body, JSON.stringify({ titles: [request.name], docType: 2, user_uuids: [PUBLIC_SYSTEM_FOOTPRINT_LIBRARY] }));
    assert.equal(init.credentials, "omit"); assert.equal(init.redirect, "error"); assert.equal(init.cache, "no-store");
    assert.equal(init.referrerPolicy, "no-referrer"); assert.ok(init.signal instanceof AbortSignal); signals.push(init.signal);
    return Promise.resolve(response());
  });
  const result = await readPublicSystemSymbolExact(request);
  assert.equal(result["ok"], true); assert.equal(result["returnedCount"], 1); assert.equal(result["publicSdkMethodExecuted"], false);
  assert.equal(mock.mock.callCount(), 1); assert.equal(signals[0]?.aborted, true);
  for (const change of [{ confirmNetwork: false }, { libraryUuid: "b".repeat(32) }, { url: "https://private.invalid" }, { name: "" }]) {
    await assert.rejects(readPublicSystemSymbolExact({ ...request, ...change }));
  }
  assert.equal(mock.mock.callCount(), 1);
});

void test("symbol title transport refuses unsuccessful, redirected, malformed and oversized replies without retry", async (context) => {
  const replies = [response(null), response("{}", { status: 401 }), response("{}", { status: 429 }), response("{}", { status: 302 }),
    response("{}", { redirected: true }), response("{}", { url: "https://private.invalid/secret" }), response("PRIVATE", { contentType: "text/html" }),
    response("{broken"), response('{"success":false,"success":true,"code":0,"result":{}}'),
    response(JSON.stringify({ success: false, code: 0, message: "PRIVATE_VENDOR_ERROR" })),
    response(JSON.stringify({ success: true, code: 0, result: { Other: [] } })), response(new Uint8Array([0xC0, 0xAF])),
    response("{}", { contentLength: "-1" }), response("{}", { contentLength: String(PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES + 1) }),
    response("x".repeat(PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES + 1))];
  let calls = 0;
  context.mock.method(globalThis, "fetch", (): Promise<Response> => { const next = replies[calls]; calls += 1; assert.ok(next); return Promise.resolve(next); });
  for (const [index] of replies.entries()) {
    await assert.rejects(readPublicSystemSymbolExact(request), { message: "PUBLIC_SYSTEM_SYMBOL_EXACT_REQUEST_REFUSED" });
    assert.equal(calls, index + 1);
  }
});

void test("symbol title transport bounds an unfinished body by its original deadline", async (context) => {
  const originalSetTimeout = globalThis.setTimeout;
  context.mock.method(globalThis, "setTimeout", (callback: () => void, delay: number): ReturnType<typeof setTimeout> => {
    assert.equal(delay, PUBLIC_SYSTEM_FOOTPRINT_TIMEOUT_MS); return originalSetTimeout(callback, 1);
  });
  const mock = context.mock.method(globalThis, "fetch", (_input: unknown, init: RequestInit): Promise<Response> => {
    assert.ok(init.signal instanceof AbortSignal); const signal = init.signal;
    return Promise.resolve(response(new ReadableStream<Uint8Array>({ start(controller): void {
      signal.addEventListener("abort", () => { controller.error(new Error("PRIVATE_ABORT")); }, { once: true });
    } })));
  });
  const keepAlive = originalSetTimeout(() => { assert.fail("Synthetic deadline did not settle within one second"); }, 1000);
  try { await assert.rejects(readPublicSystemSymbolExact(request), { message: "PUBLIC_SYSTEM_SYMBOL_EXACT_REQUEST_REFUSED" }); }
  finally { clearTimeout(keepAlive); }
  assert.equal(mock.mock.callCount(), 1);
});

void test("symbol title transport suppresses remote errors and checks the deadline after projection", async (context) => {
  const mock = context.mock.method(globalThis, "fetch", (): Promise<Response> => Promise.reject(new Error("PRIVATE_NETWORK_ERROR")));
  await assert.rejects(readPublicSystemSymbolExact(request), { message: "PUBLIC_SYSTEM_SYMBOL_EXACT_REQUEST_REFUSED" });
  assert.equal(mock.mock.callCount(), 1);
  mock.mock.mockImplementation(() => Promise.resolve(response()));
  let observations = 0;
  context.mock.method(performance, "now", (): number => { observations += 1; return observations >= 6 ? PUBLIC_SYSTEM_FOOTPRINT_TIMEOUT_MS : 0; });
  await assert.rejects(readPublicSystemSymbolExact(request), { message: "PUBLIC_SYSTEM_SYMBOL_EXACT_REQUEST_REFUSED" });
  assert.equal(mock.mock.callCount(), 2); assert.equal(observations, 6);
});

void test("symbol title refusal diagnostics preserve fixed stages and numeric bounds without private errors or query names", async (context) => {
  const mock = context.mock.method(globalThis, "fetch", (): Promise<Response> => Promise.resolve(response("PRIVATE_BODY", { status: 401 })));
  await assert.rejects(readPublicSystemSymbolExact(request), (error: unknown) => {
    assert.ok(error instanceof PublicSystemSymbolExactRefusalError);
    assert.equal(error.stage, "headers"); assert.equal(error.httpStatus, 401); assert.equal(error.receivedBodyBytes, 0);
    assert.deepEqual(error.schemaIssueCodes, []); assert.equal(error.projectionRefusalCode, undefined);
    assert.doesNotMatch(JSON.stringify(error), /PRIVATE|R&\/0603/u); return true;
  });
  mock.mock.mockImplementation(() => Promise.resolve(response(JSON.stringify({ success: false, code: 0, message: "PRIVATE_VENDOR_ERROR" }))));
  await assert.rejects(readPublicSystemSymbolExact(request), (error: unknown) => {
    assert.ok(error instanceof PublicSystemSymbolExactRefusalError);
    assert.equal(error.stage, "projection"); assert.equal(error.httpStatus, 200); assert.ok(error.receivedBodyBytes > 0);
    assert.deepEqual(error.schemaIssueCodes, ["invalid_value", "invalid_type"]); assert.equal(error.projectionRefusalCode, undefined);
    assert.doesNotMatch(JSON.stringify(error), /PRIVATE|R&\/0603/u); return true;
  });
  mock.mock.mockImplementation(() => Promise.resolve(response("x".repeat(PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES + 10))));
  await assert.rejects(readPublicSystemSymbolExact(request), (error: unknown) => {
    assert.ok(error instanceof PublicSystemSymbolExactRefusalError);
    assert.equal(error.stage, "body"); assert.equal(error.receivedBodyBytes, PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES + 1); return true;
  });
});
