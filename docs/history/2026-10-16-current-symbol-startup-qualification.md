# Current symbol startup qualification

Source review and implementation: 2026-10-16. This is a narrow private route,
not general EasyEDA startup completion or a public writer. Vendor bundles were
read as text, never evaluated. The only design evidence inspected was a
previously retired disposable checkpoint; no original project was opened.

## Result and limits

Active linked sheets need not be rejected categorically. Their fresh native
initialization can be admitted when the complete stored input rules out the
reviewed initial component-part repair, and the same renderer invocation proves
that sheet managers are gone and retained symbol templates have no pending
initialization/local/realtime task state. The writer rechecks those holders
before and after its fixed operations.

This is not a timer-drain argument. `trySave` runs during native initialization;
the argument is that the supported initial input does not enqueue the component
repair that makes that path save local changes. The existing original-generation
opening, startup database/version premises, inactive upload-cache exclusions,
fixed local source/dependency admission, clock qualification and final complete
closed SQL/native comparison remain mandatory. See the
[startup premises](2026-10-16-current-startup-premises-research.md) and
[producer scope](2026-10-16-current-symbol-producer-scope.md).

The200000 live renderer executed the startup observation but returned its
generic refusal before writer transfer. Original-owner cleanup and complete
closed comparison finished with no changes. Source review then found the
`base`/`_base` mismatch described below. The corrected guard still needs a new
connected attempt; synthetic tests do not establish runtime acceptance or
writer persistence. The public writer remains disabled.

## Pinned primary sources

Paths are relative to `/mnt/c/Program Files/easyeda-pro/resources/app/`.
Offsets below are zero-based JavaScript UTF-16 string offsets, not byte offsets.
The existing [fixed source profile](../../plugins/easyeda-pro-control/server/src/current-disposable-open-profile.ts)
binds these exact bytes before and after qualification:

| Source | Bytes | SHA-256 |
| --- | ---: | --- |
| `app.js` | 2657192 | `52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c` |
| `assets/pro-mgr/3.2.184.355087e9/js/pro-mgr.js` | 2196400 | `005584e02cd9b2d49fdb387b2f997c1c8d3f88b0c48a7531c8097c483ed0bd2e` |
| `assets/pro-mgr/3.2.184.355087e9/js/project-worker.js` | 2181284 | `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928` |
| `assets/pro-sch/3.2.192.b79ad524/js/sch-main.js` | 6289422 | `d9d6a955bf40d57daf9f27f31e0fff3191715ff50582418ad0922beb71b424bd` |
| `assets/pro-mgr/3.2.184.355087e9/js/ws-service.js` | 855142 | `7a372d7271225999c3d16bcef1cd91c0fa2d3a1a402ebcf9761442ecf3187453` |

The UI profile is retained separately by
[current-ui-implementation.ts](../../plugins/easyeda-pro-control/server/src/current-ui-implementation.ts).
The four fixed SQLite runtime files and higher-precedence resolution exclusions
are checked by `verifyCurrentSymbolPersistenceImplementation`; they are not
reimplemented in the startup issuer. Their hashes and the exact local
APP/MGR/Worker/SQLite producer route are in the producer-scope note above.

## Native initialization trace

In the pinned SCH bundle:

- `wb` at 5471485 reads project/board/schematic/sheet/PCB/panel/simulation
  metadata and awaits AST construction. `Kxe` at 5472590 awaits `Xl` and `mM`
  for each linked sheet, then calls `deleteIfNotOpenCanvas`. The `-prjInit`
  subscriber at 6171718 awaits this work before setting project readiness.
  The retained project-opening generation separately binds the awaited UI
  opening path; a caller-supplied event payload is not authority.
- `Xl` at 5769769 reaches `getOrInitDoc` at 5758065. That method awaits the
  selected document initializer and removes its pending fetch in `finally`.
  `createDocManagerWithRealTimeSync` at 5759177 awaits document initialization;
  symbol templates remain in `projectMgr.componentCache.symbolTemplate`.
  `deleteIfNotOpenCanvas` at 5757936 disposes the hidden linked sheet.
- `I9.init` at 4456057 initializes consistency, commits decoded records, then
  installs the document callback/watchers and realtime handlers. `runTask` at
  4430137 calls `trySave` after committing. `P9.trySave` at 4459527 checks
  `manager.checkSave`; `XE.checkSave` at 782054 queries the worker's
  `/mgr/check/hasSaveData`. WORKER at 2159549 returns the consistency manager's
  local-data predicate. A completed opening alone therefore cannot prove no
  initialization writes.
