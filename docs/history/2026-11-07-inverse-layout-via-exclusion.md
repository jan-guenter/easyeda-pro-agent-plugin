# Inverse layout excludes Via action code

The inverse helper no longer includes seven unrelated Via Save/upload/history
lanes. Its actual timer path still uses the exact shared28-row project-sync
codec. That codec is now a separate readonly build composition without the Via
state, SDK guards, dispatch, or action methods.

A first compile correctly refused removal of the shared codec because the
inverse timer references its `Phase` and `Encode` methods. Restoring only that
codec resolved the dependency. No throwing stub, request limit, method grant,
expected message, or older-purpose gate was changed.

Before this change the current inverse compiler input was2,091,600bytes.
Afterward it was2,014,698bytes, recovering76,902bytes and leaving82,454bytes
within the unchanged2MiB ceiling. Independent before/after generation proved
complete diagnostic and schematic helper/compiler byte equality. Their existing
Via implementations are unchanged.

The complete C#5 inverse compiler and all22 then-current pure inverse smoke
checks passed. Nine focused timer/observer checks passed. A separate regression
checks that the inverse keeps its shared codec while excluding the seven Via
lanes and their action methods. This is source/compilation evidence. It creates
no application, native Job, owner, writer, or Save authority. New GET controller
work is integrated separately and must repeat the composed build checks.
