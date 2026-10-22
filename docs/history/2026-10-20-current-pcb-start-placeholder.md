# Start Page ancillary frame source audit, 2026-10-20

## Finding and evidence boundary

The pinned UI creates an invisible HTML `OBJECT` resize sensor when it
initializes the main tab container. Its child document is `about:blank`.
It is not an editor iframe or the hidden placeholder tab with ID `0`.

The consumed installed093241 diagnostic proved a UI root and one direct
`about:blank` child, then admitted the complete pinned UI source. It did not
inspect the child's DOM owner. The retained records therefore do **not**
establish that this particular child was the resize sensor. Project opening
was not dispatched. Original normal closure, termination and release were
completed separately.

The useful next contract is narrow structural admission of one pre-existing,
unchanged, source-shaped ancillary `OBJECT` frame. It must first inspect the
actual DOM owner. A matching URL alone is insufficient. This admission would
not prove Start Page readiness, private observer-registry ownership, project
startup, compiler ownership or permission to edit.

This audit read installed application source as inert text and retained
diagnostic JSON. It did not execute vendor JavaScript, call an MCP, launch
an application, read a project or change a design.

## Pinned primary source

The inspected asset is `pro-ui/3.2.196.26ed3d6c/js/ui.js`, 17,456,671 UTF-8
bytes, SHA-256
`3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a`.
Its decoded JavaScript string has 17,456,146 UTF-16 code units. All positions
below are zero-based JavaScript string offsets, not byte offsets.

| Source location | Observed implementation |
| --- | --- |
| HTML template at 51618 | Creates the `editor-window-main` DIV with class `editorCanvas`. |
| `tt` defaults at 16445135 | Main container is `editor-window-main`; initial current tab is `tab_page1`. |
| `tt.init` at 16394695 | Creates the main tab bar with the Start Page tab. |
| `tt.createTabBar` at 16396402 | Sets `isObserver:true` and passes custom class `iK` to `vt.addTabBar`. |
| `vt.addTabBar` at 15673253 | Finds the container DOM element, instantiates the supplied observer, calls `observe` on that element and retains it in `resizeObserves[id]`. It also records `containerFatherEls[id]`. |
| `iK.observe` at 16394029 | Delegates to `eut.observe` and retains the observed element in its own Set. |
| `eut.observe` at 16392660 | Creates the sensor, appends it directly to the observed container and stores the element under private symbol `Xdt`. |
| `eut.unobserve` at 16393188 | Removes the resize listener and sensor element, then deletes the container's symbol property. |
| `vt.deleteTabBar` at 15678630 | Disconnects the retained observer before removing tab-container registry entries. |

These anchors describe the native producer. They are not evidence that a
matching caller-created object or DOM node belongs to those private registries.

## Exact source-set element fields

At 16392778 the producer calls `createElement("object")`. It assigns the
following style properties in this order from `qdr` at 16392225:

| CSS property | Source-assigned value |
| --- | --- |
| `display` | `block` |
| `position` | `absolute` |
| `top` | `0` |
| `left` | `0` |
| `width` | `100%` |
| `height` | `100%` |
| `border` | `none` |
| `padding` | `0` |
| `margin` | `0` |
| `opacity` | `0` |
| `z-index` | `-1000` |
| `pointer-events` | `none` |

It then assigns `tabIndex=-1`, `type="text/html"`,
`aria-hidden="true"` and `data="about:blank"`. The resulting expected HTML
attribute names are exactly `style`, `tabindex`, `type`, `aria-hidden` and
`data`. The four non-style string values are respectively `-1`, `text/html`,
`true` and `about:blank`.

The producer does not assign an ID, class, source URL, document UUID, editor
doctype, `blankIframe`, event-handler attribute or caller-supplied attributes.
Its JavaScript `onload` property is not an HTML attribute.

Source assignment is not a captured CSS serialization. Browsers can serialize
zero lengths as `0px`, and normalize shorthand spacing. A decoder should admit
only a closed set of these twelve declarations and supported zero-length
spellings, rejecting duplicates, extra properties, comments, priorities,
functions and URL values. After the first accepted sample, retain the complete
actual attribute representation for unchanged reproof. Do not silently accept
arbitrary equivalent CSS or call the source string an observed native result.

