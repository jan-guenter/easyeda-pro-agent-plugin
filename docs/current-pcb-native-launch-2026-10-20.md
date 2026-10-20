# Native diagnostic launch: 2026-10-20

## Actual installed attempt

Installed `0.3.0+codex.20261020053706`, original facade719505, operation
`diag-native-053706-20261020-01`:

- `CreateProcessW` returned false with error87 and empty process outputs.
- The original helper proved no process was created, released its empty Job and
  pipes, and completed `cleanup-no-process`. Terminal state: `no-process-released`.
- No EasyEDA project was opened, no CAD command or Save was issued, and PianoPi
  was not accessed.
- Private receipts:
  `/root/.cache/easyeda-053706-native-diagnostic-live-bXHbzT5l`.

[Microsoft defines error87 as an invalid parameter](https://learn.microsoft.com/en-us/windows/win32/debug/system-error-codes--0-499-).
It does not identify which parameter. This result does not explain earlier
attempts that did not capture the native error.

## Synthetic isolation

The opt-in `pcb-diagnostic-launch-smoke.ps1` compiled the exact helper C#
declarations, leases, Job and pipe code plus a separate test-only entrypoint.
Its fresh child only validates two fixed arguments and returns0. No EasyEDA,
network, design access or forced termination is involved.

Original script SHA:
`fe5e722efaff4af0d1ed3a9c461ee3add8a625d6d3fd6401293d83c7d09ca4a1`.
Helper SHA:
`8060c09d393064992c5640829c6ac565660263d888cd24503ff6c3dddbcd4c58`.
Child SHA:
`1d76b0f2585a2d2b1ca8b61afc3e4a7b97b45d08b8f6d883e00c4fe88fa57b20`.
Retained generated child directory:
`C:\Users\JanGuenter\AppData\Local\Temp\easyeda-native-launch-b188d52df4334f74932fafc35e8ab1cd`.
Execution62128 completed with exit0.

| Fixed case | Created | Native error | Cleanup |
| --- | --- | --- | --- |
| GUID executable, GUID cwd, Job and handle attributes | No | 87 | Empty Job released |
| Only cwd changed to DOS spelling | No | 87 | Empty Job released |
| Only Job-list attribute omitted | No | 87 | Empty Job released |
| Only executable changed to DOS spelling | Yes | 0 | Original root exit0, empty Job, released |

Every comparison starts from the same baseline. Struct sizes were104/112/24
bytes for STARTUPINFO/STARTUPINFOEX/SECURITY_ATTRIBUTES. The fixture stopped at
the first creation and retained the original process handle through exit.

The executable-path spelling is therefore the discriminating parameter in this
synthetic case. This is not successful EasyEDA startup or portable qualification.
A plain DOS-path fallback would reintroduce a drive-letter mapping dependency;
it is not automatically an acceptable production fix.

## Stable-path candidate

[GetFinalPathNameByHandleW with VOLUME_NAME_NT](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-getfinalpathnamebyhandlew)
returns the NT device path from the retained file handle.
[Microsoft documents GLOBALROOT](https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file)
as a way to address the true object-manager root rather than a session-dependent
namespace. A fixed handle-derived GLOBALROOT image path needs its own synthetic
launch evidence before selecting it; general filesystem documentation is not
proof that CreateProcess accepts a particular spelling.

The fixed GLOBALROOT synthetic case also returned87 with no process created and
complete release. Child3d068f2c remains in the fresh
`easyeda-native-launch-f54373fd0a7a4cf892c0e269ea35d41d` directory. It is not a
fallback route.

## Implemented correction and evidence

The shared native launch core now uses the admitted DOS image spelling with
[CREATE_SUSPENDED](https://learn.microsoft.com/en-us/windows/win32/procthread/process-creation-flags).
Before resuming, it retains the original root/thread, proves original Job/PID/
creation-time/pipe/file identity, and compares
[the created process's native image path](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-queryfullprocessimagenamew)
against the NT path of the original retained executable handle. The expected
file and its ancestors remain leased against replacement.

Only this fixed launch core calls
[ResumeThread](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-resumethread),
once, and requires the previous suspend count to be1. There is no resume tool,
retry or forced termination. A post-create admission failure retains the original
root/thread, potentially suspended; it cannot claim no-process cleanup or an
available GUI close. Manual intervention may be needed in that exceptional case.
The GUID working directory remains, with an explicit MAX_PATH bound.

The fresh `VerifiedImageProbe` invokes the same private native core, with only
test-specific admission of its own pinned no-op executable. The child validates
two arguments, waits a fixed second, and exits0. Local execution82823 passed:
created image verified, primary thread resumed, original root exited0, Job empty,
all handles released. Helperf0ce8c88/87,455bytes; child SHA
`bb7aec6ccdd33cd4da2ceff0664aa320596444b27a0759e01785f996799659b8`,
retained directory `easyeda-native-launch-c5e4fd6fb6d34eff824fd905c8ba7045`.
Native CompileOnly also passed exact program parity, empty Job and pipe checks.
Windows CI now exercises this shared-core synthetic lifecycle.

This is successful synthetic process creation, not connected EasyEDA startup.
The installed053706 attempt is terminal and must never be replayed.
