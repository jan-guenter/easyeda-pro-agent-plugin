# Bounded readers and settled PCB held capture

Date: 2026-10-25. This batch starts from main
`90de2c6506019c118ef153c915188f4c124c11aa` and continues
[the runtime release, language and catalog batch](2026-10-25-runtime-release-language-catalog-batch.md).
It combines reader batching and the PCB held-import capture correction in
candidate `0.3.0+codex.20261025120638`. The excluded production project was not
opened or edited. No project navigation, CAD edit, explicit Save, restore or
manufacturing action was dispatched. Private evidence remains outside the repo.

## Installed payload admission and observations

The actual fresh host loaded `0.3.0+codex.20261025100748`. Its original facade
lease, Node 24.18.0, zero core limit and all installed bytes/modes were verified.
The package contained 1,969 files, 42 directories and 42,042,731 bytes, exactly
matching the merged main payload. Inventory SHA256 was
`a6ef83fa7160dac4562f072b2963459437f3f3ffed82b9fbf69f5acbb7492003`.
Its 706-source projection was
`0594aa8c6c160893bb0df162e7006fa68a32a2ae61f93f58ad4e2450c995577d`,
bundle projection
`c32466b8311c2b902505b806b8ebc28c0806ec77563a256237553b00e1f2ff94`
and manifest
`9eb3e5d80774582c9c0c88331f076b34d249f87dedeb544e581b6d020b52846b`.
Independent admission receipt SHA256:
`c4c3212c6cb4728ec14e4dad1886dd291acf2e58ebf02f00cc079f5d1146ab89`.
Both prior post-merge workflows passed that exact commit:
[Linux 40184864541](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/40184864541)
and [Windows 40184864535](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/40184864535).

The two new HTTP task equivalents each returned one candidate and reported
two requests. The footprint-name case used `R0603`; the LCSC-code device case
used `C1523`. Complete projected results, metadata witnesses, references and
qualification flags passed independent source-correlated review. Raw HTTP
bodies were not retained, so the review does not independently requalify those
bodies or request counts. Device public/path and association-ownership flags,
pin mapping, complete assets and exhaustive matching remain unverified. These
are vendor HTTP equivalents, not SDK execution or application authentication.
Catalog review receipt SHA256:
`e87d0c975116a5ee3b4357fe1fba13f51cdbd1ba797ac9c4a33008b37f8a6794`.

One ordinary launch authenticated the bridge on EasyEDA 3.2.209, public
API 0.3.59.1ca9efb5, UI 3.2.198.2800f583 and dispatcher `ded07x99dcxb504`.
The admitted upstream module graph contained 737 modules and 2,059 edges,
SHA256 `5150197d5e49c68c68ed8f17296bb38bf664d98ae74c7217e207c136cba3b32e`.
The connected fingerprint was
`79914aff76c3036bc21561251d51076b3e19cb25f1db3ae0e496f6f65a3398d1`.
The shell returned one active Start Page tab and no other tabs. This is a
registered-shell observation, not proof of window visibility or complete
profile restoration. `eda.sys_I18n.getCurrentLanguage` returned `en` in its
matching double observation. Fallback remains possible; provider success and
the private cached bus identity remain unverified.

Normal close was acknowledged once. The original retained root and Job then
proved termination. The new ordinary `release-closed` operation consumed its
bound release intent, reported helper transport closure and returned
`indexAllocationReleased:true`. Its response-envelope SHA256 is
`bea22cbf22c676265161e9aac73dc2aa29a63f48dd209b5f820c7d9ed3d53269`.
A new ratline-purpose diagnostic launch subsequently succeeded in the same
facade session. It was closed normally, observed terminated and released.
Every project/opening/capture stage remained unconsumed. This proves the
ordinary-to-diagnostic allocation transition and normal cleanup, not PCB
startup. There was no reason to enter the installed capture path whose
structural lifetime defect is corrected below.

The source-correlated review of shell, language and ordinary release retained
complete envelopes and verified all binding digest chains. Its receipt SHA256
is `41e5789b6e72861156b8177967e8c829370d05c9aad771a657f2100c84e65d02`.
The consolidated review, including the diagnostic transition, has SHA256
`9ec043e9f5cb9f9518ea6130152dce8ce2beaf469b82ac60e4affa8e35fed87d`.
It checks projected binding continuity and source-guarded states, not raw
diagnostic journal bytes or independent per-call facade process identity.
Neither termination nor helper release proves saved-state equality or discard.

## Reader batching

The existing public-reader tool now accepts either its unchanged single-method
request or `{action:"batch",requests:[...]}`. A batch contains one to seven
unique existing methods. It captures every requested namespace, method and
applicable UI/frame/bus owner before the first invocation. All retained owners
are rechecked around every await. One ten-second monotonic deadline and timer
cover two complete ordered passes. Any malformed result, changed owner,
deadline or second-pass mismatch refuses the whole response without retry.

Each member retains its original meaning and 8192-byte bound; the complete
batch is bounded to 65536 bytes. Observations are sequential, not atomic. Expiry
prevents acceptance and further calls but cannot cancel vendor RPCs or work
already running. Existing single-method generated programs are byte-identical.
No new SDK method, public tool, caller code or cached authority was introduced.

