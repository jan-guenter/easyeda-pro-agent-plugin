# Current footprint copy preparation and delete findings

This batch adds an offline preparation and record comparison for an independent,
project-local footprint copy. It does not enable `lib_Footprint.copy`, native
creation or deletion. No EasyEDA call, application launch, project read or live
validation was performed. The test projects are synthetic encrypted SQLite
fixtures created by the isolated test runner.

## What was implemented

`current-footprint-copy-plan.ts` accepts an original completed SQL inventory and
an exact project, branch and source footprint identity. It retains the complete
decoded history, original ciphertext links, source records and all peer names.
Footprint META contains title, description, tags and source; it has no docType
field. The footprint document header supplies its type.
The first profile admits a nonempty drawing containing only CANVAS, PAD, LINE
and NET records. Text, images, fonts, groups, numbering placeholders, unknown
families and historical canvas tombstones are refused. The name comes from the
complete active footprint roster using the existing bounded ASCII collision
model. Current source confirms the same rename algorithm for this library type.

The prepared native-create arguments identify the original footprint as the
source, specify a derived unique name and clear the copied lineage. The native
create method allocates the destination identity itself. These arguments are
data for a future purpose-specific coordinator. No dispatcher accepts them.
They must not be sent through the default import matcher or native clone.

The comparison requires an original completed after-inventory, preserved
original history links, one appended history/chunk, one fresh ordinary
destination, identical source canvas records and exact destination metadata.
Every pre-existing document must remain unchanged. The appended chunk may only
address the new footprint. The target identity must be absent from all retained
raw history values, including overwritten records.

The result explicitly reports `rawAppendVerified:false`,
`sqlEffectVerified:false`, `producerBindingVerified:false`,
`executionAuthorized:false` and `completionProved:false`. It proves a necessary
record relation. It does not prove complete atom encoding/order, source getter
serialization, clock bounds, SQL bookkeeping, subscriber completion, native
ownership or Save/close/reopen. Those still need their own adapters. No runtime
admission, capability count or vendor pin changed.

## Why the public copy path is insufficient

The official SDK accepts source footprint/library IDs, a target library and
optional classification/name. Its return is a string or undefined.
[Official footprint copy reference](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_footprint.copy.html).
The installed API JavaScript forwards those five arguments. Its adjacent
`api.d.ts` is an empty module, so declaration snapshot line numbers are not
evidence about that installed file.

The following is a source inference for the inspected 3.2.209 implementation,
not a live observation. With both library IDs equal to the current project ID,
an existing source footprint with a nonzero ticket, a successful current-project
lookup and no intervening source change, the default copy route can return the
source's own ID. It does not create an independent copy in that case:

1. API `xT.copy` forwards the five named arguments. UI `M8.copy` fetches the
   source and calls `Ze.createFootprint` with project flags derived by exact
   equality to the current project ID.
2. The project route constructs `Eln` without options. Its defaults enable
   `matchKey`, `byUUID` and `byVersion`.
3. `mai.getOrigin` fetches the project footprint. `m2t.getTemplate` applies the
   metadata override without removing the source UUID or ticket.
4. `h2t.matching` first fetches that UUID in the target project. When both tickets
   are truthy and equal, it returns the existing target before naming or create.
5. `h2t.start` and `Eln.start` accept that matching result. `M8.copy` returns its
   UUID. Supplying a different `newFootprintName` does not bypass the match.

The literal `"Project"` selector is not normalized by this copy wrapper. No
equivalent conclusion is made for that spelling, extension-library callbacks,
personal/cloud destinations or changing concurrent state. Within the project
import matcher, an existing same-UUID/equal-ticket item is sufficient for reuse.
If UUID matching misses, the enabled source/version match can still reuse an
item. This does not establish that the public wrapper accepts an arbitrary
other local project. External library creation follows a different route; it
was not modeled.

The native `Tg.clone` is also unsuitable as an ordinary footprint-copy substitute.
It requires an underscore-containing destination UUID and preserves that
caller-supplied identity. `Tg.create` instead allocates an ordinary identity and
can read source geometry through the project library getter. The getter includes
the old META record. Its lower ticket must lose to the newly created META.
The new preparation records that distinction; it does not yet validate the
getter's complete byte serialization. `Tg.create` also returns success after
awaiting `uploadLocal` without checking that return's success field. A future
coordinator must verify the actual effect rather than trust that acknowledgment.

## Current deletion findings

The documented delete method accepts footprint and library IDs and returns a
boolean. That is not a completion barrier in the inspected implementation.
[Official footprint delete reference](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_footprint.delete.html).

UI `M8.delete` sets its project reference-check flag only for the literal
`"Project"`, then substitutes the current project ID. Passing the actual project
ID still selects project storage in the downstream lookup, but the helper
receives a false flag and skips its project-specific dependency checks.

Inside `yw`, the footprint loop calls `Ze.deleteFootprint` without awaiting its
Promise, then assigns a successful result. The enclosing synchronous catch
does not catch a later rejection. Subsequent UI success and the public boolean
therefore cannot prove that the native deletion completed.

