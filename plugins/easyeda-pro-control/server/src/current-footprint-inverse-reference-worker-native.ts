/** Closed native reference-worker composition; every application/owner gate is
 * separate from the immutable shared codec and previous GET/DELETE purposes. */
import { currentFootprintInverseReferenceWorkerCodecNativeSource } from "./current-footprint-inverse-reference-worker-native-codec.ts";
import { currentFootprintInverseReferenceWorkerLedgerNativeSource } from "./current-footprint-inverse-reference-worker-native-ledger.ts";

export function currentFootprintInverseReferenceWorkerNativeSource(): string {
  return currentFootprintInverseReferenceWorkerCodecNativeSource() + currentFootprintInverseReferenceWorkerLedgerNativeSource();
}
export const CURRENT_FOOTPRINT_INVERSE_REFERENCE_WORKER_DISPATCH = String.raw`        'footprint-inverse-reference-worker' {
          if(-not $FootprintInverse209 -or -not $launched){throw 'inverse-reference-worker-purpose'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method');foreach($name in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $name){throw 'inverse-reference-worker-field'}}
          if($request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'inverse-reference-worker-type'}
          $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);$role=$null;foreach($property in $request.PSObject.Properties){if($request.method -cne 'control' -and $property.Name -ceq 'role'){$role=$property.Value;if($role -isnot [string]){throw 'inverse-reference-worker-role'}}elseif($base -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          if($request.method -ceq 'control'){if($request.requestId -ne 0){throw 'inverse-reference-worker-control'};$owner.ControlFootprintInverseReferenceWorker($request.phase,$fields)}else{$owner.SendFootprintInverseReferenceWorker([int]$request.requestId,$request.phase,$role,$request.method,$fields)}
          $result=@{written=$true}
        }
`;
