The maintained foreground manager now recognizes strict original requests for
`easyeda_control_current_pcb_via_write`. It retains the operation ID from that
original request on its existing client and generation. A timeout records an
unknown result and preserves that connection for cleanup. It does not establish
that the remote execute Promise or native Job finished.

`cleanup-original` accepts the Via selectors `inspect`, `abort`,
`observe-termination`, `release` and `settle-publication`. Selectors supply no
operation ID, tool name, native binding or confirmation. The manager builds the
registered Via request from its retained original operation ID and adds only
`confirmOriginalJobOnly:true` to abort. Other family selectors still refuse.
The existing footprint families retain their own wrappers and confirmations.

During one original Via `execute`, the existing `in-flight-original` lane admits
only `inspect` and one `abort` on the same client. It retains the parent Promise
and both evidence publications independently. Abort acknowledgement does not
settle that Promise, prove original root/Job exit or permit a replacement.
Ordinary calls and execute replay remain blocked after abort or ambiguous
transport. The facade's final retirement acknowledgement, original child EOF
and observed exit remain the completion gate.

The small `control-session-via-adapter.ts` parses comparison data and builds
fixed requests. It issues no native owner or authority from result JSON. The
public Via operation/cleanup envelope remains the coordinator's report; this
manager does not infer native completion from its booleans.

Focused tests use the actual manager, SDK client, retained synthetic peer child
and output/evidence publication. They exercise execute timeout, genuinely
pending execute plus abort, refusal of caller operation/confirmation overrides,
one consumed abort, premature retirement refusal, explicit cleanup and final
original facade closure. Existing footprint in-flight and source-timeout tests
also pass. These are source/synthetic checks, with no EasyEDA or live native
process calls, generated helper changes, release or installation.
