# Security policy

## Reporting

Please report a vulnerability through [GitHub private vulnerability reporting](https://github.com/jan-guenter/easyeda-pro-agent-plugin/security/advisories/new). Do not include a real EasyEDA project, credential, operation journal, or proprietary design in a public issue.

## Safety-sensitive findings

Treat these as security or data-integrity issues:

- a path that bypasses runtime, context, capability, or compatibility gates;
- a way to replace a reviewed executable, module graph, control-root directory,
  token, private bridge generation, checkpoint, journal, or evidence file after
  it has been admitted;
- a write that is not journaled before dispatch;
- any live bridge call allowed while an orphan-risk or unreadable journal exists;
- a timeout/disconnect that can be retried without a one-use restart boundary;
- the long-lived bridge HMAC key, or any pre-admission credential, entering
  argv, the base child environment, logs, protocol output, repository files, or
  a group/other-readable runtime path;
- the ephemeral backend-session token entering argv or the base execution
  environment, crossing before supervisor readiness and sandbox admission, or
  becoming visible outside the admitted child;
- an unexpected descriptor, filesystem mount, subprocess, worker, native addon,
  or network path becoming reachable in the supervised upstream runtime;
- evidence that accepts malformed, coerced, partial, contradictory, replaced, or changing files;
- a mutation that can save without exact live, collateral, reopened, and durable-database proof;
- unrestricted bridge execution becoming reachable;
- secrets or user design data entering logs, artifacts, tests, or the repository.

The production component writer is disabled. Do not validate it on a real project.

## Runtime isolation

The Linux x86_64 facade admits Node exactly `24.18.0`, the exact reviewed Node executable,
Bubblewrap 0.11.2 executable, upstream entrypoint, dependency lock, and
statically reachable module graph. It rejects symlinks, group/other-writable or
setuid/setgid executable paths, identity drift, unsupported module formats,
native addons, and unreviewed module resolution. Runtime admission does not
invoke an external xattr utility.
The reviewed local Bubblewrap binary and the exact source-built CI binary were
separately validated to have an empty Linux file-capability set. Setting file
capabilities requires root or `CAP_SETFCAP`, outside the same-user threat model.
The upstream runs in a Bubblewrap namespace with a minimal descriptor-mounted
runtime, an owner-only data directory, Node's permission boundary, no child
processes, workers, addons, WASI, host `/proc`, host `/etc`, or source checkout
mounts. Bubblewrap's JSON status is bound to the live monitor PID/start identity;
the reported child must have that monitor as parent, the exact host/namespace
PID mapping, and the reported cgroup, IPC, mount, PID, and UTS namespace
identities. These proofs run before the startup block is released, after child
readiness, and immediately before bootstrap. Treat a different Bubblewrap build
as a compatibility change; do not substitute the distribution package or a
setuid binary silently.

Readiness is emitted only after the child checks its own mounted supervisor,
exact environment and data-directory identity, Node permission and code-
generation boundaries, local descriptor baseline, a kernel-denied decoy
`connect(2)`, and JavaScript network restrictions. Before bootstrap, the facade
re-proves every retained graph, supervisor, Node, Bubblewrap, seccomp, data-root,
environment, and source-path seal; checks the exact Node 24.18.0 descriptor
topology and an inherited soft `RLIMIT_CORE` of zero; and closes the inherited
payload descriptors. Seccomp returns `EPERM` for outbound `connect`, `sendto`,
`sendmsg`, `sendmmsg`, and `io_uring_setup`. The JavaScript boundary separately
blocks high- and low-level client/datagram authority and permits the child to
listen only on the exact facade-assigned private backend loopback port. That
per-start backend listener is distinct from the extension-facing authenticated
gateway at `127.0.0.1:49621`.

The long-lived HMAC key stays in the facade and the private EasyEDA extension.
Only a fresh backend-session token crosses into the supervised child, framed on
stdin after readiness and all process, namespace, executable, descriptor, limit,
and retained-input proofs. The child then assigns this ephemeral token to
`process.env.BRIDGE_TOKEN` solely for upstream compatibility; it is never in
argv or the base execution environment. The gateway does not forward that token
in the private bridge handshake until the loopback connection is proven to
belong to that exact process. The generated `.eext`, long-lived token, and any
unreferenced older private generation are credentials even though the build
receipt itself is non-secret.

Authenticated bridge archive/receipt publication uses an owner-only hard-link
lock in the private build directory. The versioned record binds boot,
PID-namespace, PID/start-time, and nonce identity. Stale or unverifiable fixed
locks are never removed automatically: lstat-then-unlink is not a safe
compare-and-swap and could delete a replacement lock. Ephemeral lock candidates
also remain exclusively owned by their creating contenders; recovery scans do
not delete them. Builder and offline-doctor outputs report exact candidate names
as a read-only observation, not proof that they are stale. Manual recovery is
permitted only after every builder in every relevant PID namespace is stopped,
the owner-only mode-`0700` parent device/inode is re-proven, and each exact
non-symlink mode-`0600` child identity/link count is rechecked. Never use a
glob. For a two-link fixed lock, unlink its exact nonce-derived same-inode
candidate first, recheck the fixed name is still the reported inode with one
link, and only then unlink the fixed lock. Any mismatch remains fail-closed.

The fixed receipt currently selects bridge build `ded07x99dcxb504`. It is an
unconnected `validation-required` candidate, not a production-live build. The
reviewed manifest keeps the historical connected dispatcher build
`d18b6xd531xe6ca` until a real import, authenticated status capture, and
connected review justify changing it. Status may collect the candidate's live
fingerprint, and narrowly reviewed public generic reads may proceed after a
bounded smoke test against it. Exact readers and private-operation paths remain
fail-closed while those build IDs differ.
