/** Fresh installed-plugin metadata proof. Preview is the default; this script
 * never starts a model turn or admits bridge/native/project work. */
import { createHash, randomUUID } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { dirname, join, posix, resolve, win32 } from "node:path";
import { setTimeout as settlementTick } from "node:timers/promises";
import { OwnedProofProcess, boundedProofWait, createProofEvidence, proofNeed, proofRecord } from "./fresh-cli-metadata-proof-resources.ts";
import type { ProofFacadeClosure, ProofJournalName, ProofRecord } from "./fresh-cli-metadata-proof-resources.ts";
import { createLinuxBrokerProofEvidence } from "./fresh-cli-metadata-proof-broker.ts";
import { linuxMetadataWatcherProgram, windowsMetadataWatcherProgram } from "./fresh-cli-metadata-proof-watchers.ts";

interface ExpectedFile { readonly relativePath: string; readonly bytes: number; readonly sha256: string; readonly mode: number }
export interface FreshCliMetadataPlan {
  readonly schema: "easyeda-pro-control.fresh-cli-metadata-plan.v1";
  readonly host: "linux" | "windows";
  readonly mergedCommit: string;
  readonly version: string;
  readonly cliExecutable: string;
  readonly expectedHostNodeVersion: string;
  readonly linuxPluginRoot: string;
  readonly linuxNodeExecutable: string;
  readonly linuxNodeSha256: string;
  readonly hostPluginRoot: string;
  readonly evidenceDirectory: string;
  readonly workspace: string;
  readonly overrides: readonly string[];
  readonly distribution: string;
  readonly files: readonly ExpectedFile[];
  readonly windowsNodeExecutable?: string;
  readonly windowsNodeSha256?: string;
}
export interface FreshCliMetadataPlanV2 extends Omit<FreshCliMetadataPlan, "schema" | "evidenceDirectory" | "host"> {
  readonly schema: "easyeda-pro-control.fresh-cli-metadata-plan.v2";
  readonly host: "windows";
  readonly evidenceBackend: "wsl-linux-fsync.v1";
  readonly linuxEvidenceDirectory: string;
}
type CurrentPlan = FreshCliMetadataPlan | FreshCliMetadataPlanV2;
function evidencePath(plan: CurrentPlan): string { return plan.schema === "easyeda-pro-control.fresh-cli-metadata-plan.v2" ? plan.linuxEvidenceDirectory : plan.evidenceDirectory; }
const FILES = ["server/dist/server.mjs", "server/dist/upstream-supervisor.mjs", "server/bin/easyeda-fd-sanitizer", "server/dist/control-session-manager.mjs", "reviewed-compatibility.json", ".codex-plugin/plugin.json"] as const;
const ACTIONS = ["loaded-facade", "inspect", "retire", "close-retired"] as const;
type MetadataAction = typeof ACTIONS[number];
const REPLY_JOURNALS: Readonly<Record<MetadataAction, ProofJournalName>> = { "loaded-facade": "loaded-facade-full-reply.json", inspect: "inspect-full-reply.json", retire: "retire-full-reply.json", "close-retired": "close-retired-full-reply.json" };
const LOCAL_REFUSAL_CODES = Object.freeze([
  "ACTUAL_METADATA_TOOLS_REQUIRED",
  "CLI_CLOSE_PENDING",
  "CLI_VERSION_PENDING",
  "CLOSE_SCHEDULED_ONLY",
  "EXACT_INSTALLED_PLUGIN_REQUIRED",
  "FULL_MCP_STRUCTURED_REPLY_REQUIRED",
  "FULL_REPLY_EVIDENCE_PENDING",
  "INITIALIZE_PENDING",
  "LINUX_WATCHER_CLOSE_REQUIRED",
  "LOADED_FACADE",
  "LOADED_FACADE_PID_REQUIRED",
  "MCP_CALL_PENDING_NO_RETRY",
  "MCP_STATUS_CURSOR_REPEATED",
  "MCP_STATUS_PAGE_BOUND",
  "MCP_STATUS_PENDING",
  "METADATA_ACTION_INTENT_NOT_DURABLE",
  "NORMAL_METADATA_FLOW_STOPPED",
  "ORIGINAL_CLI_CLOSE_REQUIRED",
  "ORIGINAL_EVIDENCE_SYNC_PENDING",
  "ORIGINAL_LINUX_READY_DIFFERS",
  "ORIGINAL_NORMAL_READS_CLOSED",
  "ORIGINAL_NORMAL_WRITES_CLOSED",
  "ORIGINAL_PIDFD_CUSTODY_REQUIRED",
  "ORIGINAL_PIDFD_EXIT_REQUIRED",
  "ORIGINAL_PROCESS_ALREADY_CLOSED",
  "ORIGINAL_PROCESS_CLOSED_WITH_PENDING_READ",
  "ORIGINAL_PROCESS_CLOSED_WITH_PENDING_REPLY",
  "ORIGINAL_PROTOCOL_FAULT",
  "ORIGINAL_PROTOCOL_OR_EVIDENCE_FAILED",
  "ORIGINAL_WATCHER_REPLY_PENDING",
  "ORIGINAL_WINDOWS_EXITS_REQUIRED",
  "ORIGINAL_WINDOWS_HANDLES_REQUIRED",
  "RETIREMENT_ACK_REQUIRED",
  "REVIEWED_CLI_VERSION_REQUIRED",
  "RPC_ERROR_PRESERVED_RAW",
  "SERVING_ROOT_DIFFERS",
  "SESSION_NOT_IDLE",
  "TERMINAL_EVIDENCE_PENDING",
  "THREAD_START_PENDING",
  "UNSUBSCRIBE_PENDING",
  "WINDOWS_WATCHER_CLOSE_REQUIRED",
] as const);
type LocalRefusalCode = typeof LOCAL_REFUSAL_CODES[number];
/** Diagnostic tags only: inspect neither caller getters, causes nor arbitrary text. */
export function classifyMetadataProofRefusal(cause: unknown): LocalRefusalCode | null {
  if (!Error.isError(cause)) { return null; }
  const descriptor = Object.getOwnPropertyDescriptor(cause, "message");
  if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { return null; }
  const message: unknown = descriptor.value;
  return typeof message === "string" ? LOCAL_REFUSAL_CODES.find(code => code === message) ?? null : null;
}
const CLI_VERSION = "codex-cli 0.168.0";
const PLUGIN_ID = "easyeda-pro-control@easyeda-pro-agent";
const SERVER_NAME = "easyeda_pro_control";
function containsControls(value: string): boolean {
  for (const character of value) { const code = character.codePointAt(0); if (code === undefined || code < 32 || code === 127) { return true; } } return false;
}
function linuxPath(value: unknown): value is string {
  return typeof value === "string" && value.length > 1 && value.length <= 4096 && value.isWellFormed() && value.startsWith("/") &&
    !containsControls(value) && value.slice(1).split("/").every(component => component.length > 0 && component !== "." && component !== "..");
}
function hash(value: unknown): value is string { return typeof value === "string" && /^[a-f\d]{64}$/u.test(value); }
function hostPath(value: unknown, host: "linux" | "windows"): value is string {
  if (typeof value !== "string" || value.length === 0 || value.length > 4096 || !value.isWellFormed() || containsControls(value)) { return false; }
  return host === "linux" ? linuxPath(value) : win32.isAbsolute(value) && win32.normalize(value) === value;
}

