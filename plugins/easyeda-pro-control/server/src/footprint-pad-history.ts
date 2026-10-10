import { canonicalJson, isRecord } from "./core.ts";
import { buildDesignOperationCallExpression } from "./design-operations.ts";
import { buildExpectedDesignSource } from "./design-source-proof.ts";
import type { DesignSourceIds } from "./design-source-proof.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";
import { footprintOperationSchema } from "./footprint-action.ts";
import type { FootprintScope } from "./footprint-action.ts";
import { buildFootprintSourceGuard } from "./footprint-lifecycle.ts";

interface PadStep { readonly route: "panel" | "attribute"; readonly key: string; readonly value: string | number }
function number(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) { throw new TypeError(`Incomplete native pad ${field}.`); }
  return value;
}
function simplePad(record: NativeSourceObject): void {
  const body = record.body, shape = body["defaultPad"];
  if (record.type !== "PAD" || !isRecord(shape) || !["ELLIPSE", "OVAL", "RECT"].includes(String(shape["padType"])) ||
      canonicalJson(body["specialPad"]) !== "[]" || ![1, 2, 12].includes(number(body["layerId"], "layer")) ||
      typeof body["num"] !== "string" || !/^[A-Za-z0-9]*$/u.test(body["num"]) || body["netName"] !== "" ||
      (body["parentId"] !== undefined && body["parentId"] !== null && body["parentId"] !== "")) { throw new Error("Pad history requires a standalone, empty-net, canonical simple footprint pad."); }
  if ((body["layerId"] === 12) !== (body["hole"] !== null)) { throw new Error("Pad hole and copper layer are inconsistent."); }
  if (number(shape["width"], "land width") <= 0 || number(shape["height"], "land height") <= 0 || canonicalJson(body["unusedInnerLayers"]) !== "[]" || !["NORMAL", "TEST"].includes(String(body["padType"]))) { throw new Error("Pad history requires complete simple dimensions, no removed inner lands and a normal/test pad."); }
  if (shape["padType"] === "RECT" && (!Number.isInteger(shape["radius"]) || number(shape["radius"], "corner ratio") < 0 || number(shape["radius"], "corner ratio") > 100)) { throw new Error("Native pad property corner ratios have one-percent resolution."); }
}

/** Compile only the reviewed native PAD property keys. Values are absolute,
 * including zero. Native panel position commands bypass rounded UI deltas.
 */
