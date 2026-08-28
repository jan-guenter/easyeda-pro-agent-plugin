import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  assertReviewedLocalGenericReadArguments,
  assertSubset,
  buildPlanHash,
  canonicalJson,
  classifyTool,
  compareSubset,
  controlImplementationFingerprint,
  evaluateAssertions,
  extractToolPayload,
  filterTools,
  getJsonPointer,
  isRecord,
  isReviewedLocalGenericRead,
  isTerminalOperation,
  loadReviewedCompatibilityManifest,
  newOperationId,
  normalizeEasyedaProjectPath,
  normalizeProofEnvelope,
  normalizeToolResult,
  operationHasOrphanedCallRisk,
  operationSummary,
  reviewedCompatibilityManifestFingerprint,
  reviewedCompatibilityManifestPath,
  sha256Json,
  sha256Text,
  stable,
  validateCallSource,
  validateEvidencePaths,
  validateExpectedFingerprint,
  validatePrivateFingerprint,
  validateRawExecutionInput,
} from "../src/core.ts";
import type { ExpectedFingerprint } from "../src/core.ts";

function detailedError(error: unknown): Error & Record<string, unknown> {
  if (!(error instanceof Error) || !isRecord(error)) {
    throw new TypeError("Expected an Error with structured details.");
  }
  return error;
}

function reviewedFingerprintFixture(): ExpectedFingerprint {
  const manifest = loadReviewedCompatibilityManifest();
  const facade = manifest.facadeImplementation["source-tree"];
  return {
    facadeImplementation: {
      version: facade.version,
      operationSchema: facade.operationSchema,
      mode: "source-tree",
      files: facade.files.map((file) => ({
        path: `/opt/easyeda-control/server/src/${file.relativePath}`,
        ...file,
      })),
      sha256: facade.sha256,
    },
    upstreamServer: { version: manifest.upstream.serverVersion },
    upstreamLauncher: structuredClone(manifest.upstream.launcher),
    upstreamImplementationDrift: false,
    reviewedCompatibilityManifest: reviewedCompatibilityManifestFingerprint(),
    toolCatalogSha256: manifest.upstream.toolCatalog.sha256,
    toolCount: manifest.upstream.toolCatalog.count,
    health: {
      payload: {
        version: manifest.connectedRuntime.healthVersion,
        node_version: manifest.connectedRuntime.nodeVersion,
        bridge_connected: true,
        easyeda_version: manifest.connectedRuntime.easyedaVersion,
        extension_version: manifest.connectedRuntime.extensionVersion,
        extension_version_mismatch: false,
        registry_mismatch: false,
      },
    },
    bridge: {
      payload: {
        connected: true,
        bridge_version: manifest.connectedRuntime.bridgeVersion,
        easyeda_version: manifest.connectedRuntime.bridgeEasyedaVersion,
        diagnostics: {
          method_registry_hash: manifest.connectedRuntime.methodRegistryHash,
        },
      },
    },
    bridgeDispatcher: {
      payload: {
        source: manifest.connectedRuntime.dispatcher.source,
        dispatcher_build_id: manifest.connectedRuntime.dispatcher.buildId,
        total: manifest.connectedRuntime.dispatcher.total,
      },
    },
    installedBundles: {
      available: true,
      assetsRoot: "/opt/easyeda/assets",
      pcbEditor: {
        version: manifest.installedBundles.pcbEditor.version,
        implementationPath: "/opt/easyeda/assets/pro-pcb/pcb.js",
        implementationSha256:
          manifest.installedBundles.pcbEditor.implementationSha256,
      },
      publicApi: {
        version: manifest.installedBundles.publicApi.version,
        implementationPath: "/opt/easyeda/assets/pro-api/api.js",
        implementationSha256:
          manifest.installedBundles.publicApi.implementationSha256,
        adapterPath: "/opt/easyeda/assets/pro-api/api-types.js",
        adapterSha256: manifest.installedBundles.publicApi.adapterSha256,
        declarationsPath: "/opt/easyeda/assets/pro-api/api-types.d.ts",
        declarationsSha256:
          manifest.installedBundles.publicApi.declarationsSha256,
      },
    },
  };
}

