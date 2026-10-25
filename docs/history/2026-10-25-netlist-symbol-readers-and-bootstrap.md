# Netlist comparison, symbol lookup, utility readers and PCB bootstrap

Date: 2026-10-25. This batch follows
[the timing/origin release](2026-10-25-ratline-prefix-timing-and-origin.md).
The excluded production project was not opened or changed. Work uses the
existing disposable validation file and private evidence outside this repo.
No CAD edit, explicit Save, restore or manufacturing action was performed.

## Admitted release and terminal live observation

The actual host loaded `0.3.0+codex.20261025034840` from main
`3813f4c77912b3db29a32448ffcd162e9cf0e51a`. Independent admission matched
all 1,946 installed files, 42 directories, 41,571,788 bytes, process ancestry,
Node 24.18.0 and the original facade lease. Inventory SHA256 was
`439ee2d0b38c1590ac7e58b8b6fb18ce0c5212888260ace0ed859b8a8b72f9bf`.
The source projection contained 697 files with SHA256
`2d20bd19f1e8a90ff32e4092707cc34f142079b79d4c6aabe3461159b4577a98`;
the three bundles matched
`cd6093d257e52ca5b9a0a5c0dce091aff2c1ced61f91755860e282d938533a43`.
Post-merge main Linux CI 40162315928 is now successful. The prior record's
pending main-CI statement is historical; its Windows check also passed.

One original disposable launch completed project-worker capture. All nine
constructor pauses were retained; all seven project-worker source stages
qualified and resumed normally, with no first failure and the original
worker script observed loaded. This is connected evidence for the previous
release's project-worker timing correction, not complete PCB startup.
The next held-import stage refused with `PCB209_RATLINE_PCB_BOOTSTRAP_FAILED`.
No PCB child packet, ratline child start or native-origin result was obtained.
The old code did not retain the underlying cause, so this record does not
attribute that live refusal to the timeout defect found below.

Normal close was acknowledged, but the process remained alive. Windows UI
inspection failed before reaching the app. Using the user's existing explicit
termination authorization, the agent retained handles for the exact original
root and four direct same-image children, checked creation/image/parent
identity, then terminated the remaining original processes. The plugin's
original root and Job handles subsequently proved exit and an empty Job.
The helper was released and final inspection showed no pending replies or
publication settlement. This was authorized termination after normal-close
acknowledgment, not a claim that normal close completed. No host facade was
killed and no Save/Discard prompt was answered.

The complete disposable file remained 598,016 bytes with SHA256
`e620d21af8ca0378b7a3960a10acdaadf894f216e93a034f698fd7e4795fb741`.
File identity and modification/change timestamps were unchanged; no SQLite
sidecars were present before or after. The case is terminal and its launch,
navigation and observations must not be replayed. Private request, response,
process and file evidence is retained outside the repository.

## New bounded adapters

`easyeda_control_netlist_files` prepares exclusive managed artifacts from
supplied ASCII Allegro `.tel` text and compares two exact descriptors through
`sys_Tool.netlistComparison` on the authenticated 3.2.209 profile. Preparation
contacts no app; comparison requires the actual fingerprint and serialized
authenticated bridge scope. Inputs are at most 64 KiB each, with complete subset
recognition, duplicate/dangling-reference rejection and an independent
membership model. Native File bytes are hashed before the public call. Two
complete SDK samples must match the model and each other.

The vendor compares footprint/designator and net/pin membership only.
Component values and properties are excluded, so an empty difference list is
not circuit equivalence or ERC. String arguments are document UUIDs and can
enter project-worker code. The `.enet` parser can retrieve project library
assets; the declared object overload has no implementation branch. These
and other parser formats remain omitted. Actual results use NET/COMPONENT
and net1/net2, which differ from declaration names. The adapter preserves the
actual complete rows rather than treating parser failure as equality.
Eight offline cases ran exact installed parser/comparison closures against
an independent model. File reading and the extension selector were stubbed;
these cases did not validate IPC, the live UI or installed execution.

The public reader tool adds current theme, global toolbar unit and the fixed
system-library UUID. Each uses the public method, exact UI/selector pins and
retained method/RPC/window ownership. Toolbar units do not establish document
coordinates. The system UUID does not enumerate or authorize other owners.
The three existing language/viewport methods remain separately scoped.
Async readers and netlist comparison use a monotonic 10-second deadline checked
around every await; late replies cannot dispatch another sample. Vendor RPCs
cannot be cancelled by this timer. The 60/70-second facade waiting bounds are
separate. Method checks retain descriptors and prototype chains without
invoking replacement getters.

