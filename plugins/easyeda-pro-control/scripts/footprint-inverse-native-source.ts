/** Closed inverse-purpose build. Unrelated runtime births remain unavailable,
 * while its exact request budgets and inherited scaffold remain unchanged. */
import { expandCurrentFootprintInverseNativeTypeAliases } from "../server/src/current-footprint-inverse-native-type-aliases.ts";
import { CURRENT_NATIVE_BASELINE, assertCurrentNativeBaseline } from "./native-baseline-source.ts";
import { generateWorkerStartupProtocol } from "./generate-worker-startup-protocol.ts";
import { currentPcbDiagnosticCSharpReviewSource, currentPcbDiagnosticCSharpRuntimeCompilerInput } from "../server/src/current-pcb-diagnostic-csharp-review-storage.ts";
import { CURRENT_PCB_DIAGNOSTIC_HELPER_SOURCE_MAX_BYTES as MAXIMUM } from "../server/src/current-pcb-diagnostic-helper-source-profile.ts";
import { createHash } from "node:crypto";

const purpose = "FootprintInverse209";
const hash = (value: string): string => createHash("sha256").update(value).digest("hex");
function one(source: string, before: string, after: string): string { if (source.split(before).length !== 2) { throw new Error("INVERSE_NATIVE_DRIVER_ANCHOR"); } return source.replace(before, after); }
function literal(value: object): string { return `{ ${Object.entries(value).map(([key, cell]: [string, unknown]) => `${key}: ${typeof cell === "number" ? String(cell).replaceAll(/\B(?=(?:\d{3})+(?!\d))/gu, "_") : JSON.stringify(cell)}`).join(", ")} }`; }
/** Reproduce the closed inverse helper, retaining every required CompileOnly
 * entry and the unchanged storage/compiler byte ceilings. Executes no owner. */
