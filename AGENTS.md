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
   `easyeda-mcp-pro`, broadly delete temporary roots, kill host gateways or patch caches.
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
`npm run sanitizer:check`, then `npm run verify`.

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

- Keep marketplace/manifests/README/skills/agent metadata/tool descriptions and exhaustive
  coverage/omission reasons consistent. Publish only with green exact-payload CI and
  reproducible bundles. Scan staged secrets/design artifacts; preserve bridge identity/key epoch.
- Official installer subprocess uses umask022; private evidence uses077. Verify committed
  bytes/modes, not CLI success. Same-HEAD no-ops are not repairs; inspect before retry/add.
  Never patch installed caches.
- Record commit, counts, marketplace URL and installation proof in dated
  `docs/history/` records. Update originating records only within scope, never
  the excluded production record.
- Load installed snapshots in a fresh Codex chat and admit the actual process. Never
  kill/rebind host-owned gateways. Report pending live validation/import separately.

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
