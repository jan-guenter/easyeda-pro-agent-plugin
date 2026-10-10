import { canonicalJson, sha256Json } from "./core.ts";
import { buildReviewedNativeSourceMerge } from "./design-native-adapter.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";

export const NATIVE_STACK_PERSISTENCE_PROFILE = "easyeda-pro-control.native-stack-persistence.v1";

/** Qfe.getDialog synchronously constructs mfe and publishes openDialog. Capture
 * only that newly constructed object; never open, modify or close a UI dialog.
 * The interceptor has no awaited boundary and restores the exact descriptor.
 */
export const CAPTURE_NATIVE_STACK_HANDLER_CODE = `
const captureNativeStackHandler = bus => {
  if (!bus || typeof bus.publish !== 'function' || typeof bus.messageBus?.publish !== 'function' ||
      !Array.isArray(bus.messageBus.subscribed?.openMainDialog) || bus.messageBus.subscribed.openMainDialog.length !== 1) throw new Error('Native stack dispatcher profile unavailable');
  const own = Object.getOwnPropertyDescriptor(bus,'publish');
  if ((own && (own.configurable !== true || !Object.hasOwn(own,'value'))) || (!own && !Object.isExtensible(bus))) throw new Error('Native stack dispatcher cannot be scoped safely');
  const original = bus.publish;
  let captured, opened=0, masks=0, violation=false;
  const intercept = function(topic,value,...rest) {
    if (rest.length !== 0) {violation=true;throw new Error('Foreign native stack publication');}
    if (topic === 'TempMaskRightClickMenu' && value === '' && ++masks === 1) return;
    if (topic === 'openDialog' && ++opened === 1 && value && typeof value.applyLayerPhysConfig === 'function' && typeof value.getPhyZIndex === 'function') { captured=value; return; }
    violation=true;throw new Error('Unexpected native stack handler publication');
  };
  Object.defineProperty(bus,'publish',{value:intercept,writable:true,configurable:true});
  let displaced=false;
  try { bus.messageBus.publish('openMainDialog',{cmd:15,data:{}}); }
  finally {
    displaced=bus.publish!==intercept;
    if (own) Object.defineProperty(bus,'publish',own); else if (!Reflect.deleteProperty(bus,'publish')) throw new Error('Native stack interceptor cleanup failed');
    if (bus.publish!==original || displaced) throw new Error('Native stack dispatcher changed during capture');
  }
  if (violation || masks!==1 || opened!==1 || !captured) throw new Error('Native stack handler was not captured exactly once');
  return captured;
};
`;

function identity(object: NativeSourceObject): number {
  const value: unknown = JSON.parse(object.id);
  if (!Array.isArray(value) || value.length !== 2 || value[0] !== object.type || typeof value[1] !== "number") {throw new Error("Invalid native stack record identity.");}
  return value[1];
}

/** Physical-only native handler resets substrate presentation while constructing
 * those layer models. The following source merge restores it before upload.
 */
export function expectedNativeStackIntermediate(before: NativeSourceSnapshot, expected: NativeSourceSnapshot): NativeSourceSnapshot {
  const original = new Map(before.objects.map((object) => [object.id, object]));
  const objects = expected.objects.map((object): NativeSourceObject => {
    if (object.type !== "LAYER") {return object;}
    if (object.body["layerType"] !== "SUBSTRATE") {
      const previous = original.get(object.id);
      if (previous?.type !== "LAYER") {throw new Error("Stack cannot invent copper/surface layer identities.");}
      return previous;
    }
    return { id: object.id, type: object.type, body: { layerId: identity(object), layerType: "SUBSTRATE", layerName: object.body["layerName"],
      use: false, show: false, locked: false, activeColor: "#000000", activateTransparency: 0, inactiveColor: "#000000", inactiveTransparency: object.body["inactiveTransparency"] } };
  });
  const base = { schema: before.schema, document: before.document, objects };
  return { ...base, sha256: sha256Json(base) };
}

