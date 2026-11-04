# Autonomous controller lifecycle and completed native cleanup

Prepared version `0.3.0+codex.20261104120101`, based on main
`8948ac54d48ddd51218cae2ca6fb26356a7c1653`. This follows the
[PR166 publication and fresh-agent handoff](2026-11-04-104500-pr166-publication-and-fresh-agent-handoff.md).
The user requested automation that avoids routine Codex restarts and manual
EasyEDA interaction, followed by continued implementation work.

## Implemented lifecycle

The new foreground manager keeps its own client process alive across controller
retirement and selection of a verified replacement. It validates canonical
package selection, pinned Node and bundle hashes, tool catalog and the actual
loaded-facade PID/module identity. These observations do not grant runtime
admission. Calls and their publication are serialized; results are retained in
bounded private evidence with separate normal, cleanup and control budgets.

Retirement requires the original facade's exact acknowledgment, then EOF and
separately observed exit and stdio closure of its original child. The client
does not signal or replace that process after an uncertain close. Official
marketplace installation runs separately between retirement and replacement.
Replacement selection consumes its original in-memory permit before startup.
This permits validation of frozen builds without publishing each intermediate
change or restarting Codex.

Semantic tool refusals preserve the original connection for explicit inspection
and supported cleanup. Transport/publication ambiguity prevents replacement.
An exact active-state inspection after a retirement preflight refusal permits
original cleanup before another explicit retirement. Evidence budgets preserve
a final retirement attempt after cleanup capacity is exhausted; an exhausted
manager finishes between controllers rather than admitting another generation.

An explicit `cleanup-startup` action closes only the manager's retained unused
failed-startup child through EOF and observed exit/stdio closure. It cannot retry
or promote a conflicting connection. Raw catalogs are retained before validation,
and failed startup/ready publication retains an inspectable original child.

## Completed workflow disposal

The new `easyeda_control_native_release` tool separates native helper disposal
from session retirement. Supported success paths cover project opening, PCB/SCH
rename, current symbol metadata and copy, and closed-symbol entries. Each uses
the actual original final generation, root/empty-Job termination, closed dispatch
scope, retired captures and settled records. Private opaque receipts become
completed only after the matching facade allocation callback succeeds.
Coordinator references and historical records remain retained.

Release intent and completion have separate bounded exclusive sidecars; released
journal/result schemas are unchanged. Failed completion publication after genuine
helper closure has an explicit records-only settlement path. It cannot invoke
native release again. Completed disposable metadata validation retains its
actual final inverse operation ID separately from the requested root operation.

Runtime helper release now preserves its original Promise across pending,
successful and rejected actual close attempts. A separate acknowledgment becomes
true only after original supervisor closure. Launch reservation and late helper
acquisition cannot revive released authority. A known launch-in-progress release
preflight refusal preserves original launch and cleanup ownership.

Review also fixed two integration traps: an ordinary SCH opening can retain an
empty rename coordinator, which now observes only its exact opener's genuine
disposal; and ordinary launch termination must be recorded before helper release,
so release cannot consume the runtime needed for that original observation.
Partial construction, unresolved failures and multiple unrelated retained roots
remain blocked with concrete reasons.

## Actual controller transition

After full installed-package and original process comparison, the restarted
Codex facade retired through its own supported tool and released its lease.
A review subagent subsequently initialized another idle facade and acquired that
lease before the first foreground client started. The first client refused an
unexpected catalog while that other owner held the lease. Its raw catalog was
not retained, so its specific tool names are not asserted. The owning review
agent then retired its own facade through its registered tool.

Before the startup-cleanup fix, the agent requested normal SIGTERM once for only
its own unused failed-startup child. A retained pidfd, exact parent/start/
module identity, absent control descriptor, no non-stdio sockets and no children
bound that request. The original manager observed exit and stdio closure with
code zero and no signal, then shut down normally. No host-owned facade or
EasyEDA process was signaled. That consumed attempt remains recorded; it was
not promoted or retried. The new startup-cleanup action removes this external
step from subsequent supported startup failures.

A genuinely new foreground manager then started the installed084035 facade and
acquired the lease. Actual loaded identity, original process/stdios/control
descriptor, pinned executable/profile and the complete installed package were
checked. All 2,525 files, 42 directories and 48,849,063 bytes matched the published
commit; its 998-file source and three-file runtime projections matched again.
The manager's own source/dependency inputs remained frozen through native work.
Codex stayed running and no further user interaction was requested.

## Disposable V3 cache lifecycle passed

A new installed084035 read-only cache case completed through that foreground
controller. The V3 startup wait used nine of sixteen samples at 1000 ms, observed
the loading window disappear and two exact ready inventories match. Original
native getter/match metadata, first observations and later fresh observations
passed for both upload-cache namespaces through one retained tuple. The native
getter was invoked once.

Cache-group release was acknowledged, normal close was requested once, and a
separate observation proved original root exit and an empty original Job.
Original helper release completed with no unpublished record. No abort, project
opening, CAD edit or explicit Save was issued. The disposable source remained
598,016 bytes with SHA-256
`e620d21af8ca0378b7a3960a10acdaadf894f216e93a034f698fd7e4795fb741`,
unchanged file times and no SQLite sidecars. The machine launch profile was
unchanged; no whole EasyEDA-profile or production-storage invariance is claimed.

