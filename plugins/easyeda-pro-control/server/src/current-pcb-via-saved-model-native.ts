/** Saved-only model calls reuse the exact existing fixed SDK codecs, with
 * selectors substituted from this generation's original loading custody. */
export const CURRENT_PCB_VIA_SAVED_MODEL_NATIVE = String.raw`
bool savedViaModelEnrolled;int savedViaModelStep;
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
