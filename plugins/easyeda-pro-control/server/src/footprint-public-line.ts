import { buildDesignOperationCallExpression } from "./design-operations.ts";
import type { DesignSourceIds } from "./design-source-proof.ts";
import type { NativeSourceSnapshot } from "./document-source.ts";
import { assertFootprintProfileSupported, footprintOperationSchema } from "./footprint-action.ts";
import type { FootprintScope } from "./footprint-action.ts";
import { buildFootprintSourceGuard } from "./footprint-lifecycle.ts";

const fields: Readonly<Record<string, string>> = { net: "Net", layer: "Layer", startX: "StartX", startY: "StartY", endX: "EndX", endY: "EndY", lineWidth: "LineWidth", primitiveLock: "PrimitiveLock" };
const sourceFields: Readonly<Record<string, string>> = { net: "netName", layer: "layerId", startX: "startX", startY: "startY", endX: "endX", endY: "endY", lineWidth: "width", primitiveLock: "locked" };

/** Ei/Api explicitly admit type 4. SKe creates a native xe history group and
 * Te.dispatch(LINE,'add/modify/delete') uploads through m6, without full decode.
 * SDK modify drops the done Promise, so this adapter awaits done explicitly.
 */
export function buildFootprintPublicLineExpression(input: unknown, before: NativeSourceSnapshot, scope: FootprintScope, ids: DesignSourceIds = {}): string {
  const operation = footprintOperationSchema.parse(input);
  if (!operation.action.startsWith("footprint.line.")) { throw new Error("Public footprint line adapter requires a line operation."); }
  assertFootprintProfileSupported(operation, before, ids);
  let targetId: string | undefined;
  if ("target" in operation) { targetId = "primitiveId" in operation.target ? operation.target.primitiveId : ids.targetId; }
  const call = { ...operation, action: operation.action.replace("footprint.", "pcb."), ...(targetId === undefined ? {} : { target: { primitiveId: targetId } }) };
  let expression = `return await ${buildDesignOperationCallExpression(call)};`;
  if (operation.action === "footprint.line.modify") {
    const target = before.objects.find((object) => object.id === targetId);
    if (target === undefined || target.type !== "LINE") { throw new Error("Footprint public line target is absent."); }
    if (operation.patch.layer !== undefined && operation.patch.layer !== target.body["layerId"]) { throw new Error("Public footprint line layer changes need a separate reviewed native history adapter."); }
    const baseline = Object.fromEntries(Object.entries(sourceFields).map(([field, key]) => [field, target.body[key]]));
    const patches = Object.entries(operation.patch).map(([field, value]) => {
      const name = fields[field];
      if (name === undefined) { throw new Error("Unsupported public footprint line property."); }
      return `line.setState_${name}(${JSON.stringify(value)});`;
    }).join("\n");
    expression = `
const line=await eda.pcb_PrimitiveLine.get(${JSON.stringify(targetId)});
const baseline=${JSON.stringify(baseline)},fields=${JSON.stringify(fields)};
if(typeof line?.isAsync!=='function'||line.isAsync()!==true||typeof line.done!=='function'||line.getState_PrimitiveId()!==${JSON.stringify(targetId)})throw new Error('FOOTPRINT_LINE_OBJECT_INVALID');
for(const [field,value]of Object.entries(baseline)){const getter=line['getState_'+fields[field]];if(typeof getter!=='function'||getter.call(line)!==value)throw new Error('FOOTPRINT_LINE_BASELINE_DRIFT');}
await contextMatches();
if(stable(parseFootprintSource(await eda.sys_FileManager.getDocumentSource()))!==stable(EXPECTED_SOURCE))throw new Error('FOOTPRINT_LINE_BASELINE_DRIFT');
${patches}
return await line.done();`;
  }
  return `(async()=>{${buildFootprintSourceGuard(before, scope)}\n${expression}\n})()`;
}
