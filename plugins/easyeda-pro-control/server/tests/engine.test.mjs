import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { after, before, beforeEach, describe, test } from 'node:test';

import {
  buildPlanHash,
  loadReviewedCompatibilityManifest,
  reviewedCompatibilityManifestFingerprint,
  sha256Json,
  sha256Text,
} from '../src/core.mjs';

let artifacts;
let EasyedaControlEngine;
let RuntimeDisabledEasyedaControlEngine;
let source;
let outputDir;
let testDir;

function createFixtureDatabase() {
  execFileSync('sqlite3', [
    source,
    "PRAGMA journal_mode=DELETE; CREATE TABLE project_state(id INTEGER PRIMARY KEY, value TEXT NOT NULL); INSERT INTO project_state(value) VALUES ('fixture');",
  ]);
}

async function resetFixture() {
  await rm(process.env.EASYEDA_CONTROL_DATA_DIR, { recursive: true, force: true });
  await rm(outputDir, { recursive: true, force: true });
  await rm(source, { force: true });
  createFixtureDatabase();
}

before(async () => {
  testDir = await mkdtemp(join(tmpdir(), 'easyeda-control-engine-'));
  source = join(testDir, 'mock-project.eprj2');
  outputDir = join(testDir, 'checkpoints');
  process.env.EASYEDA_CONTROL_DATA_DIR = join(testDir, 'control-data');
  const engineModule = await import(
    `../src/engine.mjs?engine-test=${encodeURIComponent(testDir)}`
  );
  const SourceEngine = engineModule.EasyedaControlEngine;
  RuntimeDisabledEasyedaControlEngine = SourceEngine;
  EasyedaControlEngine = class ManifestBoundFixtureEngine extends SourceEngine {
    constructor(upstream) {
      super(upstream, { privateComponentWriterValidated: true });
    }

    async status() {
      const status = await super.status();
      if (!(this.upstream instanceof MockUpstream) || this.upstream.options.implementationDrift) {
        return status;
      }
      const manifest = loadReviewedCompatibilityManifest();
      const launcher = structuredClone(manifest.upstream.launcher);
      const serverVersion =
        this.upstream.options.serverVersion ?? manifest.upstream.serverVersion;
      const installedBundles = structuredClone(status.installedBundles);
      installedBundles.pcbEditor.version =
        this.upstream.options.pcbEditorVersion ?? manifest.installedBundles.pcbEditor.version;
      installedBundles.pcbEditor.implementationSha256 =
        this.upstream.options.pcbImplementationSha256 ??
        manifest.installedBundles.pcbEditor.implementationSha256;
      installedBundles.publicApi.version =
        this.upstream.options.publicApiVersion ?? manifest.installedBundles.publicApi.version;
      installedBundles.publicApi.implementationSha256 =
        this.upstream.options.publicApiImplementationSha256 ??
        manifest.installedBundles.publicApi.implementationSha256;
      installedBundles.publicApi.adapterSha256 =
        this.upstream.options.publicApiAdapterSha256 ??
        manifest.installedBundles.publicApi.adapterSha256;
      installedBundles.publicApi.declarationsSha256 =
        this.upstream.options.publicApiDeclarationsSha256 ??
        manifest.installedBundles.publicApi.declarationsSha256;
      const healthPayload = {
        version: manifest.connectedRuntime.healthVersion,
        node_version: manifest.connectedRuntime.nodeVersion,
        bridge_connected: true,
        easyeda_version: manifest.connectedRuntime.easyedaVersion,
        extension_version: manifest.connectedRuntime.extensionVersion,
        extension_version_mismatch: false,
        registry_mismatch: false,
      };
      const bridgePayload = {
        connected: true,
        bridge_version: manifest.connectedRuntime.bridgeVersion,
        easyeda_version: manifest.connectedRuntime.bridgeEasyedaVersion,
        diagnostics: { method_registry_hash: manifest.connectedRuntime.methodRegistryHash },
      };
      const dispatcherPayload = {
        source: manifest.connectedRuntime.dispatcher.source,
        dispatcher_build_id: manifest.connectedRuntime.dispatcher.buildId,
        total: manifest.connectedRuntime.dispatcher.total,
      };
      status.upstreamServer = { name: 'mock-easyeda-mcp', version: serverVersion };
      status.upstreamLauncher = launcher;
      status.upstreamLauncherState = {
        startup: launcher,
        current: structuredClone(launcher),
        startupSha256: sha256Json(launcher),
        currentSha256: sha256Json(launcher),
        drift: false,
      };
      status.installedBundles = installedBundles;
      status.toolCount = manifest.upstream.toolCatalog.count;
      status.toolCatalogSha256 = manifest.upstream.toolCatalog.sha256;
      status.health = { available: true, payload: healthPayload };
      status.bridge = { available: true, payload: bridgePayload };
      status.dispatcher = { available: true, payload: dispatcherPayload };
      status.stableFingerprint = {
        facadeImplementation: structuredClone(status.facadeImplementation),
        reviewedCompatibilityManifest: reviewedCompatibilityManifestFingerprint(),
        upstreamServer: { version: serverVersion },
        upstreamLauncher: launcher,
        upstreamImplementationDrift: false,
        installedBundles,
        toolCount: manifest.upstream.toolCatalog.count,
        toolCatalogSha256: manifest.upstream.toolCatalog.sha256,
        health: { payload: healthPayload },
        bridge: { payload: bridgePayload },
        bridgeDispatcher: { payload: dispatcherPayload },
      };
      return status;
    }
  };
  artifacts = await import('../src/artifacts.mjs');
});

beforeEach(resetFixture);

after(async () => {
  delete process.env.EASYEDA_CONTROL_DATA_DIR;
  if (testDir) await rm(testDir, { recursive: true, force: true });
});

function toolResult(payload) {
  return { structuredContent: { ok: true, result: payload } };
}

const digest = (character) => character.repeat(64);

class MockUpstream {
  constructor(options = {}) {
    this.options = options;
    this.state = 'baseline';
    this.applyAttempts = 0;
    this.rollbackAttempts = 0;
    this.saveAttempts = 0;
    this.reopenAttempts = 0;
    this.baselineReopenAttempts = 0;
    this.recoveryActivationAttempts = 0;
    this.readStateCalls = 0;
    this.contextCalls = 0;
    this.activeTabId = 'tab-1';
    this.collateralState = 'baseline';
    this.exactReadExecutions = new Map();
    this.exactReadSnapshots = new Map();
    this.lastApplyCode = undefined;
    this.calls = [];
    this.events = [];
    this.tools = [
      {
        name: 'easyeda_execute',
        annotations: { destructiveHint: true },
        inputSchema: { type: 'object', properties: { confirmWrite: { type: 'boolean' } } },
      },
      {
        name: 'easyeda_read_state',
        annotations: { readOnlyHint: true, idempotentHint: true },
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'easyeda_health_check',
        annotations: { readOnlyHint: true },
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'easyeda_bridge_status',
        annotations: { readOnlyHint: true },
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'easyeda_bridge_probe_methods',
        annotations: { readOnlyHint: true, idempotentHint: true },
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'easyeda_schematic_get_components',
        annotations: { readOnlyHint: true, idempotentHint: true },
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'easyeda_schematic_components',
        annotations: { readOnlyHint: true, idempotentHint: true },
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'easyeda_pcb_get_components',
        annotations: { readOnlyHint: true, idempotentHint: true },
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'easyeda_pcb_components',
        annotations: { readOnlyHint: true, idempotentHint: true },
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'easyeda_board_dimensions',
        annotations: { readOnlyHint: true, idempotentHint: true },
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'easyeda_component_probe',
        annotations: { readOnlyHint: true, idempotentHint: true },
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'easyeda_canvas_capture',
        annotations: { readOnlyHint: true, idempotentHint: true },
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'easyeda_export_gerbers',
        annotations: { destructiveHint: true },
        inputSchema: { type: 'object', properties: { confirmWrite: { type: 'boolean' } } },
      },
      {
        name: 'easyeda_schematic_verify_write',
        annotations: { readOnlyHint: true, idempotentHint: true },
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'easyeda_pcb_add_text',
        annotations: { destructiveHint: true },
        inputSchema: { type: 'object', properties: { confirmWrite: { type: 'boolean' } } },
      },
      {
        name: 'easyeda_pcb_modify_component',
        annotations: { destructiveHint: true },
        inputSchema: { type: 'object', properties: { confirmWrite: { type: 'boolean' } } },
      },
      {
        name: 'easyeda_pcb_workflow_write',
        annotations: { destructiveHint: true },
        inputSchema: { type: 'object', properties: { confirmWrite: { type: 'boolean' } } },
      },
      {
        name: 'easyeda_schematic_regression_write',
        annotations: { destructiveHint: true },
        inputSchema: { type: 'object', properties: { confirmWrite: { type: 'boolean' } } },
      },
    ];
  }

  async listTools() {
    return this.tools;
  }

  async findTool(name) {
    return this.tools.find((tool) => tool.name === name);
  }

  serverInfo() {
    return {
      name: 'mock-easyeda-mcp',
      version: this.options.serverVersion ?? '1.0.0-rc.1',
    };
  }

  async launcherFingerprint() {
    return {
      command: '/usr/bin/node',
      commandSha256: digest('1'),
      args: ['/opt/easyeda/dist/index.js'],
      cwd: '/opt/easyeda',
      entrypoint: '/opt/easyeda/dist/index.js',
      entrypointSha256: digest('2'),
      implementationTree: {
        root: '/opt/easyeda/dist',
        sha256: digest('3'),
        fileCount: 24,
      },
      dependencyLock: {
        type: 'pnpm',
        path: '/opt/easyeda/pnpm-lock.yaml',
        sha256: digest('4'),
      },
    };
  }

  async launcherState() {
    const startup = await this.launcherFingerprint();
    const current = structuredClone(startup);
    if (this.options.implementationDrift) {
      current.entrypointSha256 = digest('9');
      current.implementationTree.sha256 = digest('8');
    }
    return {
      startup,
      current,
      startupSha256: digest('5'),
      currentSha256: this.options.implementationDrift ? digest('6') : digest('5'),
      drift: this.options.implementationDrift === true,
    };
  }

  instructions() {
    return 'Offline EasyEDA control fixture.';
  }

  async installedEasyedaBundles() {
    return {
      available: true,
      assetsRoot: '/opt/easyeda/assets',
      pcbEditor: {
        version: this.options.pcbEditorVersion ?? '3.2.149.5378b690',
        implementationPath: '/opt/easyeda/assets/pro-pcb/pcb.js',
        implementationSha256:
          this.options.pcbImplementationSha256 ??
          '65401cdc0a8f244db2ff2d8da88fd835b6e1fb3a3ecdbcfd975781502cb04b54',
      },
      publicApi: {
        version: this.options.publicApiVersion ?? '0.2.53.aee2f57a',
        implementationPath: '/opt/easyeda/assets/pro-api/api.js',
        implementationSha256:
          this.options.publicApiImplementationSha256 ??
          '5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc',
        adapterPath: '/opt/easyeda/assets/pro-api/adapter.js',
        adapterSha256:
          this.options.publicApiAdapterSha256 ??
          '4da5b5184a78e2d3aca843dad6b147d7feb7ec1368160d73f49c4acbcf97dfdb',
        declarationsPath: '/opt/easyeda/assets/pro-api/api-types.d.ts',
        declarationsSha256:
          this.options.publicApiDeclarationsSha256 ??
          '32a0d2f8b4bc3d7b2b93b33499d9d768b0c23c77f45843a65166cf4e8ad6dab1',
      },
    };
  }

  persistDatabase() {
    execFileSync('sqlite3', [
      source,
      `UPDATE project_state SET value='saved-${this.saveAttempts}' WHERE id=1;`,
    ]);
  }

  rewriteDatabaseWithoutLogicalChange() {
    execFileSync('sqlite3', [source, 'VACUUM;']);
  }

