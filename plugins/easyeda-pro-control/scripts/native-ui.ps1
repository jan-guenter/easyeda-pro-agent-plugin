param(
  [ValidateSet('inspect','invoke','focus','focused','capture','click','doubleclick','hover','keys','setvalue','filename','enableexternal','close')][string]$Action = 'inspect',
  [Parameter(Mandatory=$true)][int]$TargetPid,
  [Parameter(Mandatory=$true)][long]$TargetHandle,
  [Parameter(Mandatory=$true)][long]$ProcessStartTicks,
  [Parameter(Mandatory=$true)][string]$ExpectedExecutable,
  [long]$ControlHandle = 0,
  [string]$Name = '',
  [string]$AutomationId = '',
  [string]$Text = '',
  [int]$X = 0,
  [int]$Y = 0,
  [string]$OutputPath = ''
)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class EasyedaNativeUi {
  [StructLayout(LayoutKind.Sequential)] public struct Point { public int X, Y; }
  [StructLayout(LayoutKind.Sequential)] public struct HoverRect { public int Left, Top, Right, Bottom; }
  [StructLayout(LayoutKind.Sequential)] public struct GuiThreadInfo {
    public uint Size, Flags;
    public IntPtr Active, Focus, Capture, MenuOwner, MoveSize, Caret;
    public HoverRect CaretRect;
  }
  [DllImport("user32.dll")] public static extern IntPtr WindowFromPoint(Point point);
  [DllImport("user32.dll")] public static extern bool GetGUIThreadInfo(uint thread, ref GuiThreadInfo info);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hwnd);
  [DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr hwnd, int command);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr hwnd);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hwnd, out uint processId);
  [DllImport("user32.dll")] public static extern IntPtr GetWindow(IntPtr hwnd, uint command);
  [DllImport("user32.dll")] public static extern IntPtr GetAncestor(IntPtr hwnd, uint flags);
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetClassName(IntPtr hwnd, System.Text.StringBuilder value, int count);
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr hwnd, System.Text.StringBuilder value, int count);
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern IntPtr SendMessage(IntPtr hwnd, uint message, IntPtr wparam, string value);
  [DllImport("user32.dll", EntryPoint="SendMessageW", CharSet=CharSet.Unicode)] public static extern IntPtr ReadEditText(IntPtr hwnd, uint message, IntPtr wparam, System.Text.StringBuilder value);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern bool GetCursorPos(out Point point);
  [DllImport("user32.dll")] public static extern short GetAsyncKeyState(int key);
  [DllImport("user32.dll")] public static extern void mouse_event(uint flags, uint x, uint y, uint data, UIntPtr extra);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
}
'@
function Move-HoverPointer([IntPtr]$handle, [double[]]$bounds, [int]$x, [int]$y, [uint32]$expectedWindowPid, [uint32]$rootPid) {
  # Keep this direct-helper leaf identical to the controller's pointer-only
  # implementation except for its native class name. No button input is sent.
  if ($bounds.Count -ne 4 -or $bounds[2] -le 0 -or $bounds[3] -le 0 -or $bounds[2] -gt 16384 -or $bounds[3] -gt 16384) { throw 'hover-bounds' }
  foreach ($value in $bounds) { if ([double]::IsNaN($value) -or [double]::IsInfinity($value)) { throw 'hover-bounds' } }
  if ($x -lt -32768 -or $x -gt 32767 -or $y -lt -32768 -or $y -gt 32767 -or $x -lt $bounds[0] -or $x -ge $bounds[0]+$bounds[2] -or $y -lt $bounds[1] -or $y -ge $bounds[1]+$bounds[3]) { throw 'hover-outside-window' }
  if ([EasyedaNativeUi]::IsIconic($handle) -or [EasyedaNativeUi]::GetForegroundWindow() -ne $handle) { throw 'hover-target-not-foreground' }
  foreach ($key in @(1,2,4,5,6)) { if ([EasyedaNativeUi]::GetAsyncKeyState($key) -lt 0) { throw 'hover-button-held' } }
  # Window bounds and foreground alone do not exclude a non-activating overlay.
  # These passive samples do not lock out concurrent input or window changes.
  $requestedPoint = New-Object EasyedaNativeUi+Point
  $requestedPoint.X = $x; $requestedPoint.Y = $y
  $hit = [EasyedaNativeUi]::WindowFromPoint($requestedPoint)
  if ($hit -eq [IntPtr]::Zero -or [EasyedaNativeUi]::GetAncestor($hit,2) -ne $handle) { throw 'hover-point-not-owned' }
  $targetOwner = [uint32]0; $hitOwner = [uint32]0
  $targetThread = [EasyedaNativeUi]::GetWindowThreadProcessId($handle,[ref]$targetOwner)
  $hitThread = [EasyedaNativeUi]::GetWindowThreadProcessId($hit,[ref]$hitOwner)
  if ($expectedWindowPid -eq 0 -or $rootPid -eq 0 -or $targetThread -eq 0 -or $hitThread -eq 0 -or $targetOwner -ne $expectedWindowPid -or $hitOwner -ne $targetOwner) { throw 'hover-point-owner-unverified' }
  foreach ($thread in @($targetThread,$hitThread)) {
    $gui = New-Object EasyedaNativeUi+GuiThreadInfo
    $gui.Size = [Runtime.InteropServices.Marshal]::SizeOf($gui)
    if (-not [EasyedaNativeUi]::GetGUIThreadInfo($thread,[ref]$gui) -or $gui.Capture -ne [IntPtr]::Zero -or ($thread -eq $targetThread -and $gui.Active -ne $handle)) { throw 'hover-capture-state-unverified' }
  }
  if ([EasyedaNativeUi]::GetForegroundWindow() -ne $handle -or [EasyedaNativeUi]::WindowFromPoint($requestedPoint) -ne $hit) { throw 'hover-recipient-changed' }
  $finalTargetOwner = [uint32]0; $finalHitOwner = [uint32]0
  if ([EasyedaNativeUi]::GetAncestor($hit,2) -ne $handle -or
      [EasyedaNativeUi]::GetWindowThreadProcessId($handle,[ref]$finalTargetOwner) -ne $targetThread -or
      [EasyedaNativeUi]::GetWindowThreadProcessId($hit,[ref]$finalHitOwner) -ne $hitThread -or
      $finalTargetOwner -ne $expectedWindowPid -or $finalHitOwner -ne $expectedWindowPid) { throw 'hover-recipient-owner-changed' }
  # Owned dialogs may belong to another process. Retain their exact admitted
  # PID and require their bounded current owner chain to reach this root PID.
  $ownerHandle = $handle; $seenOwners = @{}; $owned = $false
  for ($depth = 0; $depth -lt 8 -and $ownerHandle -ne [IntPtr]::Zero; $depth++) {
    $ownerKey = $ownerHandle.ToInt64().ToString([Globalization.CultureInfo]::InvariantCulture)
    if ($seenOwners.ContainsKey($ownerKey)) { break }; $seenOwners[$ownerKey] = $true
    $ownerPid = [uint32]0
    if ([EasyedaNativeUi]::GetWindowThreadProcessId($ownerHandle,[ref]$ownerPid) -eq 0 -or $ownerPid -eq 0) { break }
    if ($depth -eq 0 -and $ownerPid -ne $expectedWindowPid) { break }
    if ($ownerPid -eq $rootPid) { $owned = $true; break }
    $ownerHandle = [EasyedaNativeUi]::GetWindow($ownerHandle,4)
  }
  if (-not $owned) { throw 'hover-owner-chain-changed' }
  $script:dispatched = $true
  if (-not [EasyedaNativeUi]::SetCursorPos($x,$y)) { throw 'hover-move-failed' }
  $point = New-Object EasyedaNativeUi+Point
  if (-not [EasyedaNativeUi]::GetCursorPos([ref]$point) -or $point.X -ne $x -or $point.Y -ne $y) { throw 'hover-position-unverified' }
  if ([EasyedaNativeUi]::GetForegroundWindow() -ne $handle) { throw 'hover-foreground-changed' }
  return @{pointerMovedTo=@($x,$y);buttonInputSent=$false;hoverEffectProven=$false}
}
[void][EasyedaNativeUi]::SetProcessDPIAware()
$target = Get-Process -Id $TargetPid
if ($target.ProcessName -ne 'easyeda-pro' -or $target.Path -cne $ExpectedExecutable -or $target.StartTime.ToUniversalTime().Ticks -ne $ProcessStartTicks) { throw 'Exact EasyEDA executable/process generation not available.' }
$windowHandle=[IntPtr]$TargetHandle
$windowPid=[uint32]0
[void][EasyedaNativeUi]::GetWindowThreadProcessId($windowHandle,[ref]$windowPid)
if ($windowPid -ne $TargetPid) {throw 'Exact window no longer belongs to EasyEDA.'}
$window = [System.Windows.Automation.AutomationElement]::FromHandle($windowHandle)
$bounds = $window.Current.BoundingRectangle
function Test-OwnedWindow([IntPtr]$handle) {
  for ($j=0;$j -lt 8 -and $handle -ne [IntPtr]::Zero;$j++) {
    if ($handle -eq $windowHandle) {return $true}
    $handle=[EasyedaNativeUi]::GetWindow($handle,4)
  }
  return $false
}
if ($Action -eq 'filename') {
  $edit=[IntPtr]$ControlHandle
  $element=[System.Windows.Automation.AutomationElement]::FromHandle($edit)
  $class=New-Object System.Text.StringBuilder 256
  [void][EasyedaNativeUi]::GetClassName($edit,$class,256)
  $isFileNameEdit=$element.Current.AutomationId -eq '1148'
  if ($element.Current.AutomationId -eq '1001') {
    $parent=[System.Windows.Automation.TreeWalker]::ControlViewWalker.GetParent($element)
    $isFileNameEdit=$parent -and $parent.Current.AutomationId -eq 'FileNameControlHost'
  }
  if ($class.ToString() -ne 'Edit' -or -not $isFileNameEdit -or -not $element.Current.IsEnabled -or -not (Test-OwnedWindow ([EasyedaNativeUi]::GetAncestor($edit,2)))) {throw 'Exact owned file-name edit is unavailable.'}
  [void][EasyedaNativeUi]::SendMessage($edit,12,[IntPtr]::Zero,$Text)
  $value=New-Object System.Text.StringBuilder 2048
  [void][EasyedaNativeUi]::ReadEditText($edit,13,[IntPtr]2048,$value)
  if ($value.ToString() -cne $Text) {throw 'Native file-name value does not match requested path.'}
  @{filenameVerified=$true;path=$value.ToString()} | ConvertTo-Json -Compress
  exit
}
if ($Action -eq 'focused') {
  $fg=[EasyedaNativeUi]::GetForegroundWindow()
  $fgPid=[uint32]0
  [void][EasyedaNativeUi]::GetWindowThreadProcessId($fg,[ref]$fgPid)
  $element=[System.Windows.Automation.AutomationElement]::FocusedElement
  $c=$element.Current
  @{foreground=$fg.ToInt64();foregroundPid=$fgPid;owner=[EasyedaNativeUi]::GetWindow($fg,4).ToInt64();name=$c.Name;id=$c.AutomationId;type=$c.ControlType.ProgrammaticName;pid=$c.ProcessId;handle=$c.NativeWindowHandle;patterns=@($element.GetSupportedPatterns() | ForEach-Object {$_.ProgrammaticName})} | ConvertTo-Json -Depth 4 -Compress
  exit
}
if ($Action -eq 'enableexternal') {
  $scope=$window.FindFirst([System.Windows.Automation.TreeScope]::Descendants,(New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::AutomationIdProperty,'extapiExtensionsManagerNewDlg')))
  if (-not $scope) {throw 'Extensions Manager is absent.'}
  $identity=$scope.FindAll([System.Windows.Automation.TreeScope]::Descendants,(New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty,'7e06d286b1ac846ef7eab9c7f2a9ee40')))
  if ($identity.Count -ne 1) {throw 'Exact selected private extension UUID is absent.'}
  $condition=New-Object System.Windows.Automation.AndCondition((New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty,'Allow interactive with external')),(New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::ControlTypeProperty,[System.Windows.Automation.ControlType]::CheckBox)))
  $matches=$scope.FindAll([System.Windows.Automation.TreeScope]::Descendants,$condition)
  if ($matches.Count -ne 1 -or -not $matches[0].Current.IsEnabled -or $matches[0].Current.IsOffscreen) {throw 'Exact permission checkbox is unavailable.'}
  $pattern=$matches[0].GetCurrentPattern([System.Windows.Automation.TogglePattern]::Pattern)
  $before=$pattern.Current.ToggleState.ToString()
  if ($before -eq 'Off') {$pattern.Toggle()}
  elseif ($before -ne 'On') {throw 'Unexpected permission checkbox state.'}
  @{permission='external-interaction';before=$before;after=$pattern.Current.ToggleState.ToString()} | ConvertTo-Json -Compress
  exit
}
if ($Action -eq 'inspect') {
  $scope=$window
  if ($AutomationId) {
    $scope=$window.FindFirst([System.Windows.Automation.TreeScope]::Descendants,(New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::AutomationIdProperty,$AutomationId)))
    if (-not $scope) {throw 'Observed UI scope is absent.'}
  }
  $items = $scope.FindAll([System.Windows.Automation.TreeScope]::Descendants, [System.Windows.Automation.Condition]::TrueCondition)
  $results = @()
  for ($i=0; $i -lt $items.Count -and $results.Count -lt 180; $i++) {
    $c=$items[$i].Current
    if (($c.Name -or $c.AutomationId) -and -not $c.IsOffscreen -and (-not $Name -or $c.Name -match $Name -or $c.AutomationId -match $Name)) {
      $r=$c.BoundingRectangle
      if ([double]::IsInfinity($r.X) -or [double]::IsInfinity($r.Y) -or [double]::IsInfinity($r.Width) -or [double]::IsInfinity($r.Height) -or [double]::IsNaN($r.X) -or [double]::IsNaN($r.Y) -or [double]::IsNaN($r.Width) -or [double]::IsNaN($r.Height)) {continue}
      $toggleState=$null
      if ($c.ControlType -eq [System.Windows.Automation.ControlType]::CheckBox) {$toggleState=$items[$i].GetCurrentPattern([System.Windows.Automation.TogglePattern]::Pattern).Current.ToggleState.ToString()}
      $results += [pscustomobject]@{name=$c.Name;id=$c.AutomationId;type=$c.ControlType.ProgrammaticName;enabled=$c.IsEnabled;pid=$c.ProcessId;handle=$c.NativeWindowHandle;x=$r.X;y=$r.Y;w=$r.Width;h=$r.Height;toggleState=$toggleState;patterns=@($items[$i].GetSupportedPatterns() | ForEach-Object { $_.ProgrammaticName })}
    }
  }
  [pscustomobject]@{title=$window.Current.Name;handle=$TargetHandle;count=$items.Count;bounds=@($bounds.X,$bounds.Y,$bounds.Width,$bounds.Height);controls=$results} | ConvertTo-Json -Depth 6 -Compress
  exit
}
if ($Action -eq 'focus') {
  if ([EasyedaNativeUi]::IsIconic($windowHandle)) {[void][EasyedaNativeUi]::ShowWindowAsync($windowHandle,9)}
  $ok=[EasyedaNativeUi]::SetForegroundWindow($windowHandle)
  [pscustomobject]@{focused=$ok;foreground=[EasyedaNativeUi]::GetForegroundWindow().ToInt64()} | ConvertTo-Json -Compress
  exit
}
if ($Action -eq 'invoke' -or $Action -eq 'setvalue') {
  if (-not $Name -and -not $AutomationId) { throw 'An exact observed control name or ID is required.' }
  $conditions = @()
  if ($Name) {$conditions += New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty,$Name)}
  if ($AutomationId) {$conditions += New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::AutomationIdProperty,$AutomationId)}
  if ($Action -eq 'setvalue') {$conditions += New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::IsValuePatternAvailableProperty,$true)}
  $condition=$conditions[0]
  if ($conditions.Count -gt 1) {$condition=New-Object System.Windows.Automation.AndCondition($conditions)}
  $matches=$window.FindAll([System.Windows.Automation.TreeScope]::Descendants,$condition)
  if ($matches.Count -ne 1 -or -not $matches[0].Current.IsEnabled -or $matches[0].Current.IsOffscreen) { throw 'Control is absent, ambiguous, disabled or offscreen.' }
  if ($Action -eq 'invoke') { $matches[0].GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern).Invoke() }
  else { $matches[0].GetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern).SetValue($Text) }
  @{action=$Action;name=$Name;id=$AutomationId} | ConvertTo-Json -Compress
  exit
}
$foregroundPid=[uint32]0
[void][EasyedaNativeUi]::GetWindowThreadProcessId([EasyedaNativeUi]::GetForegroundWindow(),[ref]$foregroundPid)
if ($foregroundPid -ne $TargetPid -and -not (Test-OwnedWindow ([EasyedaNativeUi]::GetForegroundWindow()))) { throw 'Neither EasyEDA nor its owned native dialog is foreground.' }
if ($Action -eq 'capture') {
  if (-not [System.IO.Path]::IsPathRooted($OutputPath) -or (Test-Path -LiteralPath $OutputPath)) {throw 'Capture requires a fresh absolute output path.'}
  $bitmap=New-Object System.Drawing.Bitmap([int]$bounds.Width,[int]$bounds.Height)
  $graphics=[System.Drawing.Graphics]::FromImage($bitmap)
  try { $graphics.CopyFromScreen([int]$bounds.X,[int]$bounds.Y,0,0,$bitmap.Size);$bitmap.Save($OutputPath,[System.Drawing.Imaging.ImageFormat]::Png) }
  finally {$graphics.Dispose();$bitmap.Dispose()}
  @{path=$OutputPath;bounds=@($bounds.X,$bounds.Y,$bounds.Width,$bounds.Height)} | ConvertTo-Json -Compress
} elseif ($Action -eq 'hover') {
  $target.Refresh()
  if ($target.HasExited -or $target.ProcessName -cne 'easyeda-pro' -or $target.Path -cne $ExpectedExecutable -or $target.StartTime.ToUniversalTime().Ticks -ne $ProcessStartTicks) { throw 'Hover process generation changed.' }
  [void][EasyedaNativeUi]::GetWindowThreadProcessId($windowHandle,[ref]$windowPid)
  if ($windowPid -ne $TargetPid) { throw 'Hover window owner changed.' }
  $bounds = $window.Current.BoundingRectangle
  $hover = Move-HoverPointer $windowHandle @($bounds.X,$bounds.Y,$bounds.Width,$bounds.Height) $X $Y ([uint32]$TargetPid) ([uint32]$TargetPid)
  $target.Refresh()
  if ($target.HasExited -or $target.Path -cne $ExpectedExecutable -or $target.StartTime.ToUniversalTime().Ticks -ne $ProcessStartTicks) { throw 'Hover process generation changed after input.' }
  $hover | ConvertTo-Json -Compress
} elseif ($Action -eq 'click' -or $Action -eq 'doubleclick') {
  if ($X -lt $bounds.X -or $X -ge $bounds.Right -or $Y -lt $bounds.Y -or $Y -ge $bounds.Bottom) {throw 'Click is outside the exact EasyEDA window.'}
  [void][EasyedaNativeUi]::SetCursorPos($X,$Y)
  [EasyedaNativeUi]::mouse_event(2,0,0,0,[UIntPtr]::Zero)
  [EasyedaNativeUi]::mouse_event(4,0,0,0,[UIntPtr]::Zero)
  if ($Action -eq 'doubleclick') {
    [EasyedaNativeUi]::mouse_event(2,0,0,0,[UIntPtr]::Zero)
    [EasyedaNativeUi]::mouse_event(4,0,0,0,[UIntPtr]::Zero)
  }
  @{clicked=@($X,$Y)} | ConvertTo-Json -Compress
} elseif ($Action -eq 'keys') {
  [System.Windows.Forms.SendKeys]::SendWait($Text)
  @{sentKeys=$true} | ConvertTo-Json -Compress
} elseif ($Action -eq 'close') {
  $closeTargetProcess = Get-Process -Id $TargetPid -ErrorAction Stop
  if ($closeTargetProcess.MainWindowHandle.ToInt64() -ne $TargetHandle) { throw 'Normal-close target window changed.' }
  @{normalCloseRequested=$closeTargetProcess.CloseMainWindow();terminated=$false} | ConvertTo-Json -Compress
}
