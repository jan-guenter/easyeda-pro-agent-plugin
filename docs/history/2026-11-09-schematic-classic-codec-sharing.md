# Shared classic schematic codebooks

This source leaf is based on `c35855cc539247ff2c9e33c2740a30e3689cb331`.
Ten older schematic emitters now delegate fixed encoding to the existing
`EasyedaSchematicUiFixedCodec`. No shared helper, factory, generator hook,
storage catalogue, V1 through V5 decoder, bound or owner state changes.

RunPrefix, NoEcho, NormalRecord, NormalDisposal, NormalUpdate, HistoryCommand,
MonitorBatch, RecordAst and Primitive retain their original Rows, Programs,
local Need/error prefixes and 83-ID wire expectations. Their duplicate
Handle/Json/Encode and golden-smoke loops are replaced by calls to the existing
shared implementation. RunPrefix also retains its specific
`prefix-resume-run` rejection. RunGuard delegates only encoding and handle
validation, with an empty program table and literal `run_guard` marker. Its
original 89-ID smoke and complete native owner body remain byte-exact.
Generated class-boundary newlines are omitted; JS strings and wire data are
unchanged. The context-bearing UI-publication codec remains unchanged.

The frozen composed prehash input was 2,235,841 bytes, SHA256
`421ed434301f1e38adc0366f71c4d89830d7eeb8546ef4676a59cf2d75e369f4`.
An independent data-only projection of just these method replacements and
class whitespace produced 2,217,263 bytes, SHA256
`96eb957e82cb11a336f6b1b745a41b8f825d4cc67e4c3437c7a5c2e485279a46`.
The saving is 18,578 bytes. It puts that input 10,961 bytes below the unchanged
2,228,224-byte review ceiling. The original fixture stayed unchanged. All 187
fixed-table loader calls and 85 golden hash-vector calls in the composed input
were byte-identical. Raw evidence remains outside the repository.

Focused Node checks decode the ten emitters' original bounded tables and verify
269 rendered wire packets against pre-refactor golden SHA256 values. They pin
the original table/vector bytes, shared guard implementation and RunGuard owner
body, check the saving, and prove current V5 expansion and repeat projection.
Historical V1 through V4 storage regressions remain included. Eleven focused
checks, TypeScript, strict changed-file lint and mandatory repository, skill and
plugin/MCP validation passed under Node 24.18.0, npm 11.16.0 and soft core limit
zero. The emitter table builders and their original 65KiB limits are unchanged.

No C#, Windows, Bubblewrap, EasyEDA, SDK, native actor, controller selection or
bundle generation ran. Native encoding behavior relies on the existing shared
codec, which is already present in the full schematic composition. The parent
retains final merged-source regeneration, four-layout measurements, C# proof
and regating. The isolated saving is not final composed-size or live evidence.
