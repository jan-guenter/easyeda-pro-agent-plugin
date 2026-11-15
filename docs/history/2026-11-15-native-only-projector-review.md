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

## Constructor and initializer closure review on c8c612de

This separate correction starts at public
`c8c612de6427c9437e1bfc749ad6462c01a5a39e`. It addresses constructor
initializer dependencies, unread initializer effects, executable initializers
of closed public constructors, and same-owner private fields read through typed
receivers.

Only constructor initializer argument tokens join method reachability; method
and parameter declaration names still do not reopen closed public bodies. A
closed public constructor retains its initializer dependencies because that
initializer executes before its replacement throw. Static initialization follows retained members/fields and constructor
obligations. Instance initialization follows retained instance members,
original construction, or an executable public-constructor obligation. Nontrivial unread
initializers and their dependencies survive in their original declaration order.
Elision is limited to a primitive target with literal/builtin constant operands;
calls, getters, user conversions and unknown expressions are preserved.
Unreferenced classes and unused mutator bodies are not generally restored.
Marked inheritance needing unresolved base-constructor/field-layout analysis
refuses rather than guessing; an unmarked base remains byte-exact.

Private field references through an original lexically typed receiver now join
the same owner's field closure. This uses the same conservative receiver type
proof as the existing original-writer analysis. Completed constructor/initializer
dependencies undergo the existing reflection refusal. Existing bounded markers,
compiler limits, warning policy and public-route closures are unchanged.

All 20 focused cases pass without skips; both TypeScript projects and strict
lint on the two changed source/test files pass. Actual Windows PowerShell 5/.NET
Framework C#5, warning level 4 and warnings as errors, compiled and ran nine
original/projected pairs with zero diagnostics. They preserve constructor
arguments (9), unread static/instance effects (7), typed private reads (7),
implicit-constructor effects (7), closed-constructor initializer effects (9),
the previous static-constructor and order cases (7/12), and user conversion
effects (7). A separate CS0219 fixture remains a compiler error.

The full private readable graph also compiled under that strict C#5 policy,
without instantiating or executing any actual helper class: 2,437,074 bytes,
SHA-256 `d96aa9dea8db519a185ab97475ad0296b2a96c1b545e773ec1077cc10a70cf4d`.
This is a readable-source compilation, not a production envelope admission.
Generic preservation restores 93,000 bytes, mostly previously unread immutable
table-loading initializers. After the existing common-field pass the input is
2,396,114 bytes, exceeding the unchanged 2,326,528 continuation input limit by
69,586; production generation correctly refuses and emits no new helper.
No by-name Load exemption, new compiler profile, bound change, owner grant or
whole-DEL claim is included. A future elision requires exact maintained decoder,
binding and literal-table proof; it is not inferred here from a method name.

## Constructor targets, reflection and identifier review on 485dbb4d

This correction starts at public
`485dbb4d220ce127bb95d7290593d3a8a5b369eb`. A surviving public
`this(...)` initializer retains its sole alternative constructor in a
complete marked class, including the target's body dependencies. Unresolved
constructor overloads or partial ownership refuse rather than guessing which
private constructor may disappear. The public outer body remains closed.

Reflection checks now decode C#5 ordinary and verbatim string values, including
greedy hexadecimal and Unicode escapes. Metadata names use identifier identity,
so `@secret` is checked as `secret`. Dynamic or compound names, method
groups and bulk member/constructor enumeration refuse because this projector
does not establish the target type's complete reflection semantics.

Dependency comparisons likewise normalize escaped identifier spelling across
owners, methods, fields and typed receivers while preserving original tokens,
source offsets and retained source bytes. Keyword/modifier and initializer
effect parsing still use raw spelling; an executable `@default()` call
cannot become the builtin `default` expression. Inherited instance
dispatch, virtual/override/abstract members and interface implementations are
outside the closed generated grammar and refuse, including inheritance on an
unmarked partial declaration. Concrete closed-constructor base arguments
remain preserved.

All 25 focused cases pass without skips; both TypeScript projects and strict
lint on the two changed files pass. Actual Windows PowerShell 5/.NET Framework
C#5 with warning level 4 and warnings as errors compiled and ran three
original/projected pairs without diagnostics: closed outer constructor target
effects (7), mixed identifier spelling (14), and a verbatim-keyword initializer
effect (7). Four original reflection/dispatch fixtures return 7, 7, 1 and 8;
their projected inputs correctly refuse. The unrelated CS0219 fixture remains
an error. Repository, MCP-contract and all-skill validation pass.

No helper is regenerated by this review leaf. The preceding private capacity
refusal remains evidence for its exact earlier source; it is not a compiler
admission for this correction. Historical bounds, runtime owner/command guards
and public result schemas are unchanged. No native owner, Job or application
is allocated, and no DEL, persistence or cold-readback lifecycle is granted.
