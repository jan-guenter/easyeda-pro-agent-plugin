# Ordinary launch recovery source review

Reviewed 2026-10-15. This note supplies a source argument for an intent-only
abandonment policy. It does not prove the original process exited or that launch
never occurred. No current live validation, launch replay, Save or design
authority follows from this review.

## Historical identity

The reviewed plugin commit is [5b06ff38a4b8010021120ba248a43554c11531f6][commit],
with plugin subtree `9e5d5695f5791b0084f6f7889f926ecb165c49cd`. These SHA-256
values were checked from `git show` bytes, without loading the current modified code.

| Historical file | SHA-256 |
| --- | --- |
| [server/src/ordinary-launch.ts][ordinary] | `c5c0fb1ec66add6dc55664b1ec7db9e1879edde45c35c1d6303f7c7932f8c89a` |
| [server/src/windows-runtime.ts][runtime] | `abb01d02a5e031a1676e21a768ff0472a75ab0644a69cb2e1ad93b8b52716fb1` |
| [server/src/windows-authority.ts][authority] | `045e6838a74c1627427b26a67855e2d9e17bf67763d1a5e76fa7fbbd92775657` |
| [server/src/windows-clock-transport.ts][clock] | `a1866c9b81485da8aca6f71a3f68c46ddf9a415bda2bafb3df592491a167fae6` |
| [scripts/windows-authority.ps1][helper] | `fa5cff83eea61dea9a58dad282c76a2016bc7cbcb6f54dea1ef51375d9a91161` |

