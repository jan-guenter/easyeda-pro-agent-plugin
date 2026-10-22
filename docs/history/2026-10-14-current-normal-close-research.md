# Retained ordinary-launch normal close

Research date: 2026-10-14. This proposal was not part of release190000.
The [201000 implementation report](2026-10-14-current-normal-close-release.md)
tracks its subsequent implementation and separate validation. The research read repository files, official
documentation and inert installed application bundles. It did not inspect a
live process, window, profile or design, and made no close request.

The useful next addition is a one-shot normal-close action on the existing
ordinary-launch owner. It can use the original Windows helper and retained Job
instead of depending on ComputerUse window discovery. It must not expose a
general window-message API, force termination or select a prompt response.

## Why an SDK close is not the replacement

The official [SYS_Window class](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_window.html)
lists limited navigation and event methods, with no application-close method.
[SYS_IFrame.closeIFrame](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_iframe.closeiframe.html)
closes extension iframe dialogs, not the desktop application.
[DMT_EditorControl.closeDocument](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_editorcontrol.closedocument.html)
closes a document tab and explicitly warns that unsaved changes are lost. It
is unsuitable for requesting normal application closure while leaving any
Save/Discard choice to the user.

The installed 0.3.50.ab46409c declaration agrees: `closeDocument` is at line568
and `closeIFrame` at41406. The corresponding API wrappers are at UTF-16 offsets
424546 and1835078. The current UI implementation at17219560 publishes
`closeAndDontSaveSheet` for `closeDocument`. This is a concrete reason not to
substitute the document method merely because it returns a boolean.

