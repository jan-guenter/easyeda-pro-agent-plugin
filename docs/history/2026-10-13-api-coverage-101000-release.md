# Ordinary symbol entry and tooltip-aware lifecycle selection

Installed `0.3.0+codex.20261013101000` adds the ordinary operation-owned symbol
metadata entry and fixes the next integration failure found in disposable use.
It does not yet enable that writer: successful full-lifecycle validation is
still missing. The new disposable validation stopped before project navigation.
The source catalog is28 tools and seven skills.

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

[C08 recovery](2026-10-11-through-2026-10-19-api-connected-validation-ledger.md#c08-recovery-on-restarted084617)
completed through the public API on084617 without changing its original journal,
phases, permanent target claim or disposable file.

[C09](2026-10-11-through-2026-10-19-api-connected-validation-ledger.md#2026-10-13-c09-closed-symbol-validation-stopped-after-startup-marker)
used a genuinely new native-created project and ordinary resistor symbol. Its
baseline launch, admission and marker creation succeeded; the workflow stopped
before project navigation. Native observation showed a tooltip and the application
window, a pair that source inspection confirms the old selector would reject.
The public result did not expose the original exception, so this diagnosis is
correlated observation and source evidence rather than a retained exception.
The application subsequently closed normally and the fixture stayed byte-identical.
No symbol edit or Save occurred in that validation call. No successful lifecycle
or retained Job termination is claimed.

A separate six-event abandonment profile verifies the successful fixed startup
result and exact original claim/phase artifacts. It cannot classify an active
same-host invocation. It preserves the marker, claim and journal and makes no
application call, replay grant, process-closure claim or source-invariance claim.
The sixteen-event transport-refusal recovery is unchanged. C09 abandonment has
now completed through the public recovery route on the admitted101000 host,
with its retained proof and original evidence preserved. This records historical
abandonment, not successful validation or permission to retry the consumed target.

A genuinely new native-created disposable project ran through the public
validation route once, operation `easyeda-20261013t111537z-e7df16d2`.
Its closed-file preflight matched the complete84-entry schema and decoded all
12 documents from three linear history rows and four chunks, without snapshots.
The ordinary resistor symbol and separate META-only PCB companion passed the
existing read-only preparation checks. The public result stopped in the
coordinator at sequence16 after a successful edit-marker read. No navigation
intent, symbol mutation or Save was recorded. The application was observed on
Start Page, then closed normally once without a Save/Discard choice; subsequent
native discovery was empty. The434,176-byte fixture remained byte-identical at
SHA256 `4ad992b9fd1448e07aa3395053397e970e3eb8007c4f35bb0d3be21ca5d0e0f7`.
No full-lifecycle completion or recovery is claimed. Preserve the stopped
operation and its consumed claim; do not repeat the request.

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
Payload `306871c5ee5867b94976e996d6633f7fc18641ae` is published on
`feature/api-execution-coverage`. Its package tree is
`24a5bfc9589e4a9b7cfcc8dcb041e6b2885158a2`, with1,112 tracked files.
[CI38382522749](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/38382522749)
passed on attempt1:9,726 facade tests passed, five skipped and zero failed;
424 bridge tests passed. All ten jobs are green, including the final combined
gate, dependency audits, strict lint, reproducible builds and packaging.
Official marketplace refresh succeeds and resolves the exact published payload.
The add command reports a cache-backup permission error; subsequent CLI discovery
reports101000 installed and enabled. Independent cache/startup verification passes
once despite that error: all1,112 files/21,663,074 bytes and committed modes match
the tested tree before and after startup, without extra files or identity changes.
No manual cache edits, owner termination or reinstall were needed.

Configured ambient Node26.7.0 hands off to pinned Node24.18.0. The offline catalog
contains28 tools and seven skills; the original child closes without cleanup
errors. Process snapshots and the synthetic upstream sentinel show no upstream
child or non-stdio socket. No tool, native helper, gateway or live call ran.
This is package/startup verification, not continuous syscall tracing or live
admission. Inventory SHA256 is
`7855650d3f07efa7b007d8354cf36b858b95415ade71871f603ad7c211049fc9`;
installed proof SHA256 is
`412a7b959098ccd0f6ee5d2d5af338135ac1823cc5f37a88d55a1febe17848bc`.
After the Codex restart, the actual official facade PID4147270 was admitted
against the exact installed101000 payload. Its pinned Node executable, parent,
cache working directory and lease ownership matched; the old PID4122421 was
absent. The complete1,112-file package, source/bundle projections and modes
matched the published tree and retained installed proof. This is process and
filesystem admission, not memory attestation or a successful writer lifecycle.
C09 public abandonment then completed; the new disposable validation above
subsequently stopped before navigation.

Final root-only documentation leaves the tested package tree unchanged and skips
duplicate CI. That does not turn a skipped check into a passing check.
No new broad test matrix or private harness is added.

## Remaining scope

Diagnose the stopped sequence16 case and retain its evidence without replay.
Successful disposable full-lifecycle validation is still required before
deliberately enabling the ordinary entry with its exact limits and adding its separate
execution route to the coverage inventory. The old library executor stays blocked.
The other seven metadata effects and schematic-page/symbol/PCB geometry lifecycles
still need their own native completion and complete SQL-effect models. General
reader/export/library omissions remain itemized in
[the feasibility inventory](2026-10-10-api-execution-feasibility.md).
These are implementation limits, not merely deferred tests or claimed native
impossibilities.

Expanded test matrices and additional fixture variants can follow this delivery;
they do not replace those missing adapters. Any enabled change still needs its
focused regression checks and the existing release CI. Final delivery also needs
PR9/main promotion and official marketplace installation of the frozen final
payload. PR9 remains draft; this incremental update does not complete the entire
API-coverage request. Production designs remain untouched.
