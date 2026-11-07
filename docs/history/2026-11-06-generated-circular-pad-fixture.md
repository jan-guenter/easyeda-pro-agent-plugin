# Generated standalone circular SMT Pad fixture

The maintained importer now accepts the distinct `circular-smt-pad-only` kind.
It generates one fresh PCB with exactly DOCHEAD, META and one PAD, without any
Component, footprint library, image, hole, placed-pad parent or existing design
input. The native PAD body uses the exact29-field current-format `Jg.getPAD`
roster. The fixed default style is ELLIPSE200 by200 in source units, top copper1,
center0/0, angle0, NORMAL pad type and unlocked. The pinned decoder divides
positions and dimensions by ten. Its native top `tC` style is20 by20 with radius10,
and bottom/inner/hole are null.

`managed-pad-fixture-generator.ts` records the full pinned PCB source and exact
decoder, style, geometry and field-roster spans in its own immutable template
profile. The offline `check-generated-pad-fixture-source.ts` verifies that full
source plus every recorded span, executes the actual numeric decoder and style
factory on fresh inert data, and compares its exact projection. The native model
allocation tail is replaced with an explicit inert capture. No app, importer,
renderer, file lease or original runtime is created by that source check.

The initial SQL qualification is separate from the earlier Via/Line/Arc profile.
`qualifyGeneratedPadFixtureInitialSql` qualifies every table/schema/row/default,
the original encrypted initial history, source framing, complete fixed PAD body,
source IDs/tickets, unticked header, native Windows file clocks and exact imported
PCB structure through the established complete initial-row checker. It issues
`qualified-generated-pad-fixture-target.v1` only in its own WeakMap. The old
qualifier and old target/checkpoint brands remain unchanged and refuse Pad data.

The Pad initial target stages once through
`private.generated-pad-fixture-opening-source.v1`. Its separate
`generated-pad-fixture-open-checkpoint.v1` rechecks the exact source and managed
VACUUM checkpoint, including the one-field schema-version projection. An explicit
read-only union chooses the original profile or Pad profile at the fresh ordinary
or spatial lifecycle boundary. The original Via writer still requires its old
checkpoint issuer. Neither JSON nor a caller path can create this source token.

The original import coordinator routes the new kind through its existing
environment journal, original once-only SDK Promise, exclusive destination,
retained directory/library watches, original normal close, root/empty Job and
Windows file-metadata capture. The new closed report is
`easyeda-pro-control.managed-pad-fixture-closed-snapshot.v1`; it carries
`sourceClockSource:original-destination-windows-filetime`,
`windowsClosedFileMetadata` and `issuedPadReadOpenTarget`. It does not substitute
an old positive capture schema. Its report, target and flags are separate from
registration, positive native Pad reading and persistent acceptance.

After capture and original cleanup, release destination and importer owner,
then stage with the existing `stage-for-fresh-opening` action. Release the old
ordinary runtime, launch a fresh generated-source spatial owner, and use its
exact generated registration/project/PCB opening prefix before the separate
`observe-spatial-pads` batch. Registration admits only the additional fixed
`Codex_circular_smt_pad_<16hex>.eprj2` basename and original issued target. Its
effect remains one exact raw-path open/recent-path row, with every other
registration entry retained. Root must regenerate that fixed native fragment.

The reader's later closed-data capture has a distinct
`generated-pad-reader-closed-snapshot.v1` schema. It retains exact bytes, complete
SQL and raw history using new Linux descriptors after its own original root/Job
closure. It claims no surviving importer handles, new target, startup-effect
acceptance or writer authority. Historical fresh-manager closed-data reuse does
not yet parse the new Pad profile; do not present old receipt IDs as Pad owners.

Pinned Node24.18.0 checks passed23 focused generator, real synthetic SQLite,
old-profile, copy/refusal, once-only staging, actual import coordinator and fixed
registration regressions. The installed full-source/actual decoder-style check,
both TypeScript projects and strict type-aware lint passed. A temporary generated
C# helper compiled and its registration smoke covered the new Pad basename.
No tracked helper, payload pin or generated bundle was changed by this child.
Windows compilation, native import/closure/SQL and a positive original Pad reader
case remain unproved. Component geometry remains refused as documented in the
[Pad point reader record](2026-11-06-pad-point-spatial-source.md).

The first source commit `e294d6b9` still had two integration refusals. The actual
destination grammar omitted the Pad basename, and the schematic navigation
derivation expected the earlier PCB registration regex. The synthetic importer
destination seam did not exercise the actual basename validator. A subsequent
source audit found both before a native Pad selection. The follow-up adds only
the fixed circular-Pad alternative to both native destination guards and its
TypeScript validator, refreshes that helper SHA, and updates the schematic
derivation anchor. A real original Node-child destination/metadata transport
regression and existing schematic program tests cover those boundaries. No
native Pad attempt or original failure stderr is claimed.
