# EasyEDA Pro Agent repository instructions

This file contains lasting repository requirements and engineering rules.
Keep work logs, release notes, test results and handoffs in `docs/history/`.
Open questions are not requirements.

## Goals and architecture

- Marketplace `easyeda-pro-agent` ships `plugins/easyeda-pro-control`, a Codex
  plugin with task skills and a version-pinned MCP safety facade for EasyEDA Pro.
- The intended scope includes project/document lifecycle; schematic parts,
  wiring and connectivity; symbols, footprints, devices and 3D; PCB placement,
  tracks, vias, regions and copper; rules, differential pairs, lengths and
  stackup; ECO/ERC/DRC; save/reopen and manufacturing exports. These are product
  requirements, not claims of implemented or validated coverage.
- The facade owns the sole upstream MCP child and authenticated bridge. It
  captures the reviewed upstream module graph by descriptor, then launches it
  through the native descriptor sanitizer, Bubblewrap and Node permissions.
  The private EasyEDA extension connects through the facade's HMAC gateway.
  Durable journals, evidence and SQLite checkpoints bind operations to their
  original owner, context and exact intended effects.
- Use maintained packaged adapters and machine configuration. Avoid temporary
  writer scripts and hard-coded workstation paths. Native control supplements
  genuine API gaps and dialogs. Use supported editing APIs where available.
- First-party server, test and tooling source is TypeScript. Build committed
  JavaScript bundles from source. Runtime details are in
  [`docs/architecture.md`](docs/architecture.md); setup is in
  [`docs/installation.md`](docs/installation.md).

## Capability and evidence boundaries

- Treat [`reviewed-compatibility.json`](plugins/easyeda-pro-control/reviewed-compatibility.json),
  registered tool schemas and the packaged
  [control skill](plugins/easyeda-pro-control/skills/easyeda-pro-control/SKILL.md)
  as the operation contracts. Consult its task-specific references and
  [capability matrix](plugins/easyeda-pro-control/skills/easyeda-pro-control/references/capability-matrix.md)
  before claiming support. A listed product goal does not enable a route.
- Keep ordinary-project and disposable-validation gates separate. Restricted
  symbol metadata, copy and drawing profiles do not admit general library,
  schematic or PCB writing. Hidden annotation/Save All paths and unproved
  structure/SQL lifecycles must remain blocked until their proofs exist.
- Separate discovery/schema, implementation, offline tests, installation,
  runtime admission, live effect and saved/reopened proof. Booleans, toasts,
  previews, unsaved readback and timestamps prove no durability. Label public,
  native-equivalent and internal routes accurately.
- The legacy compatibility profile pins dispatcher `ded07x99dcxb504` as
  `connected-read-admitted`. Exact reads require that complete tuple and fresh
  authentication and fail closed on drift. This profile admits no other tuple.
  Native UI replaces neither authority nor persistence gates.
- Unrestricted caller JavaScript has no opt-in. Private execution accepts only
  reviewed facade-generated programs. Implement missing writers and proofs
  rather than removing refusals.

## Non-negotiable safety rules

1. Inspection authorizes no edit/Save/discard/restore/fabrication/purchase/publication/
   third-party contact. User scope and technical gates still bind broad EasyEDA approval.
2. Test writers only on explicitly identified disposable projects. Prove live effects,
   collateral invariants, closed/reopened content and full logical SQLite changes.
   Validate offered rollback; disclose unsupported inverses, never improvise them.
   Enable production scope through reviewed connected evidence, coverage updates,
   regressions and deliberate code changes, never a flag.
3. Orphan-risk/unreadable journals quarantine bridge paths except their isolated
   nonce-bound resolver. Local discovery/evidence inspection may continue. Reconnects,
   copied PIDs, alternate control directories and native edits cannot bypass quarantine.
4. Never replay completed edits, Save, navigation, restart challenges or consumed probes.
   Legacy recovery retains user attestation. Typed recovery requires its operation-bound
   nonce, original-process termination and replacement authentication, not a user nonce
   message. Neither permits discard/force termination. JSON cannot recreate ownership.