The onload handler installs resize/unload listeners on the blank document.
Unloading invokes the producer's callback; unobserve removes the sensor.
The sensor is not inherently inert merely because its document URL is blank.
No observer method should be invoked or changed by diagnostic admission.

## Project and PCB transitions

The main tab bar owns this sensor, not any PCB document. Ordinary tab insertion
through `vt.addTab` at 15675019 modifies the existing tab registry and rerenders
it; it does not replace the main container or its resize observer.
Project `ON_OPENED` at 16667086 hides the Start Page view and proceeds with its
normal project initialization. This is not a sensor-removal operation.
Restoring or rearranging split containers can create or disconnect observers,
so the proposed narrow path must continue to reject those transitions.

For a type-3 document, public `R2.openDocument` at 17218992 selects `Zd`.
`Zd` at 15250454 follows the ordinary `gy` path at 15241107. The non-lazy path
calls `MO.create` for the PCB, then initializes that frame and activates its
tab. The new PCB iframe is separate from the existing main-container sensor.
The existing iframe/DOM/source proof must still apply to that new child.

Do not confuse this with `err`/`O8o` at 15250016/15250392. Those functions
create `blankIframe` editor caches, currently for `panel`, through `MO.create`.
They have editor classes, UUID-bearing panels and an editor URL. Nor does the
conditional legacy `w.viewframe` reset at 15950106 prove any relation to the
observed blank child. Neither family belongs in a resize-sensor exception.

## Proposed retained-owner check

Only after complete UI-source admission, derive a candidate from the retained
frame inventory: exactly one direct blank child alongside the original UI
root, no descendants or additional candidates. Preserve its complete frame
row, including ID, loader, parent, URL and origin. Then:

1. Use fixed `DOM.getFrameOwner` for that internally retained frame ID.
2. Describe that returned backend node. Require element type 1, `OBJECT` /
   `object`, the same frame identity and the complete closed attribute
   contract above. Reject iframe, embed and any unsupported node shape.
3. Retain the backend-node identity and complete accepted DOM projection.
   Reprove them at the final pre-project dispatch boundary, after project
   opening, before PCB dispatch and during PCB-frame observation.
4. Keep every existing frame/context loss, navigation, detach, replacement,
   unexpected child, source drift and original-process check terminal.
   Never navigate the sensor, attach a worker through it or use its context
   for any editor call.

`DOM.describeNode` can inspect a backend node without enabling the DOM domain,
but `parentId` is optional. These two operations alone do not prove the
element's direct DOM parent or private observer-registry membership.
That limitation must remain explicit in results.
[CDP DOM protocol definitions](https://github.com/ChromeDevTools/devtools-protocol/blob/master/pdl/domains/DOM.pdl)

Current Chromium implements `getFrameOwner` through `HTMLFrameOwnerElement`,
not an iframe-only cast. `HTMLObjectElement` inherits through
`HTMLPlugInElement` from that class, explaining why this existing protocol
method can identify an object-owned frame. This source rationale does not
qualify the installed custom Chromium build; its actual result must pass
the strict decoder.
[Inspector implementation](https://github.com/chromium/chromium/blob/main/third_party/blink/renderer/core/inspector/inspector_dom_agent.cc),
[object class](https://github.com/chromium/chromium/blob/main/third_party/blink/renderer/core/html/html_object_element.h),
[plugin base class](https://github.com/chromium/chromium/blob/main/third_party/blink/renderer/core/html/html_plugin_element.h)

The five two-request checks add ten requests to the former53-request path.
The batched root inventory adds one more, totaling64 including object-group
release. The existing64-request bound is unchanged.

## Implementation follow-up

The same-day source batch implements the retained-owner check above, including
all five boundary checks and exact subsequent attribute reproof. Focused tests
cover the accepted transition and owner drift before and after navigation.
This does not upgrade the consumed093241 observation: its actual child owner
was never inspected. The new path still needs connected qualification after
publication and a fresh runtime admission.
