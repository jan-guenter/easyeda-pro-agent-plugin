/* oxlint-disable import/max-dependencies -- This deterministic generator preserves the exact bytes of independent fixed native programs. */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_FUNCTION, CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_V2_FUNCTION } from "../server/src/current-pcb-diagnostic-model-program.ts";
import { CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION, CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_V2_FUNCTION } from "../server/src/current-pcb-diagnostic-pending-program.ts";
import { CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION } from "../server/src/current-pcb-diagnostic-root-inventory.ts";
import { CURRENT_PCB_STRING_PRODUCER_MARKERS_V2_FUNCTION } from "../server/src/current-pcb-string-producer-markers.ts";
import { CURRENT_PCB_COMMON_PREFERENCE_FUNCTION, CURRENT_PCB_COMMON_PRESENTATION_FUNCTION, CURRENT_PCB_COMMON_RULES_FUNCTION } from "../server/src/current-pcb-common-state.ts";
import { CURRENT_PCB_STRING_ACTOR_CLOCK_FUNCTIONS } from "../server/src/current-pcb-string-actor-clock.ts";
import { CURRENT_PCB_STRING_COOPERATION_SELECTOR, CURRENT_PCB_STRING_COOPERATION_STATE, CURRENT_PCB_STRING_DEBOUNCE_SELECTOR, CURRENT_PCB_STRING_DEBOUNCE_STATE, CURRENT_PCB_STRING_MOVE_SELECTOR,
  CURRENT_PCB_STRING_MOVE_STATE, CURRENT_PCB_STRING_STRUCTURE_SELECTOR, CURRENT_PCB_STRING_STRUCTURE_STATE, CURRENT_PCB_STRING_UPLOAD_SELECTOR, CURRENT_PCB_STRING_UPLOAD_STATE,
  CURRENT_PCB_STRING_UPLOAD_STRUCTURE_SELECTOR, CURRENT_PCB_STRING_UPLOAD_STRUCTURE_STATE } from "../server/src/current-pcb-string-producer-program.ts";
import { CURRENT_PCB_STRING_BUFFERED_CALLBACK_ENVIRONMENT, CURRENT_PCB_STRING_BUFFER_CALLBACK_SELECTOR,
  CURRENT_PCB_STRING_COOPERATION_CALLBACK_SELECTOR, CURRENT_PCB_STRING_DRAIN_CALLBACK_SELECTOR,
  CURRENT_PCB_STRING_STRUCTURE_CALLBACK_SELECTOR, CURRENT_PCB_STRING_UPLOAD_CALLBACK_SELECTOR,
  CURRENT_PCB_STRING_UPLOAD_STRUCTURE_CALLBACK_SELECTOR } from "../server/src/current-pcb-string-producer-callback-program.ts";
import { CURRENT_PCB_STRING_STARTUP_STATE_FUNCTION } from "../server/src/current-pcb-string-startup-state.ts";
import { CURRENT_PCB_STRING_WORKER_GATE_PROGRAM, CURRENT_PCB_STRING_WORKER_GATE_SELECTOR, CURRENT_PCB_STRING_WORKER_PROJECT_SELECTOR } from "../server/src/current-pcb-string-worker-gate-program.ts";
import { packedNativeProgram } from "./native-program-packing.ts";
import { CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION } from "../server/src/current-pcb-diagnostic-raw-strings.ts";
import { CURRENT_PCB_TEARDROP_CALLBACK_SELECTOR, CURRENT_PCB_TEARDROP_OWNER_ASSOCIATION } from "../server/src/current-pcb-teardrop-owner-program.ts";
import { CURRENT_PCB_COMMON_PACKET_ADVANCE, CURRENT_PCB_COMMON_PACKET_RESULT, CURRENT_PCB_COMMON_PACKET_SEEDS } from "../server/src/current-pcb-common-packet-program.ts";
import { CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION } from "../server/src/current-pcb-diagnostic-opening.ts";
import { CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION } from "../server/src/current-pcb-diagnostic-pcb-opening.ts";
import { CURRENT_PCB_STRING_EMPTY_PRODUCERS_FUNCTION, CURRENT_PCB_STRING_EMPTY_PRODUCERS_V2_FUNCTION } from "../server/src/current-pcb-string-empty-producers.ts";
import { CURRENT_PCB_COMMON_METADATA_FUNCTION } from "../server/src/current-pcb-common-metadata.ts";
import { CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS } from "../server/src/current-pcb-constructor-scope.ts";
import { CURRENT_PCB_STRING_RENDERER_ASSOCIATION_FUNCTION, CURRENT_PCB_STRING_WORKER_ASSOCIATION_EXPRESSION } from "../server/src/current-pcb-string-association.ts";
import { CURRENT_PCB_STRING_EMPTY_ASSETS_FUNCTION } from "../server/src/current-pcb-string-empty-assets.ts";

