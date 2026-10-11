import { z } from "zod";

export const CONFIGURED_FONT_METHOD = "eda.sys_FontManager.getFontsList";
export const CONFIGURED_FONT_UI_SHA256 = "12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a";
export const CONFIGURED_FONT_MAX_ROWS = 512;
export const CONFIGURED_FONT_MAX_TITLE = 1024;
export const CONFIGURED_FONT_MAX_CHARACTERS = 131_072;
export const configuredFontArgumentsSchema = z.object({}).strict();
export const configuredFontTitlesSchema = z.array(z.string().max(CONFIGURED_FONT_MAX_TITLE)).max(CONFIGURED_FONT_MAX_ROWS).refine(
  (titles) => titles.reduce((total, title) => total + title.length, 0) <= CONFIGURED_FONT_MAX_CHARACTERS,
  "Configured font titles exceed the aggregate character bound.",
);
export const CONFIGURED_FONT_LIMITATIONS = [
  "Native equivalent for the installed public font-list wrapper, which catches failures as []. Reads only the existing configured font-title list; does not invoke the public getter or its missing-configuration empty fallback.",
  "Requires one exact active ordinary schematic, symbol, PCB or footprint context in the main UI host. UI.gVars, current project, native tab, tab data and both active-tab reader receivers are retained. Missing or accessor-backed configuration/array/title fields refuse rather than becoming an empty result.",
  "Returns at most 512 configured titles, 1024 UTF-16 code units per title and 131072 combined, preserving order, duplicates, empty strings, whitespace and case without coercion. No font IDs, other preference fields, credentials or complete settings object are returned.",
  "Two synchronous complete path/row/title observations per dispatch plus the coordinator's two matching observations and context/runtime checks. Changes away and back between checks cannot be detected; this is not atomic settings isolation.",
  "Configured names in the currently loaded UI only, not current-account or persisted-settings identity, OS font installation, glyph coverage or rendering verification. No preference persistence, font add/delete, local storage, filesystem, network, navigation, design serialization or Save. Source tests do not establish connected validation.",
] as const;
export const CONFIGURED_FONT_GUARD_CODES = ["HOST", "CONTEXT", "OWNER_CHANGED", "CONFIGURATION", "ROWS", "TITLE", "RESULT_BOUND", "SNAPSHOT_CHANGED"] as const;

/** API59236967 @1488634 maps H4e's rows to titles but catches failures as [].
 * UI12414b9d @17039256 reads the exact path below and also falls back to [].
 * Its defaults @9199520 and addFont @17039446 use plain own data fields.
 * UI.gVars/self.gVars refer to the same host @17033436/@16821281. Tab readers
 * @16272991/@16301082 only inspect the current container registry/active ID.
 * No neighboring setting, profile serializer, setter or public fallback runs.
 */
