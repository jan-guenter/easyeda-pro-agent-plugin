# Fixture library parser on Windows PowerShell5.1

The destination wrapper captured `ConvertFrom-Json` inside an array subexpression.
Windows PowerShell5.1 emits a JSON array as one pipeline object, producing a
nested array. The next loop's scalar-string guard therefore rejected the roster
before constructing a library watcher or destination. The supported host's
behavior differs from modern PowerShell's default enumeration. This distinction
is recorded in the upstream [PowerShell array-enumeration issue](https://github.com/PowerShell/PowerShell/issues/3424)
and [Microsoft's design confirmation](https://github.com/PowerShell/PowerShell/issues/21451).

Root independently ran a pure parser check on installed Windows
PowerShell5.1.19041.6456: the former array-subexpression capture produced Count1
with an Object[] element; direct decoded-variable capture produced the expected
Object[] and string elements. That probe used no C#, Win32 API, CAD file or app.
The earlier native-case stderr was discarded, so this source defect is not
claimed as its observed failure cause.

Root then isolated a second5.1 data-only detail: the parsed Object[] retained
an extended PSObject wrapper that serialized as an object with value/Count
fields. After every element passes the same scalar/path checks, the parser
returns a fresh CLR string[] to drop that wrapper. No unvalidated value is
coerced to a string.

The helper now captures the decoded JSON directly and explicitly requires an
Object[] with one to four unique string paths. It retains the finite input/path
bounds, rooted path grammar, component checks, case-insensitive uniqueness, and
all subsequent original native canonical-path, handle, roster and watch guards.
Its complete C# block is byte-identical to the preceding helper source.

`scripts/check-managed-fixture-library-parser.ps1` is a maintained14-case Windows
PowerShell5.1 regression. It invokes the production helper's early
`-ParseLibraryDirectoriesOnly` branch, which returns before Add-Type or any
native allocation. Its early JSON result uses the PowerShell pipeline so the
check captures it in the same host; the real native stdio protocol is unchanged.
Cases cover one/four valid directories and scalar, empty,
large, nested, object, numeric/null, relative, traversal, whitespace, reserved
component and duplicate refusals. Root executes this host-specific data check;
no child agent ran Windows or a native fixture case.

The updated destination helper SHA-256 is
`c27d50a80f11676d5bc0ac5cb963a63d8ee9cae6d0c5fec2a92b11b5ba98ba6d`.
The closed-data helper uses JSON objects for its protocol and has no top-level
JSON directory-array parser, so this particular correction does not change its
source identity. Three original destination transport/source-hash regressions
and strict type-aware lint pass; actual destination construction/import remains
separate native validation.

## Actual Windows parser and compilation checks

The first maintained5.1 check failed `parser-array-roster` before C# or native
allocation. The early diagnostic JSON serialized the returned Object[] as an
extended wrapper containing `value` and `Count`. The final helper creates a
fresh CLR string[] only after validating every original array member. Its same
14-case check then passed on actual Windows PowerShell5.1.19041.6456, exit0
with empty stderr. No C#, directory/watch, application or SQL action ran in
that parser check. This does not recover the earlier native helper's lost error.

The final18821byte destination helper at the SHA above also passed actual
Windows5.1 `-CompileOnly`, exit0 with empty stdout/stderr and unchanged source
before/after. The separate18296byte closed-data helper, SHA256
`42e2395c6d04c972569a43a2f8f460b8b772db34340f475c9b4ce911c2369f17`,
passed the same compilation prerequisite. Neither command constructs a native
file/watch owner, starts EasyEDA or qualifies connected data reuse/import.

The Windows GitHub workflow now includes the maintained parser check and both
isolated helper compilations. Their unmodified run bodies passed locally under
Windows5.1 with strict mode and a child-only workspace prologue. An initial
local invocation lacked the Windows workspace environment variable and stopped
before reaching the helper; its failure is retained. These are local checks,
not hosted CI. Exact final GitHub runs remain required for release.
