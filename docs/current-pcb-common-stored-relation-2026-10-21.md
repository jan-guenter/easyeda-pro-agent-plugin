# Empty-PCB common state and stored history

`current-pcb-common-stored-relation.ts` joins the supported supplied common
graphs to an original completed SQLite inventory. It does not attach to EasyEDA,
call vendor methods, write files, open a project or authorize a String edit.

## Supported relation

The input is the original `readExactSqlInventory` result, exact project/default
branch/PCB identity, and the strict raw presentation, rules, preference and
empty-assets replies. Existing encoders supply CANVAS, LAYER, LAYER_PHYS,
ACTIVE_LAYER, RULE_TEMPLATE, all fourteen supported RULE families, the fixed
37 PRIMITIVEs, SILK_OPTS, PREFERENCE and disabled PANELIZE. The relation assembles
their native emission order once. Historical physical order may differ.

Every surviving target record must be exactly one predicted common row or META.
Missing rows are errors, not inferred defaults. Nonempty NET, selectors/EQLEN,
geometry, components, fonts, blobs and board-model branches remain unsupported.
The existing empty-assets decoder does not establish complete durable asset
ownership; that flag stays false. Complete SQL and peer-document commitments
retain resources, unknown peer data and historical deleted target records.

META and DOCHEAD are separate inputs. The bounded ordinary-root META contract
requires title, empty parent/source, an empty or valid board identifier and a
null or bounded nonnegative integer zIndex. DOCHEAD uses the existing historical
PCB schema, including its optional bounded user object; it is not a new header
or backend-account witness. Exact JSON bytes are retained, including field order.

Selected `project_structures` rows must have identical tree bytes, matching
project/branch and nonnegative tickets no greater than complete history's
maximum. The target tree entry must match META title/board/parent/source and
DOCHEAD version/updateTime. Optional docType must be PCB3; zIndex must match,
with an omitted tree zIndex admitted only for null META zIndex. Present zero
versus null is deliberately not normalized. Unknown target-tree fields refuse;
all peer/owner fields and complete selected tree bytes remain committed. The
project owner UUID is checked against the original projects row. This is a
bounded ordinary-root subset, not a general structure decoder.

`prepareCurrentPcbCommonStoredFromMetadataObservation` additionally uses the
descriptor-only metadata encoder. It binds its document/project identity and
exact META body while retaining the complete metadata reply and graph hashes,
including compiler uniqueId. The historical header still must be supplied;
`headerSourceMatched` and metadata provenance remain false.
`prepareCurrentPcbCommonStoredFromOriginalBaseline` composes the five original
runner-issued replies through the private retention seam; it still requires
the historical DOCHEAD text separately.

## History and raw observations

The existing complete authenticated-history decoder selects semantic state.
The new occurrence index does not replace its replay rules: greater tickets
win, greater non-null clients break equal-ticket ties, and the first identical
winning clock/client occurrence remains selected. Conflicts still fail in the
existing materializer. Explicit null client inheritance is distinguished from
an absent serialized client and an explicit client string.

The result retains complete chunk/link hashes, all target occurrence hashes,
selected raw header/body/record hashes, original tickets/clients, duplicate
winning-clock counts, common emission order and separate raw graph/body hashes.
It requires the selected body's exact bytes, not merely semantic JSON equality.
Bounds are 50,000 history occurrences, 20,000 target occurrences, 2,048 emitted
common IDs, 4,096 structure rows and 2 MiB structure text. Iteration yields
cooperatively rather than monopolizing the host loop.

The baseline runner's private WeakMap seam retains the five replies only after
successful decoding, cleanup and final owner checks. Original own-data envelopes
are frozen and their descriptors rechecked; retained immutable envelopes contain
the exact original strings, not reserialized decoded graphs. The seam proves
only that this runner issued the observation. It does not claim original envelope
object identity, transport authenticity, current ownership or continuity. A
cloned observation cannot retrieve those replies.

## Constructor-aware collection

The dormant baseline runner now returns observation v2 and uses a private v2
object group. It makes 18 requests: six to qualify the original Save scope,
six to select and qualify the fixed constructor tuple, five fixed observations
and one group release. Its decoded-observation bound is 2,121,728 bytes.

The common tuple is Yme/Me, Nfe/ce, Epe/rt and GSe/id. These owners are reachable
even when V8 omits their top-level class names from the Save closure. The fixed
selector reads each owner's prototype and its own constructor descriptor; the
host checks all four constructors against the original admitted PCB script,
exact pinned location/name/arity and distinct prototype handles. No constructor
is called. Each common leaf receives the retained tuple, binds every selected
owner back to its qualified constructor and rechecks the association before
return. The empty-assets leaf uses GSe through the same tuple; phase-assets
forwards that tuple to its embedded empty-assets read. There is no fallback to
an unqualified class-name lookup. Metadata uses its independent one-argument
plain-data reader and is decoded before cleanup, like the other four samples.

This is not proof that prototype methods or native intrinsics are pristine,
and source-qualified class metadata does not prove a lexical binding identity.
The retained owner callback checks and the complete original script admission
remain the caller's separate responsibility. No public/native route is added.

## Evidence and remaining integration

Six focused relation tests use synthetic graphs with genuine isolated
SQLite/AES-GCM/gzip history. They cover full row accounting and a peer/resource,
missing/additional/reordered bodies, target/structure mismatches, stale and tied
clocks, duplicate occurrence bytes, hostile inputs, metadata composition and
the existing complete one-String SQL effect proof. Runner and rule-fixture tests
reuse the same shared setup; strict targeted lint and TypeScript checks apply.
Seven runner tests cover the 18-command sequence, elided class names, foreign
constructor scripts, aliased prototypes, per-leaf refusal and cleanup/ownership
failures. Common-state, empty-assets and phase-assets tests exercise the tuple
association, including local V8 side-effect checks. This is offline supplied-data
validation, not connected writer validation.

Source anchors are the pinned PCB217199c8 asset: `saveCommonData` at5840102 for
common order, O8e at3122060 for ordered META and `zIndex || null`,
Zu.getDocDetail at3194711 and Zu.onDocDetail at3199775 for metadata ownership.
Offsets are JavaScript string offsets. History selection comes from the existing
`native-history.ts`; ordinary tree linkage follows the supported shape already
used by `current-pcb-string-sql.ts`.

Keep three independent ledgers: source/constructor/prototype assumptions,
retained native owner/context facts, and sampled graph/SQL facts. This relation
leaves all native-integrity, ownership, atomicity, continuous-observation,
completion, closed-file, Save, reopen and execution authority flags false.
Remaining work is live owner-qualified collection, actual missing-default/header
shape admission if necessary, phase attachment and independently established
producer/lifecycle completion—not another generic SQL parser or another test
for each rule family.
