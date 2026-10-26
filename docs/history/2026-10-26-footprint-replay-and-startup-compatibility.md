# Footprint replay and startup compatibility, 2026-10-26

This batch continues [the PCB-opening and copy-v2 work](2026-10-26-pcb-opening-and-footprint-copy-batch.md).
The admitted installed payload was `0.3.0+codex.20261026145538`, from main
`e2927e88784993f64c8bd6de85f3d4e994f64c1a`. Its final automatic Linux CI
`40351551698` passed. The initial audit overlapped upstream startup and refused
a changing lease; a fresh read-only audit passed with unchanged checks.

The actual facade, original lease, pinned Node, supervisor and captured module
graph were independently verified. All 2,059 installed files and modes matched
the committed payload. The source projection contained 754 files; the captured
upstream graph contained 737 modules and 2,059 edges. Full raw status was retained,
with no incomplete design operations and a disconnected bridge. These facts
admit the native diagnostic owner, not an authenticated bridge design session.
Admission review SHA-256:
`f57146634fe9a30bade7cb6e65e3ad8bc17c68842f08e290f1106a5e6045e15c`.

## Two terminal disposable cases

Both cases used the registered disposable validation project. The production
project was not read, opened or edited. Neither case dispatched a design edit,
explicit Save, restore, force termination or prompt choice.

The ratline-continuation case completed project opening and all nine project
constructor captures. It then qualified and resumed all 29 PCB source stages,
captured the first child creation and reached that child's preload. This advances
beyond the prior native-opening timeout. It stopped at `preload-copy-1` with a
`SCHEMA` failure. No successful PCB opening or complete continuation result was
published. The actual rejected script event was not retained by that payload;
later stream-loss and cleanup observations do not establish its exact shape.

The separate default-startup case also completed project capture. Its assignment
observation stopped at `debounce-function-metadata` after nine retained replies
plus the original identity check. The new diagnostic captured the complete
1,000-byte rejected reply, SHA-256
`08ed363ebef1a0265e2a5207f06320d9745be3e4e58494c82345629b2f02915b`.
It contains exactly `length`, `name` and `prototype`, with the expected original
function location and scope-list reference. Footprint state and source were
never dispatched. The consumed assignment was not retried.

Each original owner completed normal close, observed original root exit and an
empty Job, then released its helper. Both before/after project copies were
byte-identical, with no SQLite sidecars. Complete SQL comparison preserved the
schema, all 35 tables, 158 rows and every rowid/cell. The original managed VACUUM
checkpoints differ only in the expected SQLite `schema_version` increment;
their logical digests are not falsely reported equal. No publication settlement
remains. Independent terminal review SHA-256:
`4acbb4b0d0387924843e7e59284985677fb60ff4e5191896dd98ca536c49719f`.

## Corrections and implementation

