/** Source-checkout developer metadata runner. The frozen control-session
 * manager, mounted tools and connected-runtime admission are not involved. */
import { ChildProcess, spawn } from "node:child_process";
import { readFile, readlink } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { createHash } from "node:crypto";
import { z } from "zod";
import { loadReviewedCompatibilityManifest } from "../../server/src/core.ts";
import { openReviewedDescriptorSanitizerExecutable, openReviewedNodeExecutable, openReviewedSandboxDescriptorWithoutExecution } from "../../server/src/upstream-trust.ts";
import type { ReviewedExecutable } from "../../server/src/upstream-trust.ts";
import { createCli4197Artifacts, openCli4197Runtime } from "./custody.ts";
import type { Cli4197Artifacts, Cli4197Runtime } from "./custody.ts";
import { CLI4197_METADATA_LIMITS as LIMITS, CLI4197_METADATA_PROFILE as PROFILE, parseCli4197MetadataOptions } from "./profile.ts";
import type { Cli4197MetadataCommand } from "./profile.ts";
import { CLI4197_NAMESPACE_NAMES, cli4197MetadataBootstrap, cli4197MetadataSandboxArguments } from "./namespace.ts";
import type { Cli4197NamespaceSpec } from "./namespace.ts";

const need = (value: boolean): void => { if (!value) { throw new Error("CLI4197_METADATA_REFUSED"); } };
const digest = (value: Uint8Array): string => createHash("sha256").update(value).digest("hex");
const json = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
export interface Cli4197OriginalChildResult {
  readonly stdout: Buffer; readonly stderr: Buffer; readonly stdoutOverflow: boolean; readonly stderrOverflow: boolean;
  readonly invalidChunk: boolean; readonly spawnFailed: boolean; readonly errorSeen: boolean;
  readonly exitObserved: boolean; readonly exitCode: number | null; readonly signal: NodeJS.Signals | null;
  readonly childCloseObserved: true; readonly stdioClosed: true;
}
/** Observe this original ChildProcess through exit and all stdio closes. Bounds
 * stop retention but keep draining; no signal, PID adoption or stream teardown
 * substitutes for the original child's actual lifecycle. */
export function observeCli4197MetadataChild(child: ChildProcess): Promise<Cli4197OriginalChildResult> {
  need(child instanceof ChildProcess && child.stdout !== null && child.stdout !== undefined && child.stderr !== null && child.stderr !== undefined);
  if (child.stdout === null || child.stdout === undefined || child.stderr === null || child.stderr === undefined) { throw new Error("CLI4197_METADATA_CHILD_STREAMS"); }
  const deferred = Promise.withResolvers<Cli4197OriginalChildResult>(), errorStream = child.stderr, outputStream = child.stdout;
    const stderr: Buffer[] = [], stdout: Buffer[] = []; let stderrBytes = 0, stderrOverflow = false, stdoutBytes = 0, stdoutOverflow = false;
    let childClosed = false, exitObserved = false, invalidChunk = false, settled = false, spawnErrorSeen = false, stderrClosed = false, stdoutClosed = false, streamErrorSeen = false;
    let exitCode: number | null = null, signal: NodeJS.Signals | null = null, started = child.pid !== undefined;
    const settle = (): void => {
      const spawnFailed = spawnErrorSeen && !started;
      if (!settled && childClosed && stdoutClosed && stderrClosed && (exitObserved || spawnFailed)) {
        settled = true; deferred.resolve(Object.freeze({ stdout: Buffer.concat(stdout), stderr: Buffer.concat(stderr), stdoutOverflow, stderrOverflow, invalidChunk, spawnFailed, errorSeen: spawnErrorSeen || streamErrorSeen,
          exitObserved, exitCode, signal, childCloseObserved: true, stdioClosed: true }));
      }
    };
    outputStream.on("data", (chunk: unknown): void => {
      if (!Buffer.isBuffer(chunk)) { invalidChunk = true; return; } stdoutBytes += chunk.length;
      if (stdoutBytes > LIMITS.reportBytes) { stdoutOverflow = true; stdout.length = 0; } else if (!stdoutOverflow) { stdout.push(chunk); }
    });
    errorStream.on("data", (chunk: unknown): void => {
      if (!Buffer.isBuffer(chunk)) { invalidChunk = true; return; } stderrBytes += chunk.length;
      if (stderrBytes > LIMITS.outerStderrBytes) { stderrOverflow = true; stderr.length = 0; } else if (!stderrOverflow) { stderr.push(chunk); }
    });
    outputStream.once("error", (): void => { streamErrorSeen = true; }); errorStream.once("error", (): void => { streamErrorSeen = true; });
    outputStream.once("close", (): void => { stdoutClosed = true; settle(); }); errorStream.once("close", (): void => { stderrClosed = true; settle(); });
    child.once("spawn", (): void => { started = true; }); child.once("error", (): void => { spawnErrorSeen = true; settle(); });
    child.once("exit", (code, value): void => { exitObserved = true; exitCode = code; signal = value; settle(); });
    child.once("close", (): void => { childClosed = true; settle(); });
  return deferred.promise;
}
/** Keep host failures distinct from a started child without a valid report.
 * The v1 failure artifact remains historical; no outcome authorizes retry. */
