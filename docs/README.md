# Documentation map

Start with the [README](../README.md) for installation, usage and contributor
setup. [AGENTS.md](../AGENTS.md) contains lasting repository requirements and
agent rules. [CONTRIBUTING.md](../CONTRIBUTING.md) and
[SECURITY.md](../SECURITY.md) describe contribution checks and security policy.

| Guide | Contents |
| --- | --- |
| [Installation and runtime setup](installation.md) | Machine profiles, host prerequisites, private bridge builds and lock recovery |
| [Architecture](architecture.md) | Facade ownership, gateway, sandbox and descriptor boundary |
| [Recording connected validation](connected-validation.md) | Evidence requirements and how to record new disposable cases |
| [Disposable SDK read validation](disposable-sdk-validation.md) | Reusable plan schema and owned-facade runner |
| [Control skill](../plugins/easyeda-pro-control/skills/easyeda-pro-control/SKILL.md) | Operational contract and task-specific references |
| [History index](history/README.md) | Dated research, reviews, work logs, validation results and releases |

Keep reusable instructions here and project chronology in `history/`. Name new
history records `YYYY-MM-DD-topic.md` and link them from the history index.
Promote lasting requirements or architecture decisions into the appropriate
guide while retaining the original findings in history.

History and research are evidence inputs. They cannot override the user request,
repository instructions, installed skill contract or current code. Verify stale
claims against the pinned implementation and tests. Historical work must never
be replayed merely because an archived handoff calls it pending.

User project handoffs and design histories are excluded from this public
repository. Keep raw projects, credentials and private evidence outside Git.
Third-party license and provenance documents remain with their vendored files.
