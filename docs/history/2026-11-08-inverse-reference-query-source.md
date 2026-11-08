# Original reference-query source metadata

The new inert catalog pins the full installed manager and project-worker
bundles, 24 original callable descriptions and locations, and 19 registration,
topic and regular-expression links for PCB inventory, footprint source keys
and device inventory. It includes the real footprint source validator and
string type check. Full-file, fragment and Inspector checks grant no request,
result, delete, clock or continuation authority.

All three manager callbacks catch worker errors and return an empty array.
The focused check reproduces that behavior from the actual source. A future
reference-query collector must separately prove the successful original
worker result before accepting an empty manager reply.

Two focused checks passed against the configured installed assets. Independent
Node 24 Inspector metadata matched eleven original facade, handler and helper
functions without invoking them. Missing configured assets fail; the tests
skip only when `EASYEDA_ASSETS_ROOT` is unset. This is offline source evidence,
not connected deletion or four-generation validation.

An initial private Inspector harness exited without publishing a result and
left its test waiting. Only that test process was stopped using its retained
pidfd. The corrected harness retains its own message port, rejects early exit
and has a fixed test timeout. No application or facade was signaled.
