import { z } from "zod";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES, PUBLIC_SYSTEM_FOOTPRINT_ORIGIN,
  PUBLIC_SYSTEM_FOOTPRINT_TIMEOUT_MS } from "./public-system-footprint.ts";
import { PUBLIC_SYSTEM_SYMBOL_EXACT_PATH, parsePublicSystemSymbolExactRequest, validatePublicSystemSymbolExactResult } from "./public-system-symbol-exact.ts";

type RefusalStage = "request" | "headers" | "declared-length" | "body" | "decode" | "projection" | "completion";

/** Diagnostics contain only adapter-owned stages and bounded numeric facts.
 * Never retain fetch/Zod errors, response bodies, headers or request names. */
export class PublicSystemSymbolExactRefusalError extends Error {
  public readonly stage: RefusalStage;
  public readonly httpStatus: number | undefined;
  public readonly receivedBodyBytes: number;
  public readonly schemaIssueCodes: string[];
  public readonly projectionRefusalCode: string | undefined;
  public constructor(stage: RefusalStage, httpStatus: number | undefined, receivedBodyBytes: number, failure: unknown) {
    super("PUBLIC_SYSTEM_SYMBOL_EXACT_REQUEST_REFUSED");
    this.name = "PublicSystemSymbolExactRefusalError";
    this.stage = stage;
    this.httpStatus = httpStatus;
    this.receivedBodyBytes = Math.min(receivedBodyBytes, PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES + 1);
    this.schemaIssueCodes = failure instanceof z.ZodError ? [...new Set(failure.issues.slice(0, 8).map((issue) => issue.code))] : [];
    this.projectionRefusalCode = failure instanceof Error ? ["PUBLIC_SYSTEM_SYMBOL_EXACT_QUERY_IDENTITY", "PUBLIC_SYSTEM_SYMBOL_EXACT_DUPLICATE_IDENTITY",
      "PUBLIC_SYSTEM_SYMBOL_EXACT_RESULT_SIZE", "PUBLIC_SYSTEM_SYMBOL_EXACT_TYPE_WITNESS"].find((code) => code === failure.message) : undefined;
  }
}

/** One anonymous system-owner title lookup. No desktop request modification,
 * credentials, caller-selected destination or public SDK execution. */
export async function readPublicSystemSymbolExact(input: unknown): Promise<Record<string, unknown>> {
  const request = parsePublicSystemSymbolExactRequest(input);
  const url = `${PUBLIC_SYSTEM_FOOTPRINT_ORIGIN}${PUBLIC_SYSTEM_SYMBOL_EXACT_PATH}`;
  const body = JSON.stringify({ titles: [request.name], docType: 2, user_uuids: [PUBLIC_SYSTEM_FOOTPRINT_LIBRARY] });
  const controller = new AbortController(), started = performance.now();
  const assertWithinDeadline = (): void => {
    controller.signal.throwIfAborted();
    if (performance.now() - started >= PUBLIC_SYSTEM_FOOTPRINT_TIMEOUT_MS) { throw new Error("PUBLIC_SYSTEM_SYMBOL_EXACT_DEADLINE"); }
  };
  const timer = setTimeout(() => { controller.abort(); }, PUBLIC_SYSTEM_FOOTPRINT_TIMEOUT_MS);
  timer.unref();
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let bytes = 0, httpStatus: number | undefined, stage: RefusalStage = "request";
  try {
    const response = await fetch(url, { method: "POST", headers: { accept: "application/json", "content-type": "application/json" }, body,
      credentials: "omit", redirect: "error", cache: "no-store", referrerPolicy: "no-referrer", signal: controller.signal });
    assertWithinDeadline();
    stage = "headers";
    if (Number.isInteger(response.status) && response.status >= 0 && response.status <= 599) { httpStatus = response.status; }
    if (response.status !== 200 || response.redirected || response.url !== url || response.body === null ||
        !/^application\/json(?:\s*;\s*charset=utf-8)?$/iu.test(response.headers.get("content-type") ?? "")) {
      throw new Error("PUBLIC_SYSTEM_SYMBOL_EXACT_HTTP_REFUSED");
    }
    stage = "declared-length";
    const declaredLength = response.headers.get("content-length");
    if (declaredLength !== null && (!/^\d{1,10}$/u.test(declaredLength) || Number(declaredLength) > PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES)) {
      throw new Error("PUBLIC_SYSTEM_SYMBOL_EXACT_RESPONSE_SIZE");
    }
    stage = "body";
    reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    for (;;) {
      const chunk = await reader.read(); assertWithinDeadline();
      if (chunk.done) { break; }
      bytes += chunk.value.byteLength;
      if (bytes > PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES) { throw new Error("PUBLIC_SYSTEM_SYMBOL_EXACT_RESPONSE_SIZE"); }
      chunks.push(chunk.value);
    }
    stage = "decode";
    const raw = decodeCurrentPcbDiagnosticJson(Buffer.concat(chunks, bytes));
    assertWithinDeadline();
    stage = "projection";
    const result = validatePublicSystemSymbolExactResult(request, raw);
    stage = "completion";
    assertWithinDeadline(); return result;
  } catch (error: unknown) {
    // Vendor and transport errors can echo the submitted name or remote text.
    throw new PublicSystemSymbolExactRefusalError(stage, httpStatus, bytes, error);
  } finally {
    clearTimeout(timer); controller.abort(); reader?.releaseLock();
  }
}
