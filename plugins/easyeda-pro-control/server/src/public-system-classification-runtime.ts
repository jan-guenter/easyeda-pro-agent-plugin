import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, PUBLIC_SYSTEM_FOOTPRINT_ORIGIN, PUBLIC_SYSTEM_FOOTPRINT_TIMEOUT_MS } from "./public-system-footprint.ts";
import { PUBLIC_SYSTEM_CLASSIFICATION_MAX_RESPONSE_BYTES, PUBLIC_SYSTEM_CLASSIFICATION_PATH,
  publicSystemClassificationRequestSchema, validatePublicSystemClassificationResult } from "./public-system-classification.ts";

/** Fetch one fixed complete public tree; projection never triggers another request. */
export async function readPublicSystemClassification(input: unknown): Promise<Record<string, unknown>> {
  const request = publicSystemClassificationRequestSchema.parse(input);
  const parameters = new URLSearchParams({ user_uuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, path: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY,
    "type[]": request.libraryType });
  const url = `${PUBLIC_SYSTEM_FOOTPRINT_ORIGIN}${PUBLIC_SYSTEM_CLASSIFICATION_PATH}?${parameters}`;
  const controller = new AbortController(), started = performance.now(); let lastTime = started;
  const current = (): void => {
    controller.signal.throwIfAborted(); const now = performance.now();
    if (!Number.isFinite(now) || now < lastTime || now - started >= PUBLIC_SYSTEM_FOOTPRINT_TIMEOUT_MS) {
      throw new Error("PUBLIC_SYSTEM_CLASSIFICATION_DEADLINE");
    }
    lastTime = now;
  };
  const timer = setTimeout(() => { controller.abort(); }, PUBLIC_SYSTEM_FOOTPRINT_TIMEOUT_MS); timer.unref();
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  try {
    if (!Number.isFinite(started)) { throw new TypeError("PUBLIC_SYSTEM_CLASSIFICATION_DEADLINE"); }
    current();
    const response = await fetch(url, { method: "GET", headers: { accept: "application/json", path: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY },
      credentials: "omit", redirect: "error", cache: "no-store", referrerPolicy: "no-referrer", signal: controller.signal });
    current();
    if (response.status !== 200 || response.redirected || response.url !== url || response.body === null ||
        !/^application\/json(?:\s*;\s*charset=utf-8)?$/iu.test(response.headers.get("content-type") ?? "")) {
      throw new Error("PUBLIC_SYSTEM_CLASSIFICATION_HTTP");
    }
    const declaredLength = response.headers.get("content-length");
    if (declaredLength !== null && (!/^\d{1,10}$/u.test(declaredLength) || Number(declaredLength) > PUBLIC_SYSTEM_CLASSIFICATION_MAX_RESPONSE_BYTES)) {
      throw new Error("PUBLIC_SYSTEM_CLASSIFICATION_BYTES");
    }
    reader = response.body.getReader(); const chunks: Uint8Array[] = []; let bytes = 0;
    for (;;) {
      const chunk = await reader.read(); current(); if (chunk.done) { break; }
      bytes += chunk.value.byteLength;
      if (bytes > PUBLIC_SYSTEM_CLASSIFICATION_MAX_RESPONSE_BYTES) { throw new Error("PUBLIC_SYSTEM_CLASSIFICATION_BYTES"); }
      chunks.push(chunk.value);
    }
    const raw = decodeCurrentPcbDiagnosticJson(Buffer.concat(chunks, bytes)); current();
    const output = validatePublicSystemClassificationResult(request, raw); current(); return output;
  } catch {
    // Vendor or network errors can contain submitted names or response content.
    throw new Error("PUBLIC_SYSTEM_CLASSIFICATION_REQUEST_REFUSED");
  } finally { clearTimeout(timer); controller.abort(); reader?.releaseLock(); }
}
