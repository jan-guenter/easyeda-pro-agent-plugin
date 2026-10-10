const PREFIX = "Device operation refused: ";
const kinds = new Set(["create", "association"]);
const stages = new Set(["HOST", "PROJECT", "ASSET_READ", "MODEL_READ", "DUPLICATE_READ", "METADATA_READ", "CREATE_RPC", "UPDATE_RPC", "ACKNOWLEDGMENT", "FINAL_PROJECT", "RESULT"]);
const codes = new Set(["EXCEPTION", "DEVICE_NATIVE_BUS_MISSING", "DEVICE_NATIVE_HOST_AMBIGUOUS", "DEVICE_PROJECT_DRIFT",
  "DEVICE_ASSOCIATION_ASSET_DRIFT", "DEVICE_MODEL_GETTER_MISSING", "DEVICE_MODEL_METADATA_DRIFT", "DEVICE_NAME_EXISTS",
  "DEVICE_CREATE_ACK_INVALID", "DEVICE_METADATA_DRIFT", "DEVICE_ASSOCIATION_ACK_INVALID"]);

/** Pinned UI initialization exports self.gVars, so the current execution frame
 * is authoritative. Preserve the existing top-frame case only when unambiguous.
 * Every selected receiver must still pass the exact current-project check.
 */
export const DEVICE_NATIVE_HOST_GUARD = `const localHost=globalThis.gVars,outerHost=globalThis.top?.gVars;
if(localHost!=null&&outerHost!=null&&localHost!==outerHost)throw new Error('DEVICE_NATIVE_HOST_AMBIGUOUS');
const host=localHost??outerHost;const bus=host?.messageBus;
if(typeof bus?.rpcCall!=='function')throw new Error('DEVICE_NATIVE_BUS_MISSING');`;

/** These pinned project-manager reads preserve META.title as display_title.
 * LIB_Symbol.get instead exposes a lowercased search title and constructs a
 * temporary document manager to enumerate subparts. Neither is needed here.
 */
export const DEVICE_NATIVE_ASSET_GUARD = `for(const association of PLAN.associations){
const topic=association.family==='symbol'?'/PrjDB/symbol/getData':association.family==='footprint'?'/PrjDB/footprint/getData':null;
if(topic===null)throw new Error('DEVICE_ASSOCIATION_ASSET_DRIFT');
const value=(await bus.rpcCall(topic,[association.uuid,PLAN.projectUuid])).message;
if(value?.uuid!==association.uuid||value?.project_uuid!==PLAN.projectUuid||value?.owner?.uuid!==PLAN.ownerUuid||value?.display_title!==association.name)throw new Error('DEVICE_ASSOCIATION_ASSET_DRIFT');
await assertProject();}`;

/** Wrap only compiler-owned DEVICE programs. Diagnostics contain fixed tokens,
 * never native exception messages, caller attributes, paths or stack traces.
 */
export function wrapDeviceStageDiagnostics(program: string, kind: "create" | "association"): string {
  return `(async()=>{let deviceStage='HOST';try{${program}}catch(error){
let code='EXCEPTION';try{
const descriptor=error!==null&&(typeof error==='object'||typeof error==='function')?Object.getOwnPropertyDescriptor(error,'message'):undefined;
const message=descriptor&&Object.hasOwn(descriptor,'value')?descriptor.value:undefined;
if(typeof message==='string'&&${JSON.stringify([...codes])}.includes(message))code=message;}catch(_){}
throw new Error(${JSON.stringify(`${PREFIX}${kind}:`)}+deviceStage+':'+code);
}})()`;
}

export function deviceFailureCategory(message: unknown): string | null {
  if (typeof message !== "string" || message.length > 180 || !message.startsWith(PREFIX)) { return null; }
  const tokens = message.slice(PREFIX.length).split(":");
  const [kind, stage, code] = tokens;
  if (tokens.length !== 3 || kind === undefined || stage === undefined || code === undefined || !kinds.has(kind) || !stages.has(stage) || !codes.has(code)) { return null; }
  return `native-device:${kind}:${stage}:${code}`;
}
