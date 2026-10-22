# PCB compiler and Save-participant observation

## Scope and status

This batch adds a bounded, non-pausing route from the existing PCB Save RPC
subscriber to its original lexical owners. It reads the main compiler, loaded
custom-footprint compilers and dynamic-copper manager without calling the
subscriber, its handler, Save, a model getter or a vendor method.

The source trace and synthetic Node24 inspector test support this route.
They do not qualify execution on EasyEDA's custom Electron/V8 build. The
worker-only disposable-project opener does not reach it: that opener refuses
new/restored editor iframes. This observer requires an independently retained
existing PCB default frame with its exact source already admitted. It must not
be enabled by relaxing that opener's frame guard.

Implementation:

- `current-pcb-diagnostic-model-program.ts`: three immutable programs, bounded
  by-value state decoder and explicit false authority/completion claims.
- `current-pcb-diagnostic-model-scope.ts`: fixed function-location and scope-zero
  decoders; private remote handles are not public selectors.
- `current-pcb-diagnostic-model-runner.ts`: one-shot eight-request choreography,
  original-owner checks between requests and original object-group release.
- `current-pcb-diagnostic-model-program.test.ts`: focused synthetic coverage,
  including a real in-process inspector session, no TCP listener or child.

Five focused model tests and six protocol-adapter tests pass under pinned
Node24.18.0 with test isolation. The inspector case also proves that releasing
the selected object group invalidates all six retained function/scope handles
in that synthetic session. Strict targeted type-aware lint has no warnings.

Fixed program inventory after the16/32-character custom-ID correction:

| Program | UTF-8 bytes | SHA-256 |
| --- | ---: | --- |
| Callback selector | 2204 | `f1b6e32a10f64af767d6a29a679e0e906625585bc1d5514fef6dce3c2605776e` |
| Handler selector | 1730 | `548c8af51fad2c6c11b47623dc845ed1e8031563756912bc6e16d004a2314591` |
| State reader | 7741 | `67d4081399cdc22be17e2e1ddd0be234290092a2c5287f629fc2de9be16b85a5` |

Owner/protocol/native/lifecycle integration is maintained separately in this
batch. This document does not assert a connected result, writer qualification
or release completion.

## Reviewed installed source

Read inertly, never imported or evaluated:

`C:\Program Files\easyeda-pro\resources\app\assets\pro-pcb\3.2.193.682ed44e\js\pcb.js`

- Bytes: `10976299`.
- SHA-256:
  `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33`.
- Source positions below are zero-based UTF-16 offsets in the decoded JS string,
  not byte offsets. CDP locations use zero-based line/column positions.
- The bundle's outer IIFE spans offsets `0..10969488`. Its renderer/compiler
  classes are lexical bindings, not globals available to ordinary evaluation.

| Participant | Source offsets | Relevant raw layout |
| --- | --- | --- |
| Published PCB bus | `1015912..1016971` | `HJ`, global `MSG_BUS_PCB`, own `messageBus` |
| Actual bus implementation | `9658..27535` | `Xb()` supplies `oM.MessageBus`; do not confuse duplicate implementations later in the bundle |
| Subscription task | `14791..15010` | `Z1e` owns `callback` and `isRunning` |
| RPC wrapper | `16078..16342` | Captures original handler parameter `t`; location line30/column14676 |
| Save handler | `10798714..10799009` | Async handler; location line91968/column9858 |
| Renderer environment | `3215164..3224075` | `qT`, alias `x`, static `env`; raw `_compiler`, `_id`, `_doctype`, `compilerChannel` |
| Main compiler | `3194265..3201020` | `Zu` extends `BY`; the pending-upload state is on `base`, not `Zu` itself |
| Shared compiler wrapper | `3156621..3157003` | `_8e` constructs `sCe`, passes it to its parent and `A8e` |
| Compiler base | `3138434..3148310` | `A8e`: flags, pending buffers, timer/promise, subscriptions, channel and consistency owner |
| Consistency state | `2754327` onward | `sCe`: own `unique`, `client`, `maxTicket`, pending/local-change flags |
| Compiler registry | `3133961` onward | `mCe.compiler[headType]` maps unique ID to original `A8e` |
| Footprint manager | `4309947..4312925` | `Dm`, alias `wi`, static `manager`, optional alternate-project manager selection |
| Footprint owner | `4299281..4309942` | `aC`; custom subclass `Al`; own `_uuid`, `instance` |
| Footprint compiler | `3201025..3207233` | `XS` extends `v8e`, then shared `_8e`/`A8e` |
| Dynamic copper | `6438262..6439980` | `ON`, alias `FP`, static `manager`; `openPcb`, optional `workerName`, `time`, `_bus` |

