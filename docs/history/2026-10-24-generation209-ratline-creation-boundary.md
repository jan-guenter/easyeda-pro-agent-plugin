# Generation209 ratline constructor boundary

This private continuation was implemented on2026-10-24 from main `cd2ab88`.
It adds the constructor-boundary stage missing from the earlier
[ratline event capture](2026-10-24-generation209-ratline-event-capture.md).
It does not register a public operation, change native command admission or
increase the existing startup budget. No EasyEDA launch, project-file access,
CAD action or Save was performed by this work.

## Captured observations

The fixed [source profile](../../plugins/easyeda-pro-control/server/src/current-pcb-209-ratline-creation-profile.ts)
pins four executable positions in the complete209 PCB and ratline-worker
assets. Each factory pauses immediately before its `new Worker` call and
immediately after construction, before inserting the Worker in its registry.
The [private runners](../../plugins/easyeda-pro-control/server/src/current-pcb-209-ratline-creation-runner.ts)
select these profiles through separate PCB and worker classes.

The stage reads the original URL and name arguments, inventories targets while
the parent is paused, and resumes that constructor once. At the second pause
it retains the actual Worker and manager objects. A single waiting child must
arrive through the original parent subscription, match the observed constructor
arguments, and account for the complete target-inventory difference. Existing
matching children, changed peers, relocated breakpoints and extra attachments
refuse. The parent worker itself is excluded from the existing-child check.

The successful packet leaves the parent paused after construction and the
child waiting for its separate source qualification. A private continuation
must arm the bridge/factory observers before continuing the parent once.
The private child-start method likewise requires the successor to arm its
original instrumentation first. That method and abort cleanup share the same
consumed promise, so normal bootstrap start cannot be repeated during cleanup.
Copied packets cannot recover remote objects or continuation authority.
The packet includes a URL digest, not the potentially private query values.

## Cleanup and limits

All resume, breakpoint-removal and child-start promises are recorded before
dispatch. Synchronous callbacks and reentrant cleanup therefore cannot dispatch
them twice. Cleanup retains paused code while a breakpoint allocation is
unknown or removal has failed. A late original allocation reply is recorded
and removed before cleanup resumes the parent or child. Failed observations
remain failed after that cleanup.

The stage allows24 ordinary commands within32 total commands. The fixed
successful construction capture uses11 commands. Parent continuation and child
bootstrap start each use one more. These counts exclude the enclosing native owner's reproof exchanges
and child source capture. The future combined native purpose must account for
every stage without resetting its original command counter.

A six-second continuation deadline bounds the returned held-parent state.
Failure cleanup resumes only original retained pauses and releases original
waiting children. It does not detach, terminate, retry navigation or choose a
Save/Discard prompt. Listeners remain until original process and Job termination
are proved. The native owner must retain unresolved cleanup failures.

## What this does not prove

The constructor bracket and matching attachment establish correlation, not
native Worker-to-CDP-target identity. Chromium reports child targets through
the parent renderer channel, and a page session can contain other frames.
The native integration must exclude those other producers and retain the
exact original frame before strengthening that claim. This interpretation is
based on the [pinned Chromium146 child-target implementation](https://raw.githubusercontent.com/chromium/chromium/146.0.7680.188/content/browser/devtools/devtools_renderer_channel.cc).

The successful packet keeps `nativeWorkerTargetIdentityVerified`,
`childSourceQualified` and `executionAuthorized` false. It does not qualify the
generated child bootstrap, imported ratline source, subscribed project-channel
peer, async callback completion, copper completion or full live/source/SQL
baseline. A shared original event dispatcher is still needed to compose these
constructor pauses with the existing ratline bridge/factory captures.

## Focused verification

Six focused tests pass. Four use actual V8 debugger events in disposable Node
children with inert vendor excerpts. They cover both factories, original
receiver retention, copied-packet refusal, consumed continuation, foreign
attachments during final reproof and cleanup ownership. Target inventories,
child attachments and the application collaborators are synthetic.

Two additional dependency tests cover a synchronous resumed callback followed
by the next pause, normal child start followed by cleanup without a second
dispatch, and a delayed breakpoint allocation that keeps the parent
and child held until the original ID is removed. Root and independent review
identified these two races in the initial implementation; the corrected cases
remain in the focused suite.

Both complete installed assets pass their source and coordinate hashes. Inert
compilation separately confirms the exact four executable breakpoint positions;
no compiled application code is run. Strict type-aware lint and TypeScript
checks pass. These results are source and offline evidence, not connected
EasyEDA validation or native-helper adoption.
