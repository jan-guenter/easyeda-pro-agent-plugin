import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { CI_GATE_SCRIPT, validateCiWorkflow } from "../../scripts/ci-contract.ts";

const workflow = new URL("../../../../.github/workflows/ci.yml", import.meta.url);
const preload = fileURLToPath(new URL("../../scripts/test-isolation.ts", import.meta.url));

void test("committed CI layout requires every shard and preserves its per-runner isolation", async () => {
  assert.deepEqual(validateCiWorkflow(await readFile(workflow, "utf8")), []);
});

/* oxlint-disable no-template-curly-in-string -- Mutations deliberately match literal Bash and GitHub expressions in the workflow. */
const mutations = [
  ["missing shard", "shard: [1, 2, 3, 4, 5, 6, 7, 8]", "shard: [1, 2, 3, 4, 5, 6, 7]"],
  ["duplicate shard", "shard: [1, 2, 3, 4, 5, 6, 7, 8]", "shard: [1, 2, 3, 4, 5, 6, 7, 7]"],
  ["different total", "--test-shard=${{ matrix.shard }}/8", "--test-shard=${{ matrix.shard }}/9"],
  ["subset glob", "server/tests/*.test.ts", "server/tests/core.test.ts"],
  ["parallel workers", "--test-concurrency=1", "--test-concurrency=2"],
  ["missing preload", "--import ./scripts/test-isolation.ts ", ""],
  ["missing core check", 'sudo prlimit --pid "${PPID}" --core=0:0', "true"],
  ["missing hostile fd", "exec 142</etc/hosts", "true"],
  ["missing bwrap verification", 'test -z "$(getcap -n /usr/sbin/bwrap)"', "true"],
  ["missing build dependency", "needs: [verify-build, facade-tests]", "needs: [facade-tests]"],
  ["missing shard dependency", "needs: [verify-build, facade-tests]", "needs: [verify-build]"],
  ["skipped gate", "if: always()", "if: success()"],
  ["permissive gate", 'test "${FACADE_RESULT}" = "success"', 'test "${FACADE_RESULT}" != "failure"'],
  ["unpinned action", "actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1", "actions/checkout@v7"],
  ["optional step", "      - name: Build MCP bundle\n", "      - name: Build MCP bundle\n        continue-on-error: true\n"],
  ["conditional step", "      - name: Build MCP bundle\n", "      - name: Build MCP bundle\n        if: false\n"],
  ["conditional matrix", "  facade-tests:\n", "  facade-tests:\n    if: false\n"],
  ["insufficient shard job budget", "    timeout-minutes: 30", "    timeout-minutes: 20"],
  ["fail fast", "fail-fast: false", "fail-fast: true"],
  ["unexpected job", "  facade-tests:\n", "  Unexpected_job2:\n    runs-on: ubuntu-24.04\n  facade-tests:\n"],
] as const;
/* oxlint-enable no-template-curly-in-string */
for (const [name, before, after] of mutations) {
  void test(`CI contract rejects ${name}`, async () => {
    const source = await readFile(workflow, "utf8");
    assert.ok(source.includes(before));
    assert.ok(validateCiWorkflow(source.replaceAll(before, after)).length > 0);
  });
}

void test("CI contract refuses missing, repeated and oversized job documents", () => {
  for (const source of ["", "jobs:\n", "\njobs:\n\njobs:\n", "x".repeat(65_537)]) {
    assert.ok(validateCiWorkflow(source).length > 0);
  }
});

void test("the exact protected gate fails every non-success dependency result", () => {
  for (const build of ["success", "failure", "cancelled", "skipped", ""]) {
    for (const facade of ["success", "failure", "cancelled", "skipped", ""]) {
      // oxlint-disable-next-line node/no-sync -- Exercise the exact two builtin shell checks without starting tests or sharing process state.
      const result = spawnSync("/bin/bash", ["--noprofile", "--norc", "-e", "-c", CI_GATE_SCRIPT], {
        env: { BUILD_RESULT: build, FACADE_RESULT: facade }, encoding: "utf8", timeout: 1000, maxBuffer: 8192,
      });
      assert.equal(result.error, undefined); assert.equal(result.signal, null);
      assert.equal(result.status === 0, build === "success" && facade === "success");
    }
  }
});

void test("Node's eight serial shards run the entire file set exactly once with unique preloaded roots", async () => {
  const root = await mkdtemp(join(tmpdir(), "easyeda-ci-shards-"));
  const files: string[] = [];
  for (let index = 0; index < 16; index += 1) {
    const path = join(root, `${String(index).padStart(2, "0")}.test.mjs`);
    const output = join(root, `${String(index)}.observed.json`);
    await writeFile(path, `import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { test } from "node:test";
test("shard-case-${String(index)}", async () => {
  const root = process.env.EASYEDA_CONTROL_DATA_DIR;
  assert.match(root, /easyeda-test-control-/);
  await writeFile(${JSON.stringify(output)}, JSON.stringify({ index: ${String(index)}, root }), { flag: "wx" });
});\n`, { flag: "wx", mode: 0o600 });
    files.push(path);
  }
  const environment = { ...process.env, TMPDIR: root, LC_ALL: "C" };
  Reflect.deleteProperty(environment, "NODE_TEST_CONTEXT");
  for (let shard = 1; shard <= 8; shard += 1) {
    // oxlint-disable-next-line node/no-sync -- Each independent runner must terminate before the next shard checks exclusive fixture receipts.
    const result = spawnSync(process.execPath, ["--import", preload, "--test", "--test-concurrency=1", `--test-shard=${String(shard)}/8`, ...files], {
      cwd: root, env: environment, encoding: "utf8", timeout: 20_000, maxBuffer: 131_072,
    });
    assert.equal(result.error, undefined); assert.equal(result.status, 0, result.stderr + result.stdout);
  }
  const entries = await readdir(root);
  const receipts = entries.filter((name) => name.endsWith(".observed.json"));
  assert.equal(receipts.length, files.length);
  const roots = new Set<string>();
  for (let index = 0; index < files.length; index += 1) {
    const receiptPath = join(root, `${String(index)}.observed.json`);
    const parsed: unknown = JSON.parse(await readFile(receiptPath, "utf8"));
    assert.ok(parsed !== null && typeof parsed === "object" && "index" in parsed && "root" in parsed);
    assert.equal(parsed.index, index); assert.equal(typeof parsed.root, "string");
    assert.ok(String(parsed.root).startsWith(join(root, "easyeda-test-control-")));
    roots.add(String(parsed.root));
  }
  assert.equal(roots.size, files.length);
  // Retain the owned fixture and its private worker roots as diagnostic evidence.
});
