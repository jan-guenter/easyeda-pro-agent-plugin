# Forward failure evidence joins and current dependency count

This follows the [controller output and publication corrections](2026-11-04-controller-output-and-publication-recovery.md).
The complete review of `63d389e0058dc30d5f9f095e1924abdc1ffc2642`
reported two minor issues. That unchanged head passed all eleven required GitHub
CI jobs, with 14,112 facade passes, five supported platform skips, no failures
and 424 bridge passes. Those results do not validate these later changes.

The maintained forward failure reader now requires the original route. Every
present source packet must match its intent footprint and the route's complete
worker identity, client and maximum ticket. Every present preparation must have
a source packet and match its digest plus the original source plan, checkpoint
and before-SQL digests. Failures before capture and before preparation retain
their valid null fields. A preparation without a source is rejected. The
persisted shape, publication limits and execution authority remain unchanged.

Eleven focused lifecycle tests passed, including actual managed-reader rejection
of six foreign source request headers, four mismatched preparation digests and
a preparation without source. The foreign headers retain a coherent packet
digest, so rejection depends on the original intent and route joins. Three valid
failure stages remain readable. The original journal bytes are restored before
same-owner cleanup. The exact escaped-byte boundary test now retains the real
request when publishing; separate schema-only metadata maximization does not
claim original ownership. Types and strict targeted lint passed. These tests
use synthetic native collectors and prove no connected native effect.

The current footprint-copy omission description now says 64 qualified dependency
functions, matching the existing schema and manifest. Its separate historical
observation of 61 dependencies remains unchanged. The generated coverage catalog
is refreshed from that source; the manifest already had the correct value.

Combined reproducible build, final exact-head CI and full CodeRabbit review
remain release gates. The source-sealing and captured-content reader candidate
remains a separate unpublished batch. No production design was opened, edited
or saved during these corrections.
