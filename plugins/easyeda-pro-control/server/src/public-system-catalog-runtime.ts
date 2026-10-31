import { PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES, PUBLIC_SYSTEM_FOOTPRINT_ORIGIN,
  PUBLIC_SYSTEM_FOOTPRINT_TIMEOUT_MS } from "./public-system-footprint.ts";
import { parsePublicSystemCatalogRequest, validatePublicSystemCatalogResult } from "./public-system-catalog.ts";
import { readPublicSystemSymbolExact } from "./public-system-symbol-exact-runtime.ts";
import { readPublicSystemLibraryLookup } from "./public-system-library-lookups-runtime.ts";
import { readPublicSystemClassification } from "./public-system-classification-runtime.ts";

/** Fixed metadata endpoints only. The source defines read-only POST routes;
 * form encoding is qualified by anonymous samples, not the desktop JSON default. */
export async function readPublicSystemCatalog(input: unknown): Promise<Record<string, unknown>> {
  const request = parsePublicSystemCatalogRequest(input);
  if (request.action === "get-classification-tree" || request.action === "get-classification-index-by-name" ||
    request.action === "get-classification-name-by-uuid" || request.action === "get-classification-name-by-index") {
    return readPublicSystemClassification(request);
  }
  if (request.action === "search-symbols-by-name") { return readPublicSystemSymbolExact(request); }
  if (request.action === "search-footprints-by-name" || request.action === "get-devices-by-lcsc-ids") { return readPublicSystemLibraryLookup(request); }
  let body: string | undefined, path: string;
  switch (request.action) {
    case "get-symbol": { path = `/api/v2/components/${request.symbolUuid}`; break; }
    case "get-panel-library": { path = `/api/v2/components/${request.panelLibraryUuid}`; break; }
    case "get-device": { path = `/api/v2/devices/${request.deviceUuid}`; break; }
    case "search-footprints": case "search-symbols": case "search-3d-models": case "search-panel-libraries": {
      path = "/api/v2/components/search";
      const documentTypes = { "search-footprints": "4", "search-symbols": "2", "search-3d-models": "16", "search-panel-libraries": "29" } as const;
      body = new URLSearchParams({ path: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, uid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY,
        page: String(request.page), pageSize: String(request.pageSize), "docType[]": documentTypes[request.action],
        wd: request.query }).toString(); break;
    }
    case "search-devices": {
      path = "/api/devices/search";
      // The fixed empty tag array emits no form field. No device docType filter exists.
      body = new URLSearchParams({ path: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, uid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY,
        page: String(request.page), pageSize: String(request.pageSize), wd: request.query }).toString(); break;
    }
    default: { throw new Error("PUBLIC_SYSTEM_CATALOG_ACTION"); }
  }
  const url = `${PUBLIC_SYSTEM_FOOTPRINT_ORIGIN}${path}`;
  const controller = new AbortController(), started = performance.now();
  const assertWithinDeadline = (): void => {
    controller.signal.throwIfAborted();
    if (performance.now() - started >= PUBLIC_SYSTEM_FOOTPRINT_TIMEOUT_MS) { throw new Error("PUBLIC_SYSTEM_CATALOG_DEADLINE"); }
  };
  const timer = setTimeout(() => { controller.abort(); }, PUBLIC_SYSTEM_FOOTPRINT_TIMEOUT_MS);
  timer.unref();
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  try {
    const response = await fetch(url, { method: body === undefined ? "GET" : "POST", headers: { accept: "application/json",
      path: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, ...(body === undefined ? {} : { "content-type": "application/x-www-form-urlencoded;charset=UTF-8" }) },
      ...(body === undefined ? {} : { body }), credentials: "omit", redirect: "error", cache: "no-store",
      referrerPolicy: "no-referrer", signal: controller.signal });
    assertWithinDeadline();
    if (response.status !== 200 || response.redirected || response.url !== url || response.body === null ||
        !/^application\/json(?:\s*;\s*charset=utf-8)?$/iu.test(response.headers.get("content-type") ?? "")) {
      throw new Error("PUBLIC_SYSTEM_CATALOG_HTTP_REFUSED");
    }
    const declaredLength = response.headers.get("content-length");
    if (declaredLength !== null && (!/^\d{1,10}$/u.test(declaredLength) || Number(declaredLength) > PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES)) {
      throw new Error("PUBLIC_SYSTEM_CATALOG_RESPONSE_SIZE");
    }
    reader = response.body.getReader();
    const chunks: Uint8Array[] = []; let bytes = 0;
    for (;;) {
      const chunk = await reader.read(); assertWithinDeadline();
      if (chunk.done) { break; }
      bytes += chunk.value.byteLength;
      if (bytes > PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES) { throw new Error("PUBLIC_SYSTEM_CATALOG_RESPONSE_SIZE"); }
      chunks.push(chunk.value);
    }
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks, bytes));
    const raw: unknown = JSON.parse(decoded);
    assertWithinDeadline();
    const result = validatePublicSystemCatalogResult(request, raw);
    assertWithinDeadline(); return result;
  } catch {
    // Never expose raw request/vendor errors, which may echo the caller's query.
    throw new Error("PUBLIC_SYSTEM_CATALOG_REQUEST_REFUSED");
  } finally {
    clearTimeout(timer); controller.abort(); reader?.releaseLock();
  }
}
