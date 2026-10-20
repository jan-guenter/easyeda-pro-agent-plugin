# PCB compiler document metadata

`current-pcb-common-metadata.ts` adds a dormant descriptor-only observer of the
original PCB compiler's complete `docDetail` object, a strict reply decoder and
a pure selected META-body encoder. It does not call `getDocDetail`, FileSource,
any native getter, compiler serializer or Save. It has no runtime registration.

The observation carries `documentUuid`, `projectUuid`, `compilerUniqueId` and
one bounded graph root, `docDetail`. The graph preserves every supported own
field, including unknown fields, non-enumerable values, field order, aliases,
cycles, own undefined and signed zero. Unsupported values refuse rather than
disappearing. This is observed metadata, not a complete PCB baseline or DOCHEAD.

## Source and owner binding

The inert PCB asset is `pro-pcb/3.2.193.682ed44e/js/pcb.js`, 10,976,299 bytes,
SHA-256 `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33`.
Offsets below are JavaScript string offsets. No vendor source was evaluated.

| Source | Contract |
| --- | --- |
| `Zu`3194265, `getDocDetail`3194711, `onDocDetail`3199775 | The getter returns `this.docDetail`; the callback directly assigns its incoming data to that property before forwarding to the handle. |
| `BY`3166073, `_8e`3156621, `A8e`3138434 | The PCB compiler owns its project identity, base compiler and consistency manager. The base owns document UUID, project path, head type and channel. |
| `sCe`2754327 | The consistency manager stores its generated unique identifier directly. |
| `x.compiler`3216913, `x.projectId`3220621 | The public compiler getter can construct a compiler. Read `_compiler` directly, and bind the original `_tabId` instead of calling either getter. |
| `A8e.initProject`3141415 and its metadata delivery3143221 | Initialization passes returned data to the compiler's metadata callback. This does not guarantee that every historical DOCHEAD field is in that object. |
| `O8e`3122060, `P8e.meta`3094419 | META encoding selects `title,parent,source,board,zIndex` in that order, uses `zIndex || null`, then serializes the newly selected body. |

The fixed leaf runs on the already source/location-qualified original Save
handler's scope. It requires the retained original callback to remain the sole
active callback in the fixed registry before and after reading. Its five class
bindings are `x`, `Zu`, `A8e`, `sCe` and `mCe`, shared with the existing compiler
model reader. It binds the original environment, compiler, base, consistency
manager and channel by exact prototype/reference equality. Document UUIDs,
compiler project/base path, ordinary-project flags, PCB head type and exact
`document@project` tab identity must agree. The channel's PCB Map must contain
the base exactly once under its consistency identifier; an aliased alternate
key refuses. Other registry entries are not claimed to be empty.

Own `env.compiler`, `env.projectId` or `compiler.getDocDetail` shadows refuse,
including an own undefined value or accessor. Other metadata fields are kept
by the graph. The collector rechecks selected descriptors, object prototypes,
absence checks, collection entries and callback association before returning.
These checks do not prove pristine prototype methods or intrinsic integrity.
The retained transport must still use `throwOnSideEffect:true`; descriptor
inspection alone does not exclude Proxy traps.

## Plain-data specialization and bounds

The shared graph implementation now has two fixed internal variants. Existing
`CURRENT_PCB_COMMON_GRAPH_PROGRAM` remains byte-identical at4,658 bytes/SHA-256
`974123808609e6a2865d3ed6817622f2a5c187f54de090226de495eef4ee0224`.
The graph specialization alone preserves the original presentation, rules and
preference programs; this batch separately adds their qualified constructor
arguments, so the complete programs do change.
The metadata variant uses no model-class list, so it does not require unrelated
class bindings that V8 may omit from the Save handler's scope.

Metadata permits plain/null objects, dense arrays, exact Maps/Sets and the
existing finite scalar subset. Custom model instances are explicitly excluded,
including instances that the broader common graph can capture. The same limits
apply:524,288 UTF-8 reply bytes,4,096 nodes,4,096 keys/collection entries,
32,768 captured fields and graph depth32. The descriptor and serializer-presence
checks are shared; this is not a less restrictive collector fallback.

All five META source fields must be own data properties. An own undefined value
is preserved, but a missing property refuses rather than assuming that native
prototype lookup would yield undefined. Unknown data remains in the complete
graph. Accessors, functions, sparse arrays, symbols, unrecognized prototypes,
non-finite numbers, malformed Unicode and excessive graphs refuse.

## Selected META-body relation

`encodeCurrentPcbCommonMetadata(rawReply)` independently decodes the supplied
reply, accepts only scalar values for the five META fields, and returns their
ordered `bodyText`, `bodySha256` and the separate complete `rawGraphSha256`.
Native named property reads include non-enumerable source values. Own undefined
fields disappear from the resulting JSON, and every supported falsy zIndex
becomes null. No truthy value is normalized beyond JSON's scalar behavior.

The encoder does not enforce the ordinary-root semantic subset. Its consumer
must separately validate title, empty parent/source, board membership and the
stored zIndex shape, then join the unique surviving META record and complete
structure/history evidence. Equal META bodies can hide changes to unknown
metadata fields, so the raw graph commitment must also be retained.

Historical `client`, `version`, `editVersion`, `user` and `updateTime` are not
invented or derived from this observation. If present in `docDetail`, they remain
raw fields without a DOCHEAD claim. Historical header comparison remains a
separate supplied-record relation. Every original-owner, native-integrity,
atomicity, complete-baseline, stored-source, header, queue, effect, Save and
execution flag remains false.

## Checks

Seven focused synthetic metadata tests and six existing graph tests pass.
They cover complete unknown fields/aliases, scalar omission and fallback,
non-enumerable named reads, exact owner/registry mismatches, own shadows,
graph bounds, strict decoder failures and native V8 side-effect checks with
zero getter/vendor/Proxy-trap calls. A fixed regression hash proves the old
graph program is unchanged; metadata still works with all unrelated class
bindings absent. Targeted strict type-aware lint and TypeScript checks pass.

No connected metadata observation, complete stored join, native owner extension,
writer, Save or saved/reopened validation is claimed by these checks. Build,
compatibility projections and release work belong to the combined batch.
