# Candidate 204104

`0.3.0+codex.20261011204104` is published and installed through the GitHub
marketplace. Local release checks, exact-head CI and installed offline proof
passed. Production designs and their project records remain untouched. Both
disposable editors are normally closed. A fresh Codex host is required before
connected testing of this generation; the broader API task remains unfinished.

## Changes

- Confirmed native `hover` moves the pointer once without button or keyboard
  input. It checks the exact foreground window, bounds, current recipient and
  process/thread ownership, observed mouse capture and held buttons. Position
  readback is required. Owned dialogs retain a bounded owner chain to the
  admitted root process. Window reuse and malformed or contradictory failures
  refuse conservatively. A hover acknowledgment does not prove a menu opened;
  sampled button state is not an atomic guarantee against concurrent input.
- `lib_LibrariesList.getSystemLibraryUuid` accepts empty arguments and returns
  only a nonmissing 32-character lowercase-hex identity from the pinned public
  implementation. It has no hardcoded fallback or account/library enumeration.
- The two `sch_Primitive` explicit-ID readers return native root Text and
  Wire/Bus DTOs, not SDK instances or every object family. Singular returns one
  DTO; plural preserves caller order. One retained page/tree/index/source and
  complete mixed-family proof precede selection. Missing, unsupported, descendant
  or wrong-owner selectors refuse the whole call. Combined bounds and two
  captures plus final scalar reproof include unrequested modeled objects. No
  compiler, serializer, public family wrapper, navigation or Save is called.
- Skills now document these contracts and the observed overflow-menu behavior.
  The schematic reference explicitly marks the old compiled-topology reader as
  disabled because its native implementation can annotate and Save All.

These additions have reviewed source and adversarial offline tests. They have
not been executed against EasyEDA. Their implementation does not establish
atomic isolation, complete source/connectivity proof or saved-result support.

The inventory has 774 method paths: 193 public subsets, 102 native equivalents,
two lifecycle-only methods, seven implemented-but-blocked methods and 470
omissions. Routes comprise 357 available with runtime guards, nine blocked and
three partially blocked. There are 181 fixed readers, including 20 native
equivalents, 108 design schemas, 68 library schemas, 26 tools and seven skills.
These are implementation counts, not whole-method or live-validation counts.

## Completed connected cases on the preceding generation

Installed164600 passed singular and one-element plural reads of one PCB STRING,
explicit-black v2 text creation and its separate saved deletion, and closed
free-schematic-container creation. Independent retained-evidence review proves
the bounded effects and complete unchanged peers. The append-only
[connected validation ledger](2026-10-11-through-2026-10-19-api-connected-validation-ledger.md) records exact
generation bindings, tested arguments, hashes and limitations. These cases do
not transfer to this new candidate automatically.

The separate flat fixture opened unchanged. Wire setup was interrupted by an RDP
lock before a later bend click; that click refused before dispatch. After the
session recovered, the unfinished preview was cancelled and the application
closed normally. No wire/LINE addition, Save or prompt choice occurred. Exact
source remained unchanged, and the closed database/checkpoint/logical dump and
all nine retained backup-directory metadata inventories still match baseline.
This is a clean stopped fixture, not a wire-reroute validation result.

## Local verification

Clean Node24.18.0/npm11.16.0 installation, 151 registry signatures, 40
attestations and a zero-vulnerability audit pass. TypeScript and strict
type-aware Oxlint pass with zero diagnostics. Root and independent focused
reviews pass. The final full suite passes 3,681 facade tests with one
platform-specific skip and zero failures, plus all 424 bridge tests. Inherited
descriptors142/145 and the test-isolation preload remain active. All seven
official and packaged skill checks, repository/privacy, package, licenses,
workflow lint and offline doctor pass. No external official plugin validator is
installed on this host; the maintained validators all ran.

Final full-verification log:
`151ac85140ba7089a023c8b128fd2769a37d29aa896109f21aa0b2122ecb2a62`.
The initial full run passed 3,680 tests with one failure and one skip. Its native
reader catalog expected the old list. Adding exactly the two newly admitted
method literals preserved the exact-list and behavioral assertions. All 71
focused tests and the complete corrected rerun pass. The initial failed log is
retained as `bd2de34123335260a59e973c4e1303db3f4f11472d06a204162204069fa7e936`.

The rebuilt facade bundles and descriptor sanitizer match the frozen bytes.
Two independently packaged synthetic-key bridge archives also match. The first
synthetic attempt refused an output outside its reserved build subtree; it made
no live bridge change. The corrected private path passed. No real bridge key,
import or build receipt was changed.

Reviewed source203-file fingerprint:
`234eb8aa7f8263649ac654ac513ff318b0ac68a23fb22bf52aa970593b512556`.
Three-file runtime fingerprint:
`c4d9b3243e4679c55914b340813193fcd34878cc4a92b05e47dded2015fc6802`.
Compatibility manifest:
`00e5fac66a3044ce7f057ecee1cad3d3414ae29c1ebbf74a6f2ec39ea3944f32`.
External application, SDK, bridge and sanitizer pins have not been refreshed.

## Publication and installation

Payload `10972c0d68b11f87fffa5570c74c2294e1068aba` passed
[CI38174294732](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/38174294732)
in [PR9](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/9).
The PR remains draft for the unfinished broader task. CI passed 3,678 facade
tests, four platform skips and zero failures, plus 424 bridge tests. Compared
with the local run, two installed-Windows source-body checks and one Windows
desktop diagnostic skip on the Linux runner. Both environments retain the
mounted-drive fixture skip. CI also passed audits, strict lint/types, all
maintained package/repository checks, reproducible builds and artifact upload.

The official CLI upgraded the configured Git marketplace
`https://github.com/jan-guenter/easyeda-pro-agent-plugin.git` under umask022.
It returned no errors and lists the plugin installed/enabled at204104. The
marketplace checkout HEAD equals the payload commit. Its plugin subtree is
`fe9acf1d0da7caa942a6ac3599efc7b337995709`; root-only follow-up records do not
change that tested package.

Installed verification compared all 628 files, 16,896,277 bytes and their Git
modes, with no extra files or changes during the probe. Inventory commitment:
`4ede1a212136aa657eed6d171bcc7d6bcc0d1b708d7ea3dc0c7fa46383c1531a`.
Installed proof:
`73d1f69e32c7e3280899f08314ee3f7e5e8ae9c74540bba8a3e9c5f2e8de99b9`.
The actual configured bundled entrypoint handed ambient Node26.7.0 to pinned
Node24.18.0. Process samples and a synthetic forbidden-upstream sentinel found
no upstream child or nonstdio socket. These are sampled offline observations,
not a continuous trace or connected admission.

The probe enumerated 26 tools, seven skills, 749/806 declaration signatures,
108/68 operation schemas, every coverage entry and all 181 fixed readers. It
verified the three new reader schemas/refusals and hover's listed schema and
reviewed code without invoking those live tools. No installed-cache edit,
host termination, hot patch, CAD call or bridge import occurred. Loaded164600
remains distinct from the newly installed204104 package.

## Remaining work

The new readers and hover need a fresh installed-host audit and disposable live
cases. The sealed wire reroute still needs a native named-wire seed followed by
forward and separate reverse saved/reopened tests. Per-method omission reasons
remain in `api-coverage.json`; neither native input nor the newly implemented
readers enables the blocked compiled-topology or unrestricted SDK paths.