`search-symbols-by-name` adds one fixed anonymous system-owner JSON lookup to
`easyeda_control_catalog_components`. It returns the complete bounded set of
up to 20 candidates with case-sensitive display-name equality flags. No exact
or exhaustive match is promised. The response must establish the exact
system owner. A supplied docType must be2; otherwise a bounded native header
must establish ordinary SYMBOL1.0/HEAD.symbolType2. Supplied representations
must agree. Only the first two JSON records, at most8192 UTF-8 bytes together,
are parsed with duplicate-key rejection. No drawing geometry is interpreted
or source projected. Missing public/path flags remain unverified.

Three authorized anonymous R0603 requests were retained: two module refusals,
then one bounded raw-response audit. The 4172-byte HTTP 200 body, SHA256
`b53ebbcd279305b9c442ebb12b9380494956d5bb353cbcfdd49f4195252a8977`,
had one system-owned ordinary symbol but no docType field. The final decoder
accepted this retained body offline using its header. No fourth request was
made. This is retained-response decoder qualification, not live execution of
the final module, an installed route or the SDK. Earlier refusals remain.

## Concrete desktop library omissions

The source findings use API 0.3.59 SHA256
`e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1`,
UI 3.2.198 SHA256
`3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6`
and desktop main SHA256
`52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c`.
Offsets below are UTF-16 code units.

- Symbol property search at API 1332103 supplies user_uuids but no path.
  Desktop path checking at 2339578 reads body/header path; the controller
  at 2341980 calls that check, and service 2252591 selects the path's database.
  Proxy 2575377 does not route by user_uuids. Response wrapper 2580567 can
  turn errors into success:false, which the SDK may collapse to an empty
  list. The complete middleware fallthrough was not traced; this does not
  prove an unconditional live failure. Supplying desktop path needs separate
  database routing/initialization qualification. The HTTP task equivalent
  does not implement or repair the direct SDK method.
- Device property search at API 1335115 supplies uid without the local
  controller's required path. System uid can select the proxy under
  HALF_OFFLINE plus NETWORK. The local controller at 2364775 selects storage,
  and hidden 3D/name-filter searches add unqualified asset and owner effects.
- All/personal/favorite-library getters route through UI 17214731 to refreshed
  client lists. K2 at 8969923 rebuilds client library lists; j_e at 8972609
  clears/rebuilds classifications and selects a category. These getters
  mutate library UI filters. Desktop CLIENT rows can also leave PERSONAL/STAR
  getters undefined; the all-libraries handler filters multiple categories.
  Backend refresh/storage effects remain unqualified. The fixed system-ID
  getter does not establish a passive general owner-list route.

Primary API references:
[netlist comparison](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_tool.netlistcomparison.html),
[symbol property search](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_symbol.searchbyproperties.html),
[device property search](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_device.searchbyproperties.html),
[library list](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_librarieslist.html).
Declarations describe contracts; installed source and observations establish
the narrower behavior above.

## PCB timeout composition and diagnostics

The source owner previously applied one 2.5-second wait to serial owner,
request and owner checks. The ancestry caller similarly allowed four request
windows for four snapshots, although each snapshot also checks its owner
before and after the request. The aggregate bounds now follow that graph:
ancestry 30 seconds, source send 7.5 seconds, resume 10 seconds and complete
source release 52.5 seconds. Individual owner/native request and first-pause
limits remain 2.5 seconds. Byte-derived source windows, native counters,
request/byte/event caps and the original launch deadline remain unchanged.

The original allocation promise survives timeout so its late breakpoint handle
can reach cleanup. Allocation uncertainty starts at actual dispatch, not an
earlier owner check. Failed-state event delivery to the retained realm remains
available for cleanup. Public inspection preserves bounded first-failure
reason/stage/step and command/event classes across source owner, context
router, native session and channel. Only fixed owned codes or SCHEMA/UNCLASSIFIED
are exposed; exception getters, proxy hooks and remote text are not invoked or
published. These changes have source and synthetic regression evidence; they
have not run in the installed host. They do not diagnose the old generic live
refusal retroactively.

Independent review caught and corrected an inner breakpoint timeout that would
have lost the original late reply, a failed-state gate that would have dropped
cleanup events, and diagnostic classification that accepted arbitrary prefixed
text or invoked Zod exception getters. All corrections remain in this batch.

