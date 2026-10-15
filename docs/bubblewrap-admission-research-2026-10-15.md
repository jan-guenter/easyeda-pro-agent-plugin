# Bubblewrap 0.13.1 admission research

Research date: 2026-10-15. This note compares upstream 0.11.2 with 0.13.1
against this plugin's existing sandbox launcher. The local read-only version
command reports `bubblewrap 0.13.1`. Signed-package provenance is verified below;
source compatibility and actual sandbox execution remain separate claims.

## Local package provenance

The host identifies itself as Arch Linux. Its package manager is Pacman, not
dpkg. `pacman -Qo /usr/sbin/bwrap` resolves the executable to `/usr/bin/bwrap`
and identifies `bubblewrap 0.13.1-1`. `/usr/sbin` points to `bin`; this is the
distribution's path alias, not a changed executable symlink. The final file is
regular, owned by root, mode 0755 and has no file capabilities. The read-only
package check reports 13 files and zero altered files. Pacman's detailed check
includes metadata checks; the independent signed-archive comparison below
establishes the executable's content identity.
[Pacman query semantics](https://man.archlinux.org/man/pacman.8.en#QUERY_OPTIONS_(APPLY_TO_-Q)).

The local package log records an upgrade from `0.11.2-1` to `0.13.1-1` at
2026-10-15 03:34:38 CEST. That explains the changed executable; it does not
identify who requested the upgrade. The package build was 2026-10-15
00:06:09 CEST, matching the official package's published build time. The local
database says the package was installed as a dependency and validated by
signature. [Official package record](https://archlinux.org/packages/extra/x86_64/bubblewrap/).

Read-only cryptographic verification:

| Object | Bytes | SHA-256 |
| --- | ---: | --- |
| Installed `/usr/bin/bwrap` | 84464 | `33516b9cd1fa6432307ad71f23765fa30604b0a8d769dac0d2ba054e85aeec83` |
| Cached `bubblewrap-0.13.1-1-x86_64.pkg.tar.zst` | 41315 | `f0efc4e02138b1b1f0719f37008da58b03213122d4881cfe949681fcbd72b36e` |
| Detached package signature | 119 | `094315fd4a7dd643b0ad2dd82de3df596cd82555e53a681eea57de4f2dd91ba0` |

`gpgv --keyring /etc/pacman.d/gnupg/pubring.gpg` verified that exact cached
archive with signing key `83BC8889351B5DEBBB68416EB8AC08600F108CDF`.
Arch's developer directory assigns that fingerprint to package maintainer
Jan Alexander Steffens. Streaming `usr/bin/bwrap` from the signed archive
produced exactly the installed executable SHA-256 above. No extraction over
installed files occurred. The installed keyring package is
`archlinux-keyring 20260909-1`.
[Official signer fingerprint](https://archlinux.org/people/developers/#heftig).

The first `gpgv` attempt used the distributed ASCII-armored
`/usr/share/pacman/keyrings/archlinux.gpg` as a binary keyring and failed to parse
it. The successful check used Pacman's existing binary public keyring instead;
no keyring was edited or key imported.

The signed archive's `.BUILDINFO` records PKGBUILD SHA-256
`7300de351bff3a60b56841d45acc4da471ae11c8c513fc9cb6131e6e0f9f921b`.
The official tagged PKGBUILD fetched independently is 1291 bytes with exactly that
hash. It selects signed upstream tag `v0.13.1`, sets
`assume_kernel=6.18.0` and `selinux=disabled`, and allows upstream test failures
with `meson test ... || :`. Package authenticity therefore does not imply that
its upstream tests passed. The current host kernel is
`6.18.35.2-microsoft-standard-WSL2-vdo+`, satisfying the stated version
assumption but not proving syscall permission or sandbox effects.
[Exact Arch build recipe](https://gitlab.archlinux.org/archlinux/packaging/packages/bubblewrap/-/raw/0.13.1-1/PKGBUILD).

The plugin's reviewed 0.11.2 executable SHA-256 was
`6ad2138a73d592acb43525432965e3c66f6fad8a2f3d610c6ca0b6855e993cbe`.
The configured Node executable, upstream entrypoint, dependency lock and
descriptor sanitizer still match their reviewed hashes. The old admission
message named only command, entrypoint and lock, but its condition also checked
Bubblewrap. The sandbox executable alone caused this particular refusal.
Local source: `plugins/easyeda-pro-control/server/src/upstream-trust.ts`,
`captureLauncherAdmission`.

## Upstream findings

The reviewed CI revision is `1b80120ef26a28e065e67f89bfef873f13bdd317`,
upstream 0.11.2. Upstream 0.13.1 is
`362936aea0d5c6e70f7af75d2d44b5a914cb4ba2`, released on 2026-10-14.
The intervening releases are 0.12.0 and 0.13.0.
Sources: [0.11.2 release](https://github.com/containers/bubblewrap/releases/tag/v0.11.2),
[0.13.1 release](https://github.com/containers/bubblewrap/releases/tag/v0.13.1),
[upstream comparison](https://github.com/containers/bubblewrap/compare/v0.11.2...v0.13.1).

0.12.0 fixes **CVE-2026-87766**, a sandbox-setup path traversal issue affecting
versions before 0.12.0. A launcher creating files beneath attacker-controlled
content could follow a parent symlink outside the intended root. The advisory
distinguishes setup-time escape from a sandboxed program escaping at runtime.
The fix uses `openat2` with `RESOLVE_IN_ROOT`, with an older-kernel fallback.
This establishes a reason to review the upgrade; it does not establish that this
plugin's fixed mount sequence was exploitable.
Source: [upstream advisory](https://github.com/containers/bubblewrap/security/advisories/GHSA-pxhw-h44j-8pfx).

The setup rewrite also rejects a symlink as the final mount destination and
uses descriptor-relative operations. These are compatibility changes for callers
that relied on following destination symlinks. The plugin creates `/runtime`,
`/data`, `/tmp` and `/dev/null` destinations itself; its `/lib` and `/lib64`
symlinks are not later used as mount destinations. Source inspection found no
dependency on the rejected behavior.
Source: [setup rewrite](https://github.com/containers/bubblewrap/commit/c77dd38ebe75b4eabec3c9349d7099287886eeec).

Other relevant changes:

- 0.12.0 removes setuid support. The plugin already requires a mode-0755
  executable without file capabilities, so it must not regain setuid behavior
  as an upgrade workaround.
  Source: [setuid removal](https://github.com/containers/bubblewrap/commit/a75359de61a8ae84bc9de13dab3167dd6b776e46).
- `--not-a-security-boundary` permits selected sandbox-setup failures. It is
  opt-in. The plugin does not pass it and must keep it excluded.
  Source: [fail-open option](https://github.com/containers/bubblewrap/commit/2f55bae38468d0c50cf5df87b1e481e882b63acb).
- 0.13.0 uses `mount_setattr` to apply read-only, nodev and nosuid properties
  recursively on supporting kernels. This avoids the older per-mount
  inspection/remount race. The current implementation falls back when the
  syscall is unavailable, not when another error prevents the requested
  protection. A build can omit the fallback through its assumed-kernel setting.
  Sources: [recursive mount attributes](https://github.com/containers/bubblewrap/commit/b7cdf7a0e6d70106de56f34d82d9e35856c0cf27),
  [current error handling](https://github.com/containers/bubblewrap/blob/v0.13.1/bind-mount.c#L675-L735).
- Empty path arguments now fail parsing. The fixed plugin paths are nonempty.
  Source: [empty-path rejection](https://github.com/containers/bubblewrap/commit/b6c225df3e2c2fb17d085b4759aa81437e9f9d26).
- 0.13.1 opens temporary parent directories with `O_PATH`, avoiding a needless
  read-permission requirement, and marks those descriptors `O_CLOEXEC`.
  Sources: [O_PATH change](https://github.com/containers/bubblewrap/commit/c336e929f2a84d071eaa37c386f8d3fbb19b013d),
  [O_CLOEXEC change](https://github.com/containers/bubblewrap/commit/0f8073dd9b547e15e8ec9451371f9729830b083d).

## Inherited descriptors, execution and parent death

Direct comparison of the two tagged `bubblewrap.c` files found identical
`handle_die_with_parent`, `close_extra_fds` and `close_ops_fd` function bodies.
The parent-death operation remains `PR_SET_PDEATHSIG` with `SIGKILL`.
The final program launch remains `execvp`, following seccomp installation.
Neither tagged file implements `close_range` or `execveat`. These calls belong
to this plugin's sanitizer, not to an upstream guarantee.
Sources: [0.11.2 implementation](https://github.com/containers/bubblewrap/blob/v0.11.2/bubblewrap.c),
[0.13.1 implementation](https://github.com/containers/bubblewrap/blob/v0.13.1/bubblewrap.c).

`fdwalk` now uses a global `proc_fd` instead of receiving it as an argument;
its enumeration body is unchanged. It closes extra descriptors in the monitor
or optional init process. It is not a blanket inherited-descriptor filter for
the sandboxed executable.
Sources: [0.11.2 fdwalk](https://github.com/containers/bubblewrap/blob/v0.11.2/utils.c#L371-L424),
[0.13.1 fdwalk](https://github.com/containers/bubblewrap/blob/v0.13.1/utils.c#L399-L453).

0.13.1 retains all supplied `--sync-fd` descriptors rather than only the last
one. Its `--as-pid-1` path continues to leave those descriptors in the executed
process. The plugin supplies no `--sync-fd`, so this change does not enlarge
its deliberate descriptor set.
Source: [multiple sync descriptors](https://github.com/containers/bubblewrap/commit/7b246debe29e68ec563c1fa1d05b77ee51001906).

The plugin's unchanged native contract is therefore still necessary:

- Descriptors 0 through 9 carry the explicit launch inputs.
- Descriptor 10 admits the reviewed Bubblewrap executable and becomes
  close-on-exec.
- The sanitizer closes every descriptor from 11 upward with `close_range`.
- The sanitizer sets its parent-death signal, rechecks the expected parent,
  and enters the admitted executable through `execveat`.

Local source: `plugins/easyeda-pro-control/server/native/easyeda-fd-sanitizer.S`.
Upstream review does not justify deleting or relaxing any of these checks.

## Fixed option compatibility

The option contract remains suitable for the current fixed argument builder.
This is source-level compatibility, not a successful launch claim.
Source: [0.13.1 manual](https://github.com/containers/bubblewrap/blob/v0.13.1/bwrap.xml).

| Plugin options | Relevant contract |
| --- | --- |
| `--unshare-all`, explicit `--unshare-user`, `--unshare-pid` | Explicit user namespace selection remains required by `--disable-userns`. Keep it. |
| `--share-net` | Retains the network namespace. The upgrade adds no network isolation. |
| `--as-pid-1`, `--die-with-parent`, `--new-session` | Keep the existing single-child lifecycle and terminal-session separation. |
| `--cap-drop ALL`, `--disable-userns` | Retain capability removal and refusal of further user namespaces. |
| `--clearenv`, fixed `--setenv` values | Keep the explicit environment. `PWD` is still established by Bubblewrap. |
| `--bind-fd`, `--ro-bind-fd`, `--ro-bind-data`, `--perms` | Retain descriptor-bound inputs and the fixed read-only files. Review the changed mount implementation through execution tests. |
| `--json-status-fd`, `--block-fd`, `--seccomp` | Still supported. Preserve existing descriptor numbers, startup handshake and filter. |

Local argument definition:
`plugins/easyeda-pro-control/server/src/sandboxed-stdio-client-transport.ts`,
`bubblewrapArguments`.

## Build assumptions and CI

Upstream 0.13.1 retains the current CI options `tests=false`, `man=disabled`,
`bash_completion=disabled` and `zsh_completion=disabled`. Remove the obsolete
`support_setuid=false` option when changing the source revision. The `selinux`
feature remains configurable. `assume_kernel` defaults to an empty string,
which retains kernel compatibility fallbacks.
Source: [0.13.1 Meson options](https://github.com/containers/bubblewrap/blob/v0.13.1/meson_options.txt).

An `assume_kernel=6.18.0` build omits both the pre-5.6 `openat2` fallback and
the pre-5.12 `mount_setattr` fallback. It must not be treated as proof of the
plugin's stated Linux 5.9 minimum. A newer kernel version also does not prove
that host restrictions allow the needed syscalls. For CI intended to retain
that minimum, leave the assumed-kernel option unset or select a separately
reviewed compatible minimum. The exact Arch package build assumptions belong
in its local admission record.
Sources: [openat2 fallback condition](https://github.com/containers/bubblewrap/blob/v0.13.1/safe_openat.c#L32-L38),
[mount_setattr fallback condition](https://github.com/containers/bubblewrap/blob/v0.13.1/bind-mount.c#L27-L31).

## What this review establishes

No source-level incompatibility was found in the exact options, deliberate
descriptor mapping, non-setuid execution path or parent-death mechanism used by
the plugin. The mount implementation changed substantially and includes a
security fix. An automatic hash refresh would still be wrong.

Before a deliberate new admission, independently verify signed package
provenance, exact executable bytes/mode/capability state and build assumptions.
Then use the existing isolated launcher and hostile-descriptor tests against
the candidate binary. The focused proof should cover setup success, read-only
mounts, seccomp and handshake behavior, descriptor isolation and parent-death
cleanup. Do not connect EasyEDA or a production project to perform that check.

The source update accompanying this review changes both CI setup blocks to
the immutable 0.13.1 commit above, with an empty `assume_kernel` value and
`selinux=disabled`. It removes `support_setuid`, retains mode 0755/no-capability
checks, and updates exact-version/source contracts and both third-party notices
to LGPL-2.1-or-later. All 24 CI-contract tests, targeted type-aware lint,
actionlint and whitespace checks pass. This is workflow validation, not proof
that the updated GitHub build or an actual sandbox has run successfully.
Source: [removed build options](https://github.com/containers/bubblewrap/commit/a75359de61a8ae84bc9de13dab3167dd6b776e46).

Admission recommendation: deliberately qualify the exact signed 0.13.1 binary
and immutable upstream revision. Do not downgrade to 0.11.2 merely to satisfy an
old pin, and do not replace the hash without the focused execution checks
above. Preserve the sanitizer, descriptor mapping, strict mount failures,
quarantine and all unrelated external pins. This source review finds the
candidate suitable for those checks, not already execution-admitted.

Remaining unknowns are actual sandbox behavior under this WSL kernel and host
restrictions, focused descriptor/parent-death regression results for 0.13.1,
and CI results for the changed build recipe. No package installation,
executable replacement, sandbox probe, native Windows call or EasyEDA action
was performed by this research. The repository note and assigned CI/notice
source files were changed; system files and compatibility pins were not.

## Subsequent implementation qualification

After the source review, the main implementation deliberately updated only
the sandbox version and executable hash among the external compatibility pins.
All 47 existing focused upstream, descriptor-sanitizer and supervisor tests
passed against the signed 0.13.1 binary on this WSL host. These include actual
sandbox startup, exact descriptor and PID-namespace admission, seccomp network
denial, synthetic authenticated bridge exchange and normal owned shutdown.
The hostile-descriptor and parent-death cases exercise the unchanged sanitizer
with a disposable child. They are not a new experiment killing the 0.13.1
Bubblewrap monitor. No live EasyEDA bridge was connected for these tests.

The actual startup test additionally passed a direct read-only mount check.
Its parent retains and verifies the exact synthetic child's process identity,
then attempts a nontruncating write-open only on that child's mounted runtime
graph through its proc root. The kernel returns EROFS. Mounted graph and host
fixture source bytes remain unchanged. This avoids Node's separate filesystem
permission layer masking a writable mount. Exact-payload GitHub results remain
separate and belong in the release record. This
qualification does not admit any EasyEDA writer or change its lifecycle gates.
