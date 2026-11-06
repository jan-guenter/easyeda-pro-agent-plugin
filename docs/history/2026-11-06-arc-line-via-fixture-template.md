# Fixed Arc, Line and Via fixture

The maintained generator adds `arc-line-and-via`. It creates a new root PCB with
the existing through Via and disjoint top-layer Line, plus one unlocked circular
quarter Arc on copper layer1. There are no assets, library dependencies, networks,
components, board shapes, caller geometry or existing design inputs.

The native source body is fixed: start(2500,1000), end(3500,0), angle90 degrees,
width100, `arcType:"DOT"`, empty net and partition, group0, unlocked and null
zIndex. It is the fourth ticketed record, following META1, VIA2 and LINE3, with a
fresh primitive ID. Source coordinates divide by ten. The intended native
ArcTrack has center(350,100), radius100, start angleπ, end angle3π/2, sweep1,
arcType1 and width10. It is disjoint from the Via at(0,0) and Line(50,0)→(150,0).

This mapping is source-derived from the pinned PCB source SHA-256
`a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b`:

- `Jg.getARC` at3998861–3999211 supplies all13 field names in source order.
- `jM` at2769520 sets DOT="DOT" and CENTER="CENT". `kVe` at4010733 maps DOT
  to native arcType1. `Q4.feed/check/arcCheck/finish` at4080607 onward scale the
  input and validate the exact Arc record.
- `yo.pointToAngle` at3881573–3882079 computes the circle and directed angles.
  `tF`'s constructor at4071716–4071847 applies native `q1` angle normalization.

The offline codec checker verifies complete file hashes and every selected span,
then executes those exact methods in its isolated VM. Enum initialization and
Arc math/base construction execute from pinned source; vector and final model
constructors remain synthetic. Numeric output is checked within1e−10 of the
fixed geometry. This is source qualification, not native scene or import proof.

Closed import qualification now requires the exact ARC family roster, complete
fixed body, original ID/ticket and byte-identical decrypted source stream.
The destination, checkpoint and native registration filename grammars admit
only the additional fixed generated basename. The destination helper's C# and
watch lifecycle are unchanged; its exact source SHA-256 changes because its
PowerShell input grammar includes the new scenario.

Generator/staging, complete synthetic SQLite/history and fixed registration
regressions cover the combined archive and reject changed curved geometry.
The actual installed-source codec checker passes. Connected native import,
ready ArcTrack, positive spatial queries and closed persistence still require
their original native lifecycle evidence. Their acceptance flags remain false.
