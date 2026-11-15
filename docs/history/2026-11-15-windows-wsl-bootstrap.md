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
syntax, whitespace and name settings, ran on Windows Node 24.10.0 through actual
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

The built complete server entry also ran on Windows Node 24.10 in explicit
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
full Windows bundle emitted Node 24.10's SQLite experimental notice; this source
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


## PR212 merge and Windows automation replay

[PR212](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/212) merged
at 2026-11-15 16:03:58 UTC as
`4590149ad9e5c6faa5fbe06b60dc5bb304c13c78`. All thirteen checks passed on its
exact final head `75576519a30b8a8e807306b0cbd4202e6ead6523`, including all eight
facade shards, aggregate build, Windows recovery and CodeRabbit. CodeRabbit's
current-head walkthrough explicitly marked that exact commit reviewed and
reported no new actionable comments. The final incremental pass selected
fifteen files; it skipped the existing foundation history and compatibility
manifest as similar to previous changes. This is the recorded review scope,
not a claim that every file was scanned again. All forty-five review threads,
including the eleven legacy threads, were resolved after source audits and
recorded corrections. Dependency proposals
[PR210](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/210) and
[PR211](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/211) are closed.

The release-recovery resolution preserves failed/ambiguous v1 quarantine.
Public v2 contains the budget, facts schema and pure-chain validation joint;
it does not contain a runtime publisher, coordinator or original-owner opaque
proof issuer/consumer. Those remain a separate private integration batch. The
generation-closure validator correction changes no persisted record format or
retry authority. The legacy resolutions grant no runtime recovery or writer
admission.

The four Windows automation commits were replayed from the explicit old
boundary `0e234eebe0f10dd5a5af100456d85c017af0c100` onto that actual merge.
The sole compatibility conflict retained the merged manifest temporarily;
original conflict bytes and prior5277 bundle bytes remain private. Source
replay completed before regeneration began. The plugin-only cachebuster is
`0.3.0+codex.20261115160744`; the base release remains `0.3.0`. No installed
cache or default machine/launcher profile was changed.

Fresh official installation, full installed Linux v2 byte/mode/link proof and
the new CLI process's actual metadata-only loaded-snapshot/retirement/observed
exit proof remain pending. Earlier disposable Windows-to-WSL fixtures and
source checks establish their stated transport/configuration stages only; they
do not establish a fresh installed desktop connection or connected admission.


### Replayed package verification

The frozen replay passes both facade TypeScript configurations, both bridge
TypeScript configurations, bridge lint and whole-repository strict type-aware
lint: 4,782 files, zero warnings or errors. API coverage remains855 methods.
Real npm clean installation under umask022, the complete dependency tree and
the full maintained generation/build checks pass. The exact package and lock
bytes match the already verified signature/moderate-audit receipts; npm clean
installation also reports zero vulnerabilities. All three runtime bundles
reproduce byte-for-byte. Compatibility changes only its allowed facade source
and bundle projections and review time; every external tuple pin is unchanged.

All75 focused manager, Windows/WSL, machine-launcher/profile and paired-descriptor
cases pass with zero skips. Their six runtime files remain byte-exact before
and after the run. Repository, isolated MCP catalog and all-skill validators
pass; all seven official skill quick checks pass. The catalog validator's
original temporary stdio child receives only its isolated catalog/disabled-route
checks and reaches observed close0 through stdin EOF; it is distinct from an
installed live-control connection. No application or native route is used.

Before that frozen campaign, replayed file modes inherited a private evidence
umask. Only this owned source worktree's tracked modes were corrected, then
the maintained builders were rerun under022 and all three bundle hashes
matched. Initial object-availability, conflict-count and receipt-key assertions
remain in private evidence. The facade and supervisor builders deliberately
publish their private build outputs as0600; that is not installed-package mode
proof. The official installed Linux v2 verifier must still establish the full
644/755 file modes,755 directories, committed bytes and absence of links after
installation. Windows byte/reparse checks are separate and establish neither
NTFS ACL/ownership custody nor POSIX modes.

