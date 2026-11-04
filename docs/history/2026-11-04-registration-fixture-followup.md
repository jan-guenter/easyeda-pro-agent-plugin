# Registration and coverage fixture follow-up

This follows the [combined footprint qualification batch](2026-11-04-footprint-forward-prewrite-qualification.md).
CI for `bb7f0f4421b962b16d420dbc72e4632846d11b76` reported 14,088 facade
tests: 14,067 passed, 16 failed and five had expected platform skips. All 424
bridge tests, the build check and Windows recovery job passed. The failed run
and complete raw archives remain retained; it is not final release evidence.

The failures were in six registration/coverage test fixtures. Their VM contexts
needed the added forward lifecycle class, source-route expectations needed both
native task-equivalent routes, generic schema classification needed the new
wrapper, and scope/count assertions needed the eleven-purpose vocabulary.
CodeRabbit independently identified the coverage expectations in its review.

Three fixtures also bounded the enlarged startup dispatcher's AST span to
24,000 units. They now verify the unique expected const-arrow declaration and
its exact eight argument names/default purpose flags before extracting it. The
dispatcher is 25,763 units, within its new local 28,000 ceiling; combined retained
state and dispatcher are 28,796 units, within a 32,000 total ceiling. Individual
state declarations retain their original 3,000 limit. Unrelated extraction limits
and every existing test case remain intact.

All 79 focused fixture tests pass with zero failures or skips. Full types,
targeted strict type-aware lint and diff checks pass. The first lint failure and
its style corrections remain retained. Production source, the facade source
fingerprint, emitted bundles and compatibility pins are byte-identical to the
frozen combined batch. The disposable native case continues on that original
snapshot in its original controller; this follow-up transfers no owner or proof.

Exact-head CI, automatic review, protected merge and installation of the final
payload remain subsequent stages. The prior history-placement review issue is
addressed by the separately indexed [controller review record](2026-11-04-autonomous-controller-review-followup.md),
which preserves the earlier review section verbatim.
