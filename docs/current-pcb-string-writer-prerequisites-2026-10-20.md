# PCB String writer prerequisites after 105401

## Recommendation

This batch implements a fixed interaction and secondary-index observation,
composed into the existing root census request. It describes the active tool
chain, selection, partition index and selected pending interaction work.
It returns valid nonempty observations. A separate empty-fixture predicate and
writer lifecycle remain to be implemented.

The subsequent pure predicate is now implemented as described below. The owned
writer lifecycle and complete baseline remain unfinished.

Do not postpone the empty-board String writer for populated Image, Dimension,
polygon-Pad or routing geometry readers. A complete empty-root exclusion can
reject those objects without decoding their geometry. Conversely, the current
root census cannot establish that exclusion by itself. Partition views and
active editing tools can survive outside its maps.

The writer also still needs a retained lifecycle that joins renderer evidence
to the original project worker, consumes one create and Save intent, and proves
the complete closed/reopened effect. That is implementation work, not another
test of the existing candidate. No such lifecycle is registered in 105401.

## Evidence and source pins

This review read installed application JavaScript as inert text. It made no
live MCP/native calls, executed no vendor code and accessed no design file.
All `PCB@N` locations below are zero-based UTF-16 offsets in:

`C:\Program Files\easyeda-pro\resources\app\assets\pro-pcb\3.2.193.682ed44e\js\pcb.js`

- 10,976,299 bytes, 10,976,278 UTF-16 code units.
- Independently checked SHA-256:
  `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33`.

The official [`PCB_PrimitiveString.create`](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivestring.create.html)
and [`PCB_Document.save`](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_document.save.html)
pages were checked on 2026-10-20. They describe public requests and returns,
not the private tool, compiler or durable SQL state discussed here. The pinned
installed producer is the source for those implementation claims.

Maintained code inspected includes `current-pcb-string-create.ts`,
`current-pcb-string-create-program.ts`, `current-pcb-string-create-observation.ts`,
`current-pcb-string-publication.ts`, `current-pcb-string-save-prerequisites.ts`
and the diagnostic model, pending, raw-String, root and worker programs under
`plugins/easyeda-pro-control/server/src/`.

## What is already implemented

| Requirement | Existing implementation | What it does not establish |
| --- | --- | --- |
| Exact first-String input and expected body | Create candidate fixes all 13 native arguments and the ordered 19-field STRING body | Native ID, actual dispatch or persistence |
| One native call and retained acknowledgment | Dormant create program binds the exact iframe/RPC, attempts create once and retains its ID before later checks | Registered ownership, durable one-attempt intent, full raw baseline or Save |
| Raw String scalars and ownership fields | Diagnostic raw-String sample reads the actual `bo.map`, including watcherless models, raw color, parent, partition, group, type and z-index markers | Other model families or correlation to stored records |
| Persistent-root census | 105401 counts 17 managers, BOARD, panelization and three spatial-index branches | Secondary indexes, tools, exact full source or future work |
| Compiler and known producer snapshots | Existing samples inspect main/custom-footprint compilers, shared upload buffers, command state, teardrop state and local copper-worker references | All callback state, backend association or completion |
| One-String publication relation | Offline model checks the exact expected record, ticket, token, client and origin document | Original publication capture, delivery or backend ownership |
| Conservative pre-create Save exclusions | Offline prerequisite model excludes existing shared history, uploads, workers and custom-footprint participants | Post-create eligibility or a native Save attempt |
| Project-worker counters | A separate diagnostic branch reads pinned worker state and identity | A joined renderer/worker lifecycle; the current PCB and worker branches are exclusive |

These are substantial reusable pieces. The missing work is their owned
composition and a few concrete observations, not another implementation of the
STRING encoder. The raw-String sample already closes the former DTO-only
z-index/partition/group/color gap for its parentless subset. Its source-ownership
and complete-baseline flags correctly remain false.

## The actual idle tool state

The idle chain is not a null tool and not a direct reference to the selection
manager:

```text
$0 : Lpe
  nextTool -> m0e
    nextTool -> Eh
      methods delegate selection operations to Fe : XU
```

`Lpe` at `PCB@8299453` owns `nextTool`, `mouseRightDownTimer` and
`mouseDownStatus`. `$0` is created at `PCB@8930258`; ordinary initialization
constructs `m0e`, then `efe`. `m0e` at `PCB@8586102` owns its own `nextTool`,
mouse-state flags, wheel timeout and transient geometry. `efe.initDropDrag`
at `PCB@8865037` constructs `Eh`, sets `co` and `Xo` to `Fe`, sets
`Pi.scene` to `[3]`, and sets `Pi._dropDrag` to true. `Eh` at
`PCB@7556778` delegates editing interactions to `Fe`.