export function generateFootprintInverseNativeSource(seed: string): Readonly<{ helper: string; review: string; compiler: string }> {
  assertCurrentNativeBaseline(seed); let source = generateWorkerStartupProtocol(seed, "inverse");
  const firstLine = source.slice(0, source.indexOf("\n")), switches = [...firstLine.matchAll(/\[switch\]\$(\w+)/gu)].map(match => match[1]).filter((name): name is string => name !== undefined);
  if (switches.filter(name => name === purpose).length !== 1 || switches.filter(name => name === "CompileOnly").length !== 1) { throw new Error("INVERSE_NATIVE_DRIVER_ROSTER"); }
  const omitted = switches.filter(name => name !== purpose && name !== "CompileOnly");
  source = one(source, firstLine, `param([switch]$CompileOnly,[switch]$${purpose},[string]$InverseReadyChallenge)\nif (-not $${purpose}) {throw 'inverse-native-exact-purpose-required'}\n$CombinedReadyChallenge=$null\n${omitted.map(name => `$${name}=[System.Management.Automation.SwitchParameter]$false`).join("\n")}`);
  const ownerLine = source.split("\n").find(line => line.startsWith("$owner=if ")); if (ownerLine === undefined) { throw new Error("INVERSE_NATIVE_DRIVER_OWNER"); }
  source = one(source, ownerLine, "$owner=[EasyedaDiagnosticOwner]::CreateFootprintInverse209()");
  const begin = source.indexOf("  if ($CompileOnly) {"), end = source.indexOf("  $launched=$false", begin); if (begin === -1 || end <= begin) { throw new Error("INVERSE_NATIVE_DRIVER_COMPILE"); }
  const smoke = source.slice(begin, end).split("\n").filter(line => /^ {4}\[EasyedaDiagnosticOwner\]::VerifyFootprintInverse\w*\(\)$/u.test(line));
  if (smoke.length !== 52 || !smoke.includes("    [EasyedaDiagnosticOwner]::VerifyFootprintInverseNativeGetTaskManagerSmoke()") || !smoke.includes("    [EasyedaDiagnosticOwner]::VerifyFootprintInverseNativeGetTaskCallbackSmoke()") || !smoke.includes("    [EasyedaDiagnosticOwner]::VerifyFootprintInverseNativeGetTaskIntrinsicsSmoke()") || !smoke.includes("    [EasyedaDiagnosticOwner]::VerifyFootprintInverseNativeGetTaskDependenciesSmoke()") || !smoke.includes("    [EasyedaDiagnosticOwner]::VerifyFootprintInverseNativeGetTaskSenderSmoke()") || !smoke.includes("    [EasyedaDiagnosticOwner]::VerifyFootprintInverseNativeGetLookupSmoke()") || !smoke.includes("    [EasyedaDiagnosticOwner]::VerifyFootprintInverseNativeGetWorkerSmoke()") || !smoke.includes("    [EasyedaDiagnosticOwner]::VerifyFootprintInverseNativeDeleteSenderSmoke()") || !smoke.includes("    [EasyedaDiagnosticOwner]::VerifyFootprintInverseNativeDeleteRegistrationSmoke()") || !smoke.includes("    [EasyedaDiagnosticOwner]::VerifyFootprintInverseNativeDeleteBootstrapSmoke()") || !smoke.includes("    [EasyedaDiagnosticOwner]::VerifyFootprintInverseDeleteSendSmoke()") || !smoke.includes("    [EasyedaDiagnosticOwner]::VerifyFootprintInverseDeleteCallbackSmoke()") || !smoke.includes("    [EasyedaDiagnosticOwner]::VerifyFootprintInverseDeleteManagerSmoke()") || !smoke.includes("    [EasyedaDiagnosticOwner]::VerifyFootprintInverseDeleteCollateralSmoke()") || !smoke.includes("    [EasyedaDiagnosticOwner]::VerifyFootprintInverseDeletePrefixSmoke()") || !smoke.includes("    [EasyedaDiagnosticOwner]::VerifyFootprintInverseGetResultSmoke()") || !smoke.includes("    [EasyedaDiagnosticOwner]::VerifyFootprintInverseReferenceEntrySmoke()") || !smoke.includes("    [EasyedaDiagnosticOwner]::VerifyFootprintInverseReferenceWorkerSmoke()") || !smoke.includes("    [EasyedaDiagnosticOwner]::VerifyFootprintInverseReferenceUiSmoke()") || !smoke.includes("    [EasyedaDiagnosticOwner]::VerifyFootprintInverseReferenceDispatchSmoke()") || !smoke.includes("    [EasyedaDiagnosticOwner]::VerifyFootprintInverseReferenceCallbackSmoke()") || !smoke.includes("    [EasyedaDiagnosticOwner]::VerifyFootprintInverseReferenceSendSmoke()") || !smoke.includes("    [EasyedaDiagnosticOwner]::VerifyFootprintInverseReferenceProgressSmoke()") || !smoke.includes("    [EasyedaDiagnosticOwner]::VerifyFootprintInverseReferenceResultSmoke()") || new Set(smoke).size !== smoke.length) { throw new Error("INVERSE_NATIVE_DRIVER_SMOKE_ROSTER"); }
  source = `${source.slice(0, begin)}  if ($CompileOnly) {\n${smoke.join("\n")}\n    if (-not $owner.Terminated()) {throw 'inverse-native-compile-job-not-empty'}\n    $owner.ReleaseUnlaunched()\n    @{schema='easyeda-pro-control.footprint-inverse-compile.v1';compiled=$true;emptyJob=$true;pipesChecked=$true;processLaunched=$false} | ConvertTo-Json -Compress\n    exit\n  }\n${source.slice(end)}`;
  const compiler = currentPcbDiagnosticCSharpRuntimeCompilerInput(source), review = expandCurrentFootprintInverseNativeTypeAliases(currentPcbDiagnosticCSharpReviewSource(source));
  if (Buffer.byteLength(source) > MAXIMUM || Buffer.byteLength(compiler) > MAXIMUM) { throw new Error("INVERSE_NATIVE_FIXED_BOUND"); }
  return Object.freeze({ helper: source, review, compiler });
}
export function footprintInverseNativeIdentity(data: ReturnType<typeof generateFootprintInverseNativeSource>): string {
  const fields = { schema: "private.current-footprint-inverse-native-identity.v1", seed: CURRENT_NATIVE_BASELINE,
    helper: { relativePath: "scripts/footprint-inverse-native.ps1", bytes: Buffer.byteLength(data.helper), sha256: hash(data.helper) },
    review: { relativePath: "scripts/footprint-inverse-native.cs", bytes: Buffer.byteLength(data.review), sha256: hash(data.review) },
    compiler: { bytes: Buffer.byteLength(data.compiler), sha256: hash(data.compiler) } };
  return `/** Generated exact inverse-purpose helper. Rebuild through inverse:native:update. */\nexport const CURRENT_FOOTPRINT_INVERSE_NATIVE_IDENTITY = Object.freeze({\n${Object.entries(fields).map(([key, value]) => `  ${key}: ${typeof value === "string" ? JSON.stringify(value) : `Object.freeze(${literal(value)} as const)`}`).join(",\n")}\n} as const);\n`;
}
