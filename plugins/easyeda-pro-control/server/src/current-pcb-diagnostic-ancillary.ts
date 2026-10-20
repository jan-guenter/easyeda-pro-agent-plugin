/** Fixed source-shaped resize-sensor owner, not an editor or native-registry
 * ownership proof. UI3823ed6e qdr@16392225/eut.observe@16392778 creates this
 * OBJECT. About:blank alone is never an admission. No DOM method is invoked. */
import { diagnosticExact, diagnosticRecord } from "./current-pcb-diagnostic-protocol.ts";

type Row = Readonly<Record<string, unknown>>;
function refuse(): never { throw new Error("PCB_DIAGNOSTIC_ANCILLARY_OWNER"); }
function positive(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0 && value <= 2_147_483_647;
}
const STYLE: Readonly<Record<string, readonly string[]>> = Object.freeze({
  display: ["block"], position: ["absolute"], top: ["0", "0px"], left: ["0", "0px"],
  width: ["100%"], height: ["100%"], border: ["none", "0px none", "0px"],
  padding: ["0", "0px"], margin: ["0", "0px"], opacity: ["0"], "z-index": ["-1000"], "pointer-events": ["none"],
});
function style(value: string): void {
  // Admit only these source-set declarations and equivalent zero serialization.
  // No selector, cascade, shorthand expansion, !important, duplicate or unknown
  // Declaration. This is a shape check, not proof of computed/visible geometry.
  const declarations = value.split(";"), seen = new Set<string>();
  if (declarations.at(-1)?.trim() === "") { declarations.pop(); }
  if (declarations.length !== Object.keys(STYLE).length) { refuse(); }
  for (const declaration of declarations) {
    const fields = declaration.trim().split(":");
    const content = fields[1]?.trim(), name = fields[0]?.trim();
    if (fields.length !== 2 || name === undefined || content === undefined || seen.has(name) ||
        !Object.hasOwn(STYLE, name) || STYLE[name]?.includes(content) !== true) { refuse(); }
    seen.add(name);
  }
}
/** The owner must supply replies from its retained child frame and original
 * parent session. Returned bytes are comparison data, never a fresh selector. */
export function diagnosticAncillaryOwner(frameId: string, ownerReply: Row, describeReply: Row): Readonly<{
  backendNodeId: number; attributes: readonly string[];
}> {
  const backend = ownerReply["backendNodeId"], node = describeReply["node"];
  if (!positive(backend) ||
      !diagnosticExact(ownerReply, ownerReply["nodeId"] === undefined ? ["backendNodeId"] : ["backendNodeId", "nodeId"]) ||
      ownerReply["nodeId"] !== undefined && !positive(ownerReply["nodeId"]) ||
      !diagnosticExact(describeReply, ["node"]) || !diagnosticRecord(node) || node["backendNodeId"] !== backend ||
      node["nodeType"] !== 1 || node["nodeName"] !== "OBJECT" || node["localName"] !== "object" || node["frameId"] !== frameId ||
      !Array.isArray(node["attributes"]) || node["attributes"].length !== 10) { return refuse(); }
  const attributes = new Map<string, string>(), copied: string[] = [], raw: unknown[] = node["attributes"];
  for (let index = 0; index < raw.length; index += 2) {
    const key = raw[index], value = raw[index + 1];
    if (typeof key !== "string" || typeof value !== "string" || key.length > 32 || value.length > 1024 ||
        !value.isWellFormed() || value.includes("\0") || attributes.has(key)) { return refuse(); }
    attributes.set(key, value);
    copied.push(key, value);
  }
  if (attributes.get("tabindex") !== "-1" || attributes.get("type") !== "text/html" ||
      attributes.get("aria-hidden") !== "true" || attributes.get("data") !== "about:blank" ||
      !attributes.has("style")) { return refuse(); }
  style(attributes.get("style") ?? "");
  return Object.freeze({ backendNodeId: backend, attributes: Object.freeze(copied) });
}
