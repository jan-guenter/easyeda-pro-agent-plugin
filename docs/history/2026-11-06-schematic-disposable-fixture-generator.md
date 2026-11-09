# Generated schematic reader fixture

This source increment adds a separate fixed generator for one ordinary SCH
container and its SCH_PAGE, with a Text and disjoint one-segment Wire and Bus
groups. It invents no component, pin, symbol, library asset or electrical net.
It reads no existing project and writes no native file. The two-member ZIP32
packer is shared with the existing PCB generator without changing its framing.

The manager serializer is pinned at
`pro-mgr/3.2.185.bf63a159/js/pro-mgr.js`, SHA256
`b3260ec9d98d6cad5f65a6234aa839b32f6bf5954cb03de0bd6ce003577b388d`.
The profile also pins exact UTF16 ranges and hashes for twelve pure functions:
SCH/SCH_PAGE metadata, Text/Wire/Bus field projection, line construction,
coordinate and legacy-ID normalization, and the four JSON record encoders.
Generated element IDs start with zero to remain unchanged under that legacy
normalizer while retaining sixty random bits. All identities are checked once.

`check-managed-schematic-fixture-template.ts` verified the captured complete
manager bytes and ran those original functions in an isolated Linux VM. Their
five emitted records and both metadata objects matched the actual generated
archive. The entropy callback and ordering callback were substituted with the
already-generated IDs and null order. This is a source serializer check, not
execution of the schematic editor, native import or electrical solver.

Six focused generator/preparation checks pass, including the existing PCB
cases and complete fresh schematic document/parent/line ownership. Type checks
and strict type-aware lint pass with zero lint findings. Final combined build,
CI and native qualification remain separate. The generator is deliberately not
advertised as a live import scenario until complete initial SQL, generated
project/page opening and original cleanup support are joined. Display-only
transactions and connectivity-qualified wiring remain implementation work.