const programs = [
  ["STRING WORKER PROJECT SELECTOR", "StringWorkerProjectSelectorFunction", CURRENT_PCB_STRING_WORKER_PROJECT_SELECTOR],
  ["STRING WORKER UPLOAD STRUCTURE CALLBACK SELECTOR", "StringWorkerUploadStructureCallbackSelectorFunction", CURRENT_PCB_STRING_UPLOAD_STRUCTURE_CALLBACK_SELECTOR],
  ["STRING WORKER STRUCTURE CALLBACK SELECTOR", "StringWorkerStructureCallbackSelectorFunction", CURRENT_PCB_STRING_STRUCTURE_CALLBACK_SELECTOR],
  ["STRING WORKER COOPERATION CALLBACK SELECTOR", "StringWorkerCooperationCallbackSelectorFunction", CURRENT_PCB_STRING_COOPERATION_CALLBACK_SELECTOR],
  ["STRING WORKER UPLOAD CALLBACK SELECTOR", "StringWorkerUploadCallbackSelectorFunction", CURRENT_PCB_STRING_UPLOAD_CALLBACK_SELECTOR],
  ["STRING WORKER BUFFER CALLBACK SELECTOR", "StringWorkerBufferCallbackSelectorFunction", CURRENT_PCB_STRING_BUFFER_CALLBACK_SELECTOR],
  ["STRING WORKER DRAIN CALLBACK SELECTOR", "StringWorkerDrainCallbackSelectorFunction", CURRENT_PCB_STRING_DRAIN_CALLBACK_SELECTOR],
  ["STRING WORKER ASSOCIATION", "StringWorkerAssociationExpressionFunction", CURRENT_PCB_STRING_WORKER_ASSOCIATION_EXPRESSION],
  ["STRING WORKER STRUCTURE SELECTOR", "StringWorkerStructureSelectorFunction", CURRENT_PCB_STRING_STRUCTURE_SELECTOR],
  ["STRING WORKER GATE SELECTOR", "StringWorkerGateSelectorFunction", CURRENT_PCB_STRING_WORKER_GATE_SELECTOR],
  ["STRING WORKER GATE", "StringWorkerGateFunction", CURRENT_PCB_STRING_WORKER_GATE_PROGRAM],
  ["STRING WORKER UPLOAD STRUCTURE SELECTOR", "StringWorkerUploadStructureSelectorFunction", CURRENT_PCB_STRING_UPLOAD_STRUCTURE_SELECTOR],
  ["STRING WORKER COOPERATION SELECTOR", "StringWorkerCooperationSelectorFunction", CURRENT_PCB_STRING_COOPERATION_SELECTOR],
  ["STRING WORKER UPLOAD SELECTOR", "StringWorkerUploadSelectorFunction", CURRENT_PCB_STRING_UPLOAD_SELECTOR],
  ["STRING WORKER DEBOUNCE SELECTOR", "StringWorkerDebounceSelectorFunction", CURRENT_PCB_STRING_DEBOUNCE_SELECTOR],
  ["STRING WORKER UPLOAD STRUCTURE", "StringWorkerUploadStructureFunction", CURRENT_PCB_STRING_UPLOAD_STRUCTURE_STATE],
  ["STRING WORKER STRUCTURE", "StringWorkerStructureFunction", CURRENT_PCB_STRING_STRUCTURE_STATE],
  ["STRING WORKER DEBOUNCE", "StringWorkerDebounceFunction", CURRENT_PCB_STRING_DEBOUNCE_STATE],
  ["STRING WORKER COOPERATION", "StringWorkerCooperationFunction", CURRENT_PCB_STRING_COOPERATION_STATE],
  ["STRING WORKER UPLOAD", "StringWorkerUploadFunction", CURRENT_PCB_STRING_UPLOAD_STATE],
  ["STRING WORKER BUFFERED ENVIRONMENT", "StringWorkerBufferedEnvironmentFunction", CURRENT_PCB_STRING_BUFFERED_CALLBACK_ENVIRONMENT],
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
] as const;

type Program = readonly [marker: string, name: string, source: string];
interface ProgramGroup { readonly entries: Program[]; bytes: number; }
const maximumProgramBytes = 65_536;

/** Group only these fixed worker programs. Every member and the complete table
 * keep exact UTF-8 bytes, bounded decoding and separate hashes; aliases retain
 * their original names and initialization follows the table declarations. */