void describe("canonical values and hashes", () => {
  void test("stable recursively sorts object keys without reordering arrays", () => {
    const input = {
      z: 1,
      nested: { beta: true, alpha: false },
      array: [{ y: 2, x: 1 }, "unchanged"],
    };

    assert.deepEqual(stable(input), {
      array: [{ x: 1, y: 2 }, "unchanged"],
      nested: { alpha: false, beta: true },
      z: 1,
    });
    assert.equal(
      canonicalJson(input),
      '{"array":[{"x":1,"y":2},"unchanged"],"nested":{"alpha":false,"beta":true},"z":1}',
    );
    assert.equal(sha256Json({ b: 2, a: 1 }), sha256Json({ a: 1, b: 2 }));
  });

  void test("operation IDs carry a sortable UTC timestamp and a random suffix", () => {
    const operationId = newOperationId(new Date("2026-08-27T09:08:07.654Z"));
    assert.match(operationId, /^easyeda-20260827t090807z-[0-9a-f]{8}$/u);
    assert.equal(operationId, operationId.toLowerCase());
  });
});

void describe("upstream result normalization and tool classification", () => {
  void test("normalization rejects every supported outer and nested failure signal", () => {
    const failures = [
      { isError: true },
      { structuredContent: { ok: false } },
      { structuredContent: { success: false } },
      { structuredContent: { result: { ok: false } } },
      { structuredContent: { result: { success: false } } },
    ];

    for (const failure of failures) {
      assert.equal(normalizeToolResult(failure).ok, false);
    }
    assert.equal(
      normalizeToolResult({ structuredContent: { ok: true } }).ok,
      true,
    );
    assert.equal(normalizeToolResult().ok, false);
  });

  void test("proof normalization removes only envelope retry metadata", () => {
    const nestedDesignState = {
      stable: false,
      attempts: 99,
      persistedMode: "design-owned",
    };
    assert.deepEqual(
      normalizeProofEnvelope({
        kind: "pcb-rules",
        read_consistency: { stable: true, attempts: 2 },
        configuration: { read_consistency: nestedDesignState },
      }),
      {
        kind: "pcb-rules",
        configuration: { read_consistency: nestedDesignState },
      },
    );
  });

  void test("payload extraction unwraps bounded result envelopes and parses text fallback", () => {
    assert.deepEqual(
      extractToolPayload({
        structuredContent: {
          ok: true,
          result: { success: true, result: { count: 608 } },
        },
      }),
      { count: 608 },
    );
    assert.deepEqual(
      extractToolPayload({
        content: [{ type: "text", text: '{"documentType":3}' }],
      }),
      { documentType: 3 },
    );
    assert.deepEqual(
      extractToolPayload({ content: [{ type: "text", text: "not json" }] }),
      { text: "not json" },
    );
    assert.throws(
      () =>
        extractToolPayload({ structuredContent: { result: { ok: false } } }),
      /reported failure/u,
    );
  });

  void test("payload extraction rejects nested and text-only unavailable or unstable reads", () => {
    const rejected = [
      {
        structuredContent: {
          ok: true,
          result: { result: { not_available: true, reason: "bridge gap" } },
        },
      },
      {
        structuredContent: {
          ok: true,
          result: { read_consistency: { stable: false, attempts: 3 } },
        },
      },
      {
        content: [
          {
            type: "text",
            text: JSON.stringify({ ok: true, result: { not_available: true } }),
          },
        ],
      },
      {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              ok: true,
              result: { result: { read_consistency: { stable: false } } },
            }),
          },
        ],
      },
    ];
    for (const result of rejected) {
      assert.throws(
        () => extractToolPayload(result),
        /failure|unavailability/u,
      );
    }

    assert.deepEqual(
      extractToolPayload({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              ok: true,
              result: { read_consistency: { stable: true }, count: 608 },
            }),
          },
        ],
      }),
      { read_consistency: { stable: true }, count: 608 },
    );
  });

  void test("classification is conservative when schemas or names imply a write", () => {
    assert.deepEqual(
      classifyTool({
        name: "easyeda_get_document",
        annotations: { readOnlyHint: true, idempotentHint: true },
        inputSchema: { properties: {} },
      }),
      {
        readOnly: true,
        write: false,
        hasConfirmWrite: false,
        idempotent: true,
      },
    );

    const confirmed = classifyTool({
      name: "easyeda_execute",
      annotations: { readOnlyHint: true },
      inputSchema: { properties: { confirmWrite: { type: "boolean" } } },
    });
    assert.equal(confirmed.readOnly, false);
    assert.equal(confirmed.write, true);
    assert.equal(confirmed.hasConfirmWrite, true);

    const namedWrite = classifyTool({
      name: "easyeda_project_save",
      annotations: { readOnlyHint: true },
      inputSchema: { properties: {} },
    });
    assert.equal(namedWrite.readOnly, false);
    assert.equal(namedWrite.write, true);

    const pinnedVerifier = classifyTool({
      name: "easyeda_schematic_verify_write",
      annotations: { readOnlyHint: true, idempotentHint: true },
      inputSchema: { properties: {} },
    });
    assert.deepEqual(pinnedVerifier, {
      readOnly: true,
      write: false,
      hasConfirmWrite: false,
      idempotent: true,
    });
  });

  void test("generic reads use an explicit local-only allowlist", () => {
    assert.equal(isReviewedLocalGenericRead("easyeda_pcb_components"), true);
    assert.equal(isReviewedLocalGenericRead("easyeda_bom_generate"), true);
    assert.equal(isReviewedLocalGenericRead("easyeda_bom_validate"), false);
    assert.equal(isReviewedLocalGenericRead("easyeda_bom_sourcing"), false);
    assert.equal(
      isReviewedLocalGenericRead("easyeda_catalog_verify_device"),
      false,
    );
    assert.equal(
      isReviewedLocalGenericRead("easyeda_jlcpcb_quote_workflow"),
      false,
    );
    assert.equal(isReviewedLocalGenericRead("easyeda_unknown_read"), false);
  });

  void test("live PCB constraint readers reject every own boardData property", () => {
    for (const name of [
      "easyeda_pcb_constraint_check",
      "easyeda_pcb_constraint_report",
      "easyeda_pcb_production_review",
    ]) {
      assert.doesNotThrow(() => {
        assertReviewedLocalGenericReadArguments(name, {
          projectId: "project-1",
        });
      });
      for (const boardData of [undefined, null, { widthMm: 1, heightMm: 1 }]) {
        assert.throws(
          () => {
            assertReviewedLocalGenericReadArguments(name, {
              boardData,
              projectId: "project-1",
            });
          },
          /arguments\.boardData is prohibited.*proven live board/u,
        );
      }
    }
  });

  void test("tool filtering respects classification, all query terms, limits, and schema opt-in", () => {
    const tools = [
      {
        name: "easyeda_get_document",
        title: "Document context",
        description: "Read active editor context",
        annotations: { readOnlyHint: true },
        inputSchema: { properties: {} },
      },
      {
        name: "easyeda_pcb_move_component",
        title: "Move component",
        description: "Move one PCB component",
        annotations: { destructiveHint: true },
        inputSchema: { properties: { confirmWrite: {} } },
        outputSchema: { properties: { moved: { type: "boolean" } } },
      },
      {
        name: "easyeda_get_project",
        title: "Project context",
        description: "Read project metadata",
        annotations: { readOnlyHint: true },
        inputSchema: { properties: {} },
      },
    ];

    const reads = filterTools(tools, {
      mode: "read",
      query: "read context",
      limit: 1,
    });
    assert.equal(reads.length, 1);
    const read = reads[0];
    assert.ok(read);
    assert.equal(read.name, "easyeda_get_document");
    assert.equal(Object.hasOwn(read, "inputSchema"), false);

    const writes = filterTools(tools, { mode: "write", includeSchemas: true });
    assert.deepEqual(
      writes.map((tool) => tool.name),
      ["easyeda_pcb_move_component"],
    );
    const write = writes[0];
    assert.ok(write);
    assert.deepEqual(write.inputSchema, { properties: { confirmWrite: {} } });
    assert.deepEqual(write.outputSchema, {
      properties: { moved: { type: "boolean" } },
    });
  });
});

