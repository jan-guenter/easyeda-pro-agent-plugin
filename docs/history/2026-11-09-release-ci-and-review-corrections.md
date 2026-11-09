# Release CI and review corrections

The first combined release candidate, public commit
`3f52f691a54cbc5541b95bcb0754a3dd2f52391d` in PR208, has tree
`466aa09c8d82ecc9a3cd350c7a9d5f2f53845e42`. Build and history checks passed;
seven facade shards and the Windows check failed. Those results are retained.
This record describes the resulting corrections; final release CI and merge
remain pending.

## Native compiler warnings

The earlier [local package record](2026-11-09-composed-control-development.md)
correctly recorded successful compilation and 66 inert checks. Its compiler
probe allowed warnings. PowerShell 5.1 treats those warnings as errors, so that
probe did not establish Windows acceptance.

The initial Windows job stopped at its 30-second parent deadline. A separate
Windows diagnostic run allowed 120 seconds and exposed the actual failure:
Add-Type reported an unassigned retained field, then wrapped the complete
minified source in a large error. The helper reported its compilation failure
after about 85 seconds. Its temporary deadline was restored to 30 seconds. Per-purpose timing
and a manual dispatch for the complete Windows workflow remain available.

The emitted Via structure fields now explicitly start at null. Closed inverse
schematic and Component fields explicitly retain their CLR defaults of null,
false or zero. These changes grant no call or writer authority. The schematic
structure clone's old unchecked replacement then exposed a stale declaration
anchor; its replacement now matches the initialized declaration exactly and
refuses missing or duplicate source. The original private-field census remains
unchanged.

All four corrected C#5 inputs compile with warnings treated as errors, with
zero warnings and errors. The unchanged inert drivers pass 66 checks. Compiler
input sizes are 2,053,871 bytes for diagnostic, 2,078,245 for inverse, 2,070,984
for schematic and 1,801,598 for saved schematic. The compiler ceiling remains
2,097,152 bytes. These are Linux/.NET10 compilation and inert-state results;
Windows acceptance remains a separate CI requirement.

## Facade regressions

The affected regressions now use original capture issuers and the registered
schemas in their VM fixtures. Source comparisons restore reversible type
aliases, hash banks and existing closed-build factoring before comparing full
original program/table bytes. Existing byte/hash assertions, refusal cases and
compiler limits remain intact. Request totals are rederived from the added
passive fence read, finite registration phases and mutually exclusive native
GET routes. All thirteen public schematic smoke entrypoints are checked.

The synthetic symbol coordinator baseline now uses the actual reviewed bundle
fingerprint, as the existing pending fixture already does. The growing source
inventory exceeds its unchanged 262,144-byte artifact ceiling. The bundle
identity still passes the original manifest validator, while the separate plan
continues to bind the real engine implementation hash. No capacity or authority
check changed. All reported failed groups have focused corrections; the final
complete suites remain required on the final release commit.

## CodeRabbit review

PR209 completed review `5824820785` on
`f2a9d521c3160a1bdd0a630d2c2b13906a8903de`. Both reported findings are addressed.
The original historical wording is restored, with its existing dated correction
preserved. The smoke-vector reader retains validated packed bytes when checking
canonical source, accepting an alternative valid gzip encoding with matching
packed and raw hashes. New output still uses level-nine compression; malformed
hashes and source framing continue to refuse.

The service analyzed 98 functions in 50 files and reported 58.16% documentation
coverage, with an 80% threshold. It skipped 19 unsupported files and 74 files
over its analysis limit, and supplied no function roster. An independent model
reproduces 57 documented functions in that inferred cohort. Twenty-two specific
contracts were added across seventeen files, with byte-identical emitted
JavaScript. The next external result remains pending; this is not a claim about
the skipped files or whole-repository documentation coverage.

Five selected paths had unavailable changes in the review and no patch in the
GitHub files API:

- `2026-11-06-footprint-four-generation-composition.md` in this history directory.
- `server/src/current-footprint-forward-independent-shared-projection.ts`.
- `scripts/native-baseline/shared-owner.ps1.txt`.
- `scripts/footprint-forward-cold-execution/native-core.cs`.
- `server/src/extension-api-packaged-4197-data.ts`.

The service supplied no more specific cause. The paths above are relative to
the plugin except the history record. It separately reported no reviewable
changes for `server/src/extension-api-coverage.ts`; that patch removes one old
omission entry, while the current route registry and tests retain restricted
native-task equivalence, incomplete declared-contract support and unrecorded
current live validation. All six paths remain outside CodeRabbit-covered
counts. Generator checks and source peers retain their own scope.

