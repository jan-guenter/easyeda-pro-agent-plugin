# Disposable validation and metadata hardening

Candidate: `0.3.0+codex.20261010172121` on `feature/api-execution-coverage`.

This continuation supersedes the foreground blocker in the earlier candidate
record. It does not establish complete API coverage or connected writer support.

## Connected evidence on installed candidate 144459

The user restored the visible RDP client. Process-bound focus and screenshot
capture then succeeded. The screenshot showed only Start Page. A normal close
and empty native process discovery preceded a retained-job launch. The new
instance authenticated against the installed facade and reviewed EasyEDA tuple.
No process was force-terminated, input guard changed or gateway replaced.

Only an existing disposable validation project was opened. The opening journal
completed with all 16 saved documents and the complete logical SQLite database
unchanged. Two fixed public SDK requests returned stable double samples:

- `eda.pcb_Layer.getAllLayers()`: 262 observed layer entries.
- `eda.pcb_Layer.getTheNumberOfCopperLayers()`: 4.

The exact complete PCB source was identical before, between and after these
reads. All six retained read/source artifact receipts passed the maintained
receipt verifier. The final connected checkpoint verification retained the
original file and logical database hashes. This proves these exact public
observations on this fixture, not every overload or engineering correctness of
every returned field. The observations were made on 144459, not on the newer
172121 candidate described below.

An initial checkpoint verification request used a receipt outside the live
facade's authorized checkpoint roots and refused. The existing project-open
checkpoint was subsequently verified through the facade. No root allowlist was
changed. This manually orchestrated sequence is not a completed run of the
disposable validation runner.

Opening the existing project footprint also completed without Save. Its exact
type-4 editor context contains the observed library-owner UUID, distinct from
the project collection UUID. Its native exported DOCHEAD is `PCB`, confirming
the format handled by the corrected runner; the source/header was not rewritten.

One subsequent already-open PCB activation returned an unclassified upstream
failure. The original footprint remained active. The retained journal was
reconciled as no mutation, with complete logical database and project-record
invariance, no repeated activation, and no Save/open/close during recovery.
The installed error projection did not retain a validation stage; the failing
guard or cause remains unknown and no successful activation is inferred. The
new bounded stage classifier can diagnose a future candidate attempt, not
reconstruct this missing information.

After terminal reconciliation, EasyEDA closed normally without choosing Save
or Discard. Native discovery returned no instance. A standalone maintained
checkpoint verification, restricted to the exact disposable file and private
checkpoint directory, proved the closed file unchanged. The live checkpoint
tool itself refused after bridge closure, as expected from its dispatch gate.
No production project was opened, read, edited, saved or restored.

Private retained evidence includes the original checkpoint and six read/source
receipt pairs. Closed file SHA-256:
`825753c44abeb881a7b2322550ed8b9fdb0f311bba2d6019de8c5dff67a8d484`.
Logical database SHA-256:
`5127c44d3eaa3bbc8158d31b463fa50727c8be547f0ee063ddbd48a00004f6d7`.
PCB semantic source SHA-256:
`9ca1ea87e1cdb84faff7815b1cb02492bc014003fff9f0c3aba24c7ba73dd1c5`.
The activation reconciliation artifact SHA-256 is
`7ad517927e85afbcf878d56d9dcaab42750882ccc4da4318810a100cb912b787`.
Raw project data, account identity and machine paths remain private.

## Source improvements

- Closed-page rename uses a fixed project-qualified native metadata writer.
  The public setter's mutable tree-index race is not exposed. Immutable plan,
  exact title/header effect, writable branch, clean sibling and complete peer
  proofs are integrated with no-repeat recovery.
- Closed-symbol metadata now uses the project-qualified worker directly.
  The public wrapper can redirect to cloud storage after an awaited lookup and
  mutable-current-project comparison. Source review caught this before a live
  symbol write. Native source/tag preservation, permission checks and exact
  serializer behavior replace the earlier public-wrapper workaround.
- Both writers model deterministic removal of the old DOCHEAD user, bind the
  unchanged editor version, and refuse unknown serialized fields before writing.
  Inverse metadata operations do not restore generated header bookkeeping.
  Changed-result recovery of older symbol journals does not transparently gain
  the new source/tag/version commitments. It refuses mismatched original plans;
  no historical preparation artifact is rewritten or migrated.
