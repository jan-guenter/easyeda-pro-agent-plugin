# String actor, Windows clock and Save-time groundwork

This batch adds original String-owned actor/SQL attribution, a private Windows
clock collector, a dormant fixed server-time RPC and conditional timestamp
composition. It does not register a String writer or authorize Save. None of its
tokens can be reconstructed from JSON or borrowed from PCB/SCH rename work.

## Checked source

These installed application assets were read as inert text and checked against
their complete hashes. No application code or production design was run or read.
Offsets below are zero-based JavaScript string positions, not byte offsets.

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `resources/app/app.js` | 2,657,192 | `52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c` |
| `pro-mgr/3.2.184.355087e9/js/project-worker.js` | 2,181,284 | `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928` |
| `pro-mgr/3.2.184.355087e9/js/ws-service.js` | 855,142 | `7a372d7271225999c3d16bcef1cd91c0fa2d3a1a402ebcf9761442ecf3187453` |

APP `L3` near2602467 selects the backend actor UUID from `ctx.user.uuid` and
the name fields from the target project's SQL `users` table. A missing row gives
empty name fields. It samples its own `Date.now()`; `PB` constructs `EDIT_HEAD`.
UI account names are not a substitute for those SQL names, and a renderer value
does not prospectively prove the later backend request's `ctx.user`.

WORKER `Mb.rpcCall` at8711 is pinned as an exact273-character method. `Lg.subscribe`
near2115332 retains the bus identified by `/<windowTabId>/notify`. `saveCanvas`
near2144972 obtains `/pro-mgr/serverTime/now` from that bus, advances its maximum
ticket, passes that value and the retained `this.user` into `asyncCompressFull`,
then calls `uploadLocal`. Save may follow different branches if consistency data
is missing; this new collector does not establish the eventual Save branch.

WS near851590 implements that server-time topic as `Date.now()+Jd`. `Jd` begins
at zero but can change with pong data. Thus a renderer/worker local Date sample,
a Windows sample and the future Save's RPC response are three different inputs.
The probe's scalar is not the future Save's own clock response.

This first profile intentionally refuses a server scalar outside the local
request bracket. It supports only the conservative near-zero-offset case, with
the bracket's elapsed time as the allowance; it neither estimates `Jd` nor
proves that `Jd` is zero. Nonzero offsets that move the result outside either
boundary are tested refusals. Future Save history is likewise required to fit
its independent native `armed`→`post` bracket. Arbitrary offset support would
need a separate reviewed model; a prior RPC cannot prove future offset stability.

The native collector was derived from the reviewed `EasyedaClockObservation.Read`
in `scripts/windows-authority.ps1`. It reuses the pure sample schema/validator,
not the ordinary authority's issuance, lifetime, clock attachments or tokens.

## Implemented boundaries

`current-pcb-string-save-provenance.ts` accepts only the original completed
six-sample String actor packet, its original runner and a completed original SQL
reader inventory. It checks project/branch membership, retains the exact worker
user JSON and projects a backend actor candidate from the selected SQL row.
The full users-table and selected-row digests remain attached. Missing users keep
empty names. It consumes one attempt per original actor packet, even if later SQL
admission fails. Source ownership/freshness and backend request identity remain
unproved; the original SQL reader alone does not prove either.

`current-pcb-string-clock-reply.ts` captures bounded own-data replies immediately
on arrival, before a post-await ownership hook. It rejects proxies, accessors,
cycles, custom array prototypes and unbounded data, and retains a frozen copy
plus its exact captured JSON digest. Neither native nor server-time evidence
returns a mutable alias to the transport's arrival object.

`current-pcb-string-native-clock-source.ts` contains the exact C# collector copied
between markers in `pcb-diagnostic-owner.ps1`; a focused parity test compares
them byte-for-byte after trimming. Each read uses presence-only `TZ` inspection,
UTC and high-resolution QPC brackets, a local timezone offset and a SHA-256 of
serialized timezone rules. It does not modify environment/timezone settings or
launch, discover or close any process.

The diagnostic helper's private `string-clock` action requires the String
purpose, completed original launch and exact retained helper/Job/root binding.
It accepts no client path, PID lookup or clock scalar. Live phases are
`before`, `armed`, `post`; each calls `AssertLive` before, between and after the
two native reads. `termination` separately requires genuine root and whole-Job
termination before, between and after its reads, plus the original installation,
pipe and Job-limit checks. A diagnostic-purpose or unlaunched owner refuses.

Attempts are consumed before collection. Live phases require exact order and
next sequence; termination may bridge a bounded forward sequence gap when a TS
pre-dispatch refusal consumed an attempt the helper never received. It never
accepts a stale sequence, repeats a phase or reopens live collection. This is
cleanup evidence, not an allowance to retry an uncertain clock observation.