export function cli4197MetadataClosedFailure(command: Cli4197MetadataCommand, observed: Cli4197OriginalChildResult | null): Readonly<Record<string, string | number | boolean | null>> {
  return Object.freeze({ profile: "private.cli4197-developer-metadata-failure.v2", command,
    childSpawnAttempted: observed !== null, spawnFailed: observed?.spawnFailed ?? false, spawnOrStreamErrorSeen: observed?.errorSeen ?? false,
    invalidChunk: observed?.invalidChunk ?? false, signal: observed?.signal ?? null,
    originalChildExitObserved: observed?.exitObserved ?? false, originalChildStdioClosed: observed?.stdioClosed ?? false, exitCode: observed?.exitCode ?? null,
    stdoutOverflow: observed?.stdoutOverflow ?? false, stderrOverflow: observed?.stderrOverflow ?? false, hostSignalIssued: false, runtimeAdmitted: false, retryAuthorized: false });
}
const encoded = z.strictObject({ base64: z.string().max(27_308), bytes: z.number().int().min(0).max(LIMITS.outputBytes), sha256: z.string().regex(/^[a-f\d]{64}$/u) });
const namespaceName = z.string().min(7).max(64).regex(/^(?:user|mnt|pid|net|ipc|uts):\[\d+\]$/u);
const reportSchema = z.strictObject({
  profile: z.literal("private.cli4197-isolated-metadata-result.v1"), command: z.enum(["rootHelp", "openHelp", "apiHelp", "invokeHelp", "sessionListHelp", "viaCreateDocs"]),
  namespacePid: z.literal(1), uid: z.literal(1000), gid: z.literal(1000),
  namespaces: z.strictObject({ user: namespaceName, mnt: namespaceName, pid: namespaceName, net: namespaceName, ipc: namespaceName, uts: namespaceName }),
  allOriginalAuthorityDescriptorsClosed: z.literal(true), closedRoles: z.tuple([z.literal(3), z.literal(4), z.literal(5), z.literal(6), z.literal(7), z.literal(8), z.literal(9)]),
  reason: z.enum(["completed", "vendor-failed", "deadline", "stdout-bound", "stderr-bound", "spawn-refused"]), vendorExitCode: z.number().int().min(0).max(255).nullable(), outputComplete: z.boolean(),
  stdoutBytesObserved: z.number().int().nonnegative(), stderrBytesObserved: z.number().int().nonnegative(), stdout: encoded.nullable(), stderr: encoded.nullable(),
  editorOpenAuthorized: z.literal(false), apiInvocationAuthorized: z.literal(false), networkAuthorized: z.literal(false), connectedRuntimeAdmitted: z.literal(false),
});
/** Decode complete bounded bytes. Report parsing is not runtime admission;
 * only the original fixed namespace child may supply it to the runner. */
export function decodeCli4197MetadataReport(bytes: Buffer, command: Cli4197MetadataCommand): Readonly<{ report: z.infer<typeof reportSchema>; stdout: Buffer | null; stderr: Buffer | null }> {
  need(bytes.length > 0 && bytes.length <= LIMITS.reportBytes);
  const parsed: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); const report = reportSchema.parse(parsed);
  need(report.command === command && report.outputComplete === (report.reason === "completed" || report.reason === "vendor-failed"));
  const decode = (value: z.infer<typeof encoded> | null): Buffer | null => {
    if (value === null) { return null; } const buffer = Buffer.from(value.base64, "base64");
    need(buffer.length === value.bytes && buffer.toString("base64") === value.base64 && digest(buffer) === value.sha256); return buffer;
  };
  const stderr = decode(report.stderr), stdout = decode(report.stdout);
  need(report.outputComplete ? stdout !== null && stderr !== null && stdout.length === report.stdoutBytesObserved && stderr.length === report.stderrBytesObserved : stdout === null && stderr === null);
  return Object.freeze({ report, stdout, stderr });
}
/** Reject a misplaced Chromium flag that silently produced root help. API
 * method documentation must have its exact fixed return/parameter metadata. */
