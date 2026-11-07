# Original import Windows file metadata

The first original fulfilled generated import retained closed bytes and complete
SQL but refused its initial clock qualification: WSL exposed zero file creation
time. That refusal remains retained. No missing timestamp is substituted from
mtime, a wall clock or historical JSON.

The original destination helper now has two finite actions,
`capture-closed-file` and `inspect-closed-file`. They use the startup's exact
generated basename, never a supplied path. Capture can enter once, after the
coordinator observes its original app root and empty Job. It retains a new
Windows read-only file handle that denies writers/delete sharing and a new
never-rearmed directory name watch, alongside its existing original directory
handles. Reproof checks canonical path, single link, complete one-file roster,
identity, full SHA256, size, creation/written FILETIME and the pending watch.

The separate `fixture-closed-file-metadata.v1` reply contains an unchanged
`fixture-destination-owner.v1` destination observation plus the file evidence.
Both raw100ns FILETIME values and their native Unix millisecond conversions are
retained and cross-checked exactly. Existing destination observation/release
shapes remain unchanged. The original release drains the file name watch,
rechecks bytes/identity, then closes its original file/directory handles.
Capture acknowledgement loss cannot authorize a second capture or adopt a new
transport. EOF remains the supported resource-preserving failure cleanup.

`ManagedFixtureDestinationOwner.captureClosedFileMetadata()` and
`inspectClosedFileMetadata()` expose only those fixed original requests. Six
focused original-stream tests pass; synthetic responses are labelled and prove
no Windows native action. Linux .NET C# compilation passes with zero warnings.
The25594byte helper SHA256 is
`5729fc3300d31737b0ff7b5f4585f81cf620759cb1243b0ce54b15e1c528fe78`.
Root also completed actual Windows PowerShell5.1 `-CompileOnly` on those exact
25594bytes: exit0, empty stdout/stderr and unchanged SHA. No constructor, file
lease or app ran; private proof is `destination-windows-metadata-compile.json`.
Connected metadata capture remains unproved by that compilation prerequisite.

## Direct qualification and command budget

The production import coordinator now calls
`captureManagedFixtureClosedSnapshotWithWindowsMetadata` or the separate
schematic equivalent. Inputs and original callback identities are retained
before the first await. The new file proof must match the original destination,
complete roster, Windows path, Linux copy size and full source hash. Every later
same-file proof must match the first original handle's exact metadata/content.
Only its real native created/modified times enter the unchanged initial SQL
qualifier; zero WSL creation time is never used as a substitute.

New report schemas are `managed-fixture-closed-snapshot.v2` and
`managed-schematic-fixture-closed-snapshot.v2`, under the existing
`easyeda-pro-control` namespace. Their prior fields are preserved, with
`sourceClockSource:"original-destination-windows-filetime"` and the exact
`windowsClosedFileMetadata` proof added. Legacy v1-producing functions and
historical result shapes remain unchanged.

The original destination's native16-command ceiling remains unchanged. Capture
uses exactly seven requests: three existing destination/root boundaries, one
file-handle acquisition and three same-file inspections (after the first copy,
after SQL/history and after the final full hash). The existing final release
uses one more. `assertClosedCaptureCapacity()` requires eight remaining slots
before any new file/watch allocation; the coordinator's busy reservation
serializes the sequence. Extra earlier inspections can therefore refuse a new
capture while preserving supported original cleanup; the cap is never raised.

Focused checks cover actual Linux FD/full SQL/initial-model qualification with
an explicit synthetic Windows metadata/path seam and exact seven-request count,
callback replacement refusal before file acquisition, unchanged destination
observations, capacity refusal, native metadata drift and retained cleanup.
Existing import/orphan/publication regressions pass. Both TypeScript projects
and strict type-aware lint pass. Native import/registration acceptance still
requires its original closed proof and fresh opening evidence.
