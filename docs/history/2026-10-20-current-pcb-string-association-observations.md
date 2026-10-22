# String producer association and empty exclusions

## Implemented observations

Three new fixed reads are separate from the diagnostic owner. They add no
request to its 64-request budget and remove no exclusive-branch guard.

| Fixed program | Original target | Selected state |
| --- | --- | --- |
| `CURRENT_PCB_STRING_RENDERER_ASSOCIATION_FUNCTION` | PCB Save-handler scope zero, retained callback argument | Compiler identity, source-defined data bus, complete compiler registry, channel locks, loaded and alternate footprint membership |
| `CURRENT_PCB_STRING_WORKER_ASSOCIATION_EXPRESSION` | Admitted project-worker unique context | Project/branch/window identity, source-defined worker bus, complete empty upload/task/token membership |
| `CURRENT_PCB_STRING_EMPTY_PRODUCERS_FUNCTION` | Same PCB scope/callback | Ratline model/view maps, network maps, cluster maps and network notification state |

These require three extra calls per supplied sweep. The renderer reads reuse
the six-request original Save-scope acquisition. All reads require
`throwOnSideEffect:true`; no selector, expression or native method comes from
the caller. Replies have a 16 KiB bound and strict wrappers. All ownership,
complete-baseline, completion, delivery, execution and Save claims stay false.
They are not individually exposed. The separate registered String-precreate
workflow invokes them within its fixed90-request owner; diagnostic64 is unchanged.

The empty observations reject occupied selected collections rather than
discarding their contents. The selected registry and empty collections are
complete for those fields, not a complete pending-producer inventory.
Two separately sampled replies do not form an atomic baseline.

## Pinned source

Installed sources were read as inert text and rehashed. Offsets below are
zero-based JavaScript string positions, not bytes or line numbers.

