# Generation 209 actor and clock source qualification

This source review adds private generation 209 adapters for the existing
startup actor bracket and the UI/worker/PCB actor bracket. It does not enable
an MCP operation, create a native session, send a server-time request, or Save.
The generation 206 source profiles and collectors retain their contracts.

## Exact source closure

The reviewed application is `3.2.209.8a704eab`. The five assets below were read
as inert source files. The private qualifier checks their complete UTF-8 byte
length and SHA-256, then the UTF-16 slices recorded in
`current-pcb-209-actor-clock-source.ts`. The qualifier accepts no alternate
profile, digest, path or source override.

| Asset relative to `resources/app/assets` | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-ui/3.2.198.2800f583/js/ui.js` | 17,468,192 | `3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6` |
| `pro-mgr/3.2.185.bf63a159/js/project-worker.js` | 2,181,308 | `0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046` |
| `pro-mgr/3.2.185.bf63a159/js/ws-service.js` | 855,142 | `7adb29ba4ea0bee9729caadc01c154d9299b1fc42e12f1c3f46e4343b5040e00` |
| `../app.js` | 2,657,192 | `52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c` |
| `pro-pcb/3.2.195.6b67774e/js/pcb.js` | 10,991,441 | `a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b` |

The resulting source closure digest is
`b54f9a6ec52c7f5e55536752d2e4717f7200a9df17a3e99e24ea71d7dfad445b`.
It describes source bytes, not runtime contexts or process ownership. The
backend file matches the existing 209 launch profile. The websocket service
is an additional source dependency; the old 206 clock pin remains unchanged.

## Actor and clock behavior

- The UI login-user service returns fields in the order `uuid`, `nickname`,
  `username`, `avatar`. Worker `Lg.subscribe` obtains that reply once when
  `this.user` is absent. A later UI account read alone cannot establish the
  retained worker user or a future callback's receiver.
- Worker `saveCanvas` obtains server time through its original `wsBus`, then
  supplies that number and its retained `this.user` to `asyncCompressFull`.
  The exact 273-byte `Mb.rpcCall` body matches the existing fixed server-clock
  program. `Lg`, `Gd`, `JP`, `KP` and `Mb` remain the source classes used by its
  receiver checks.
- The actual websocket service responds to `/pro-mgr/serverTime/now` with
  `Date.now() + Jd`. `Jd` starts at zero and changes on a pong containing server
  UTC time. Matching the service file does not establish which live responder
  answered an RPC, the remote clock's accuracy, or the current offset.
- Backend function `L3` selects username and nickname from project SQL using
  the request user's UUID, and function `PB` adds `EDIT_HEAD` metadata. Its
  timestamp uses the backend's own `Date.now()`. This is separate from both
  the worker's retained DOCHEAD user and the worker's server-time response.
- The PCB sample reads its realm's local Date. It contains no actor or document
  identity. The native owner must bind the original PCB context independently.
- The Windows clock collector uses retained native owner handles, UTC/local
  time, QPC and timezone evidence. It has no EasyEDA asset offsets to port.
  Its existing implementation and ownership checks are reused unchanged;
  this source review grants it no new owner admission.

## Private adapter contracts

`CurrentPcb209WorkerStartupActorRunner` requires a genuine source qualification
and an original startup transport. It reuses the four-sample collector and
preserves the original constructor callback contract. The enclosing 209
construction owner must supply that callback; the adapter does not reconstruct
a PROJECT from matching fields.

`CurrentPcb209ActorClockRunner` similarly reuses the six-sample collector with
three distinct original source contexts. Both adapters return a distinct 209
packet containing the original collector packet. Their original-observation
methods return the genuine runner and packet for downstream provenance checks.
Copied reports and copied packets cannot replace those objects. Original owner
checks remain active before and after observation awaits and when consuming
the retained packet.

The six-sample adapter can generate the fixed server-time command from its
retained worker context, identity and ordered user text. It does not send the
command. The request has ticket/subscription effects and still requires an
original native owner plus durable clock-ledger intent. Its response is not the
response used by a future Save. An offset outside the local request bracket
still refuses; this change neither estimates an offset nor widens clock bounds.

All source and adapter packets retain explicit false claims for native source
ownership, native intrinsic verification, clock provenance, future Save time,
compatibility admission and writer authority. Runtime responder ownership is
also unresolved. The complete contained writer owner remains separate work.

## Verification

Under Node `24.18.0`, npm `11.16.0` and disabled core dumps, strict type-aware
lint passed for the new modules and test file. The new refusal tests and the
existing startup actor, six-sample actor and server-clock suites passed:
29 tests, no failures or skips. The actual V8 constructor checks in the existing
suite exercise synthetic application objects; they are not connected EasyEDA
validation.

A separate local source audit parsed the installed assets with Acorn, retained
the selected source spans privately, and successfully qualified the five-asset
closure. Its offline adapter check ran the unchanged fixed programs in synthetic
VM fixtures through both new wrappers. It proved the 6/4 sample sequences,
original-packet retention, rejection of copied qualifications and packets,
refusal after owner loss, exact current RPC source equality, and fixed command
generation without sending it. No EasyEDA process, native clock request,
server-time RPC, project, Save or production file was involved.

The private audit is retained under evidence identifier
`easyeda-209-clock-source-o_gd0pdb`; raw vendor text and generated evidence are
excluded from the repository. Activation still needs independent
review of the new websocket-service source pin and admission by the original
generation 209 native owner. No release or installation is claimed here.

## Same-day integration

The [startup batch](2026-10-24-startup-baseline-clock-batch.md) subsequently
completed independent source review and connected the four-sample adapter to
the separate disposable startup tool through its original native owner. The
six-sample PCB adapter and server-time command remain private. The earlier
source-only verification above remains unchanged; connected execution of the
new startup tool is still pending the installed release.
