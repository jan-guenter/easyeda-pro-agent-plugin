# C# structural trivia capacity measurement

A private inverse helper snapshot had 2,126,483 readable review bytes and
2,087,065 compiler bytes after the existing v2 compaction. Its compiler
SHA-256 was ff2e193702a74b6b9c8404f2aaf67dd6aa341122cbe8c58ba9726336643a9d29.
The v2 restoration metadata occupied69,491 bytes.

A build-only experiment removed whitespace and comments beside the structural
C# tokens `{ } [ ] ( ) , ;`. It changed no literal or executable token. The
candidate compiler measured2,076,866 bytes, saving10,199 bytes, with SHA-256
d235b5d200150ac2df41e90d1d429606f0b9dd9e274e730d4489551eee60eff9.
The complete typed token sequence hash remained
ada681b35ff9ee5cdbe157b2d2fbdebbcb0e144f88c771bc34c181449cbc3505.

The same delta-offset restoration record representation needed83,520 bytes
for10,394 records, including3,525 original single spaces newly removed.
Restoring those records reproduced every original readable byte. The existing
131,072-byte metadata limit and the review-within-compiler-plus-metadata limit
both hold. Candidate gzip compiler/metadata sizes were925,095/24,672 bytes.
These values measure this snapshot, before the complete reference-result
native sender is composed.

Actual .NET10 C# LangVersion5 compilation passed. All five existing pure
reference worker/UI/dispatch/callback/send codebook smoke methods passed without
constructing an owner. This is compiler and codec evidence only. No application,
controller, manager, facade or native process was allocated.

No production compactor, decoder, format, bound, helper artifact, pin or bundle
was changed. Using this candidate would require an explicit separately
versioned storage format with canonical restoration. Historical v1 and v2
parsing and byte output must remain exact. The observed gain is10KB; it does
not establish that the complete future result sender fits.

The subsequent token-fusion experiment considered every trivia gap. It removed
one only when relexing the exact adjacent token texts returned precisely the
same two token kinds and texts. The complete final token hash also matched the
original. This produced2,074,140 compiler bytes, saving12,925 bytes from v2,
with SHA-256 295dc22be3b41a457786f4edf7103fc35a70a5622821586d814627112b112bd3.
This is only2,726 bytes beyond the structural-punctuation experiment.

Restoration metadata measured93,826 bytes for13,002 records, including6,133
removed single spaces. All original readable bytes restored exactly, with the
same131,072-byte metadata and review relation limits. Gzip compiler/metadata
sizes were924,667/26,671 bytes. Actual C#5 compilation and the same five pure
reference codebooks passed. This remains a private measurement; no production
v3 format or guard change was introduced.


## 2026-11-08 restored history provenance

The history index already linked this record, but its file had not been
integrated. PR190 restores the original body exactly from documentation commit
`9b8f272ae680a1e255e453a4103cd54a0ba14a07`, tree
`33e268b2d76a30da4f2b0d86362bccc331a59c37`. Its first introducing documentation commit was
`9180a1b8880e7b95dfb5f8b8fed74709242e0322`, tree
`26da27917ee6554ebc908c34e2a69d5694849e72`. These Git identities establish the
record's provenance only. The compiler hashes above keep their stated artifact
scope; the complete historical source/test worktree was not sealed and cannot
be reconstructed from this record. No historical compiler check was rerun or
attributed to the restoration. See the
[PR190 correction](2026-11-08-pr190-history-attribution.md).
