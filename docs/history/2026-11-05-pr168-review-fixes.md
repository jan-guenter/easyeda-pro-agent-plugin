# PR168 review fixes and remaining work

This record covers the correction batch based on
`0ebd4c498a37148e61a9e69f7695126ab794b77e` in
[PR168](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/168).
The final correction commit and release proof are pending at this checkpoint.
The leaf patches below identify the reviewed source snapshots without
attributing them to an uncreated commit. The rebuilt local candidate remains
unpublished; PR168 still points to the stated base.

## Review findings and corrections

Both exact-base CodeRabbit reviews were retained in full, including collapsed
and outside-diff findings:
[5778205267](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/168#pullrequestreview-5778205267)
and
[5778320393](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/168#pullrequestreview-5778320393).
Their successful review checks establish that review completed, not that the
reported defects or CI failures were absent.

The first review reported five distinct issues. The correction batch:

- Distinguishes the observer's source base from its later composed payload and
  corrects all eight embedded LanguageTool spacing/grammar suggestions in the
  [observer history](2026-11-04-project-structure-observer-source.md).
- Applies spacing-only changes to the
  [cache-envelope history](2026-11-05-forward-cache-envelope-and-arm.md).
- Retains original worker breakpoint allocation replies before later owner or
  location checks can fail. A known unique ID remains available for its original
  cleanup; late replies cannot restore normal work. Malformed or duplicate
  allocation uncertainty remains unresolved until actual original-generation
  exit. No allocation is replayed or reconstructed from copied JSON.
- Adds exact source provenance to the
  [packaged-manager history](2026-11-05-packaged-foreground-manager.md), including
  its original thirteen-file packaging patch and the matching composed frontend.
- Preserves both the original source-seal/closed-baseline failure and a later
  failure-record publication error in an `AggregateError`, with the original
  failure as its cause. The retained original failure can settle without replay.

The second review additionally found legacy request-ID ceilings in the three
dedicated native parent, worker and cache parsers. They now select the forward
ceiling of 1,002 only from the original forward launch switch. Legacy worker
811 and parent/cache 856 ceilings remain unchanged. ID limits remain separate
from forward class accounting of 941 normal and 61 cleanup commands. The method,
phase and field grammars and all writer/Save restrictions are unchanged. The
second review's numeric-spacing inline duplicates the already corrected observer
history issue; it is not counted as another source defect or test selection.

The generated C# policy includes zero, last-admitted and first-refused boundary
checks for forward and both legacy selectors, invoked by `CompileOnly`.
Generator checks bind all three handwritten parser call sites to that policy.
The exact helper is 1,042,994 bytes, SHA-256
`58f681b7c896069fd748b957fe925e39ed4b8990f88de3483fbda781a65dccee`.
Its unchanged 1 MiB cap leaves 5,582 bytes. The new C# checks have not been run
locally; exact-final Windows CI remains required.

A corresponding main-observer custody audit corrected the same boundary in the
original main request parser. The original pending slot captures an allocation
reply before post-reply checks. A stopped allocation keeps that slot and may
settle only its original late reply during cleanup, without another dispatch.
Known IDs, duplicate/malformed allocation uncertainty and independent channel
uncertainty stay distinct. Early cleanup of an unknown allocation refuses
without consuming later cleanup. Original request/completion and structure
cursors remain exclusive. The tests use the actual factory, core and opaque
lease with an inert helper and synthetic native replies; they prove no native
observer mounting, SQL effect or new cleanup authority.

## Preserved CI failure and focused verification

The first exact-base CI run
[41943323078](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/41943323078)
and separate Windows run
[41943322973](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/41943322973)
finished with seven successful and four failed jobs out of eleven. Facade shards
4, 5 and 7 failed; the dependent build/test aggregate also failed. The retained
facade totals are 14,177 tests: 14,166 passed, six failed and five supported
platform skips. Build verification, Windows recovery and the other five shards
passed. These results remain failed CI for the original head.

The six failures came from three stale fixture contracts. The schematic-opening
VM now receives the genuine `operationPath` dependency. The native codec test
expects the explicit `id`, `method`, `params`, `sessionId` wire order independently
of schema property order. The Combined registration fixture projects only the
description literal out of its executable AST span; its state, dispatcher,
schema, annotations and callback remain checked. The 40,000-character cap and
all other existing caps remain unchanged. No production guard was relaxed.

Focused selections used Node 24.18.0, npm 11.16.0, core limit zero and the
maintained test-isolation preload. Counts below are per file and selection;
repeated runs and earlier implementation batches are not added into a new
unique-test total.

| File under `server/tests/` | Selected checks passed | Scope |
| --- | ---: | --- |
| `current-project-structure-worker-observer.test.ts` | 12 | Seven maintained and five new allocation-custody cases; the final five-case rerun overlaps this selection. |
| `current-project-structure-main-observer.test.ts` | 11 | Four maintained structure cases and seven original main allocation-custody cases. |
| `current-footprint-copy-main-backend.test.ts` | 3 | Original main construction, copied-capability refusal and retained lost/malformed reply. |
| `current-footprint-forward-source-lifecycle.test.ts` | 8 | Six maintained baseline modes and two new dual-error/publication-settlement cases. |
| `current-footprint-copy-forward-native-request-ids.test.ts` | 2 | Exact generated policy and mutation refusals for all three parser selectors. |
| `current-footprint-copy-forward-wire.test.ts` | 4 | Separate forward/legacy ID policy and unchanged closed vocabulary. |
| `current-pcb-diagnostic-native.test.ts` | 2 | Exact helper identity and forward birth self-check source. |
| `current-schematic-rename-owner-opening.test.ts` | 1 | The exact formerly failing transferred-owner VM case. |
| `current-footprint-copy-native-protocols.test.ts` | 2 | Explicit independent native wire envelope expectations. |
| `current-footprint-copy-registration.test.ts` | 6 | Existing registration and bounded executable extraction cases. |
| `current-pcb-diagnostic-admission-cache.test.ts` | 1 | Fresh record-byte verification and changed predecessor refusal. |
| `current-footprint-forward-opening-relinquishment.test.ts` | 5 | Both producer profiles, immutable rereads and publication settlement. |

The last two selections also verify the invocation-local diagnostic digest memo.
Only synchronous `validateChain` retains lazy object digests, until that invocation
returns. Its private callers supply fresh JSON/schema-owned records. Normalized
AST comparison preserves every original predicate and its order; all bytes
outside the function, schemas, descriptor/roster checks and fresh reads are
unchanged. No admission, owner or settlement result is cached across an await.
The six checks establish semantics, not a measured speedup. Repeated complete
journal reads remain a performance backlog item.

Leaf checks passed their types, targeted strict lint and applicable generator or
identity checks. Initial fixture/tooling failures and subsequent corrections
remain retained. Exact-final CI, final review disposition, publication and
installation remain separate pending gates.

## Unpublished local payload checkpoint

The final local build and repeat build matched generated artifact bytes and
modes. Full types, zero-warning lint, API coverage, bridge types/lint,
compatibility and all seven quick skill checks passed. Plugin, packaged-skill
and repository validation remain pending at this checkpoint.

The rebuilt candidate has 1,016 facade source files with SHA-256
`5bcdc192babf7626d9f1c57394e9dc00699f8dc198d9ed131b8249b2c4659f49`,
and three runtime files with SHA-256
`d439b684e0dbe1629273ab19a6b625cdb14a7c4b0b2d4af6853663a2302667f0`.
Its standalone manager frontend is 1,360,586 bytes with SHA-256
`e2715776844910e3f19d73d48fa3ada65f0845c4418b888b3156e996c7632d9e`.
This differs from the original fixture frontend's
`5d124ccc7a683fe19b3d1b83b89e08efdef1124688573436e6567fb358bbf0ee`;
the earlier fixture observation retains its original attribution. These local
pins prove neither installation nor runtime/native admission of the new batch.

## Leaf provenance

These SHA-256 values identify retained review patches against the stated base;
they are not final source/runtime fingerprints or release commits.

| Leaf | Patch SHA-256 |
| --- | --- |
| Worker allocation custody | `cf13da2973617173995b042aec700fa44fc431f03c66114089eade5a089861ee` |
| Main allocation custody | `7f5f1b5a594229ecf113cfd9b840b0399eeec2fa8e0a21e49f456ab1b1a11a32` |
| Baseline failure and publication errors | `e6e8dc9839d7f7207cf7207d2530ef29a7e4a1eb7fccbde931ab90226aeab168` |
| Forward native request-ID policy | `2da1a2b8aa27d9f2f9f7d2ed224579d768c6224c23f9a023f9d7c8276a42a9f3` |
| History and CI fixtures | `ecdab5de5f45af3c5204b8535d65c497c444f4bacdb463b1d6b6cbde2567ec50` |
| Invocation-local digest memo | `f1567894f8cf0319d65f29aff3d4248778f0e5c2ff43df5db190e5e8b6934c2f` |

## Recovery status and remaining work

The [terminal recovery append](2026-11-05-forward-capture-recovery-and-source-fixes.md)
records actual v2 historical relinquishment on the unchanged frozen base,
preservation of all thirteen original records, fresh complete SQL/history/raw
invariance and cooperative retirement/EOF/exit of the fresh recovery facade.
The earlier capture, original termination and helper-release outcomes remain
unknown, with all corresponding authority fields false. This correction batch
does not turn external physical closure into an original native acknowledgment
or a normal-close source baseline.

Remaining work includes connected qualification of the corrected capture,
source sealing and closed-baseline routes, then a genuine forward execution
binding with its original head, queues, clocks, saved-generation envelope and
complete inverse/persistence proofs. Private source/input custody alone grants
no create, scheduler, writer or Save authority.

The structure observers still need their fixed native protocol and purpose,
complete normal/cleanup/control reservations, a cross-main/worker join to the
same original native allocation and independent complete closed-SQL effects.
The existing native sender's normal-only cleanup guard remains unchanged.
Remaining API resource, settings and export coverage also needs its own exact
contracts and effect/saved-result verification; the
[capability matrix](../../plugins/easyeda-pro-control/skills/easyeda-pro-control/references/capability-matrix.md)
keeps implemented routes and omissions separate. Broader repeated-read
optimization must preserve fresh complete bytes, descriptor/path identities,
predecessor links, malformed-refusal order and all global owner exclusions.
