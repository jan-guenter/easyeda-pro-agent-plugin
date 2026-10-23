import { PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES, PUBLIC_SYSTEM_FOOTPRINT_ORIGIN,
  PUBLIC_SYSTEM_FOOTPRINT_TIMEOUT_MS } from "./public-system-footprint.ts";
import { parsePublicSystemCatalogRequest, validatePublicSystemCatalogResult } from "./public-system-catalog.ts";

/** Fixed metadata endpoints only. Search's source-defined POST is a read, not
 * a caller-selected HTTP method or a route to a component write endpoint. */
export async function readPublicSystemCatalog(input: unknown): Promise<Record<string, unknown>> {
  const request = parsePublicSystemCatalogRequest(input);
  let body: string | undefined, path: string;
  switch (request.action) {
    case "get-symbol": { path = `/api/v2/components/${request.symbolUuid}`; break; }
    case "get-device": { path = `/api/v2/devices/${request.deviceUuid}`; break; }
    case "search-footprints": {
      path = "/api/v2/components/search";
      body = new URLSearchParams({ path: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, uid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY,
        page: String(request.page), pageSize: String(request.pageSize), "docType[]": "4", wd: request.query }).toString(); break;
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
