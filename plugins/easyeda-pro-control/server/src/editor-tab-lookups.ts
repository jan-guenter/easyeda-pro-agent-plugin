/* oxlint-disable import/max-dependencies -- Reuse the existing checkpoint, native profile, context and exact transport boundaries. */
import { join } from "node:path";
import { z } from "zod";
import { controlDataDirectory } from "./artifacts.ts";
import { assertUpstreamReplySettled, canonicalJson, extractToolPayload, normalizeEasyedaProjectPath, sha256Json } from "./core.ts";
import type { EasyedaControlEngine, ExpectedContext } from "./engine.ts";
import { assertExactTransportValue, decodeExactReadEnvelope } from "./exact-readers.ts";
import { isNativeDocumentDeleted, readNativeHistoryCheckpoint } from "./native-history.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { verifySchematicNativeProfile } from "./native-profiles.ts";
import { verifyDeviceAssociationNativeProfile } from "./device-native-profile.ts";
import { assertUnchangedLibraryCheckpoint } from "./library-checkpoint.ts";
import { wrapWithContextGuard } from "./runtime-scripts.ts";

const TAB_METHOD = "eda.dmt_EditorControl.getSplitScreenIdByTabId";
const SPLIT_METHOD = "eda.dmt_EditorControl.getTabsBySplitScreenId";
const PROFILE = "easyeda-pro-control.owned-editor-tab-lookup.v1";
const MAX_BYTES = 262_144;
const identity = z.string().min(1).max(256).regex(/^[a-z0-9_-]+$/iu);
// oxlint-disable-next-line eslint/no-control-regex -- IDs are native selectors, never code or paths.
const selector = z.string().min(1).max(512).regex(/^[^\u0000-\u001F\u007F]+$/u);
const type = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);
const member = z.object({ uuid: identity, documentType: type }).strict();
export const editorTabLookupRequestSchema = z.discriminatedUnion("method", [
  z.object({ method: z.literal(TAB_METHOD), arguments: z.object({ tabId: selector }).strict() }).strict(),
  z.object({ method: z.literal(SPLIT_METHOD), arguments: z.object({ splitScreenId: selector }).strict() }).strict(),
]);
export function isEditorTabLookupMethod(method: string): boolean { return method === TAB_METHOD || method === SPLIT_METHOD; }

const scopeSchema = z.object({ projectUuid: identity, ownerUuid: identity, branchUuid: identity,
  active: member.extend({ tabId: selector }).strict(), members: z.array(member).min(1).max(8192) }).strict();
type Scope = z.infer<typeof scopeSchema>;
const tabSchema = z.object({ tabId: selector, uuid: identity.nullable(), documentType: z.union([type, z.literal(-1)]),
  parentProjectUuid: identity.nullable(), parentLibraryUuid: identity.nullable() }).strict();
const nodeSchema = z.object({ id: selector, parentId: selector.nullable(), direction: z.enum(["horizontal", "vertical"]).nullable(),
  tabs: z.array(tabSchema).min(1).max(256).nullable() }).strict();
const resultSchema = z.object({ profile: z.literal(PROFILE), scopeSha256: z.string().regex(/^[a-f0-9]{64}$/u),
  method: z.enum([TAB_METHOD, SPLIT_METHOD]), tree: z.array(nodeSchema).min(1).max(128),
  value: z.union([selector, z.array(tabSchema).min(1).max(256)]) }).strict();

function contextIdentity(context: ExpectedContext): { projectUuid: unknown; uuid: unknown } {
  const projectUuid = context.project.uuid ?? context.project.projectUuid, uuid = context.document.uuid ?? context.document.documentUuid;
  if (context.project.uuid !== undefined && context.project.projectUuid !== undefined && context.project.uuid !== context.project.projectUuid ||
      context.document.uuid !== undefined && context.document.documentUuid !== undefined && context.document.uuid !== context.document.documentUuid) {
    throw new Error("Editor lookup context has contradictory identity aliases.");
  }
  return { projectUuid, uuid };
}

/** Only the complete verified checkpoint supplies members; callers cannot
 * provide a scope, receipt, owner, native method path or generated program.
 */