export function buildNativeStackPersistenceCode(before: NativeSourceSnapshot, expected: NativeSourceSnapshot): string {
  const intermediate = expectedNativeStackIntermediate(before, expected);
  const merge = buildReviewedNativeSourceMerge(intermediate, expected);
  const physical = expected.objects.filter((object) => object.type === "LAYER_PHYS").toSorted((left, right) => Number(left.body["zIndex"]) - Number(right.body["zIndex"]));
  const rows = physical.map((object) => {
    const layerId = identity(object);
    const layer = expected.objects.find((entry) => entry.type === "LAYER" && identity(entry) === layerId);
    if (layer === undefined || typeof object.body["thickness"] !== "number") {throw new Error("Native physical layer is incomplete.");}
    return { "Layer Id": layerId, Layer: layer.body["layerName"], Type: layer.body["layerType"] === "SUBSTRATE" ? "Substrate" : "Copper",
      Material: object.body["material"], Thickness: object.body["thickness"] * 0.0254, Permittivity: object.body["permittivity"],
      "Loss Tangent": object.body["lossTangent"], IsKeepIsLand: object.body["isKeepIsland"] === true ? 1 : 0, zIndex: object.body["zIndex"] };
  });
  const uploadIds = expected.objects.filter((object) => object.type === "LAYER" && canonicalJson(before.objects.find((old) => old.id === object.id) ?? null) !== canonicalJson(object)).map((object) => identity(object));
  for (const object of expected.objects) {
    if (object.type === "LAYER" && object.body["layerType"] === "SUBSTRATE" && !uploadIds.includes(identity(object))) {uploadIds.push(identity(object));}
  }
  return `
const STACK_BEFORE=${canonicalJson({ document: before.document, objects: before.objects })};
const STACK_ROWS=${canonicalJson(rows)};
const STACK_UPLOAD_IDS=${canonicalJson(uploadIds)};
const stackCanonical=value=>Array.isArray(value)?'['+value.map(stackCanonical).join(',')+']':value!==null&&typeof value==='object'?'{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+stackCanonical(value[key])).join(',')+'}':JSON.stringify(value);
const stackParse=source=>{
  if(typeof source!=='string'||source.length>67108864)throw new Error('Native stack source unavailable');
  const rows=source.split('|\\n').filter(Boolean).map(line=>{const split=line.indexOf('||');if(split<1)throw new Error('Native stack record invalid');return{header:JSON.parse(line.slice(0,split)),body:JSON.parse(line.slice(split+2))};});
  if(rows[0]?.header.type!=='DOCHEAD'||rows.length>500000)throw new Error('Native stack document invalid');
  const document={...rows[0].body};delete document.client;delete document.version;delete document.updateTime;
  const objects=rows.slice(1).map(row=>({id:row.header.id,type:row.header.type,body:row.body})).sort((a,b)=>a.id.localeCompare(b.id));
  if(new Set(objects.map(object=>object.id)).size!==objects.length)throw new Error('Native stack identities invalid');
  return{document,objects};
};
if(EXPECTED_DOCUMENT_TYPE!==3||STACK_BEFORE.document.uuid!==EXPECTED_DOCUMENT_UUID)throw new Error('Native stack requires exact PCB context');
const stackWindows=[globalThis.window?.top],stackBuses=[],stackSeen=new Set();
for(let index=0;index<stackWindows.length;index++){
  if(stackWindows.length>64)throw new Error('Native stack frame bound exceeded');
  const frame=stackWindows[index];if(!frame||stackSeen.has(frame))continue;stackSeen.add(frame);
  let bus;try{bus=frame.MSG_BUS_PCB;for(let child=0;child<frame.frames.length;child++)stackWindows.push(frame.frames[child]);}catch{continue;}
  if(bus&&typeof bus.messageBus?.rpcCall==='function'&&!stackBuses.includes(bus))stackBuses.push(bus);
}
if(stackBuses.length===0||stackBuses.length>8)throw new Error('Native stack PCB frame scope unavailable');
let stackBus;
for(const bus of stackBuses){const identity=(await bus.messageBus.rpcCall('getTabIdAndDocType',{}))?.message;if(identity?.tabId===EXPECTED_TAB_ID&&identity?.docType===3){if(stackBus)throw new Error('Native stack frame identity is duplicated');stackBus=bus;}}
if(!stackBus)throw new Error('Exact native stack frame not found');
${CAPTURE_NATIVE_STACK_HANDLER_CODE}
const stackHandler=captureNativeStackHandler(stackBus);
for(let index=0;index<STACK_ROWS.length;index++)if(stackHandler.getPhyZIndex(STACK_ROWS[index]['Layer Id'],index)!==STACK_ROWS[index].zIndex)throw new Error('Native physical order profile changed');
const stackFinalBaseline=stackParse((await stackBus.messageBus.rpcCall('FileSource',{}))?.message);
if(stackCanonical(stackFinalBaseline)!==stackCanonical(STACK_BEFORE))throw new Error('Native stack baseline changed before apply');
// The only direct native mutation here uploads physical rows through yF.
// No full applyConfig/updateCanvas, preference changes or unused-pad cleanup.
stackHandler.applyLayerPhysConfig({layerPhysConfigArr:STACK_ROWS});
const stackMergeResult=await(async()=>{${merge.code}})();
if(stackMergeResult!==true)throw new Error('Native stack presentation restore failed');
// No visible/locked fields means the existing handler performs _p(id) only,
// plus normal rendering refresh. It persists the exact restored layer model.
stackBus.messageBus.publish('toggleLayerState',{layeridarr:STACK_UPLOAD_IDS.map(id=>({id}))});
return true;
`;
}
