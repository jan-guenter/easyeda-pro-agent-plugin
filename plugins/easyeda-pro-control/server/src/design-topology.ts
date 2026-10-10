import { z } from "zod";
import { canonicalJson, isRecord } from "./core.ts";
import type { EasyedaControlEngine, ExpectedContext } from "./engine.ts";

const identity = z.string().min(1).max(512);
const pin = z.object({ pinNumber: identity, net: z.string().max(512).nullable() }).strict();
export const designTopologySchema = z.array(z.object({ uniqueId: identity, designator: z.string().max(512).nullable(), pins: z.array(pin).max(4096) }).strict()).max(20_000)
  .superRefine((value, context) => {
    if (new Set(value.map((entry) => entry.uniqueId)).size !== value.length || value.some((entry) => new Set(entry.pins.map((item) => item.pinNumber)).size !== entry.pins.length)) {
      context.addIssue({ code: "custom", message: "Topology identities must be unique." });
    }
  });
export type DesignTopology = z.infer<typeof designTopologySchema>;

function normalized(input: unknown): DesignTopology {
  return designTopologySchema.parse(input).map((entry) => ({ uniqueId: entry.uniqueId, designator: entry.designator, pins: entry.pins.toSorted((a, b) => a.pinNumber.localeCompare(b.pinNumber)) }))
    .toSorted((a, b) => a.uniqueId.localeCompare(b.uniqueId));
}

/** Compiled endpoints are independent of the native wire/attribute effect proof. */
export async function readDesignTopology(engine: EasyedaControlEngine, context: ExpectedContext): Promise<DesignTopology> {
  if (context.document.documentType !== 1) { throw new Error("Compiled topology requires the schematic editor."); }
  const result = await engine.exactRead({ kind: "schematic-topology" }, context);
  if (!isRecord(result)) { throw new TypeError("Compiled topology payload is absent."); }
  return normalized(result["compiledConnectivity"]);
}

export function verifyDesignTopology(expected: unknown, actual: unknown): void {
  if (canonicalJson(normalized(expected)) !== canonicalJson(normalized(actual))) {
    throw new Error("Compiled component/pin/net endpoints differ from the explicit transaction topology; no save is authorized.");
  }
}