export function buildFootprintPadPropertySteps(input: unknown, before: NativeSourceSnapshot, ids: DesignSourceIds = {}): { readonly targetId: string; readonly padNumber: string; readonly expected: NativeSourceSnapshot; readonly steps: readonly PadStep[] } {
  const operation = footprintOperationSchema.parse(input);
  if (operation.action !== "footprint.pad.modify") { throw new Error("Pad property steps require modify."); }
  const targetId = "primitiveId" in operation.target ? operation.target.primitiveId : ids.targetId;
  const target = before.objects.find((record) => record.id === targetId);
  const unlockOnly = Object.keys(operation.patch).length === 1 && operation.patch.primitiveLock === false;
  if (targetId === undefined || target === undefined || (target.body["locked"] !== false && !(target.body["locked"] === true && unlockOnly))) { throw new Error("Native pad target is absent or locked; unlock it separately."); }
  simplePad(target);
  const expected = buildExpectedDesignSource({ ...operation, action: "pcb.pad.modify", target: { primitiveId: targetId } }, before, { targetId });
  const desired = expected.objects.find((record) => record.id === targetId);
  if (desired === undefined) { throw new Error("Expected pad disappeared."); }
  simplePad(desired);
  const canvas = before.objects.find((record) => record.id === "CANVAS" && record.type === "CANVAS")?.body;
  let factor: number | undefined;
  if (canvas?.["unit"] === "mil") { factor = 1; }
  if (canvas?.["unit"] === "mm") { factor = 0.0254; }
  if (factor === undefined || canvas === undefined) { throw new Error("Pad property unit must be a complete native mil/mm canvas."); }
  const display = (value: unknown, field: string): number => number(value, field) * factor;
  const steps: PadStep[] = [];
  const panel = (key: string, value: string | number): void => { steps.push({ route: "panel", key, value }); };
  const attribute = (key: string, value: string | number): void => { steps.push({ route: "attribute", key, value }); };
  const body = desired.body, patch = operation.patch;
  if (patch.layer !== undefined && patch.layer !== target.body["layerId"] && [patch.pad, patch.hole, patch.holeOffsetX, patch.holeOffsetY, patch.holeRotation, patch.solderMaskAndPasteMaskExpansion].some((value) => value === undefined)) { throw new Error("Pad layer conversion requires explicit land, hole, hole offsets/angle and all mask settings to restore native conversion defaults."); }
  if (patch.layer !== undefined) { panel("layerId", patch.layer); }
  if (patch.padNumber !== undefined) { panel("number", patch.padNumber); }
  if (patch.x !== undefined) { panel("centerX", display(patch.x - number(canvas["originX"], "origin x"), "x")); }
  if (patch.y !== undefined) { panel("centerY", display(patch.y - number(canvas["originY"], "origin y"), "y")); }
  if (patch.rotation !== undefined) { panel("angle", patch.rotation); }
  if (patch.pad !== undefined) {
    attribute("attr-pad-general-shape", patch.pad[0]);
    attribute("attr-pad-general-width", display(patch.pad[1], "width"));
    attribute("attr-pad-general-height", display(patch.pad[2], "height"));
    if (patch.pad[0] === "RECT") { attribute("attr-corner-radius-general", patch.pad[3]); }
  }
  if (patch.hole !== undefined && patch.hole !== null) {
    attribute("attr-pad-hole-shape", patch.hole[0]);
    attribute("attr-pad-hole-width", display(patch.hole[1], "hole width"));
    if (patch.hole[0] === "SLOT") { attribute("attr-pad-hole-length", display(patch.hole[2], "hole length")); }
    // Changing SLOT shape resets its angle in SP; restore the exact desired value.
    attribute("attr-pad-hole-rotation", number(body["relativeAngle"], "hole angle"));
  }
  if (patch.hole === null && body["layerId"] === 12) { throw new Error("Through-hole pads cannot clear the hole without a layer conversion."); }
  if (body["hole"] === null) {
    if (body["padOffsetX"] !== 0 || body["padOffsetY"] !== 0 || (body["relativeAngle"] !== null && body["relativeAngle"] !== 0)) { throw new Error("Surface pad hole offsets must be zero and its absent-hole angle must remain null or zero."); }
    // Native R0603 source carries null for an absent drill. Preserve that exact
    // Representation; accepting it does not convert null to a numeric zero.
    if (body["relativeAngle"] !== target.body["relativeAngle"]) { throw new Error("An absent-hole angle cannot be changed through a hole property command."); }
  } else {
    if (patch.holeOffsetX !== undefined) { attribute("attr-pad-offset-x", display(patch.holeOffsetX, "hole x")); }
    if (patch.holeOffsetY !== undefined) { attribute("attr-pad-offset-y", display(patch.holeOffsetY, "hole y")); }
    if (patch.holeRotation !== undefined) { attribute("attr-pad-hole-rotation", patch.holeRotation); }
  }
  if (patch.metallization !== undefined) { attribute("attr-pad-plated", patch.metallization ? "yes" : "no"); }
  if (patch.solderMaskAndPasteMaskExpansion !== undefined) {
    if (patch.solderMaskAndPasteMaskExpansion === null) { attribute("attr-soldermask-showtype", 1); }
    else {
      if (body["topPasteExpansion"] !== body["bottomPasteExpansion"]) { throw new Error("Native pads use one shared paste expansion."); }
      attribute("attr-soldermask-showtype", 2);
      attribute("attr-soldermask-toplayer", display(body["topSolderExpansion"], "top solder mask"));
      attribute("attr-soldermask-bottomlayer", display(body["bottomSolderExpansion"], "bottom solder mask"));
      attribute("attr-pastemask", display(body["topPasteExpansion"], "paste mask"));
    }
  }
  if (patch.heatWelding !== undefined) {
    if (patch.heatWelding === null) { attribute("attr-pad-thermal-type", 1); }
    else {
      const mode = { Divergent: 0, "Direct-connected": 1, "Non-connected": 2 }[patch.heatWelding.connectionMethod];
      attribute("attr-pad-thermal-type", 2); attribute("attr-pad-connection", mode);
      attribute("attr-spoke-width", display(patch.heatWelding.divergenceLineWidth, "spoke width"));
      attribute("attr-spoke-spacing", display(patch.heatWelding.divergenceSpacing, "spoke spacing"));
      attribute("attr-spoke-angles", number(patch.heatWelding.divergenceAngle, "spoke angle"));
    }
  }
  if (patch.primitiveLock !== undefined) { attribute("attr-locked", patch.primitiveLock ? "yes" : "no"); }
  if (steps.length === 0 || steps.length > 32) { throw new Error("No supported pad fields or too many property steps."); }
  return { targetId, padNumber: String(body["num"]), expected, steps };
}

/** Public create/delete use fKe history. Modify uses fixed native property
 * commands, not the lossy SDK getter/done round trip or truthy pad-modify RPC.
 * Shape changes update native in-memory default-pad tool settings as the UI does.
 */
