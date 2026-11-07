# Second disposable import/read development freeze

Local development build `0.3.0+codex.20261106020637` combines the closed
initial SQL qualifier, private generated-target handoff, separate generated
spatial birth, fixed Arc/Line/Via archive, closed reader capture and original
cold-worker continuation. The narrow Via plan and intent journal are present;
its public writer and complete persistence lifecycle remain unavailable.
This build is neither published nor installed.

The source projection contains1124files, SHA256
`985ae14acbe0cff0c91762023b387b491852eb7905b5bfcb1c490200bbaaf7f8`.
The three-role runtime projection is
`782eca12abbd87fff95dba1455a273370d93a3d00b125463e49a722be3cb9b72`.
The actual server bundle is13,237,490bytes, SHA256
`16f1b01cb7ccd7bfa4e9534993cc78e63ddb0953c4db37bc832f4c29d4eb24fc`;
upstream supervisor is795,316bytes, SHA256
`84ea084ae84caba9af20b5d2ded7c93ea1e8fd7d09836ed09ffe86da289d8e8f`.
The standalone manager remains byte-exact to the prior frozen frontend,
SHA256 `7c8b38d137f37c6ca4a4c3f50b98fb9fdc6b030f3c90b1c311687850c2443e83`.
All three reproduced byte-for-byte. External compatibility pins are unchanged.

Pinned Node24.18.0/npm11.16.0 and zero soft core limit were used. Source and
bridge types, bridge lint, full strict type-aware lint, API coverage, complete
build including sanitizer/native graph checks, compatibility, repository,
package/MCP, all-skills and all seven installed quick skill checks pass.
The fresh independent dependency verification and actual Windows5.1 compilation
are recorded in [the shared integration record](2026-11-06-second-shared-native-integration.md).

Combined lint first caught two runtime import cycles. A fixed-only structure
codec now supplies the cold/native codebooks without the separate startup
fallback, removing the cycles and their old inline suppressions. Three focused
existing compatibility/graph tests pass, including exact released native bytes.
An initial repository check also refused the new bundle against the previous
reviewed compatibility projection. After the permitted facade-only refresh,
repository validation passes. Both failures remain in private logs.

The inventory remains835distinct methods. Full facade/bridge suites and
Windows CI still require the exact final release commit; local checks establish
no connected reader or writer acceptance. The next case must retain this
controller and payload through original import, closed qualification, generated
spatial opening, closed readback, native helper release and facade retirement.
The excluded production project remains excluded.
