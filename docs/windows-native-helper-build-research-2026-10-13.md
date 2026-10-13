# Windows native helper build research, 2026-10-13

## Implementation update

The selected byte-loaded DLL now has a maintained deterministic build recipe:
[build script](../plugins/easyeda-pro-control/scripts/build-main-reference-helper.py),
[fixed inputs](../plugins/easyeda-pro-control/scripts/main-reference-build.json).
The first complete build used the verified public SDK 10.0.111 archive and
net48 reference package 1.0.3, not the different installed distribution compiler.
Both independent build roots produced the same 174,080-byte DLL with no compiler
diagnostics: SHA256
`cff2616580610e61ae5466e79f51e3a6b7b421dc0f0e8cd37b5dd0768d3f78b5`.
Its 39 explicit sources total 401,722 bytes. The portable build manifest and
typed identity record the actual source and artifact hashes; CI rebuilds and
checks them. This is build reproducibility, not runtime qualification.

The complete helper requires the separately selected v3 limits of 262,144 DLL
bytes and 524,288 ASCII frame bytes; the earlier provisional caps below are
historical. Four fixed compile references are selected: mscorlib, System,
System.Core and System.Web.Extensions. The last supports the bounded JSON
reader. These names are the declared compile allowlist, not independently
inspected assembly metadata. Neither SDK nor reference DLLs ship as runtime
payloads.

The first complete-helper native smoke test failed at CreateProcess with
primary code 10 and Win32 error 87. No child PID was acquired; filesystem
dependencies remained retained. The four-file launch-naming correction now
builds reproducibly to 175,104 bytes, SHA256
`378f82d9e92fe74e1f61b13d90472d2f80a1b9959941da7133de08e53c45cd20`,
again with no compiler diagnostics. The subsequent standalone native smoke
passed with this exact DLL and a fresh nonce in 28,370 ms. The original child
exited 0, the Job was empty, and no forced stop or kill-on-close was used.
All 109 file, 23 layout and 11 ancestry close attempts succeeded, with no
cleanup errors or retained dependencies. The actual v3 result and clock
records passed validation; `nativeCollectionComplete` was true.

That result covers the fixed synthetic request only: no CAD or project access,
renderer creation, application-clock qualification or execution authorization
was claimed. The first failed smoke remains retained evidence; the later pass
does not establish error 87's precise cause. The research below records the
original source-only assessment and its limits.

## Decision and scope

A fixed C# 5, x64, .NET Framework 4.8 assembly can be built on the existing
Ubuntu 24.04 CI lane. My provisional choice is the pinned Linux .NET SDK's
Roslyn compiler with explicit Framework reference assemblies and an ordered
response file. Build a DLL for the existing trusted PowerShell 5.1 consumer
unless a separate process is actually needed. Loading one bounded,
compiler-pinned byte array avoids a second helper-process bootstrap and runtime
CodeDOM compilation. This is a design recommendation, not a completed build or
load qualification.

The current [CI workflow](../.github/workflows/ci.yml) uses `ubuntu-24.04`,
pinned Node 24.18.0/npm 11.16.0 and commit-pinned actions. It has no .NET setup or
managed-helper reproducibility step. Existing private builds used SDK 10.0.111
and exact local Framework reference files, but those receipts do not establish
a redistributable CI acquisition route. This research ran no download, restore,
build, assembly load, Windows command or application action. Only this note was
added. Native refusal and public gates remain unchanged.

## Build toolchain

