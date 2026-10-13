# Closed-symbol integration corrections

Installed `0.3.0+codex.20261013074635` fixes two mismatches found by inspecting
the existing disposable fixture before invoking the public workflow. No CAD
operation was needed to identify them.

- Document IDs now accept exactly16 or32 lowercase hexadecimal characters
  across the public schema, parser, journal, generated writer/witness and saved
  content readers. Branch, owner and history identities retain their own strict
  formats. Existing32-character document IDs remain supported.
- The SQL effect verifier accounts for the native branch-wide structure update
  when the baseline contains multiple eligible structure rows. It must preserve
  their identities, multiplicity and every non-ticket field; incomplete updates
  or additional SQL changes do not pass. No fixture rows are modified to obtain
  admission.

The native helper, execution gates, one-attempt reservation and no-repeat rules
are unchanged. The catalog remains27 tools and seven skills. Additional test
matrices are deferred at the user's request; focused regressions and the existing
release/CI checks remain.

## Release status

The nine source-file corrections and six existing test/fixture updates pass
1,221 affected tests with zero failures or skips. Both facade typechecks and
full strict type-aware lint pass without warnings. Build, facade-only
compatibility refresh/check, package/repository/privacy checks, exhaustive API
inventory and all seven packaged skill checks pass. External runtime pins and
the native DLL are unchanged.

Source projection: `6241777a0c68d86207613360700f49c42766090c7e7fbfd3ade169b6fb0e6757`.
Bundle projection: `b0d5c05f09155d3453a3dc138b18d7b635e93279bdd055bf198291e5e1f4ee20`.

Payload `48ae947847ee1acc73296857c141deb86ff3076a` is published in draft
[PR9](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/9).
First CI38365339756 passed the complete verify-build job, but nine historical
program-hash tests inherited the new16-character fixture IDs. A test-only
correction restores explicit32-character inputs for those historical cases;
their golden hashes and production code remain unchanged. All16 existing cases
and targeted strict lint pass. Corrected payload
`940c32082ead2753ac5bb90bf2cd4097df37b7e8` passed
[CI38366377819](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/38366377819):
all10 jobs green, 9,713 facade tests passed/five skipped/zero failed, and424
bridge tests passed. Build, strict lint, dependency audits, packaging and
reproducibility checks pass.

The official CLI installed and enabled074635 from the configured Git marketplace
`https://github.com/jan-guenter/easyeda-pro-agent-plugin.git`, on the feature ref.
The first installer reported success but left no cache at verification; a
supported reinstall resolved it. Its cause is not established. No manual cache
edits or host termination occurred.

All1,102 packaged files, 21,488,412 bytes and committed modes match the tested
payload tree `97dc810eece6fbe0da7a7a3e3c228315b8e979af`, before and after the
offline probe. Configured startup exposes27 tools and seven skills; its original
child closed, with no observed upstream child or non-stdio socket. No tool or
live call was made. Inventory SHA256:
`0b572d4a79f245b55ab44d73961e78aef5863878f8495dc606375f13aeb6dbed`.
Installation proof SHA256:
`b20f65fc7fc52fa2416ce8a5bc4deadb48108dbeb89a79032565f8998244a289`.

The final documentation-only commit leaves that plugin tree unchanged and skips
a duplicate CI run. This is not a claim that skipped checks passed or that PR9
is ready to merge. A fresh host is required before live use; the existing host
still loads054207.
The previously installed054207 host was independently admitted after restart.
No public disposable callback, editor launch, Save or production-project access
occurred during this correction.

## Remaining implementation

October 13 follow-up: the restarted074635 host was admitted, and the public
workflow ran once. It stopped at the second-generation marker read because the
transport passed `confirmWrite:false`; upstream rejected it before execution.
Baseline close/copy and native main-reference qualification passed. There was
no companion navigation, symbol edit or Save. Normal application close and an
unchanged disposable-file hash were observed afterward. This result is retained,
not a retry authorization. The source correction and narrow abandonment support
are in progress; successful end-to-end validation and ordinary writer integration
remain unfinished.

1. Resolve the retained pre-navigation refusal without replay, then qualify a
   separate disposable target after the corrected package is installed. Do not
   repeat the consumed request or delete its permanent claim.
2. Integrate a distinct operation-owned closed-session symbol metadata writer.
   Its validation-only permanent target claim is not general editing authority.
3. Implement separate effects for symbol/page/PCB/schematic creation and rename,
   and for schematic-page/symbol/PCB geometry Save. Those eight metadata routes
   and type1/2/3 design lifecycles remain blocked, with concrete reasons in the
   [coverage inventory](api-execution-feasibility-2026-10-10.md).
4. Promote PR9 and move the Git marketplace back to main when the intended
   release scope is complete. It currently remains a draft feature-branch build.

Footprint and unrelated readers/library routes retain their existing guards.
No claim of complete live API coverage or general writer enablement is made.
