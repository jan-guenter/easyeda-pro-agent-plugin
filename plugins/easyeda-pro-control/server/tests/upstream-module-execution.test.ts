import assert from "node:assert/strict";
import { mkdir, mkdtemp, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, test } from "node:test";

import {
  deserializeCapturedUpstreamModuleGraph,
  executeCapturedUpstreamModuleGraph,
  serializeCapturedUpstreamModuleGraph,
} from "../src/upstream-module-execution.ts";
import { captureLauncherFingerprint } from "../src/upstream-trust.ts";
import type { LauncherCapture } from "../src/upstream-trust.ts";

interface SavedEnvironmentValue {
  readonly present: boolean;
  readonly value?: string | undefined;
}

const GRAPH_MARKER = "__easyedaCapturedGraphTest_v1__";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredRecord(value: unknown, label: string): Record<string, unknown> {
  assert.ok(isRecord(value), `${label} must be an object.`);
  return value;
}

function requiredArray(value: unknown, label: string): unknown[] {
  assert.ok(Array.isArray(value), `${label} must be an array.`);
  return value;
}

function requiredString(value: unknown, label: string): string {
  if (typeof value !== "string") {
    throw new TypeError(`${label} must be a string.`);
  }
  return value;
}

function mutateSerializedGraph(
  serialized: Buffer,
  mutate: (payload: Record<string, unknown>) => void,
): Buffer {
  const parsed: unknown = JSON.parse(serialized.toString("utf8"));
  const payload = requiredRecord(parsed, "serialized graph");
  mutate(payload);
  return Buffer.from(JSON.stringify(payload), "utf8");
}

function saveEnvironment(name: string): SavedEnvironmentValue {
  return Object.hasOwn(process.env, name)
    ? { present: true, value: process.env[name] }
    : { present: false };
}

function restoreEnvironment(
  name: string,
  saved: SavedEnvironmentValue,
): void {
  if (saved.present) {
    process.env[name] = saved.value;
  } else {
    Reflect.deleteProperty(process.env, name);
  }
}

async function captureFixture(
  root: string,
  entrypoint: string,
): Promise<LauncherCapture> {
  const names = [
    "EASYEDA_UPSTREAM_COMMAND",
    "EASYEDA_UPSTREAM_ARGS_JSON",
    "EASYEDA_UPSTREAM_CWD",
  ] as const;
  const saved = new Map(
    names.map((name) => [name, saveEnvironment(name)] as const),
  );
  process.env["EASYEDA_UPSTREAM_COMMAND"] = process.execPath;
  process.env["EASYEDA_UPSTREAM_ARGS_JSON"] = JSON.stringify([entrypoint]);
  process.env["EASYEDA_UPSTREAM_CWD"] = root;
  try {
    return await captureLauncherFingerprint();
  } finally {
    for (const name of names) {
      const previous = saved.get(name);
      if (previous !== undefined) {
        restoreEnvironment(name, previous);
      }
    }
  }
}

async function replaceWithAttacker(path: string, source: string): Promise<void> {
  await rename(path, `${path}.reviewed`);
  await writeFile(path, source, "utf8");
}