Microsoft publishes Framework reference assemblies specifically for builds on
machines without the corresponding developer pack. Its repository documents
building with the .NET SDK on supported operating systems and includes an
SDK-style executable example. These assemblies contain API metadata, not a
Framework implementation that could run the helper on Linux.
[Microsoft package guidance](https://github.com/microsoft/dotnet/blob/main/releases/reference-assemblies/README.md),
[reference-assembly purpose](https://learn.microsoft.com/en-us/dotnet/standard/assembly/reference-assemblies).

For this small fixed source set, prefer direct invocation of the SDK's selected
`Roslyn/bincore/csc.dll` over adding a general project build. The reviewed
response file can enumerate every source and reference, with no source glob,
analyzer, generator or restore-time build import. This is an engineering choice
based on the existing private compiler route. The SDK-internal compiler path
must be bound to that exact SDK deployment, not assumed stable across upgrades.

An SDK-style `net48` project is also feasible. It would explicitly select
`LangVersion=5`, `PlatformTarget=x64`, deterministic output, a fixed compile-item
list, no shared compiler and the exact reference package. It needs a reviewed
restore graph and generated-file inventory. Microsoft recommends the reference
package for missing targeting packs; this does not require a Windows developer
pack installation in CI.
[Framework reference-package build instructions](https://learn.microsoft.com/en-us/dotnet/framework/migration-guide/reference-assemblies),
[Roslyn compiler server](https://github.com/dotnet/roslyn/blob/main/docs/compilers/Compiler%20Server.md).

Pin a complete SDK version, not `10.x`, an image-preinstalled default, or a
floating action tag. `global.json` with `rollForward: "disable"` requires the
exact SDK; `allowPrerelease: false` prevents prerelease selection. This controls
SDK resolution, not the bytes of a `dotnet csc.dll` invocation. That route must
also use the selected host/compiler paths and runtime deployment. SDK selection
is independent of targeting Framework 4.8.
[SDK selection rules](https://learn.microsoft.com/en-us/dotnet/core/tools/global-json).

A commit-pinned `actions/setup-dotnet` can install a version from `global.json`.
Alternatively, acquire a fixed official Linux x64 SDK archive and verify its
published SHA-512 before extraction. The latter makes the archive identity
explicit. Either route must record the actual compiler and hosting-runtime
inputs. SDK 10.0.111 is a reuse candidate from the private receipts, not a newly
verified public archive in this research. Its selected release URL, checksum
and action commit remain implementation decisions.
[setup-dotnet inputs](https://github.com/actions/setup-dotnet),
[Microsoft archive verification instructions](https://learn.microsoft.com/en-us/dotnet/core/install/linux-scripted-manual#verify-downloaded-binaries).

## Reference acquisition, signatures and license

The concrete candidate is
`Microsoft.NETFramework.ReferenceAssemblies.net48` version `1.0.3`. NuGet lists
Microsoft and dotnetframework as owners and no dependencies for its Framework
4.8 group. The alternative umbrella package selects a framework through project
configuration; the direct package makes this fixed target easier to audit.
`PrivateAssets=all` controls package propagation, not licensing or runtime
compatibility.
[Exact package metadata](https://www.nuget.org/packages/Microsoft.NETFramework.ReferenceAssemblies.net48/1.0.3).

The package's published License Info links to Microsoft's MIT license. That
license requires retaining its copyright and permission notice in copies or
substantial portions. This research followed the published link; it did not
inspect a downloaded nupkg, its embedded notices or every included file's terms.
Retain those with the build-input evidence when acquisition is authorized. Do
not extrapolate the repository license to arbitrary DLLs copied from a Windows
installation or to redistribution of the installed Framework runtime.
[Published license target](https://github.com/microsoft/dotnet/blob/main/LICENSE).

Use one fixed NuGet source and version. The official v3 content API supports
exact ID/version acquisition. Before consuming package build targets or DLLs,
verify the downloaded package and record its raw content digest plus each
selected reference's digest. For a PackageReference route, check in the reviewed
lock file and use locked restore; an ordinary version string is not by itself
a complete graph lock.
[NuGet content API](https://learn.microsoft.com/en-us/nuget/api/package-base-address-resource),
[locked restore](https://learn.microsoft.com/en-us/nuget/consume-packages/package-references-in-project-files#locking-dependencies).

Signature validation and byte pinning answer different questions. NuGet's Linux
signature verification is enabled by default from .NET 8, but default behavior
is not an explicit publisher allowlist. Configure required signatures and
reviewed author or repository trust, with repository owner restrictions if
that is the chosen policy. Do not silently synchronize new certificates during
a build. A repository signature must not be described as an independently
verified Microsoft author signature.
[Linux signature behavior](https://learn.microsoft.com/en-us/dotnet/core/tools/nuget-signed-package-verification),
[trusted-signers policy](https://learn.microsoft.com/en-us/nuget/consume-packages/installing-signed-packages).

`dotnet nuget verify --all` supports explicit certificate fingerprints and a
fixed config file. Retain its signer, chain and timestamp result after an
authorized acquisition. This note supplies no package digest or signer
fingerprint because neither was observed. A package name, reserved prefix or
successful restore is not a substitute for that check.
[Verification command](https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-nuget-verify).

## Reproducible output contract

Use explicit release options equivalent to `-langversion:5`, `-platform:x64`,
`-deterministic+`, `-optimize+`, `-debug-`, `-noconfig` and `-nostdlib+`. Select
`-target:library` for the DLL or `-target:exe` for the EXE, one fixed output
basename and fully qualified references. C# 5 limits source syntax. Framework
4.8 reference assemblies, not that syntax flag, restrict available managed
APIs. x64 selects the 64-bit CLR rather than AnyCPU behavior.
[Language selection](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/configure-language-version),
[platform/output options](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/compiler-options/output),
[advanced compiler options](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/compiler-options/advanced).

Deterministic compilation derives variable PE timestamp/MVID fields from the
inputs. It still depends on compiler deployment, ordered arguments, response
files, source/reference bytes, paths, culture, encoding and the compiler's
runtime. Therefore commit the response file and fixed assembly attributes,
avoid wildcard versions or build-time timestamps, select UTF-8 and diagnostic
language, and remove ambient reference search. If debug data is unnecessary,
omit it. Pin every resource or generated input that is retained.
[Deterministic compiler option](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/compiler-options/code-generation#deterministic),
[Roslyn's input inventory](https://github.com/dotnet/roslyn/blob/main/docs/compilers/Deterministic%20Inputs.md).

Use `PathMap` to replace build-root paths with one stable source prefix. It
affects compiler-emitted paths, including `CallerFilePath` and debug locations;
it is not a general scrubber for path strings deliberately embedded by source.
The acceptance check should build in two different clean directories using
the same pinned toolchain, compare raw output bytes, then compare the packaged
artifact with that output. Inspect PE/CLI metadata as bytes for x64 and the
exact approved assembly references. Do not execute the target to perform this
inspection.
[PathMap behavior](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/compiler-options/advanced#pathmap).

These checks qualify one build recipe. The `ubuntu-24.04` label alone does not
pin compiler or operating-system inputs. If output signing is later added,
keep the deterministic unsigned artifact and signing result separate; this
note neither selects nor authorizes a signing service.

## Packaging choices

| Form | What it removes | Remaining boundary |
| --- | --- | --- |
| Source plus runtime CodeDOM | No packaging change | Runtime compiler, source framing, temp-file and compiler settlement remain. |
| Fixed Framework EXE | Runtime source compilation | Requires another exact executable launch, its config and original process/handle ownership. |
| Fixed Framework DLL loaded from bytes | Runtime compilation and a second helper EXE launch | Runs inside the existing PowerShell host; host trust, dependency binding and native-resource ownership remain. |

The DLL is the smallest provisional change for the existing consumer. Keep the
entry internal and fixed: no caller-supplied assembly bytes, type name, method,
path, provider or alternate dependency resolver. Read the one packaged DLL with
a strict size bound, verify its compiler-owned SHA-256, and pass that same
retained byte array to `Assembly.Load(byte[])`. Do not reread a pathname after
hashing and do not substitute `LoadFrom`, `LoadFile`, `Add-Type -Path` or an
assembly-name search. These are proposed controls, not implemented behavior.

On .NET Framework, `Assembly.Load(byte[])` loads a COFF assembly image and
inherits the calling assembly's trust. It is execution-capable loading, not a
sandbox or a signature check. Microsoft's reference source passes the bytes to
`nLoadImage` with no symbol store and no integrity-check bypass. The returned
assembly's `Location` is empty for a byte load.
[Framework Load API](https://learn.microsoft.com/en-us/dotnet/api/system.reflection.assembly.load?view=netframework-4.8.1#system-reflection-assembly-load(system-byte())),
[Framework reference source](https://github.com/microsoft/referencesource/blob/main/mscorlib/system/reflection/assembly.cs),
[Location semantics](https://learn.microsoft.com/en-us/dotnet/api/system.reflection.assembly.location?view=netframework-4.8.1).

Framework byte loads normally have no load context. The documented exception
is an identity that resolves, after policy, to the GAC. Dependencies do not
gain a search path beside the packaged DLL. Repeated loads can also create
incompatible type identities. Use one reviewed private assembly identity and
one retained returned `Assembly`, resolve its fixed type from that object, and
do not turn a global PowerShell type-name lookup into the authority. Reject an
unexpected GAC/location/identity result rather than adding a fallback.
[Framework load-context rules](https://learn.microsoft.com/en-us/dotnet/framework/deployment/best-practices-for-assembly-loading).

For the present sources, keep managed references limited to the reviewed
`mscorlib` and `System` identities. Confirm the actual host bindings and retain
the existing fixed native DLL declarations. Assembly references alone do not
exclude dynamic loading in source, nor do their names prove the runtime files.
Host/application/machine binding policy still applies. A sidecar `helper.dll.config`
does not replace the already running PowerShell host's application config.
[Framework binding policy](https://learn.microsoft.com/en-us/dotnet/framework/deployment/how-the-runtime-locates-assemblies).

The justified claim is that this application route needs no CodeDOM compiler
and creates no source, generated DLL or compiler temp file. Neither an empty
`Location` nor the byte-load API promises that the CLR, operating system,
security software or invoked native code makes no writes. The assembly is not
individually unloadable from its AppDomain; dropping the returned object does
not release native owner resources. Keep the existing one-shot host and exact
resource cleanup contracts.
[Framework unload lifetime](https://learn.microsoft.com/en-us/dotnet/framework/app-domains/how-to-unload-an-application-domain).

## Packaged runtime and next implementation

The deployed DLL or EXE needs Windows x64 with the admitted Framework runtime,
not the Linux SDK or reference package. All Framework 4.x runtimes share CLR
version `v4.0`; that string alone does not prove Framework 4.8. Microsoft's
minimum installed-version check for 4.8 uses `Release >= 528040`. A DLL loaded
inside PowerShell uses the host's runtime, so the host must meet the requirement
before loading. Do not install or upgrade the runtime automatically.
[Installed-version guidance](https://learn.microsoft.com/en-us/dotnet/framework/install/how-to-determine-which-versions-are-installed).

For an EXE, package exact config bytes with
`supportedRuntime version="v4.0" sku=".NETFramework,Version=v4.8"`. This describes
the runtime target; it does not qualify Windows API behavior or host ancestry.
The DLL route instead needs explicit admission of the existing host and cannot
switch its already loaded CLR through a new sidecar file.
[Runtime configuration](https://learn.microsoft.com/en-us/dotnet/framework/configure-apps/file-schema/startup/supportedruntime-element).

The next small implementation proposal should select the artifact form and
exact source list, then add the pinned SDK/reference acquisition, ordered
compiler invocation, two-root byte comparison and package digest check. Follow
that with a fixed-byte DLL load test in the admitted PowerShell host if the DLL
route is chosen. Keep malformed/hash-mismatch rejection before loading, one
assembly identity and original-resource retention on every failure.

This packaging work does not complete the full eleven-directory adapter,
fixed-file owner, scratch ancestry proof or Electron pathname handoff. The
compiled artifact is executable code, not an authority token. Existing native
refusal must stay until those joins and their disposable validation are
separately accepted. No new generic loader or arbitrary-executable transport is
needed for this proposal.
