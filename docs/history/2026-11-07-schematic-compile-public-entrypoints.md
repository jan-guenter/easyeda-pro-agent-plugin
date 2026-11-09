# Schematic compile-only public entry points

The Windows job for draft PR171 failed after successful C# compilation because
PowerShell could not resolve internal EasyedaProjectLibraryRefreshProtocol.
The generated compile-only block called that internal class directly.
The original failure remains at
[Windows recovery job128538791057](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/42417546543/job/128538791057).

The schematic build now emits one public EasyedaDiagnosticOwner facade method
that invokes the library-refresh smoke and the existing RunPrefix/RunGuard
smokes inside their original C# assembly. Those latter classes were already
public. Existing codec visibility and implementations are unchanged.
PowerShell reaches only exported public types. The emitter is limited to the
schematic layout and rejects partial, modified or duplicate marked blocks.

The Windows workflow now compiles all three separate schematic purposes,
including the saved-reader birth. It retains original empty-Job, no-process,
bounded output and original helper disposal checks. No test was removed.

Two focused generation/visibility/idempotence regressions passed. Complete
Linux C#5 compilation, actual public-type/method reflection for every generated
PowerShell smoke entry point and execution of all three delegated pure codec
smokes also passed. Compiler input is1,948,157bytes, below the unchanged2MiB
limit. Both TypeScript projects and strict type-aware lint pass.
These pure checks create no Windows application or Job. A regenerated frozen
payload and fresh Windows CI remain required before claiming the original
CI failure resolved in that environment.
# Composed regeneration follow-up

The full schematic composition exposed a separate ordering defect: a second
generation moved the validated public smoke block ahead of birth fragments that
were removed and regenerated. The smoke block now has an exact normalizer before
those family normalizers and is reinserted at its fixed final anchor. Duplicate,
partial and changed blocks still refuse. The complete two-pass regression and
Linux C#5 compilation with both saved-reader and public protocol smokes pass;
the previous ordering refusal remains a retained failed check. No native artifact
or compiler bound changed.
