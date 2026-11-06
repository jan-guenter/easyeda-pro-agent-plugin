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

An earlier complete capture can have refused only its initial file-clock interval
because WSL reported zero birth time. The exact released refusal and null target
can locate data through that import's original `destination-held` artifact. They
grant no qualification. The fresh Windows file lease must supply actual creation
and modification clocks; the complete initial model must pass for both the old
snapshot and new copy. Missing clocks, another refusal, extra rows or changed
bytes still stop. This is a new read-only data qualification, not import replay.

A changed file, unexpected directory member, watch event, source/SQL mismatch or
unacknowledged release refuses acceptance. The initial profile accepts no changes
caused by a later project opening. Do not relax that profile to reuse a changed
fixture. Retain the failure and use its original cleanup/record state.

Call `inspect` after uncertainty. `settle-records` publishes only retained local
bytes and never reacquires files or repeats qualification. After acknowledged
fresh resource closure and settled records, call `release-owner` with
`confirmReleaseClosedDataOwner:true`. Do not replace or retire a coordinator
with pending resources or publication.

Before any application launch, use exactly one local staging action
with `confirmStageRequalifiedData:true`:

- `stage-for-fresh-opening` for qualified PCB data.
- `stage-schematic-for-fresh-opening` for the distinct SCH data.

For PCB data, select the `ordinary` or `spatial` purpose of
`easyeda_control_pcb209_opening` before its fresh diagnostic launch. That owner
consumes the staged token. Do not start a separate ordinary launcher first;
the PCB reader requires no retained ordinary runtime. For SCH data, use the
new ordinary launch required by the separate
[schematic route](generated-schematic-opening.md).

Staging transfers data and creates no native owner. A historical capture cannot
itself stage a target. Keep the current facade through this handoff. Complete
original reader cleanup before any later controller replacement.

This route offers no app launch, design modification, Save, deletion, signal,
historical owner adoption or production writer authority. Source and synthetic
verification are distinct from Windows-helper compilation and connected reuse.
