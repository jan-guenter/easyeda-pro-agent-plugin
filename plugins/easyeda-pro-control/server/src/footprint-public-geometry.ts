import { canonicalJson } from "./core.ts";
import type { DesignSourceIds } from "./design-source-proof.ts";
import type { NativeSourceSnapshot } from "./document-source.ts";
import { assertFootprintProfileSupported, footprintOperationSchema } from "./footprint-action.ts";
import type { FootprintScope } from "./footprint-action.ts";
import { buildFootprintSourceGuard } from "./footprint-lifecycle.ts";

const align: Readonly<Record<string, number>> = { LEFT_BOTTOM: 3, CENTER_BOTTOM: 6, RIGHT_BOTTOM: 9, LEFT_MIDDLE: 2, CENTER_MIDDLE: 5, RIGHT_MIDDLE: 8, LEFT_TOP: 1, CENTER_TOP: 4, RIGHT_TOP: 7 };
const mapping: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  arc: { net: "netName", layerId: "layerId", startX: "startX", startY: "startY", endX: "endX", endY: "endY", arcAngle: "angle", lineWidth: "width", interactiveMode: "arcType", primitiveLock: "locked" },
  polyline: { net: "netName", layerId: "layerId", polygonSource: "path", lineWidth: "width", primitiveLock: "locked" },
  fill: { net: "netName", layerId: "layerId", polygonSource: "path", lineWidth: "width", primitiveLock: "locked" },
  text: { layer: "layerId", x: "x", y: "y", text: "text", fontFamily: "fontFamily", fontSize: "fontSize", lineWidth: "strokeWidth", alignMode: "origin", rotation: "angle", reverse: "reverse", expansion: "expansion", mirror: "mirror", primitiveLock: "locked" },
};
const primitiveTypes: Readonly<Record<string, string>> = { arc: "ARC", polyline: "POLY", fill: "FILL", text: "STRING" };
const stems: Readonly<Record<string, string>> = { arc: "arc", polyline: "polylines", fill: "fill", text: "string" };

/** The pinned type-4 handlers tKe/gKe/lKe/CKe execute native history groups.
 * Modifiers use their native getter, preserving unrounded internal geometry.
 * Shape-changing POLY/FILL edits are refused before dispatch: the handlers
 * replace objects, and POLY allocates a different ID. Use explicit delete/create.
 */
