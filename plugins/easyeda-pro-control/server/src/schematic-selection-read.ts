/** The installed declaration deprecates getSelectedPrimitives_PrimitiveId in
 * favor of getAllSelectedPrimitives_PrimitiveId. The former uses the obsolete
 * iframe getSelected command and converts a missing response to an empty list.
 * Use the declared public replacement, never that fallback or a private RPC.
 * This observes selection only; it does not prove selected-model ownership.
 */
export const SCHEMATIC_SELECTION_METHOD = "eda.sch_SelectControl.getSelectedPrimitives_PrimitiveId";
export const SCHEMATIC_SELECTION_REPLACEMENT = "eda.sch_SelectControl.getAllSelectedPrimitives_PrimitiveId";
export const SCHEMATIC_SELECTION_LIMITATIONS = [
  "Explicit equivalent for the deprecated getter: calls the documented public replacement eda.sch_SelectControl.getAllSelectedPrimitives_PrimitiveId, never the legacy iframe getSelected route or its missing-response empty fallback.",
  "Only the exact active ordinary SCH_PAGE is admitted; symbol and block-instance pages refuse. Native page/project/tab/receiver/readiness identities are checked before and after the awaited public call, in addition to the coordinator's context, runtime and double-sample checks.",
  "Returns the replacement's ordered, bounded unique ID observation without coercion, sorting or empty fallback. The pinned replacement promotes selected NetGroupLine children to their parent group and deduplicates; it does not promise physical LINE IDs.",
  "Selection observation only, not complete selected-model ownership, source, connectivity or persistence proof. No selection changes, private bus calls, navigation, serialization or Save; switch-away-and-back between checks remains undetectable.",
] as const;
export const SCHEMATIC_SELECTION_GUARD_CODES = ["MANAGER", "CONTEXT", "OWNER_CHANGED", "NOT_READY", "RECEIVER_CHANGED", "RESULT"] as const;

export function buildSchematicSelectionReadExpression(): string {
  return `await (async () => {
const bad=reason=>{failureCode='SCH_SELECTION_'+reason;throw new Error('SCH_SELECTION_'+reason);};
const sch=globalThis.SCH,ui=globalThis.UI,tabs=ui?.tabBar,manager=sch?.docMemoryManager;
const activeReader=manager?.getActiveDoc,tabReader=tabs?.getActiveTab;
if(typeof activeReader!=='function'||typeof tabReader!=='function')bad('MANAGER');
const page=activeReader.call(manager),project=page?.projectMgr,shapes=page?.shapeManager;
const consistency=page?.consistencyImpl,action=shapes?.actionRunner;
const api=eda,selection=api.sch_SelectControl,reader=selection?.getAllSelectedPrimitives_PrimitiveId;
const check=()=>{
 if(globalThis.SCH!==sch||globalThis.UI!==ui||ui.tabBar!==tabs||tabs.getActiveTab!==tabReader||sch.docMemoryManager!==manager||manager.getActiveDoc!==activeReader||activeReader.call(manager)!==page||tabReader.call(tabs)!==EXPECTED_TAB_ID)bad('RECEIVER_CHANGED');
 if(EXPECTED_DOCUMENT_TYPE!==1||!page||page.uuid!==EXPECTED_DOCUMENT_UUID||page.project_uuid!==EXPECTED_PROJECT_UUID||page.tabId!==EXPECTED_TAB_ID||EXPECTED_TAB_ID!==EXPECTED_DOCUMENT_UUID+'@'+EXPECTED_PROJECT_UUID||page.isSchSheetDoc?.()!==true||page.isBlockSymbolInstancePage!==false)bad('CONTEXT');
 if(!project||page.projectMgr!==project||project.uuid!==EXPECTED_PROJECT_UUID||!shapes||page.shapeManager!==shapes||shapes.docManager!==page||page.consistencyImpl!==consistency||consistency?.docManager!==page||shapes.actionRunner!==action)bad('OWNER_CHANGED');
 if(consistency.state!=='initialized'||action?.running!==false)bad('NOT_READY');
 if(eda!==api||api.sch_SelectControl!==selection||typeof reader!=='function'||selection.getAllSelectedPrimitives_PrimitiveId!==reader)bad('RECEIVER_CHANGED');
};
check();
const value=await reader.call(selection);
check();
if(!Array.isArray(value)||value.length>20000)bad('RESULT');
const keys=Reflect.ownKeys(value),result=[],seen=new Set();
if(keys.length!==value.length+1)bad('RESULT');
for(let i=0;i<value.length;i++){
 const entry=Object.getOwnPropertyDescriptor(value,String(i));
 if(!entry||!entry.enumerable||!('value' in entry))bad('RESULT');
 const id=entry.value;
 if(typeof id!=='string'||!id||id.length>256||[...id].some(character=>character.charCodeAt(0)<32||character.charCodeAt(0)===127)||seen.has(id))bad('RESULT');
 seen.add(id);result.push(id);
}
check();
return result;
})()`;
}