The current worker encodes a DELETE_DOC marker and awaits `uploadLocal`.
Its footprint change handler publishes the footprint deletion event. The
inspected current schematic callback removes the footprint from its component
cache. The adjacent **symbol** callback also requests preview deletion and
forced tab closure. Those extra symbol actions must not be attributed to the
footprint callback merely because the older symbol-delete report contains them.
This source inspection is not an attestation of every loaded listener or proof
that delayed structure/preview work has settled. Deletion remains unavailable.

## Pinned source evidence

Paths are relative to the installed `resources/app/assets` directory. Spans are
zero-based UTF-16 code units, start inclusive and end exclusive. They were
extracted as syntax nodes without evaluating vendor source.

| Key | Path | Full SHA-256 |
| --- | --- | --- |
| API | `pro-api/0.3.59.1ca9efb5/api.js` | `e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1` |
| UI | `pro-ui/3.2.198.2800f583/js/ui.js` | `3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6` |
| WORKER | `pro-mgr/3.2.185.bf63a159/js/project-worker.js` | `0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046` |
| SCHMAIN | `pro-sch/3.2.193.5dbe8bb3/js/sch-main.js` | `e7fdbc30cadd14fb87c5a50d2c5563241b4cf373d6eea8f7d0c9e7e59588d72c` |

| Source node | Span | Span SHA-256 |
| --- | --- | --- |
| API `xT.copy` | 1341669:1341867 | `dbf04df350017969e3a8f2dfa39de62826ae68573535e0a9fc562fa962889cac` |
| UI `M8.copy` | 17391793:17392559 | `291e2af93469af7b9c3f55421724606dd0aae372fd735abcce1b429345ee5ee3` |
| UI project `createFootprint` | 6231212:6231401 | `29692457d9f0a634f707ec3ec8c2aca9fd44faca47e3898f5923006ec9df423f` |
| UI `Eln.constructor` | 6224313:6224537 | `23f20ea8fb4cda83dc6bf79b96bc7c4c4785253fb4ee3a0fc038ce251985a5ef` |
| UI `Eln.start` | 6224537:6225403 | `ef7ed9630634d11479617c9c0664dd5ee2702fc21eab2ea54a022d98a1fee4d8` |
| UI `mai.getOrigin` | 6205649:6206435 | `b39859d13fa0e9776765645aa96d290853864e2abf82ecd3f563f03b14bd22e1` |
| UI `m2t.getTemplate` | 6203047:6203214 | `330e803bb4a42b080f27fc175a2db8a0dd7dcba21f1831b10f4c4f7c5735de2c` |
| UI `h2t.matching` | 6206722:6207347 | `89ab2c264528ae2c9fd9b1c3410634880ea3f37daa7381589a0c30552c86e760` |
| UI `h2t.start` | 6207552:6207994 | `8b74d16dc959c8e53d25f3be92b6d324021a968919a0ac848298dbe0ffb5149b` |
| UI `getProjectLibByWorker` | 6339783:6340307 | `e800866588e5d39bf469ba520d66078590c851fcca9154753ee56b2541434f82` |
| WORKER `Tg.create` | 1884898:1885523 | `41754b7deddc26b6e894ec3e92d877791d904323fb424936d7c47a7ca6b134ce` |
| WORKER `Tg.clone` | 1886438:1887182 | `219b1b33f2f3ee12a41eac6bd1dd03bc1cb9e9c40a04f4ac371435c54bf4d646` |
| WORKER `Tg.getStr` | 1890246:1890717 | `8f2466efb348dbaae6eee3631eec72f26a1547d9812a0c00126414e805fc6013` |
| WORKER `rN.metaData` | 648634:648722 | `e8d2c2523ad28f156b886e0a469420d64b065d512081ade5b68fb199f9485332` |
| UI `M8.delete` | 17389039:17389293 | `630b1722fea7f835742bebe19053c0cb86fac10aae506b465073bdfb6ee861ca` |
| UI `yw` | 15337556:15342578 | `b3b1f5a74b0ba92b348c19c6dece16c9c27953fece1478f76452884937a20c7e` |
| WORKER `Tg.deleteData` | 1887596:1887808 | `9a0d4e8fcf43da7c33bcd62ba4611fc324f78f2a843a4e32965f06406e53c5ba` |
| SCHMAIN footprint delete callback | 6208032:6208166 | `971dc9f358ef6a7eb1e5bb79a73122cfe3623075bba06755298e7aac7713cce6` |
| SCHMAIN symbol delete callback | 6207544:6207902 | `fad3f3e785bd9e8196e3e4758caa86703df9d3593fef5d41d98f8c9ceb290ef4` |

## Focused verification

Five synthetic regression groups pass. They cover original-reader provenance,
immutable derived arguments, the necessary record relation, the unchanged-ID
failure, metadata/canvas drift, foreign document writes, changed old ciphertext,
historical UUID collisions and unsupported source dependencies. TypeScript and
focused type-aware oxlint pass with Node 24.18.0, npm 11.16.0 and core limit zero.
No broad suite, build, release, compatibility admission or live test was run for
this source batch.
