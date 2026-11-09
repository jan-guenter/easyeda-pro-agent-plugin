# Native GET lookup codec envelope

Root's combined C# 5 pure-codec check caught an invalid outgoing lookup
envelope before native binding. The first 21 old codecs passed. The new
`VerifyFootprintInverseNativeGetLookupSmoke` stopped at byte parity.

The lookup native template emitted only the parameter object. The unchanged
`InverseFixedMessage` helper requires a complete `{method, params}` body before
it inserts the original request ID and session. The fix adds that wrapper in
the lookup template. Programs, flags, commands, parsers, native state gates,
ownership and all request/control/source ceilings remain unchanged.

The regression now restores the emitted native table row and reconstructs the
same complete byte envelope as the inherited C# helper. It compares all ten
messages, including the ID, method, params, session and final NUL. The former
test compared only parameters and could not catch this missing wrapper.

Four focused Node tests pass with zero skips, including the original source
under an inert Inspector. Server/bridge-stub types and strict changed-file lint
pass. The retained pure Node compiler input is labelled against canonical
`79fcb843be8c114f3cdfbc7ba6d0f3f6e02fff5e`. Root owns the C# rerun on the fixed
aggregate. No C#, native helper, Windows, MCP, application or CAD actor was run
by this source fix. The active generation and frozen payload were untouched.

The later [composed development batch](2026-11-09-startup-routing-development-batch.md)
compiled the corrected exact inverse input under C#5 on Linux and passed all 22
selected pure codecs, including the complete lookup-envelope check. That proof
establishes generated language bytes, not EasyEDA execution, native ownership or
an accepted Job. The original failed input and process-exit observations remain
retained separately.