PR206 and PR207's first manual requests were explicitly rate-refused. Their
latest replies allow one included review per hour, superseding the older
four-per-hour footer. Their consumed requests and unavailable scopes remain
recorded; neither is credited with a completed review. Synthetic review contexts
must never merge. PR208 is the real release, and implementation will pause
after its protected merge as requested.

All application validation in this batch used disposable generated fixtures.
Original application, helper and controller closure completed before release
work. User designs were untouched; raw logs and process evidence remain private.

## PR206 native budget correction

The lexical and intent senders now have independent normal and cleanup counters:
58 normal plus one cleanup for lexical, 81 normal plus one cleanup for intent.
The aggregate profile and ownership checks are unchanged. Encoding still occurs
before consumption, and a transport failure retains the consumed reservation.
Only the four Wire counter rows and their exact source-region proof change;
the original 155-row catalogue, accessor rows and shared reference hashes remain
unchanged.

A small committed managed C# fixture includes the actual sender methods and
inert encoder/transport doubles. The previous source fails intent-first cleanup.
The corrected source passes both cleanup orders, independent exhaustion and
no-borrowing checks, encoding-failure and sending-failure consumption cases.
Node verifies the fixture against its TypeScript producer; the Windows workflow
executes it with C#5 warnings treated as errors. Its Linux managed proof passes;
the new Windows step and final release suites remain pending.

### 2026-11-09 completed PR206 review and non-native corrections

PR206 subsequently completed review `5825428192` at 11:49:57 UTC on exact head
`cfba60719dcd366dd84309a662305301acef50f1`. Its earlier quota refusals remain
historical evidence. This review reported four actionable comments and two
nits. The shared lexical/intent native-counter finding has a separate source
correction and native field proof; it is outside the non-native leaf below.

Commit `10cfa3c4ef482dde6faf70a3ebd7f6276a0c4837`, tree
`f18a83321dcb1a6ab23b4f5d4ca72bde5b7844c3`, prevents controller retirement while
either requested lexical or intent origin is unsettled, before any observer
retirement starts. Two deferred-origin cases reproduced the original missing
rejection. After correction they preserve the exact pending Promise, prove no
premature observer retirement, and allow the original reverse-order retirement
after settlement. The test runs the unchanged controller body with synthetic
provenance and observer dependencies; it starts no native actor or application.

The same leaf appends exact corrected Wire source identities to both reported
history records, preserving earlier observations and the unbound initial
nine-case limitation. It corrects the roster-capture comment and names the
per-string limit `stringUnits`; the UTF-16 length behavior and total UTF-8 JSON
byte limit remain unchanged.

The service reported 64.00% documentation coverage for 50 functions in 47 files,
with an 80% threshold. It skipped 17 unsupported files, three large files and
60 files beyond its limit, and exposed no named function roster. Eight useful
codec, source-binding and dispatch contracts were added in seven supported
files; all seven emit byte-identical JavaScript. An independent approximation
identifies those functions but does not exactly reproduce the service cohort.
Reaching 40 documented functions would give 80% if the same cohort is used;
the next external gate result is still required.

The sealed non-native leaf passed nine focused cases with no skips, both
TypeScript configurations, changed-file type-aware lint with zero warnings,
and all three repository, plugin/MCP-contract and packaged-skill validators.
The validators individually returned zero with parsed `ok: true`. Initial test
style diagnostics and an initial missing local lint-binary path remain retained
alongside their corrected commands. The before-change test command printed
two failed cases; a trailing log-print command masked its aggregate shell
status, so only its explicit test failure result is credited.

Of the 136 effective PR206 paths, two bundles were filtered by the service and
134 were selected. Seven selected paths had unavailable changes:

- `scripts/schematic-edit-native.cs`.
- `scripts/pcb-diagnostic-owner.ps1`.
- `scripts/footprint-inverse-native.ps1`.
- `scripts/schematic-saved-readback-native.ps1`.
- `scripts/schematic-edit-native.ps1`.
- `server/src/current-pcb-diagnostic-pipe.ts`.
- `server/src/current-pcb-diagnostic-owner.ts`.

These paths are relative to the plugin. The review therefore supplies 127
available selected paths, not 134 or 136. Its unavailable files, filtered
bundles and documentation skips are distinct scopes. Deterministic generated
byte/compilation proofs and source peer checks retain their own attribution;
none is described as CodeRabbit coverage.

### 2026-11-09 retirement-start peer correction