The generic chain parent `kF` at `PCB@4618206` initializes `nextTool:null`;
`Fo` at `PCB@4618384` adds `drawing:false` and an empty `filterItems` Set.
Consequently, a first empty fixture can require the exact three prototypes,
`Eh.nextTool === null`, no drawing/filter items, and the source-defined idle
selection relation. It must not call `interrupt`, `clear`, `setNextTool` or
`getCanUndo` to produce or recognize that state.

The observer should distinguish missing, undefined, null and present fields.
It should return only bounded fixed labels/counts and reference-equality
witnesses, not tool payloads or design text. Check original prototypes and own
data descriptors, retain references and recheck them before return, as the
existing root observer does.

### Additional interaction owners worth including

| Owner | Fixed raw fields | Why it matters |
| --- | --- | --- |
| `Fe`, `XU` at `7816267`, alias at `7885494`, instance at `7886864` | `items`, `selections`, `components`, `tracks`, `lines`, `currentPointSelectedItems`, `selectAnnotations`, `drcItems`, mouse/drag/copy flags and optional `_dialog` | Retains selected objects independently of ordinary family counts |
| `Sr`, `fpe` at `8145376` | `_model`, `control`, `lockedLayers`, `mouseMoveCheck`, `mouseAltDown`, `hasAlt` | A retained point controller can edit on the next input |
| `dl`, `Spe` at `8222053`; `Yr`, `Ume` at `10150535`; `ru`, `cge` at `10259095` | Each `tool` reference | Routing/drawing controllers remain reachable outside `$0.nextTool` |
| `cm`, `P1e` at `10791258` | `moveTool`, `_flipping` | Component flipping can await work and later install a move tool |
| `Cy`, `c7` at `8390631` | Optional static `instance`; `activeToolHistory`, `activeToolId` | Polygon-pad tool history is separate from `Xe` |
| `nu`, `mge` at `10281157` | `_type`, `isUnmounted`, `_ui2PCBAboutAttrDataUpdateTimer` | A scheduled attribute callback invokes wire/paste/tool handlers |
| `Us`, `tge` at `10202331` | `_control`, `dimension`, start/end references and spot arrays, `_historyItems`, `command` and `initCommandFromOutside` | Smart-dimension work has a separate composite command before `Xe` |
| `Xo`, `Sy` at `10179499`, aliased by `$me` at `10187470` | `currTool`, `items`, `_flipQueue`, `_onSettleCallbacks`, `_isProcessingFlip` | Turn commands can await earlier flips and invoke later queued callbacks |
| `Pi`, `Kme` at `10187481` | `scene`, `_dropDrag`, `_currentCanUndoTool`, `needHistoryTool`, `overrideAction` | Cross-checks tool state; scene alone proves only a mode |

Do not interpret a timer ID as proof of a live timer. In particular,
`nu`'s callback does not reset its timer field on completion.
`exit()` at `PCB@10285195` clears it, but the observer must not call `exit`.
Return the marker; use a conservative never-used-tool predicate for the first
fixture. Similarly, `Us.command` exists in the constructor as an empty `De`.
Requiring a null command would reject a valid fresh editor.

This observation is bounded and implementable with the same retained Save
scope used by 105401. Missing or optimized-away bindings remain a refusal.
Source reachability does not prove their availability in the live V8 scope.

## Secondary roots: prioritize state that can affect the write

The most important omission is `Nn.manager.items`, the partition view index
at `PCB@4376220`. `St.checkIsCanEditByPoint` at `PCB@4369057` and
`De.checkItemsAreCanEdit` in `PCB@7916638` consume that index. A String can pass
initial construction, then have its command filtered and undone. Empty polygon
manager counts are not enough to conclude the partition index is empty.

Include these count-only secondary checks in the same observation:

- `zo.manager.layerMapSet` at `PCB@4131362` and `Wn.layerMapSet` at
  `PCB@9089798`. They are plain dictionaries of Sets, not Maps. Count nested
  members and distinguish empty retained layer keys from live members.
- Ratline model/view `map` and `idMap` on `MI.manager` and `jo`, at
  `PCB@3917595` and `PCB@8149267`.
- `Hb.manager.map` and `updateIds` at `PCB@7813000`, plus the independent
  Smart Dimension and group view Maps `Yh.map` and `Ft.map`.