`CurrentPcbStringNativeClockIssuer` is retained inside the genuine diagnostic
owner. It pins its original transport methods and binding, copies replies before
hooks, and privately issues the phase tokens. Token lookup checks original
object identity before reading caller fields. The owner's private
`observeStringNativeClock` wrapper serializes calls and rechecks installation and
the retained native owner. No public action or precreate dispatch was added.
This does not retrofit clocked-launch evidence: that limit remains false.

`current-pcb-string-server-clock.ts` contains an unregistered fixed
`Runtime.callFunctionOn` command. It checks the original worker project/branch/
window, retained four-field user bytes, original bus hierarchy and exact
`Mb.rpcCall` source. It makes one request to the fixed time topic, verifies the
ticket advanced exactly once, and checks the reply inside its local bracket.
This is **effectful**: it consumes a bus ticket and installs a reply subscriber.
`throwOnSideEffect` is false. Timeout clears only the agent's deadline; it does
not cancel the application's RPC or establish that its subscriber disappeared.

The server-clock runner binds that request to the original actor/SQL selection
and worker context and consumes it once across runner instances. Its wire
adapter reconstructs only the fixed command from checked own data; it never
serializes a caller's nested argument array or inherited `toJSON` hook. Native
RPC routing, exclusive service/responders, callback completion and producer
binding are **not registered or admitted** by these files.

`current-pcb-string-save-clock.ts` joins original native `before`/`armed` tokens,
the original server-clock packet and actor/SQL selection while their owners are
still current. It checks native UTC/QPC ordering and matching timezone/rules,
then seals separate Save and backend windows of at most60seconds. The server
sample must fit inside the independent native brackets. Window bounds are fixed
before Save; no later timestamp widens them.

The original `post` token is sealed while the process is live. After genuine
termination, comparison revalidates only the original terminal token, not a
revived pre-close owner. Supplied Save time must fit `armed`→`post`; backend
`EDIT_HEAD` time may follow the immediate post reply, but must fit the frozen
backend window and termination bound. Exact worker/backend actor bytes and the
target document must match the original history projection. This remains a
conditional supplied-history comparison, not proof that Save or SQL occurred.

## Remaining integration, in order

1. Establish destination isolation and exclude old persistent upload/replay work
   for the selected disposable project. A retained Windows Job, current profile,
   or successful native clock read does not isolate filesystem/network outputs.
2. Keep an original live coordinator with fixed source/realm admissions, complete
   producer state, durable intent and a global unresolved-operation gate. Wire
   the one fixed server-time command through the private native protocol only
   under that original coordinator. Do not add a public arbitrary RPC endpoint.
3. Retain the native `before` token, collect the original actor/SQL selection and
   sole server-time response, then native `armed`. Seal the clock plan while all
   relevant owners remain current. Persist its evidence before dispatch; journal
   bytes record facts but do not reconstruct issuer authority after restart.
4. Before one create or Save invocation, durably consume the corresponding
   original intent and prove the operation-specific eligibility capability.
   The dormant lifecycle ledger is attempt accounting, not that capability.
   An ambiguous call is not retryable. No additional Save may be used as proof.
5. Capture original publication/Save replies and post state, record native
   `post` while live, finish normal close without choosing Save/Discard, and
   prove root plus whole-Job exit before native `termination` and closed SQL.
6. Join original closed SQL/history evidence to the sealed actor/time relations:
   exact DOCHEAD user, EDIT_HEAD actor, `projects.modifier_uuid`, target history,
   timestamps and complete unchanged peers. The selected backend UUID remains
   a precommitted expectation until those transaction-specific results agree.
   Do not substitute `/api/user`; it does not attest the later upload's context.
7. Complete generation/worker/upload closure, one fresh-owner reopen and visual
   acceptance. Reopening equality alone cannot prove there was no hidden prior
   upload or replay. Only then may a distinct operation issuer grant a writer
   result; these current modules never set execution/Save permission to true.

The clock relationship requires the common OS clock, ordinary reviewed Date/VFS
implementations and no intervening clock/timezone changes. Matching boundary
samples do not prove a continuously unchanged interval or directly sample the
backend's Date call. Those assumptions remain explicit even after a supplied
history matches; they are not replaced by a boolean input.

## Verification scope

Focused synthetic checks cover original-token ownership, actor/SQL mismatch,
empty SQL names, exact user serialization, single consumption, malformed replies,
post-await mutation, retained-result immutability, transport/method substitution,
native phase ordering and failure cleanup, collector parity, and sealed-clock
comparison after actor closure. Native CompileOnly smoke cases exercise
unlaunched/purpose/input/replay and terminal-sequence-gap refusal without creating
an application process. Those smoke cases must run after final helper/source pin
sync; this subtask has not executed them against Windows.

No connected clock, server-time, Save, closed-SQL or reopened String lifecycle
qualification is claimed. The batch does not use a production design for any
test, inspection or hash comparison.
