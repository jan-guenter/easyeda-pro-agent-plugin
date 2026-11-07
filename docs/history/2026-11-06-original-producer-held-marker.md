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