## Batch state and remaining work

This record is written during implementation. Source review, final checks,
publishing and installation results will be appended without rewriting the
observations above. New methods remain unvalidated on the installed live host.
The inventory has 835 distinct methods: 214 public subsets, 34 native equivalents,
4 vendor HTTP equivalents, 79 implemented but blocked and 504 omitted. These
aggregate statuses include older profiles and are not counts of callable
3.2.209 methods. The 3.2.209 registration has 15 tools after this batch.

After installation, admit the actual fresh host before connected validation.
Complete PCB bootstrap and original child identity remain open, followed by
subordinate continuation, cross-realm channels, producers, queues, callbacks,
publication/copper completion and persistence baselines. Structure/SQL writer
lifecycles and hidden annotation/Save All remain blocked. Symbol PNG preview
still needs manager/cache cleanup qualification; footprint preview depends on
PCB startup. Personal/device searches and other parsers need the concrete
qualifications above. Broader schematic, library, PCB and manufacturing
adapters retain their individual coverage reasons and saved-result needs.

Candidate install version: `0.3.0+codex.20261025065826`. Publication is not yet claimed.

## Same-batch first-child correction

Before publication, the same serial-wait issue was corrected in the admitted
first-child path. Its ownership check performs three serial parent proofs,
so its aggregate is 7.5 seconds; send is 17.5 seconds, resume 20 seconds and
complete arming 97.5 seconds. Private dispatcher-created PCB transports carry
the fixed composition profile. Standalone runners and worker/subordinate
transports retain their existing request/arm windows. Native allocation expiry
at 2.5 seconds revokes authority while the original promise remains available
for late-handle cleanup; settlement also checks monotonic elapsed time when a
timer callback was delayed. Child inspection now retains its own bounded
first-failure record.

The existing 27.5-second creation watchdog, 32.5-second capture-pause limit,
91.94-second capture wait, 2.5-second first-source-pause limit and total launch
limits remain independent constraints. The larger aggregate arming window is
not a guarantee that those other constraints allow the whole attempt to finish.
No recursive/subordinate startup, child continuation or new writer is admitted.
The source graph and focused callbacks establish only the scoped composition.

The follow-up's 62 focused tests and strict type-aware lint passed. Independent
review accepted the production changes. The earlier 46-test result is retained
for its earlier payload; neither result is connected execution validation.
The mandatory installed offline probe now includes the new netlist, six-reader
and six-action catalog schemas, for 19 discovery queries. It still selects an
isolated synthetic older profile with 26 exposed tools; 51 explicit approval entries remain configured in the
package and the current 209 profile registers 15. The new 209-only netlist tool
uses the existing default prompt policy, like the other 209-only routes. These counts describe different
scopes and must not be conflated.

The initial package validator refused an extra explicit netlist approval entry
because the maintained map describes the legacy catalog. That redundant entry
was removed; the unchanged default prompt policy covers 209-only tools. No
validator or approval mode was relaxed. The first refusal remains in private
verification logs.

## Local release verification

Candidate `0.3.0+codex.20261025065826` passed the required local non-suite
checks on Linux x64, Node 24.18.0, npm 11.16.0 and core limit 0. Dependency tree,
signatures and moderate-severity audit passed with zero vulnerabilities.
Facade and bridge types/lint, coverage, generated protocols, sanitizer, build,
compatibility, seven skills, package/MCP contract and repository checks passed.
Strict type-aware lint has zero warnings. All seven skills also passed the
official quick validator, and the official plugin validator passed.

Focused results include 36 netlist/utility runtime and program tests, 8 initial
registration/mode tests, 10 symbol lookup tests, 59 final coverage/registration
tests, 62 final startup tests and 6 installed-offline probe tests. These groups
overlap and are not a total suite count. The only initial root lint refusal
was a shifted existing import-limit annotation; its narrow documented scope
was preserved. One coverage test needed to recognize the netlist catalog's
root union schema. Initial failures remain retained. Complete facade/bridge
and Windows verification is delegated to exact-final-commit GitHub CI.

The final source projection has 704 files, SHA256
`47696e3fc517cc898d016a98a5252ba66e08e98b4801c115917761d5321046ed`.
The three-bundle projection is
`38f42ea0eceb35f3d59e46cf993e08daf0c0c8cd482e091c7606c3b3ada6dc28`.
A second build reproduced server SHA256
`028813c239f118c237b1968d2e30e4e7ccee3aa01bed18e215dac8bb3f18cc21`
and supervisor SHA256
`e8c22737d52a182cc0ec12ccfaed1f978a4c5b78867c0c76ddb3d2f8aa6ccc95`.
Independent review rehashed the complete source/bundle rosters and confirmed
that only allowed facade projections and review time changed. Upstream,
SDK/UI/bridge/runtime and sanitizer pins are unchanged. No new connected
validation is claimed by these package checks.

