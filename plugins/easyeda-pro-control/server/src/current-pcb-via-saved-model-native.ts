/** Saved-only model calls reuse the exact existing fixed SDK codecs, with
 * selectors substituted from this generation's original loading custody. */
export const CURRENT_PCB_VIA_SAVED_MODEL_NATIVE = String.raw`
bool savedViaModelEnrolled,savedViaSceneReleased,savedViaSceneRead;int savedViaModelStep,savedViaSceneStep;string savedViaSceneContext;
public void BindSavedViaScene(string context){if(!savedViaReadback209||savedViaReadbackAbort||savedViaModelStep!=4||savedViaSceneContext!=null||context==null||!System.Text.RegularExpressions.Regex.IsMatch(context,@"\A[A-Za-z0-9_.:-]{1,128}\z"))throw Error("saved-scene-bind");savedViaSceneContext=context;}
public void SendSavedViaScene(int id,string method,string phase,System.Collections.IDictionary fields){if(!savedViaReadback209||savedViaReadbackAbort||savedViaSceneContext==null||savedViaSceneReleased)throw Error("saved-scene-owner");if(phase=="release"){if(savedViaSceneStep==0)throw Error("saved-scene-order");savedViaSceneReleased=true;}else if(phase=="properties"){if(savedViaSceneStep<1||savedViaSceneStep>4)throw Error("saved-scene-order");}else if(phase=="read-track"){if(savedViaSceneStep!=4||savedViaSceneRead||SpatialText(fields,"queryKind",32)!="region"||SpatialText(fields,"queryMode",32)!="inside"||SpatialNumber(fields,"leftMil")!=-10000000||SpatialNumber(fields,"rightMil")!=10000000||SpatialNumber(fields,"bottomMil")!=-10000000||SpatialNumber(fields,"topMil")!=10000000)throw Error("saved-scene-query");savedViaSceneRead=true;}else{string[] order={"wrapper","handler","bindings-track","functions"};if(savedViaSceneStep>=4||order[savedViaSceneStep]!=phase||phase=="wrapper"&&SpatialText(fields,"uniqueContextId",128)!=savedViaSceneContext)throw Error("saved-scene-order");savedViaSceneStep++;}string encoded=Spatial209ProtocolMessage(1,method,savedViaReadbackSession,phase,fields),prefix="{\"id\":1,";if(!encoded.StartsWith(prefix,StringComparison.Ordinal))throw Error("saved-scene-codec");SendMessage(id,"{\"id\":"+id.ToString(CultureInfo.InvariantCulture)+","+encoded.Substring(prefix.Length));}
public void EnrollSavedViaModel(){if(!savedViaReadback209||savedViaReadbackAbort||savedViaModelEnrolled||!savedViaObservationCompleted||!savedViaOpeningDispatched)throw Error("saved-model-enroll");savedViaModelEnrolled=true;}
public void SendSavedViaModel(int id,string phase){string[] order={"preflight","open-document","observe","primitives"};if(!savedViaReadback209||savedViaReadbackAbort||!savedViaModelEnrolled||savedViaModelStep>=order.Length||order[savedViaModelStep]!=phase)throw Error("saved-model-order");string encoded=phase=="primitives"?Primitives209ProtocolMessage(1,savedViaReadbackSession,savedViaReadbackContext,"observe",savedViaReadbackPath,savedViaReadbackProject,savedViaReadbackBranch,savedViaReadbackDocument,savedViaReadbackSource):PcbOpeningProtocolMessage(1,savedViaReadbackSession,savedViaReadbackContext,phase,savedViaReadbackPath,savedViaReadbackProject,savedViaReadbackBranch,savedViaReadbackDocument,savedViaReadbackSource);string prefix="{\"id\":1,";if(!encoded.StartsWith(prefix,StringComparison.Ordinal))throw Error("saved-model-codec");savedViaModelStep++;SendMessage(id,"{\"id\":"+id.ToString(CultureInfo.InvariantCulture)+","+encoded.Substring(prefix.Length));}
`;
export const CURRENT_PCB_VIA_SAVED_MODEL_DISPATCH = String.raw`        'saved-readback-model-enroll' {
          if (-not $PcbViaSavedReadback209 -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid') {throw 'saved-model-fields'}
          foreach ($field in @('helperInstance','jobId','rootCreated')) {if ($request.$field -isnot [string]) {throw 'saved-model-owner'}}
          if (($request.rootPid -isnot [int] -and $request.rootPid -isnot [long]) -or $request.helperInstance -cne $owner.HelperInstance -or $request.jobId -cne $owner.JobId -or $request.rootCreated -cne $owner.RootCreated -or $request.rootPid -ne $owner.RootPid) {throw 'saved-model-owner'}
          $owner.EnrollSavedViaModel();$result=@{modelEnrolled=$true}
        }
        'saved-readback-model' {
          if (-not $PcbViaSavedReadback209 -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,modelPhase,requestId,rootCreated,rootPid' -or $request.modelPhase -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'saved-model-fields'}
          foreach ($field in @('helperInstance','jobId','rootCreated')) {if ($request.$field -isnot [string]) {throw 'saved-model-owner'}}
          if (($request.rootPid -isnot [int] -and $request.rootPid -isnot [long]) -or $request.helperInstance -cne $owner.HelperInstance -or $request.jobId -cne $owner.JobId -or $request.rootCreated -cne $owner.RootCreated -or $request.rootPid -ne $owner.RootPid) {throw 'saved-model-owner'}
          $owner.SendSavedViaModel([int]$request.requestId,$request.modelPhase);$result=@{written=$true}
        }
`;

export const CURRENT_PCB_VIA_SAVED_SCENE_DISPATCH = String.raw`        'saved-readback-scene-bind' {
          if (-not $PcbViaSavedReadback209 -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid,uniqueContextId' -or $request.uniqueContextId -isnot [string]) {throw 'saved-scene-fields'}
          foreach ($field in @('helperInstance','jobId','rootCreated')) {if ($request.$field -isnot [string]) {throw 'saved-model-owner'}}
          if (($request.rootPid -isnot [int] -and $request.rootPid -isnot [long]) -or $request.helperInstance -cne $owner.HelperInstance -or $request.jobId -cne $owner.JobId -or $request.rootCreated -cne $owner.RootCreated -or $request.rootPid -ne $owner.RootPid) {throw 'saved-model-owner'}
          $owner.BindSavedViaScene($request.uniqueContextId);$result=@{sceneBound=$true}
        }
        'saved-readback-scene' {
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','method','spatialPhase')
          foreach ($field in $base) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'saved-scene-fields'}}
          if (-not $PcbViaSavedReadback209 -or $request.method -isnot [string] -or $request.spatialPhase -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'saved-scene-fields'}
          foreach ($field in @('helperInstance','jobId','rootCreated')) {if ($request.$field -isnot [string]) {throw 'saved-model-owner'}}
          if (($request.rootPid -isnot [int] -and $request.rootPid -isnot [long]) -or $request.helperInstance -cne $owner.HelperInstance -or $request.jobId -cne $owner.JobId -or $request.rootCreated -cne $owner.RootCreated -or $request.rootPid -ne $owner.RootPid) {throw 'saved-model-owner'}
          $fields=@{};foreach ($property in $request.PSObject.Properties) {if ($base -cnotcontains $property.Name) {$fields[$property.Name]=$property.Value}}
          $owner.SendSavedViaScene([int]$request.requestId,$request.method,$request.spatialPhase,$fields);$result=@{written=$true}
        }
`;
