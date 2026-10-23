import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { buildCurrentProjectUrlGuard } from "./current-project-url.ts";
import { CURRENT_UI_IMPLEMENTATION } from "./current-ui-implementation.ts";
import { EXACT_READ_ENVELOPE_SCHEMA } from "./exact-readers.ts";
import { SDK_LOCAL_RUNTIME_PROFILE } from "./sdk-local-runtime.ts";

export const CURRENT_PCB_LAYERS_MAX_BYTES = 262_144;
const MAX_LAYERS = 512;
const methods = ["eda.pcb_Layer.getAllLayers", "eda.pcb_Layer.getTheNumberOfCopperLayers"] as const;
const targetSchema = z.object({ projectUuid: z.string().regex(/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u),
  branchUuid: z.string().regex(/^[a-f0-9]{32}$/u), documentUuid: z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u),
  tabId: z.string().min(49).max(97) }).strict().refine((value) => value.tabId === `${value.documentUuid}@${value.projectUuid}`, "Tab identity must equal document@project.");
export const currentPcbLayersRequestSchema = z.object({ method: z.enum(methods), arguments: z.object({}).strict(), target: targetSchema }).strict();
export type CurrentPcbLayersRequest = z.infer<typeof currentPcbLayersRequestSchema>;
export function parseCurrentPcbLayersRequest(input: unknown): CurrentPcbLayersRequest { return currentPcbLayersRequestSchema.parse(input); }
export const currentPcbLayersQuerySchema = z.object({ method: z.enum(methods).optional(), includeSchemas: z.boolean().default(false) }).strict();
const scalar = z.number().refine((value) => !Object.is(value, -0), "Signed zero is outside this bounded transport subset.");
const layerStatus = scalar.pipe(z.union([z.literal(0), z.literal(1), z.literal(2)]));
// Mirror the fixed native .length guards; Zod's max alone counts code points.
const nativeText = (maximum: number): z.ZodString => z.string().max(maximum)
  .refine((value) => value.length <= maximum, "Layer text exceeds its UTF-16 unit bound.");
const layerSchema = z.object({ layerId: z.number().int().min(1).max(65_535), type: nativeText(128).min(1), name: nativeText(1024),
  order: scalar, activeColor: nativeText(128).min(1), activeColorAlpha: scalar.pipe(z.number().min(0).max(1)),
  deactiveColor: nativeText(128).min(1), deactiveColorAlpha: scalar.pipe(z.number().min(0).max(1)),
  visible: z.boolean(), locked: z.boolean(), active: z.boolean(), layerStatus }).strict();
export const currentPcbLayersResultSchema = z.object({ ok: z.literal(true), kind: z.literal("current-pcb-layer-observation"),
  method: z.enum(methods), target: targetSchema, nativeLayers: z.array(layerSchema).min(1).max(MAX_LAYERS), samples: z.literal(2),
  implementationKind: z.literal("native-task-equivalent"), cadAuthority: z.literal(false), persistenceVerified: z.literal(false),
  physicalStackVerified: z.literal(false) }).strict();

const limitations = [
  "Native task equivalents for ordinary active type-3 PCB frames only, with an explicit project/branch/document/tab target. No public SDK method is dispatched and no legacy context or design authority is admitted.",
  "Two complete matching native layer samples retain the top/child documents, UI owners, exact frame and its local RPC receiver; native tab/type identity brackets each sample. These observations are not an atomic document lock or a proof against switching away and back between checks.",
  "getAllLayers ports the installed API's nine-field projection and two-decimal alpha conversion. Colors remain raw strings, including malformed fractional hexadecimal output; no CSS validity or correction is implied.",
  "The copper count follows the installed UI expression: enabled native SIGNAL or PLANE rows plus two. It does not count projected SIGNAL rows or prove a physical, manufacturable stackup.",
  "At most 512 unique layers, 1024 name characters, 128 type/color characters and 262144 UTF-8 bytes. Non-finite numbers and signed zero refuse. Bounds apply after the vendor's internal enumeration, which is not cancelled by the 10-second deadline.",
  "Only fixed local layer/identity RPCs are dispatched. RPC bookkeeping and a premature identity handler's local environment initialization are incidental; an uninitialized blank tab/type refuses. No layer change, selection, navigation, Save, source export, settings or persistence operation is requested. Source review and offline tests are not live validation.",
] as const;

