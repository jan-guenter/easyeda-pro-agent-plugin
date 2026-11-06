# Reuse closed generated fixture data

Use `easyeda_control_fixture_data` on a fresh facade to verify a previously
generated fixture whose complete initial file is still unchanged. This avoids
another import. It recreates no old process, Job, bridge session or helper owner.
Finish the earlier workflow's original cleanup before retiring its facade.

Query `closed-generated-fixture-data` with `includeSchemas:true` through
`easyeda_control_api`. Validate the request with
`closed-generated-fixture-data-validate` before calling the tool. The first
request selects one managed import journal and its exact `generated-archive`
and `closed-import-capture` artifact digests. Pass no file path or target object.

```ts
{
  action: "requalify-closed-generated-fixture",
  operationId,
  importOperationId,
  generatedArchiveArtifactSha256,
  closedCaptureArtifactSha256,
  confirmReadClosedGeneratedFixture: true,
  confirmFreshNoApplicationCheck: true
}
```

Use the schema's `fixture-data209-...` operation ID grammar. This request creates
new read-only Windows file/directory/watch custody and a never-launched proof
helper. It reads a fresh managed Linux copy, all logical SQL and the complete
fixed initial source. It compares those data with the original managed snapshot.
The Windows file lease denies write/delete sharing. Process-absence samples are
bounded observations, not a continuous guarantee that another app cannot start.

A changed file, unexpected directory member, watch event, source/SQL mismatch or
unacknowledged release refuses acceptance. The initial profile accepts no changes
caused by a later project opening. Do not relax that profile to reuse a changed
fixture. Retain the failure and use its original cleanup/record state.

Call `inspect` after uncertainty. `settle-records` publishes only retained local
bytes and never reacquires files or repeats qualification. After acknowledged
fresh resource closure and settled records, call `release-owner` with
`confirmReleaseClosedDataOwner:true`. Do not replace or retire a coordinator
with pending resources or publication.

Before any ordinary application launch, use exactly one local staging action
with `confirmStageRequalifiedData:true`:

- `stage-for-fresh-opening` for qualified PCB data.
- `stage-schematic-for-fresh-opening` for the distinct SCH data.

The existing generated PCB or [schematic route](generated-schematic-opening.md)
consumes that source once after its new ordinary launch. Staging transfers data,
not a native owner. A historical capture cannot itself stage a target. Keep the
current facade through this handoff. Complete original reader cleanup before
any later controller replacement.

This route offers no app launch, design modification, Save, deletion, signal,
historical owner adoption or production writer authority. Source and synthetic
verification are distinct from Windows-helper compilation and connected reuse.