- `ze.map` and `noneNetMap` at `PCB@7963914`. Count nested Sets; outer keys can
  remain without model entries. Include `ze.debounce`'s `animationFrameId`
  marker if claiming pending network-notification coverage.

Do not turn every rendering cache into a write blocker without tracing its
effect. `Ro`, `lSe` at `PCB@3856806`, drains render lists/layers/view-group
changes into presenters. Its nonempty queues matter to a visual-settled claim,
but do not themselves establish a pending source upload. DRC display caches
likewise need explicit treatment for a complete visual census, not a fabricated
claim that every display object will be saved as PCB geometry. The initial
writer can retain narrow exclusions and document them instead of implementing
all populated geometry.

## Pending work that actually blocks a writer

### Text-specific native path is small

`string-create` at `PCB@10393687` creates one String and one `De`.
`G6` at `PCB@4735547` uploads its STRING through the compiler. Unlike the
adjacent track command, its constructor does not enqueue a teardrop modification.
`De.refresh` only publishes the special 3D-shell refresh for an `e1` command,
which this text command is not.

The general command manager still publishes `flushTearDrop`, uploads shared
buffers and sends an extension primitive event at `PCB@7922234`.
`Sfe.flushService` at `PCB@9092135` schedules a callback even with empty Sets;
its removal phase calls `Xe.increaseUpload`. With an originally empty
`waitingUploadStack` and shared BOARD/POURED/INNER buffers, the expected
text-only callback has no additional geometry to upload. Encode and verify
that post-create relation. Do not require every post-create queue/history field
to remain at its pre-create empty value, since creation intentionally changes
them.

### Some delayed producers are not fields in the existing census

`eL` at `PCB@7885827` retains a private timer, selected items and a command
builder inside an IIFE. Its 200 ms callback can finish and execute moves,
check outlines, and publish `autoFill` and `flushService`. An idle visible
tool chain later in time does not prove that this closure is empty. A future
writer must exclude that history through an owned fresh/no-interaction path,
or add a narrowly source/location-admitted read of this one closure. Do not
claim all timers are observed after reading only the visible tool fields.

The separate compiler channel at `PCB@3133961` can publish pending changes
from every registered compiler, ordered by head type. Existing observation
proves the selected compiler is in its registry, but does not inventory all
registry families or observe the channel's `_locker`, `_temporaryUnlock`
and `isPull` state. A writable preflight must account for that registry and
the original project worker, not only the main compiler's cache.

### Durable completion needs a lifecycle, not more stable polls

The current diagnostic worker and PCB branches are mutually exclusive.
Their observations cannot be combined across two application generations as
one writer baseline. The next writer owner needs both original associations,
or a deliberately narrower source-proved lifecycle that does not make that
association claim.

The existing SCH implementation provides a useful completion pattern:
original-generation termination, exact complete closed SQL, replay-cache
exclusion, fresh readback, final normal closure and a second SQL comparison.
That can prove the final durable result without falsely claiming an individual
debounce callback was observed completing. It does not excuse unknown
pre-dispatch mutations, shared Save participants or external subscribers.

For the String route, implement and review the exact full-SQL effect and
saved-source relation before enabling the dormant create program. Record
failure/ambiguity after native dispatch without offering retry. There is no
reviewed general inverse for this new route.

## Bounded implementation sequence

1. Fold a fixed interaction/secondary section into the existing root census
   function, preserving the original callback, source/context checks and
   effect-checking settings. The current full path uses all 64 requests; a
   fifth separate sample does not fit. Compute new output/descriptor bounds
   from the fixed fields instead of increasing the transport limits.
2. Add a separate pure first-fixture predicate that consumes original-owned
   samples and returns named unmet conditions. Accept source-defined idle
   `Eh` and empty `Us.command`; do not manufacture eligibility by clearing state.
   This predicate still must not issue a writer token until source, producer and
   lifecycle evidence are joined.
3. Implement the one-String post-create effect relation and full-SQL lifecycle
   alongside the observation. Reuse the existing candidate, raw String and
   publication models. Add current-worker association and exactly one Save
   intent in that owner; do not repurpose the read-only diagnostic journal.
4. Qualify one disposable create/save/normal-close/fresh-reopen case and the
   actual visual result. Batch fixes discovered in that case with the
   implementation before another release.

Focused regressions should cover the source-defined idle chain, a retained
partition view with empty raw family counts, a nonempty separate smart command,
latent-timer markers, old secondary references, malformed own descriptors and
the unchanged request budget. Re-running the entire old release suite does
not close these implementation gaps.

## Implemented observation and focused verification

