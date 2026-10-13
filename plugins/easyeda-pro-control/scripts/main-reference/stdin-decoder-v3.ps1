# Fixed binary-helper grammar. Parsing and hashing have no native side effects.
function Convert-MainReferenceFieldV3([string]$encoded,[int]$maximum,[string]$expectedHash,[bool]$isText) {
 if($null-eq$encoded-or$encoded.Length-lt4-or$encoded.Length-gt(4*[Math]::Ceiling($maximum/3.0))-or$expectedHash-cnotmatch'\A[a-f0-9]{64}\z'){throw 'MAIN_REFERENCE_STDIN_REFUSED'}
 $bytes=[Convert]::FromBase64String($encoded)
 if($bytes.Length-le0-or$bytes.Length-gt$maximum-or[Convert]::ToBase64String($bytes)-cne$encoded){throw 'MAIN_REFERENCE_STDIN_REFUSED'}
 $algorithm=[Security.Cryptography.SHA256]::Create()
 try{$digest=([BitConverter]::ToString($algorithm.ComputeHash($bytes))).Replace('-','').ToLowerInvariant()}finally{$algorithm.Dispose()}
 if($digest-cne$expectedHash){throw 'MAIN_REFERENCE_STDIN_REFUSED'}
 $text=$null
 if($isText){$text=([Text.UTF8Encoding]::new($false,$true)).GetString($bytes)}
 return @{bytes=$bytes;text=$text}
}
function Convert-MainReferenceStdinV3([string]$text,[string]$mainHash,[string]$requestHash,[string]$helperHash,[int]$helperBytes) {
 try {
  # New v3 bounds, not an expansion of historical v2. The helper also has an
  # exact compiled byte length/hash; callers cannot choose any of these values.
  if($null-eq$text-or$text.Length-le0-or$text.Length-gt524288-or$helperBytes-le0-or$helperBytes-gt262144){throw 'MAIN_REFERENCE_STDIN_REFUSED'}
  $pattern='\A\{"profile":"private\.main-reference-stdin\.v3","helperBase64":"(?<helper>[A-Za-z0-9+/=]{4,349528})","mainBase64":"(?<main>[A-Za-z0-9+/=]{4,133336})","requestBase64":"(?<request>[A-Za-z0-9+/=]{4,10924})"\}\z'
  $matched=[Text.RegularExpressions.Regex]::Match($text,$pattern,[Text.RegularExpressions.RegexOptions]::CultureInvariant,[TimeSpan]::FromMilliseconds(1000))
  if(-not$matched.Success-or$matched.Index-ne0-or$matched.Length-ne$text.Length){throw 'MAIN_REFERENCE_STDIN_REFUSED'}
  $helper=Convert-MainReferenceFieldV3 $matched.Groups['helper'].Value $helperBytes $helperHash $false
  if($helper.bytes.Length-ne$helperBytes){throw 'MAIN_REFERENCE_STDIN_REFUSED'}
  $main=Convert-MainReferenceFieldV3 $matched.Groups['main'].Value 100000 $mainHash $true
  $request=Convert-MainReferenceFieldV3 $matched.Groups['request'].Value 8192 $requestHash $true
  return @{profile='private.main-reference-stdin.v3';helper=$helper;main=$main;request=$request}
 } catch {throw 'MAIN_REFERENCE_STDIN_REFUSED'}
}