The reviewed Save handler first visits loaded `Al` footprints, then the main
compiler, then dynamic copper. Therefore a main-compiler-only check is not a
Save-participant baseline. The observer follows the raw ownership links that
the handler uses, without executing that sequence.

The environment's `compiler` getter lazily constructs a compiler and changes
consistency flags (`3216913` onward). It is deliberately not used. Static
`getInstance()` methods likewise create managers and are not used.

Custom footprint IDs are generated from a PCB document ID plus an underscore
and `cr()` output (`4311113` onward). `cr()` calls `Wg()` (`3242467` onward);
`Wg()` encodes an eight-byte random buffer (`2753521..2753671`). Ordinary PCB
document IDs are admitted in16- or32-hexadecimal-character form by the sealed
disposable target schema. The supported custom-ID form therefore uses either
document length, underscore, then16 hexadecimal characters. Both prefixes are
covered by the focused synthetic tests;64-character/custom arbitrary prefixes
refuse. There is no path/title fallback.

## Non-pausing reachability

The route is fixed:

1. Read the singleton, running `pcb/saveCompiler` subscription through own
   data descriptors and return its original wrapper function.
2. Inspect that function's internal location and scopes. Require the retained
   source-admitted script ID and exact wrapper location.
3. Select only scope zero, described as `Closure (rpcService)`.
4. On its V8 scope wrapper, read the own `object` holder and its own `t` field.
   This returns the original async handler, without invoking either function.
5. Check the handler's original script/location and select only its first
   `Closure`. Read the selected original class bindings through its holder.