export function verifyCli4197MetadataOutput(command: Cli4197MetadataCommand, stdout: Buffer): void {
  const text = new TextDecoder("utf-8", { fatal: true }).decode(stdout);
  const prefixes = { rootHelp: `JLCEDA Pro ${PROFILE.version}\n`, openHelp: "open\n", apiHelp: "doc.api\n", invokeHelp: "invoke\n", sessionListHelp: "session.list\n" };
  if (command !== "viaCreateDocs") { need(text.startsWith(prefixes[command])); return; }
  const parameter = z.strictObject({ name: z.string().min(1).max(64), type: z.string().min(1).max(256), description: z.string().max(4096), required: z.boolean() });
  const returns = z.strictObject({ type: z.literal("IPCB_PrimitiveVia"), description: z.string().max(4096) });
  const document = z.strictObject({ title: z.string().min(1).max(256), visibility: z.literal("public"), params: z.array(parameter).length(9),
    returns, example: z.string().max(16_384), isAsync: z.literal(true) });
  const value: unknown = JSON.parse(text);
  const doc = z.strictObject({ ok: z.literal(true), value: document,
    logs: z.array(z.unknown()).max(128), durationMs: z.number().int().min(0).max(LIMITS.deadlineMilliseconds) }).parse(value);
  need(doc.value.params.map(item => item.name).join(",") === "net,x,y,holeDiameter,diameter,viaType,designRuleBlindViaName,solderMaskExpansion,primitiveLock" && doc.value.params.every((item, index) => item.required === (index < 5)));
}
/** Gate Node/toolchain and source-checkout inputs before the one fixed native
 * launch. This entry never queries or changes the live facade/manager lease. */
