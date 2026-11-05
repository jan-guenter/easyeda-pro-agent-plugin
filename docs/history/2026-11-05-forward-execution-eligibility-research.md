# Forward execution eligibility research

This 2026-11-05 source investigation found a concrete missing eligibility
provider for the proposed same-writer footprint execution path. The current
fixed collectors cannot establish a fresh backend head/lock and exclude the
complete upload frontier across the sole create's asynchronous continuations.
This is a limit of the current implementation, not a claim that such a provider
is permanently impossible. No writer, Save, native operation or test was run
for this research. The production project was not opened or edited.

The repository basis is protected main
`4bdd63f5fdeb9d74975bf18565209942f6e39ff0`. The future opening source was examined
separately from the installed release. Its source-only models and private
tokens grant no runtime ownership or dispatch permission. See the
[publication record](2026-11-05-pr168-publication-and-installation.md),
[original input-custody record](2026-11-04-forward-execution-input-origin.md)
and [connected capture limits](2026-11-05-pr168-review-fixes.md).

## Exact primary source

The investigation read the complete installed vendor assets below and checked
their bytes and file descriptors during the reads. Offsets in this record are
zero-based, half-open UTF-16 ranges in those exact assets. No older 148 source
was substituted, and no vendor code or private project data is reproduced.

| Asset relative to the application | UTF-8 bytes | SHA-256 |
| --- | ---: | --- |
| `assets/pro-mgr/3.2.185.bf63a159/js/project-worker.js` | 2,181,308 | `0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046` |
| `app.js` | 2,657,192 | `52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c` |

These identities match the maintained
[209 opening pins](../../plugins/easyeda-pro-control/server/src/current-pcb-209-opening-profile.ts),
[worker clock source profile](../../plugins/easyeda-pro-control/server/src/current-footprint-copy-clock-rpc-source.ts)
and [main backend source profile](../../plugins/easyeda-pro-control/server/src/current-footprint-copy-main-backend-source.ts).
Full source identity qualifies source text; it does not prove a live frame,
native issuer or complete producer exclusion.

## Synchronous ticket and asynchronous head selection

`Vc` owns the worker's scalar `maxTicket`. The manager's `maxTicket` and
`newTicket` getters use that same consistency manager. A fixed descriptor-based
program can recheck the exact project, branch, client, consistency object and
ticket in one worker turn. The current
[destination recheck](../../plugins/easyeda-pro-control/server/src/current-footprint-copy-destination-bindings.ts)
already binds those receivers and selected container identities.

| Exact asset | Range | Relevant behavior |
| --- | --- | --- |
| Worker | `242716..242816` | `Vc.getMaxTicket` and `setMaxTicket` read/update the own scalar. |
| Worker | `1856433..1856613` | The manager ticket getters delegate to the original consistency manager. |
| Worker | `2020230..2020325` | `getLastHistoryUuid` calls the asynchronous branch API. |
| Worker | `2031853..2034689` | `syncCloud` can replace the loaded `historyIndex`. |
| Main | `2588764..2588987` | `j4` selects the branch, including `history_uuid`. |
| Main | `2596381..2596731` | `hB` reads the history row's `num`, `uuid`, `key`, `is_lock` and `created_at`, then computes age. |
| Main | `2594406..2595147` | `saveProjectHistory` reads the branch before entering its original transaction, then selects append or mutation. |
| Main | `2599064..2599367` and `2599367..2599658` | `bB` appends a new history; `OB` updates the existing history. |
| Main | `1318983..1319062` and `1301585..1301710` | Original connection selection and `queryOne` use the callback-backed `sqlite3` Promise wrapper. |

The worker's `historyIndex[0].uuid` is a loaded projection. The pinned worker
contains neither `is_lock` nor `isLock`; the actual lock/age decision above
belongs to main. A completed checkpoint head reference therefore does not
establish the live backend head or lock. Its existing
[head-reference contract](../../plugins/easyeda-pro-control/server/src/current-footprint-copy-head-reference.ts)
keeps age and native Date provenance false. The main request and completion
[source profiles](../../plugins/easyeda-pro-control/server/src/current-footprint-copy-main-request-source.ts)
[retain the exact transaction/append sites](../../plugins/easyeda-pro-control/server/src/current-footprint-copy-main-completion-source.ts).

A new collector could bind a fresh read to the original main connection, path,
branch, history and actor. Reading it before later arming awaits would still
leave a head-exclusion gap. The vendor transaction starts in the later upload
path, after renderer create has run. Adding an outer transaction or changing
transaction depth would change vendor behavior and needs its own reviewed
contract.

## The complete upload frontier is larger than six containers

The current destination predicate checks `task1`, `task2`, `task3`,
`cachePromise`, `bufferUploadData` and `bufferUploadCache`. Its
[runner documents the omitted timer and detached callbacks](../../plugins/easyeda-pro-control/server/src/current-footprint-copy-destination-runner.ts).
The exact worker source shows why empty containers cannot prove completion:

