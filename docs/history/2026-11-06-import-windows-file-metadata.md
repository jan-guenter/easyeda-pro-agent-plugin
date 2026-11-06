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
Actual Windows5.1 compilation and connected metadata capture remain root-owned
prerequisites. Direct closed-import qualification integration follows in its
separate new report schema; old persisted v1 reports retain their shape.
