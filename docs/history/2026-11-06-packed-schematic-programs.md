# Packed fixed schematic programs

The combined source at `769c8ae1` exceeded the existing native helper bound:
2,110,822bytes against2,097,152. Generation refused before a helper could be
selected or an application launched. The failed preparation remains private.

The new schematic Start, Navigation and Stage programs now use the existing
bounded `UnpackFixedProgram` codec. The generator pins compressed and restored
SHA-256 values and complete byte lengths. Navigation restores45,902bytes and
Stage17,487bytes; the exact functions sent to EasyEDA are unchanged. The native
decoder and message limits are unchanged, as are the six released forward/cold
roles. The existing seven-stage native message parity check is separately
callable without constructing an owner.

Two-pass full combined generation now produces2,069,517bytes, SHA-256
`14fef14b3a9fbaee083c7523af02b19034e7ebd1574d75dc402f37981a450a74`.
Its complete C# source is1,883,200bytes, SHA-256
`51208c756e7734f049ec1bf193992e1141be633ec29b1534f01f2100fc344b9d`.
These identify this development input plus the packing change, not an installed
payload. The complete C# compiled on Linux with.NET10. Its pure fixed-codec
checks passed for all five Via SDK stages, all seven schematic stages, producer,
initial cache, initial sync and periodic sync. No native owner, process handle,
Windows application or design operation was created. Windows/runtime validation
remains separate.

Two focused composition/packing checks and the three existing observer-group
checks passed together. Changed strict lint passed with zero warnings. Tracked
helper generation, pins and bundles remain for the combined release build.
