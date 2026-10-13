# Closed-symbol integration corrections

Candidate `0.3.0+codex.20261013074635` fixes two mismatches found by inspecting
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

GitHub CI, publication and official Git-marketplace installation are pending.
The previously installed054207 host was independently admitted after restart.
No public disposable callback, editor launch, Save or production-project access
occurred during this correction.

## Remaining implementation

1. Run the public closed-symbol disposable workflow once from a fresh host and
   inspect its retained result. Do not repeat a stopped request.
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
