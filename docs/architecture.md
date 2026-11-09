# Architecture

```text
Codex skill
    │
    ▼
easyeda-pro-control safety facade ───► durable journals, evidence, checkpoints
    │                         │
    │                         └── HMAC gateway ◄──► private EasyEDA extension ◄──► EasyEDA Pro
    ▼
native descriptor sanitizer
    │
    ▼
Bubblewrap + Node permission boundary
    │
    ▼
descriptor-mounted reviewed easyeda-mcp-pro module graph
```

The facade is the sole bridge owner. It does not execute the mutable upstream
checkout directly: it captures and hashes the statically reachable module
graph, mounts that graph and the reviewed supervisor from retained descriptors,
and starts the pinned upstream in a minimal sandbox. Do not run a second
EasyEDA MCP process against the same bridge.

Persisted results use versioned, closed schemas. A release that changes a result's
fields or fixed explanatory text emits a new version. Historical readers retain
the exact previously released projections and their original operation limits.
They validate records without rewriting them or recreating a native owner.
This keeps a valid, completed older operation from blocking unrelated new work
when the current result format changes.

For authorized EasyEDA work when the host does not expose MCP tools,
`scripts/control-session.ts` provides a persistent foreground client for the
same facade. Run this developer CLI from a trusted checkout after `npm ci`
with the pinned toolchain; it is not a dependency-free installed runtime.
`--plugin-root` may select a Git-installed plugin. It uses that plugin's `.mcp.json`, checks its reviewed
bundle, and retains the normal single-owner lease. Use a normal pipe or a
noncanonical PTY so terminal input does not truncate fingerprint requests. See
the skill's [connection reference](../plugins/easyeda-pro-control/skills/easyeda-pro-control/references/connection-and-context.md#foreground-mcp-session)
for terminal setup and the JSON-line protocol. `easyeda_control_native_ui` wraps
the packaged native Windows helpers, bound to the installed executable digest,
process generation and current owned window. It works on Start Page and native
dialogs without an authenticated bridge. Native edits still require independent
saved-and-reopened verification and do not grant retained Job authority.

The native Linux x86_64 sanitizer closes the descriptor-inheritance gap between
Node and Bubblewrap. The facade gives it the expected facade PID and exactly
this descriptor layout: MCP stdin/stdout/stderr on `0`–`2`, the data directory
on `3`, module graph on `4`, supervisor on `5`, Bubblewrap status pipe on `6`,
reviewed Node executable on `7`, startup block pipe on `8`, seccomp program on
`9`, and the already hash-admitted Bubblewrap executable on `10`. The sanitizer
requires every descriptor `0`–`10` to be present without `FD_CLOEXEC`, binds its
lifetime to the unchanged expected parent with `PR_SET_PDEATHSIG(SIGKILL)`, and
requires descriptor `10` to be a regular mode-`0755` file with no
`security.capability` xattr. It then marks `10` close-on-exec, atomically closes
all descriptors `11` and above with `close_range(2)`, and enters Bubblewrap from
descriptor `10` with `execveat(2)`. Bubblewrap receives only descriptors `0`–`9`;
an arbitrary descriptor inherited by the facade's shell cannot reach it.

## Fixed native compiler input

Native builds start from the exact published first-party shared helper retained
under `scripts/native-baseline/`. `native-baseline-source.ts` fixes its originating
commit, full length and hash. It is a build input, never a runtime path or an
application snapshot. Forward and cold-forward generators use that same seed
and must reproduce all six released artifacts exactly.

The shared helper's runtime size/hash literals live in
`current-pcb-diagnostic-helper-identity.ts`. The independent Windows synthetic
launch script repeats them. The static checker reads the small identity module
and actual helper, so growing process-owner source does not require enlarging
its ordinary source-read limit. TypeScript imports these literals into the
owner; no runtime request can update them.
The explicit `startup:protocol:update` build command emits both pin copies
with the helper and readable C# file. Its check mode compares every output
without writing. `native:helper:check` remains a separate read-only byte check.

The default startup generator emits the shared legacy/PCB/footprint build.
`schematic:native:update` emits a separate `schematic-edit-native.ps1` and readable
C# review copy for the seven-record display and wire purposes. Its PowerShell
entry accepts exactly one of those two purposes. The runtime chooses the fixed
artifact from its already qualified purpose, checks its generated identity, and
retains the Windows read handle through execution. No request chooses a build
layout, source fragment, helper path or compiler option. Run both
`startup:protocol:check` and `schematic:native:check` after changing native
protocols. Windows CI compiles both schematic purposes without launching an app.

`inverse:native:update` emits the separate `footprint-inverse-native.ps1`, C#
review copy and exact identity for the original Footprint inverse purpose. Its
factory binds the readiness challenge before selecting the retained helper.
The general diagnostic layout includes the complete spatial and Component
codebooks. Run `inverse:native:check` with the other helper generation checks.
Both layouts retain the existing source/compiler bounds; runtime callers cannot
select a layout or supply a helper path.

The inverse four-query result retains its actual final frame and reproof wrapper.
Its active hold is consumed once before the first original continuation. The
following empty-check and DEL-entry ledger transfers the same UI event reader,
checks the original caller chain and keeps the DEL RPC body paused. A held entry
packet cannot stand in for a native send, worker success, dropped-Promise
completion, collateral restoration or saved absence. Those boundaries need
separate original observations and private owner joins.

