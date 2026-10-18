# Current PCB rename preflight and immutable preparation

## Candidate scope

Candidate `0.3.0+codex.20261018121700` adds a read-only PCB rename preflight and
dormant preparation for a future rename transaction. No PCB writer is enabled.
The preparation cannot dispatch a mutation, issue process ownership or turn
supplied observations into qualified actor/clock evidence.

Connected validation of the new preflight has not occurred. It
requires publication, verified installation and admission in a fresh Codex
session. The corrected 111500 metadata-reader lifecycle completed separately,
as recorded below. Publication and installation are separate delivery stages.
Production designs remain outside this work. New writer validation must use
the disposable fixture.

## Native findings

The following installed sources were inspected as inert text. Offsets are
zero-based JavaScript UTF-16 offsets, not byte offsets or line numbers.

| Pinned source | Relevant contract |
| --- | --- |
| `project-worker.js`, SHA-256 `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928` | `Sg.get` 1901353 supplies PCB metadata. `getAll` 1902735 excludes deleted entries. `getIdByTitle` 1903859 returns the first matching UUID or exactly `""`. `updateData` 1906142 defaults `renameKey` to false. |
| `pro-mgr.js`, SHA-256 `005584e02cd9b2d49fdb387b2f997c1c8d3f88b0c48a7531c8097c483ed0bd2e` | `GET_UUID_BY_TITLE` 2063498 unwraps the worker result. `GET_ALL_KV` 2064064 returns the complete map without the array route's catch-to-empty fallback. Ordinary message-bus `rpcService` 7106 converts service exceptions to `undefined`. |
| `ui.js`, SHA-256 `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` | Public `modifyPcbName` 17183024 selects a mutable left-tree index, then calls `leftTreeUpdataName` with its final argument true. |
| `sch-main.js`, SHA-256 `d9d6a955bf40d57daf9f27f31e0fff3191715ff50582418ad0922beb71b424bd` | `ySe` 4799485 can rename a related reuse-block schematic along with the PCB. `U$` 4798917 and `RN` 4798228 also update linked symbol/opened-sheet references. The public API path takes this branch without a confirmation dialog. |

Worker `Ne` at 1845057 chooses locale lowercasing when
`IS_CLIENT && !IS_ONLINE`, otherwise ASCII uppercase-to-lowercase replacement.
An offline Node `toLowerCase()` comparison is not the actual native policy.
Even an ASCII-only name can differ under a locale such as Turkish. The new
observer asks the fixed native lookup instead of reproducing that decision.

`getDataByTitle` cannot safely establish absence: its legitimate no-match
result and a swallowed service exception can both be `undefined`.
`getIdByTitle` has a distinguishable successful no-match value, `""`.
The observer rejects `undefined`, missing message fields, null, booleans and
matching UUIDs. It never calls `tryRename` or accepts an automatically chosen
suffix. A duplicate-name policy is not enforced by `Sg.updateData` itself
when its default `renameKey: false` is used.

## Read-only preflight contract

The existing `easyeda_control_project_pcb` tool gains a separate preflight
request branch. Offline queries `project-pcb-preflight` and
`project-pcb-preflight-validate` expose its exact schema. Discovery grants no
permission to rename and does not register a writer.

The request contains exact project, branch, PCB and owner identities, supplied
expected metadata, and a different desired title. The target must be ordinary:
empty parent and source. Desired titles are bounded, nonempty, trimmed and
free of control characters. Unknown fields and accessor-backed input refuse.
Expected metadata is a comparison input, not a saved-source receipt.

The fixed program requires project-only state with no editor tabs, hidden
frames, pending restoration, dirty tabs or cached read-only state. It retains
the outer RPC receiver and registry/DOM owners across every await. The runtime
also checks the authenticated scope, current fingerprint and pinned source files
before and after dispatch. Existing symbol preflight helpers are reused only
for their project guard and actor/clock observations, not their owner tokens.

Each of two samples reads the complete native PCB map, explicitly reads the
target and checks the desired title through `getIdByTitle`. The samples must
match exactly after sorting UUIDs. Every map key must agree with its value and
project, the target must match the supplied expectation, and each PCB ticket
must fit the stable project maximum. Four agreeing client/maxTicket samples
and four existing dual-UI actor/renderer-notify clock samples bracket the reads.

The result retains selected native fields, including raw title/display title,
parent, source, version, board, ticket and update time. Native getters already
apply fallback-to-empty semantics to source/version/board. Complete map
membership is therefore not complete source or stored-field provenance.
Samples are observations, not continuous exclusion or a worker lease.

Bounds are 4,096 PCB entries, a 524,288-byte UTF-8 envelope and ten seconds.
Oversized results refuse without truncation. Expiry prevents later reads but
cannot cancel a request already dispatched. The program requests no canvas,
navigation, public rename, cloud getter, APP evaluation, mutation or Save.
Permission, startup qualification, worker/producer identity, backend actor and
clock qualification, persistence and writer authority remain explicitly false.

Implementation: [schema and decoder](../plugins/easyeda-pro-control/server/src/current-pcb-rename-preflight.ts),
[fixed program](../plugins/easyeda-pro-control/server/src/current-pcb-rename-preflight-program.ts),
[runtime admission](../plugins/easyeda-pro-control/server/src/current-pcb-rename-preflight-runtime.ts).

## Dormant preparation and stored headers

[Preparation](../plugins/easyeda-pro-control/server/src/current-pcb-rename-preparation.ts)
retains the original completed SQL-reader object and freezes the intended title,
complete selected history, raw-history identity, target metadata/header, PCB
peers, client, actor selection, separate clock windows and capacity limits.
It requires exact active PCB history/tree membership within the supported
ordinary-PCB subset. Its offline collision screen does not claim native name
policy validation. The supplied actor UUID selects the original project users
row, or the native empty-display-name case when that row is absent.