export function buildConfiguredFontReadExpression(): string {
  return `(() => {
const bad=reason=>{failureCode='CONFIGURED_FONTS_'+reason;throw new Error('CONFIGURED_FONTS_'+reason);};
const object=value=>value!==null&&(typeof value==='object'||typeof value==='function')&&!Array.isArray(value);
const data=(owner,key,reason)=>{
 if(!object(owner))bad(reason);
 const descriptor=Object.getOwnPropertyDescriptor(owner,key);
 if(!descriptor||!Object.hasOwn(descriptor,'value'))bad(reason);
 return descriptor.value;
};
if(globalThis.top!==undefined&&globalThis.top!==globalThis)bad('HOST');
const ui=data(globalThis,'UI','HOST'),host=data(globalThis,'gVars','HOST');
if(!object(ui)||!object(host)||data(ui,'gVars','HOST')!==host)bad('HOST');
const tabs=data(ui,'tabBar','HOST'),project=data(host,'currentProject','HOST');
const activeReader=data(tabs,'getActiveTab','HOST'),tabReader=data(tabs,'getActiveTabData','HOST');
if(typeof activeReader!=='function'||typeof tabReader!=='function')bad('HOST');
const tab=tabReader.call(tabs),tabData=data(tab,'data','CONTEXT');
const check=()=>{
 if(globalThis.top!==undefined&&globalThis.top!==globalThis)bad('HOST');
 if(data(globalThis,'UI','HOST')!==ui||data(globalThis,'gVars','HOST')!==host||data(ui,'gVars','HOST')!==host||data(ui,'tabBar','HOST')!==tabs||data(host,'currentProject','HOST')!==project||data(tabs,'getActiveTab','HOST')!==activeReader||data(tabs,'getActiveTabData','HOST')!==tabReader)bad('OWNER_CHANGED');
 if(![1,2,3,4].includes(EXPECTED_DOCUMENT_TYPE)||typeof EXPECTED_PROJECT_UUID!=='string'||!EXPECTED_PROJECT_UUID||typeof EXPECTED_DOCUMENT_UUID!=='string'||!EXPECTED_DOCUMENT_UUID||typeof EXPECTED_TAB_ID!=='string'||!EXPECTED_TAB_ID||data(project,'projectId','CONTEXT')!==EXPECTED_PROJECT_UUID||activeReader.call(tabs)!==EXPECTED_TAB_ID||tabReader.call(tabs)!==tab||data(tab,'data','CONTEXT')!==tabData||data(tab,'tabId','CONTEXT')!==EXPECTED_TAB_ID||data(tabData,'doctype','CONTEXT')!==EXPECTED_DOCUMENT_TYPE)bad('CONTEXT');
 if(EXPECTED_TAB_ID!==EXPECTED_DOCUMENT_UUID&&EXPECTED_TAB_ID!==EXPECTED_DOCUMENT_UUID+'@'+EXPECTED_PROJECT_UUID)bad('CONTEXT');
};
const path=()=>{
 check();
 const profile=data(host,'profileSetting','CONFIGURATION');
 const settings=data(profile,'commSystemSetting','CONFIGURATION');
 const typeface=data(settings,'COMM_TYPEFACE','CONFIGURATION');
 const list=data(typeface,'commonlyList','CONFIGURATION');
 const rows=data(list,'value','CONFIGURATION');
 if(!Array.isArray(rows))bad('ROWS');
 const length=Object.getOwnPropertyDescriptor(rows,'length');
 if(!length||!Object.hasOwn(length,'value')||!Number.isInteger(length.value)||length.value<0||length.value>${CONFIGURED_FONT_MAX_ROWS})bad('RESULT_BOUND');
 if(Reflect.ownKeys(rows).length!==length.value+1)bad('ROWS');
 return {profile,settings,typeface,list,rows,length:length.value};
};
const capture=()=>{
 const binding=path(),members=[],titles=[];let characters=0;
 for(let index=0;index<binding.length;index++){
  const descriptor=Object.getOwnPropertyDescriptor(binding.rows,String(index));
  if(!descriptor||!descriptor.enumerable||!Object.hasOwn(descriptor,'value'))bad('ROWS');
  const row=descriptor.value,title=data(row,'title','TITLE');
  if(typeof row!=='object'||typeof title!=='string'||title.length>${CONFIGURED_FONT_MAX_TITLE})bad('TITLE');
  characters+=title.length;if(characters>${CONFIGURED_FONT_MAX_CHARACTERS})bad('RESULT_BOUND');
  members.push(row);titles.push(title);
 }
 check();return {binding,members,titles};
};
const first=capture(),second=capture();
for(const key of ['profile','settings','typeface','list','rows','length'])if(first.binding[key]!==second.binding[key])bad('SNAPSHOT_CHANGED');
for(let index=0;index<first.members.length;index++)if(first.members[index]!==second.members[index]||first.titles[index]!==second.titles[index])bad('SNAPSHOT_CHANGED');
const final=path();
for(const key of ['profile','settings','typeface','list','rows','length'])if(final[key]!==second.binding[key])bad('SNAPSHOT_CHANGED');
for(let index=0;index<second.members.length;index++){
 const descriptor=Object.getOwnPropertyDescriptor(final.rows,String(index));
 if(!descriptor||!descriptor.enumerable||!Object.hasOwn(descriptor,'value')||descriptor.value!==second.members[index]||data(descriptor.value,'title','TITLE')!==second.titles[index])bad('SNAPSHOT_CHANGED');
}
const ending=path();
for(const key of ['profile','settings','typeface','list','rows','length'])if(ending[key]!==second.binding[key])bad('SNAPSHOT_CHANGED');
check();return second.titles;
})()`;
}
