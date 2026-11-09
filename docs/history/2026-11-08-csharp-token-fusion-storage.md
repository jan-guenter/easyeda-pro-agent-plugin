# Version3 C# token fusion storage

Canonical implementation `c6c9b6ec` adds an explicit version3 storage route.
The existing version1 decoder and version2 spacing algorithm remain unchanged.
The shared review, compiler and retain readers recognize version3 without
reinterpreting historical formats. Only an explicit inverse-layout composition
may select the new packer. Other layouts keep their existing format.

The restricted ASCII C#5 lexer removes a trivia separator only if lexing the
two adjacent token texts reproduces both exact kinds and texts. A fresh hash of
the entire compact token stream must also match. Separators before a dot after
a number are retained conservatively because the historical restricted lexer
does not model every C# real-literal form. Unknown lexical forms refuse.
Version3 restoration checks canonical offsets, trivia bytes, token hash and
exact recompaction. Its distinct marker prevents ambiguous format selection.

All bounds remain unchanged: runtime compiler and complete helper 2 MiB,
restoration metadata 131,072 bytes, and readable review source at most the
compiler bound plus that metadata allowance. The existing fixed PowerShell
runtime decoder still compiles only the bounded compact body. Restoration
metadata remains build data covered by the complete helper identity.

Ten focused storage checks passed with zero failures or skips, covering
version1/version2 compatibility, malformed metadata, token/literal drift,
version3 round trips, old generator idempotence and all six released
forward/cold outputs. Both TypeScript configurations and strict type-aware lint
on the changed files passed. A second three-case run covered the final
canonical-storage check after the last edit.

A retained earlier inverse review input produced 2,074,140 compiler bytes and
93,826 restoration bytes under the committed version3 algorithm. Its exact
restoration and token hash matched. The same emitted C# input compiled with
language version 5 and passed five owner-free codebooks. No owner was
constructed. The compiler input hash was
`295dc22be3b41a457786f4edf7103fc35a70a5622821586d814627112b112bd3`.
This measures that retained input only. The complete new inverse composition
still requires its own final generation, cap check, compilation and connected
validation. The new storage route supplies no native ownership or execution
authority.

## 2026-11-08 provenance correction

This record entered the local implementation history in `ff8a94733708d670408fb4a85cb59feeddba5264`,
Git tree `6320d876eb6f244fc861789cafa313c14ee7ac48`, with Git author timestamp
`2026-11-08T07:03:39+01:00`. Those objects are retained in the local private
repository. They are source-introduction provenance, not a recovered timestamp
or sealed identity for the earlier tested worktree. That worktree and its
uncommitted changes were not completely sealed in the retained evidence and
cannot be reconstructed for attribution. The stated checks and measurements
remain historical observations with that limit. Any compiler SHA256 above
identifies only its emitted C# input; it does not identify the complete
TypeScript, test or generator tree. No earlier test was rerun or attributed to
a later commit for this correction. Private implementation ancestors are not
published to fill this gap.
