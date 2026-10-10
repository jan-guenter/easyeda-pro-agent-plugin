import { z } from "zod";
import { assertSubset, sha256Json, validatePrivateFingerprint } from "./core.ts";
import { parseDocumentSource } from "./document-source.ts";
import type { EasyedaControlEngine, ExpectedContext } from "./engine.ts";
import { auditPcbRoutes, pcbRouteAuditReportSchema, pcbRouteAuditRequestSchema } from "./pcb-route-audit.ts";

const hash = z.string().regex(/^[a-f0-9]{64}$/u);
const record = z.record(z.string(), z.unknown());
const consistencySchema = z.object({ stable: z.literal(true), attempts: z.literal(2), snapshotSha256: hash,
  contextBinding: z.object({ level: z.literal("active-context-stability-required"), preAndPostChecked: z.literal(true), switchAwayAndBackDetectable: z.literal(false) }).strict() }).strict();
const exactPayloadSchema = z.object({ ok: z.literal(true), kind: z.enum(["pcb-source", "pcb-inventory"]), documentType: z.literal(3), read_consistency: consistencySchema }).loose();
export const routeAuditResultSchema = z.object({ ok: z.literal(true), kind: z.literal("pcb-route-audit"), report: pcbRouteAuditReportSchema,
  proof: z.object({ context: record, fingerprintSha256: hash, sourceBeforeSnapshotSha256: hash, sourceAfterSnapshotSha256: hash,
    inventorySnapshotSha256: hash, sourceSha256: hash, inventorySha256: hash, reportSha256: hash,
    sourceUnchanged: z.literal(true), samplesPerRead: z.literal(2), contextBinding: consistencySchema.shape.contextBinding,
    scope: z.literal("read-only-derived-active-PCB; no native calculation or save; no durable-state certification") }).strict() }).strict();
export type RouteAuditResult = z.infer<typeof routeAuditResultSchema>;
export type RouteAuditEngine = Pick<EasyedaControlEngine, "exactRead" | "assertContext"> & {
  readonly status: () => Promise<{ stableFingerprint: Record<string, unknown> }>;
};
export interface RouteAuditInput { readonly audit: unknown; readonly expectedContext: ExpectedContext; readonly expectedFingerprint: Record<string, unknown>; }

function checkedExactPayload(input: unknown, kind: "pcb-source" | "pcb-inventory"): z.infer<typeof exactPayloadSchema> {
  const value = exactPayloadSchema.parse(input);
  const { read_consistency: consistency, ...sample } = value;
  if (value.kind !== kind || sha256Json(sample) !== consistency.snapshotSha256) { throw new Error("Route audit exact-reader commitment does not match its sample."); }
  return value;
}

/** Only exact reader outputs are accepted. This is pure local computation over
 * source/inventory/source observations, not a native ERC/DRC invocation.
 */
export async function runPcbRouteAudit(engine: RouteAuditEngine, input: RouteAuditInput): Promise<RouteAuditResult> {
  const request = pcbRouteAuditRequestSchema.parse(input.audit);
  const expected = structuredClone(input.expectedContext);
  const fingerprint = structuredClone(input.expectedFingerprint);
  if (expected.document.documentType !== 3) { throw new Error("Route audit requires the exact type-3 PCB, not a preview or library editor."); }
  validatePrivateFingerprint(fingerprint);
  const initialStatus = await engine.status();
  assertSubset(initialStatus.stableFingerprint, fingerprint, "Route audit runtime");
  const context = structuredClone(await engine.assertContext(expected));
  const beforePayload = checkedExactPayload(await engine.exactRead({ kind: "pcb-source" }, context), "pcb-source");
  const inventory = checkedExactPayload(await engine.exactRead({ kind: "pcb-inventory" }, context), "pcb-inventory");
  const afterPayload = checkedExactPayload(await engine.exactRead({ kind: "pcb-source" }, context), "pcb-source");
  const before = parseDocumentSource(z.string().parse(beforePayload["source"]));
  const after = parseDocumentSource(z.string().parse(afterPayload["source"]));
  if (before.sha256 !== after.sha256 || before.document["uuid"] !== (context.document.uuid ?? context.document.documentUuid)) { throw new Error("PCB source changed around the route inventory or has a different document identity."); }
  const report = auditPcbRoutes(before, inventory, request);
  const finalStatus = await engine.status();
  assertSubset(finalStatus.stableFingerprint, fingerprint, "Route audit runtime after measurement");
  await engine.assertContext(context);
  const result = routeAuditResultSchema.parse({ ok: true, kind: "pcb-route-audit", report, proof: {
    context, fingerprintSha256: sha256Json(fingerprint), sourceBeforeSnapshotSha256: beforePayload.read_consistency.snapshotSha256,
    sourceAfterSnapshotSha256: afterPayload.read_consistency.snapshotSha256, inventorySnapshotSha256: inventory.read_consistency.snapshotSha256,
    sourceSha256: report.sourceSha256, inventorySha256: report.inventorySha256, reportSha256: sha256Json(report), sourceUnchanged: true,
    samplesPerRead: 2, contextBinding: inventory.read_consistency.contextBinding,
    scope: "read-only-derived-active-PCB; no native calculation or save; no durable-state certification",
  } });
  if (Buffer.byteLength(JSON.stringify(result), "utf8") > 4 * 1024 * 1024) { throw new Error("Route audit exceeds the 4 MiB report bound; select fewer nets."); }
  return result;
}
