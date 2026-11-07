# Current history upload client source audit

The pinned `pro-mgr/3.2.185.bf63a159/js/project-worker.js` is2,181,308 bytes,
SHA256 `0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046`.
This source-only audit used pinned Node24.18 and Acorn. No worker code, client
constructor, request, app or native control ran. Offsets below are zero-based
UTF16 ranges with an exclusive end, as used by Inspector source locations.
The whole-source qualification remains the existing
[current producer source qualifier](../../plugins/easyeda-pro-control/server/src/current-project-save-producer-source.ts).

| Source | Range | Zero-based line/column |
| --- | --- | --- |
| `mc` class |1778266..1778750|108/76770|
| `mc` constructor method |1778275..1778681|108/76779|
| `mc.getInstance` |1778681..1778749|108/77185|
| `_d` class |1760266..1761089|108/58770|
| `_d` constructor method |1760283..1760320|108/58787|
| `_d.set` |1760320..1760655|108/58824|
| `rs` class |1711566..1712299|108/10070|
| `rs.POST` |1711973..1712051|108/10477|
| `Re=mc` |1778768..1778773|108/77272|
| `Rt` arrow |1849307..1849470|109/1994|
| `N2` history routes |1443661..1443841|103/121830|
| `ae` route table |1449013..1449198|103/127182|
| `j6` |1430822..1431273|103/108991|
| `Ve` |1431577..1431704|103/109746|
| `F6` |1431704..1431742|103/109873|
| `U6` |1431742..1433672|103/109911|
| `H6` |1433672..1434037|103/111841|
| `G6` |1434109..1435235|103/112278|
| `z6` |1435235..1435925|103/113404|
| `Y6` |1435936..1436639|103/114105|

The [initial cache source profile](../../plugins/easyeda-pro-control/server/src/current-generated-initial-cache-source.ts)
already pins `rs.verify`, `exec` and `exec1` at1711572..1711708,
1711708..1711879 and1711879..1711897. Additional complete-function SHA256 pins:

| Source | SHA256 |
| --- | --- |
| `mc` class |`6726841f6ff58296b9375e5bb4c77e66ba1d8a329869f4df97139e00942a1fc3`|
| `mc.getInstance`, including source `static` |`092f1184c7162bf6efd28ecd72ad0b10284a8551d7b63fca36425584e301a25b`|
| `_d` class |`9e7edf7612d7ea420cdba43b5dbe3146ca4097a5df3570ba3af3022c86da9be1`|
| `_d.set` |`833acfbae890443293ae7e477d436fcc2abe203223d8965c1526bf086e927eab`|
| `rs` class |`fa70af6cdfc7a5a91db6cebe668e4ccf49e04b560a9b217777d7c6d2d7c2b126`|
| `rs.POST` |`9939a0b06b5de5fabce1e3c9b35040dc3b8f356c36d61117ed8210304d725967`|
| `Rt` |`b1e5bb72092a6c35eb16d81a33f4863ca6a6e29c2569ed76bbba70e48bd9f6e2`|
| `N2` |`43ee17cf1741a8b0eb0ab62051449154fb9e36fcfa02894a1a641d4f266b9335`|
| `U6` |`19b7255c69ed60bae00d780cda39cd45c9bbd2b02969abf3addaa2dfb5ff5a8d`|

`mc` constructs15 own service fields:project, branch, projectHistory,
componentHistory, schematic, document, device, component, tag, copper, font,
blob, attr, client and other. `projectHistory` receives `new _d(this)`.
`mc.tool` starts as null; `getInstance()` constructs only when it is nullish.
`Re` aliases the same class. An observer must retain the original existing
client. Calling `getInstance()` to inspect it could allocate a new client.

`_d` extends `rs`; its constructor sets the own `parent` field. Expected source
rosters are `_d.prototype` own constructor/set/get/getHistoryData,
`rs.prototype` own constructor/verify/exec/exec1/GET/POST/DELETE/PUT/FETCH,
and `mc.prototype` own constructor. `mc` has own length/name/prototype/
getInstance/tool. Each constructor's own `prototype` descriptor is nonwritable, nonenumerable
and nonconfigurable. Ordinary methods are writable/nonenumerable/configurable;
constructor instance assignments are writable/enumerable/configurable. These
are descriptor expectations derived from the class syntax. Actual original
objects, descriptors, prototypes, closure bindings and constructor identity
still require native qualification. A static method's function source excludes
the class syntax's `static` prefix. The class constructor function source is
the whole class, rather than its constructor-method slice.

`_d.set` takes projectId, branchData and raw dataStr. Its route is
`/api/v4/projects/{project_uuid}/branches/{branch_uuid}/histories` after `Rt`
substitution. It passes the raw body with Content-Type text/plain;charset=UTF-8
and path=projectId into inherited `this.POST`. A successful result updates the
original branchData.history_uuid only when its earlier value was falsey.
There is no `REQUEST` method in this `rs` prototype. The actual chain is
POST→exec→Ve→F6→j6→U6, with exec1 wrapping the awaited reply.

Arity is mc/rs constructors0, `_d` constructor1, getInstance0, set1, POST4,
Ve2, F60, j60, U62, H62, G63, z62 and Y64. `j6` can invoke the liveness service
unless its original qh is false. `U6` creates XMLHttpRequest and performs
H6/G6, native open, z6, awaited Y6, then send. `z6` supplies the actual worker
PRO_EDITOR_VERSION and checks XSRF only when self.document exists. `Y6` gzips
relative, non-servicecenter POST strings at length≥10000 and adds the gzip
header; its FormData branch has separate conditions. `U6` can schedule three
429 retries. The current narrow Via path plans to require raw length<10000 and
original qh=false. No source-client match proves original XMLHttpRequest/send,
headers, response ownership, retry exclusion, selected SQL completion or the
whole producer frontier. Those admissions remain separate.
