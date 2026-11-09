# PR196 review corrections

CodeRabbit [review5818078362](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/196#pullrequestreview-5818078362)
completed at `2026-11-08T13:32:50Z` with state `COMMENTED` for review-only head
`0f3ad5e925161e9d4e85e61055598b76255a797b`. It reported four actionable comments
and one nit. Its 45 selected paths and two filtered `dist` paths describe that
review scope, not later source or generated-bundle acceptance.
This correction leaf starts from `fd81756a9fc6354c468da3f61af63b8d848d5096`.

The [origin-link comment](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/196#discussion_r4506392054)
is addressed by linking the cold-util correction to the retained main-import
capture diagnostic. The
[historical refusal comment](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/196#discussion_r4506392060)
and [skill-reference comment](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/196#discussion_r4506392069)
are addressed by limiting the claim to the observed side-effect refusal. A
refusal can stop at one lazy export while another is already initialized.
No independent per-export cold-state proof is newly claimed and no probe was
replayed. Earlier observations remain in their original records, with a dated
scope correction.

The helper nit is addressed by checking that both inert counter replacement
targets occur exactly once before either replacement. Missing or duplicated
initialization or callback text throws `INERT_DELETE_PREFIX_FIXTURE_DRIFT`.
A builtin-only VM case observes zero before the inert callback and one after
its actual execution; drift cases refuse before source execution. This changes
only test-fixture instrumentation, with no native-owner or runtime authority.

The [compatibility fingerprint comment](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/196#discussion_r4506392063)
is valid and remains explicitly deferred to the integrating final freeze.
The review reported 2,275 manifest entries against 2,298 top-level source files
and 25 stale listed sizes/hashes for its complete target; those are historical
review-target counts, not this leaf's inventory. This source-only correction
does not refresh `reviewed-compatibility.json`, bundles or release pins. After
all source leaves are integrated and the final source/bundles/pins are frozen,
the integrating controller must build the target, refresh only allowed facade
source/bundle projections with `compatibility:update`, then require
`compatibility:check` on that exact payload. External upstream/EasyEDA/bridge
and installed-bundle pins require their own evidence. This item is not marked
complete by this leaf and no green compatibility claim is made.

Pinned Node24.18.0, npm11.16.0 and soft core limit zero were used. The three
focused test files passed all six cases with zero failures or skips after
configuring the existing static installed-source root. The initial unconfigured
pass had four passes and two explicit installed-source skips; it did not prove
those skipped Inspector paths. Both TypeScript configurations and strict
changed-file type-aware lint passed with zero warnings. Repository,
MCP-contract, all-skill and seven skill-creator quick validators passed.
No complete suites, C# compiler, Windows/app/native-owner action, publication or
CodeRabbit contact was performed. The current compatibility gate and connected
validation remain separate.

Review-scope correction, 2026-11-08: the original review also reports five
selected files whose changes were unavailable and could not be fully reviewed:

- `plugins/easyeda-pro-control/scripts/footprint-inverse-native.cs`
- `plugins/easyeda-pro-control/scripts/pcb-diagnostic-owner.ps1`
- `plugins/easyeda-pro-control/scripts/schematic-saved-readback-native.ps1`
- `plugins/easyeda-pro-control/scripts/schematic-edit-native.ps1`
- `plugins/easyeda-pro-control/scripts/footprint-inverse-native.ps1`

The 45 selected paths therefore do not establish complete review coverage. This
limit is separate from the two filtered `dist` paths and remains part of the
original review evidence; it does not negate the separately scoped checks above.
