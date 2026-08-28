import { createHash } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import type { Stats } from "node:fs";
import { lstat, open } from "node:fs/promises";
import { createRequire, isBuiltin, registerHooks } from "node:module";
import type {
  LoadFnOutput,
  ResolveFnOutput,
} from "node:module";
import { dirname, extname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { parse } from "acorn";
import type { AnyNode, CallExpression, Program } from "acorn";
import { z } from "zod";

import type { UpstreamLauncherFingerprint } from "./core.ts";
import type { PathSeal } from "./upstream-trust.ts";

type ModuleLoadMode = "import" | "require";
type SupportedModuleFormat = "commonjs" | "json" | "module";
type SupportedResolvedFormat = SupportedModuleFormat | "builtin";

interface ModuleDependency {
  readonly loadsTarget: boolean;
  readonly mode: ModuleLoadMode;
  readonly specifier: string;
}

interface CapturedModule {
  readonly bytes: Buffer;
  readonly executionSha256: string;
  readonly format: SupportedModuleFormat;
  readonly path: string;
  readonly sourceSha256: string;
  readonly transform: "easyeda-pro-control.disable-pino-worker.v1" | "none";
  readonly url: string;
}

interface CapturedResolution {
  readonly format: SupportedResolvedFormat | null;
  readonly loadsTarget: boolean;
  readonly mode: ModuleLoadMode;
  readonly parentUrl: string;
  readonly resolvedUrl: string | null;
  readonly specifier: string;
}

export interface CapturedUpstreamModuleGraph {
  readonly cwd: string;
  readonly entrypointUrl: string;
  readonly fingerprint: UpstreamLauncherFingerprint["moduleGraph"];
  readonly modules: ReadonlyMap<string, CapturedModule>;
  readonly resolutions: ReadonlyMap<string, CapturedResolution>;
  readonly seals: readonly PathSeal[];
}

export interface ActiveCapturedUpstreamExecution {
  readonly deregister: () => void;
}

interface ResolutionQueueItem {
  readonly format: SupportedModuleFormat;
  readonly path: string;
}

interface ResolutionProbe {
  readonly parentUrl: string;
  readonly probeSpecifier: string;
  readonly specifier: string;
}

interface ResolvedDependency {
  readonly format: SupportedResolvedFormat | null;
  readonly url: string | null;
}

interface GraphCaptureState {
  readonly capturedSeals: Map<string, PathSeal>;
  readonly cwd: string;
  readonly esmResolver: EsmResolutionAuthority;
  readonly modules: Map<string, CapturedModule>;
  readonly packageTypeCache: Map<string, SupportedModuleFormat>;
  readonly queue: ResolutionQueueItem[];
  readonly resolutions: Map<string, CapturedResolution>;
  readonly seals: Map<string, PathSeal>;
}

const MODULE_GRAPH_SCHEMA = "easyeda-pro-control.module-graph.v1";
const SUPPORTED_SOURCE_EXTENSIONS = new Set([".cjs", ".js", ".json", ".mjs"]);
const PINO_WORKER_OPTION = `        ...(config.NODE_ENV !== 'production'
            ? { transport: { target: 'pino/file', options: { destination: 2 } } }
            : {}),
`;
const PINO_WORKER_TRANSFORM =
  "easyeda-pro-control.disable-pino-worker.v1";
const SERIALIZED_GRAPH_SCHEMA =
  "easyeda-pro-control.serialized-module-graph.v1";
export const MAXIMUM_SERIALIZED_GRAPH_BYTES = 16 * 1024 * 1024;
const sha256Schema = z.string().regex(/^[a-f0-9]{64}$/u);
const moduleGraphFingerprintSchema = z.strictObject({
  edgeCount: z.number().int().nonnegative(),
  moduleCount: z.number().int().positive(),
  schema: z.literal(MODULE_GRAPH_SCHEMA),
  sha256: sha256Schema,
  totalBytes: z.number().int().positive(),
});
const serializedModuleSchema = z.strictObject({
  bytesBase64: z.string().min(1).max(MAXIMUM_SERIALIZED_GRAPH_BYTES),
  executionSha256: sha256Schema,
  format: z.enum(["commonjs", "json", "module"]),
  sourceSha256: sha256Schema,
  transform: z.enum([PINO_WORKER_TRANSFORM, "none"]),
  url: z.string().min(1).max(8192),
});
const serializedResolutionSchema = z.strictObject({
  format: z.enum(["builtin", "commonjs", "json", "module"]).nullable(),
  loadsTarget: z.boolean(),
  mode: z.enum(["import", "require"]),
  parentUrl: z.string().min(1).max(8192),
  resolvedUrl: z.string().min(1).max(8192).nullable(),
  specifier: z.string().min(1).max(8192),
});
const serializedGraphSchema = z.strictObject({
  cwd: z.string().min(1).max(8192),
  entrypointUrl: z.string().min(1).max(8192),
  fingerprint: moduleGraphFingerprintSchema,
  modules: z.array(serializedModuleSchema).min(1).max(5000),
  resolutions: z.array(serializedResolutionSchema).max(20_000),
  schema: z.literal(SERIALIZED_GRAPH_SCHEMA),
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function errorCode(value: unknown): string | undefined {
  return isRecord(value) && typeof value["code"] === "string"
    ? value["code"]
    : undefined;
}

function isAstNode(value: unknown): value is AnyNode {
  return isRecord(value) && typeof value["type"] === "string";
}

function stringLiteral(value: unknown): string | undefined {
  if (!isRecord(value) || value["type"] !== "Literal") {
    return undefined;
  }
  return typeof value["value"] === "string" ? value["value"] : undefined;
}

function staticCallSpecifier(
  node: CallExpression,
): string | undefined {
  const first: unknown = node.arguments[0];
  const specifier = stringLiteral(first);
  return specifier !== undefined && node.arguments.length === 1
    ? specifier
    : undefined;
}

function isIdentifier(value: unknown, name: string): boolean {
  return (
    isRecord(value) && value["type"] === "Identifier" && value["name"] === name
  );
}

function isMemberCall(
  callee: unknown,
  objectName: string,
  propertyName: string,
): boolean {
  return (
    isRecord(callee) &&
    callee["type"] === "MemberExpression" &&
    callee["computed"] === false &&
    isIdentifier(callee["object"], objectName) &&
    isIdentifier(callee["property"], propertyName)
  );
}

function dependenciesFor(
  format: SupportedModuleFormat,
  source: string,
): readonly ModuleDependency[] {
  if (format === "json") {
    return [];
  }
  const program: Program = parse(source, {
    allowHashBang: true,
    ecmaVersion: "latest",
    sourceType: format === "module" ? "module" : "script",
  });
  const dependencies: ModuleDependency[] = [];
  function visitValue(value: unknown): void {
    if (isAstNode(value)) {
      visit(value);
    } else if (Array.isArray(value)) {
      for (const child of value) {
        if (isAstNode(child)) {
          visit(child);
        }
      }
    }
  }
  function visit(node: AnyNode): void {
    if (
      node.type === "ImportDeclaration" ||
      node.type === "ExportAllDeclaration" ||
      node.type === "ExportNamedDeclaration"
    ) {
      const specifier = stringLiteral(node.source);
      if (specifier !== undefined) {
        dependencies.push({ loadsTarget: true, mode: "import", specifier });
      }
    } else if (node.type === "ImportExpression") {
      const specifier = stringLiteral(node.source);
      if (specifier !== undefined) {
        dependencies.push({ loadsTarget: true, mode: "import", specifier });
      }
    } else if (node.type === "CallExpression") {
      const callee = node.callee;
      if (isIdentifier(callee, "require")) {
        const specifier = staticCallSpecifier(node);
        if (specifier !== undefined) {
          dependencies.push({ loadsTarget: true, mode: "require", specifier });
        }
      } else if (isMemberCall(callee, "require", "resolve")) {
        // Require.resolve() is resolution-only. Pin the edge so a later call is
        // Deterministic without treating a non-module asset as executable.
        const specifier = staticCallSpecifier(node);
        if (specifier !== undefined) {
          dependencies.push({ loadsTarget: false, mode: "require", specifier });
        }
      } else if (isMemberCall(callee, "module", "require")) {
        const specifier = staticCallSpecifier(node);
        if (specifier !== undefined) {
          dependencies.push({ loadsTarget: true, mode: "require", specifier });
        }
      }
    }
    for (const key of Object.keys(node)) {
      if (key !== "loc" && key !== "range" && key !== "start" && key !== "end") {
        const value: unknown = Reflect.get(node, key);
        visitValue(value);
      }
    }
  }
  visit(program);
  const unique = new Map<string, ModuleDependency>();
  for (const dependency of dependencies) {
    unique.set(`${dependency.mode}\0${dependency.specifier}`, dependency);
  }
  return [...unique.values()].toSorted((left, right) => {
    const modeOrder = left.mode.localeCompare(right.mode);
    return modeOrder === 0
      ? left.specifier.localeCompare(right.specifier)
      : modeOrder;
  });
}

function sameSeal(info: Awaited<ReturnType<Awaited<ReturnType<typeof open>>["stat"]>>, seal: PathSeal): boolean {
  return (
    info.isFile() &&
    info.dev === seal.dev &&
    info.ino === seal.ino &&
    info.mode === seal.mode &&
    info.size === seal.size &&
    info.mtimeMs === seal.mtimeMs &&
    info.ctimeMs === seal.ctimeMs
  );
}

function assertTrustedModulePath(path: string, info: Stats): void {
  const permissions = info.mode % 512;
  const groupDigit = Math.floor(permissions / 8) % 8;
  const otherDigit = permissions % 8;
  if (info.isSymbolicLink() || !info.isFile()) {
    throw new Error(`Upstream module must be a regular non-symlink file: ${path}`);
  }
  if (
    typeof process.getuid === "function" &&
    info.uid !== process.getuid()
  ) {
    throw new Error(`Upstream module is owned by another user: ${path}`);
  }
  if (
    groupDigit === 2 ||
    groupDigit === 3 ||
    groupDigit === 6 ||
    groupDigit === 7 ||
    otherDigit === 2 ||
    otherDigit === 3 ||
    otherDigit === 6 ||
    otherDigit === 7
  ) {
    throw new Error(`Upstream module is group- or other-writable: ${path}`);
  }
}

async function readSealedFile(
  path: string,
  seals: Map<string, PathSeal>,
  capturedSeals?: Map<string, PathSeal>,
): Promise<{ readonly bytes: Buffer; readonly sha256: string }> {
  let seal = seals.get(path);
  if (seal === undefined) {
    const info = await lstat(path);
    assertTrustedModulePath(path, info);
    seal = {
      ctimeMs: info.ctimeMs,
      dev: info.dev,
      ino: info.ino,
      kind: "file",
      mode: info.mode,
      mtimeMs: info.mtimeMs,
      path,
      size: info.size,
    };
    seals.set(path, seal);
  }
  if (seal.kind !== "file") {
    throw new Error(`Resolved upstream module is not a sealed file: ${path}`);
  }
  const handle = await open(path, fsConstants.O_RDONLY + fsConstants.O_NOFOLLOW);
  try {
    const opened = await handle.stat();
    if (!sameSeal(opened, seal)) {
      throw new Error(`Reviewed upstream module changed before descriptor open: ${path}`);
    }
    const bytes = await handle.readFile();
    const after = await handle.stat();
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    if (
      !sameSeal(after, seal) ||
      (seal.sha256 !== undefined && sha256 !== seal.sha256)
    ) {
      throw new Error(`Reviewed upstream module changed during descriptor capture: ${path}`);
    }
    if (seal.sha256 === undefined) {
      seal = { ...seal, sha256 };
      seals.set(path, seal);
    }
    capturedSeals?.set(path, seal);
    return { bytes, sha256 };
  } finally {
    await handle.close();
  }
}

async function readSealedFileIfPresent(
  path: string,
  seals: Map<string, PathSeal>,
  capturedSeals: Map<string, PathSeal>,
): Promise<{ readonly bytes: Buffer; readonly sha256: string } | undefined> {
  try {
    return await readSealedFile(path, seals, capturedSeals);
  } catch (error) {
    if (errorCode(error) === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}

function isWithin(root: string, candidate: string): boolean {
  const child = relative(root, candidate);
  return (
    child.length === 0 ||
    (child !== ".." &&
      !child.startsWith(`..${sep}`) &&
      !isAbsolute(child))
  );
}

function canonicalFileUrlPath(url: string, label: string): string {
  if (url.includes("\0")) {
    throw new Error(`${label} contains a NUL byte.`);
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch (error) {
    throw new Error(`${label} is not a valid URL.`, { cause: error });
  }
  if (
    parsed.protocol !== "file:" ||
    parsed.search.length > 0 ||
    parsed.hash.length > 0
  ) {
    throw new Error(`${label} must be an exact file URL without a query or fragment.`);
  }
  let path: string;
  try {
    path = fileURLToPath(parsed);
  } catch (error) {
    throw new Error(`${label} is not a canonical local file URL.`, {
      cause: error,
    });
  }
  if (path.includes("\0") || pathToFileURL(path).href !== url) {
    throw new Error(`${label} is not a canonical local file URL.`);
  }
  return path;
}

function normalizedBuiltin(specifier: string): string | undefined {
  if (!isBuiltin(specifier)) {
    return undefined;
  }
  return specifier.startsWith("node:") ? specifier : `node:${specifier}`;
}

function supportedResolvedFormat(
  format: string | null | undefined,
  path: string,
): SupportedModuleFormat | undefined {
  if (format === "commonjs" || format === "json" || format === "module") {
    return format;
  }
  const extension = extname(path).toLowerCase();
  if (extension === ".mjs") {
    return "module";
  }
  if (extension === ".cjs") {
    return "commonjs";
  }
  if (extension === ".json") {
    return "json";
  }
  return undefined;
}

async function packageTypeFor(
  path: string,
  cwd: string,
  seals: Map<string, PathSeal>,
  capturedSeals: Map<string, PathSeal>,
  cache: Map<string, SupportedModuleFormat>,
): Promise<SupportedModuleFormat> {
  const cached = cache.get(path);
  if (cached !== undefined) {
    return cached;
  }
  const extension = extname(path).toLowerCase();
  const fixed = supportedResolvedFormat(undefined, path);
  if (fixed !== undefined) {
    cache.set(path, fixed);
    return fixed;
  }
  if (extension !== ".js") {
    throw new Error(`Unsupported executable upstream module extension: ${path}`);
  }
  let directory = dirname(path);
  while (isWithin(cwd, directory)) {
    const packagePath = resolve(directory, "package.json");
    const captured = await readSealedFileIfPresent(
      packagePath,
      seals,
      capturedSeals,
    );
    if (captured !== undefined) {
      const parsed: unknown = JSON.parse(captured.bytes.toString("utf8"));
      const format =
        isRecord(parsed) && parsed["type"] === "module" ? "module" : "commonjs";
      cache.set(path, format);
      return format;
    }
    if (directory === cwd) {
      break;
    }
    directory = dirname(directory);
  }
  cache.set(path, "commonjs");
  return "commonjs";
}

function resolutionKey(
  parentUrl: string,
  specifier: string,
  mode: ModuleLoadMode,
): string {
  return `${mode}\0${parentUrl}\0${specifier}`;
}

function executionSourceFor(
  cwd: string,
  path: string,
  source: Buffer,
): {
  readonly bytes: Buffer;
  readonly executionSha256: string;
  readonly transform: CapturedModule["transform"];
} {
  const relativePath = relative(cwd, path).split(sep).join("/");
  let bytes = source;
  let transform: CapturedModule["transform"] = "none";
  if (relativePath === "dist/utils/logger.js") {
    const text = source.toString("utf8");
    const first = text.indexOf(PINO_WORKER_OPTION);
    if (first === -1 || first !== text.lastIndexOf(PINO_WORKER_OPTION)) {
      throw new Error(
        "The reviewed upstream logger no longer has its exact worker-transport option; refusing an unreviewed execution transform.",
      );
    }
    bytes = Buffer.from(text.replace(PINO_WORKER_OPTION, ""), "utf8");
    transform = PINO_WORKER_TRANSFORM;
  }
  return {
    bytes,
    executionSha256: createHash("sha256").update(bytes).digest("hex"),
    transform,
  };
}

class EsmResolutionAuthority {
  private counter = 0;
  private pending: ResolutionProbe | undefined;
  private resolved: ResolveFnOutput | undefined;
  private readonly hooks = registerHooks({
    resolve: (specifier, context, nextResolve): ResolveFnOutput => {
      const pending = this.pending;
      if (pending === undefined || specifier !== pending.probeSpecifier) {
        return nextResolve(specifier, context);
      }
      this.resolved = nextResolve(pending.specifier, {
        ...context,
        parentURL: pending.parentUrl,
      });
      return {
        format: "module",
        shortCircuit: true,
        url: pending.probeSpecifier,
      };
    },
  });

  public async resolve(
    specifier: string,
    parentUrl: string,
  ): Promise<ResolveFnOutput> {
    if (this.pending !== undefined) {
      throw new Error("Upstream ESM resolution probes must remain serialized.");
    }
    this.counter += 1;
    const probeSpecifier = `data:text/javascript,export{}#easyeda-pro-control-resolution-${String(this.counter)}`;
    this.pending = { parentUrl, probeSpecifier, specifier };
    this.resolved = undefined;
    try {
      await import(probeSpecifier);
      if (this.resolved === undefined) {
        throw new Error("Node did not return an ESM resolution result.");
      }
      return this.resolved;
    } finally {
      this.pending = undefined;
      this.resolved = undefined;
    }
  }

  public dispose(): void {
    this.hooks.deregister();
  }
}

async function resolveImportedDependency(
  dependency: ModuleDependency,
  parentUrl: string,
  state: GraphCaptureState,
): Promise<ResolvedDependency> {
  let result: ResolveFnOutput;
  try {
    result = await state.esmResolver.resolve(dependency.specifier, parentUrl);
  } catch (error) {
    if (errorCode(error) === "ERR_MODULE_NOT_FOUND") {
      return { format: null, url: null };
    }
    throw error;
  }
  if (!result.url.startsWith("file:")) {
    throw new Error(
      `Reachable upstream import resolved to an unsupported URL: ${result.url}`,
    );
  }
  const resolvedPath = fileURLToPath(result.url);
  const derivedFormat = await packageTypeFor(
    resolvedPath,
    state.cwd,
    state.seals,
    state.capturedSeals,
    state.packageTypeCache,
  );
  const reportedFormat = supportedResolvedFormat(result.format, resolvedPath);
  if (reportedFormat !== undefined && reportedFormat !== derivedFormat) {
    throw new Error(
      `Node reported inconsistent format for reviewed module: ${resolvedPath}`,
    );
  }
  return { format: derivedFormat, url: result.url };
}

async function resolveRequiredDependency(
  dependency: ModuleDependency,
  parentUrl: string,
  state: GraphCaptureState,
): Promise<ResolvedDependency> {
  let resolved: string;
  try {
    resolved = createRequire(parentUrl).resolve(dependency.specifier);
  } catch (error) {
    if (errorCode(error) === "MODULE_NOT_FOUND") {
      return { format: null, url: null };
    }
    throw error;
  }
  const builtin = normalizedBuiltin(resolved);
  if (builtin !== undefined) {
    return { format: "builtin", url: builtin };
  }
  const resolvedPath = resolve(resolved);
  if (!dependency.loadsTarget) {
    return {
      format: null,
      url: pathToFileURL(resolvedPath).href,
    };
  }
  return {
    format: await packageTypeFor(
      resolvedPath,
      state.cwd,
      state.seals,
      state.capturedSeals,
      state.packageTypeCache,
    ),
    url: pathToFileURL(resolvedPath).href,
  };
}

function resolveDependency(
  dependency: ModuleDependency,
  parentUrl: string,
  state: GraphCaptureState,
): Promise<ResolvedDependency> {
  const builtin = normalizedBuiltin(dependency.specifier);
  if (builtin !== undefined) {
    return Promise.resolve({ format: "builtin", url: builtin });
  }
  return dependency.mode === "import"
    ? resolveImportedDependency(dependency, parentUrl, state)
    : resolveRequiredDependency(dependency, parentUrl, state);
}

function enqueueResolvedModule(
  resolved: ResolvedDependency,
  state: GraphCaptureState,
): void {
  if (
    resolved.format === "builtin" ||
    resolved.format === null ||
    resolved.url === null
  ) {
    return;
  }
  const resolvedPath = fileURLToPath(resolved.url);
  if (!isWithin(state.cwd, resolvedPath)) {
    throw new Error(
      `Reachable upstream module escapes its reviewed cwd: ${resolvedPath}`,
    );
  }
  state.queue.push({ format: resolved.format, path: resolvedPath });
}

async function captureReachableModule(
  current: ResolutionQueueItem,
  state: GraphCaptureState,
): Promise<void> {
  const currentUrl = pathToFileURL(current.path).href;
  if (state.modules.has(currentUrl)) {
    return;
  }
  if (!SUPPORTED_SOURCE_EXTENSIONS.has(extname(current.path).toLowerCase())) {
    throw new Error(
      `Reachable upstream graph contains an unsupported executable type: ${current.path}`,
    );
  }
  const captured = await readSealedFile(
    current.path,
    state.seals,
    state.capturedSeals,
  );
  const execution = executionSourceFor(
    state.cwd,
    current.path,
    captured.bytes,
  );
  state.modules.set(currentUrl, {
    bytes: execution.bytes,
    executionSha256: execution.executionSha256,
    format: current.format,
    path: current.path,
    sourceSha256: captured.sha256,
    transform: execution.transform,
    url: currentUrl,
  });
  const dependencies = dependenciesFor(
    current.format,
    execution.bytes.toString("utf8"),
  );
  for (const dependency of dependencies) {
    const key = resolutionKey(currentUrl, dependency.specifier, dependency.mode);
    if (!state.resolutions.has(key)) {
      const resolved = await resolveDependency(dependency, currentUrl, state);
      state.resolutions.set(key, {
        format: resolved.format,
        loadsTarget: dependency.loadsTarget,
        mode: dependency.mode,
        parentUrl: currentUrl,
        resolvedUrl: resolved.url,
        specifier: dependency.specifier,
      });
      if (dependency.loadsTarget) {
        enqueueResolvedModule(resolved, state);
      }
    }
  }
}

function relativeGraphPath(cwd: string, url: string): string {
  if (url.startsWith("node:")) {
    return url;
  }
  const path = fileURLToPath(url);
  if (!isWithin(cwd, path)) {
    throw new Error(`Resolved upstream graph path escapes its cwd: ${path}`);
  }
  return relative(cwd, path).split(sep).join("/");
}

function graphFingerprint(
  cwd: string,
  entrypointUrl: string,
  modules: ReadonlyMap<string, CapturedModule>,
  resolutions: ReadonlyMap<string, CapturedResolution>,
): UpstreamLauncherFingerprint["moduleGraph"] {
  const moduleRows = [...modules.values()]
    .map((module) => ({
      bytes: module.bytes.length,
      executionSha256: module.executionSha256,
      format: module.format,
      path: relativeGraphPath(cwd, module.url),
      sourceSha256: module.sourceSha256,
      transform: module.transform,
    }))
    .toSorted((left, right) => left.path.localeCompare(right.path));
  const edgeRows = [...resolutions.values()]
    .map((edge) => ({
      format: edge.format,
      loadsTarget: edge.loadsTarget,
      mode: edge.mode,
      parent: relativeGraphPath(cwd, edge.parentUrl),
      resolved:
        edge.resolvedUrl === null
          ? "<unresolved>"
          : relativeGraphPath(cwd, edge.resolvedUrl),
      specifier: edge.specifier,
    }))
    .toSorted((left, right) => {
      const parentOrder = left.parent.localeCompare(right.parent);
      if (parentOrder !== 0) {
        return parentOrder;
      }
      const modeOrder = left.mode.localeCompare(right.mode);
      return modeOrder === 0
        ? left.specifier.localeCompare(right.specifier)
        : modeOrder;
    });
  const projection = {
    schema: MODULE_GRAPH_SCHEMA,
    entrypoint: relativeGraphPath(cwd, entrypointUrl),
    modules: moduleRows,
    edges: edgeRows,
  };
  return {
    schema: MODULE_GRAPH_SCHEMA,
    moduleCount: moduleRows.length,
    edgeCount: edgeRows.length,
    totalBytes: moduleRows.reduce((total, module) => total + module.bytes, 0),
    sha256: createHash("sha256")
      .update(JSON.stringify(projection))
      .digest("hex"),
  };
}

export async function captureUpstreamModuleGraph(
  cwd: string,
  entrypoint: string,
  pathSeals: readonly PathSeal[] = [],
): Promise<CapturedUpstreamModuleGraph> {
  const seals = new Map(
    pathSeals.map((seal) => [seal.path, seal] as const),
  );
  const packageTypeCache = new Map<string, SupportedModuleFormat>();
  const capturedSeals = new Map<string, PathSeal>();
  const entrypointPath = resolve(entrypoint);
  const entrypointFormat = await packageTypeFor(
    entrypointPath,
    cwd,
    seals,
    capturedSeals,
    packageTypeCache,
  );
  if (entrypointFormat !== "module") {
    throw new Error("The reviewed upstream entrypoint must be an ESM module.");
  }
  const entrypointUrl = pathToFileURL(entrypointPath).href;
  const queue: ResolutionQueueItem[] = [
    { format: entrypointFormat, path: entrypointPath },
  ];
  const modules = new Map<string, CapturedModule>();
  const resolutions = new Map<string, CapturedResolution>();
  const esmResolver = new EsmResolutionAuthority();
  const state: GraphCaptureState = {
    capturedSeals,
    cwd,
    esmResolver,
    modules,
    packageTypeCache,
    queue,
    resolutions,
    seals,
  };
  try {
    while (queue.length > 0) {
      const current = queue.shift();
      if (current !== undefined) {
        await captureReachableModule(current, state);
      }
    }
  } finally {
    esmResolver.dispose();
  }
  return {
    cwd,
    entrypointUrl,
    fingerprint: graphFingerprint(cwd, entrypointUrl, modules, resolutions),
    modules,
    resolutions,
    seals: [...capturedSeals.values()].toSorted((left, right) =>
      left.path.localeCompare(right.path),
    ),
  };
}

export function serializeCapturedUpstreamModuleGraph(
  graph: CapturedUpstreamModuleGraph,
): Buffer {
  const payload = {
    cwd: graph.cwd,
    entrypointUrl: graph.entrypointUrl,
    fingerprint: graph.fingerprint,
    modules: [...graph.modules.values()]
      .map((module) => ({
        bytesBase64: module.bytes.toString("base64"),
        executionSha256: module.executionSha256,
        format: module.format,
        sourceSha256: module.sourceSha256,
        transform: module.transform,
        url: module.url,
      }))
      .toSorted((left, right) => left.url.localeCompare(right.url)),
    resolutions: [...graph.resolutions.values()]
      .toSorted((left, right) => {
        const parentOrder = left.parentUrl.localeCompare(right.parentUrl);
        if (parentOrder !== 0) {
          return parentOrder;
        }
        const modeOrder = left.mode.localeCompare(right.mode);
        return modeOrder === 0
          ? left.specifier.localeCompare(right.specifier)
          : modeOrder;
      }),
    schema: SERIALIZED_GRAPH_SCHEMA,
  };
  const bytes = Buffer.from(JSON.stringify(payload), "utf8");
  if (bytes.length > MAXIMUM_SERIALIZED_GRAPH_BYTES) {
    throw new Error("Captured upstream module graph exceeds its transfer limit.");
  }
  return bytes;
}

function assertSerializedResolution(
  edge: CapturedResolution,
  modules: ReadonlyMap<string, CapturedModule>,
  cwd: string,
): void {
  if (edge.specifier.includes("\0")) {
    throw new Error("Serialized upstream graph has a NUL-bearing specifier.");
  }
  canonicalFileUrlPath(edge.parentUrl, "Serialized edge parent URL");
  if (!modules.has(edge.parentUrl)) {
    throw new Error("Serialized upstream graph has an unknown edge parent.");
  }
  if (edge.resolvedUrl === null) {
    if (edge.format !== null) {
      throw new Error("Unresolved upstream graph edge has a module format.");
    }
    return;
  }
  if (edge.format === "builtin") {
    if (normalizedBuiltin(edge.resolvedUrl) !== edge.resolvedUrl) {
      throw new Error("Serialized builtin edge has a non-builtin URL.");
    }
    return;
  }
  if (edge.resolvedUrl.startsWith("node:")) {
    throw new Error("Serialized non-builtin edge has a builtin URL.");
  }
  const resolvedPath = canonicalFileUrlPath(
    edge.resolvedUrl,
    "Serialized edge resolved URL",
  );
  if (!isWithin(cwd, resolvedPath)) {
    throw new Error("Serialized upstream edge resolves outside its reviewed cwd.");
  }
  if (!edge.loadsTarget) {
    if (edge.format !== null) {
      throw new Error("Resolution-only upstream edge has a module format.");
    }
    return;
  }
  const resolvedModule = modules.get(edge.resolvedUrl);
  if (edge.format === null || resolvedModule === undefined) {
    throw new Error("Serialized executable edge has no captured module bytes.");
  }
  if (resolvedModule.format !== edge.format) {
    throw new Error("Serialized executable edge has an inconsistent format.");
  }
}

function sameModuleGraphFingerprint(
  left: UpstreamLauncherFingerprint["moduleGraph"],
  right: UpstreamLauncherFingerprint["moduleGraph"],
): boolean {
  return (
    left.schema === right.schema &&
    left.moduleCount === right.moduleCount &&
    left.edgeCount === right.edgeCount &&
    left.totalBytes === right.totalBytes &&
    left.sha256 === right.sha256
  );
}

export function deserializeCapturedUpstreamModuleGraph(
  serialized: Buffer,
  expected: UpstreamLauncherFingerprint["moduleGraph"],
): CapturedUpstreamModuleGraph {
  if (serialized.length === 0 || serialized.length > MAXIMUM_SERIALIZED_GRAPH_BYTES) {
    throw new Error("Serialized upstream module graph has an invalid byte length.");
  }
  const payload = serializedGraphSchema.parse(
    JSON.parse(serialized.toString("utf8")),
  );
  if (
    payload.cwd.includes("\0") ||
    !isAbsolute(payload.cwd) ||
    resolve(payload.cwd) !== payload.cwd
  ) {
    throw new Error("Serialized upstream graph cwd is not canonical and absolute.");
  }
  const cwd = payload.cwd;
  const modules = new Map<string, CapturedModule>();
  for (const record of payload.modules) {
    const path = canonicalFileUrlPath(
      record.url,
      "Serialized upstream module URL",
    );
    if (!isWithin(cwd, path)) {
      throw new Error("Serialized upstream module escapes its reviewed cwd.");
    }
    const bytes = Buffer.from(record.bytesBase64, "base64");
    if (
      bytes.toString("base64") !== record.bytesBase64 ||
      createHash("sha256").update(bytes).digest("hex") !==
        record.executionSha256
    ) {
      throw new Error("Serialized upstream module bytes failed their hash binding.");
    }
    if (modules.has(record.url)) {
      throw new Error("Serialized upstream graph repeats a module URL.");
    }
    const canonicalLoggerPath = resolve(cwd, "dist/utils/logger.js");
    if (
      (record.transform === "none" &&
        record.sourceSha256 !== record.executionSha256) ||
      (record.transform === PINO_WORKER_TRANSFORM &&
        (path !== canonicalLoggerPath ||
          record.sourceSha256 === record.executionSha256))
    ) {
      throw new Error("Serialized upstream module has an invalid execution transform binding.");
    }
    modules.set(record.url, {
      bytes,
      executionSha256: record.executionSha256,
      format: record.format,
      path,
      sourceSha256: record.sourceSha256,
      transform: record.transform,
      url: record.url,
    });
  }
  const resolutions = new Map<string, CapturedResolution>();
  for (const record of payload.resolutions) {
    const edge: CapturedResolution = { ...record };
    assertSerializedResolution(edge, modules, cwd);
    const key = resolutionKey(edge.parentUrl, edge.specifier, edge.mode);
    if (resolutions.has(key)) {
      throw new Error("Serialized upstream graph repeats a resolution edge.");
    }
    resolutions.set(key, edge);
  }
  const entrypointPath = canonicalFileUrlPath(
    payload.entrypointUrl,
    "Serialized upstream entrypoint URL",
  );
  if (!isWithin(cwd, entrypointPath)) {
    throw new Error("Serialized upstream graph entrypoint escapes its reviewed cwd.");
  }
  if (!modules.has(payload.entrypointUrl)) {
    throw new Error("Serialized upstream graph omits its entrypoint module.");
  }
  if (modules.get(payload.entrypointUrl)?.format !== "module") {
    throw new Error("Serialized upstream graph entrypoint is not an ESM module.");
  }
  if (
    modules.size !== payload.fingerprint.moduleCount ||
    resolutions.size !== payload.fingerprint.edgeCount
  ) {
    throw new Error("Serialized upstream graph counts are inconsistent.");
  }
  const fingerprint = graphFingerprint(
    cwd,
    payload.entrypointUrl,
    modules,
    resolutions,
  );
  if (
    !sameModuleGraphFingerprint(fingerprint, payload.fingerprint) ||
    !sameModuleGraphFingerprint(fingerprint, expected)
  ) {
    throw new Error(
      "Serialized upstream graph does not match its reviewed module-graph fingerprint.",
    );
  }
  const graph: CapturedUpstreamModuleGraph = {
    cwd,
    entrypointUrl: payload.entrypointUrl,
    fingerprint,
    modules,
    resolutions,
    seals: [],
  };
  if (!serializeCapturedUpstreamModuleGraph(graph).equals(serialized)) {
    throw new Error("Serialized upstream graph is not exact canonical JSON.");
  }
  return graph;
}

export async function executeCapturedUpstreamModuleGraph(
  graph: CapturedUpstreamModuleGraph,
  afterFinalSeal?: () => void | Promise<void>,
): Promise<ActiveCapturedUpstreamExecution> {
  let rootResolutionAvailable = true;
  const allowedBuiltins = new Set(
    [...graph.resolutions.values()]
      .filter((edge) => edge.format === "builtin")
      .flatMap((edge) =>
        edge.resolvedUrl === null ? [] : [edge.resolvedUrl],
      ),
  );
  const hooks = registerHooks({
    resolve: (specifier, context): ResolveFnOutput => {
      if (rootResolutionAvailable && specifier === graph.entrypointUrl) {
        rootResolutionAvailable = false;
        const entrypoint = graph.modules.get(graph.entrypointUrl);
        if (entrypoint === undefined) {
          throw new Error("Captured upstream graph has no entrypoint bytes.");
        }
        return {
          format: entrypoint.format,
          shortCircuit: true,
          url: graph.entrypointUrl,
        };
      }
      const parentUrl = context.parentURL;
      if (parentUrl === undefined) {
        throw new Error(`Unbound upstream module resolution was denied: ${specifier}`);
      }
      const mode: ModuleLoadMode = context.conditions.includes("require")
        ? "require"
        : "import";
      const edge = graph.resolutions.get(
        resolutionKey(parentUrl, specifier, mode),
      );
      if (edge === undefined) {
        throw new Error(
          `Unreviewed upstream ${mode} edge was denied: ${specifier} from ${parentUrl}`,
        );
      }
      if (edge.resolvedUrl === null) {
        const error = new Error(
          `Pinned upstream ${mode} edge is unresolved: ${specifier} from ${parentUrl}`,
        );
        Object.assign(error, {
          code: mode === "require" ? "MODULE_NOT_FOUND" : "ERR_MODULE_NOT_FOUND",
        });
        throw error;
      }
      return {
        format: edge.format,
        shortCircuit: true,
        url: edge.resolvedUrl,
      };
    },
    load: (url, context, nextLoad): LoadFnOutput => {
      if (url.startsWith("node:")) {
        if (!allowedBuiltins.has(url)) {
          throw new Error(`Unreviewed upstream builtin load was denied: ${url}`);
        }
        return nextLoad(url, context);
      }
      const module = graph.modules.get(url);
      if (module === undefined) {
        throw new Error(`Unreviewed upstream module load was denied: ${url}`);
      }
      return {
        format: module.format,
        shortCircuit: true,
        source: module.bytes,
      };
    },
  });
  try {
    await afterFinalSeal?.();
    await import(graph.entrypointUrl);
    return {
      deregister: (): void => {
        hooks.deregister();
      },
    };
  } catch (error) {
    hooks.deregister();
    throw error;
  }
}