An independent read-only audit checked all 17 V2 records, 26,521 bytes, canonical
links, seven result-prefix projections and 12 raw native replies. Chain SHA-256
is `e52fca713d0005a98e08195805888090dbf1cecc5ee35253bc51923eb5cd33bd`;
the private audit proof is
`62d4b5ec62046580f7303a0e882e8593132d554b5590ebeb834f22265696c725`.
The case is terminal and must never be replayed. Historical cache observations
grant no new owner, writer, replay permit or saved/reopened persistence proof.

## Verification and remaining work

Required dependency installation, dependency/signature/security audits, native
checks, strict types, zero-warning type-aware lint, bridge types/lint, coverage,
build, repository/MCP/all-skill validation and all seven quick skill validators
passed. Both emitted JavaScript bundles reproduced exactly. External upstream,
application, bridge, catalog and native helper pins are unchanged.

Offline tests exercise the maintained runtime/coordinators with synthetic native
transports, actual isolated MCP connections and retained child processes. They
cover cleanup acknowledgment/failure, original capture ownership, publication
settlement, startup conflicts and controller replacement. The separate root
integration slice passed 35 tests with no failures or skips. Earlier failed
checks and their corrections remain retained; overlapping runs are not summed.
The final manager-specific slice passed all 11 tests with no failures or skips.
The new native-release writer-family success paths have not received connected
validation on a later application generation.

The source projection contains 1,000 files with SHA-256
`1e308fcbcdec9afbcc7e41a64c66aa1d924c255ab9ef4bdc959f7b84fff81ae3`;
the three-file runtime projection is
`6090d6335cad50f41d70a10df9bbbf2433301825f030850ab9f45d0b670aad0d`.
The configured/restricted/current209 tool counts are now 54/29/18. The installed
synthetic catalog probe checks 57 queries and 59 requests. These counts do not
measure SDK method parity. Exact-commit CI, CodeRabbit review, publication and
installation of this batch remain separate subsequent stages.

Next work remains genuine writer birth, whole four-generation capacity and
original main/RPC/worker/task-2/publication custody; full copy/delete history,
SQL and saved/reopened lifecycles; native structure completion; library exports;
and the documented CBB/PCB reader gaps. Standalone cache success does not supply
the original tokens required by a future writer generation. The completed
read-only clock case is not repeated just because the package changes.

## Review completion and same-version follow-up

PR167's initial payload `b12918e91ccb717d5ca2359f6266ac535162b190` passed all
11 CI checks. The complete facade suite reported 14,065 tests, 14,060 passes,
five expected platform skips and zero failures; the bridge suite passed all
424 tests across 28 files. This is offline CI evidence, separate from native
validation.

The single requested `@coderabbitai full review` completed on that payload.
Across its automatic and full reviews, CodeRabbit reported five minor issues
and an optional docstring-coverage warning. The follow-up replaces three fixed
test sleeps with bounded polling for actual retained closure observations,
documents the trusted checkout working directory and cleanup-budget marker,
explains the exhausted manager's one-shot final retirement, and distinguishes
startup failures before child allocation. Ownership and lifecycle methods now
have purpose-specific JSDoc. No production behavior or signatures changed in
this follow-up; the independent stripped-AST comparison is retained privately.

The same foreground manager retired its installed084035 generation, observed
its original child exit and stdio closure, and admitted a second generation
from the frozen initial PR167 candidate. That second generation performed only
offline identity inspection. It then retired and closed with code zero and no
signal. The manager itself shut down with code zero before its frontend source
comments were edited. All 46 original durable manager records remain retained;
a truncated terminal inspection was excluded from the proof. Codex did not
restart during either transition, and no manual interaction was required.

The follow-up keeps version `0.3.0+codex.20261104120101`. Its 1,000-file source
projection is `edd9bc8b97d50a212d77114f9060dd427403bb32844582d5d7d0198c7b727eca`;
the three-file runtime projection is
`17d0d807d6c92a9c734c673179628e11b40d8311589c99edda46ed9ecebfce41`.
Both bundles reproduce exactly and all external compatibility pins remain
unchanged. Strict types, zero-warning type-aware lint and coverage checks pass;
the revised manager slice passes all 11 tests. Final-head CI, automatic review,
protected merge and installed-package verification remain subsequent stages.

The automatic review of `d93300aa37d49e44d1ba98a2e75a0d6919bed369` marked
the five original comments addressed and passed all five premerge checks,
including docstring coverage at 97.30%. One collapsed additional comment
identified imprecise wording about the final-retirement threshold. The guide
now requires inspection of the exact cleanup counters before dispatch and
states the three-record/4 MiB reservation. At 126 used cleanup records a
cleanup call can still fit while retirement is already final. This correction
changes documentation only; the source, runtime and version pins above remain
unchanged. Its final-head review and CI remain required before merge.
