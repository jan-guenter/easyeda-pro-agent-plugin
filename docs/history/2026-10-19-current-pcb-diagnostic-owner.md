# Retained PCB diagnostic owner

Historical delivered203733 scope below. The 2026-10-20 source continuation adds
native installation leases, separate lifecycle journals/shared startup exclusion
and fixed frame/script/context inspection; see
[the continuation record](2026-10-20-current-schematic-native-diagnostics.md).
That source work does not retroactively qualify the native launcher or the custom
EasyEDA build described here.

The source now connects the bounded Chromium byte transport to a separate
Windows helper. It implements the internal path from a new process and Job to
fixed browser discovery and normal closure. It has no MCP registration, no
runtime admission, and no connected EasyEDA validation. The ordinary launcher
and its no-argument contract are unchanged.

## Implemented native ownership

`scripts/pcb-diagnostic-owner.ps1` creates an unnamed Job with zero limit flags,
two anonymous pipes and four retained endpoints. The helper clears inheritance
on both parent endpoints and verifies all four types and inheritance flags.
It passes exactly the two browser endpoints in `PROC_THREAD_ATTRIBUTE_HANDLE_LIST`
and the original Job in `PROC_THREAD_ATTRIBUTE_JOB_LIST` to one `CreateProcess`
call. Both lists remain allocated until the call finishes. The browser receives
only `--remote-debugging-pipe` and its two internally generated pipe-handle
arguments. No TCP debugger port, caller-supplied handles or existing-process
attachment is accepted.

Microsoft requires inheritable handles plus `bInheritHandles=TRUE` when using
the explicit handle list. The Job list assigns containment during creation.
[Microsoft process attributes](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-updateprocthreadattribute).
The pinned Chromium source adopts these two Windows pipe handles and uses
NUL-terminated JSON. This describes the upstream contract; the custom JLC build
still needs qualification.
[Chromium handle adoption](https://github.com/chromium/chromium/blob/146.0.7680.188/content/browser/devtools/devtools_agent_host_impl.cc).

The helper keeps the original `CreateProcess` process and thread handles before
any later fallible work. It never reacquires the root by PID. A successful launch
checks original creation time, original process handle, current Job membership
and pipe ownership. The thread handle receives checked cleanup and remains in
the owner if that cleanup fails. Browser-end duplicates close after creation;
the parent endpoints remain owned until original root and complete Job exit.

`server/src/current-pcb-diagnostic-owner.ts` starts only this helper. Its fixed
PowerShell bootstrap opens the source with `FileShare.Read`, reads a bounded
complete byte sequence, checks the compiled-in SHA-256, decodes strict UTF-8 and
executes those same bytes. It keeps that source stream open for the helper's
lifetime. The source path is quoted as PowerShell data before UTF-16/base64
encoding. Independent source checks surround the facade's public operations.

## Discovery and failure behavior

The facade and native helper both restrict requests to `Browser.getVersion`
and `Target.getTargets`. The helper generates the complete command itself;
neither layer accepts arbitrary protocol JSON. It consumes monotonically
increasing IDs, allows at most 32 requests and reads at most 64 KiB per poll,
with an 8 MiB native receive budget. The facade passes those bytes through the
existing strict framing, duplicate-key, finite-number and UTF-8 checks. It waits
for the native write acknowledgment as well as the browser reply.

Only the owner writes the helper protocol. One operation holds its lock across
all transfer and observation steps. The helper rejects a different helper/Job/
root-generation binding. Normal close observes the unique original root's
application window and sends one `WM_CLOSE`; it never chooses Save or Discard.

Electron schedules `Browser::Quit` when the diagnostic pipe disconnects.
[Electron disconnect implementation](https://github.com/electron/electron/blob/v41.2.1/shell/browser/electron_browser_main_parts.cc#L439-L452).
Consequently, a malformed reply, timeout, write failure or stderr output never
ends helper stdin, closes the diagnostic endpoints, sends a process signal or
retries discovery. Diagnostic framing failure still leaves the healthy helper's
normal-close action usable. Loss of the helper protocol itself preserves the
original helper but cannot promise another API close; the user can close the
application normally.

On stdin EOF, the helper retains its native handles until both original root
and complete Job termination are observed. It releases endpoints only after
that observation. A late protocol error after release acknowledgment defeats
the facade's cleanup result, even when the helper exits with status zero.
Failed native handle closure retains that handle; the native retention loop
can finish remaining cleanup after a subsequent successful observation.

## Verification and remaining integration

Focused Linux tests use real Node child-process pipes and a synthetic helper
peer. They cover fragmented browser replies, concurrent calls, ambiguous
post-create replies, native write failure, malformed byte chunks, duplicate helper fields, stderr,
deadlines, source drift and errors after release acknowledgment. They do not
exercise Windows process creation or the installed application. The embedded
C# compiles under the Linux .NET SDK without executing its native methods.
A Windows CI step compiles it with Windows PowerShell 5.1 and constructs and
releases an empty Job plus anonymous pipes. It deliberately launches no
application. These are distinct levels of evidence.

Before exposing this owner through a runtime coordinator:

1. Add a capability-specific native installation proof for the executable,
   PowerShell, parent junctions, native file identities and application assets.
   The current machine profile pins Linux Node, upstream and asset paths; it
   does not qualify native PowerShell or Windows ancestor identities.
   `verifyOrdinaryLaunchInstallation` and `deriveWindowsRuntimePaths` provide
   reusable hashes and path derivation. The private `main-reference/native/Ancestry*`
   sources are implementation patterns, not qualified authority. The diagnostic
   helper's final executable hash and retained read lock do not fill these gaps.
2. Journal diagnostic launch intent and ownership alongside the existing
   application lifecycle and qualification flow. Qualify the custom JLC build
   on an explicitly disposable, project-free generation, including observed
   normal closure and absence of a debugger socket.
3. Add exact target/session, frame, worker, script bytes and execution-context
   ownership. Discovery currently returns raw browser metadata and grants no
   authority to attach, evaluate JavaScript, pause or invoke a PCB method.
4. Implement the complete pre-create compiler/model/queue and Save-participant
   observers, then the one-shot String create, complete SQL effect and fresh
   saved/reopened proof. The existing PCB writer remains unavailable.

Recovery also has a concrete limitation. A failure after native process creation
can expose its original binding through the same helper, but if the initial
`GetProcessTimes` call itself failed, the creation-time field is unavailable and
the facade refuses that incomplete binding. That case retains the native owner
and requires manual normal closure. It is not universal post-create recovery.
External termination of the helper cannot be prevented by these methods and
would close its operating-system handles; no graceful-shutdown guarantee is
made for external termination.

## Next integration batch

Target one disposable generation with native installation admission, separate
diagnostic-purpose launch/close/termination journals, fixed browser discovery
and exact frame/script/context inspection, followed by normal closure and full
Job cleanup. Share unresolved-launch exclusion with the existing application
owners. Keep the ordinary launcher's no-argument contract unchanged.

The diagnostic owner cannot be cast into `WindowsControlRuntime` authority
because its fields happen to match. Add a real original-owner integration or
keep a separate owner. Extend both native and TypeScript protocol allowlists
together for bounded attachment and context events. Invalidate ownership on
navigation, detach or context loss. URL matching alone is insufficient.

Worker binding must prove the actual project-worker association before it is
claimed. Fixed identity inspection should not pause the application. Any later
closure-scope inspection needs separately reviewed pause/resume ownership and
must refuse unavailable bindings. Complete PCB state observers and the writer
remain a subsequent batch, not a side effect of diagnostic access.
