# Current schematic child observer

Research and implementation date: 2026-10-19. This adds an unregistered,
fixed child-metadata/AST observer for the current EasyEDA Pro 3.2.206 tuple.
It does not enable schematic renaming or establish startup qualification.
No live application, project, Save, native helper or bridge call was used to
develop or test it. Native bundles were read as inert text.

## Sources

The official beta methods expose page properties and a boolean rename result,
not retained compiler ownership or subscriber completion. The rename reference
also documents propagation to a same-name reuse-block symbol and its associated
PCB. The existing ordinary/no-reuse exclusions remain necessary.
[Page enumeration](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_schematic.getallschematicpagesinfo.html),
[schematic rename](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_schematic.modifyschematicname.html).
These current documentation pages were checked on 2026-10-19; their example
delays are not evidence that the installed implementation completed its work.

Native file hashes were rechecked during this task. Offsets below are zero-based
UTF-16 offsets, not byte offsets or minified line numbers.

| Source | SHA-256 |
| --- | --- |
| [UI](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-ui/3.2.196.26ed3d6c/js/ui.js>) | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` |
| [SCH](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-sch/3.2.192.b79ad524/js/sch-main.js>) | `d9d6a955bf40d57daf9f27f31e0fff3191715ff50582418ad0922beb71b424bd` |
| [MGR](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-mgr/3.2.184.355087e9/js/pro-mgr.js>) | `005584e02cd9b2d49fdb387b2f997c1c8d3f88b0c48a7531c8097c483ed0bd2e` |
| [WORKER](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-mgr/3.2.184.355087e9/js/project-worker.js>) | `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928` |

SCH6281539 exports `gVars`. SCH6282338 exports the existing closure-held manager,
AST and temporary AST through `SCH.D.leftTree.manager/ast/tempAst`. These three
functions return references. The observer does not call the adjacent `render`
export, which enters the project-tree update path. UI15074428 constructs the
project information with `branchUuid`; UI15074861 publishes it and SCH6146135
retains that information as `gVars.currentProject`. This supplies an actual
project/branch binding, not an invented property on the private manager.

SCH1386484 declares `/PrjDB/sheet/getAllKVDatas`. MGR2060322 accepts the schematic
filter first and project identity second; WORKER1921285 returns all active
children when the filter is absent. The fixed call therefore uses
`[undefined, projectUuid]`. The neighboring array route catches errors and
returns an empty array; the KV route does not. WORKER1919022 projects metadata,
including lowercased/display titles, parent schematic, version, timestamp and
ticket. It also computes `doc_id`; that field is not claimed by this observer.

SCH `mM`5446807 produces sheet title/order fields. `N1`5469012 produces the
container and child map/sort fields. `Lx`3630653 initializes AST state;
`Ja`3651071 advances `transId` and rebuilds the accepted AST. The observer reads
those existing objects and flags without invoking any of these routines.

## Implemented contract

The new implementation consists of `current-schematic-child-guard.ts`,
`current-schematic-child-program.ts`, `current-schematic-child-observation.ts`
and `current-schematic-child-runtime.ts` under the facade's `server/src`.
The existing child-roster contract supplies the strict result schema and the
existing complete-SQL model supplies expected child membership and ordering.

The fixed program retains the SCH manager, project information, AST/temp-AST,
schematic maps, selected schematic records, sheet maps, sort arrays, every
selected sheet object and paired pending sets. It rechecks exact identities and
project/branch/format around each native await. It requires distinct settled
AST roots, matching positive transaction IDs, no pending batch work and stable
project metadata. It reads the complete child KV map twice with project reads
before and after each call. No editor tab, hidden editor, dirty tab or restored
tab is admitted by the existing no-editor guard.

The two copied samples use the existing
`private.current-schematic-child-roster-observation.v1` schema, inside a bounded
exact-JSON envelope. Limits are 128 children, 524,288 UTF-8 envelope bytes and a
ten-second inner deadline. Timeout prevents later continuation but cannot cancel
an already dispatched vendor request. There is no automatic retry.

The Node decoder rejects accessors, proxies, extra fields, sparse arrays,
non-finite numbers, negative zero, malformed envelopes and target substitutions.
The runtime wrapper requires the original completed SQL inventory, its original
metadata projection and its original prepared roster by WeakMap identity. A
matching copied object or a fresh same-content reader is not accepted. The
wrapper retains the authenticated bridge scope and method receivers, verifies
the fixed native implementation before and after its sole generated program,
then compares the result with the original SQL roster. No caller code, private
method name or custom execution callback is accepted.

These original SQL identities are historical data identities. The native object
references are retained only inside the observation invocation. Neither becomes
a process, worker, compiler, queue, producer or future-dispatch lease. The
comparison retains all existing false authority/qualification flags. No public
tool registration or writer integration was added.

## Remaining work and concrete omissions

- Complete AST/source binding still excludes geometry, `doc_id`, `uniqueNumber`
  and compiler identity. Matching metadata and order cannot prove complete
  successful decoding or absence of an earlier startup repair.
- SCH5766787 `w9` can initialize missing children when its returned count exceeds
  the temporary AST sort length. SCH6204757 schedules its 500 ms debounced
  subscriber without awaiting it. The new observations are not a barrier for
  that callback, and a later change can invalidate an earlier snapshot.
- Initial-page decoding can upload repaired components, delete empty net groups,
  create missing template parts or Save pending compiler records. Original
  compiler/queue observations and a complete supported decoder/effect model
  remain separate work. See the
  [startup-effects research](2026-10-16-current-schematic-startup-effects-research.md).
- Native AST rebuilding publishes standardization updates and can notify open
  drawings. A writer must re-establish the no-editor/dormant-panel conditions
  and rule out reuse propagation before dispatch. The observer does not invoke
  the rebuild or establish those future conditions.
- A dedicated original SCH actor/clock/producer owner, one-shot journaled rename,
  full closed SQL proof, persistent replay-cache exclusion and fresh-generation
  reopening/closure are still required. PCB tokens cannot provide them.
  Generation closure and observed subscriber completion must remain separate
  claims. No Save, inverse or general schematic edit is enabled here.

## Verification

Under Node24.18.0, npm11.16.0, core limit zero, the mandatory isolation preload
and `TMPDIR=/tmp`, the 19-test focused set passed: eight existing child-roster
tests plus eleven new program/transport/runtime tests. After final project/branch
hardening, the eleven new tests passed again. Strict TypeScript and targeted
pedantic type-aware Oxlint passed with zero warnings.

The program tests use a native-shaped VM, not EasyEDA. Runtime tests use synthetic
source files and bridge replies while exercising the maintained file/descriptor
verifier and original SQL-reader identities. They cover nested owner replacement,
branch drift, unsettled holders, complete-roster drift, malformed or excessive
responses, forbidden getters, timeout continuation and authenticated-scope drift.
They do not establish connected validation, successful startup, native callback
completion or saved/reopened schematic support.
