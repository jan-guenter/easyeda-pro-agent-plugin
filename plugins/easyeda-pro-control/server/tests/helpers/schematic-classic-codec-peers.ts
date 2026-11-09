/** Sealed pre-refactor table/vector fingerprints from canonical c35855cc. */
import { currentSchematicRelevanceRunPrefixNativeSource } from "../../src/current-schematic-relevance-run-prefix-native.ts";
import { currentSchematicRelevanceNoEchoNativeSource } from "../../src/current-schematic-relevance-noecho-native.ts";
import { currentSchematicRelevanceNormalRecordNativeSource } from "../../src/current-schematic-relevance-normal-record-native.ts";
import { currentSchematicRelevanceNormalDisposalNativeSource } from "../../src/current-schematic-relevance-normal-disposal-native.ts";
import { currentSchematicRelevanceNormalUpdateNativeSource } from "../../src/current-schematic-relevance-normal-update-native.ts";
import { currentSchematicRelevanceHistoryCommandNativeSource } from "../../src/current-schematic-relevance-history-command-native.ts";
import { currentSchematicRelevanceMonitorBatchNativeSource } from "../../src/current-schematic-relevance-monitor-batch-native.ts";
import { currentSchematicRelevanceRecordAstNativeSource } from "../../src/current-schematic-relevance-record-ast-native.ts";
import { currentSchematicRelevancePrimitiveNativeSource } from "../../src/current-schematic-relevance-primitive-native.ts";
import { currentSchematicRelevanceRunGuardNativeSource } from "../../src/current-schematic-relevance-run-guard-native-fragment.ts";

export const SCHEMATIC_CLASSIC_CODEC_PEERS = Object.freeze([
  { name: "RunPrefix", source: currentSchematicRelevanceRunPrefixNativeSource, marker: "prefix", goldenId: 83, originalBytes: 14_976, dataSha256: "b70b1747319f8b69f884c2ef19def1929bd24c4e761620e66b603575267812fd" },
  { name: "NoEcho", source: currentSchematicRelevanceNoEchoNativeSource, marker: "noecho", goldenId: 83, originalBytes: 12_078, dataSha256: "2021bca3323e7f9f3cdcc945527fd4101ebb4bcf5df9e269cef2b0f3e828f6bf" },
  { name: "NormalRecord", source: currentSchematicRelevanceNormalRecordNativeSource, marker: "normalrecord", goldenId: 83, originalBytes: 10_385, dataSha256: "65274b9b9ca6beb37fac87b67b190e9d8eec3b39daeb6cc56b834890dbe7c73e" },
  { name: "NormalDisposal", source: currentSchematicRelevanceNormalDisposalNativeSource, marker: "normaldisposal", goldenId: 83, originalBytes: 8406, dataSha256: "431e76c81cae612424caf7087d0ea9cc13e615f90f06938f3fa44d880b1508ee" },
  { name: "NormalUpdate", source: currentSchematicRelevanceNormalUpdateNativeSource, marker: "normalupdate", goldenId: 83, originalBytes: 12_909, dataSha256: "f6ef50bb360da28db49d820e9873b51b3d28ad196d57c2bef8dc81c86a5f055a" },
  { name: "HistoryCommand", source: currentSchematicRelevanceHistoryCommandNativeSource, marker: "historycommand", goldenId: 83, originalBytes: 9807, dataSha256: "0eb331136d651eece3bcacffd5570d3bb37103b30dc148d9f04370a1d30fbae3" },
  { name: "MonitorBatch", source: currentSchematicRelevanceMonitorBatchNativeSource, marker: "monitorbatch", goldenId: 83, originalBytes: 9121, dataSha256: "812b3f9b477194e6458659877f53841e75760793a0af68ea6feee3f7a9989a34" },
  { name: "RecordAst", source: currentSchematicRelevanceRecordAstNativeSource, marker: "recordast", goldenId: 83, originalBytes: 6585, dataSha256: "90871e08c83fa4c7682285285e5e7c2f0758aecaacc50753726d2da1556a4a88" },
  { name: "Primitive", source: currentSchematicRelevancePrimitiveNativeSource, marker: "primitive", goldenId: 83, originalBytes: 7285, dataSha256: "603d03ad019eb1b3876b846ae05c1a0649cd49c8d0974de94bb77aaef788a274" },
  { name: "RunGuard", source: currentSchematicRelevanceRunGuardNativeSource, marker: "run_guard", goldenId: 89, originalBytes: 6728, dataSha256: "ed92529968575b4b92c9a80c93d3e6727988bd72bb25908efb4c2c30250d09f3" },
]);