Preparation uses the existing history, structure and six-table SQL models.
Clock-window maxima reserve serialization capacity before dispatch. Later
timestamp binding requires the original in-memory preparation identity and
cannot replace its baseline, intended title, actor, windows or budget. This
remains a data relation, not timestamp provenance or execution authority.

The retained PCB contains a historical DOCHEAD user. The earlier baseline
schema incorrectly refused this supported stored shape.
[Shared stored-header admission](../plugins/easyeda-pro-control/server/src/current-pcb-stored-header.ts)
now permits an optional exact four-field account object: UUID, nickname,
username and avatar, all bounded strings. Unknown, partial, null and mistyped
shapes still refuse. Both preparation and the SQL comparator use that schema.
All original raw history and ciphertext remain subject to exact preservation.

This does not change the proposed fresh header. Worker `xt` at 241441 includes
a supplied truthy user without projecting its fields. `Pi` at 1856199 captures
the PCB client and current project user during construction. Fresh `Lg`
construction at 2103244 creates the PCB model before ordinary `subscribe` at
2115300 later assigns `project.user`. The modeled fresh header therefore still
omits user. A historical account is neither that fresh producer nor the new
backend EDIT_HEAD actor. Original-generation proof is still required.

## Focused evidence and remaining work

Eight program/schema tests passed, including malformed and missing native
responses, swallowed-error refusal, hostile accessors, context/peer/client
changes, timeout without retry, result bounds and authority-promotion refusal.
Ten runtime/registration tests passed. Targeted strict type-aware lint reported
zero warnings and full type checking passed. Preparation and combined SQL tests
passed all 22 cases, including historical-user preservation. A maintained-reader
diagnostic against the retained disposable copy prepared all 20 documents,
53 history rows and 57 chunks without changing its evidence. Supplied future
actor/clock inputs in that diagnostic remain unqualified. These source tests
and retained-copy diagnostics are not connected preflight or rename validation.

The remaining rename implementation must:

1. Bind preparation and native preflight to an original operation-owned baseline,
   exact fresh worker/PCB producer, startup classification and retained process
   generation. A supplied client string or stored-header user is insufficient.
2. Issue actor and separate document/backend clock evidence before dispatch.
   Worker notify time uses `Date.now() + offset`; APP EDIT_HEAD uses its own
   `Date.now()` and request user/project-users lookup. Reuse original Windows
   clock/Job evidence without relabeling symbol lifecycle tokens.
3. Journal and consume one fixed project-qualified PCB update, rechecking the
   original receiver, metadata, peers, producer and clocks immediately before
   dispatch. Retain its acknowledgment before fallible follow-up work.
4. Prove normal closure of the entire original Job, then verify the complete
   six-table SQL effect. Awaited `uploadLocal` only schedules later upload work;
   a stable pending-set sample does not complete the debounced structure job.
5. Reopen in a fresh admitted owner with persistent upload-cache exclusion,
   verify saved target/peer content, close normally and compare final complete
   SQL. Only a successful disposable lifecycle can support writer registration.

Production writing, inverse rename, source/reuse-block variants and nonempty
PCB String validation remain separate work. No extra Save, rollback or replay
is authorized by the presence of these preparation modules.

## Completed installed111500 reader case

The original `pcb-reader-111500-20261018-baseline` lifecycle captured its closed
disposable baseline, relaunched, admitted the replacement, observed inactive
caches and opened the project without an editor. Its two active schematic pages
remained an explicit startup-qualification blocker; the approved observation
mode did not clear that blocker or enable a writer.

One `eda.dmt_Pcb.getPcbInfo` native-equivalent call passed with two identical
metadata samples: native title `pcb1`, display title `PCB1`, ticket452 and
updateTime1789176069352. Its observation SHA-256 is
`bcac4b2d442aa5f6c18efe3b6d07e8457d7d71b9e559abfd285e9ae007752020`.
No PCB canvas, rename, symbol patch, explicit Save or inverse was requested.

Normal closure was acknowledged once; the original retained Job then proved
termination. The lifecycle captured its final snapshot and retired, releasing
the capture. The offline analyzer accepted the complete 24-phase evidence:
all 35 SQL tables, all 20 native documents, schema, properties and provenance
are unchanged. Both raw copies are 598,016 bytes with SHA-256
`41ac606247582f9c4be17eda1492d76c0f33f70efa4d36a2ac8bf6ef780e5c12`;
both complete logical SQL digests are
`09a74ea168ec928ed2c4708997dd3c8b1d2b55f9305ddb1cf5696efe025645d9`.
The journal digest is
`74b58c74e6b63ee3c2db1214a825a9fecaafddd1b7a81f3942ea661ba0abf6e9`.

This closes the corrected reader case, not preflight or rename validation.
Historical equality is not startup qualification or a grant to edit. EasyEDA is
normally closed. Never replay this lifecycle or the previously completed copy.

## Candidate verification

The frozen candidate passed full local verification: 10,903 facade tests,
four platform-specific skips, zero failures; 424 bridge tests; strict types and
type-aware lint; reproducible build and compatibility; dependency/signature/audit;
repository/privacy checks and all seven official skill checks. Only own source
and bundle projections plus review time changed; external pins remain exact.
The first verify invocation used the repository root, which has no package.json;
it ran no tests and its error log is retained. The plugin-directory run passed.
Source430 SHA-256 is
`4cd348dd205a8605f1c8ad0ae133d85905d8320e7b824a8c6782a9390ba549f7`;
runtime3 SHA-256 is
`5e848f096599d5141f93b7ed03dcbdabc6d51a14ff7264be34d804dc608bad77`.
