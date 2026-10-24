# Generation209 project-worker startup refusal and cleanup

This case used installed `0.3.0+codex.20261024132442`, from merged main
`e49f765d556dc8767380f25cba9e993bcbbfd6f1` and
[PR115](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/115).
It continues the [startup release](2026-10-24-startup-baseline-clock-batch.md).
The only project opened was the previously identified disposable validation
fixture. The production project was not opened or changed.

## Admission and terminal CI

Independent admission verified the actual fresh facade and its original Codex
parent, executable, startup arguments and working directory. Its packaged
inventory matched the installed Git marketplace payload: 1,861 files and 42
directories, 39,952,667 bytes, with exact committed bytes and modes.
Inventory SHA-256:
`5a435509021011d8a4d260757dce73741387b187c35fd776f5e6e24bf1d05094`.
The657-source and three-bundle projections matched the final release report.
This establishes host/package admission, not native worker ownership.

Main [Linux40100942430](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/40100942430)
and [Windows40100942381](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/40100942381)
both completed successfully for that main commit. This is the terminal update
to the previous report's pending main CI statements.

## One consumed startup attempt

Launch, browser/frame observation and complete UI-source qualification passed
on EasyEDA `3.2.209.8a704eab`, Electron `41.2.1-jlc-sa-win-x64.6` and
Chromium `146.0.7680.188`. The one project-opening prefix returned the expected
project, branch and window identities. No editor tab was reported yet.

Constructor capture then refused with `PCB_WORKER_STARTUP_EVENT`. Its retained
first event failure was `Target.attachedToTarget / WORKER_URL`. Three existing
workers had been inventoried and attached; the fourth attachment triggered the
failure. Worker source qualification and initial instrumentation pause had not
completed. Assignment, channel and actor stages were not attempted.

The response did not retain the rejected target's URL or title. Therefore this
case alone cannot identify that target as the project worker or another worker.
The successful opening prefix does not establish completed startup, completed
constructor capture or absence of normal-open persistence effects.

Raw capture-response SHA-256:
`66a9ecfe0872b8e6f965fff13d22eb1d0a52065f9af0299b598c95a8048645c5`.
Raw post-failure inspection SHA-256:
`51aea6af7eada8f0a7c818cbf372165683927cf7b3be01f368bc14f52e94d2a0`.
Requests, responses, original lifecycle journal and native evidence are retained
privately. The attempt is consumed and must not be replayed.

## Original cleanup and file result

The original owner observed its window, requested normal close once, then
proved both original root-process exit and original Job emptiness. Its helper
released normally. Final inspection reports `released`, no busy operation and
no pending replies. No Save/Discard prompt was answered, no explicit Save or
force termination was issued, and no CAD edit was attempted.

The disposable file was598,016 bytes before launch and after original closure,
with the same SHA-256, descriptor identity and timestamps. No WAL, SHM or
rollback-journal sidecar existed at either observation. This is byte equality;
no new complete logical SQL comparison is claimed.

Final raw inspection SHA-256:
`ad2c0088f90b1c21b274cc2d974365231f0156e942e1880b0411961b9aed3d4b`.

## Follow-up source finding

The fixed209 project manager constructs a worker from the generated
`editor?entry=mgr-project-worker.js` bootstrap. That bootstrap imports
`preload.js` and then `project-worker.js`. The existing209 transport instead
requires the target URL itself to be the imported project-worker asset and
assumes only one script before constructor capture. Exact installed-source
inspection establishes this mismatch independently of the unretained failed
target URL.

The follow-up batch separates target identity from imported script identity,
qualifies bootstrap/preload/project phases and retains bounded failure metadata.
It also corrects lifecycle summaries: a worker-startup opening remains consumed
in generic project-opening status during cleanup and after host restart. A
failed opening never becomes a published successful project result.

This report records a refused connected attempt and terminal cleanup. It grants
no constructor, writer, Save or reopen validation.
