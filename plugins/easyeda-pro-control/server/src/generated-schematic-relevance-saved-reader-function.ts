/** Build-only readonly scene bytes; no historical-owner module is initialized here. */
import { GENERATED_SCHEMATIC_RELEVANCE_DISPLAY_FUNCTION } from "./generated-schematic-relevance-display-program.ts";
import { GENERATED_SCHEMATIC_DISPLAY_SAVE_SOURCE, GENERATED_SCHEMATIC_DISPLAY_STAGES } from "./generated-schematic-display-program.ts";

function replace(source: string, before: string, after: string): string {
  if (source.split(before).length !== 2) { throw new Error("SCHEMATIC_RELEVANCE_SAVED_READER_ANCHOR"); } return source.replace(before, after);
}
function removeBetween(source: string, begin: string, end: string): string {
  const at = source.indexOf(begin), stop = source.indexOf(end, at);
  if (at === -1 || stop <= at || source.includes(begin, at + begin.length)) { throw new Error("SCHEMATIC_RELEVANCE_SAVED_READER_SECTION"); }
  return source.slice(0, at) + source.slice(stop);
}
function build(): string {
  let source = GENERATED_SCHEMATIC_RELEVANCE_DISPLAY_FUNCTION;
  source = replace(source, `if(!${JSON.stringify(GENERATED_SCHEMATIC_DISPLAY_STAGES)}.includes(stage))bad("STAGE");`, 'if(!["capture","observe"].includes(stage))bad("STAGE");');
  source = replace(source, 'keys(operation,["operationId","textId","beforeBody","afterBody","peers","rootIds"]);', 'keys(operation,["operationId","textId","body","peers","rootIds"]);');
  source = replace(source, 'plain(operation.beforeBody);plain(operation.afterBody);dense(operation.peers,6);if(operation.peers.length!==6||operation.beforeBody.value!=="Disposable schematic fixture"||operation.afterBody.value!==operation.beforeBody.value||operation.beforeBody.locked!==false||operation.afterBody.locked!==false)bad("BODY");', 'plain(operation.body);dense(operation.peers,6);if(operation.peers.length!==6||operation.body.value!=="Disposable schematic fixture"||operation.body.locked!==false)bad("BODY");');
  source = replace(source, 'keys(operation.beforeBody,expectedBodyKeys);keys(operation.afterBody,expectedBodyKeys);', 'keys(operation.body,expectedBodyKeys);');
  source = removeBetween(source, 'const setter=', 'const reprove=');
  source = replace(source, ',run=method(runner,"run")', '');
  source = removeBetween(source, ' const text=index.get(operation.textId);', ' const permissionProperty=');
  source = removeBetween(source, ' const sdk=own(root,"_EXTAPI_ROOT_")', ' const document=root.document');
  source = replace(source, 'getSource,sourceIds,run,setters,permissionProperty,sdk,docApi,save,document', 'getSource,sourceIds,permissionProperty,document');
  source = replace(source, 'modifyAttempted:false,modifyAcknowledged:false,observed:false,saveAttempted:false,saveAcknowledged:false,savePromiseSettled:false,', 'observed:false,');
  source = replace(source, 'let ownedAction=null,dispatchAttempted=false,originalPromiseSettled=false;', '');
  source = replace(source, 'if(ownedAction===null?b.runner.running!==false:b.runner.running!==true||b.runner.currentAction!==ownedAction||ownedAction.status!=="running")bad("ACTION");', 'if(b.runner.running!==false)bad("ACTION");');
  source = replace(source, 'if(own(root,"_EXTAPI_ROOT_")!==b.sdk||own(b.sdk,"sch_Document")!==b.docApi||state.owner!==tuple', 'if(state.owner!==tuple');
  source = replace(source, 'for(const m of [b.active,b.activeTab,b.getTab,b.getSource,b.sourceIds,b.run,b.save])reprove(m);for(const binding of Object.values(b.setters))reproveSetter(binding);', 'for(const m of [b.active,b.activeTab,b.getTab,b.getSource,b.sourceIds])reprove(m);');
  const tail = source.indexOf('const receipt=');
  if (tail === -1 || source.includes('const receipt=', tail + 1)) { throw new Error("SCHEMATIC_RELEVANCE_SAVED_READER_TAIL"); }
  source = `${source.slice(0, tail)}try{
 if(stage==="capture"){state.before=capture(operation.body);same(state.before,capture(operation.body));return tuple;}
 if(state.observed)bad("CONSUMED");state.observed=true;
 const first=capture(operation.body),second=capture(operation.body);same(state.before,first);same(first,second);if(first.raw!==second.raw)bad("SOURCE_CHANGED");
 return{schema:"private.generated-schematic-relevance-saved-reader-scene.v1",source:second.raw,windowTabId:b.windowTabId,stableSelectedContext:true,persistentModels:6,endpointMarkers:2,readerNativeOriginVerified:false,coldLoadVerified:false,persistenceVerified:false,reopenedVerified:false,executionAuthorized:false};
}catch(error){state.failed=true;throw error;}
}`;
  source = source.replaceAll('SCH209_DISPLAY_', 'SCH209_RELEVANCE_SAVED_READER_');
  if (source.includes(GENERATED_SCHEMATIC_DISPLAY_SAVE_SOURCE) || /_EXTAPI_ROOT_|modifyAttempted|saveAttempted|reproveSetter|const setter=|b\.run\b|b\.save\b|operation\.(?:beforeBody|afterBody)/u.test(source)) { throw new Error("SCHEMATIC_RELEVANCE_SAVED_READER_WRITER_REMNANT"); }
  return source;
}
export const GENERATED_SCHEMATIC_RELEVANCE_SAVED_READER_FUNCTION = build();
