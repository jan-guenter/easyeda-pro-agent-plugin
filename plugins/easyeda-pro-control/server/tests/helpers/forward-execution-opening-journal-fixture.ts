/** Actual journal/private state and managed files. Only an external publisher
 * acknowledgment is interrupted; this fixture issues no native ownership. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { assertOperationIdUnused, createOperation, createOperationScanner, ensureOperationStorage, loadOperation, operationPath, updateOperation, verifyExactManagedArtifact, writePhaseArtifact } from "../../src/artifacts.ts";
import type { CurrentFootprintForwardExecutionOpeningJournal } from "../../src/current-footprint-forward-execution-opening-journal.ts";

const artifacts = { assertOperationIdUnused, createOperation, createOperationScanner, ensureOperationStorage, loadOperation, operationPath, updateOperation, verifyExactManagedArtifact, writePhaseArtifact };

export async function forwardExecutionOpeningJournalFixture(mode: "create-ack" | "manifest-ack" | "cleanup-ack" | "held-artifact" | "held-main-result" | "ensure-storage" | "held-storage" | "create-conflict"): Promise<Readonly<{
  Journal: typeof CurrentFootprintForwardExecutionOpeningJournal;
  state: { creates: number; artifacts: number; manifests: number; fail: boolean };
  release: () => void;
  entered: Promise<null>;
}>> {
  const source = new URL("../../src/current-footprint-forward-execution-opening-journal.ts", import.meta.url); const require = createRequire(source);
  const output = await transform(await readFile(source, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const loaded = { exports: {} }; const state = { creates: 0, artifacts: 0, manifests: 0, fail: true };
  const held = Promise.withResolvers<null>(); const entered = Promise.withResolvers<null>();
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.equal(typeof evaluate, "function"); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name !== "./artifacts.ts") {
      // oxlint-disable-next-line import/no-dynamic-require -- This isolated VM forwards unchanged production imports; only the exact managed publisher is interrupted.
      return require(name) as unknown;
    }
    return { ...artifacts,
      ensureOperationStorage: async (): ReturnType<typeof artifacts.ensureOperationStorage> => {
        if ((mode === "ensure-storage" || mode === "held-storage") && state.fail) {
          state.fail = false;
          if (mode === "held-storage") { entered.resolve(null); await held.promise; }
          throw new Error("synthetic storage failure before original create");
        }
        return artifacts.ensureOperationStorage();
      },
      createOperation: async (...args: Parameters<typeof artifacts.createOperation>): ReturnType<typeof artifacts.createOperation> => {
        state.creates += 1;
        if (mode === "create-conflict" && state.fail) { state.fail = false; throw Object.assign(new Error("synthetic original create conflict"), { code: "EEXIST" }); }
        const result = await artifacts.createOperation(...args);
        if (mode === "create-ack" && state.fail) { state.fail = false; throw new Error("synthetic original create acknowledgment lost"); } return result;
      },
      writePhaseArtifact: async (...args: Parameters<typeof artifacts.writePhaseArtifact>): ReturnType<typeof artifacts.writePhaseArtifact> => {
        state.artifacts += 1;
        if ((mode === "held-artifact" || mode === "held-main-result" && args[2] === "main-result") && state.fail) { state.fail = false; entered.resolve(null); await held.promise; }
        return artifacts.writePhaseArtifact(...args);
      },
      updateOperation: async (...args: Parameters<typeof artifacts.updateOperation>): ReturnType<typeof artifacts.updateOperation> => {
        state.manifests += 1; const result = await artifacts.updateOperation(...args);
        if (state.fail && (mode === "manifest-ack" || mode === "cleanup-ack" && args[0]["state"] === "completed")) {
          state.fail = false; throw new Error("synthetic original manifest acknowledgment lost");
        } return result;
      },
    };
  }, loaded, loaded.exports]);
  const api: unknown = loaded.exports; assert.ok(api !== null && typeof api === "object" && "CurrentFootprintForwardExecutionOpeningJournal" in api && typeof api.CurrentFootprintForwardExecutionOpeningJournal === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The actual transformed source exports this named private-field class; only publication acknowledgment seams differ.
  const Journal = api.CurrentFootprintForwardExecutionOpeningJournal as typeof CurrentFootprintForwardExecutionOpeningJournal;
  return Object.freeze({ Journal, state, release: (): void => { held.resolve(null); }, entered: entered.promise });
}