The Windows automation batch awaits its own exact-head CI, CodeRabbit review
and deliberate publication. Fresh installed Linux/Windows package verification,
new CLI metadata-only process closure and any current desktop connection proof
remain pending; no passing installation or connected result is claimed here.


## 2026-11-15 PR213 publication and runtime-custody correction

CodeRabbit review 5911737113 on PR213 head
`9518713ebfd0dd698e410f53157d32af6db271e0` reported two valid races:
`r4579230385` allowed two replacing provisioners to pass the same final read,
and `r4579230389` closed the six verified descriptors before a pathname-based
execution handoff. The earlier single-provisioner/initial-observation limits
above describe that earlier implementation, not the corrected handoff.

Configuration now holds an in-process SQLite OS transaction across the final
read and atomic publication. The reserved database is fully initialized in an
exclusive temporary file before its one-time link, has an exact schema and
canonical Windows case-folded profile binding, and is never replaced. Its
recognized original filesystem identity remains bound through acquisition.
Busy, unknown/rebound schema and stale profile state refuse. Process death
releases the OS transaction; no stale PID marker, helper-owner recovery or
control-lease mutation is involved. A crash between the initialization link
and unlink may leave one harmless alias, accepted only for this metadata.
Runtime and profile single-link guards remain unchanged.

Runtime handoff now retains private verified Buffers and copies all six files
into a private read-only Bubblewrap directory skeleton at their original
canonical paths. Every containing path component is private; ordinary sibling
trees remain shared host mounts. The reviewed compatibility pin selects and
verifies the existing Bubblewrap binary; no caller executable field or new
distribution dependency is added. Setup-only descriptors close before Node,
there is no PID namespace, and original binary stdin/EOF/child-close custody
continues without process signals. Linux package/runtime admission remains
separate and authoritative. A profile/control directory overlapping a protected
ancestor is refused; the documented bounded directory/entry/argument limits
fail closed.

Private inert namespace probes first rejected two tempting alternatives:
`--ro-bind-data` produced link-count zero, and per-file mounts over mutable host
parents lost selection after atomic file or containing-directory replacement.
Those failures are retained. The final private skeleton retained the captured
bytes through in-place, atomic-file, server-directory and whole-package-directory
replacement. The public fixture checks all six hashes,0644/0755 modes, single
links, EROFS write refusal and absence of leaked setup sockets after replacement.

Nine focused Linux tests pass with zero skips. They include the minified
production-helper closure, exact binary/EOF exit23, simultaneous original
cross-process publications, process exits while holding the transaction and
immediately after lock DB publication, and unknown/wrong-path/extra-schema
refusal without changing either file. Both facade TypeScript projects and
three-file strict type-aware lint pass with zero warnings. The first new
minified run exposed an inferred generated naming helper; the serialized local
callbacks were corrected and the failed receipt remains private.

The actual minified module also ran on Windows Node 24.10.0 through `wsl.exe`
and Linux Node24.18.0 against six disposable matching files. NTFS
`profile.json`/`PROFILE.JSON` replacement contenders produced exactly one
winner and one `windows-wsl-profile-changed`. The fake Linux entry checked
fixed argv, echoed131356 nontrivial bytes and exited23 on EOF with empty stderr.
An independent original Linux pidfd remained held while the parent verified
all six hashes/modes/single links through `/proc/<pid>/root`, both before and
after host in-place replacement. Zero setup sockets remained in that Node.
The original Windows wrapper, WSL watcher and all other fixture children reached
observed close; the original Linux pidfd observed exit. No fixture resource
remains live.

The actual Windows attempt also caught an EPERM from fsync on a read-only owned
temporary lock DB handle. Opening only that owned temp as read/write corrected
Windows FlushFileBuffers access. That failed receipt is retained separately.
A subsequent private watcher quoting failure reached no pidfd; its harness
closed all original children by EOF before the corrected passing run. SQLite's
experimental notice can still appear on stderr in configuration mode; source
lazy initialization is not a claim of zero bundled SQLite imports.

