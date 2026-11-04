/** A second chat can explain a live-owner refusal without acquiring control.
 * This branch allocates no upstream, gateway, native owner or design engine.
 * It never retries the lease, even after the original owner exits. */
import process from "node:process";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { CONTROL_VERSION } from "./core.ts";
import type { ControlRootCapability } from "./control-root.ts";
import { FacadeLeaseContentionError, acquireFacadeLease } from "./lease.ts";
import type { FacadeLease } from "./lease.ts";

const guidance = "Another EasyEDA control connection owned the live facade at startup. Use that original connection. " +
  "This connection exposes only the recorded ownership conflict and cannot control EasyEDA. " +
  "After the original connection releases its owner normally, open a fresh MCP connection. " +
  "This snapshot does not prove the owner is still alive and does not authorize terminating it or removing its lease.";
const outputSchema = z.object({
  ok: z.literal(false), mode: z.literal("ownership-conflict"), observation: z.literal("startup-snapshot"),
  observedAt: z.iso.datetime(), observedOwnerPid: z.number().int().positive(),
  leaseAcquired: z.literal(false), liveControlAvailable: z.literal(false), automaticRetry: z.literal(false),
  guidance: z.literal(guidance),
}).strict();
const closeConflictRequestSchema = z.object({ action: z.literal("close-conflict"), confirmCloseConflict: z.literal(true) }).strict();
const conflictSessionRequestSchema = z.discriminatedUnion("action", [z.object({ action: z.literal("inspect") }).strict(), closeConflictRequestSchema]);
const conflictSessionInspectionSchema = z.object({
  schema: z.literal("easyeda-pro-control.ownership-conflict-session.v1"), pid: z.number().int().positive(),
  state: z.literal("ownership-conflict"), observation: z.literal("startup-snapshot"), observedOwnerPid: z.number().int().positive(),
  leaseAcquired: z.literal(false), liveControlAvailable: z.literal(false), automaticRetry: z.literal(false), admissionGranted: z.literal(false),
}).strict();
const closeConflictResultSchema = z.object({
  schema: z.literal("easyeda-pro-control.ownership-conflict-close-scheduled.v1"),
  pid: z.number().int().positive(),
  leaseAcquired: z.literal(false), liveControlAvailable: z.literal(false), automaticRetry: z.literal(false),
  closeScheduled: z.literal(true), deliveryAcknowledged: z.literal(false), processExitProved: z.literal(false), retryAllowed: z.literal(false),
}).strict();
const conflictSessionResultSchema = z.union([conflictSessionInspectionSchema, closeConflictResultSchema]);

async function serveOwnershipConflict(conflict: FacadeLeaseContentionError): Promise<void> {
  const snapshot = Object.freeze(outputSchema.parse({ ok: false, mode: "ownership-conflict", observation: "startup-snapshot",
    observedAt: new Date().toISOString(), observedOwnerPid: conflict.observedOwnerPid,
    leaseAcquired: false, liveControlAvailable: false, automaticRetry: false, guidance }));
  const server = new McpServer({ name: "easyeda-pro-control", version: CONTROL_VERSION },
    { capabilities: { tools: {} }, instructions: guidance });
  const done = Promise.withResolvers<null>();
  let closing = false;
  const close = (): void => { closing = true; done.resolve(null); };
  server.registerTool("easyeda_control_status", {
    title: "Explain the EasyEDA ownership conflict",
    description: "Startup-only diagnostic: another live facade held the sole control lease. Returns that recorded conflict only. " +
      "No application access, live process recheck, lease retry, control takeover or other tools are available on this connection.",
    inputSchema: z.object({}).strict(), outputSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, () => {
    if (closing) { throw new Error("This non-owning connection has consumed its close request; no further snapshot work is admitted."); }
    return { isError: true, structuredContent: snapshot, content: [{ type: "text", text: JSON.stringify(snapshot) }] };
  });
  server.registerTool("easyeda_control_session", {
    title: "Inspect or close this non-owning EasyEDA conflict connection",
    description: "Inspect or close only this startup-only ownership-conflict server. This branch has acquired no lease, upstream, gateway, engine or native owner and never retries ownership. inspect reports this server's PID for independent process observation; observedOwnerPid remains the old startup snapshot, not current ownership. action:close-conflict with confirmCloseConflict:true consumes one local request and schedules this server's normal shutdown. Its result proves neither reply delivery nor process exit. Observe this original process exiting independently and never retry an unknown close. It cannot close or signal the observed owner, terminate EasyEDA, adopt a native owner or enable another tool.",
    inputSchema: z.object({ request: conflictSessionRequestSchema }).strict(),
    outputSchema: z.object({ result: conflictSessionResultSchema }).strict(),
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  }, ({ request }) => {
    if (closing) { throw new Error("This non-owning connection-close request is already consumed; do not retry it."); }
    if (request.action === "inspect") {
      return { content: [], structuredContent: { result: {
        schema: "easyeda-pro-control.ownership-conflict-session.v1", pid: process.pid,
        state: "ownership-conflict", observation: "startup-snapshot", observedOwnerPid: snapshot.observedOwnerPid,
        leaseAcquired: false, liveControlAvailable: false, automaticRetry: false, admissionGranted: false,
      } } };
    }
    closing = true;
    // This branch owns no native resources. Defer normal server closure so the
    // SDK can attempt its final reply, without claiming delivery or exit.
    setImmediate(close);
    return { content: [], structuredContent: { result: {
      schema: "easyeda-pro-control.ownership-conflict-close-scheduled.v1", pid: process.pid, leaseAcquired: false,
      liveControlAvailable: false, automaticRetry: false, closeScheduled: true,
      deliveryAcknowledged: false, processExitProved: false, retryAllowed: false,
    } } };
  });
  process.stdin.once("end", close); process.once("SIGINT", close); process.once("SIGTERM", close);
  try { await server.connect(new StdioServerTransport()); await done.promise; }
  finally {
    process.stdin.removeListener("end", close); process.removeListener("SIGINT", close); process.removeListener("SIGTERM", close);
    await server.close();
  }
}

export async function acquireFacadeLeaseOrDiagnose(root: ControlRootCapability): Promise<FacadeLease | null> {
  try { return await acquireFacadeLease(root); }
  catch (error) {
    // Lease acquisition closes the retained root before rethrowing. A failed
    // Descriptor close produces AggregateError and must not enter this branch.
    if (!(error instanceof FacadeLeaseContentionError)) { throw error; }
    await serveOwnershipConflict(error); return null;
  }
}
