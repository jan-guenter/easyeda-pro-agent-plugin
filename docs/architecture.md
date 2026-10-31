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
