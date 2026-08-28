import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path';

export const CONTROL_VERSION = '0.2.0';
export const OPERATION_SCHEMA = 'easyeda-pro-control.operation.v2';

export async function controlImplementationFingerprint() {
  const currentPath = fileURLToPath(import.meta.url);
  const sourceDirectory = dirname(currentPath);
  const bundleMode = basename(currentPath) === 'server.mjs';
  const candidates = bundleMode
    ? [currentPath]
    : [
        'artifacts.mjs',
        'checkpoint.mjs',
        'core.mjs',
        'engine.mjs',
        'exact-readers.mjs',
        'index.mjs',
        'lease.mjs',
        'runtime-scripts.mjs',
        'upstream.mjs',
      ].map((name) => join(sourceDirectory, name));
  const files = [];
  for (const path of candidates) {
    const bytes = await readFile(path);
    files.push({
      path,
      relativePath: bundleMode ? basename(path) : relative(sourceDirectory, path),
      bytes: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex'),
    });
  }
  const composite = files
    .map((file) => `${file.relativePath}\0${file.bytes}\0${file.sha256}\n`)
    .join('');
  return {
    version: CONTROL_VERSION,
    operationSchema: OPERATION_SCHEMA,
    mode: bundleMode ? 'bundle' : 'source-tree',
    files,
    sha256: createHash('sha256').update(composite).digest('hex'),
  };
}

export function stable(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(stable);
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, stable(value[key])]),
  );
}

export function canonicalJson(value) {
  return JSON.stringify(stable(value));
}

export function sha256Text(value) {
  return createHash('sha256').update(String(value)).digest('hex');
}

export function sha256Json(value) {
  return sha256Text(canonicalJson(value));
}

export function newOperationId(now = new Date()) {
  const stamp = now
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z')
    .toLowerCase();
  return `easyeda-${stamp}-${randomUUID().slice(0, 8)}`;
}

function reportsExplicitFailure(value, depth = 0) {
  if (!isRecord(value) || depth > 6) return false;
  if (value.ok === false || value.success === false || value.not_available === true) return true;
  if (isRecord(value.read_consistency) && value.read_consistency.stable === false) return true;
  return Object.hasOwn(value, 'result') && reportsExplicitFailure(value.result, depth + 1);
}

export function normalizeToolResult(result) {
  const record = isRecord(result) ? result : {};
  const structured = isRecord(record.structuredContent) ? record.structuredContent : {};
  const hasEnvelope =
    isRecord(result) &&
    (isRecord(record.structuredContent) ||
      (Array.isArray(record.content) && record.content.length > 0));
  const failed =
    !hasEnvelope ||
    record.isError === true ||
    reportsExplicitFailure(structured);
  return {
    ok: !failed,
    isError: record.isError === true,
    structuredContent: record.structuredContent,
    content: Array.isArray(record.content) ? record.content : [],
    raw: result,
  };
}

export function extractToolPayload(result) {
  const normalized = normalizeToolResult(result);
  if (!normalized.ok) {
    const error = new Error('The upstream EasyEDA tool reported failure.');
    error.upstreamResult = result;
    throw error;
  }
  let value = normalized.structuredContent;
  if (value === undefined) {
    const text = normalized.content.find((item) => item?.type === 'text')?.text;
    if (typeof text === 'string') {
      try {
        value = JSON.parse(text);
      } catch {
        value = { text };
      }
    }
  }
  if (reportsExplicitFailure(value)) {
    const error = new Error('The upstream EasyEDA tool reported failure or unavailability.');
    error.upstreamResult = result;
    throw error;
  }
  for (let depth = 0; depth < 4; depth += 1) {
    if (!isRecord(value) || !Object.hasOwn(value, 'result')) break;
    const keys = Object.keys(value).filter((key) => !['ok', 'success', 'result'].includes(key));
    if (keys.length > 0) break;
    value = value.result;
  }
  return value;
}

export function classifyTool(tool) {
  const annotations = isRecord(tool?.annotations) ? tool.annotations : {};
  const schema = isRecord(tool?.inputSchema) ? tool.inputSchema : {};
  const properties = isRecord(schema.properties) ? schema.properties : {};
  const hasConfirmWrite = Object.hasOwn(properties, 'confirmWrite');
  const name = String(tool?.name ?? '');
  const pinnedReadException = name === 'easyeda_schematic_verify_write';
  const knownWriteName =
    !pinnedReadException &&
    /(^|_)(add|apply|begin_transaction|commit|create|delete|export|import|modify|move|place|recover|rollback|route|save|set|sync|update|write)(_|$)/i.test(name);
  const destructive = annotations.destructiveHint === true;
  const explicitlyReadOnly = annotations.readOnlyHint === true && !destructive && !hasConfirmWrite;
  return {
    readOnly: explicitlyReadOnly && !knownWriteName,
    write: destructive || hasConfirmWrite || knownWriteName,
    hasConfirmWrite,
    idempotent: annotations.idempotentHint === true,
  };
}

