# Original main-process construction diagnostic

Use this separate purpose when developing or validating the native footprint
backend adapter. It observes the original application's main process. It does
not open a project, create or delete an asset, invoke a backend request or Save.

Query `easyeda_control_api` with `action:"footprint-main"` and
`query:{includeSchemas:true}`. Validate each assembled inner request with
`action:"footprint-main-validate"`. Send it to
`easyeda_control_pcb209_worker_startup` as
`{request:{action:"footprint-main",request:{...}}}`.

Use a new `footprint-main-*` operation. Existing worker, renderer, preparation
and saved owners cannot become a main-process owner. Launch requires the three
existing-profile confirmations and `acceptDebuggerPauseEffects:true`. Existing
profile startup can use the network and restore or automatically persist files.
Do not use production projects for validation.

After launch, retain the returned binding digest. `observe-main-construction`
takes only the operation ID and `expectedBindingSha256` and runs once. The
native owner discovers its own inspector endpoint from retained stderr, then
checks its original root/Job/image handles and the reciprocal established TCP
connection. A supplied URL, PID or historical receipt cannot replace that owner.
Other local debugger connections are not proved absent.

The fixed collector arms the app registration breakpoint before continuing
startup. An initial internal Break-on-start pause may consume one continuation.
The actual app.js source and resolved registration location must match before
lexical evaluation. It retains the original protocol callback, backend receiver,
driver callback, router, actor/SQL functions and native Date.now. It invokes none
of those application functions. A captured function does not prove a real
request context, selected project SQL service, actual actor or native document
clock result. Registration completion and responder exclusivity remain unproved.

The main inspector has its own fixed 64 normal and eight cleanup requests,
72 total, independent from renderer request IDs. Normal work has one hour from
original native owner construction, with a separate 60-second cleanup reserve.
Neither stage calls nor attachment reset that lifetime. Attachment has a
ten-second deadline and protocol replies have a separate 20-second deadline.
Callers cannot choose a URL,
protocol method, script, budget or inspector session.

Inspect after a missing or failed response. Never repeat observation or startup
continuation. A main pause can precede window creation. For authorized diagnostic
cleanup use `terminate-main` with the exact binding and
`confirmTerminateOriginalDiagnosticJob:true`. This consumes one termination
attempt against the original retained Job, including its children. It is a force
termination and may lose automatically restored unsaved state. Apply the user's
actual authorization; routine discovery grants none.

Separately call `observe-termination`, then `release-closed`. The original root
must have exited and its Job must be empty. A termination acknowledgment alone
does not prove either fact. Inspect the final state and use `settle-records`
only if `publicationSettlementAvailable:true` remains. Preserve failed attempts
and their original owner until cleanup finishes. No captured construction packet
grants copy, inverse/delete, document-clock, writer or saved-content authority.

Electron documents a separate main inspector and first-line pause for
`--inspect-brk`; renderer DevTools cannot provide this process's objects.
[Electron main-process debugging](https://www.electronjs.org/docs/latest/tutorial/debugging-main-process),
[versioned command-line switches](https://github.com/electron/electron/blob/v41.2.1/docs/api/command-line-switches.md#nodejs-flags).
The kernel connection comparison uses Windows owner-PID TCP rows. Ports are
decoded from network byte order; listener remote fields have no defined meaning.
[Windows TCP table](https://learn.microsoft.com/en-us/windows/win32/api/iphlpapi/nf-iphlpapi-getextendedtcptable),
[owner-PID row fields](https://learn.microsoft.com/en-us/windows/win32/api/tcpmib/ns-tcpmib-mib_tcprow_owner_pid).
