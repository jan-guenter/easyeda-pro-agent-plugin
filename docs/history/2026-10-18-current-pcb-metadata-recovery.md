# Current PCB metadata recovery and rename prerequisites

## Scope and evidence status

Candidate `0.3.0+codex.20261018111500` follows installed version
`0.3.0+codex.20261018094000`. Its source work covers a project-metadata parser
correction, test diagnostics and dormant PCB rename prerequisites. The corrected
PCB reader has source-test evidence, not connected validation. No PCB writer is
enabled. Build, CI, publication and installation require their own delivery
record; this document does not claim those stages have passed.

A separate disposable symbol-copy lifecycle completed on the installed 094000
generation. Its live evidence is recorded below and does not validate the new
PCB correction or rename prerequisites. Production projects and their records
remain outside this work.

## Native local-project flags

The installed no-editor PCB metadata reader required `archive`, `store` and
`cbb_project` to be own properties equal to `false`. The native local-project
producer does not supply `store`. That would make the installed reader refuse
before its PCB metadata request. Source review found this before a connected
attempt; the installed 094000 reader was not dispatched to repeat the refusal.

The native source chain was inspected as inert text. These are zero-based
JavaScript UTF-16 offsets, not byte offsets or line numbers.

| Pinned source | Relevant path |
| --- | --- |
| `app.js`, SHA-256 `52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c` | `G.show` at 2317299 selects local project columns including `archive` and `cbb_project`, but no `store`. Controller `show` at 2373022 supplies the explicit project UUID. |
| `pro-mgr.js` 3.2.184.355087e9, SHA-256 `005584e02cd9b2d49fdb387b2f997c1c8d3f88b0c48a7531c8097c483ed0bd2e` | Project getter at 2056034 and PCB getter at 2063406 route the explicit project-qualified requests. |
| `project-worker.js` 3.2.184.355087e9, SHA-256 `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928` | Open at 2109136 and the project-details setter at 2013183 retain that shape. `getDetail` at 2126714 returns it. PCB `get`/`getData` at 1901353/1902855 provide the reader's remaining fields. |

The narrow correction in
[`current-project-pcb-metadata-program.ts`](../../plugins/easyeda-pro-control/server/src/current-project-pcb-metadata-program.ts)
uses the existing symbol routes' inactive-flag contract. Each of the three
flags may be absent or an own data property with value `undefined`, `false`,
`null` or numeric zero. Accessors and inherited properties refuse, even when
their apparent value would be inactive. Every other value refuses. No shared
guard was weakened and no value is coerced.

Required project UUID, branch UUID, format and owner checks are unchanged.
The reader still requires project-only state with no editor tabs or hidden
frames. It makes two PCB reads, each bracketed by project reads, and compares
two complete samples. Exact runtime, owner and receiver checks remain around
awaits. Bounds remain 64 KiB and ten seconds. It opens no canvas, sends no Save
and grants no permission, persistence, source-membership or writer authority.

The final focused
[`metadata tests`](../../plugins/easyeda-pro-control/server/tests/current-project-pcb-metadata.test.ts)
passed 10 tests with no failures. They cover the actual absent-`store` shape,
all admitted flag representations, hostile values, own and inherited getters,
and flag changes in later project brackets. Getter-read counters remain zero
on refusal. Full TypeScript checking and targeted strict type-aware lint passed.
These are source tests with synthetic host objects, not connected evidence.

## Gateway CI failure and test diagnostics

[Main CI run 39118667146](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/39118667146)
failed one existing test, `rejects every incompatible private backend hello
field before proxy admission`, with `Test peer closed before message.` The
failure occurred during setup before the incompatible hello was sent. The
retained log did not identify the loop case or setup phase. Its cause remains
unknown; there is no basis to claim either an infrastructure failure or a
specific production gateway defect.

[Final PR CI run 39117739659](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/39117739659)
passed the identical complete Git tree. Main Windows launch-recovery CI also
passed. Neither result explains the later gateway setup failure.

The test-only change in
[`authenticated-bridge-gateway.test.ts`](../../plugins/easyeda-pro-control/server/tests/authenticated-bridge-gateway.test.ts)
records the hostile-case number, setup phase and gateway diagnostics on a
future failure. It cancels and drains the backend-connection waiter and awaits
both peer closures before advancing to another case. Cleanup errors retain the
original failure. All protocol assertions, owner checks and deadlines remain
unchanged; production gateway code is untouched.

One focused run of that test passed. Targeted strict type-aware lint passed.
No CI retry or full-suite rerun was used to investigate the failure. This is a
diagnostic and resource-cleanup improvement, not a claim that the original
intermittent failure has been explained or fixed.

## Dormant PCB rename prerequisites

These modules expose pure preparation/comparison functions, not an execution
route. An object with the right JSON shape cannot replace an original sealed
projection or a completed inventory issued by the maintained SQL reader.

- [`current-pcb-rename-structure.ts`](../../plugins/easyeda-pro-control/server/src/current-pcb-rename-structure.ts)
  projects one exact serialized tree title/version/update-time change while
  preserving complete membership and ownership. The existing startup guard
  observes bounded native batch/pending-set state; it does not prove private
  structure-job queue completion.
- [`current-pcb-rename-history.ts`](../../plugins/easyeda-pro-control/server/src/current-pcb-rename-history.ts)
  models one exact native `EDIT_HEAD`/`DOCHEAD`/`META` chunk, a fresh ticket and
  separate document/backend times. It admits only the supported canonical
  PCB metadata encoding. Supplied actor and clock values are comparison inputs,
  not provenance. Equality alone proves neither encrypted SQL placement nor
  preservation of prior history.