void describe("raw execution and evidence input guards", () => {
  const code = "return { ok: true };";
  const sourceSha256 = sha256Text(code);
  const validRawInput = {
    code,
    timeoutMs: 60_000,
    confirmWrite: true,
    mode: "read",
    intent: "Read compact active-document context.",
    sourceSha256,
    acknowledgeUnrestrictedRaw: true,
    unrestrictedConfirmation: `UNRESTRICTED:${sourceSha256}`,
  };

  void test("raw execution accepts exactly one source and the hard timeout boundary", () => {
    assert.deepEqual(validateRawExecutionInput(validRawInput), {
      hasCode: true,
      hasPath: false,
      timeoutMs: 60_000,
    });
    assert.deepEqual(
      validateRawExecutionInput({
        ...validRawInput,
        code: undefined,
        scriptPath: "/tmp/a.js",
        timeoutMs: 1000,
      }),
      { hasCode: false, hasPath: true, timeoutMs: 1000 },
    );
  });

  void test("raw execution rejects ambiguous source, unsafe timeout, or incomplete unrestricted acknowledgement", () => {
    const invalid = [
      { ...validRawInput, scriptPath: "/tmp/a.js" },
      { ...validRawInput, code: undefined },
      { ...validRawInput, timeoutMs: 999 },
      { ...validRawInput, timeoutMs: 60_001 },
      { ...validRawInput, timeoutMs: 1500.5 },
      { ...validRawInput, confirmWrite: false },
      { ...validRawInput, mode: "write" },
      { ...validRawInput, intent: "short" },
      { ...validRawInput, acknowledgeUnrestrictedRaw: false },
      { ...validRawInput, unrestrictedConfirmation: "UNRESTRICTED:wrong" },
    ];

    for (const input of invalid) {
      assert.throws(() => validateRawExecutionInput(input));
    }
  });

  void test("evidence paths must be absolute, distinct, and complete", () => {
    assert.equal(validateEvidencePaths(), undefined);
    assert.deepEqual(
      validateEvidencePaths({
        resultPath: "/tmp/result.json",
        receiptPath: "/tmp/receipt.json",
      }),
      { resultPath: "/tmp/result.json", receiptPath: "/tmp/receipt.json" },
    );
    assert.throws(() => validateEvidencePaths(null), /object/u);
    assert.throws(
      () => validateEvidencePaths({ resultPath: "/tmp/result.json" }),
      /requires/u,
    );
    assert.throws(
      () =>
        validateEvidencePaths({
          resultPath: "relative.json",
          receiptPath: "/tmp/receipt.json",
        }),
      /absolute/u,
    );
    assert.throws(
      () =>
        validateEvidencePaths({
          resultPath: "/tmp/evidence/../same.json",
          receiptPath: "/tmp/same.json",
        }),
      /distinct/u,
    );
  });

  void test("normalizes POSIX, Windows, and file URI project paths to the same database identity", () => {
    assert.equal(
      normalizeEasyedaProjectPath("/mnt/c/Users/Fixture/Board%20Demo.eprj2"),
      "/mnt/c/Users/Fixture/Board%20Demo.eprj2",
    );
    assert.equal(
      normalizeEasyedaProjectPath(
        String.raw`C:\Users\Fixture\Board Demo.eprj2`,
      ),
      "/mnt/c/Users/Fixture/Board Demo.eprj2",
    );
    assert.equal(
      normalizeEasyedaProjectPath(
        "file:///C:/Users/Fixture/Board%20Demo.eprj2",
      ),
      "/mnt/c/Users/Fixture/Board Demo.eprj2",
    );
    assert.throws(
      () => normalizeEasyedaProjectPath("relative/project.eprj2"),
      /absolute/u,
    );
    assert.throws(
      () => normalizeEasyedaProjectPath("/tmp/project.sqlite"),
      /\.eprj2/u,
    );
    assert.throws(
      () => normalizeEasyedaProjectPath("file:///%E0%A4%A.eprj2"),
      /invalid escaping/u,
    );
  });
});