V8's inspector test demonstrates non-paused function-scope inspection through
`Runtime.getProperties`; it does not require a paused call frame. This adapter
does not copy that test's function invocation. It starts from the existing
published callback instead. [V8 function-scopes test](https://github.com/v8/v8/blob/14.6.172/test/inspector/runtime/function-scopes.js)

The V8 implementation assigns `internal#scopeList` and `internal#scope` remote
types, and represents scope variables through the wrapper's `object` property.
It distinguishes this representation from ordinary objects. These internal
details are version-specific; missing/optimized bindings or changed descriptors
must refuse, not trigger a pause-based fallback.
[V8 value-mirror implementation](https://github.com/v8/v8/blob/14.6.172/src/inspector/value-mirror.cc#L1415-L1443)

No arbitrary scope index, function name, expression, debugger call frame or
global alias is accepted. Scope variables and function source are kept private;
the implementation never enumerates the complete renderer closure.

## Fixed transport contract

The one-shot runner sends eight commands on the original page session:

| Request | Fixed operation | Retained input |
| --- | --- | --- |
| 1 | `Runtime.evaluate` callback selector | Original unique context; fixed object group |
| 2 | `Runtime.getProperties` | Original wrapper handle |
| 3 | `Runtime.getProperties` | Wrapper's original scope-list handle |
| 4 | `Runtime.callFunctionOn` handler selector | Wrapper's original scope-zero handle |
| 5 | `Runtime.getProperties` | Original async-handler handle |
| 6 | `Runtime.getProperties` | Handler's original scope-list handle |
| 7 | `Runtime.callFunctionOn` state reader | Handler's scope-zero handle; original wrapper as sole remote-object argument |
| 8 | `Runtime.releaseObjectGroup` | Fixed group `easyeda-pro-control-pcb-model-v1` |

The final reader reselects the fixed current subscription and requires it still
equals the retained wrapper. It also rechecks original environment/compiler/
manager/channel references before returning.

Both execution methods require `throwOnSideEffect:true`, `silent:true`,
`awaitPromise:false`, `generatePreview:false` and `userGesture:false`.
The initial evaluation also uses `timeout:1000`, disables the command-line API
and CSP unsafe-eval override, and returns a remote object. `callFunctionOn`
does not define a timeout parameter; its original transport deadline remains
mandatory. The scope selector returns a remote object; the snapshot returns only
a JSON string. Property calls request own properties and no previews. The CDP
contract also supplies the object-group mechanism used for cleanup.
[CDP Runtime protocol](https://github.com/ChromeDevTools/devtools-protocol/blob/master/pdl/js_protocol.pdl)

The runner consumes its one shot before dispatch and checks the original owner
before/after every observation request. Failure stops further observation.
Cleanup attempts only that original object group; failed release withholds the
result. A poisoned transport must reject without dispatch, not reconnect or
select another session. Outer owner guards must bracket this sequence with
current target/frame and native-lifecycle checks.

Side-effect checking is an additional V8 execution restriction, not proof of
trusted intrinsics, complete state or ownership. Ordinary descriptor reflection
can encounter proxy traps; the synthetic inspector test confirms a state-changing
trap is refused without incrementing its counter. `getProperties` is not given a
nonexistent side-effect flag and is not described as universally effect-free:
its use here is limited to the two original functions and their synthetic scope
lists. [V8 side-effect checker](https://github.com/v8/v8/blob/14.6.172/src/debug/debug-evaluate.cc)

## What the snapshot establishes

The selected main compiler must be the raw environment `_compiler`, with the
reviewed `Zu` prototype. Its `A8e` base and `sCe` consistency manager must be
the same objects referenced by the outer compiler. Its base must appear under
the raw consistency unique ID in the same environment compiler channel's PCB
map. Each admitted custom footprint uses the equivalent FOOTPRINT map and its
reviewed `XS`/`A8e` owners.

The output contains opaque IDs, boolean flags, selected counts, raw pending
length/ticket scalars and absent/undefined/null/present markers. It omits project
paths/titles, queue values, model geometry, primitive text, library payloads,
history contents and client identity. Footprint iteration is capped at128;
only exact reviewed ordinary/custom prototypes are admitted. Alternate decoding
project selection refuses.

Dynamic-copper worker ID zero remains a present value. It must not be collapsed
to absence merely because the vendor Save method uses a truthiness check.
Timer/bus markers describe raw fields, not a live worker or completed request.

Canonical JSON is at most63,467bytes under the admitted schema's maxima; the
raw reply cap is65,536bytes. That leaves room for owner metadata and false claims
within the lifecycle's128KiB publication bound. Scope metadata is separately
bounded and is never included in that public result.

## Later same-day integration

The combined model result now adds
[raw String observation](2026-10-20-current-pcb-raw-string-observation.md) and
[pending-producer observation](2026-10-20-current-pcb-pending-producers.md)
to the compiler sample described above. It takes ten fixed commands including
object-group release and enforces the unchanged128KiB aggregate cap. The
three samples share a document identity but are not atomic.

The raw reader covers a bounded parentless String subset, including watcherless
models and unnormalized identity/order fields. The pending reader covers the
listed upload buffers, current command, teardrop state and local copper-worker
references. Neither completes the wider prerequisites below or qualifies a
connected runtime.

## Remaining writer prerequisites

This is not a complete String or whole-model baseline. Still required:

- All model-family membership and source ownership, including ordinary String
  objects omitted from public DTO lists when their state watcher is absent.
- Complete source correlation for raw String z-index, global index, partition,
  parent/group relationship and model type. The `nP` base (`3424326..3425340`) exposes normalized getters;
  `rd` (`3980353..3988148`) also has lazy box/base-backed getters. Public DTO
  equality cannot substitute for these raw fields.
- Full geometry/base/box state and other unchanged model families, plus
  populated Image, Dimension and polygon-Pad qualification.
- Complete pending-producer participation and completion beyond the new bounded
  snapshots, including historical command payloads, dynamic-copper worker
  liveness/CDP association and renderer/project-worker association.
- One authorized String mutation, original publication/Save/normal-close path,
  full closed database/content/peer-document comparison, reopen verification
  and no-repeat recovery under the same retained owner.

Zero counts, absent timer fields, source discovery and a successful synthetic
read do not establish completion. The returned claims for complete membership,
complete producer inventory, worker association, queue completion, Save/edit
authority, continuous observation and native-intrinsic qualification stay false.
