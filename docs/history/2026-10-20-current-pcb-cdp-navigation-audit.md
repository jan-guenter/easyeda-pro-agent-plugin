# Current PCB diagnostic navigation audit

This source audit accompanies the continuation of installed120717. The actual
project-opening attempt retained `event-callback`, `eventKind:"unknown"` while
its project-open request was pending. That evidence does not identify the event
name, prove no navigation, or authorize another attempt. The findings below
come from repository code and upstream Chromium146.0.7680.188, not a captured
EasyEDA event sequence.

## Same-document root transitions

The existing project-opening model accepts only `Page.navigatedWithinDocument`.
Its test fixture emits that event alone. The PCB-opening fixture makes the same
assumption for the root fragment before emitting its child-frame events.

Chromium's `Location::setHash` calls `SetLocation`, which marks the request as
`kFrameNavigation`. [Location implementation](https://github.com/chromium/chromium/blob/146.0.7680.188/third_party/blink/renderer/core/frame/location.cc#L197-L214),
[request construction](https://github.com/chromium/chromium/blob/146.0.7680.188/third_party/blink/renderer/core/frame/location.cc#L288-L297).

`LocalFrame::Navigate` emits scheduled-navigation before `StartNavigation` and
cleared-scheduled-navigation after it, except for `kNone` and initial-frame
requests. Its scheduled delay is zero. These two renderer notifications surround
the call synchronously. [LocalFrame implementation](https://github.com/chromium/chromium/blob/146.0.7680.188/third_party/blink/renderer/core/frame/local_frame.cc#L549-L577).

The matching inspector agent maps `kFrameNavigation` to `scriptInitiated` and
flushes both scheduling notifications. Its within-document event separately
reports the frame, final URL and navigation kind.
[Inspector event production](https://github.com/chromium/chromium/blob/146.0.7680.188/third_party/blink/renderer/core/inspector/inspector_page_agent.cc#L104-L126),
[scheduling notifications](https://github.com/chromium/chromium/blob/146.0.7680.188/third_party/blink/renderer/core/inspector/inspector_page_agent.cc#L1141-L1168),
[same-document notification](https://github.com/chromium/chromium/blob/146.0.7680.188/third_party/blink/renderer/core/inspector/inspector_page_agent.cc#L965-L973).

The synchronous same-document fast path returns before the general
requested-navigation notification. Therefore requiring every fragment change to
include `frameRequestedNavigation` would introduce another false refusal.
[FrameLoader fast path](https://github.com/chromium/chromium/blob/146.0.7680.188/third_party/blink/renderer/core/loader/frame_loader.cc#L697-L711),
[later requested-navigation path](https://github.com/chromium/chromium/blob/146.0.7680.188/third_party/blink/renderer/core/loader/frame_loader.cc#L859-L879).

Same-document navigation can also start and complete loading progress when the
document was not already loading. Those notifications are omitted when it was.
[DocumentLoader progress](https://github.com/chromium/chromium/blob/146.0.7680.188/third_party/blink/renderer/core/loader/document_loader.cc#L987-L1059).
The browser agent emits frame loading state separately. Do not impose a total
ordering between browser and renderer notifications or treat balanced loading
counts as editor, worker or compiler completion.
[Browser loading notifications](https://github.com/chromium/chromium/blob/146.0.7680.188/content/browser/devtools/protocol/page_handler.cc#L1012-L1042).

The scheduled/cleared pair is therefore a source-supported explanation for the
unknown event, not a retroactive diagnosis. A correction should bind those
events to the armed root, exact selected URL, zero delay and script reason.
It must preserve the original committed loader, context, script and final
target/frame comparison. For `frameStartedNavigating`, the protocol's loader
token describes the pending navigation, including same-document navigation.
It must not overwrite the already committed loader or be required to equal it.
[Pinned Page event schema](https://github.com/chromium/chromium/blob/146.0.7680.188/third_party/blink/public/devtools_protocol/domains/Page.pdl#L1262-L1324).

## Separate PCB-child transition

Initial iframe creation takes a different Chromium branch from changing an
existing iframe's source. New children use `initialFrameNavigation` and call
`StartNavigation` directly. Existing children use `kFrameNavigation` through
`Navigate`, which can produce scheduled/cleared events. These paths cannot share
a mandatory scheduled-event prerequisite.
[Frame-owner navigation branches](https://github.com/chromium/chromium/blob/146.0.7680.188/third_party/blink/renderer/core/html/html_frame_owner_element.cc#L678-L741).

Code review found these separate holes in the former child event policy:

- Started/requested/loading events shared only child-ID and URL checks. Pending
  loader, navigation type, request reason, disposition and extra fields were
  not checked.
- Blank commits left `childLoaderId` null, permitting several blank commits
  before the eventual PCB commit.
- A second navigation start could be accepted after the PCB commit until the
  frame snapshot, even though a second committed navigation would refuse.
- Child context destruction compared the numeric context ID and frame but not
  the retained unique context ID.
- `frameStoppedLoading` was accepted globally without checking its frame.
- The fixed diagnostic name list omitted scheduled/cleared navigation and
  several identity-loss events, collapsing different refusals into `unknown`.

The new pure `current-pcb-diagnostic-child-navigation.ts` tracker handles one
already attached child. It accepts at most one optional blank commit and one
distinct PCB commit; checks closed event parameter shapes, exact child/root
relations, fixed URLs and origins; and correlates any browser start token with
its corresponding committed loader. The enclosing context still owns session,
source, default context, DOM and retained process admission.

Renderer scheduled/cleared state must balance at `assertReady`. Browser loading
counts are bounded observations only. A first browser start may arrive after its
matching renderer commit only with that exact committed loader. A repeated or
different start refuses. This does not accept another navigation, replace a
loader, or grant completed-load authority. A delayed blank start after the PCB
commit needs an already retained blank commit with the same loader; a new blank
navigation remains forbidden.

The enclosing context must separately validate child context teardown, including
the unique ID, and preserve all root/sensor restrictions. Detach, subtree detach,
new root document, context clear, debugger pause and other unsupported identity
changes remain failures. Naming those events in diagnostics must not turn them
into accepted background noise.

For the same-process path, window replacement and old-context destruction occur
before the renderer's committed-frame notification. `InitializeWindow` runs
before `WillCommitNavigation` and document installation.
[Commit sequence](https://github.com/chromium/chromium/blob/146.0.7680.188/third_party/blink/renderer/core/loader/document_loader.cc#L2646-L2741).
`SetDOMWindow` clears the old proxies for navigation; proxy disposal notifies the
debugger of context destruction.
[Window replacement](https://github.com/chromium/chromium/blob/146.0.7680.188/third_party/blink/renderer/core/frame/local_frame.cc#L1057-L1070),
[proxy disposal](https://github.com/chromium/chromium/blob/146.0.7680.188/third_party/blink/renderer/bindings/core/v8/local_window_proxy.cc#L83-L109).
`WillCommitLoad` then emits and flushes `frameNavigated`.
[Commit notification](https://github.com/chromium/chromium/blob/146.0.7680.188/third_party/blink/renderer/core/inspector/inspector_page_agent.cc#L1074-L1081).
An initial same-origin window can instead be reused, retaining its context.
[Window reuse](https://github.com/chromium/chromium/blob/146.0.7680.188/third_party/blink/renderer/core/loader/document_loader.cc#L2483-L2535).
Therefore permit exact initial-child teardown only before the PCB commit and
clear that allowance when the commit is accepted. A pre-commit context that
survives may be the final PCB context; its later destruction is not background
initialization.

## Limits and focused validation

The tracker has no transport, timer, filesystem access, native dispatch, reset,
retry, caller code or execution token. Its focused tests cover initial and
existing-frame branches, optional blank commit, cross-producer event ordering,
exact pending/committed loader agreement, late first browser start, malformed
parameters, duplicate commits, foreign frames/URLs, unsupported navigation
types, unmatched scheduling and bounded loading events.

`DOM.describeNode` does not require DOM enablement or begin tracking objects.
There is no reason to broadly allow DOM mutation events just because the
diagnostic path describes an iframe owner.
[DOM description contract](https://github.com/chromium/chromium/blob/146.0.7680.188/third_party/blink/public/devtools_protocol/domains/DOM.pdl#L265-L283).

The findings and synthetic tests do not qualify this corrected policy on the
custom EasyEDA runtime. Actual connected opening, original-owner cleanup and
later model/writer lifecycles require their own new evidence.
