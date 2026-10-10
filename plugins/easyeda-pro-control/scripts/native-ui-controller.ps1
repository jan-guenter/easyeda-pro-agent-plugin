$ErrorActionPreference = 'Stop'
[Console]::InputEncoding = New-Object System.Text.UTF8Encoding($false)
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
$schema = 'easyeda-pro-control.windows-native-ui.v1'
$dispatched = $false
try {
  $line = [Console]::ReadLine()
  if (-not $line -or $line.Length -gt 32768) { throw 'request-bound' }
  $request = $line | ConvertFrom-Json
  if ($request.schema -cne $schema -or $request.executableSha256 -cnotmatch '^[a-f0-9]{64}$') { throw 'installation-binding-format' }
  if ($request.action -ceq 'discover') {
    if ((Get-FileHash -LiteralPath $request.executable -Algorithm SHA256).Hash.ToLowerInvariant() -cne $request.executableSha256) { throw 'discovery-executable-hash' }
    $observations = @()
    foreach ($candidate in @(Get-CimInstance Win32_Process -Filter "Name='easyeda-pro.exe'")) {
      if ($candidate.ExecutablePath -cne $request.executable -or -not $candidate.CommandLine -or $candidate.CommandLine -match '(?:^|\s)--type(?:=|\s)') { continue }
      $process = Get-Process -Id $candidate.ProcessId -ErrorAction Stop
      if ($process.Path -cne $request.executable -or $process.ProcessName -cne 'easyeda-pro') { throw 'discovery-generation-changed' }
      if ($observations.Count -ge 16) { throw 'discovery-count-bound' }
      $observations += @{authority='observed-unowned';rootPid=$process.Id;rootStartTicks=$process.StartTime.ToUniversalTime().Ticks.ToString([Globalization.CultureInfo]::InvariantCulture);executable=[string]$request.executable;executableSha256=[string]$request.executableSha256}
    }
    @{schema=$schema;action='discover';observations=$observations} | ConvertTo-Json -Depth 5 -Compress
    exit
  }
  if ($request.schema -cne $schema -or $request.rootStartTicks -isnot [string] -or $request.rootStartTicks -cnotmatch '^[0-9]{15,20}$' -or $request.executableSha256 -cnotmatch '^[a-f0-9]{64}$') { throw 'binding-format' }
  $target = Get-Process -Id $request.rootPid -ErrorAction Stop
  function Assert-Root {
    $target.Refresh()
    if ($target.HasExited -or $target.ProcessName -cne 'easyeda-pro' -or $target.Path -cne $request.executable -or $target.StartTime.ToUniversalTime().Ticks.ToString([Globalization.CultureInfo]::InvariantCulture) -cne $request.rootStartTicks) { throw 'root-generation' }
  }
  Assert-Root
  if ((Get-FileHash -LiteralPath $target.Path -Algorithm SHA256).Hash.ToLowerInvariant() -cne $request.executableSha256) { throw 'executable-hash' }
  $legacy = Join-Path $PSScriptRoot 'native-ui.ps1'
  if ($request.legacyHelperSha256 -cnotmatch '^[a-f0-9]{64}$' -or (Get-FileHash -LiteralPath $legacy -Algorithm SHA256).Hash.ToLowerInvariant() -cne $request.legacyHelperSha256) { throw 'helper-hash' }
  Add-Type -AssemblyName UIAutomationClient
  Add-Type -AssemblyName UIAutomationTypes
  Add-Type -AssemblyName System.Windows.Forms
  Add-Type -AssemblyName System.Drawing
  Add-Type @'
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
public static class EasyedaUiController {
  public delegate bool EnumCallback(IntPtr handle, IntPtr value);
  [DllImport("user32.dll")] static extern bool EnumWindows(EnumCallback callback, IntPtr value);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr handle);
  [DllImport("user32.dll")] public static extern bool IsWindowEnabled(IntPtr handle);
  [DllImport("user32.dll", EntryPoint="GetWindowLongW")] public static extern uint GetWindowLong(IntPtr handle, int index);
  [DllImport("user32.dll", SetLastError=true)] public static extern bool PostMessage(IntPtr handle, uint message, IntPtr wParam, IntPtr lParam);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr handle, out uint pid);
  [DllImport("user32.dll")] public static extern IntPtr GetWindow(IntPtr handle, uint command);
  [DllImport("user32.dll")] public static extern IntPtr GetAncestor(IntPtr handle, uint flags);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr handle);
  [DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr handle, int command);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr handle);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint flags, uint x, uint y, uint data, UIntPtr extra);
  public static IntPtr[] Windows() { var result = new List<IntPtr>(); EnumWindows((handle, value) => { if(IsWindowVisible(handle)) result.Add(handle); return true; }, IntPtr.Zero); return result.ToArray(); }
}
'@
  [void][EasyedaUiController]::SetProcessDPIAware()
  function Window-Pid([IntPtr]$handle) {
    $value = [uint32]0
    [void][EasyedaUiController]::GetWindowThreadProcessId($handle, [ref]$value)
    return $value
  }
  function Owned-Window([IntPtr]$handle) {
    $seen = @{}
    for ($depth = 0; $depth -lt 8 -and $handle -ne [IntPtr]::Zero; $depth++) {
      $key = $handle.ToInt64().ToString([Globalization.CultureInfo]::InvariantCulture)
      if ($seen.ContainsKey($key)) { return $false }
      $seen[$key] = $true
      if ((Window-Pid $handle) -eq $request.rootPid) { return $true }
      $handle = [EasyedaUiController]::GetWindow($handle, 4)
    }
    return $false
  }
  function Window-Row([IntPtr]$handle) {
    $element = [System.Windows.Automation.AutomationElement]::FromHandle($handle)
    $rect = $element.Current.BoundingRectangle
    return @{ handle=$handle.ToInt64().ToString([Globalization.CultureInfo]::InvariantCulture); pid=(Window-Pid $handle); title=$element.Current.Name; className=$element.Current.ClassName; bounds=@($rect.X,$rect.Y,$rect.Width,$rect.Height); owner=[EasyedaUiController]::GetWindow($handle,4).ToInt64().ToString([Globalization.CultureInfo]::InvariantCulture) }
  }
  $action = [string]$request.action
  if ($action -notin @('windows','inspect','focused','capture','focus','invoke','setvalue','filename','click','doubleclick','rightclick','keys','normal-close')) { throw 'action-not-admitted' }
  $writes = $action -in @('focus','invoke','setvalue','filename','click','doubleclick','rightclick','keys','normal-close')
  if ($writes -and $request.confirmUIWrite -isnot [bool]) { throw 'confirmation-missing' }
  if ($writes -and $request.confirmUIWrite -ne $true) { throw 'confirmation-false' }
  $binding = @{rootPid=[int]$request.rootPid;rootStartTicks=[string]$request.rootStartTicks;executable=[string]$request.executable;executableSha256=[string]$request.executableSha256}
  if ($action -eq 'windows') {
    $rows = @()
    foreach ($handle in [EasyedaUiController]::Windows()) {
      if (Owned-Window $handle) {
        if ($rows.Count -ge 64) { throw 'window-count-bound' }
        $rows += Window-Row $handle
      }
    }
    $target.Refresh()
    $result = @{windows=$rows;mainWindowHandle=$target.MainWindowHandle.ToInt64().ToString([Globalization.CultureInfo]::InvariantCulture)}
  } else {
    if ($request.windowHandle -isnot [string] -or $request.windowHandle -cnotmatch '^[1-9][0-9]{0,18}$') { throw 'window-format' }
    $windowHandle = [IntPtr][long]$request.windowHandle
    if (-not [EasyedaUiController]::IsWindowVisible($windowHandle) -or -not (Owned-Window $windowHandle)) { throw 'window-not-owned' }
    $window = [System.Windows.Automation.AutomationElement]::FromHandle($windowHandle)
    $rect = $window.Current.BoundingRectangle
    $windowPid = Window-Pid $windowHandle
    Assert-Root
    # Pointer and keyboard operations may not reach another application, even if
    # an unrelated process steals focus while a dialog is being inspected.
    if ($action -in @('focused','capture','click','doubleclick','rightclick','keys') -and -not (Owned-Window ([EasyedaUiController]::GetForegroundWindow()))) { throw 'foreign-foreground' }
    if ($action -in @('click','doubleclick','rightclick','keys') -and [EasyedaUiController]::GetForegroundWindow() -ne $windowHandle) { throw 'input-target-is-not-foreground' }
    if ($request.PSObject.Properties.Name -contains 'recoveryCloseConfirmation') {
      # The dedicated journal coordinator supplies this, never ordinary UI input.
      # No click occurs if any pixels, bounds, foreground or process changed.
      $proof = $request.recoveryCloseConfirmation
      if ($action -cne 'click' -or $proof.expectedCaptureSha256 -cnotmatch '^[a-f0-9]{64}$' -or $proof.expectedBounds.Count -ne 4) { throw 'recovery-capture-format' }
      $actualBounds = @($rect.X,$rect.Y,$rect.Width,$rect.Height)
      for ($i=0;$i -lt 4;$i++) { if ([double]$proof.expectedBounds[$i] -ne [double]$actualBounds[$i]) { throw 'recovery-capture-bounds' } }
      if ($rect.Width -le 0 -or $rect.Height -le 0 -or $rect.Width*$rect.Height -gt 16777216) { throw 'recovery-capture-dimensions' }
      $bitmap = New-Object System.Drawing.Bitmap([int]$rect.Width,[int]$rect.Height)
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      $stream = New-Object System.IO.MemoryStream
      $digest = [System.Security.Cryptography.SHA256]::Create()
      try {
        $graphics.CopyFromScreen([int]$rect.X,[int]$rect.Y,0,0,$bitmap.Size)
        $bitmap.Save($stream,[System.Drawing.Imaging.ImageFormat]::Png)
        $actualHash = ([BitConverter]::ToString($digest.ComputeHash($stream.ToArray()))).Replace('-','').ToLowerInvariant()
        if ($actualHash -cne $proof.expectedCaptureSha256) { throw 'recovery-capture-pixels-changed' }
      } finally { $digest.Dispose(); $stream.Dispose(); $graphics.Dispose(); $bitmap.Dispose() }
      Assert-Root
      if ([EasyedaUiController]::GetForegroundWindow() -ne $windowHandle -or -not (Owned-Window $windowHandle)) { throw 'recovery-window-changed' }
    }
    if ($action -eq 'normal-close') {
      # Process.MainWindowHandle can temporarily select an ownerless tooltip.
      # Bind the explicitly observed native application window instead. Title
      # is checked for stability, not a hardcoded UI language or version string.
      $title = [string]$window.Current.Name
      if ($windowPid -ne $request.rootPid -or
          [EasyedaUiController]::GetAncestor($windowHandle,2) -ne $windowHandle -or
          [EasyedaUiController]::GetAncestor($windowHandle,3) -ne $windowHandle -or
          [EasyedaUiController]::GetWindow($windowHandle,4) -ne [IntPtr]::Zero -or
          ([EasyedaUiController]::GetWindowLong($windowHandle,-20) -band 0x80) -ne 0 -or
          -not [EasyedaUiController]::IsWindowEnabled($windowHandle) -or
          $window.Current.ClassName -cne 'Chrome_WidgetWin_1' -or
          $title.Trim().Length -eq 0 -or $title.Length -gt 1024 -or
          $rect.Width -lt 320 -or $rect.Height -lt 200 -or
          $rect.Width -gt 16384 -or $rect.Height -gt 16384) { throw 'normal-close-not-root-application-window' }
      Assert-Root
      if ((Window-Pid $windowHandle) -ne $request.rootPid -or $window.Current.Name -cne $title -or
          -not [EasyedaUiController]::IsWindowVisible($windowHandle)) { throw 'normal-close-window-changed' }
      $dispatched = $true
      $result = @{normalCloseRequested=[EasyedaUiController]::PostMessage($windowHandle,0x0010,[IntPtr]::Zero,[IntPtr]::Zero);terminated=$false;promptChoiceMade=$false}
    } elseif ($action -eq 'capture') {
      if ($rect.Width -le 0 -or $rect.Height -le 0 -or $rect.Width -gt 16384 -or $rect.Height -gt 16384 -or $rect.Width*$rect.Height -gt 16777216) { throw 'capture-dimensions' }
      $bitmap = New-Object System.Drawing.Bitmap([int]$rect.Width,[int]$rect.Height)
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      $stream = New-Object System.IO.MemoryStream
      try {
        $graphics.CopyFromScreen([int]$rect.X,[int]$rect.Y,0,0,$bitmap.Size)
        $bitmap.Save($stream,[System.Drawing.Imaging.ImageFormat]::Png)
        if ($stream.Length -gt 16777216) { throw 'capture-byte-bound' }
        $result = @{pngBase64=[Convert]::ToBase64String($stream.ToArray());bounds=@($rect.X,$rect.Y,$rect.Width,$rect.Height)}
      } finally { $stream.Dispose(); $graphics.Dispose(); $bitmap.Dispose() }
    } elseif ($windowPid -eq $request.rootPid -and $action -notin @('focused','rightclick')) {
      # Reuse the packaged, fixed helper for the ordinary application and same-
      # process dialogs. Right-click uses the guarded pointer branch below;
      # the legacy helper does not admit it. All data stays in parameters.
      $arguments = @{Action=$action;TargetPid=[int]$request.rootPid;TargetHandle=[long]$request.windowHandle;ProcessStartTicks=[long]$request.rootStartTicks;ExpectedExecutable=[string]$request.executable}
      foreach ($pair in @(@('name','Name'),@('automationId','AutomationId'),@('text','Text'),@('x','X'),@('y','Y'),@('controlHandle','ControlHandle'))) {
        if ($request.PSObject.Properties.Name -contains $pair[0]) { $arguments[$pair[1]] = $request.($pair[0]) }
      }
      $dispatched = $writes
      $output = & $legacy @arguments
      $result = ($output -join "`n") | ConvertFrom-Json
    } elseif ($action -eq 'focused') {
      $focused = [System.Windows.Automation.AutomationElement]::FocusedElement
      if (-not $focused -or -not (Owned-Window ([EasyedaUiController]::GetAncestor([IntPtr]$focused.Current.NativeWindowHandle,2))) -and $focused.Current.ProcessId -ne $request.rootPid) { throw 'focused-control-not-owned' }
      $result = @{foreground=[EasyedaUiController]::GetForegroundWindow().ToInt64().ToString([Globalization.CultureInfo]::InvariantCulture);name=$focused.Current.Name;id=$focused.Current.AutomationId;type=$focused.Current.ControlType.ProgrammaticName;pid=$focused.Current.ProcessId;handle=$focused.Current.NativeWindowHandle.ToString([Globalization.CultureInfo]::InvariantCulture)}
    } elseif ($action -eq 'inspect') {
      $scope = $window
      if ($request.automationId) {
        $matches = $window.FindAll([System.Windows.Automation.TreeScope]::Descendants,(New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::AutomationIdProperty,[string]$request.automationId)))
        if ($matches.Count -ne 1) { throw 'scope-not-unique' }
        $scope = $matches[0]
      }
      $items = $scope.FindAll([System.Windows.Automation.TreeScope]::Descendants,[System.Windows.Automation.Condition]::TrueCondition)
      $rows = @()
      for ($i=0;$i -lt $items.Count -and $rows.Count -lt 180;$i++) {
        $entry = $items[$i].Current
        if ($entry.IsOffscreen -or (-not $entry.Name -and -not $entry.AutomationId)) { continue }
        if ($request.name -and $entry.Name.IndexOf([string]$request.name,[StringComparison]::OrdinalIgnoreCase) -lt 0 -and $entry.AutomationId.IndexOf([string]$request.name,[StringComparison]::OrdinalIgnoreCase) -lt 0) { continue }
        $bounds = $entry.BoundingRectangle
        $rows += @{name=$entry.Name;id=$entry.AutomationId;type=$entry.ControlType.ProgrammaticName;enabled=$entry.IsEnabled;pid=$entry.ProcessId;handle=$entry.NativeWindowHandle.ToString([Globalization.CultureInfo]::InvariantCulture);x=$bounds.X;y=$bounds.Y;w=$bounds.Width;h=$bounds.Height;patterns=@($items[$i].GetSupportedPatterns()|ForEach-Object {$_.ProgrammaticName})}
      }
      $result = @{title=$window.Current.Name;handle=[string]$request.windowHandle;count=$items.Count;bounds=@($rect.X,$rect.Y,$rect.Width,$rect.Height);controls=$rows}
    } elseif ($action -eq 'focus') {
      $dispatched = $true
      if ([EasyedaUiController]::IsIconic($windowHandle)) { [void][EasyedaUiController]::ShowWindowAsync($windowHandle,9) }
      $result = @{focused=[EasyedaUiController]::SetForegroundWindow($windowHandle)}
    } elseif ($action -in @('invoke','setvalue')) {
      $conditions = @()
      if ($request.name) { $conditions += New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty,[string]$request.name) }
      if ($request.automationId) { $conditions += New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::AutomationIdProperty,[string]$request.automationId) }
      if ($conditions.Count -eq 0) { throw 'selector-missing' }
      if ($action -eq 'setvalue') { $conditions += New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::IsValuePatternAvailableProperty,$true) }
      $condition = $conditions[0]
      if ($conditions.Count -gt 1) { $condition = New-Object System.Windows.Automation.AndCondition($conditions) }
      $matches = $window.FindAll([System.Windows.Automation.TreeScope]::Descendants,$condition)
      if ($matches.Count -ne 1 -or -not $matches[0].Current.IsEnabled -or $matches[0].Current.IsOffscreen) { throw 'control-not-unique-enabled-visible' }
      $dispatched = $true
      if ($action -eq 'invoke') { $matches[0].GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern).Invoke() }
      else { $matches[0].GetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern).SetValue([string]$request.text) }
      $result = @{action=$action;name=[string]$request.name;id=[string]$request.automationId}
    } elseif ($action -in @('click','doubleclick','rightclick')) {
      if ($request.x -lt $rect.X -or $request.x -ge $rect.Right -or $request.y -lt $rect.Y -or $request.y -ge $rect.Bottom) { throw 'point-outside-owned-window' }
      $dispatched = $true
      [void][EasyedaUiController]::SetCursorPos([int]$request.x,[int]$request.y)
      $count = 1
      if ($action -eq 'doubleclick') { $count = 2 }
      $down = 2
      $up = 4
      if ($action -eq 'rightclick') { $down = 8; $up = 16 }
      for ($i=0;$i -lt $count;$i++) { [EasyedaUiController]::mouse_event($down,0,0,0,[UIntPtr]::Zero); [EasyedaUiController]::mouse_event($up,0,0,0,[UIntPtr]::Zero) }
      $result = @{clicked=@($request.x,$request.y)}
    } elseif ($action -eq 'keys') {
      $dispatched = $true
      [System.Windows.Forms.SendKeys]::SendWait([string]$request.text)
      $result = @{sentKeys=$true}
    } else { throw 'foreign-process-filename-use-setvalue' }
  }
  if ($action -ne 'normal-close') { Assert-Root }
  @{schema=$schema;binding=$binding;action=$action;result=$result} | ConvertTo-Json -Depth 12 -Compress
} catch {
  $code = 'native-ui-refused'
  if ($dispatched) { $code = 'native-ui-action-failed' }
  @{schema=$schema;error=$code;dispatched=$dispatched} | ConvertTo-Json -Compress
}
