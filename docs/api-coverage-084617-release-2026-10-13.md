# Fixed probe transport and pre-navigation abandonment

Candidate `0.3.0+codex.20261013084617` corrects the integration failure found by
the first public closed-symbol disposable run on074635. The bridge rejected its
marker read before execution because `confirmWrite` was false. The same mistake
also affected the later witness and saved-content probes. All three now supply
the transport confirmation required by `easyeda_execute`; their fixed programs,
read-only scope and native guards are unchanged.

The stopped case is retained as
[C08](api-connected-validation-ledger.md#2026-10-13-c08-closed-symbol-validation-stopped-before-navigation).
No project navigation, symbol edit or Save occurred. Native normal close and an
unchanged disposable database were observed afterward. This is not successful
end-to-end validation, and the original request must not be repeated.

## Narrow recovery

`easyeda_control_recover_incomplete` gains resolution
`abandoned-before-navigation`, with the original operation ID and matching
`<operationId>:abandoned-before-navigation` confirmation. It accepts only the
exact16-event validation prefix ending in the fixed marker read's pre-handler
`ERR_CONFIRM_WRITE_REQUIRED` refusal. Other failures remain unsupported.

Publication verifies the entire retained prefix, permanent claim, original
closed SQL baseline and unchanged complete current database. An exclusive
sidecar records abandonment while preserving the original journal, every phase
artifact, startup marker and permanent target claim. Historical admission
rechecks that evidence without reopening the current project. Invalid evidence
remains blocking. No application call, replay, completion, process-termination
proof or restored execution authority is granted.

## Verification and release

The transport correction passes106 affected existing cases; the historical
admission integration passes75 existing cases. Five focused recovery cases cover
publication and evidence preservation, historical inspection, wrong refusal,
later navigation, changed database and tampered phase evidence. No new broad
test matrix or private harness was added.

All50 existing preconnection recovery tests pass. Both typechecks, full strict
type-aware lint (zero warnings), build, compatibility, coverage, all seven skill,
package and repository/privacy checks pass. Source298 projection is
`264de3df415805d60666c4d986dd7525dba722d645dd5073b3e8b2ca5f508a7f`;
bundle projection is
`70725d78d67a28c70a27b6bc7e045b0c8009f69b9cc0dac0c3e0376c763cf4f6`.
External pins and the native DLL are unchanged.

Payload `c2412d6244a1727c226edaba74022ef555edf473` is published on the feature
branch. CI38373488073 passes verify-build, including strict lint, audits and
reproducibility. Its first attempt's shard7 hit the existing15-second deadline
in the unchanged managed-double PowerShell hover test, with no stdout/stderr
or assertion failure. The two hover tests pass locally unchanged in5.25 seconds.
No timeout, assertion or production guard was relaxed. Attempt2 reran only the
failed shard and aggregate gate: the hover test passed in2.04 seconds and all10
jobs are green. The final suite totals9,719 facade passes/five skips/zero failures
and424 bridge passes. See [CI38373488073](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/38373488073).
The official CLI refreshed the Git marketplace
`https://github.com/jan-guenter/easyeda-pro-agent-plugin.git` on the feature ref.
Its install command returned a cache-backup permission error. Subsequent CLI
discovery reports084617 installed and enabled, and complete installed verification
passes. No manual cache editing, reinstall or owner termination occurred; the old
074635 cache remains. The installer error is retained, not reported as success.

All1,104 files,21,542,797 bytes and committed modes match tested plugin tree
`091958adfbd841393c692e7161e779d5f0a186db`, with no extras or probe-time changes.
Inventory SHA256 is
`4b21754f5ae658ba447592ca03af520604bf3cf8218e880d2e46bfd9e00bc061`;
installation proof SHA256 is
`1b9eae063d793a7183b373a587098365bdb97a27316c42c5c841d6f7c176e5c2`.
Configured offline startup hands ambientNode26 to pinnedNode24, lists27 tools
and seven skills, and closes its original child. No upstream child or non-stdio
socket was observed; no tool, native helper, gateway or live call was invoked.

The currently loaded host still uses074635. Start a fresh host before the public
abandonment action. No real abandonment has occurred. Do not use source changes
to bypass that host or rewrite its retained journal. Final root-only release
documentation does not change the tested plugin tree and skips duplicate CI;
it does not represent skipped checks as passed.

## Remaining scope

The catalog remains27 tools and seven skills. Eight metadata writers and
schematic-page, symbol and PCB design transactions remain blocked. Ordinary
operation-owned symbol writing, the other exact lifecycle effects and successful
end-to-end validation are unfinished implementation, not merely deferred tests.
See the [coverage report](api-execution-feasibility-2026-10-10.md) for the full
inventory and the distinction between known native defects and missing adapters.

Read-only inspection found no other eligible ordinary symbol in the three
existing disposable fixtures under this workflow's current strict source
profile. Do not weaken that profile, reuse the consumed target claim or treat
frame/ground symbols as ordinary symbols. A new suitable disposable fixture
is needed before another validation intent.

PR9 remains a draft feature-branch release. Promotion to main remains pending;
this correction does not claim the original complete-API implementation task
finished. Production designs and their engineering records remain untouched.
