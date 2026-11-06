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

The helper now captures the decoded JSON directly and explicitly requires an
Object[] with one to four unique string paths. It retains the finite input/path
bounds, rooted path grammar, component checks, case-insensitive uniqueness, and
all subsequent original native canonical-path, handle, roster and watch guards.
Its complete C# block is byte-identical to the preceding helper source.

`scripts/check-managed-fixture-library-parser.ps1` is a maintained14-case Windows
PowerShell5.1 regression. It invokes the production helper's early
`-ParseLibraryDirectoriesOnly` branch, which returns before Add-Type or any
native allocation. Cases cover one/four valid directories and scalar, empty,
large, nested, object, numeric/null, relative, traversal, whitespace, reserved
component and duplicate refusals. Root executes this host-specific data check;
no child agent ran Windows or a native fixture case.

The updated destination helper SHA-256 is
`c53171987cda0e2b4986a4e6f5df432f3063199b825b050753124cbcaf973e16`.
The closed-data helper uses JSON objects for its protocol and has no top-level
JSON directory-array parser, so this particular correction does not change its
source identity. Three original destination transport/source-hash regressions
and strict type-aware lint pass; actual destination construction/import remains
separate native validation.
