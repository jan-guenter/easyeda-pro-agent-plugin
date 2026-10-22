# Compact completed legacy admission projections

The admission scanner now retains only the operation ID and recorded state for
completed, nonblocking legacy journals. In a synthetic 390-journal fixture, this
eliminated 156 repeated journal parses on a warm scan without changing any
scanner bounds or fresh file checks. Elapsed times varied between runs, so the
result establishes better cache residency, not faster connected admission.

## Eligibility and public output

The compact branch in
[`closed-symbol-terminal-admission.ts`](../../plugins/easyeda-pro-control/server/src/closed-symbol-terminal-admission.ts)
requires the existing terminal-state predicate, no orphan-risk or unreadable
journal flag, no reserved closed-session claim, and no current-symbol baseline
profile. Every other candidate retains its complete summary and original
qualification path. A terminal journal with orphan risk remains a blocker.

Status and guard consumers already omitted completed, nonblocking legacy
journals. Their state-list consumer exposed only the operation ID, state,
recorded state and legacy qualification. The compact branch preserves those
values and their original sorted order. Historical abandonment and terminal
qualification still run independently on every scan where applicable.

## Unchanged validation and bounds

The managed scanner in `artifacts.ts` is unchanged. Every cache use rehashes the
complete current journal and every referenced phase artifact through the same
managed paths and file-identity checks. Changed bytes invalidate the pure
projection. Cache entries do not retain process ownership, successful admission,
quarantine clearance, execution authority or replay permission.

The projection cache still allows at most 512 entries, 1 MiB in aggregate and
32 KiB per entry. The separate validation cache remains limited to 512 entries
and 4 MiB. Journal parsing retains its 64 MiB input bound, and hashing shares
the existing four-stream limit. No cache capacity was increased.

## Synthetic measurements

The new
[`closed-symbol-admission-compact.test.ts`](../../plugins/easyeda-pro-control/server/tests/closed-symbol-admission-compact.test.ts)
creates 390 isolated synthetic managed journals. Each has a small retained
payload and twelve phase descriptors referencing one synthetic phase file for
that journal. This fills the summary's twelve-entry recent-artifact list; the
scanner verifies every descriptor. It compares the former rich legacy
projection with the current admission state-list path using the actual scanner.
It does not read the live control directory or launch EasyEDA.

| Final passing run | Parsed journals | Elapsed milliseconds |
| --- | ---: | ---: |
| Former rich projection, cold | 390 | 10,926 |
| Former rich projection, warm | 156 | 9,957 |
| Compact projection, cold | 390 | 11,419 |
| Compact projection, warm | 0 | 10,701 |

An earlier run gave warm times of 11,464 ms for the rich projection and
10,111 ms for the compact projection, with the same parse counts. That run
failed after the measurements because the test called the mock cleanup method
on the wrong object. The corrected test passed. Opposite timing differences
across these runs do not support a latency claim; fresh file validation remains
in both paths, and this fixture does not model the sizes of actual journals.

## Verification and remaining measurement

The corrected fixture passed equality checks for the complete public state list,
unchanged status classifications, same-size journal and phase corruption with
restored timestamps, symlink substitutions, and valid transitions to unfinished,
orphan-risk and reserved-family states. The final source also passed all 94
existing admission and default-consumer regression tests. Targeted strict
type-aware lint reported no warnings.

Connected timing must be measured separately after installation and fresh host
admission. The fixture proves cache pressure for its supplied summaries, not
that the same number of entries overflowed the historical live cache.
