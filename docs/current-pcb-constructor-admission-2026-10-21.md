# Fixed PCB constructor admission

V8 can retain an instance in a closure while omitting the constructor binding
used to create it. A read of `scope.kde` can therefore fail even when the original
scope still contains `Xe`. This is not permission to accept a matching class
name or to drop the instance check.

The new fixed constructor bundles select each retained source-owned object's
own prototype constructor, then require metadata for that exact function from
the already admitted PCB script. Consumers check the same tuple/owner/prototype
association again before and after reading. No constructor, getter, callback,
writer or Save is invoked.

## Pinned source inventory

The inspected file is the inert `pro-pcb/3.2.193.682ed44e/js/pcb.js` asset:
10,976,299 bytes, SHA-256
`217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33`.
Acorn located each class and its constructor without evaluating vendor code.
The profile module retains exact class ranges, byte counts and body hashes.
All 24 have parameter length zero except Lpe, whose length is one. Locations below are zero-based CDP
line/column positions; offsets are UTF-16 source offsets.

| Bundle | Constructor / original owner | Constructor location | Offset |
| --- | --- | --- | ---: |
| diagnostic, precreate | kde / Xe | 4627:318905 | 7922259 |
| diagnostic, precreate | Sfe / Zec | 4630:17287 | 9092156 |
| precreate | mpe / jo | 4627:545949 | 8149303 |
| precreate | Yde / ze | 4627:360596 | 7963950 |
| precreate | HSe / h_ | 3641:496349 | 4352387 |
| precreate | USe / aE | 3641:495949 | 4351987 |
| common | Yme / Me | 91819:19324 | 10162282 |
| common | Nfe / ce | 4630:119942 | 9194811 |
| common | Epe / rt | 4627:618972 | 8222326 |
| common | GSe / id | 3641:387988 | 4244026 |
| diagnostic, precreate | Jse / Si | 3641:1991682 | 5847720 |
| diagnostic, precreate | Lpe / $0 | 4627:696135 | 8299489 |
| diagnostic, precreate | Kme / Pi | 91819:44548 | 10187506 |
| diagnostic, precreate | fpe / Sr | 4627:542047 | 8145401 |
| diagnostic, precreate | P1e / cm | 91968:2427 | 10791283 |
| diagnostic, precreate | mge / nu | 91819:138224 | 10281182 |
| diagnostic, precreate | tge / Us | 91819:59398 | 10202356 |
| diagnostic, precreate | $me (named Sy) / Xo | 91819:36564 | 10179522 |
| diagnostic, precreate | Spe / dl | 4627:618724 | 8222078 |
| diagnostic, precreate | Ume / Yr | 91819:7602 | 10150560 |
| diagnostic, precreate | cge / ru | 91819:116173 | 10259131 |
| diagnostic, precreate | Tfe / Wn | 4630:15616 | 9090485 |
| diagnostic, precreate | Qme / Yh | 91819:56726 | 10199684 |
| diagnostic, precreate | jde / Ft | 4627:366670 | 7970024 |

Each of these bindings occurs only at its class declaration and top-level
construction in this asset. By contrast, U5 is referenced inside three
constructors and must remain captured. Wre, zre, KCe, ogt and vfe each have two
identifier occurrences too, but their second occurrence is inside a constructor
or callback. Low occurrence count alone is not evidence of an omitted binding.
The other fixed pending/String/common class references have nested uses. An
independent syntax-only audit covered 78 class/alias names across all fixed
model, pending, root, interaction, renderer-association and producer readers.
It also corrected one outer-name assumption: network clusters use the captured
alias Xh, not pP. The source declares `pP=class pP`, sets its map and assigns
`Xh=pP`; pP's class-internal self-reference does not capture that outer binding,
whereas Xh has 19 nested reads. This is an original alias, not a fallback.