One batch uses four integrity checks and two status admissions, including the
status-owned checks. Seven separate calls use 28 checks and 14 statuses. This is a
source-derived call-count reduction, not a measured connected speedup. UI and
selector files are still verified before and after the execution when needed.
Discovery, exact argument validation, coverage, metadata and the installed
offline probe describe the new envelope while preserving the seven-method count.

Focused reader checks passed 36 tests, full types and strict type-aware lint.
Independent review accepted the complete generator, schema/helper extraction,
runtime, registration and tests. Review receipt SHA256:
`7b8f2c70bf7f61100f87d45140f1a7447e288ad485748546a691ae99c4b4bc6f`.
No connected call used the new batch envelope in this session.

## Held-import capture lifetime

Source review showed that the installed native path starts the full PCB
capture while deliberately holding the child at its final source import. Full capture waited for callbacks
that require that import to continue. Returning the child-source packet left
this future wait active, allowing it to poison the session later. This is a
structural lifetime mismatch, not evidence for a larger timeout.

A distinct internal held-prefix capture now owns exactly the original bridge
and factory pauses. It checks their fixed locations and relation programs,
removes both breakpoints, observes both parent resumes, reproves the realm and
settles. Its packet contains no result payload, world or terminal-return claim.
The corresponding startup wrapper retains the original creation, capture and
child-start owners, and does not invoke the full-only same-object comparisons.
Native publication awaits both successful child source qualification and the
settled prefix. Later original-packet checks reprove the retained prefix too.

Diagnostics distinguish `full` from `pcb-held-prefix`. Complete PCB/worker
capture still requires its original result and terminal callbacks. Native
classifiers, source profiles, request budgets, cleanup reserves and deadlines
are unchanged. Constructor-to-bridge identity, Worker-to-CDP identity,
callback completion, startup and execution-authority claims remain false.

The focused selection passed 32 tests, full types and strict lint. Actual V8
fixtures exercise the two pauses, owned breakpoint removal and observed
resumes. A fake clock advances beyond the former future-result deadline after
prefix settlement; original proof still succeeds. Wrong/extra events, lost or
copied owners, late allocations and cleanup refusals remain covered. One
initial negative test advanced its clock before its expected wait was armed;
that failed test was retained and corrected to explicitly abort after the
observed prefix. The production checks were not relaxed.
Independent review receipt SHA256:
`62a0037d181654a1ceba90a60cf0033f46f5abf5061f52d3c01de0ffc6d4bd66`.
These are source and offline results; native connected completion remains pending.

## Combined verification and remaining work

Pinned Node 24.18.0 / npm 11.16.0 with core limit zero passed clean install, complete
dependency listing, signature and moderate-vulnerability audits and sanitizer
verification. Final types, bridge types/lint, strict facade lint, generated
coverage, build, compatibility and skill/plugin/repository validators passed.
The initial integration selection passed 62 tests and failed two offline-probe
cases because its request cap still counted 19 queries after adding three batch
schema checks. The exact count was corrected to 22, followed by passing types,
targeted lint and the complete affected offline-probe selection. No live budget
or application guard changed.

Only facade source/bundle projections and review time changed in compatibility
metadata. The final 707-source projection is
`a1155ea52868b5d18b822e09d6b215cbc61be43059c7562ffb8e1c7b71ae3228`;
the three-artifact bundle projection is
`fb90f95bf4ce03b68b3357656bfc4ff3584aa7f9e82d5bb18c1b28d45759f66a`;
manifest SHA256 is
`9cef2f1eff3d69117246facfefd55d7e2fd0aa1097cfb8b2e5f89a9ed168025d`.
External implementation pins and sanitizer bytes remain unchanged.
The 835-method inventory remains 214 public-method, 34 native-equivalent, 6 HTTP,
79 blocked and 502 omitted; 399 runtime-guarded and 9 network-guarded routes.
Counts describe scoped implementations, not live validation coverage.

Remaining work after publication and installation:

- Admit the new actual host, then validate a bounded reader batch and the
  corrected held-import path on a disposable project. Do not repeat completed
  catalog/language/ordinary-release cases solely to make a newer record.
- Retain successful native origin evidence and qualify independent Worker/CDP
  identity for the custom EasyEDA runtime. Matching Chromium sources or a
  constructor-stack location alone does not establish the complete link.
- Implement worker/subordinate continuation, channel ownership, producer/queue
  relationships, callbacks, publication/copper completion and complete
  live/source/SQL plus saved/reopened persistence baselines.
- Qualify symbol-preview manager/cache cleanup. Footprint preview still depends
  on PCB startup. Continue broader schematic, library, PCB and manufacturing
  writers and exports, personal/account catalog routes and parser formats.
  Hidden annotation/Save All and unproved structure/SQL lifecycles stay blocked;
  concrete omissions remain in the exhaustive API inventory.
- Measure batching in connected use before claiming a latency improvement.
  Further scan optimization must preserve fresh admission and ownership.

Both JavaScript bundles rebuilt byte-identically; all 1,972 package files
retained their bytes and local modes. All seven official skill validators and
the official plugin validator passed. Artifact review receipt SHA256:
`7cb2a9f377b24499b7c8816afd66d49ae2f5e2f757e5e0b524b8ab2c177a564e`.
Local bundle mode0600 does not stand in for committed/install mode0644; final
package verification checks the installed modes separately. Exact-payload CI,
publication and installation evidence will be appended. The installed 100748 host remains the live owner for this
session; this candidate needs a fresh host before connected use.
