# Inverse service and lookup metadata

The SDK service metadata table had thirteen incorrect function columns. Its
regular async functions were also checked for ordinary constructor properties.
Actual Node24 Inspector packets from all seventeen uninvoked installed functions
exposed both defects. The earlier metadata test covered only two functions and
constructed their positions from the expected pins, so it could not detect a
wrong pin.

The corrected table uses the installed source positions. Async regular functions
require only their own name and length, with the native AsyncFunction parent.
The regression preserves the whitespace before each original function and checks
all seventeen actual packets, shifted locations and inappropriate prototype data.
No application method runs in these tests.

A separate ten-role lookup and formatter table now pins the synchronous static
facade lookup, async project lookup, async row lookup and seven row formatters.
It verifies the full installed UI asset, exact function descriptions, positions,
function kinds and native metadata. Its actual uninvoked functions pass Node24
Inspector checks; foreign scripts, shifted positions and changed descriptions
refuse. These leaves grant no original receiver, registry, row, SDK continuation,
request, deletion, clock or persistence authority.

Focused verification passed for these actual source functions, both TypeScript
projects and strict type-aware lint on the changed files. This source batch has
not yet been frozen into native artifacts or admitted as a connected writer.

## Original cleanup outcome

The user separately approved one SIGTERM to the exact retained stalled facade.
The original facade and its original helper were independently observed exited.
The original manager then exited after normal input EOF, with its original pidfd
retained through exit. No helper or manager signal, SIGKILL, lease deletion or
journal edit occurred. This closes that process-custody blocker. It does not
recreate the missing helper-release acknowledgment or establish clean retirement.
The separate frozen reader candidate was verified byte-for-byte before selection.
Its historical metadata qualification and new disposable Component case remain
separate from the source-only writer batch.