5. Never Save after ambiguity, invariant mismatch or context/runtime/baseline drift.
   Missing/error acknowledgment consumes Save; reconcile/restart grants no retry.
   Leave Save/Discard prompts unanswered unless authorized.
6. Preserve unrelated changes, evidence and journals. Never rewrite upstream
   `easyeda-mcp-pro`, broadly delete temporary roots or patch caches. Prefer
   supported retirement, `close-retired` and original-child EOF for host gateways.
   The user has authorized normal SIGTERM only for verified idle legacy EasyEDA
   MCP servers whose version lacks a usable shutdown command. They must be
   retired, reference-only or ownership-conflict servers with no native owner.
   The user also permits the same bounded cleanup for verified metadata-only
   facades of any version when supported retirement is unusable, no native
   allocation has ever occurred and every call and pending publication has
   settled. Require complete verified callback history and original allocation
   evidence; an empty child list alone is insufficient. Send at most one normal
   SIGTERM for that original attempt and retain its pidfd through observed exit.
   Verify the original PID/start identity, executable, module and lack of owned
   resources immediately before signaling; retain a pidfd through observed exit.
   Never use SIGKILL, signal unrelated services, remove a lease manually or treat
   host exit as original native termination/helper-release proof. This narrow
   standing exception does not permit terminating an active native owner.
   Restoration needs exact authority, closed-file scope, backup and independent proof.
   Exit does not prove discard.
7. Never commit credentials, keys, projects, generated evidence, journals or private
   user-design data.

## Engineering workflow

- Read relevant skills/references. Use strict bounded schemas, fixed generated code,
  independent readers, collateral invariants and complete supported inverse models.
- Reprove owner/context at every await according to risk; journal before dispatch.
  Delayed calls need orphan markers/recovery. Retain process/Job handles through
  observed exit; requests/timeouts are not termination.
- Reject missing, malformed, non-finite, coerced, truncated or contradictory evidence.
  Preserve unknown fields/full source/peers; refuse unsupported encodings before writes.
  Never weaken shared guards for one defect or cache ownership/admission/authority.
- Keep persisted result schemas and projections immutable, including their fixed
  explanatory fields. Emit a new schema for changed results and validate released
  historical shapes explicitly. Historical parsing grants no live ownership.
- Use append-only/exclusive evidence, bounded symlink-safe reads, descriptor identity
  checks and durable directory sync. Safety regressions must fail unsafe code and
  prove no downstream mutation. Test real callbacks/owners, not only mocks; label
  synthetic versus connected results/performance separately.
- Use `npm test` or focused Node `--import ./scripts/test-isolation.ts`. The builtin-only
  preload allocates private control/credential/upstream roots before static imports.
  Never test on live control data, alter real journals or broadly delete failure roots.
- Keep strict TypeScript and pedantic type-aware Oxlint at zero warnings. Explain
  narrow inline exceptions; globally relax a rule only when necessary.
- Materialize package-check worktrees with umask022 inside a private parent;
  evidence remains077. Git executable bits alone do not prove exact755/644 modes.
- Synchronize source/bundles; never hand-edit `server/dist/server.mjs`. Keep sanitizer
  assembly/linker/binary and `server/src/descriptor-sanitizer-identity.ts` synchronized.

## Required verification

Freeze source, bundles and pins before suites. Fixtures seal the manifest;
changing it mid-run invalidates evidence and can cascade into quarantine.
Retain that failure and verify the final unchanged payload separately. Avoid
unrelated extra campaigns.

From `plugins/easyeda-pro-control`, require Linux x86_64, Node exactly `24.18.0`,
npm exactly `11.16.0`, and soft `RLIMIT_CORE` zero. Set `ulimit -c 0` and verify it
and both tool versions. For runtime or build changes, run `npm ci`, `npm ls --all`,
`npm audit signatures`, `npm audit --audit-level=moderate`,
and `npm run sanitizer:check`. Run `npm run verify` locally, or run its
non-suite phases locally and use exact-commit GitHub CI for the complete facade
and bridge suites. The local non-suite phases are typecheck, bridge:typecheck,
bridge:lint, lint, api:coverage:check, build, compatibility:check, skills:validate
and validate. Keep relevant focused regression checks during implementation.