export function filterTools(tools, options = {}) {
  const query = String(options.query ?? '').trim().toLowerCase();
  const mode = options.mode ?? 'all';
  const limit = Math.max(1, Math.min(100, Number(options.limit ?? 30)));
  const includeSchemas = options.includeSchemas === true;
  return tools
    .filter((tool) => {
      const classification = classifyTool(tool);
      if (mode === 'read' && !classification.readOnly) return false;
      if (mode === 'write' && !classification.write) return false;
      if (!query) return true;
      const haystack = [tool.name, tool.title, tool.description].filter(Boolean).join(' ').toLowerCase();
      return query.split(/\s+/).every((term) => haystack.includes(term));
    })
    .slice(0, limit)
    .map((tool) => {
      const classification = classifyTool(tool);
      const compact = {
        name: tool.name,
        title: tool.title,
        description: tool.description,
        annotations: tool.annotations,
        classification,
      };
      if (includeSchemas) {
        compact.inputSchema = tool.inputSchema;
        compact.outputSchema = tool.outputSchema;
      }
      return compact;
    });
}

export function validateRawExecutionInput(input) {
  const hasCode =
    (input.source?.kind === 'inline' &&
      typeof input.source.code === 'string' &&
      input.source.code.length > 0) ||
    (input.source === undefined && typeof input.code === 'string' && input.code.length > 0);
  const hasPath =
    (input.source?.kind === 'file' &&
      typeof input.source.scriptPath === 'string' &&
      input.source.scriptPath.length > 0) ||
    (input.source === undefined &&
      typeof input.scriptPath === 'string' &&
      input.scriptPath.length > 0);
  if (hasCode === hasPath) throw new Error('Provide exactly one of code or scriptPath.');
  const timeoutMs = Number(input.timeoutMs ?? 15000);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 60000) {
    throw new Error('timeoutMs must be an integer from 1000 through 60000.');
  }
  if (input.confirmWrite !== true) {
    throw new Error('Unrestricted EasyEDA execution requires confirmWrite=true.');
  }
  if (!['read', 'mutate-unsaved', 'persist', 'native-ui'].includes(input.mode)) {
    throw new Error('mode must be read, mutate-unsaved, persist, or native-ui.');
  }
  if (typeof input.intent !== 'string' || input.intent.trim().length < 8) {
    throw new Error('intent must describe the bounded operation in at least 8 characters.');
  }
  if (input.acknowledgeUnrestrictedRaw !== true) {
    throw new Error(
      'Raw EasyEDA JavaScript is not sandboxed; acknowledgeUnrestrictedRaw must be exactly true.',
    );
  }
  if (input.unrestrictedConfirmation !== `UNRESTRICTED:${String(input.sourceSha256 ?? '').toLowerCase()}`) {
    throw new Error('unrestrictedConfirmation must exactly bind UNRESTRICTED: to sourceSha256.');
  }
  return { hasCode, hasPath, timeoutMs };
}

export function normalizeEasyedaProjectPath(value) {
  let text = String(value ?? '').trim();
  if (!text) throw new Error('EasyEDA project path is required.');
  if (/^file:\/\//i.test(text)) {
    try {
      text = decodeURIComponent(text.replace(/^file:\/+/i, '/'));
    } catch {
      throw new Error('EasyEDA project file URI contains invalid escaping.');
    }
  }
  text = text.replaceAll('\\', '/');
  const uriDrive = /^\/([a-zA-Z]):\/(.*)$/.exec(text);
  if (uriDrive) text = `${uriDrive[1]}:/${uriDrive[2]}`;
  const drive = /^([a-zA-Z]):\/(.*)$/.exec(text);
  if (drive) text = `/mnt/${drive[1].toLowerCase()}/${drive[2]}`;
  if (!isAbsolute(text)) {
    throw new Error('EasyEDA project path must be an absolute POSIX or Windows path.');
  }
  const normalized = resolve(text);
  if (!/\.eprj2$/i.test(normalized)) {
    throw new Error('EasyEDA project path must identify an .eprj2 database.');
  }
  return normalized;
}

export function validateEvidencePaths(evidence) {
  if (evidence === undefined) return undefined;
  if (!isRecord(evidence)) throw new Error('evidence must be an object.');
  const resultPath = String(evidence.resultPath ?? '');
  const receiptPath = String(evidence.receiptPath ?? '');
  if (!resultPath || !receiptPath) {
    throw new Error('evidence requires resultPath and receiptPath.');
  }
  if (!isAbsolute(resultPath) || !isAbsolute(receiptPath)) {
    throw new Error('Evidence paths must be absolute.');
  }
  const normalizedResult = resolve(resultPath);
  const normalizedReceipt = resolve(receiptPath);
  if (normalizedResult === normalizedReceipt) {
    throw new Error('Evidence result and receipt paths must be distinct.');
  }
  return { resultPath: normalizedResult, receiptPath: normalizedReceipt };
}