/** Accept only bounded JSON text: no caller accessors/proxies are reflected. */
function parsePlan(text: string, v2: boolean): CurrentPlan {
  proofNeed(typeof text === "string" && text.isWellFormed() && Buffer.byteLength(text) <= 32 * 1024, "PLAN_TEXT_BOUND");
  const parsed: unknown = JSON.parse(text), value = proofRecord(parsed, "PLAN_OBJECT");
  proofNeed(value["schema"] === (v2 ? "easyeda-pro-control.fresh-cli-metadata-plan.v2" : "easyeda-pro-control.fresh-cli-metadata-plan.v1") && (v2 ? value["host"] === "windows" : value["host"] === "linux" || value["host"] === "windows"), "PLAN_SCHEMA");
  const host = value["host"]; proofNeed(host === "linux" || host === "windows", "PLAN_HOST");
  const keys = ["schema", "host", "mergedCommit", "version", "cliExecutable", "expectedHostNodeVersion", "linuxPluginRoot", "linuxNodeExecutable", "linuxNodeSha256", "hostPluginRoot", "workspace", "overrides", "distribution", "files", ...(v2 ? ["linuxEvidenceDirectory", "evidenceBackend"] : ["evidenceDirectory"])];
  if (host === "windows") { keys.push("windowsNodeExecutable", "windowsNodeSha256"); }
  proofNeed(Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key)), "PLAN_FIELDS");
  for (const key of ["cliExecutable", "hostPluginRoot", "workspace", ...(v2 ? [] : ["evidenceDirectory"])]) { proofNeed(hostPath(value[key], host), "PLAN_HOST_PATH"); }
  for (const key of ["linuxPluginRoot", "linuxNodeExecutable"]) { proofNeed(linuxPath(value[key]), "PLAN_LINUX_PATH"); }
  if (v2) { proofNeed(linuxPath(value["linuxEvidenceDirectory"]) && value["evidenceBackend"] === "wsl-linux-fsync.v1", "PLAN_FIXED_LINUX_EVIDENCE_BACKEND"); }
  else { proofNeed(value["evidenceDirectory"] !== value["workspace"], "PLAN_DISTINCT_WORKSPACE"); }
  proofNeed(typeof value["mergedCommit"] === "string" && /^[a-f\d]{40}$/u.test(value["mergedCommit"]) && hash(value["linuxNodeSha256"]), "PLAN_HASHES");
  proofNeed(typeof value["version"] === "string" && value["version"].length <= 128 && /^\d+\.\d+\.\d+(?:[-+][A-Za-z\d.-]+)?$/u.test(value["version"]), "PLAN_VERSION");
  proofNeed(typeof value["expectedHostNodeVersion"] === "string" && /^v24\.\d+\.\d+$/u.test(value["expectedHostNodeVersion"]) && (host === "windows" || value["expectedHostNodeVersion"] === "v24.18.0"), "PLAN_HOST_NODE_VERSION");
  proofNeed(typeof value["distribution"] === "string" && /^[A-Za-z\d][A-Za-z\d_.-]{0,127}$/u.test(value["distribution"]), "PLAN_DISTRIBUTION");
  proofNeed(Array.isArray(value["overrides"]) && value["overrides"].length <= 64 && value["overrides"].every(item => typeof item === "string" && item.length <= 256 && /^(?:mcp_servers|plugins)\.[A-Za-z\d_@.-]+\.enabled=false$/u.test(item) && item !== `mcp_servers.${SERVER_NAME}.enabled=false` && item !== `plugins.${PLUGIN_ID}.enabled=false`), "PLAN_CHILD_OVERRIDES");
  proofNeed(Array.isArray(value["files"]) && value["files"].length === FILES.length, "PLAN_SIX_FILES");
  let total = 0;
  const files: ExpectedFile[] = value["files"].map((item: unknown, index: number): ExpectedFile => {
    const file = proofRecord(item, "PLAN_FILE"); const relativePath = FILES[index]; const expectedMode = index === 2 ? 0o755 : 0o644;
    proofNeed(relativePath !== undefined, "PLAN_FILE_INDEX");
    proofNeed(Object.keys(file).length === 4 && file["relativePath"] === FILES[index] && typeof file["bytes"] === "number" && Number.isSafeInteger(file["bytes"]) && file["bytes"] > 0 && file["bytes"] <= (index === 0 ? 20 : 16) * 1024 * 1024 && hash(file["sha256"]) && file["mode"] === (index === 2 ? 0o755 : 0o644), "PLAN_FILE_FIELDS");
    total += file["bytes"];
    return Object.freeze({ relativePath, bytes: file["bytes"], sha256: file["sha256"], mode: expectedMode });
  });
  proofNeed(total <= 64 * 1024 * 1024, "PLAN_TOTAL_BYTES");
  if (host === "windows") { proofNeed(hostPath(value["windowsNodeExecutable"], host) && hash(value["windowsNodeSha256"]), "PLAN_WINDOWS_NODE"); }
  const overrides: string[] = value["overrides"].map((item: unknown): string => { proofNeed(typeof item === "string", "OVERRIDE_STRING"); return item; });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Exact JSON keys and every field/bound are validated above; this is immutable plan data, never process authority.
  return Object.freeze({ ...value, files: Object.freeze(files), overrides: Object.freeze(overrides) }) as CurrentPlan;
}
export function parseFreshCliMetadataPlan(text: string): FreshCliMetadataPlan {
  const plan = parsePlan(text, false); proofNeed(plan.schema === "easyeda-pro-control.fresh-cli-metadata-plan.v1", "PLAN_V1_REQUIRED"); return plan;
}
export function parseFreshCliMetadataPlanV2(text: string): FreshCliMetadataPlanV2 {
  const plan = parsePlan(text, true); proofNeed(plan.schema === "easyeda-pro-control.fresh-cli-metadata-plan.v2", "PLAN_V2_REQUIRED"); return plan;
}
function argumentsFor(plan: CurrentPlan): string[] {
  return ["--enable", "plugins", ...plan.overrides.flatMap(item => ["-c", item]), "app-server", "--listen", "stdio://", "--strict-config"];
}
export function previewFreshCliMetadataProof(plan: CurrentPlan): ProofRecord {
  return { schema: plan.schema === "easyeda-pro-control.fresh-cli-metadata-plan.v2" ? "easyeda-pro-control.fresh-cli-metadata-preview.v2" : "easyeda-pro-control.fresh-cli-metadata-preview.v1", ownerStarted: false, mergedCommit: plan.mergedCommit, expectedVersion: plan.version,
    executable: plan.cliExecutable, argv: argumentsFor(plan), cwd: plan.workspace, expectedHostNodeVersion: plan.expectedHostNodeVersion,
    distribution: plan.distribution, fixedServerName: SERVER_NAME, exactPluginId: PLUGIN_ID, thread: { ephemeral: true, sandbox: "read-only", approvalPolicy: "never" },
    actions: ACTIONS, statusRoute: "mcpServerStatus/list with BOTH threadId and verified installed serverName; no temporary global discovery",
    prerequisites: ["Independently verified installed full Linux V2 payload", "Windows published-byte/reparse verification and maintained WSL profile when applicable", "Complete disabled unrelated MCP/plugin set from the same active host configuration; filtered status discovery does not prevent other server startup", "New empty workspace outside all projects/checkouts", "Current CODEX_HOME/auth; no copies or global changes"],
    durability: plan.schema === "easyeda-pro-control.fresh-cli-metadata-plan.v2" ? { backend: plan.evidenceBackend, linuxEvidenceDirectory: plan.linuxEvidenceDirectory, windowsProveSupported: true, hostWorkspaceDirectoryDurabilityProved: false, originalLinuxFileAndDirectorySyncAckRequired: true } : { linuxOriginalFileAndDirectorySyncRequired: true, windowsProveSupported: false, windowsOmission: "No supported unprivileged directory durability primitive established for this helper; Windows --prove refuses before owner/workspace allocation" },
    controlActions: ["status", "close-cli-stdin", "settle-exited-watchers"], scope: "Fresh CLI registry and original serving namespace metadata; no model turn, desktop registry refresh or live CAD admission" };
}
async function readBounded(filename: string, maximum: number): Promise<Buffer> {
  const canonical = await realpath(filename); proofNeed(canonical === filename, "CANONICAL_FILE_REQUIRED");
  // oxlint-disable-next-line no-bitwise -- Linux rejects a symlink at the original descriptor open; Windows canonical/link observations remain a separate prerequisite.
  const flags = process.platform === "linux" ? constants.O_RDONLY | constants.O_NOFOLLOW : constants.O_RDONLY;
  const file = await open(filename, flags);
  try {
    const before = await file.stat({ bigint: true }); proofNeed(before.isFile() && before.nlink === 1n && before.size > 0n && before.size <= BigInt(maximum), "BOUNDED_REGULAR_FILE_REQUIRED");
    const bytes = Buffer.alloc(Number(before.size)); let offset = 0;
    while (offset < bytes.length) { const read = await file.read(bytes, offset, bytes.length - offset, offset); proofNeed(read.bytesRead > 0, "FILE_READ_INCOMPLETE"); offset += read.bytesRead; }
    const extra = await file.read(Buffer.alloc(1), 0, 1, offset); proofNeed(extra.bytesRead === 0, "FILE_GREW_DURING_READ");
    const after = await file.stat({ bigint: true }), current = await lstat(filename, { bigint: true });
    proofNeed(after.dev === before.dev && after.ino === before.ino && after.size === before.size && after.mtimeNs === before.mtimeNs && after.ctimeNs === before.ctimeNs && after.mode === before.mode && after.nlink === 1n && current.isFile() && !current.isSymbolicLink() && current.dev === after.dev && current.ino === after.ino && current.size === after.size && current.mtimeNs === after.mtimeNs && current.ctimeNs === after.ctimeNs && await realpath(filename) === filename, "ORIGINAL_FILE_CHANGED");
    return bytes;
  } finally { await file.close(); }
}
function sha256(bytes: Buffer): string { return createHash("sha256").update(bytes).digest("hex"); }
function payload(value: unknown): ProofRecord {
  const reply = proofRecord(value, "MCP_REPLY"); proofNeed(reply["isError"] !== true && Array.isArray(reply["content"]) && Object.hasOwn(reply, "structuredContent"), "FULL_MCP_STRUCTURED_REPLY_REQUIRED");
  return proofRecord(proofRecord(reply["structuredContent"], "MCP_STRUCTURED_CONTENT")["result"], "MCP_RESULT");
}
async function watcherMessage(peer: OwnedProofProcess, kind: string): Promise<ProofRecord> {
  const value = proofRecord(await boundedProofWait(peer.next(), 30_000, "ORIGINAL_WATCHER_REPLY_PENDING"), "WATCHER_REPLY"); proofNeed(value["kind"] === kind, "WATCHER_STAGE"); return value;
}
function emit(value: unknown): void { try { process.stdout.write(`${JSON.stringify(value)}\n`); } catch {
  // Original file control/status remains available.
} }

