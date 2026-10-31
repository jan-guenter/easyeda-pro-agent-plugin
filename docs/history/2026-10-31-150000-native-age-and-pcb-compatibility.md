# Native age workflow and historical PCB compatibility

## Restarted host and consumed cache case

The restarted host loaded `0.3.0+codex.20261031120940` from the official Git
marketplace. Its actual serving process, original control directory/lease,
machine profile, Node 24.18.0 executable, core limit and stdio remained stable
through a complete comparison to main
`27881f4918e4ce8375500b7f1ef57b94155abd3f`: 2,488 files, 42 directories and
48,139,025 bytes, with committed modes. Inventory SHA-256 was
`a1e97761efb4cad40e7b41ecb0576e147523cf21698acfb3ed8765378a8699dc`.
This established the serving package, not native ownership or writer authority.

New case `footprint-held-cache-120940-20261031-native-01` refused with
`PCB209_VISUAL_PROJECTED_RESULT` before journal reservation, checkpoint
preparation or native allocation. Inspection retained no native owner, no
records or unpublished records, and allocation outcome `not-attempted`.
No application launch, project navigation, cache observation or explicit Save
was dispatched. No native cleanup remains. The disposable fixture's complete
file hash and size still matched the fresh pre-case observation, with no
SQLite sidecars. No whole-production-storage invariance claim is made.
The failed case is consumed and must never be replayed.

The rejection came from a valid, completed older visual record encountered by
the global launch gate. A result-format change had reused the v1 schema while
adding a field and replacing fixed explanatory text. Historical validation
reconstructed the current projection, so it rejected the original record.
The earlier cache case in the [previous batch](2026-10-31-120000-catalog-navigation-and-publication-custody.md)
had reached a different startup refusal; this new failure does not establish
whether the loading-window change works live.

## Implemented changes

Visual results now emit v2. Historical parsing reconstructs both exact released
v1 shapes, retaining their original allowed operation kinds, field rosters,
fixed text, raw packet digest and target/effect checks. Altered or extra fields
still refuse. A read-only check accepted the actual older record without
changing its bytes or recovering any process ownership. A focused global-gate
regression covers a completed historical operation followed by new work.
Repository rules and the architecture guide now require immutable persisted
projections and explicit historical parsing.

The disposable visual purpose also supports `fit-board-outline`. The fixed
native `fitBoard` subscriber uses existing Board Outline views or Line views
on layer 11. It has no all-geometry fallback. The adapter retains the original
MessageBus receiver and submits only that fixed topic. A normal publish return
proves submission, not subscriber handling, outline membership, camera movement
or rendering completion. It returns no camera bounds and grants no CAD/Save
authority. This is a native task equivalent to `zoomToBoardOutline`, not public
SDK execution or connected validation.

Point picking remains omitted for a concrete reason. The native RPC itself
filters point hits by display/partition state and drops hits without `toJSON`
before serialization. Fixing the public wrapper's additional type omissions
cannot recover those discarded identities or establish complete hit ordering.
The coverage inventory records this requirement separately from region
selection's mutation effects.

The public utility reader adds the beta
`lib_SelectControl.getSelectedLibraryRowInfo` subset. It returns only a
32-character lowercase hexadecimal asset UUID, one of the six reviewed library
types and the UI-reported fixed system-library UUID. It performs two matching
bounded observations with original method/UI owners retained. Missing,
malformed, changing and non-system-reported values refuse. The UI callback
combines independently retained row and library state; the result explicitly
does not prove asset ownership, row provenance, freshness or project binding.
It performs no asset lookup, selection or Save. The
[official method reference](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_selectcontrol.getselectedlibraryrowinfo.html)
describes the bottom-library selection and marks the API beta.

Three directory getters now have source-specific omission reasons. They use an
unhandled `app://api/client/config` route after their mode/permission checks and
can return fallback empty values. The separate HTTP configuration handler can
create directories and change shared state; it is not a qualified substitute.
The library/project getters also expect legacy keys absent from that handler's
current result. No public getter execution or directory mutation is claimed.

Fifteen unchanged diagnostic support programs now share four fixed compressed
tables. An independent decoder compared every program byte to main `27881f4`.
Each table and member retains exact lengths/hashes, the existing 64 KiB decoded
limit and 20-row ceiling, and initialization before its aliases. The change
adds no caller-selected program or command. It frees native helper space for
the separate age workflow without increasing the 1 MiB helper limit.

The original app-main registration capture now retains and qualifies the exact
`rl` parser alongside Date/now and preserves that identity through downstream
main request and collector joins. One additional metadata request changes the
combined main budget to 42 normal, 13 cleanup and 55 total commands. Known main
writer stages need at least 87 normal, 41 cleanup and 128 total; this remains an
incomplete writer reservation.

The separate `footprint-head-age` workflow prepares the original closed
checkpoint, complete SQL reader and unlocked default-branch head before native
allocation. Its distinct read-only birth retains the original app-main Date
constructor, ten native Date methods and the source-qualified `rl` parser.
One fixed native dispatch brackets two complete 1,681-offset control scans and
two actual parser calls with original Windows UTC/QPC/zone samples. Package and
owner reproof outside collection does not consume that ten-second bracket.
The native drain is bounded to 1,024 polls and 65,536 raw bytes. Its main budget
is 33 normal, four cleanup and 37 total commands, including the new parser read.

