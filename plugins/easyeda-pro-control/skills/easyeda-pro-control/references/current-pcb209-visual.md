# Disposable PCB viewport control on 3.2.209

Use this workflow to fit an existing disposable PCB or move its camera to exact
mil coordinates. It offers three viewport operations through a separate native
owner. Source implementation, offline tests and native compilation exist;
connected execution is unvalidated. Check the installed catalog before use.

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
| `fit-selected` | `kind:"fit-selected",expectedSelection:[...]` | Fit the already selected objects. The complete ordered ID list must match before dispatch and afterward. No selection change is requested. Component attribute boxes can contribute to the fit. |
| `zoom-to` | `kind:"zoom-to",xMil,yMil,scaleRatio` | Explicit coordinates in mil and explicit positive native camera scale ratio. No omitted-coordinate defaults or percentage-zoom wrapper. |

Use `observe-selection-relations` once when the existing selected IDs or child
pads are needed. Its optional `componentIds` defaults to `[]` and admits at most
sixteen distinct Component IDs. It is a read, not a way to select objects. It
shares the original transport budget with viewport work. This visual grammar
does not expose the ordinary opening owner's other optional readers.

Coordinates are finite, exclude negative zero and have absolute value at most
1e12 mil. Scale ratio is between0.00001 and1000000. Selected IDs are distinct,
well-formed UTF-16 strings of at most256 units, with at most256 IDs. Fit-selected
requires a nonempty list. The complete JSON operation is at most12000 UTF-8
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
flags, complete unchanged selection and one native `getBBox2` return. Both raw
native bounds and `boundsMil` are provided. Native units equal ten mil. Camera
state is not independently double-sampled, rendering completion is not observed
and the result contains no screenshot. A three-second observer prevents later
camera dispatch after expiry but cannot cancel a handler already sent.

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
- `dmt_EditorControl.zoom` is a literal false stub. The three operations above
  use implemented zoom-to and fit handlers, not that percentage wrapper.
- Current209 canvas PNG capture remains unavailable. The image path can allocate
  RGBA, ImageData and canvas data before facade bounds. Original renderer/frame
  ownership, asynchronous capture completion and resource cleanup need their
  own bounded implementation. The older capture route has separate admission.
- Net highlighting, cross-probe, overlay timers, schematic/3D routing, ordinary
  projects, complete startup/baseline, source membership, electrical correctness,
  explicit Save, saved/reopened content and exact inverse are not supplied.
