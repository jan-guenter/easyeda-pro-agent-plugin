# Owner-security harness: TempFileCollection disposal

## Decision and scope

Retain the reviewed PowerShell template unchanged. The absence of a public
parameterless CLR `Dispose` method does **not** establish that PowerShell's
ordinary `$temporaryFiles.Dispose()` call fails. Primary PowerShell material
supports interface-member lookup. The exact call on the intended Windows
PowerShell 5.1 host has not been executed or qualified by this review.

No reflection replacement, interface-cast successor, compiler run or new
Framework test is introduced. This note follows the research skill's cited
primary-source workflow and the extension-development skill's separation of
source review from native qualification. No Windows, application, project or
profile action was performed.

## Preserved inputs

The reviewed proposal is private, not a packaged runtime asset. Its completed
Linux source checks and compile-only evidence remain unchanged.

| Input | SHA-256 |
| --- | --- |
| owner-security-harness.template.ps1 | 2e8637fa512625c351532392677a2cd4a66c628695ed0ed8d10c8b3c13db0adf |
| prepare-harness.mjs | 129ab4722d4ce911286bda1b35a1c74e6cf7c9b6fda19e9f09b781c592a8224c |
| Packaging measurement receipt | 17ca5648267cffd1dc808ae36dc7d44a1696a7ac82d4d7e4652cb03b45988ae3 |
| Linux compile-only result note | 194770b252dd9aa81295b254b4fa828e19616cc26ccf71769804a9127cd727cf |

The measured script is 70,003 bytes, SHA-256
`ae77080110cc5a981e0f4dccbfc846ca6b05dff96fc2b84b8f9714b33bf364de`.
It was packaged as data, not written or executed. The later Linux library build
compiled the six C# units without loading or invoking the resulting assembly;
it did not parse the PowerShell template or test method binding.

## CLR contract versus PowerShell method binding

Framework documentation lists the parameterless method as an explicit
`IDisposable.Dispose` implementation and `Dispose(Boolean)` as protected.
Those declarations explain C# interface access, but do not alone specify
PowerShell's adapter behavior.
[Explicit IDisposable member](https://learn.microsoft.com/en-us/dotnet/api/system.codedom.compiler.tempfilecollection.system-idisposable-dispose?view=netframework-4.8.1),
[protected Dispose(Boolean)](https://learn.microsoft.com/en-us/dotnet/api/system.codedom.compiler.tempfilecollection.dispose?view=netframework-4.8.1)

The official PowerShell 5.1 method documentation demonstrates an immediate
interface cast selecting an explicitly implemented method when a competing
public method exists. It supports the syntax
`([System.IDisposable]$temporaryFiles).Dispose()` as an explicit selection, not
the claim that every uncast interface-method call is unavailable.
[PowerShell 5.1 method selection](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_methods?view=powershell-5.1#calling-a-specific-method-when-multiple-overloads-exist)

Historical official PowerShell source enumerates public interfaces and adds
their methods to the reflection table under unqualified names. Its compiler
also uses an immediate conversion expression as a method-resolution type
constraint. This is implementation evidence against applying C# visibility
rules directly to PowerShell calls. The cited v6 alpha source is not a byte
match or behavioral qualification of the installed Windows PowerShell 5.1
binary.
[Interface method table](https://github.com/PowerShell/PowerShell/blob/v6.0.0-alpha.18/src/System.Management.Automation/engine/CoreAdapter.cs#L2832-L2878),
[conversion constraint](https://github.com/PowerShell/PowerShell/blob/v6.0.0-alpha.18/src/System.Management.Automation/engine/parser/Compiler.cs#L925-L947),
[member invocation constraint](https://github.com/PowerShell/PowerShell/blob/v6.0.0-alpha.18/src/System.Management.Automation/engine/parser/Compiler.cs#L5361-L5367)

Conclusion: the original call is not a demonstrated defect. An immediate
interface cast could make intent clearer, but no conflicting public overload
or observed failure has been identified here. That clarity change does not
justify invalidating the existing source pins or adding reflection machinery.

## What compiler cleanup can establish

The reviewed Framework reference source implements interface disposal by
calling `Dispose(true)` and suppressing finalization. The protected method
calls both `Delete()` and high-integrity-directory cleanup. `Delete()` catches
individual file-deletion errors inside its helper, then removes the tracked
name even when deletion failed. Directory cleanup also swallows errors.
Consequently, a nonthrowing disposal call or zero collection count does not
prove that all temporary files or directories were removed. Calling only
public `Delete()` would omit part of the disposal path.
[Framework TempFiles.cs](https://github.com/microsoft/referencesource/blob/3b1eaf5203992df69de44c783a3eda37d3d4cd10/System/compmod/system/codedom/compiler/TempFiles.cs)

That same source can capture identity and, under its default-directory and
administrator conditions, create and later adjust a high-integrity temporary
directory. These are compiler infrastructure effects, not operations of the
fixed security-descriptor bridge. The source revision is a Framework 4.7.2
reference-source update, not proof of every implementation detail on a later
installed Framework build.
[Framework source revision](https://github.com/microsoft/referencesource/commit/3b1eaf5203992df69de44c783a3eda37d3d4cd10),
[temporary-directory implementation](https://github.com/microsoft/referencesource/blob/3b1eaf5203992df69de44c783a3eda37d3d4cd10/System/compmod/system/codedom/compiler/TempFiles.cs)

## Consequences for the proposed harness

The template separately attempts temporary-file and provider disposal before
calling the security bridge. Its retained first error and
`cleanupFailureCount` record exceptions observed by those callers; they are
not a filesystem inventory or a guarantee that CodeDOM removed every artifact.
The existing false filesystem, pathname-handoff and execution-authority flags
must remain. The security bridge's own token/descriptor resource accounting
does not extend to the compiler's dependencies, child process or temporary
storage.

A future approved Windows run must describe the observed PowerShell/CLR host,
binding result and any surfaced cleanup failure without claiming complete
compiler-file cleanup. If the actual ordinary call fails, preserve that result
before considering the documented immediate interface cast as a separate
source successor. No failure or red/green evidence is claimed now, and no
earlier source check or compile-only run should be replayed to answer this
PowerShell-specific question.
