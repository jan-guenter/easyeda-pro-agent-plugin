# Separate diagnostic and inverse native layouts

The development build refused during `pcb209:spatial:check`. Startup composition
had retained an older five-function spatial section; the maintained spatial
builder emits eleven functions for the current Arc and Pad readers. Regenerating
that section added108136 bytes and exceeded the existing compiler ceiling.
The failed build and its measurement remain retained privately.

Startup now applies the complete spatial builder before final storage and exact
pin generation. The general diagnostic helper includes that codebook and the
Component reader. Footprint inverse processing has a separate generated helper,
closed to its one original purpose, with its own exact identity and retained
source descriptor. The original factory generates and retains its readiness
challenge before selecting that helper. Its request budgets and native command
contracts remain unchanged. Schematic display and wire retain their existing
separate helper. No caller chooses a layout, helper path or code fragment.

The diagnostic stored helper is1366189 bytes and its compact compiler is1817537
bytes. The inverse helper is1449258 bytes and its compact compiler is2058867
bytes. Both retain the existing2097152-byte bounds. Historical storage decoders
and all six released forward/cold artifacts are unchanged. Their generators
still use the exact immutable published baseline. A current diagnostic helper
is deliberately refused as a historical forward migration input.

Local checks passed both TypeScript projects, strict changed-source lint,
spatial and inverse generation checks, twelve focused inverse/birth/storage
checks, and the corrected complete-generation/six-artifact check. Both complete
readable C# bodies compiled as C#5 in private .NET projects with no native owner
or application. A preliminary unretained compiler driver yielded no completion
and is not counted. Windows CI now compiles the new inverse helper through its
actual PowerShell decoder, checks its empty original Job and pipes, and launches
no application. That CI result remains pending on the final commit.

During implementation, the first inverse generator had a mechanical identifier
replacement error. A second attempt omitted a required Component dispatch
anchor; the inverse scaffold retains that dependency. Another attempt expected
20 inverse smoke methods instead of the actual19. These source-only failures
were corrected and retained. The first mixed-layout regression still tried to
use the current diagnostic helper as a historical forward input and refused.
The updated regression preserves the old migration refusal and proves all six
released outputs against their unchanged original baseline. No guard or test
selection was relaxed to admit a new runtime capability.

This is build and offline evidence. The new helpers have not been installed,
selected by the foreground manager or connected to EasyEDA. Component positive
validation and all remaining write/Save/reopen proofs remain open.

The frozen package's subsequent validator refused its stale exact build-command
contract, which omitted the separate schematic and inverse helper checks. The
contract now requires both check/update commands and their packaged helper,
review, generator and identity files. The earlier failure remains retained.
The discovery description also now reports the actual four declaration
snapshots and855-method union. This changes no execution claim.