GSe, Qme and jde have implicit derived constructors. Their locations are the
class expressions' starts, unlike explicit constructor parameter-list locations.
A synthetic V8 check confirmed that location convention. The $me alias retains
the named class Sy, with four numeric own static properties assigned by the
source: FLIP_PROGRESS_RANGE=0.8, FLIP_PROGRESS_START=0.1, MAX_QUEUE_SIZE=20 and
PROGRESS_UPDATE_INTERVAL=10. All four are writable, enumerable and configurable;
admission requires exactly those names, values and descriptors. No other
selected class has extra static own properties.

## Admission and request boundary

Only three literal bundles are defined. There is no caller-selected object
path, class name or fallback expression:

- diagnostic: kde, Sfe, then the 14 root/interaction constructors in table order;
- precreate: kde, Sfe, mpe, Yde, HSe, USe, then those same 14 constructors;
- common: Yme, Nfe, Epe, GSe.

Each selector runs on the freshly qualified original Save-handler scope with
the retained wrapper callback. It checks that callback before and after the
read. Own descriptors select the fixed owner, its prototype and that
prototype's constructor; the constructor's own prototype/name/length must
agree. The returned array is a remote tuple, not an admitted result yet.

The runner reads the tuple's own properties, requires its exact length and
dense function-handle positions, then reads every constructor's own properties.
Admission requires the original script ID, exact function location, name,
the source-derived arity and static properties, non-writable/non-configurable class prototype descriptor and
expected internal-property shapes. Handles and prototypes must not be reused
across distinct selected constructors. Function descriptions are bounded text,
not an alternative authority source: the fully hash-admitted script and exact
location already identify the pinned class body.

Text is bounded at 16,384 characters and each copied envelope at 262,144 bytes.
The largest selected class body is 13,685 bytes; all 24 bodies together total
113,782 bytes. Derived-constructor internal prototypes may also describe their
base classes: Ni is 403 bytes, kF 170, lc 1,823 and iu 461. These remain inside
the same bounds. Descriptions are never evaluated or treated as provenance.

This takes 2+N requests: 18 for diagnostic, 22 for precreate, six for
common. Reusing the same retained qualified tuple across the existing two
precreate samples adds 22 requests, not 44; every leaf rechecks its
source-owned objects against the tuple. The existing observation cleanup owns
the tuple and constructor handles. Failure consumes the observation; no retry,
new scope adoption or hidden name-only fallback is introduced.

Pending-state accepts the 16-entry diagnostic tuple or 20-entry precreate
superset and checks its first two entries. Root inventory selects the exact
14-entry suffix mapping from the tuple length; there is no name lookup in the
original scope for an omitted constructor. Empty-producers and the dormant
marker reader require the 20-entry precreate tuple. The empty-state, manager-presence and notification
refusal conditions remain unchanged; only the constructor provenance path is
replaced. A tuple supplied outside the admitted runner is not proof of source
or ownership. The metadata decoder explicitly returns
`lexicalBindingVerified:false` and `executionAuthorized:false`.

## Evidence and remaining limits

The focused synthetic inspector test creates a real closure containing all 24
owners but none of their 24 constructor bindings; U5 remains in that closure.
All three fixed selectors run under `throwOnSideEffect`, recover the expected
ordered constructors, and invoke no fixture callbacks/getters. Their synthetic
locations are correctly rejected as the pinned application source. Separate
strict-metadata cases cover every pinned profile, swaps, wrong locations,
arity, descriptor flags, duplicate fields and hostile envelopes. Association
tests refuse same-named replacement classes, replaced owners/prototypes,
missing tuples and wrong tuple shapes. Root-census tests cover both tuple
layouts with all omitted class names removed, and reject wrong arity or changed
Sy statics. The empty-producer sample succeeds without outer pP while retaining
the exact original Xh alias. The 39 focused constructor/pending/root/association/
empty-producer/marker cases passed under Node 24.18.0; no live calls were made.

These checks reproduce the general V8 omission mechanism, not a previously
unrecorded runtime field. A grouped `commands/own` refusal alone does not reveal
which descriptor was absent. Original script/frame/process admission, actual
connected execution, collection inventories, asynchronous producer completion,
publication delivery and persistence remain separate evidence. This correction
does not enable String creation or Save.
