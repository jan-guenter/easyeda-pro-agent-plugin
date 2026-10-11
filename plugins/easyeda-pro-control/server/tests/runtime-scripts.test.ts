import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  CONTEXT_PROBE_CODE,
  RUNTIME_IDENTITY_PROBE_CODE,
  buildActivateRecoveryTargetCode,
  buildComponentMutationCode,
  buildReopenOnlyCode,
  buildSaveReopenCode,
  contextFailureDiagnostics,
  wrapWithContextGuard,
} from "../src/runtime-scripts.ts";
import { buildExactReadCode } from "../src/exact-readers.ts";
import { normalizeProofEnvelope, sha256Json } from "../src/core.ts";

type AsyncFunctionConstructor = new (
  ...parameters: string[]
) => (eda: unknown, globals?: unknown) => Promise<unknown>;

const SAVE_PROJECT = "1".repeat(64);
const SAVE_TAB = `document-1@${SAVE_PROJECT}`;

interface ContextOptions {
  projectUuid?: string;
  documentUuid?: string;
  documentType?: number;
  tabId?: string;
}

interface PcbEdaOptions {
  beforeUuid?: string;
  beforeType?: number;
  afterUuid?: string;
  afterType?: number;
  saved?: boolean;
  closed?: boolean;
  openedTab?: string;
  activated?: boolean | null;
  uploadSettled?: boolean;
  preferences?: string;
  latePreferences?: string;
}

