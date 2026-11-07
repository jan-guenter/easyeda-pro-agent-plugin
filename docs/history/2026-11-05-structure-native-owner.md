# Original native structure observation owner

This source increment follows the [cold-arm and codebook work](2026-11-05-structure-observer-native-codebook.md)
on commit `8a65859`. It mounts those fixed observers on a separately born,
original native owner. It does not admit an edit, structure trigger, Save,
forward footprint execution or inverse. No EasyEDA application was launched,
no native application operation was dispatched and the production project was
not opened or edited during this increment.

The maintained entry is
[`startCurrentProjectStructureNativeOwner`](../../plugins/easyeda-pro-control/server/src/current-pcb-diagnostic-owner.ts),
followed by its existing original startup/construction flow and
`createStructureObservation(originalWorkerLease, frozenPlan)`. The new
[`CurrentProjectStructureObservationWorkflow`](../../plugins/easyeda-pro-control/server/src/current-project-structure-observation-workflow.ts)
arms the original main observer and original worker observer, observes their
actual requests separately, and compares the complete tree, project, branch,
ticket and exact original project path. It requires the original sealed target,
factory, main construction packet, main runner and worker dependency; equal
objects or copied handles do not issue this authority. Only a surrounding
journaled operation can provide an independently authorized producer. This
increment adds no public MCP trigger or writer route.

The new native purpose is `project-structure209`, selected only by
`-ProjectStructure209` at original helper birth. Its fixed worker and main
codecs reconstruct source and locations inside the generated helper. The wire
carries bounded scalars and handles, not caller source. The dedicated purpose
rejects create, paired-clock, main-history request/completion and saved-cache
actions. Older native purposes retain their request ceilings and cannot adopt
the new purpose. The existing Combined profile has **55** main requests; the
previous codebook record's statement of 54 was incorrect.

The [capacity profile](../../plugins/easyeda-pro-control/server/src/current-project-structure-native-profile.ts)
derives the reservations from maintained component bounds:

| Lane | Normal | Cleanup | Total |
| --- | ---: | ---: | ---: |
| Worker | 734 | 38 | 772 |
| Main | 59 | 27 | 86 |

Worker normal capacity preserves the original 224-request startup prefix and
adds 160 observer commands with two assignment reproofs each, four fresh-scope
reads with seven commands each, and two standalone reproofs. Cleanup preserves
32 original startup requests plus six observer requests. Main capacity adds
18 original construction requests, one original lease issuance and 40 observer
requests; cleanup adds three construction, 23 observer and one original capture
release. Helper-control limits separately include the original enclosing
reproofs, complete main polling allowances, renderer polling, wrappers and
terminal controls. Before arming, the frozen comparison tree must fit both the
32 KiB helper command and 64 KiB CDP envelope at maximum handle sizes. These
are source reservations, not connected performance or completeness evidence.

On first observation failure, the workflow revokes both observers and keeps
awaiting both original promises. Its explicit `cancel()` supports the same
cooperative revocation while pending. It never races away an original request.
Main observation has a finite 15-second source-observer window; worker waiting
has a 15-second bound and individual requests have finite original transport
and local bounds. Pending original allocation replies remain in their original
transport. Cleanup removes only retained breakpoint IDs, resumes only a known
original pause once, and releases the original capture group afterward. A
separate cleanup-only close check permits normal native closure after a
semantic observer failure only after all original queues, pauses, allocations
and capture groups are quiescent. It grants no normal-work retry. Unknown
allocation or missing acknowledgment retains custody.

The joined-result registry requires both original leases to remain live. After
the intended main lease release, the frozen result remains historical data and
its live lookup refuses. Cleanup alone does not release that lease. Existing
persisted observer result schemas and their false authority fields remain
unchanged. The new joined result also leaves complete upload-frontier proof,
write eligibility, complete SQL effect and Save authority false.

The [generator fragment](../../plugins/easyeda-pro-control/server/src/current-project-structure-native-fragment.ts)
is deterministic and idempotent. The startup generator applies it after its
ordinary regions. No checked-in helper, bundle, compatibility projection or
helper pin was regenerated here: the parent integration owns that single final
generation. Integration must preserve the two generated `partial` native class
declarations when refreshing the existing forward-native graph.

Verification used Node `24.18.0`, npm `11.16.0`, Linux x86-64 and core limit zero:

- Full TypeScript checks and strict type-aware lint of every changed source,
  generator and test passed.
- The final focused selection passed all 40 tests: real synthetic V8 worker
  pauses/finalizers, main allocation and cleanup cases, fixed wire grammars,
  inert original-factory readiness, and workflow orchestration. Two delayed-peer
  failure cases prove cleanup remains blocked until the original promise
  settles, preserve the first failure, and revoke both observers. These tests
  establish no connected native owner or application effect.
- The complete transformed helper's C# compiled under .NET SDK `10.0.113` in a
  private temporary project. Its empty native-birth/codecs/write-refusal smoke
  passed without Windows calls, a root process or a Job allocation. The source
  transformer emitted 1,127,641 helper bytes and 1,018,390 C# bytes. This does
  not establish Windows or EasyEDA validation.
- Repository, all-skill and MCP-contract validators passed; new local history
  links and whitespace checks passed. Full integration builds and exact-payload
  suites remain the parent integration's responsibility after helper generation.

The original conflict-only connection from this worker was also closed by its
single supported close-conflict request. A private retained pidfd verified its
original PID/start identity, pinned Node executable, module digest and zero
children/sockets, then independently observed that same process's exit. No
signal, owner adoption or closed-transport retry occurred. This is host cleanup,
not native application/helper release evidence.

## Fresh managed import uses a different source path

The installed main asset SHA-256
`52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c`
was read without executing it. Its fresh `createBranch` path at UTF-16 offset
`2585199` calls `f3` (`2591503`) twice to insert branch rows, then `EC`
(`2591881`) to update the project default branch. `ls` (`2589188`) and `MC`
(`2589267`) read branch/history metadata; the preceding `gC` (`2590791`) and
`NB` (`2591036`) are count/read paths. Parent structure copying in `CB`
(`2592013`) belongs only to the existing-parent, nonempty-branch case. Thus
fresh branch creation does not seed a structure row.

The separately researched local archive importer awaits its own main
`project.setProfile` request with ticket 1, bypassing the worker Nd/QA chain.
For a fresh empty structure table this is the original main INSERT path, while
the current main observer deliberately requires the lower-ticket UPDATE path.
The worker observer cannot join a worker allocation that this importer never
created. This increment must not be described as import structure completion.
Supporting that route requires an original importer/main-only observer with
the actual INSERT connection, query/callback and closed-SQL effect, followed by
cache-excluded reopen proof. It cannot be supplied by manufacturing a worker
lease or changing an authority flag.

The remaining footprint writer dependencies are the original pre-project
producer roster, serial/debounce/buffered-stream/publish-timer and detached
cache/retry outcomes, plus fresh original main head/lock exclusion joined
across the sole create's async continuations. The separate
[eligibility research](2026-11-05-forward-execution-eligibility-research.md)
records the exact source spans. The new observer purpose supplies neither
that roster nor an eligible writer.
