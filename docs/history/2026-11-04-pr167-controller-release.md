# 2026-11-04 PR167 controller release and verified installation

[PR167](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/167) completed protected squash merge on 2026-11-04. The reviewed final payload was `4cabf969ac7c4f7bb93906e0b1e75ba14ba1df94`; merged main is `4bd261cb3579c09769509756a0fbde95f383c77e`, with sole parent `8948ac54d48ddd51218cae2ca6fb26356a7c1653`. No administrator bypass was used. Publication, installation and the foreground facade handoff are complete. Subsequent disposable native qualification remained pending at the 22:07:12 UTC draft checkpoint.

The installed release is `0.3.0+codex.20261104120101` (base version `0.3.0`). Its reviewed root tree is `381ad3ac3ae07f5ebe6f98faa8e062a898a07bc4`; plugin tree is `005b2415f8a48dd0d8edebd057759ba412285045`.

| Projection | Files | SHA-256 |
| --- | ---: | --- |
| Facade source | 1,005 | `ec023246df1d7e47429000ed66e6422286378adb55a034a5c8014844a53c0fcf` |
| Runtime bundle | 3 | `6ffa2ae34c4a3bb664131ac503037b5786c120b88573eadd97c4e581d1e3f1da` |

The controller retains its original facade through settlement and supported retirement, observes the original child exit and stdio closure, and then permits explicit selection of a verified replacement. Supported interrupted capture cleanup uses the same privately retained original connection; a timeout does not authorize replay or replacement. The packaged direct tool deadline and controller caller bound now agree at 3,720 seconds. Required local non-suite checks, reproducible builds and compatibility checks passed; external runtime and declaration pins were preserved.

## PR and automatic main CI

| Exact commit | CI run | Windows launch recovery | Result |
| --- | --- | --- | --- |
| PR payload `4cabf969` | [41914110439](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/41914110439) | [41914110359](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/41914110359) | All 11 jobs passed |
| Merged main `4bd261cb` | [41917189269](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/41917189269) | [41917189417](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/41917189417) | All 11 jobs passed |

Each exact-head run reported 14,122 facade tests in 65 suites: 14,117 passed, five supported platform skips, zero failures, cancellations or todos. Each build also passed all 424 bridge tests in 28 files. Complete raw workflow archives, their hashes and CRC checks were retained. The PR synthetic merge checkout and the automatic main checkout were verified against the reviewed root/plugin trees and source/runtime projections; all ten checkout-bearing main jobs used the exact merged commit. These are offline and CI results, separate from native qualification.

## Review scope

The completed [CodeRabbit full PR review](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/167#pullrequestreview-5775699063), review ID `5775699063` and successful check `126854698414`, covered base `8948ac54` through `0d8a637dba93ad1cb5ad09b0b07eb8adf6971508`. Its five final findings were fixed in `4cabf969`. Independent review covered the complete 14-file `0d8a637d` to `4cabf969` delta, including generated artifacts and the dated history record, with focused validation and exact final CI.

The final inventory accounted for all 49 bot bodies, including hidden, collapsed, outdated and legacy findings. All 25 review threads were resolved. The final-head automatic CodeRabbit check was completed/skipped; the release gate records CodeRabbit coverage through `0d8a637d` and independent review of the final delta. It makes no claim that CodeRabbit reviewed `4cabf969`.

## Official installation

The official Git marketplace is [jan-guenter/easyeda-pro-agent-plugin](https://github.com/jan-guenter/easyeda-pro-agent-plugin.git). After the marketplace upgrade, the installed-state proof verified `120101` installed and enabled, with no additional plugin-add step required.

All 2,546 committed packaged files, totaling 49,600,288 bytes in 42 directories including the package root, matched merged main byte-for-byte and by committed mode. The inventory SHA-256 is `78f477649963baace52ae6202f3c21ca4f304cd883e3eb8fd2dd3e6f8cf89984`. Complete comparisons before and after the offline probe were identical. The final installed-proof receipt SHA-256 is `0633ab5c9b6498ce1b5dd4b166e03ad8d058dc65ba7233e3771e9e7edc9ef8c8`.

The installed package probe used pinned Node `24.18.0` and a separate synthetic profile. It checked 54 configured tool declarations, discovered 29 tools, and completed 59 catalog/argument-validation queries in 61 requests, including the forward-prewrite family. Its own child closed through stdin EOF with exit code zero and observed stdio closure. The probe supplied no connected-runtime admission. The machine profile remained unchanged, and no manual cache edits were used.

## Observed foreground handoff and pending native qualification

The same maintained manager first started the installed `120101` facade as generation 1. Its actual process, complete package and source/runtime identity were verified. Its scoped machine-profile catalog contained 18 tools; loaded-facade metadata alone did not grant live admission.

Generation 1 then returned a genuine session-retirement acknowledgment: retired state, zero active calls, closed live admission and acknowledged lease release. The manager sent stdin EOF and observed that original child's exit and stdio close, with exit code zero and no signal. Independent absence and lease-release evidence were retained. Only afterward did the original manager start generation 2 from an explicitly selected, trusted frozen NEXT package. The same machine profile was preserved across the transition.

That NEXT package is an unpublished local candidate, version `0.3.0+codex.20261104190023`, commit `15dc1cc6fed3bb90cfebfff3e3ea3bf3cd45da8c`. Its actual facade passed separate complete package/process checks for 2,552 files and 49,758,922 bytes. Its source projection is 1,008 files, SHA-256 `5a73a4117afbab130605dcbac8b407500a3446e038431aaf2ed76d3a0d7c1465`; runtime projection is three files, SHA-256 `bf9650e7c9b85c698e23fcbf08833dff71aef42f39f1da599e36d1ec5198f1a5`. Its scoped catalog also contained 18 tools. This selected local candidate did not change the official installed `120101` release.

The subsequent original disposable native capture was still pending at this record's draft checkpoint. Its qualification result, original native termination/helper release, record settlement and final facade closure require their own later terminal evidence. No successful native qualification, writer, Save, restoration or production-design result is claimed here; this record grants no writer or Save authority. Earlier unknown native outcomes remain historical unknowns.

## 2026-11-05 continuation

The later frozen NEXT capture timed out and its outcome remains unknown. Separate user-authorized application termination and a bounded active-facade cleanup exception ended the original physical controller resources. This did not establish cooperative facade retirement or original native Job/helper-release acknowledgment. The [November 5 recovery record](2026-11-05-forward-capture-recovery-and-source-fixes.md) preserves the observed stall, physical closure, source-only corrections and pending typed historical recovery. The release, installation and CI results above remain unchanged; no successful native qualification, writer or Save result is added by that continuation.
