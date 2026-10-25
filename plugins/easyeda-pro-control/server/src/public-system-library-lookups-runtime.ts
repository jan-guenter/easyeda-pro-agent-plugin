import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { validatePublicSystemCatalogResult, validatePublicSystemLookupMetadata } from "./public-system-catalog.ts";
import { PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES,
  PUBLIC_SYSTEM_FOOTPRINT_ORIGIN, PUBLIC_SYSTEM_FOOTPRINT_TIMEOUT_MS } from "./public-system-footprint.ts";
import { PUBLIC_SYSTEM_LOOKUP_FOOTPRINT_PATH, PUBLIC_SYSTEM_LOOKUP_LCSC_PATH, PUBLIC_SYSTEM_LOOKUP_MAX_REQUESTS,
  parsePublicSystemLookupCandidates, publicSystemLibraryLookupRequestSchema } from "./public-system-library-lookups.ts";

/** Closed two-action transport. Every metadata URL comes from a fully checked
 * initial UUID, and all responses share one byte and monotonic time budget. */
export async function readPublicSystemLibraryLookup(input: unknown): Promise<Record<string, unknown>> {
  const request = publicSystemLibraryLookupRequestSchema.parse(input);
  const isFootprint = request.action === "search-footprints-by-name";
  const body = JSON.stringify(isFootprint ? { titles: [request.name], docType: 4, user_uuids: [PUBLIC_SYSTEM_FOOTPRINT_LIBRARY] } :
    { codes: request.lcscIds, path: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY });
  const controller = new AbortController(), started = performance.now();
  let lastTime = started, requestCount = 0, totalBytes = 0;
  const withinDeadline = (): void => {
    controller.signal.throwIfAborted();
    const now = performance.now();
    if (!Number.isFinite(now) || now < lastTime || now - started >= PUBLIC_SYSTEM_FOOTPRINT_TIMEOUT_MS) { throw new Error("PUBLIC_SYSTEM_LOOKUP_DEADLINE"); }
    lastTime = now;
  };
  const timer = setTimeout(() => { controller.abort(); }, PUBLIC_SYSTEM_FOOTPRINT_TIMEOUT_MS); timer.unref();
  const readJson = async (path: string, content?: string): Promise<unknown> => {
    withinDeadline();
    requestCount += 1;
    if (requestCount > PUBLIC_SYSTEM_LOOKUP_MAX_REQUESTS) { throw new Error("PUBLIC_SYSTEM_LOOKUP_REQUEST_LIMIT"); }
    const url = `${PUBLIC_SYSTEM_FOOTPRINT_ORIGIN}${path}`;
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    try {
      const response = await fetch(url, { method: content === undefined ? "GET" : "POST", headers: { accept: "application/json",
        ...(content === undefined ? { path: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY } : { "content-type": isFootprint ? "application/json" : "application/json;charset=utf-8" }) },
        ...(content === undefined ? {} : { body: content }), credentials: "omit", redirect: "error", cache: "no-store", referrerPolicy: "no-referrer", signal: controller.signal });
      withinDeadline();
      if (response.status !== 200 || response.redirected || response.url !== url || response.body === null ||
          !/^application\/json(?:\s*;\s*charset=utf-8)?$/iu.test(response.headers.get("content-type") ?? "")) { throw new Error("PUBLIC_SYSTEM_LOOKUP_HTTP"); }
      const length = response.headers.get("content-length");
      if (length !== null && (!/^\d{1,10}$/u.test(length) || Number(length) > PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES - totalBytes)) { throw new Error("PUBLIC_SYSTEM_LOOKUP_BYTES"); }
      reader = response.body.getReader(); const chunks: Uint8Array[] = []; let bytes = 0;
      for (;;) {
        const chunk = await reader.read(); withinDeadline(); if (chunk.done) { break; }
        bytes += chunk.value.byteLength; totalBytes += chunk.value.byteLength;
        if (totalBytes > PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES) { throw new Error("PUBLIC_SYSTEM_LOOKUP_BYTES"); }
        chunks.push(chunk.value);
      }
      const result = decodeCurrentPcbDiagnosticJson(Buffer.concat(chunks, bytes)); withinDeadline(); return result;
    } finally { reader?.releaseLock(); }
  };
  try {
    if (!Number.isFinite(started)) { throw new TypeError("PUBLIC_SYSTEM_LOOKUP_DEADLINE"); }
    const lookup = await readJson(isFootprint ? PUBLIC_SYSTEM_LOOKUP_FOOTPRINT_PATH : PUBLIC_SYSTEM_LOOKUP_LCSC_PATH, body);
    const candidates = parsePublicSystemLookupCandidates(request, lookup), metadata: unknown[] = [];
    withinDeadline();
    for (const candidate of candidates) {
      const value = await readJson(`/api/v2/${isFootprint ? "components" : "devices"}/${candidate.uuid}`);
      validatePublicSystemLookupMetadata(request, candidate, value);
      withinDeadline(); metadata.push(value);
    }
    const result = validatePublicSystemCatalogResult(request, { lookup, metadata }); withinDeadline(); return result;
  } catch {
    // Do not disclose response text, submitted names, code lists or fetch errors.
    throw new Error("PUBLIC_SYSTEM_LOOKUP_REQUEST_REFUSED");
  } finally { clearTimeout(timer); controller.abort(); }
}