  async callTool(name, args = {}, timeoutMs) {
    this.calls.push({ name, args, timeoutMs });
    if (name === 'easyeda_health_check') {
      return toolResult({
        version: '1.0.0-rc.1',
        node_version: '24.18.0',
        bridge_connected: true,
        easyeda_version: '3.2.149.88089769',
        extension_version: '1.0.0-rc.1',
        extension_version_mismatch: false,
        registry_mismatch: false,
      });
    }
    if (name === 'easyeda_bridge_status') {
      return toolResult({
        connected: true,
        bridge_version: '1.0.0-rc.1',
        easyeda_version: '3.2.149.88089769',
        diagnostics: { method_registry_hash: 'mock-registry-v1' },
      });
    }
    if (name === 'easyeda_bridge_probe_methods') {
      return toolResult({
        source: 'loader_status',
        dispatcher_build_id: 'd18b6xd531xe6ca',
        total: 116,
      });
    }
    if (
      [
        'easyeda_read_state',
        'easyeda_schematic_components',
        'easyeda_pcb_components',
        'easyeda_board_dimensions',
        'easyeda_component_probe',
      ].includes(name)
    ) {
      this.readStateCalls += 1;
      await this.options.onReadState?.(this, this.readStateCalls);
      this.events.push(`read-state:${this.readStateCalls}:${this.state}`);
      return toolResult({ state: this.state, reference: 'R1' });
    }
    if (name === 'easyeda_schematic_verify_write') {
      return toolResult({ ok: true, state: this.state, verified: true });
    }
    if (name !== 'easyeda_execute') throw new Error(`Unexpected mock tool ${name}`);

    const code = String(args.code ?? '');
    if (
      code.includes('kind: "exact-component-mutation"') &&
      code.includes('state: "after"')
    ) {
      this.applyAttempts += 1;
      this.lastApplyCode = code;
      await this.options.onApply?.(this);
      if (this.options.applyMutatesBeforeError) this.state = 'applied';
      if (this.options.applyError) throw this.options.applyError;
      this.state = 'applied';
      if (this.options.applyCollateral === true) this.collateralState = 'changed';
      if (this.options.applyPersistence === 'logical') this.persistDatabase();
      if (this.options.applyPersistence === 'physical-only') {
        this.rewriteDatabaseWithoutLogicalChange();
      }
      return toolResult({
        ok: true,
        kind: 'exact-component-mutation',
        state: 'after',
        documentType: 3,
        applied: [{ primitiveId: 'R1', fields: ['x'] }],
      });
    }
    if (
      code.includes('kind: "exact-component-mutation"') &&
      code.includes('state: "before"')
    ) {
      this.rollbackAttempts += 1;
      await this.options.onRollback?.(this);
      this.state = 'baseline';
      this.collateralState = 'baseline';
      return toolResult({
        ok: true,
        kind: 'exact-component-mutation',
        state: 'before',
        documentType: 3,
        applied: [{ primitiveId: 'R1', fields: ['x'] }],
      });
    }
    if (code.includes('document save did not return exactly true')) {
      this.saveAttempts += 1;
      this.events.push(`save-reopen:${this.saveAttempts}`);
      if (this.options.savePersistence === 'physical-only') {
        this.rewriteDatabaseWithoutLogicalChange();
      } else if (this.options.persistOnSave !== false) {
        this.persistDatabase();
      }
      await this.options.onSave?.();
      if (this.options.saveError) throw this.options.saveError;
      this.activeTabId = 'new-tab';
      return toolResult({
        ok: true,
        saved: true,
        closed: true,
        reopened: true,
        document: {
          uuid: 'document-1',
          documentType: this.options.documentType ?? 3,
          tabId: this.options.reportedSaveTabId ?? this.activeTabId,
        },
      });
    }
    if (code.includes('kind: "activate-recovery-target"')) {
      this.recoveryActivationAttempts += 1;
      if (Number(this.options.recoveryActivationErrorsRemaining ?? 0) > 0) {
        this.options.recoveryActivationErrorsRemaining -= 1;
        throw applyTimeout();
      }
      this.activeTabId = this.options.recoveryActivationTabId ?? this.activeTabId;
      return toolResult({
        ok: true,
        kind: 'activate-recovery-target',
        openedOrActivated: this.options.recoveryActivationOpened === true,
        document: {
          uuid: 'document-1',
          documentType: this.options.documentType ?? 3,
          tabId: this.activeTabId,
        },
      });
    }
    if (code.includes('reopen-only recovery')) {
      const baselineReopen = this.applyAttempts === 0;
      if (baselineReopen) this.baselineReopenAttempts += 1;
      else this.reopenAttempts += 1;
      const attempt = baselineReopen ? this.baselineReopenAttempts : this.reopenAttempts;
      this.events.push(`${baselineReopen ? 'baseline-reopen' : 'reopen-only'}:${attempt}`);
      await (baselineReopen ? this.options.onBaselineReopen : this.options.onReopen)?.(
        this,
        attempt,
      );
      const errorCounter = baselineReopen
        ? 'baselineReopenErrorsRemaining'
        : 'reopenErrorsRemaining';
      if (Number(this.options[errorCounter] ?? 0) > 0) {
        this.options[errorCounter] -= 1;
        throw applyTimeout();
      }
      this.state = baselineReopen
        ? (this.options.baselineReopenState ?? 'baseline')
        : (this.options.reopenState ?? 'applied');
      this.activeTabId = this.options.reopenedTabId ?? 'reopened-tab';
      return toolResult({
        ok: true,
        saved: false,
        closed: true,
        reopened: true,
        document: {
          uuid: 'document-1',
          documentType: this.options.documentType ?? 3,
          tabId: this.options.reportedReopenTabId ?? this.activeTabId,
        },
      });
    }

    const requestMatch = /const REQUEST = (\{[^\n]+\});/.exec(code);
    if (requestMatch) {
      const request = JSON.parse(requestMatch[1]);
      const execution = Number(this.exactReadExecutions.get(request.kind) ?? 0) + 1;
      this.exactReadExecutions.set(request.kind, execution);
      const firstObservation = execution % 2 === 1;
      if (request.kind.endsWith('-components') && firstObservation) {
        this.readStateCalls += 1;
        await this.options.onReadState?.(this, this.readStateCalls);
        this.events.push(`read-state:${this.readStateCalls}:${this.state}`);
        this.exactReadSnapshots.set(request.kind, {
          state: this.state,
          collateralState: this.collateralState,
        });
      }
      const snapshot = structuredClone(
        this.exactReadSnapshots.get(request.kind) ?? {
          state: this.state,
          collateralState: this.collateralState,
        },
      );
      if (
        request.kind.endsWith('-components') &&
        !firstObservation &&
        this.options.doubleReadMismatch === true
      ) {
        snapshot.state = `${snapshot.state}-unstable`;
      }
      if (!firstObservation) this.exactReadSnapshots.delete(request.kind);
      const documentType = request.kind === 'schematic-components' ? 1 : 3;
      if (request.kind.endsWith('-components')) {
        const targetValue =
          snapshot.state === 'baseline' ? 'baseline' : snapshot.state === 'applied' ? 'applied' : snapshot.state;
        const includeTargetPad =
          documentType === 3 &&
          (this.options.targetPadPrimitiveLockChanges === true ||
            this.options.targetPadTransformChanges === true ||
            this.options.targetPadDirectOrthogonalDrift === true ||
            this.options.targetPadDirectDeclaredMismatch === true);
        const targetPadX =
          this.options.targetPadTransformChanges === true && targetValue === 'applied' ? 201 : 101;
        const targetPads = includeTargetPad
          ? [
              {
                primitiveId: 'R1-pad-1',
                primitiveType: 'ComponentPad',
                parentComponentPrimitiveId: 'R1',
                layer: 1,
                padNumber: '1',
                x: targetPadX,
                y: 100,
                rotation: 0,
                net: 'GND',
                source: 'component-pin-wrapper-transformed-placement-only',
              },
            ]
          : [];
        const allByPrimitiveId = {
          R1: {
            primitiveId: 'R1',
            primitiveType: 'Component',
            component: null,
            footprint: null,
            model3D: null,
            designator: 'R1',
            x:
              documentType === 3
                ? this.options.lockOnlyTargetMutation
                  ? 100
                  : targetValue === 'baseline'
                  ? 100
                  : targetValue === 'applied'
                    ? 200
                    : 999
                : 100,
            y: 100,
            rotation: 0,
            layer: 1,
            primitiveLock:
              this.options.lockOnlyTargetMutation === true && targetValue === 'applied',
            addIntoBom: true,
            name: 'Fixture R1',
            uniqueId: 'gge-r1',
            manufacturer: documentType === 1 ? targetValue : 'fixture-manufacturer',
            manufacturerId: 'fixture-id',
            supplier: 'fixture-supplier',
            supplierId: 'fixture-supplier-id',
            otherProperty: {},
            bounds: { minX: 0, minY: 0, maxX: 10, maxY: 10 },
            [documentType === 1 ? 'pins' : 'pads']: targetPads,
          },
          R2: {
            primitiveId: 'R2',
            primitiveType: 'Component',
            component: null,
            footprint: null,
            model3D: null,
            designator: 'R2',
            x: snapshot.collateralState === 'baseline' ? 20 : 30,
            y: 100,
            rotation: 0,
            layer: 1,
            primitiveLock: false,
            addIntoBom: true,
            name: 'Fixture R2',
            uniqueId: 'gge-r2',
            manufacturer: 'unchanged',
            manufacturerId: 'fixture-id-r2',
            supplier: 'fixture-supplier',
            supplierId: 'fixture-supplier-id-r2',
            otherProperty: {},
            bounds: { minX: 20, minY: 0, maxX: 30, maxY: 10 },
            [documentType === 1 ? 'pins' : 'pads']: [],
          },
        };
        const selectedIds = request.selector?.primitiveIds ?? Object.keys(allByPrimitiveId);
        const byPrimitiveId = Object.fromEntries(
          selectedIds.map((primitiveId) => {
            const record = structuredClone(allByPrimitiveId[primitiveId]);
            if (request.includeBounds === false) delete record.bounds;
            if (request.includePins === false) {
              delete record.pins;
              delete record.pads;
            }
            return [primitiveId, record];
          }),
        );
        return toolResult({
          ok: true,
          kind: request.kind,
          documentType,
          detail: { pins: request.includePins, bounds: request.includeBounds },
          units:
            documentType === 1
              ? { coordinates: '0.01inch', bounds: '0.01inch' }
              : {
                  coordinates: 'mil',
                  bounds: 'mil',
                  transformedPadCoordinates: 'mil',
                },
          limitations:
            documentType === 1
              ? {
                  componentPinOtherProperty:
                    'Omitted because the pinned Component3 mapper does not populate it.',
                  componentOtherPropertyFiltering:
                    'The adapter filters internal component metadata.',
                  cbbLibraryOwnership:
                    'CBB records are adapter-owned library identifiers.',
                }
              : {
                  componentPadWrapper:
                    'Placed transformed pad identity and coordinates only.',
                },
          primitiveIds: Object.keys(byPrimitiveId),
          byPrimitiveId,
        });
      }
      if (request.kind === 'schematic-topology') {
        return toolResult({
          ok: true,
          kind: request.kind,
          documentType: 1,
          authority: {
            connectivity: 'sch_Netlist.getNetlist(JLCEDA)',
            wireGeometry: 'unavailable',
          },
          componentCorrelation: {
            status: 'exact-match',
            source: 'sch_PrimitiveComponent.getAll(part,true)',
            componentCount: 0,
            pinCount: 0,
            primitiveIds: [],
            uniqueIds: [],
            byUniqueId: {},
          },
          limitations: [
            'The pinned sch_Net net-tree/name adapters are hard stubs and are not read.',
            'The pinned sch_PrimitiveWire enumerators swallow RPC failures, so wire geometry is not claimed complete.',
          ],
          compiledConnectivity: [],
        });
      }
      if (request.kind === 'pcb-inventory') {
        const familyNames = [
          'arcs',
          'attributes',
          'components',
          'dimensions',
          'fills',
          'images',
          'lines',
          'objects',
          'pads',
          'polylines',
          'pours',
          'regions',
          'strings',
          'vias',
        ];
        const families = Object.fromEntries(
          familyNames.map((family) => [
            family,
            {
              status: 'adapter-enumerated',
              count: family === 'components' ? 2 : 0,
              primitiveIds: family === 'components' ? ['R1', 'R2'] : [],
              ...(
                [
                  'arcs',
                  'fills',
                  'lines',
                  'pads',
                  'polylines',
                  'pours',
                  'regions',
                  'vias',
                ].includes(family)
                  ? { byPrimitiveId: {} }
                  : {}
              ),
            },
          ]),
        );
        const includeTargetPad =
          this.options.targetPadPrimitiveLockChanges === true ||
          this.options.targetPadTransformChanges === true ||
          this.options.targetPadDirectOrthogonalDrift === true ||
          this.options.targetPadDirectDeclaredMismatch === true;
        if (includeTargetPad) {
          const targetValue = snapshot.state === 'baseline' ? 'baseline' : snapshot.state;
          const transformedX =
            this.options.targetPadTransformChanges === true && targetValue === 'applied' ? 201 : 101;
          const pad = {
            primitiveId: 'R1-pad-1',
            primitiveType: 'ComponentPad',
            layer: 1,
            padNumber: '1',
            x:
              this.options.targetPadDirectDeclaredMismatch === true && targetValue === 'applied'
                ? 202
                : transformedX,
            y:
              this.options.targetPadDirectOrthogonalDrift === true && targetValue === 'applied'
                ? 101
                : 100,
            rotation: 0,
            pad: ['ELLIPSE', 20, 20],
            specialPad: [[1, 1, ['RECT', 18, 12, 0]]],
            net: 'GND',
            hole: ['ROUND', 10],
            holeOffsetX: 0,
            holeOffsetY: 0,
            holeRotation: 0,
            metallization: true,
            padType: 1,
            solderMaskAndPasteMaskExpansion: {
              topSolderMask: 0,
              bottomSolderMask: 0,
              topPasteMask: 0,
              bottomPasteMask: 0,
            },
            heatWelding: { connectionMethod: 'Direct-connected' },
            primitiveLock:
              this.options.targetPadPrimitiveLockChanges === true && targetValue === 'applied',
            source: 'pcb_PrimitivePad-direct-state',
            parentComponentPrimitiveId: 'R1',
            componentCorrelationSource: 'component-getState_Pads',
          };
          families.pads.count = 1;
          families.pads.primitiveIds = ['R1-pad-1'];
          families.pads.byPrimitiveId = { 'R1-pad-1': pad };
        }
        return toolResult({
          ok: true,
          kind: request.kind,
          documentType: 3,
          units: {
            coordinatesAndLengths: 'mil',
            angles: 'degree',
            layers: 'numeric EPCB_LayerId',
          },
          limitations: {
            directPads: 'Direct adapter pad state is authoritative.',
            componentPadCorrelation: 'Component summaries are an exact subset correlation.',
            pouredCorrelation: 'Poured state is derived from parent pours.',
            regionRuleTypes: 'Omitted because the pinned adapter drops no-via state.',
            fillModes: 'Omitted because the pinned adapter hardcodes fill mode.',
            arcPrecision: 'Arc geometry is adapter-rounded to one decimal.',
            viaPrecision: 'Via radii are adapter-rounded to one decimal.',
            unmonitoredFamilies: 'Identity and counts only for unmonitored visual families.',
          },
          families,
          componentPadCorrelation: {
            status: 'exact-subset',
            count: includeTargetPad ? 1 : 0,
            primitiveIds: includeTargetPad ? ['R1-pad-1'] : [],
            byPrimitiveId: includeTargetPad
              ? {
                  'R1-pad-1': {
                    primitiveId: 'R1-pad-1',
                    parentComponentPrimitiveId: 'R1',
                    padNumber: '1',
                    net: 'GND',
                    source: 'component-getState_Pads',
                  },
                }
              : {},
            byComponentPrimitiveId: {
              R1: includeTargetPad ? ['R1-pad-1'] : [],
              R2: [],
            },
          },
          pouredCorrelation: {
            status: 'derived-subset',
            count: 0,
            pourPrimitiveIds: [],
            byPourPrimitiveId: {},
          },
          physicalPadCount: includeTargetPad ? 1 : 0,
          standalonePadCount: 0,
          pouredFillPieceCount: 0,
          enumeratedPrimitiveCount: includeTargetPad ? 3 : 2,
        });
      }
      if (request.kind === 'pcb-rules') {
        return toolResult({
          ok: true,
          kind: request.kind,
          documentType: 3,
          nets: ['GND'],
          rules: {
            configurationName: 'fixture',
            configuration: { name: 'fixture', config: { id: 'fixture-config' } },
            netRules: [{ type: 'net', name: 'GND', rule: 'default' }],
            netByNetRules: {},
            regionRules: [],
            netClasses: [],
            differentialPairs: [],
            equalLengthGroups: [],
            padPairGroups: [],
          },
        });
      }
    }

    this.contextCalls += 1;
    const documentType = this.options.documentType ?? 3;
    return toolResult({
      ok: true,
      project: {
        uuid: 'project-1',
        name: 'Mock project',
        path: this.options.contextPath ?? source,
      },
      document: {
        uuid: 'document-1',
        documentType,
        title: documentType === 1 ? 'Mock schematic' : 'Mock PCB',
        tabId: this.activeTabId,
      },
      pcb:
        documentType === 3
          ? { uuid: 'document-1', title: 'Mock PCB', tabId: this.activeTabId }
          : {},
      schematic:
        documentType === 1
          ? { uuid: 'document-1', title: 'Mock schematic', tabId: this.activeTabId }
          : {},
    });
  }
}

