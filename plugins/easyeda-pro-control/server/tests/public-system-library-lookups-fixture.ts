import { PUBLIC_SYSTEM_FOOTPRINT_LIBRARY } from "../src/public-system-footprint.ts";

export const footprintNameRequest = { action: "search-footprints-by-name", name: "R&/0603", confirmNetwork: true };
export const lcscRequest = { action: "get-devices-by-lcsc-ids", lcscIds: ["C1523"], confirmNetwork: true };
export const asset = "a".repeat(32), footprint = "c".repeat(32), symbol = "b".repeat(32);
export const envelope = (result: unknown): Record<string, unknown> => ({ success: true, code: 0, result });
export const serializedEnvelope = (result: unknown): string => JSON.stringify(envelope(result));
export function footprintCandidate(uuid = asset): Record<string, unknown> {
  return { uuid, owner: { uuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY }, display_title: "R&/0603", description: "Test footprint" };
}
export function deviceCandidate(uuid = asset): Record<string, unknown> {
  return { uuid, product_code: "C1523", attributes: { "Supplier Part": "C1523", Symbol: symbol, Footprint: footprint },
    footprint: { uuid: footprint, display_title: "0603" } };
}
export function footprintMetadata(uuid = asset): Record<string, unknown> {
  return { ...footprintCandidate(uuid), path: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, docType: 4, public: true,
    tags: { parent_tag: [], child_tag: [] } };
}
export function deviceMetadata(uuid = asset): Record<string, unknown> {
  return { ...deviceCandidate(uuid), owner: { uuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY }, display_title: "Generic part",
    project_uuid: "", symbol_type: 2, footprint_type: 4, tags: { parent_tag: [], child_tag: [] } };
}
export function lookupResponse(url: string, body: BodyInit | null, options: { status?: number; contentType?: string; contentLength?: string; redirected?: boolean } = {}): Response {
  const result = new Response(body, { status: options.status ?? 200, headers: { "content-type": options.contentType ?? "application/json",
    ...(options.contentLength === undefined ? {} : { "content-length": options.contentLength }) } });
  Object.defineProperty(result, "url", { value: url });
  Object.defineProperty(result, "redirected", { value: options.redirected ?? false }); return result;
}
