# EasyEDA 3.2.206: calculation-only compatibility review

Reviewed on 2026-10-13. This is a source and local-test record, not connected
execution evidence. No application, native control, bridge, machine profile,
credential, project or installed plugin cache was changed during this review.

## Decision

Restart follow-up: the actual authenticated 135500 handshake reports
`3.2.206` through `getEditorCurrentVersion()`, not the installed package's
`3.2.206.715d940d`. The first area request refused before SDK dispatch because
the initial profile confused these identities. The correction compares the
literal editor-reported version while preserving all API/PCB hashes and the
separate installed-package verification. It does not trim an arbitrary runtime
value, accept a version prefix or alter the old design manifest. A regression
fixture now uses the observed literal instead of copying the expected profile.
This connection evidence is not a successful live calculation.

Admit only the eleven fixed, input-only `sys_Math` adapters described in
[the math implementation review](sys-math-implementation-review-2026-10-13.md).
Do not admit the new application tuple to the legacy private compatibility
manifest. Existing schematic, PCB, library, native UI and lifecycle profiles
still describe the older application and remain unqualified for this update.

The separate `sdk-math-runtime.ts` validator preserves the existing manifest's
facade projection, upstream executable/module closure, tool catalog, Node,
extension, bridge, dispatcher build and method-registry requirements. It replaces
only the application/bundle comparison within this one calculation scope. It
does not modify a fingerprint and submit it to the old private validator.

The new generation must also use the startup-latched four-tool facade:
`easyeda_control_status`, `easyeda_control_api`, `easyeda_control_discover` and
`easyeda_control_calculate`. Several historical read routes do not themselves
apply the full private-fingerprint gate, so updating file selectors alone would
not safely isolate them. `facade-mode.ts` keeps those routes unregistered. Unknown
or mixed generation selections are restricted too, but do not thereby pass the
separate math runtime admission. No caller option changes this registration mode.

## Independently checked installation bytes

Files were read as inert bytes; none were imported or evaluated. Paths below are
relative to the installed `resources/app` directory.

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `package.json` | 248 | `e349f8d80f809f82a057f1b81799430ba25bfa0f7c7cb96f6155327b49391455` |
| `version.txt` | 36 | `fc553f3d0a58fb917eb910997e45f9773228af239e9f3ebfcdc759fbd759fe54` |
| `assets/pro-api/0.3.50.ab46409c/api.js` | 1964920 | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |
| `assets/pro-api/0.3.50.ab46409c/api-types.js` | 1757237 | `5570385041b304d6b2fc8ce59de7e0030f2732913cf6d43861fe985e0c079f3a` |
| `assets/pro-api/0.3.50.ab46409c/api-types.d.ts` | 1733380 | `d5fe990034c55001302ea6c3f704c2d4b88cdf23253cc5293b3bad62a32b9def` |
| `assets/pro-pcb/3.2.193.682ed44e/js/pcb.js` | 10976299 | `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33` |

The package reports `3.2.206.715d940d`. The version file reports
`3.2.206.715d940d.6d5480, 10/10/2026`. The PCB hash identifies the selected
installation; it does not certify a PCB reader, writer or geometry operation.
The other changed editor/worker files are inventoried in
[the installation inventory](easyeda-3.2.206-upgrade-inventory-2026-10-13.md).

## Status and transport source closure

The maintained engine's status call uses only its existing upstream owner and
the fixed health, bridge-status and method-probe tools. It does not call context,
project navigation or a CAD document getter.

- Upstream `L0_diagnostics_core.ts` derives health application/extension versions
  from the retained authenticated handshake. Its Node field is `process.version`;
  the scoped validator retains the existing leading-`v` normalization.
- Bridge status invokes the baked `system.getStatus` handler. That handler
  reports bridge version/capabilities and enumerates API/global property names.
  It examines the named API-class objects but does not invoke their document or
  component methods. The reviewed API constructor installs those instances as
  own data fields. No active design object is returned through this path.
- The method probe requires `system.loaderStatus` and the baked capability list.
  Loader status reads retained build/registry metadata. A fallback server-only
  method list does not satisfy the required `loader_status` fingerprint source.
- The extension handshake calls
  `sys_Environment.getEditorCurrentVersion()` with no arguments. API function
  `Pl` at UTF-16 offset 470792 reads the `editorMainVersion` meta value; the
  wrapper at 1803059 forwards that value. This path does not invoke a UI RPC or
  write application preferences. The nearby compiled-date getter has a cache
  write and is not part of this admission.
