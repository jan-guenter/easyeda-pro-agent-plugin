# Ordinary startup and editor-shell observation

Candidate `0.3.0+codex.20261013193500` implements agent-operated ordinary startup on the reviewed EasyEDA
3.2.206 installation. It does not require a closed-profile extension inventory
because it makes no isolation claim. That investigation remains relevant to a
future clean-profile or fully qualified startup workflow, not as a prerequisite
for the ordinary startup the user requested.

## Implemented scope

`easyeda_control_launch` accepts fixed launch, inspect and observe-termination
requests. Launch requires a unique operation ID and explicit acceptance of normal
existing-profile effects. It pins executable, app entry, package, editor selector,
facade and native helper. No caller path, argument, code or profile override is
accepted. Intent is durable before dispatch; an uncertain result consumes the
attempt and blocks another launch. A read-only same-name process check before
intent prevents an already-running application from consuming an attempt. A
process appearing afterward can still cause an ambiguous refusal. Global quarantine and shared runtime ownership
remain active. No legacy design route is admitted.

The helper retains the original root process and Windows Job. Its new read-only
termination observer checks both twice without closing or killing anything.
A durable termination receipt allows another launch. If a facade restart loses
the original handles before that receipt, the unresolved attempt remains blocked.
This is a concrete remaining recovery limitation, not permission to delete records
or substitute a PID-only termination claim.

Ordinary startup may load extensions and project lists, use the network, and write
preferences/cache. Persisted startup configuration and extension code prevent a
guarantee that no project will open or be read. No project is explicitly selected
by this tool. Process launch is separate from bridge authentication and Start Page
observation. See [source research](ordinary-launch-research-2026-10-13.md).

`easyeda_control_editor_shell` observes bounded container/tab counts and registered
Start Page flags through separately pinned UI/API code. Two samples retain owners
and must match. It returns no names, paths, document IDs or raw tab data. Visibility,
restoration completion, project closure, navigation safety and persistence remain
unproved. See [source research](editor-shell-research-2026-10-13.md).

Both tools have offline schemas and argument validation. The restricted catalog
has eight tools; the legacy catalog has33. Seven skills remain. These internal
capabilities do not change the774-method public SDK inventory.

## Evidence and release state

PR14/mainb0cd79a89d2f806d99539278e50ef3af8ed44c62 is already delivered as182500.
Required PR CI38446281459 and main CI38447849023 passed all10jobs. The fresh host
loaded its exact runtime7839d149, source d8b75795, with no implementation drift.
The first status and one follow-up after122 seconds both observed no bridge
upgrade. No connected observer or system execution occurred.

Computer Use initialization failed before Windows inspection because it rejected
the WSL working-directory URI. This does not establish whether EasyEDA is open.
No alternate UI automation, project access, Save, settings change, private bridge
import or replay of the consumed C10 journal occurred.

Local verification passed148 focused/integration tests and424 bridge tests.
Full facade/bridge types and strict type-aware lint are clean. All179 repository/privacy and77 package
checks and seven custom/official skill validators passed. Dependency verification
accepted151 registry signatures and40 attestations; audit found0 vulnerabilities.
Independent reviews found no remaining blocker in this scoped implementation.

Source320 projection is
`9e71a630c6241d33527a91322305769ef38fdc894aa3cfd5ddd733e77348550b`;
runtime3 projection is
`002d61cc1362c5dafc60cac6db0327109b86902eaefb089156a89df3fd78c715`.
Only facade projections and review timestamp changed in the compatibility
manifest. External runtime/bridge pins remain unchanged. The native helper's
deliberate new source pin is recorded separately in its launch/clock profiles.

Publication/install evidence belongs in the release PR receipt. Source/offline tests do
not establish live Windows launch or connected editor-shell validation. A fresh
host is required after official marketplace installation. Do not patch or terminate
the existing host to expose new methods.

## Backlog

1. One focused live launch/authentication/editor-shell check on the installed
   candidate. Do not open a production design or expand the test matrix.
2. Supported ordinary-launch reconciliation after lost helper ownership. Current
   root/Job termination proof cannot be reconstructed across facade restart.
3. Current-version project/context readers and navigation with their actual
   preference and backup effects reviewed.
4. Native structure-job completion and full SQL-effect proof before restoring
   blocked schematic/symbol/PCB lifecycles and eight metadata writers.
5. Remaining SDK families and broader geometric domains where feasible.
6. Bridge Auto-Connect persistence errors currently still announce saved success.
   Fix the message/outcome distinction with a separately built and imported bridge
   generation. This release does not invalidate the existing private bridge.

Publication and installation use the existing Git marketplace and supported CLI.
See [official packaging guidance](https://developers.openai.com/plugins/build/plugins).
Production designs and their project record remain outside this work.