export function prepareEditorTabLookupScope(history: NativeHistorySnapshot, context: ExpectedContext): Scope {
  const { projectUuid, uuid } = contextIdentity(context);
  const members = history.documents.filter((document) => {
    const meta = document.records.filter((record) => record.type === "META");
    return !isNativeDocumentDeleted(document) && ["SCH_PAGE", "SYMBOL", "PCB", "FOOTPRINT"].includes(document.docType) &&
      (document.docType !== "SYMBOL" || meta.length === 1 && meta[0]?.body["docType"] === 2);
  })
    .map((document) => ({ uuid: document.uuid, documentType: { SCH_PAGE: 1, SYMBOL: 2, PCB: 3, FOOTPRINT: 4 }[document.docType] }));
  const scope = scopeSchema.parse({ projectUuid: history.projectUuid, ownerUuid: history.projectOwnerUuid, branchUuid: history.branchUuid,
    active: { uuid, documentType: context.document.documentType, tabId: context.document.tabId }, members });
  if (projectUuid !== scope.projectUuid || new Set(history.documents.map((document) => document.uuid)).size !== history.documents.length ||
      !scope.members.some((document) => document.uuid === scope.active.uuid && document.documentType === scope.active.documentType) ||
      !ownedActive(scope, context.document)) { throw new Error("Editor lookup requires an exact saved project member and proven active owner."); }
  if (Buffer.byteLength(JSON.stringify(scope)) > 1_048_576) { throw new Error("Editor lookup membership exceeds its fixed bound."); }
  return scope;
}

function ownedActive(scope: Scope, document: Record<string, unknown>): boolean {
  const active = scope.active, library = [2, 4].includes(active.documentType);
  return (active.tabId === `${active.uuid}@${scope.projectUuid}` || !library && active.tabId === active.uuid) &&
    (library ? document["parentLibraryUuid"] === scope.ownerUuid && (document["parentProjectUuid"] === undefined || document["parentProjectUuid"] === scope.projectUuid)
      : document["parentProjectUuid"] === scope.projectUuid && document["parentLibraryUuid"] === undefined);
}

/** Fixed public calls with a complete identity-only tree projection. Structural
 * fields must be own data properties; unbounded traversal, getter execution,
 * unknown owners and ambiguous empty leaves fail before the selected lookup.
 */
