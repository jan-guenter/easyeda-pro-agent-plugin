# 2026-11-09 captured startup diagnostic V2

The startup refusal diagnostic still re-evaluated its old frame expression,
including an ambient binding that can be absent by that point. The original
runner already retained the source-owned reconstructed tuple for the same
Pause. The review correction uses that private tuple through
`#capturedSqlFrame(pause, site)` and reads its properties once. It performs no
diagnostic frame evaluation and has no fallback evaluation on missing data.

The live packet now has the separate
`private.selected-file-main-sql-startup-diagnostic.v2` profile and fixed
`frameOrigin: captured-original-tuple`. Its complete captured summary requires
exactly one property request, with at most one diagnostic request overall.
Missing tuple data is explicit as `tuple-refused`. Existing array-length,
descriptor, slot-kind and path/SQL-kind summary validation remains intact.
The first semantic failure remains retained before the property await; a
diagnostic refusal neither replaces it nor resumes the paused call.

The historical V1 module and parser are byte-unchanged. A captured V1 summary
still requires its original two requests and rejects a one-request packet.
V2 rejects the V1 count and missing/mixed origin fields. The private Via failure
artifact boundary accepts an explicit union of the two released profiles.
Public inspect/main-failure V1 shapes and the separate
[passive refusal context](2026-11-09-startup-refusal-context.md) remain unchanged.

The tested source/test tree is
`e624abe9d517ef585db6ec0f651ac28978ad9540`, based on
`10bc76f1bed8df4d7d38bdfe2e3c08723893e2e0`. All 57 focused cases passed with
zero skips or failures. The actual runner fixture rejects any attempted
diagnostic `evaluateOnCallFrame`, requires the original cached tuple handle,
and observes exactly one diagnostic `getProperties`. It also verifies unchanged
refusal/resume behavior, privacy, original cleanup, separate predicate capture
and passive-context retention. Historical/current parser cases reject unknown,
mixed, contradictory and authority-bearing fields.

Node 24.18.0, npm 11.16.0 and soft RLIMIT_CORE zero were verified. Facade/stub
and bridge/test types passed, and strict six-file type-aware lint passed with
zero warnings after initial test-only style corrections. Repository,
MCP-contract, all seven packaged skills and all seven installed skill-creator
validations passed, along with scoped history/index links.

This is the source-only correction for the reported PR201 diagnostic issue.
There was no C#, native helper, Windows, SDK, application, CAD, Save or runtime
refresh action. Commands, flags, request ceilings, source pins and grants are
unchanged. The parent must integrate it with a coherent payload before any
fresh target-runtime observation; no connected diagnostic result is claimed.