void describe("captured upstream module execution", () => {
  void test(
    "executes descriptor-captured ESM, CommonJS, and lazy bytes after path replacement",
    { skip: process.platform !== "linux" },
    async () => {
      const root = await mkdtemp("/tmp/easyeda-module-graph-test-");
      const implementation = join(root, "dist");
      const entrypoint = join(implementation, "entry.mjs");
      const eager = join(implementation, "eager.mjs");
      const lazy = join(implementation, "lazy.mjs");
      const wrapper = join(implementation, "wrapper.cjs");
      const commonjsLazy = join(implementation, "lazy.cjs");
      const payload = join(implementation, "payload.txt");
      let execution:
        | Awaited<ReturnType<typeof executeCapturedUpstreamModuleGraph>>
        | undefined;
      try {
        await mkdir(implementation);
        await mkdir(join(root, "node_modules"));
        await writeFile(
          join(root, "package.json"),
          `${JSON.stringify({ name: "module-graph-fixture", type: "module" })}\n`,
          "utf8",
        );
        await writeFile(
          join(root, "package-lock.json"),
          `${JSON.stringify({ lockfileVersion: 3, name: "module-graph-fixture" })}\n`,
          "utf8",
        );
        await writeFile(payload, "reviewed payload\n", "utf8");
        await writeFile(
          eager,
          `globalThis[${JSON.stringify(GRAPH_MARKER)}].push("reviewed-eager");\n`,
          "utf8",
        );
        await writeFile(
          lazy,
          `globalThis[${JSON.stringify(GRAPH_MARKER)}].push("reviewed-lazy-esm");\n`,
          "utf8",
        );
        await writeFile(
          commonjsLazy,
          'module.exports = "reviewed-lazy-cjs";\n',
          "utf8",
        );
        await writeFile(
          wrapper,
          `
            const payloadPath = require.resolve("./payload.txt");
            const lazyValue = require("./lazy.cjs");
            module.exports = lazyValue + ":" + payloadPath.endsWith("payload.txt");
          `,
          "utf8",
        );
        await writeFile(
          entrypoint,
          `
            import "./eager.mjs";
            import commonjsValue from "./wrapper.cjs";
            globalThis[${JSON.stringify(GRAPH_MARKER)}].push(commonjsValue);
            await import("./lazy.mjs");
          `,
          "utf8",
        );
        Reflect.set(globalThis, GRAPH_MARKER, []);
        const capture = await captureFixture(root, entrypoint);
        assert.ok(
          capture.moduleGraph.fingerprint.totalBytes <
            capture.fingerprint.executionClosure.totalBytes,
        );
        execution = await executeCapturedUpstreamModuleGraph(
          capture.moduleGraph,
          async () => {
            await replaceWithAttacker(
              entrypoint,
              `globalThis[${JSON.stringify(GRAPH_MARKER)}].push("attacker-entry");\n`,
            );
            await replaceWithAttacker(
              eager,
              `globalThis[${JSON.stringify(GRAPH_MARKER)}].push("attacker-eager");\n`,
            );
            await replaceWithAttacker(
              lazy,
              `globalThis[${JSON.stringify(GRAPH_MARKER)}].push("attacker-lazy-esm");\n`,
            );
            await replaceWithAttacker(
              commonjsLazy,
              'module.exports = "attacker-lazy-cjs";\n',
            );
          },
        );
        assert.deepEqual(Reflect.get(globalThis, GRAPH_MARKER), [
          "reviewed-eager",
          "reviewed-lazy-cjs:true",
          "reviewed-lazy-esm",
        ]);
      } finally {
        execution?.deregister();
        Reflect.deleteProperty(globalThis, GRAPH_MARKER);
        await rm(root, { recursive: true, force: true });
      }
    },
  );

  void test("rejects a reachable computed dynamic import at execution", async () => {
    const root = await mkdtemp("/tmp/easyeda-module-graph-dynamic-test-");
    const implementation = join(root, "dist");
    const entrypoint = join(implementation, "entry.mjs");
    try {
      await mkdir(implementation);
      await mkdir(join(root, "node_modules"));
      await writeFile(
        join(root, "package.json"),
        `${JSON.stringify({ name: "dynamic-module-fixture", type: "module" })}\n`,
        "utf8",
      );
      await writeFile(
        join(root, "package-lock.json"),
        `${JSON.stringify({ lockfileVersion: 3, name: "dynamic-module-fixture" })}\n`,
        "utf8",
      );
      await writeFile(
        entrypoint,
        'const target = "./lazy.mjs"; await import(target);\n',
        "utf8",
      );
      const capture = await captureFixture(root, entrypoint);
      await assert.rejects(
        executeCapturedUpstreamModuleGraph(capture.moduleGraph),
        /Unreviewed upstream import edge was denied/u,
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  for (const [label, invocation] of [
    ["computed require", "require(target)"],
    ["computed module.require", "module.require(target)"],
  ] as const) {
    void test(`rejects ${label} at execution`, async () => {
      const root = await mkdtemp("/tmp/easyeda-module-graph-require-test-");
      const implementation = join(root, "dist");
      const entrypoint = join(implementation, "entry.mjs");
      try {
        await mkdir(implementation);
        await mkdir(join(root, "node_modules"));
        await writeFile(
          join(root, "package.json"),
          `${JSON.stringify({ name: "computed-require-fixture", type: "module" })}\n`,
          "utf8",
        );
        await writeFile(
          join(root, "package-lock.json"),
          `${JSON.stringify({ lockfileVersion: 3, name: "computed-require-fixture" })}\n`,
          "utf8",
        );
        await writeFile(
          join(implementation, "lazy.cjs"),
          'module.exports = "unreviewed";\n',
          "utf8",
        );
        await writeFile(
          join(implementation, "wrapper.cjs"),
          `const target = "./lazy.cjs"; module.exports = ${invocation};\n`,
          "utf8",
        );
        await writeFile(entrypoint, 'import "./wrapper.cjs";\n', "utf8");
        const capture = await captureFixture(root, entrypoint);
        await assert.rejects(
          executeCapturedUpstreamModuleGraph(capture.moduleGraph),
          /Unreviewed upstream require edge was denied/u,
        );
      } finally {
        await rm(root, { recursive: true, force: true });
      }
    });
  }

  void test("rejects a reachable native addon during capture", async () => {
    const root = await mkdtemp("/tmp/easyeda-module-graph-addon-test-");
    const implementation = join(root, "dist");
    const entrypoint = join(implementation, "entry.mjs");
    try {
      await mkdir(implementation);
      await mkdir(join(root, "node_modules"));
      await writeFile(
        join(root, "package.json"),
        `${JSON.stringify({ name: "native-addon-fixture", type: "module" })}\n`,
        "utf8",
      );
      await writeFile(
        join(root, "package-lock.json"),
        `${JSON.stringify({ lockfileVersion: 3, name: "native-addon-fixture" })}\n`,
        "utf8",
      );
      await writeFile(join(implementation, "native.node"), "not an addon\n", "utf8");
      await writeFile(
        join(implementation, "wrapper.cjs"),
        'module.exports = require("./native.node");\n',
        "utf8",
      );
      await writeFile(entrypoint, 'import "./wrapper.cjs";\n', "utf8");
      await assert.rejects(
        captureFixture(root, entrypoint),
        /Unsupported executable upstream module extension/u,
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  void test("round-trips a reviewed graph with no dependency edges", async () => {
    const root = await mkdtemp("/tmp/easyeda-module-graph-empty-edge-test-");
    const implementation = join(root, "dist");
    const entrypoint = join(implementation, "entry.mjs");
    try {
      await mkdir(implementation);
      await mkdir(join(root, "node_modules"));
      await writeFile(
        join(root, "package.json"),
        `${JSON.stringify({ name: "empty-edge-fixture", type: "module" })}\n`,
        "utf8",
      );
      await writeFile(
        join(root, "package-lock.json"),
        `${JSON.stringify({ lockfileVersion: 3, name: "empty-edge-fixture" })}\n`,
        "utf8",
      );
      await writeFile(entrypoint, "export const value = 1;\n", "utf8");
      const capture = await captureFixture(root, entrypoint);
      assert.equal(capture.moduleGraph.fingerprint.edgeCount, 0);
      const serialized = serializeCapturedUpstreamModuleGraph(
        capture.moduleGraph,
      );
      const restored = deserializeCapturedUpstreamModuleGraph(
        serialized,
        capture.moduleGraph.fingerprint,
      );
      assert.equal(restored.resolutions.size, 0);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  void test("rejects noncanonical graph JSON, URL, NUL, and transform ambiguity", async () => {
    const root = await mkdtemp("/tmp/easyeda-module-graph-canonical-test-");
    const implementation = join(root, "dist");
    const entrypoint = join(implementation, "entry.mjs");
    try {
      await mkdir(implementation);
      await mkdir(join(root, "node_modules"));
      await writeFile(
        join(root, "package.json"),
        `${JSON.stringify({ name: "canonical-graph-fixture", type: "module" })}\n`,
        "utf8",
      );
      await writeFile(
        join(root, "package-lock.json"),
        `${JSON.stringify({ lockfileVersion: 3, name: "canonical-graph-fixture" })}\n`,
        "utf8",
      );
      await writeFile(
        join(implementation, "dependency.mjs"),
        "export const value = 1;\n",
        "utf8",
      );
      await writeFile(
        entrypoint,
        'import { value } from "./dependency.mjs"; void value;\n',
        "utf8",
      );
      const capture = await captureFixture(root, entrypoint);
      const serialized = serializeCapturedUpstreamModuleGraph(
        capture.moduleGraph,
      );
      const expected = capture.moduleGraph.fingerprint;
      assert.throws(
        () =>
          deserializeCapturedUpstreamModuleGraph(
            Buffer.concat([Buffer.from(" "), serialized]),
            expected,
          ),
        /not exact canonical JSON/u,
      );
      assert.throws(
        () => {
          const duplicateCwd = serialized
            .toString("utf8")
            .replace("{", `{"cwd":${JSON.stringify(root)},`);
          deserializeCapturedUpstreamModuleGraph(
            Buffer.from(duplicateCwd, "utf8"),
            expected,
          );
        },
        /not exact canonical JSON/u,
      );

      const cases: readonly [
        string,
        (payload: Record<string, unknown>) => void,
        RegExp,
      ][] = [
        [
          "entrypoint query",
          (payload) => {
            payload["entrypointUrl"] = `${requiredString(payload["entrypointUrl"], "entrypoint URL")}?variant=1`;
          },
          /without a query or fragment/u,
        ],
        [
          "module fragment",
          (payload) => {
            const modules = requiredArray(payload["modules"], "modules");
            const module = requiredRecord(modules[0], "module");
            module["url"] = `${requiredString(module["url"], "module URL")}#variant`;
          },
          /without a query or fragment/u,
        ],
        [
          "module encoded NUL",
          (payload) => {
            const modules = requiredArray(payload["modules"], "modules");
            const module = requiredRecord(modules[0], "module");
            module["url"] = `${requiredString(module["url"], "module URL")}%00`;
          },
          /not a canonical local file URL/u,
        ],
        [
          "edge parent query",
          (payload) => {
            const edges = requiredArray(payload["resolutions"], "resolutions");
            const edge = requiredRecord(edges[0], "edge");
            edge["parentUrl"] = `${requiredString(edge["parentUrl"], "parent URL")}?variant=1`;
          },
          /without a query or fragment/u,
        ],
        [
          "edge target fragment",
          (payload) => {
            const edges = requiredArray(payload["resolutions"], "resolutions");
            const edge = requiredRecord(edges[0], "edge");
            edge["resolvedUrl"] = `${requiredString(edge["resolvedUrl"], "resolved URL")}#variant`;
          },
          /without a query or fragment/u,
        ],
        [
          "NUL specifier",
          (payload) => {
            const edges = requiredArray(payload["resolutions"], "resolutions");
            const edge = requiredRecord(edges[0], "edge");
            edge["specifier"] = `${requiredString(edge["specifier"], "specifier")}\0suffix`;
          },
          /NUL-bearing specifier/u,
        ],
        [
          "none-transform hash mismatch",
          (payload) => {
            const modules = requiredArray(payload["modules"], "modules");
            const module = requiredRecord(modules[0], "module");
            module["sourceSha256"] = "0".repeat(64);
          },
          /invalid execution transform binding/u,
        ],
        [
          "pino transform on another path",
          (payload) => {
            const modules = requiredArray(payload["modules"], "modules");
            const module = requiredRecord(modules[0], "module");
            module["transform"] =
              "easyeda-pro-control.disable-pino-worker.v1";
            module["sourceSha256"] = "0".repeat(64);
          },
          /invalid execution transform binding/u,
        ],
      ];
      for (const [label, mutate, expectedError] of cases) {
        assert.throws(
          () =>
            deserializeCapturedUpstreamModuleGraph(
              mutateSerializedGraph(serialized, mutate),
              expected,
            ),
          expectedError,
          label,
        );
      }
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
