# PCB text lifecycle observer limits

The current installation still lacks a reviewed complete pre-create observer.
An original-process close and full SQL comparison can resolve one later
persistence problem, but cannot make an unobserved first edit safe. No PCB text
writer, listener, dispatcher or additional supplied-data model was added in this
follow-up.

## Pinned source evidence

The files below were read as inert text and rehashed on 2026-10-19. Offsets are
zero-based JavaScript string positions, not byte offsets or line numbers. The
paths are relative to the installed application's `resources/app/assets/`.

| Source | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-pcb/3.2.193.682ed44e/js/pcb.js` | 10,976,299 | `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33` |
| `pro-mgr/3.2.184.355087e9/js/project-worker.js` | 2,181,284 | `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928` |

These source observations supplement the [original observer audit](current-pcb-text-observer-research-2026-10-19.md)
and [Save prerequisite audit](current-pcb-string-save-prerequisites-2026-10-19.md).
They are not a connected runtime admission or a live model observation.

## The existing broadcast bus cannot supply the missing owners

PCB3131156 stores a real `BroadcastChannelMessageBus` on
`self[channelName]`. The compiler binds its `dataBus` at PCB3141502 using
`/${windowId}/project/${path}`. A read of that existing property can identify a
transport object. It does not expose the compiler, its consistency manager or
the project-worker object.

The bus implementation's `post` method at PCB2743029 calls native
`BroadcastChannel.postMessage` and then schedules its local `onMessage` call in
a promise callback. `publishPendData` at PCB3145812 clears every published
pending array immediately after publication. Thus an ordinary local subscriber
sees those cleared arrays. Copying the message inside that later subscriber is
too late. Replacing the publisher or bus methods would instrument vendor state;
it is not a read-only fallback.

A separate receive-only native BroadcastChannel would receive structured-cloned
data before those original arrays are cleared. That gives a possible bounded
publication recorder, not complete owner observation. The envelope has the
transport's sender UUID, topic and message. The compiler's unique edit ID is a
different message field. Neither is a capability identifying a retained native
compiler or worker. Worker2112925 consumes the first three message entries and
does not use the fourth origin document entry as a producer identity. The
existing one-String publication relation must therefore remain a data
comparison, not authorization to create or Save.

## Debug exports and event callbacks do not fill the gap

Two additional public properties were checked against their full class bodies:

- `Window.endPointDebug`, assigned at PCB10793795, contains diagnostic line,
  arc and arrow collections. Its class at PCB10755224 can draw and remove those
  diagnostics. It does not retain the compiler, footprint manager or pending
  upload managers.
- `Window.ShoveDebug`, assigned at PCB5246342, contains routing-debug stacks and
  drawing controls. Its class begins at PCB5242314. It is not the command
  manager's undo stack or a complete renderer-model inventory. Calling its
  drawing or clearing methods would itself alter diagnostic rendering.

The primitive event producer in `kde.sendMessageToExtensionApi`, within the
class beginning at PCB7922234, publishes primitive IDs and type labels, with a
designator in one component-deletion branch. It does not pass the command,
native model or compiler to the subscriber. The event also follows command
upload. It cannot establish pre-dispatch queue isolation.

These checks found no complete native observer. This is a result for the
reviewed routes and exports, not proof that every conceivable integration is
impossible. Debugger access, vendor closure instrumentation and a modified
application build would require a separate capability and security review.

## What generation termination can and cannot prove

The existing original-owner schematic lifecycle supplies a useful alternative
to undocumented callback completion. A PCB lifecycle could retain its original
process and non-breakaway Job handles, close that generation normally, prove
both terminated, compare the complete closed SQL effect, exclude both persistent
upload-replay cache namespaces, and reopen in a separately qualified generation.
It would then require same-ID saved native readback, a final normal close and
another complete SQL comparison. This is an architectural inference from the
maintained lifecycle, not an implemented PCB route.

Such a sequence can prove that an old producer cannot write again. It does not
prove that every callback completed, and must not set a callback-completion flag.
It also cannot undo a network request, unrelated cache write or profile change
that happened before closure. Those effects must be excluded or explicitly
modeled before the edit. See the [retained-owner release requirements](../plugins/easyeda-pro-control/skills/easyeda-extension-development/references/validation-and-release.md).

The pre-dispatch problem remains separate. Creating a String calls the shared
command uploader, which can flush BOARD, POURED and INNER changes. It also
schedules the teardrop callback at PCB9092131. Even an empty teardrop removal
pass calls `Xe.increaseUpload()`. Save at PCB10798684 walks all loaded custom
footprint compilers before the main compiler and dynamic-copper Save. A later
exact SQL mismatch would detect collateral persistence, but detection after a
write is not a substitute for proving the initial scope.

## Concrete remaining requirements

Before an executable lifecycle can be added, it needs one reviewed route that
binds the original ordinary PCB frame and observes complete native membership,
loaded custom-footprint participants, pending BOARD/POURED/INNER state, teardrop
state and relevant worker state. It also needs an exact supported full-SQL model
for the String create and Save effects, plus the fresh-generation verifier
described above. Empty SDK collections, matching supplied snapshots, a fixed
wait or a successful boolean cannot replace these checks.

The current official Save contract returns a boolean and explicitly warns that
headless success may not mean durable output. It supplies no pending-owner
inventory. [Official Save reference](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_document.save.html).
The newer canvas-calculation status concerns calculation activity, was added in
EDA v4.2 and does not describe an upload or SQL barrier.
[Official calculation status](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_document.getcanvasupdatecalculationstatus.html).

No vendor code was evaluated, live app operation performed or design opened by
this audit. Existing writer refusals and compatibility pins remain unchanged.

## Desktop diagnostic boundary checked after delivery125900

The follow-up examined remaining renderer exports and the desktop shell before
attempting another observer implementation. PCB bytes still match the table
above. Two additional installed files were read and hashed, with paths relative
to `resources/app/` rather than its assets directory:

| Source | Bytes | SHA-256 |
| --- | ---: | --- |
| `app.js` | 2,657,192 | `52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c` |
| `assets/js/preload.js` | 716 | `bc4bb929fb4663915bbeb36bd916d09089381cb17d004d49518e392b967db344` |

The remaining exports supply no complete model or queue reference:

- `window.logMemoryInfo` at PCB1926817 is a function closing over GPU allocation
  state. It prints aggregate memory counts, not PCB models or pending uploads.
- The bundled Three.js hook at PCB2254549 publishes a registration event whose
  detail contains only revision `172`. It does not export the PCB compiler.
- `sYe` at PCB6299156 emits object-tree category descriptors. The `getAllItems`
  subscriber at PCB10859050 follows it with a delayed tree result. These are
  display data, not original native holders or a queue snapshot.

Desktop factory `Ps` at APP1361332 defaults to disabled Node integration in
the renderer, workers and subframes, enabled context isolation and sandboxing.
Its caller-options spread can override defaults, so these source values are
not a claim about every running window. The complete 716-byte preload exposes
only `openWindow`, `openWindowSelf`, `focusWindow` and `getWinId`. Their handlers
at APP1363217 onward open or focus windows, or return a window ID. None
provides debugger commands or worker-global access.

The menu and keyboard handlers at APP1342105 and APP1344611 open DevTools UI.
They do not supply a plugin-owned diagnostic connection. Searches of this
pinned main bundle found neither a `.debugger` binding nor a remote-debugging
service. Electron documents `webContents.debugger` as a main-process API and
`--remote-debugging-port` as enabling an HTTP debugging endpoint. Those are
possible future integration mechanisms, not capabilities exposed by the
reviewed extension or evidence of an existing endpoint.
[Electron Debugger](https://www.electronjs.org/docs/latest/api/debugger),
[Electron remote-debugging switch](https://www.electronjs.org/docs/latest/api/command-line-switches#--remote-debugging-portport).

A future diagnostic adapter first needs a reviewed transport bound to the
original retained process, exact PCB frame and original project worker. It must
admit script bytes and execution contexts, expose only fixed reads, refuse
unavailable or optimized-away bindings, and retain cleanup ownership through
detach or failure. Any pause needs an owned resume path. Opening an unrestricted
debug port or accepting caller expressions is not an implementation of those
requirements. Even successful debugger reads would still need complete native
membership, all Save participants, pending producer state and an interval proof
covering eligibility through the one-shot create. The later original-generation
closure and full-SQL proof remain separate.

No supported complete observer was found among these reviewed paths. This does
not establish that every integration is impossible. The batch adds these
findings only: no debugger activation, transport expansion, inert observer
module, writer registration or guard relaxation. No tests were needed for this
documentation-only change.
