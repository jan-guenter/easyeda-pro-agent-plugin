# Generation209 preload generated-script phases

This source change follows the `161458` disposable startup refusal. The installed
transport qualified and resumed the bootstrap and preload, then refused a
`Debugger.scriptParsed` event while expecting the project script. The refused
event's script metadata was not retained, so this report does not identify that
particular script conclusively. Cleanup completed without accepting startup.

## Source diagnosis and correction

The pinned preload contains two indirect-eval `funcCopy` methods. Four top-level
initializers call `wt.funcCopy(Is)` at UTF-16 offsets340896,349724,349743 and349762.
Each evaluates the parenthesized source of the same sorting function. These
initializers precede the `Zf` log at838851. The former three-script model omitted
the four generated scripts.

An earlier private review searched the literal spelling `eval(` and incorrectly
reported no eval path. The complete Acorn syntax-tree inventory finds the
indirect `(0,eval)(...)` calls. The original review remains retained with an
explicit correction. Also, the old `preloadLogSeen` flag could be set during
cleanup after the first refusal. It did not establish that the log preceded it.

The new sequence is bootstrap, preload, four ordered preload copies, then
project. Each copy requires the original source-qualified preload script and
execution context. Its parsed-event creator must be `funcCopy` at line7,
column42723 in that script. Its instrumentation pause must contain the anonymous
evaluated frame, that creator, and the specific original caller at line8,
column102962,111790,111809 or111828. The complete generated source must be646bytes,
SHA-256 `447abb67bca110f9560c4a4c8d4c370018a59a012cfb1098e561f7e3686f178b`.
Copied functions are created by EasyEDA's existing initialization. The agent
reads their source and resumes each original pause once; it does not evaluate or
call them itself.

The native instrumentation, full-source checks, distinct script IDs, original
context, per-pause deadlines and consumed resume records remain mandatory.
The preload log is accepted only after all four copies have qualified and
resumed, before any transport failure. Unknown scripts remain refusals, and
failure cleanup cannot mark the project source qualified.

The parsed-event failure record now retains bounded script/context identifiers,
expected stage, URL classification/digest/size, original-creator match and the
reported script hash. It retains no raw private URL, caller name or source.
V8's reported hash uses UTF-16 script units. The separate full-source admission
hashes UTF-8 text; these hashes are not interchangeable. The reported token is
diagnostic only. [Pinned V8 hash implementation](https://raw.githubusercontent.com/v8/v8/14.6.202.33/src/inspector/v8-debugger-script.cc).

## Broader generated-code inventory

The project-worker has eight further top-level function copies, four through
`Cr.funcCopy(No)` and four through `Lr.funcCopy(ec)`. They occur after full project
source qualification and removal of the initial instrumentation breakpoint.
They use the existing post-qualification anonymous-script event handling and add
no initial-phase pause or request. Their individual generated sources are not
independently qualified by this change.

The project-worker also contains a `setImmediate` polyfill's string-to-Function
branch and a codec worker's `importScripts.apply` path. The syntax-tree inventory
does not establish execution of those branches during project construction.
This update does not claim a complete dynamic code-generation audit.

## Validation and limits

A test-owned Node24 child executes an inert program containing only the pinned
copied function, its creator expression and four calls at the original
coordinates. The sorting function is never called. Real V8 parsed and paused
events establish the expected creator and distinct caller locations. Mutated
source, foreign script IDs and reordered callers refuse. A transport regression
checks bounded failure diagnostics and one-shot cleanup after an unknown script.
The existing real-V8 bootstrap test still refuses its inert imported preload.

Eleven focused tests pass; TypeScript and targeted strict type-aware lint pass.
These results do not establish a successful connected seven-phase startup.
The four extra source reads and four resumes add8requests: the source-derived
startup maximum becomes186. The existing256-command lifetime and224-command
normal-operation limit remain unchanged. A private startup-plus-PCB bound of251
does not preserve the32-command cleanup reserve and is not enabled by this work.

The final affected-suite selection also includes the existing bootstrap
lifecycle fixture, updated to seven phases, and the existing worker-startup
lifecycle suite. All20tests pass. The synthetic lifecycle fixture checks source
refusal, owner loss and lost resume acknowledgments at every phase. Its source
and construction substitutions remain test-only and do not admit vendor source.
Final types and targeted strict lint also pass.

The V8 source records only one creator frame in `scriptParsed`. Ordered caller
qualification therefore uses the original pause stack instead of assuming a
longer parsed-event stack. [Pinned V8 parsing and pause implementation](https://raw.githubusercontent.com/v8/v8/14.6.202.33/src/inspector/v8-debugger-agent-impl.cc).

Private evidence retains the complete syntax inventory, real-V8 fixture events,
original review correction and focused command logs. No design data belongs in
this report. Release, installation and connected outcomes are recorded by the
batch's separate release report.
