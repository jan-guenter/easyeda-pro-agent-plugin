# Native-only projector review corrections

The source-only review branch starts at public commit
`12997080e3a223f0560edc924d78bb6d2d6f9cb9` and addresses the two projector
findings on PR212. It contains no private implementation ancestry.

The method closure now retains qualified instance references such as
`reader.Read()`, along with their transitive methods and fields. Matching is
conservative across receiver types; it does not add a runtime selector or
caller-supplied route.

Signature dependencies use a separate field graph. Every public declaration
survives projection even when its body is closed, so its default constants and
their initializer chains must survive too. A retained private method contributes
its signature dependencies when its body enters the closure. Signature tokens
never seed method reachability: method and parameter declaration names must not
reopen closed public bodies. The regressions include a closed parameter whose
name matches another closed public method.

The five focused production-projector checks pass without skips. Against the
unchanged public projector, the original two checks pass and all three added
regressions fail. The exact projected source from those three new cases also
compiles as C#5 with warning level4 and warnings as errors, then executes with
the expected reachable results while all five tested closed public calls throw.
This uses Linux SDK10.0.114 and CLR10.0.14, with inert fixture classes. It is
not Windows PowerShell/.NET Framework or connected native validation.

The projector remains build-only and unmounted on this public base. This change
does not allocate a native owner, change compiler/profile limits, regenerate a
helper, or establish any live edit, Save or cold-readback result. Complete
integration, bundles and exact-commit CI belong to the parent review batch.

Both TypeScript configurations and strict type-aware lint on the two changed
TypeScript files pass. Repository, MCP-contract and all-skill validation and
the official quick validator for all seven packaged skills pass. The first
repository check correctly refused a temporary dependency-directory symlink;
the final check uses an ordinary dependency directory. The original failure
log is retained privately. Full bundled/CI validation remains with integration.
