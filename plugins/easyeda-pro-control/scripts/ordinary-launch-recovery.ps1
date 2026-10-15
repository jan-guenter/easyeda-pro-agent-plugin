# Read-only ordinary-launch recovery observation. No input, application launch,
# process termination, command-line enumeration, project access or Save action.
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
Set-StrictMode -Version Latest
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
$schema = 'easyeda-pro-control.ordinary-launch-recovery-observation.v1'
try {
  $ownPid = $PID
  if ($ownPid -le 0) { throw 'recovery-observation-refused' }
  $otherPowerShellPresent = $false
  $sameNameProcessPresent = $false
  for ($sample = 0; $sample -lt 2; $sample++) {
    $shells = @([Diagnostics.Process]::GetProcessesByName('powershell'))
    try {
      if ($shells.Count -lt 1 -or $shells.Count -gt 256) { throw 'recovery-observation-refused' }
      $ownCount = 0
      $seen = [Collections.Generic.HashSet[int]]::new()
      foreach ($shell in $shells) {
        $processId = $shell.Id
        if ($processId -le 0 -or -not $seen.Add($processId)) { throw 'recovery-observation-refused' }
        $exited = $shell.HasExited
        if ($processId -eq $ownPid) {
          if ($exited) { throw 'recovery-observation-refused' }
          $ownCount++
        } elseif (-not $exited) { $otherPowerShellPresent = $true }
      }
      if ($ownCount -ne 1) { throw 'recovery-observation-refused' }
    } finally { foreach ($shell in $shells) { $shell.Dispose() } }
    $applications = @([Diagnostics.Process]::GetProcessesByName('easyeda-pro'))
    try {
      if ($applications.Count -gt 256) { throw 'recovery-observation-refused' }
      $seen = [Collections.Generic.HashSet[int]]::new()
      foreach ($application in $applications) {
        $processId = $application.Id
        if ($processId -le 0 -or -not $seen.Add($processId)) { throw 'recovery-observation-refused' }
        if (-not $application.HasExited) { $sameNameProcessPresent = $true }
      }
    } finally { foreach ($application in $applications) { $application.Dispose() } }
  }
  [Console]::WriteLine((@{ schema = $schema; samples = 2;
    otherPowerShellPresent = $otherPowerShellPresent; sameNameProcessPresent = $sameNameProcessPresent } | ConvertTo-Json -Compress))
  exit 0
} catch {
  [Console]::WriteLine((@{ schema = $schema; error = 'recovery-observation-refused' } | ConvertTo-Json -Compress))
  exit 1
}