export function buildEditorTabLookupCode(requestInput: unknown, scopeInput: Scope): string {
  const request = editorTabLookupRequestSchema.parse(requestInput), scope = scopeSchema.parse(scopeInput);
  const call = request.method === TAB_METHOD
    ? `editor.getSplitScreenIdByTabId(${JSON.stringify(request.arguments.tabId)})`
    : `editor.getTabsBySplitScreenId(${JSON.stringify(request.arguments.splitScreenId)})`;
  return `
const scope=${JSON.stringify(scope)},request=${JSON.stringify(request)};let stage='api';
const fail=()=>{throw new Error('EDITOR_LOOKUP_REFUSED');};
try{
const editor=eda.dmt_EditorControl,project=eda.dmt_Project,select=eda.dmt_SelectControl;
if(typeof editor?.getSplitScreenTree!=='function'||typeof ${request.method}!=='function'||typeof project?.getCurrentProjectInfo!=='function'||typeof select?.getCurrentDocumentInfo!=='function')fail();
const object=value=>{if(!value||typeof value!=='object'||Array.isArray(value))fail();return value;};
const field=(value,key)=>{object(value);const descriptor=Object.getOwnPropertyDescriptor(value,key);if(descriptor===undefined)return undefined;if(!Object.hasOwn(descriptor,'value'))fail();return descriptor.value;};
const string=value=>{if(typeof value!=='string'||!value||value.length>512||/[\\x00-\\x1f\\x7f]/.test(value))fail();return value;};
const array=(value,max)=>{if(!Array.isArray(value)||value.length<1||value.length>max)fail();const keys=Reflect.ownKeys(value);if(keys.length!==value.length+1)fail();const items=[];for(let index=0;index<value.length;index++){const descriptor=Object.getOwnPropertyDescriptor(value,String(index));if(!descriptor||!Object.hasOwn(descriptor,'value'))fail();items.push(descriptor.value);}return items;};
const identity=(value,key,alias)=>{const a=field(value,key),b=field(value,alias);if(a!==undefined&&b!==undefined&&a!==b)fail();return string(a??b);};
const localHost=globalThis.gVars,outerHost=globalThis.top?.gVars;if(localHost!=null&&outerHost!=null&&localHost!==outerHost)fail();const host=localHost??outerHost;
const branch=()=>{const local=globalThis.gVars,outer=globalThis.top?.gVars;if(local!=null&&outer!=null&&local!==outer||(local??outer)!==host)fail();const current=field(host,'currentProject');if(field(current,'projectId')!==scope.projectUuid||field(current,'branchUuid')!==scope.branchUuid||field(host,'isHistoryMode')!==false)fail();};
const context=async()=>{
branch();let p=await project.getCurrentProjectInfo();branch();if(identity(p,'uuid','projectUuid')!==scope.projectUuid)fail();
const d=await select.getCurrentDocumentInfo();branch();if(identity(d,'uuid','documentUuid')!==scope.active.uuid||field(d,'documentType')!==scope.active.documentType||field(d,'tabId')!==scope.active.tabId)fail();
const parent=field(d,'parentProjectUuid'),owner=field(d,'parentLibraryUuid');
if([2,4].includes(scope.active.documentType)?owner!==scope.ownerUuid||parent!==undefined&&parent!==scope.projectUuid:parent!==scope.projectUuid||owner!==undefined)fail();
p=await project.getCurrentProjectInfo();branch();if(identity(p,'uuid','projectUuid')!==scope.projectUuid)fail();};
const projectTab=tab=>{
const tabId=string(field(tab,'tabId')),data=field(tab,'data');if(data!==undefined)object(data);
const declaredType=field(tab,'documentType'),rawType=data===undefined?undefined:field(data,'doctype');if(declaredType!==undefined&&rawType!==undefined&&declaredType!==rawType)fail();
const type=declaredType??rawType,parent=field(tab,'parentProjectUuid'),owner=field(tab,'parentLibraryUuid'),pid=data===undefined?undefined:field(data,'pid'),dataOwner=data===undefined?undefined:field(data,'owner');
if(tabId==='tab_page1'){if(type!==-1||field(tab,'isAbleDelete')!==false||parent!==undefined||owner!==undefined||pid!==undefined||dataOwner!==undefined)fail();return{tabId,uuid:null,documentType:-1,parentProjectUuid:null,parentLibraryUuid:null};}
const uuid=tabId.split('@')[0],library=[2,4].includes(type);
if(!scope.members.some(member=>member.uuid===uuid&&member.documentType===type)||(tabId!==uuid+'@'+scope.projectUuid&&(library||tabId!==uuid))||
parent!==undefined&&parent!==scope.projectUuid||pid!==undefined&&pid!==scope.projectUuid||
(library?(owner!==scope.ownerUuid&&dataOwner!==scope.ownerUuid)||owner!==undefined&&owner!==scope.ownerUuid||dataOwner!==undefined&&dataOwner!==scope.ownerUuid:owner!==undefined||(parent!==scope.projectUuid&&pid!==scope.projectUuid)||dataOwner!==undefined&&dataOwner!==scope.ownerUuid))fail();
return{tabId,uuid,documentType:type,parentProjectUuid:scope.projectUuid,parentLibraryUuid:library?scope.ownerUuid:null};};
const tabs=value=>{const result=array(value,256).map(projectTab);if(new Set(result.map(tab=>tab.tabId)).size!==result.length||new Set(result.filter(tab=>tab.uuid!==null).map(tab=>tab.uuid)).size!==result.filter(tab=>tab.uuid!==null).length)fail();return result;};
const tree=root=>{
const pending=[{node:root,parentId:null,depth:0}],seen=new Set(),ids=new Set(),tabIds=new Set(),documentIds=new Set(),result=[];let active=0;
while(pending.length){const {node,parentId,depth}=pending.pop();object(node);if(depth>16||seen.has(node)||seen.size>=128)fail();seen.add(node);
const id=string(field(node,'id'));if(ids.has(id))fail();ids.add(id);
const direction=field(node,'direction');if(direction!==undefined&&!['horizontal','vertical'].includes(direction))fail();
const children=field(node,'children'),rawTabs=field(node,'tabs');
if(children!==undefined){if(rawTabs!==undefined||direction===undefined)fail();const list=array(children,128);if(pending.length+list.length+seen.size>128)fail();result.push({id,parentId,direction,tabs:null});for(let index=list.length-1;index>=0;index--)pending.push({node:list[index],parentId:id,depth:depth+1});}
else{const projected=tabs(rawTabs);for(const tab of projected){if(tabIds.has(tab.tabId)||tabIds.size>=256)fail();tabIds.add(tab.tabId);if(tab.uuid!==null){if(documentIds.has(tab.uuid))fail();documentIds.add(tab.uuid);}if(tab.tabId===scope.active.tabId){if(tab.uuid!==scope.active.uuid||tab.documentType!==scope.active.documentType)fail();active++;}}
result.push({id,parentId,direction:direction??null,tabs:projected});}}
if(active!==1)fail();return result;};
stage='before-context';await context();
stage='before-tree';const before=tree(await editor.getSplitScreenTree());await context();
const leaf=request.method===${JSON.stringify(TAB_METHOD)}?before.find(node=>node.tabs?.some(tab=>tab.tabId===request.arguments.tabId&&tab.uuid!==null)):before.find(node=>node.id===request.arguments.splitScreenId&&node.tabs!==null);
if(!leaf)fail();
stage='lookup';const native=await ${call};await context();
const value=request.method===${JSON.stringify(TAB_METHOD)}?string(native):tabs(native);
if(JSON.stringify(value)!==JSON.stringify(request.method===${JSON.stringify(TAB_METHOD)}?leaf.id:leaf.tabs))fail();
stage='after-tree';const after=tree(await editor.getSplitScreenTree());await context();if(JSON.stringify(before)!==JSON.stringify(after))fail();
const payload={profile:${JSON.stringify(PROFILE)},scopeSha256:${JSON.stringify(sha256Json(scope))},method:request.method,tree:after,value};
const json=JSON.stringify(payload),utf8Bytes=new TextEncoder().encode(json).byteLength,envelope={schema:'easyeda-pro-control.exact-json.v1',utf8Bytes,json};
if(utf8Bytes>${MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${MAX_BYTES})fail();return envelope;
}catch{throw new Error('Owned editor lookup refused at '+stage);}`;
}

