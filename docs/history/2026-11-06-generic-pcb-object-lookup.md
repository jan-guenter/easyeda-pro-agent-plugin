# Generic supported PCB object lookup

The installed `pcb_Primitive.getPrimitiveByPrimitiveId` is empty, and the plural
wrapper delegates to it. Two native task equivalents now reuse the maintained
geometry receiver and existing nine supported family projections. Both accept
an explicit `primitiveIds` array in caller order; singular requires one ID.
They return plain DTOs, not public instances or a scalar public getter result.

Each of two matching compound observations retains every supported family row,
family ID order and Attribute parent group before choosing requested objects.
Unknown/ambiguous IDs and malformed unrequested supported rows refuse whole.
Selection is neither read nor changed. An unavailable ID proves no absence from
unsupported families or saved source. Existing per-family256row and aggregate
384KiB bounds remain; no source ownership, atomic isolation, topology, writer,
Save or persistence claim is introduced.

The actual generated program ran in the existing cross-realm test fixture.
The geometry and registered-callback files passed46tests. New cases cover mixed
lookup order, one-ID singular input, no selection calls, unavailable/duplicate
identities, unsupported unrequested data, full-sample drift and independent
host membership refusal. The initial new assertion miscounted the synthetic
fixture as17rather than16objects; correcting that assertion retained the
unchanged fixture and implementation. Types passed; strict lint is recorded
with the final combined batch. No application or design was opened.

`e7f1f16`, `ff14c42` and `cae7151` separately integrate the dedicated native
structure observer, original cold bootstrap producer roster and tracked-open
cleanup. These remain observation/cleanup capabilities. In particular, cold
initial dormancy is not continuous upload-frontier or writer eligibility proof.
