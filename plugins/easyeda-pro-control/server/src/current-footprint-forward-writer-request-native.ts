/** Forward-only envelopes keep the shared 32 KiB ceiling and native body caps. */
export function installCurrentFootprintForwardWriterRequestGuard(input: string, complete = false): string {
  const before = "$largeOpening=$request.action";
  const classification = complete
    ? "$largeForwardBody=$largeForwardBody -or ((@($request.PSObject.Properties.Name) -ccontains 'body') -and $request.body -is [string] -and ($request.action -ceq 'footprint-forward-copy-local' -or ($request.action -ceq 'footprint-forward-copy-tail-control' -and $request.operation -ceq 'precreate-body')))"
    : "$largeForwardBody=(@('footprint-forward-initial-cache-send','footprint-forward-initial-sync-send') -ccontains $request.action) -and (@($request.PSObject.Properties.Name) -ccontains 'body') -and $request.body -is [string]";
  if (input.split(before).length !== 2) { throw new Error("FORWARD_WRITER_REQUEST_CLASSIFICATION_ANCHOR"); }
  let result = input.replace(before, `${classification}\n      ${before}`);
  if (complete) { return result; }
  const guard = "(-not $largeV2Request -and -not $largeMainRequest";
  if (result.split(guard).length !== 2) { throw new Error("FORWARD_WRITER_REQUEST_GUARD_ANCHOR"); }
  result = result.replace(guard, "(-not $largeForwardBody -and -not $largeV2Request -and -not $largeMainRequest");
  return result;
}

/** Execute the exact generated request-size guard on inert fixed envelopes in
 * the maintained Windows smoke. No owner or application request is dispatched. */
export function currentFootprintForwardWriterRequestSmoke(driver: string, complete = false): string {
  const start = driver.indexOf("      $request=$line.ToString() | ConvertFrom-Json");
  const end = driver.indexOf("      if ($request.id -isnot [string]", start);
  if (start === -1 || end <= start) { throw new Error("FORWARD_WRITER_REQUEST_SMOKE_ANCHOR"); }
  const guard = driver.slice(start, end);
  const frontier = driver.slice(driver.indexOf("        'footprint-forward-startup-frontier-control' {"));
  const roleLine = frontier.split("\n").find(line => line.startsWith("            $role="));
  if (roleLine === undefined) { throw new Error("FORWARD_WRITER_NULL_ROLE_SMOKE_ANCHOR"); }
  if (guard.includes("'@")) { throw new Error("FORWARD_WRITER_REQUEST_SMOKE_QUOTE"); }
  return `foreach($operation in @('timer-complete','queue-open','complete')){
${roleLine}
  $strings=New-Object 'System.Collections.Generic.List[string]'
  $strings.Add($role)
  if($null -cne $strings[0]){throw 'forward-frontier-null-string-binding'}
}
$requestGuard=[ScriptBlock]::Create(@'
param($line)
$WorkerStartupFootprintForwardWriter209=$true
$WorkerStartupFootprintForwardWriterComplete209=$true
$WorkerStartupFootprintCombined209=$false
${guard}
'@)
$actions=@('footprint-forward-initial-cache-send','footprint-forward-initial-sync-send'${complete ? ",'footprint-forward-copy-local','footprint-forward-copy-tail-control'" : ""})
foreach($action in $actions){
  foreach($body in @(('a'*5000),(('"'+'\\')*2500))){
    $line=@{action=$action;operation='precreate-body';body=$body;method='Runtime.callFunctionOn';id=('a'*32)} | ConvertTo-Json -Compress
    if($line.Length -le 4096 -or [Text.Encoding]::UTF8.GetByteCount($line) -gt 32768){throw 'forward-envelope-smoke-fixture'}
    & $requestGuard $line
  }
}
$refused=$false
try {& $requestGuard (@{action='identity';body=('a'*5000);method='Runtime.callFunctionOn'} | ConvertTo-Json -Compress)} catch {$refused=$true}
if(-not $refused){throw 'forward-envelope-smoke-unrelated-limit'}
$refused=$false
try {& $requestGuard (@{action='footprint-forward-initial-cache-send';body=('a'*32768);method='Runtime.callFunctionOn'} | ConvertTo-Json -Compress)} catch {$refused=$true}
if(-not $refused){throw 'forward-envelope-smoke-total-limit'}
`;
}
