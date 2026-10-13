# Fixed byte-loaded helper. No source compilation, filename loader or fallback.
# The transport compiler pins these bytes and the complete helper independently.
$ErrorActionPreference='Stop'
$nonce='__NONCE__';$requestHash='__REQUEST_HASH__';$mainHash='__MAIN_HASH__'
$helperHash='__HELPER_HASH__';$helperBytes=__HELPER_BYTES__
function Need([bool]$ok){if(-not$ok){throw 'MAIN_REFERENCE_REFUSED'}}
__STDIN_DECODER__
$stdinBuffer=New-Object byte[] 524289;$stdinCount=0;$stdinStream=[Console]::OpenStandardInput()
try{while($stdinCount-lt$stdinBuffer.Length){$n=$stdinStream.Read($stdinBuffer,$stdinCount,$stdinBuffer.Length-$stdinCount);Need ($n-ge0-and$n-le($stdinBuffer.Length-$stdinCount));if($n-eq0){break};$stdinCount+=$n}}finally{$stdinStream.Dispose()}
Need ($stdinCount-gt0-and$stdinCount-le524288)
for($i=0;$i-lt$stdinCount;$i++){Need ($stdinBuffer[$i]-le127)}
$stdinText=[Text.Encoding]::ASCII.GetString($stdinBuffer,0,$stdinCount)
$decoded=Convert-MainReferenceStdinV3 $stdinText $mainHash $requestHash $helperHash $helperBytes
Need ($nonce-cmatch'\A[a-f0-9]{64}\z')
# Retain the exact loaded assembly, type and method. Never resolve the helper
# through a global PowerShell type name or substitute a disk-path assembly.
$helperAssembly=[Reflection.Assembly]::Load([byte[]]$decoded.helper.bytes)
Need ($helperAssembly.GetName().Name-ceq'Easyeda.MainReference')
$helperType=$helperAssembly.GetType('EasyedaMainReferenceSession',$true,$false)
Need ($null-ne$helperType-and$helperType.Assembly-eq$helperAssembly)
$flags=[Reflection.BindingFlags]::Public-bor[Reflection.BindingFlags]::Static-bor[Reflection.BindingFlags]::DeclaredOnly
$methods=@($helperType.GetMethods($flags))
Need ($methods.Length-eq1)
$method=$methods[0]
Need ($method.Name-ceq'Run'-and$method.DeclaringType-eq$helperType-and$method.ReturnType-eq[string]-and-not$method.IsGenericMethod)
$parameters=$method.GetParameters()
Need ($parameters.Length-eq5-and$parameters[0].ParameterType-eq[byte[]]-and$parameters[1].ParameterType-eq[byte[]]-and$parameters[2].ParameterType-eq[string]-and$parameters[3].ParameterType-eq[string]-and$parameters[4].ParameterType-eq[string])
$arguments=New-Object object[] 5
$arguments[0]=$decoded.main.bytes;$arguments[1]=$decoded.request.bytes;$arguments[2]=$nonce;$arguments[3]=$mainHash;$arguments[4]=$requestHash
# The helper retains its original session in a one-shot static owner slot,
# including failures. JSON output does not drop unresolved native ownership.
$nativeJson=$method.Invoke($null,$arguments)
Need ($nativeJson-is[string]-and$nativeJson.Length-gt0-and$nativeJson.Length-le65536)
$utf8=[Text.UTF8Encoding]::new($false,$true)
Need ($utf8.GetByteCount($nativeJson)-le65536)
# Embed the original result without reserializing or repairing its contents.
$output='{"profile":"private.main-reference-transport-result.v3","helperSha256":"'+$helperHash+'","session":'+$nativeJson+'}'
[Console]::Out.WriteLine($output)
