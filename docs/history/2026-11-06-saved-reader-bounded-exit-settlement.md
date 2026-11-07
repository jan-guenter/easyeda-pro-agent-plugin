# Saved-reader bounded exit settlement

The original workflow privately records that its cleanup exit-observation
window was exhausted and that the cleanup Promise has settled. Only that exact
state lets `settleCleanup()` issue one further bounded read-only observation
round on the same original owner and retained kernel-binding metadata. It does
not recognize error-message text, serialized status or a caller-supplied owner.

An actual positive original root/Job observation permits only the unused
original helper release, or joining its existing release Promise. Abort,
normal close and release are never repeated. The additional observation Promise
is consumed before its first await; another exhausted round stays unresolved
and cannot admit a third wait. Unknown control/release acknowledgments do not
open a replay route.

Settlement changes cleanup status only. The failed operation still has no
reopened result or persistence proof, even when the same original helper later
closes successfully. The original execution Promise stays rejected.

Five focused production-coordinator cases pass with exact Node 24.18/npm
11.16, full types and strict changed-file lint. The two new cases use an
explicit zero-delay test timing seam while preserving the exact 40-observation
limits: delayed original closure completes only cleanup; a second exhausted
round remains consumed with one abort, no helper release and no third wait.
No native application, Windows process or MCP call ran; native bytes are
unchanged.
