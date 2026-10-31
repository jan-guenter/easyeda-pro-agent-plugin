import assert from "node:assert/strict";
import { test } from "node:test";
import { readPublicSystemCatalog } from "../src/public-system-catalog-runtime.ts";
import { PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, PUBLIC_SYSTEM_FOOTPRINT_ORIGIN } from "../src/public-system-footprint.ts";

const assetUuid = "a".repeat(32), searchUrl = `${PUBLIC_SYSTEM_FOOTPRINT_ORIGIN}/api/v2/components/search`;
const metadata = { uuid: assetUuid, owner: { uuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY }, display_title: "Public asset", tags: { parent_tag: [], child_tag: [] } };
function response(raw: unknown, url: string): Response {
  const result = Response.json(raw);
  Object.defineProperty(result, "url", { value: url }); return result;
}

void test("new asset actions use one fixed anonymous metadata request with exact document filter and no linked request", async (context) => {
  let calls = 0; const signals: AbortSignal[] = [];
  context.mock.method(globalThis, "fetch", (input: unknown, init: RequestInit): Promise<Response> => {
    calls += 1; const get = calls === 3, type = calls === 1 ? 16 : 29;
    const url = get ? `${PUBLIC_SYSTEM_FOOTPRINT_ORIGIN}/api/v2/components/${assetUuid}` : searchUrl;
    assert.equal(input, url); assert.equal(init.method, get ? "GET" : "POST");
    assert.deepEqual(init.headers, { accept: "application/json", path: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY,
      ...(get ? {} : { "content-type": "application/x-www-form-urlencoded;charset=UTF-8" }) });
    assert.equal(init.credentials, "omit"); assert.equal(init.redirect, "error"); assert.equal(init.cache, "no-store");
    assert.equal(init.referrerPolicy, "no-referrer"); assert.ok(init.signal instanceof AbortSignal); signals.push(init.signal);
    assert.equal(init.body, get ? undefined : `path=${PUBLIC_SYSTEM_FOOTPRINT_LIBRARY}&uid=${PUBLIC_SYSTEM_FOOTPRINT_LIBRARY}&page=2&pageSize=1&docType%5B%5D=${type}&wd=SOT%26%2F23`);
    const item = { ...metadata, docType: type, public: true, path: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, dataStrId: "https://private.invalid" };
    return Promise.resolve(response({ success: true, code: 0, result: get ? item : { uid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY,
      page: "2", pageSize: "1", count: 10, totalPage: 1, wd: "sot&/23", lists: { lcsc: [item], mine: [], user: [] } } }, url));
  });
  for (const action of ["search-3d-models", "search-panel-libraries"]) {
    const result = await readPublicSystemCatalog({ action, query: "SOT&/23", page: 2, pageSize: 1, confirmNetwork: true });
    assert.equal(result["returnedCount"], 1); assert.equal(result["linkedAssetsFetched"], false); assert.doesNotMatch(JSON.stringify(result), /private\.invalid/u);
  }
  const panel = await readPublicSystemCatalog({ action: "get-panel-library", panelLibraryUuid: assetUuid, confirmNetwork: true });
  assert.equal(panel["ok"], true);
  assert.equal(calls, 3); assert.ok(signals.every((signal) => signal.aborted));
  for (const extra of [{ confirmNetwork: false }, { libraryUuid: "private" }, { url: "https://private.invalid" }, { authorization: "private" },
    { panelLibraryUuid: `${assetUuid}\n` }]) {
    await assert.rejects(readPublicSystemCatalog({ action: "get-panel-library", panelLibraryUuid: assetUuid, confirmNetwork: true, ...extra }));
  }
  assert.equal(calls, 3);
});

void test("asset route errors consume one request and never fall back to authenticated SDK or another owner", async (context) => {
  let calls = 0;
  context.mock.method(globalThis, "fetch", (): Promise<Response> => {
    calls += 1;
    return Promise.resolve(response({ success: true, code: 0, result: { ...metadata, docType: 4,
      path: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, public: true, message: "PRIVATE_VENDOR" } }, `${PUBLIC_SYSTEM_FOOTPRINT_ORIGIN}/api/v2/components/${assetUuid}`));
  });
  await assert.rejects(readPublicSystemCatalog({ action: "get-panel-library", panelLibraryUuid: assetUuid, confirmNetwork: true }),
    { message: "PUBLIC_SYSTEM_CATALOG_REQUEST_REFUSED" });
  assert.equal(calls, 1);
});