export function validateEditorTabLookupResult(input: unknown, requestInput: unknown, scopeInput: Scope): z.infer<typeof resultSchema> {
  assertExactTransportValue(input);
  if (Buffer.byteLength(JSON.stringify(input)) > MAX_BYTES) { throw new Error("Editor lookup result exceeds its fixed bound."); }
  const request = editorTabLookupRequestSchema.parse(requestInput), scope = scopeSchema.parse(scopeInput);
  const result = resultSchema.parse(input);
  if (result.method !== request.method || result.scopeSha256 !== sha256Json(scope)) { throw new Error("Editor lookup response substituted its bound request or scope."); }
  const documentIds = new Set<string>(), nodes = new Map<string, { depth: number; branch: boolean; children: number }>(), tabIds = new Set<string>();
  let activeCount = 0;
  for (const [index, node] of result.tree.entries()) {
    const parent = node.parentId === null ? undefined : nodes.get(node.parentId);
    if (nodes.has(node.id) || (index === 0 ? node.parentId !== null : parent === undefined || !parent.branch) ||
        (node.tabs === null && node.direction === null)) { throw new Error("Editor lookup tree hierarchy is invalid."); }
    const depth = parent === undefined ? 0 : parent.depth + 1;
    if (depth > 16) { throw new Error("Editor lookup tree exceeds its depth bound."); }
    if (parent !== undefined) { parent.children += 1; }
    nodes.set(node.id, { depth, branch: node.tabs === null, children: 0 });
    for (const tab of node.tabs ?? []) {
      if (tabIds.size >= 256 || tabIds.has(tab.tabId)) { throw new Error("Editor lookup tab inventory is ambiguous or oversized."); }
      tabIds.add(tab.tabId);
      if (tab.uuid === null) {
        if (tab.tabId !== "tab_page1" || tab.documentType !== -1 || tab.parentProjectUuid !== null || tab.parentLibraryUuid !== null) {
          throw new Error("Editor lookup start tab is invalid.");
        }
      } else {
        const library = [2, 4].includes(tab.documentType);
        if (documentIds.has(tab.uuid) || !scope.members.some((entry) => entry.uuid === tab.uuid && entry.documentType === tab.documentType) ||
          (tab.tabId !== `${tab.uuid}@${scope.projectUuid}` && (library || tab.tabId !== tab.uuid)) ||
          tab.parentProjectUuid !== scope.projectUuid || tab.parentLibraryUuid !== (library ? scope.ownerUuid : null)) {
          throw new Error("Editor lookup returned an unknown or conflicting document owner.");
        }
        documentIds.add(tab.uuid);
        if (tab.tabId === scope.active.tabId && tab.uuid === scope.active.uuid && tab.documentType === scope.active.documentType) { activeCount += 1; }
      }
    }
  }
  if (activeCount !== 1 || [...nodes.values()].some((node) => node.branch && node.children === 0)) { throw new Error("Editor lookup tree lacks complete active membership."); }
  const leaves = result.tree.filter((node) => node.tabs !== null);
  const leaf = request.method === TAB_METHOD ? leaves.find((node) => node.tabs?.some((tab) => tab.tabId === request.arguments.tabId && tab.uuid !== null) === true)
    : leaves.find((node) => node.id === request.arguments.splitScreenId);
  if (leaf === undefined || canonicalJson(result.value) !== canonicalJson(request.method === TAB_METHOD ? leaf.id : leaf.tabs)) {
    throw new Error("Editor lookup response differs from its complete tree.");
  }
  return result;
}

