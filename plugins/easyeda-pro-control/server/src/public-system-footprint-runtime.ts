import { PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES, PUBLIC_SYSTEM_FOOTPRINT_ORIGIN,
  PUBLIC_SYSTEM_FOOTPRINT_TIMEOUT_MS, parsePublicSystemFootprintRequest, validatePublicSystemFootprintResult } from "./public-system-footprint.ts";

/** Separate network task, not a bridge/SDK dispatch or installation admission.
 * No caller-controlled destination, authentication, redirect or retry route. */
export async function readPublicSystemFootprint(input: unknown): Promise<Record<string, unknown>> {
  const request = parsePublicSystemFootprintRequest(input);
  const url = `${PUBLIC_SYSTEM_FOOTPRINT_ORIGIN}/api/v2/components/${request.footprintUuid}`;
  const controller = new AbortController();
  const started = performance.now();
  const assertWithinDeadline = (): void => {
    controller.signal.throwIfAborted();
    if (performance.now() - started >= PUBLIC_SYSTEM_FOOTPRINT_TIMEOUT_MS) { throw new Error("PUBLIC_SYSTEM_FOOTPRINT_DEADLINE"); }
  };
  const timer = setTimeout(() => { controller.abort(); }, PUBLIC_SYSTEM_FOOTPRINT_TIMEOUT_MS);
  timer.unref();
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  try {
    const response = await fetch(url, { method: "GET", headers: { accept: "application/json", path: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY },
      credentials: "omit", redirect: "error", cache: "no-store", referrerPolicy: "no-referrer", signal: controller.signal });
    assertWithinDeadline();
    if (response.status !== 200 || response.redirected || response.url !== url || response.body === null ||
        !/^application\/json(?:\s*;\s*charset=utf-8)?$/iu.test(response.headers.get("content-type") ?? "")) {
      throw new Error("PUBLIC_SYSTEM_FOOTPRINT_HTTP_REFUSED");
    }
    const declaredLength = response.headers.get("content-length");
    if (declaredLength !== null && (!/^\d{1,10}$/u.test(declaredLength) || Number(declaredLength) > PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES)) {
      throw new Error("PUBLIC_SYSTEM_FOOTPRINT_RESPONSE_SIZE");
    }
    reader = response.body.getReader();
    const chunks: Uint8Array[] = []; let bytes = 0;
    for (;;) {
      const chunk = await reader.read(); assertWithinDeadline();
      if (chunk.done) { break; }
      bytes += chunk.value.byteLength;
      if (bytes > PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES) { throw new Error("PUBLIC_SYSTEM_FOOTPRINT_RESPONSE_SIZE"); }
      chunks.push(chunk.value);
    }
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks, bytes));
    const raw: unknown = JSON.parse(decoded);
    assertWithinDeadline();
    const result = validatePublicSystemFootprintResult(request, raw);
    assertWithinDeadline(); return result;
  } catch {
    // Raw network and vendor messages may contain untrusted text. The fixed
    // Error preserves no success/absence claim and reveals no vendor text.
    throw new Error("PUBLIC_SYSTEM_FOOTPRINT_LOOKUP_REFUSED");
  } finally {
    clearTimeout(timer); controller.abort(); reader?.releaseLock();
  }
}
