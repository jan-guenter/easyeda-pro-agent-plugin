# Native PCB reference ledger origin correction

The separate native reference lifecycle in909802f4 retained two stale GET
ledger references. PCB forwarding checked ntcComplete instead of the original
PCB query's nrpcComplete. Its channel assertion already proved the manager
prefix, but did not replace the missing channel-completion check. PCB result
controls, breakpoint removal and resume checks used eight old ntfPoints
references instead of that query's nrpfPoints. The source/Inspector controller
already retained the correct original points; the native stage would refuse
their continuation.

The correction changes only those namespace references in the two new native
reference emitters. It preserves the original GET family's fields, the actual
original accepted-GET anchor, all private ledgers, failure/owner guards, request
bounds, codebooks, persisted schemas and stateless NtrMessage delegation.
No connected NativeOnly lifecycle had run or accepted those stages.

Two focused regressions require the owned namespace and provenance. The
forward predicate truth table refuses an incomplete own channel even when
the older GET channel is complete, admits the completed own channel when the
old one is false, and still refuses missing original acceptance or sticky
failure. The result lexer check requires all eight own forwarding references
and excludes the old points while retaining its pure original codec delegate.
These tests fail the earlier emitted source and establish no runtime owner,
callback, native application or saved-result proof. Strict changed-file lint
passes. Root regenerates and freezes the combined NativeOnly artifact before
any live work.

The corrected combined dedicated compiler input is1,999,051 bytes/SHA
9cdefeefa583386e492411a6e35d45e6d339fec701b376c3920f2037a55c912e.
Actual Windows PowerShell5 C#5 compilation with warninglevel4 and warnings as
errors returns zero diagnostics. Eight pure static codebooks pass without
creating any owner, Job or application. This is static evidence only.