| Worker range | Producer or continuation outside that conclusion |
| --- | --- |
| `1847057..1847248` | `Nd` holds running `t`, queued `s` and latest arguments `r` in its closure. Both structure wrappers use it. |
| `2011158..2011378` | `QA` holds a debounce timer and resolver before the eventual body enters `task2`. |
| `2104048..2104241` and `2104264..2105081` | The structure trigger passes through serial/debounce wrappers; only the final body adds its Promise to `task2`. |
| `2029672..2030081` | `bufferedStream` owns its timer, Promise and resolver. It registers `task1` synchronously, but completion still requires that original wrapper's lineage. |
| `2108156..2108544` | `localPublishTicket` can publish a ticket from `publishTimer` 20 ms later. |
| `2024217..2024536` | `uploadCloud` starts an async cache-maintenance function and drops its returned Promise. Its native cache put/delete work is separate from the `task1` sync Promise. |
| `2033567..2033662` | `syncCloud` starts a head-index cache put without awaiting or retaining its Promise. |
| `1684119..1684885` | The `bb` cache wrapper can retry writes through awaited timers. |

The serial/debounce/structure spans also match the maintained
[structure completion source profile](../../plugins/easyeda-pro-control/server/src/current-project-structure-completion-source.ts).
The existing [cache-construction collector](../../plugins/easyeda-pro-control/server/src/current-footprint-copy-cache-construction-contract.ts)
binds four startup cache-open events to original Cache objects. It does not
track every outstanding cache write, retry or detached continuation. Sleeping
or polling stable empty containers cannot supply the missing original outcomes.

## Create yields and the cold-start boundary

`Tg.create`, worker `1884898..1885523`, awaits `buildString`, library-source
loading and `canvasString`. `buildString`, `1883915..1884565`, calls
`ja.setDoctype` before its first clock await, then consumes a new ticket after
that await. The mutating `setDoctype` implementation is at `276431..276517`.
An initial synchronous check followed by the sole invocation therefore does
not exclude competing work throughout the create. A later drift refusal may
retain a consumed failure; it cannot retroactively prove earlier exclusion.

A cold contained StartPage launch is a useful starting point for a new provider.
The original [startup contract](../../plugins/easyeda-pro-control/server/src/current-pcb-worker-startup-contract.ts)
uses `Target.setAutoAttach` with `waitForDebuggerOnStart:true`, and the
[transport](../../plugins/easyeda-pro-control/server/src/current-pcb-worker-startup-transport.ts)
later runs the original waiting worker. That permits new fixed observers to be
armed before its first project execution.

The current fixed collectors do not cover every serial/debounce entry and
completion, native cache-write/retry lineage, or detached Promise outcome.
They also issue no scheduler lease that allows only the selected create
continuation through its awaits. A post-open properties snapshot cannot
reconstruct a dropped Promise's original outcome. The current provider remains
unsupported even when a cold launch is available.

The needed next boundary is an original pre-project producer roster with complete
entry/completion coverage. It must retain each original pending Promise, timer
and queued slot before it can escape, and reject unknown lineage. It must join
a fresh same-main head/lock/ticket read to original dispatch and continuation
exclusion, with a final frontier check before mutation. An initial profile limited to locked heads
could avoid the additional unlocked-head age bracket only after those
other checks exist. This research implements none of that provider and declares
no complete writer budget or native eligibility.

## Official CLI compatibility recheck