`current-pcb-diagnostic-interaction.ts` exports a fixed internal fragment and
its strict JSON schema. `current-pcb-diagnostic-root-inventory.ts` executes that
fragment within its existing synchronous sample, using the same original
Save callback, retained own-descriptor checks and aggregate collection budget.
It creates no extra CDP request or object handle. All complete-membership,
active-tool-coverage, secondary-index-coverage, queue, Save and writer authority
flags stay false.

The implemented subset includes:

- Exact `Lpe` root with classified `m0e`/`Eh` chain. Other active tool classes
  remain explicit `other` observations, without reading their arbitrary state.
  Missing, undefined and null references stay distinct. Boolean flags remain
  booleans; false or negative-zero timer/reference substitutions refuse.
- Selection collection counts and edit flags; point, drawing, routing,
  attribute and component-flip controllers; separate tool history and smart
  command counts; turn queue/callback counts.
- Partition views, raw and view Inner layer Sets, retained Line indexes, and
  the independent Smart Dimension and group view Maps.

This does not implement ratline/network index inspection, DRC/display queues,
the `eL` closure, all private tool state or complete source correlation.
The Pi subset reads scene, drop-drag and history-tool membership, not every
mode override. A null/zero observation is not a completion claim.
`nu` and wheel/right-button timers report presence markers only, not whether
their retained IDs still refer to pending browser tasks.

The canonical interaction reply is 1,756 bytes. The complete root function is
19,842 UTF-8 bytes with SHA-256
`c17ab3b3da88f96407c4a0b980a1c6eef6f34f87fd3867643f26ca0f4912204a`.
The existing 8 KiB root-result, 65,536-entry aggregate, 128-tree,
64-depth and 528,384-descriptor limits are unchanged. The decoder independently
recomputes each new collection contribution and adds it to the original root
budget; new fields do not get a separate allowance.

Thirteen focused tests passed on pinned Node 24.18.0 with the test-isolation
preload. They include the real Node inspector's effect-checked execution of
the self-authored synthetic graph, and rejection of a mutating Proxy without
running its trap. Targeted strict type-aware lint is clean. Full plugin
typecheck passed. No installed EasyEDA qualification, native transport,
generated bundle, compatibility refresh or release is claimed by this work.

## Supplied first-fixture predicate

`current-pcb-string-empty-baseline.ts` now composes the four existing diagnostic
reply decoders. It checks 47 named conditions for a caller-supplied PCB identity.
The result names each unmet condition, allowing a future owner to distinguish a
nonempty model family, an unavailable manager, active interaction work or queued
compiler work without executing a cleanup action.

The predicate checks:

- Equal document identities across root, compiler, pending-producer and raw
  String replies; equal duplicated String count and dynamic-copper markers.
- Seventeen observed empty family maps, absent BOARD geometry, disabled empty
  panelization and empty spatial membership. Retained empty tree/layer keys are
  permitted, but pending change/dead entries or tree discrepancies are not.
- The source-defined `Lpe` → `m0e` → `Eh` idle chain, selection mode and empty
  selection, tool/controller work, the existing empty smart command and turn
  callbacks. A present timer marker fails the condition even if its original
  timer might have completed.
- Observed empty partition and retained-line indexes, reciprocal Inner manager/
  view association, and empty dimension/group views.
- Ready compiler state with no pending data, loaded footprints, dynamic-copper
  participant, shared uploads, existing command history or observed worker work.

An absent, undefined or null manager marker does not count as an observed empty
map. Optional references retain their distinct raw marker in the observation
digest. Malformed, missing or unknown fields refuse through the original strict
decoders; valid nonempty observations return unmet conditions. This is a
pre-create predicate only. A later create is expected to change command history
and compiler queues, so this result is not a post-create Save predicate.

Even when every supplied condition matches, eight residual prerequisites remain
explicit: original renderer/worker association; complete stored source/history/
assets; ratline and network secondary indexes; the latent `eL` closure or an owned
fresh no-interaction lifecycle; complete compiler-channel registry/lock state;
startup and extension subscribers; one-shot create membership/publication; and
one-shot Save with closed SQL, fresh reopening and visual proof. All original
scope, complete baseline, empty-root, queue-completion, Save, writer and execution
authority flags remain false. Matching supplied non-atomic samples creates no
live authority.

Six focused synthetic tests pass on pinned Node 24.18.0. They cover the valid
idle chain and smart command, hidden secondary work, unavailable managers,
timer-marker preservation, identity conflicts, compiler/history exclusions and
malformed or hostile envelopes. Strict type-aware lint and full typecheck pass.
No live transport, runtime registration, compatibility pin or generated bundle
was changed by this predicate work.
