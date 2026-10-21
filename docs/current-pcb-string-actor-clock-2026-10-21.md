# String actor and local-clock collection

The new collector observes the UI cached/startup account, the project worker's
retained DOCHEAD user, and local UI/worker/PCB clocks. It does not borrow PCB rename
authority, invoke Save, call an RPC, or observe the Windows/backend clock.

## Source boundary

The following installed application assets were read as inert text and checked
against their complete SHA-256 values. Positions are zero-based JavaScript string
offsets. No application code was executed for this inspection.

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-ui/3.2.196.26ed3d6c/js/ui.js` | 17,456,671 | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` |
| `pro-mgr/3.2.184.355087e9/js/project-worker.js` | 2,181,284 | `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928` |

UI `kFo` exposes `gVars` at16956658. The login-user handler at16957413 reads
`gVars.loginedUserInfo` and creates a fresh object in the order
`uuid,nickname,username,avatar`. Worker `subscribe` at2115431 retains the RPC
reply in `this.user`. Worker `saveCanvas` at2144978 passes that retained user
verbatim into `asyncCompressFull`; it separately obtains `updateTime` through
`/pro-mgr/serverTime/now` before compression. Thus:

- UI cached/startup values, worker DOCHEAD user and backend EDIT_HEAD actor are
  separate evidence. This collector compares the first two, not the backend.
- Worker `PROJECT.user` is a retained value, not a fresh login RPC result.
- `Date.now()` in any renderer or worker does not observe the Save server-time
  reply. The clock source used by the future Save remains unverified.

The current diagnostic owner has retained page/worker CDP sessions and an
original Windows process/Job, but not the separately issued clock attachments
from `windows-clock-transport.ts`. Those attachments bind their own unchanged
request/reply identities and helper scope. They cannot be reconstructed from
this collector's JSON or inherited from a PCB rename operation.

## Fixed contract

`current-pcb-string-actor-clock.ts` exports three fixed functions and a command
builder. Commands use `Runtime.callFunctionOn`, a retained unique context ID,
`returnByValue:true`, `throwOnSideEffect:true`, `awaitPromise:false`, and no user
gesture. UI and worker receive only the internally sealed project/branch/document/
window identity; PCB receives no arguments. No caller program, method, clock,
actor, request budget or context ID belongs in the public MCP schema.

`CurrentPcbStringActorClockRunner` consumes exactly six requests in this order:
UI, worker, PCB, PCB, worker, UI. The enclosing native owner must retain the
original UI and PCB source admissions plus the original selected worker, route
each command to its correct session, and reprove all three before and after every
await. The runner also retains and checks its transport methods at each boundary.

UI reads own data fields from the original realm's `gVars` and checks its relation
to `UI.gVars` and the selected project. Worker reads the original realm's
`PROJECT.user` after its fixed class/project/branch checks. PCB reads only its
realm's local clock; it does not claim document or actor identity from that result.
Descriptors and retained field values are rechecked within each synchronous
sample. No getters or application callbacks run.

Each local clock bracket is at most1second; the two brackets for one realm must
be ordered, have the same timezone offset and span at most10seconds. There is no
cross-realm clock synchronization claim. Both UI account projections must agree,
and the original worker's four-field JSON order and values must equal the UI
handler's source-derived projection in all four actor samples. A different field
order is a refusal, not normalized away. Each reply retains the existing16KiB
bound; larger escaped account values may therefore refuse even within field
character bounds.

The runner retains partial samples after failure, never retries, and requires
the original packet object plus current enclosing ownership when consuming a
completed packet. A serialized copy cannot restore that lifetime. Paired matching
values do not prove actor object identity between samples, future worker use,
exclusive channel recipients, delivery, producer completion, or a continuous
unchanged interval.

## Verification and remaining work

Focused synthetic cases exercise exact field order, hostile accessors, proxy
effect rejection, foreign identities, changed transport, lost owner, malformed
replies, clock drift, paired actors and single consumption. A local V8 inspector
case uses the actual fixed commands with side-effect checking and real Date
intrinsics over synthetic application owners. It is not connected EasyEDA proof.

The String owner now invokes this collector after its versioned PCB sweeps and
worker-producer collection. Fixed TypeScript and PowerShell/C# adapters route
only the original contexts, and the journal retains the bounded packet. Both
initial and inspect responses expose a compact summary of the combined record.
This implementation is not connected validation or native clock issuance.
Backend actor provenance, original Windows clock issuance, Save server-time
observation, hidden producer receivers, upload/replay exclusion, one-shot String
creation/Save, complete closed SQL and saved reopening remain requirements.
The existing String history/SQL model flags and every writer-authority flag stay
false. No public writer is registered by this collector.
