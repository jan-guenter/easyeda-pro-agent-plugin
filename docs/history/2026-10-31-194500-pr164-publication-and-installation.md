# PR164 publication and installation

31 October 2026. This record separates the completed PR164 publication from
the earlier native-age development record. The section below is preserved
verbatim from [its original location](2026-10-31-150000-native-age-and-pcb-compatibility.md),
as published in [payload a685eb90](https://github.com/jan-guenter/easyeda-pro-agent-plugin/blob/a685eb90fdbb7324c2b05d8e9dbc21391eb2ac47/docs/history/2026-10-31-150000-native-age-and-pcb-compatibility.md).
Its SHA-256 is `2e5c02e709004dbe00bb9b7e9456d22bb8b960ef999139547d9de8243d9919bc`.
The relocation changes no release result or earlier observation.

## Final publication and installation

The complete batch was protected-squashed through PR164 at payload
`a4b45e01dc4acddf5597c51b900000e537b7ecdf` into main
`f3ff28b028342f79373691bc2194b1691f32c0c7`, with no administrator bypass.
The actual single parent is `27881f4918e4ce8375500b7f1ef57b94155abd3f`.
Root tree `56c0694a10051f3d33e68ff5db6903ff92335d81` and plugin tree
`44948a9a6e45278c7ba0239bd9554b082f2543f2` exactly match the reviewed payload.

Final PR CI `41220363125` and Windows `41220363129` passed all eleven jobs.
The complete facade result was 13,943 passed, five recognized platform skips
and zero failures across 13,948 tests and 65 suites; bridge results were
424 passed across 28 files. All ten synthetic checkout parents, trees and
source/runtime/helper pins matched. Automatic main CI `41221842004` and
Windows `41221841801` independently repeated those passing totals. All ten
main checkouts used the actual squash commit. Both runs' complete log archives
passed CRC and byte-equality checks against every individual raw job log.

CodeRabbit's final exact-payload check `124593525559` completed successfully
with no actionable comments. All five reported fingerprints, including
outside-diff feedback, were source-verified fixed. The inline thread became
resolved/outdated naturally and explicitly acknowledged commit `a4b45e0`.
No root thread mutation or additional comment was sent. The sole authored
command remains `@coderabbitai full review`, comment `6545401287`. Its actual
full PR invocation and all later review bodies remain retained. Docstring
coverage passed at 88.14 percent. The full command reviewed the PR files;
it does not establish review of every unchanged repository file.

The official CLI upgraded Git marketplace
`https://github.com/jan-guenter/easyeda-pro-agent-plugin.git`, ref `main`,
to the exact merged commit and installed/enabled
`0.3.0+codex.20261031152137`. Complete comparison before and after the configured
offline probe matched all 2,503 files, 42 directories including root and
48,480,920 bytes, inventory SHA-256
`cb9897cd2f6a39b17e2e21914ecd205ab4931967e1177fa234bd8f86f5284a66`.
The probe completed 54 queries and 56 requests, with 52 configured tools,
27 discovered tools and all seven packaged skills. Its original child closed
through stdin EOF. Two isolation samples found no descendants/non-stdio
sockets; continuous isolation was not claimed. The original machine profile
remained exact. No manual installed-cache edit or host termination occurred.

One private candidate materialization initially retained incorrect archive
modes and the full verifier refused before any offline process started. That
failure was preserved. A fresh private materialization used explicit directory
modes and tar no-same-permissions under umask022; all comparisons then passed.
It did not alter the installed cache or relax the verifier.

Publication and installation are complete. The old serving host was left
untouched; a fresh Codex session must admit the actual newly loaded snapshot
before connected work. No current-generation connected qualification or new
writer/save/reopen claim is made. The consumed pre-allocation case remains
terminal and must never be replayed. No native cleanup is pending and no
production CAD action occurred. The earlier native/79-blocked/483-omitted backlog
remains, with concrete private source plans for structure completion and
library archives. This final history append is retained locally for the next
source batch rather than publishing another version for release bookkeeping.
