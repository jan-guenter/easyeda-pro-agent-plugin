# Generation209 startup through preload, then script refusal

This disposable case used installed `0.3.0+codex.20261024161458` from main
`cd2ab88c39aff06ac2921ade99eebfcbf1659d51`. It follows the
[bootstrap release](2026-10-24-worker-bootstrap-root-batch.md) and preserves
the earlier [132442 refusal](2026-10-24-132442-connected-worker-startup.md).
The production project was not accessed. This was one new operation, not a
replay of a consumed opening.

## Actual admission and observed startup

Independent admission verified the actual facade, original Codex parent,
pinned Node24.18.0, arguments, environment, working directory and core limit.
All 1,878 installed files, 42 directories and 40,140,079 bytes matched the
published commit, including modes and the 665-source/three-bundle projections.
Main Linux and Windows CI completed successfully. The admission receipt is
identified in the release record linked above.

Native launch, browser/frame inspection and complete UI-source qualification
passed on EasyEDA `3.2.209.8a704eab`, Electron `41.2.1-jlc-sa-win-x64.6`,
Chromium `146.0.7680.188` and V8 `14.6.202.33`. The one opening observed the
selected disposable project/branch prefix with no editor tab yet.

The corrected transport accepted the generated worker target and qualified
both bootstrap and preload sources while paused. It consumed and observed
their original resumes. The next `Debugger.scriptParsed` event refused with
`SCRIPT`, surfaced as `PCB_WORKER_STARTUP_EVENT`. The expected project-import
stage did not retain a parsed script or qualify its source. No constructor,
assignment, channel or actor result was issued.

The final transport recorded the fixed preload log, but that flag does not
establish its order relative to the refusal. The retained listener can observe
the log while cleanup releases the interrupted preload. The failed script's
URL/source metadata was not retained, so this case alone cannot identify it.

Raw capture response SHA-256:
`a5538f4df220e573d57cb71c5ad0ab9d967fea5a7d2504ec2198a68d6ffd8743`.
Post-capture inspection SHA-256:
`8460519a34fbc517426d3b68a2dc68e8f493292604fb536b459a18a590ce6d34`.
Requests, replies, checkpoints, lifecycle records and admission evidence are
retained privately.

## Original closure and file evidence

The original owner observed its window, requested normal close once, proved
original root exit and original Job emptiness, and released its helper.
Final inspection reported `released`, no busy operation and no pending reply.
Generic project-opening consumption correctly remained true after the startup
failure and cleanup. The failed channel remained failed; closure did not turn
the capture into a successful result.

The disposable file remained 598,016 bytes with identical full-file SHA-256,
descriptor identity and timestamps. No WAL, SHM or rollback-journal sidecar
existed before launch or after closure. This is closed-file byte equality,
not a new complete SQL comparison. No explicit Save, CAD edit, restoration,
Save/Discard choice or force termination was issued.

Final inspection SHA-256:
`795ed74de87f060d7249eff85a49b54cbb5839c862c2fe4a6a964ed56de9c435`.
Closed-file observation SHA-256:
`eddb84ba9ace8bb005020966044dd642a11fa0a69a10b68bcb25340f2abdd0bc`.

## Follow-up source finding

The pinned preload contains an indirect-eval `funcCopy` helper. Four executed
initializers call it before the preload's final initialization log and before
the bootstrap imports the project-worker script. These generated functions
produce additional script events that the three-stage transport does not
model. This is a source-derived mismatch, not retrospective identification
of the unretained failed event.

The follow-up batch will qualify those fixed generated sources and their
original call sites before resume, and retain bounded script diagnostics on
failure. Arbitrary anonymous scripts remain outside the contract. Connected
constructor capture and the wider PCB/baseline/ratline integration remain open.