- `schSymbolModelParser` around 4420000 calls `createSymbols().tryUploadChanged()`.
  `createSymbols` at 4420061 queues a component for upload when the selected
  part differs from its stored part. `createSchSymbol` at 4421938 selects a
  fallback when the requested part is absent, or a nonabnormal alternate when
  one exists. Requiring one explicit, matching part excludes both alternatives.
  `COMPONENT.attrs` can override device selection, so this route requires it
  to be empty rather than guessing which override is harmless.
- `ja._init` at 5372957 performs net-name presentation correction before
  normal upload watchers are installed. The correction at 4197241 is in-memory;
  `_9.watch` at 4405067 installs the later upload handlers. `mM` at 5446807 and
  its reference checker `ait` at 5463313 build/check AST data; the reviewed
  checker reads existing library references and logs missing ones, not writes.

These findings support the finite predicate below. They do not cover arbitrary
imports, interactive editors, simulation, multipart repair or all application
background activity.

## Implemented finite predicate

[current-symbol-startup.ts](../../plugins/easyeda-pro-control/server/src/current-symbol-startup.ts)
examines the complete maintained native-history materialization from the exact
original baseline checkpoint, not a caller projection:

- At least one active linked sheet; every active sheet has one valid META and
  an existing undeleted schematic. No active simulation is admitted.
- Every component has a unique direct Symbol reference, no component attribute
  overrides, and an exact stored part matching its referenced symbol's sole
  explicit PART. Foreign part memberships, unsupported symbol document types,
  missing/deleted dependencies and duplicate selected references refuse.
- Optional device references must bind that same symbol; selected footprints
  must exist. Only ordinary symbols, net flags and drawing symbols are admitted
  (`docType` 2, 18 and 20). The result contains all active sheet identities and
  the unique referenced template/part set; no private fixture identifier is
  hardcoded.

[current-symbol-startup-guard.ts](../../plugins/easyeda-pro-control/server/src/current-symbol-startup-guard.ts)
checks the original project-only DOM/tab guard plus exact cached native holders:
empty sheet-manager/fetch maps; the exact expected template set; initialized,
unpaused consistency handlers; empty task and local-pending state; no template
canvas; one matching raw part; and no running or queued realtime action. It
retains and rechecks all observed receiver and queue identities within the
invocation. It never calls the `parts` getter, which sorts the backing array
at SCH 5380751. It does not require the symbol-template fetch map to be empty:
SCH 5890791 retains settled entries because it deletes the different result
fetch map. Retained template initialization state is checked directly instead.

The symbol consistency manager is `v9 extends mse extends pse` (SCH offsets
4412965, 808753 and 803504). `pse` exposes `get base(){return this._base}` and
assigns its own `_base` at 803724. Update211500 replaces the incorrect own
`base` requirement with that exact own `_base` field and rechecks its identity.
It does not invoke or broadly admit getters. Adjacent source checks confirm
own `partId` (properties passed at 5754017 and assigned at 4287060), handler
`isPaused` (4455090), and `shapes.docManager` (4283804). No other property-shape
change was identified. The old opaque failure cannot establish which predicate
failed first.

Observation-only diagnostics name seven fixed stages: `project-only-context`,
`sch-holder`, `scheduler`, `cache`, `template`, `native-queue`, and `parts`.
No raw holder values, project/template identifiers or native error text are
returned. The decoder accepts only the exact bounded failure envelope and
preserves unsettled-call/timeout refusal. These categories identify a check to
investigate; they do not grant retry, navigation, mutation or cleanup authority.
The writer's embedded guard does not opt into diagnostic reporting.

[current-symbol-startup-runtime.ts](../../plugins/easyeda-pro-control/server/src/current-symbol-startup-runtime.ts)
issues a nonserializable original token only for the original generation and
engine. It re-reads the exact checkpoint, binds its semantic history, rechecks
fixed source/dependency bytes, journals one bounded observation intent and
retains its original reply before interpretation. A failed attempt is consumed.
JSON copies, supplied booleans and arbitrary verifier callbacks cannot issue a
token. The token expressly does not assert cross-invocation receiver continuity,
global idle, persistence or execution authorization.

## Validation and next boundary

Nine focused tests cover the stored-input predicate, wrong or deleted
references, part-repair cases, pending native work, receiver replacement,
exact bounded replies and fabricated authority. Strict type-aware lint and
TypeScript checks pass. A retired disposable checkpoint also satisfies the
offline predicate; that is input evidence, not live execution validation.

Next is one original disposable generation using the shipped source to execute
the strict startup observation. The private writer remains unregistered;
startup qualification alone does not authorize a live mutation. Both persistent
upload-cache namespace exclusions, original source/clock/owner admissions, and
the complete normal-close/closed-comparison plus inverse/reopen lifecycle must
be ready before live writer validation. A runtime shape refusal needs
investigation, not relaxed gates or a repeat mutation. Production designs remain
outside this validation.