void describe("JSON pointers and postcondition assertions", () => {
  const value = {
    project: { uuid: "project-1", name: "Board Demo" },
    documents: [{ type: 3, nets: ["GND", "5V"] }],
    "escaped/key": { "~value": "matched" },
  };

  void test("JSON pointers address objects, arrays, and escaped tokens", () => {
    assert.equal(getJsonPointer(value, ""), value);
    assert.equal(getJsonPointer(value, "/"), value);
    assert.equal(getJsonPointer(value, "/documents/0/type"), 3);
    assert.equal(getJsonPointer(value, "/escaped~1key/~0value"), "matched");
    assert.equal(getJsonPointer(value, "/missing/path"), undefined);
    assert.throws(
      () => getJsonPointer(value, "project/uuid"),
      /Invalid JSON pointer/u,
    );
  });

  void test("assertions report evidence without silently throwing on a failed condition", () => {
    const results = evaluateAssertions(value, [
      { pointer: "/project/uuid", op: "exists" },
      { pointer: "/project/name", op: "equals", value: "Board Demo" },
      { pointer: "/project/name", op: "not-equals", value: "Other" },
      { pointer: "/project/uuid", op: "matches", value: "^project-\\d$" },
      { pointer: "/documents/0/nets", op: "length-equals", value: 2 },
      { pointer: "/documents/0/type", op: "equals", value: 2 },
    ]);

    assert.deepEqual(
      results.map((result) => result.passed),
      [true, true, true, true, true, false],
    );
    const failedResult = results[5];
    assert.ok(failedResult);
    assert.equal(failedResult.actual, 3);
    assert.equal(failedResult.expected, 2);
    assert.throws(
      () =>
        evaluateAssertions(value, [
          { pointer: "/project/name", op: "unknown" },
        ]),
      /Unsupported assertion operation/u,
    );
  });

  void test("not-equals fails when its pointer is missing", () => {
    const [result] = evaluateAssertions(value, [
      { pointer: "/project/missing", op: "not-equals", value: "anything" },
    ]);
    assert.ok(result);
    assert.equal(result.passed, false);
    assert.equal(result.actual, undefined);
  });

  void test("subset comparison reports precise escaped pointers and assertion details", () => {
    const actual = {
      context: { project: { uuid: "project-1", title: "Board Demo" } },
      "path/key": { value: 3 },
    };
    assert.deepEqual(
      compareSubset(actual, { context: { project: { uuid: "project-1" } } }),
      [],
    );
    assert.deepEqual(compareSubset(actual, { "path/key": { value: 4 } }), [
      { pointer: "/path~1key/value", expected: 4, actual: 3 },
    ]);
    assert.equal(
      assertSubset(actual, { context: { project: { uuid: "project-1" } } }),
      true,
    );

    assert.throws(
      () =>
        assertSubset(
          actual,
          { context: { project: { uuid: "wrong" } } },
          "active context",
        ),
      (error: unknown) => {
        const detailed = detailedError(error);
        assert.match(detailed.message, /active context does not match/u);
        assert.deepEqual(detailed["mismatches"], [
          {
            pointer: "/context/project/uuid",
            expected: "wrong",
            actual: "project-1",
          },
        ]);
        return true;
      },
    );
  });
});