function packedStringWorkerPrograms(): ReadonlyMap<string, string> {
  const selected = programs.filter(([, name]) => name.startsWith("StringWorker") && name !== "StringWorkerAssociationExpressionFunction");
  if (selected.length !== 20 || new Set(selected.map(([, name]) => name)).size !== 20) { throw new Error("Fixed worker program roster differs"); }
  const groups: ProgramGroup[] = [];
  for (const program of selected) {
    const source = program[2];
    const bytes = Buffer.byteLength(source);
    if (bytes === 0 || bytes > maximumProgramBytes || source.includes("\0") || new TextDecoder("utf-8", { fatal: true }).decode(Buffer.from(source)) !== source) {
      throw new Error("Fixed worker program violates its table contract");
    }
    let group = groups.at(-1);
    if (group === undefined || group.bytes + 1 + bytes > maximumProgramBytes) { group = { entries: [], bytes: 0 }; groups.push(group); }
    group.bytes += bytes + (group.entries.length === 0 ? 0 : 1); group.entries.push(program);
  }
  const declarations: string[] = [], output = new Map<string, string>();
  for (const [index, group] of groups.entries()) {
    const bytes = Buffer.from(group.entries.map(program => program[2]).join("\0")), table = `StringWorkerProgramTable${String(index)}`;
    // oxlint-disable-next-line node/no-sync -- Deterministic compression of one fixed table under the unchanged64KiB native bound.
    const compressed = gzipSync(bytes, { level: 9 });
    if (compressed.length > maximumProgramBytes) { throw new Error("Fixed worker program table exceeds its packed bound"); }
    const hash = createHash("sha256").update(bytes).digest("hex"), packedHash = createHash("sha256").update(compressed).digest("hex");
    declarations.push(`  static readonly string[] ${table}=StringWorkerPackedProgramTable("${compressed.toString("base64")}",${String(bytes.length)},"${hash}","${packedHash}",${String(group.entries.length)});`);
    for (const [position, [, name, source]] of group.entries.entries()) {
      const sourceHash = createHash("sha256").update(source).digest("hex");
      output.set(name, `  const string ${name}Sha256="${sourceHash}";\n  static readonly string ${name}=StringWorkerPackedProgram(${table},${String(position)},${String(Buffer.byteLength(source))},${name}Sha256);`);
    }
  }
  const first = selected[0];
  if (first === undefined) { throw new Error("Missing first fixed worker program"); }
  output.set(first[1], `${stringWorkerTableDecoder()}\n${declarations.join("\n")}\n${output.get(first[1]) ?? ""}`);
  return output;
}

/** Emit private storage readers only. Complete table and member checks execute
 * during fixed field initialization; no caller supplies programs or table indexes. */
function stringWorkerTableDecoder(): string {
  return `  static string[] StringWorkerPackedProgramTable(string encoded,int length,string hash,string packedHash,int count) {
    if(count<1||count>20)throw Error("packed-program-table-count");
    string[] rows=UnpackFixedProgram(encoded,length,hash,packedHash).Split('\\0');
    if(rows.Length!=count)throw Error("packed-program-table-rows");return rows;
  }
  static string StringWorkerPackedProgram(string[] rows,int index,int length,string hash) {
    if(rows==null||index<0||index>=rows.Length||length<1||length>65536)throw Error("packed-program-table-member");
    string value=rows[index];byte[] bytes=new UTF8Encoding(false,true).GetBytes(value);
    if(bytes.Length!=length)throw Error("packed-program-table-length");
    using(SHA256 sha=SHA256.Create())if(BitConverter.ToString(sha.ComputeHash(bytes)).Replace("-","").ToLowerInvariant()!=hash)throw Error("packed-program-table-hash");return value;
  }`;
}

/** Replace uniquely marked fixed blocks in one snapshot. Check mode is read-only;
 * unrelated helper regions and every ungrouped program keep their original bytes. */
async function main(): Promise<void> {
  const action = process.argv[2];
  if (process.argv.length !== 3 || action !== "--write" && action !== "--check") { throw new Error("Expected --write or --check"); }
  const path = new URL("pcb-diagnostic-owner.ps1", import.meta.url);
  const grouped = packedStringWorkerPrograms();
  const bytes = await readFile(path);
  // Preserve a valid BOM and refuse malformed input before replacing any block.
  const source = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
  if (!Buffer.from(source).equals(bytes)) { throw new Error("Native helper UTF-8 bytes did not round-trip"); }
  let next = source;
  for (const [marker, name, program] of programs) {
    if (!/^[A-Z][A-Z ]{1,63}$/u.test(marker) || !/^[A-Z][A-Za-z0-9]{1,63}Function$/u.test(name)) { throw new Error("Invalid fixed native program marker or name"); }
    const begin = `// BEGIN GENERATED PCB209 ${marker} PROGRAM`, end = `// END GENERATED PCB209 ${marker} PROGRAM`;
    const start = next.indexOf(begin), stop = next.indexOf(end);
    if (start === -1 || stop < start || next.includes(begin, start + begin.length) || next.includes(end, stop + end.length)) {
      throw new Error("Native program markers must occur once");
    }
    const generated = `${begin}\n${grouped.get(name) ?? packedNativeProgram(name, program)}\n  ${end}`;
    next = next.slice(0, start) + generated + next.slice(stop + end.length);
  }
  if (action === "--write") { await writeFile(path, next); }
  else if (next !== source) { throw new Error("Generated packed native programs differ"); }
}

// oxlint-disable-next-line node/no-top-level-await -- ESM-only deterministic generator with one bounded helper-file replacement.
await main();
