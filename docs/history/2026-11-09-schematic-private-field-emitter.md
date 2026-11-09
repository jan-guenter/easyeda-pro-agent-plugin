# Schematic private field emission

The complete combined source at base
`44a904b4c66e4b16dfe8fea3a4ab5b5ba0288b66` refused before the schematic hash
projection. Its captured pre-hash C# was 2,232,131 bytes, SHA256
`1c6f4f238289faae81a63d47c16316ff0461c28ccb796ac6cea839cd9381b802`,
3,907 bytes over the unchanged 2,228,224-byte bound. Temporary capture code was
removed before the final checks. The refused generation returned no compiler
input or admitted artifact.

A new schematic-only emitter shortens 155 fixed private/default-private
EasyedaDiagnosticOwner fields across 1,717 exact uses. The readable mapping has
SHA256 `6c8da5d28f20db7cadbc8309c8ca6bf5951675f891eaffee765df6d115fae338`.
Each field has exactly one private declaration, a fixed complete use count and
neighbor-token context hash. Globally fresh `sgx` spellings reject ordinary and
escaped-name collisions. The closed-source audit rejects foreign declarations,
public fields, shadowing, escaped selected spellings, anonymous keys and
reflection/serializer/nameof constructs. Eleven existing UploadSerialize
protocol names have explicit use-count/context pins; they remain ordinary
fixed-codec fields, classes and methods. The only actual serialization call is
the already existing, exactly checked TimeZoneInfo receiver sequence.

The output is canonical emitted C#, with no spelling metadata, storage format,
field expander or new decoder. Every token is relexed and compared after
splicing. Only the selected field identifier tokens can differ. All methods,
types, comments, strings, JSON, compressed program tables, hash vectors, wire
packets, guards and native behavior retain their original bytes or references.
The hook runs only for schematic output, after its immutable-program projection
and before the existing hash/alias passes. Inverse code and its hook are unchanged.

The checked implementation/test tree is
`c7900c765a965b5fc4f25a279e40f126c8ee9996` on the base above, before this later
history/index addition. One focused complete-emission case passed with zero
skips. It reconstructs the entire original pre-hash source to the exact original
SHA256, checks every token and payload, verifies the declaration/use catalogue,
exercises malformed declaration/shadow/escape/reflection/anonymous-key cases,
and proves complete broad schematic generation repeats byte for byte. Both
TypeScript projects, strict lint on the three changed implementation/test files,
and repository/plugin/skill validators exited zero on that unchanged tree.

The measured source saving is 35,384 bytes:

| Input | Bytes | Margin under unchanged bound | SHA256 |
| --- | ---: | ---: | --- |
| Pre-hash C# | 2,196,747 | 31,477 | `df7f37e0b65cea8caf85ffe2abb926a160bb7b5090ffdab6fa0a72078cb57a21` |
| Compiler C# | 2,052,505 | 44,647 | `fedb9cd42f65bf528ae8fe750c364f4733150c342daee77358d64bb8fea8dca8` |

An initial catalogue included two purpose flags whose names survive outside
regenerated blocks. The second broad generation correctly refused those stale
aliases. Both flags were excluded and additional marker-owned fields supplied
the measured saving; no alias expander or weaker guard was added. Initial
strict lint found one test-variable ordering issue, corrected before the final
passing check. Original capacity and initial development refusals remain
recorded privately.

An independent read-only audit confirmed selected names do not occur in C#
literals, anonymous keys, foreign owner scopes or external PowerShell references.
That source review found no remaining concrete defect. Actual C# compilation,
final four-layout composed measurements and connected lifecycle acceptance
remain separate parent work. This leaf ran no C#/Windows/helper/app/SQLite/MCP
actor, changed no runtime artifact or pin, and did not open or change the
protected production design.
