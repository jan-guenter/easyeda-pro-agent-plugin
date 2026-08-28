import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  CONTEXT_PROBE_CODE,
  RUNTIME_IDENTITY_PROBE_CODE,
  buildComponentMutationCode,
  buildSaveReopenCode,
  wrapWithContextGuard,
} from "../src/runtime-scripts.ts";
import { buildExactReadCode } from "../src/exact-readers.ts";
import { normalizeProofEnvelope, sha256Json } from "../src/core.ts";

type AsyncFunctionConstructor = new (
  ...parameters: string[]
) => (eda: unknown) => Promise<unknown>;

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
  activated?: boolean;
}

interface PcbEdaFixture {
  eda: {
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
      activateDocument?: ((tabId: string) => Promise<boolean>) | undefined;
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
  let reads = 0;
  const before = {
    uuid: options.beforeUuid ?? "document-1",
    documentType: options.beforeType ?? 3,
    tabId: "old-tab",
    title: "PCB",
  };
  const after = {
    uuid: options.afterUuid ?? "document-1",
    documentType: options.afterType ?? 3,
    tabId: "new-tab",
    title: "PCB reopened",
  };
  const eda = {
    dmt_SelectControl: {
      getCurrentDocumentInfo: async (): Promise<Record<string, unknown>> => {
        calls.push("read-document");
        reads += 1;
        return reads === 1 ? before : after;
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
        return options.closed ?? true;
      },
      openDocument: async (uuid: string): Promise<string> => {
        calls.push(`open:${uuid}`);
        return options.openedTab ?? "new-tab";
      },
      activateDocument: async (tabId: string): Promise<boolean> => {
        calls.push(`activate:${tabId}`);
        return options.activated ?? true;
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
      "Placed component-pad centers, identity, layer, number, and net only; pad/hole geometry is intentionally omitted because this pinned wrapper has a known 0.1 drill-scale defect.",
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
      document: { uuid: "document-1", documentType: 3, tabId: "old-tab" },
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
    });
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
  void test("all five exact-reader programs parse as async JavaScript", () => {
    for (const request of [
      {
        kind: "schematic-components",
        selector: { primitiveIds: ["R1"] },
        includePins: true,
        includeBounds: true,
      },
      { kind: "schematic-topology" },
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
      "close:old-tab",
      "open:document-1",
      "activate:new-tab",
      "read-document",
    ]);
    assert.deepEqual(result, {
      ok: true,
      saved: true,
      closed: true,
      reopened: true,
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
        tabId: "new-tab",
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

  void test("treats close, open, activate, and reopened identity failures as hard errors", async () => {
    const cases: readonly (readonly [PcbEdaOptions, RegExp])[] = [
      [{ closed: false }, /closeDocument did not return exactly true/u],
      [{ openedTab: "" }, /openDocument did not return a tab id/u],
      [{ activated: false }, /activateDocument did not return exactly true/u],
      [{ afterUuid: "other-document" }, /reopened document identity mismatch/u],
      [{ afterType: 1 }, /reopened document identity mismatch/u],
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
