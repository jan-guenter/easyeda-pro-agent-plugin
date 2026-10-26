/** Explicit pinned-Node24 to current209 V8 descriptor projection. Functions,
 * closures, source text, object handles and scopes remain the actual inspector's.
 * Only the two obsolete own properties are removed from the exact captured QA.
 * This synthetic fixture does not establish live runtime admission. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { z } from "zod";
import { CURRENT_PCB_209_WORKER_PRODUCER_LOCATIONS } from "../../src/current-pcb-209-worker-startup-profile.ts";
import { decodeCurrentPcb209WorkerProducerFunction, decodeCurrentPcbStringProducerScopeList } from "../../src/current-pcb-string-producer-scope.ts";
import type { CurrentPcbWorkerConstructionTransport } from "../../src/current-pcb-worker-construction-contract.ts";

export function current209QaDescriptorFixture(transport: CurrentPcbWorkerConstructionTransport): CurrentPcbWorkerConstructionTransport {
  assert.equal(process.versions.node, "24.18.0");
  const captured = new Set<string>();
  const functionReply = z.object({ result: z.object({ type: z.literal("function"), className: z.literal("Function"),
    description: z.string(), objectId: z.string() }).strict() }).strict();
  const descriptor = z.looseObject({ name: z.string() });
  const metadata = z.object({ result: z.array(descriptor).length(5), internalProperties: z.array(descriptor).length(3) }).strict();
  return { ...transport, request: async command => {
    const raw = await transport.request(command);
    if (command.method === "Debugger.evaluateOnCallFrame") {
      const parsed = functionReply.safeParse(raw);
      if (parsed.success && createHash("sha256").update(parsed.data.result.description).digest("hex") ===
          CURRENT_PCB_209_WORKER_PRODUCER_LOCATIONS.debounce.sourceSha256) {
        assert.equal(command.params.expression, "e");
        captured.add(decodeCurrentPcb209WorkerProducerFunction(raw, "debounce"));
      }
    }
    if (command.method !== "Runtime.getProperties" || !captured.has(command.params.objectId)) { return raw; }
    // The pinned Node24 reply must meet the complete five-own-field decoder,
    // Including every flag, its actual script109:163895, prototype and scopes.
    // QA's relative line/column is the same in both fixed source generations.
    const scopes = decodeCurrentPcbStringProducerScopeList(raw, transport.scriptId, "debounce");
    const reply = metadata.parse(raw);
    assert.deepEqual(reply.result.map(item => item.name), ["length", "name", "arguments", "caller", "prototype"]);
    assert.deepEqual(reply.internalProperties.find(item => item.name === "[[FunctionLocation]]")?.["value"], {
      type: "object", subtype: "internal#location", value: { scriptId: transport.scriptId, lineNumber: 109, columnNumber: 163_895 },
      description: "Object",
    });
    assert.equal(typeof scopes, "string");
    return { ...reply, result: reply.result.filter(item => item.name !== "arguments" && item.name !== "caller") };
  } };
}