Before that DEL RPC can continue, its own readonly collateral preparation checks
the original row, project, source callees and complete bounded UI tab census.
The supported profile requires the actual `uuid@project` tab to be absent. It
qualifies the original tab method and native `some`/`includes`, binds both class
and module scopes, and retains a fresh reproof. A present tab refuses before
dispatch. The preparation proves neither the original `yy` early return nor the
dropped log Promise settlement; both still require their original execution
receipts. It cannot grant preference removal, restoration or tab closure.

The combined diagnostic helper stores its fixed C# compiler body as gzip/base64
in the final PowerShell output. The stored helper and actual runtime compiler
input each retain the 2 MiB ceiling. Storage introduces no native purpose,
control phase, request allowance, debugger program or application permission.

Historical v1 storage restores and compiles the original ASCII body, including
all line breaks, within its original 2 MiB bound. Its decoder and public
restoration contracts remain unchanged. V2 is a separate format: it replaces
only outside-literal comment/whitespace sequences with one separator space.
It retains a canonical, independently bounded 128 KiB spacing sidecar, original
and compact byte hashes, and an ordered token/literal hash. The original
build-only review body may be at most 2 MiB plus 128 KiB, and no larger than the
compact body plus the spacing allowance. Runtime never restores or compiles
that larger view. Unsupported preprocessing, newer lexical forms, non-ASCII
source, escaped identifiers and line-sensitive caller attributes refuse.
String, verbatim-string and character literal bytes remain exact.

V3 is an explicit inverse-build option. It removes a trivia separator only when
relexing the adjacent tokens preserves both exact token kinds and bytes; its
separate versioned decoder retains the same compiler, helper and spacing limits.
V1 and V2 compaction and restoration keep their historical contracts.

The inverse layout also shares immutable smoke hash vectors in bounded fixed
tables. Every call retains its original vector and order through the existing
`Hashes` decoder. The build projection restores the exact original expressions
before maintained marker readers run; other layouts do not use this projection.
The shared table and token-fusion formats do not add a runtime selector or grant.

Builds use pinned Node 24.18.0 with core dumps disabled.
`expandCurrentPcbDiagnosticCSharpReviewSource` restores exact original bytes
and markers before generators and released forward/cold migration. Their six
released artifacts remain byte-identical. `currentPcbDiagnosticCSharpReviewSource`
returns that original body for the readable generated
`scripts/pcb-diagnostic-native.cs`; startup `--write`/`--check` compare those
original review bytes. `currentPcbDiagnosticCSharpRuntimeCompilerInput` returns
only the actual compiler bytes, compact for v2. Compiler harnesses must use
that API and keep any original review copy outside their compilation roster.
Runtime never loads the readable review copy.

The unchanged emitted decoder takes metadata only from embedded fixed literals.
It checks canonical base64, compressed length/hash, the gzip envelope, bounded
stream length/end, decoded length/hash and strict ASCII/UTF-8 before `Add-Type`.
For v2 those checks apply to the compact body. Build-only spacing data is a
comment covered by the admitted complete helper identity; review restoration
checks both sidecar identities, canonical records, exact original hash and
token/literal equality. Canonical pinned gzip checks refuse extra members and
ignored tails. No control request supplies source, hashes, lengths or options.
The synthetic launch/CompileOnly reader uses the same bounded decoder for the
actual compiler body before its original in-memory test hooks.

## Runtime isolation

Live context, read, capture, export, checkpoint, mutation, and recovery calls are bound to one exact authenticated renderer session through final evidence publication. A reconnect cannot substitute a new renderer with matching logical IDs. Status alone retains a disconnected read-only bootstrap mode so it can report why no authenticated session exists.

The external upstream runs from a descriptor-captured, hash-bound module graph
inside a minimal Bubblewrap mount/PID namespace. Before releasing Bubblewrap's
startup block, the facade binds the reported sandbox PID to the live Bubblewrap
monitor, process start times, `NSpid` mapping, and cgroup/IPC/mount/PID/UTS
namespace identities. The child emits readiness only after checking its mounted
supervisor, exact environment and data directory, Node permission/code-
generation policy, local descriptor baseline, kernel `connect(2)` denial, and
JavaScript network restrictions. The facade then re-proves process topology,
the exhaustive Node 24.18.0 descriptor boundary, zero soft core limit, and every
retained input seal before closing its inherited payload descriptors and
delivering the ephemeral token.

The disposable ratline diagnostic has a separate Windows launch purpose. Its
native owner leases the exact application files and source dependency set
before process creation, while a single ledger accounts for discovery,
project capture, PCB source loading and the first child's held import. The
context router transfers the parent event stream once and rechecks native
frame ancestry before each continuation. Durable intent precedes navigation;
cleanup reserves remain available after normal work stops. See the
[ratline workflow](../plugins/easyeda-pro-control/skills/easyeda-pro-control/references/current-pcb209-ratline-held-import.md)
for the partial observation and remaining identity/completion limits.
The separate [fresh continuation workflow](../plugins/easyeda-pro-control/skills/easyeda-pro-control/references/current-pcb209-ratline-continuation.md)
seals worker observations before source-qualified retirement, revokes child
commands and checks publication/receipt and original target consistency.

Only the dedicated owner-only data directory is writable. The host source tree,
control-root credentials, host `/proc` and `/etc`, workers, child processes,
native addons, and WASI are unavailable. The seccomp filter rejects outbound
`connect`, datagram-send, message-send, and `io_uring_setup` syscalls; the
JavaScript boundary also blocks high- and low-level client/datagram APIs and
permits the child to listen only on the exact facade-assigned private backend
loopback port. That per-start backend port is distinct from the authenticated
extension-facing gateway at `127.0.0.1:49621`. Runtime staging uses unlinked
descriptor-only payloads rather than mutable snapshot paths.
