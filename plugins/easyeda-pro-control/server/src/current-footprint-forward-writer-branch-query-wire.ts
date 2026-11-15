import { currentFootprintForwardWriterBranchQueryNativeCases, validateCurrentFootprintForwardWriterBranchQueryCommand } from "./current-footprint-forward-writer-branch-query-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentFootprintForwardWriterBranchQueryTemplate(input: unknown): Readonly<{ phase: string; method: string; fields: readonly string[]; values: Readonly<Record<string, string>>; template: string }> {
  const command = validateCurrentFootprintForwardWriterBranchQueryCommand(input), values: Record<string, string> = {};
  const field = (name: string, value: string): string => { values[name] = value; return `__forward_branch_query_${name}__`; };
  const params: Record<string, unknown> = { ...command.params, objectId: field("objectId", command.params.objectId) };
  if (command.method === "Runtime.callFunctionOn") { params["arguments"] = [{ value: field("branchUuid", command.params.arguments[0].value) }]; }
  return freezeDeep({ phase: command.phase, method: command.method, fields: Object.keys(values), values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentFootprintForwardWriterBranchQueryWire(input: unknown, id: number): Readonly<{ command: ReturnType<typeof validateCurrentFootprintForwardWriterBranchQueryCommand>; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) { throw new Error("FORWARD_BRANCH_QUERY_ID"); }
  const command = validateCurrentFootprintForwardWriterBranchQueryCommand(input), row = currentFootprintForwardWriterBranchQueryTemplate(command);
  return freezeDeep({ command, request: { action: "footprint-forward-branch-query", requestId: id, phase: row.phase, method: row.method, ...row.values } });
}
export function currentFootprintForwardWriterBranchQueryTemplates(): readonly ReturnType<typeof currentFootprintForwardWriterBranchQueryTemplate>[] { return freezeDeep(currentFootprintForwardWriterBranchQueryNativeCases().map(value => currentFootprintForwardWriterBranchQueryTemplate(value))); }
