# Separate saved schematic reader native layout

The fixed seven-record saved schematic reader now has its own generated helper,
`scripts/schematic-saved-readback-native.ps1`, readable C# and independent source
identity. Its existing original factory purpose selects that fixed path inside
`captureCurrentSchematicEditNativeHelper`; no caller can supply a path, program,
layout or alternate identity. Linux descriptor/hash custody and the retained
Windows `FileShare.Read` loader remain unchanged. Writer and Wire purposes retain
`scripts/schematic-edit-native.ps1` and cannot select the reader birth.

The build-only `schematic-saved` branch installs the existing readonly reader
factory, Main fence, cache, registration, opening, cold-load, scene and original
Job abort code. It omits the seven-record writer and Wire additions. Conversely,
the writer branch omits the saved-reader runtime. Common immutable codecs,
existing purpose flags, original owner registries, request limits and all thirteen
SQLite installation files with their continuous native leases remain unchanged.
The saved-only smoke no longer reads a writer instance field that is absent from
that compilation; it still checks its distinct birth and rejects writer actions.

At source `05055979`, private generation produced these complete artifact sizes:

| Fixed artifact | Stored helper bytes | Actual C# 5 compiler bytes |
| --- | ---: | ---: |
| Diagnostic | 1,411,947 | 1,865,158 |
| Footprint inverse | 1,456,612 | 2,055,196 |
| Schematic writer and Wire | 1,433,644 | 1,965,423 |
| Saved schematic reader | 1,155,762 | 1,612,895 |

The prior combined schematic compiler was 2,086,296 bytes. The new writer branch
recovers 120,873 bytes. Both the stored-helper and actual-compiler ceilings stay
2,097,152 bytes. Diagnostic and inverse broad helper bytes are exact against the
private pre-change generation. All six released forward artifacts remain exact.
The later writer status-delivery/common-encoder union needs its own measurement;
these figures do not claim that unmerged source.

All four broad layouts compose byte-exactly on a second pass. Complete emitted
C# compiles under language version 5 for all four. Pure smokes pass: eight shared
diagnostic codecs, all 28 current inverse smokes, four writer/Wire public smoke
entries and the saved-reader entry (which delegates all five reader codebooks).
An initial private harness accidentally compiled the readable review copy beside
the compiler input; its duplicate-definition failure is retained. A later
attempt to run every diagnostic Windows construction smoke on Linux refused at
`CreateJobObject`; that failure is retained separately. Windows-only construction
was not reported as passing. Hosted Windows CI keeps the original empty-Job and
pipe proof and now checks the fourth fixed helper with its own strict result
schema. No Windows helper or application was started here.

Thirteen focused cases, both TypeScript configurations, strict changed-file lint
and whitespace checks pass. The file-custody regression uses the production
capture module in a temporary package tree, the complete actual generated saved
helper and its exact identity. It proves fixed writer/reader path separation,
original descriptor reproof and refusal after same-length file substitution.
The complete generated normalizers still reject edited reader blocks. A stale
negative fixture originally replaced a source substring that no longer existed;
it now tampers the actual birth guard without changing production admission.

The new identity is generated from these private reader bytes. Existing tracked
helper artifacts, previous identities and bundles were not regenerated. Final
combined packaging must run all four fixed generators, then check each output:

```sh
npm run startup:protocol:update
npm run schematic:native:update
npm run schematic:saved:native:update
npm run inverse:native:update
```

This is source/build separation. It grants no live ownership, mutation, Save,
cache deletion, persistence or reopened-reader acceptance.