- Footprint validation retains the actual `PCB` header and observed library
  owner. Exact source validation enforces the shared UTF-8 byte limit.
- Process-bound desktop diagnostics distinguish input-desktop availability,
  foreground ownership and session state without revealing foreign windows or
  changing Windows session/security settings.
- Exact known validation-stage messages survive error redaction. Unknown or
  embellished errors remain redacted. More SDK getter omissions now name the
  pinned callback, empty-result, filtering or serialization defect.

The PowerShell helper is an owned packaged file outside the facade runtime
fingerprint. Its regression tests and final all-packaged file/mode comparison
must cover its changed bytes. Updating facade projections does not certify that
helper by itself or justify changing external runtime/bridge pins.

Coverage after these source changes is 774 distinct methods: 187 public
subsets, 72 native task equivalents, 3 internal lifecycle, 8 implemented but
blocked and 504 omissions. The reader catalog still has 158 fixed routes.
These counts distinguish implementation from live evidence.

## Release status

Full local verification passed on Node 24.18.0/npm 11.16.0 with inherited
descriptors 142/145: 1,375 facade tests passed, one platform-specific skip,
zero failures/cancellations, and 424 bridge tests passed. Strict types and
type-aware lint have zero diagnostics. All seven official skill validators,
package/repository/privacy checks, actionlint and the offline doctor passed.
Clean dependencies have zero reported vulnerabilities, 151 valid registry
signatures and 40 attestations. Independent final review passed 137 focused
tests, including microtask races and Unicode preparation-byte limits.

The final source fingerprint covers 143 files:
`54279794d51fa056842e6d9b9563190862ab07835d55440a7894baa0ef9cec29`.
The three-file bundle fingerprint is
`84c2f435a3dbb066220f7cbf71274df1eef7ba207350cc0c1ac198d7d54a6475`.
The PowerShell helper SHA-256 is
`b183d27961fb526bcf315537b0f53053a5786c359927c64a823b9db0129134f4`.
External runtime, bridge and sanitizer pins are unchanged. An earlier doctor
run overlapped the final rebuild and refused stale facade projections; the
final frozen-source doctor passed. No compatibility boundary was weakened.

Payload `96dc874d1f84bf0094e6903aeac9dac54adf62b6` is published in
[draft PR9](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/9).
[CI38071801052](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/38071801052)
passed dependency/signature checks, strict lint/types, complete test suites,
reproducible builds, packaging and artifact upload. Post-commit rebuilding left
the committed runtime bundles unchanged. The PR remains unmerged.

The official CLI successfully upgraded the Git marketplace at
`https://github.com/jan-guenter/easyeda-pro-agent-plugin.git`, on the feature
ref. A subsequent explicit plugin add returned a cache-backup permission error.
No cause is inferred, and no manual cache repair or repeat add was attempted.
Independent CLI inspection reports `0.3.0+codex.20261010172121` installed and
enabled. All 474 Git-tracked packaged files, totaling 13,729,919 bytes, match
the clean source and committed modes, including the PowerShell helper above.
This comparison covers the tracked package inventory, not any extra cache files.

The actual cached `.mcp.json` command passed a synthetic-profile offline probe:
ambient Node 26 hands off to pinned Node 24; 26 tools and seven skills are
available; SDK references have 749 reviewed and 806 latest signatures; operation
schemas total 105 design and 68 library; the inventory has 774 distinct methods
and 158 fixed SDK read routes. Typed data validates, caller code and unsafe
paths refuse, and discovery does not grant execution authority. Startup checks
observed no upstream child or non-stdio socket. Subsequent calls were only
offline catalog/schema queries; no live tool or production control root was
used. This is an installed startup proof, not connected execution acceptance.

The host still loads 144459. Do not call its old symbol writer or replace the
gateway/cache to pick up the update. The extension-development release workflow
requires a fresh Codex session before new live testing; leave EasyEDA closed.
There is no unresolved disposable CAD operation. Next, authenticate the exact
172121 tuple, checkpoint the disposable project, validate its new page/symbol
metadata writers and investigate activation using bounded stage diagnostics.
The fixture currently has only one schematic page; page rename needs a separate
disposable sibling established through a supported workflow. Do not reuse
historical writer acceptance as evidence for these new adapters.

Remaining feasible work is recorded in the method inventory and
[feasibility review](api-execution-feasibility-2026-10-10.md); this continuation
does not declare the user's overall request complete.
