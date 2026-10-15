# Current owned symbol preparation research

## Result and scope

The current-version opener can supply an internal, original-object-owned
preparation for a closed ordinary project symbol. The implemented step collects
fresh metadata and checks the complete tab registry plus the current top-level
editor DOM, then passes an explicit metadata projection to the existing
checkpoint preparer. It does not dispatch a modifier, qualify a post-opening
closed-file baseline, establish a worker lock, or enable a writer.

This review read installed source as inert text, the existing repository
implementation, and the official contracts below. The only machine-profile
field used was the existing `easyeda.assetsRoot` selector. No project, license,
user database or production content was read; no installed source was executed
and no live call, process launch, navigation, Save or edit was performed.

## Source identities

Paths below are relative to the selected installed `resources/app/` directory.
All offsets are zero-based UTF-16 JavaScript string offsets, not byte offsets.
The source bytes were SHA-256 checked on 2026-10-15. The WS identity is retained
for the unresolved clock work; this review did not qualify its producer chain.

| Key | Relative path | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| APP | `app.js` | 2657192 | `52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c` |
| UI | `assets/pro-ui/3.2.196.26ed3d6c/js/ui.js` | 17456671 | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` |
| MGR | `assets/pro-mgr/3.2.184.355087e9/js/pro-mgr.js` | 2196400 | `005584e02cd9b2d49fdb387b2f997c1c8d3f88b0c48a7531c8097c483ed0bd2e` |
| WORKER | `assets/pro-mgr/3.2.184.355087e9/js/project-worker.js` | 2181284 | `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928` |
| WS | `assets/pro-mgr/3.2.184.355087e9/js/ws-service.js` | 855142 | `7a372d7271225999c3d16bcef1cd91c0fa2d3a1a402ebcf9761442ecf3187453` |

These identities are the package `3.2.206.715d940d` / editor `3.2.206` tuple
already recorded in the [current writer review](current-writer-completion-research-2026-10-15.md).
They do not authorize replacing the older closed-symbol writer's pins.

## Fixed client and ticket observations

| Source offsets | Reviewed path |
| --- | --- |
| MGR 683298 / 683103 | Fixed topics `/PrjDB/project/getClient` and `/PrjDB/project/getMaxTicket`. |
| MGR 2056362 / 2055830 | The handlers select `K(projectUuid)`, call the corresponding project method, and return its result. |
| MGR 1787848 | `K` reads the existing project registry and throws if absent. An explicit argument avoids its default-current-project branch. |
| MGR 1761945 / 1762468 | Both wrappers require the existing project to be ready and call the worker's fixed public method with no payload. |
| WORKER 2160141 / 2161696 | Worker registrations route to project `getClient` / `getMaxTicket`. |
| WORKER 2144898 / 2130017 | The project methods return the consistency-manager scalar in a success envelope. |
| WORKER 243228 / 242716 | Scalar getters return `this.client` and `this.maxTicket`; these branches neither open nor mutate a project. |

The fixed renderer RPCs can therefore support bounded client/ticket
observations. They do not expose the actual Worker object or prove its lifetime
is locked across awaits. MGR 1782503 creates the project worker and its
project-specific namespace; the retained original opening generation must own
that lifecycle. A future fixed witness should require the explicit project,
unchanged authenticated session/generation/receiver, a bounded client string,
safe integer ticket, and matching before/after samples. A scalar response or
caller-supplied DTO must not become worker authority. These additional reads
are not yet in the implemented closed-target collector.

## Current symbol header and actor producers

WORKER 1937501 contains the narrow `updateString` / `updateData` path. The
metadata update reads the loaded symbol, changes supplied properties, obtains
native time, sets `version` to its string unless `keepVersion` is selected,
constructs DOCHEAD and META, then awaits `uploadLocal`. The proposed exact
name/description compiler must keep rename-key and keep-version options fixed;
it must not expose this native payload as a generic caller RPC. MGR 2066684
routes the symbol update through the explicit project; MGR 1759617 performs
the ready-worker forwarding.

The DOCHEAD ticket is the current maximum plus one. The `newTicket` getter in
Pi at WORKER 1856195 increments that same consistency maximum for META.
`metaData` at WORKER 661091 serializes fields in this order: title, description,
tags, docType, source. `xt` at WORKER 241441 emits docType/client/uuid, time and
version, current `self.PRO_EDITOR_VERSION` as editVersion when no explicit
override is given, and a user field only when the supplied user is truthy.
APP 2578842 / 2579343 injects that current editor version into worker and page
environments. Thus a current native edit emits `3.2.206`; it does not necessarily
preserve an older baseline header's editVersion. The existing planner's
before-header equality cannot silently stand in for this producer behavior.

The constructor order explains a separate DOCHEAD actor detail:

1. WORKER 2011459 creates Gd without setting `user`.
2. Lg calls that constructor at 2103240 and constructs its symbol child at
   2105292.
3. Pi at 1856195 copies the parent's current client and user into the child.
4. Project `subscribe` at 2115300 later assigns the project's user from the
   fixed `/pro-ui/loginUser/get` RPC. The reviewed symbol/Pi path contains no
   later assignment that updates the child's copied user.

The source-derived conclusion is an omitted DOCHEAD user for this genuine
fresh-construction path. It is not proof for an arbitrary existing worker,
reconstructed generation or caller-provided observation.

Backend EDIT_HEAD has a different producer. APP `rC` at 2573782 obtains the
license result once and retains it in its middleware closure. `eC` at 2574653
looks up the system user by that username, can insert a missing user, and sets
the request user. `T0.login` at 2220292 selects UUID/username/nickname. APP
`L3` at 2602467 reads the matching user row in the target database, falling back
to empty names, and constructs EDIT_HEAD with the request user's UUID and
`Date.now()`. `PB` at 2602357 prepends it; `createProjectHistory` at 2604081
uses this branch before saving project history. DOCHEAD and EDIT_HEAD actors
must not be conflated.

UI's ordinary startup user fetch is `zZt` at 16470169. It invokes
`tn.setUserInfo` (16478841) to project UUID/username/nickname into the global
cache, and assigns the returned object to `loginedUserInfo` at 16471483. The
fixed login-user RPC at 16957385 projects the latter object. This suggests a
future fresh-generation actor contract that retains and compares both UI
objects against the startup provenance, rather than accepting an arbitrary
UUID. It is not implemented actor proof. Do not add `/api/user` as a supposedly
pure probe: APP 2478354 also parses preferences and obtains a distinct ID, and
the shared middleware can perform the user bookkeeping just described.

## Closed-target DOM contract

Registry absence alone misses hidden, pooled and export editors. The current
source has these concrete producers:

| UI offsets | Producer / implication |
| --- | --- |
| 51808; surrounding template 51740–53550 | `tabbar_bodies` has five static DIV children: commandWin, exitSmartSizeTool, exitPadShapeTool, project-blank-page, assembly-variant-page. |
| 15246203; creation near 15246680 | MO appends a UUID-bearing `tabbar-panel ruler-theme` body. Symbol/schematic editors can be DIV.editframe rather than iframes; ordinary PCB uses IFRAME.editframe. |
| 15241100–15243150; marker 15242986 | Direct PCB construction uses MO and adds `pcb-canvas`; this path does not need the panel pool. |
| 15250016 / 15250392 | err/O8o can create hidden pooled editors with `blankIframe` and `blankIframeDiv`; the current pool list includes panel. |
| 16485651 / 16486904–16487446 | Export creates an anonymous hidden DIV with an iframe.editframe and a `frame_export_` ID. It need not have a normal UUID-bearing body. |
| 15950873 / 15952457 | Close removes the registry entry before DOM teardown, so an empty registry entry is not sufficient absence evidence. |

The implemented internal branch therefore admits only one exact current
companion PCB: the five static DIVs plus its retained active body, exactly that
iframe throughout the document, and exactly that element in the global editor
marker union. It rejects extra DIV-based editors, exports, pools, unmarked
iframes even outside tabbar_bodies, unknown static children and changed
element/method ownership. Registry, URL, frame/native identity and DOM checks
repeat around awaited reads. The bounded claim is absence of another editor
in this sampled current top-level DOM and registry, not absence in every
process or an atomic exclusion of A-to-B-to-A changes.

Implementation is in
[the fixed DOM fragment](../plugins/easyeda-pro-control/server/src/current-symbol-closed-target-dom.ts),
[the internal compiler branch](../plugins/easyeda-pro-control/server/src/current-symbol-metadata-program.ts),
[its strict result/projection](../plugins/easyeda-pro-control/server/src/current-symbol-closed-target.ts)
and [runtime collector](../plugins/easyeda-pro-control/server/src/current-symbol-closed-target-runtime.ts).
The public metadata reader retains its narrower semantics; converting the
internal witness to its core DTO explicitly resets `hiddenEditorsVerified` to
false. The internal result leaves worker, persistence, source-membership and
CAD authority flags false. The collector reuses exact implementation checks
before/after its sole fixed execute and the settled-reply/fingerprint guards.

The [owned preparation](../plugins/easyeda-pro-control/server/src/current-symbol-owned-preparation.ts)
consumes the collector under the retained opener's authenticated scope. It
rejects a caller observation projection, binds the exact project/branch and
different target symbol, invokes the actual checkpoint preparer, and issues
only an original-object-bound preparation. `postOpeningBaselineVerified`,
`writerReady` and `executionAuthorized` remain false. Synthetic tests exercise
the real generated branch and refusal paths; they are not connected validation.

## Official contracts and remaining implementation

The official [symbol getter](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_symbol.get.html)
is beta and accepts an optional library identity. The fixed project-local
metadata route is narrower than that general contract. The official
[modifier](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_symbol.modify.html)
is also beta and returns a success boolean; its documentation does not promise
a worker lock, structure drain, actor binding or closed-file SQL comparison.
These official pages were checked on 2026-10-15.

The official [project opener](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_project.openproject.html)
warns that switching can lose unsaved changes. The official
[document opener](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_editorcontrol.opendocument.html)
returns a tab ID or undefined, not completed initialization or durable storage
proof. The installed ordinary-open effects are recorded in the
[current opener review](current-disposable-open-research-2026-10-14.md); the new
preparation does not turn its pre-navigation checkpoint into a post-open baseline.

The next bounded writer work remains:

1. Implement fixed current client/ticket observations and the fresh-generation
   actor contract above. Qualify native time: WORKER `qe` at 1711153 calls
   `/pro-mgr/serverTime/now` over the notify bus. Review and pin the current
   manager/WS clock producer and bounds before using its values in SQL plans;
   the current opener verifier does not by itself qualify WS. Backend
   EDIT_HEAD's separate wall clock also needs an explicit bounded contract.
2. Bind a genuine post-opening closed-session capture, retained normal-close
   proof and closed-file copy to this operation. Reuse the maintained
   engine capture, Windows termination, closed-copy and full SQL inventory
   APIs; do not fabricate their original-object receipts from JSON or adopt a
   PID after restart. Prove any subsequent reopening effects before using that
   closed copy as the before-write SQL baseline.
3. Model current DOCHEAD/META/EDIT_HEAD effects explicitly, including the
   editVersion transition. Keep the existing full SQL comparison strict;
   either constrain the baseline editVersion to current or add a separately
   reviewed current-version projection. Do not relax the legacy comparator.
4. Integrate the narrow modifier with owned termination, complete source/SQL
   comparison and fresh-generation readback. WORKER uploadLocal at 2031178
   schedules work; it is not a durable settlement barrier. The unresolved
   structure queue and upload-cache behavior in the
   [writer completion review](current-writer-completion-research-2026-10-15.md)
   still require termination plus independent verification. Then run one
   disposable name/description lifecycle and requested-field inverse, preserving
   any ambiguous attempt without replay.

Nothing in this note enables the legacy writer, asserts that these remaining
steps passed, or authorizes a production design change.