const services = { readNativeHistoryCheckpoint, verifySchematicNativeProfile, verifyDeviceAssociationNativeProfile };
type Host = Pick<EasyedaControlEngine, "assertBridgeDispatchAllowed" | "assertContext" | "checkpoint" | "upstream">;
const hash = z.string().regex(/^[a-f0-9]{64}$/u);
const fileIdentity = z.object({ birthtimeNs: z.string().min(1), ctimeNs: z.string().min(1), dev: z.string().min(1), ino: z.string().min(1) });
const checkpointSchema = z.object({ schema: z.literal("easyeda-pro-control.checkpoint.v2"), createdAt: z.string().min(1),
  source: z.string().min(1), checkpoint: z.string().min(1), sourceIdentity: fileIdentity, checkpointIdentity: fileIdentity,
  sourceSha256: hash, checkpointSha256: hash, sourceDumpSha256: hash, checkpointDumpSha256: hash,
  receiptSha256: hash, receiptPath: z.string().min(1) }).catchall(z.unknown());

/** Two independent public observations plus unchanged verified saved membership.
 * Dependency overrides are private test seams, never fields of the MCP request.
 */
export async function readEditorTabLookup(engine: Host, requestInput: unknown, expectedContext: ExpectedContext,
  overrides: Partial<typeof services> = {}): Promise<Record<string, unknown>> {
  const request = editorTabLookupRequestSchema.parse(requestInput);
  type.parse(expectedContext.document.documentType);
  const dependencies = { ...services, ...overrides };
  await engine.assertBridgeDispatchAllowed();
  const bundles = await engine.upstream.installedEasyedaBundles?.();
  if (bundles === undefined) { throw new Error("Editor lookup requires the reviewed delegated native implementations."); }
  const profile = async (): Promise<void> => {
    await dependencies.verifyDeviceAssociationNativeProfile(bundles.assetsRoot);
    await dependencies.verifySchematicNativeProfile(bundles.assetsRoot);
  };
  await profile();
  const expected = structuredClone(expectedContext);
  const context = await engine.assertContext(expected);
  const outputDir = join(controlDataDirectory(), "checkpoints");
  const checkpoint = checkpointSchema.parse(await engine.checkpoint({ source: context.project.path,
    outputDir, label: "editor-tab-membership" }));
  if (checkpoint.source !== normalizeEasyedaProjectPath(context.project.path)) { throw new Error("Editor lookup checkpoint belongs to a different source path."); }
  const unchanged = async (): Promise<void> => {
    assertUnchangedLibraryCheckpoint(await engine.checkpoint({ receiptPath: checkpoint.receiptPath }), checkpoint,
      "Editor lookup requires unchanged complete checkpoint membership throughout the read.");
  };
  await unchanged();
  const projectUuid = identity.parse(contextIdentity(context).projectUuid);
  const history = await dependencies.readNativeHistoryCheckpoint({ checkpointPath: checkpoint.checkpoint,
    expectedSha256: checkpoint.checkpointSha256, projectUuid });
  const scope = prepareEditorTabLookupScope(history, context);
  const code = wrapWithContextGuard(buildEditorTabLookupCode(request, scope), context);
  const observe = async (): Promise<z.infer<typeof resultSchema>> => {
    await engine.assertBridgeDispatchAllowed(); await engine.assertContext(context); await unchanged();
    const raw = await engine.upstream.callTool("easyeda_execute", { code, timeoutMs: 60_000, confirmWrite: true }, 70_000);
    assertUpstreamReplySettled(raw);
    const result = validateEditorTabLookupResult(decodeExactReadEnvelope(extractToolPayload(raw)), request, scope);
    await engine.assertContext(context); await unchanged();
    return result;
  };
  const first = await observe(), second = await observe();
  await profile(); await unchanged(); await engine.assertContext(context);
  if (canonicalJson(first) !== canonicalJson(second)) { throw new Error("Editor lookup changed between complete observations."); }
  return { ok: true, kind: "public-sdk-read", method: request.method, present: true, value: second.value, undefinedPaths: [],
    assurance: "checkpoint-owned-editor-tab-projection-not-design-source-proof", authority: "public-sdk-observation-not-complete-design-proof",
    tree: second.tree, membership: { source: "complete-project-checkpoint", checkpointSha256: checkpoint.checkpointSha256, receiptPath: checkpoint.receiptPath },
    currentGenerationLiveValidated: false, liveValidation: "not-yet-validated",
    read_consistency: { stable: true, attempts: 2, snapshotSha256: sha256Json(second),
      contextBinding: { level: "active-context-stability-required", preAndPostChecked: true, switchAwayAndBackDetectable: false } } };
}
