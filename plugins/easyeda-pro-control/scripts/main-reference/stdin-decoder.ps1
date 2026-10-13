# Private fixed grammar decoder. Defines functions only; never compiles or writes.
# The owner invokes it with command-owned expected hashes before any side effect.
function Convert-MainReferenceFieldV2([string]$encoded,[int]$maximum,[string]$expectedHash) {
 if($encoded.Length-lt4-or$encoded.Length-gt(4*[Math]::Ceiling($maximum/3.0))-or$expectedHash-cnotmatch'\A[a-f0-9]{64}\z'){throw 'MAIN_REFERENCE_STDIN_REFUSED'}
 $bytes=[Convert]::FromBase64String($encoded)
 if($bytes.Length-le0-or$bytes.Length-gt$maximum-or[Convert]::ToBase64String($bytes)-cne$encoded){throw 'MAIN_REFERENCE_STDIN_REFUSED'}
 $utf8=[Text.UTF8Encoding]::new($false,$true)
 $text=$utf8.GetString($bytes)
 $algorithm=[Security.Cryptography.SHA256]::Create()
 try{$digest=([BitConverter]::ToString($algorithm.ComputeHash($bytes))).Replace('-','').ToLowerInvariant()}finally{$algorithm.Dispose()}
 if($digest-cne$expectedHash){throw 'MAIN_REFERENCE_STDIN_REFUSED'}
 # The byte array is a hashtable value, not enumerated function output.
 return @{bytes=$bytes;text=$text}
}
function Convert-MainReferenceStdinV2([string]$text,[string]$mainHash,[string]$requestHash,[string]$ownerHash,[string]$clockHash) {
 try {
  if($null-eq$text-or$text.Length-le0-or$text.Length-gt180000){throw 'MAIN_REFERENCE_STDIN_REFUSED'}
  $pattern='\A\{"profile":"private\.main-reference-stdin\.v2","ownerBase64":"(?<owner>[A-Za-z0-9+/=]{4,43692})","clockBase64":"(?<clock>[A-Za-z0-9+/=]{4,43692})","mainBase64":"(?<main>[A-Za-z0-9+/=]{4,133336})","requestBase64":"(?<request>[A-Za-z0-9+/=]{4,10924})"\}\z'
  $matched=[Text.RegularExpressions.Regex]::Match($text,$pattern,[Text.RegularExpressions.RegexOptions]::CultureInvariant,[TimeSpan]::FromMilliseconds(1000))
  if(-not$matched.Success-or$matched.Index-ne0-or$matched.Length-ne$text.Length){throw 'MAIN_REFERENCE_STDIN_REFUSED'}
  $owner=Convert-MainReferenceFieldV2 $matched.Groups['owner'].Value 32768 $ownerHash
  $clock=Convert-MainReferenceFieldV2 $matched.Groups['clock'].Value 32768 $clockHash
  $main=Convert-MainReferenceFieldV2 $matched.Groups['main'].Value 100000 $mainHash
  $request=Convert-MainReferenceFieldV2 $matched.Groups['request'].Value 8192 $requestHash
  return @{profile='private.main-reference-stdin.v2';owner=$owner;clock=$clock;main=$main;request=$request}
 } catch {throw 'MAIN_REFERENCE_STDIN_REFUSED'}
}