The current209 assignment decoder must use the embedded engine's descriptor contract.
The pinned V8 14.6 build defaults `v8_function_arguments_caller_are_own_props`
to false. Its factory omits those own descriptors and installs inherited legacy
accessors. This explains the actual three-property reply without inventing a
strict-mode exception. An offline comparison of the same QA source under Node24
and Node26 reproduced five and three own properties respectively. That comparison
is diagnostic evidence; repository checks remain pinned to Node24.18.0.
The209 decoder requires its exact three-property shape, while the older decoder
keeps five and both retain source, location, prototype and scope/relation checks.
Primary sources: [V8 build defaults](https://chromium.googlesource.com/v8/v8/+/refs/tags/14.6.202.33/BUILD.gn),
[function maps](https://chromium.googlesource.com/v8/v8/+/refs/tags/14.6.202.33/src/heap/factory.cc),
[prototype accessors](https://chromium.googlesource.com/v8/v8/+/refs/tags/14.6.202.33/src/init/bootstrapper.cc).

A separate isolated Chromium156 fixture reproduced an extra `stackTrace.parentId`
on all four generated helpers from the exact pinned preload. Each matched the
original child bootstrap's async-stack identity. This is surrogate evidence,
not proof of the missing actual Chromium146 event. The ratline-only correction
admits that sole field only when both IDs match the retained original pause.
The shared creator, source and ordered caller checks remain unchanged. The first
rejected child event is now retained immutably within 32 KiB, and diagnostics
identify the parsing stage. The initial fixture readiness failure was preserved;
the corrected isolated fixture and its own browser closed normally.

Footprint copy-v2 now has an unmounted saved-source projection. It preserves
numeric IDs before META, ordinary records, tombstones, raw bodies and native
ordering. It requires the original successful complete-SQL relation and models
both fresh-history and chunk-cache actor encodings. Pre-dispatch preparation
reserves both complete getter byte limits and positive document-clock bounds.
A source capture bug that imposed a 16 KiB clock-packet limit on a 2 MiB source
contract is corrected. Wrapper and scalar proxies are rejected before reflection
or schema error formatting can trigger traps. The original v1 models and shared
clock limits are unchanged.

Linux CI dependency setup now has bounded download retries and HTTP/HTTPS
timeouts, fails an incomplete index refresh, and separates package setup from
the pinned Bubblewrap build. Both steps have five-minute caps. Required packages,
test selection, isolation, source pins and job budgets remain unchanged.

## Validation and remaining work

The frozen package version is `0.3.0+codex.20261026164500`. Node24.18.0,
npm11.16.0 and zero core limits passed. Dependency installation, the complete
dependency tree, signature/security audits and sanitizer reproduction passed.
Final facade/bridge types, strict type-aware lint, generated API coverage,
protocol checks, reproducible bundles and repository/MCP/all-skill validators
passed. Whole-tree lint initially caught two comment-capitalization errors;
only those comments changed before the clean rerun. That failure is retained.

Focused source, inspector, SQL and hostile-input regressions passed. Independent
review accepted the footprint, engine-descriptor and ratline changes. The
retained actual QA reply now passes the209 decoder offline and still fails the
older profile. This is not a connected continuation result. The pinned Node24
fixture explicitly projects the exact QA descriptors; it does not claim that
Node24 itself has the embedded engine's three-property shape.

The final source projection has755 files, SHA-256
`c55ba40803c4ab9e8bf19ac6da61eed0f76f9bbb39f6b9109bee5088474df712`.
The three-file runtime projection is
`a1be8f53a11154fc17c1d6963fb65e44b0c2927e530878b4ddda79b3b2d0a2dd`.
Only those facade projections and review time changed in compatibility metadata;
external app, upstream, bridge and dispatcher pins remain unchanged. Exact-commit
CI and publication/install results follow in a dated append. Complete facade
and bridge suites run in CI, without a duplicate full local campaign.

The next loaded version needs fresh original-owner validation of the corrected
assignment and ratline paths. If assignments pass, use the same owner's remaining
budget for footprint state and source. Those reads still need live validation.

Footprint writing still needs native observation/actor/clock provenance, an owned
one-shot dispatch, producer/destination and completion or generation-closure
proof, upload replay exclusion, exact closed SQL, fresh saved-source readback and
final closure. The new pure projection completes an implementation prerequisite;
it does not enable copying. Deletion additionally needs dependency/cascade and
inverse models. PCB work still needs independent Worker/CDP identity, callback
and copper completion, complete baseline and saved/reopened evidence. Schematic
connectivity, other library writers and manufacturing exports remain backlog.
Direct GET_STR/parser replay, missing-cache fallback and the absent public SDK
source handler remain concrete omissions.

## Publication and installation result

PR134 merged tested head `a21a5ef3dddfd5b2c45d147c4d583ab1455c6f3d` through
the protected workflow as main `0c963c287774853e625a7f5ee32a3a49e32a2ed2`.
Its sole parent is the reviewed base `e2927e88784993f64c8bd6de85f3d4e994f64c1a`;
the merged tree equals tested tree `2bc42908522b128ce73f4ea083f99b2c74eca1c0`.

Linux CI40359893222 and Windows CI40359893709 passed all11 required jobs on
the first attempt. The facade had13,136 tests:13,131 passes, five exact expected
platform skips, and zero failures/cancellations. All424 bridge tests and all12
added or renamed top-level regressions passed. The CI artifact matched all2,062
committed plugin files and their644/755 modes. New dependency setup completed
across all9 Linux jobs: apt10–110 seconds and Bubblewrap1–4 seconds, within the
five-minute step limits. This is one CI result, not a broader performance claim.
Independent final review SHA-256:
`66526dbcad843ed7233274900d0313fa0ceb60b4e9c4a5c8fc2f1a4eb775fe4c`.
Root acceptance SHA-256:
`84dc7fa879e77e32e77f47bfbbdd06656684d74830f7b1be91fc2606ee908564`.

One official Git marketplace upgrade installed and enabled
`0.3.0+codex.20261026164500` from
`https://github.com/jan-guenter/easyeda-pro-agent-plugin.git` at merged main.
Both maintained comparisons verified all2,062 files,42 directories and43,987,378
bytes against committed contents and modes. Installed inventory SHA-256:
`bcb7abd7f58e6bb6a4c7d3c639805787e2dddcea9272b1e0e7170b693171e924`.
The synthetic offline probe passed27 queries/29 JSON-RPC requests and closed
its own child normally. Installation receipt SHA-256:
`011d5c3409ec1800bd599b77b2eb8950021301f40450505f88bf73779a62e057`.
These results establish installation, not fresh host admission or connected
writer validation. No installed cache was patched or host-owned process replaced.

Main's automatic Windows CI40362267463 passed; Linux CI40362269980 was still
running at this handoff. Exact tested-tree PR CI already qualified publication.
Check that automatic run on continuation without starting a duplicate campaign.

The next batch should validate assignments, footprint state and footprint source
under one original owner, then batch the writer's preparation, producer/clock
binding, one-shot create, closed SQL and fresh saved-read verification. Native
create's internal GET_STR effects still need qualification. Copied destinations
need a saved-specific reader because their omitted-user/equal-clock headers do
not satisfy the generic source-plan profile. Do not loosen that shared reader.

This append-only result is retained locally for the next substantive batch,
avoiding another plugin version solely for publication metadata. Earlier failures
and limits remain intact. Production designs remain excluded.

## Continuation result

Automatic main CI40362269980 subsequently passed for
`0c963c287774853e625a7f5ee32a3a49e32a2ed2`. No duplicate run was requested.
Fresh runtime admission and the next combined implementation batch are recorded
in [footprint owned-lifecycle prerequisites](2026-10-26-footprint-owned-lifecycle.md).