These are inert transport/configuration fixtures: no actual index, live MCP
facade, bridge, native owner, application, Job or design was started. No default
profile, installed cache or publication changed. Fresh official installation,
full installed Linux v2 byte/mode/link proof and fresh CLI loaded-snapshot plus
supported retirement/original-exit proof remain pending. Root will regenerate
and validate final bundles/compatibility and obtain exact-head CI and follow-up
CodeRabbit review after integrating this source correction.


### Final combined review-fix verification

The two findings from full review 5911737113 on 9518713e are corrected. A
bounded independent source review also corrected case/short-name alias lock
selection and preserved the recognized lock identity through transaction
acquisition. All nine cases in the affected Windows suite pass without skips.
The transaction lock releases on process exit; fully initialized publication
and both tested crash points recover without deleting a stale lock.

The combined public payload passes facade and bridge types, bridge lint,
whole-repository type-aware strict lint over 4,782 files with zero warnings or
errors, API inventory of 855 methods, complete maintained build, compatibility and
repository/MCP/all-skill checks. All three bundles reproduce their committed
bytes after regeneration; only allowed facade projections and review time
change in compatibility.

An actual Windows Node 24.10 full rebuilt bundle also completed standalone
configuration using only a disposable profile and matching Linux runtime
copies. Stdout was the exact fixed configuration result; stderr contained
only the known experimental SQLite notice. The original Windows process and
its original WSL verification child both closed with code zero. Six runtime
bytes and the existing Linux machine profile remained unchanged. The bundle
SHA-256 is
`d528175c984511f4dc2af208a263f8d634f873332a0d6cd86e1536742911febb`.
This was verification/configuration only; it started no real index, facade,
native owner or application. Official installation, fresh serving-process
proof, final-head review and complete CI remain separate release gates.


## 2026-11-15 CI fixture sandbox identity correction

Exact public head `846c1cfadd2c833c7341c07af69dbac89e7093f0` received an actual
current-head CodeRabbit walkthrough with matching reviewed coverage metadata
and no new actionable comments. Its two prior race threads were resolved.
That review did not establish passing CI: facade shard 5 in run 43746019694,
job 132909371906, reported 1,759 tests, 1,730 passes, 4 failures and 25 platform skips.
All four failures were the WSL runtime fixtures: readonly verification, minified
helper verification, EOF handoff and captured-namespace replacement.

The fixture had copied the released machine compatibility manifest, including
its compiler-specific Bubblewrap binary hash. CI builds the reviewed 0.13.1
source with its own Ubuntu compiler. The released binary has a different
compiler identity, so the runtime correctly refused that fixture pin. The old
CI log does not retain the CI binary hash; no inferred hash is recorded as an
actual observation.

The inert fixture now captures the canonical path and SHA-256 of its actual
reviewed test binary and places that explicit synthetic tuple in its own
compatibility bytes. A TAP diagnostic retains the observed test-binary hash.
The new negative case replaces only that sandbox hash with a different valid
64-hex value and recaptures the complete six-file packet. Thus all six file hashes
match and refusal reaches the separate sandbox hash check before entry
dispatch. Restoring the original compatibility bytes must execute the same
inert entry, preventing an unrelated early refusal from satisfying the case.

Production source, compatibility pins and all three generated bundles remain
byte-identical to 846. No test filter, platform skip, deadline or runtime guard
was relaxed. No actual index, facade, bridge, native owner, application, Job or
design was started.

Local dependency materialization was interrupted by an unexpected WSL kernel
restart before types, lint or the affected test file began. None of those
checks passed in this attempt; it is an infrastructure interruption, not a
failed or passing test result. The public patch and interruption evidence are
retained independently. Further Linux launches are held during coordinated
storage recovery. Exact new-head Linux CI, strict checks and actual follow-up
review remain required before merge; no new-head passing result is claimed.
