# Schematic clock and selected-file SQL review

2026-11-08, source batch based on `b6384540`.

[Review partition 5](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/176)
identified a native clock limit that refused the third offset sample required by
initial registration, arm revalidation and post-collection revalidation. The
protocol now defines that three-sample bound. Native admission uses it and its
compile-only smoke accepts all three samples and rejects the fourth. The
observer regression checks the complete sequence against the same constant.
The published schematic-page limitation text also has the missing spaces fixed;
its numerical limits remain unchanged.

[Review partition 7](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/178)
identified unchecked comma-joined SQL tables. The fixed readonly predicate now
tracks FROM/JOIN lists by parenthesis depth and refuses comma lists, including
nested subqueries and quoted table names. Clauses end that list scope. Commas in
scalar expressions, literal strings, WHERE conditions, GROUP BY and ORDER BY
remain valid when the rest of the original fixed grammar accepts them. All
eight direct/prepared statement entry points use the corrected predicate.

## Verification and limits

Eighteen focused tests passed across the SQL conditions, complete clock observer,
clock codec and newly integrated original inverse GET result. Both TypeScript
projects passed. The first targeted lint pass found an import-order issue in a
test; that ordering was corrected and the final strict type-aware lint pass
completed with zero warnings. Four composed
native layouts reproduced on their second broad generation, compiled with C# 5
and passed the real three-sample/fourth-refusal admission smoke and fixed clock
codec hashes. Runtime compiler inputs were 1,865,993 diagnostic, 2,076,982 inverse,
1,971,179 schematic writer and 1,613,730 saved schematic reader bytes. Every
runtime helper/compiler input remains within the existing 2 MiB bound.

These are source and offline checks. No connected schematic Save or inverse
DELETE is claimed. Tracked native artifacts, bundle regeneration, final complete
CI and review of the final payload remain release work. This batch did not
change the separately selected live-validation snapshot.
