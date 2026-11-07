# Maintained pure parser regression on the actual supported host. Invokes only
# the production helper's early parser branch: no C#, Win32, CAD, file creation,
# watcher, application, bridge, SQLite or process-owner action is reached.
$ErrorActionPreference = 'Stop'
if ($PSVersionTable.PSVersion.Major -ne 5 -or $PSVersionTable.PSVersion.Minor -ne 1) { throw 'This parser check requires Windows PowerShell5.1.' }
$helper = Join-Path $PSScriptRoot 'managed-fixture-destination.ps1'
$passed = 0
function Invoke-Parser([string]$Json) {
  $encoded = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($Json))
  $raw = & $helper -LibraryDirectoriesBase64 $encoded -ParseLibraryDirectoriesOnly
  $value = ConvertFrom-Json -InputObject $raw
  if ($value.schema -cne 'easyeda-pro-control.fixture-library-parser-only.v1' -or $value.nativeAllocated -ne $false -or $value.csharpCompiled -ne $false) { throw 'parser-only-boundary' }
  return $value
}
$good = @(
  @{json='["C:\\SyntheticLibraries"]'; expected=@('C:\SyntheticLibraries')},
  @{json='["C:\\SyntheticLibraries","D:\\OtherLibraries","E:\\ThirdLibraries","F:\\FourthLibraries"]'; expected=@('C:\SyntheticLibraries','D:\OtherLibraries','E:\ThirdLibraries','F:\FourthLibraries')}
)
foreach ($case in $good) {
  $result = Invoke-Parser $case.json
  if ($result.directories -isnot [object[]] -or $result.count -ne $case.expected.Count -or $result.directories.Count -ne $case.expected.Count) { throw 'parser-array-roster' }
  for ($index=0; $index -lt $case.expected.Count; $index++) { if ($result.directories[$index] -isnot [string] -or $result.directories[$index] -cne $case.expected[$index]) { throw 'parser-string-roster' } }
  $passed++
}
$bad = @(
  '"C:\\SyntheticLibraries"',
  '[]',
  '["C:\\A","D:\\B","E:\\C","F:\\D","G:\\E"]',
  '[["C:\\SyntheticLibraries"]]',
  '[{"path":"C:\\SyntheticLibraries"}]',
  '[1]',
  '[null]',
  '["relative"]',
  '["C:\\Temp\\..\\Libraries"]',
  '["C:\\Temp \\Libraries"]',
  '["C:\\Temp\\con\\Libraries"]',
  '["C:\\SyntheticLibraries","C:\\syntheticlibraries"]'
)
foreach ($json in $bad) {
  $refused = $false
  try { $null = Invoke-Parser $json } catch { $refused = $true }
  if (-not $refused) { throw 'parser-invalid-input-accepted' }
  $passed++
}
@{schema='easyeda-pro-control.fixture-library-parser-regression.v1'; passed=$passed; powershellVersion=$PSVersionTable.PSVersion.ToString(); nativeAllocated=$false; csharpCompiled=$false; originalLostStderrCauseProved=$false} | ConvertTo-Json -Compress | ForEach-Object { [Console]::WriteLine($_) }
