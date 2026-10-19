# Current schematic rename ownership and dormant compiler

This change adds an exclusive SCH opening transfer and a fixed, unregistered
rename compiler. It does **not** enable schematic renaming. No native call,
project open, Save, installation or CAD edit was performed for this work.
The offline inventory still classifies `eda.dmt_Schematic.modifySchematicName`
as `implemented-but-blocked` through the older library route. This dormant
implementation does not change that route or claim the full declared contract.

## Implemented ownership boundary

`current-disposable-open-runtime.ts` now has a separate SCH owner WeakMap and
`prepareSchematicRenameOpeningOwner` / `getSchematicRenameOpeningOwner` methods.
The issuer consumes the actual retained disposable opening, engine, Windows
runtime and Job reservation. It refuses injected opening services. It checks
the original journal, source, validator, launch, bridge session and capture/clock
method identities before its atomic transfer. Copied JSON and PCB owner tokens
cannot reconstruct SCH ownership.

The shared runtime/Job exclusion mechanism is document-neutral. SCH and PCB
transfers exclude each other, and an actual symbol-baseline reservation excludes
SCH transfer. No PCB or symbol authority token is accepted by the SCH issuer.
If authenticated scope exit fails after reservation, the same SCH owner remains
reachable, but its completed-transfer assertion refuses. It cannot be replayed
under a different operation ID. This retains the owner needed for cleanup;
there is no callable SCH cleanup coordinator yet. The baseline/normal-close
coordinator that will consume it is still missing.

The initial opening is a PCB in the same disposable project. A SCH container is
not that PCB. The transfer therefore seals the exact project and branch, while
the requested schematic UUID and owner UUID must still be checked against the
later original closed SQL baseline. The retained pre-navigation checkpoint is
not a post-opening baseline. The transfer itself performs no native calls and
does not issue actor, clock, startup, persistence or writer authority.

`current-schematic-rename-owner.ts` admits only an exact operation ID, target and
nonblank printable-ASCII title without capital I. Own-data checks reject
accessors and Proxy inputs. The capitalization restriction matches the existing
native locale-folding subset rather than assuming a worker locale.

## Fixed compiler

`current-schematic-rename-program.ts` requires the original completed SQL reader,
metadata projection, child-roster projection and SQL preparation. The new
`originalCurrentSchematicRenameSqlPreparation` accessor checks the existing
private WeakMap identities. It exposes historical witness/actor data, not a
native authority capability.

The generated program retains the exact no-editor project context, neutral
startup holders, separate SCH child manager/AST objects, dormant standardization
panel, message-bus receiver, dual UI actor objects and renderer/server-time
methods. It compares complete SCH peer metadata and complete active sheet KV
metadata against original SQL. It checks the exact child AST projection and
receiver identities across every await before dispatch. It does not call
render, initialize a child, flush a queue, open a sheet or invoke Save.

Its sole possible mutation is the project-qualified native equivalent:

```text
/PrjDB/schematic/updateData
[{ uuid: target.schematicUuid, display_name: desiredTitle }, target.projectUuid]
```

Before that call, it repeats project, peer, target, name-availability, child and
client/ticket checks and enforces the frozen clock windows. After the call it
retains a structurally valid native acknowledgment before fallible readback,
compares the expected title/version/time/ticket change, and rechecks all peer
and child metadata. It stops checking pre-rename AST identity after dispatch
because the native subscriber legitimately changes it. This is not a subscriber
completion test. All backend identity, clock provenance, producer completion,
persistence, reopening and execution-authority flags remain false.

A timeout blocks delayed continuation. An acknowledgment followed by failed
readback remains a stopped result with mutation possible. There is no retry,
inverse or Save path. The compiler permits only one native mutation per program
invocation; durable one-attempt reservation belongs to the missing coordinator.
No public method, runtime dispatcher or tool registration consumes this code.

## Native source and official contract

All files below were read as inert UTF-8 text beneath the installed application's
`resources/app/assets` directory. Offsets are zero-based UTF-16 code units.
No vendor bundle was imported or executed.

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-api/0.3.50.ab46409c/api.js` | 1964920 | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |
| `pro-ui/3.2.196.26ed3d6c/js/ui.js` | 17456671 | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` |
| `pro-mgr/3.2.184.355087e9/js/pro-mgr.js` | 2196400 | `005584e02cd9b2d49fdb387b2f997c1c8d3f88b0c48a7531c8097c483ed0bd2e` |
| `pro-mgr/3.2.184.355087e9/js/project-worker.js` | 2181284 | `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928` |
| `pro-sch/3.2.192.b79ad524/js/sch-main.js` | 6289422 | `d9d6a955bf40d57daf9f27f31e0fff3191715ff50582418ad0922beb71b424bd` |