void describe("pinned raw call specifications", () => {
  const code = "return { ok: true };";
  const valid = {
    toolName: "easyeda_execute",
    arguments: { code, confirmWrite: true, timeoutMs: 60_000 },
    sourceSha256: sha256Text(code),
    mode: "read",
    acknowledgeUnrestrictedRaw: true,
  };

  void test("requires exact source hash, bounded timeout, confirmation, and safe operation mode", () => {
    assert.doesNotThrow(() => {
      validateCallSource(valid);
    });
    assert.doesNotThrow(() => {
      validateCallSource({ toolName: "easyeda_get_document" });
    });

    const invalid = [
      { ...valid, arguments: { ...valid.arguments, code: "" } },
      { ...valid, sourceSha256: "bad" },
      { ...valid, sourceSha256: `${"0".repeat(63)}1` },
      { ...valid, arguments: { ...valid.arguments, timeoutMs: 60_001 } },
      { ...valid, arguments: { ...valid.arguments, confirmWrite: false } },
      { ...valid, mode: "persist" },
      { ...valid, acknowledgeUnrestrictedRaw: false },
    ];
    for (const spec of invalid) {
      assert.throws(() => {
        validateCallSource(spec);
      });
    }
  });
});

void describe("stable runtime fingerprint validation", () => {
  const digest = "a".repeat(64);
  const valid = {
    facadeImplementation: {
      version: "0.3.0",
      operationSchema: "easyeda-pro-control.operation.v1",
      mode: "source-tree",
      files: [
        {
          path: "/opt/easyeda-control/server/src/engine.ts",
          relativePath: "server/src/engine.ts",
          bytes: 1024,
          sha256: digest,
        },
      ],
      sha256: digest,
    },
    upstreamServer: { version: "1.0.0-rc.1" },
    upstreamLauncher: {
      command: "/usr/bin/node",
      commandSha256: digest,
      args: ["/opt/easyeda/dist/index.js"],
      cwd: "/opt/easyeda",
      entrypoint: "/opt/easyeda/dist/index.js",
      entrypointSha256: digest,
      implementationTree: {
        root: "/opt/easyeda/dist",
        sha256: digest,
        fileCount: 12,
      },
      executionClosure: {
        root: "/opt/easyeda",
        directoryCount: 40,
        fileCount: 120,
        symlinkCount: 0,
        totalBytes: 4096,
        sha256: digest,
      },
      dependencyLock: {
        type: "pnpm",
        path: "/opt/easyeda/pnpm-lock.yaml",
        sha256: digest,
      },
      moduleGraph: {
        schema: "easyeda-pro-control.module-graph.v1",
        moduleCount: 120,
        edgeCount: 240,
        totalBytes: 4096,
        sha256: digest,
      },
      sandbox: {
        command: "/usr/sbin/bwrap",
        commandSha256: digest,
        version: "0.11.2",
      },
    },
    upstreamImplementationDrift: false,
    reviewedCompatibilityManifest: reviewedCompatibilityManifestFingerprint(),
    installedBundles: {
      available: true,
      assetsRoot: "/opt/easyeda/assets",
      pcbEditor: {
        version: "3.2.149.5378b690",
        implementationPath: "/opt/easyeda/assets/pro-pcb/pcb.js",
        implementationSha256:
          "65401cdc0a8f244db2ff2d8da88fd835b6e1fb3a3ecdbcfd975781502cb04b54",
      },
      publicApi: {
        version: "0.2.53.aee2f57a",
        implementationPath: "/opt/easyeda/assets/pro-api/api.js",
        implementationSha256:
          "5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc",
        adapterPath: "/opt/easyeda/assets/pro-api/adapter.js",
        adapterSha256:
          "4da5b5184a78e2d3aca843dad6b147d7feb7ec1368160d73f49c4acbcf97dfdb",
        declarationsPath: "/opt/easyeda/assets/pro-api/api-types.d.ts",
        declarationsSha256:
          "32a0d2f8b4bc3d7b2b93b33499d9d768b0c23c77f45843a65166cf4e8ad6dab1",
      },
    },
    toolCatalogSha256: digest,
    toolCount: 116,
    health: {
      payload: {
        version: "1.0.0-rc.1",
        node_version: "24.18.0",
        bridge_connected: true,
        easyeda_version: "3.2.149.88089769",
        extension_version: "1.0.0-rc.1",
        extension_version_mismatch: false,
        registry_mismatch: false,
      },
    },
    bridge: {
      payload: {
        connected: true,
        bridge_version: "1.0.0-rc.1",
        easyeda_version: "3.2.149.88089769",
        diagnostics: { method_registry_hash: "registry-v1" },
      },
    },
    bridgeDispatcher: {
      payload: {
        source: "loader_status",
        dispatcher_build_id: "d18b6xd531xe6ca",
        total: 116,
      },
    },
  };

  void test("requires the complete connected runtime and launcher identity", () => {
    assert.equal(validateExpectedFingerprint(valid), true);
    const incomplete = structuredClone(valid);
    Reflect.deleteProperty(
      incomplete.upstreamLauncher.implementationTree,
      "sha256",
    );
    Reflect.deleteProperty(
      incomplete.upstreamLauncher.executionClosure,
      "sha256",
    );
    incomplete.upstreamImplementationDrift = true;
    incomplete.bridge.payload.connected = false;
    assert.throws(
      () => validateExpectedFingerprint(incomplete),
      (error: unknown) => {
        const detailed = detailedError(error);
        assert.deepEqual(detailed["missingFingerprintFields"], [
          {
            pointer: "/upstreamLauncher/implementationTree/sha256",
            required: "sha256",
          },
          {
            pointer: "/upstreamLauncher/executionClosure/sha256",
            required: "sha256",
          },
          { pointer: "/upstreamImplementationDrift", required: "false" },
          { pointer: "/bridge/payload/connected", required: "true" },
        ]);
        return true;
      },
    );
  });

  void test("requires the external reviewed compatibility tuple and installed bundle hashes", async () => {
    const reviewed = reviewedFingerprintFixture();
    assert.equal(validatePrivateFingerprint(reviewed), true);
    assert.match(
      reviewedCompatibilityManifestPath(),
      /reviewed-compatibility\.json$/u,
    );

    const implementation = await controlImplementationFingerprint();
    if (implementation.mode === "source-tree") {
      const reviewedSourceFiles = new Set(
        implementation.files.map((file) => file.relativePath),
      );
      assert.equal(
        reviewedSourceFiles.has("authenticated-bridge-gateway.ts"),
        true,
      );
      assert.equal(
        reviewedSourceFiles.has("backend-listener-authority.ts"),
        true,
      );
    }
    const reviewedFacade =
      loadReviewedCompatibilityManifest().facadeImplementation[
        implementation.mode
      ];
    assert.deepEqual(
      {
        version: implementation.version,
        operationSchema: implementation.operationSchema,
        sha256: implementation.sha256,
        fileCount: implementation.files.length,
        files: implementation.files.map(({ relativePath, bytes, sha256 }) => ({
          relativePath,
          bytes,
          sha256,
        })),
      },
      reviewedFacade,
    );

    const wrongPcb = structuredClone(reviewed);
    wrongPcb.installedBundles.pcbEditor.implementationSha256 = "b".repeat(64);
    assert.throws(
      () => validatePrivateFingerprint(wrongPcb),
      (error: unknown) => {
        const detailed = detailedError(error);
        assert.match(detailed.message, /compatibility tuple/u);
        assert.deepEqual(detailed["mismatches"], [
          {
            pointer: "/installedBundles/pcbEditor/implementationSha256",
            expected:
              "65401cdc0a8f244db2ff2d8da88fd835b6e1fb3a3ecdbcfd975781502cb04b54",
            actual: "b".repeat(64),
          },
        ]);
        return true;
      },
    );

    const wrongAdapter = structuredClone(reviewed);
    wrongAdapter.installedBundles.publicApi.adapterSha256 = "b".repeat(64);
    assert.throws(
      () => validatePrivateFingerprint(wrongAdapter),
      (error: unknown) => {
        const detailed = detailedError(error);
        assert.match(detailed.message, /compatibility tuple/u);
        assert.deepEqual(detailed["mismatches"], [
          {
            pointer: "/installedBundles/publicApi/adapterSha256",
            expected:
              "4da5b5184a78e2d3aca843dad6b147d7feb7ec1368160d73f49c4acbcf97dfdb",
            actual: "b".repeat(64),
          },
        ]);
        return true;
      },
    );

    const wrongToolCount = structuredClone(reviewed);
    wrongToolCount.toolCount += 1;
    assert.throws(
      () => validatePrivateFingerprint(wrongToolCount),
      (error: unknown) => {
        const detailed = detailedError(error);
        assert.deepEqual(detailed["mismatches"], [
          {
            pointer: "/upstream/toolCatalog/count",
            expected: reviewed.toolCount,
            actual: reviewed.toolCount + 1,
          },
        ]);
        return true;
      },
    );

    const wrongFacade = structuredClone(reviewed);
    wrongFacade.facadeImplementation.sha256 = "b".repeat(64);
    assert.throws(
      () => validatePrivateFingerprint(wrongFacade),
      (error: unknown) => {
        const detailed = detailedError(error);
        assert.deepEqual(detailed["mismatches"], [
          {
            pointer: "/facadeImplementation/sha256",
            expected: reviewed.facadeImplementation.sha256,
            actual: "b".repeat(64),
          },
        ]);
        return true;
      },
    );

    const wrongManifestDigest = structuredClone(reviewed);
    wrongManifestDigest.reviewedCompatibilityManifest.sha256 = "b".repeat(64);
    assert.throws(
      () => validatePrivateFingerprint(wrongManifestDigest),
      (error: unknown) => {
        const detailed = detailedError(error);
        assert.match(detailed.message, /manifest fingerprint/u);
        assert.deepEqual(detailed["mismatches"], [
          {
            pointer: "/sha256",
            expected: reviewed.reviewedCompatibilityManifest.sha256,
            actual: "b".repeat(64),
          },
        ]);
        return true;
      },
    );

    const missingApiDeclarations = structuredClone(reviewed);
    Reflect.deleteProperty(
      missingApiDeclarations.installedBundles.publicApi,
      "declarationsSha256",
    );
    assert.throws(
      () => validatePrivateFingerprint(missingApiDeclarations),
      (error: unknown) => {
        const detailed = detailedError(error);
        assert.deepEqual(detailed["missingFingerprintFields"], [
          {
            pointer: "/installedBundles/publicApi/declarationsSha256",
            required: "sha256",
          },
        ]);
        return true;
      },
    );

    const missingApiAdapter = structuredClone(reviewed);
    Reflect.deleteProperty(
      missingApiAdapter.installedBundles.publicApi,
      "adapterSha256",
    );
    assert.throws(
      () => validatePrivateFingerprint(missingApiAdapter),
      (error: unknown) => {
        const detailed = detailedError(error);
        assert.deepEqual(detailed["missingFingerprintFields"], [
          {
            pointer: "/installedBundles/publicApi/adapterSha256",
            required: "sha256",
          },
        ]);
        return true;
      },
    );
  });
});

