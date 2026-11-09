# Original project polling cancellation

The unpublished Via writer can deliberately cancel its first original
`checkProject` timeout under a separate durable opening intent. This is a
session mutation. It does not modify preferences or qualify Save, upload,
selected-file SQL, final producer drain or persistence.

The original source-held worker captures its own timer intrinsics before
PROJECT executes. After the genuine constructor join, two fixed source points
retain the original `Lg.open` call into `checkProject`, the original receiver,
method and actual positive timer ID. Exact native metadata, descriptors,
prototype relations and the installed full-source pin are required. There is
no caller timer ID, code, condition or replacement callback. Only the actual
cancellation consumes the original journal marker, before any publication or
native-dispatch await; arming leaves it unconsumed.

The effect calls the retained original native `clearTimeout` once. It retains
the same positive application `projectTimer` slot and descriptor, preventing
ordinary recursive rearming. The source-known established handler and other
future callers can reset that slot; a permanent fixed conditional entry point
holds any subsequent would-rearm call and stops writer progress. It is not
removed while the generation lives. No failed or unknown cancellation is
retried, and cleanup never resumes a failed held call. The entire disposable
generation closes afterward, so no timer restoration is offered.

`armViaProjectSyncQuiesce(plan, intent, setup)` runs before navigation. Its
trusted setup constructs `CurrentProjectSyncQuiesceObserver`, awaits `arm()`,
and retains `observeFirstTimer()` until after original source release. The
opening joins its opaque completion through `requireOriginal()` and Core
`requireOriginalViaProjectSyncQuiesced(plan)`. Both producer-prefix eligibility
and native create/Save dispatch require that actual completion. The original
cancel ACK, returned-breakpoint removal ACK and original resumed event precede
the native completion ACK. Serialized brands cannot recreate any origin,
intent, native bindings or completion.

This adds 28 finite CDP commands and one exact helper-source read to the Via
birth only. With the separate writer StartPage reserve, the renderer total is
3140. The shared old four-helper catalogue and released purposes remain
unchanged. All immutable tuples have a dedicated frozen-descriptor decoder;
the mutable legacy clock decoder is unchanged.

Validation: seven focused timer cases cover inert original method execution,
wrong receiver/slot/native drift, retained positive slot, no replay, delayed or
lost acknowledgement, purpose-exclusive wire grammar, actual inert Inspector
frozen descriptors, and source-only compilation of the exact original entry,
call, return and opening-caller positions. The combined focused router,
controller and owner-boundary set passes 41 cases. Both TypeScript projects and
changed-file strict lint pass. Private two-pass generation is idempotent at
2,083,394 bytes on this source base, below the unchanged 2 MiB bound. Full Linux
C# compilation and all 28 timer/five SDK message-hash smokes pass. These are
source and synthetic checks; no EasyEDA, Windows process, native owner or
connected writer was launched.