export function validateExpectedFingerprint(fingerprint) {
  if (!isRecord(fingerprint)) throw new Error('expectedFingerprint must be an object.');
  const required = [
    ['/facadeImplementation/version', fingerprint.facadeImplementation?.version, 'string'],
    [
      '/facadeImplementation/operationSchema',
      fingerprint.facadeImplementation?.operationSchema,
      'string',
    ],
    ['/facadeImplementation/mode', fingerprint.facadeImplementation?.mode, 'string'],
    ['/facadeImplementation/files', fingerprint.facadeImplementation?.files, 'nonempty-array'],
    ['/facadeImplementation/sha256', fingerprint.facadeImplementation?.sha256, 'sha256'],
    ['/upstreamServer/version', fingerprint.upstreamServer?.version, 'string'],
    ['/upstreamLauncher/command', fingerprint.upstreamLauncher?.command, 'string'],
    ['/upstreamLauncher/commandSha256', fingerprint.upstreamLauncher?.commandSha256, 'sha256'],
    ['/upstreamLauncher/args', fingerprint.upstreamLauncher?.args, 'nonempty-string-array'],
    ['/upstreamLauncher/cwd', fingerprint.upstreamLauncher?.cwd, 'string'],
    ['/upstreamLauncher/entrypoint', fingerprint.upstreamLauncher?.entrypoint, 'string'],
    [
      '/upstreamLauncher/entrypointSha256',
      fingerprint.upstreamLauncher?.entrypointSha256,
      'sha256',
    ],
    [
      '/upstreamLauncher/implementationTree/root',
      fingerprint.upstreamLauncher?.implementationTree?.root,
      'string',
    ],
    [
      '/upstreamLauncher/implementationTree/sha256',
      fingerprint.upstreamLauncher?.implementationTree?.sha256,
      'sha256',
    ],
    [
      '/upstreamLauncher/implementationTree/fileCount',
      fingerprint.upstreamLauncher?.implementationTree?.fileCount,
      'positive-integer',
    ],
    ['/upstreamLauncher/dependencyLock/type', fingerprint.upstreamLauncher?.dependencyLock?.type, 'string'],
    ['/upstreamLauncher/dependencyLock/path', fingerprint.upstreamLauncher?.dependencyLock?.path, 'string'],
    [
      '/upstreamLauncher/dependencyLock/sha256',
      fingerprint.upstreamLauncher?.dependencyLock?.sha256,
      'sha256',
    ],
    [
      '/upstreamImplementationDrift',
      fingerprint.upstreamImplementationDrift,
      'false',
    ],
    ['/toolCatalogSha256', fingerprint.toolCatalogSha256, 'sha256'],
    ['/toolCount', fingerprint.toolCount, 'positive-integer'],
    [
      '/reviewedCompatibilityManifest/path',
      fingerprint.reviewedCompatibilityManifest?.path,
      'string',
    ],
    [
      '/reviewedCompatibilityManifest/bytes',
      fingerprint.reviewedCompatibilityManifest?.bytes,
      'positive-integer',
    ],
    [
      '/reviewedCompatibilityManifest/sha256',
      fingerprint.reviewedCompatibilityManifest?.sha256,
      'sha256',
    ],
    [
      '/reviewedCompatibilityManifest/schema',
      fingerprint.reviewedCompatibilityManifest?.schema,
      'string',
    ],
    [
      '/reviewedCompatibilityManifest/reviewedAt',
      fingerprint.reviewedCompatibilityManifest?.reviewedAt,
      'string',
    ],
    ['/health/payload/version', fingerprint.health?.payload?.version, 'string'],
    ['/health/payload/node_version', fingerprint.health?.payload?.node_version, 'string'],
    ['/health/payload/bridge_connected', fingerprint.health?.payload?.bridge_connected, 'true'],
    ['/health/payload/easyeda_version', fingerprint.health?.payload?.easyeda_version, 'string'],
    ['/health/payload/extension_version', fingerprint.health?.payload?.extension_version, 'string'],
    [
      '/health/payload/extension_version_mismatch',
      fingerprint.health?.payload?.extension_version_mismatch,
      'false',
    ],
    ['/health/payload/registry_mismatch', fingerprint.health?.payload?.registry_mismatch, 'false'],
    ['/bridge/payload/connected', fingerprint.bridge?.payload?.connected, 'true'],
    ['/bridge/payload/bridge_version', fingerprint.bridge?.payload?.bridge_version, 'string'],
    ['/bridge/payload/easyeda_version', fingerprint.bridge?.payload?.easyeda_version, 'string'],
    [
      '/bridge/payload/diagnostics/method_registry_hash',
      fingerprint.bridge?.payload?.diagnostics?.method_registry_hash,
      'string',
    ],
    [
      '/bridgeDispatcher/payload/source',
      fingerprint.bridgeDispatcher?.payload?.source,
      'loader-status',
    ],
    [
      '/bridgeDispatcher/payload/dispatcher_build_id',
      fingerprint.bridgeDispatcher?.payload?.dispatcher_build_id,
      'string',
    ],
    [
      '/bridgeDispatcher/payload/total',
      fingerprint.bridgeDispatcher?.payload?.total,
      'positive-integer',
    ],
    ['/installedBundles/available', fingerprint.installedBundles?.available, 'true'],
    ['/installedBundles/assetsRoot', fingerprint.installedBundles?.assetsRoot, 'string'],
    [
      '/installedBundles/pcbEditor/version',
      fingerprint.installedBundles?.pcbEditor?.version,
      'string',
    ],
    [
      '/installedBundles/pcbEditor/implementationPath',
      fingerprint.installedBundles?.pcbEditor?.implementationPath,
      'string',
    ],
    [
      '/installedBundles/pcbEditor/implementationSha256',
      fingerprint.installedBundles?.pcbEditor?.implementationSha256,
      'sha256',
    ],
    [
      '/installedBundles/publicApi/version',
      fingerprint.installedBundles?.publicApi?.version,
      'string',
    ],
    [
      '/installedBundles/publicApi/implementationPath',
      fingerprint.installedBundles?.publicApi?.implementationPath,
      'string',
    ],
    [
      '/installedBundles/publicApi/implementationSha256',
      fingerprint.installedBundles?.publicApi?.implementationSha256,
      'sha256',
    ],
    [
      '/installedBundles/publicApi/adapterPath',
      fingerprint.installedBundles?.publicApi?.adapterPath,
      'string',
    ],
    [
      '/installedBundles/publicApi/adapterSha256',
      fingerprint.installedBundles?.publicApi?.adapterSha256,
      'sha256',
    ],
    [
      '/installedBundles/publicApi/declarationsPath',
      fingerprint.installedBundles?.publicApi?.declarationsPath,
      'string',
    ],
    [
      '/installedBundles/publicApi/declarationsSha256',
      fingerprint.installedBundles?.publicApi?.declarationsSha256,
      'sha256',
    ],
  ];
  const missing = required
    .filter(([_pointer, value, kind]) => {
      if (kind === 'string') return typeof value !== 'string' || value.length === 0;
      if (kind === 'sha256') return !/^[a-f0-9]{64}$/i.test(String(value ?? ''));
      if (kind === 'positive-integer') return !Number.isInteger(value) || value < 1;
      if (kind === 'nonempty-string-array') {
        return (
          !Array.isArray(value) ||
          value.length === 0 ||
          value.some((item) => typeof item !== 'string' || item.length === 0)
        );
      }
      if (kind === 'nonempty-array') return !Array.isArray(value) || value.length === 0;
      if (kind === 'loader-status') return value !== 'loader_status';
      if (kind === 'true') return value !== true;
      if (kind === 'false') return value !== false;
      return true;
    })
    .map(([pointer, _value, kind]) => ({ pointer, required: kind }));
  if (Array.isArray(fingerprint.facadeImplementation?.files)) {
    fingerprint.facadeImplementation.files.forEach((file, index) => {
      if (
        !isRecord(file) ||
        typeof file.path !== 'string' ||
        file.path.length === 0 ||
        typeof file.relativePath !== 'string' ||
        file.relativePath.length === 0 ||
        !Number.isInteger(file.bytes) ||
        file.bytes < 1 ||
        !/^[a-f0-9]{64}$/i.test(String(file.sha256 ?? ''))
      ) {
        missing.push({
          pointer: `/facadeImplementation/files/${index}`,
          required: 'exact implementation file fingerprint',
        });
      }
    });
  }
  if (missing.length > 0) {
    const error = new Error(
      'expectedFingerprint must pin a connected, non-mismatched EasyEDA runtime and method registry.',
    );
    error.missingFingerprintFields = missing;
    throw error;
  }
  return true;
}

