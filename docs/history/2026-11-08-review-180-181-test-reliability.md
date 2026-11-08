# Review partitions 180 and 181: test reliability

This batch verifies the supplied review snapshots against current source. It changes tests and test helpers only; it does not run a new remote review or change product guards, original owners, journals, native artifacts, application state or runtime authority. Installed product bytes are offline source evidence, not connected CAD validation.

The shared `server/tests/helpers/installed-easyeda-source.ts` uses the existing `EASYEDA_ASSETS_ROOT` configuration. Single-asset, multiple-asset and sibling `app.js` reads return `null` only when the variable is unset. Explicit empty configuration, unreadable files and invalid UTF-8 fail. The decoder preserves a UTF-8 BOM and source offsets. All affected tests report the explicit offline installed-source skip. The inverse graph fixture and all five consumers use that optional value directly, so no forged ENOENT or broad catch hides a configured failure.

Three Inspector-worker failure handlers now use one test-only helper that resumes the paused Node main thread before rejecting the original operation. If Resume itself fails, it attempts Disable, disconnects, and preserves the original error. Two unconditional real Inspector regressions prove the main thread progresses in both cleanup paths. Successful source/metadata/helper-count assertions remain intact.

| Review item | Current-source result |
| --- | --- |
| 180 / 4504471116, 4504471119, 4504471121 | Fixed the three original paused-handler rejection paths; shared cleanup is exercised with an actual paused inert Node main thread. |
| 180 / 4504471124, 4504471125 | Already resolved before this batch: initial-branch and periodic-sync tests use retained pinned excerpts plus mandatory synthetic refusal checks; there is no installed-file read to configure or skip. |
| 180 nit: inverse-delete bindings | Replaced the hardcoded source read and catch-all skip in both tests with configured optional reads; errors from an explicitly configured install propagate. |
| 180 nit: project-reopen cache | Uses the shared configured source helper and explicit unconfigured skip. |
| 180 nit: reader relinquishment paths | Synthetic installation strings now derive from the unique test directory under a generic inert WSL drive mapping, retaining the required resources/app/assets shape without a workstation install path. Nothing is read or created at that mapped path. |
| 181 / 4504505688, 4504505698 | Already resolved: both post-history tests use retained pinned excerpts and source-refusal checks, with no installed-file read. |
| 181 / 4504505700 | The fixture records when the original project pause is queued and detects any later resume, independent of its role name. A deliberate inert later-resume test proves the flag can become true; original no-project-resume assertions stay active. |
| 181 / 4504505703 | The observer already uses an explicit synthetic source seam. The separate installed-source polling test now uses the configured helper. |
| 181 / 4504505706 | Already resolved: the old six-record accessor observer uses its explicit synthetic source seam, so its checks remain unconditional. |
| 181 / 4504505710, 4504505717 | Prefix queue, four cited callee/listener suites and the genuine seven-record accessor observer share the configured asset reader and propagate configured failures. |
| 181 / 4504505714 | Padding preserves newlines and UTF-16 width. A new unconditional synthetic astral-prefix test checks the actual V8 getter coordinates. The three touched paused-source overlays use the same width-preserving rule. |
| 181 nit: reader delay replacement | Late-exit/never-exit fixtures assert that replacement changed the original source before compiling it, so a changed literal cannot silently run real delays. |
| 181 nit: library refresh | The installed-source tests use the shared configuration and explicit skip; fixed grammar and brand-refusal tests remain unconditional. |

Verification: with the configured pinned installation, 72 focused tests pass with no skips. With configuration absent, 45 pass and 27 installed-source checks explicitly skip. A deliberately configured missing asset produces ENOENT and a failed test with zero skips, as expected. Both TypeScript projects and changed strict lint pass. The original synthetic-path rewrite initially omitted the pure installation codec's required resources/app/assets suffix; that inert path was corrected and the same regression passes, without changing the production codec.