- Native `SYS_WebSocket` at 1874580 retains
  `register(id, url, messageCallback, openCallback, protocols)`, synchronous
  `send` and `close`, and extension-owned connection records. Its external
  interaction permission check remains in place. The maintained extension uses
  the first four register arguments; it does not substitute browser transport
  or interpret the fifth argument as a close callback.
- Native `SYS_Timer` at 1872611 retains extension-owned named interval/timeout
  registration and cancellation. This is bridge transport bookkeeping, not a
  design edit. The calculation itself registers no timer, socket or callback.
- The existing dispatcher executes a generated program through its fixed
  `apiExecute` operation. The new public facade accepts only a literal method
  and typed numerical inputs; callers cannot supply that program or another API
  path. The shallow exact-JSON envelope avoids the dispatcher's depth-limited
  object normalization.

These observations support using the existing authenticated transport for the
narrow adapters. They do not establish a successful extension startup or a live
connection on the new application. Credentials, archive provenance, dispatcher
identity and the existing authenticated dispatch lease must still pass at runtime.
Missing external-interaction permission, unavailable APIs or a disconnected
bridge remain ordinary refusals, not reasons to enable another transport.

## Calculation admission and result boundary

`calculateSdkMath` parses the request before any dispatch, checks the caller's
complete runtime fingerprint, runs the global orphan guard and obtains fresh
status. The observed fingerprint must pass the separate exact scope and match
the caller's expected fingerprint. A second orphan check precedes the sole
`easyeda_execute` request through the same serialized authenticated owner.

The fixed program performs two synchronous samples with frozen supplied inputs.
It accepts only bounded own-data results, unchanged method/owner identity and
matching samples. The coordinator requires a settled upstream reply, a valid
exact envelope within 32768 bytes and the literal method's typed result. A fresh
orphan check and complete post-call status must then match the initial runtime
exactly. Any mismatch refuses the result; no replay or replacement owner follows.

Results describe supplied coordinates only. They are not active-CAD geometry,
connectivity, saved-state, design-rule, manufacturing or physical-unit proof.

## Explicit profile migration

From the trusted checkout's plugin directory, prepared with the pinned Node
24.18.0 toolchain and its dependencies:

```sh
ulimit -c 0
node scripts/upgrade-calculation-profile.ts
```

For an already-established nondefault profile, append
`--profile /absolute/control/machine-profile.json`. This is a checkout maintenance
command, not a dependency-free installed-cache entrypoint. Do not change roots
to evade an existing owner or quarantine.

The helper admits the old exact PCB/API generation, or verifies an already-new
selection as a no-op. Unknown and mixed source generations refuse. It validates
the private profile, same canonical control root and pinned Node, then verifies
the exact app package and four new bundle hashes. It revalidates the unchanged
upstream and installation configuration before replacing anything.

Only the two PCB/API version selectors change. An exclusive same-root lock and
staging file protect cooperative updates; a mode-0600 hash-named backup retains
the exact original bytes. The original, backup and staging bytes/identities are
checked before atomic same-directory replacement; directory fsync and a strict
post-replacement inode/byte check precede success. Cleanup attempts all owned
resources and retains primary plus cleanup errors. Backup files remain if a
later stage fails. After any failure, inspect the profile and receipt before
retrying; do not assume a post-replacement failure means no change occurred.

There is no lease takeover, bridge launch, token rotation, journal modification,
global compatibility update or automatic promotion of the running offline host.
A fresh official host is needed afterward. Selecting this generation exposes
only the restricted catalog; successful authenticated runtime admission is still
required for a calculation.

## Verification completed for this slice

- Six focused runtime cases passed: valid same-owner execution, legacy-gate
  rejection of the new tuple, common trust-field mismatches, pre-dispatch refusal,
  post-call drift, unsettled replies and output bounds/literal method binding.
- Three focused migration cases reused the existing machine-profile fixture:
  strict argument selection, unknown-generation refusal, and wrong installed
  bytes with exact profile-byte/mode/inode and unrelated-file preservation.
- Strict type-aware lint for the runtime/helper and their tests passed with no
  warnings. Full `tsc --noEmit` passed at the reviewed source snapshot.

The migration success path has source review but no successful real migration
claim in this record. No connected calculation was run during this review.
Build, CI, installed-tree proof, any later authorized migration and connected
validation belong to the release receipt, not to these source-test results.
