# Generated PCB fixture archives

This continuation builds on managed preparation commit
`87d6b02a0409f17e2d8973834bc81539de7419c4` on
`feature/managed-fixture-import-20261105`. The full commit ID is recorded by Git;
the [preparation record](2026-11-05-managed-fixture-archive-preparation.md)
retains the native importer limits.

`easyeda_control_library_files` now accepts `generate-fixture-archive` with
`fixtureKind:"via-only"` or `"line-and-via"`, plus explicit disposable and local
artifact confirmations. It accepts no geometry, identifiers, source, version
or destination override. It generates entirely new ZIP32 `.epro2` data, then
uses the ordinary managed input preparation and fixture staging operations.
No project file or SQLite database supplies or receives the generated geometry.

Each archive contains exactly `project2.json` and one root `Fixture.epru` stream.
It has a fresh safe project title, native client and document IDs, and primitive
IDs. There is one ordinary free root PCB with the source-defined native
DOCHEAD and META shape. It contains one unlocked ordinary through Via at the
origin, with explicit solder expansions, an empty rule name and empty net. The
optional unlocked top-layer LINE is disjoint from the Via. Current native code
represents that LINE as Track. There are no components, pads, assets, libraries,
schematics or board attachment. Default canvas/layer/rule initialization and
connected importability remain unproved.

## Reviewed source and executable offline check

The retained template profile pins PCB `3.2.195.6b67774e/js/pcb.js`,
10,991,441 bytes, SHA-256
`a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b`,
and manager `3.2.185.bf63a159/js/pro-mgr.js`, 2,196,424 bytes, SHA-256
`b3260ec9d98d6cad5f65a6234aa839b32f6bf5954cb03de0bd6ce003577b388d`.
The target application is `3.2.209.8a704eab`. Method locations and hashes for
the PCB field rosters, Via and Line feed/check/finish methods, and manager root
PCB metadata construction remain in the first-party template profile.

The maintained `scripts/check-managed-fixture-codecs.ts` checker ran against
that exact installed source without opening EasyEDA. It matched complete file
and selected method hashes, compared the generated field rosters with native
`Jg.getVIA/getLINE("2.0")`, and executed the actual selected native codec
methods in an isolated VM. Vector and model constructors were synthetic. The
Via feed/check/finish produced ordinary type 0, explicit expansion type 2,
center `(0,0)`, radii 10 and 5 and layers 1 through 2. Line feed/check/finish
produced layer 1, endpoints `(50,0)` and `(150,0)`, width 10 and unlocked state.
The actual manager metadata mapper preserved the complete generated META.
This is offline source-code execution, not an editor scene or persistence test.

Ordinary generation does not reread installed application files. Its report
therefore keeps `currentInstalledSourcesVerified:false` and identifies its fixed
reviewed template instead of inventing current runtime admission. It also keeps
`nativeSceneVerified:false` and `nativeImportabilityVerified:false`.

Four generator regressions cover complete physical-family/source rosters,
fresh independent IDs, the real maintained preparation route and rejected
caller geometry/path/source/version selectors. Adjacent preparation, original
Promise, metadata and source-reader regressions pass, 32 tests in total.
Typecheck, focused type-aware lint, repository, MCP-contract and all-skill
validation pass. The new coverage omission regression passes and retains the
public importer as omitted. The inventory equality test first refused the old
generated coverage file, then all 62 coverage tests and coverage checking passed
after regeneration. That generated-only delta was restored so root integration
can regenerate coverage together with the other agents' changes. No generated
archive or private evidence is committed.

## Original eager facade closure

The host eagerly allocated this agent's otherwise unused metadata-only facade
before any EasyEDA tool call. At the parent's direction, this agent discovered
the actual session schema, inspected its own session once and retained a Linux
pidfd for original PID `797529`, start ticks `120918421`. It verified the pinned
Node executable and installed `182454` server, no child processes and no socket
or native-owner descriptors. The source-only retirement returned `retired`,
zero active calls and acknowledged lease release. One `close-retired` request
scheduled normal closure. The original pidfd then observed exit. No signal,
native call or owner adoption was used, and the closed transport is not reused.
The exact selected original rollout records and an agent summary remain in a
private evidence directory reported to the parent.

The next native step still needs an original contained import owner and a
host-visible exclusive destination. Import structure creation uses the manager's
direct `project.setProfile` POST, bypassing the project worker's QA/Nd debounce.
A generic worker completion witness cannot be substituted for this route.
