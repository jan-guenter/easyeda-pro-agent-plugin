# Original worker setup helper source

A real Node Inspector session on a separate worker thread reproduced the setup
ordering: calling a fixed Inspector function while the original main-thread
script is held emits an empty-URL `Debugger.scriptParsed` event. It does not
produce a nested pause in that already-paused case. The event precedes the final
original resumed event. This is an offline runtime proof, not installed Electron
writer validation.

The Via and schematic controllers now retain only helper declarations actually
dispatched by their original source-held setup. Before releasing that callback,
the same cursor consumes each helper's actual event and obtains its complete
source. Script/context identity and exact source `(` + declaration + `)` must
match. Foreign source, live edits, source-URL directives, duplicate script IDs
and accessor replies refuse before parent-wait release or the original resume.
No empty-URL script is accepted merely because its URL is empty.

The fixed catalogue contains the transport capture and the three shared
Cache/Response intrinsic capture/reproof programs. The latter remain separate
from native ownership and are not activated by this change. Four bounded helper
source reads extend only the new writer bootstrap reservations:1366 Via and964
schematic renderer requests. The worker codebooks gain one fixed source-query
case each. Released103/384 and forward graphs remain unchanged.

Forty-seven focused runtime/controller/owner/boundary cases pass. They include
the genuine paused-thread Inspector experiment, both production controllers,
an exact helper-source mismatch and production owner/child transport. Both
TypeScript projects and strict targeted lint pass. The complete temporary
generator remains idempotent and its full C# plus worker/producer codec smokes
pass under Linux .NET10. No Windows process, app allocation, generated repository
helper, pin, continuation grant or Save authority changed.
