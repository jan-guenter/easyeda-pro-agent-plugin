# Inverse-only SDK projection in the build

The inverse generator now applies the exact unused Via SDK projection after
its existing runtime projections and before fixed-vector storage and final
packing. The common API was introduced in `e3da7d1b`; this hook does not change
that implementation. It keeps the foreign factory, shared SQL/worker/actor
codecs, disabled PowerShell dispatch and negative compatibility method. The
original SDK program, encoder, sender and positive SDK smoke are unreachable
in this driver and are replaced only within its closed purpose.

Pinned Node 24.18.0 repeated generation exactly. The compiler input shrank from
2,094,478 to 2,079,879 bytes, recovering 14,599 bytes and leaving 17,273 below
the unchanged 2 MiB bound. Helper size is 1,498,246 bytes and review source is
2,132,587 bytes. Compiler SHA-256 is
`111574e717df483b2c4518e8811d8c22b19c7ddb755f4fe1475e5a986a272774`.
Actual factories generated from the same immutable seed proved the diagnostic,
schematic and saved-schematic outputs byte-identical before and after this
hook. No tracked helper, pin, bundle or version was regenerated.

Both TypeScript configurations, strict type-aware lint on the generator,
common projection and projection test, and both projection cases returned
exit 0. The inverse test now requires the generated closed output to remain
identical on repeated projection; all malformed-marker, mixed-purpose and
member-census refusals remain. The full C#5 compiler input and twelve pure
codec checks passed, including the SDK compatibility refusal. No owner was
constructed and no app, Windows or closed MCP connection was called.

These checks used an unsealed worktree, not a new packaged or runtime-admitted
payload. Private outputs and logs are retained. The first C# harness attempted
the nonexistent `VerifyPcbViaSdkSmoke` name and failed; the corrected harness
called the maintained `VerifyPcbViaSdkWireSmoke`. The pre-hook test comparison
also failed until it was updated for the now-mounted idempotent projection.
Both failures remain separate from the successful checks. DEL forwarding,
collateral completion, clock, persistence and final absence/readback are still
independent unfinished stages.
