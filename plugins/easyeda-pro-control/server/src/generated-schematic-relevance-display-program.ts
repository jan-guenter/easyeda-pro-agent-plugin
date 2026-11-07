/** Fixed separate seven-row stage. Reuse of immutable syntax is explicit and
 * fails on anchor drift. Only a new genuine checkpoint/owner can admit it. */
import { GENERATED_SCHEMATIC_DISPLAY_FUNCTION } from "./generated-schematic-display-program.ts";
import { GENERATED_SCHEMATIC_RELEVANCE_SCENE_FUNCTION } from "./generated-schematic-relevance-scene-program.ts";
import { requireOriginalGeneratedSchematicRelevanceDisplayNativeArguments } from "./generated-schematic-relevance-display-source.ts";
import type { GeneratedSchematicRelevanceDisplayNativeArguments } from "./generated-schematic-relevance-display-source.ts";
import type { GeneratedSchematicRelevanceFixtureOpenCheckpoint } from "./managed-schematic-relevance-fixture-open-checkpoint.ts";

function replaceOnce(source: string, before: string, after: string): string {
  if (source.split(before).length !== 2) { throw new Error("SCH209_RELEVANCE_DISPLAY_PROGRAM_ANCHOR"); } return source.replace(before, after);
}
function build(): string {
  let source = GENERATED_SCHEMATIC_DISPLAY_FUNCTION;
  source = replaceOnce(source, 'keys(operation,["operationId","textId","beforeBody","afterBody","peers"]);', 'keys(operation,["operationId","textId","beforeBody","afterBody","peers","rootIds"]);');
  source = replaceOnce(source, 'operation.operationId.length<20', 'operation.operationId.length<30');
  source = replaceOnce(source, '/^sch209-display-[a-z0-9][a-z0-9-]*$/', '/^sch209-relevance-display-[a-z0-9][a-z0-9-]*$/');
  source = replaceOnce(source, 'dense(operation.peers,5);if(operation.peers.length!==5', 'dense(operation.peers,6);if(operation.peers.length!==6');
  source = replaceOnce(source, '"align","value","fillColor","locked","zIndex"', '"align","value","fillColor","locked"');
  source = replaceOnce(source, '["CANVAS","WIRE","LINE","BUS"].includes(row.type)', '["CANVAS","WIRE","LINE","BUS","ATTR"].includes(row.type)');
  source = replaceOnce(source, 'const identity=json({target,operation}),tabId=', `dense(operation.rootIds,3);if(operation.rootIds.length!==3||new Set(operation.rootIds).size!==3||operation.rootIds.some(id=>typeof id!=="string"||!/^0[a-f0-9]{15}$/.test(id))||json(operation.rootIds)!==json([operation.textId,...operation.peers.filter(r=>r.type==="WIRE"||r.type==="BUS").map(r=>r.id)].sort()))bad("ROOT_IDS");
const identity=json({target,operation}),tabId=`);
  source = replaceOnce(source, 'failed:false,before:null', 'failed:false,before:null,rootIndices:null');
  source = replaceOnce(source, 'if(tree.length!==b.index.size)bad("TREE");', 'if(tree.length!==8||tree.length!==b.index.size)bad("TREE");');
  source = replaceOnce(source, 'if(tree.some(row=>!sourceMap.has(row.id)))bad("SOURCE_EXCLUDED_MODEL_REQUIRES_EXPLICIT_PROFILE");', `const wire=operation.peers.find(row=>row.type==="WIRE"),line=operation.peers.find(row=>row.type==="LINE"&&row.body.lineGroup===wire?.id);if(!wire||!line)bad("WIRE_SCENE");
 const scene=(${GENERATED_SCHEMATIC_RELEVANCE_SCENE_FUNCTION})(b.shapes,b.index,sourceMap,operation.rootIds,wire.id,line.id,line.body);if(scene.rootModel!==rootModel||scene.tree.length!==6||scene.markers.length!==2)bad("SCENE");
 const rootIndices=scene.rootIndices;
 if(state.rootIndices===null){Object.defineProperty(state,"rootIndices",{value:json(rootIndices),writable:false,configurable:false,enumerable:true});}else if(state.rootIndices!==json(rootIndices))bad("ROOT_INDEX_CHANGED");
 const projected=body=>({...body,zIndex:rootIndices.find(row=>row.id===operation.textId).zIndex});
 const projectedPeers=operation.peers.map(row=>operation.rootIds.includes(row.id)?{...row,body:{...row.body,zIndex:rootIndices.find(root=>root.id===row.id).zIndex}}:row);`);
  source = replaceOnce(source, 'sourceMap.size!==5', 'sourceMap.size!==6');
  source = replaceOnce(source, 'if(rows.length!==6||new Set(rows.map(r=>r.id)).size!==6)', 'if(rows.length!==7||new Set(rows.map(r=>r.id)).size!==7)');
  source = replaceOnce(source, 'json(record.body)!==json(expected)', 'json(record.body)!==json(projected(expected))');
  source = replaceOnce(source, 'if(json(peers)!==json(operation.peers))bad("PEERS");', `if(json(peers)!==json(projectedPeers))bad("PEERS");
 for(const row of rows){if(row.id==="CANVAS")continue;const model=b.index.get(row.id),parentId=operation.rootIds.includes(row.id)?rootModel.id:row.type==="LINE"?row.body.lineGroup:row.type==="ATTR"?row.body.parentId:null;if(!model||typeof parentId!=="string"||model.parent?.id!==parentId)bad("SOURCE_PARENT");}`);
  source = replaceOnce(source, 'schema:"easyeda-pro-control.generated-schematic-display-stage.v1"', 'schema:"easyeda-pro-control.generated-schematic-relevance-display-stage.v1"');
  source = replaceOnce(source, '}check();}]);', '}check();},{history:true,name:"Codex disposable Text display"}]);');
  return source;
}
export const GENERATED_SCHEMATIC_RELEVANCE_DISPLAY_FUNCTION = build();
export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_STAGE_FUNCTION = `async function(targetJson,stage,operationJson){"use strict";return Reflect.apply(${GENERATED_SCHEMATIC_RELEVANCE_DISPLAY_FUNCTION},this,[JSON.parse(targetJson),stage,JSON.parse(operationJson)]);}`;
export function generatedSchematicRelevanceDisplayArgumentsValue(input: GeneratedSchematicRelevanceDisplayNativeArguments, prepared: GeneratedSchematicRelevanceFixtureOpenCheckpoint): Readonly<{
  target: GeneratedSchematicRelevanceDisplayNativeArguments["target"]; operation: GeneratedSchematicRelevanceDisplayNativeArguments["operation"];
}> { requireOriginalGeneratedSchematicRelevanceDisplayNativeArguments(input, prepared); return { target: input.target, operation: input.operation }; }
