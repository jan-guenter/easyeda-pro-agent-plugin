# Current schematic endpoint membership, 2026-11-06

The existing raw electrical reader checks native contact Set membership and
member counts, but deliberately reports cache freshness and complete topology
as unverified. Its v1 schema does not assert that a cached point equals every
member line endpoint or pin origin. That raw observation and all earlier
persisted result shapes remain unchanged.

`current-schematic-endpoint-membership.ts` adds an independent data-only
comparison over the complete serialized raw observation. For bounded integer
coordinates and nonzero cardinal two-point lines, it reconstructs every Wire,
Bus and Pin endpoint member and its group. It requires the complete native
contact roster at exactly those positions, including exact family/group members
and no duplicate cached position. Integer coordinates exclude unequal-neighbor
ambiguity under the current native quarter-unit square tolerance. Wire and Bus
membership remain separate; the comparison does not infer electrical connection
through an interior crossing or a BusEntry.

The inspected installed SCH bundle is `pro-sch/3.2.193.5dbe8bb3/js/sch.js`,
6472538bytes, SHA256
`b88ad265bb2bc7febb90af92a6f37189b3f90be7cd1f1427522c8f2435dfb4bd`.
Its `HALF_EXT_EXPANSION` assignment is at UTF16 offset1994858, and its native
point-range tree receives that constant at4145960. This static source reading
did not invoke application code, rebuild a cache, run a compiler or open a design.

Three focused regressions exercise the actual current raw-reader program in an
inert model fixture. They distinguish an exact incidence match from
count-consistent stale contact coordinates and displaced pin origins. They also
refuse fractional tolerance cases, degenerate/diagonal lines and caller objects
without invoking proxy traps. Both TypeScript projects and strict type-aware
lint passed. The first test run retained an incorrect fixture line-count
expectation; the first lint run retained declaration-order findings. Corrections
changed neither the raw-reader contract nor its validation guards.

This comparison issues no native token or public writer route. A matching
caller-supplied observation is reproducible data, not original-process or source
authority. Its result explicitly leaves cache freshness, effective pin values,
complete stored source/topology, original native ownership, writing and
persistence false. A future wiring owner must join this geometry comparison to
its genuine complete source, fresh original observations, qualified setters,
action/history completion, one Save and full closed/reopened proof. The existing
older native wire writer is not admitted by this new data helper.
