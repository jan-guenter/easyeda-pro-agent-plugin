import { NATIVE_PROJECT_PLACEHOLDER_PREDICATE } from "./native-editor-tab-guards.ts";

export const PCB_NAVIGATION_PREFERENCE_REFUSAL = "PCB_NAVIGATION_PREFERENCES_UNSAFE";

/** Passive guard for UI12414b9d's PCB/footprint onClick. The native handler
 * awaits before reading preferences, so this is admission, not an atomic lock
 * against later user changes. Never toggle pcbCommandTab or call saveToServer.
 */
export const PCB_NAVIGATION_PREFERENCE_GUARD = `
const pcbNavigationPreferenceIssue=()=>{let failure='PREFERENCES_READ_ERROR';try{
const storage=globalThis.window?.top?.localStorage;
if(typeof storage?.getItem!=='function')return 'PREFERENCES_API_MISSING';
const text=storage.getItem('preferences');
if(text===null)return 'PREFERENCES_MISSING';
if(typeof text!=='string'||text.length>1048576)return 'PREFERENCES_BOUND';
failure='PREFERENCES_JSON_INVALID';const value=JSON.parse(text);
if(!value||typeof value!=='object'||Array.isArray(value))return 'PREFERENCES_SHAPE';
if(!Object.hasOwn(value,'pcbCommandTab'))return 'PCB_COMMAND_TAB_MISSING';
if(value.pcbCommandTab===false)return 'PCB_COMMAND_TAB_WRITE_REQUIRED';
if(value.pcbCommandTab!==true)return 'PCB_COMMAND_TAB_NOT_BOOLEAN';
return undefined;}catch(_){return failure;}};
const assertPcbNavigationPreferences=()=>{if(pcbNavigationPreferenceIssue()!==undefined)throw new Error('${PCB_NAVIGATION_PREFERENCE_REFUSAL}');};
// UI.tabBar.getFilterTabs([]) synchronously enumerates every native container.
// Only an exact owned SCH/symbol-only registry proves closing cannot select a
// PCB peer. Unknown or incomplete state falls back to the preference guard.
const pcbLifecycleHasOnlySchematicTabs=(scope,activeTab)=>{try{
const local=globalThis.UI,outer=globalThis.top?.UI,localHost=globalThis.gVars,outerHost=globalThis.top?.gVars;
if((local!=null&&outer!=null&&local!==outer)||(localHost!=null&&outerHost!=null&&localHost!==outerHost))return false;
const tabs=(local??outer)?.tabBar,host=localHost??outerHost;
if(!scope||![1,2].includes(scope.documentType)||typeof scope.projectUuid!=='string'||!scope.projectUuid||typeof activeTab!=='string'||!activeTab||
host?.currentProject?.projectId!==scope.projectUuid||typeof tabs?.getActiveTab!=='function'||typeof tabs.getFilterTabs!=='function'||tabs.getActiveTab()!==activeTab)return false;
const containers=tabs.containerIds;
if(!Array.isArray(containers)||containers.length<1||containers.length>128||containers.some(id=>typeof id!=='string'||!id||id.length>256)||new Set(containers).size!==containers.length)return false;
const record=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
const pending=[{node:tabs.containerTree,depth:0}],seen=new Set(),leaves=[];
while(pending.length){const {node,depth}=pending.pop();if(!record(node)||seen.has(node)||seen.size>=256||depth>16)return false;seen.add(node);
if(node.children!==undefined){if(!Array.isArray(node.children)||!node.children.length||node.children.length>128||pending.length+node.children.length+seen.size>256)return false;
for(const child of node.children)pending.push({node:child,depth:depth+1});}else{if(typeof node.id!=='string'||!containers.includes(node.id)||leaves.includes(node.id))return false;leaves.push(node.id);}}
if(leaves.length!==containers.length)return false;
${NATIVE_PROJECT_PLACEHOLDER_PREDICATE}
const all=tabs.getFilterTabs([]);if(!Array.isArray(all)||!all.length||all.length>256)return false;
const ids=new Set();let active=false;
for(const tab of all){if(!record(tab)||typeof tab.tabId!=='string'||!tab.tabId||tab.tabId.length>512||ids.has(tab.tabId)||!record(tab.data))return false;ids.add(tab.tabId);
const type=tab.data.doctype;if(tab.documentType!==undefined&&tab.documentType!==type)return false;
if(tab.tabId==='0'){if(!isNativeProjectPlaceholder(tab))return false;continue;}
if(tab.tabId==='tab_page1'){if(type!==-1||tab.isAbleDelete!==false||tab.data.pid!==undefined||tab.data.owner!==undefined||tab.parentProjectUuid!==undefined||tab.parentLibraryUuid!==undefined)return false;continue;}
if(![1,2].includes(type))return false;
const uuid=tab.tabId.split('@')[0];if(!uuid||tab.tabId!==uuid&&tab.tabId!==uuid+'@'+scope.projectUuid)return false;
if(tab.parentProjectUuid!==undefined&&tab.parentProjectUuid!==scope.projectUuid)return false;
if(type===1){if(tab.data.pid!==scope.projectUuid||tab.parentLibraryUuid!==undefined)return false;}
else{if(tab.tabId!==uuid+'@'+scope.projectUuid||typeof tab.data.owner!=='string'||!tab.data.owner||tab.data.pid!==undefined&&tab.data.pid!==scope.projectUuid||tab.parentLibraryUuid!==undefined&&tab.parentLibraryUuid!==tab.data.owner||scope.metadataOwnerUuid!==undefined&&tab.data.owner!==scope.metadataOwnerUuid)return false;}
if(tab.tabId===activeTab){if(uuid!==scope.documentUuid||type!==scope.documentType)return false;active=true;}}
return active;}catch(_){return false;}};
const assertPcbLifecyclePreferences=(scope,activeTab)=>{if(!pcbLifecycleHasOnlySchematicTabs(scope,activeTab))assertPcbNavigationPreferences();};
`;
