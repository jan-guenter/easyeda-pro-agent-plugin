import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
  link,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, test } from "node:test";

import {
  bundledPackages,
  readContainedRegularFile,
} from "../../scripts/bundled-runtime-license.ts";
import { buildServer } from "../../scripts/build-server.ts";

const temporaryRoots: string[] = [];

async function fixtureRoot(): Promise<string> {
  const root = await mkdtemp(join("/tmp", "bundled-runtime-license-"));
  temporaryRoots.push(root);
  await Promise.all([
    mkdir(join(root, "node_modules"), { recursive: true }),
    mkdir(join(root, "server", "src"), { recursive: true }),
  ]);
  return root;
}

async function writePackage(
  root: string,
  name: string,
  metadata: unknown,
): Promise<void> {
  const packageRoot = join(root, "node_modules", name);
  await mkdir(join(packageRoot, "dist"), { recursive: true });
  await writeFile(
    join(packageRoot, "package.json"),
    `${JSON.stringify(
      typeof metadata === "object" && metadata !== null && !Array.isArray(metadata)
        ? {
            repository: `https://github.com/fixture/${name}`,
            ...metadata,
          }
        : metadata,
    )}\n`,
    "utf8",
  );
  await writeFile(
    join(packageRoot, "dist", "index.js"),
    "export {};\n",
    "utf8",
  );
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

interface ChildResult {
  readonly code: number | null;
  readonly signal: NodeJS.Signals | null;
  readonly stderr: string;
  readonly stdout: string;
}

async function runChild(
  executable: string,
  arguments_: readonly string[],
): Promise<ChildResult> {
  const child = spawn(executable, arguments_, {
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk: string) => {
    stdout += chunk;
  });
  child.stderr.on("data", (chunk: string) => {
    stderr += chunk;
  });
  // Node ChildProcess exposes asynchronous exit completion through events; this
  // Adapter preserves the typed exit signal needed by the SIGKILL checks.
  // oxlint-disable-next-line promise/avoid-new -- ChildProcess exposes exit completion only through callback events.
  const result = await new Promise<{
    readonly code: number | null;
    readonly signal: NodeJS.Signals | null;
  }>((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      resolve({ code, signal });
    });
  });
  return {
    code: result.code,
    signal: result.signal,
    stderr,
    stdout,
  };
}

async function readOutputPair(root: string): Promise<readonly [Buffer, Buffer]> {
  const outputRoot = join(root, "server", "dist");
  const [server, supervisor] = await Promise.all([
    readFile(join(outputRoot, "server.mjs")),
    readFile(join(outputRoot, "upstream-supervisor.mjs")),
  ]);
  return [server, supervisor];
}

async function buildFixture(
  sourceMarker = "fixture",
  withOptionalNativeSentinels = false,
): Promise<{ readonly markerPath?: string; readonly root: string }> {
  const root = await fixtureRoot();
  const outputRoot = join(root, "server", "dist");
  const licensesRoot = join(root, "licenses");
  await Promise.all([
    mkdir(outputRoot, { recursive: true }),
    mkdir(licensesRoot, { recursive: true }),
  ]);
  let dependencies: readonly unknown[] = [];
  let markerPath: string | undefined;
  let entrySource = `globalThis.__easyedaBuildFixture = ${JSON.stringify(sourceMarker)};\n`;
  if (withOptionalNativeSentinels) {
    const license = "fixture ws license\n";
    markerPath = join(root, "optional-native-sentinel-executed");
    await writePackage(root, "ws", {
      license: "MIT",
      main: "dist/index.js",
      name: "ws",
      type: "commonjs",
      version: "1.2.3",
    });
    await Promise.all([
      writeFile(
        join(root, "node_modules", "ws", "dist", "index.js"),
        "try { require('bufferutil'); } catch {}\ntry { require('utf-8-validate'); } catch {}\ntry { eval('require')('ambient-sentinel'); } catch {}\nmodule.exports = 'reviewed-js-fallback';\n",
        "utf8",
      ),
      writeFile(join(root, "node_modules", "ws", "LICENSE"), license, "utf8"),
      writeFile(join(licensesRoot, "ws-MIT.txt"), license, "utf8"),
    ]);
    for (const name of [
      "ambient-sentinel",
      "bufferutil",
      "utf-8-validate",
    ]) {
      const sentinelRoot = join(root, "node_modules", name);
      await mkdir(sentinelRoot, { recursive: true });
      await Promise.all([
        writeFile(
          join(sentinelRoot, "package.json"),
          `${JSON.stringify({ main: "index.js", name, version: "9.9.9" })}\n`,
          "utf8",
        ),
        writeFile(
          join(sentinelRoot, "index.js"),
          `require('node:fs').writeFileSync(${JSON.stringify(markerPath)}, ${JSON.stringify(name)}); module.exports = () => true;\n`,
          "utf8",
        ),
      ]);
    }
    dependencies = [
      {
        license: "MIT",
        licenseSha256: sha256(license),
        name: "ws",
        noticePath: "licenses/ws-MIT.txt",
        repository: "https://github.com/fixture/ws",
        sourceLicenseFile: "LICENSE",
        version: "1.2.3",
      },
    ];
    entrySource = `import value from "ws"; globalThis.__easyedaBuildFixture = value + ${JSON.stringify(sourceMarker)};\n`;
  }
  await Promise.all([
    writeFile(join(root, "server", "src", "payload.json"), '{"value":7}\n'),
    writeFile(join(root, "server", "src", "message.txt"), "reviewed-text"),
    writeFile(
      join(root, "server", "src", "index.ts"),
      `import payload from "./payload.json"; import message from "./message.txt"; ${entrySource} void payload.value; void message;\n`,
      "utf8",
    ),
    writeFile(
      join(root, "server", "src", "upstream-supervisor.ts"),
      `export const supervisor = ${JSON.stringify(sourceMarker)};\n`,
      "utf8",
    ),
    writeFile(
      join(licensesRoot, "bundled-runtime.json"),
      `${JSON.stringify({
        dependencies,
        generatedFrom: "esbuild metafile inputs",
        schemaVersion: 1,
      })}\n`,
      "utf8",
    ),
    writeFile(join(outputRoot, "server.mjs"), "old server\n", "utf8"),
    writeFile(
      join(outputRoot, "upstream-supervisor.mjs"),
      "old supervisor\n",
      "utf8",
    ),
  ]);
  return markerPath === undefined ? { root } : { markerPath, root };
}

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((path) => rm(path, { recursive: true, force: true })),
  );
});

void describe("bundled runtime license attribution", () => {
  void test("attributes every dependency input while excluding only reviewed source", async () => {
    const root = await fixtureRoot();
    await writePackage(root, "complete", {
      license: "MIT",
      name: "complete",
      version: "1.2.3",
    });
    await writeFile(
      join(root, "node_modules", "complete", "dist", "package.json"),
      '{"type":"module"}\n',
      "utf8",
    );
    await writeFile(
      join(root, "server", "src", "index.ts"),
      "export {};\n",
      "utf8",
    );

    const packages = await bundledPackages(
      ["server/src/index.ts", "node_modules/complete/dist/index.js"],
      root,
    );

    assert.deepEqual(packages, [
      {
        license: "MIT",
        name: "complete",
        packageRoot: join(root, "node_modules", "complete"),
        repository: "https://github.com/fixture/complete",
        version: "1.2.3",
      },
    ]);
  });

  void test("rejects a dependency input without package metadata", async () => {
    const root = await fixtureRoot();
    await mkdir(join(root, "node_modules", "missing"), { recursive: true });
    await writeFile(
      join(root, "node_modules", "missing", "index.js"),
      "export {};\n",
      "utf8",
    );

    await assert.rejects(
      bundledPackages(["node_modules/missing/index.js"], root),
      /cannot inspect exact installed package metadata/iu,
    );
  });

  void test("rejects malformed package metadata", async () => {
    const root = await fixtureRoot();
    const packageRoot = join(root, "node_modules", "malformed");
    await mkdir(packageRoot, { recursive: true });
    await Promise.all([
      writeFile(join(packageRoot, "package.json"), "{", "utf8"),
      writeFile(join(packageRoot, "index.js"), "export {};\n", "utf8"),
    ]);

    await assert.rejects(
      bundledPackages(["node_modules/malformed/index.js"], root),
      /has malformed package metadata/u,
    );
  });

  void test("rejects package metadata without complete attribution", async () => {
    const root = await fixtureRoot();
    await writePackage(root, "incomplete", {
      name: "incomplete",
      version: "1.2.3",
    });

    await assert.rejects(
      bundledPackages(["node_modules/incomplete/dist/index.js"], root),
      /has incomplete package attribution metadata/u,
    );
  });

  void test("rejects a package name that does not match its installed root", async () => {
    const root = await fixtureRoot();
    await writePackage(root, "spoofed", {
      license: "MIT",
      name: "different-name",
      version: "1.2.3",
    });

    await assert.rejects(
      bundledPackages(["node_modules/spoofed/dist/index.js"], root),
      /exact installed root requires spoofed/u,
    );
  });

  void test("does not misattribute an incomplete nested package to its parent", async () => {
    const root = await fixtureRoot();
    await writePackage(root, "parent", {
      license: "MIT",
      name: "parent",
      version: "1.2.3",
    });
    const childRoot = join(
      root,
      "node_modules",
      "parent",
      "node_modules",
      "child",
    );
    await mkdir(childRoot, { recursive: true });
    await writeFile(
      join(childRoot, "package.json"),
      '{"name":"child","version":"2.0.0"}\n',
      "utf8",
    );
    await writeFile(join(childRoot, "index.js"), "export {};\n", "utf8");

    await assert.rejects(
      bundledPackages(
        ["node_modules/parent/node_modules/child/index.js"],
        root,
      ),
      /has incomplete package attribution metadata/u,
    );
  });

  void test("does not misattribute an incomplete nested scoped package", async () => {
    const root = await fixtureRoot();
    await writePackage(root, "parent", {
      license: "MIT",
      name: "parent",
      version: "1.2.3",
    });
    const childRoot = join(
      root,
      "node_modules",
      "parent",
      "node_modules",
      "@scope",
      "child",
    );
    await mkdir(childRoot, { recursive: true });
    await writeFile(
      join(childRoot, "package.json"),
      '{"name":"@scope/child","version":"2.0.0"}\n',
      "utf8",
    );
    await writeFile(join(childRoot, "index.js"), "export {};\n", "utf8");

    await assert.rejects(
      bundledPackages(
        ["node_modules/parent/node_modules/@scope/child/index.js"],
        root,
      ),
      /has incomplete package attribution metadata/u,
    );
  });

  void test("attributes the deepest valid nested unscoped and scoped packages", async () => {
    const root = await fixtureRoot();
    await writePackage(root, "parent", {
      license: "MIT",
      name: "parent",
      version: "1.2.3",
    });
    await writePackage(root, "parent/node_modules/child", {
      license: "ISC",
      name: "child",
      version: "2.0.0",
    });
    await writePackage(root, "parent/node_modules/@scope/scoped-child", {
      license: "BSD-3-Clause",
      name: "@scope/scoped-child",
      version: "3.0.0",
    });
    await Promise.all([
      writeFile(
        join(
          root,
          "node_modules",
          "parent",
          "node_modules",
          "child",
          "dist",
          "index.js",
        ),
        "export {};\n",
        "utf8",
      ),
      writeFile(
        join(
          root,
          "node_modules",
          "parent",
          "node_modules",
          "@scope",
          "scoped-child",
          "dist",
          "index.js",
        ),
        "export {};\n",
        "utf8",
      ),
    ]);

    const packages = await bundledPackages(
      [
        "node_modules/parent/node_modules/child/dist/index.js",
        "node_modules/parent/node_modules/@scope/scoped-child/dist/index.js",
      ],
      root,
    );

    assert.deepEqual(packages, [
      {
        license: "BSD-3-Clause",
        name: "@scope/scoped-child",
        packageRoot: join(
          root,
          "node_modules",
          "parent",
          "node_modules",
          "@scope",
          "scoped-child",
        ),
        repository:
          "https://github.com/fixture/parent/node_modules/@scope/scoped-child",
        version: "3.0.0",
      },
      {
        license: "ISC",
        name: "child",
        packageRoot: join(
          root,
          "node_modules",
          "parent",
          "node_modules",
          "child",
        ),
        repository: "https://github.com/fixture/parent/node_modules/child",
        version: "2.0.0",
      },
    ]);
  });

  void test("rejects symlinked first-party inputs and installed package roots", async () => {
    const root = await fixtureRoot();
    const outsideSource = join(root, "outside-source.ts");
    await writeFile(outsideSource, "export {};\n", "utf8");
    await symlink(outsideSource, join(root, "server", "src", "linked.ts"));

    await assert.rejects(
      bundledPackages(["server/src/linked.ts"], root),
      /must not traverse symbolic links/u,
    );

    const externalPackage = join(root, "external-package");
    await mkdir(externalPackage, { recursive: true });
    await Promise.all([
      writeFile(
        join(externalPackage, "package.json"),
        '{"license":"MIT","name":"linked","version":"1.0.0"}\n',
        "utf8",
      ),
      writeFile(join(externalPackage, "index.js"), "export {};\n", "utf8"),
    ]);
    await symlink(
      externalPackage,
      join(root, "node_modules", "linked"),
      "dir",
    );

    await assert.rejects(
      bundledPackages(["node_modules/linked/index.js"], root),
      /must not traverse symbolic links/u,
    );
  });

  void test("rejects a symlinked installed package manifest", async () => {
    const root = await fixtureRoot();
    const packageRoot = join(root, "node_modules", "linked-manifest");
    const externalManifest = join(root, "external-package.json");
    await mkdir(join(packageRoot, "dist"), { recursive: true });
    await Promise.all([
      writeFile(
        externalManifest,
        '{"license":"MIT","name":"linked-manifest","version":"1.0.0"}\n',
        "utf8",
      ),
      writeFile(join(packageRoot, "dist", "index.js"), "export {};\n", "utf8"),
    ]);
    await symlink(externalManifest, join(packageRoot, "package.json"));

    await assert.rejects(
      bundledPackages(["node_modules/linked-manifest/dist/index.js"], root),
      /cannot inspect exact installed package metadata/iu,
    );
  });

  void test("rejects a directory swap after opening a contained file", async () => {
    const root = await fixtureRoot();
    const originalDirectory = join(root, "stable");
    const displacedDirectory = join(root, "displaced");
    const filePath = join(originalDirectory, "notice.txt");
    await mkdir(originalDirectory);
    await writeFile(filePath, "reviewed\n", "utf8");

    await assert.rejects(
      readContainedRegularFile(root, filePath, "The fixture notice", {
        afterOpen: async () => {
          await rename(originalDirectory, displacedDirectory);
          await mkdir(originalDirectory);
          await writeFile(filePath, "replacement\n", "utf8");
        },
      }),
      /changed while it was read/u,
    );
  });

  void test("rejects hard-linked reviewed inputs", async () => {
    const root = await fixtureRoot();
    const sourcePath = join(root, "server", "src", "index.ts");
    await writeFile(sourcePath, "export {};\n", "utf8");
    await link(sourcePath, join(root, "source-alias.ts"));

    await assert.rejects(
      bundledPackages(["server/src/index.ts"], root),
      /exactly one hard link/u,
    );
  });

  void test("normalizes and records exact installed repository metadata", async () => {
    const root = await fixtureRoot();
    await writePackage(root, "repository-fixture", {
      license: "MIT",
      name: "repository-fixture",
      repository: {
        type: "git",
        url: "git+https://github.com/fixture/repository-fixture.git",
      },
      version: "1.2.3",
    });

    const packages = await bundledPackages(
      ["node_modules/repository-fixture/dist/index.js"],
      root,
    );
    assert.equal(
      packages[0]?.repository,
      "https://github.com/fixture/repository-fixture",
    );
  });

  void test("rejects missing and malformed installed repository metadata", async () => {
    const root = await fixtureRoot();
    const packageRoot = join(root, "node_modules", "bad-repository");
    await mkdir(packageRoot, { recursive: true });
    await Promise.all([
      writeFile(
        join(packageRoot, "package.json"),
        '{"license":"MIT","name":"bad-repository","version":"1.0.0"}\n',
        "utf8",
      ),
      writeFile(join(packageRoot, "index.js"), "export {};\n", "utf8"),
    ]);
    await assert.rejects(
      bundledPackages(["node_modules/bad-repository/index.js"], root),
      /incomplete package attribution metadata/u,
    );
    await writeFile(
      join(packageRoot, "package.json"),
      '{"license":"MIT","name":"bad-repository","repository":"ssh://git@example.invalid/repo","version":"1.0.0"}\n',
      "utf8",
    );
    await assert.rejects(
      bundledPackages(["node_modules/bad-repository/index.js"], root),
      /uncredentialed HTTPS URL/u,
    );
  });

  void test("does not publish buffered bundles when installed license validation fails", async () => {
    const root = await fixtureRoot();
    const outputRoot = join(root, "server", "dist");
    const licensesRoot = join(root, "licenses");
    await Promise.all([
      mkdir(outputRoot, { recursive: true }),
      mkdir(licensesRoot, { recursive: true }),
    ]);
    await writePackage(root, "complete", {
      license: "MIT",
      main: "index.js",
      name: "complete",
      type: "module",
      version: "1.2.3",
    });
    const invalidInventory = `${JSON.stringify({
      dependencies: [
        {
          license: "MIT",
          licenseSha256: "0".repeat(64),
          name: "complete",
          noticePath: "licenses/complete-MIT.txt",
          repository: "https://github.com/fixture/complete",
          sourceLicenseFile: "LICENSE",
          version: "1.2.3",
        },
      ],
      generatedFrom: "esbuild metafile inputs",
      schemaVersion: 1,
    })}\n`;
    await Promise.all([
      writeFile(
        join(root, "node_modules", "complete", "index.js"),
        'export const value = "bundled";\n',
        "utf8",
      ),
      writeFile(
        join(root, "node_modules", "complete", "LICENSE"),
        "fixture license\n",
        "utf8",
      ),
      writeFile(
        join(root, "server", "src", "index.ts"),
        'import { value } from "complete"; process.stdout.write(value);\n',
        "utf8",
      ),
      writeFile(
        join(root, "server", "src", "upstream-supervisor.ts"),
        'export const supervisor = "fixture";\n',
        "utf8",
      ),
      writeFile(
        join(licensesRoot, "bundled-runtime.json"),
        invalidInventory,
        "utf8",
      ),
      writeFile(
        join(licensesRoot, "complete-MIT.txt"),
        "fixture license\n",
        "utf8",
      ),
      writeFile(join(outputRoot, "server.mjs"), "old server\n", "utf8"),
      writeFile(
        join(outputRoot, "upstream-supervisor.mjs"),
        "old supervisor\n",
        "utf8",
      ),
    ]);

    await assert.rejects(
      buildServer(root),
      /installed license hash drifted/iu,
    );
    assert.equal(
      await readFile(join(outputRoot, "server.mjs"), "utf8"),
      "old server\n",
    );
    assert.equal(
      await readFile(join(outputRoot, "upstream-supervisor.mjs"), "utf8"),
      "old supervisor\n",
    );
  });

  void test("rejects drifted inventory repository attribution without publishing", async () => {
    const fixture = await buildFixture("repository-drift", true);
    const inventoryPath = join(
      fixture.root,
      "licenses",
      "bundled-runtime.json",
    );
    const inventory = await readFile(inventoryPath, "utf8");
    await writeFile(
      inventoryPath,
      inventory.replace(
        '"repository":"https://github.com/fixture/ws"',
        '"repository":"https://github.com/fixture/different"',
      ),
    );

    await assert.rejects(buildServer(fixture.root), /inventory drifted/u);
    assert.equal(
      await readFile(
        join(fixture.root, "server", "dist", "server.mjs"),
        "utf8",
      ),
      "old server\n",
    );
  });

  void test("builds every admitted loader from captured bytes and disables optional ws natives", async () => {
    const fixture = await buildFixture("optional-native", true);
    await buildServer(fixture.root);
    const serverPath = join(fixture.root, "server", "dist", "server.mjs");
    const serverSource = await readFile(serverPath, "utf8");
    assert.doesNotMatch(
      serverSource,
      /__require\(["'](?:bufferutil|utf-8-validate)["']\)/u,
    );
    await import(`${pathToFileURL(serverPath).href}?fixture=${Date.now()}`);
    assert.equal(
      (globalThis as Record<string, unknown>)["__easyedaBuildFixture"],
      "reviewed-js-fallbackoptional-native",
    );
    assert.ok(fixture.markerPath !== undefined);
    await assert.rejects(readFile(fixture.markerPath), /ENOENT/u);
    delete (globalThis as Record<string, unknown>)["__easyedaBuildFixture"];
  });

  void test("uses fixed tsconfigRaw and ignores ambient path remapping", async () => {
    const fixture = await buildFixture("fixed-tsconfig", true);
    await Promise.all([
      writeFile(
        join(fixture.root, "server", "src", "malicious-ws.ts"),
        'export default "ambient-tsconfig-remap";\n',
      ),
      writeFile(
        join(fixture.root, "tsconfig.json"),
        `${JSON.stringify({
          compilerOptions: {
            baseUrl: ".",
            paths: { ws: ["server/src/malicious-ws.ts"] },
          },
        })}\n`,
      ),
    ]);

    await buildServer(fixture.root);
    const serverPath = join(fixture.root, "server", "dist", "server.mjs");
    await import(`${pathToFileURL(serverPath).href}?tsconfig=${Date.now()}`);
    assert.equal(
      (globalThis as Record<string, unknown>)["__easyedaBuildFixture"],
      "reviewed-js-fallbackfixed-tsconfig",
    );
    delete (globalThis as Record<string, unknown>)["__easyedaBuildFixture"];
  });

  void test("rejects a source swap and restore after esbuild consumed captured bytes", async () => {
    const { root } = await buildFixture("stable-source");
    const sourcePath = join(root, "server", "src", "index.ts");
    const heldPath = join(root, "server", "src", "index.held");

    await assert.rejects(
      buildServer(root, {
        afterInputCaptureForTesting: async () => {
          await rename(sourcePath, heldPath);
          await writeFile(sourcePath, "throw new Error('replacement');\n");
          await rm(sourcePath);
          await rename(heldPath, sourcePath);
        },
      }),
      /changed after its reviewed bytes were captured/u,
    );
    assert.equal(
      await readFile(join(root, "server", "dist", "server.mjs"), "utf8"),
      "old server\n",
    );
  });

  void test("rejects package-resolution metadata swapped to another existing entry and restored", async () => {
    const { root } = await buildFixture("resolution-metadata");
    const packageRoot = join(root, "node_modules", "selector");
    const manifestPath = join(packageRoot, "package.json");
    const heldManifestPath = join(packageRoot, "package.held");
    const license = "selector license\n";
    const licenseSha256 = sha256(license);
    await mkdir(packageRoot, { recursive: true });
    await Promise.all([
      writeFile(
        manifestPath,
        `${JSON.stringify({
          license: "MIT",
          main: "reviewed.js",
          name: "selector",
          repository: "https://github.com/fixture/selector",
          version: "1.0.0",
        })}\n`,
      ),
      writeFile(join(packageRoot, "reviewed.js"), "module.exports = 'reviewed';\n"),
      writeFile(join(packageRoot, "alternate.js"), "module.exports = 'alternate';\n"),
      writeFile(join(packageRoot, "LICENSE"), license),
      writeFile(join(root, "licenses", "selector-MIT.txt"), license),
      writeFile(
        join(root, "server", "src", "index.ts"),
        'import selected from "selector"; globalThis.__easyedaBuildFixture = selected;\n',
      ),
      writeFile(
        join(root, "licenses", "bundled-runtime.json"),
        `${JSON.stringify({
          dependencies: [
            {
              license: "MIT",
              licenseSha256,
              name: "selector",
              noticePath: "licenses/selector-MIT.txt",
              repository: "https://github.com/fixture/selector",
              sourceLicenseFile: "LICENSE",
              version: "1.0.0",
            },
          ],
          generatedFrom: "esbuild metafile inputs",
          schemaVersion: 1,
        })}\n`,
      ),
    ]);

    await assert.rejects(
      buildServer(root, {
        afterInputCaptureForTesting: async () => {
          await rm(manifestPath);
          await rename(heldManifestPath, manifestPath);
        },
        afterResolutionMetadataCaptureForTesting: async () => {
          await rename(manifestPath, heldManifestPath);
          await writeFile(
            manifestPath,
            `${JSON.stringify({
              license: "MIT",
              main: "alternate.js",
              name: "selector",
              repository: "https://github.com/fixture/selector",
              version: "1.0.0",
            })}\n`,
          );
        },
      }),
      /Package-resolution metadata changed/u,
    );
    assert.equal(
      await readFile(join(root, "server", "dist", "server.mjs"), "utf8"),
      "old server\n",
    );
  });

  void test("rejects a symlink swap after output admission without touching its referent", async () => {
    const { root } = await buildFixture("symlink-output");
    const outputRoot = join(root, "server", "dist");
    const serverPath = join(outputRoot, "server.mjs");
    const displacedPath = join(outputRoot, "server.displaced");
    const outsidePath = join(root, "outside-target");
    await writeFile(outsidePath, "outside stays intact\n", "utf8");

    await assert.rejects(
      buildServer(root, {
        afterOutputAdmissionForTesting: async () => {
          await rename(serverPath, displacedPath);
          await symlink(outsidePath, serverPath);
        },
      }),
      /Bundle publication failed/u,
    );
    assert.equal(await readFile(outsidePath, "utf8"), "outside stays intact\n");
    assert.equal(await readFile(displacedPath, "utf8"), "old server\n");
  });

  void test("rejects hard-linked output targets before publication", async () => {
    const { root } = await buildFixture("hardlink-output");
    const outputRoot = join(root, "server", "dist");
    await link(
      join(outputRoot, "server.mjs"),
      join(outputRoot, "server-hardlink-alias"),
    );

    await assert.rejects(
      buildServer(root),
      /Bundle publication failed/u,
    );
    assert.equal(
      await readFile(join(outputRoot, "server-hardlink-alias"), "utf8"),
      "old server\n",
    );
  });

  void test("rolls back both outputs after an injected second-publication failure", async () => {
    const { root } = await buildFixture("rollback");
    const outputRoot = join(root, "server", "dist");

    await assert.rejects(
      buildServer(root, {
        beforeOutputPublicationForTesting: (_name, index) =>
          index === 1
            ? Promise.reject(new Error("injected second publication failure"))
            : Promise.resolve(),
      }),
      /Bundle publication failed/u,
    );
    assert.equal(
      await readFile(join(outputRoot, "server.mjs"), "utf8"),
      "old server\n",
    );
    assert.equal(
      await readFile(join(outputRoot, "upstream-supervisor.mjs"), "utf8"),
      "old supervisor\n",
    );
  });

  void test("retains every release-attribution capture through publication admission", async () => {
    const targets = [
      ["licenses", "bundled-runtime.json"],
      ["node_modules", "ws", "LICENSE"],
      ["licenses", "ws-MIT.txt"],
    ] as const;
    for (const [index, target] of targets.entries()) {
      const fixture = await buildFixture(`release-capture-${index}`, true);
      const before = await readOutputPair(fixture.root);
      const targetPath = join(fixture.root, ...target);

      await assert.rejects(
        buildServer(fixture.root, {
          afterOutputAdmissionForTesting: () =>
            writeFile(targetPath, `mutated release input ${index}\n`),
        }),
        /changed after its reviewed bytes were captured/u,
      );
      const after = await readOutputPair(fixture.root);
      assert.deepEqual(after, before);
      await assert.rejects(
        lstat(join(fixture.root, "server", ".bundle-publication.lock")),
        /ENOENT/u,
      );
    }
  });

  void test("retains every release-attribution capture through the final publication boundary", async () => {
    const targets = [
      ["licenses", "bundled-runtime.json"],
      ["node_modules", "ws", "LICENSE"],
      ["licenses", "ws-MIT.txt"],
    ] as const;
    for (const [index, target] of targets.entries()) {
      const fixture = await buildFixture(`final-release-capture-${index}`, true);
      const before = await readOutputPair(fixture.root);
      const targetPath = join(fixture.root, ...target);

      await assert.rejects(
        buildServer(fixture.root, {
          afterDurableNewOutputsForTesting: () =>
            writeFile(targetPath, `mutated final release input ${index}\n`),
        }),
        /changed after its reviewed bytes were captured/u,
      );
      const after = await readOutputPair(fixture.root);
      assert.deepEqual(after, before);
      await assert.rejects(
        lstat(join(fixture.root, "server", ".bundle-publication.lock")),
        /ENOENT/u,
      );
    }
  });

  void test("recovers exact bundle pairs after process death at every publication phase", async () => {
    const phases = [
      "afterOldOutputsRetiredForTesting",
      "afterFirstNewOutputPublishedForTesting",
      "afterDurableNewOutputsForTesting",
      "afterCommitReadyMarkerForTesting",
    ] as const;
    const buildModuleUrl = pathToFileURL(
      join(import.meta.dirname, "../../scripts/build-server.ts"),
    ).href;
    for (const [index, phase] of phases.entries()) {
      const { root } = await buildFixture(`crash-old-${index}`);
      await buildServer(root);
      const oldPair = await readOutputPair(root);
      const indexPath = join(root, "server", "src", "index.ts");
      const supervisorPath = join(
        root,
        "server",
        "src",
        "upstream-supervisor.ts",
      );
      const indexSource = await readFile(indexPath, "utf8");
      const supervisorSource = await readFile(supervisorPath, "utf8");
      await Promise.all([
        writeFile(
          indexPath,
          indexSource.replace(
            `crash-old-${index}`,
            `crash-new-${index}`,
          ),
        ),
        writeFile(
          supervisorPath,
          supervisorSource.replace(
            `crash-old-${index}`,
            `crash-new-${index}`,
          ),
        ),
      ]);
      const childSource = `const { buildServer } = await import(${JSON.stringify(buildModuleUrl)}); await buildServer(process.argv[1], { ${phase}: async () => { process.kill(process.pid, "SIGKILL"); await new Promise(() => {}); } });`;
      const crashed = await runChild(process.execPath, [
        "--input-type=module",
        "--eval",
        childSource,
        root,
      ]);
      assert.equal(crashed.signal, "SIGKILL", crashed.stderr);

      await assert.rejects(
        buildServer(root, {
          afterStalePublicationRecoveryForTesting: () =>
            Promise.reject(new Error("stop after exact stale recovery")),
        }),
        /stop after exact stale recovery/u,
      );
      await assert.rejects(
        lstat(join(root, "server", ".bundle-publication.lock")),
        /ENOENT/u,
      );
      const recoveredPair = await readOutputPair(root);
      const recoveredServerPath = join(root, "server", "dist", "server.mjs");
      await import(
        `${pathToFileURL(recoveredServerPath).href}?recovered=${index}-${Date.now()}`
      );
      await buildServer(root);
      const newPair = await readOutputPair(root);
      const expectedPair = phase === "afterCommitReadyMarkerForTesting"
        ? newPair
        : oldPair;
      assert.deepEqual(recoveredPair, expectedPair);
    }
  });

  void test("uses the boot identity to reject a cross-reboot PID collision", async () => {
    const { root } = await buildFixture("reboot-collision-old");
    await buildServer(root);
    const oldPair = await readOutputPair(root);
    const indexPath = join(root, "server", "src", "index.ts");
    const indexSource = await readFile(indexPath, "utf8");
    await writeFile(
      indexPath,
      indexSource.replace("reboot-collision-old", "reboot-collision-new"),
      "utf8",
    );
    const buildModuleUrl = pathToFileURL(
      join(import.meta.dirname, "../../scripts/build-server.ts"),
    ).href;
    const childSource = `const { buildServer } = await import(${JSON.stringify(buildModuleUrl)}); await buildServer(process.argv[1], { afterOldOutputsRetiredForTesting: async () => { process.kill(process.pid, "SIGKILL"); await new Promise(() => {}); } });`;
    const crashed = await runChild(process.execPath, [
      "--input-type=module",
      "--eval",
      childSource,
      root,
    ]);
    assert.equal(crashed.signal, "SIGKILL", crashed.stderr);

    const journalPath = join(
      root,
      "server",
      ".bundle-publication.lock",
      "publication.json",
    );
    const journalSource = await readFile(journalPath, "utf8");
    const foreignBootId = journalSource.includes(
      '"ownerBootId":"00000000-0000-4000-8000-000000000000"',
    )
      ? "11111111-1111-4111-8111-111111111111"
      : "00000000-0000-4000-8000-000000000000";
    const processStat = await readFile("/proc/self/stat", "utf8");
    const commandEnd = processStat.lastIndexOf(") ");
    assert.notEqual(commandEnd, -1);
    const currentStartTicks = processStat
      .slice(commandEnd + 2)
      .trim()
      .split(/\s+/u)[19];
    assert.ok(currentStartTicks !== undefined);
    assert.match(currentStartTicks, /^(?:0|[1-9]\d*)$/u);
    const collisionJournal = journalSource
      .replace(
        /"ownerBootId":"[a-f0-9-]+"/u,
        `"ownerBootId":"${foreignBootId}"`,
      )
      .replace(/"ownerPid":\d+/u, `"ownerPid":${String(process.pid)}`)
      .replace(
        /"ownerStartTicks":"\d+"/u,
        `"ownerStartTicks":"${currentStartTicks}"`,
      );
    assert.notEqual(collisionJournal, journalSource);
    await writeFile(journalPath, collisionJournal, "utf8");

    await assert.rejects(
      buildServer(root, {
        afterStalePublicationRecoveryForTesting: () =>
          Promise.reject(new Error("stop after cross-reboot recovery")),
      }),
      /stop after cross-reboot recovery/u,
    );
    assert.deepEqual(await readOutputPair(root), oldPair);
    await assert.rejects(
      lstat(join(root, "server", ".bundle-publication.lock")),
      /ENOENT/u,
    );
  });

  void test("rolls back after process death with an inexact commit-ready marker", async () => {
    const { root } = await buildFixture("corrupt-marker-old");
    await buildServer(root);
    const oldPair = await readOutputPair(root);
    const indexPath = join(root, "server", "src", "index.ts");
    const indexSource = await readFile(indexPath, "utf8");
    await writeFile(
      indexPath,
      indexSource.replace("corrupt-marker-old", "corrupt-marker-new"),
      "utf8",
    );
    const buildModuleUrl = pathToFileURL(
      join(import.meta.dirname, "../../scripts/build-server.ts"),
    ).href;
    const childSource = `const { writeFile } = await import("node:fs/promises"); const { join } = await import("node:path"); const { buildServer } = await import(${JSON.stringify(buildModuleUrl)}); await buildServer(process.argv[1], { afterCommitReadyMarkerForTesting: async () => { await writeFile(join(process.argv[1], "server", ".bundle-publication.lock", "commit-ready.json"), "{}\\n"); process.kill(process.pid, "SIGKILL"); await new Promise(() => {}); } });`;
    const crashed = await runChild(process.execPath, [
      "--input-type=module",
      "--eval",
      childSource,
      root,
    ]);
    assert.equal(crashed.signal, "SIGKILL", crashed.stderr);

    await assert.rejects(
      buildServer(root, {
        afterStalePublicationRecoveryForTesting: () =>
          Promise.reject(new Error("stop after corrupt-marker recovery")),
      }),
      /stop after corrupt-marker recovery/u,
    );
    assert.deepEqual(await readOutputPair(root), oldPair);
    await assert.rejects(
      lstat(join(root, "server", ".bundle-publication.lock")),
      /ENOENT/u,
    );
  });

  void test("rolls back and quarantines a hard-linked commit-ready marker", async () => {
    const { root } = await buildFixture("hardlink-marker-old");
    await buildServer(root);
    const oldPair = await readOutputPair(root);
    const indexPath = join(root, "server", "src", "index.ts");
    const indexSource = await readFile(indexPath, "utf8");
    await writeFile(
      indexPath,
      indexSource.replace("hardlink-marker-old", "hardlink-marker-new"),
      "utf8",
    );
    const buildModuleUrl = pathToFileURL(
      join(import.meta.dirname, "../../scripts/build-server.ts"),
    ).href;
    const childSource = `const { link } = await import("node:fs/promises"); const { join } = await import("node:path"); const { buildServer } = await import(${JSON.stringify(buildModuleUrl)}); await buildServer(process.argv[1], { afterCommitReadyMarkerForTesting: async () => { await link(join(process.argv[1], "server", ".bundle-publication.lock", "commit-ready.json"), join(process.argv[1], "commit-ready-hardlink")); process.kill(process.pid, "SIGKILL"); await new Promise(() => {}); } });`;
    const crashed = await runChild(process.execPath, [
      "--input-type=module",
      "--eval",
      childSource,
      root,
    ]);
    assert.equal(crashed.signal, "SIGKILL", crashed.stderr);

    await assert.rejects(
      buildServer(root),
      /single-link|exact journal recovery was incomplete/u,
    );
    assert.deepEqual(await readOutputPair(root), oldPair);
    await assert.rejects(
      lstat(join(root, "server", ".bundle-publication.lock")),
      /ENOENT/u,
    );
    await buildServer(root);
  });

  void test("never rolls back after the canonical publication lock is retired", async () => {
    const { root } = await buildFixture("post-retirement-old");
    await buildServer(root);
    const indexPath = join(root, "server", "src", "index.ts");
    const indexSource = await readFile(indexPath, "utf8");
    await writeFile(
      indexPath,
      indexSource.replace("post-retirement-old", "post-retirement-new"),
      "utf8",
    );

    await assert.rejects(
      buildServer(root, {
        afterPublicationLockRetiredForTesting: () =>
          Promise.reject(new Error("injected retired-lock cleanup failure")),
      }),
      /exact journal recovery was incomplete/u,
    );
    const visibleNewPair = await readOutputPair(root);
    assert.equal(visibleNewPair[0].includes("post-retirement-new"), true);
    await assert.rejects(
      lstat(join(root, "server", ".bundle-publication.lock")),
      /ENOENT/u,
    );

    await buildServer(root);
    assert.deepEqual(await readOutputPair(root), visibleNewPair);
  });

  void test("rejects an inexact build host before touching published outputs", async () => {
    const { root } = await buildFixture("inexact-build-host");
    const before = await readOutputPair(root);
    const buildModuleUrl = pathToFileURL(
      join(import.meta.dirname, "../../scripts/build-server.ts"),
    ).href;
    const childSource = `const { buildServer } = await import(${JSON.stringify(buildModuleUrl)}); await buildServer(process.argv[1]);`;
    const result = await runChild("/usr/bin/node", [
      "--input-type=module",
      "--eval",
      childSource,
      root,
    ]);
    assert.notEqual(result.code, 0);
    assert.match(result.stderr, /must be exact v24\.18\.0 linux\/x64/u);
    assert.deepEqual(await readOutputPair(root), before);
    await assert.rejects(
      lstat(join(root, "server", ".bundle-publication.lock")),
      /ENOENT/u,
    );
  });

  void test("serializes publication and rejects a concurrent second admission", async () => {
    const { root } = await buildFixture("concurrent-publication");
    const outputRoot = join(root, "server", "dist");
    const admitted = Promise.withResolvers<boolean>();
    const release = Promise.withResolvers<boolean>();
    const firstBuild = buildServer(root, {
      afterOutputAdmissionForTesting: () => {
        admitted.resolve(true);
        return release.promise;
      },
    });
    await admitted.promise;

    await assert.rejects(
      buildServer(root),
      /publication is active|stale lock/u,
    );
    assert.equal(
      await readFile(join(outputRoot, "server.mjs"), "utf8"),
      "old server\n",
    );
    assert.equal(
      await readFile(join(outputRoot, "upstream-supervisor.mjs"), "utf8"),
      "old supervisor\n",
    );
    release.resolve(true);
    await firstBuild;
    const serverSource = await readFile(join(outputRoot, "server.mjs"), "utf8");
    const supervisorSource = await readFile(
      join(outputRoot, "upstream-supervisor.mjs"),
      "utf8",
    );
    const markerPattern = /const __easyedaBundlePairId = "([a-f0-9]{64})";/u;
    assert.equal(
      markerPattern.exec(serverSource)?.[1],
      markerPattern.exec(supervisorSource)?.[1],
    );
  });

  void test("rejects a stale pre-lock admission after a competing publication", async () => {
    const { root } = await buildFixture("pre-lock-race");
    const staged = Promise.withResolvers<boolean>();
    const release = Promise.withResolvers<boolean>();
    const delayedBuild = buildServer(root, {
      beforePublicationLockAcquisitionForTesting: () => {
        staged.resolve(true);
        return release.promise;
      },
    });
    await staged.promise;
    await buildServer(root);
    const winningPair = await readOutputPair(root);
    release.resolve(true);

    await assert.rejects(delayedBuild, /output target changed/u);
    assert.deepEqual(await readOutputPair(root), winningPair);
    await assert.rejects(
      lstat(join(root, "server", ".bundle-publication.lock")),
      /ENOENT/u,
    );
  });

  void test("runtime pair identity includes raw output and build configuration", async () => {
    const first = await buildFixture("same-pair-source");
    const second = await buildFixture("same-pair-source");
    await Promise.all([
      buildServer(first.root, { bundleBannerSuffixForTesting: "configuration-a" }),
      buildServer(second.root, { bundleBannerSuffixForTesting: "configuration-b" }),
    ]);
    const firstOutputRoot = join(first.root, "server", "dist");
    const secondSupervisor = await readFile(
      join(second.root, "server", "dist", "upstream-supervisor.mjs"),
    );
    await writeFile(
      join(firstOutputRoot, "upstream-supervisor.mjs"),
      secondSupervisor,
    );

    await assert.rejects(
      import(
        `${pathToFileURL(join(firstOutputRoot, "server.mjs")).href}?mismatch=${Date.now()}`
      ),
      /different build transactions/u,
    );
  });

  void test("rejects an input outside both admitted bundle trees", async () => {
    const root = await fixtureRoot();

    await assert.rejects(
      bundledPackages(["generated/unreviewed.js"], root),
      /outside the reviewed first-party source and pinned node_modules trees/u,
    );
  });
});