void describe("plan identity and operation summaries", () => {
  void test("plan hashes are key-order independent, but cover every execution-bearing field", () => {
    const base = {
      name: "Move R1",
      capabilityLevel: "public-supported",
      expectedContext: { documentUuid: "doc-1", projectUuid: "project-1" },
      preflightCalls: [{ toolName: "read", args: { ref: "R1" } }],
      applyCall: { toolName: "move", args: { ref: "R1", x: 1, y: 2 } },
      verifyCalls: [{ toolName: "read", args: { ref: "R1" } }],
      verifyAssertions: [{ pointer: "/x", op: "equals", value: 1 }],
      rollbackCalls: [{ toolName: "move", args: { ref: "R1", x: 0, y: 0 } }],
      reopenedVerifyCalls: [],
      reopenedAssertions: [],
      checkpoint: {
        source: "/tmp/project.eprj2",
        outputDir: "/tmp/checkpoints",
        label: "pre",
      },
    };
    const reordered = {
      checkpoint: {
        label: "pre",
        outputDir: "/tmp/checkpoints",
        source: "/tmp/project.eprj2",
      },
      applyCall: { args: { y: 2, x: 1, ref: "R1" }, toolName: "move" },
      expectedContext: { projectUuid: "project-1", documentUuid: "doc-1" },
      capabilityLevel: "public-supported",
      name: "Move R1",
      rollbackCalls: base.rollbackCalls,
      reopenedAssertions: [],
      verifyAssertions: base.verifyAssertions,
      preflightCalls: base.preflightCalls,
      verifyCalls: base.verifyCalls,
      reopenedVerifyCalls: [],
    };

    assert.equal(buildPlanHash(base), buildPlanHash(reordered));
    assert.notEqual(
      buildPlanHash(base),
      buildPlanHash({
        ...base,
        applyCall: { ...base.applyCall, args: { ref: "R1", x: 9, y: 2 } },
      }),
    );
    assert.equal(
      buildPlanHash(base),
      buildPlanHash({ ...base, presentationOnly: "ignored" }),
    );
  });

  void test("operation summaries expose bounded diagnostics and managed evidence pointers", () => {
    const artifactDescriptors = Array.from({ length: 15 }, (_value, index) => ({
      path: `/control/operations/op/${index}.json`,
      sha256: String(index).padStart(64, "0"),
      bytes: index + 10,
      ignoredPayload: "not included",
    }));
    const summary = operationSummary({
      operationId: "easyeda-operation-1",
      planHash: "abc",
      state: "live-verified",
      mutationState: "applied-unsaved",
      saved: false,
      reopened: false,
      hardStop: true,
      mutationMayHaveOccurred: true,
      nextSafeAction: "Inspect live state.",
      unknownPhase: "recovery-reopen",
      lastError: {
        name: "E".repeat(200),
        message: "m".repeat(3000),
        stack: "not included",
      },
      journalPath: "/control/operations/easyeda-operation-1.json",
      preCheckpoint: {
        receiptPath: "/checkpoints/pre.checkpoint.json",
        checkpoint: "/checkpoints/pre.eprj2",
        sourceSha256: "not included",
      },
      finalCheckpoint: {
        receiptPath: "/checkpoints/post.checkpoint.json",
        checkpoint: "/checkpoints/post.eprj2",
      },
      artifacts: artifactDescriptors,
      updatedAt: "2026-08-27T10:00:00Z",
      secretPlan: { code: "not included" },
    });

    assert.deepEqual(summary.checkpoints, {
      pre: {
        receiptPath: "/checkpoints/pre.checkpoint.json",
        checkpointPath: "/checkpoints/pre.eprj2",
      },
      final: {
        receiptPath: "/checkpoints/post.checkpoint.json",
        checkpointPath: "/checkpoints/post.eprj2",
      },
    });
    assert.equal(
      summary.journalPath,
      "/control/operations/easyeda-operation-1.json",
    );
    assert.equal(summary.orphanedCallPossible, false);
    assert.equal(summary.orphanedCallPhase, undefined);
    assert.equal(summary.runtimeRestartBoundary, undefined);
    assert.equal(summary.unknownPhase, "recovery-reopen");
    assert.ok(summary.lastError);
    assert.ok(typeof summary.lastError.name === "string");
    assert.ok(typeof summary.lastError.message === "string");
    assert.equal(summary.lastError.name.length, 128);
    assert.equal(summary.lastError.message.length, 2048);
    assert.match(summary.lastError.message, /…$/u);
    assert.equal(summary.artifacts.count, 15);
    assert.equal(summary.artifacts.recent.length, 12);
    const recentArtifact = summary.artifacts.recent[0];
    const expectedArtifact = artifactDescriptors[3];
    assert.ok(recentArtifact);
    assert.ok(expectedArtifact);
    assert.equal(recentArtifact.path, expectedArtifact.path);
    assert.equal(Object.hasOwn(recentArtifact, "ignoredPayload"), false);
    assert.equal(Object.hasOwn(summary, "secretPlan"), false);
  });

  void test("orphaned-call risk is explicit while remaining conservative for legacy journals", () => {
    assert.equal(operationHasOrphanedCallRisk({ state: "unknown" }), true);
    assert.equal(operationHasOrphanedCallRisk({ state: "completed" }), false);
    assert.equal(
      operationHasOrphanedCallRisk({
        state: "unknown",
        orphanedCallPossible: false,
      }),
      false,
    );
    const summary = operationSummary({
      operationId: "easyeda-operation-2",
      state: "live-verified",
      orphanedCallPossible: true,
      orphanedCallPhase: "apply",
      runtimeRestartBoundary: {
        required: true,
        reason: "write timeout",
      },
    });
    assert.equal(summary.orphanedCallPossible, true);
    assert.equal(summary.orphanedCallPhase, "apply");
    assert.deepEqual(summary.runtimeRestartBoundary, {
      required: true,
      reason: "write timeout",
    });
  });

  void test("only fully reconciled end states are terminal", () => {
    for (const state of [
      "completed",
      "rolled-back",
      "reconciled-no-mutation",
      "plan-invalidated",
    ]) {
      assert.equal(isTerminalOperation({ state }), true);
    }
    for (const state of ["created", "applied-unsaved", "unknown", undefined]) {
      assert.equal(isTerminalOperation({ state }), false);
    }
  });
});
