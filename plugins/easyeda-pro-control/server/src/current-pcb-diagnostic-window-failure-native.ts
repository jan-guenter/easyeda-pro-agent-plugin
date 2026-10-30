/** Fixed PowerShell error adapter. It reads cached scalars only, never a window,
 * process, exception message payload or fresh native resource probe. */
import { CURRENT_WINDOW_FAILURE_ACTIONS, CURRENT_WINDOW_FAILURE_DISCOVERY_CODES, CURRENT_WINDOW_FAILURE_NATIVE_CODES, CURRENT_WINDOW_FAILURE_STAGES } from "./current-pcb-diagnostic-window-failure-contract.ts";

/** Emit the fixed PowerShell failure-envelope adapter with only reviewed labels
 * and cached native diagnostics. The adapter does not rediscover windows, expose
 * private titles/paths or convert failure evidence into retry authority.
 */
export function currentWindowFailurePowerShell(): string {
  const actions = CURRENT_WINDOW_FAILURE_ACTIONS.filter(action => action !== "release").map(action => `'${action}'`).join(",");
  const codes = CURRENT_WINDOW_FAILURE_NATIVE_CODES.map(code => `'${code}'`).join(",");
  const discoveryCodes = CURRENT_WINDOW_FAILURE_DISCOVERY_CODES.map(code => `'${code}'`).join(",");
  const stages = CURRENT_WINDOW_FAILURE_STAGES.map(stage => `'${stage}'`).join(",");
  return `$windowFailure=$null
      $windowRelease=$request.action -ceq 'release' -and @('pcb-diagnostic-window-capture-release-before-exit','pcb-diagnostic-window-capture-gdi-release','pcb-diagnostic-window-capture-child-release') -ccontains $code
      if ($Visual209 -and (@(${actions}) -ccontains $request.action -or $windowRelease)) {
        try {
          $stage=$owner.WindowFaultStage;$bounds=$owner.WindowFaultBounds;$children=$owner.WindowFaultChildren;$discovery=$owner.WindowDiscovery
          $label=$code.Substring(15)
          if (@(${codes}) -cnotcontains $label) {
            $label='unclassified';$fault=$_.Exception
            for ($index=0;$index -lt 4 -and $null -ne $fault;$index++) {
              switch -CaseSensitive ($fault.GetType().Name) {
                'OutOfMemoryException' {$label='allocation-failed'}
                'OverflowException' {$label='arithmetic-overflow'}
                'EntryPointNotFoundException' {$label='native-entry-point-unavailable'}
                'NotSupportedException' {if ($stage -ceq 'encoding') {$label='encoding-capacity'}}
                'IOException' {if ($stage -ceq 'encoding') {$label='encoding-io'}}
              }
              $fault=$fault.InnerException
            }
          }
          if ($label.EndsWith('-fields')) {$stage='request';$bounds=$null}
          if ($windowRelease) {$stage='cleanup';$bounds=$null}
          if (@(${stages}) -cnotcontains $stage) {$stage='unclassified';$bounds=$null}
          if ($request.action -cne 'capture-window' -or $label -cne 'window-capture-child-ownership') {$children=$null}
          if ($request.action -ceq 'release' -or @(${discoveryCodes}) -cnotcontains $label -or @('request','owner','cleanup') -ccontains $stage) {$discovery=$null}
          $paint=if ($owner.WindowCapturePaintDispatched) {'possibly-dispatched'} else {'not-dispatched'}
          $windowFailure=@{schema='easyeda-pro-control.window-failure.v1';action=$request.action;stage=$stage;code=$label;paintPhase=$paint;nativeResourcesRetained=$owner.WindowCaptureResourcesRetained;bounds=$bounds;childOwnership=$children;windowDiscovery=$discovery;snapshotOnly=$true;executionAuthorized=$false}
        } catch {$windowFailure=$null}
      }`;
}
