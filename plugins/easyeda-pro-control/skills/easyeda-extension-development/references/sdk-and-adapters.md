# SDK and adapter engineering

## Version and interface discovery

Identify EasyEDA Pro versus Standard first. Pro exposes instantiated namespaces
on each extension's own `eda` object. Look up the mounted instance name, not only
its uppercase declaration class. An installed union mount can expose distinct
component classes; preserve those alternatives and overloads in the research.
Do not merge every method/return field into one guessed object. [Pro invocation](https://prodocs.easyeda.com/en/api/guide/invoke-apis.html).

Record application version, public declaration version/hash and implementation
bundle/hash independently. The npm package with the same numeric version can
differ from an installed suffixed build. Official patch releases can correct
types independently of application changes. [Version policy](https://prodocs.easyeda.com/en/api/guide/stability.html).

Use the offline catalog to narrow the search, then inspect parameter types,
enum values, native units, nullable/default behavior and returned promise. Latest
`sys_Help` can provide method/type details, but the reviewed 0.2.53 installation
has no such mount. New `sys_ExternalApi` registrations are another trust boundary,
not permission to run another extension's code. [Help reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_help.help.html),
[external API reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_externalapi.html).

## Package and runtime

`extension.json` binds UUID, entrypoint, activation events, editor compatibility,
menus and dependencies. An SDK-built `.eext` is an import artifact; neither its
manifest nor import acknowledgment proves runtime activation or authentication.
External interaction is an explicit permission concern. Keep bridge keys and
generated private archives outside the repository; do not use broad CORS,
adjacent-port fallback or raw-secret transport from a demo. [Manifest reference](https://prodocs.easyeda.com/en/api/guide/extension-json.html),
[official external integration example](https://github.com/easyeda/eext-external-tool-integration-demo).

Pro's extension environment is not unrestricted Node or DOM. Use supplied
system/file/network APIs, package resources and documented inline-frame support.
Review these calls for data disclosure and lifecycle effects. A standalone
script has a throw-away extension context and lacks some packaged capabilities;
it is not a substitute for this plugin's authenticated executor. [Initialization guide](https://prodocs.easyeda.com/en/api/guide/how-to-start-for-ai.html),
[inline-frame guide](https://prodocs.easyeda.com/en/api/guide/inline-frame.html).

Keep method receivers when wrappers depend on `this`; test callback positions,
protocol arguments and timer cancellation. Await the actual queued native action,
not just a wrapper that returns before its `done()` callback. Isolate errors at
the protocol boundary without swallowing native failures or printing private
source/credentials. Main-thread computations must yield cooperatively while
retaining exact context/source checks; never relax the checks for speed.

An awaited current-document getter and a later current-document setter can
select different PCB frames. Capture the exact ordinary iframe and its native
receiver first; after each await, synchronously recheck the sealed project,
branch, tab, frame and writable state before using that captured receiver.
Pin both the UI frame registry and native PCB implementation. Check stack
changes before their first physical-layer mutation, not only inside a later
source merge. Receiver binding is not an atomic source compare-and-swap;
independent post-effect and durable proofs remain necessary.

For read-only current PCB layers, the separately pinned `pcb_layers` route
uses that native receiver pattern and declares `native-task-equivalent`.
The public layer getter chooses its active frame after an asynchronous API/UI
hop; binding `this` cannot fix its routing. Preserve native SIGNAL/PLANE types
when deriving copper count, since the public mapper also maps TOP/BOTTOM to
SIGNAL. Native color strings are not guaranteed valid CSS. Local project UUIDs
may be 64-character path hashes; do not invent a 32-character-only contract.

Current ordinary `openDocument` also performs partition cleanup/title updates
and may invoke native Save. A new-version disposable opener must disclose
those effects and retain one-shot navigation intent; it cannot inherit an
older tuple's no-Save or unchanged-database promise from the method name.

Large journal directories can defeat a cache that evicts the oldest entry for
every new scan result. Test more entries than the cache cap. Preserve useful
resident entries when declining a new admission, but still rehash current journal
and artifact bytes on every use. File size, timestamps and an open descriptor do
not prove that file contents stayed unchanged. Synthetic cache improvements
must not be reported as measured connected latency improvements.

## Narrow execution contract

Match inspector descriptors to the embedded engine as well as the application
source. V8 builds can move legacy function properties between the function and
its prototype without changing the function's JavaScript. The209 debounce
profile has three own properties; the older profile has five. Keep each exact
contract and retain source/location checks. A test running on the facade's
pinned Node version does not establish the embedded browser's property roster.

For data-only input capture, reject proxies before reflection and check scalar
types before passing them to schema validation. Even error formatting can
inspect a rejected object's prototype. Keep source-content limits separate from
small clock-packet limits so valid large drawings are not rejected accidentally.

Use literal action discriminators, bounded strings/arrays/numbers, strict nested
objects and explicit units. Preserve native empty-string versus null semantics.
Validate compound refinements with the exact parser; JSON Schema alone omits
some constraints. Bound responses and transfer complete large evidence through
managed artifacts with hashes, receipts and pagination.

For reads, require double-sampled complete results and reject truncation,
placeholder/depth-limit markers and session changes. For edits, enumerate exact
records and electrical consequences before dispatch. A returned ID is not proof;
compare native source, connected endpoints and the complete durable selected
branch. Creation IDs belong to the original journal. Existing descendants,
library templates and inherited instances need explicit scope.

Trace navigation through native event subscribers, not only its public wrapper.
The pinned PCB/footprint tab-click handler may persist global preferences and
prune local backups. Project opening can restore tabs; closing an active symbol
or schematic can activate a PCB peer. Refuse known unsafe state before Save,
close or open, and recheck immediately after awaited work. A passive check is
not an atomic guarantee across native awaits. Do not implement a bypass by
toggling preferences, suppressing persistence or updating only part of the
private active-frame state. A lower-level route must prove the entire lifecycle.

Public API stubs or lossy mappers can justify a reviewed, version-pinned native
adapter—not arbitrary private invocation. Preserve unknown fields, parent/child
order, hidden attributes and locks. Geometric contact is not native connectivity.
Define unsupported shapes up front. If a general inverse cannot preserve exact
identity, say it is unavailable; do not advertise automatic rollback.

Review full-load and incremental decode separately. The pinned PCB text decoder
is instantiated per record during source merge but reused by record type during
reopen. Its clear method leaves specialColor intact, and a null input does not
assign that field. A null STRING following a black STRING therefore reloads as
black despite correct stored null. A single-record constructor test misses this
bug. Test mixed ordered records through both lifecycles, preserve the raw order,
and never turn one observed conversion into global null/color equivalence.

On current PCB bundle `217199c8`, native `string-modify` assigns layer, reverse,
mirror and lock even when omitted. An x/y/text-only payload is unsafe: reconstruct
the four mandatory fields from an independently verified full STRING baseline.
Leave unchanged optional font, rotation and geometry arguments absent. Rebuilding
them from rounded source can change higher-precision native values. Preserve all
nonpatch fields independently. Current String readers include key/show state,
positionIsNull and serialized silkColor, but still omit zIndex, partition/group,
model type and source ownership. Their color serializer collapses an empty string
to null; it is not a raw-model color proof. These DTOs cannot supply the complete
writer baseline. Do not revive the older decoder writer to fill this gap.

The offline `current-pcb-string-patch.ts` candidate models x/y/text changes against
supplied source and expanded native scalars. Its initial subset is unlocked,
parentless default-font silkscreen text with printable ASCII. The view's effective
coordinate threshold is `1e-8` internal units, stricter than the handler's `1e-10`.
Text setters can change font/type for unsupported glyphs. Candidate projections
preserve headers and unknown fields only for comparison; they are neither native
uploads nor saved-source predictions. No observer, dispatch or provenance comes
from matching caller-supplied data.

For a new object, `current-pcb-string-create.ts` separately fixes all 13 native
create arguments and predicts the exact ordered 19-field STRING body. Its subset
uses 10-mil grid coordinates, default-font printable ASCII, fixed layer3/font120/
width8 and zero expansion. Native create generates the ID; numeric model `type:0`
is distinct from `modelType:"Text"`, and default silkscreen color is explicit
black, not null. The candidate supplies no ID, header, ticket or dispatch token.
It does not establish an empty root PCB, parent/partition/group state, queue
isolation, original frame ownership or persistence. Keep those as prerequisites
of a separate one-shot lifecycle, not facts inferred from its predicted body.
Empty DTO families do not prove an empty canvas: several object families are not
projected. Create can return an ID even when command filtering undoes the object;
require exact native membership readback. The command also publishes extension
events. Before enabling Save, account for `pcb/saveCompiler` saving every loaded
custom footprint and any dynamic-copper worker, not just the requested String.
The separate dormant create program fixes the exact frame/RPC and retains an
acknowledged ID through readback failure. It is exercised only in synthetic VMs,
has no runtime registration or durable replay protection, and must not be invoked
on EasyEDA before the remaining owner, eligibility, Save and reopen checks exist.

Reuse the two pure compositions before adding that lifecycle.
`current-pcb-string-empty-baseline.ts` decodes the four diagnostic replies and
reports 47 supplied first-fixture conditions with eight residual prerequisites.
Missing managers remain unmet, and the source-defined idle chain and empty
smart command are not replaced by null assumptions.
`current-pcb-string-postcreate.ts` joins original candidate/create/publication
plans, a supplied completed acknowledgment, exact raw zero-to-one String
samples and the one-record publication. It checks birth markers, raw scalars,
color, document and ID together. The default-font box is separately predicted
from pinned ASCII glyph extrema, native endpoint rounding and the fixed
origin/matrix relation. This is not an outline or rendering check; raw data-state
flags remain unmodeled. The glyph table still needs live provenance. Comparison
digests are projection hashes, not raw artifact hashes.
Both modules leave all ownership, complete-effect, Save and writer authority
false. They do not observe the publication interval or join a project worker.

The same current bundle's `FileSource({})` skips explicit compiler Save but can
still mutate the design. Its preference getter can repair missing rule defaults
and remove incomplete differential-pair selectors through the live compiler.
Keep execution disabled until a fixed native preflight proves the required
state and covers the interval through dispatch. The export also omits stored
META, fonts/assets and some drawing sections, synthesizes fresh headers, and can
return a prefix after an ignored compression rejection. It is not a complete
durable-source snapshot. Neither a successful return nor raw double-sample
equality is an adequate completeness or no-mutation check.

The current format2.0 STRING encoder has 19 fields and rounds geometry to four
decimal places. Its angle arithmetic differs from the SDK mapper, so rounding
ties need explicit treatment, not a general epsilon comparison. Full source joins
records with `|\n` and has no trailing separator. The packaged offline module
`current-pcb-string-source.ts` preserves
raw rows, order and unknown fields and compares the three reader projections.
It is offline groundwork, not a FileSource transport, parent-ownership proof or
writer. A current exact-frame source observer, queue/effect model and nonempty
disposable saved/reopened fixture are still required.

Test stored and exported representations independently. Native page exports omit
the stored META record and can include an unstored origin CANVAS or initialized
drawing-frame order. A synthetic fixture that copies saved records verbatim into
source can hide a universal admission failure. Preserve raw evidence and prove
each allowed encoding difference; a comparison projection is not a saved
checkpoint. Apply the same boundary through preflight, rollback and reconciliation.

Trace how cached history reaches that exporter. The current project worker drops
EDIT_HEAD when writing per-document caches; replay can synthesize the first actor
from DOCHEAD rather than the persisted edit actor. An exact cache-derived candidate
must preserve explicit header users, all metadata and record bytes. Keep the raw
history model and SQL actor proof independent, pin the producer, and refuse shapes
whose cache/canvas behavior has not been modeled. Output matching a candidate is
not evidence that the corresponding cache branch was actually observed.

Keep native membership separate from SDK getter projection. A schematic page's
root-family set excludes inherited drawing-frame descendants that remain in its
full ID index. A symbol editor instead owns Pins beneath its PART. Prove the
reciprocal tree, family set, index and source membership for the actual scene;
do not reuse a page-root fixture for symbol enumeration. Inspect getters for
side effects: the pinned symbol `parts` getter sorts its backing array.

Do not compose a public enumeration that turns exceptions into `[]` with a
getter that drops custom attributes and call the result complete. A native
equivalent may prove bounded membership and each retained field, while refusing
unrepresentable attributes. Label it as that narrower equivalent. Preserve
signed zero during in-memory scalar reproof, and distinguish SDK coordinate/
rotation conventions from stored records even when field names match.

Separate live mutation, queued uploads and durable state in coordinator tests.
EasyEDA may persist a forward effect or inverse later without an agent Save.
An upload barrier is not a flush command. Test inverse intent consumption,
auto-persistence between preflight and dispatch, live-only restoration, and
read-only reconciliation after delayed persistence. Retain the fresh checkpoint,
raw observer and complete proof, not only a success flag or their summary hashes.

Trace each native queue separately. The pinned project-worker upload wait drains
task1, but META changes for symbols, pages and PCB/schematic containers also
schedule a debounced structure-table update. Its task2 promise does not exist
until the timer starts. Neither repeated stable observations nor equality with a
new final checkpoint proves that job finished or that its SQL effect was correct.
Native Save clears the pending flag and republishes geometry, so the same gap
affects schematic-page, symbol and PCB design transactions. Those routes and the
eight metadata writers currently refuse execution. Restore them only after
modeling the complete effect and obtaining operation-owned completion evidence.

Current schematic-container renaming also has a distinct delayed subscriber.
`SCHEMATIC.ON_UPDATE` schedules a 500 ms debounced rebuild that reads the container
and its sheets, then can notify every opened schematic drawing. A fixed wait or
settled PCB batch counters do not prove that callback finished. Use a separate
SCH owner and completion/effect model, with no editor tabs for the initial scope.
The pure `current-schematic-stored-header.ts`, `current-schematic-rename-history.ts`
and `current-schematic-rename-structure.ts` models describe SCH serialization and
the container's structure `name/version/updateTime` delta. They grant no runtime,
queue, full-SQL or saved-state authority, and do not implement sheet-title edits.

The separate schematic preflight contract and original-SQL metadata projection
use native `name/displayName`, not PCB `title/parent/docType` fields. Child
SCH_PAGE headers can advance their parent's version/time through `onHeadChange`.
The projection keeps direct SCH headers separate from effective native metadata
clocks. For stable ordinary parent histories, the latest direct or child time
wins, including historical deleted children; its version follows that clock.
Conflicting versions at the maximum time and historical reparenting refuse.
The SCH data ticket stays its own ticket, not the child's or the branch maximum.
New writes must be newer than both direct and effective clocks. Do not infer
the container clock from its SCH header alone or rewrite that header to match
child-derived metadata. The complete stored-effect proof still preserves every
child and unrelated record.
Matching supplied data or a historical projection is not a live preflight.

Do not reuse a write-title schema for unchanged child observations. Stored
sheet structures omit `docType`, while the getter supplies `1`. Ordinary stored
symbols may retain canonical library origins without becoming reuse blocks;
classify by the pinned native type and keep local template checks. The child
title profile proposes ASCII folding, then requires the real getter and both
ASTs to match before writing. It does not infer the Windows locale from Linux
normalization. A differing native spelling refuses rather than being normalized
away; the container rename policy remains narrower.

`current-schematic-rename-sql.ts` composes that original metadata with frozen
intent, separate supplied clock windows, SCH history and structure models.
Its complete SQL comparison covers the new history/chunk, branch head, project
bookkeeping, all selected structure rows and sequence allocation; every unrelated
table/cell must remain exact. Only a locked or independently aged new-history-head
branch and lower-ticket structure updates are modeled. Supplied actor/client/
clock values remain comparison inputs, not live provenance. Native observation,
retained lifecycle ownership, complete effect and saved reopening remain separate
requirements. The separate disposable SCH coordinator now consumes this model
through original SCH owners, one tracked pre-clock/write scope, complete closed
SQL, saved metadata/child-roster verification and final closure. Installed143713
passed one disposable title-only lifecycle, including fresh cache-excluded
reopening, metadata peers, complete child roster, both AST memberships/order and
final SQL equality.
The historical label `installed143713-disposable-schematic-title-only-lifecycle`
does not admit a later generation, other histories or the generic wrapper. The
explicit `advance-batch` action also passed a separate installed163322 disposable
lifecycle. That historical result does not qualify a later generation or the
new ordinary-purpose composition.
The public route selects the aged unlocked-head branch, not every modeled branch;
ordinary projects, inverse and complete canvas/connectivity proof remain excluded.

`current-schematic-operation.ts` now composes a distinct ordinary-purpose
entrypoint with pre-navigation checkpoint-derived startup, metadata peers and
complete child projection. The opening, baseline, writer and verification plans
retain that purpose; cross-purpose owners and historical journals cannot resume
it. Installed203733 passed this composition's own title-only lifecycle on a
disposable fixture, including bounded batching, complete closed SQL, fresh
metadata/peer/child-roster and both AST readback, final normal closure and
unchanged complete SQL. Ordinary-project scope is now enabled, with historical
label `installed203733-ordinary-schematic-title-only-lifecycle` and
`validationOnly:false`. Keep current `connectedValidation` and
`executionAuthorized` false: history does not supply invocation authority.
Open accepts legacy `confirmDisposableProject:true` optionally so old sealed
journals still parse, without injecting a field when omitted; `false` refuses.
The separate disposable route retains its confirmations and scope. Permanent
startup, clock, owner, one-write and full-SQL guards are unchanged.

The registered `easyeda_control_pcb_diagnostic_validation` route uses the
separate `current-pcb-diagnostic-owner.ts`/`pcb-diagnostic-owner.ps1` owner,
not a cast to ordinary Windows runtime authority. Read
[its staged workflow](../../easyeda-pro-control/references/current-pcb-diagnostic-validation.md)
before qualification. Existing-profile startup has no project arguments but can
restore projects or persist application data. It is validation-only, not isolated
or guaranteed project-free. Installed120717 completed original normal cleanup
and retained unchanged disposable-fixture bytes after an `event-callback`/
`unknown` refusal during pending project opening. It did not qualify completed
opening; the corrected event policy still requires connected evidence.

One browser observation supplies the target selector. One retained flattened
attachment supplies the actual reciprocal frame tree, rather than assuming
frame ID equals target ID. One script inspection then binds that frame/loader,
the default context's unique ID and exact complete source bytes to a compiled
UI/PCB/public-API family profile. No caller URL, source pin, method or code is
accepted. Navigation, detach, context loss or unexpected pause invalidates
inspection, except the sealed worker-only opener's exact same-document transition.
There is no arbitrary CDP, caller evaluation or debugger pause/resume.
Fixed worker and PCB compiler observations are separate original-source branches.
Identity summaries exclude raw console/exception payloads and
are bounded to 128 KiB. They are sampled evidence, not execution tokens.

The native owner retains the original process/Job and two anonymous-pipe
endpoints. File/ancestor leases bind the reviewed executable, bootstrap,
package/configuration and fixed PowerShell comparison tuple. This is not complete
OS/DLL/profile qualification or verified Windows catalog trust. Missing creation
time or other post-create failure retains cleanup-only handles. Image creation
uses the admitted DOS spelling with CREATE_SUSPENDED: compare the original
created native image path with the retained executable's native file path before
the sole primary-thread ResumeThread, requiring its previous suspend count1.
There is no resume endpoint. Failed admission can leave a retained suspended root
requiring manual intervention; it cannot claim no-process cleanup or GUI closure.
Shared launch
exclusion and fresh engine/ordinary/current-generation owner checks prevent
competing launches; matching process names or historical JSON cannot replace
those owners. Receipt settlement republishes only original retained bytes,
never native work. Keep the facade alive after publication failure.

Protocol failure must not close a live diagnostic pipe: Electron can quit when
it disconnects. Normal closure, original root/Job termination and helper release
are separate steps, without Save/Discard choice or forced exit. Never infer
debugger-socket absence from pipe flags. Discovery stays bounded to 8 MiB;
attached diagnostic transport permits 64 MiB total, 103 requests and 4096 events/8 MiB.
Ordinary frames stay at 1 MiB. Only script-source replies allow 32 MiB encoded
JSON and 20 MiB decoded UTF-8, enough for the pinned UI asset. Synthetic tests
and empty-Job construction do not qualify the custom EasyEDA build. Actual
connected project-worker/compiler qualification, complete pending producers and
PCB text observers, writers and saved/reopened proof remain unfinished.

The separate [PCB209 reader route](../../easyeda-pro-control/references/current-pcb209-opening.md)
has eight optional stages across ten primitive families. Its normal opening
and all-eight sequence uses 79 requests, but ancillary frame checks would raise
that to 121 against the unchanged 103 cap. Arc/Poured reserve no new authority:
their original-pipe preflight requires nine remaining requests before any stage
dispatch. A refusal leaves counters and streams intact; the already-recorded
lifecycle intent remains consumed. Cleanup still uses the original owner.
Exact `diagnostic209` observation messages have a 32768-byte aggregate helper
limit, including binding, target and selectors. Other messages retain their
existing bounds; this is not permission for caller code or a new transport budget.

All eight fixed PCB209 programs are stored as generated gzip/base64 literals
inside the same native helper. The bounded decoder checks canonical base64,
compressed SHA-256, exact decompressed byte length, program SHA-256 and strict
UTF-8 before use. Compressed and decompressed programs are each limited to
65536 bytes; the helper retains its 1 MiB file ceiling. Packing changes storage
only: the six preexisting programs retain their exact execution strings and
hashes, and earlier v1 results retain their meaning. There is no caller-supplied
blob, path, file read or network fetch in this decoder. Regenerate the native
constants from the TypeScript programs and verify parity; do not edit packed
literals by hand or infer live validation from a compile-only check.

The diagnostic opener retains a complete pre-navigation checkpoint, registered
raw-path identity and default-branch PCB membership. It uses the same pinned
public project-open service through the original UI context, not arbitrary SDK
dispatch. It admits one top-level frame, the selected project fragment transition
and optionally one unchanged source-shaped `OBJECT` resize-sensor child.
Fixed DOM-owner reads must prove the child's exact frame/backend identity and
closed attribute shape at five project/PCB boundaries. A blank URL is not
enough; direct DOM-parent and private observer-registry ownership remain
unverified. Restored editor frames still refuse; opening may already have
persisted data by then. Never equate prefix acknowledgment with completed startup.

Keep root-fragment and PCB-child navigation models separate. Chromium's browser
and renderer notifications need not share a total ordering. The fixed root
tracker admits only the sealed URL and preserves its committed loader/context;
the child tracker allows one optional blank commit and one distinct PCB commit,
with exact loader and initial-context teardown checks. Scheduling must balance,
but loading counters are not readiness proof. Broader diagnostic event labels
do not broaden acceptance or identify an earlier unknown event. Source-derived
corrections and synthetic sequences are not captured EasyEDA navigation evidence.

The separate PCB model reader follows the source/location-admitted
`pcb/saveCompiler` wrapper and handler's original V8 scopes without calling them.
Fifty fixed requests qualify bound callbacks and constructors and sample main/custom-footprint compiler queues, selected pending
producers, raw String-manager membership and a populated-safe root census, then
release the original remote-object group. The four samples must share a document identity but are not
atomic. Raw absent/undefined/null/zero fields remain distinct, and models without
view watchers are included. All effect checks remain enabled; caller object
handles, code and arbitrary scope enumeration are unavailable. The raw String
subset is not whole-PCB membership, and local copper-worker reference equality
is not a CDP/project-worker association or completion evidence. The census
includes seventeen managers, board/panelization roots and three spatial-index
branches, plus selected interaction and secondary-index state in the same
request. It observes the source-defined idle tool chain and empty smart-dimension
command without assuming tools are null. It still excludes complete ownership,
ratline/network secondary indexes, latent move callbacks and geometry.
Zero counts and absent/undefined owners are not empty-board proof.
Neither counts
nor raw fields establish Save eligibility. This PCB-frame branch is not
reachable through project-only opening alone. A separate one-shot `open-pcb`
stage derives the original sealed target; `observe-pcb-opening` then binds the
new child frame through its DOM owner, complete pinned source and default
context before the fixed native identity observation. Preserve the original UI
identity and source throughout. This branch excludes worker discovery and
stays within the103request budget, including all five ancillary checks and
object-group release. It does not validate writes or saved state.

V8 can elide a class binding used only to initialize a top-level instance, even
when the instance remains in the Save handler's closure. Fixed constructor
bundles follow only reviewed instance/prototype/constructor descriptors, then
qualify each function's exact location, name, arity and prototype against the
already-admitted script. Leaves recheck those associations. No constructor runs;
no name-only fallback or arbitrary scope lookup is allowed. This proves a
source-associated constructor, not the original lexical binding. The separate
precreate profile has twenty such constructors. V8 reports an inherited class's
own prototype with its immediate parent class name: the eight pinned inherited
profiles must not be forced to `Object` or accepted by an arbitrary-name fallback.
The current V3 no-common route uses215 requests. Its optional original-owner
common-baseline stage now uses fixed bounded graph packets, with a3309request
maximum for the combined route. Each graph permits512 packets and one final
native full reply. Per-call deadlines, effect checks and64MiB total bytes are
unchanged. Historical237request owners cannot adopt this larger vocabulary.
The common stage qualifies
four common constructors, retains five original raw replies and joins them with
the completed SQL inventory from the operation's original pre-open checkpoint.
It cannot adopt caller-supplied observations or recreate ownership from JSON.
Only these common-leaf replies allow a1MiB+1KiB encoded frame, covering their
bounded524288byte text at maximum JSON escaping; other ordinary frames retain
the1MiB limit. Neither a successful join nor a retained comparison refusal grants
writer authority. Lpe has arity1; the source alias $me points to named Sy
with four exact numeric statics. Preserve these profile differences. For the
static-map owner pP, the captured native alias is Xh; class self-references do
not prove an outer pP closure binding. These observation budgets do not admit a writer.
The packet reader retains ordered aliases and descriptors, then rechecks them
in bounded passes. Its final full JSON is produced in the original renderer,
not relabeled host reconstruction. Reproof spans awaits and is not atomic;
nested fields can change after their reproof. Keep complete-live-baseline and
writer flags false. Synthetic timing does not establish the cause or correction
of a historical connected timeout.

The pinned `Zec=new Sfe` variable is not captured by the Save handler. Discover
the subscribed Sfe owner through its six original `.bind(this)` callbacks instead:
require exact target source/location/name/arity, empty bound arguments, one shared
receiver, no instance shadow and a fresh registry association check. Distinct CDP
handles can refer to the same receiver; compare object identity in the original
context. This proves the subscribed owner, not lexical Zec identity. Bound-function
metadata does not solve hidden receivers in class arrows.

The versioned precreate readers preserve absent/undefined/null/present FP/MI
managers; missing initialization remains an unmet condition, not zero work.
The combined owner additionally runs a fixed58-request worker producer collector,
a12-request move/startup collector and six UI/worker/PCB actor-clock samples,
rechecking its original admissions. Move samples bind the original Save-handler
closure and exact callback source, then retain its timer, selection, builder,
command and seven startup flags without invoking or cancelling them. Matching
flags do not prove startup completion or containment of write destinations.
Native adapters reconstruct fixed programs, including tagged worker-property
requests; no caller expression crosses the helper boundary. Historical V1
readers keep their old meanings. Return the bounded V3 summary and retain the
full journal evidence; the712KiB evidence cap exceeds the512KiB tool envelope.
Historical V2 retains680KiB and its203/225request limits. These samples still
exclude hidden arrow receivers, complete publishers and destinations, and writer
authorization. The original precreate owner now privately retains its actor
packet and completed pre-open SQL and issues their provenance token. The dormant
ledger can consume that exact token and bind its own original Save-clock plan.
Shared launch/bridge/native-edit exclusion now includes every unresolved String
ledger reservation. Windows clocks, server-time dispatch, create/Save dispatch
and native terminal completion remain separate unfinished integration. Neither
the provenance token nor journal JSON supplies execution authority.

The private SCH preflight used by these coordinators reads the strict key-value roster, exact target
and `getIdByName` routes twice and compares them with the original completed SQL
projection. It also observes client/ticket, UI actor and renderer/server clocks;
these samples do not bind the backend producer or qualify startup. Do not
substitute PCB tokens or counters. The array roster route catches errors as an
empty list, so it cannot establish complete membership.

In SCH `d9d6a955`, the update handler at6204757 schedules `ZTe=Ta(w9,500)`
without awaiting it. The callback at5766787 can initialize missing child holders
when the returned child count exceeds the AST sort length. Before any future
dispatch, bind the complete child roster, parent membership and duplicate-free
AST sheet/sort maps to original history. Keep no-editor and dormant-panel checks:
opened sheets can receive drawing updates, and active standardization panels can
fetch external data after an AST rebuild. Linked block/reuse propagation remains
outside the initial scope.

A fixed wait, early AST title change or settled PCB counter cannot prove callback
completion. A separate original SCH lifecycle can instead prove that old-generation
producers ended: observe retained root and non-breakaway Job termination, verify
the exact complete closed SQL effect, exclude persistent upload replay caches,
reopen in a fresh qualified generation, then close it and compare final SQL.
Keep `schematicSubscriberCompletionVerified:false` unless completion itself was
observed; generation closure is a different claim. SQL equality does not cover
network requests, global preferences, previews or logs, and termination cannot
undo an external request already sent. Exclude those rename-triggered branches
before dispatch rather than claiming whole-profile invariance.

Test adapters against the maintained producer, not only a hand-written fixture.
PCB component inventory is identity-only; it has no per-component state map.
Inherited footprint drawing lines can appear in inventory without standalone
LINE source records. An ID prefix does not prove parent ownership. A disabled
PANELIZE record is safe to admit only when its full canonical shape is checked
and the pinned native path returns before generating panel geometry.

Preserve public layer color strings as bounded raw data. The pinned fractional
RGB formatter can emit malformed strings on disabled custom layers. Do not
silently repair them or label them valid CSS. Active-layer selection needs both
the canonical source identity and matching public layer state, not just an ID.

Check deprecated getters for silent failure. On the pinned tuple, the old
schematic selected-ID getter turns a missing obsolete iframe-command response
into an empty list. Its declared replacement uses the modern selection manager
and promotes selected wire segments to parent groups. An explicit replacement
adapter must identify that route, retain the returned group semantics and refuse
missing results. Never call a swallowed error proof of an empty selection.

## Footprint source inspection without parser replay

On the pinned 3.2.209 implementation, `Tg.getStr` can populate caches, replay
history through application callbacks and schedule cleanup. An empty
`ja.historyMap` is normal after construction. Treating it as a permanent omission
would reject ordinary stored drawings. A complete direct getter adapter still
needs those producers and their effects accounted for.

The scoped source-inspection alternative reads the original consistency map and
its current atom offsets, then reads existing native Cache entries. Use a separate
read-only history projection: copy/append restrictions would unnecessarily reject
ordinary footprint records, edits and actor metadata. Preserve opaque body bytes
and empty tombstones. Resolve normalized-ID winners from the pinned native fold,
and refuse contradictory ties or ambiguous header/actor provenance.
Preserve raw library atom headers through the separately scoped read-only
decoder; do not change the default writer decoder to admit them. Historical
pending/unique flags and metadata-effect families need their own native fold
before this reader can support them.

Native cache segments load concurrently, so SQL traversal order cannot prove
the consistency map's insertion order. Require two identical complete native
source samples and independently verify every keyed record and generated header.
Report native order stability separately from checkpoint record equality; do not
claim checkpoint byte-order equality or reuse this proof to authorize a copy.
Never send the expected source into the native reader as
the observed result. Qualify the original receivers and native method objects,
recheck them across awaits, and retain the exact source rather than a partial
projection. Missing cache entries refuse without invoking the vendor parser or
falling back to a network request.

Bound the aggregate input, stream-read count, row scan and output encoding
separately. Index each cache chunk once rather than rescanning it for every atom.
Yield during long parsing so the fixed deadline can fire, and cancel the original
stream reader on failure or timeout. Reserve the whole request sequence before
dispatch while retaining cleanup capacity. A matching source packet grants no
copy, delete, Save, producer-completion or saved/reopened authority.

The installed SDK stub declares `lib_Footprint.getDocumentSource`, but the pinned
UI does not register its RPC handler. Report the cache reader as a scoped native
task equivalent. Its source equivalence does not validate that missing wrapper
or establish the full declared contract.

Copy-v2 preparation separately models ordinary records, tombstones and native
integer-key ordering. Filter the actual META record when deriving destination
canvas content; numeric IDs can sort before it. Its saved-source projection is
bound to an original successful complete-SQL comparison and preserves both
fresh-history and native chunk-cache actor serializations as exact alternatives.
Before a future copy dispatch, reserve the complete saved-getter size for both
alternatives and require positive document-clock bounds. Pure comparison inputs
do not establish native actor/clock provenance, completion, generation closure,
replay exclusion or a reopened result. No copy writer is enabled by these models.