CI satisfies the complete suites only when every facade shard, build check and
Windows native job succeeds for the exact final commit, source/bundle pins match
the reviewed local payload, and no intervening change affects that evidence.
Preserve test selection, isolation and expected platform skips; never filter
tests or relax guards to obtain a pass. Do not duplicate a full local suite when
this CI evidence already satisfies it. Record an interrupted local run as
incomplete and retain its log. Run all other mandatory local checks separately;
CI does not establish connected validation or untested local concurrency behavior.

For documentation changes, check local links, history placement and preservation,
and run repository, MCP-contract and all-skill validation. If moving evidence
also changes source reference strings, regenerate the coverage inventory and
bundles, refresh only the allowed facade compatibility projections, run types,
lint and the affected regression suites, and verify the generated artifacts.
These checks do not establish connected validation.

From repository root run
`npm --prefix plugins/easyeda-pro-control run repository:validate`.
Run `npm run validate` and `npm run skills:validate` from the plugin directory.
Run the installed skill-creator `scripts/quick_validate.py` on every packaged
skill, using its actual location, and the official plugin validator when
available. Repository, MCP-contract and all-skill checks remain mandatory
without external helpers. Verify reproducible `server/dist/server.mjs` and
`server/dist/upstream-supervisor.mjs` under the plugin. Offline doctor is not
connected validation; never smoke-test mutations on user projects.

## Compatibility and native boundary

`plugins/easyeda-pro-control/reviewed-compatibility.json` gates drift. After freezing
source/sanitizer/bundles, run `npm run compatibility:update` then
`npm run compatibility:check` from the plugin. Only facade source/bundle projections
and review time may refresh. External upstream/EasyEDA/bridge/catalog/dispatcher/
installed-bundle pins need separate evidence, not a refused admission. Sanitizer
identity is never automatic metadata.

Only the reviewed x86_64 sanitizer may enter Bubblewrap. Descriptors `0` through
`9` carry deliberate authority; `10` admits the exact executable, close-on-exec,
regular mode-`0755`, no capability xattr. Set `PR_SET_PDEATHSIG(SIGKILL)` against
the unchanged expected parent, `close_range(11, UINT_MAX, 0)`, then enter by descriptor.
New inherited descriptors require updated mapping, native contract, fingerprint and
hostile-descriptor tests. Require Linux 5.9+, `close_range(2)`, `execveat(2)` and
unprivileged readable `security.capability` xattrs. GNU `/usr/bin/as` and `/usr/bin/ld`
are build/check dependencies only.

## Release discipline

- Obtain CodeRabbit's PR review before merging. Address its reported issues,
  including legacy issues outside the immediate diff. If a substantive review
  recommendation remains disputed, ask the user to decide before merging.
  The minimal inherited CodeRabbit configuration disables commit-threshold
  auto-pausing. A skipped or paused check is not a review of the current head.
- Keep marketplace/manifests/README/skills/agent metadata/tool descriptions and exhaustive
  coverage/omission reasons consistent. Publish only with green exact-payload CI and
  reproducible bundles. Scan staged secrets/design artifacts; preserve bridge identity/key epoch.
- Official installer subprocess uses umask022; private evidence uses077. Verify committed
  bytes/modes, not CLI success. Same-HEAD no-ops are not repairs; inspect before retry/add.
  Never patch installed caches.
- Record commit, counts, marketplace URL and installation proof in dated
  `docs/history/` records. Update originating records only within scope, never
  the excluded production record.
