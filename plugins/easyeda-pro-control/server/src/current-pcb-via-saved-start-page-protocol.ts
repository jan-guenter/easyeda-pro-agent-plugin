/** Finite saved-only startup sampling. No attachment, realm, URL or code is
 * supplied; source/frame qualification remains a separate original stage. */
export const CURRENT_PCB_VIA_SAVED_START_PAGE_REQUESTS = Object.freeze({ version: 1, inventorySamples: 8, delayMilliseconds: 250, total: 9, additionalInventoryRequests: 7 });
export type CurrentPcbViaSavedStartPagePhase = "version" | "targets";
export function currentPcbViaSavedStartPageWire(id: number, phase: CurrentPcbViaSavedStartPagePhase): Readonly<{ id: number; method: "Browser.getVersion" | "Target.getTargets"; savedStartPagePhase: CurrentPcbViaSavedStartPagePhase }> {
  if (!Number.isSafeInteger(id) || id < 1 || phase !== "version" && phase !== "targets") { throw new Error("SAVED_START_PAGE_COMMAND"); }
  return Object.freeze({ id, method: phase === "version" ? "Browser.getVersion" : "Target.getTargets", savedStartPagePhase: phase });
}
export type CurrentPcbViaSavedStartPageCommand = ReturnType<typeof currentPcbViaSavedStartPageWire>;
export function currentPcbViaSavedStartPageNativeFrame(chunk: Buffer): Readonly<Record<string, string | number>> {
  if (chunk.length > 512 || chunk.at(-1) !== 0) { throw new Error("SAVED_START_PAGE_FRAME"); }
  const value: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1)));
  if (value === null || typeof value !== "object" || !("id" in value) || typeof value.id !== "number" || !("savedStartPagePhase" in value) || value.savedStartPagePhase !== "version" && value.savedStartPagePhase !== "targets") { throw new Error("SAVED_START_PAGE_FRAME"); }
  const command = currentPcbViaSavedStartPageWire(value.id, value.savedStartPagePhase);
  if (!chunk.equals(Buffer.from(`${JSON.stringify(command)}\0`))) { throw new Error("SAVED_START_PAGE_FRAME"); }
  return Object.freeze({ action: "saved-readback-start-page", requestId: value.id, startPagePhase: value.savedStartPagePhase });
}
export const CURRENT_PCB_VIA_SAVED_START_PAGE_NATIVE = String.raw`
bool savedViaStartPageVersion;int savedViaStartPageSamples;
public void SendSavedViaStartPage(int id,string phase){if(!savedViaReadback209||savedViaReadbackAbort||!savedViaReadbackConstructionComplete||savedViaReadbackEarlyActorStep!=3||savedViaReadbackParentArmed||savedViaReadbackSession!=null)throw Error("saved-start-page-owner");string method;if(phase=="version"){if(savedViaStartPageVersion||savedViaStartPageSamples!=0)throw Error("saved-start-page-version-once");savedViaStartPageVersion=true;method="Browser.getVersion";}else if(phase=="targets"){if(!savedViaStartPageVersion||savedViaStartPageSamples>=${String(CURRENT_PCB_VIA_SAVED_START_PAGE_REQUESTS.inventorySamples)})throw Error("saved-start-page-sample-bound");savedViaStartPageSamples++;method="Target.getTargets";}else throw Error("saved-start-page-phase");SendMessage(id,"{\"id\":"+id.ToString(CultureInfo.InvariantCulture)+",\"method\":"+JsonString(method)+"}\0");}
`;
export const CURRENT_PCB_VIA_SAVED_START_PAGE_DISPATCH = String.raw`        'saved-readback-start-page' {
          if (-not $PcbViaSavedReadback209 -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,requestId,rootCreated,rootPid,startPagePhase' -or $request.startPagePhase -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'saved-start-page-fields'}
          foreach ($field in @('helperInstance','jobId','rootCreated')) {if ($request.$field -isnot [string]) {throw 'saved-start-page-owner'}}
          if (($request.rootPid -isnot [int] -and $request.rootPid -isnot [long]) -or $request.helperInstance -cne $owner.HelperInstance -or $request.jobId -cne $owner.JobId -or $request.rootCreated -cne $owner.RootCreated -or $request.rootPid -ne $owner.RootPid) {throw 'saved-start-page-owner'}
          $owner.SendSavedViaStartPage([int]$request.requestId,$request.startPagePhase);$result=@{written=$true}
        }
`;
