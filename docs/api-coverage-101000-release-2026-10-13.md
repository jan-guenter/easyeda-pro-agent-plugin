# Ordinary symbol entry and tooltip-aware lifecycle selection

Candidate `0.3.0+codex.20261013101000` adds the ordinary operation-owned symbol
metadata entry and fixes the next integration failure found in disposable use.
It does not yet enable that writer: successful full-lifecycle validation is
still missing. The source catalog is28 tools and seven skills.

## Implementation

`easyeda_control_symbol_metadata` accepts a unique caller operation ID, exact
project/branch/owner/path/symbol/companion-PCB identities, both desired name and
description, and explicit write confirmation. It shares the existing fixed
closed-session coordinator and terminal checks. Its durable reservation is keyed
by caller ID, separately from disposable validation's permanent target claim.
The index shares one mutually exclusive fresh-runtime reservation across both
entry points, outside the ordinary authenticated library wrapper.

The new entry currently refuses before imports, runtime allocation or bridge
admission. The old `library.symbol.modify` path and every other metadata or
geometry restriction remain unchanged. This is implemented-but-disabled source,
not available editing support or validated recovery after a write.

The window selector now matches the native normal-close contract instead of
treating Windows' MainWindowHandle as authoritative. It requires one root-owned,
non-minimized Chrome application window with a nonblank bounded title and sane
bounds; multiple eligible windows still refuse. The native helper retains its
final process, ancestry, visibility, enabled-state, tool-window and title checks.
Coordinator and historical terminal replay share the selector. The bounded raw
window observation is retained before selection, including on ambiguity.

## Retained live results and recovery

[C08 recovery](api-connected-validation-ledger.md#c08-recovery-on-restarted084617)
completed through the public API on084617 without changing its original journal,
phases, permanent target claim or disposable file.

[C09](api-connected-validation-ledger.md#2026-10-13-c09-closed-symbol-validation-stopped-after-startup-marker)
used a genuinely new native-created project and ordinary resistor symbol. Its
baseline launch, admission and marker creation succeeded; the workflow stopped
before project navigation when a tooltip made window selection ambiguous.
The application subsequently closed normally and the fixture stayed byte-identical.
No symbol edit or Save occurred in that validation call. No successful lifecycle
or retained Job termination is claimed.

A separate six-event abandonment profile verifies the successful fixed startup
result and exact original claim/phase artifacts. It cannot classify an active
same-host invocation. It preserves the marker, claim and journal and makes no
application call, replay grant, process-closure claim or source-invariance claim.
The sixteen-event transport-refusal recovery is unchanged. The new profile has
not yet been run against C09; it requires the updated official host.

## Verification and delivery

Ordinary-entry integration:78 focused tests pass. Tooltip selection and lifecycle
replay:64 affected cases pass, followed by29 focused cases after moving diagnostic
publication before selection. These are overlapping sets, not cumulative totals.
Types and targeted strict lint pass for those changes. The seven-skill package's
API reference now matches the generated inventory rather than stale counts.

The recovery integration passes126 focused cases. The final packaged startup and
tool-contract run passes six cases, including28 unique tools. Full facade and
bridge typechecks, strict type-aware lint with zero warnings, build, compatibility,
API inventory, package, repository/privacy and all seven official skill checks
pass. These local runs cover overlapping focused suites; they are not a new full
suite result. The existing full GitHub CI remains the release gate.

The frozen implementation projection covers304 source files at
`8c602d0cdb01b653a3fec5f6bca2d0de1bb5ba60e4b65a79c30d47324ab11de9` and
three runtime files at
`f3b5e01bc6138887a33865fab76394cf6f3dd4e1c42aff0c6527018aaebff815`.
External compatibility pins and the native helper DLL are unchanged.
GitHub CI, publication and installed verification are pending. No new broad
test matrix or private harness is added.

## Remaining scope

Finish the one disposable closed-symbol lifecycle, then deliberately enable the
ordinary entry with its exact validated limits. The other seven metadata effects
and schematic-page/symbol/PCB geometry lifecycles still need their own native
completion and complete SQL-effect models. General reader/export/library omissions
remain itemized in [the feasibility inventory](api-execution-feasibility-2026-10-10.md).
These are implementation limits, not merely deferred tests or claimed native
impossibilities. PR9 remains draft; this incremental update does not complete the
entire API-coverage request. Production designs remain untouched.
