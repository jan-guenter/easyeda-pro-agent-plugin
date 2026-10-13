import assert from "node:assert/strict";
import fsPromises, { readFile, writeFile } from "node:fs/promises";
import { registerHooks, syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { performance } from "node:perf_hooks";
import test from "node:test";
/* oxlint-disable node/no-top-level-await -- Fixed synthetic manifest resolver before its consumer; no result or authority verifier override. */
const coreUrl = new URL("../src/core.ts", import.meta.url), syntheticCore = new URL("helpers/closed-symbol-terminal-closure-synthetic-core.ts", import.meta.url);
registerHooks({ resolve(specifier, context, nextResolve) {
  const selected = nextResolve(specifier, context);
  if (selected.url === coreUrl.href && context.parentURL === new URL("../src/closed-symbol-terminal-closure-plan.ts", import.meta.url).href) { return { url: syntheticCore.href, shortCircuit: true }; }
  return selected;
} });
const { closureFixture } = await import("./helpers/closed-symbol-terminal-closure-fixture.ts");
const { captureClosedSymbolJournalBytes } = await import("../src/closed-symbol-terminal-closure-journal.ts");
const { observeClosedSymbolTerminalClosure } = await import("../src/closed-symbol-terminal-closure-observer.ts");
const { ClosureEvidenceChangedError } = await import("../src/closed-symbol-terminal-closure-plan.ts");

for (const mode of ["capture", "collector"]) {
  for (const cleanup of ["late", "failed"]) {
    void test(`${mode} preserves observed contradiction through ${cleanup} cleanup`, async (context) => {
      const f = await closureFixture(), original = fsPromises.open;
      const path = mode === "capture" ? f.input.journalBytes.artifact.path : f.input.envelope.body.evidence.savedReadRaw.path;
      if (mode === "capture") { await writeFile(path, `${JSON.stringify({ ...f.input.journal, contradiction: true }, null, 2)}\n`); }
      else { const bytes = await readFile(path); bytes[0] = 0; await writeFile(path, bytes); }
      let closing = false;
      let closed = false;
      context.mock.method(performance, "now", () => closing ? 10_001 : 0);
      context.mock.method(fsPromises, "open", async (...args: Parameters<typeof fsPromises.open>) => {
        const handle = await Reflect.apply(original, fsPromises, args);
        if (String(args[0]).endsWith(basename(path))) {
          const close = handle.close.bind(handle);
          context.mock.method(handle, "close", async () => {
            await close(); closed = true; closing = true;
            if (cleanup === "failed") { throw new Error("synthetic-secondary-close-error"); }
          });
        }
        return handle;
      });
      syncBuiltinESMExports(); context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
      await assert.rejects(mode === "capture" ? captureClosedSymbolJournalBytes(f.input.journal) : observeClosedSymbolTerminalClosure(f.input),
        (error: unknown) => error instanceof ClosureEvidenceChangedError && error.message === (mode === "capture" ? "closure-journal-semantic-changed" : "closure-expected-bytes-changed"));
      assert.equal(closed, true);
    });
  }
}
