# Extension-index observation and startup backlog

Candidate `0.3.0+codex.20261013182500` adds one fixed read-only tool,
`easyeda_control_extensions`, plus offline `extensions` and
`extensions-validate` actions. It observes selected metadata from the already
initialized user-extension database. API and UI bytes have separate exact pins.
The [source research](2026-10-13-bootstrap-implementation-research.md) records
the invoked closure, side effects and unresolved startup paths.

## Scope

The sole request is `{"action":"list-startup-index"}`. Two observations retain
frame, UI actor and RPC ownership. The projection preserves row order, raw entry,
optional activation events and actual enable/update/sync booleans. It returns no
file content, user configuration, credentials or account identifiers. Bounds are
128 rows and 65536 UTF-8 bytes, with fixed outward errors and no truncation.
The vendor cursor's internal traversal remains unbounded by this projection;
the observer deadline does not cancel it. Vendor errors can log diagnostics.

UI actor stability does not prove that the API's asynchronously switched
database belongs to that account. Both `databaseActorBound:false` and
`startupQualified:false` are required. Builtin manifests, current code and queued
activation are excluded. No enable, import, update, launch, project navigation,
Save, settings or recovery action was added.

Restricted configurations register six tools; legacy configurations register31.
Seven skills remain, with the new observer's limits in the control reference.
Public SDK coverage remains774 methods:211 public subsets,30 native equivalents,
82 blocked and451 omitted; routes308 guarded,94 blocked/two partial. This internal
diagnostic is not a newly covered public SDK method.

## Restart and validation evidence

Previous170000 delivery is complete through PR13/main411f7c5. Required PR
CI38436512407 and mainCI38438396435 passed all10jobs, with9768 facade passes,
five platform skips and424 bridge passes. Exact installed1130files/21991609bytes
and modes were reverified. The restarted actual facade89224 loads that package,
with no implementation drift. Status saw no authenticated bridge and zero
observed upgrades. Offline system schema/argument checks passed; no system
execution occurred. Do not repeat completed publication or installation.

Computer Use initialization failed before any Windows action because its
adapter rejected this chat's WSL working directory as a local file URI. No app
launch, window inspection, screenshot or click occurred. This does not prove
whether EasyEDA is currently open. No alternate UI-control path was used.

Local verification passes53 focused/integration cases and424 bridge cases,
facade/bridge types and strict lint with zero warnings. All179 repository/privacy
checks,77 package checks and seven custom/official skill validators pass.
All151 registry signatures and40 attestations verify; audit found0vulnerabilities.
Only facade projections and the review timestamp changed in the compatibility
manifest; external pins remain equal to the previous release. Source317 is
`d8b75795c9dd681d45ad64f1275e8ea012e62f4cc67f615ac1d49dbda967b112`;
runtime3 is `7839d1492ca34257d7323b6272431b3bb2e32d832ad8aec1d85609edec0d9487`.

The candidate has five focused observer tests and four coordinator tests. The
coordinator's positive UI hashes are explicitly synthetic, not live admission.
Independent source review found no blocking issue. Final build/CI/install
evidence belongs in the release PR receipt. Neither this observer nor170000's
system methods has a recorded connected validation in this session.

## Remaining work

1. Agent-operated startup on3.2.206. Establish a closed-profile binding for the
   extension index and code, resolve the dynamic builtin manifest producer and
   capture startup policy. The apparent private/list path is BroadcastChannel
   RPC, not HTTP. No supported clean-profile switch was found in this build.
   Add one-shot launch ownership, retained intent/result and separate launch,
   authentication and Start Page observations. Do not expose the old launcher.
2. One connected system check and one extension-index observation after fresh
   host admission and bridge connection. Do not expand the live test matrix.
3. Current-version UI/project-manager review for context, frontend units and
   metadata readers.
4. Native structure-job completion and full SQL-effect proof before restoring
   blocked schematic/symbol/PCB lifecycles and eight metadata writers.
5. Remaining SDK families and broader clipping domains where feasible.

Production designs and their project records remain untouched. The existing private profile,
credentials and consumed C10 journal are not modified by this work. Installation
uses the existing Git marketplace through the supported CLI, following
[official packaging guidance](https://developers.openai.com/plugins/build/plugins).
A fresh host is required after installation; never patch or terminate the loaded
owner to expose the new tool.