The official method is beta and returns `Promise<boolean>`. Its documentation
warns that a linked reuse block can propagate a rename to its symbol and PCB.
Its example uses an opened sheet and fixed delays. Those are not completion or
unchanged-design proofs. [Official modifySchematicName reference](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_schematic.modifyschematicname.html),
checked 2026-10-19.

The native route is distinct from that public UI workflow:

- API `modifySchematicName` starts at 1317248. UI mounts it to `Hg.modifyName` at
  17429192; the method at 17205525 resolves a left-tree row and calls
  `leftTreeUpdataName`.
- SCH dispatch at 6181499 reaches `ySe` at 4799485. The ordinary branch also
  refreshes the current sheet through `G$` at 4799274, changes child presentation
  through `gSe` at 4799357, and logs/refreshes UI state. Block-symbol propagation
  is a separate branch. The new compiler does not claim those UI effects.
- MGR `SCHEMATIC.UPDATE` at 2058654 awaits the selected project's
  `schematic.updateData`. Worker `Dg.updateData` at 1915783 resolves the existing
  container, samples `qe()`, sets version/time, builds one update and awaits
  `uploadLocal`. The supplied patch omits `renameKey` and `keepVersion`, whose
  defaults are false.
- Worker `updateString` at 1915393 creates the SCH DOCHEAD from `this.client`,
  `this.user`, time/version and `maxTicket + 1`; it allocates a new META ticket.
  These closure-private worker values are not exposed by the bridge. Matching
  UI actors and historical SQL users cannot prove their ownership.
- `uploadLocal` at 2031178 schedules buffered persistence. Its return does not
  prove the later SQL history or debounced structure producer has completed.
- SCH `SCHEMATIC.ON_UPDATE` at 6204757 awaits `L0e` at 3795371, then invokes
  `ZTe=Ta(w9,500)` at 5767624 without awaiting it. `w9` at 5766787 can initialize
  missing child holders. The fixed child guard protects the pre-dispatch roster;
  it does not expose or cancel this private callback.
- MGR sheet KV forwarding at 2060317 reaches worker `getAllKVData` at 1921285.
  An undefined schematic filter selects all active sheets. The compiler does
  not use an array route that converts exceptions to an empty list.

See [the child observer report](current-schematic-child-observer-2026-10-19.md)
for the exported holder identities and the narrower fields that can be read.

## Remaining implementation

1. Add a distinct SCH baseline coordinator that journals the transfer intent,
   retains an original close capture, allows one normal close, proves original
   root/Job termination and captures the complete closed SQL baseline. Failed
   transfers must reach cleanup without becoming completed transfers.
2. Add a distinct fresh project-only SCH generation and startup collector. Bind
   original SQL, child roster, cache exclusions and actor/clock observations to
   that generation. Do not substitute PCB/symbol owner tokens.
3. Bind independent original Windows clock observations and the backend
   producer model to SCH preparation, then journal exactly one mutation before
   dispatch. The dormant program alone cannot establish these facts.
4. Prove the complete closed SQL effect after original generation termination,
   exclude both persistent upload-cache namespaces, reopen in a new qualified
   generation, verify saved metadata and close/compare again. Generation closure
   and actual subscriber completion must remain different claims.
5. Register only after source review and focused disposable validation. Linked
   blocks/reuse, active sheets, inherited sources, child-derived container
   clocks, reparenting, broader titles and general inverse remain excluded.

## Offline evidence

Fourteen focused tests passed under Node 24.18.0, core dumps disabled,
`TMPDIR=/root/.cache`, with the maintained isolation preload. Nine tests exercise
the actual opening issuer in a private realm with synthetic boundary I/O;
five exercise the complete generated program in native-shaped synthetic VMs.
They cover reciprocal reservations, scope-exit failure, original identity drift,
guard changes across awaits, one mutation, retained acknowledgment and timeout.
These tests issue no production owner and execute no EasyEDA code. TypeScript
and targeted strict type-aware Oxlint passed with zero warnings. Seven existing
PCB opening-owner tests also passed against the shared issuer change, bringing
the final focused run to 21 passes and zero failures.
