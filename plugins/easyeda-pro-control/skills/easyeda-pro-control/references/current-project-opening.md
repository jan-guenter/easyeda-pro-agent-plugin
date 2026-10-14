# Current-version disposable project opening

Use `easyeda_control_project_open` only for an explicitly selected disposable
local `.eprj2` file and one existing PCB. This is the separately pinned current
3.2.206 application route. It does not enable legacy `runtime open-existing`,
generic document navigation or design writers.

Query offline `project-open` with `includeSchemas:true`, then validate the
assembled request with `project-open-validate`. Confirm the actual installed
catalog exposes the tool before trying it. Declaration discovery or an older
installation does not supply this implementation.

## Prepare and open

Resolve any supported historical unfinished-record blocker before opening.
The current `history` tool qualifies only the sixteen-event pre-navigation
validation boundary; see [failure recovery](failure-recovery.md). Do not replay
navigation or bypass the guard merely because an older record is data-only.

Use the normal supported launcher in the same facade process. A manually
started app, a historical launch receipt or an authenticated bridge alone is
not retained process authority. The editor must initially have only its genuine
Start Page and optional hidden placeholder, without a current project.

Obtain the exact path and PCB ID from the selected disposable fixture or its
retained receipt. Do not search production projects for a convenient test case.
The file must already be registered with EasyEDA. Missing registration refuses;
this tool does not scan project directories, register a path or create a project.

The `open` request contains:

- A fresh `operationId` used only once.
- `rawWindowsPath`, exactly as registered, with drive letter and backslashes.
- `projectUuid`, the SHA-256 of that raw path's UTF-8 bytes. Do not normalize
  case or slashes before hashing. This is a local 64-hex ID, not UUID32.
- `documentUuid`, the selected existing 16- or 32-hex PCB ID.
- `expectedSourceSha256`, the original selected file's SHA-256, not the
  checkpoint hash. SQLite checkpoint bytes can differ from source bytes.
- `confirmDisposableProject:true` and `acceptNormalOpenEffects:true`.

Pass the actual authenticated status fingerprint at the tool's top level as
`expectedFingerprint`. The host creates a private managed checkpoint, derives
the default branch and proves the PCB is present and not deleted. It checks the
original source again before dispatch. The generated adapter verifies the
registered raw path and complete bounded editor registry around awaited calls.

Opening is not read-only. EasyEDA can migrate the selected database, replay
cached uploads, restore selected-project tabs, update shared preferences or
bookkeeping, start background work and automatically Save. The agent must have
task authority for these ordinary effects. No explicit Save, discard, close,
restore or design-edit method is issued. The backup is preservation, not an
automatic restoration plan or proof of unchanged post-open storage.

## Read the outcome without replay

Project opening, document opening and observed native identity are separate
facts. Public methods route through mutable global state, so before/after
observations are not an atomic lock. Keep other app input quiescent.

Ordinary opening changes the URL to `#id=<project>` and document focus can add
`,tab=[*]<document>@<project>|...`. The opener requires an empty initial fragment
for project dispatch, admits only the selected project's ordinary fragment at
the public navigation return, then freezes the URL again. Listed tabs and any
active marker must match its independently sampled registry. Unknown fragment
keys, command/history modes and library/device syntax are refused. The current
PCB layer, identity and geometry readers accept this target-bound grammar but
keep their captured URL unchanged across all awaits. The URL never substitutes
for their project, branch, frame or native identity checks.

Each navigation stage is consumed before dispatch. `inspect` reads the journal
without contacting EasyEDA. `observe` checks the existing target without
opening it again. An absent frame or incomplete native identity is not permission
to repeat `open`. Even a successful public return does not prove rendering,
completed restoration, saved state or writer support.

Once the exact target is active and observed, `easyeda_control_pcb_layers` can
read its layer metadata using that project, branch, document and tab ID. That
reader still performs its own admission. Opening does not grant general CAD
execution authority.

## Interrupted calls

Newer snapshots retain `failureDiagnostic` in the stopped operation and a
managed `failure-diagnostic` artifact. It contains the operation `phase`, last
`hostStage`, fixed `category`, and nullable `nativeStage`/`nativeCode`. Unknown
exceptions remain `unknown`; raw messages, stacks and private values are not
returned. `native-timeout` and `bridge-timeout` remain unsettled execution, not
proof of cancellation. A stage identifies where observation stopped, not which
file effects occurred or whether navigation succeeded. Inspect the original
operation instead of repeating it to obtain a better error.

When a new tracked phase is marked, its preceding phase's return timestamp is
cleared. Older journals can retain that stale timestamp; interpret it with the
recorded phase/marking time and artifacts, never as current-phase completion.
Do not rewrite historical evidence or infer its missing cause from new codes.

Never repeat an uncertain project or document stage, including under a new ID.
Keep the same facade alive. If a tracked call remains orphaned, normal application
closure must finish before `retire-after-termination` can run. Do not force-quit
or choose Save/Discard for unrelated work.

Retirement requires `confirmRetire:true`, `acceptUnknownFileEffects:true` and
the exact operation ID. The coordinator proves its original retained root and
Windows Job terminated, the original authenticated session closed, and no
dispatch lease remains. It durably invalidates this attempt without replay,
continuation or a claim about file contents. This local terminal proof is
different from legacy design reconciliation, which still requires replacement
session evidence. It does not weaken that recovery policy or clear another
operation's quarantine.

A facade restart loses the required retained handles and in-memory ownership.
Inspection remains available, but this retirement route cannot reconstruct
authority from process absence, PID, saved receipts or a new bridge session.
Do not delete or rewrite the journal to make it pass. Record the unresolved
operation for a separately supported recovery procedure.

This adapter is source-tested. Connected opening and persistence validation
must be reported separately; the current release makes no writer-lifecycle
claim.
