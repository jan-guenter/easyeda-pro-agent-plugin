# Original producer held-call marker

Producer markers now come from the original central owner. Core retains the
exact event delivered by its worker controller and checks the breakpoint,
script, statement, function location and call-frame ID before any projection.
Frame, receiver and property attempts are consumed before native dispatch.
Only their actual successful replies can issue the once-retained marker.
Another read or copied marker cannot replace the held original call.

The same original event, frame captures, owner, operation and origin remain in
the private registry. The collector retains inert fields separately; those
fields cannot mint native call provenance. This increment adds no continuation
or Save grant and changes no native command or request reservation.

Nineteen focused collector/production-owner cases pass, including the real
synthetic child pipe. The production callback now exercises premature marker
retention and a fixed frame request without an original delivered pause; both
refuse before another native request. Both TypeScript projects and strict
targeted lint pass. No native allocation, Windows process, helper or pin changed.


## Historical source attribution, 2026-11-08

This record first entered canonical source history in commit `eaa77d876a2d85e0060c2714509bcc54a9783542`,
whose complete committed tree is `fff1891df03f5e8f105918e63931bf857542f907`. Those identities establish
which committed increment introduced this record. The full working tree used
for the earlier reported checks, including any concurrent uncommitted work,
was not retained as an independently sealed snapshot. The introducing commit
is therefore not asserted to be the exact tested payload. The earlier results
remain historical observations and cannot replace final exact-commit release
validation. See the [review assessment](2026-11-08-pr184-history-attribution.md).