The root peer identified a second timing window in the controller correction:
after its pending-task check, a new intent task could start while lexical
retirement awaited. A third synthetic dependency-seam case reproduced that
missing rejection on `10cfa3c4`, with an actual failing test exit. Retirement
now seals new observation-task issuance synchronously before its first await.
Existing accessor, lexical and intent task Promises retain their return path;
the ongoing retirement can complete in the original order.

Production correction `5e5c7768f33e2813dced2286757dea1002267933` and its shared
test-fixture follow-up `d51633e858bcc003aab340e945ec76a2b52a4ace` yield final
source tree `1e710333d26ece0133447dff196759df2ab82543`. On that sealed checkpoint,
ten focused cases passed with no skips, both TypeScript configurations passed,
changed-file strict lint reported zero warnings, and each of the three
mandatory validators returned zero with parsed `ok: true`. The first race-test
lint run rejected two fixture classes in one file; the shared fixture resolves
that diagnostic without relaxing a rule. Earlier nine-case results remain
attributed to their earlier source, and no connected lifecycle result is added.

### 2026-11-09 completed PR207 review and final correction scope

PR207 completed review `5826150725` at 12:57:21 UTC on exact head
`44c763b1ca77c29f9d4ade1c5741968d30728ab1`; its CodeRabbit check completed
successfully at 12:57:26. The review posted two formatting findings and one
additional unverified journal finding. Both formatting findings are corrected
by spacing and paragraph wrapping only. Independent comparisons retain every
non-whitespace character, including all measurements and source identities.

Source peer inspection confirmed the journal issue at the provider's catch
path after `publishResult`: a later custody check could fail and attempt a
second terminal sidecar. The journal now rejects failure after a verified
result. A failure requested while the original result is pending joins that
same Promise, then rechecks its descriptor before writing. Failure reservation
remains synchronous, and an unsuccessful result publication still permits the
failure record without overwriting unrelated evidence. Sequential and overlap
regressions fail on the previous source and pass after correction. The focused
baseline file passes eleven cases with no skips. These are real managed-journal
and inert-provider checks, not a connected native lifecycle result.

The source correction is `02a10a80859f37890f1e357665fb2cc4faf8b685`, integrated
as `95265607` after the separate formatting correction `6bd648bb`. Eight useful
function and callback contracts address the documentation concern. The service
reported 75.00%, or 72 documented functions out of 96 in 50 files, with 13
unsupported and 79 file-limit skips. It supplied no named function roster.
The independent approximation finds a different cohort, so no updated external
percentage or whole-repository documentation pass is claimed. The comments
preserve emitted JavaScript outside the separately identified journal fix.

Of 149 effective PR207 paths, the service filtered two bundles and selected
147. Five selected paths had unavailable changes: the plugin's
`pcb-diagnostic-owner.ps1`, `footprint-inverse-native.ps1`,
`schematic-saved-readback-native.ps1`, `schematic-edit-native.ps1` and
`schematic-edit-native.cs` under `scripts/`. This supplies 142 available selected
paths. Those five omissions remain distinct from documentation skips and
filtered generated artifacts. Deterministic generation, exact compiler-input
proofs and source peers have their own attribution.

The earlier composed local checkpoint `3a7a4ac02e176355d5ad7ae41954ab2f49c9c9d7`
passed all required non-suite checks, seven skill checks and reproducibility
of three bundles. Its separately materialized package has 4,932 files,
96,986,911 bytes and 46 directories, with exact committed bytes, modes and
single-link files and no dependencies. That checkpoint includes the native
budget split: its schematic compiler input is 2,070,997 bytes, superseding the
earlier size above. The other three strict native input hashes are unchanged.
The journal correction requires a fresh composed build and exact release CI;
earlier green results are not reused as evidence for changed implementation.

PR171 was closed as superseded. Completed synthetic reviews PR206 and PR209
were closed without merging, and PR207 must also close without merging after
its corrections are reconciled. PR208 is the sole real release target. Final
non-suite checks and every facade shard, bridge, Windows and history job must
pass for its final unchanged payload before the protected merge. The new
Windows managed-budget step remains part of that requirement.

Implementation pauses immediately after that real merge, as the user requested.
The [consolidated backlog](2026-11-09-backlog-consolidation.md) retains qualified
startup continuation, connected Text and Wire persistence, footprint writer
coordination and native GET/reference/DEL completion. Official Git marketplace
installation and actual serving-process admission remain post-break work;
the installed snapshot remains `0.3.0+codex.20261105182454`. This batch introduces
no new general writer admission. All original validation application, helper
and controller resources closed before release work; user designs remain
untouched.