Checked on 2026-11-05, the official
[client CLI README](https://github.com/easyeda/easyeda-client-cli/blob/main/README.md)
requires desktop V4.1.70 or newer. The installed 3.2.209 client falls outside
that documented version requirement; the new CLI is not a supported substitute
for its missing provider.

The official [download listing](https://easyeda.com/page/download) still lists
3.2.209 packages, and the official
[V3 changelog](https://prodocs.easyeda.com/en/faq/update-record/#v3-2-209)
lists V3.2.209 dated 2026-10-21. Direct download-page fetches returned HTTP 403;
the version was checked through its indexed official-page content. This does
not establish that every V4 distribution is unavailable. No application upgrade,
CLI invocation or compatibility admission was performed.

## Historical catalog snapshot, verbatim

The following two decoded strings are the former `lib_Footprint.copy` omission
reason and next requirement from base
`4bdd63f5fdeb9d74975bf18565209942f6e39ff0`, source
[`plugins/easyeda-pro-control/server/src/extension-api-coverage.ts`](https://github.com/jan-guenter/easyeda-pro-agent-plugin/blob/4bdd63f5fdeb9d74975bf18565209942f6e39ff0/plugins/easyeda-pro-control/server/src/extension-api-coverage.ts),
omission code `footprint-copy-default-matching-and-lifecycle`.
The current catalog uses a concise description of the head/frontier/yield
limitation above. These earlier observations, failed cases, counts and pending
claims remain unchanged below as history. They grant no current operation or
native authority.

### Former reason

UTF-8 bytes: 4,922. SHA-256:
`916050902c4ed011bb0607dc91aded3e951a35370e6c06b7d7ba01e2699f22ea`.

```text
The pinned3.2.209 public matcher can return an existing footprint; native clone needs a special underscore-containing UUID. The separate fixed native-create route remains private and unavailable. The mounted born-forward prewrite purpose joins original main/route and checkpoint-member source qualification. Separate once-only stages retain the original native source seal and compare its original complete checkpoint with a closed SQL snapshot after normal closure and observed original root/empty-Job termination. These results retain executionReady:false, with no create, scheduler, execution owner or Save route. Source sealing and baseline equality have offline coverage only; current head, atomic queues, document clocks, publication and whole four-generation capacity remain separate gates. Preparation retains original project/manager/bus constructors, parser/cache methods,64 qualified dependency functions and current actor/SQL inputs. The actual095000 disposable route passed construction, cache/peer capture, assignments and actor publication, then refused a false assumption that zy.parseFull had no native override. Source now qualifies both the original ja override and superclass method and preserves missing-alias identity checks. The separate68-ID create/paired-clock unit, original pending-reply custody, fixed native codec, partial output ledger and actual-runner scheduler are implemented privately. All existing native birth purposes refuse create; no public writer is mounted. Native buildString allocates the new UUID internally before its two clocks. A separate original-copy request reservation now arms main before the clocks and binds the exact upload body after both genuine paired samples, with same-original-core and escaped-envelope checks. A separate private pre-await allocation mode now captures the exact adjacent wrapper/create/buildString argument identity, original five handles and consumed invocation lease before issuing its native destination UUID to the clock observer. The additional7 normal/3 cleanup commands require at least78 create/clock IDs; existing native purposes reject this grammar before arming. Fixed native encoding and exact78-command native accounting are now implemented privately:57 normal/21 cleanup, create offset14,22 events. A source-derived two-generation forward envelope and actual coordinator output-ledger spending are implemented, including bounded cleanup after normal failure. Renderer forward ceilings are941 normal-class/61 cleanup/1002 total IDs after exact preload-registry qualification; normal-class headroom and the global ID ceiling remain separate; UI preparation is49/21. The private forward ledger separately charges poll/event categories within existing caps; a future native factory must supply its actual captured traffic. A separate source-pinned209 saved StartPage queue program fixes the old206-only HOST refusal. Source now qualifies the pinned native getter, CacheStorage constructor/prototype/match metadata and actual same-realm tuple/receiver before separate first and fresh observations of both fixed namespaces. The public read-only footprint-held-cache purpose binds an actual disposable checkpoint, complete SQL/default branch and original UI/native owner without opening the project or granting copy authority. A distinct private held-saved owner/channel/transport/opener joins original retained packets, acknowledged group release and pre-open source verification, with328 normal/35 cleanup requests,363 physical IDs,46 normal/251 cleanup helper controls and a bounded resource ledger; the older353-request contract is unchanged. Connected getter qualification, upload replay exclusion and saved-copy proof remain unvalidated. No native writer purpose is mounted. The source coordinator now consumes an original allocated paired scheduler and compares both document clocks, main history UUID and project timestamp with complete closed SQL. Genuine native birth/prewrite eligibility, full four-generation reservation and connected allocation/clock/main validation remain unavailable. The current54-ID main profile refuses the known127-command main sequence before completion transfer. A private complete stored-data relation now joins five independently completed SQL readers with the original copy/delete effects, exact readback equality, unchanged original visible documents and retained tombstone history. It grants no actual reopen, native generation closure, persistent-cache exclusion or inverse execution. Original owned preparation separately retains strict document-local source-asset qualification without claiming parser/publisher/upload callback provenance. Private models, native compilation, early create acknowledgments and historically unchanged fixtures do not prove native SQL completion, saved copy or a supported inverse. Native create can mutate before source lookup and ignores uploadLocal success.
```

### Former next requirement

UTF-8 bytes: 988. SHA-256:
`9864c1d212e2f63a21b400fc25d5cf24f6bca5ad27b6adf8cb6a2cb6f6d139aa`.

```text
Validate the separate public read-only held-cache purpose on an exact disposable checkpoint before claiming connected native getter/match or namespace evidence. Mount and validate the privately implemented pre-await allocation/clock/late-body fixed native composition through its own complete native purpose, complete pre-write source/head/dependency/queue eligibility, and reserve all four generations including native requests, events, raw outputs and failure journals. Installed161500 passed61 dependencies and31 destinations, then stopped at the registry compound guard. Source now qualifies the exact preload-created registry and original lexical scopes; validate its corrected original UI binding and genuine create/paired-clock/main completion on disposable data. Then prove original-generation closure, exact full closed SQL effect, upload replay exclusion, fresh independent saved-source equality and final closed equality. Do not use the public matcher or clone as a substitute.
```
