# Cooperative session retirement and cache startup batch

Source batch based on main `bd357765a3801afa3642014775b2af3afe9a3a58`,
prepared as `0.3.0+codex.20261104084035`. It combines the supported update
handoff with the [cache startup interval correction](2026-11-04-held-cache-startup-wait.md),
the [installed193000 native clock result](2026-11-04-native-clock-validation-and-subagent-loading.md)
and the [remaining reader investigation](2026-11-04-cbb-and-pcb-hit-reader-feasibility.md).

## Supported handoff

The new `easyeda_control_session` tool offers local `inspect` and explicitly
confirmed `retire`. All normal tool callbacks, including offline managed-file
and SQL work, enter one synchronous admission counter before asynchronous work.
Calls already waiting in the bridge gate therefore block retirement. Reserving
retirement blocks arriving work before fresh journal checks begin.

Preflight rejects unfinished or unreadable design, ordinary-launch and native
diagnostic journals. It also rejects retained runtime/project/writer owners,
diagnostic reservations and cache/head-age allocations. A preflight refusal
restores admission so the original workflow can perform its own cleanup.
The tool never performs native cleanup, termination, Save/Discard or takeover.

After preflight, the original facade permanently closes live admission, closes
its own upstream and authenticated gateway, and releases its original lease.
The MCP connection remains available for session state and synchronous
source/reference API queries. Managed preparation and SQL analysis refuse.
An authority-close failure prevents lease release. A lease-release error can
leave lock state uncertain; the separate acknowledgement field does not claim
otherwise. Cleanup failure consumes retirement and does not reopen admission.

The supported native handoff scope is currently diagnostic owners after full
release and ordinary launch after its existing `release-closed`, as well as
connections that allocated no native owner. Project-opening and metadata-writer
coordinators can remain allocated after their internal final closure. Their
index-level disposal remains separate work and retirement refuses them.

Offline `session` and `session-validate` API actions expose and validate the
exact local grammar without acquiring authority. Agent rules and the two
operating skills now describe retirement before spawning a user-requested
fresh-context subagent. That replacement must prove its actual loaded package
and process admission. A connection already in ownership-conflict mode never
retries. Older installed snapshots lack retirement and cannot use it merely
because their skills refreshed.

## Verification

Independent source review found an initial exemption of all API callbacks from
quiescence. Two API actions can prepare managed files or spawn a SQL reader.
They now participate in the counter and refuse after retirement. Review also
identified the distinction between acknowledged lease release and lock presence
after a release error; the output and error now preserve that distinction.
The retained original refusals and review evidence remain private.

A real isolated source-MCP test retired its original facade, observed offline
reference availability and live refusal, then started a distinct facade that
acquired the same isolated control root. This establishes process handoff under
the test profile. It does not prove automatic plugin refresh by Codex, connected
EasyEDA cleanup or a native writer lifecycle.

The final combined focused run passed all 38 selected tests with no failures or
skips, using Node24.18.0, npm11.16.0, core limit zero and the maintained isolation
preload. These cover retirement races, unreadable journals, native blockers,
actual isolated MCP handoff, ownership conflict and V3 cache readiness. A bounded
validation diagnostic regression also prevents unrecognized argument lists from
producing unbounded output. Earlier focused implementation checks are retained
separately rather than added to this final count.

Mandatory local non-suite phases passed: clean dependency installation and
signature/security audits, strict types, zero-warning type-aware lint, bridge
types/lint, generated/native checks, coverage, build, compatibility and
repository/MCP/all-skill validation. Both emitted bundles reproduced exactly.
All seven packaged skills passed the installed skill-creator validator.
Compatibility changes are confined to facade source/bundle projections and
review time; external pins and native helper identities are unchanged.

The configured tool roster is 53, with 28 tools in the calculation-only probe
and 17 in the current209 utility mode. Offline-only remains three and
ownership-conflict remains one. The configured offline probe retains its
54-query/56-request roster. These numbers do not measure SDK method parity.

Exact-payload GitHub CI, CodeRabbit review, protected merge, Git marketplace
installation and admission of the installed batch are subsequent release
stages. No connected V3 cache run or new native writer was performed by this
source batch. The wider structure-completion, export and reader backlog remains
open, along with project/writer coordinator disposal for session handoff.