export function queryCurrentPcbLayers(input: unknown = {}): Record<string, unknown> {
  const query = currentPcbLayersQuerySchema.parse(input);
  const selected = methods.filter((method) => query.method === undefined || method === query.method);
  const entries = selected.map((method) => {
    const entry: Record<string, unknown> = {
    path: method, method, effect: "current-pcb-layer-metadata-read", parameters: [], invocationEnabledByDiscovery: false,
    limitations: [...limitations],
    provenance: { apiVersion: SDK_LOCAL_RUNTIME_PROFILE.installedBundles.publicApi.version,
      apiSha256: SDK_LOCAL_RUNTIME_PROFILE.installedBundles.publicApi.implementationSha256,
      uiVersion: CURRENT_UI_IMPLEMENTATION.version, uiSha256: CURRENT_UI_IMPLEMENTATION.sha256,
      implementationKind: "native-task-equivalent", liveValidation: "not-recorded" },
    };
    if (query.includeSchemas) { entry["inputSchema"] = z.toJSONSchema(currentPcbLayersRequestSchema); }
    return entry;
  });
  return { offline: true, invocationEnabledByDiscovery: false, total: selected.length, entries };
}

export function validateCurrentPcbLayersArguments(input: unknown): Record<string, unknown> {
  const result = currentPcbLayersRequestSchema.safeParse(input);
  return result.success ? { valid: true, request: result.data, executionAuthorized: false } : {
    valid: false, executionAuthorized: false,
    issues: result.error.issues.slice(0, 16).map((issue) => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}

function layerType(type: string): string {
  switch (type) {
    case "TOP": case "BOTTOM": case "SIGNAL": { return "SIGNAL"; }
    case "PLANE": { return "PLANE"; }
    case "TOP_SILK": case "BOT_SILK": { return "SILKSCREEN"; }
    case "TOP_SOLDER_MASK": case "BOT_SOLDER_MASK": { return "SOLDER_MASK"; }
    case "TOP_PASTE_MASK": case "BOT_PASTE_MASK": { return "PASTE_MASK"; }
    case "TOP_ASSEMBLY": case "BOT_ASSEMBLY": { return "ASSEMBLY"; }
    case "CUSTOM": { return "CUSTOM"; }
    default: { return "OTHER"; }
  }
}

function transparency(alpha: number): number {
  const rounded = Math.round((1 - alpha) * 100 * 100) / 100;
  // oxlint-disable-next-line unicorn/prefer-number-coercion -- Port the installed API x3 expression exactly, including its parseFloat step.
  return Number.parseFloat(rounded.toFixed(2));
}

/** Current UI 3823ed6e and PCB 217199c8 only. Select the exact ordinary DOM
 * frame directly, avoiding getTabIFrame's awaited current-tab selection. The
 * native identity handler catches renamed/reused frames independently of DOM.
 */
export function buildCurrentPcbLayersProgram(input: unknown): string {
  const request = parseCurrentPcbLayersRequest(input);
  return `let timer,clear;
try{
const root=globalThis,apply=Reflect.apply,target=${JSON.stringify(request.target)};let expired=false;
const bad=()=>{throw new Error('CURRENT_PCB_LAYERS_READ_FAILED');};
${buildCurrentProjectUrlGuard()}
const own=(owner,key)=>{if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();const d=Object.getOwnPropertyDescriptor(owner,key);if(!d||!Object.hasOwn(d,'value'))bad();return d.value;};
const absent=(owner,key)=>{const d=Object.getOwnPropertyDescriptor(owner,key);if(d&&(!Object.hasOwn(d,'value')||d.value!==undefined))bad();};
const fn=(owner,key)=>{const value=own(owner,key);if(typeof value!=='function')bad();return value;};
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const topPlain=value=>{if(!object(value)||Object.getPrototypeOf(value)!==Object.prototype)bad();return value;};
const location=root.location,href=location?.href,document=root.document,ui=own(root,'UI'),host=own(root,'gVars'),mode=own(root,'PRO_EDITOR_MODE');
const project=topPlain(own(host,'currentProject')),tabs=own(ui,'tabBar'),edaOwner=eda;
if(typeof tabs!=='function'||Object.getPrototypeOf(tabs)!==Function.prototype)bad();
const active=fn(tabs,'getActiveTab'),getTab=fn(tabs,'getTabById'),select=document?.querySelectorAll;
if(typeof select!=='function')bad();
const tab=topPlain(apply(getTab,tabs,[target.tabId])),data=topPlain(own(tab,'data'));
const matches=apply(select,document,['[id="frame_'+target.tabId+'"]']);if(matches.length!==1)bad();
const frame=matches[0],child=frame?.contentWindow,childDocument=child?.document,parent=frame?.parentElement;
const native=own(child,'MSG_BUS_PCB'),channel=own(native,'messageBus'),childObject=own(child,'Object'),childArray=own(child,'Array');
const childObjectPrototype=own(childObject,'prototype'),childArrayPrototype=own(childArray,'prototype');
const getAttribute=frame?.getAttribute,hasAttribute=frame?.hasAttribute,classes=frame?.classList,contains=classes?.contains,parentAttribute=parent?.getAttribute;
if(typeof getAttribute!=='function'||typeof hasAttribute!=='function'||typeof contains!=='function'||typeof parentAttribute!=='function')bad();
const chain=[channel];let rpc,rpcOwner;
for(let i=0;i<3;i++){const node=chain[i];if(!object(node))bad();const d=Object.getOwnPropertyDescriptor(node,'rpcCall');if(d){if(!Object.hasOwn(d,'value')||typeof d.value!=='function')bad();rpc=d.value;rpcOwner=node;break;}chain.push(Object.getPrototypeOf(node));}
if(typeof rpc!=='function')bad();
const set=own(root,'setTimeout');clear=own(root,'clearTimeout');if(typeof set!=='function'||typeof clear!=='function')bad();
const check=()=>{
 if(expired||root.window!==root||root.top!==root||root.location!==location||root.document!==document||document?.defaultView!==root||document?.nodeType!==9||document?.URL!==href||location?.href!==href||location?.origin!=='https://client')bad();
 parseProjectUrl(href,target.projectUuid,target.tabId);
 if(own(root,'PRO_EDITOR_MODE')!==mode||(mode!=='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'&&mode!=='CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'))bad();
 if(own(root,'UI')!==ui||own(root,'gVars')!==host||own(ui,'gVars')!==host||own(host,'currentProject')!==project||own(ui,'tabBar')!==tabs||eda!==edaOwner||own(edaOwner,'extensionUuid')!=='7e06d286b1ac846ef7eab9c7f2a9ee40')bad();
 if(own(project,'projectId')!==target.projectUuid||own(project,'branchUuid')!==target.branchUuid||own(project,'isV2Format')!==false||own(host,'isHistoryMode')!==false)bad();
 if(fn(tabs,'getActiveTab')!==active||fn(tabs,'getTabById')!==getTab||apply(active,tabs,[])!==target.tabId||apply(getTab,tabs,[target.tabId])!==tab||own(tab,'data')!==data)bad();
 if(own(tab,'tabId')!==target.tabId||own(data,'doctype')!==3||own(data,'pid')!==target.projectUuid)bad();absent(tab,'parentLibraryUuid');
 if(document.querySelectorAll!==select)bad();const found=apply(select,document,['[id="frame_'+target.tabId+'"]']);if(found.length!==1||found[0]!==frame)bad();
 if(frame.tagName!=='IFRAME'||frame.id!=='frame_'+target.tabId||frame.ownerDocument!==document||frame.isConnected!==true||frame.parentElement!==parent||frame.classList!==classes||classes.contains!==contains||frame.getAttribute!==getAttribute||frame.hasAttribute!==hasAttribute||parent.getAttribute!==parentAttribute||!apply(contains,classes,['editframe'])||apply(parentAttribute,parent,['uuid'])!==target.tabId)bad();
 for(const [key,value] of [['c_dbid',target.tabId],['c_doctype','3'],['src','editor?entry=pcb'],['pcb-canvas','true']])if(apply(getAttribute,frame,[key])!==value)bad();
 for(const key of ['blankIframe','fromFile','jsonCacheReady'])if(apply(hasAttribute,frame,[key]))bad();
 if(frame.contentWindow!==child||child.document!==childDocument||childDocument?.defaultView!==child||childDocument?.nodeType!==9||child.frameElement!==frame||child.parent!==root||child.top!==root||own(child,'MSG_BUS_PCB')!==native||own(native,'messageBus')!==channel)bad();
 if(own(child,'Object')!==childObject||own(childObject,'prototype')!==childObjectPrototype||own(child,'Array')!==childArray||own(childArray,'prototype')!==childArrayPrototype)bad();
 for(let i=0;i<chain.length;i++){const node=chain[i];if(i>0&&Object.getPrototypeOf(chain[i-1])!==node)bad();if(node===rpcOwner){if(own(node,'rpcCall')!==rpc)bad();}else if(Object.hasOwn(node,'rpcCall'))bad();}
 if(own(root,'setTimeout')!==set||own(root,'clearTimeout')!==clear)bad();
};
const plain=value=>{if(!object(value))bad();const p=Object.getPrototypeOf(value);if(p!==Object.prototype&&p!==childObjectPrototype)bad();return value;};
const exact=(value,keys)=>{plain(value);const actual=Reflect.ownKeys(value);if(actual.length!==keys.length||!actual.every(key=>keys.includes(key)))bad();};
const text=(value,max,empty=false)=>{if(typeof value!=='string'||value.length>max||(!empty&&value.length===0))bad();return value;};
const num=(value,min=-Number.MAX_VALUE,max=Number.MAX_VALUE)=>{if(typeof value!=='number'||!Number.isFinite(value)||Object.is(value,-0)||value<min||value>max)bad();return value;};
const bool=value=>{if(typeof value!=='boolean')bad();return value;};
const projectRows=value=>{
 const p=Object.getPrototypeOf(value??{});if(!Array.isArray(value)||(p!==Array.prototype&&p!==childArrayPrototype))bad();
 const n=own(value,'length');if(!Number.isInteger(n)||n<1||n>${MAX_LAYERS}||Reflect.ownKeys(value).length!==n+1)bad();const rows=[],ids=new Set();
 for(let i=0;i<n;i++){
  const row=own(value,String(i));exact(row,['layerId','type','name','order','activeColor','activeColorAlpha','deactiveColor','deactiveColorAlpha','visible','locked','active','layerStatus']);
  const id=num(own(row,'layerId'),1,65535),status=num(own(row,'layerStatus'),0,2);if(!Number.isInteger(id)||!Number.isInteger(status)||ids.has(id))bad();ids.add(id);
  rows.push({layerId:id,type:text(own(row,'type'),128),name:text(own(row,'name'),1024,true),order:num(own(row,'order')),activeColor:text(own(row,'activeColor'),128),activeColorAlpha:num(own(row,'activeColorAlpha'),0,1),deactiveColor:text(own(row,'deactiveColor'),128),deactiveColorAlpha:num(own(row,'deactiveColorAlpha'),0,1),visible:bool(own(row,'visible')),locked:bool(own(row,'locked')),active:bool(own(row,'active')),layerStatus:status});
 }
 return rows;
};
const call=async topic=>{check();const reply=await apply(rpc,channel,[topic,undefined,0]);check();plain(reply);return own(reply,'message');};
const identity=async()=>{const value=await call('getTabIdAndDocType');check();exact(value,['tabId','docType']);if(own(value,'tabId')!==target.tabId||own(value,'docType')!==3)bad();};
const read=async()=>{await identity();check();const raw=await call('pcb/extensionAPI/pcblayer-getAllLayers');check();const rows=projectRows(raw);check();await identity();check();return rows;};
const run=async()=>{
 const first=await read(),firstJson=JSON.stringify(first);if(new TextEncoder().encode(firstJson).byteLength>${CURRENT_PCB_LAYERS_MAX_BYTES})bad();
 const second=await read();if(JSON.stringify(second)!==firstJson)bad();check();
 const json=JSON.stringify({ok:true,kind:'current-pcb-layer-observation',method:${JSON.stringify(request.method)},target,nativeLayers:first,samples:2,implementationKind:'native-task-equivalent',cadAuthority:false,persistenceVerified:false,physicalStackVerified:false});
 const utf8Bytes=new TextEncoder().encode(json).byteLength,envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
 if(utf8Bytes>${CURRENT_PCB_LAYERS_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${CURRENT_PCB_LAYERS_MAX_BYTES})bad();return envelope;
};
check();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;reject(new Error('CURRENT_PCB_LAYERS_READ_FAILED'));},10000]);});
return await Promise.race([run(),timeout]);
}catch{throw new Error('CURRENT_PCB_LAYERS_READ_FAILED');}
finally{if(timer!==undefined&&typeof clear==='function'){try{Reflect.apply(clear,globalThis,[timer]);}catch{throw new Error('CURRENT_PCB_LAYERS_READ_FAILED');}}}`;
}

export function validateCurrentPcbLayersResult(input: unknown, raw: unknown): Record<string, unknown> {
  const request = parseCurrentPcbLayersRequest(input);
  const payload = currentPcbLayersResultSchema.parse(raw);
  if (payload.method !== request.method || canonicalJson(payload.target) !== canonicalJson(request.target)) { throw new Error("PCB layers result differs from its exact target request."); }
  if (Buffer.byteLength(JSON.stringify(payload), "utf8") > CURRENT_PCB_LAYERS_MAX_BYTES) { throw new Error("PCB layers result exceeds its byte bound."); }
  const { nativeLayers, ...metadata } = payload;
  if (new Set(nativeLayers.map((layer) => layer.layerId)).size !== nativeLayers.length) { throw new Error("PCB layers contain duplicate identities."); }
  const value = request.method === "eda.pcb_Layer.getTheNumberOfCopperLayers"
    ? nativeLayers.filter((layer) => (layer.type === "SIGNAL" || layer.type === "PLANE") && layer.layerStatus !== 0).length + 2
    : nativeLayers.map((layer) => ({ id: layer.layerId, name: layer.name, type: layerType(layer.type), color: layer.activeColor,
      transparency: transparency(layer.activeColorAlpha), inactiveColor: layer.deactiveColor,
      inactiveTransparency: transparency(layer.deactiveColorAlpha), layerStatus: layer.layerStatus, locked: layer.locked }));
  return { ...metadata, value, observedLayerCount: nativeLayers.length, effect: "current-pcb-layer-metadata-read",
    authority: "explicit-target-layer-observation-only;not-design-or-persistence-authority", liveValidation: "not-recorded", limitations: [...limitations] };
}
