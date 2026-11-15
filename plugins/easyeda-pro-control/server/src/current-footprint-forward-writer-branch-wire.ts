/** Finite native selectors are only original correlated inspector handles. */
import { currentFootprintForwardWriterBranchNativeCases, validateCurrentFootprintForwardWriterBranchCommand } from "./current-footprint-forward-writer-branch-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentFootprintForwardWriterBranchTemplate(input: unknown): Readonly<{ phase: string; method: string; fields: readonly string[]; values: Readonly<Record<string, string>>; template: string }> {
  const command = validateCurrentFootprintForwardWriterBranchCommand(input), fields: string[] = [], values: Record<string, string> = {};
  const field = (name: string, value: string): string => { if (fields.includes(name)) { throw new Error("FORWARD_WRITER_BRANCH_ALIAS"); } fields.push(name); values[name] = value; return `__forward_branch_${name}__`; };
  const params: Record<string, unknown> = { ...command.params };
  if (command.phase === "forward-writer-branch-arm") { params["location"] = { ...command.params.location, scriptId: field("scriptId", command.params.location.scriptId) }; }
  else if (command.phase === "forward-writer-branch-frame") { params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if (command.phase === "forward-writer-branch-join") { params["objectId"] = field("objectId", command.params.objectId); params["arguments"] = command.params.arguments.map((argument, i) => ({ objectId: field(`argument${String(i)}`, argument.objectId) })); }
  else if (command.phase === "forward-writer-branch-properties") { params["objectId"] = field("objectId", command.params.objectId); }
  else if (command.phase === "forward-writer-branch-remove") { params["breakpointId"] = field("breakpointId", command.params.breakpointId); }
  return freezeDeep({ phase: "role" in command ? `${command.phase}-${command.role}` : command.phase, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentFootprintForwardWriterBranchWire(input: unknown, requestId: number): Readonly<Record<string, string | number>> {
  if (!Number.isSafeInteger(requestId) || requestId < 1) { throw new Error("FORWARD_WRITER_BRANCH_ID"); }
  const fixed = currentFootprintForwardWriterBranchTemplate(input); return freezeDeep({ action: "footprint-forward-writer-branch", requestId, phase: fixed.phase, method: fixed.method, ...fixed.values });
}
export function currentFootprintForwardWriterBranchTemplates(): readonly ReturnType<typeof currentFootprintForwardWriterBranchTemplate>[] { return freezeDeep(currentFootprintForwardWriterBranchNativeCases().map(command => currentFootprintForwardWriterBranchTemplate(command))); }