| Asset below `resources/app/assets/` | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-pcb/3.2.193.682ed44e/js/pcb.js` | 10976299 | `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33` |
| `pro-mgr/3.2.184.355087e9/js/project-worker.js` | 2181284 | `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928` |

PCB `A8e.initProject` at3141415 obtains its data bus from
`Dte("/" + windowId + "/project/" + path)`. `Dte` at3131133 retains the
constructed `J` BroadcastChannelMessageBus in `self[channelName]`.
The reader checks that exact retained reference and the bus's channel name.
It also checks base path, document, window, consistency token and client.
`_8e` at3156621 passes the window-tab ID as the `sCe` client argument.
The client is consequently not assumed to be a16-character random token.

Worker bootstrap at2176876 extracts project and window IDs from the worker
name, obtains `Hj` through `wa` at1711077, and passes it into `Lg` as
`PROJECT.workerBus`. `wa` retains its `JP` bus under the same realm-local
channel key. The worker reader checks this reference and its channel name.

Both reads select only the native `BroadcastChannel.prototype.name` getter
on an exact-prototype receiver with no own-name override. Chromium146 exposes
the readonly attribute on Window and Worker, and its native getter returns
the stored `name_` field. This source fact does not prove the installed
custom runtime has pristine intrinsics or will admit the getter under its
effect checker. Refusal must not fall back to ordinary evaluation.
[Chromium IDL](https://github.com/chromium/chromium/blob/146.0.7680.188/third_party/blink/renderer/modules/broadcastchannel/broadcast_channel.idl),
[native getter](https://github.com/chromium/chromium/blob/146.0.7680.188/third_party/blink/renderer/modules/broadcastchannel/broadcast_channel.h#L50-L53).

The supplied comparison matches project, window and channel name and requires
distinct bus UUIDs. It establishes only the supplied source-defined channel
relation. A matching name does not prove an open channel, original OS owner,
exclusive subscribers, storage-partition equality, publication delivery,
complete capture interval or absence of other senders.

`mCe` at3133961 owns its compiler maps and lock fields. The renderer reader
lists every registry key, admits only reviewed head families, requires the
sole PCB entry to be the original base under its consistency token, and
requires other admitted maps empty. It preserves lock state without claiming
the channel is unlocked. `Dm` at4309947 owns loaded and alternate footprint
managers; both complete inventories must be empty.

The worker read checks every member of the selected two upload Maps and nine
task Sets by requiring native empty collections. It also requires the complete
consistency `uniqueIds` dictionary empty. This is a pre-create exclusion, not
a post-create or post-Save proof. The existing worker diagnostic supplies
separate flags and watcher/timer counts; latent debounce closures remain outside
both samples.

## Ratline, network and notification exclusions

The additional renderer read checks these source-owned fields:

| Owner | Source offset | Fields |
| --- | ---: | --- |
| `MI.manager`, class `w4` | 3917595 | `map`, `idMap`, `_lastRatline`, optional `_last` |
| `jo`, class `mpe` | 8149271 | `map`, `idMap`, highlight/click/hover Sets |
| `ze`, class `Yde` | 7963914 | `map`, `noneNetMap`, lengths, modifications, rubbish, options, update lists, gray state and optional view groups |
| `ze.debounce`, class `U5` | 5436598 | callback/frame markers, initial `lastTime:-1`, `delay:0` |
| `pP` | 4360581 | Complete network-node Map |
| `h_`, class `HSe` | 4352366 | Complete wire-cluster Map |
| `aE`, class `USe` | 4351966 | Complete jump-wire Map |
| `h0` | 4352485 | Raw `useWireClusterCache` and `emptyNetChange` booleans |

The source starts `emptyNetChange` true, so the read preserves that value rather
than mistaking it for a pending timer or normalizing it away. Network notification
callbacks and animation-frame IDs must be nullish; optional fields retain absent,
undefined and null separately. A present empty view-group array remains distinct
from an absent field. Stale retained ratline objects refuse.

## Corrected supplied prerequisite

`A8e.initProject` assigns `isDestroy=false` at3142744 before awaiting project
initialization. The old supplied Save-prerequisite model required null and thus
excluded the actual initialized branch. It now requires literal false, rejecting
null, undefined and falsey substitutes.

The history restriction remains unchanged. `kde` at7922234 initializes
`undoCommand=[]`, `redoCommand=[]` and `stack=null`. The smart-dimension
controller's eagerly created empty `De` is a different field and owner.
It is not a reason to admit an existing history stack.

## Separate post-create and post-Save observations

Two further fixed worker programs have distinct literal schemas:

- `CURRENT_PCB_STRING_WORKER_AFTER_CREATE_EXPRESSION` requires the complete
  `uniqueIds` dictionary to contain exactly one token, one PCB document and
  one native String ID.
- `CURRENT_PCB_STRING_WORKER_AFTER_SAVE_EXPRESSION` requires exactly one token
  whose complete document dictionary is empty.

`ja.remoteChange` at296338 creates the token/document/ID membership.
Token-selected `compress` at287014 clears the selected Set and deletes its
document property; it does not delete the token dictionary. These fixed readers
preserve that distinction. They never convert a pending token into empty state.
Both still require the selected task and upload collections to be observed empty,
without claiming that every producer completed. Their identities must be joined
to the original renderer, token, native acknowledgment and phase by a lifecycle
owner before use.

The new `CURRENT_PCB_STRING_COMMAND_STATE_FUNCTION` observes the other side of
that relation through the original Save-handler scope. For the source-defined
`string-create` handler at10393717 it requires:

- One current `De` stack with description `create texts for api`, no undo/redo
  peers, and the exact constructor flags.
- One `G6` add command with its source-cleared marker, no captured old `data`,
  no group, and no additional command or waiting-upload member.
- The same native ID as the sole String model in `bo.manager`, with `Jr` still
  bound to that original manager.
- Empty shared BOARD/POURED/INNER upload buffers and empty teardrop inputs.

`G6.uploadData` at4737173 clears its `source` to undefined after publication.
`De.upload` at7917595 clears its ID map. The teardrop callback at9092131 can
remain scheduled after the create RPC, so the observer reports its timer as
null or present. It does not equate a null timer with observed completion.
The retained command can remain after Save; its shape does not determine phase.
No post-phase reader executes a command, flush, timer, publication or Save.

## Evidence and remaining work

Focused synthetic tests cover nonempty membership, alternate compiler registries,
bus substitution, mismatched identities, raw flag distinctions, malformed
wrappers, duplicate keys, signed zero and hostile descriptors. A real in-process
Node24 inspector executes all six fixed programs over synthetic classes with
side-effect checking and rejects state-changing Proxy traps before their counters
change. Its synthetic channel getter is not a browser-native getter qualification.

No EasyEDA process, worker or design was opened by these tests. Complete original
owner issuance, no-interaction lifetime, latent `eL` move state, startup/subscriber
effects, source/assets, post-create queue effects, original publication capture,
one-shot Save and closed/reopened proof remain separate requirements.
