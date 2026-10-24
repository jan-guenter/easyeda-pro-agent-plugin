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

async function serveOwnershipConflict(conflict: FacadeLeaseContentionError): Promise<void> {
  const snapshot = Object.freeze(outputSchema.parse({ ok: false, mode: "ownership-conflict", observation: "startup-snapshot",
    observedAt: new Date().toISOString(), observedOwnerPid: conflict.observedOwnerPid,
    leaseAcquired: false, liveControlAvailable: false, automaticRetry: false, guidance }));
  const server = new McpServer({ name: "easyeda-pro-control", version: CONTROL_VERSION },
    { capabilities: { tools: {} }, instructions: guidance });
  server.registerTool("easyeda_control_status", {
    title: "Explain the EasyEDA ownership conflict",
    description: "Startup-only diagnostic: another live facade held the sole control lease. Returns that recorded conflict only. " +
      "No application access, live process recheck, lease retry, control takeover or other tools are available on this connection.",
    inputSchema: z.object({}).strict(), outputSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, () => ({ isError: true, structuredContent: snapshot, content: [{ type: "text", text: JSON.stringify(snapshot) }] }));
  const done = Promise.withResolvers<null>();
  const close = (): void => { done.resolve(null); };
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