- Load installed snapshots through a fresh MCP connection and admit its actual
  process. When the user requests continuation through a fresh-context subagent,
  finish original native cleanup and all calls first, then use the original
  facade's supported `easyeda_control_session` retirement while its package
  files still exist, before an upgrade or installation can prune them. After
  acknowledged `retired` state and lease release, install/verify the update and
  spawn the replacement. A conflict
  connection never retries. Verify the replacement's offline `loaded-facade`,
  exact installed payload and full process/source admission before live work;
  a new subagent alone proves no package refresh. Keep the retired connection
  offline. Older snapshots without retirement cannot use this handoff; report
  that limit without inventing shutdown, rebinding owners or patching caches.
  The explicit idle legacy-host exception above supplies no native-owner cleanup
  or adoption. Do not repeatedly request chat restarts as the default update loop.
  Report pending connected validation/import separately.
- For repeated development and disposable validation, prefer the maintained
  foreground manager after retiring the original Codex connection. Keep the
  selected payload frozen through native cleanup. Finish each workflow's own
  acknowledged helper release, retire the original facade before installation,
  observe its exit, then select and admit the verified replacement. Manager
  generations and historical receipts cannot transfer unfinished native owners.
- When a subagent receives a startup-only ownership-conflict MCP connection,
  close that subagent's own idle stub through its supported `close-conflict`
  action before returning or waiting through another controller's recovery.
  Inspect the original connection once, verify its returned PID and zero owned
  resources, retain a pidfd, and observe that original process exit. Never close
  the recorded owner PID or adopt a different connection. A closed transport
  cannot be retried. Starting or resuming another subagent is not a way to close
  a lost connection. Preserve its evidence and use only an already-authorized
  cleanup path. Conservative Linux recovery probes count these stubs too.
- Source-only subagents must also inspect their own session before assuming
  that no facade was allocated. The host can start the normal MCP connection
  eagerly even when the agent has made no explicit tool call. Retire that
  original idle metadata-only connection and use its supported `close-retired`
  action, retaining its original pidfd through observed exit, before returning
  or waiting through another controller's native work. This grants no native
  allocation, signal, owner adoption or retry of a closed transport.

## Maintaining documentation and history

- `AGENTS.md` contains lasting goals, architecture, requirements and agent rules.
  Update it when those contracts change. Keep dated status, current work items,
  release/install results and session handoffs out of this file.
- `README.md` is the human entry point for installation, usage and a short
  developer/contributor guide. Keep project chronology out of it. Put detailed
  reusable guides in `docs/` and packaged operating instructions in skill
  references. Keep [`docs/README.md`](docs/README.md) useful as a navigation map.
- Put all repository work history, including research findings, reviews,
  validation cases, release reports, open work and recovery handoffs, in
  `docs/history/`. Use `YYYY-MM-DD-topic.md`, with the date first and a concise
  kebab-case topic. Add `HHMMSS` after the date when ordering same-day records
  matters. For a retained multi-day record, put its first date first and the
  end date after `through`. Retain month precision when no exact day is known.
- Add each record to [`docs/history/README.md`](docs/history/README.md). Record
  the date, scope, exact payload/commit and evidence appropriate to the work.
  Keep raw private evidence outside the public repository. Follow
  [`docs/connected-validation.md`](docs/connected-validation.md) for live cases.
- Preserve earlier observations, failures and pending statements. Append a
  dated correction or terminal result and link it to its originating record.
  Do not overwrite a failure with success or replay work to improve a record.
  Summarize open work and its limits in the dated handoff, not in agent rules.
- When moving a report, update local links and maintained evidence references,
  including generated catalogs. Preserve commit-qualified URLs, which refer
  to paths in their frozen commits. Keep explicitly identified verbatim
  snapshots byte-exact and document their source paths in the history index.
- History is evidence, not instructions or a current work queue. Historical
  "current", "next" and "in progress" can be stale. Search specific headings
  and read bounded sections. Verify the implementation and tests before using
  a claim. A historical operation grants no authority to edit or repeat Save.
- User project handoffs and design histories are excluded from this public
  repository. Third-party license and provenance records stay with the
  vendored materials they describe.
