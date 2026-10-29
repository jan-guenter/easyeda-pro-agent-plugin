/* oxlint-disable import/max-dependencies -- This deterministic generator preserves the exact bytes of independent fixed native programs. */
import { CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_FUNCTION, CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_V2_FUNCTION } from "../server/src/current-pcb-diagnostic-model-program.ts";
import { CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION, CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_V2_FUNCTION } from "../server/src/current-pcb-diagnostic-pending-program.ts";
import { CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION } from "../server/src/current-pcb-diagnostic-root-inventory.ts";
import { CURRENT_PCB_STRING_PRODUCER_MARKERS_V2_FUNCTION } from "../server/src/current-pcb-string-producer-markers.ts";
import { CURRENT_PCB_COMMON_PREFERENCE_FUNCTION, CURRENT_PCB_COMMON_PRESENTATION_FUNCTION, CURRENT_PCB_COMMON_RULES_FUNCTION } from "../server/src/current-pcb-common-state.ts";
import { CURRENT_PCB_STRING_ACTOR_CLOCK_FUNCTIONS } from "../server/src/current-pcb-string-actor-clock.ts";
import { CURRENT_PCB_STRING_MOVE_SELECTOR, CURRENT_PCB_STRING_MOVE_STATE } from "../server/src/current-pcb-string-producer-program.ts";
import { CURRENT_PCB_STRING_STARTUP_STATE_FUNCTION } from "../server/src/current-pcb-string-startup-state.ts";
import { CURRENT_PCB_STRING_WORKER_GATE_PROGRAM } from "../server/src/current-pcb-string-worker-gate-program.ts";
import { generatePackedNativeProgram } from "./native-program-packing.ts";
import { CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION } from "../server/src/current-pcb-diagnostic-raw-strings.ts";
import { CURRENT_PCB_TEARDROP_CALLBACK_SELECTOR, CURRENT_PCB_TEARDROP_OWNER_ASSOCIATION } from "../server/src/current-pcb-teardrop-owner-program.ts";
import { CURRENT_PCB_COMMON_PACKET_ADVANCE, CURRENT_PCB_COMMON_PACKET_RESULT, CURRENT_PCB_COMMON_PACKET_SEEDS } from "../server/src/current-pcb-common-packet-program.ts";
import { CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION } from "../server/src/current-pcb-diagnostic-opening.ts";
import { CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION } from "../server/src/current-pcb-diagnostic-pcb-opening.ts";
import { CURRENT_PCB_STRING_EMPTY_PRODUCERS_FUNCTION, CURRENT_PCB_STRING_EMPTY_PRODUCERS_V2_FUNCTION } from "../server/src/current-pcb-string-empty-producers.ts";
import { CURRENT_PCB_COMMON_METADATA_FUNCTION } from "../server/src/current-pcb-common-metadata.ts";
import { CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS } from "../server/src/current-pcb-constructor-scope.ts";
import { CURRENT_PCB_STRING_RENDERER_ASSOCIATION_FUNCTION } from "../server/src/current-pcb-string-association.ts";
import { CURRENT_PCB_STRING_EMPTY_ASSETS_FUNCTION } from "../server/src/current-pcb-string-empty-assets.ts";

