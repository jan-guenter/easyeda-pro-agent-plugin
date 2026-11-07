# Project cache startup source audit

This is an offline AST/source audit of the installed project worker,
`pro-mgr/3.2.185.bf63a159/js/project-worker.js`, 2,181,308 bytes,
SHA-256 `0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046`.
It executed no worker, application model, cache API or native tool. Offsets below
are zero-based UTF-16 source positions from Acorn.

`Lg` inherits `Gd`. The project-cache wrapper is `bb`; `Gi` constructs it, awaits
its cache open and returns that wrapper. Project cache and local-project cache
are separate `bb` instances. The namespace helpers derive `project_<uuid>_v6`
and `localProject_<uuid>_v1`. Native `Cache.put` occurs inside `bb.put` at
1684558..1684577, after cloning the supplied Response. Its retry path can reopen
the same named cache after a NotFoundError. Matching wrapper source alone does
not establish which project/cache/body an invocation owns.

| Caller | Put range | Effect and completion |
| --- | --- | --- |
| `Gd.getFlowParse` | 2020578..2020611 | Writes a parsed history segment into project cache; its Promise enters `cachePromise`. |
| `Gd.uploadCloud` | 2024320..2024358 | A detached async function writes the local-save key and body to local-project cache, then deletes uploaded keys. It bypasses `uploadLocal`. |
| `Gd.uploadLocal` | 2031391..2031429 | Writes the upload body to local-project cache. |
| `Gd.syncCloud` | 2033567..2033662 | Replaces the branch head-index response after history changes. The put Promise is dropped. |
| `Lg.openInLocal` | 2128959..2129054 | Replaces that head index when local flow loading reports cloud-fetched data. The put Promise is dropped. |
| `Lg.openInCloud` | 2129806..2129901 | Replaces that head index after cloud loading. The put Promise is dropped. |

All three head-index writes use an explicit JSON Content-Type header. The segment,
upload and local-save paths construct a Response from the body without that
explicit header. A backup must inspect the complete actual headers and bytes;
none of these source shapes proves that existing cached entries share them.

The complete lexical `syncCloud` call roster is:

| Class/method | Call position |
| --- | --- |
| `Gd.uploadCloud` | 2024543 and its finally path 2024954 |
| `Gd.createSnapshot` | 2026729 |
| `Gd.syncCloud` finally path | 2034657 |
| `Lg.open` | 2111146 |
| `Lg.branchSubscribe` | 2113804 |
| `Lg.postConversionSync` | 2126033 |
| `Lg.checkProject` | 2127120 |
| `Lg.checkHistorySynced` | 2133010 |
| `Lg.revokePendData` | 2144554 |

Opening starts detached `syncCloud` before project checking, update-data setup and
readiness. `checkProject` repeats via a one- or three-second timer. The internal
not-syncing/uploading gates and task3 Promise do not join the dropped head-index
put. A later quiet task map therefore cannot establish that opening cache I/O
completed. There are exactly two lexical `this.localCache.put` calls in this
worker, as listed above; this audit does not claim exhaustive alias analysis.

The [Service Workers cache contract](https://w3c.github.io/ServiceWorker/#cache-put)
stores request/response pairs. A by-value backup must preserve the selected key
and response state, rather than just a body string. The
[Fetch response model](https://fetch.spec.whatwg.org/#concept-filtered-response-opaque)
also hides internal contents of opaque responses. Such entries cannot receive a
faithful backup claim from their exposed fields. The planned disposable-only
route must either qualify its actual native Request/Response metadata against a
bounded reconstructible profile or refuse deletion. Existing IDs and names are
not lifetime handles; original target exclusion and continuous observation remain
separate prerequisites. No cache mutation or readback acceptance follows from
this source audit.