export function buildFootprintPublicGeometryExpression(input: unknown, before: NativeSourceSnapshot, scope: FootprintScope, ids: DesignSourceIds = {}): string {
  const operation = footprintOperationSchema.parse(input);
  const family = operation.action.split(".")[1] ?? "", verb = operation.action.split(".")[2];
  const fields = mapping[family], stem = stems[family];
  if (fields === undefined || stem === undefined) { throw new Error("Unreviewed footprint public geometry family."); }
  assertFootprintProfileSupported(operation, before, ids);
  let targetId: string | undefined;
  if ("target" in operation) { targetId = "primitiveId" in operation.target ? operation.target.primitiveId : ids.targetId; }
  const target = before.objects.find((object) => object.id === targetId);
  if (verb !== "create" && (target === undefined || target.type !== primitiveTypes[family])) { throw new Error("Footprint public geometry target is absent."); }
  let values: Record<string, unknown> = {};
  if ("properties" in operation) { values = operation.properties; }
  if ("patch" in operation) { values = operation.patch; }
  if (verb === "modify" && values["layer"] !== undefined && values["layer"] !== target?.body["layerId"]) { throw new Error("Footprint public geometry layer changes require a separate native model profile."); }
  if (family === "text" && values["reverse"] === true) { throw new Error("Native default-font text does not support reverse rendering."); }
  if (family === "fill" && (values["fillMode"] !== undefined && values["fillMode"] !== 0)) { throw new Error("Public footprint fill supports only solid mode."); }
  if (family === "fill" && (values["layer"] === 12 || target?.body["layerId"] === 12)) { throw new Error("Slot regions require a separate profile, not an empty-net FILL."); }
  if (family === "arc" && verb !== "delete") {
    const angle = values["arcAngle"] ?? target?.body["angle"];
    const startX = values["startX"] ?? target?.body["startX"], startY = values["startY"] ?? target?.body["startY"];
    const endX = values["endX"] ?? target?.body["endX"], endY = values["endY"] ?? target?.body["endY"];
    if (typeof angle !== "number" || !Number.isFinite(angle) || angle === 0 || Math.abs(angle) >= 360 || (startX === endX && startY === endY)) { throw new Error("Native arc requires distinct endpoints and an angle strictly between zero and a full revolution."); }
  }
  if (verb === "modify") {
    if (family === "text" && values["reverse"] !== undefined && values["reverse"] !== target?.body["reverse"]) { throw new Error("The native default-font modifier refuses every reverse-state change."); }
    if (family === "polyline" && values["polygon"] !== undefined && canonicalJson(values["polygon"]) !== canonicalJson(target?.body["path"])) { throw new Error("Polyline shape replacement requires explicit delete/create with distinct identities."); }
    if (family === "fill" && values["complexPolygon"] !== undefined) { throw new Error("Fill shape replacement requires explicit delete/create."); }
    if (family === "arc" && ![1, 2].includes(Number(target?.body["layerId"])) && ((values["arcAngle"] !== undefined && values["arcAngle"] !== target?.body["angle"]) || (values["interactiveMode"] !== undefined && (values["interactiveMode"] === 1 ? "DOT" : "CENT") !== target?.body["arcType"]))) { throw new Error("The native graphic-arc modifier omits angle/mode changes; use explicit delete/create."); }
  }
  const baseline: Record<string, unknown> = {};
  if (target !== undefined) {
    for (const [key, sourceKey] of Object.entries(fields)) {
      if (!Object.hasOwn(target.body, sourceKey)) { throw new Error("Incomplete footprint geometry source baseline."); }
      baseline[key] = target.body[sourceKey];
    }
    if (family === "arc") {
      if (!["DOT", "CENT"].includes(String(baseline["interactiveMode"]))) { throw new Error("Unknown native arc mode."); }
      baseline["interactiveMode"] = baseline["interactiveMode"] === "DOT" ? 1 : 2;
    }
    if (family === "text") { baseline["alignMode"] = align[String(baseline["alignMode"])]; }
    if (Object.values(baseline).some((value) => value === undefined)) { throw new Error("Incomplete footprint public field mapping."); }
    if (family === "fill") {
      if (!Array.isArray(baseline["polygonSource"]) || baseline["polygonSource"].length !== 1 || !Array.isArray(baseline["polygonSource"][0])) { throw new Error("Public fill modification requires one complete contour without holes."); }
      baseline["polygonSource"] = baseline["polygonSource"][0];
    }
  }
  const argumentsByKey: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (key !== "fillMode") {
      let mapped = key;
      if (key === "layer" && family !== "text" && !(family === "fill" && verb === "create")) { mapped = "layerId"; }
      if (key === "polygon") { mapped = "polygonSource"; }
      if (key === "origin") { mapped = "alignMode"; }
      argumentsByKey[mapped] = key === "origin" ? align[String(value)] : value;
    }
  }
  if (family === "fill" && (verb === "create" || values["lineWidth"] !== undefined)) { argumentsByKey["lineWidth"] = 0.2; }
  if (family === "text" && verb === "create") { argumentsByKey["fontFamily"] = "default"; argumentsByKey["expansion"] = Number(argumentsByKey["expansion"]) / 10; }
  let rawData = "({net:raw.net,layerId:raw.layerId,polygonSource:raw.path?.[0],lineWidth:raw.strokeWidth,primitiveLock:raw.locked})";
  if (family === "arc") { rawData = "({net:raw.net,layerId:raw.layerId,startX:raw.startX,startY:raw.startY,endX:raw.endX,endY:raw.endY,arcAngle:raw.arcAngle,lineWidth:raw.width,interactiveMode:raw.arcType,primitiveLock:raw.locked})"; }
  if (family === "text") { rawData = "({layer:raw.layerId,x:raw.position?.x*10,y:raw.position?.y*10,text:raw.value,fontFamily:raw.fontFamily,fontSize:raw.fontSize*10,lineWidth:raw.strokeWidth*10,alignMode:raw.origin,rotation:raw.rotation*180/Math.PI,reverse:raw.reverse,expansion:raw.reverseExpansion*10,mirror:raw.mirror,primitiveLock:raw.locked})"; }
  let request = "data", resultCheck = "if(typeof result?.primitiveId!=='string'||!/^[a-f0-9]{16}$/.test(result.primitiveId)||EXPECTED_SOURCE.objects.some(item=>item.id===result.primitiveId))throw new Error('FOOTPRINT_HISTORY_RESULT');return {primitiveId:result.primitiveId};";
  if (verb === "delete") { request = "{primitiveIds:[targetId]}"; resultCheck = "if(!Array.isArray(result)||result.length!==1||result[0]!==targetId)throw new Error('FOOTPRINT_HISTORY_RESULT');return true;"; }
  if (verb === "modify") { request = "{primitiveId:targetId,data}"; resultCheck = "if(result===null||typeof result!=='object'||Array.isArray(result)||(result.primitiveId??result.globalIndex)!==targetId)throw new Error('FOOTPRINT_HISTORY_RESULT');return {primitiveId:targetId};"; }
  return `(async()=>{${buildFootprintSourceGuard(before, scope)}
const frames=[globalThis.window?.top],buses=[],seen=new Set();
for(let index=0;index<frames.length;index++){
  if(frames.length>64)throw new Error('FOOTPRINT_HISTORY_FRAME');
  const frame=frames[index];if(!frame||seen.has(frame))continue;seen.add(frame);
  let bus;try{bus=frame.MSG_BUS_PCB;for(let child=0;child<frame.frames.length;child++)frames.push(frame.frames[child]);}catch{continue;}
  if(bus&&typeof bus.messageBus?.rpcCall==='function'&&!buses.includes(bus))buses.push(bus);
}
if(buses.length===0||buses.length>8)throw new Error('FOOTPRINT_HISTORY_FRAME');
let selected;
for(const bus of buses){const identity=(await bus.messageBus.rpcCall('getTabIdAndDocType',{}))?.message;if(identity?.tabId===SCOPE.footprintUuid+'@'+SCOPE.libraryUuid&&identity?.docType===4){if(selected)throw new Error('FOOTPRINT_HISTORY_FRAME');selected=bus;}}
if(!selected)throw new Error('FOOTPRINT_HISTORY_FRAME');
const targetId=${JSON.stringify(targetId ?? null)},patch=${JSON.stringify(argumentsByKey)},baseline=${JSON.stringify(baseline)};
let data=patch;
${verb === "modify" ? `
const rows=(await selected.messageBus.rpcCall('pcb/extensionAPI/${stem}-getByIds',{primitiveIds:[targetId]}))?.message;
if(!Array.isArray(rows)||rows.length!==1||rows[0]?.globalIndex!==targetId)throw new Error('FOOTPRINT_HISTORY_IDENTITY');
const raw=rows[0],preserved=${rawData};
const rounded=value=>{if(typeof value==='number'){if(!Number.isFinite(value))throw new Error('FOOTPRINT_HISTORY_BASELINE');return Math.round(value*10000+1e-10)/10000;}if(Array.isArray(value))return value.map(rounded);if(value===undefined||value!==null&&typeof value==='object')throw new Error('FOOTPRINT_HISTORY_BASELINE');return value;};
for(const[key,value]of Object.entries(baseline)){if(stable(rounded(preserved[key]))!==stable(value))throw new Error('FOOTPRINT_HISTORY_BASELINE');}
data={...preserved,...patch};` : ""}
await contextMatches();
const current=(await selected.messageBus.rpcCall('FileSource',{}))?.message;
if(stable(parseFootprintSource(current))!==stable(EXPECTED_SOURCE))throw new Error('FOOTPRINT_HISTORY_BASELINE');
const result=(await selected.messageBus.rpcCall('pcb/extensionAPI/${stem}-${verb}',${request}))?.message;
${resultCheck}
})()`;
}
