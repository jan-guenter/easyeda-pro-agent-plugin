# Windows-to-WSL bootstrap validation

Source base: `2f9652c763b41e9c4b2261d25b5766dfe013a3b8`. The source commit
containing this record adds the Windows transport and standalone provisioner;
generated bundles and release integration remain separate.

The Windows x64 machine launcher uses a strict data-only WSL profile and direct
system `wsl.exe` arguments. A fixed generated bootstrap verifies six matching
runtime files, canonical Linux paths and exact Unix modes before the existing
Linux machine launcher. Linux Node remains exactly24.18.0 and existing machine,
package and runtime admission stays authoritative. Provisioning never starts a
facade. Unknown profile data/accessors, extra programs and malformed selectors
are refused. Input EOF and termination handlers close only original child stdin;
they send no process signal and await the original WSL child's close.

## Isolated results

The minified production launcher module, built with the production identifier,
syntax, whitespace and name settings, ran on Windows Node24.10.0 through actual
`wsl.exe` and Linux Node24.18.0. Two disposable fixture roots contained identical
six-file payloads. The fake Linux entrypoint checked fixed argv and exact Node,
echoed131356 binary bytes (all256 byte values, NUL, Unicode and multiple pipe
buffers), then exited23 on EOF. Output matched exactly; stderr was empty. The
Windows harness retained its original child through close, the launcher awaited
its original WSL child, and an independent original Linux pidfd observed exit.
All fixture/watcher process close events were observed before returning.

Actual Windows provisioning used only a disposable Temp profile. Creation,
identical no-op, different-profile conflict, explicit recognized replacement and
unrecognized-file refusal passed. Failure stdout was empty and stderr contained
only fixed error JSON. A separate actual Windows provisioner case refused a
Linux sanitizer with mode0644, reported `windows-wsl-verification-failed` with
empty stdout, observed its original child close, and restored fixture mode0755.
No actual facade, bridge, lease/native owner, application,
Job, design or MCP connection was started by these fixtures.

Four focused Linux regressions passed under Node24.18.0/npm11.16.0 with soft core
limit0: strict/accessor selectors; actual byte/tamper verification; minified helper
closure and Unix mode refusal; and fixed argv/binary stdin/EOF exit handoff.
Both facade TypeScript projects and strict type-aware five-file lint passed with
zero warnings. Full generated-package, CI, install, refresh and live admission
are integration work, not claims of this source-only validation.

The initial private fixture setup failed at Windows path conversion, before
process launch. It created four new disposable files outside its intended Temp
root; exact-file cleanup removed them. No existing user file was changed. The
corrected harness validates its nonempty Temp-derived root before writing. Raw
failure and passing results remain in private evidence outside the repository.

## Limits

The Windows transport's SIGTERM/SIGINT handlers are source-reviewed stdin-close
paths; the retained actual interop case exercises EOF. No Windows OS signal,
actual native owner cleanup or Codex connection refresh was claimed. The initial
file observations are not continuous ownership proof. Atomic profile publication
and byte recheck do not prove ACL custody or exclude another local writer; use a
trusted private directory and one provisioner. A real Linux machine profile and
reviewed matching package must already exist. Publication, installation and
connected validation were not performed by this subtask.

## Full entry and deferred profile follow-up

The built complete server entry also ran on Windows Node24.10 in explicit
configuration mode. Its first verification correctly refused source build
files with private0600 modes. A six-runtime-file fixture materialized the same
public bytes at package0644/0755 modes; the complete entry then verified WSL
and published only a disposable Temp profile, exiting0. The original Windows
child close was observed. This fixture grants no facade or native admission and
is not an installation proof. The rejected and successful attempts remain
separate private receipts. The bundle SHA256 was
`d2cb7b9a4c025d77efd353f731bd5054411a525ae44498edb1282172e3c57953`.

A subsequent source change extracts the existing shared error constructor and
installation-code grammar into a small diagnostics module, preserving old
exports. Windows selection now precedes Linux profile initialization. Malformed
configuration returns the fixed Windows profile-invalid code. A real source
entry test refuses any attempted Linux-profile/SQLite import and counts zero
forbidden attempts; the existing Linux descriptor/profile launcher tests still
exercise their original behavior. All27 focused checks, both TSprojects and
seven-file strict lint passed. The relocated fixture imports the actual shared
diagnostics module.

Single-file ESM bundling can still hoist an external SQLite import. The observed
full Windows bundle emitted Node24.10's SQLite experimental notice; this source
change does not establish its absence in the rebuilt bundle. The source hook
proves deferred module initialization, not complete bundled import isolation.
The initial missing schema import and fixture relocation failures are retained
in private logs. Generated bundles will be refreshed against the final public
base before publication. No default Windows profile was modified.


## Rebased automation build verification

The three linear Windows/manager commits `387e5c48`, `4d618a11` and `d6b2abf6`
were replayed from their exact `7044fb46` boundary onto foundation candidate
`0e234eeb`. They became `c5fa7f40`, `d8c1cde6` and `4ae578ae`. Before restoring
only the three dirty generated paths, their complete bytes, physical modes and
original binary diff were retained privately. Earlier interop evidence remains
unchanged and belongs to its original source generation.

Linux Node 24.18.0, npm 11.16.0, soft core limit zero and umask 022 were used.
Package and lock bytes are unchanged. Main and bridge type checks, strict lint
(4,782 plugin files and 61 bridge files), API coverage (855 methods), all build
and fixed-generator checks, repository validation and seven packaged skills
pass. The official skill validator also accepts all seven skills. The isolated
catalog validator uses private temporary state and a must-not-execute upstream;
its retained original child closes with exit zero after stdin EOF.

All 75 focused Windows-bootstrap, machine launcher/profile/descriptor and
manager cases pass without skips. This includes the original EOF/input,
metadata settlement, timeout/ambiguous-publication cleanup and same-child
retirement checks. No native owner, application or live control facade is
allocated by this verification.

A second actual build reproduces all three bundles byte-for-byte: facade
16,457,622 bytes, supervisor 642,490 bytes and manager 1,830,087 bytes. Compatibility
updates only facade source/bundle projections and review time; all external
pins stay unchanged. The atomic builder's private facade/supervisor outputs
remain mode 0600 in this development tree. They are not installed-runtime mode
proof: installation must still verify packaged Unix 0644/0755 files and 0755
directories from the final released commit. No cache permissions were patched.

No version bump, publication, marketplace installation, default-profile change,
new Windows interop claim or connected validation is part of this seal. The
branch can be replayed after the foundation merge using the explicit
`0e234eeb` boundary; generated identities must follow that final source.
