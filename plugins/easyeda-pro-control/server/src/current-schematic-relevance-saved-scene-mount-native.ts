/** Actual saved-purpose enrollment around the separately reviewed scene codec.
 * Cleanup retains the original group/session after a lost read acknowledgment. */
import { currentSchematicRelevanceSavedSceneNativeSource } from "./current-schematic-relevance-saved-scene-native.ts";

export function currentSchematicRelevanceSavedSceneMountNative(): string { return String.raw`
public sealed partial class EasyedaDiagnosticOwner {
${currentSchematicRelevanceSavedSceneNativeSource()}
bool schematicSavedSceneBound,schematicSavedSceneCapture,schematicSavedSceneObserve,schematicSavedSceneReleased;string schematicSavedSceneContext,schematicSavedSceneTarget,schematicSavedSceneOperation,schematicSavedSceneHolder;
public void BindSchematicSavedScene(string context,string target,string operation){if(!schematicSavedReadback209||!schematicSavedColdComplete||!schematicSavedPageDispatched||schematicSavedSceneBound||context!=schematicSavedCacheContext||target!=SchematicSavedTargetJson()||operation==null||operation.Length<1||operation.Length>16384)throw Error("schematic-saved-scene-original-bind");schematicSavedSceneBound=true;schematicSavedSceneContext=context;schematicSavedSceneTarget=target;schematicSavedSceneOperation=operation;}
public void SendSchematicSavedScene(int id,string phase,System.Collections.IDictionary fields){if(!schematicSavedReadback209||!schematicSavedSceneBound||schematicSavedSceneReleased)throw Error("schematic-saved-scene-original");if(phase=="release"){if(!schematicSavedSceneCapture)throw Error("schematic-saved-scene-capture-required");}else if(phase=="capture"||phase=="observe"){bool capture=phase=="capture";if(!schematicSavedColdComplete||!schematicSavedPageDispatched||capture&&schematicSavedSceneCapture||!capture&&(!schematicSavedSceneCapture||schematicSavedSceneObserve))throw Error("schematic-saved-scene-once");if(!fields.Contains("targetJson")||!fields.Contains("operationJson")||(string)fields["targetJson"]!=schematicSavedSceneTarget||(string)fields["operationJson"]!=schematicSavedSceneOperation)throw Error("schematic-saved-scene-original-args");if(capture&&(!fields.Contains("uniqueContextId")||(string)fields["uniqueContextId"]!=schematicSavedSceneContext))throw Error("schematic-saved-scene-context");if(!capture){string holder=SavedViaReadbackText(fields,"objectId",256);if(schematicSavedSceneHolder!=null&&schematicSavedSceneHolder!=holder)throw Error("schematic-saved-scene-holder");schematicSavedSceneHolder=holder;}}else throw Error("schematic-saved-scene-phase");string text=SchematicRelevanceSavedSceneProtocolMessage(id,schematicSavedSession,phase,fields);if(phase=="release")schematicSavedSceneReleased=true;else if(phase=="capture")schematicSavedSceneCapture=true;else schematicSavedSceneObserve=true;SendMessage(id,text);}
public static void VerifySchematicSavedSceneMountSmoke(){VerifySchematicRelevanceSavedSceneSmoke();var fresh=CreateSchematicRelevanceSavedReadback209();bool refused=false;try{fresh.BindSchematicSavedScene("context","target","operation");}catch(InvalidOperationException){refused=true;}if(!refused||fresh.schematicSavedSceneBound)throw Error("schematic-saved-scene-before-cold-page");fresh.originalMain.Release();}
}
`; }
export const CURRENT_SCHEMATIC_RELEVANCE_SAVED_SCENE_MOUNT_DISPATCH = String.raw`        'schematic-saved-scene-bind' {
          if (-not $SchematicRelevanceSavedReadback209 -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,operationJson,rootCreated,rootPid,targetJson,uniqueContextId') {throw 'schematic-saved-scene-bind-fields'}
          foreach ($name in @('uniqueContextId','targetJson','operationJson')) {if ($request.$name -isnot [string]) {throw 'schematic-saved-scene-bind-types'}}
          $owner.BindSchematicSavedScene($request.uniqueContextId,$request.targetJson,$request.operationJson);$result=@{bound=$true}
        }
        'schematic-relevance-saved-scene' {
          if (-not $SchematicRelevanceSavedReadback209 -or $request.scenePhase -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'schematic-saved-scene-purpose'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','scenePhase')
          foreach ($name in $base) {if (@($request.PSObject.Properties.Name) -cnotcontains $name) {throw 'schematic-saved-scene-fields'}}
          $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);foreach ($property in $request.PSObject.Properties) {if ($base -cnotcontains $property.Name) {$fields[$property.Name]=$property.Value}}
          $owner.SendSchematicSavedScene([int]$request.requestId,$request.scenePhase,$fields);$result=@{written=$true}
        }
`;