The [profile's][profile] sorted-key JSON digest recomputes to
`9ab6901e888bc4d03084fe64e62325fbd8f333794fad7ac6408dab73081c15ad`.
The [historical manifest][manifest] records runtime digest
`d7f99363d58ee66181f74c7841edcfd6b00d6e7da02a7dc1b5b686b77cf828a7`
for three bundled files and source digest
`92946f2b38d87666fb031731efb8b900f60d2575ecc4543eb40eda8de3fb2aca`
for 340 source files. The installed v1 intent must match that exact profile and
runtime digest pair. The source aggregate is not a substitute. [Fingerprinting
selects the executing source or bundle mode][fingerprint], and the [installation
verifier returns that mode's digest][verify] for `intent.facadeSha256`.

## What the historical launch path establishes

The [ordinary coordinator][ordinary] awaits `observeExistingApplication` before
reserving the operation directory and publishing `intent.json`. The [runtime][runtime]
starts and retains its supervisor during that observation. Later `launch` calls
`ensureSupervisor`, which returns the same retained supervisor. A failed raw
transport remains failed and refuses requests; it has no respawn path. [Source][authority].

The [clock adapter][clock] retains the raw methods and forwards the existing-app
observation through the same transport. The [native loop][helper-loop] handles
requests serially. Its [observation][helper] checks `easyeda-pro`; only the separate launch
action creates the application. Consequently, for this exact historical path,
an outstanding post-intent launch can still execute only through the already
started PowerShell helper. This is an inference from the cited control flow.

## What the .NET enumeration establishes

Microsoft's .NET Framework [Process.cs][process] makes the one-argument
`GetProcessesByName` local through `"."`, calls `GetProcesses`, and filters names
with `OrdinalIgnoreCase`. It does not filter by user or session.

For local NT version 5 or later, [ProcessManager.cs][manager-route] selects
`NtProcessInfoHelper.GetProcessInfos` without a PID predicate. That helper calls
`NtQuerySystemInformation`, grows its buffer and retries on
`STATUS_INFO_LENGTH_MISMATCH`, and throws for a remaining negative status.
The [parser][manager-query] walks the returned records, records session IDs, and
applies no user/session filter. These are source properties, not proof of the
framework build or process state on this workstation. Links pin Microsoft commit
`ec9fa9ae770d522a5b5f0607898044b7478574a3`; the supplied `/main` line anchors had shifted.

## Recovery requirements and limits

Each new recovery sample must enumerate other `powershell` processes before
enumerating `easyeda-pro`, or derive both sets from one complete process snapshot.
Exclude only the recovery helper's actual PID. Require no other PowerShell and
no same-name application in each of two samples. Any enumeration, identity,
transport or parsing error must refuse recovery. Checking EasyEDA twice without
first excluding the old helper leaves a delayed-launch race. This ordering
requirement follows from the historical control flow above.

Use a separate read-only recovery helper with no application launch or close
action. The result may support abandoning the old startup blocker under the
reviewed policy; it cannot supply original retained-handle or Job exit proof.
Processes with other names, unobserved descendants, and an external application
start after a snapshot remain outside this argument. The attempt stays consumed.

Execution must consume the exact captured and verified helper bytes. Hashing a
descriptor and later passing its path to `-File` leaves a substitution window,
including replacement of a parent directory. Decode the verified UTF-8 bytes
strictly and encode that same text as UTF-16LE Base64 for
[`-EncodedCommand`][encoded-command]. Post-execution path checks detect drift;
they do not make a prior path reopen safe.

For future v2 intents, a protocol marker alone does not establish source review.
Before a recovery probe, require `intent.facadeSha256` to equal the independently
verified current facade digest. A completed v2 sidecar must bind its recovery
facade digest to the original intent's facade digest so later generations can read that
terminal receipt. Inspection should distinguish `reviewed-v1`, `recorded-v2`, and
`unsupported`. These are implementation requirements, not current live acceptance.
Future protocols need their own retained invariant. This v1 review covers only the exact historical pair above.

## Focused Windows execution check

The separate `windows-launch-recovery.yml` workflow verifies the helper's
2279-byte length and SHA-256
`d68a8029d12d4bcbff1432e21c917ac4dd11c390dc95effea138522b3080298c`, then runs
those captured bytes through `-EncodedCommand` in a Windows PowerShell 5.1 child.
Its waiting PowerShell parent must be
reported as present; the fresh runner must report no EasyEDA process. It checks
the child exit code and exact observation fields, without installing or starting
CAD. GitHub lists [`windows-2025` as a fresh hosted VM][hosted-runners]. This is
one native-script smoke, not WSL transport, absent-helper recovery, original
termination or design validation. Its CI result must be recorded separately.

[commit]: https://github.com/jan-guenter/easyeda-pro-agent-plugin/commit/5b06ff38a4b8010021120ba248a43554c11531f6
[profile]: https://github.com/jan-guenter/easyeda-pro-agent-plugin/blob/5b06ff38a4b8010021120ba248a43554c11531f6/plugins/easyeda-pro-control/server/src/ordinary-launch.ts#L13-L24
[ordinary]: https://github.com/jan-guenter/easyeda-pro-agent-plugin/blob/5b06ff38a4b8010021120ba248a43554c11531f6/plugins/easyeda-pro-control/server/src/ordinary-launch.ts#L348-L379
[runtime]: https://github.com/jan-guenter/easyeda-pro-agent-plugin/blob/5b06ff38a4b8010021120ba248a43554c11531f6/plugins/easyeda-pro-control/server/src/windows-runtime.ts#L245-L302
[authority]: https://github.com/jan-guenter/easyeda-pro-agent-plugin/blob/5b06ff38a4b8010021120ba248a43554c11531f6/plugins/easyeda-pro-control/server/src/windows-authority.ts#L1067-L1148
[clock]: https://github.com/jan-guenter/easyeda-pro-agent-plugin/blob/5b06ff38a4b8010021120ba248a43554c11531f6/plugins/easyeda-pro-control/server/src/windows-clock-transport.ts#L162-L205
[helper]: https://github.com/jan-guenter/easyeda-pro-agent-plugin/blob/5b06ff38a4b8010021120ba248a43554c11531f6/plugins/easyeda-pro-control/scripts/windows-authority.ps1#L451-L491
[helper-loop]: https://github.com/jan-guenter/easyeda-pro-agent-plugin/blob/5b06ff38a4b8010021120ba248a43554c11531f6/plugins/easyeda-pro-control/scripts/windows-authority.ps1#L584-L605
[manifest]: https://github.com/jan-guenter/easyeda-pro-agent-plugin/blob/5b06ff38a4b8010021120ba248a43554c11531f6/plugins/easyeda-pro-control/reviewed-compatibility.json
[fingerprint]: https://github.com/jan-guenter/easyeda-pro-agent-plugin/blob/5b06ff38a4b8010021120ba248a43554c11531f6/plugins/easyeda-pro-control/server/src/core.ts#L338-L384
[verify]: https://github.com/jan-guenter/easyeda-pro-agent-plugin/blob/5b06ff38a4b8010021120ba248a43554c11531f6/plugins/easyeda-pro-control/server/src/ordinary-launch.ts#L169-L186
[process]: https://github.com/microsoft/referencesource/blob/ec9fa9ae770d522a5b5f0607898044b7478574a3/System/services/monitoring/system/diagnosticts/Process.cs#L1542-L1599
[manager-route]: https://github.com/microsoft/referencesource/blob/ec9fa9ae770d522a5b5f0607898044b7478574a3/System/services/monitoring/system/diagnosticts/ProcessManager.cs#L169-L180
[manager-query]: https://github.com/microsoft/referencesource/blob/ec9fa9ae770d522a5b5f0607898044b7478574a3/System/services/monitoring/system/diagnosticts/ProcessManager.cs#L1063-L1202
[hosted-runners]: https://docs.github.com/en/actions/reference/runners/github-hosted-runners
[encoded-command]: https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_powershell_exe?view=powershell-5.1
