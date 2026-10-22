# Status and journal scan performance

The connected candidate's initial status and subsequent native calls spent
minutes validating historical journals. Source review and separate read-only
measurements identified the journal scans as the main cost.

The reviewed upstream graph capture took 1.925 seconds for 737 modules and 2,059
edges. Its complete launcher fingerprint, including fresh hashing of 14,596
dependency files totaling 212,733,342 bytes, took 12.330 seconds. Those checks
remain unchanged. No launcher fingerprint, module resolution or compatibility
result cache was added.

The private journal store contained 263 journal files totaling 2,385,946,689
bytes and 2,461 phase files totaling 3,130,258,788 bytes. Every bridge entry guard
loads the journals, and status separately scans again for incomplete operations.
Previously, each scan parsed and canonically serialized every complete journal,
then allocated and decoded every phase file as a string to verify its hash.
Large embedded historical proofs made this recurring work expensive.

## Change

Phase files are now hashed as complete byte streams with a bounded buffer. The
same managed directory, ownership, single-link, no-symlink, size, descriptor and
post-read identity checks apply. The file's current managed path is checked
again after hashing. Reads do not call `sync`, create directories or modify
journals.

The process can retain a validated journal's artifact descriptors, keyed by the
SHA-256 of its complete stored bytes. This avoids repeating the self-hash and
plan-hash computations only after the entire current journal has been read and
its complete byte digest matches. Changed bytes require complete validation.
All referenced phase files are freshly read and hashed on every call.

Fixed, pure scan projections can additionally retain small cloned results.
Bridge quarantine, recovery discovery and identity/state scans use these
projections. A warm scan still reads and hashes each complete current journal
and every referenced artifact. It never exempts completed operations from
validation. Caller-dependent filters, such as the current recovery operation's
ID, run after the fixed scan.

The descriptor cache holds at most 512 entries and a 4 MiB serialized-data
budget. Each fixed scanner has at most 512 projections, a 1 MiB serialized-data
budget and a 32 KiB maximum per projection. Complete journal objects are not
retained. Returned values are cloned to prevent caller changes from altering
cached results. Noncloneable or oversized projections use the ordinary path.
These budgets describe retained data, not a promise about the JavaScript
runtime's object overhead.

## Evidence and limits

One source-only read-only measurement over all 263 private journals produced:

| Scan | Duration | Result |
| --- | ---: | --- |
| First complete validation | 40.008 s | 263 operations |
| Repeated fixed projection | 13.157 s | Identical projected results |
| First use of another fixed projection | 20.669 s | Identical projected results |

The measurement printed only duration, count and equality, and retained no
project contents. The current source was imported in a separate read-only
process. These measurements do not claim that the running marketplace facade
has picked up the change or that connected end-to-end status now meets a
particular latency target. Every scan still reads several gigabytes of retained
evidence; a cold scan must perform complete initial integrity validation.

Seven additional artifact tests cover cached-result mutation, changed journals
and phases with the same size and restored modification time, invalid plan
hashes under a recomputed journal self-hash, symlink and hardlink substitution,
projection isolation, size-budget eviction, exotic values, uncounted array
properties and selector exceptions. The full artifact file passes 33 tests.
Strict types and targeted type-aware lint pass.
The engine suite passes in the frozen candidate's complete verification after
the facade compatibility hash refresh. A pre-freeze run correctly refused the
changed source hash. The combined release has 1,265 facade passes, one platform
skip and zero failures/cancellations; these are not end-to-end live benchmarks.

Future journal-format work may remove duplicated full-history payloads by
referencing immutable managed evidence. That needs its own compatibility and
recovery design. This change does not migrate, prune or rewrite historical
journals.
