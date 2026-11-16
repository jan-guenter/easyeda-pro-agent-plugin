# Versioned native compiler integration

## Scope

This record closes source generation and fixed static compiler checks for the
integrated DELETE caller/poststate and Wire V5 graphs. It grants no application,
edit, persistence or cold-read authority. Earlier source records retain their
original pending statements and measurements.

The source integration includes the [original DELETE caller](2026-11-16-native-delete-original-caller.md),
[poststate continuation](2026-11-16-native-delete-preferences-poststate.md) and
[inherited Wire parent getter](2026-11-16-wire-original-inherited-parent-getter.md).
The generated V3, V4 and Wire V5 artifacts are separate fixed purposes. Their
approved input bounds and source identity checks remain unchanged.

## Compiler correction and preserved failures

Windows PowerShell 5's C# 5 compiler rejected the first caller input with CS0136:
an inner foreach variable named role conflicted with a later outer declaration.
The 2420762-byte compiler input with SHA256
52058356eb844946237d8b9bc8803f3601822b8ba0d409919ea1a0ab5054668a
and its failed receipt are retained. Renaming only that iterator to pointRole
produced the 2420777-byte input with SHA256
a54b6136f2c3b8c4c3fa480ad847c70dcac003084e6dc2732b6b671d0ec7218d.
Its strict compilation and fixed caller codec smoke passed. V3's fixed DELETE
return smoke and Wire V5's fixed smoke also passed in that earlier combined
compiler run; neither was rerun for the later V4-only change.

Poststate changes produce a distinct 2424991-byte V4 compiler input with SHA256
3972771a1fbb46f186d930393231599a9e568723fb48734793c780a623e635e9.
It compiles with C# 5, warning level 4 and warnings treated as errors, with zero
diagnostics. Both VerifyNativeDeleteCallerSmoke and
VerifyNativeDeletePoststateSmoke pass against that same compiled assembly.
The actual PowerShell null object passes the helper-role codec boundary;
integer and Language.NullString roles are rejected. The fixed packet retains
its required single trailing NUL frame delimiter.

Two attempts of the private boundary harness failed after compilation: it first
passed the NUL-terminated frame directly to the JSON parser, then used an
exception catch type that did not match PowerShell's reflection wrapper. Both
failures remain recorded. The corrected harness validates/removes only the
required final delimiter and checks the actual underlying rejection. The native
source and compiler bytes did not change between these attempts.

## Custody and limits

Each Windows compiler process was started hidden, retained through its original
process handle and observed exited. Compiler temporary files were disposed.
The successful poststate attempt exited zero with empty stderr. These checks
compile in memory and invoke only the named fixed static methods; they do not
run the generated CompileOnly driver, allocate a native Job, start EasyEDA or
allocate a facade. Private raw compiler inputs, diagnostics and terminal receipts
remain outside the public repository.

Generated PS1/C# review artifacts and identity modules are synchronized from
source. This is source/compiler evidence. Connected DELETE poststate,
persistence, newly issued cold absence, Wire native Modify and whole-workflow
validation remain separate outstanding work.


## Integrated source checks

Both TypeScript projects pass, and the integrated full-project type-aware strict
lint reports zero diagnostics. Source generation checks for V3, V4 and Wire V5
pass against the final generated files. The repository validator initially
refused because its expected build literal omitted the newly required Wire V5
generator check, while the actual build command already included it. The
validator now requires that check in both the build sequence and its explicit
script assertion. Its narrow strict lint, corrected repository validation and
all packaged-skill validation pass. The earlier refusal remains retained.
These checks do not refresh bundled service code or establish runtime admission.

## Secondary plugin-validator correction

The combined cold/Wire integration also exercised the separate MCP/plugin
validator. Its exact build-script predicate still omitted the already required
WireV5 generated check, although the repository validator had been corrected
in the earlier integration. The original failed MCP report is retained. The
plugin validator now explicitly checks both maintained WireV5 check/update
commands and their existing build position. This synchronizes the independent
contract checks without relaxing their exact command or artifact requirements.
The subsequent validation result is recorded separately after the correction.

The corrected plugin-validator predicate, owned strict lint, repository/MCP and
all-skill checks pass. The first correction placed the WireV5 check after
V4 rather than its actual position immediately after schematic saved-reader
verification; that refusal is also retained. The exact actual order remains
required and no build check was removed.
