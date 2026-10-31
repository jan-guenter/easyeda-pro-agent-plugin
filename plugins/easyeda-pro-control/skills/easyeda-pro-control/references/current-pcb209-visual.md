# Disposable PCB viewport control on 3.2.209

Use this workflow to fit an existing disposable PCB or move its camera to exact
mil coordinates. It offers five viewport operations through a separate native
owner. Source implementation, offline tests and native compilation exist;
installed 142600 passed one disposable zoom-to at 0,0 mil and scale ratio 1,
unchanged selection, normal root/Job exit and helper release. The whole closed
fixture stayed byte-exact. Fit-all, fit-selected and other argument domains
remain unvalidated. The two transient-overlay navigation operations have no
connected validation. Read the [case record](https://github.com/jan-guenter/easyeda-pro-agent-plugin/blob/main/docs/history/2026-10-29-supplied-design-inspection-and-viewport.md)
for the exact evidence and limits. Historical results do not admit a later
loaded host. Check the installed catalog before use.

Discover `easyeda_control_api` action `pcb209-visual` with
`query:{includeSchemas:true}`. Validate each exact inner action with
`pcb209-visual-validate` and `query:{request:<inner>}`. Execute through
`easyeda_control_pcb209_opening` with
`request:{action:"visual",request:<inner>}`. The ordinary `pcb209-opening`
grammar is separate. Its owner, any worker owner and an ordinary running app
cannot be upgraded to the visual purpose.

## Open the exact disposable target

1. `launch` uses a new `pcb209-visual-*` operation ID and all four flags true:
   `confirmValidationOnly`, `confirmDiagnosticLaunch`,
   `acceptExistingProfileEffects` and `acceptVisualStateChanges`.
2. Keep its returned `bindingSha256`. Later bound actions use the same operation
   ID and `expectedBindingSha256`. JSON copies cannot transfer native ownership.
   Keep the Codex session alive through observed exit and release.
3. Run `browser-observation`, then `inspect-frames` with its observed unattached
   page `targetId`. Use the observed top-level `frameId` in `inspect-script`
   with `family:"ui"`. Each action is consumed once.
4. `open-project` takes the exact registered disposable
   `target:{rawWindowsPath,projectUuid,documentUuid,expectedSourceSha256}`,
   `confirmDisposableProject:true` and `acceptNormalOpenEffects:true`.
   The path hash identifies the local project. The coordinator creates its
   checkpoint and verifies the existing PCB in the default branch. It requires
   an empty editor under the same source-qualified UI owner.
5. `open-pcb` uses the original binding and `acceptNormalOpenEffects:true`.
   Then `observe-pcb-opening` qualifies the original PCB frame, DOM owner,
   complete pinned source and target identity. An open acknowledgment alone
   does not satisfy this stage.

Startup and opening may restore tabs, migrate, replay caches, contact services,
change shared settings and automatically persist files. This is not profile
isolation or a promise of unchanged project bytes. The route dispatches no
explicit Save or CAD source edit. Leave unexpected Save/Discard prompts
unanswered unless their choice is separately authorized.

## Perform one viewport operation

`perform-visual` takes the original binding, `confirmVisualStateChanges:true`
and exactly one `operation`:

| Operation | Fields | Effect and scope |
| --- | --- | --- |
| `fit-all` | `kind:"fit-all"` | Native adapt-all camera operation and returned bounding box. It does not establish complete design membership. |
| `fit-board-outline` | `kind:"fit-board-outline"` | Submit the fixed native `fitBoard` topic to the retained PCB receiver. Only submission is observed; no outline membership, camera bounds or viewport change is proved. |
| `fit-selected` | `kind:"fit-selected",expectedSelection:[...]` | Fit the already selected objects. The complete ordered ID list must match before dispatch and afterward. No selection change is requested. Component attribute boxes can contribute to the fit. |
| `zoom-to` | `kind:"zoom-to",xMil,yMil,scaleRatio` | Explicit coordinates in mil and explicit positive native camera scale ratio. No omitted-coordinate defaults or percentage-zoom wrapper. |
| `navigate-coordinates` | `kind:"navigate-coordinates",xMil,yMil,acceptTransientOverlayEffects:true` | Center on a data-origin mil coordinate through the native SDK handler, without requesting a scale change. A transient crossline may appear. Returns only the native boolean acknowledgment. |
| `navigate-region` | `kind:"navigate-region",leftMil,rightMil,topMil,bottomMil,acceptTransientOverlayEffects:true` | Center on a positive-width/height data-origin mil rectangle through the native SDK handler, without requesting a scale change. A transient rectangle may appear. Returns only the native boolean acknowledgment. |

The official [coordinate contract](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_document.navigatetocoordinates.html)
uses data-origin mil coordinates. The [region contract](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_document.navigatetoregion.html)
describes centering without zoom and a temporary rectangle. This adapter uses
the captured receiver's matching installed209 handlers rather than the public
wrapper's mutable active-tab lookup.

Use `observe-selection-relations` once when the existing selected IDs or child
pads are needed. Its optional `componentIds` defaults to `[]` and admits at most
sixteen distinct Component IDs. It is a read, not a way to select objects. It
shares the original transport budget with viewport work. This visual grammar
does not expose the ordinary opening owner's other optional readers.

Coordinates are finite, exclude negative zero and have absolute value at most
1e12 mil. Navigation regions require `leftMil < rightMil` and
`bottomMil < topMil`; reversed or degenerate rectangles refuse. The narrower
contract keeps region direction explicit. Scale ratio is between 0.00001 and
1000000. Selected IDs are distinct,
well-formed UTF-16 strings of at most 256 units, with at most 256 IDs. Fit-selected
requires a nonempty list. The complete JSON operation is at most 12000 UTF-8
bytes. The selected-list and whole success/failure packet reservations are
checked before camera dispatch. Unsupported or excessive values refuse whole.

The lifecycle durably consumes its viewport intent before a possible native
call. It permits one operation for that original owner, not one of each kind.
A capacity refusal, deadline, lost acknowledgment or publication failure grants
no repeat or automatic restoration. Inspect the retained result using
`inspect` with `observation:"visual-viewport209"`. Settle only records for which
the original coordinator offers `settle-records`; settlement dispatches no new
camera operation.

A successful result binds its exact operation and target, attempted/acknowledged
flags and complete unchanged selection. Fit-all, fit-selected and zoom-to retain one
native `getBBox2` return, with raw native bounds and `boundsMil`. Native units
equal ten mil. Navigation retains only an exact native `true` acknowledgment;
its bounds fields stay null. Camera state is not independently double-sampled,
rendering completion is not observed and the result contains no screenshot. A
three-second observer prevents later camera dispatch after expiry but cannot
cancel a handler already sent.

The [public outline-fitting method](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_document.zoomtoboardoutline.html)
submits `fitBoard` in the installed UI. This native equivalent uses that exact
topic on the captured PCB message bus. The pinned subscriber collects nonempty
`Board Outline` views and `Line` views on layer11. It does not use
`getAllBoardBox`, whose separate handler can fall back to all geometry.
`fit-board-outline` keeps both bounds fields null. A normal void publish return
cannot distinguish missing outlines, a missing or cancelled subscriber, a caught
callback error, or a completed camera movement. It proves submission only.
Source and offline checks do not establish a connected result for this operation.

New visual publications use schema `easyeda-pro-control.pcb209-visual-action.v2`.
Historical journal reads also recognize both exact released v1 projections:
the original three camera operations and the later navigation-expanded shape.
The reader preserves every known field, limitation string and causal check;
extra or modified fields refuse. This compatibility validates stored evidence
without rewriting journals, restoring original handles, authorizing replay or
granting a new launch.

The navigation acknowledgment occurs after the native handler schedules an
animation frame, a 75ms timer and a 3s crossline or rectangle overlay. It may also
cancel a previous navigation overlay. `acceptTransientOverlayEffects:true`
acknowledges these visual effects; it grants no general timer or overlay API.
The result does not prove callbacks ran, timers settled, the overlay appeared
or disappeared, or the viewport arrived. Keep the original disposable owner
through observed root exit, empty Job and release. The existing explicit
`zoom-to` operation avoids these navigation handlers when no overlay is wanted.

## Choose one capture method

Choose an image method before dispatch. `capture-renderer-viewport` captures
the original application renderer's viewport; `capture-window` requests pixels
from the original Windows HWND. They share one consumed image slot, including
after a missing reply, blank image or failed postcheck. There is no automatic
fallback, second-method retry or adoption of a historical owner. The camera
operation has its own once-only reservation.

### Capture the renderer viewport

After published `observe-pcb-opening`, validate and send
`capture-renderer-viewport` with the original operation/binding,
`acceptRendererCaptureEffects:true` and `confirmLocalArtifact:true`. No HWND,
target URL, clip, dimensions, format, screenshot options or foreground request
is accepted. The fixed command uses PNG `Page.captureScreenshot` on the retained
source-qualified parent Page session, with surface capture enabled and capture
beyond the viewport disabled. It does not use an Electron main-process fallback
or this plugin's GDI bitmap acquisition. This does not prove that Chromium avoids
GPU resources or can capture a hidden/minimized application successfully.

The owner brackets capture with original parent/ancillary-frame and active-PCB
checks, reserving eleven CDP requests in the existing global allocator and
protected output/cleanup capacity. Its durable renderer intent is separate from
the window paint intent. A successful reply is published only after original
session, source and target reproof. Record inspection uses
`observation:"renderer-capture209"`; it does not dispatch a second screenshot.

The managed PNG is bounded to 256 KiB, 4,096 pixels per side and 4,194,304 pixels
total. The decoder checks the complete RGB/RGBA8 noninterlaced PNG, CRCs, standard
scanline filters and exact bounded zlib consumption. Ancillary metadata remains
opaque and byte-exact. Dimensions, hash and raw RGB-zero status come from the
decoded image, not caller or native summary fields. The result accepts no color,
alpha-display, metadata, stable-render, complete-board or saved-design claim.
The viewport can include application UI and child-frame content; it is not a
canvas-only image. Use the exact returned managed path for visual inspection.

Installed `0.3.0+codex.20261031040653` passed one fresh disposable renderer
capture: 65,084 PNG bytes, 1,492 by 712 pixels, SHA-256
`196a863515772b0bc83b23fec9e4e3e57454f5bbaa237f30cfb034d374666277`.
Independent decoding found nonzero RGB, and visual inspection accepted the
actual disposable PCB with application menus and panels. Original root exit,
empty Job and helper release were separately observed; the complete closed
fixture remained byte-exact. Read the
[connected renderer case](https://github.com/jan-guenter/easyeda-pro-agent-plugin/blob/main/docs/history/2026-10-31-renderer-proof-and-held-cache-owner.md)
for the exact scope. This validates that one installed capture, not a later
host, hidden/minimized capture, stable render, canvas-only content or complete
board membership. It establishes no general saved-design proof.

The older installed 174608 window capture returned a valid but all-RGB-zero
PNG; that consumed owner cannot use this action as a fallback. Its terminal
cleanup and the scope of the native metadata observations are retained in the
[batch record](https://github.com/jan-guenter/easyeda-pro-agent-plugin/blob/5424343bbb026334fc3b1eb0292dbc1d7eab34f7/docs/history/2026-10-31-held-cache-and-capture-validation.md).

### Capture the original window

After published `observe-pcb-opening`, use `observe-capture-readiness` with the
original operation/binding to query the unique original window and transport
headroom. Up to eight queries return HWND/bounds, dimension and pixel eligibility,
remaining CDP/stdout capacity and consumed/retained state. Each bounded query
preserves cleanup capacity, sends no paint and consumes no capture intent. It
does not recheck active PCB identity or authorize capture. The window can change
immediately afterward; actual capture repeats all original-owner, context,
geometry and capacity checks. No caller PID/HWND or resize is accepted.

Capture an already geometry-eligible window directly, including a maximized
window, when transport capacity is eligible, the original PCB source is retained
and the reader is available. Readiness remains a snapshot; capture must pass its
fresh original-owner, active-PCB and geometry checks. Direct capture requests
painting at the observed bounds. It establishes no render completion or
persistence result.

Restore and resize are optional. If a visible maximized original window needs
the fixed smaller size, first validate `restore-window-for-capture` with the same
operation/binding and `acceptWindowRestoreEffects:true`. This
separate once-only action requests the fixed nonactivating show command 4 through
[ShowWindowAsync](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-showwindowasync).
Windows may restore the previous position as well as size; accepting restore
includes that possible position change. No caller HWND, coordinates or show
command are accepted. This changes window state, not a project backup or design.

The native API reports only that its request started. Command 4 follows
[SW_SHOWNOACTIVATE](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-showwindow):
it requests the most recent size/position without activation. The adapter makes
no Z-order, geometry, rendering or persistence guarantee. It does not use
`SetWindowPlacement`, style changes, a foreground request or synchronous restore.
Minimized, hidden, ambiguous and ordinary-purpose windows remain unsupported.

If using restore, complete it before any resize/capture attempt. Its durable
intent is consumed before possible dispatch. Source/postguard failures, missing
replies and refusal do not permit retry or an inverse. Before restore, at least 30
CDP slots, 32 MiB stdout headroom and two unused readiness-query slots are
required. These reserve
transport capacity for restore, potential resize and capture; each later stage
rechecks its remaining output capacity independently. Run readiness after the
restore result is published and require `restoreStateObserved:true` on the same
original HWND with `maximized:false`. After a restore attempt, this snapshot is
required before resize or capture. Neither later operation treats it as
current-state authority. If the restored window remains too large, use the fixed
resize below and run readiness again. If it remains maximized or the window
changes, inspect and use only the offered cleanup; do not issue another restore.

For an eligible non-maximized window that needs a smaller size, validate
`resize-window-for-capture` with the original operation/binding and
`acceptWindowResizeEffects:true`. It requests fixed 1920x1080 using the original
unique window, without caller coordinates, size, movement, activation or Z-order
changes. One durable intent precedes dispatch. At least 20 CDP slots and 32 MiB
stdout headroom are required before resize, retaining ten slots for later
capture. Acknowledgment proves only submission. Async posting depends on distinct input
queues; see [SetWindowPos](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-setwindowpos). Run readiness again and require
exact 1920x1080 at the same original position before capture can consume its
intent. Capture then repeats its fresh checks and recalculates output headroom.
A missing, refused, clamped or unapplied resize is consumed; it grants no retry
or automatic restoration. Resize itself refuses maximized windows; use only the
separate restore workflow above before resizing. Style changes, arbitrary window
control and restoration of previous state remain unavailable.

When the snapshot has suitable geometry and capacity, obtain the original application `hwnd`
with `observe-window`. Validate and send
`capture-window` with that HWND, the original operation/binding,
`acceptWindowPaintEffects:true` and `confirmLocalArtifact:true`. This separate
once-only action can follow the viewport operation. It brackets the native
capture with fresh source-qualified active-PCB checks. It cannot capture an
arbitrary PID, HWND or an ordinary running session.

The action requests `WM_PRINT` from the original root window into an owned,
bounded bitmap. Visible descendants must belong to the original process or to
the same pinned application image in its original Job. For another process,
the owner retains a noninheritable query-only handle before qualification,
checks its PID, creation time, liveness, image and Job, and rechecks fresh
HWND/PID/thread/creation tuples at the existing capture brackets. Other images,
Jobs, failed queries, replaced processes and changed window links refuse.
Job membership alone grants no capture authority. No caller PID or executable
allowlist is accepted.

The initial child roster is sealed; later brackets cannot adopt new process
leases. Process handles remain retained even if capture refuses before bitmap
allocation. Only actual original root exit and empty Job permit their release,
alongside any DC/bitmap resources. Child drift stops capture without blocking
normal close or an authorized original-Job abort. A partial release failure
retains the remaining resources and grants no public retry.

These are sequential ownership samples. Windows can create descendants during
enumeration or recycle HWNDs after a check; retained process handles do not pin
window lifetimes. No atomic window ownership or render completion is claimed.
The paint request can run application paint handlers. Native
dimensions and pixels are capped before allocation: at most 4096 pixels per
side and 4,194,304 pixels total, with at most 256 KiB PNG and 360,000 bytes for the
native packet. Before paint, the original transport reserves 32 MiB of remaining
helper output and a separate protected cleanup allowance, with bounded CDP
requests, polls and control replies. Capacity refusal consumes the capture stage
while preserving original-owner cleanup. The return contains a managed PNG descriptor and exact dimensions,
hash, bounds and pixel summary. Use its exact path for visual inspection. The
result and journal do not repeat base64 image contents. Unsupported dimensions,
PNG output or framing refuse whole rather than resize or truncate the image.

WM_PRINT uses a one-second SendMessageTimeout request. Windows ignores that
timeout for the same input queue, and expiration does not cancel the target's
paint work. See [the native timeout contract](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-sendmessagetimeoutw).
Native DC/bitmap resources remain retained even after an acknowledged capture,
until actual original root exit and an empty Job permit release. Keep the owner
alive through the cleanup steps below; use its confirmed abort when needed.
Lost replies, failed guards and publication failures do not permit recapture.
Original pending record settlement publishes retained evidence only.

This is a full-window pixel observation. It may be blank, stale or partial and
does not prove a stable render, canvas-only content, geometry, connectivity or
persistence. A nonzero pixel summary is not visual acceptance. The public SDK
canvas-image method and its separate renderer/resource problems remain excluded.
Window capture has source/offline validation. The installed 174608 all-RGB-zero
result was not accepted as a useful visual observation. The separate successful
renderer case above does not validate WM_PRINT pixels or permit recapture.

After a native refusal, inspect `windowNativeFailure`. It contains only fixed
window action/stage/code labels, cached bounds and resource flags. `paintPhase`
tracks the capture's WM_PRINT dispatch, not ordinary painting triggered by a
resize. Reading the retained fault does not query the window or prove its current
state. Unknown or unavailable details remain unclassified. Neither a diagnostic
nor a lost reply permits repeating capture or resize. Native faults are retained
before response-budget validation can reject the pending reply.

Window-related failures may include `windowDiscovery`, a cached bounded snapshot
from the original window selection. Its fixed reason and counts distinguish no
owned or eligible window, ambiguity, repeated-check drift, the owned-window limit
and enumeration failure. It contains no titles, PIDs or HWNDs. Serialization
makes no new window query, and the snapshot grants no current-window authority
or retry. Older records can omit the field.

`native-entry-point-unavailable` identifies failure to resolve a managed native
binding; it is not evidence that the window is hidden or needs user input.
The rectangle adapter explicitly binds `WcGetWindowRect` to the documented
[GetWindowRect](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-getwindowrect)
export. Inspect the retained fault and use the offered cleanup after a binding
failure. A corrected package needs a fresh original owner; retrying the consumed
action cannot repair its loaded helper.

## Close and release the original owner

Use `observe-window`, then one `normal-close` with the observed `hwnd` and
`confirmNormalClose:true`. A close acknowledgment is not exit. Continue with
`observe-termination` and, after original root exit and an empty original Job,
`release-closed`.

When authorized forced cleanup is needed, use `abort-visual` with the same
operation/binding and `confirmAbortOriginalVisualJob:true`. Its durable intent
precedes the one termination request. Only the original retained visual Job is
targeted; caller PIDs or replacement Jobs are not accepted. The consumed abort
blocks normal work, including another camera call or close. Its acknowledgment
is not termination or discard. Observe actual exit and empty Job separately,
then release. A lost abort acknowledgment grants no retry.

If launch produced no process, inspect the original intent and use only the
coordinator's offered `cleanup-unlaunched` or `cleanup-no-process` action with
its exact intent digest. A restarted facade cannot adopt old native ownership.

## Concrete exclusions

- Selection and clearing remain unavailable. The installed handlers flush
  DRC/connectivity and uploads, can delete empty selected views or annotations,
  and can settle tool or stash state. Even empty prior selection does not make
  append a camera-only action. A true result can also hide missing IDs.
- `dmt_EditorControl.zoom` is a literal false stub. The operations above
  use implemented zoom-to and fit handlers, not that percentage wrapper.
- Current 209 SDK canvas PNG capture remains unavailable. The image path can allocate
  RGBA, ImageData and canvas data before facade bounds. Original renderer/frame
  ownership, asynchronous capture completion and resource cleanup need their
  own bounded implementation. The separate original-window operation above does
  not qualify that path. The older capture route has separate admission.
- Net highlighting, cross-probe, caller-controlled overlay timers, schematic/3D routing, ordinary
  projects, complete startup/baseline, source membership, electrical correctness,
  explicit Save, saved/reopened content and exact inverse are not supplied.
