# Fixture preflight browser-global capture

The third original-manager case selected frozen development commit
`066528e40fcf6198c8db6b7ff3a3f18fb945d354`, build
`0.3.0+codex.20261106031007`. Its authenticated empty editor-shell observation
reported the Start Page and no other tabs. The sole fixture request stopped in
the tracked environment preflight at `capture-context`, with
`predicate-refused`. Config GET, response receipt and text consumption were all
false. The importer, archive generator and destination allocator were not
reached. This preserves the earlier failure rather than treating it as a
successful import or permission to replay it.

The complete original upstream reply was retained as1007bytes, SHA256
`2d2e2d60c30c2797a25b8de17bb33b33bf44eca72dad32762da74d27a3590f45`.
Base-ID inspection returned its actual environment ID and original cleanup
nonce. Normal close was acknowledged and the original process termination was
observed. Subsequent resource release is recorded separately when complete.

The failed V1 program grouped application and browser globals into one capture
stage. It does not identify which member failed. The passive shell observation
qualified application fields in a separate call, so the browser-global
own-data assumption is a likely cause, not an observed property descriptor.

The revised fixed program keeps own-data capture for `UI`, `gVars` and
`PRO_EDITOR_MODE`. After the original empty Start Page guard passes, it reads
only the fixed standard `fetch` and `Response` browser globals through normal
host property access. Their binding identity is checked around asynchronous
work. No caller-selected property, URL or code is accepted. Application getters
remain refused. The existing mode, response class, status, URL, body,
platform and complete directory predicates remain unchanged.

A distinct refusal V2 records the selected capture member, bounded browser
descriptor/value classifications and the separate browser-global stage.
Original V1 replies remain supported without inventing that evidence for
historical cases. Contradictory dispatch/stage/classification combinations
refuse. Success retains the existing V1 observation shape.

The final10 focused program regressions pass on pinned Node24.18.0 with the
test-isolation preload and zero soft core limit. They cover lazy and inherited
browser bindings, zero browser reads before the empty guard and zero invocation
of an application accessor. The test setup initially materialized that accessor
before running the preflight; its retained failed run was corrected by installing
the accessor after shell setup. Full source types and strict type-aware lint
pass. These are synthetic/source results. The revised program has not yet
passed the connected environment preflight or imported a project.
