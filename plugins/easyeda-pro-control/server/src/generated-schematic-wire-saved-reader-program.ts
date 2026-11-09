/** Fixed readonly Wire scene for a separately born cold reader. Build input
 * from v1 is inert; all mutation receivers and SDK Save bindings are removed. */
import { z } from "zod";
import { GENERATED_SCHEMATIC_WIRE_EDIT_FUNCTION, GENERATED_SCHEMATIC_WIRE_EDIT_STAGES } from "./generated-schematic-wire-edit-program.ts";
import { GENERATED_SCHEMATIC_DISPLAY_SAVE_SOURCE } from "./generated-schematic-display-program.ts";

function replace(source: string, before: string, after: string): string {
  if (source.split(before).length !== 2) { throw new Error("SCH209_WIRE_SAVED_READER_ANCHOR"); } return source.replace(before, after);
}
function remove(source: string, begin: string, end: string): string {
  const start = source.indexOf(begin), stop = source.indexOf(end, start);
  if (start === -1 || stop <= start || source.includes(begin, start + begin.length)) { throw new Error("SCH209_WIRE_SAVED_READER_SECTION"); }
  return source.slice(0, start) + source.slice(stop);
}
function build(): string {
  let source = replace(GENERATED_SCHEMATIC_WIRE_EDIT_FUNCTION, `${JSON.stringify(GENERATED_SCHEMATIC_WIRE_EDIT_STAGES)}.includes(stage)`, '["capture","observe"].includes(stage)');
  source = remove(source, 'const setter=', 'const reprove=');
  source = replace(source, ',run=method(runner,"run")', '');
  source = remove(source, ' const line=index.get(operation.lineId),group=index.get(operation.wireId);', ' const permissionProperty=');
  source = remove(source, ' const sdk=own(root,"_EXTAPI_ROOT_")', ' const document=root.document');
  source = replace(source, 'getSource,sourceIds,run,line,group,pointBinding,setLines,pointPrototype,vectorCtor,permissionProperty,sdk,docApi,save,document', 'getSource,sourceIds,permissionProperty,document');
  source = replace(source, 'modifyAttempted:false,modifyAcknowledged:false,observed:false,saveAttempted:false,saveAcknowledged:false,savePromiseSettled:false,', 'observed:false,');
  source = replace(source, 'let ownedAction=null,dispatchAttempted=false,originalPromiseSettled=false;', '');
  source = replace(source, 'if(ownedAction===null?b.runner.running!==false:b.runner.running!==true||b.runner.currentAction!==ownedAction||ownedAction.status!=="running")bad("ACTION");', 'if(b.runner.running!==false)bad("ACTION");');
  source = replace(source, 'if(own(root,"_EXTAPI_ROOT_")!==b.sdk||own(b.sdk,"sch_Document")!==b.docApi||state.owner!==tuple', 'if(state.owner!==tuple');
  source = replace(source, 'for(const m of [b.active,b.activeTab,b.getTab,b.getSource,b.sourceIds,b.run,b.save,b.setLines,b.vectorCtor])reprove(m);reproveSetter(b.pointBinding);if(b.index.get(operation.lineId)!==b.line||b.index.get(operation.wireId)!==b.group||b.pointBinding.object!==b.line||b.setLines.object!==b.group||own(b.vectorCtor.fn,"prototype")!==b.pointPrototype)bad("LINE_RECEIVER");', 'for(const m of [b.active,b.activeTab,b.getTab,b.getSource,b.sourceIds])reprove(m);');
  const tail = source.indexOf('const receipt=');
  if (tail === -1 || source.includes('const receipt=', tail + 1)) { throw new Error("SCH209_WIRE_SAVED_READER_TAIL"); }
  source = `${source.slice(0, tail)}try{
 if(stage==="capture"){state.before=capture(operation.afterBody);same(state.before,capture(operation.afterBody));return tuple;}
 if(state.observed)bad("CONSUMED");state.observed=true;
 const first=capture(operation.afterBody),second=capture(operation.afterBody);same(state.before,first);same(first,second);if(first.raw!==second.raw)bad("SOURCE_CHANGED");
 return{schema:"private.generated-schematic-wire-saved-reader-scene.v1",source:second.raw,windowTabId:b.windowTabId,stableSelectedContext:true,persistentModels:6,endpointMarkers:2,readerNativeOriginVerified:false,coldLoadVerified:false,persistenceVerified:false,reopenedVerified:false,executionAuthorized:false};
}catch(error){state.failed=true;throw error;}
}`;
  source = source.replaceAll('SCH209_DISPLAY_', 'SCH209_WIRE_SAVED_READER_');
  if (source.includes(GENERATED_SCHEMATIC_DISPLAY_SAVE_SOURCE) || /_EXTAPI_ROOT_|modifyAttempted|saveAttempted|reproveSetter|const setter=|b\.(?:run|save|setLines|pointBinding|vectorCtor)\b|Reflect\.construct/u.test(source)) { throw new Error("SCH209_WIRE_SAVED_READER_WRITER_REMNANT"); }
  return source;
}
export const GENERATED_SCHEMATIC_WIRE_SAVED_READER_FUNCTION = build();
export const generatedSchematicWireSavedReaderSceneSchema = z.strictObject({
  schema: z.literal("private.generated-schematic-wire-saved-reader-scene.v1"),
  source: z.string().min(1).max(16_384).refine(value => value.isWellFormed() && Buffer.byteLength(value) <= 16_384 && value.endsWith("|\n")),
  windowTabId: z.string().min(1).max(256).refine(value => value.isWellFormed()), stableSelectedContext: z.literal(true),
  persistentModels: z.literal(6), endpointMarkers: z.literal(2), readerNativeOriginVerified: z.literal(false), coldLoadVerified: z.literal(false),
  persistenceVerified: z.literal(false), reopenedVerified: z.literal(false), executionAuthorized: z.literal(false),
});