function rawSpec(marker) {
  const code = `// ${marker}\nreturn { ok: true };`;
  return {
    toolName: 'easyeda_execute',
    arguments: { code, timeoutMs: 15000, confirmWrite: true },
    sourceSha256: sha256Text(code),
    mode: 'mutate-unsaved',
    acknowledgeUnrestrictedRaw: true,
  };
}

function exactComponentMutationSpec(state) {
  return {
    toolName: 'easyeda_control_exact_component_mutation',
    arguments: { state },
  };
}

function stateReadSpec(documentType, expectedState, options = {}) {
  const summary = options.summary === true;
  return {
    toolName: 'easyeda_control_exact_read',
    arguments: {
      kind: documentType === 1 ? 'schematic-components' : 'pcb-components',
      selector: summary ? { all: true } : { primitiveIds: ['R1'] },
      includePins: !summary,
      includeBounds: !summary,
    },
    assertions: [
      expectedState === undefined
        ? { pointer: '/byPrimitiveId/R1/primitiveId', op: 'equals', value: 'R1' }
        : {
            pointer:
              documentType === 1
                ? '/byPrimitiveId/R1/manufacturer'
                : '/byPrimitiveId/R1/x',
            op: 'equals',
            value:
              documentType === 1
                ? expectedState
                : expectedState === 'baseline'
                  ? 100
                  : expectedState === 'applied'
                    ? 200
                    : 999,
          },
    ],
  };
}

function phaseReadSpecs(documentType, expectedState) {
  const calls = [
    stateReadSpec(documentType, expectedState, { summary: true }),
    stateReadSpec(documentType, expectedState),
  ];
  if (documentType === 3) {
    calls.push(
      { toolName: 'easyeda_control_exact_read', arguments: { kind: 'pcb-inventory' } },
      { toolName: 'easyeda_control_exact_read', arguments: { kind: 'pcb-rules' } },
    );
  } else {
    calls.push({
      toolName: 'easyeda_control_exact_read',
      arguments: { kind: 'schematic-topology' },
    });
  }
  return calls;
}

async function makePlan(engine, label, overrides = {}) {
  const expectedFingerprint = (await engine.status()).stableFingerprint;
  const documentType = overrides.expectedContext?.document?.documentType ?? 3;
  return {
    name: `Offline ${label} mutation`,
    intent: `Exercise the ${label} state-machine path without a live EasyEDA document.`,
    capabilityLevel: 'private-version-pinned',
    expectedFingerprint,
    targetPrimitiveIds: ['R1'],
    targetChanges:
      documentType === 1
        ? [
            {
              primitiveId: 'R1',
              pointer: '/manufacturer',
              before: 'baseline',
              after: 'applied',
            },
          ]
        : [{ primitiveId: 'R1', pointer: '/x', before: 100, after: 200 }],
    expectedContext: {
      project: { uuid: 'project-1', path: source },
      document: { uuid: 'document-1', documentType: 3, tabId: 'tab-1' },
    },
    preflightCalls: phaseReadSpecs(documentType),
    applyCall: exactComponentMutationSpec('after'),
    verifyCalls: phaseReadSpecs(documentType, 'applied'),
    verifyAssertions: [
      {
        pointer:
          documentType === 1
            ? '/1/byPrimitiveId/R1/manufacturer'
            : '/1/byPrimitiveId/R1/x',
        op: 'equals',
        value: documentType === 1 ? 'applied' : 200,
      },
    ],
    rollbackCalls: [exactComponentMutationSpec('before')],
    reopenedVerifyCalls: phaseReadSpecs(documentType, 'applied'),
    reopenedAssertions: [
      {
        pointer:
          documentType === 1
            ? '/1/byPrimitiveId/R1/manufacturer'
            : '/1/byPrimitiveId/R1/x',
        op: 'equals',
        value: documentType === 1 ? 'applied' : 200,
      },
    ],
    checkpoint: { source, outputDir, label },
    ...overrides,
  };
}

async function planWithDiscard(engine, plan) {
  return await engine.plan(plan, { confirmDiscardAnyUnsavedState: true });
}

async function reachDelayedFinalFailure(engine, upstream, label) {
  const planned = await planWithDiscard(engine, await makePlan(engine, label));
  await engine.apply(planned.operationId, planned.planHash);
  await engine.verify(planned.operationId);
  const failAtRead = upstream.readStateCalls + 5;
  upstream.options.onReadState = (mock, count) => {
    if (count === failAtRead) mock.state = 'unsaved-active-editor-change';
  };
  await assert.rejects(
    engine.saveReopen(planned.operationId, planned.planHash),
    /assertion/i,
  );
  delete upstream.options.onReadState;
  const failed = await artifacts.loadOperation(planned.operationId);
  assert.equal(failed.state, 'final-checkpoint-failed');
  assert.equal(failed.saved, true);
  assert.equal(failed.reopened, true);
  assert.equal(upstream.state, 'unsaved-active-editor-change');
  return { planned, failed };
}

async function reachSavedVerificationFailure(engine, upstream, label) {
  const planned = await planWithDiscard(engine, await makePlan(engine, label));
  await engine.apply(planned.operationId, planned.planHash);
  await engine.verify(planned.operationId);
  const failAtRead = upstream.readStateCalls + 3;
  upstream.options.onReadState = (mock, count) => {
    if (count === failAtRead) mock.state = 'baseline';
  };
  await assert.rejects(
    engine.saveReopen(planned.operationId, planned.planHash),
    /assertion/i,
  );
  delete upstream.options.onReadState;
  const failed = await artifacts.loadOperation(planned.operationId);
  assert.equal(failed.state, 'reopen-verification-failed');
  assert.equal(failed.saved, true);
  assert.equal(failed.reopened, true);
  upstream.state = 'applied';
  return { planned, failed };
}

function applyTimeout() {
  const error = new Error('MCP request timed out after 25000 ms');
  error.name = 'McpError';
  return error;
}

async function restartConfirmation(operationId) {
  const operation = await artifacts.loadOperation(operationId);
  assert.match(
    operation.runtimeRestartChallenge,
    new RegExp(`^EASYEDA_RESTARTED_AND_RECONNECTED:${operationId}:`),
  );
  return operation.runtimeRestartChallenge;
}

function windowsPath(path) {
  const match = /^\/mnt\/([a-z])\/(.*)$/i.exec(path);
  if (!match) return undefined;
  return `${match[1].toUpperCase()}:\\${match[2].replaceAll('/', '\\')}`;
}