const REVIEWED_COMPATIBILITY_SCHEMA = 'easyeda-pro-control.reviewed-compatibility.v1';

export function reviewedCompatibilityManifestPath() {
  return resolve(
    dirname(fileURLToPath(import.meta.url)),
    '..',
    '..',
    'reviewed-compatibility.json',
  );
}

function manifestObject(value, pointer, keys) {
  if (!isRecord(value)) throw new Error(`Reviewed compatibility manifest ${pointer} must be an object.`);
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (canonicalJson(actual) !== canonicalJson(expected)) {
    throw new Error(
      `Reviewed compatibility manifest ${pointer} has unexpected or missing keys: ${actual.join(', ')}.`,
    );
  }
  return value;
}

function manifestString(value, pointer) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Reviewed compatibility manifest ${pointer} must be a nonempty string.`);
  }
  return value;
}

function manifestSha256(value, pointer) {
  if (!/^[a-f0-9]{64}$/i.test(String(value ?? ''))) {
    throw new Error(`Reviewed compatibility manifest ${pointer} must be a SHA-256 digest.`);
  }
  return value;
}

function manifestPositiveInteger(value, pointer) {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`Reviewed compatibility manifest ${pointer} must be a positive integer.`);
  }
  return value;
}

function validateFacadeManifest(value, pointer) {
  manifestObject(value, pointer, [
    'version',
    'operationSchema',
    'sha256',
    'fileCount',
    'files',
  ]);
  manifestString(value.version, `${pointer}/version`);
  manifestString(value.operationSchema, `${pointer}/operationSchema`);
  manifestSha256(value.sha256, `${pointer}/sha256`);
  manifestPositiveInteger(value.fileCount, `${pointer}/fileCount`);
  if (!Array.isArray(value.files) || value.files.length !== value.fileCount) {
    throw new Error(`Reviewed compatibility manifest ${pointer}/files must match fileCount.`);
  }
  const relativePaths = [];
  value.files.forEach((file, index) => {
    const filePointer = `${pointer}/files/${index}`;
    manifestObject(file, filePointer, ['relativePath', 'bytes', 'sha256']);
    manifestString(file.relativePath, `${filePointer}/relativePath`);
    if (
      isAbsolute(file.relativePath) ||
      file.relativePath.includes('\\') ||
      file.relativePath.split('/').includes('..')
    ) {
      throw new Error(
        `Reviewed compatibility manifest ${filePointer}/relativePath must be a normalized relative path.`,
      );
    }
    manifestPositiveInteger(file.bytes, `${filePointer}/bytes`);
    manifestSha256(file.sha256, `${filePointer}/sha256`);
    relativePaths.push(file.relativePath);
  });
  if (
    new Set(relativePaths).size !== relativePaths.length ||
    canonicalJson(relativePaths) !== canonicalJson([...relativePaths].sort())
  ) {
    throw new Error(
      `Reviewed compatibility manifest ${pointer}/files must have unique sorted relative paths.`,
    );
  }
}

function validateReviewedCompatibilityManifest(value) {
  manifestObject(value, '/', [
    'schema',
    'reviewedAt',
    'facadeImplementation',
    'upstream',
    'connectedRuntime',
    'installedBundles',
  ]);
  if (value.schema !== REVIEWED_COMPATIBILITY_SCHEMA) {
    throw new Error(`Unsupported reviewed compatibility manifest schema ${String(value.schema)}.`);
  }
  manifestString(value.reviewedAt, '/reviewedAt');
  if (!Number.isFinite(Date.parse(value.reviewedAt))) {
    throw new Error('Reviewed compatibility manifest /reviewedAt must be an ISO date-time.');
  }

  manifestObject(value.facadeImplementation, '/facadeImplementation', [
    'source-tree',
    'bundle',
  ]);
  validateFacadeManifest(
    value.facadeImplementation['source-tree'],
    '/facadeImplementation/source-tree',
  );
  validateFacadeManifest(value.facadeImplementation.bundle, '/facadeImplementation/bundle');

  manifestObject(value.upstream, '/upstream', ['serverVersion', 'launcher', 'toolCatalog']);
  manifestString(value.upstream.serverVersion, '/upstream/serverVersion');
  const launcher = value.upstream.launcher;
  manifestObject(launcher, '/upstream/launcher', [
    'command',
    'commandSha256',
    'args',
    'entrypoint',
    'entrypointSha256',
    'implementationTree',
    'dependencyLock',
    'cwd',
  ]);
  for (const key of ['command', 'entrypoint', 'cwd']) {
    manifestString(launcher[key], `/upstream/launcher/${key}`);
    if (!isAbsolute(launcher[key])) {
      throw new Error(`Reviewed compatibility manifest /upstream/launcher/${key} must be absolute.`);
    }
  }
  manifestSha256(launcher.commandSha256, '/upstream/launcher/commandSha256');
  manifestSha256(launcher.entrypointSha256, '/upstream/launcher/entrypointSha256');
  if (
    !Array.isArray(launcher.args) ||
    launcher.args.length === 0 ||
    launcher.args.some((item) => typeof item !== 'string' || item.length === 0)
  ) {
    throw new Error('Reviewed compatibility manifest /upstream/launcher/args is malformed.');
  }
  manifestObject(launcher.implementationTree, '/upstream/launcher/implementationTree', [
    'root',
    'fileCount',
    'sha256',
  ]);
  manifestString(launcher.implementationTree.root, '/upstream/launcher/implementationTree/root');
  if (!isAbsolute(launcher.implementationTree.root)) {
    throw new Error('Reviewed compatibility manifest implementation-tree root must be absolute.');
  }
  manifestPositiveInteger(
    launcher.implementationTree.fileCount,
    '/upstream/launcher/implementationTree/fileCount',
  );
  manifestSha256(
    launcher.implementationTree.sha256,
    '/upstream/launcher/implementationTree/sha256',
  );
  manifestObject(launcher.dependencyLock, '/upstream/launcher/dependencyLock', [
    'type',
    'path',
    'sha256',
  ]);
  manifestString(launcher.dependencyLock.type, '/upstream/launcher/dependencyLock/type');
  manifestString(launcher.dependencyLock.path, '/upstream/launcher/dependencyLock/path');
  if (!isAbsolute(launcher.dependencyLock.path)) {
    throw new Error('Reviewed compatibility manifest dependency-lock path must be absolute.');
  }
  manifestSha256(launcher.dependencyLock.sha256, '/upstream/launcher/dependencyLock/sha256');
  manifestObject(value.upstream.toolCatalog, '/upstream/toolCatalog', ['count', 'sha256']);
  manifestPositiveInteger(value.upstream.toolCatalog.count, '/upstream/toolCatalog/count');
  manifestSha256(value.upstream.toolCatalog.sha256, '/upstream/toolCatalog/sha256');

  const runtime = value.connectedRuntime;
  manifestObject(runtime, '/connectedRuntime', [
    'healthVersion',
    'nodeVersion',
    'easyedaVersion',
    'extensionVersion',
    'bridgeVersion',
    'bridgeEasyedaVersion',
    'methodRegistryHash',
    'dispatcher',
  ]);
  for (const key of [
    'healthVersion',
    'nodeVersion',
    'easyedaVersion',
    'extensionVersion',
    'bridgeVersion',
    'bridgeEasyedaVersion',
    'methodRegistryHash',
  ]) {
    manifestString(runtime[key], `/connectedRuntime/${key}`);
  }
  manifestObject(runtime.dispatcher, '/connectedRuntime/dispatcher', [
    'source',
    'buildId',
    'total',
  ]);
  if (runtime.dispatcher.source !== 'loader_status') {
    throw new Error('Reviewed compatibility manifest dispatcher source must be loader_status.');
  }
  manifestString(runtime.dispatcher.buildId, '/connectedRuntime/dispatcher/buildId');
  manifestPositiveInteger(runtime.dispatcher.total, '/connectedRuntime/dispatcher/total');

  const bundles = value.installedBundles;
  manifestObject(bundles, '/installedBundles', ['pcbEditor', 'publicApi']);
  manifestObject(bundles.pcbEditor, '/installedBundles/pcbEditor', [
    'version',
    'implementationSha256',
  ]);
  manifestString(bundles.pcbEditor.version, '/installedBundles/pcbEditor/version');
  manifestSha256(
    bundles.pcbEditor.implementationSha256,
    '/installedBundles/pcbEditor/implementationSha256',
  );
  manifestObject(bundles.publicApi, '/installedBundles/publicApi', [
    'version',
    'implementationSha256',
    'adapterSha256',
    'declarationsSha256',
  ]);
  manifestString(bundles.publicApi.version, '/installedBundles/publicApi/version');
  for (const key of ['implementationSha256', 'adapterSha256', 'declarationsSha256']) {
    manifestSha256(bundles.publicApi[key], `/installedBundles/publicApi/${key}`);
  }
  return value;
}

function readReviewedCompatibilityManifest() {
  const path = reviewedCompatibilityManifestPath();
  let bytes;
  let parsed;
  try {
    bytes = readFileSync(path);
    parsed = JSON.parse(bytes.toString('utf8'));
  } catch (error) {
    throw new Error(`Reviewed compatibility manifest is unavailable or invalid JSON: ${path}`, {
      cause: error,
    });
  }
  const manifest = validateReviewedCompatibilityManifest(parsed);
  return {
    manifest,
    fingerprint: {
      path,
      bytes: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex'),
      schema: manifest.schema,
      reviewedAt: manifest.reviewedAt,
    },
  };
}

export function loadReviewedCompatibilityManifest() {
  return readReviewedCompatibilityManifest().manifest;
}

export function reviewedCompatibilityManifestFingerprint() {
  return readReviewedCompatibilityManifest().fingerprint;
}

export function validatePrivateFingerprint(fingerprint) {
  validateExpectedFingerprint(fingerprint);
  const reviewed = readReviewedCompatibilityManifest();
  const manifest = reviewed.manifest;
  const manifestMismatches = compareSubset(
    fingerprint.reviewedCompatibilityManifest,
    reviewed.fingerprint,
  );
  if (manifestMismatches.length > 0) {
    const error = new Error(
      'Private EasyEDA automation is unavailable because the expected reviewed-compatibility manifest fingerprint does not match the current external manifest.',
    );
    error.mismatches = manifestMismatches;
    throw error;
  }
  const facadeMode = fingerprint.facadeImplementation.mode;
  const reviewedFacade = manifest.facadeImplementation[facadeMode];
  if (!reviewedFacade) {
    throw new Error(`Reviewed compatibility manifest has no facade mode ${facadeMode}.`);
  }
  const actual = {
    facadeImplementation: {
      version: fingerprint.facadeImplementation.version,
      operationSchema: fingerprint.facadeImplementation.operationSchema,
      sha256: fingerprint.facadeImplementation.sha256,
      fileCount: fingerprint.facadeImplementation.files.length,
      files: fingerprint.facadeImplementation.files
        .map((file) => ({
          relativePath: file.relativePath,
          bytes: file.bytes,
          sha256: file.sha256,
        }))
        .sort((left, right) => left.relativePath.localeCompare(right.relativePath)),
    },
    upstream: {
      serverVersion: fingerprint.upstreamServer?.version,
      launcher: fingerprint.upstreamLauncher,
      toolCatalog: {
        count: fingerprint.toolCount,
        sha256: fingerprint.toolCatalogSha256,
      },
    },
    connectedRuntime: {
      healthVersion: fingerprint.health?.payload?.version,
      nodeVersion: String(fingerprint.health?.payload?.node_version ?? '').replace(/^v/, ''),
      easyedaVersion: fingerprint.health?.payload?.easyeda_version,
      extensionVersion: fingerprint.health?.payload?.extension_version,
      bridgeVersion: fingerprint.bridge?.payload?.bridge_version,
      bridgeEasyedaVersion: fingerprint.bridge?.payload?.easyeda_version,
      methodRegistryHash: fingerprint.bridge?.payload?.diagnostics?.method_registry_hash,
      dispatcher: {
        source: fingerprint.bridgeDispatcher?.payload?.source,
        buildId: fingerprint.bridgeDispatcher?.payload?.dispatcher_build_id,
        total: fingerprint.bridgeDispatcher?.payload?.total,
      },
    },
    installedBundles: {
      pcbEditor: {
        version: fingerprint.installedBundles?.pcbEditor?.version,
        implementationSha256:
          fingerprint.installedBundles?.pcbEditor?.implementationSha256,
      },
      publicApi: {
        version: fingerprint.installedBundles?.publicApi?.version,
        implementationSha256:
          fingerprint.installedBundles?.publicApi?.implementationSha256,
        adapterSha256: fingerprint.installedBundles?.publicApi?.adapterSha256,
        declarationsSha256:
          fingerprint.installedBundles?.publicApi?.declarationsSha256,
      },
    },
  };
  const expected = {
    facadeImplementation: reviewedFacade,
    upstream: manifest.upstream,
    connectedRuntime: manifest.connectedRuntime,
    installedBundles: manifest.installedBundles,
  };
  const mismatches = compareSubset(actual, expected);
  if (mismatches.length > 0) {
    const error = new Error(
      `Private EasyEDA automation is unavailable because the connected compatibility tuple does not match the external reviewed manifest at ${reviewedCompatibilityManifestPath()}.`,
    );
    error.mismatches = mismatches;
    throw error;
  }
  return true;
}

export function getJsonPointer(root, pointer) {
  if (pointer === '' || pointer === '/') return root;
  if (typeof pointer !== 'string' || !pointer.startsWith('/')) {
    throw new Error(`Invalid JSON pointer: ${String(pointer)}`);
  }
  return pointer
    .slice(1)
    .split('/')
    .map((part) => part.replaceAll('~1', '/').replaceAll('~0', '~'))
    .reduce((value, key) => {
      if (Array.isArray(value) && /^\d+$/.test(key)) return value[Number(key)];
      if (isRecord(value)) return value[key];
      return undefined;
    }, root);
}

export function evaluateAssertions(root, assertions = []) {
  return assertions.map((assertion, index) => {
    const actual = getJsonPointer(root, assertion.pointer);
    let passed = false;
    switch (assertion.op) {
      case 'exists':
        passed = actual !== undefined;
        break;
      case 'equals':
        passed = actual !== undefined && canonicalJson(actual) === canonicalJson(assertion.value);
        break;
      case 'not-equals':
        passed = actual !== undefined && canonicalJson(actual) !== canonicalJson(assertion.value);
        break;
      case 'matches':
        passed = typeof actual === 'string' && new RegExp(String(assertion.value)).test(actual);
        break;
      case 'length-equals':
        passed = (Array.isArray(actual) || typeof actual === 'string') && actual.length === assertion.value;
        break;
      default:
        throw new Error(`Unsupported assertion operation at index ${index}: ${assertion.op}`);
    }
    return {
      index,
      pointer: assertion.pointer,
      op: assertion.op,
      passed,
      expected: assertion.value,
      actual,
    };
  });
}

export function compareSubset(actual, expected, pointer = '') {
  const mismatches = [];
  const visit = (actualValue, expectedValue, currentPointer) => {
    if (isRecord(expectedValue)) {
      if (!isRecord(actualValue)) {
        mismatches.push({ pointer: currentPointer || '/', expected: expectedValue, actual: actualValue });
        return;
      }
      for (const [key, child] of Object.entries(expectedValue)) {
        const encoded = key.replaceAll('~', '~0').replaceAll('/', '~1');
        visit(actualValue[key], child, `${currentPointer}/${encoded}`);
      }
      return;
    }
    if (canonicalJson(actualValue) !== canonicalJson(expectedValue)) {
      mismatches.push({ pointer: currentPointer || '/', expected: expectedValue, actual: actualValue });
    }
  };
  visit(actual, expected, pointer);
  return mismatches;
}

export function assertSubset(actual, expected, label = 'value') {
  const mismatches = compareSubset(actual, expected);
  if (mismatches.length > 0) {
    const error = new Error(`${label} does not match the expected subset.`);
    error.mismatches = mismatches;
    throw error;
  }
  return true;
}

export function validateCallSource(spec) {
  if (spec?.toolName !== 'easyeda_execute') return;
  const code = spec?.arguments?.code;
  if (typeof code !== 'string' || code.length === 0) {
    throw new Error('easyeda_execute call specs require arguments.code.');
  }
  if (Buffer.byteLength(code) > 1024 * 1024) {
    throw new Error('easyeda_execute source exceeds the 1 MiB control-plane limit.');
  }
  if (!/^[a-f0-9]{64}$/i.test(String(spec.sourceSha256 ?? ''))) {
    throw new Error('easyeda_execute call specs require a 64-character sourceSha256.');
  }
  if (sha256Text(code) !== spec.sourceSha256.toLowerCase()) {
    throw new Error('easyeda_execute sourceSha256 does not match arguments.code.');
  }
  const timeoutMs = Number(spec.arguments.timeoutMs ?? 15000);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 60000) {
    throw new Error('easyeda_execute timeoutMs must be an integer from 1000 through 60000.');
  }
  if (spec.arguments.confirmWrite !== true) {
    throw new Error('easyeda_execute call specs require confirmWrite=true.');
  }
  if (spec.acknowledgeUnrestrictedRaw !== true) {
    throw new Error(
      'easyeda_execute call specs must acknowledge that raw JavaScript is unrestricted.',
    );
  }
  if (!['read', 'mutate-unsaved'].includes(spec.mode)) {
    throw new Error('easyeda_execute call specs require mode read or mutate-unsaved.');
  }
}

export function buildPlanHash(plan) {
  return sha256Json({
    name: plan.name,
    intent: plan.intent,
    targetPrimitiveIds: plan.targetPrimitiveIds ?? [],
    targetChanges: plan.targetChanges ?? [],
    capabilityLevel: plan.capabilityLevel,
    expectedFingerprint: plan.expectedFingerprint,
    expectedContext: plan.expectedContext,
    preflightCalls: plan.preflightCalls ?? [],
    applyCall: plan.applyCall,
    verifyCalls: plan.verifyCalls ?? [],
    verifyAssertions: plan.verifyAssertions ?? [],
    rollbackCalls: plan.rollbackCalls ?? [],
    reopenedVerifyCalls: plan.reopenedVerifyCalls ?? [],
    reopenedAssertions: plan.reopenedAssertions ?? [],
    checkpoint: plan.checkpoint,
  });
}

export function operationSummary(operation) {
  const bounded = (value, maximum = 2048) => {
    if (typeof value !== 'string') return undefined;
    return value.length <= maximum ? value : `${value.slice(0, maximum - 1)}…`;
  };
  const checkpointPointer = (checkpoint) => {
    if (!checkpoint || typeof checkpoint !== 'object') return undefined;
    return {
      receiptPath: checkpoint.receiptPath,
      checkpointPath: checkpoint.checkpoint,
    };
  };
  const artifacts = Array.isArray(operation.artifacts) ? operation.artifacts : [];
  return {
    operationId: operation.operationId,
    planHash: operation.planHash,
    state: operation.state,
    mutationState: operation.mutationState,
    saved: operation.saved === true,
    reopened: operation.reopened === true,
    hardStop: operation.hardStop === true,
    mutationMayHaveOccurred: operation.mutationMayHaveOccurred === true,
    orphanedCallPossible: operationHasOrphanedCallRisk(operation),
    orphanedCallPhase: operation.orphanedCallPhase,
    runtimeRestartChallenge:
      operationHasOrphanedCallRisk(operation) &&
      typeof operation.runtimeRestartChallenge === 'string'
        ? operation.runtimeRestartChallenge
        : undefined,
    runtimeRestartChallengeIssuedAt:
      operationHasOrphanedCallRisk(operation) &&
      typeof operation.runtimeRestartChallengeIssuedAt === 'string'
        ? operation.runtimeRestartChallengeIssuedAt
        : undefined,
    runtimeRestartBoundary: operation.runtimeRestartBoundary,
    nextSafeAction: operation.nextSafeAction,
    unknownPhase: operation.unknownPhase,
    lastError: operation.lastError
      ? {
          name: bounded(operation.lastError.name, 128),
          message: bounded(operation.lastError.message),
        }
      : undefined,
    journalPath: operation.journalPath,
    checkpoints: {
      pre: checkpointPointer(operation.preCheckpoint),
      final: checkpointPointer(operation.finalCheckpoint),
    },
    artifacts: {
      count: artifacts.length,
      recent: artifacts.slice(-12).map((artifact) => ({
        path: artifact?.path,
        sha256: artifact?.sha256,
        bytes: artifact?.bytes,
      })),
    },
    updatedAt: operation.updatedAt,
  };
}

const LEGACY_ORPHAN_RISK_STATES = new Set([
  'baseline-reopen-dispatching',
  'baseline-reopen-unknown',
  'applying',
  'unknown',
  'rolling-back',
  'rollback-failed',
  'saving',
  'final-reopen-dispatching',
  'final-reopen-unknown',
  'recovery-reopen-dispatching',
  'recovery-reopen-unknown',
  'recovery-target-activation-dispatching',
  'recovery-target-activation-unknown',
]);

export function operationHasOrphanedCallRisk(operation) {
  if (typeof operation?.orphanedCallPossible === 'boolean') {
    return operation.orphanedCallPossible;
  }
  return LEGACY_ORPHAN_RISK_STATES.has(operation?.state);
}

export function isTerminalOperation(operation) {
  return ['completed', 'rolled-back', 'reconciled-no-mutation', 'plan-invalidated'].includes(
    operation?.state,
  );
}

export function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