The current official [CLI guide](https://prodocs.easyeda.com/en/api/guide/cli.html)
describes graceful `stop` and session-close commands for a 4.1.x example. The
installed reviewed desktop package is 3.2.206.715d940d. Those newer commands are
not admitted on this package and cannot inherit the retained root/Job identity
from this plugin. A future version upgrade needs separate review.

## Existing reusable implementation

Paths in this table are relative to `plugins/easyeda-pro-control/`. Line numbers
refer to the source inspected during release190000 preparation.

| Source | Existing behavior and remaining gap |
| --- | --- |
| `server/src/ordinary-launch.ts:28`, `:65`, `:278`, `:362` | Launch, inspect, presence and termination observations exist. Runtime, exact launch receipt and original Job remain in memory. No window observation or close action is exposed. |
| `server/src/windows-runtime.ts:383` | `normalClose` delegates to its retained supervisor/current launch. `observeLaunchTermination` separately checks the retained generation. |
| `server/src/windows-authority.ts:979` | Generic `requestNormalClose` checks exact supervised launch and closed-session reservations, then sends fixed `normal-close`. It adds the Job to `normalCloseJobs`, but does not reject an already-added Job on this path. It is not a durable one-shot ordinary-close coordinator. |
| `scripts/windows-authority.ps1:108`, `:493` | The original helper checks retained root, start ticks, Job membership and recipient HWND PID, then posts WM_CLOSE. It currently does not reject tooltips, owned dialogs or a disabled/non-root application window. |
| `scripts/windows-authority.ps1:423` | `observe-launch-termination` samples the original root's exited state and empty retained Job twice. It does not adopt by PID or dispatch another close. |
| `scripts/native-ui-controller.ps1:303` | Existing stronger normal-close checks require an enabled, visible, ownerless root `Chrome_WidgetWin_1` window, non-tool style, finite application-sized bounds and stable title/PID. This is the guard model to reuse. |
| `server/src/closed-symbol-window.ts:8`, `:17` | Selects exactly one root-owned application candidate from bounded observed windows; treats `Process.MainWindowHandle` as advisory. The native close must still recheck it immediately before dispatch. |
| `server/src/closed-symbol-close.ts:51` | Existing closed-symbol workflow persists a one-shot intent, records close acknowledgment separately, then proves retained termination. Its design-specific captures are not ordinary-launch authority. |

The Windows helper transport uses a fixed PowerShell executable, pinned script
and stdio protocol at `windows-authority.ts:1018`. It does not invoke ComputerUse
or receive its `sandboxCwd` argument. This source separation supports removing
that dependency for normal close. It does not prove that every Windows/RDP
environment can enumerate or message the target successfully.

The current ordinary coordinator calls `assertAllowed` before non-inspect
actions. Its `index.ts` wiring includes the bridge quarantine check. Do not
silently relax that gate to expose close. A clean retained ordinary launch can
be the first scope. Closing an exact quarantined disposable-open owner needs a
separately reviewed, operation-isolated native recovery allowance with no live
bridge call, navigation, Save or journal-resolution authority. Unreadable or
conflicting ownership/journals must remain a refusal.

## Smallest proposed change

Add two bounded ordinary-owner actions, leaving launch and existing termination
semantics unchanged:

1. A read-only window observation bound to the exact successful ordinary launch
   receipt and original helper/Job/root generation. Enumerate only that root's
   relevant windows, with bounded handle/class/state/bounds metadata. Return an
   explicit unavailable or ambiguous result when no unique application window
   qualifies. Do not use a title substring, process name or guessed HWND as
   identity. Do not expose unrelated desktop window text.
2. A confirmed normal-close request using the original operation ID, inspected
   launch digest and exact observed HWND. Revalidate the installation, retained
   launch, owner and window, then consume an exclusive durable close intent
   before dispatch. The native helper must repeat the strong application-window
   checks immediately before posting the fixed WM_CLOSE message.

Extend the original retained helper with the narrow window observer and stronger
normal-close checks, reusing the already reviewed native-controller criteria.
This avoids a new executor or a bridge connection. A smaller facade-only call
to `WindowsControlRuntime.normalClose` would leave the weak HWND acceptance and
repeat-close gaps above; do not expose it unchanged. Updating the helper also
requires deliberate updates to its reviewed capability pin and existing tests,
not a compatibility override.

Keep the close intent keyed to the original launch, not a new caller-supplied
attempt ID. No second intent may request another close after dispatch, missing
reply, timeout or uncertain publication. Persist a settled acknowledgment when
available; inspection and termination observation remain read-only. A rejected
pre-dispatch window observation consumes no close, but an uncertain dispatch
must stay consumed. A facade restart cannot recover lost retained handles by
reading the serialized receipt or adopting a matching PID.

No focus, pointer, keyboard or Save/Discard button is needed for WM_CLOSE.
Do not require foreground solely to send this fixed message. Conversely, do
not change session routing, UAC, registry or process integrity when Windows
refuses it. The window guards must still reject a modal/disabled root or an
ambiguous recipient; do not close its dialog as a fallback.

## Acknowledgment, prompts and termination are different

[WM_CLOSE](https://learn.microsoft.com/en-us/windows/win32/winmsg/wm-close)
requests closure and permits the receiving application to ask for confirmation.
[PostMessageW](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-postmessagew)
returns after queuing, before the target processes the message, and is subject
to Windows integrity-level restrictions. Thus a successful post is not exit.
[Process.CloseMainWindow](https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.process.closemainwindow)
also sends a close request and can fail for a disabled main window. Its inferred
main-window handle is less suitable than an explicitly observed application HWND.

| Observation | Valid claim |
| --- | --- |
| Fixed WM_CLOSE acknowledged | Close requested once; no prompt choice dispatched by the plugin. |
| Root/Job still alive | Termination not proved. A prompt, delayed shutdown or other state may explain it; do not guess which or resend close. |
| Owned prompt independently inspected | Report its actual choices and stop before choosing one. Ordinary close itself never authorizes Save/Discard. |
| Original root exited and retained Job empty twice | Original retained launch terminated. This does not prove saved design contents or absence of outside-broker work. |

Keep the facade alive until the existing termination observer records the
original launch's receipt. If the first read still reports running, bounded
read-only observations are allowed; repeating WM_CLOSE is not. Prompt inspection
may still need a visible RDP desktop. An unavailable screenshot is not permission
to press Enter, Escape, Alt+F4 or any default dialog button.

The current UI `beforeunload` handler at12797374 calls `saveContainerData`
before checking unsaved tabs/upload counts, and can display a Confirm Close
dialog. The desktop app's close/closed handlers at1362712/1362742 update window
tracking and run cleanup; its window-all-closed handler at2622455 also performs
cleanup before exit. This review does not prove the complete persistence effects
of those paths. Promise only that the adapter does not explicitly invoke Save
or select a prompt, not that normal closure is free of application writes.

## Provenance and verification boundary

Installed sources were rehashed as inert text. Offsets above are JavaScript
UTF-16 positions, not byte offsets.

| Installed source | Bytes | SHA-256 |
| --- | ---: | --- |
| `resources/app/app.js` | 2657192 | `52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c` |
| `assets/pro-api/0.3.50.ab46409c/api.js` | 1964920 | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |
| `assets/pro-api/0.3.50.ab46409c/api-types.d.ts` | 1733380 | `d5fe990034c55001302ea6c3f704c2d4b88cdf23253cc5293b3bad62a32b9def` |
| `assets/pro-ui/3.2.196.26ed3d6c/js/ui.js` | 17456671 | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` |

Relevant repository hashes at inspection: ordinary-launch `7519ae2f`,
windows-runtime `8c2d4c34`, windows-authority TypeScript `a46059fd`, native UI
controller `654e6746`, closed-symbol-window `284d046f`. The retained helper's
full SHA-256 is
`811d22eca033a31b58a9963ee7d51d2a3ed8182a0d859e511a42cbae68786c65`.

A future patch should extend the existing owner/window tests for wrong or
reused HWND/root, repeated/uncertain close and retained termination separation.
One disposable normal-close/termination check after installation is sufficient
for the first scoped live claim. Prompt handling stays observation-only and
unvalidated unless separately exercised. No additional test framework, general
native UI exposure or SDK upgrade is needed to implement this backlog item.
