import { z } from "zod";
import { sha256Json } from "./core.ts";
import { designTopologySchema, verifyDesignTopology } from "./design-topology.ts";
import type { DesignTopology } from "./design-topology.ts";
import { schematicNativeSnapshotSchema } from "./schematic-native-adapter.ts";
import type { SchematicNativeComponent } from "./schematic-native-adapter.ts";

const generatedNet = /^\$[0-9]+N[0-9]+$/u;
const identity = z.string().min(1).max(512);
const misnamedPinsSchema = z.array(z.object({
  componentId: identity, pinId: identity, expectedNet: identity,
  observedNet: z.string().max(512).regex(generatedNet), wireId: z.string().regex(/^[a-f0-9]{16}$/u),
}).strict()).min(1).max(4096);
type Attribute = SchematicNativeComponent["attributes"][number];
interface BoundPin {
  readonly componentId: string; readonly pinId: string; readonly uniqueId: string; readonly designator: string;
  readonly pinNumber: string; readonly expectedNet: string; readonly observedNet: string; readonly wireId: string;
}
export interface LayoutWireGroupRepairTopologyProof {
  readonly profile: "easyeda-pro-control.layout-wire-group-repair-topology.v1";
  readonly componentCount: number; readonly pinCount: number;
  readonly beforeTopologySha256: string; readonly currentTopologySha256: string;
  readonly changedPins: readonly BoundPin[];
}

function attributeValue(attributes: readonly Attribute[], ownerId: string, key: string): string {
  const selected = attributes.filter((entry) => entry.key === key);
  const attribute = selected[0];
  if (selected.length !== 1 || attribute === undefined || attribute.body["parentId"] !== ownerId || attribute.body["key"] !== key ||
      attribute.instanceValue !== null || attribute.body["value"] !== attribute.blockValue ||
      attribute.value !== (attribute.blockValue ?? attribute.symbolValue) || typeof attribute.value !== "string" || attribute.value.length === 0) {
    throw new Error("Ground repair pin identity lacks exact stored or inherited native attributes.");
  }
  return attribute.value;
}

function ordered(topology: DesignTopology): DesignTopology {
  return topology.map((part) => ({ ...part, pins: part.pins.toSorted((a, b) => a.pinNumber.localeCompare(b.pinNumber)) }))
    .toSorted((a, b) => a.uniqueId.localeCompare(b.uniqueId));
}

/** Admit only the deterministic wire-group repair's named-to-generated pin
 * differences. Geometry/wire ownership is proved separately by its sealed
 * source descriptor. This is a pre-write check, never a topology override:
 * after correction the ordinary verifier must require the original topology.
 */
export function verifyLayoutWireGroupRepairTopology(beforeNative: unknown, beforeTopology: unknown, currentTopology: unknown,
  misnamedPins: unknown): LayoutWireGroupRepairTopologyProof {
  const native = schematicNativeSnapshotSchema.parse(beforeNative);
  const original = ordered(designTopologySchema.parse(beforeTopology));
  const current = ordered(designTopologySchema.parse(currentTopology));
  const misnamed = misnamedPinsSchema.parse(misnamedPins);
  const pinIds = native.components.flatMap((component) => component.pins.map((pin) => pin.id));
  if (new Set(pinIds).size !== pinIds.length) { throw new Error("Ground repair native pin identities are ambiguous."); }
  const components = new Map(native.components.map((component) => [component.id, component]));
  const identities = new Map<string, { uniqueId: string; designator: string }>();
  const uniqueIds = new Set<string>();
  for (const component of native.components.filter((entry) => entry.kind === "part")) {
    const uniqueId = attributeValue(component.attributes, component.id, "Unique ID");
    const designator = attributeValue(component.attributes, component.id, "Designator");
    if (uniqueIds.has(uniqueId)) { throw new Error("Ground repair real-part identities are duplicated."); }
    uniqueIds.add(uniqueId); identities.set(component.id, { uniqueId, designator });
  }
  const originalById = new Map(original.map((part) => [part.uniqueId, part]));
  const existingNets = new Set(original.flatMap((part) => part.pins.map((pin) => pin.net)));
  const admitted = structuredClone(original);
  const admittedById = new Map(admitted.map((part) => [part.uniqueId, part]));
  const selectedPins = new Set<string>();
  const selectedEndpoints = new Set<string>();
  const wireNames = new Map<string, string>();
  const generatedOwners = new Map<string, string>();
  const changedPins: BoundPin[] = [];
  for (const change of misnamed) {
    const component = components.get(change.componentId), identityValue = identities.get(change.componentId);
    const pin = component?.pins.find((entry) => entry.id === change.pinId);
    if (component?.kind !== "part" || identityValue === undefined || pin === undefined || selectedPins.has(pin.id) ||
        pin.net !== change.expectedNet || generatedNet.test(change.expectedNet) || existingNets.has(change.observedNet)) {
      throw new Error("Ground repair names an extra, duplicate, non-part or mismatched native pin/net.");
    }
    if (pin.noConnect !== null && (pin.noConnect.value !== "no" || pin.noConnect.body["value"] !== "no" ||
        pin.noConnect.body["parentId"] !== pin.id || pin.noConnect.body["key"] !== "NO_CONNECT")) {
      throw new Error("Ground repair cannot admit an NC or malformed NC record.");
    }
    const pinNumber = attributeValue(pin.attributes, pin.id, "Pin Number");
    const endpoint = JSON.stringify([identityValue.uniqueId, pinNumber]);
    const originalPart = originalById.get(identityValue.uniqueId);
    const originalPin = originalPart?.pins.find((entry) => entry.pinNumber === pinNumber);
    const admittedPin = admittedById.get(identityValue.uniqueId)?.pins.find((entry) => entry.pinNumber === pinNumber);
    if (selectedEndpoints.has(endpoint) || originalPart?.designator !== identityValue.designator || originalPin?.net !== change.expectedNet || admittedPin === undefined) {
      throw new Error("Ground repair native identity does not bind one original compiled endpoint.");
    }
    const naming = JSON.stringify([change.expectedNet, change.observedNet]);
    if ((wireNames.has(change.wireId) && wireNames.get(change.wireId) !== naming) ||
        (generatedOwners.has(change.observedNet) && generatedOwners.get(change.observedNet) !== change.wireId)) {
      throw new Error("Ground repair wire identity and generated net naming disagree.");
    }
    selectedPins.add(pin.id); selectedEndpoints.add(endpoint);
    wireNames.set(change.wireId, naming); generatedOwners.set(change.observedNet, change.wireId);
    admittedPin.net = change.observedNet;
    changedPins.push({ ...change, ...identityValue, pinNumber });
  }
  // This includes every off-sheet component, identity, pin and net. Omitted
  // Changes, extra changes and changes to a pin's actual name all fail here.
  verifyDesignTopology(admitted, current);
  return { profile: "easyeda-pro-control.layout-wire-group-repair-topology.v1", componentCount: original.length,
    pinCount: original.reduce((count, part) => count + part.pins.length, 0), beforeTopologySha256: sha256Json(original),
    currentTopologySha256: sha256Json(current), changedPins };
}