function requireDurabilityHost(host: string): void { proofNeed(host === "linux", "WINDOWS_DURABLE_DIRECTORY_SYNC_UNAVAILABLE"); }
/** Metadata-only live operation. All partial outcomes retain original cleanup
 * routes; a closed transport is never retried or replaced by this function. */
export async function proveFreshCliMetadata(plan: FreshCliMetadataPlan): Promise<boolean> { requireDurabilityHost(plan.host); const result = await runFreshCliMetadataProof(plan); return result; }
export async function proveFreshCliMetadataV2(plan: FreshCliMetadataPlanV2): Promise<boolean> { proofNeed(process.platform === "win32", "WINDOWS_V2_HOST_REQUIRED"); const result = await runFreshCliMetadataProof(plan); return result; }
function outcome(plan: CurrentPlan, result: ProofRecord): ProofRecord {
  return plan.schema === "easyeda-pro-control.fresh-cli-metadata-plan.v2" ? { schema: "easyeda-pro-control.fresh-cli-metadata-result.v2", evidenceBackend: plan.evidenceBackend, linuxEvidenceDirectory: plan.linuxEvidenceDirectory, hostWorkspaceDirectoryDurabilityProved: false, ...result } : result;
}
async function runFreshCliMetadataProof(plan: CurrentPlan): Promise<boolean> {
  proofNeed(process.arch === "x64" && process.platform === (plan.host === "windows" ? "win32" : "linux") && process.version === plan.expectedHostNodeVersion, "HOST_RUNTIME_MISMATCH");
  const hostNode = plan.host === "windows" ? plan.windowsNodeExecutable : plan.linuxNodeExecutable;
  proofNeed(hostNode !== undefined && await realpath(process.execPath) === hostNode, "EXPECTED_HOST_NODE_REQUIRED");
  const hostNodeBytes = await readBounded(hostNode, 256 * 1024 * 1024); proofNeed(sha256(hostNodeBytes) === (plan.host === "windows" ? plan.windowsNodeSha256 : plan.linuxNodeSha256), "HOST_NODE_BYTES_DIFFER");
  for (const expected of plan.files) { const file = join(plan.hostPluginRoot, expected.relativePath); const bytes = await readBounded(file, expected.relativePath === FILES[0] ? 20 * 1024 * 1024 : 16 * 1024 * 1024);
    proofNeed(bytes.length === expected.bytes && sha256(bytes) === expected.sha256, "INSTALLED_SIX_BYTES_DIFFER");
    if (expected.relativePath === ".codex-plugin/plugin.json") { const parsedManifest: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes)); const manifest = proofRecord(parsedManifest, "PLUGIN_MANIFEST"); proofNeed(manifest["version"] === plan.version, "INSTALLED_VERSION_DIFFERS"); }
  }
  const mcpBytes = await readBounded(join(plan.hostPluginRoot, ".mcp.json"), 64 * 1024); const parsedMcp: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(mcpBytes)); const mcp = proofRecord(parsedMcp, "MCP_MANIFEST");
  const servers = proofRecord(mcp["mcpServers"], "MCP_SERVER_MAP"); proofNeed(Object.keys(servers).length === 1 && Object.hasOwn(servers, SERVER_NAME), "VERIFIED_SOLE_SERVER_REQUIRED");
  let systemRoot = "";
  if (plan.host === "windows") { const value = process.env["SystemRoot"]; proofNeed(hostPath(value, "windows"), "WINDOWS_SYSTEM_ROOT_REQUIRED"); systemRoot = value; }
  const nonce = randomUUID();
  const evidence = plan.schema === "easyeda-pro-control.fresh-cli-metadata-plan.v2" ? await createLinuxBrokerProofEvidence({ distribution: plan.distribution, linuxEvidenceDirectory: plan.linuxEvidenceDirectory, workspace: plan.workspace, nonce }) : await createProofEvidence(plan.evidenceDirectory, plan.workspace);
  const state = evidence.state;
  const nodeDirectory = dirname(hostNode); const inherited = Object.fromEntries(Object.entries(process.env).filter(([key]) => plan.host !== "windows" || key.toUpperCase() !== "PATH"));
  const environment = { ...inherited, PATH: `${nodeDirectory}${plan.host === "windows" ? ";" : ":"}${process.env["PATH"] ?? ""}` };
  const originals: OwnedProofProcess[] = []; let app: OwnedProofProcess | undefined; let linux: OwnedProofProcess | undefined; let windows: OwnedProofProcess | undefined;
  let phase = "local-evidence"; let stopping = false; let linuxReady = false; let linuxAckSent = false; let linuxExit = false; let linuxReleased = false; let windowsReady = false; let windowsAckSent = false; let windowsExit = false; let windowsReleased = false;
  let facadeMayExist = false; let loadedFacadePid: number | null = null; let linuxPidfdHeld = false;
  const facadeClosure = (): ProofFacadeClosure => ({ mayExist: facadeMayExist, pid: loadedFacadePid, originalPidfdHeld: linuxPidfdHeld, originalExitObserved: linuxExit });
  let activeAction: MetadataAction | null = null; const startedActions: MetadataAction[] = [];
  const originalStates = (): readonly ProofRecord[] => originals.map(item => ({ pid: item.child.pid ?? null, exit: item.exitResult ?? null, close: item.closeResult ?? null, protocolHealthy: item.protocolHealthy() }));
  const status = (): ProofRecord => ({ schema: plan.schema === "easyeda-pro-control.fresh-cli-metadata-plan.v2" ? "easyeda-pro-control.fresh-cli-metadata-status.v2" : "easyeda-pro-control.fresh-cli-metadata-status.v1", nonce, phase, stopping, controlFile: evidence.controlFile,
    driverPid: process.pid, hostNodeVersion: process.version, currentCliPid: app?.child.pid ?? null, activeAction, startedActions: [...startedActions], pendingRpc: app === undefined ? [] : [...app.pendingMethods.entries()], originals: originalStates(),
    linux: { ready: linuxReady, ackSent: linuxAckSent, originalExitObserved: linuxExit, released: linuxReleased }, windows: { ready: windowsReady, ackSent: windowsAckSent, originalExitObserved: windowsExit, released: windowsReleased },
    loadedFacade: facadeClosure(), loadedFacadeExitUnknown: facadeMayExist && !linuxExit, evidenceFailed: evidence.failed(), journals: evidence.snapshots(), modelTurnStarted: false, proofComplete: false });
  const publish = (): void => { const value = status(); state.put(value); emit(value); };
  const normal = async (): Promise<void> => { proofNeed(!stopping && !evidence.failed() && await evidence.flush() && !stopping && !evidence.failed(), "NORMAL_METADATA_FLOW_STOPPED"); };
  const closeCli = (): void => {
    proofNeed(startedActions.every((action, index) => action === ACTIONS[index]) && startedActions.length <= ACTIONS.length, "FIXED_METADATA_SEQUENCE_CHANGED");
    stopping = true;
    // The original EOF happens even when every evidence write has failed.
    app?.closeInput(); state.put({ stage: "original-cli-stdin-eof", phase, nonce, activeAction, proofComplete: false });
  };
  const settle = async (): Promise<void> => {
    proofNeed(stopping, "SETTLEMENT_REQUIRES_STOPPED_FLOW");
    if (linux !== undefined && linux.closeResult === undefined) {
      try { if (linuxReady && !linuxAckSent) { linuxAckSent = true; await linux.settleWatcher({ kind: "await-original-exit", nonce }); }
        if (linuxExit && !linuxReleased) { linuxReleased = true; await linux.settleWatcher({ kind: "release", nonce }); }
      } catch { linux.closeInput(); }
    }
    if (windows !== undefined && windows.closeResult === undefined) {
      try { if (windowsReady && !windowsAckSent) { windowsAckSent = true; await windows.settleWatcher({ kind: "await-original-exit", nonce }); }
        if (windowsExit && !windowsReleased) { windowsReleased = true; await windows.settleWatcher({ kind: "release", nonce }); }
      } catch { windows.closeInput(); }
    }
  };
  const buffers = { stdin: "", file: "" }; let controlBusy = false;
  const runControlSettlement = async (): Promise<void> => { try { await settle(); publish(); } catch { state.put({ stage: "settlement-pending" }); } finally { controlBusy = false; } };
  const control = (bytes: Buffer, source: "stdin" | "file"): void => {
    buffers[source] += bytes.toString("utf8"); if (Buffer.byteLength(buffers[source]) > 8192) { buffers[source] = ""; state.put({ stage: "control-refused", code: "CONTROL_BOUND" }); return; }
    let at = buffers[source].indexOf("\n");
    while (at >= 0) {
      const line = buffers[source].slice(0, at); buffers[source] = buffers[source].slice(at + 1);
      try { if (line.trim().length > 0) { const request = proofRecord(JSON.parse(line), "CONTROL_OBJECT"); proofNeed(request["nonce"] === nonce && Object.keys(request).length === 2, "CONTROL_IDENTITY");
        if (request["action"] === "status") { publish(); }
        else if (request["action"] === "close-cli-stdin") { closeCli(); publish(); }
        else { proofNeed(request["action"] === "settle-exited-watchers" && !controlBusy, "FIXED_CONTROL_ACTION"); controlBusy = true;
          void runControlSettlement(); }
      } } catch { state.put({ stage: "control-refused", code: "FIXED_CONTROL_REFUSED" }); }
      at = buffers[source].indexOf("\n");
    }
  };
  const stdin = (bytes: Buffer): void => { control(bytes, "stdin"); };
  const outputError = (): void => { state.put({ stage: "parent-output-unavailable", controlFile: evidence.controlFile, nonce }); };
  process.stdout.on("error", outputError); process.stdin.on("data", stdin);
    let controlRead: Promise<void> | undefined;
  const readControl = async (): Promise<void> => { try { control(await evidence.readControl(), "file"); } catch { closeCli(); } finally { controlRead = undefined; } };
  const timer = setInterval((): void => { controlRead ??= readControl(); }, 200);
  // This callback never logs before the original EOF and is active before spawn.
  const observeEvidenceFailure = async (): Promise<void> => { await evidence.failure; closeCli(); };
  void observeEvidenceFailure();
  const finish = async (): Promise<boolean> => { if (!await evidence.close()) { return false; } clearInterval(timer); process.stdin.off("data", stdin); process.stdin.pause(); return true; };
  const observe = (which: "linux" | "windows") => (value: unknown): void => {
    if (value === null || typeof value !== "object" || Array.isArray(value)) { return; } const item = proofRecord(value, "WATCHER_EVENT"); if (item["nonce"] !== nonce) { return; }
    if (which === "linux") { if (item["kind"] === "linux-custody" && item["pid"] === loadedFacadePid && item["pidfdHeld"] === true) { linuxPidfdHeld = true; } if (item["kind"] === "linux-ready") { linuxReady = true; } if (item["kind"] === "linux-exited" && item["originalExitObserved"] === true) { linuxExit = true; } }
    else { if (item["kind"] === "windows-ready") { windowsReady = true; } if (item["kind"] === "windows-exited" && item["originalExitObserved"] === true) { windowsExit = true; } }
  };
  state.put({ stage: "fixed-control-ready", nonce, controlFile: evidence.controlFile }); publish();
  try {
    await normal(); phase = "cli-version";
    const version = new OwnedProofProcess(plan.cliExecutable, ["--version"], plan.workspace, evidence.journal("cli-version.stdout.log"), evidence.journal("cli-version.stderr.log"), environment, "plain"); app = version; originals.push(version);
    const versionClosed = await boundedProofWait(Promise.race([version.closed.promise, version.fault.promise]), 15_000, "CLI_VERSION_PENDING"); await normal(); proofNeed(versionClosed.code === 0 && versionClosed.signal === null && version.text().trim() === CLI_VERSION, "REVIEWED_CLI_VERSION_REQUIRED");
    const active = new OwnedProofProcess(plan.cliExecutable, argumentsFor(plan), plan.workspace, evidence.journal("app-server.stdout.jsonl"), evidence.journal("app-server.stderr.log"), environment); app = active; originals.push(active); facadeMayExist = true;
    phase = "initialize"; state.put({ stage: "original-cli-started", pid: active.child.pid, nonce, mergedCommit: plan.mergedCommit }); await normal();
    await boundedProofWait(active.rpc("initialize", { clientInfo: { name: "easyeda_release_metadata_proof", title: "EasyEDA release metadata proof", version: "1" }, capabilities: { experimentalApi: true } }), 30_000, "INITIALIZE_PENDING"); await normal(); await active.notifyInitialized(); await normal();
    phase = "thread/start"; const started = proofRecord(await boundedProofWait(active.rpc("thread/start", { cwd: plan.workspace, ephemeral: true, sandbox: "read-only", approvalPolicy: "never" }), 60_000, "THREAD_START_PENDING"), "THREAD_REPLY"); await normal();
    const threadId = proofRecord(started["thread"], "THREAD")["id"]; proofNeed(typeof threadId === "string", "THREAD_ID");
    phase = "mcpServerStatus/list"; const rows: ProofRecord[] = []; const cursors = new Set<string>(); let cursor: string | null = null;
    for (let pageNumber = 0; ; pageNumber += 1) {
      await normal(); proofNeed(pageNumber < 8, "MCP_STATUS_PAGE_BOUND");
      const page = proofRecord(await boundedProofWait(active.rpc("mcpServerStatus/list", { threadId, serverName: SERVER_NAME, detail: "toolsAndAuthOnly", limit: 1, ...(cursor === null ? {} : { cursor }) }), 60_000, "MCP_STATUS_PENDING"), "MCP_STATUS");
      proofNeed(Array.isArray(page["data"]) && page["data"].length <= 1, "FIXED_SERVER_ROSTER"); for (const item of page["data"]) { rows.push(proofRecord(item, "MCP_SERVER")); } proofNeed(rows.length <= 1, "DUPLICATE_SERVER_ROSTER");
      const next = page["nextCursor"] ?? null; if (next === null) { break; } proofNeed(typeof next === "string" && next.length > 0 && next.length <= 1024 && !cursors.has(next), "MCP_STATUS_CURSOR_REPEATED"); cursors.add(next); cursor = next;
    }
    const selected = rows[0]; proofNeed(rows.length === 1 && selected !== undefined && selected["name"] === SERVER_NAME && selected["pluginId"] === PLUGIN_ID, "EXACT_INSTALLED_PLUGIN_REQUIRED");
    const tools = proofRecord(selected["tools"], "ACTUAL_THREAD_TOOLS"); proofNeed(Object.hasOwn(tools, "easyeda_control_api") && Object.hasOwn(tools, "easyeda_control_session"), "ACTUAL_METADATA_TOOLS_REQUIRED");
    const call = async (action: MetadataAction): Promise<ProofRecord> => {
      await normal(); proofNeed(action === ACTIONS[startedActions.length], "FIXED_METADATA_SEQUENCE_ONLY"); activeAction = action; phase = action;
      proofNeed(state.put({ stage: "metadata-action-intent", nonce, action, ordinal: startedActions.length + 1, threadId, server: SERVER_NAME }) && await evidence.flush() && !evidence.failed(), "METADATA_ACTION_INTENT_NOT_DURABLE");
      await normal(); startedActions.push(action);
      let request: ProofRecord = { action }; if (action === "retire") { request = { action, confirmRetire: true }; } else if (action === "close-retired") { request = { action, confirmCloseRetired: true }; }
      const reply = await boundedProofWait(active.rpc("mcpServer/tool/call", { threadId, server: SERVER_NAME, tool: action === "loaded-facade" ? "easyeda_control_api" : "easyeda_control_session", arguments: { request } }), 60_000, "MCP_CALL_PENDING_NO_RETRY");
      const result = payload(reply);
      if (action === "loaded-facade" && typeof result["pid"] === "number" && Number.isSafeInteger(result["pid"]) && result["pid"] > 0 && result["pid"] <= 2_147_483_647) { loadedFacadePid = result["pid"]; }
      proofNeed(evidence.journal(REPLY_JOURNALS[action]).put(reply), "FULL_REPLY_EVIDENCE_PENDING"); activeAction = null; await normal(); return result;
    };
    const loaded = await call("loaded-facade"); proofNeed(loadedFacadePid !== null, "LOADED_FACADE_PID_REQUIRED");
    phase = "original-watchers"; await normal(); const linuxArgs = plan.host === "linux" ? ["-I", "-S", "-c", linuxMetadataWatcherProgram()] : ["--distribution", plan.distribution, "--exec", "/usr/bin/python3", "-I", "-S", "-c", linuxMetadataWatcherProgram()];
    linux = new OwnedProofProcess(plan.host === "linux" ? "/usr/bin/python3" : join(systemRoot, "System32", "wsl.exe"), linuxArgs, plan.workspace, evidence.journal("linux-watcher.jsonl"), evidence.journal("linux-watcher.stderr.log")); originals.push(linux); linux.onRecord = observe("linux");
    await linux.sendWatcherPacket({ nonce, pid: loaded["pid"], pluginRoot: plan.linuxPluginRoot, nodeExecutable: plan.linuxNodeExecutable, nodeSha256: plan.linuxNodeSha256, files: plan.files });
    const custody = await watcherMessage(linux, "linux-custody"); proofNeed(custody["nonce"] === nonce && custody["pid"] === loadedFacadePid && custody["pidfdHeld"] === true, "ORIGINAL_PIDFD_CUSTODY_REQUIRED"); linuxPidfdHeld = true;
    const ready = await watcherMessage(linux, "linux-ready"); await normal(); proofNeed(ready["nonce"] === nonce && ready["pid"] === loaded["pid"] && ready["pidfdHeld"] === true && ready["fileDescriptorsHeld"] === 6 && Array.isArray(ready["sixNamespaceFiles"]) && ready["sixNamespaceFiles"].length === 6 && ready["sixNamespaceFiles"].every((item: unknown, index: number) => { const row = proofRecord(item, "NAMESPACE_FILE"); const expected = plan.files[index]; return expected !== undefined && row["relativePath"] === expected.relativePath && row["bytes"] === expected.bytes && row["sha256"] === expected.sha256 && row["mode"] === expected.mode && row["nlink"] === 1; }), "ORIGINAL_LINUX_READY_DIFFERS");
    proofNeed(loaded["schema"] === "easyeda-pro-control.loaded-facade.v1" && typeof loaded["pid"] === "number" && Number.isSafeInteger(loaded["pid"]) && loaded["pid"] > 0 && loaded["pid"] <= 2_147_483_647 && loaded["nodeVersion"] === "v24.18.0" && loaded["admissionGranted"] === false && typeof loaded["moduleUrl"] === "string", "LOADED_FACADE");
    const moduleUrl = new URL(loaded["moduleUrl"]); proofNeed(moduleUrl.protocol === "file:" && moduleUrl.hostname === "" && decodeURIComponent(moduleUrl.pathname) === posix.join(plan.linuxPluginRoot, "server/dist/server.mjs"), "SERVING_ROOT_DIFFERS");
    const inspected = await call("inspect"); proofNeed(inspected["schema"] === "easyeda-pro-control.session-retirement.v1" && inspected["state"] === "active" && inspected["activeCalls"] === 0, "SESSION_NOT_IDLE");
    if (plan.host === "windows") {
      windows = new OwnedProofProcess(join(systemRoot, "System32", "WindowsPowerShell", "v1.0", "powershell.exe"), ["-NoProfile", "-NonInteractive", "-EncodedCommand", Buffer.from(windowsMetadataWatcherProgram(), "utf16le").toString("base64")], plan.workspace, evidence.journal("windows-watcher.jsonl"), evidence.journal("windows-watcher.stderr.log")); originals.push(windows); windows.onRecord = observe("windows");
      await windows.sendWatcherPacket({ nonce, cliPid: active.child.pid, nodeExecutable: plan.windowsNodeExecutable, nodeSha256: plan.windowsNodeSha256 }); const readyWindows = await watcherMessage(windows, "windows-ready"); await normal(); proofNeed(readyWindows["nonce"] === nonce && readyWindows["originalHandlesHeld"] === true, "ORIGINAL_WINDOWS_HANDLES_REQUIRED");
      await normal(); windowsAckSent = true; await windows.sendWatcherPacket({ kind: "ack", nonce }); await watcherMessage(windows, "windows-acked");
    }
    await normal(); linuxAckSent = true; await linux.sendWatcherPacket({ kind: "ack", nonce, pid: loaded["pid"], startTicks: ready["startTicks"] }); await watcherMessage(linux, "linux-acked"); await normal(); state.put({ stage: "parent-ack-before-retirement", nonce, pid: loaded["pid"], startTicks: ready["startTicks"] });
    const retired = await call("retire"); proofNeed(retired["schema"] === "easyeda-pro-control.session-retirement.v1" && retired["state"] === "retired" && retired["activeCalls"] === 0 && retired["liveAdmissionOpen"] === false && retired["leaseReleaseAcknowledged"] === true, "RETIREMENT_ACK_REQUIRED");
    const scheduled = await call("close-retired"); proofNeed(scheduled["schema"] === "easyeda-pro-control.session-close-scheduled.v1" && scheduled["retirementState"] === "retired" && scheduled["leaseReleaseAcknowledged"] === true && scheduled["closeScheduled"] === true && scheduled["processExitProved"] === false && scheduled["deliveryAcknowledged"] === false && scheduled["retryAllowed"] === false, "CLOSE_SCHEDULED_ONLY");
    phase = "original-exits"; const exited = await watcherMessage(linux, "linux-exited"); proofNeed(exited["originalExitObserved"] === true, "ORIGINAL_PIDFD_EXIT_REQUIRED");
    if (windows !== undefined) { const exitedWindows = await watcherMessage(windows, "windows-exited"); proofNeed(exitedWindows["nodeExitCode"] === 0 && exitedWindows["wslExitCode"] === 0, "ORIGINAL_WINDOWS_EXITS_REQUIRED"); windowsReleased = true; await windows.settleWatcher({ kind: "release", nonce }); const windowsClosed = await windows.closed.promise; proofNeed(windowsClosed.code === 0, "WINDOWS_WATCHER_CLOSE_REQUIRED"); }
    linuxReleased = true; await linux.settleWatcher({ kind: "release", nonce }); const linuxClosed = await linux.closed.promise; proofNeed(linuxClosed.code === 0, "LINUX_WATCHER_CLOSE_REQUIRED");
    phase = "thread/unsubscribe"; await boundedProofWait(active.rpc("thread/unsubscribe", { threadId }), 30_000, "UNSUBSCRIBE_PENDING"); active.closeInput(); const ended = await boundedProofWait(active.closed.promise, 60_000, "CLI_CLOSE_PENDING"); proofNeed(ended.code === 0 && ended.signal === null, "ORIGINAL_CLI_CLOSE_REQUIRED"); await normal();
    proofNeed(originals.every(item => item.protocolHealthy()), "ORIGINAL_PROTOCOL_FAULT");
    phase = "complete"; state.put({ stage: phase, nonce, pid: loaded["pid"], originalPidfdExitObserved: true, originals: originalStates(), modelTurnStarted: false, desktopRefreshClaimed: false, admissionGranted: false });
    const terminalManifest = await evidence.terminalWorkspaceManifest(true, facadeClosure());
    proofNeed(evidence.cleanup.put(terminalManifest) && await evidence.flush() && !stopping && !evidence.failed(), "TERMINAL_EVIDENCE_PENDING"); proofNeed(await finish(), "ORIGINAL_EVIDENCE_SYNC_PENDING"); if (evidence.failed()) { emit(outcome(plan, { ok: false, proofComplete: false, error: "original-evidence-close-failed", evidenceDirectory: evidencePath(plan) })); return false; } emit(outcome(plan, { ok: true, evidenceDirectory: evidencePath(plan), originalPidfdExitObserved: true, modelTurnStarted: false, admissionGranted: false })); return true;
  } catch (error) {
    // Original EOF precedes even safe classification and fallible logging.
    closeCli();
    const localRefusalCode = classifyMetadataProofRefusal(error);
    phase = "incomplete-proof-cleanup";
    state.put({ stage: "PROOF_INCOMPLETE", nonce, phase, activeAction, startedActions: [...startedActions], localRefusalCode }); publish();
    let lastStatus = Date.now(); let terminalWritten = false;
    for (;;) {
      try { await settle(); } catch {
        // Fixed control/status remains actionable.
      }
      const closed = !controlBusy && originals.every(item => item.closeResult !== undefined);
      if (closed) {
        phase = "incomplete-proof-original-transports-closed";
        if (!terminalWritten) { terminalWritten = true; state.put({ stage: phase, nonce, originals: originalStates(), proofComplete: false }); evidence.cleanup.put(await evidence.terminalWorkspaceManifest(true, facadeClosure())); publish(); }
        if (await evidence.flush() && !evidence.hasPending() && await finish()) { emit(outcome(plan, { ok: false, proofComplete: false, evidenceDirectory: evidencePath(plan), loadedFacade: facadeClosure(), loadedFacadeExitUnknown: facadeMayExist && !linuxExit })); return false; }
      }
      await settlementTick(250);
      if (Date.now() - lastStatus >= 30_000) { publish(); lastStatus = Date.now(); }
    }
  }
}
async function main(): Promise<void> {
  const args = process.argv.slice(2); let mode = "--preview"; let filename: string | undefined;
  if (args.length === 1) { filename = args[0]; } else if (args.length === 2) { mode = args[0] ?? ""; filename = args[1]; }
  proofNeed((mode === "--preview" || mode === "--prove") && filename !== undefined, "USAGE: node scripts/fresh-cli-metadata-proof.ts [--preview|--prove] PLAN.json");
  const bytes = await readBounded(resolve(filename), 32 * 1024), text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
  const header = proofRecord(JSON.parse(text), "PLAN_HEADER"); const plan = header["schema"] === "easyeda-pro-control.fresh-cli-metadata-plan.v2" ? parseFreshCliMetadataPlanV2(text) : parseFreshCliMetadataPlan(text);
  if (mode === "--preview") { emit(previewFreshCliMetadataProof(plan)); return; }
  if (!await (plan.schema === "easyeda-pro-control.fresh-cli-metadata-plan.v2" ? proveFreshCliMetadataV2(plan) : proveFreshCliMetadata(plan))) { process.exitCode = 1; }
}
if (import.meta.main) {
  // oxlint-disable-next-line node/no-top-level-await -- This private ESM CLI must retain its original process through every cleanup await.
  try { await main(); } catch { emit({ ok: false, error: "fresh-cli-metadata-proof-refused", proofComplete: false }); process.exitCode = 1; }
}
