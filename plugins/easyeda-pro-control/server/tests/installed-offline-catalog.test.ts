import assert from "node:assert/strict";
import { copyFile, mkdir, mkdtemp, readFile, readdir, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";

import { probeInstalledOfflineCatalog } from "../../scripts/probe-installed-offline-catalog.ts";

async function fixture(program?: string): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "easyeda-offline-catalog-fixture-"));
  await mkdir(join(root, "server/dist"), { recursive: true });
  await mkdir(join(root, "server/bin"), { recursive: true });
  await copyFile(new URL("../../.mcp.json", import.meta.url), join(root, ".mcp.json"));
  if (program === undefined) {
    for (const name of ["server.mjs", "upstream-supervisor.mjs"]) {
      await copyFile(new URL(`../dist/${name}`, import.meta.url), join(root, "server/dist", name));
    }
    await copyFile(new URL("../bin/easyeda-fd-sanitizer", import.meta.url), join(root, "server/bin/easyeda-fd-sanitizer"));
  } else {
    await writeFile(join(root, "server/dist/server.mjs"), program);
  }
  return root;
}

void describe("dependency-free installed package offline catalog probe", () => {
  void test("uses the actual packaged launcher with a private synthetic profile and EOF closure", async () => {
    const root = await fixture();
    const before = await readFile(join(root, "server/dist/server.mjs"));
    const result = await probeInstalledOfflineCatalog(root);
    assert.equal(result["ok"], true);
    assert.equal(result["scope"], "synthetic-profile-installed-package-offline-catalog;not-runtime-admission");
    assert.equal(result["tools"], 27);
    assert.equal(result["configuredTools"], 52);
    assert.equal(result["queries"], 45);
    const closed = result["closed"];
    assert.ok(closed !== null && typeof closed === "object" && "requests" in closed);
    assert.equal(closed.requests, 47);
    assert.equal(result["ratlineContinuationDiscoveryChecked"], true);
    assert.equal(result["footprintCopyPreparationDiscoveryChecked"], true);
    assert.equal(result["footprintCopyRoutePreparationDiscoveryChecked"], true);
    assert.equal(result["footprintMainDiscoveryChecked"], true);
    assert.equal(result["footprintCombinedDiscoveryChecked"], true);
    assert.equal(result["footprintCombinedUnknownAbandonmentDiscoveryChecked"], true);
    assert.equal(result["postCloseMarkerAbsentAndControlRosterVerified"], true);
    assert.equal(result["sampledNoDescendantsOrNonStdioSockets"], true);
    assert.equal(result["continuousIsolationVerified"], false);
    assert.equal(result["liveControlRootSelected"], false);
    assert.equal(result["executionAuthorized"], false);
    assert.deepEqual(await readFile(join(root, "server/dist/server.mjs")), before);
    const evidence = result["evidencePath"]; assert.equal(typeof evidence, "string");
    if (typeof evidence !== "string") { throw new TypeError("Missing evidence path."); }
    const entries = await readdir(join(evidence, "control"));
    assert.deepEqual(entries.toSorted(), ["machine-profile.json"]);
    await assert.rejects(readFile(join(evidence, "upstream-must-not-execute")), { code: "ENOENT" });
    const resultText = await readFile(join(evidence, "result.json"), "utf8");
    assert.deepEqual(JSON.parse(resultText), result);
  });

  void test("refuses success when shutdown creates the upstream marker or unexpected control data", async () => {
    for (const kind of ["upstream", "control"] as const) {
      const root = await fixture();
      const path = join(root, "server/dist/server.mjs");
      const source = await readFile(path, "utf8");
      const selectedPath = kind === "upstream"
        ? 'profile.upstream.root + "/../upstream-must-not-execute"'
        : 'profile.controlDirectory + "/late-control-file"';
      // Only this copied synthetic bundle is changed. The exit hook runs after
      // Both live samples and the facade's ordinary shutdown.
      await writeFile(path, `${source}\nimport * as shutdownFixtureFs from "node:fs";
process.once("exit", () => {
  const profile = JSON.parse(shutdownFixtureFs.readFileSync(process.env["EASYEDA_MACHINE_PROFILE"], "utf8"));
  shutdownFixtureFs.writeFileSync(${selectedPath}, "shutdown-only fixture effect");
});\n`);
      const expected = kind === "upstream" ? /upstream marker appeared during offline shutdown/u : /shutdown left unexpected control data/u;
      await assert.rejects(probeInstalledOfflineCatalog(root), (error: unknown) => {
        assert.ok(error instanceof AggregateError);
        assert.ok(error.errors.some((entry: unknown) => entry instanceof Error && expected.test(entry.message)));
        return true;
      });
    }
  });

  void test("rejects relative, broad and noncanonical roots before starting any child", async () => {
    const root = await fixture();
    for (const value of [".", "/", `${root}/`, `${root}/../${root.split("/").at(-1)}`]) {
      await assert.rejects(probeInstalledOfflineCatalog(value), /canonical absolute/u);
    }
    const linked = `${root}-link`; await symlink(root, linked);
    await assert.rejects(probeInstalledOfflineCatalog(linked), /linked or noncanonical/u);
  });

  void test("refuses available dependency ancestors and caller-modified launch configuration", async () => {
    for (const relative of ["node_modules", "server/node_modules", "server/dist/node_modules"]) {
      const root = await fixture();
      await mkdir(join(root, relative));
      await assert.rejects(probeInstalledOfflineCatalog(root), /no node_modules/u);
    }
    const altered = await fixture();
    await writeFile(join(altered, ".mcp.json"), JSON.stringify({ mcpServers: { easyeda_pro_control: {
      type: "stdio", command: "sh", args: ["caller command"], cwd: ".", env: {},
    } } }));
    await assert.rejects(probeInstalledOfflineCatalog(altered), /Offline package probe failed/u);
  });

  void test("rejects invalid, unsolicited, incomplete, oversized and stderr output, closing only its own child", async () => {
    const programs = [
      String.raw`process.stdin.once("data", () => { process.stdout.write("not-json\n"); }); process.stdin.resume();`,
      String.raw`process.stdin.once("data", () => { process.stdout.write('{"jsonrpc":"2.0","id":999,"result":{}}\n'); }); process.stdin.resume();`,
      'process.stdin.once("data", () => { process.stdout.write("x".repeat(8 * 1024 * 1024 + 1)); }); process.stdin.resume();',
      String.raw`process.stdin.once("data", () => { process.stderr.write("diagnostic"); process.stdout.write("bad\n"); }); process.stdin.resume();`,
      String.raw`process.stdin.once("data", () => { process.stdout.write('{"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2024-11-05","serverInfo":{"name":"fixture"}}}\n{"partial"'); }); process.stdin.resume();`,
    ];
    for (const program of programs) {
      const root = await fixture(program);
      await assert.rejects(probeInstalledOfflineCatalog(root), /Offline package probe failed/u);
      // Test fixture bytes remain evidence; the probe never removes or patches them.
      assert.equal(await readFile(join(root, "server/dist/server.mjs"), "utf8"), program);
    }
  });

  void test("script dependencies are only Node builtins and the builtin-only private directory helper", async () => {
    const source = await readFile(new URL("../../scripts/probe-installed-offline-catalog.ts", import.meta.url), "utf8");
    const imports = [...source.matchAll(/from "([^"]+)"/gu)].map(match => match[1]);
    assert.ok(imports.every(value => value?.startsWith("node:") === true || value === "./private-temporary-directory.ts"));
    assert.equal(source.includes('name: "easyeda_control_api"'), true);
    assert.equal(source.includes(".kill("), false);
    assert.equal(source.includes("process.env"), false);
  });
});