- [`current-pcb-rename-structure-sql.ts`](../../plugins/easyeda-pro-control/server/src/current-pcb-rename-structure-sql.ts)
  compares the complete SQL inventory for one isolated lower-ticket structure
  upload. All matching branch rows must have exact project association,
  identical original structure bytes and lower tickets. It models the native
  update of all matching rows and preserves other tables, cells, storage
  classes, schema and properties. Missing-row and equal/higher-ticket insert
  paths remain unsupported. A full rename's additional history changes must
  fail this isolated comparator.
- [`current-pcb-rename-sql.ts`](../../plugins/easyeda-pro-control/server/src/current-pcb-rename-sql.ts)
  combines the original sealed history and structure projections with original
  completed SQL inventories. It verifies exact supplied new-head history and
  the six affected native tables: branch history, `history_data`, `projects`,
  `branches`, `project_structures` and `sqlite_sequence`. It covers every
  duplicate structure row and preserves prior raw ciphertext, peer rows,
  storage classes, schema and persisted properties. Generated ciphertext must
  decode to the exact projected chunk, and new UUIDs, allocation and SQL times
  must satisfy the supported native contract.

The history, isolated structure-SQL and combined SQL modules each passed 10
focused source tests, strict type-aware lint and full TypeScript checking. The
combined comparator's final unchanged test run passed all 10 tests with no skips
or failures. Root and independent review accepted its scoped relation. Its
374-line source has SHA-256
`3ca0575f340dd47ee9f38a9fd2a8b5ab54ccb4723ef96e5aa568bda23203597f`;
the 192-line test file has SHA-256
`c8ac85748743aaef4c16f7556a84115748fea8b40d5f284d7b76fab6407a4ce0`.

This combined relation compares supplied evidence. It is not an executable
pre-dispatch plan or a producer of qualified native timestamps. The future
coordinator must freeze intended metadata, baseline, actor and clock windows
before dispatch, then derive actual timestamps from its retained original
operation evidence. Execution, producer/actor/clock provenance, queue completion,
generation closure, persistent-cache exclusion and reopening remain unverified.

## Completed disposable copy lifecycle

The original operation `copy-pcb-094000-20261018-baseline` completed one native
symbol copy on installed 094000, followed by normal closure, complete closed-SQL
effect verification, fresh-owner saved reopening and final closure. The root
tool returned `copyVerified: true`, `nextPhase: completed`, `retired: true`,
`termination: terminated` and `fullReopenReadbackInvariant: true`. No write,
navigation or Save was replayed. There was no explicit Save, inverse or deletion.
This is a new successful case, not a repair of an earlier stopped copy.

The native returned UUID is `2a4fce0dbdb8f7ff`. The complete closed SQL digest
changed from `97389834d625ca112e75388d50acea5ba36281382459475b19baa569782ab20a`
to `09a74ea168ec928ed2c4708997dd3c8b1d2b55f9305ddb1cf5696efe025645d9`.
Independent retained-copy inspection checked all 35 tables and the six modeled
changed tables. All 52 original history rows and 56 prior ciphertext chunks
remain exact. All 19 existing documents are unchanged. The sole new symbol
contains the source's exact 18 drawing records, with creation tickets 776/777.
Every prior structure row changed only its ticket to 777, and the added structure
row preserves the same serialized tree.

The fresh verifier read 5,045 bytes with SHA-256
`0ac3f2e215f409f8f54932dd593acb9ac7cbd44aee556d8890f3337db51d2359`.
Independent reconstruction from the retained creation chunk matches the complete
saved serialization, including all 18 drawing lines. It matches the
`current-created-copy-cache` projection. The actual native cache branch was not
observed. Persistent upload-cache exclusion is limited to the retained inactive
generation and immediate pre-open observations.

Post-edit and final retained raw copies are byte-identical at 598,016 bytes,
SHA-256 `41ac606247582f9c4be17eda1492d76c0f33f70efa4d36a2ac8bf6ef780e5c12`.
Independent maintained SQL readers verified exact equality of all 35 tables and
148 rows after saved reopening. All 54 retained artifacts passed byte/hash and
stable file-identity checks. The verifier's original five-process capture,
normal-close intent/receipt and retained termination proof match. Artifact 54
records retirement intent; the completed root tool return separately establishes
retirement. The final journal has no hard stop or orphan risk. Do not replay this
completed lifecycle or treat it as authority for another operation.

## Remaining work

- Implement the original-owner coordinator. It must establish complete
  target/peer history, the native peer-name policy, exact producer/client and
  backend actor, independently qualified clocks and bounded capacity before
  dispatch. Pure projections do not supply this authority.
- Close the private structure-queue completion gap. A clear batch-depth or
  pending-set sample does not prove all queued work finished. No operation-bound
  private queue acknowledgment is available in the current adapter. Retained
  whole-Job termination followed by combined full-SQL proof and fresh reopening
  is the proposed lifecycle boundary, not an observed queue callback.
- Retain original-process closure and perform cache-excluded saved reopening
  in a fresh admitted owner, then compare final complete closed SQL. Only a
  successful disposable lifecycle can justify later writer registration.
- Validate the corrected no-editor PCB reader after publishing and admitting
  the new installed generation. The retained disposable PCB has no String
  objects, so representative nonempty String validation needs fixture setup.
  Another empty String read would not close that gap.

Candidate delivery requires a frozen payload, reproducible build, exact-payload
CI, publication and verified official marketplace installation. Those results
belong in the current engineering record when they occur. The new installed
generation will need fresh-session admission. No external compatibility pins,
authenticated bridge identity or installed cache were changed by this source
work.

`CONTRIBUTING.md` now names the already-pinned Bubblewrap 0.13.1 runtime, matching
the compatibility manifest, README and CI. This is a documentation correction,
not a runtime upgrade or pin change.