## Initial CI failure and catalog assertion corrections

PR 123's initial head `f3ac8afc8e1bef21a8c7c6d02668fd4edaa09a86`
passed the Windows recovery job in run `40172351826`. Linux run `40172351806`
passed the build checks and six of eight facade shards. Shards 4 and 7 failed
three stale catalog assertions: packaged startup still expected fourteen tools,
the network-route total still expected six, and the system-library getter still
expected one route. The latter test also retained the older generic reason for
omitting account-library discovery. The complete failure logs are retained.

The corrected tests require all fifteen packaged tools, seven network routes,
and both system-library readers. They check the new symbol-name route's HTTP
classification, the separate reader profiles and regression evidence, and the
three account getters' continued exclusion with their concrete UI-mutation
reason. The complete affected startup file passed six tests; the two coverage
files passed nine. Strict type-aware lint passed without warnings. No runtime
source, bundle, compatibility pin, approval policy or refusal check changed.
These local corrections require a new exact-commit full CI result before release.

## Publication, installation and continuation

Final PR head `59514ad3baace7cc0449b96a1de489ff8d154de1` passed Linux
run `40173610771`, including all eight facade shards, build and aggregate,
and Windows recovery run `40173610832`. Protected
[PR 123](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/123)
merged as `a2b1c3fede0f229ab69e8fba346451b1560b04f1` on 2026-10-25.
The merged full tree `1172267b77d3d94157da98b2b7fb3be74390ec87` and
plugin tree `d74f6d37e61cffe26a652c9ab9f16ed78e3832ce` exactly match
the tested payload. The earlier CI failures remain recorded above.

The official CLI upgraded Git marketplace
`https://github.com/jan-guenter/easyeda-pro-agent-plugin.git` and installed
and enabled `0.3.0+codex.20261025065826`. The marketplace checkout equals
merged main. All 1,962 files, 42 directories and 41,867,125 bytes match the
committed payload and exact modes, including after the final CLI listing.
Installed inventory SHA256 is
`8e69cf1cb930e2fe59f773061182332eedab55a95eaf7d5768a3ede7eaa0b6f4`.

The installed offline probe passed all 19 catalog queries, 21 requests total,
using pinned Node 24.18.0 and the configured launcher. Its synthetic older
profile exposed 26 tools, with the existing 51 explicit approval mappings.
The probe observed its own child's clean EOF exit and sampled no upstream
descendants or bridge sockets. This is offline package verification, not
continuous isolation or admission of the actual host. No cache was patched,
host facade killed, bridge key changed or new extension import performed.

At handoff, post-merge Windows run `40174613578` passed and Linux run
`40174613632` was still running. The exact PR payload already has complete
passing CI. This publication appendix is retained locally for the next batch;
it does not change the installed plugin or require another package version.

The actual current Codex host still loads `0.3.0+codex.20261025034840`.
A fresh Codex session must load and admit the installed version before another
connected call. The earlier disposable ratline case is terminal and released;
its complete file bytes remained unchanged. No CAD cleanup or Save is pending,
and the excluded production project was not opened or edited.

Continue with actual-host admission and one new disposable PCB startup case
using the bounded first-failure diagnostics. Validate the new netlist and
public-reader routes separately; the retained HTTP response is not live proof
of the installed symbol-search route. The PCB, preview, continuation, writer
and export backlog described above remains open. Do not replay the earlier
consumed startup or create another release solely for this handoff appendix.


## 2026-10-25 post-merge CI completion and next batch

The previously pending post-merge Linux run
[40174613632](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/40174613632)
fully passed, including the build and all facade shards. Windows recovery run
[40174613578](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/40174613578)
also passed. Both ran main `a2b1c3fede0f229ab69e8fba346451b1560b04f1`.
The earlier pending statement and all original evidence above remain unchanged.

Actual installed-host admission, the next bounded connected reads, the refused
pre-allocation PCB launch, and the combined language/catalog/runtime-release
follow-up are recorded in
[the next batch](2026-10-25-runtime-release-language-catalog-batch.md).
This correction grants no replay or new execution authority.
