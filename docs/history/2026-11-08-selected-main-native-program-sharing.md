# Fixed selected-Main helper storage

The complete `d24624d6` source union exceeded the unchanged compiler bound even
with v3 token fusion: schematic was 2,099,704 bytes and inverse was 2,097,662.
The failed private freeze remains retained. Neither result was admitted or used
to create a native/app owner.

The escaped fixed v2 SQL JOIN and SCOPE strings occur in twenty packed tables
in the schematic layout and twenty-one in inverse. Their repeated compressed
storage, rather than the final JavaScript behavior, is the source of avoidable
bytes. A separate pure build projection stores those exact two strings once.
It replaces only their exact escaped bytes inside existing immutable table data
with fixed tokens. No caller can choose a token, program, prefix or table.

The internal loader first uses the unchanged `EasyedaDiagnosticFixedTable.Load`
decoder with its original compressed/decoded hashes, 64KiB ceiling, row limit
and column limit. It expands the two fixed tokens and then checks the previous
complete table's exact UTF-8 byte length and SHA256 before returning any rows.
The old expanded length also remains bounded at 65,536 bytes. Every phase,
method, argument, program byte, source check, hash smoke and native ledger
therefore receives its previous data. Installation derivation happens before
this storage projection and does not see the new inert class.

The matching source expander validates the exact generated decoder block,
reconstructs each original canonical gzip and restores all original load-call
arguments. Expansion restores the entire previous compiler source byte for
byte. Applying the projection twice is identical. Unknown tokens, altered
decoder code, missing/duplicate markers, hash/length drift, changed expanded
payloads and orphan calls refuse. There is no cap change or new execution,
inspection, resume, SQL or ownership authority.

Pure Node24 measurements of the same complete `d24624d6` union are:

| Layout | Previous v3 compiler bytes | Shared v3 compiler bytes | Recovered | Margin below 2MiB |
| --- | ---: | ---: | ---: | ---: |
| schematic | 2099704 | 2089282 | 10422 | 7870 |
| inverse | 2097662 | 2086357 | 11305 | 10795 |

These are source measurements before compiler admission, not C# compilation or
live validation. The original helper and compiler ceilings remain unchanged.
V2 alone still exceeds the bound in both layouts; the separate writer-owned
explicit v3 schematic opt-in remains required. Writer owns the generator hooks,
other-layout byte comparisons, final compiler/smoke checks and artifact handling.
This commit changes no generator, storage format, native artifact, pin, Core or
pipe. Its projection/expansion APIs are in
`current-selected-main-native-program-storage.ts`; only schematic and inverse
are intended to opt in after installation derivation, with expansion before
regenerating an already projected source.

The exact source/test worktree is
`/root/work/easyeda-pro-agent-plugin-fixture-import`, based on `d24624d6`.
Its final runtime/test payload is sealed before final checks in the private
`selected-main-native-program-sharing-20261108` manifest, with patch and logs.
The private measurement inputs retain the full pre-pack source and the
instrumented builder's intentional refusal before storage admission. Three
focused cases use actual fixed selected-Main/history codebooks and hostile
storage mutations; both TypeScript configurations and strict changed-file lint
are recorded for this sealed payload. No C# compiler, Windows, native app or
closed MCP connection was invoked for these checks.