export async function runCli4197MetadataProbe(input: unknown): Promise<Readonly<{ profile: "private.cli4197-developer-metadata-probe.v1"; artifactDirectory: string; command: Cli4197MetadataCommand; metadataCaptured: true; runtimeAdmitted: false }>> {
  const options = parseCli4197MetadataOptions(input);
  need(process.platform === "linux" && process.arch === "x64" && process.version === "v24.18.0" && /^Max core file size\s+0\s/mu.test(await readFile("/proc/self/limits", "utf8")));
  const launcher = loadReviewedCompatibilityManifest().upstream.launcher; need(process.execPath === launcher.command);
  let node: ReviewedExecutable | null = null, sandbox: ReviewedExecutable | null = null, sanitizer: ReviewedExecutable | null = null;
  let artifacts: Cli4197Artifacts | null = null, original: Promise<Cli4197OriginalChildResult> | null = null, runtime: Cli4197Runtime | null = null;
  try {
    node = await openReviewedNodeExecutable(launcher.command, launcher.commandSha256);
    sandbox = await openReviewedSandboxDescriptorWithoutExecution(launcher.sandbox); sanitizer = await openReviewedDescriptorSanitizerExecutable();
    runtime = await openCli4197Runtime(options.runtimeDirectory, options.inventoryPath); artifacts = await createCli4197Artifacts(options.evidenceParent);
    const resources: readonly FileHandle[] = [node.handle, runtime.directory, runtime.executable, ...artifacts.canaries];
    need(resources.length === 7 && new Set(resources.map(handle => handle.fd)).size === 7 && resources.every(handle => Number.isSafeInteger(handle.fd) && handle.fd >= 0));
    const roleIdentities: Record<string, { dev: string; ino: string }> = {};
    for (const [index, handle] of resources.entries()) { const info = await handle.stat({ bigint: true }); roleIdentities[String(index + 3)] = { dev: info.dev.toString(), ino: info.ino.toString() }; }
    const hostNamespaces = { user: "", mnt: "", pid: "", net: "", ipc: "", uts: "" };
    for (const name of CLI4197_NAMESPACE_NAMES) { hostNamespaces[name] = await readlink(`/proc/self/ns/${name}`); }
    const spec: Cli4197NamespaceSpec = { command: options.command, nodeSha256: launcher.commandSha256, hostNamespaces, roleIdentities };
    const bootstrap = cli4197MetadataBootstrap(spec); const args = cli4197MetadataSandboxArguments(bootstrap);
    const bootstrapSha256 = digest(Buffer.from(bootstrap)), sandboxArgumentsSha256 = digest(Buffer.from(JSON.stringify(args)));
    await artifacts.write("bootstrap.mjs", Buffer.from(bootstrap));
    await artifacts.write("launch-intent.json", json({ profile: "private.cli4197-developer-metadata-intent.v1", candidateVersion: PROFILE.version, command: options.command,
      inventorySha256: PROFILE.inventorySha256, bootstrapSha256, sandboxArgumentsSha256,
      roleIdentities, descriptorRoles: { "0": "devnull", "1": "bounded-bootstrap-report", "2": "bounded-bootstrap-errors", "3": "reviewed-node", "4": "verified-runtime-directory", "5": "pinned-candidate-elf", "6..9": "unique-empty-private-canaries", "10": "reviewed-bubblewrap" },
      hostNamespaces, editorOpenAuthorized: false, apiInvocationAuthorized: false, networkAuthorized: false, runtimeAdmitted: false }));
    await Promise.all([node.assertCurrent(), sandbox.assertCurrent(), sanitizer.assertCurrent(), runtime.assertCurrent()]);
    const child = spawn(sanitizer.executionPath, [String(process.pid), "/proc/self/fd/10", ...args], { cwd: "/", env: { LANG: "C.UTF-8", LC_ALL: "C.UTF-8", PATH: "/usr/bin:/bin" }, shell: false,
      stdio: ["ignore", "pipe", "pipe", ...resources.map(handle => handle.fd), sandbox.descriptor] });
    original = observeCli4197MetadataChild(child); const observed = await original;
    await artifacts.write("bootstrap-stdout.bin", observed.stdout); await artifacts.write("bootstrap-stderr.bin", observed.stderr);
    need(observed.exitObserved && !observed.spawnFailed && !observed.errorSeen && !observed.stdoutOverflow && !observed.stderrOverflow && !observed.invalidChunk && observed.signal === null && observed.stderr.length === 0);
    const decoded = decodeCli4197MetadataReport(observed.stdout, options.command);
    await artifacts.write("namespace-report.json", observed.stdout);
    if (decoded.stdout !== null) { await artifacts.write("vendor-stdout.bin", decoded.stdout); }
    if (decoded.stderr !== null) { await artifacts.write("vendor-stderr.bin", decoded.stderr); }
    await Promise.all([node.assertCurrent(), sandbox.assertCurrent(), sanitizer.assertCurrent(), runtime.assertCurrent()]);
    need(CLI4197_NAMESPACE_NAMES.every(name => decoded.report.namespaces[name] !== hostNamespaces[name]));
    need(observed.exitCode === 0 && decoded.report.reason === "completed" && decoded.report.vendorExitCode === 0 && decoded.stdout !== null);
    if (decoded.stdout === null) { throw new Error("CLI4197_METADATA_OUTPUT_REQUIRED"); } verifyCli4197MetadataOutput(options.command, decoded.stdout);
    const result = Object.freeze({ profile: "private.cli4197-developer-metadata-probe.v1" as const, artifactDirectory: artifacts.directory, command: options.command, metadataCaptured: true as const, runtimeAdmitted: false as const });
    await artifacts.write("closed-result.json", json({ ...result, originalChildExitObserved: true, originalChildStdioClosed: true, namespaceDescendantsClosedByOriginalPid1Exit: true,
      hostSignalIssued: false, editorOpenAuthorized: false, apiInvocationAuthorized: false, networkAuthorized: false })); return result;
  } catch (caughtError) {
    const observed = original === null ? null : await original;
    if (artifacts !== null) { await artifacts.write("closed-failure.json", json(cli4197MetadataClosedFailure(options.command, observed))); }
    throw caughtError;
  } finally {
    if (original !== null) { await original; }
    const closed = await Promise.allSettled([runtime?.dispose(), artifacts?.dispose(), node?.dispose(), sandbox?.dispose(), sanitizer?.dispose()]); need(closed.every(value => value.status === "fulfilled"));
  }
}
