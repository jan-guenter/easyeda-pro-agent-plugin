# Application presence after restart

Candidate `0.3.0+codex.20261014002000` adds one action to
`easyeda_control_launch`:
`{"action":"observe-application","operationId":"<original-operation-id>"}`.
Offline `launch` and `launch-validate` include the strict schema.

This is a diagnostic for an existing launch journal, not lost-handle recovery.
The coordinator admits the exact installed executable/app/helper/facade,
retains the global runtime reservation and quarantine checks, and takes two
matching same-name process-presence samples through the pinned Windows helper.
It rechecks installation and the complete launch-journal inventory before
returning. Caller-selected PIDs, paths, arguments and identities are refused.

The response keeps historical state separate from current presence. Another
installation can account for a matching process. Absence does not prove original
root or Job termination. Original identity, retained launch authority,
termination and relaunch claims are explicitly false. No launch, adoption,
close, kill, design access, Save, journal write or new receipt occurs.
The diagnostic helper itself may start; it does not launch EasyEDA.

The ten-tool restricted catalog, 35-tool legacy catalog and seven skills remain.
No SDK method or guarded route count changes. Skills now distinguish this
diagnostic from termination reconciliation and explain why absence cannot clear
an old attempt.

## Predecessor installation and connection

PR17 delivered `214500` as main `4217c253e17c028a206179779df2dea12d2ecb16`,
identical to tested `13b1ad6b83aa98ec774ace86b473ee9ee4e0a088`. Required
CI38472990143 and main CI38474446988 passed all ten jobs. The required run
reported 9820 facade passes, five platform skips and 424 bridge passes.
[Delivery receipt](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/17#issuecomment-6156127355).

Fresh-host verification matched all 1149 installed files, 22313880 bytes,
42 directories and committed modes, with no extras, symlinks or mismatches.
The actual ten-tool catalog and offline shortcut discovery/validation passed.
Initial status reported no bridge connection, no connection attempts and no
implementation drift. A follow-up after 185 seconds again reported no connection
or attempts, reply SHA-256
`546928887961b99f7b2ed3e9ee8987011c7ddc99ea092b9a81591bb816673472`.
No further polling or shortcut execution occurred. Lost original launch handles
prevent relaunch. No project opening, edit or Save is claimed.

The official marketplace upgrade refreshed the enabled plugin. A subsequent
redundant add returned EACCES while moving its cache backup. Exact installed
verification still passed, so no retry or cache repair was performed. Future
installs inspect actual state after upgrade before issuing add. The
[official marketplace guide](https://developers.openai.com/plugins/build/plugins)
also documents refresh of configured plugin files during marketplace updates.

## Verification and delivery

All 14 focused coordinator/bundled-startup tests pass, including restart presence and absence,
unchanged journal bytes, continued relaunch refusal, and presence/install/
quarantine/journal drift. PR review caught a journal check before the last
awaited admission gate. The journal comparison now comes last; the adjusted
existing regression fails on the prior order and passes on the correction.
The bundled public-callback test includes offline
validation and rejection of a caller-selected PID without live startup.
Full types and strict type-aware lint pass with zero warnings. Build,
compatibility, exhaustive 774-method inventory, package/repository privacy checks
and all seven custom/official skill validators pass. Main and independent
reviews accept the observer. Source projection SHA-256:
`ff8c655a3ce3f26a5ee957ddc892a8f92495d3af6a1624d2192d75b3ac1883e4`;
runtime projection SHA-256:
`da4cbc61ab47f96649f5fce82dd68799abdfc9e8683063aed4f56a0cfb45b47c`.
External compatibility pins and the native helper are unchanged.

Required CI and official installation are pending at this source checkpoint.
Consult the [PR18 delivery receipt](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/18)
for final counts,
commits and installed inventory before repeating delivery.
The new action has not been live-validated.

## Remaining backlog

1. Lost-handle recovery for ordinary launches. A presence check cannot replace
   original root/Job identity and termination evidence; unresolved attempts
   continue to block relaunch.
2. One installed shortcut observation when the bridge is connected. Broader
   cases are deferred unless a real defect requires them.
3. Current-version navigation and useful project-content readers, with reviewed
   preference, backup, manager and document-owner effects.
4. Native structure-job completion and complete SQL-effect verification for
   blocked schematic, symbol and PCB editing lifecycles.
5. Remaining SDK families listed per method in the coverage inventory, including
   library/device/3D work, primitives, routing/rules/stackup, ECO/ERC/DRC and
   scoped manufacturing exports.
6. Bridge Auto-Connect persistence-error reporting, requiring a separately
   built/imported bridge while preserving private credentials.

Production designs and their records remain out of scope. Historical operations
must not be replayed. Publication does not enable blocked editing routes.
