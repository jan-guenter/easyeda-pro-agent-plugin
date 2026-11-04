# Autonomous controller review and helper cleanup follow-up

This record follows the [initial controller lifecycle implementation](2026-11-04-autonomous-control-loop.md).
The section below is a verbatim relocation of the review follow-up appended in
commit `5e8988e659e67193819271a680b7d5bb81d2b05a`. Its hashes and pending
statements describe the earlier review stages. The later startup-cleanup
correction is recorded separately below, preserving those observations.

## Review completion and same-version follow-up

PR167's initial payload `b12918e91ccb717d5ca2359f6266ac535162b190` passed all
11 CI checks. The complete facade suite reported 14,065 tests, 14,060 passes,
five expected platform skips and zero failures; the bridge suite passed all
424 tests across 28 files. This is offline CI evidence, separate from native
validation.

The single requested `@coderabbitai full review` completed on that payload.
Across its automatic and full reviews, CodeRabbit reported five minor issues
and an optional docstring-coverage warning. The follow-up replaces three fixed
test sleeps with bounded polling for actual retained closure observations,
documents the trusted checkout working directory and cleanup-budget marker,
explains the exhausted manager's one-shot final retirement, and distinguishes
startup failures before child allocation. Ownership and lifecycle methods now
have purpose-specific JSDoc. No production behavior or signatures changed in
this follow-up; the independent stripped-AST comparison is retained privately.

The same foreground manager retired its installed084035 generation, observed
its original child exit and stdio closure, and admitted a second generation
from the frozen initial PR167 candidate. That second generation performed only
offline identity inspection. It then retired and closed with code zero and no
signal. The manager itself shut down with code zero before its frontend source
comments were edited. All 46 original durable manager records remain retained;
a truncated terminal inspection was excluded from the proof. Codex did not
restart during either transition, and no manual interaction was required.

The follow-up keeps version `0.3.0+codex.20261104120101`. Its 1,000-file source
projection is `edd9bc8b97d50a212d77114f9060dd427403bb32844582d5d7d0198c7b727eca`;
the three-file runtime projection is
`17d0d807d6c92a9c734c673179628e11b40d8311589c99edda46ed9ecebfce41`.
Both bundles reproduce exactly and all external compatibility pins remain
unchanged. Strict types, zero-warning type-aware lint and coverage checks pass;
the revised manager slice passes all 11 tests. Final-head CI, automatic review,
protected merge and installed-package verification remain subsequent stages.

The automatic review of `d93300aa37d49e44d1ba98a2e75a0d6919bed369` marked
the five original comments addressed and passed all five premerge checks,
including docstring coverage at 97.30%. One collapsed additional comment
identified imprecise wording about the final-retirement threshold. The guide
now requires inspection of the exact cleanup counters before dispatch and
states the three-record/4 MiB reservation. At 126 used cleanup records a
cleanup call can still fit while retirement is already final. This correction
changes documentation only; the source, runtime and version pins above remain
unchanged. Its final-head review and CI remain required before merge.

## Startup cleanup correction

The automatic review of `5e8988e659e67193819271a680b7d5bb81d2b05a` passed
its premerge checks and identified two more minor issues. This separate indexed
record addresses the history-placement issue while preserving the prior text.

The runtime issue occurs when an existing-application observation starts helper
acquisition, then an explicit launch joins it and changes the runtime state.
Acquisition correctly closes its newly allocated original helper and rejects
the changed state. A later runtime release previously rethrew that acquisition
error, losing acknowledgment even after actual helper closure. Release now
re-reads the retained supervisor and joins its original once-only release.
Unknown allocations with no retained supervisor still refuse acknowledgment;
a pending or failed original helper close never retries or becomes success.

The focused regression failed on the former implementation, then passed after
the fix. It exercises both successful and rejected original helper closure,
verifies one acquisition and one helper-release call, and proves that neither
application launch nor existing-application observation reached the helper.
The complete Windows runtime slice passes 25 tests with zero failures or skips.
This is synthetic offline verification, not a connected EasyEDA workflow.
Version `0.3.0+codex.20261104120101` is retained. Final source/runtime pins,
required checks, exact-head CI and review remain subsequent stages.

The same prepared release now also includes the separately developed
[forward footprint qualification increment](2026-11-04-footprint-forward-prewrite-qualification.md).
That record retains the combined final source/runtime pins and verification
scope. The older hashes above remain the exact earlier review-stage payloads.
