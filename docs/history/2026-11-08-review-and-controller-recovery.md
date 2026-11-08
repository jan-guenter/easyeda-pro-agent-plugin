# Review fixes and controller recovery

This record covers canonical source through `7c46d7d7`, before a replacement
payload was selected. Private evidence remains outside the repository. No user
project was opened, edited or saved.

## Controller cleanup

The original disposable Via attempt failed before project opening. Its frozen
facade could not complete the supported abort/release sequence. The user
approved a bounded exception for that original process. One SIGTERM terminated
the original facade. No second signal was needed. Under the existing EasyEDA
termination approval, the original application process was terminated after
checking its retained handle, creation time and executable identity. Both
original helper processes then exited without being signaled. Retained Linux
process descriptors and Windows handles established those exits.

The original foreground manager subsequently exited on its own input EOF.
No helper or manager was signaled. No lease or journal was edited. Original
Job emptiness and helper-release acknowledgement remain unproved. These
process exits supply neither a completed Via operation nor replay authority.
The closed disposable file retained its original bytes and had no sidecars.
The failed journal is unchanged. The separate
[historical resolver](2026-11-08-via-preopening-historical-recovery.md)
still needs dispatch from a fresh verified facade.

Source `a5edceff` now lets the manager shut itself down after its own retained
child has actually exited and closed, provided no request, capture, uncertain
retirement or replacement remains. This does not permit replacement or claim
native release. Its focused original-child test passed. Source `ba04ee8b`
also retains the first Via failure's phase and source-issued code separately
from immutable operation results. Unknown errors expose no raw message, stack
or cause. Twenty-one workflow/coordinator checks and five diagnostic checks
passed. These source checks are not connected lifecycle validation.

## CodeRabbit review 186

Review `5816669219` reported five issues. Source `5c0c39ea` fixes both
reference continuation issues: exact empty breakpoint-removal acknowledgement
must precede resume, and exact empty resume acknowledgement must precede the
next event wait. The two focused continuation checks passed. No retry or
native authority was added.

The other three issues require final inverse native integration and generated
artifact refresh. They remain open until the complete native assembly,
dispatch/smokes, cold aggregate pins and schematic helper identity are generated
and verified against the final source. Intermediate generated artifacts do not
satisfy this release requirement.

## CodeRabbit review 187 and build

Review `5816761255` reported two issues, both fixed in `7c46d7d7`.
Status now samples plain observations before archiving only the final selected
one inside the same serialization gate. A renderer authenticating during the
first probe no longer causes duplicate evidence-path reservation. Startup also
refuses to replace the reserved historical Via owner, preserving its original
metadata publication and settlement path.

The same commit adds the exact schematic-display manager adapter to the
reviewed build-input set. The preceding full build refused that missing input;
its failure is retained. The allowlist remains restricted to named inputs.

The corrected source passed 29 extracted registration checks, including the two
new regressions, with zero failures or skips. Both TypeScript configurations
and strict type-aware lint on the changed files passed. The complete unchanged
replacement build and exact-commit release CI remain separate requirements.