export function buildFootprintPadHistoryExpression(input: unknown, before: NativeSourceSnapshot, scope: FootprintScope, ids: DesignSourceIds = {}): string {
  const operation = footprintOperationSchema.parse(input);
  if (operation.action !== "footprint.pad.create" && operation.action !== "footprint.pad.modify" && operation.action !== "footprint.pad.delete") { throw new Error("Native pad history requires a footprint pad operation."); }
  if (operation.action !== "footprint.pad.modify") {
    let targetId: string | undefined;
    if (operation.action === "footprint.pad.create") {
      const p = operation.properties;
      if (!/^\d+$/u.test(p.padNumber) || !["ELLIPSE", "OVAL", "RECT"].includes(p.pad[0]) || (p.layer === 12) !== (p.hole !== null) || p.solderMaskAndPasteMaskExpansion !== null || p.heatWelding !== null || p.padType === 2 || (p.hole === null && (p.holeOffsetX !== 0 || p.holeOffsetY !== 0 || p.holeRotation !== 0)) || (p.pad[0] === "RECT" && (!Number.isInteger(p.pad[3]) || p.pad[3] > 100))) { throw new Error("Public pad creation requires a numeric pin, canonical simple normal/test land and explicit default mask/thermal rules; modify custom rules afterward."); }
    } else {
      targetId = "primitiveId" in operation.target ? operation.target.primitiveId : ids.targetId;
      const target = before.objects.find((record) => record.id === targetId);
      if (target === undefined || target.body["locked"] !== false) { throw new Error("Footprint pad delete target is absent or locked."); }
      simplePad(target);
    }
    const call = { ...operation, action: operation.action.replace("footprint.", "pcb."), ...(targetId === undefined ? {} : { target: { primitiveId: targetId } }) };
    return `(async()=>{${buildFootprintSourceGuard(before, scope)}return await ${buildDesignOperationCallExpression(call)};})()`;
  }
  const plan = buildFootprintPadPropertySteps(operation, before, ids);
  return `(async()=>{${buildFootprintSourceGuard(before, scope)}
const PAD_PLAN=${canonicalJson({ targetId: plan.targetId, padNumber: plan.padNumber, steps: plan.steps })};
const frames=[globalThis.window?.top],buses=[],seen=new Set();
for(let index=0;index<frames.length;index++){
  if(frames.length>64)throw new Error('Pad frame bound exceeded');
  const frame=frames[index];if(!frame||seen.has(frame))continue;seen.add(frame);
  let bus;try{bus=frame.MSG_BUS_PCB;for(let child=0;child<frame.frames.length;child++)frames.push(frame.frames[child]);}catch{continue;}
  if(bus&&typeof bus.messageBus?.rpcCall==='function'&&!buses.includes(bus))buses.push(bus);
}
if(buses.length===0||buses.length>8)throw new Error('Pad frame scope unavailable');
let selected;
for(const bus of buses){const identity=(await bus.messageBus.rpcCall('getTabIdAndDocType',{}))?.message;if(identity?.tabId===SCOPE.footprintUuid+'@'+SCOPE.libraryUuid&&identity?.docType===4){if(selected)throw new Error('Duplicate pad frame');selected=bus;}}
if(!selected||typeof selected.messageBus.subscribe!=='function'||typeof selected.messageBus.publish!=='function')throw new Error('Pad property dispatcher unavailable');
if(selected.messageBus.subscribed?.attrUpdate?.length!==1||selected.messageBus.subscribed?.panelModifyPad?.length!==1)throw new Error('Pad property handler profile changed');
const read=async()=>parseFootprintSource((await selected.messageBus.rpcCall('FileSource',{}))?.message);
const rest=state=>({document:state.document,objects:state.objects.filter(record=>record.id!==PAD_PLAN.targetId)});
let previous=await read();
if(stable(previous)!==stable(EXPECTED_SOURCE))throw new Error('Pad source changed before history');
for(const step of PAD_PLAN.steps){
  await contextMatches();if(stable(await read())!==stable(previous))throw new Error('Pad source changed between property steps');
  if(step.route==='panel')selected.messageBus.publish('panelModifyPad',{id:PAD_PLAN.targetId,key:step.key,value:step.value});
  else{
    let handle;const completion=new Promise(resolve=>{handle=selected.messageBus.subscribe('flushSelectingInfo',event=>{if(event?.triggerFrom==='ATTR_PLANE_UPDATE')resolve();});});
    if(!handle||typeof handle.cancel!=='function')throw new Error('Pad completion subscription unavailable');
    try{
      selected.messageBus.publish('attrUpdate',{head:{primitive:['PAD'],action:'modifyPrimitiveDataByPanel',callScene:'CODEX_TYPED_PAD'},body:{PAD:[{'attr-id':PAD_PLAN.targetId,'attr-number':PAD_PLAN.padNumber,[step.key]:step.value}]},noNeedAskingPadMoveOption:true});
      await completion;
    }finally{handle.cancel();}
  }
  const current=await read();await contextMatches();
  if(stable(rest(current))!==stable(rest(EXPECTED_SOURCE))||current.objects.filter(record=>record.id===PAD_PLAN.targetId&&record.type==='PAD').length!==1)throw new Error('Pad history changed unrelated records');
  previous=current;
}
return await eda.pcb_PrimitivePad.get(PAD_PLAN.targetId);
})()`;
}
