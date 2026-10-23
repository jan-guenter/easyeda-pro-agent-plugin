import assert from "node:assert/strict";
import { test } from "node:test";
import { readPublicSystemFootprint } from "../src/public-system-footprint-runtime.ts";
import { PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES, PUBLIC_SYSTEM_FOOTPRINT_ORIGIN,
  PUBLIC_SYSTEM_FOOTPRINT_TIMEOUT_MS } from "../src/public-system-footprint.ts";

const footprintUuid = "a".repeat(32), request = { footprintUuid, confirmNetwork: true };
const url = `${PUBLIC_SYSTEM_FOOTPRINT_ORIGIN}/api/v2/components/${footprintUuid}`;
const payload = { success: true, code: 0, result: { uuid: footprintUuid, path: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY,
  docType: 4, public: true, owner: { uuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY }, display_title: "QFN-32", description: "",
  tags: { parent_tag: [], child_tag: [] } } };
function response(body: BodyInit | null = JSON.stringify(payload), options: { url?: string; status?: number;
  contentType?: string; contentLength?: string; redirected?: boolean } = {}): Response {
  const result = new Response(body, { status: options.status ?? 200, headers: { "content-type": options.contentType ?? "application/json",
    ...(options.contentLength === undefined ? {} : { "content-length": options.contentLength }) } });
  Object.defineProperty(result, "url", { value: options.url ?? url });
  Object.defineProperty(result, "redirected", { value: options.redirected ?? false }); return result;
}

void test("catalog footprint sends one fixed anonymous GET and no app, credential, redirect or arbitrary URL input", async (context) => {
  let calls = 0; const signals: AbortSignal[] = [];
  context.mock.method(globalThis, "fetch", (input: unknown, init: RequestInit): Promise<Response> => {
    calls += 1; assert.equal(input, url); assert.equal(init.method, "GET");
    assert.deepEqual(init.headers, { accept: "application/json", path: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY });
    assert.equal(init.credentials, "omit"); assert.equal(init.redirect, "error"); assert.equal(init.cache, "no-store");
    assert.equal(init.referrerPolicy, "no-referrer"); assert.equal(init.body, undefined);
    assert.ok(init.signal instanceof AbortSignal); signals.push(init.signal); return Promise.resolve(response());
  });
  const result = await readPublicSystemFootprint(request);
  assert.equal(result["implementationKind"], "vendor-http-task-equivalent"); assert.equal(calls, 1);
  assert.equal(signals[0]?.aborted, true);
  await assert.rejects(readPublicSystemFootprint({ ...request, confirmNetwork: false })); assert.equal(calls, 1);
  await assert.rejects(readPublicSystemFootprint({ ...request, url: "https://private.invalid" })); assert.equal(calls, 1);
});

void test("catalog footprint refuses HTTP, redirect, content type, identity and vendor errors without retry or raw error disclosure", async (context) => {
  const replies = [response(null), response("{}", { status: 401 }), response("{}", { status: 429 }), response("{}", { status: 302 }),
    response("{}", { redirected: true }), response("{}", { url: "https://other.invalid/PRIVATE" }), response("PRIVATE", { contentType: "text/html" }),
    response("{not-json"), response(JSON.stringify({ success: false, code: 404, message: "PRIVATE_VENDOR_ERROR" })),
    response(JSON.stringify({ ...payload, result: { ...payload.result, uuid: "b".repeat(32) } })),
    response(new Uint8Array([0xC0, 0xAF])), response("{}", { contentLength: "-1" }),
    response("{}", { contentLength: String(PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES + 1) }),
    response("x".repeat(PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES + 1)),
  ];
  let calls = 0;
  context.mock.method(globalThis, "fetch", (): Promise<Response> => {
    const next = replies[calls]; calls += 1; assert.ok(next); return Promise.resolve(next);
  });
  for (const [index] of replies.entries()) {
    await assert.rejects(readPublicSystemFootprint(request), { message: "PUBLIC_SYSTEM_FOOTPRINT_LOOKUP_REFUSED" });
    assert.equal(calls, index + 1);
  }
});

void test("catalog footprint request/body deadline aborts an unfinished stream and never dispatches a retry", async (context) => {
  const originalSetTimeout = globalThis.setTimeout;
  context.mock.method(globalThis, "setTimeout", (callback: () => void, delay: number): ReturnType<typeof setTimeout> => {
    assert.equal(delay, PUBLIC_SYSTEM_FOOTPRINT_TIMEOUT_MS); return originalSetTimeout(callback, 1);
  });
  let calls = 0; const signals: AbortSignal[] = [];
  context.mock.method(globalThis, "fetch", (input: unknown, init: RequestInit): Promise<Response> => {
    calls += 1; assert.equal(input, url); assert.ok(init.signal instanceof AbortSignal); const signal = init.signal; signals.push(signal);
    const stream = new ReadableStream<Uint8Array>({ start(controller): void {
      signal.addEventListener("abort", () => { controller.error(new Error("PRIVATE_ABORT")); }, { once: true });
    } });
    return Promise.resolve(response(stream));
  });
  // Keep this synthetic process alive while the production deadline is unref'd.
  const keepAlive = originalSetTimeout(() => { assert.fail("Synthetic deadline did not settle within one second"); }, 1000);
  try { await assert.rejects(readPublicSystemFootprint(request), { message: "PUBLIC_SYSTEM_FOOTPRINT_LOOKUP_REFUSED" }); }
  finally { clearTimeout(keepAlive); }
  assert.equal(calls, 1); assert.equal(signals[0]?.aborted, true);
});

void test("catalog footprint transport failure is bounded and does not leak the vendor error or retry", async (context) => {
  let calls = 0;
  context.mock.method(globalThis, "fetch", (): Promise<Response> => { calls += 1; return Promise.reject(new Error("PRIVATE_NETWORK_ERROR")); });
  await assert.rejects(readPublicSystemFootprint(request), { message: "PUBLIC_SYSTEM_FOOTPRINT_LOOKUP_REFUSED" }); assert.equal(calls, 1);
});

void test("catalog footprint checks the monotonic deadline after synchronous validation too", async (context) => {
  let observations = 0;
  context.mock.method(performance, "now", (): number => {
    observations += 1; return observations >= 6 ? PUBLIC_SYSTEM_FOOTPRINT_TIMEOUT_MS : 0;
  });
  context.mock.method(globalThis, "fetch", (): Promise<Response> => Promise.resolve(response()));
  await assert.rejects(readPublicSystemFootprint(request), { message: "PUBLIC_SYSTEM_FOOTPRINT_LOOKUP_REFUSED" });
  assert.equal(observations, 6);
});
