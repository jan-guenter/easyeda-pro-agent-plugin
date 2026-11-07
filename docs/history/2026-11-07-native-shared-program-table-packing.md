# Exact new-program table packing

The nine saved-cache native metadata helpers now share one immutable table
through the existing `EasyedaDiagnosticFixedTable.Load` decoder. The complete
role/program table is below60KB, contains no ambiguous TAB/NUL program separator,
and retains the unchanged64KiB decoded-program ceiling. Native selection still
uses the same closed role switch and literal return/await/side-effect options.
Every compiled row index is checked against its exact role; no operation accepts
a row index or program.

All nine original program texts, individual SHA256 checks and full native
program/option smokes remain. One combined compressed/decoded hash additionally
binds the complete table. Three focused packing/protocol checks, full types,
strict changed-file lint, two-pass composed generation and full C#5/.NET10 Linux
compile plus metadata/inverse fixed-codec smokes pass. The metadata fragment
shrinks28,700→17,060 bytes, saving11,640 bytes with identical CDP programs and
request fields. No field guard, request count, decoder bound or old six-role
artifact changes. Tracked helper/pins/bundles are untouched; no Windows/app/MCP
operation ran.
