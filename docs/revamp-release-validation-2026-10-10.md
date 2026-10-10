# October revamp release validation

Final payload snapshot: `0.3.0+codex.20261010124131`. Local verification completed
2026-10-10 on Linux x86_64 with Node24.18.0/npm11.16.0 and core dumps disabled.
Its publication and installation evidence is recorded separately after those
steps actually succeed.

Independent PR review subsequently found three additional hardening issues.
The initial `0.3.0+codex.20261010121000` record below remains historical. The
final snapshot includes all three fixes and the skill-route corrections.

## Final local acceptance

- `npm run verify` passed with inherited hostile descriptors142/145:945 facade
  tests,944 passed,zero failed and the same one platform-specific fixture skip;
  424 bridge tests passed across28 files.
- Both strict TypeScript checks and type-aware lint passed with zero diagnostics.
  All seven skill packaging/link checks, official quick validation, repository
  privacy/licenses, workflow actionlint and the offline doctor passed. Skill
  checks were repeated after the final private-route wording corrections.
- The dependency audit reports zero vulnerabilities;151 registry signatures and
  40 attestations verified. No external compatibility pin or sanitizer changed.
- Final source projection:130 files,
  `f757b640e2a3ae14860a5a4aab13a41ef0b2f70bdff4ced0c3170725bae8a249`.
  Final three-file bundle projection:
  `35250a6d15204d7e53781a5458c0ad59d191e3a0fb0517bb294f4bacace4ba7e`.
- The [independent review follow-up](revamp-final-review-2026-10-10.md) records
  descriptor-handoff, timeout-envelope and upload-barrier fixes and their limits.
  Skill instructions now route private-handler gaps to maintained typed adapters
  or process-bound native dialogs, never ad hoc private/raw execution.

Final-payload GitHub CI and installed-cache proof are still pending at this
record's creation; the initial evidence below does not stand in for them.

## Initial publication and installation evidence

Payload [33c2ba7f98f915a672118a9e0371ebedcf6317f9](https://github.com/jan-guenter/easyeda-pro-agent-plugin/commit/33c2ba7f98f915a672118a9e0371ebedcf6317f9)
was published in [PR8](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/8).
Required [CI run38052366013](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/38052366013)
passed all checks and uploaded the plugin artifact. The official Codex CLI then
configured `https://github.com/jan-guenter/easyeda-pro-agent-plugin.git` as the
Git marketplace and installed/enabled this snapshot from the tested feature
ref. The marketplace should track main after the protected merge. This was the
initial snapshot; the later review fixes change the plugin payload and require
their own build, CI and installation evidence.

Installed verification matched all439 Git files,11135676 bytes and committed
file modes exactly. An isolated installed-bundle MCP probe enumerated25 tools
and seven skills, retrieved749/806 SDK signatures and105/68 strict operation
schemas, accepted valid typed arguments and rejected caller-code fields.
All queries were offline and granted no execution authority. The old loaded
host facade was not terminated or patched; a fresh chat is required for pickup.

## Verified payload

- 25 MCP tools, including offline `easyeda_control_api`.
- Exact parser-derived schemas for 105 design actions and 68 library/lifecycle
  actions. Schema presence is not execution admission.
- Hash-pinned reviewed SDK inventory:93 namespaces,749 declaration signatures,
  697 unique method paths. Latest official reference:99 namespaces,806
  signatures,773 unique paths. Latest declarations are reference-only.
- Seven packaged skills with checked UI metadata and contained Markdown links:
  control, schematic design, PCB layout, component libraries, manufacturing
  release, electronics review and extension development.
- Bounded two-sample project readiness, durable no-repeat Save evidence,
  historical adapter-bound validation records and cooperative checkpoint
  materialization with unchanged record/byte limits and final stability proof.

## Initial local release checks

| Check | Result |
|---|---|
| Clean `npm ci --ignore-scripts` and full dependency tree | Passed |
| Registry signatures and attestations | 151 signatures,40 attestations verified |
| Dependency audit | Zero vulnerabilities |
| Facade and bridge strict TypeScript | Passed |
| Type-aware Oxlint, all six categories at error | Zero diagnostics |
| `npm run verify` with inherited hostile descriptors142/145 | Passed |
| Facade tests | 930 total:929 passed,0 failed,1 platform-specific skip |
| Bridge tests | 424 passed across28 files |
| Reproducible build and compatibility check | Passed |
| Repository/license/privacy/scaffold validation | Passed |
| Mandatory all-skill packaging/link checks | All seven passed |
| Official skill-creator quick validator | All seven passed |
| GitHub workflow actionlint | Passed |
| Offline workstation doctor and actual MCP tool catalog | Passed;25 tools |
| Staged whitespace and design-artifact checks | Passed |

The single skip concerns Windows mounted-drive path equivalence when the
synthetic project fixture is on a Linux temporary filesystem. It is not a
skipped mutation or persistence test. A procfs open/read exit race discovered
in the first combined run was repaired in the test helper:ESRCH and ENOENT mean
process disappearance; unrelated errors still propagate and PID/start-time
and parent-death assertions remain intact. The deterministic race regression
and all eight sanitizer tests pass.

The source projection has130 files and SHA-256
`82eff87bb74e331e2034bea822dd5f06b87d970f62302f70d0fe57640d4b131b`.
The three-file bundle projection is
`5164f012e0c43df8dcc3420fcd7eac583ce265684c8917489dd17040b65a796f`.
Only facade projections and review time were refreshed. External application,
public API, native implementation, upstream and dispatcher pins remain unchanged.
The native descriptor sanitizer remains1440 bytes,mode0755,SHA-256
`a8b52e8439bdb479a5621052ab03e9030d67b7948c6e2cc448ee5d7bb1dc9b41`.

## Private bridge build consequence

Updating only the vendored Vitest pin changed the reviewed source closure to
70 files/853680 bytes/`c5cb4d9ed0d5a93bca655f4f846f4f2e9337633941b2df3482aa3b91d7e43ee5`.
The supported private builder was run after preserving the previous fixed
receipt. It published new source-provenance evidence using the existing
credential, without rewriting old immutable generation receipts. The selected
extension archive remained byte-identical. No credential rotation, native
import or connected validation was performed. Local receipt/build agreement
passed the offline doctor; it is not proof of current EasyEDA loading.

## Limits

No user project was opened or edited, and no CAD Save was dispatched. New
synthetic tests are not new live writer validation. Historical wire evidence
applies only to its exact recorded adapters and external profile, not the
current facade generation or sibling operations. Generic PCB/rules/stack
transactions still stop after a consumed Save when no maintained retained
completion proof exists. Large individual JSON parsing, sorting and canonical
hashing remain synchronous; cooperative batches do not promise universal
heartbeat latency. The new package requires a fresh Codex chat to replace a
previously loaded host-owned facade; no host process was killed or hot-patched.

See the [reliability review](revamp-reliability-review-2026-10-10.md),
[extension research](easyeda-extension-interface-research-2026-10-10.md),
[electronics research](electronics-design-research-2026-10-10.md) and
[skill behavior checks](skill-behavior-validation-2026-10-10.md) for scoped
evidence and remaining adapters.