interface PcbEdaFixture {
  eda: {
    nativeUploadTestHost: unknown;
    nativeLifecycleTestWindow: unknown;
    dmt_Project: { getCurrentProjectInfo: () => Promise<{ uuid: string }> };
    dmt_SelectControl: {
      getCurrentDocumentInfo: () => Promise<Record<string, unknown>>;
    };
    pcb_Document: {
      save: (uuid: string) => Promise<boolean>;
    };
    pcb_PrimitiveComponent: {
      getAll: () => Promise<unknown[]>;
      getAllPrimitiveId: () => Promise<string[]>;
      getAllPinsByPrimitiveId: (primitiveId: string) => Promise<unknown[]>;
    };
    dmt_EditorControl: {
      closeDocument: (target: string) => Promise<boolean>;
      openDocument: (uuid: string) => Promise<string>;
      activateDocument?: ((tabId: string) => Promise<boolean | null>) | undefined;
    };
  };
  calls: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function contextEda({
  projectUuid = "project-1",
  documentUuid = "document-1",
  documentType = 3,
  tabId = "tab-1",
}: ContextOptions = {}): Record<string, unknown> {
  return {
    dmt_Project: { getCurrentProjectInfo: async () => ({ uuid: projectUuid }) },
    dmt_SelectControl: {
      getCurrentDocumentInfo: async () => ({
        uuid: documentUuid,
        documentType,
        tabId,
      }),
    },
  };
}

function pcbEda(options: PcbEdaOptions = {}): PcbEdaFixture {
  const calls: string[] = [];
  let open = true, reopened = false;
  const listeners = new Map<string, (value: unknown) => void>();
  const element = (): { tagName: string; isConnected: boolean; getAttribute: (key: string) => string | null } => ({ tagName: "IFRAME", isConnected: true, getAttribute: (key) => { if (key === "c_dbid") { return SAVE_TAB; } if (key === "c_doctype") { return "3"; } return null; } });
  let frame: ReturnType<typeof element> | null = element();
  const before = {
    uuid: options.beforeUuid ?? "document-1",
    documentType: options.beforeType ?? 3,
    tabId: SAVE_TAB,
    title: "PCB",
  };
  const after = {
    uuid: options.afterUuid ?? "document-1",
    documentType: options.afterType ?? 3,
    tabId: SAVE_TAB,
    title: "PCB reopened",
  };
  const eda = {
    nativeLifecycleTestWindow: { top: { document: { getElementById: (): unknown => frame },
      localStorage: { getItem: (): string => calls.includes("read-document") && options.latePreferences !== undefined ? options.latePreferences : (options.preferences ?? '{"pcbCommandTab":true}') },
      setTimeout: (callback: () => void, delay: number): NodeJS.Timeout => setTimeout(callback, delay === 15_000 ? 100 : 1), clearTimeout } },
    nativeUploadTestHost: { currentProject: { projectId: SAVE_PROJECT }, messageBus: { rpcCall: async (topic: string, args: unknown): Promise<unknown> => {
      if (topic === "isOpenTab") { assert.deepEqual(args, [SAVE_TAB]); return { message: open }; }
      assert.equal(topic, "/PrjDB/project/awaitUploadEnd"); assert.deepEqual(args, [SAVE_PROJECT]); calls.push("upload-barrier");
      await Promise.resolve(); return { message: { success: options.uploadSettled ?? true } };
    },
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Models the pinned native message-bus subscription contract.
    subscribe: (event: string, callback: (value: unknown) => void): { cancel: () => void } => {
      listeners.set(event, callback); return { cancel: () => { listeners.delete(event); } };
    } } },
    dmt_Project: { getCurrentProjectInfo: async (): Promise<{ uuid: string }> => ({ uuid: SAVE_PROJECT }) },
    dmt_SelectControl: {
      getCurrentDocumentInfo: async (): Promise<Record<string, unknown>> => {
        calls.push("read-document");
        return reopened ? after : before;
      },
    },
    pcb_Document: {
      save: async (uuid: string): Promise<boolean> => {
        calls.push(`save:${uuid}`);
        return options.saved ?? true;
      },
    },
    pcb_PrimitiveComponent: {
      getAll: async (): Promise<unknown[]> => {
        calls.push("guard-components");
        return [];
      },
      getAllPrimitiveId: async (): Promise<string[]> => [],
      getAllPinsByPrimitiveId: async (): Promise<unknown[]> => [],
    },
    dmt_EditorControl: {
      closeDocument: async (target: string): Promise<boolean> => {
        calls.push(`close:${target}`);
        if (options.closed !== false) { setImmediate(() => { assert.ok(frame); frame.isConnected = false; frame = null; open = false; listeners.get("sch/SubTabbarMapRemove")?.("document-1"); }); }
        return options.closed ?? true;
      },
      openDocument: async (uuid: string): Promise<string> => {
        calls.push(`open:${uuid}`);
        assert.equal(frame, null); assert.equal(open, false); frame = element(); open = true; reopened = true;
        return options.openedTab ?? SAVE_TAB;
      },
      activateDocument: async (tabId: string): Promise<boolean | null> => {
        calls.push(`activate:${tabId}`);
        return options.activated === undefined ? true : options.activated;
      },
    },
  };
  return { eda, calls };
}

const EMPTY_PCB_COMPONENT_REQUEST = {
  kind: "pcb-components" as const,
  selector: { all: true as const },
  includePins: false,
  includeBounds: false,
};
const EMPTY_PCB_COMPONENT_PAYLOAD = {
  ok: true,
  kind: "pcb-components",
  documentType: 3,
  detail: { pins: false, bounds: false },
  units: {
    coordinates: "mil",
    bounds: "mil",
    transformedPadCoordinates: "mil",
  },
  limitations: {
    componentPadWrapper:
      "Placed component-pad centers, identity, layer, number, and net only; pad/hole geometry is intentionally omitted because this pinned wrapper has a known 0.1 drill-scale defect. getState_Pads summaries are not physical-pad authority: native component serialization uses local child IDs and includes footprint vias.",
  },
  primitiveIds: [],
  byPrimitiveId: {},
};

function emptyPcbSaveGuards(): readonly [
  {
    request: typeof EMPTY_PCB_COMPONENT_REQUEST;
    expectedSnapshotSha256: string;
  },
] {
  return [
    {
      request: EMPTY_PCB_COMPONENT_REQUEST,
      expectedSnapshotSha256: sha256Json(
        normalizeProofEnvelope({
          ...EMPTY_PCB_COMPONENT_PAYLOAD,
          read_consistency: { stable: true, attempts: 2 },
        }),
      ),
    },
  ];
}

async function resolveUndefined(): Promise<undefined> {
  return undefined;
}

// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The test must construct generated async programs through the runtime's AsyncFunction constructor.
const AsyncFunction = resolveUndefined.constructor as AsyncFunctionConstructor;

function buildEmptyPcbSaveCode(): string {
  return buildSaveReopenCode(
    {
      project: { uuid: SAVE_PROJECT },
      document: { uuid: "document-1", documentType: 3, tabId: SAVE_TAB },
    },
    emptyPcbSaveGuards(),
  );
}

void describe("renderer runtime identity", () => {
  void test("is immutable within one realm and carries the time origin", async () => {
    const run = new AsyncFunction("eda", RUNTIME_IDENTITY_PROBE_CODE);
    const first = await run({});
    const second = await run({});
    assert.deepEqual(second, first);
    assert.ok(isRecord(first));
    assert.equal(first["kind"], "runtime-identity");
    assert.equal(typeof first["generation"], "string");
    assert.equal(typeof first["timeOrigin"], "number");
  });
});

async function runGenerated(code: string, eda: unknown): Promise<unknown> {
  if (isRecord(eda) && Object.hasOwn(eda, "nativeUploadTestHost")) {
    return new AsyncFunction("eda", "globalThis", code)(eda, { crypto: globalThis.crypto, TextEncoder: globalThis.TextEncoder, gVars: eda["nativeUploadTestHost"], window: eda["nativeLifecycleTestWindow"] });
  }
  return new AsyncFunction("eda", code)(eda);
}

void describe("compact context probe", () => {
  void test("uses public context APIs and returns scalar identifiers only", async () => {
    const output = await runGenerated(CONTEXT_PROBE_CODE, {
      dmt_Project: {
        getCurrentProjectInfo: async () => ({
          uuid: "project-1",
          name: "Board Demo",
          path: "/tmp/project.eprj2",
          largeObject: { must: "not leak" },
        }),
      },
      dmt_SelectControl: {
        getCurrentDocumentInfo: async () => ({
          uuid: "document-1",
          docType: 3,
          title: "PCB",
          tabId: "tab-1",
          nested: { must: "not leak" },
        }),
      },
      dmt_Pcb: {
        getCurrentPcbInfo: async () => ({
          uuid: "document-1",
          title: "PCB",
          tabId: "tab-1",
        }),
      },
      dmt_Schematic: { getCurrentSchematicInfo: resolveUndefined },
    });

    assert.deepEqual(output, {
      ok: true,
      project: {
        uuid: "project-1",
        name: "Board Demo",
        path: "/tmp/project.eprj2",
      },
      document: {
        uuid: "document-1",
        title: "PCB",
        tabId: "tab-1",
        documentType: 3,
      },
      pcb: { uuid: "document-1", title: "PCB", tabId: "tab-1" },
      schematic: {},
      schematicPage: {},
      probeDiagnostics: {
        project: "object", document: "object", pcb: "object",
        schematic: "undefined", schematicPage: "unavailable",
      },
    });
  });

  void test("does not probe undeclared uppercase API aliases", async () => {
    const output = await runGenerated(CONTEXT_PROBE_CODE, {
      DMT_Project: {
        getCurrentProjectInfo: async () => ({ projectUuid: "project-2" }),
      },
      DMT_SelectControl: {
        getCurrentDocumentInfo: async () => ({
          documentUuid: "document-2",
          documentType: 1,
        }),
      },
      DMT_Pcb: { getCurrentPcbInfo: resolveUndefined },
      DMT_Schematic: {
        getCurrentSchematicInfo: async () => ({
          documentUuid: "document-2",
          title: "Sheet 01",
        }),
      },
    });

    assert.deepEqual(output, {
      ok: true,
      project: {},
      document: { documentType: undefined },
      pcb: {},
      schematic: {},
      schematicPage: {},
      probeDiagnostics: {
        project: "unavailable", document: "unavailable", pcb: "unavailable",
        schematic: "unavailable", schematicPage: "unavailable",
        projectPath: "registry-identity-unavailable",
      },
    });
  });

  void test("reports fixed API failure codes and never coerces document types", async () => {
    const output = await runGenerated(CONTEXT_PROBE_CODE, {
      dmt_Project: { getCurrentProjectInfo: async () => {
        throw new Error("private-error-details");
      } },
      dmt_SelectControl: { getCurrentDocumentInfo: async () => ({ documentType: "3" }) },
      dmt_Schematic: {
        getCurrentSchematicInfo: async () => ({ uuid: "container-1" }),
        getCurrentSchematicPageInfo: async () => ({ uuid: "page-1", parentSchematicUuid: "container-1" }),
      },
    });
    assert.ok(isRecord(output));
    assert.deepEqual(output["document"], { documentType: undefined });
    const diagnostics = contextFailureDiagnostics(output);
    assert.deepEqual(diagnostics["project"], {
      call: "threw", uuid: { type: "undefined" },
      projectUuid: { type: "undefined" }, path: { type: "undefined" },
    });
    assert.equal(JSON.stringify(output).includes("private-error-details"), false);
  });

  void test("failure diagnostics bound strings and omit unknown runtime data", () => {
    const diagnostics = contextFailureDiagnostics({
      project: { uuid: "project-1", path: "x".repeat(513), nested: "private-value" },
      probeDiagnostics: { project: "private-status", ignored: "private-value" },
      runtime: "private-value",
    });
    assert.deepEqual(diagnostics["project"], {
      call: "unreported", uuid: { type: "string", value: "project-1" },
      projectUuid: { type: "undefined" }, path: { type: "string", oversized: true },
    });
    assert.equal(JSON.stringify(diagnostics).includes("private"), false);
  });

  void test("native registry lookup selects only the exact project and reproves current context", async () => {
    const uuid = "a".repeat(64);
    const nativePath = String.raw`C:\test\Disposable.eprj2`;
    const calls: unknown[] = [];
    let documentCalls = 0;
    const output = await runGenerated(CONTEXT_PROBE_CODE, {
      dmt_Project: { getCurrentProjectInfo: async () => ({ uuid }) },
      dmt_SelectControl: { getCurrentDocumentInfo: async () => {
        documentCalls += 1;
        return { uuid: "document-1", documentType: 3, tabId: "tab-1", parentProjectUuid: uuid };
      } },
      dmt_Pcb: { getCurrentPcbInfo: async () => ({ uuid: "document-1" }) },
      sys_ClientUrl: { request: async (url: string, method: string) => {
        calls.push({ url, method });
        return { ok: true, url, body: Response.json({ success: true, result: {
          [uuid]: { path: nativePath }, other: { path: "private-other-project" },
        } }).body };
      } },
    });
    assert.ok(isRecord(output));
    assert.deepEqual(output["project"], { uuid, path: nativePath });
    assert.equal(output["contextStable"], true);
    assert.equal(documentCalls, 2);
    assert.deepEqual(calls, [{ url: "https://client/api/client/projectPaths", method: "GET" }]);
    assert.equal(JSON.stringify(output).includes("private-other-project"), false);
  });
  void test("local library context binds collection tab and independent metadata owner", async () => {
    const owner = "b".repeat(32), uuid = "a".repeat(64);
    const run = (tabCollection: string, metadataOwner: string): Promise<unknown> => runGenerated(CONTEXT_PROBE_CODE, {
      dmt_Project: { getCurrentProjectInfo: async () => ({ uuid }) },
      dmt_SelectControl: { getCurrentDocumentInfo: async () => ({ uuid: "footprint", documentType: 4, tabId: `footprint@${tabCollection}`, parentLibraryUuid: owner }) },
      lib_Footprint: { get: async (asset: string, collection: string) => { assert.equal(asset, "footprint"); assert.equal(collection, uuid); return { uuid: asset, libraryUuid: metadataOwner, libraryType: "4" }; } },
      sys_ClientUrl: { request: async (url: string) => ({ ok: true, url, body: Response.json({ success: true, result: { [uuid]: { path: String.raw`C:\test\Disposable.eprj2` } } }).body }) },
    });
    const valid = await run(uuid, owner);
    assert.ok(isRecord(valid)); assert.equal(valid["contextStable"], true);
    const wrongCollection = await run("external", owner), wrongOwner = await run(uuid, uuid);
    assert.ok(isRecord(wrongOwner)); assert.equal(wrongOwner["contextStable"], false);
    assert.ok(isRecord(wrongCollection)); assert.equal(wrongCollection["contextStable"], false);
  });
});

void describe("guarded runtime calls", () => {
  const expectedContext = {
    project: { uuid: "project-1" },
    document: { uuid: "document-1", documentType: 3, tabId: "tab-1" },
  };

  void test("executes the body only after exact project, document, and type proof", async () => {
    const code = wrapWithContextGuard(
      "return { ok: true, value: 42 };",
      expectedContext,
    );
    assert.deepEqual(await runGenerated(code, contextEda()), {
      ok: true,
      value: 42,
    });
  });

  void test("rejects incomplete expected context and every active-context mismatch", async () => {
    assert.throws(
      () => wrapWithContextGuard("return true;", {}),
      /requires project uuid/u,
    );
    const code = wrapWithContextGuard(
      "return { shouldNotRun: true };",
      expectedContext,
    );
    await assert.rejects(
      runGenerated(code, contextEda({ projectUuid: "other" })),
      /does not match/u,
    );
    await assert.rejects(
      runGenerated(code, contextEda({ documentUuid: "other" })),
      /does not match/u,
    );
    await assert.rejects(
      runGenerated(code, contextEda({ documentType: 1 })),
      /does not match/u,
    );
    await assert.rejects(
      runGenerated(code, contextEda({ tabId: "other-tab" })),
      /does not match/u,
    );
  });
});

void describe("generated exact readers and component mutations", () => {
  void test("enabled exact-reader programs parse as async JavaScript", () => {
    for (const request of [
      {
        kind: "schematic-components",
        selector: { primitiveIds: ["R1"] },
        includePins: true,
        includeBounds: true,
      },
      {
        kind: "pcb-components",
        selector: { all: true },
        includePins: false,
        includeBounds: false,
      },
      { kind: "pcb-inventory" },
      { kind: "pcb-rules" },
    ]) {
      assert.doesNotThrow(
        () => new AsyncFunction("eda", buildExactReadCode(request)),
      );
    }
  });

  void test("generates the reviewed lower-case PCB component writer from declared changes", async () => {
    const changes = [
      { primitiveId: "U1", pointer: "/x", before: 100, after: 200 },
      { primitiveId: "U1", pointer: "/bounds/minX", before: 90, after: 190 },
      { primitiveId: "U1", pointer: "/pads/0/x", before: 101, after: 201 },
    ];
    const calls: unknown[] = [];
    const code = buildComponentMutationCode(3, changes, "after");
    assert.match(code, /eda\.pcb_PrimitiveComponent/u);
    assert.doesNotMatch(code, /PCB_PrimitiveComponent/u);
    const guarded = wrapWithContextGuard(code, {
      project: { uuid: "project-1" },
      document: { uuid: "document-1", documentType: 3, tabId: "tab-1" },
    });
    assert.doesNotThrow(() => new AsyncFunction("eda", guarded));

    const current = { getState_X: (): number => 100 };

    const result = await runGenerated(guarded, {
      dmt_Project: {
        getCurrentProjectInfo: async () => {
          calls.push("context-project");
          return { uuid: "project-1" };
        },
      },
      dmt_SelectControl: {
        getCurrentDocumentInfo: async () => {
          calls.push("context-document");
          return { uuid: "document-1", documentType: 3, tabId: "tab-1" };
        },
      },
      pcb_PrimitiveComponent: {
        get: async (primitiveId: string) => {
          calls.push({ get: primitiveId });
          return current;
        },
        modify: async (component: unknown, patch: unknown) => {
          assert.equal(component, current);
          calls.push({
            modify: { samePreconditionedObject: component === current, patch },
          });
          return {
            getState_PrimitiveId: async (): Promise<string> => "U1",
          };
        },
      },
    });
    assert.deepEqual(calls, [
      "context-project",
      "context-document",
      "context-project",
      "context-document",
      { get: "U1" },
      "context-project",
      "context-document",
      { modify: { samePreconditionedObject: true, patch: { x: 200 } } },
      "context-project",
      "context-document",
    ]);
    assert.deepEqual(result, {
      ok: true,
      kind: "exact-component-mutation",
      state: "after",
      documentType: 3,
      applied: [{ primitiveId: "U1", fields: ["x"] }],
    });
  });

  void test("rejects unsupported document types, states, fields, and values before dispatch", () => {
    const xChange = [
      { primitiveId: "U1", pointer: "/x", before: 100, after: 200 },
    ];
    assert.throws(
      () => buildComponentMutationCode(1, xChange, "after"),
      /requires PCB type/u,
    );
    assert.throws(
      () => buildComponentMutationCode(3, xChange, "unknown"),
      /before\/after state/u,
    );
    assert.throws(
      () =>
        buildComponentMutationCode(
          3,
          [
            {
              primitiveId: "U1",
              pointer: "/bounds/minX",
              before: 90,
              after: 190,
            },
          ],
          "after",
        ),
      /at least one writable top-level field/u,
    );
    assert.throws(
      () =>
        buildComponentMutationCode(
          3,
          [{ primitiveId: "U1", pointer: "/layer", before: 1, after: 99 }],
          "after",
        ),
      /layer must be exactly 1 \(Top\) or 2 \(Bottom\)/u,
    );
    assert.throws(
      () =>
        buildComponentMutationCode(
          3,
          [{ primitiveId: "U1", pointer: "/x", before: "100", after: 200 }],
          "after",
        ),
      /field x must be finite/u,
    );
    assert.throws(
      () =>
        buildComponentMutationCode(
          3,
          [
            { primitiveId: "U1", pointer: "/x", before: 100, after: 200 },
            { primitiveId: "U2", pointer: "/x", before: 300, after: 400 },
          ],
          "after",
        ),
      /limited to exactly one PCB component/u,
    );
  });

  void test("rejects a context change after target read without calling modify", async () => {
    const body = buildComponentMutationCode(
      3,
      [{ primitiveId: "U1", pointer: "/x", before: 100, after: 200 }],
      "after",
    );
    const guarded = wrapWithContextGuard(body, {
      project: { uuid: "project-1" },
      document: { uuid: "document-1", documentType: 3, tabId: "tab-1" },
    });
    let documentReads = 0;
    let modifyCalls = 0;
    await assert.rejects(
      runGenerated(guarded, {
        dmt_Project: {
          getCurrentProjectInfo: async () => ({ uuid: "project-1" }),
        },
        dmt_SelectControl: {
          getCurrentDocumentInfo: async () => {
            documentReads += 1;
            return {
              uuid: "document-1",
              documentType: 3,
              tabId: documentReads >= 3 ? "changed-tab" : "tab-1",
            };
          },
        },
        pcb_PrimitiveComponent: {
          get: async (): Promise<{ getState_X: () => number }> => ({
            getState_X: (): number => 100,
          }),
          modify: async () => {
            modifyCalls += 1;
            return {
              getState_PrimitiveId: async (): Promise<string> => "U1",
            };
          },
        },
      }),
      /active EasyEDA context changed after component precondition read/u,
    );
    assert.equal(modifyCalls, 0);
    assert.equal(documentReads, 3);
  });

  void test("rejects a context change after the single modify call", async () => {
    const body = buildComponentMutationCode(
      3,
      [{ primitiveId: "U1", pointer: "/x", before: 100, after: 200 }],
      "after",
    );
    const guarded = wrapWithContextGuard(body, {
      project: { uuid: "project-1" },
      document: { uuid: "document-1", documentType: 3, tabId: "tab-1" },
    });
    let documentReads = 0;
    let modifyCalls = 0;
    await assert.rejects(
      runGenerated(guarded, {
        dmt_Project: {
          getCurrentProjectInfo: async () => ({ uuid: "project-1" }),
        },
        dmt_SelectControl: {
          getCurrentDocumentInfo: async () => {
            documentReads += 1;
            return {
              uuid: "document-1",
              documentType: 3,
              tabId: documentReads >= 4 ? "changed-tab" : "tab-1",
            };
          },
        },
        pcb_PrimitiveComponent: {
          get: async (): Promise<{ getState_X: () => number }> => ({
            getState_X: (): number => 100,
          }),
          modify: async () => {
            modifyCalls += 1;
            return {
              getState_PrimitiveId: async (): Promise<string> => "U1",
            };
          },
        },
      }),
      /active EasyEDA context changed after component modify/u,
    );
    assert.equal(modifyCalls, 1);
    assert.equal(documentReads, 4);
  });

  void test("rejects a stale journal-bound target precondition without calling modify", async () => {
    const body = buildComponentMutationCode(
      3,
      [{ primitiveId: "U1", pointer: "/x", before: 100, after: 200 }],
      "after",
    );
    const guarded = wrapWithContextGuard(body, {
      project: { uuid: "project-1" },
      document: { uuid: "document-1", documentType: 3, tabId: "tab-1" },
    });
    let modifyCalls = 0;
    await assert.rejects(
      runGenerated(guarded, {
        dmt_Project: {
          getCurrentProjectInfo: async () => ({ uuid: "project-1" }),
        },
        dmt_SelectControl: {
          getCurrentDocumentInfo: async () => ({
            uuid: "document-1",
            documentType: 3,
            tabId: "tab-1",
          }),
        },
        pcb_PrimitiveComponent: {
          get: async (): Promise<{ getState_X: () => number }> => ({
            getState_X: (): number => 101,
          }),
          modify: async () => {
            modifyCalls += 1;
            throw new Error("modify must not run");
          },
        },
      }),
      /component precondition changed before modify for x/u,
    );
    assert.equal(modifyCalls, 0);
  });
});

void describe("exact save, close, reopen, activate, and identity proof", () => {
  void test("unsafe preferences stop before the first Save, including drift during the final context read", async () => {
    for (const options of [{ preferences: '{"pcbCommandTab":false}' }, { latePreferences: '{}' }]) {
      const scene = pcbEda(options);
      await assert.rejects(runGenerated(buildEmptyPcbSaveCode(), scene.eda), /PCB_NAVIGATION_PREFERENCES_UNSAFE/u);
      assert.deepEqual(scene.calls, ["guard-components", "guard-components", "read-document"]);
    }
  });
  void test("performs PCB persistence in strict order and verifies reopened identity", async () => {
    const { eda, calls } = pcbEda();
    const result = await runGenerated(
      buildEmptyPcbSaveCode(),
      eda,
    );

    assert.deepEqual(calls, [
      "guard-components",
      "guard-components",
      "read-document",
      "save:document-1",
      "upload-barrier",
      "read-document",
      "read-document",
      `close:${SAVE_TAB}`,
      "open:document-1",
      `activate:${SAVE_TAB}`,
      "read-document",
      "read-document",
      "read-document",
    ]);
    assert.deepEqual(result, {
      ok: true,
      saved: true,
      closed: true,
      reopened: true,
      closeProof: { profile: "easyeda-pro-control.native-document-close.v1", closeCalls: 1, terminalNotification: true, oldFrameRemoved: true, oldTabRemoved: true, saved: false },
      openProof: { profile: "easyeda-pro-control.native-document-open.v1", tabId: SAVE_TAB, newFrameReady: true, exactContext: true, readinessSamples: 2, activated: true },
      projectUploadBarrier: { profile: "easyeda-pro-control.project-upload-barrier.v1", projectUuid: SAVE_PROJECT, scheduledWritesSettled: true, savedEditorChanges: false },
      exactSaveGuard: {
        passes: 2,
        labels: ["pcb-components"],
        snapshotSha256: [sha256Json(EMPTY_PCB_COMPONENT_PAYLOAD)],
        saveInvokedInSameExecution: true,
        publicCompareAndSwapAvailable: false,
      },
      document: {
        uuid: "document-1",
        documentType: 3,
        title: "PCB reopened",
        tabId: SAVE_TAB,
      },
    });
  });

  void test("refuses unsupported library types before generating a persistence script", () => {
    assert.throws(
      () =>
        buildSaveReopenCode({
          document: { uuid: "symbol-1", documentType: 2 },
        }, []),
      /supports schematic \(1\) and PCB \(3\) documents only/u,
    );
    assert.throws(
      () =>
        buildSaveReopenCode({
          document: { uuid: "footprint-1", documentType: 4 },
        }, []),
      /supports schematic \(1\) and PCB \(3\) documents only/u,
    );
  });

  void test("stops before mutation on identity mismatch and before close on save failure", async () => {
    const identityMismatch = pcbEda({ beforeUuid: "other-document" });
    const identityMismatchCode = buildEmptyPcbSaveCode();
    await assert.rejects(
      runGenerated(identityMismatchCode, identityMismatch.eda),
      /active document changed before save/u,
    );
    assert.deepEqual(identityMismatch.calls, [
      "guard-components",
      "guard-components",
      "read-document",
    ]);

    const saveFailure = pcbEda({ saved: false });
    const saveFailureCode = buildEmptyPcbSaveCode();
    await assert.rejects(
      runGenerated(saveFailureCode, saveFailure.eda),
      /save did not return exactly true/u,
    );
    assert.deepEqual(saveFailure.calls, [
      "guard-components",
      "guard-components",
      "read-document",
      "save:document-1",
    ]);
  });

  void test("validates the complete editor lifecycle before saving", async () => {
    const missingActivation = pcbEda();
    delete missingActivation.eda.dmt_EditorControl.activateDocument;
    const missingActivationCode = buildEmptyPcbSaveCode();

    await assert.rejects(
      runGenerated(missingActivationCode, missingActivation.eda),
      /editor open\/close\/activate API unavailable/u,
    );
    assert.deepEqual(missingActivation.calls, [
      "guard-components",
      "guard-components",
      "read-document",
    ]);
  });

  void test("never closes when scheduled native uploads did not settle", async () => {
    const fixture = pcbEda({ uploadSettled: false });
    await assert.rejects(runGenerated(buildEmptyPcbSaveCode(), fixture.eda), /PROJECT_UPLOAD_BARRIER_REFUSED/u);
    assert.deepEqual(fixture.calls, ["guard-components", "guard-components", "read-document", "save:document-1", "upload-barrier"]);
  });

  void test("treats close, open, activate, and reopened identity failures as hard errors", async () => {
    const cases: readonly (readonly [PcbEdaOptions, RegExp])[] = [
      [{ closed: false }, /NATIVE_LIFECYCLE_CLOSE_ACK/u],
      [{ openedTab: "" }, /NATIVE_LIFECYCLE_OPEN_ACK/u],
      [{ activated: null }, /NATIVE_LIFECYCLE_ACTIVATE_CONTEXT/u],
      [{ afterUuid: "other-document" }, /NATIVE_LIFECYCLE_OPEN_TIMEOUT/u],
      [{ afterType: 1 }, /NATIVE_LIFECYCLE_OPEN_TIMEOUT/u],
    ];
    for (const [options, pattern] of cases) {
      const { eda } = pcbEda(options);
      const code = buildEmptyPcbSaveCode();
      await assert.rejects(
        runGenerated(code, eda),
        pattern,
      );
    }
  });
});

void test("recovery-only direct open paths check PCB preferences before open and again before activation", async () => {
  const expected = { project: { uuid: SAVE_PROJECT }, document: { uuid: "document-1", documentType: 3, tabId: SAVE_TAB } };
  for (const code of [buildActivateRecoveryTargetCode(expected), buildReopenOnlyCode(expected, { allowDifferentActiveDocument: true })]) {
    for (const late of [false, true]) {
      const calls: string[] = [];
      let preference = late;
      const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve({ uuid: SAVE_PROJECT }) },
        dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve({ uuid: "other", documentType: 3 }) },
        dmt_EditorControl: { openDocument: (): Promise<string> => { calls.push("open"); preference = false; return Promise.resolve(SAVE_TAB); },
          activateDocument: (): never => assert.fail("Unsafe activation"), closeDocument: (): never => assert.fail("Unsafe close") } };
      const globals = { window: { top: { localStorage: { getItem: (): string => JSON.stringify({ pcbCommandTab: preference }) } } } };
      await assert.rejects(new AsyncFunction("eda", "globalThis", code)(eda, globals), /PCB_NAVIGATION_PREFERENCES_UNSAFE/u);
      assert.deepEqual(calls, late ? ["open"] : []);
    }
  }
});