describe('durable mutation state machine', { concurrency: false }, () => {
  test('status separates the running startup fingerprint from on-disk drift', async () => {
    const upstream = new MockUpstream({ implementationDrift: true });
    const engine = new EasyedaControlEngine(upstream);
    const status = await engine.status();

    assert.equal(status.upstreamLauncherState.drift, true);
    assert.equal(status.upstreamLauncherState.startupSha256, digest('5'));
    assert.equal(status.upstreamLauncherState.currentSha256, digest('6'));
    assert.notEqual(
      status.upstreamLauncherState.startup.entrypointSha256,
      status.upstreamLauncherState.current.entrypointSha256,
    );
    assert.deepEqual(status.upstreamLauncher, status.upstreamLauncherState.startup);
    assert.equal(status.stableFingerprint.upstreamImplementationDrift, true);
    assert.deepEqual(
      status.stableFingerprint.facadeImplementation,
      status.facadeImplementation,
    );
    assert.match(status.facadeImplementation.sha256, /^[a-f0-9]{64}$/);
    assert.ok(status.facadeImplementation.files.length >= 1);
    assert.equal(status.dispatcher.payload.source, 'loader_status');
    assert.equal(status.dispatcher.payload.dispatcher_build_id, 'd18b6xd531xe6ca');
    assert.equal(status.installedBundles.available, true);
    assert.equal(status.capabilities.privateComponentWriter.enabled, true);
    assert.equal(
      status.stableFingerprint.toolCatalogSha256,
      sha256Json(
        upstream.tools.map((tool) => ({
          name: tool.name,
          title: tool.title,
          description: tool.description,
          annotations: tool.annotations,
          inputSchema: tool.inputSchema,
          outputSchema: tool.outputSchema,
        })),
      ),
    );

    upstream.tools[0].outputSchema = {
      type: 'object',
      properties: { result: { type: 'string' } },
    };
    const changed = await engine.status();
    assert.notEqual(
      changed.stableFingerprint.toolCatalogSha256,
      status.stableFingerprint.toolCatalogSha256,
    );
  });

  test('runtime-disables the private component writer until connected validation is recorded', async () => {
    const upstream = new MockUpstream();
    const engine = new RuntimeDisabledEasyedaControlEngine(upstream);
    const status = await engine.status();

    assert.equal(status.capabilities.privateComponentWriter.enabled, false);
    assert.match(status.capabilities.privateComponentWriter.reason, /sacrificial-board test/);
    await assert.rejects(engine.plan({}), /private PCB component writer is runtime-disabled/);
    assert.deepEqual(await artifacts.listOperations(), []);
    assert.equal(upstream.contextCalls, 0);
    assert.equal(upstream.applyAttempts, 0);

    const fixtureEngine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      fixtureEngine,
      await makePlan(fixtureEngine, 'runtime-disabled-phase-bypass'),
    );
    await assert.rejects(
      engine.apply(planned.operationId, planned.planHash),
      /private PCB component writer is runtime-disabled/,
    );
    let journal = await artifacts.loadOperation(planned.operationId);
    journal.state = 'applied-unsaved';
    journal.mutationState = 'applied-unsaved';
    await artifacts.updateOperation(journal);
    await assert.rejects(
      engine.rollback(planned.operationId, planned.planHash),
      /private PCB component writer is runtime-disabled/,
    );
    journal = await artifacts.loadOperation(planned.operationId);
    journal.state = 'live-verified';
    await artifacts.updateOperation(journal);
    await assert.rejects(
      engine.saveReopen(planned.operationId, planned.planHash),
      /private PCB component writer is runtime-disabled/,
    );
    assert.equal(upstream.applyAttempts, 0);
    assert.equal(upstream.rollbackAttempts, 0);
    assert.equal(upstream.saveAttempts, 0);
  });

  test('context requires and canonicalizes the exact .eprj2 project path', async () => {
    const canonical = new MockUpstream({ contextPath: `file://${source}` });
    const canonicalContext = await new EasyedaControlEngine(canonical).context();
    assert.equal(canonicalContext.project.path, resolve(source));

    for (const contextPath of ['', '/tmp/not-an-easyeda-project.txt', 'relative.eprj2']) {
      const malformed = new MockUpstream({ contextPath });
      await assert.rejects(
        new EasyedaControlEngine(malformed).context(),
        /project UUID\/path|absolute POSIX|\.eprj2 database/,
      );
    }
  });

  test('plans checkpoint and journal before discarding the live baseline', async () => {
    const upstream = new MockUpstream({ reopenedTabId: 'clean-tab' });
    const engine = new EasyedaControlEngine(upstream);
    const plan = await makePlan(engine, 'clean-baseline');
    const originalPlanHash = buildPlanHash(plan);

    await assert.rejects(
      engine.plan(plan),
      /confirmDiscardAnyUnsavedState=true/,
    );
    assert.equal(upstream.baselineReopenAttempts, 0);
    assert.equal(upstream.readStateCalls, 0);
    assert.deepEqual(await artifacts.listOperations(), []);

    let dispatchJournal;
    let dispatchCheckpointVerification;
    upstream.options.onBaselineReopen = async () => {
      [dispatchJournal] = await artifacts.listOperations();
      dispatchCheckpointVerification = await engine.checkpoint({
        receiptPath: dispatchJournal.preCheckpoint.receiptPath,
      });
    };
    const planned = await planWithDiscard(engine, plan);
    assert.equal(planned.state, 'preflight-proven');
    assert.equal(upstream.baselineReopenAttempts, 1);
    assert.equal(upstream.reopenAttempts, 0);
    assert.equal(dispatchJournal.state, 'baseline-reopen-dispatching');
    assert.equal(dispatchJournal.hardStop, true);
    assert.equal(dispatchJournal.mutationMayHaveOccurred, true);
    assert.equal(dispatchCheckpointVerification.ok, true);
    assert.equal(dispatchJournal.artifacts.length, 1);
    assert.match(dispatchJournal.artifacts[0].path, /baseline-checkpoint/);
    assert.deepEqual(upstream.events.slice(0, 2), [
      'baseline-reopen:1',
      'read-state:1:baseline',
    ]);

    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.plan.expectedContext.document.tabId, 'clean-tab');
    assert.equal(journal.context.document.tabId, 'clean-tab');
    assert.equal(journal.planHash, planned.planHash);
    assert.equal(journal.planHash, buildPlanHash(journal.plan));
    assert.notEqual(journal.planHash, originalPlanHash);
    assert.equal(journal.baselineHash.length, 64);
    assert.equal(journal.artifacts.length, 3);
    const preflightEvidence = JSON.parse(
      await readFile(journal.artifacts.at(-1).path, 'utf8'),
    );
    assert.equal(preflightEvidence.finalCheckpointVerification.ok, true);
    assert.equal(
      preflightEvidence.finalCheckpointVerification.sourceEqualsCheckpoint,
      true,
    );
  });

  test('rebinds duplicate tab IDs in a full PCB context after each lifecycle reopen', async () => {
    const upstream = new MockUpstream({ reopenedTabId: 'clean-full-context-tab' });
    const engine = new EasyedaControlEngine(upstream);
    const plan = await makePlan(engine, 'full-context-lifecycle', {
      expectedContext: {
        project: { uuid: 'project-1', name: 'Mock project', path: source },
        document: {
          uuid: 'document-1',
          documentType: 3,
          title: 'Mock PCB',
          tabId: 'tab-1',
        },
        pcb: { uuid: 'document-1', title: 'Mock PCB', tabId: 'tab-1' },
        schematic: {},
      },
    });
    const originalPlanHash = buildPlanHash(plan);

    const planned = await planWithDiscard(engine, plan);
    let journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.plan.expectedContext.document.tabId, 'clean-full-context-tab');
    assert.equal(journal.plan.expectedContext.pcb.tabId, 'clean-full-context-tab');
    assert.equal(journal.context.document.tabId, 'clean-full-context-tab');
    assert.equal(journal.context.pcb.tabId, 'clean-full-context-tab');
    assert.equal(journal.planHash, buildPlanHash(journal.plan));
    assert.notEqual(journal.planHash, originalPlanHash);

    await engine.apply(planned.operationId, planned.planHash);
    await engine.verify(planned.operationId);
    const completed = await engine.saveReopen(planned.operationId, planned.planHash);
    journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(completed.state, 'completed');
    assert.equal(journal.plan.expectedContext.document.tabId, 'new-tab');
    assert.equal(journal.plan.expectedContext.pcb.tabId, 'new-tab');
    assert.equal(journal.context.document.tabId, 'new-tab');
    assert.equal(journal.context.pcb.tabId, 'new-tab');
    assert.equal(journal.planHash, buildPlanHash(journal.plan));
    assert.equal(journal.planHash, completed.planHash);
  });

  test('hard-stops when lifecycle evidence reports a tab other than the active reopened tab', async () => {
    const upstream = new MockUpstream({
      reopenedTabId: 'actual-clean-tab',
      reportedReopenTabId: 'different-reported-tab',
    });
    const engine = new EasyedaControlEngine(upstream);

    await assert.rejects(
      planWithDiscard(engine, await makePlan(engine, 'mismatched-reopen-tab')),
      /reopened tab does not match the active context tab/,
    );
    const [unknown] = await artifacts.listOperations();
    assert.equal(unknown.state, 'baseline-reopen-unknown');
    assert.equal(unknown.unknownPhase, 'baseline-reopen');
    assert.equal(unknown.hardStop, true);
    assert.equal(unknown.mutationMayHaveOccurred, true);
    assert.equal(unknown.orphanedCallPossible, false);
    assert.equal(unknown.orphanedCallPhase, 'baseline-reopen');
    assert.equal(typeof unknown.orphanedCallReturnedAt, 'string');
    assert.equal(Object.hasOwn(unknown, 'baselineHash'), false);
    assert.equal(unknown.plan.expectedContext.document.tabId, 'tab-1');
    assert.equal(upstream.activeTabId, 'actual-clean-tab');
    assert.equal(upstream.readStateCalls, 0);
  });

  test('baseline reopen timeout is recoverably invalidated without a baseline hash', async () => {
    const upstream = new MockUpstream({ baselineReopenErrorsRemaining: 1 });
    const engine = new EasyedaControlEngine(upstream);
    const plan = await makePlan(engine, 'baseline-timeout');

    await assert.rejects(planWithDiscard(engine, plan), /timed out/);
    const [unknown] = await artifacts.listOperations();
    assert.equal(unknown.state, 'baseline-reopen-unknown');
    assert.equal(unknown.unknownPhase, 'baseline-reopen');
    assert.equal(unknown.hardStop, true);
    assert.equal(unknown.mutationMayHaveOccurred, true);
    assert.equal(Object.hasOwn(unknown, 'baselineHash'), false);
    assert.equal(upstream.baselineReopenAttempts, 1);
    assert.equal(upstream.readStateCalls, 0);

    await assert.rejects(
      engine.recover(unknown.operationId, 'reconciled-no-mutation'),
      /terminate EasyEDA Pro, restart it, reconnect the bridge/,
    );
    const recovered = await engine.recover(unknown.operationId, 'reconciled-no-mutation', {
      runtimeRestartConfirmation: await restartConfirmation(unknown.operationId),
    });
    assert.equal(recovered.state, 'plan-invalidated');
    assert.equal(recovered.hardStop, false);
    assert.equal(recovered.mutationMayHaveOccurred, false);
    assert.equal(upstream.readStateCalls, 0);
    const journal = await artifacts.loadOperation(unknown.operationId);
    const evidence = JSON.parse(await readFile(journal.artifacts.at(-1).path, 'utf8'));
    assert.equal(evidence.baselinePreparationInvalidated, true);
    assert.equal(evidence.preCheckpointVerification.ok, true);
  });

  test('plan invalidates when the project source changes during clean-baseline preflight', async () => {
    const upstream = new MockUpstream({
      onReadState(_mock, count) {
        if (count === 1) {
          execFileSync('sqlite3', [
            source,
            "UPDATE project_state SET value='changed-during-plan-preflight' WHERE id=1;",
          ]);
        }
      },
    });
    const engine = new EasyedaControlEngine(upstream);
    const plan = await makePlan(engine, 'baseline-preflight-source-drift');

    await assert.rejects(
      planWithDiscard(engine, plan),
      /durable database changed between the pre-checkpoint, baseline reopen, and preflight/,
    );
    const [invalidated] = await artifacts.listOperations();
    assert.equal(invalidated.state, 'plan-invalidated');
    assert.equal(invalidated.mutationState, 'none');
    assert.equal(invalidated.hardStop, false);
    assert.equal(invalidated.mutationMayHaveOccurred, false);
    assert.equal(upstream.baselineReopenAttempts, 1);
    assert.equal(upstream.readStateCalls, 2);
    assert.equal(upstream.applyAttempts, 0);
  });

  test('guards apply, verifies live and reopened state, then completes with two checkpoints', async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(engine, await makePlan(engine, 'success'));
    assert.equal(planned.state, 'preflight-proven');
    assert.equal(planned.mutationMayHaveOccurred, false);

    let applyingJournal;
    let savingJournal;
    upstream.options.onApply = async () => {
      applyingJournal = await artifacts.loadOperation(planned.operationId);
    };
    upstream.options.onSave = async () => {
      savingJournal = await artifacts.loadOperation(planned.operationId);
    };

    const applied = await engine.apply(planned.operationId, planned.planHash);
    assert.equal(applied.state, 'applied-unsaved');
    assert.equal(applyingJournal.state, 'applying');
    assert.equal(applyingJournal.hardStop, true);
    assert.equal(applyingJournal.mutationMayHaveOccurred, true);
    assert.equal(applied.mutationMayHaveOccurred, true);
    assert.equal(upstream.applyAttempts, 1);
    assert.match(upstream.lastApplyCode, /EXPECTED_PROJECT_UUID = "project-1"/);
    assert.match(upstream.lastApplyCode, /EXPECTED_DOCUMENT_UUID = "document-1"/);
    assert.match(upstream.lastApplyCode, /EXPECTED_TAB_ID = "reopened-tab"/);
    assert.match(upstream.lastApplyCode, /eda\.pcb_PrimitiveComponent/);
    assert.match(upstream.lastApplyCode, /"primitiveId":"R1","patch":\{"x":200\}/);
    assert.doesNotMatch(upstream.lastApplyCode, /MOCK_APPLY/);

    const verified = await engine.verify(planned.operationId);
    assert.equal(verified.state, 'live-verified');
    assert.equal(verified.hardStop, false);

    const completed = await engine.saveReopen(planned.operationId, planned.planHash);
    assert.equal(completed.state, 'completed');
    assert.equal(savingJournal.state, 'saving');
    assert.equal(savingJournal.hardStop, true);
    assert.equal(savingJournal.mutationMayHaveOccurred, true);
    assert.equal(completed.saved, true);
    assert.equal(completed.reopened, true);
    assert.equal(completed.mutationMayHaveOccurred, false);
    assert.equal(upstream.saveAttempts, 1);

    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.plan.expectedContext.document.tabId, 'new-tab');
    assert.equal(journal.context.document.tabId, 'new-tab');
    assert.equal(journal.planHash, completed.planHash);
    assert.equal(journal.planHash, buildPlanHash(journal.plan));
    assert.notEqual(journal.planHash, planned.planHash);
    assert.equal(journal.preCheckpoint.schema, 'easyeda-pro-control.checkpoint.v1');
    assert.equal(journal.finalCheckpoint.schema, 'easyeda-pro-control.checkpoint.v1');
    assert.equal(journal.artifacts.length, 9);
    assert.deepEqual(
      journal.artifacts.map((artifact) =>
        basename(artifact.path)
          .replace(/^\d{2}-/, '')
          .replace(/-\d{13}(?=\.json$)/, '')
          .replace(/\.json$/, ''),
      ),
      [
        'baseline-checkpoint',
        'baseline-reopen',
        'preflight',
        'apply',
        'verify-live',
        'verify-pre-save',
        'save-reopen',
        'verify-reopened',
        'final-checkpoint',
      ],
    );
  });

  test('delayed finalization retries discard active editor changes before certification', async () => {
    const retryStates = ['final-checkpoint-failed', 'reopened-verified'];
    for (let index = 0; index < retryStates.length; index += 1) {
      if (index > 0) await resetFixture();
      const retryState = retryStates[index];
      const upstream = new MockUpstream({ reopenState: 'applied' });
      const engine = new EasyedaControlEngine(upstream);
      const { planned, failed } = await reachDelayedFinalFailure(
        engine,
        upstream,
        `delayed-final-${retryState}`,
      );
      if (retryState === 'reopened-verified') {
        failed.state = 'reopened-verified';
        failed.hardStop = false;
        failed.nextSafeAction = 'Resume final checkpoint creation.';
        delete failed.lastError;
        await artifacts.updateOperation(failed);
      }

      const callsBeforeRetry = upstream.events.length;
      const readsBeforeRetry = upstream.readStateCalls;
      const artifactsBeforeRetry = failed.artifacts.length;
      await assert.rejects(
        engine.saveReopen(planned.operationId, failed.planHash),
        /confirmDiscardAnyUnsavedState=true/,
      );
      assert.equal(upstream.reopenAttempts, 0);
      assert.equal(upstream.saveAttempts, 1);
      assert.equal(upstream.readStateCalls, readsBeforeRetry);
      assert.equal(upstream.events.length, callsBeforeRetry);

      let dispatchJournal;
      upstream.options.onReopen = async () => {
        dispatchJournal = await artifacts.loadOperation(planned.operationId);
      };
      const completed = await engine.saveReopen(
        planned.operationId,
        failed.planHash,
        { confirmDiscardAnyUnsavedState: true },
      );
      assert.equal(completed.state, 'completed');
      assert.equal(upstream.saveAttempts, 1);
      assert.equal(upstream.reopenAttempts, 1);
      assert.match(dispatchJournal.state, /reopen.*dispatch/i);
      assert.equal(dispatchJournal.hardStop, true);
      assert.equal(dispatchJournal.mutationMayHaveOccurred, true);
      const retryEvents = upstream.events.slice(callsBeforeRetry);
      assert.equal(retryEvents[0], 'reopen-only:1');
      assert.match(retryEvents[1], /^read-state:\d+:applied$/);

      const journal = await artifacts.loadOperation(planned.operationId);
      const addedArtifacts = journal.artifacts.slice(artifactsBeforeRetry);
      const addedPayloads = await Promise.all(
        addedArtifacts.map(async (artifact) =>
          JSON.parse(await readFile(artifact.path, 'utf8')),
        ),
      );
      assert.deepEqual(
        {
          saved: addedPayloads[0]?.payload?.saved,
          closed: addedPayloads[0]?.payload?.closed,
          reopened: addedPayloads[0]?.payload?.reopened,
        },
        { saved: false, closed: true, reopened: true },
      );
    }
  });

  test('rolls an applied unsaved mutation back and proves the exact baseline hash', async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(engine, await makePlan(engine, 'rollback-happy'));
    await engine.apply(planned.operationId, planned.planHash);
    let rollingBackJournal;
    upstream.options.onRollback = async () => {
      rollingBackJournal = await artifacts.loadOperation(planned.operationId);
    };

    const rolledBack = await engine.rollback(planned.operationId, planned.planHash);
    assert.equal(rollingBackJournal.state, 'rolling-back');
    assert.equal(rollingBackJournal.hardStop, true);
    assert.equal(rollingBackJournal.mutationMayHaveOccurred, true);
    assert.equal(rolledBack.state, 'rolled-back');
    assert.equal(rolledBack.mutationState, 'rolled-back');
    assert.equal(rolledBack.saved, false);
    assert.equal(rolledBack.mutationMayHaveOccurred, false);
    assert.equal(upstream.rollbackAttempts, 1);
    assert.equal(upstream.state, 'baseline');
  });

  test('lets the user cancel a live-verified mutation through guarded rollback', async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'rollback-live-verified'),
    );
    await engine.apply(planned.operationId, planned.planHash);
    const verified = await engine.verify(planned.operationId);
    assert.equal(verified.state, 'live-verified');

    const rolledBack = await engine.rollback(planned.operationId, planned.planHash);
    assert.equal(rolledBack.state, 'rolled-back');
    assert.equal(upstream.rollbackAttempts, 1);
    assert.equal(upstream.state, 'baseline');
  });

  test('refuses rollback before dispatch when the durable baseline drifts', async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'rollback-durable-race'),
    );
    await engine.apply(planned.operationId, planned.planHash);
    await engine.verify(planned.operationId);
    let changed = false;
    upstream.options.onReadState = () => {
      if (changed) return;
      changed = true;
      execFileSync('sqlite3', [
        source,
        "UPDATE project_state SET value='rollback-race' WHERE id=1;",
      ]);
    };

    await assert.rejects(
      engine.rollback(planned.operationId, planned.planHash),
      /durable baseline changed immediately before rollback/,
    );
    assert.equal(upstream.rollbackAttempts, 0);
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, 'durable-baseline-drift');
    assert.equal(journal.orphanedCallPossible, false);
  });

  test('refuses save immediately before dispatch when the durable baseline drifts', async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'save-pre-dispatch-durable-race'),
    );
    await engine.apply(planned.operationId, planned.planHash);
    await engine.verify(planned.operationId);

    const requireDurableBaseline = engine.requireDurableBaselineBeforeDispatch.bind(engine);
    engine.requireDurableBaselineBeforeDispatch = async (operation, phase, failure) => {
      if (phase === 'save-reopen') {
        execFileSync('sqlite3', [
          source,
          "UPDATE project_state SET value='save-pre-dispatch-race' WHERE id=1;",
        ]);
      }
      return await requireDurableBaseline(operation, phase, failure);
    };

    await assert.rejects(
      engine.saveReopen(planned.operationId, planned.planHash),
      /durable baseline changed immediately before save-reopen/,
    );
    assert.equal(upstream.saveAttempts, 0);
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, 'durable-baseline-drift');
    assert.equal(journal.unknownPhase, 'save-reopen-pre-dispatch-durable-baseline');
    assert.equal(journal.orphanedCallPossible, false);
  });

  test('binds the checkpoint to an equivalent Windows project path', async (context) => {
    const windows = windowsPath(source);
    if (!windows) {
      context.skip('Fixture is not under a mounted Windows drive.');
      return;
    }

    const windowsUpstream = new MockUpstream({ contextPath: windows });
    const windowsEngine = new EasyedaControlEngine(windowsUpstream);
    const windowsPlan = await makePlan(windowsEngine, 'windows-path', {
      expectedContext: {
        project: { uuid: 'project-1', path: windows },
        document: { uuid: 'document-1', documentType: 3, tabId: 'tab-1' },
      },
    });
    const plannedWindows = await planWithDiscard(windowsEngine, windowsPlan);
    assert.equal(
      (await windowsEngine.recover(plannedWindows.operationId, 'reconciled-no-mutation')).state,
      'reconciled-no-mutation',
    );
  });

  test('binds the checkpoint to an equivalent file URI project path', async () => {
    const fileUri = `file://${source}`;
    const uriUpstream = new MockUpstream({ contextPath: fileUri });
    const uriEngine = new EasyedaControlEngine(uriUpstream);
    const uriPlan = await makePlan(uriEngine, 'file-uri', {
      expectedContext: {
        project: { uuid: 'project-1', path: fileUri },
        document: { uuid: 'document-1', documentType: 3, tabId: 'tab-1' },
      },
    });
    const plannedUri = await planWithDiscard(uriEngine, uriPlan);
    assert.equal(
      (await uriEngine.recover(plannedUri.operationId, 'reconciled-no-mutation')).state,
      'reconciled-no-mutation',
    );
  });

  test('rejects a checkpoint source that is not the active project database', async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const plan = await makePlan(engine, 'wrong-checkpoint', {
      expectedContext: {
        project: { uuid: 'project-1', path: join(testDir, 'different.eprj2') },
        document: { uuid: 'document-1', documentType: 3, tabId: 'tab-1' },
      },
    });
    await assert.rejects(engine.plan(plan), /checkpoint\.source must be the exact/);
    assert.deepEqual(await artifacts.listOperations(), []);
  });

  test('rejects plans without declared target changes or mandatory exact phase readers', async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const noTargetChanges = await makePlan(engine, 'no-target-changes', {
      targetChanges: [],
    });
    await assert.rejects(
      engine.plan(noTargetChanges),
      /require explicit before\/after targetChanges/,
    );

    const noLive = await makePlan(engine, 'no-live-assertions', {
      verifyAssertions: [],
      verifyCalls: [{ toolName: 'easyeda_read_state', arguments: {}, assertions: [] }],
    });
    await assert.rejects(engine.plan(noLive), /Live verification requires one all-component/);

    const noReopened = await makePlan(engine, 'no-reopened-assertions', {
      reopenedAssertions: [],
      reopenedVerifyCalls: [{ toolName: 'easyeda_read_state', arguments: {}, assertions: [] }],
    });
    await assert.rejects(engine.plan(noReopened), /Reopened verification requires one all-component/);
  });

  test('rejects multi-component targets before any lifecycle or mutation dispatch', async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const plan = await makePlan(engine, 'multi-component-target', {
      targetPrimitiveIds: ['R1', 'R2'],
      targetChanges: [
        { primitiveId: 'R1', pointer: '/x', before: 100, after: 200 },
        { primitiveId: 'R2', pointer: '/x', before: 20, after: 30 },
      ],
    });

    await assert.rejects(
      planWithDiscard(engine, plan),
      /require exactly one targetPrimitiveId/,
    );
    assert.equal(upstream.baselineReopenAttempts, 0);
    assert.equal(upstream.applyAttempts, 0);
    assert.equal(upstream.contextCalls, 0);
    assert.deepEqual(await artifacts.listOperations(), []);
  });

  test('restricts declared changes to guarded PCB placement, layer, and lock fields', async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const pcbAssociationChange = await makePlan(engine, 'pcb-association-change', {
      targetChanges: [
        {
          primitiveId: 'R1',
          pointer: '/manufacturer',
          before: 'fixture-manufacturer',
          after: 'different-manufacturer',
        },
      ],
    });
    await assert.rejects(
      planWithDiscard(engine, pcbAssociationChange),
      /permits component placement\/lock state/,
    );
    const invalidBeforeValue = await makePlan(engine, 'invalid-before-value', {
      targetChanges: [
        { primitiveId: 'R1', pointer: '/x', before: '100', after: 200 },
      ],
    });
    await assert.rejects(
      planWithDiscard(engine, invalidBeforeValue),
      /target R1\/x before value must be finite/i,
    );
    const invalidAfterLayer = await makePlan(engine, 'invalid-after-layer', {
      targetChanges: [
        { primitiveId: 'R1', pointer: '/layer', before: 1, after: 3 },
      ],
    });
    await assert.rejects(
      planWithDiscard(engine, invalidAfterLayer),
      /target R1\/layer after value must be Top 1 or Bottom 2/i,
    );
    assert.equal(upstream.baselineReopenAttempts, 0);
    assert.equal(upstream.contextCalls, 0);
    assert.deepEqual(await artifacts.listOperations(), []);
  });

  test('rejects schematic mutation plans even with target-bound pinned read evidence', async () => {
    const upstream = new MockUpstream({ documentType: 1 });
    const engine = new EasyedaControlEngine(upstream);
    const verifier = {
      toolName: 'easyeda_schematic_verify_write',
      arguments: {},
      assertions: [{ pointer: '/verified', op: 'equals', value: true }],
    };
    const plan = await makePlan(engine, 'schematic-write-verifier', {
      expectedContext: {
        project: { uuid: 'project-1', path: source },
        document: { uuid: 'document-1', documentType: 1, tabId: 'tab-1' },
      },
      preflightCalls: [...phaseReadSpecs(1), verifier],
      verifyCalls: [...phaseReadSpecs(1, 'applied'), verifier],
      verifyAssertions: [],
      reopenedVerifyCalls: [...phaseReadSpecs(1, 'applied'), verifier],
      reopenedAssertions: [],
    });
    await assert.rejects(
      planWithDiscard(engine, plan),
      /currently support PCB \(3\) component placement\/layer\/lock only/,
    );
    assert.equal(upstream.baselineReopenAttempts, 0);
    assert.deepEqual(await artifacts.listOperations(), []);
  });

  test('rejects cross-editor tools before dispatch', async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const schematicReadOnPcb = await makePlan(engine, 'schematic-read-on-pcb', {
      preflightCalls: [
        ...phaseReadSpecs(3),
        {
          toolName: 'easyeda_schematic_components',
          arguments: {},
          assertions: [{ pointer: '/reference', op: 'equals', value: 'R1' }],
        },
      ],
    });
    await assert.rejects(
      planWithDiscard(engine, schematicReadOnPcb),
      /belongs to document type 1, not the plan's active document type 3/,
    );

    const pcbReadOnSchematic = await makePlan(engine, 'pcb-read-on-schematic', {
      expectedContext: {
        project: { uuid: 'project-1', path: source },
        document: { uuid: 'document-1', documentType: 1, tabId: 'tab-1' },
      },
      preflightCalls: [
        ...phaseReadSpecs(1),
        {
          toolName: 'easyeda_pcb_components',
          arguments: {},
          assertions: [{ pointer: '/reference', op: 'equals', value: 'R1' }],
        },
      ],
    });
    await assert.rejects(
      planWithDiscard(engine, pcbReadOnSchematic),
      /currently support PCB \(3\) component placement\/layer\/lock only/,
    );

    const boardReadOnSchematic = await makePlan(engine, 'board-read-on-schematic', {
      expectedContext: {
        project: { uuid: 'project-1', path: source },
        document: { uuid: 'document-1', documentType: 1, tabId: 'tab-1' },
      },
      preflightCalls: [
        ...phaseReadSpecs(1),
        {
          toolName: 'easyeda_board_dimensions',
          arguments: {},
          assertions: [{ pointer: '/reference', op: 'equals', value: 'R1' }],
        },
      ],
    });
    await assert.rejects(
      planWithDiscard(engine, boardReadOnSchematic),
      /currently support PCB \(3\) component placement\/layer\/lock only/,
    );

    const diagnosticPlan = await makePlan(engine, 'diagnostic-read', {
      preflightCalls: [
        ...phaseReadSpecs(3),
        {
          toolName: 'easyeda_component_probe',
          arguments: {},
          assertions: [{ pointer: '/reference', op: 'equals', value: 'R1' }],
        },
      ],
    });
    await assert.rejects(
      planWithDiscard(engine, diagnosticPlan),
      /not admitted as mutation proof/,
    );

    const previewPlan = await makePlan(engine, 'preview-document-plan', {
      expectedContext: {
        project: { uuid: 'project-1', path: source },
        document: { uuid: 'document-1', documentType: 15, tabId: 'tab-1' },
      },
    });
    await assert.rejects(
      planWithDiscard(engine, previewPlan),
      /currently support PCB \(3\) component placement\/layer\/lock only/,
    );
    assert.equal(
      upstream.calls.some((call) =>
        /schematic_components|pcb_components|board_dimensions|component_probe/.test(call.name),
      ),
      false,
    );
  });

  test('rejects capture reads and export writers that bypass dedicated facade gates', async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const capturePlan = await makePlan(engine, 'capture-bypass', {
      preflightCalls: [
        ...phaseReadSpecs(3),
        {
          toolName: 'easyeda_canvas_capture',
          arguments: {},
          assertions: [{ pointer: '/captured', op: 'equals', value: true }],
        },
      ],
    });
    await assert.rejects(
      planWithDiscard(engine, capturePlan),
      /dedicated capture or export facade gate/,
    );

    const exportPlan = await makePlan(engine, 'export-bypass', {
      applyCall: {
        toolName: 'easyeda_export_gerbers',
        arguments: { confirmWrite: true, projectId: 'project-1' },
      },
    });
    await assert.rejects(
      planWithDiscard(engine, exportPlan),
      /applyCall must be the facade-generated easyeda_control_exact_component_mutation/,
    );
    assert.equal(upstream.calls.some((call) => /capture|export/.test(call.name)), false);
  });

  test('rejects every caller-selected writer outside the exact component mutation facade', async () => {
    const pcbUpstream = new MockUpstream();
    const pcbEngine = new EasyedaControlEngine(pcbUpstream);
    for (const [label, toolName, argumentsValue] of [
      [
        'unreviewed-modify-writer',
        'easyeda_pcb_modify_component',
        { tabId: 'tab-1', componentId: 'R1', confirmWrite: true },
      ],
      [
        'unreviewed-add-writer',
        'easyeda_pcb_add_text',
        { tabId: 'tab-1', text: 'fixture', confirmWrite: true },
      ],
      [
        'workflow-writer-bypass',
        'easyeda_pcb_workflow_write',
        { tabId: 'tab-1', confirmWrite: true },
      ],
    ]) {
      const plan = await makePlan(pcbEngine, label, {
        applyCall: { toolName, arguments: argumentsValue },
      });
      await assert.rejects(
        planWithDiscard(pcbEngine, plan),
        /applyCall must be the facade-generated easyeda_control_exact_component_mutation/,
      );
    }

    const rawApply = await makePlan(pcbEngine, 'raw-writer-bypass', {
      applyCall: rawSpec('CALLER_SUPPLIED_RAW_APPLY'),
    });
    await assert.rejects(
      planWithDiscard(pcbEngine, rawApply),
      /applyCall must be the facade-generated easyeda_control_exact_component_mutation/,
    );
    const rawRollback = await makePlan(pcbEngine, 'raw-rollback-bypass', {
      rollbackCalls: [rawSpec('CALLER_SUPPLIED_RAW_ROLLBACK')],
    });
    await assert.rejects(
      planWithDiscard(pcbEngine, rawRollback),
      /rollbackCalls must contain exactly one facade-generated easyeda_control_exact_component_mutation/,
    );
    assert.equal(
      pcbUpstream.calls.some((call) =>
        /modify_component|add_text|workflow_write/.test(call.name),
      ),
      false,
    );
    assert.deepEqual(await artifacts.listOperations(), []);
  });

  test('invalidates a plan when the preflight snapshot drifts before apply', async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'preflight-drift'),
    );
    upstream.collateralState = 'external-drift';

    await assert.rejects(
      engine.apply(planned.operationId, planned.planHash),
      /Preflight state changed after planning/,
    );
    assert.equal(upstream.applyAttempts, 0);
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, 'plan-invalidated');
    assert.equal(journal.mutationState, 'none');
    assert.equal(journal.mutationMayHaveOccurred, false);
  });

  test('invalidates a plan when the durable database or pre-checkpoint drifts', async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'checkpoint-drift'),
    );
    execFileSync('sqlite3', [source, "UPDATE project_state SET value='external' WHERE id=1;"]);

    await assert.rejects(
      engine.apply(planned.operationId, planned.planHash),
      /project database changed or its checkpoint proof failed/,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, 'plan-invalidated');
    assert.equal(journal.hardStop, false);
    assert.equal(upstream.applyAttempts, 0);
  });

  test('does not claim applied-unsaved when apply changes the durable database', async () => {
    const upstream = new MockUpstream({ applyPersistence: 'logical' });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'apply-durable-drift'),
    );

    await assert.rejects(
      engine.apply(planned.operationId, planned.planHash),
      /checkpoint|durable|database/i,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.notEqual(journal.state, 'applied-unsaved');
    assert.equal(journal.hardStop, true);
    assert.equal(journal.mutationMayHaveOccurred, true);
    assert.equal(journal.orphanedCallPossible, false);
    assert.equal(journal.orphanedCallPhase, 'apply');
    assert.equal(typeof journal.orphanedCallReturnedAt, 'string');
    assert.equal(journal.runtimeRestartBoundary, undefined);
    assert.equal(upstream.applyAttempts, 1);
  });

  test('does not claim live-verified after the durable database changes', async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'verify-durable-drift'),
    );
    await engine.apply(planned.operationId, planned.planHash);
    execFileSync('sqlite3', [source, "UPDATE project_state SET value='external' WHERE id=1;"]);

    await assert.rejects(engine.verify(planned.operationId), /checkpoint|durable|database/i);
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.notEqual(journal.state, 'live-verified');
    assert.equal(journal.hardStop, true);
  });

  test('revalidates the stored runtime before live verification', async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'verify-runtime-drift'),
    );
    await engine.apply(planned.operationId, planned.planHash);
    const readsBefore = upstream.readStateCalls;
    upstream.options.serverVersion = '1.0.0-drifted';

    await assert.rejects(engine.verify(planned.operationId), /runtime fingerprint/);
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, 'applied-unsaved');
    assert.equal(journal.hardStop, true);
    assert.equal(journal.runtimeGuardFailure.phase, 'verify');
    assert.equal(journal.unknownPhase, undefined);
    assert.equal(upstream.readStateCalls, readsBefore);
  });

  test('revalidates the stored runtime before rollback', async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'rollback-runtime-drift'),
    );
    await engine.apply(planned.operationId, planned.planHash);
    upstream.options.serverVersion = '1.0.0-drifted';

    await assert.rejects(
      engine.rollback(planned.operationId, planned.planHash),
      /runtime fingerprint/,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, 'applied-unsaved');
    assert.equal(journal.runtimeGuardFailure.phase, 'rollback');
    assert.equal(journal.unknownPhase, undefined);
    assert.equal(upstream.rollbackAttempts, 0);
  });

  test('revalidates the stored runtime before save and reopen', async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'save-runtime-drift'),
    );
    await engine.apply(planned.operationId, planned.planHash);
    await engine.verify(planned.operationId);
    upstream.options.serverVersion = '1.0.0-drifted';

    await assert.rejects(
      engine.saveReopen(planned.operationId, planned.planHash),
      /runtime fingerprint/,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, 'live-verified');
    assert.equal(journal.runtimeGuardFailure.phase, 'save-reopen');
    assert.equal(journal.unknownPhase, undefined);
    assert.equal(upstream.saveAttempts, 0);
  });

  test('recovery runtime failure preserves the original unknown phase', async () => {
    const upstream = new MockUpstream({ applyError: applyTimeout() });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'recovery-runtime-drift'),
    );
    await assert.rejects(engine.apply(planned.operationId, planned.planHash), /timed out/);
    upstream.options.serverVersion = '1.0.0-drifted';

    await assert.rejects(
      engine.recover(planned.operationId, 'reconciled-no-mutation', {
        runtimeRestartConfirmation: await restartConfirmation(planned.operationId),
      }),
      /runtime fingerprint/,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, 'unknown');
    assert.equal(journal.unknownPhase, 'apply');
    assert.equal(journal.runtimeGuardFailure.phase, 'recovery-runtime-restart-boundary');
    assert.equal(journal.hardStop, true);
  });

  test('stored runtime checks rerun public and private fingerprint validators', async () => {
    const cases = [
      {
        label: 'stored-public-fingerprint',
        mutate(operation) {
          operation.plan.capabilityLevel = 'public-supported';
          delete operation.plan.expectedFingerprint.upstreamLauncher.args;
        },
        expected: /expectedFingerprint must pin a connected/,
      },
      {
        label: 'stored-private-fingerprint',
        mutate(operation) {
          operation.plan.expectedFingerprint.installedBundles.publicApi.declarationsSha256 =
            digest('7');
        },
        expected: /compatibility tuple/,
      },
    ];
    for (let index = 0; index < cases.length; index += 1) {
      if (index > 0) await resetFixture();
      const scenario = cases[index];
      const upstream = new MockUpstream();
      const engine = new EasyedaControlEngine(upstream);
      const planned = await planWithDiscard(
        engine,
        await makePlan(engine, scenario.label),
      );
      await engine.apply(planned.operationId, planned.planHash);
      const operation = await artifacts.loadOperation(planned.operationId);
      scenario.mutate(operation);
      operation.planHash = buildPlanHash(operation.plan);
      await artifacts.updateOperation(operation);
      const callsBeforeVerify = upstream.calls.length;

      await assert.rejects(engine.verify(planned.operationId), scenario.expected);
      assert.equal(upstream.calls.length, callsBeforeVerify);
      const guarded = await artifacts.loadOperation(planned.operationId);
      assert.equal(guarded.state, 'applied-unsaved');
      assert.equal(guarded.hardStop, true);
      assert.equal(guarded.runtimeGuardFailure.phase, 'verify');
      assert.match(guarded.runtimeGuardFailure.error.message, scenario.expected);
    }
  });

  test('records a write timeout as unknown and hard-stops without blind retry', async () => {
    const upstream = new MockUpstream({ applyError: applyTimeout() });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(engine, await makePlan(engine, 'write-timeout'));

    await assert.rejects(engine.apply(planned.operationId, planned.planHash), /timed out/);
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, 'unknown');
    assert.equal(journal.mutationState, 'unknown');
    assert.equal(journal.hardStop, true);
    assert.equal(journal.mutationMayHaveOccurred, true);
    assert.match(journal.nextSafeAction, /Do not retry or save/);
    assert.equal(upstream.applyAttempts, 1);
    const restartChallenge = journal.runtimeRestartChallenge;
    assert.match(
      restartChallenge,
      new RegExp(`^EASYEDA_RESTARTED_AND_RECONNECTED:${planned.operationId}:apply:`),
    );

    await assert.rejects(
      engine.apply(planned.operationId, planned.planHash),
      /state unknown, not preflight-proven/,
    );
    assert.equal(upstream.applyAttempts, 1);
    await assert.rejects(
      engine.recover(planned.operationId, 'reconciled-no-mutation'),
      (error) => {
        assert.equal(
          error.requiredRuntimeRestartConfirmation,
          restartChallenge,
        );
        assert.equal(error.orphanedCallPhase, 'apply');
        return true;
      },
    );
    await assert.rejects(
      engine.recover(planned.operationId, 'reconciled-no-mutation', {
        runtimeRestartConfirmation: 'EASYEDA_RESTARTED_AND_RECONNECTED:wrong-operation',
      }),
      /runtimeRestartConfirmation/,
    );
    const recovered = await engine.recover(planned.operationId, 'reconciled-no-mutation', {
      runtimeRestartConfirmation: restartChallenge,
    });
    assert.equal(recovered.state, 'reconciled-no-mutation');
    assert.equal(recovered.orphanedCallPossible, false);
    assert.equal(recovered.orphanedCallPhase, 'recovery-target-activation');
    const recoveredJournal = await artifacts.loadOperation(planned.operationId);
    assert.equal(recoveredJournal.orphanedCallPossible, false);
    assert.equal(
      recoveredJournal.runtimeRestartBoundary.confirmationSha256,
      sha256Text(restartChallenge),
    );
    assert.equal(
      recoveredJournal.runtimeRestartBoundary.storedRuntimeFingerprintMatchedAfterReconnect,
      true,
    );
    assert.match(recoveredJournal.runtimeRestartBoundary.limitation, /cannot independently prove/);
    assert.ok(
      recoveredJournal.artifacts.some((artifact) =>
        artifact.path.includes('runtime-restart-boundary'),
      ),
    );
  });

  test('verification failure hard-stops and blocks save until explicit rollback', async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'verification-failure'),
    );
    await engine.apply(planned.operationId, planned.planHash);
    upstream.state = 'unexpected-live-state';

    await assert.rejects(
      engine.verify(planned.operationId),
      /Live verification failed|easyeda_control_exact_read failed/,
    );
    const failed = await artifacts.loadOperation(planned.operationId);
    assert.equal(failed.state, 'verification-failed');
    assert.equal(failed.hardStop, true);
    assert.match(failed.nextSafeAction, /Do not save/);
    await assert.rejects(
      engine.saveReopen(planned.operationId, planned.planHash),
      /cannot save\/reopen from state verification-failed/,
    );
    assert.equal(upstream.saveAttempts, 0);
    await assert.rejects(
      engine.rollback(planned.operationId, planned.planHash),
      /fresh exact readback could not prove the complete intended unsaved state/,
    );
    assert.equal(upstream.rollbackAttempts, 0);
  });

  test('rebinds a restarted target tab before no-mutation recovery reads', async () => {
    const upstream = new MockUpstream({ applyError: applyTimeout() });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'restart-tab-rebind'),
    );
    await assert.rejects(engine.apply(planned.operationId, planned.planHash), /timed out/);
    const oldPlanHash = planned.planHash;
    upstream.activeTabId = 'post-restart-tab';

    const recovered = await engine.recover(planned.operationId, 'reconciled-no-mutation', {
      runtimeRestartConfirmation: await restartConfirmation(planned.operationId),
    });
    assert.equal(recovered.state, 'reconciled-no-mutation');
    assert.notEqual(recovered.planHash, oldPlanHash);
    assert.equal(upstream.recoveryActivationAttempts, 1);
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.plan.expectedContext.document.tabId, 'post-restart-tab');
    assert.equal(journal.context.document.tabId, 'post-restart-tab');
    assert.equal(journal.planHash, buildPlanHash(journal.plan));
    assert.equal(
      journal.runtimeRestartBoundary.reboundTabId,
      'post-restart-tab',
    );
  });

  test('rejects applied-unsaved classification after a restart/discard boundary', async () => {
    const upstream = new MockUpstream({
      applyError: applyTimeout(),
      applyMutatesBeforeError: true,
    });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'restart-cannot-preserve-unsaved'),
    );
    await assert.rejects(engine.apply(planned.operationId, planned.planHash), /timed out/);

    await assert.rejects(
      engine.recover(planned.operationId, 'reconciled-applied-unsaved', {
        runtimeRestartConfirmation: await restartConfirmation(planned.operationId),
      }),
      /Applied-unsaved recovery is illegal after .* restart\/discard boundary/,
    );
    assert.equal(upstream.recoveryActivationAttempts, 0);
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.orphanedCallPossible, false);
    assert.equal(journal.runtimeRestartChallenge, undefined);
  });

  test('allows exact no-mutation recovery from saving before dispatch', async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'saving-before-dispatch'),
    );
    await engine.apply(planned.operationId, planned.planHash);
    await engine.verify(planned.operationId);
    const interrupted = await artifacts.loadOperation(planned.operationId);
    interrupted.state = 'saving';
    interrupted.mutationState = 'applied-unsaved';
    interrupted.orphanedCallPossible = false;
    interrupted.hardStop = true;
    await artifacts.updateOperation(interrupted);
    upstream.state = 'baseline';
    upstream.activeTabId = 'post-process-restart-tab';

    const recovered = await engine.recover(
      planned.operationId,
      'reconciled-no-mutation',
    );
    assert.equal(recovered.state, 'reconciled-no-mutation');
    assert.equal(recovered.mutationState, 'none');
    assert.equal(upstream.recoveryActivationAttempts, 1);
  });

  test('preserves the origin state when recovery target activation times out', async () => {
    const upstream = new MockUpstream({ recoveryActivationErrorsRemaining: 1 });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'activation-origin-state'),
    );
    await engine.apply(planned.operationId, planned.planHash);
    await engine.verify(planned.operationId);
    const interrupted = await artifacts.loadOperation(planned.operationId);
    interrupted.state = 'saving';
    interrupted.mutationState = 'applied-unsaved';
    interrupted.orphanedCallPossible = false;
    await artifacts.updateOperation(interrupted);
    upstream.persistDatabase();

    await assert.rejects(
      engine.recover(planned.operationId, 'reconciled-no-mutation'),
      /timed out/,
    );
    const activationUnknown = await artifacts.loadOperation(planned.operationId);
    assert.equal(activationUnknown.state, 'recovery-target-activation-unknown');
    assert.equal(activationUnknown.recoveryActivationResumeState, 'saving');
    assert.equal(activationUnknown.orphanedCallPossible, true);

    const recovered = await engine.recover(
      planned.operationId,
      'reconciled-saved-reopened',
      {
        runtimeRestartConfirmation: await restartConfirmation(planned.operationId),
        confirmDiscardAnyUnsavedState: true,
      },
    );
    assert.equal(recovered.state, 'completed');
    assert.equal(upstream.reopenAttempts, 1);
  });

  test('rejects undeclared collateral changes outside the target primitive set', async () => {
    const upstream = new MockUpstream({ applyCollateral: true });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'undeclared-collateral'),
    );
    await engine.apply(planned.operationId, planned.planHash);

    await assert.rejects(
      engine.verify(planned.operationId),
      /changed one or more non-target component scalar records/,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, 'verification-failed');
    assert.equal(journal.hardStop, true);
    assert.equal(upstream.state, 'applied');
    assert.equal(upstream.collateralState, 'changed');
  });

  test('masks only explicitly declared direct-pad transform consequences', async () => {
    const upstream = new MockUpstream({ targetPadTransformChanges: true });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'declared-target-pad-transform', {
        targetChanges: [
          { primitiveId: 'R1', pointer: '/x', before: 100, after: 200 },
          { primitiveId: 'R1', pointer: '/pads/0/x', before: 101, after: 201 },
        ],
      }),
    );
    await engine.apply(planned.operationId, planned.planHash);

    const verified = await engine.verify(planned.operationId);
    assert.equal(verified.state, 'live-verified');
    assert.equal(upstream.state, 'applied');
  });

  test('rejects undeclared orthogonal drift on a target-owned direct pad', async () => {
    const upstream = new MockUpstream({
      targetPadTransformChanges: true,
      targetPadDirectOrthogonalDrift: true,
    });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'target-pad-orthogonal-drift', {
        targetChanges: [
          { primitiveId: 'R1', pointer: '/x', before: 100, after: 200 },
          { primitiveId: 'R1', pointer: '/pads/0/x', before: 101, after: 201 },
        ],
      }),
    );
    await engine.apply(planned.operationId, planned.planHash);

    await assert.rejects(
      engine.verify(planned.operationId),
      /changed the PCB primitive inventory or .*pad/,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, 'verification-failed');
    assert.equal(journal.hardStop, true);
  });

  test('rejects a direct-pad value that disagrees with its declared consequence', async () => {
    const upstream = new MockUpstream({
      targetPadTransformChanges: true,
      targetPadDirectDeclaredMismatch: true,
    });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'target-pad-declaration-mismatch', {
        targetChanges: [
          { primitiveId: 'R1', pointer: '/x', before: 100, after: 200 },
          { primitiveId: 'R1', pointer: '/pads/0/x', before: 101, after: 201 },
        ],
      }),
    );
    await engine.apply(planned.operationId, planned.planHash);

    await assert.rejects(
      engine.verify(planned.operationId),
      /direct pad R1-pad-1\/x disagrees with its declared after consequence/,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, 'verification-failed');
    assert.equal(journal.hardStop, true);
  });

  test('does not mask target-owned pad lock drift when only the component lock changed', async () => {
    const upstream = new MockUpstream({
      lockOnlyTargetMutation: true,
      targetPadPrimitiveLockChanges: true,
    });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'target-pad-lock-collateral', {
        targetChanges: [
          { primitiveId: 'R1', pointer: '/primitiveLock', before: false, after: true },
        ],
        verifyCalls: phaseReadSpecs(3),
        verifyAssertions: [
          {
            pointer: '/1/byPrimitiveId/R1/primitiveLock',
            op: 'equals',
            value: true,
          },
        ],
        reopenedVerifyCalls: phaseReadSpecs(3),
        reopenedAssertions: [
          {
            pointer: '/1/byPrimitiveId/R1/primitiveLock',
            op: 'equals',
            value: true,
          },
        ],
      }),
    );
    await engine.apply(planned.operationId, planned.planHash);

    await assert.rejects(
      engine.verify(planned.operationId),
      /changed the PCB primitive inventory or .*pad/,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, 'verification-failed');
    assert.equal(journal.hardStop, true);
  });

  test('normal save rejects a physical-only database rewrite', async () => {
    const upstream = new MockUpstream({ savePersistence: 'physical-only' });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'physical-only-save'),
    );
    await engine.apply(planned.operationId, planned.planHash);
    await engine.verify(planned.operationId);

    await assert.rejects(
      engine.saveReopen(planned.operationId, planned.planHash),
      /logical|checkpoint|durable|database/i,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.notEqual(journal.state, 'completed');
    assert.equal(journal.hardStop, true);
  });

  test('normal save rejects pre-checkpoint corruption during the save call', async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'checkpoint-corrupt-during-save'),
    );
    await engine.apply(planned.operationId, planned.planHash);
    await engine.verify(planned.operationId);
    upstream.options.onSave = async () => {
      const journal = await artifacts.loadOperation(planned.operationId);
      execFileSync('sqlite3', [
        journal.preCheckpoint.checkpoint,
        "UPDATE project_state SET value='tampered-checkpoint' WHERE id=1;",
      ]);
    };

    await assert.rejects(
      engine.saveReopen(planned.operationId, planned.planHash),
      /checkpoint|durable|database/i,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    assert.notEqual(journal.state, 'completed');
    assert.equal(journal.hardStop, true);
  });

  test('rejects a complete but different runtime fingerprint before context or checkpoint', async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const plan = await makePlan(engine, 'private-mismatch');
    plan.expectedFingerprint.upstreamLauncher.dependencyLock.sha256 = digest('7');

    await assert.rejects(planWithDiscard(engine, plan), (error) => {
      assert.match(error.message, /compatibility tuple/);
      assert.deepEqual(error.mismatches, [
        {
          pointer: '/upstream/launcher/dependencyLock/sha256',
          expected: loadReviewedCompatibilityManifest().upstream.launcher.dependencyLock.sha256,
          actual: digest('7'),
        },
      ]);
      return true;
    });
    assert.equal(upstream.contextCalls, 0);
    assert.deepEqual(await artifacts.listOperations(), []);
  });

  test('rejects private plans when an installed API or PCB bundle hash is unreviewed', async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const plan = await makePlan(engine, 'private-bundle-mismatch');
    plan.expectedFingerprint.installedBundles.publicApi.declarationsSha256 = digest('7');

    await assert.rejects(planWithDiscard(engine, plan), (error) => {
      assert.match(error.message, /compatibility tuple/);
      assert.deepEqual(error.mismatches, [
        {
          pointer: '/installedBundles/publicApi/declarationsSha256',
          expected: '32a0d2f8b4bc3d7b2b93b33499d9d768b0c23c77f45843a65166cf4e8ad6dab1',
          actual: digest('7'),
        },
      ]);
      return true;
    });
    assert.equal(upstream.contextCalls, 0);
    assert.deepEqual(await artifacts.listOperations(), []);
  });

  test('allows only state-compatible recovery resolutions', async () => {
    const upstream = new MockUpstream();
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'recovery-transitions'),
    );

    await assert.rejects(
      engine.recover(planned.operationId, 'reconciled-applied-unsaved'),
      /not legal from operation state preflight-proven/,
    );
    await assert.rejects(
      engine.recover(planned.operationId, 'reconciled-saved-reopened'),
      /not legal from operation state preflight-proven/,
    );

    await engine.apply(planned.operationId, planned.planHash);
    await assert.rejects(
      engine.recover(planned.operationId, 'reconciled-saved-reopened'),
      /not legal from operation state applied-unsaved/,
    );
    assert.equal(
      (await engine.rollback(planned.operationId, planned.planHash)).state,
      'rolled-back',
    );
  });

  test('blocks recovery when the stored pre-checkpoint receipt is corrupt', async () => {
    const upstream = new MockUpstream({ applyError: applyTimeout() });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'corrupt-pre-checkpoint'),
    );
    await assert.rejects(engine.apply(planned.operationId, planned.planHash), /timed out/);

    const journal = await artifacts.loadOperation(planned.operationId);
    const receipt = JSON.parse(await readFile(journal.preCheckpoint.receiptPath, 'utf8'));
    receipt.createdAt = '2000-01-01T00:00:00.000Z';
    await writeFile(
      journal.preCheckpoint.receiptPath,
      `${JSON.stringify(receipt, null, 2)}\n`,
      'utf8',
    );
    await assert.rejects(
      engine.recover(planned.operationId, 'reconciled-no-mutation', {
        runtimeRestartConfirmation: await restartConfirmation(planned.operationId),
      }),
      /pre-checkpoint integrity could not be proved/,
    );
    assert.equal((await artifacts.loadOperation(planned.operationId)).state, 'unknown');
  });

  test('cannot classify an apply timeout as saved and reopened', async () => {
    const upstream = new MockUpstream({ applyError: applyTimeout() });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'false-saved-recovery'),
    );
    await assert.rejects(engine.apply(planned.operationId, planned.planHash), /timed out/);

    await assert.rejects(
      engine.recover(planned.operationId, 'reconciled-saved-reopened', {
        confirmDiscardAnyUnsavedState: true,
      }),
      /unknown apply cannot be reconciled as saved\/reopened/,
    );
    assert.equal(upstream.reopenAttempts, 0);
    assert.equal(
      (
        await engine.recover(planned.operationId, 'reconciled-no-mutation', {
          runtimeRestartConfirmation: await restartConfirmation(planned.operationId),
        })
      ).state,
      'reconciled-no-mutation',
    );
  });

  test('requires explicit discard confirmation before reopen-only saved recovery', async () => {
    const upstream = new MockUpstream({ saveError: applyTimeout() });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'reopen-only-recovery'),
    );
    await engine.apply(planned.operationId, planned.planHash);
    await engine.verify(planned.operationId);
    await assert.rejects(
      engine.saveReopen(planned.operationId, planned.planHash),
      /timed out/,
    );
    const uncertain = await artifacts.loadOperation(planned.operationId);
    assert.equal(uncertain.state, 'unknown');
    assert.equal(uncertain.unknownPhase, 'save-reopen');
    assert.equal(uncertain.orphanedCallPossible, true);
    assert.equal(uncertain.orphanedCallPhase, 'save-reopen');

    await assert.rejects(
      engine.recover(planned.operationId, 'reconciled-saved-reopened'),
      /terminate EasyEDA Pro, restart it, reconnect the bridge/,
    );
    await assert.rejects(
      engine.recover(planned.operationId, 'reconciled-saved-reopened', {
        runtimeRestartConfirmation: await restartConfirmation(planned.operationId),
      }),
      /confirmDiscardAnyUnsavedState=true/,
    );
    assert.equal(upstream.reopenAttempts, 0);

    const recovered = await engine.recover(
      planned.operationId,
      'reconciled-saved-reopened',
      { confirmDiscardAnyUnsavedState: true },
    );
    assert.equal(recovered.state, 'completed');
    assert.equal(recovered.saved, true);
    assert.equal(recovered.reopened, true);
    assert.equal(upstream.saveAttempts, 1);
    assert.equal(upstream.reopenAttempts, 1);
    const completed = await artifacts.loadOperation(planned.operationId);
    assert.equal(completed.finalCheckpoint.schema, 'easyeda-pro-control.checkpoint.v1');
    assert.match(
      completed.artifacts.at(-1).path,
      /recovery-reconciled-saved-reopened-[a-f0-9-]{36}\.json$/,
    );
  });

  test('saved recovery discards active editor changes before reopened verification', async () => {
    const upstream = new MockUpstream({ reopenState: 'baseline' });
    const engine = new EasyedaControlEngine(upstream);
    const { planned, failed } = await reachSavedVerificationFailure(
      engine,
      upstream,
      'saved-active-editor-bypass',
    );
    const readsBeforeRecovery = upstream.readStateCalls;
    const eventsBeforeRecovery = upstream.events.length;

    await assert.rejects(
      engine.recover(planned.operationId, 'reconciled-saved-reopened'),
      /confirmDiscardAnyUnsavedState=true/,
    );
    assert.equal(upstream.reopenAttempts, 0);
    assert.equal(upstream.readStateCalls, readsBeforeRecovery);
    assert.equal(upstream.events.length, eventsBeforeRecovery);

    let dispatchJournal;
    upstream.options.onReopen = async () => {
      dispatchJournal = await artifacts.loadOperation(planned.operationId);
    };
    await assert.rejects(
      engine.recover(
        planned.operationId,
        'reconciled-saved-reopened',
        { confirmDiscardAnyUnsavedState: true },
      ),
      /assertion/i,
    );
    assert.equal(upstream.reopenAttempts, 1);
    assert.equal(upstream.state, 'baseline');
    assert.match(dispatchJournal.state, /reopen.*dispatch/i);
    assert.equal(dispatchJournal.hardStop, true);
    assert.equal(dispatchJournal.mutationMayHaveOccurred, true);
    const recoveryEvents = upstream.events.slice(eventsBeforeRecovery);
    assert.equal(recoveryEvents[0], 'reopen-only:1');
    assert.match(recoveryEvents[1], /^read-state:\d+:baseline$/);

    const journal = await artifacts.loadOperation(planned.operationId);
    assert.equal(journal.state, 'recovery-verification-failed');
    assert.equal(journal.hardStop, true);
    assert.equal(journal.finalCheckpoint, undefined);
    const addedArtifacts = journal.artifacts.slice(failed.artifacts.length);
    assert.ok(addedArtifacts.length >= 1);
    const reopenEvidence = JSON.parse(await readFile(addedArtifacts[0].path, 'utf8'));
    assert.deepEqual(
      {
        saved: reopenEvidence.payload?.saved,
        closed: reopenEvidence.payload?.closed,
        reopened: reopenEvidence.payload?.reopened,
      },
      { saved: false, closed: true, reopened: true },
    );
  });

  test('saved recovery rejects a physical-only source rewrite', async () => {
    const upstream = new MockUpstream({
      savePersistence: 'physical-only',
      saveError: applyTimeout(),
    });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'physical-only-recovery'),
    );
    await engine.apply(planned.operationId, planned.planHash);
    await engine.verify(planned.operationId);
    await assert.rejects(
      engine.saveReopen(planned.operationId, planned.planHash),
      /timed out/,
    );

    await assert.rejects(
      engine.recover(planned.operationId, 'reconciled-saved-reopened', {
        confirmDiscardAnyUnsavedState: true,
        runtimeRestartConfirmation: await restartConfirmation(planned.operationId),
      }),
      /logical|demonstrably changed|database/i,
    );
    assert.equal(upstream.reopenAttempts, 0);
  });

  test('saved recovery rejects a changed pre-checkpoint artifact', async () => {
    const upstream = new MockUpstream({ saveError: applyTimeout() });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'corrupt-saved-recovery'),
    );
    await engine.apply(planned.operationId, planned.planHash);
    await engine.verify(planned.operationId);
    await assert.rejects(
      engine.saveReopen(planned.operationId, planned.planHash),
      /timed out/,
    );
    const journal = await artifacts.loadOperation(planned.operationId);
    execFileSync('sqlite3', [
      journal.preCheckpoint.checkpoint,
      "UPDATE project_state SET value='tampered-checkpoint' WHERE id=1;",
    ]);

    await assert.rejects(
      engine.recover(planned.operationId, 'reconciled-saved-reopened', {
        confirmDiscardAnyUnsavedState: true,
        runtimeRestartConfirmation: await restartConfirmation(planned.operationId),
      }),
      /intact pre-checkpoint|checkpoint|integrity/i,
    );
    assert.equal(upstream.reopenAttempts, 0);
  });

  test('requires confirmation before repeating an uncertain recovery reopen', async () => {
    const upstream = new MockUpstream({
      saveError: applyTimeout(),
      reopenErrorsRemaining: 1,
    });
    const engine = new EasyedaControlEngine(upstream);
    const planned = await planWithDiscard(
      engine,
      await makePlan(engine, 'repeat-recovery-reopen'),
    );
    await engine.apply(planned.operationId, planned.planHash);
    await engine.verify(planned.operationId);
    await assert.rejects(
      engine.saveReopen(planned.operationId, planned.planHash),
      /timed out/,
    );
    const firstRestartChallenge = await restartConfirmation(planned.operationId);
    await assert.rejects(
      engine.recover(planned.operationId, 'reconciled-saved-reopened', {
        confirmDiscardAnyUnsavedState: true,
        runtimeRestartConfirmation: firstRestartChallenge,
      }),
      /timed out/,
    );
    const retryUnknown = await artifacts.loadOperation(planned.operationId);
    assert.equal(retryUnknown.state, 'recovery-reopen-unknown');
    assert.equal(retryUnknown.orphanedCallPossible, true);
    assert.equal(retryUnknown.orphanedCallPhase, 'recovery-reopen');
    assert.equal(upstream.reopenAttempts, 1);
    const secondRestartChallenge = retryUnknown.runtimeRestartChallenge;
    assert.notEqual(secondRestartChallenge, firstRestartChallenge);

    await assert.rejects(
      engine.recover(planned.operationId, 'reconciled-saved-reopened', {
        confirmDiscardAnyUnsavedState: true,
        runtimeRestartConfirmation: firstRestartChallenge,
      }),
      /current nonce-bound runtimeRestartChallenge/,
    );
    assert.equal(upstream.reopenAttempts, 1);

    await assert.rejects(
      engine.recover(planned.operationId, 'reconciled-saved-reopened', {
        confirmDiscardAnyUnsavedState: true,
        runtimeRestartConfirmation: secondRestartChallenge,
      }),
      /confirmRepeatAfterUnknownRecovery=true/,
    );
    assert.equal(upstream.reopenAttempts, 1);

    const recovered = await engine.recover(
      planned.operationId,
      'reconciled-saved-reopened',
      {
        confirmDiscardAnyUnsavedState: true,
        confirmRepeatAfterUnknownRecovery: true,
      },
    );
    assert.equal(recovered.state, 'completed');
    assert.equal(upstream.reopenAttempts, 2);
  });
});