The original-only public summary describes the minimum observed age under the
vendor parser for that window. The parser subtracts the current timezone offset
from a timestamp parsed using its historical offset. A seasonal difference can
therefore shift its result from a canonical UTC interpretation of the SQL
literal. The result does not promise canonical creation age, continuous clock
stability, a future dispatch interval or writer authority. Copied packets and
historical records cannot recreate the original issued object.

Normal close, confirmed original-Job abort, separately observed root exit and
empty Job, helper release and exact record settlement remain separate consumed
stages. Independent review found that abort initially failed after a consumed
normal close, and could collide with a pending native request. Those defects
were corrected before publication. Focused regressions exercise the maintained
owner over real child pipes with explicitly synthetic factory/source issuers;
restoring the defective guards makes those regressions fail. They are not
Windows or connected EasyEDA validation.

## Validation and remaining work

The candidate version is `0.3.0+codex.20261031152137`. Local dependency installation,
complete dependency/signature audits and the vulnerability audit passed. The
sanitizer, facade/bridge types, strict type-aware facade/bridge lint, coverage,
all generated/native identity checks, build, reproducible bundles and unchanged
external compatibility pins passed. Repository, MCP and all seven skill checks,
including the installed skill-creator validators, passed. An initial lint
failure was a lowercase continuation comment; it was corrected without changing
any rule. No full local facade or bridge suite was run.

Focused checks passed for the native main/parser integration, real local V8
Date metadata and seasonal-offset controls, completed fixture SQL readers,
original-owner abort/serialization regressions, public lifecycle/registration,
visual/historical compatibility, selected-row metadata and fixed storage.
The independent whole-helper C#5 compilation and managed protocol/purpose smoke
passed. The helper is 1,035,893 bytes, SHA-256
`8000105e419de83379608aafeb2af43af5300954465132491f7dcf07107dbce6`,
12,683 bytes below the unchanged 1 MiB limit. Both independent identity
consumers match it.

The exhaustive inventory contains 835 methods: 216 public subsets, 44 native
task equivalents, 13 vendor-HTTP equivalents, 79 implemented but blocked and
483 omitted. New source routes have no recorded current-generation live
validation. Raw source spans, package comparisons, consumed-case responses and
local check logs remain private. Source/offline/native managed checks do not
establish connected behavior. Exact-head GitHub CI and CodeRabbit review remain
pending at this checkpoint.

Native footprint copy/delete still needs a genuine operation-owned age result,
a new writer birth with complete four-generation capacity, queued publication
completion, forward saved/reopened proof and native inverse-delete saved
absence. Shared operation-owned structure completion continues to block the
79 previously blocked methods; those routes are not enabled by this work.
Keep the unfinished implementation and live-validation backlog distinct.


## Full review and initial CI correction

PR [164](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/164)
opened at frozen payload `9bb52350d2febb1d5e51b9ce3ee84158efd0ffd5`.
The sole authored review command was exactly `@coderabbitai full review`,
comment `6545401287`. Its separate full invocation completed on that unchanged
head: tracker `6545551683`, check `124580973222`, review `5723639060`.
The initial automatic review `5723591410` was recorded separately and did not
satisfy that command. The full PR review selected 86 changed files and excluded
two generated dist files. It does not establish a review of every unchanged
repository file. Docstring coverage was separately 87.93 percent against an
80 percent threshold, covering 58 functions in 50 files. Its file-limit and
unsupported-file skips describe that check, not the PR review roster.

All review bodies, collapsed outside-diff/nitpick feedback and pagination were
read. Three reported comments covered two themes: stale coverage totals in a
preexisting test, and duplicated generated head-age request limits. The full
review expanded the latter to the transport and its managed smoke. There were
no inline threads or additional explicitly labeled legacy blocks. Both themes
were accepted. The coverage expectation now matches 216 public subsets,
44 native equivalents and 483 omissions. Generated consumers now use the
emitted MainNormal/MainCleanup/MainRequests constants. Values remain 33/4/37.

Initial Linux CI `41214964107` and Windows CI `41214964048` completed without
reruns or cancellations. Windows and verify-build passed. The facade result
was 13,933 passed, four failed and five expected skips, with no cancelled or
TODO tests. Bridge results were 424 passed across 28 files. The four failures
were the stale coverage assertion, two missing VM bindings for the new
controller, and a termination allowlist that had not admitted the exact new
head-age abort block. Their fixture corrections preserve production guards;
the allowlist still rejects termination elsewhere. The focused correction run
passed all 89 cases. Complete ZIP CRC/raw-log equality, all ten checkout-bearing
jobs and source/runtime/helper pins were verified. Synthetic merge `5fc07c92`
had the exact base/payload parents and matching root/plugin trees. This failed
run is retained as failure evidence, not release acceptance.

The corrected helper is 1,036,067 bytes, SHA-256
`e9bc47e9c73afd8340f4ffc43922e506eac609c66d7212e039d533945fb3b079`,
12,509 bytes below the unchanged 1 MiB cap. Independent comparison found only
the intended literal-to-constant substitutions in native source. Whole C#5
compilation, managed transport/head-age/packing smoke and actual TS/C# codec
parity passed. No native purpose, request value or effect guard was broadened.
The corrected commit still needs exact-head CI and the automatic review
follow-up before protected merge.


The correction's types, zero-warning strict lint, coverage, generated/native
checks, build, reproducible bundles and compatibility checks passed. Only the
allowed facade projections/review time changed; external pins stayed exact.
Repository/MCP/all-skill validation and all seven quick validators passed.
Dependency, lockfile and bridge inputs remained byte-identical to the initial
successful non-suite checks. No full local suite was duplicated.
