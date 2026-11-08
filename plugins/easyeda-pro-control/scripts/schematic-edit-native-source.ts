/** Closed-purpose build only. Runtime uses the complete exact emitted helper;
 * no caller can select fragments, supply a source program or choose a path. */
import { generateWorkerStartupProtocol } from "./generate-worker-startup-protocol.ts";
import { CURRENT_NATIVE_BASELINE, assertCurrentNativeBaseline } from "./native-baseline-source.ts";
import { currentPcbDiagnosticCSharpReviewSource, currentPcbDiagnosticCSharpRuntimeCompilerInput } from "../server/src/current-pcb-diagnostic-csharp-review-storage.ts";
import { CURRENT_PCB_DIAGNOSTIC_HELPER_SOURCE_MAX_BYTES as MAXIMUM } from "../server/src/current-pcb-diagnostic-helper-source-profile.ts";
import { createHash } from "node:crypto";

const hash = (source: string): string => createHash("sha256").update(source).digest("hex");
const own = "SchematicRelevanceDisplayWrite209", wire = "SchematicWireEdit209";
function replace(source: string, before: string, after: string): string {
  if (source.split(before).length !== 2) { throw new Error("SCHEMATIC_NATIVE_DRIVER_ANCHOR"); } return source.replace(before, after);
}
function literal(value: object): string { return `{ ${Object.entries(value).map(([key, cell]: [string, unknown]) => `${key}: ${typeof cell === "number" ? String(cell).replaceAll(/\B(?=(?:\d{3})+(?!\d))/gu, "_") : JSON.stringify(cell)}`).join(", ")} }`; }

/** The broad source compiler is build-only. Its emitted script is narrowed to
 * exactly these two distinct births before it becomes a runtime artifact. */
export function generateSchematicEditNativeSource(seed: string): Readonly<{ helper: string; review: string; compiler: string }> {
  assertCurrentNativeBaseline(seed); let source = generateWorkerStartupProtocol(seed, "schematic");
  const firstLine = source.slice(0, source.indexOf("\n"));
  const switches = [...firstLine.matchAll(/\[switch\]\$(\w+)/gu)].map(match => match[1]).filter((name): name is string => name !== undefined);
  if (switches.filter(name => name === own).length !== 1 || switches.filter(name => name === wire).length !== 1 || switches.filter(name => name === "CompileOnly").length !== 1) { throw new Error("SCHEMATIC_NATIVE_DRIVER_ROSTER"); }
  const omitted = switches.filter(name => name !== own && name !== wire && name !== "CompileOnly");
  const header = `param([switch]$CompileOnly,[switch]$${own},[switch]$${wire})\n$purposeCount=([int][bool]$${own})+([int][bool]$${wire})\nif ($purposeCount -ne 1) {throw 'schematic-native-exact-purpose-required'}\n$CombinedReadyChallenge=$null\n${omitted.map(name => `$${name}=[System.Management.Automation.SwitchParameter]$false`).join("\n")}`;
  source = replace(source, firstLine, header);
  const ownerLine = source.split("\n").find(line => line.startsWith("$owner=if "));
  if (ownerLine === undefined) { throw new Error("SCHEMATIC_NATIVE_DRIVER_OWNER"); }
  source = replace(source, ownerLine, `$owner=if ($${own}) {[EasyedaDiagnosticOwner]::CreateSchematicRelevanceDisplayWrite209()} else {[EasyedaDiagnosticOwner]::CreateSchematicWireEdit209()}`);
  const begin = source.indexOf("  if ($CompileOnly) {"), end = source.indexOf("  $launched=$false", begin);
  if (begin === -1 || end <= begin) { throw new Error("SCHEMATIC_NATIVE_DRIVER_COMPILE"); }
  source = `${source.slice(0, begin)}  if ($CompileOnly) {
    [EasyedaDiagnosticOwner]::VerifySchematicRelevanceDisplaySmoke()
    [EasyedaDiagnosticOwner]::VerifySchematicRelevanceDisplayRegistrationSmoke()
    [EasyedaDiagnosticOwner]::VerifySchematicWireEditSmoke()
    [EasyedaDiagnosticOwner]::VerifySchematicProtocolSmokes()
    [EasyedaDiagnosticOwner]::VerifySchematicRelevancePublicationSmoke()
    [EasyedaDiagnosticOwner]::VerifySchematicRelevanceModifyWorkerSmoke()
    [EasyedaDiagnosticOwner]::VerifyRelevanceDrainSmoke()
    if (-not $owner.Terminated()) {throw 'schematic-native-compile-job-not-empty'}
    $owner.ReleaseUnlaunched()
    @{schema='easyeda-pro-control.schematic-edit-compile.v1';compiled=$true;emptyJob=$true;pipesChecked=$true;processLaunched=$false} | ConvertTo-Json -Compress
    exit
  }
${source.slice(end)}`;
  const review = currentPcbDiagnosticCSharpReviewSource(source); const compiler = currentPcbDiagnosticCSharpRuntimeCompilerInput(source);
  if (Buffer.byteLength(source) > MAXIMUM || Buffer.byteLength(compiler) > MAXIMUM) { throw new Error("SCHEMATIC_NATIVE_FIXED_BOUND"); }
  return Object.freeze({ helper: source, review, compiler });
}
export function schematicEditNativeIdentity(data: ReturnType<typeof generateSchematicEditNativeSource>): string {
  const fields = { schema: "private.current-schematic-edit-native-identity.v1", seed: CURRENT_NATIVE_BASELINE,
    helper: { relativePath: "scripts/schematic-edit-native.ps1", bytes: Buffer.byteLength(data.helper), sha256: hash(data.helper) },
    review: { relativePath: "scripts/schematic-edit-native.cs", bytes: Buffer.byteLength(data.review), sha256: hash(data.review) },
    compiler: { bytes: Buffer.byteLength(data.compiler), sha256: hash(data.compiler) } };

  return `/** Generated exact fixed-purpose helper. Rebuild through schematic:native:update. */\nexport const CURRENT_SCHEMATIC_EDIT_NATIVE_IDENTITY = Object.freeze({\n${Object.entries(fields).map(([key, value]) => `  ${key}: ${typeof value === "string" ? JSON.stringify(value) : `Object.freeze(${literal(value)} as const)`}`).join(",\n")}\n} as const);\n`;
}
