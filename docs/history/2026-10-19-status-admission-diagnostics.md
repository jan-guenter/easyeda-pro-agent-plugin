# Status admission timing diagnostics

The restarted plugin's first status request spent several minutes before its
upstream process started. That request eventually completed with no incomplete
operations. Its upstream integrity timings accounted for about 25 seconds.
Process-wide I/O counters showed about 10 GB read, but those counters cannot
attribute the bytes or time to one validation stage.

The status path first scans managed journals and all referenced phase artifacts.
It then qualifies historical completion and abandonment claims. Neither stage
was included in the existing upstream integrity timings. Cold journal scans
also parse journals and verify their canonical self-hashes and plan hashes.
Warm scans retain only pure derived projections and still read every current
journal and phase-artifact byte.

## Added diagnostic fields

Successful status responses now include `admissionScan` from that same complete
admission scan. It reports integer milliseconds for `journalScanMs`,
`historicalQualificationMs` and `totalMs`, plus the total journal count and five
fixed candidate classification counts. Durations are independently rounded, so
the two stage durations can differ from the total by one millisecond.

The strict schema accepts only bounded nonnegative integer aggregates. No
operation identifiers, paths, source content or error text enter these fields.
They are a report of the completed observation, not admission authority. Later
guards still perform their own fresh scans. The status path performs no extra
scan to obtain the diagnostics, including when a bridge connection requires
its runtime portion to be sampled again.

## Performance limits

This change explains elapsed time; it does not claim a faster connected scan.
A proposed parsed-JSON stringify optimization was rejected after one synthetic
6 MB comparison. It produced identical bytes but took 181–228 ms versus
133–187 ms for the existing implementation. Canonical hashing, artifact hashing,
file ownership checks, all qualification guards and cache admission remain
unchanged. No retained journal or evidence file was modified.

Focused tests cover same-invocation status reporting, strict numeric/privacy
bounds, fresh later observations, unchanged quarantine behavior and same-size
journal/artifact corruption. Their results are separate from future connected
timing measurements after installation.