for (const [marker, name, source] of [
  ["STRING WORKER GATE", "StringWorkerGateFunction", CURRENT_PCB_STRING_WORKER_GATE_PROGRAM],
  ["MOVE PRODUCER TWO", "MoveProducerTwoFunction", CURRENT_PCB_STRING_MOVE_SELECTOR],
  ["MOVE PRODUCER THREE", "MoveProducerThreeFunction", CURRENT_PCB_STRING_MOVE_STATE],
  ["MOVE PRODUCER FOUR", "MoveProducerFourFunction", CURRENT_PCB_STRING_STARTUP_STATE_FUNCTION],
  ["ACTOR CLOCK UI", "ActorClockUiFunction", CURRENT_PCB_STRING_ACTOR_CLOCK_FUNCTIONS.ui],
  ["ACTOR CLOCK WORKER", "ActorClockWorkerFunction", CURRENT_PCB_STRING_ACTOR_CLOCK_FUNCTIONS.worker],
  ["ACTOR CLOCK PCB", "ActorClockPcbFunction", CURRENT_PCB_STRING_ACTOR_CLOCK_FUNCTIONS.pcb],
  ["MODEL RAW STRINGS", "ModelRawStringsFunction", CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION],
  ["COMMON CONSTRUCTORS", "CommonConstructorsFunction", CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS.common],
  ["TEARDROP CALLBACKS", "TeardropCallbacksFunction", CURRENT_PCB_TEARDROP_CALLBACK_SELECTOR],
  ["TEARDROP OWNER", "TeardropOwnerFunction", CURRENT_PCB_TEARDROP_OWNER_ASSOCIATION],
  ["DIAGNOSTIC OPENING", "OpeningFunction", CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION],
  ["DIAGNOSTIC PCB OPENING", "PcbOpeningFunction", CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION],
  ["MODEL STATE", "ModelStateFunction", CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_FUNCTION],
  ["MODEL STATE V TWO", "ModelStateV2Function", CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_V2_FUNCTION],
  ["MODEL PENDING", "ModelPendingFunction", CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION],
  ["MODEL PENDING V TWO", "ModelPendingV2Function", CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_V2_FUNCTION],
  ["MODEL ROOT INVENTORY", "ModelRootInventoryFunction", CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION],
  ["STRING PRODUCER MARKERS V TWO", "StringProducerMarkersV2Function", CURRENT_PCB_STRING_PRODUCER_MARKERS_V2_FUNCTION],
  ["COMMON PRESENTATION", "CommonPresentationFunction", CURRENT_PCB_COMMON_PRESENTATION_FUNCTION],
  ["COMMON PREFERENCE", "CommonPreferenceFunction", CURRENT_PCB_COMMON_PREFERENCE_FUNCTION],
  ["COMMON RULES", "CommonRulesFunction", CURRENT_PCB_COMMON_RULES_FUNCTION],
  ["COMMON PREFERENCE SEED", "CommonPreferenceSeedFunction", CURRENT_PCB_COMMON_PACKET_SEEDS.preference],
  ["COMMON PRESENTATION SEED", "CommonPresentationSeedFunction", CURRENT_PCB_COMMON_PACKET_SEEDS.presentation],
  ["COMMON RULES SEED", "CommonRulesSeedFunction", CURRENT_PCB_COMMON_PACKET_SEEDS.rules],
  ["COMMON METADATA", "CommonMetadataFunction", CURRENT_PCB_COMMON_METADATA_FUNCTION],
  ["MODEL DIAGNOSTIC CONSTRUCTORS", "ModelDiagnosticConstructorsFunction", CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS.diagnostic],
  ["MODEL PRECREATE CONSTRUCTORS", "ModelPrecreateConstructorsFunction", CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS.precreate],
  ["STRING RENDERER ASSOCIATION", "StringRendererAssociationFunction", CURRENT_PCB_STRING_RENDERER_ASSOCIATION_FUNCTION],
  ["COMMON ASSETS", "CommonAssetsFunction", CURRENT_PCB_STRING_EMPTY_ASSETS_FUNCTION],
  ["COMMON PACKET ADVANCE", "CommonPacketAdvanceFunction", CURRENT_PCB_COMMON_PACKET_ADVANCE],
  ["COMMON PACKET RESULT", "CommonPacketResultFunction", CURRENT_PCB_COMMON_PACKET_RESULT],
  ["STRING EMPTY PRODUCERS", "StringEmptyProducersFunction", CURRENT_PCB_STRING_EMPTY_PRODUCERS_FUNCTION],
  ["STRING EMPTY PRODUCERS V TWO", "StringEmptyProducersV2Function", CURRENT_PCB_STRING_EMPTY_PRODUCERS_V2_FUNCTION],
] as const) {
  // oxlint-disable-next-line node/no-top-level-await -- ESM-only deterministic generation command; each bounded program retains its exact existing bytes.
  await generatePackedNativeProgram(marker, name, source);
}
