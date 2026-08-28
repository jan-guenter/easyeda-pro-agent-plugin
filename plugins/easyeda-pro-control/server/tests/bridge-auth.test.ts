import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFile, execFileSync, spawnSync } from "node:child_process";
import {
  chmod,
  link,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  symlink,
  unlink,
  writeFile,
} from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { afterEach, describe, test } from "node:test";
import { promisify } from "node:util";

import { build } from "esbuild";

import {
  AUTHENTICATED_BRIDGE_BUILD_DIRECTORY,
  AUTHENTICATED_BRIDGE_OUTPUT_FILENAME,
  openBridgeTokenFileCapability,
  provisionBridgeTokenFile,
} from "../../scripts/bridge-token.ts";
import {
  REVIEWED_BRIDGE_SOURCE,
  assertReviewedVendoredSource,
  assertSealedVendoredMemoryUnchanged,
  captureReviewedVendoredSourceSnapshot,
  captureVendoredSourceClosure,
  prepareStagedVendoredSourceRemoval,
  sealedVendoredMemoryPlugin,
  stageReviewedVendoredSource,
  stageSealedReviewedVendoredSource,
} from "../../scripts/reviewed-bridge-source.ts";

const pluginRoot = resolve(import.meta.dirname, "../..");
const provisionScript = join(pluginRoot, "scripts", "provision-bridge-token.ts");
const buildScript = join(pluginRoot, "scripts", "build-authenticated-bridge.ts");
const temporaryDirectories: string[] = [];
// oxlint-disable-next-line typescript/strict-void-return -- Node's documented promisify overload returns the child result even though the callback overload is void-returning.
const execFileAsync = promisify(execFile);

async function temporaryDirectory(): Promise<string> {
  const path = await mkdtemp("/tmp/easyeda-bridge-auth-test-");
  temporaryDirectories.push(path);
  return path;
}

function runNode(
  script: string,
  cliArguments: readonly string[],
  environment: NodeJS.ProcessEnv = process.env,
): string {
  return execFileSync(process.execPath, [script, ...cliArguments], {
    encoding: "utf8",
    env: environment,
    maxBuffer: 16 * 1024 * 1024,
  });
}

async function runNodeAsync(
  script: string,
  cliArguments: readonly string[],
  environment: NodeJS.ProcessEnv = process.env,
): Promise<string> {
  const result = await execFileAsync(process.execPath, [script, ...cliArguments], {
    encoding: "utf8",
    env: environment,
    maxBuffer: 16 * 1024 * 1024,
  });
  return result.stdout;
}

function bridgeEnvironment(
  controlDirectory: string,
  homeDirectory: string,
): NodeJS.ProcessEnv {
  const environment: NodeJS.ProcessEnv = {
    ...process.env,
    EASYEDA_CONTROL_DATA_DIR: controlDirectory,
    HOME: homeDirectory,
  };
  delete environment["EASYEDA_BRIDGE_TOKEN_FILE"];
  return environment;
}

function parseRecord(text: string): Record<string, unknown> {
  const value: unknown = JSON.parse(text);
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Expected a JSON object from the bridge build fixture.");
  }
  return Object.fromEntries(Object.entries(value));
}

function requiredString(
  record: Readonly<Record<string, unknown>>,
  key: string,
): string {
  const value = record[key];
  if (typeof value !== "string") {
    throw new TypeError(`Expected ${key} to be a string.`);
  }
  return value;
}

function sha256(value: Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

async function manuallyRemoveQuiescentPairLock(lockPath: string): Promise<void> {
  const lockInformation = await stat(lockPath);
  const lockRecord = parseRecord(await readFile(lockPath, "utf8"));
  const nonce = requiredString(lockRecord, "nonce");
  if (lockInformation.nlink === 2) {
    const candidatePath = join(
      dirname(lockPath),
      `.${basename(lockPath)}.${nonce}.candidate`,
    );
    const candidateInformation = await stat(candidatePath);
    assert.equal(candidateInformation.dev, lockInformation.dev);
    assert.equal(candidateInformation.ino, lockInformation.ino);
    assert.equal(candidateInformation.nlink, 2);
    await unlink(candidatePath);
  } else {
    assert.equal(lockInformation.nlink, 1);
  }
  const recheckedLock = await stat(lockPath);
  assert.equal(recheckedLock.dev, lockInformation.dev);
  assert.equal(recheckedLock.ino, lockInformation.ino);
  await unlink(lockPath);
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((path) =>
      rm(path, { recursive: true, force: true }),
    ),
  );
});

void describe("authenticated EasyEDA bridge build", () => {
  void test("binds token reads and later checks to the retained private parent", async () => {
    const directory = await temporaryDirectory();
    const beforeReadParent = join(directory, "before-read-parent");
    const afterReadParent = join(directory, "after-read-parent");
    await Promise.all([
      mkdir(beforeReadParent, { mode: 0o700 }),
      mkdir(afterReadParent, { mode: 0o700 }),
    ]);
    const beforeReadToken = join(beforeReadParent, "bridge-token");
    const afterReadToken = join(afterReadParent, "bridge-token");
    await Promise.all([
      provisionBridgeTokenFile(beforeReadToken),
      provisionBridgeTokenFile(afterReadToken),
    ]);
    const beforeReadOriginal = await readFile(beforeReadToken, "utf8");
    const afterReadOriginal = await readFile(afterReadToken, "utf8");
    const replacementToken =
      "same-user-replacement-token-0000000000000000000000000000\n";

    const beforeReadCapability = await openBridgeTokenFileCapability(
      beforeReadToken,
    );
    const displacedBeforeRead = `${beforeReadParent}.displaced`;
    try {
      await rename(beforeReadParent, displacedBeforeRead);
      await mkdir(beforeReadParent, { mode: 0o700 });
      await writeFile(beforeReadToken, replacementToken, { mode: 0o600 });
      await assert.rejects(
        beforeReadCapability.read(),
        /bridge token directory changed identity/u,
      );
      assert.equal(await readFile(beforeReadToken, "utf8"), replacementToken);
      assert.equal(
        await readFile(join(displacedBeforeRead, "bridge-token"), "utf8"),
        beforeReadOriginal,
      );
    } finally {
      await beforeReadCapability.close();
    }

    const afterReadCapability = await openBridgeTokenFileCapability(
      afterReadToken,
    );
    const displacedAfterRead = `${afterReadParent}.displaced`;
    try {
      const proof = await afterReadCapability.read();
      await rename(afterReadParent, displacedAfterRead);
      await mkdir(afterReadParent, { mode: 0o700 });
      await writeFile(afterReadToken, replacementToken, { mode: 0o600 });
      await assert.rejects(
        afterReadCapability.assertCurrent(),
        /bridge token directory changed identity/u,
      );
      assert.equal(proof.token, afterReadOriginal.trim());
      assert.equal(await readFile(afterReadToken, "utf8"), replacementToken);
      assert.equal(
        await readFile(join(displacedAfterRead, "bridge-token"), "utf8"),
        afterReadOriginal,
      );
    } finally {
      await afterReadCapability.close();
    }
  });

  void test("provisions one private token without printing the secret", async () => {
    const directory = await temporaryDirectory();
    const tokenPath = join(directory, "bridge-token");
    const first = parseRecord(
      runNode(provisionScript, ["--token-file", tokenPath]),
    );
    const tokenText = await readFile(tokenPath, "utf8");
    const token = tokenText.trim();
    assert.doesNotMatch(JSON.stringify(first), new RegExp(token, "u"));
    assert.match(token, /^[A-Za-z0-9_-]{32,256}$/u);
    const tokenInformation = await stat(tokenPath);
    assert.equal(tokenInformation.mode % 512, 0o600);

    const second = parseRecord(
      runNode(provisionScript, ["--token-file", tokenPath]),
    );
    assert.equal(second["created"], false);
    const persistedTokenText = await readFile(tokenPath, "utf8");
    assert.equal(persistedTokenText.trim(), token);

    const dedicatedParent = join(directory, "dedicated-control-data");
    const dedicated = await provisionBridgeTokenFile(
      join(dedicatedParent, "bridge-token"),
    );
    assert.equal(dedicated.created, true);
    const dedicatedParentInformation = await stat(dedicatedParent);
    assert.equal(dedicatedParentInformation.mode % 512, 0o700);
  });

  void test("shares the documented default token path across provision and build", async () => {
    const directory = await temporaryDirectory();
    const homeDirectory = join(directory, "home");
    const controlDirectory = join(directory, "control-data");
    const outputPath = join(
      controlDirectory,
      AUTHENTICATED_BRIDGE_BUILD_DIRECTORY,
      AUTHENTICATED_BRIDGE_OUTPUT_FILENAME,
    );
    await mkdir(homeDirectory, { mode: 0o700 });
    const environment = bridgeEnvironment(controlDirectory, homeDirectory);

    const provisioned = parseRecord(runNode(provisionScript, [], environment));
    const expectedTokenPath = join(controlDirectory, "bridge-token");
    assert.equal(provisioned["path"], expectedTokenPath);
    const built = parseRecord(runNode(buildScript, [], environment));
    const generationPath = requiredString(built, "outputPath");
    assert.match(
      basename(generationPath),
      /^easyeda-pro-control-authenticated-bridge[.][a-f0-9]{64}[.]eext$/u,
    );
    assert.equal(generationPath.startsWith(`${outputPath.slice(0, -5)}.`), true);
    const tokenText = await readFile(expectedTokenPath, "utf8");
    const tokenBytes = Buffer.from(tokenText.trim());
    const tokenSha256 = sha256(tokenBytes);
    const outputInformation = await stat(generationPath);
    const receiptInformation = await stat(`${outputPath}.receipt.json`);
    assert.equal(built["tokenSha256"], tokenSha256);
    assert.equal(built["outputSha256"], sha256(await readFile(generationPath)));
    assert.equal(outputInformation.mode % 512, 0o600);
    assert.equal(receiptInformation.mode % 512, 0o600);
    await assert.rejects(stat(outputPath), { code: "ENOENT" });
  });

  void test("refuses a shared existing parent without changing its mode", async () => {
    const directory = await temporaryDirectory();
    const sharedParent = join(directory, "shared");
    await mkdir(sharedParent, { mode: 0o700 });
    await chmod(sharedParent, 0o1777);
    const informationBefore = await stat(sharedParent);
    const modeBefore = informationBefore.mode % 4096;

    await assert.rejects(
      provisionBridgeTokenFile(join(sharedParent, "bridge-token")),
      /bridge token directory already exists and must be private mode 700/u,
    );

    const informationAfter = await stat(sharedParent);
    assert.equal(informationAfter.mode % 4096, modeBefore);
    await assert.rejects(readFile(join(sharedParent, "bridge-token")), {
      code: "ENOENT",
    });
  });

  void test("rejects intermediate symlinks before creating a missing private parent", async () => {
    const directory = await temporaryDirectory();
    const outsideProvision = join(directory, "outside-provision");
    const outsideBuild = join(directory, "outside-build");
    const provisionLink = join(directory, "provision-link");
    const buildLink = join(directory, "build-link");
    await mkdir(outsideProvision, { mode: 0o700 });
    await mkdir(outsideBuild, { mode: 0o700 });
    await symlink(outsideProvision, provisionLink);
    await symlink(outsideBuild, buildLink);

    const redirectedToken = join(provisionLink, "missing", "bridge-token");
    assert.throws(
      () => runNode(provisionScript, ["--token-file", redirectedToken]),
      /Command failed/u,
    );
    await assert.rejects(stat(join(outsideProvision, "missing")), {
      code: "ENOENT",
    });

    const safeToken = join(directory, "safe-token");
    const redirectedOutput = join(buildLink, "missing", "bridge.eext");
    runNode(provisionScript, ["--token-file", safeToken]);
    assert.throws(
      () =>
        runNode(buildScript, [
          "--token-file",
          safeToken,
          "--output",
          redirectedOutput,
        ]),
      /Command failed/u,
    );
    await assert.rejects(stat(join(outsideBuild, "missing")), {
      code: "ENOENT",
    });
  });

  void test("never creates missing non-final directory segments", async () => {
    const directory = await temporaryDirectory();
    const provisionPrefix = join(directory, "missing-provision-prefix");
    const tokenPath = join(provisionPrefix, "nested", "bridge-token");
    assert.throws(
      () => runNode(provisionScript, ["--token-file", tokenPath]),
      /Command failed/u,
    );
    await assert.rejects(stat(provisionPrefix), { code: "ENOENT" });

    const safeTokenPath = join(directory, "safe-token");
    const buildPrefix = join(directory, "missing-build-prefix");
    const outputPath = join(buildPrefix, "nested", "bridge.eext");
    runNode(provisionScript, ["--token-file", safeTokenPath]);
    assert.throws(
      () =>
        runNode(buildScript, [
          "--token-file",
          safeTokenPath,
          "--output",
          outputPath,
        ]),
      /Command failed/u,
    );
    await assert.rejects(stat(buildPrefix), { code: "ENOENT" });
  });

  void test("builds a deterministic mutual-HMAC eext from one sealed snapshot", async () => {
    const directory = await temporaryDirectory();
    const tokenPath = join(directory, "bridge-token");
    const firstOutput = join(directory, "first.eext");
    const secondOutput = join(directory, "second.eext");
    runNode(provisionScript, ["--token-file", tokenPath]);
    const tokenText = await readFile(tokenPath, "utf8");
    const token = tokenText.trim();

    const firstBuild = parseRecord(
      runNode(buildScript, [
        "--token-file",
        tokenPath,
        "--output",
        firstOutput,
      ]),
    );
    const secondBuild = parseRecord(
      runNode(buildScript, [
        "--token-file",
        tokenPath,
        "--output",
        secondOutput,
      ]),
    );
    const firstGeneration = requiredString(firstBuild, "outputPath");
    const secondGeneration = requiredString(secondBuild, "outputPath");
    const originalFirstBytes = await readFile(firstGeneration);
    const secondBytes = await readFile(secondGeneration);
    const repeatedBuild = parseRecord(
      runNode(buildScript, [
        "--token-file",
        tokenPath,
        "--output",
        firstOutput,
      ]),
    );
    assert.equal(requiredString(repeatedBuild, "outputPath"), firstGeneration);
    const firstBytes = await readFile(firstGeneration);
    assert.equal(sha256(originalFirstBytes), sha256(firstBytes));
    assert.equal(sha256(firstBytes), sha256(secondBytes));
    const outputInformation = await stat(firstGeneration);
    assert.equal(outputInformation.mode % 512, 0o600);
    execFileSync("/usr/bin/unzip", ["-t", firstGeneration], { stdio: "pipe" });
    const indexBundle = execFileSync(
      "/usr/bin/unzip",
      ["-p", firstGeneration, "dist/index.js"],
      { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
    );
    const archiveEntryNames = execFileSync(
      "/usr/bin/unzip",
      ["-Z1", firstGeneration],
      { encoding: "utf8", maxBuffer: 1024 * 1024 },
    )
      .trim()
      .split("\n");
    assert.ok(!archiveEntryNames.includes("dist/dispatcher.js"));
    const dispatcherMetadata = parseRecord(
      execFileSync(
        "/usr/bin/unzip",
        ["-p", firstGeneration, "dist/dispatcher.meta.json"],
        { encoding: "utf8", maxBuffer: 64 * 1024 },
      ),
    );
    assert.equal(dispatcherMetadata["packagedExecutable"], false);
    assert.equal(
      dispatcherMetadata["purpose"],
      "reviewed-dispatcher-build-identity",
    );
    const license = execFileSync(
      "/usr/bin/unzip",
      ["-p", firstGeneration, "LICENSE"],
      { encoding: "utf8", maxBuffer: 64 * 1024 },
    );
    assert.match(license, /^MIT License\n/u);
    assert.match(license, /Copyright \(c\) 2026 oaslananka/u);
    assert.ok(indexBundle.includes(token));
    assert.ok(
      !indexBundle.includes(
        "__MCP_AUTHENTICATED_INDEX_BUILD_ID_PLACEHOLDER__",
      ),
    );
    for (const required of [
      "easyeda-pro-control.bridge-auth.v1",
      "auth.client_hello",
      "auth.server_challenge",
      "auth.client_proof",
      "auth.accepted",
      "__easyedaProControlAuthenticatedBridgeRuntime_v1__",
      "easyeda-pro-control.authenticated-bridge-runtime.v1",
      "easyeda-pro-control.authenticated-bridge-runtime-ownership.v1",
      "49621",
    ]) {
      assert.ok(
        indexBundle.includes(required),
        `Missing ${required} from private bundle.`,
      );
    }
    for (const prohibited of [
      "system.hotSwap.begin",
      "system.hotSwap.chunk",
      "system.hotSwap.commit",
      "system.hotSwap.revert",
      "__mcpDispatcherFactory",
      "DEV_MODE_REQUIRED",
    ]) {
      assert.ok(
        !indexBundle.includes(prohibited),
        `Production private bundle retained prohibited evaluator surface ${prohibited}.`,
      );
    }
    for (const prohibited of [
      "wss://relay",
      "2026-07-remote-relay-v1",
      "Remote Relay",
      "REMOTE_TOOL",
      "connectRemoteRelay",
      "disconnectRemoteRelay",
      "showRemoteRelayStatus",
      "PORT_SCAN_COUNT",
      "bridgePortCandidates",
      "49620",
      "49622",
      "sessionToken",
      "BRIDGE_TOKEN",
      "BRIDGE_SESSION_TOKEN",
    ]) {
      assert.ok(
        !indexBundle.includes(prohibited),
        `Prohibited legacy bridge path ${prohibited} is present in the private bundle.`,
      );
    }

    const receipt = parseRecord(
      await readFile(`${firstOutput}.receipt.json`, "utf8"),
    );
    const authenticatedIndexBuildId =
      /(?:const|let|var) authenticatedIndexBuildId\s*=\s*"(i[A-Za-z0-9_-]{43})"[,;]/u.exec(
        indexBundle,
      )?.[1];
    assert.match(authenticatedIndexBuildId ?? "", /^i[A-Za-z0-9_-]{43}$/u);
    assert.equal(
      receipt["schema"],
      "easyeda-pro-control.authenticated-bridge-build.v2",
    );
    assert.equal(receipt["outputPath"], firstGeneration);
    assert.equal(
      receipt["tokenSha256"],
      sha256(Buffer.from(token, "utf8")),
    );
    assert.equal(receipt["outputSha256"], sha256(firstBytes));
    assert.equal(
      receipt["authenticatedIndexBuildId"],
      authenticatedIndexBuildId,
    );
    assert.equal(
      receipt["indexSha256"],
      sha256(Buffer.from(indexBundle, "utf8")),
    );
    assert.doesNotMatch(JSON.stringify(receipt), new RegExp(token, "u"));
    assert.deepEqual(receipt["authentication"], {
      adjacentPortFallback: false,
      protocol: "easyeda-pro-control.bridge-auth.v1",
      publicEndpoint: { host: "127.0.0.1", port: 49_621 },
      rawTokenTransmission: false,
    });
    assert.deepEqual(receipt["source"], {
      ...REVIEWED_BRIDGE_SOURCE,
      vendoredDirectory: resolve(
        pluginRoot,
        "easyeda-bridge-extension",
      ),
      builtFromPrivateSnapshot: true,
      privateSnapshotSealed: true,
      postConsumptionVerified: true,
      sealedPathCount: 75,
    });
  });

  void test("builds from reviewed memory across a transient staged-path swap", async () => {
    const directory = await temporaryDirectory();
    const stagedRoot = join(directory, "staged-source");
    const snapshot = await stageSealedReviewedVendoredSource(
      join(pluginRoot, "easyeda-bridge-extension"),
      stagedRoot,
    );
    const entryPath = join(stagedRoot, "src", "dispatcher-entry.ts");
    const reviewedEntry = snapshot.files.find(
      (file) => file.path === "src/dispatcher-entry.ts",
    );
    if (reviewedEntry === undefined) {
      throw new Error("The reviewed dispatcher entry is absent from memory.");
    }
    const transientMarker = "EASYEDA_TRANSIENT_STAGED_SWAP_MUST_NOT_BUNDLE";
    await chmod(entryPath, 0o600);
    await writeFile(
      entryPath,
      `globalThis.${transientMarker} = true;\n`,
      "utf8",
    );
    try {
      const result = await build({
        absWorkingDir: "/tmp",
        bundle: true,
        define: {
          __MCP_DISPATCHER_BUILD_ID__: JSON.stringify("memory-bound-test"),
        },
        entryPoints: ["src/dispatcher-entry.ts"],
        format: "esm",
        outfile: "dispatcher.js",
        platform: "browser",
        plugins: [sealedVendoredMemoryPlugin(snapshot)],
        target: "es2020",
        tsconfigRaw: { compilerOptions: { useDefineForClassFields: true } },
        write: false,
      });
      const output = result.outputFiles[0]?.text;
      if (output === undefined) {
        throw new Error("The in-memory dispatcher bundle is absent.");
      }
      assert.ok(!output.includes(transientMarker));
      assertSealedVendoredMemoryUnchanged(snapshot);
    } finally {
      await writeFile(entryPath, reviewedEntry.bytes);
      await chmod(entryPath, 0o400);
      await prepareStagedVendoredSourceRemoval(stagedRoot);
    }
  });

  void test("keeps the prior atomic commit authoritative across a process crash", async () => {
    const directory = await temporaryDirectory();
    const firstTokenPath = join(directory, "first-token");
    const secondTokenPath = join(directory, "second-token");
    const thirdTokenPath = join(directory, "third-token");
    const outputPath = join(directory, "bridge.eext");
    const receiptPath = `${outputPath}.receipt.json`;
    runNode(provisionScript, ["--token-file", firstTokenPath]);
    runNode(provisionScript, ["--token-file", secondTokenPath]);
    runNode(provisionScript, ["--token-file", thirdTokenPath]);
    const initialBuild = parseRecord(
      runNode(buildScript, [
        "--token-file",
        firstTokenPath,
        "--output",
        outputPath,
      ]),
    );
    const initialGenerationPath = requiredString(initialBuild, "outputPath");
    const archiveBefore = await readFile(initialGenerationPath);
    const receiptBefore = await readFile(receiptPath);

    assert.throws(
      () =>
        runNode(
          buildScript,
          ["--token-file", secondTokenPath, "--output", outputPath],
          {
            ...process.env,
            EASYEDA_TEST_CRASH_BEFORE_BRIDGE_COMMIT: "1",
          },
        ),
      /Command failed/u,
    );

    const receiptAfter = await readFile(receiptPath);
    assert.deepEqual(receiptAfter, receiptBefore);
    const receipt = parseRecord(receiptAfter.toString("utf8"));
    assert.equal(receipt["outputPath"], initialGenerationPath);
    assert.equal(receipt["outputSha256"], sha256(archiveBefore));
    const firstTokenText = await readFile(firstTokenPath, "utf8");
    const firstToken = firstTokenText.trim();
    assert.equal(receipt["tokenSha256"], sha256(Buffer.from(firstToken)));

    const directoryEntries = await readdir(directory);
    const orphanCandidates = directoryEntries.filter(
      (name) =>
        /^bridge[.][a-f0-9]{64}[.]eext$/u.test(name) &&
        join(directory, name) !== initialGenerationPath,
    );
    assert.equal(orphanCandidates.length, 1);
    const lockPath = join(directory, ".bridge.eext.archive-receipt.lock");
    const crashedLockInformation = await stat(lockPath);
    assert.equal(crashedLockInformation.mode % 512, 0o600);

    const recovered = spawnSync(
      process.execPath,
      [
        buildScript,
        "--token-file",
        thirdTokenPath,
        "--output",
        outputPath,
      ],
      {
        encoding: "utf8",
        env: process.env,
        maxBuffer: 16 * 1024 * 1024,
      },
    );
    assert.notEqual(recovered.status, 0);
    assert.equal(recovered.stdout, "");
    assert.match(recovered.stderr, /Automatic removal is disabled/u);
    assert.match(recovered.stderr, /every relevant PID namespace/u);
    const unchangedStaleLock = await stat(lockPath);
    assert.equal(unchangedStaleLock.dev, crashedLockInformation.dev);
    assert.equal(unchangedStaleLock.ino, crashedLockInformation.ino);

    await manuallyRemoveQuiescentPairLock(lockPath);
    const afterManualRecovery = spawnSync(
      process.execPath,
      [
        buildScript,
        "--token-file",
        thirdTokenPath,
        "--output",
        outputPath,
      ],
      {
        encoding: "utf8",
        env: process.env,
        maxBuffer: 16 * 1024 * 1024,
      },
    );
    assert.equal(afterManualRecovery.status, 0, afterManualRecovery.stderr);
    const recoveredBuild = parseRecord(afterManualRecovery.stdout);
    const recoveredGenerationPath = requiredString(
      recoveredBuild,
      "outputPath",
    );
    const recoveredReceipt = parseRecord(await readFile(receiptPath, "utf8"));
    assert.equal(recoveredReceipt["outputPath"], recoveredGenerationPath);
    assert.equal(
      recoveredReceipt["outputSha256"],
      sha256(await readFile(recoveredGenerationPath)),
    );
    const recoveryReport = parseRecord(afterManualRecovery.stderr.trim());
    assert.deepEqual(
      recoveryReport["retainedSupersededOrUncommittedGenerations"],
      [basename(initialGenerationPath), ...orphanCandidates].toSorted(),
    );
    await assert.rejects(
      stat(lockPath),
      { code: "ENOENT" },
    );
  });

  void test("gates a publication-crashed lock until exact quiescent cleanup", async () => {
    const directory = await temporaryDirectory();
    const tokenPath = join(directory, "bridge-token");
    const outputPath = join(directory, "bridge.eext");
    const receiptPath = `${outputPath}.receipt.json`;
    const lockPath = join(directory, ".bridge.eext.archive-receipt.lock");
    runNode(provisionScript, ["--token-file", tokenPath]);

    assert.throws(
      () =>
        runNode(
          buildScript,
          ["--token-file", tokenPath, "--output", outputPath],
          {
            ...process.env,
            EASYEDA_TEST_CRASH_DURING_BRIDGE_LOCK_PUBLICATION: "1",
          },
        ),
      /Command failed/u,
    );

    const crashedLockInformation = await stat(lockPath);
    assert.equal(crashedLockInformation.mode % 512, 0o600);
    assert.equal(crashedLockInformation.nlink, 2);
    await assert.rejects(stat(receiptPath), { code: "ENOENT" });
    const crashedEntries = await readdir(directory);
    const crashedCandidates = crashedEntries.filter(
      (name) =>
        name.startsWith("..bridge.eext.archive-receipt.lock.") &&
        name.endsWith(".candidate"),
    );
    assert.equal(crashedCandidates.length, 1);

    const blocked = spawnSync(
      process.execPath,
      [buildScript,
        "--token-file",
        tokenPath,
        "--output",
        outputPath,
      ],
      {
        encoding: "utf8",
        env: process.env,
        maxBuffer: 16 * 1024 * 1024,
      },
    );
    assert.notEqual(blocked.status, 0);
    assert.equal(blocked.stdout, "");
    assert.match(blocked.stderr, /reported same inode with two links/u);
    assert.match(blocked.stderr, /unlink the exact candidate first/u);
    assert.match(blocked.stderr, /Never use a glob/u);
    const stillCrashedLock = await stat(lockPath);
    assert.equal(stillCrashedLock.dev, crashedLockInformation.dev);
    assert.equal(stillCrashedLock.ino, crashedLockInformation.ino);
    assert.equal(stillCrashedLock.nlink, 2);

    await manuallyRemoveQuiescentPairLock(lockPath);
    const recoveredBuild = parseRecord(
      runNode(buildScript, [
        "--token-file",
        tokenPath,
        "--output",
        outputPath,
      ]),
    );
    const generationPath = requiredString(recoveredBuild, "outputPath");
    const recoveredReceipt = parseRecord(await readFile(receiptPath, "utf8"));
    assert.equal(recoveredReceipt["outputPath"], generationPath);
    assert.equal(
      recoveredReceipt["outputSha256"],
      sha256(await readFile(generationPath)),
    );
    await assert.rejects(stat(lockPath), { code: "ENOENT" });
    const remainingEntries = await readdir(directory);
    assert.equal(
      remainingEntries.some(
        (name) =>
          name.startsWith("..bridge.eext.archive-receipt.lock.") &&
          name.endsWith(".candidate"),
      ),
      false,
    );
  });

  void test("leaves legacy and foreign-owner lock records untouched", async () => {
    const cases = [
      {
        expectedError: /legacy owner record/u,
        record: {
          nonce: "11111111-1111-4111-8111-111111111111",
          pid: process.pid,
          startTime: "1",
        },
      },
      {
        expectedError: /another boot or PID namespace/u,
        record: {
          bootId: "22222222-2222-4222-8222-222222222222",
          nonce: "33333333-3333-4333-8333-333333333333",
          pid: process.pid,
          pidNamespaceDevice: "0",
          pidNamespaceInode: "0",
          schema: "easyeda-pro-control.bridge-pair-lock.v2",
          startTime: "1",
        },
      },
    ] as const;
    for (const lockCase of cases) {
      const directory = await temporaryDirectory();
      const tokenPath = join(directory, "bridge-token");
      const outputPath = join(directory, "bridge.eext");
      const lockPath = join(directory, ".bridge.eext.archive-receipt.lock");
      runNode(provisionScript, ["--token-file", tokenPath]);
      const lockText = `${JSON.stringify(lockCase.record)}\n`;
      await writeFile(lockPath, lockText, { flag: "wx", mode: 0o600 });
      const before = await stat(lockPath);

      const blocked = spawnSync(
        process.execPath,
        [buildScript, "--token-file", tokenPath, "--output", outputPath],
        {
          encoding: "utf8",
          env: process.env,
          maxBuffer: 16 * 1024 * 1024,
        },
      );
      assert.notEqual(blocked.status, 0);
      assert.match(blocked.stderr, lockCase.expectedError);
      assert.match(blocked.stderr, /Automatic removal is disabled/u);
      const after = await stat(lockPath);
      assert.equal(after.dev, before.dev);
      assert.equal(after.ino, before.ino);
      assert.equal(await readFile(lockPath, "utf8"), lockText);
    }
  });

  void test("recovers only owner-scoped candidates after explicit stale-lock clearance", async () => {
    const exerciseCrashBoundary = async (
      crashEnvironment: Readonly<NodeJS.ProcessEnv>,
      expectedCandidate: RegExp,
      lockCandidate: boolean,
    ): Promise<void> => {
      const directory = await temporaryDirectory();
      const tokenPath = join(directory, "bridge-token");
      const outputPath = join(directory, "bridge.eext");
      const lockPath = join(directory, ".bridge.eext.archive-receipt.lock");
      const unrelatedCandidate = join(
        directory,
        ".unrelated.eext.11111111-1111-4111-8111-111111111111.candidate",
      );
      runNode(provisionScript, ["--token-file", tokenPath]);
      await writeFile(unrelatedCandidate, "unrelated user file\n", {
        mode: 0o600,
      });

      const crashed = spawnSync(
        process.execPath,
        [buildScript, "--token-file", tokenPath, "--output", outputPath],
        {
          encoding: "utf8",
          env: { ...process.env, ...crashEnvironment },
          maxBuffer: 16 * 1024 * 1024,
        },
      );
      assert.equal(crashed.signal, "SIGKILL", crashed.stderr);
      const crashedEntries = await readdir(directory);
      const crashedCandidates = crashedEntries
        .filter(
          (name) =>
            name.endsWith(".candidate") &&
            name !== basename(unrelatedCandidate),
        )
        .toSorted();
      assert.equal(crashedCandidates.length, 1);
      assert.match(crashedCandidates[0] ?? "", expectedCandidate);

      if (!lockCandidate) {
        const blocked = spawnSync(
          process.execPath,
          [buildScript, "--token-file", tokenPath, "--output", outputPath],
          {
            encoding: "utf8",
            env: process.env,
            maxBuffer: 16 * 1024 * 1024,
          },
        );
        assert.notEqual(blocked.status, 0);
        assert.match(blocked.stderr, /Automatic removal is disabled/u);
        await manuallyRemoveQuiescentPairLock(lockPath);
      }

      const recovered = spawnSync(
        process.execPath,
        [buildScript, "--token-file", tokenPath, "--output", outputPath],
        {
          encoding: "utf8",
          env: process.env,
          maxBuffer: 16 * 1024 * 1024,
        },
      );
      assert.equal(recovered.status, 0, recovered.stderr);
      const report = parseRecord(recovered.stderr.trim());
      if (lockCandidate) {
        const reportedDirectory = report["privateOutputDirectory"];
        assert.ok(
          reportedDirectory !== null &&
            typeof reportedDirectory === "object" &&
            !Array.isArray(reportedDirectory),
        );
        assert.equal(
          Object.fromEntries(Object.entries(reportedDirectory))["path"],
          directory,
        );
        assert.deepEqual(report["removedPrivateCandidates"], []);
        assert.deepEqual(
          report["observedPrivatePairLockCandidateNames"],
          crashedCandidates,
        );
      } else {
        assert.equal(
          report["schema"],
          "easyeda-pro-control.authenticated-bridge-recovery.v1",
        );
        assert.deepEqual(
          report["removedPrivateCandidates"],
          crashedCandidates,
        );
      }
      assert.equal(
        await readFile(unrelatedCandidate, "utf8"),
        "unrelated user file\n",
      );
      const remainingEntries = await readdir(directory);
      const remainingCandidates = remainingEntries.filter((name) =>
        name.endsWith(".candidate"),
      ).toSorted();
      assert.deepEqual(
        remainingCandidates,
        lockCandidate
          ? [basename(unrelatedCandidate), ...crashedCandidates].toSorted()
          : [basename(unrelatedCandidate)],
      );
      parseRecord(recovered.stdout);
    };

    await exerciseCrashBoundary(
      { EASYEDA_TEST_CRASH_BEFORE_BRIDGE_LOCK_LINK: "1" },
      /^[.][.]bridge[.]eext[.]archive-receipt[.]lock[.]/u,
      true,
    );
    await exerciseCrashBoundary(
      { EASYEDA_TEST_CRASH_AFTER_BRIDGE_CANDIDATE_PREPARE: "archive" },
      /^[.]bridge[.][a-f0-9]{64}[.]eext[.]/u,
      false,
    );
    await exerciseCrashBoundary(
      { EASYEDA_TEST_CRASH_DURING_BRIDGE_ARCHIVE_LINK: "1" },
      /^[.]bridge[.][a-f0-9]{64}[.]eext[.]/u,
      false,
    );
    await exerciseCrashBoundary(
      { EASYEDA_TEST_CRASH_AFTER_BRIDGE_CANDIDATE_PREPARE: "receipt" },
      /^[.]bridge[.]eext[.]receipt[.]json[.]/u,
      false,
    );
  });

  void test("never reports success after the committed output directory is replaced", async () => {
    const directory = await temporaryDirectory();
    const tokenPath = join(directory, "bridge-token");
    const outputDirectory = join(directory, "private-output");
    const displacedDirectory =
      `${outputDirectory}.swapped-after-commit-for-test`;
    const outputPath = join(outputDirectory, "bridge.eext");
    runNode(provisionScript, ["--token-file", tokenPath]);

    const result = spawnSync(
      process.execPath,
      [
        buildScript,
        "--token-file",
        tokenPath,
        "--output",
        outputPath,
      ],
      {
        encoding: "utf8",
        env: {
          ...process.env,
          EASYEDA_TEST_SWAP_BRIDGE_OUTPUT_AFTER_COMMIT: "1",
        },
        maxBuffer: 16 * 1024 * 1024,
      },
    );
    assert.notEqual(result.status, 0);
    assert.equal(result.stdout, "");
    assert.match(
      result.stderr,
      /output pathname changed before success reporting/u,
    );

    const displacedReceiptPath = join(
      displacedDirectory,
      "bridge.eext.receipt.json",
    );
    const displacedReceipt = parseRecord(
      await readFile(displacedReceiptPath, "utf8"),
    );
    const generationName = basename(
      requiredString(displacedReceipt, "outputPath"),
    );
    const displacedGenerationPath = join(displacedDirectory, generationName);
    const displacedGeneration = await readFile(displacedGenerationPath);
    assert.equal(
      displacedReceipt["outputSha256"],
      sha256(displacedGeneration),
    );
    await assert.rejects(
      stat(join(displacedDirectory, ".bridge.eext.archive-receipt.lock")),
      { code: "ENOENT" },
    );
    assert.deepEqual(await readdir(outputDirectory), []);
  });

  void test("never revisits or deletes a replaced source root after capture", async () => {
    const directory = await temporaryDirectory();
    const sourceRoot = join(directory, "reviewed-source");
    await stageReviewedVendoredSource(
      join(pluginRoot, "easyeda-bridge-extension"),
      sourceRoot,
    );
    const snapshot = await captureReviewedVendoredSourceSnapshot(sourceRoot);
    const displacedRoot = `${sourceRoot}.displaced`;
    await rename(sourceRoot, displacedRoot);
    await mkdir(sourceRoot, { mode: 0o700 });
    const replacementMarker = join(sourceRoot, "must-survive.txt");
    const markerText = "replacement survives\n";
    await writeFile(replacementMarker, markerText, {
      encoding: "utf8",
      flag: "wx",
      mode: 0o600,
    });

    const result = await build({
      absWorkingDir: "/tmp",
      bundle: true,
      define: {
        __MCP_DISPATCHER_BUILD_ID__: JSON.stringify("root-swap-test"),
      },
      entryPoints: ["src/dispatcher-entry.ts"],
      format: "esm",
      outfile: "dispatcher.js",
      platform: "browser",
      plugins: [sealedVendoredMemoryPlugin(snapshot)],
      target: "es2020",
      tsconfigRaw: { compilerOptions: { useDefineForClassFields: true } },
      write: false,
    });
    const output = result.outputFiles[0]?.text;
    if (output === undefined) {
      throw new Error("The root-swap test bundle is absent.");
    }
    assert.ok(output.includes("root-swap-test"));
    assert.ok(!output.includes(markerText.trim()));
    assertSealedVendoredMemoryUnchanged(snapshot);
    assert.equal(await readFile(replacementMarker, "utf8"), markerText);
    const displacedEntries = await readdir(displacedRoot);
    assert.ok(displacedEntries.includes("src"));
  });

  void test("isolates a disappearing live lock candidate from the exclusive owner", async () => {
    const directory = await temporaryDirectory();
    const contenderTokenPath = join(directory, "contender-token");
    const ownerTokenPath = join(directory, "owner-token");
    const outputPath = join(directory, "bridge.eext");
    const ownerStdout = join(directory, "owner.stdout");
    const ownerStderr = join(directory, "owner.stderr");
    const contenderStdout = join(directory, "contender.stdout");
    const contenderStderr = join(directory, "contender.stderr");
    runNode(provisionScript, ["--token-file", contenderTokenPath]);
    runNode(provisionScript, ["--token-file", ownerTokenPath]);

    const orchestration = String.raw`
set -euo pipefail
wait_stopped() {
  target_pid="$1"
  attempt=0
  while [ "$attempt" -lt 2000 ]; do
    state="$(sed -n 's/^State:[[:space:]]*\([A-Z]\).*/\1/p' "/proc/$target_pid/status" 2>/dev/null || true)"
    if [ "$state" = "T" ]; then
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 0.01
  done
  return 1
}
wait_candidate_absent() {
  output_directory="$1"
  attempt=0
  while [ "$attempt" -lt 2000 ]; do
    set -- "$output_directory"/..bridge.eext.archive-receipt.lock.*.candidate
    if [ ! -e "$1" ]; then
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 0.01
  done
  return 1
}
wait_finished() {
  target_pid="$1"
  attempt=0
  while [ "$attempt" -lt 2000 ]; do
    state="$(sed -n 's/^State:[[:space:]]*\([A-Z]\).*/\1/p' "/proc/$target_pid/status" 2>/dev/null || true)"
    if [ -z "$state" ] || [ "$state" = "Z" ] || [ "$state" = "X" ]; then
      wait "$target_pid"
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 0.01
  done
  return 1
}
node_path="$1"
build_script="$2"
contender_token="$3"
owner_token="$4"
output_path="$5"
owner_stdout="$6"
owner_stderr="$7"
contender_stdout="$8"
contender_stderr="$9"
EASYEDA_TEST_STOP_BEFORE_BRIDGE_LOCK_LINK=1 "$node_path" "$build_script" --token-file "$contender_token" --output "$output_path" >"$contender_stdout" 2>"$contender_stderr" &
contender_pid=$!
owner_pid=""
cleanup() {
  set +e
  kill -KILL "$contender_pid" 2>/dev/null
  if [ -n "$owner_pid" ]; then
    kill -KILL "$owner_pid" 2>/dev/null
  fi
  wait "$contender_pid" 2>/dev/null
  if [ -n "$owner_pid" ]; then
    wait "$owner_pid" 2>/dev/null
  fi
}
trap cleanup EXIT
trap 'exit 143' TERM INT
wait_stopped "$contender_pid"
EASYEDA_TEST_STOP_AFTER_BRIDGE_LOCK_ACQUIRE=1 "$node_path" "$build_script" --token-file "$owner_token" --output "$output_path" >"$owner_stdout" 2>"$owner_stderr" &
owner_pid=$!
wait_stopped "$owner_pid"
kill -CONT "$contender_pid"
wait_candidate_absent "$(dirname "$output_path")"
kill -CONT "$owner_pid"
wait_finished "$owner_pid"
wait_finished "$contender_pid"
trap - EXIT TERM INT
`;
    execFileSync(
      "/bin/bash",
      [
        "-c",
        orchestration,
        "bridge-lock-race",
        process.execPath,
        buildScript,
        contenderTokenPath,
        ownerTokenPath,
        outputPath,
        ownerStdout,
        ownerStderr,
        contenderStdout,
        contenderStderr,
      ],
      {
        encoding: "utf8",
        killSignal: "SIGTERM",
        maxBuffer: 16 * 1024 * 1024,
        timeout: 60_000,
      },
    );

    parseRecord(await readFile(ownerStdout, "utf8"));
    parseRecord(await readFile(contenderStdout, "utf8"));
    const finalReceipt = parseRecord(
      await readFile(`${outputPath}.receipt.json`, "utf8"),
    );
    const contenderTokenText = await readFile(contenderTokenPath, "utf8");
    const contenderToken = contenderTokenText.trim();
    assert.equal(
      finalReceipt["tokenSha256"],
      sha256(Buffer.from(contenderToken)),
    );
    const generationPath = requiredString(finalReceipt, "outputPath");
    assert.equal(
      finalReceipt["outputSha256"],
      sha256(await readFile(generationPath)),
    );
    const remainingEntries = await readdir(directory);
    assert.equal(
      remainingEntries.some((name) => name.endsWith(".candidate")),
      false,
    );
    await assert.rejects(
      stat(join(directory, ".bridge.eext.archive-receipt.lock")),
      { code: "ENOENT" },
    );
    assert.doesNotMatch(
      `${await readFile(ownerStderr, "utf8")}\n${await readFile(contenderStderr, "utf8")}`,
      /Orphaned bridge candidate recovery failed/u,
    );
  });

  void test("withholds success when the token rotates after receipt commit", async () => {
    const directory = await temporaryDirectory();
    const tokenPath = join(directory, "bridge-token");
    const rotatedTokenPath = join(directory, "bridge-token.rotated");
    const outputPath = join(directory, "bridge.eext");
    const childStdout = join(directory, "child.stdout");
    const childStderr = join(directory, "child.stderr");
    const childStatus = join(directory, "child.status");
    runNode(provisionScript, ["--token-file", tokenPath]);
    const originalTokenText = await readFile(tokenPath, "utf8");
    const originalToken = originalTokenText.trim();

    const orchestration = String.raw`
set -euo pipefail
wait_stopped() {
  target_pid="$1"
  attempt=0
  while [ "$attempt" -lt 2000 ]; do
    state="$(sed -n 's/^State:[[:space:]]*\([A-Z]\).*/\1/p' "/proc/$target_pid/status" 2>/dev/null || true)"
    if [ "$state" = "T" ]; then
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 0.01
  done
  return 1
}
wait_finished() {
  target_pid="$1"
  attempt=0
  while [ "$attempt" -lt 2000 ]; do
    state="$(sed -n 's/^State:[[:space:]]*\([A-Z]\).*/\1/p' "/proc/$target_pid/status" 2>/dev/null || true)"
    if [ -z "$state" ] || [ "$state" = "Z" ] || [ "$state" = "X" ]; then
      set +e
      wait "$target_pid"
      result=$?
      set -e
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 0.01
  done
  return 1
}
node_path="$1"
build_script="$2"
provision_script="$3"
token_path="$4"
rotated_token_path="$5"
output_path="$6"
child_stdout="$7"
child_stderr="$8"
child_status="$9"
EASYEDA_TEST_STOP_AFTER_BRIDGE_RECEIPT_COMMIT=1 "$node_path" "$build_script" --token-file "$token_path" --output "$output_path" >"$child_stdout" 2>"$child_stderr" &
child_pid=$!
cleanup() {
  set +e
  kill -KILL "$child_pid" 2>/dev/null
  wait "$child_pid" 2>/dev/null
}
trap cleanup EXIT
trap 'exit 143' TERM INT
wait_stopped "$child_pid"
mv "$token_path" "$rotated_token_path"
"$node_path" "$provision_script" --token-file "$token_path" >/dev/null
kill -CONT "$child_pid"
result=0
wait_finished "$child_pid"
printf '%s\n' "$result" >"$child_status"
trap - EXIT TERM INT
`;
    execFileSync(
      "/bin/bash",
      [
        "-c",
        orchestration,
        "bridge-token-rotation",
        process.execPath,
        buildScript,
        provisionScript,
        tokenPath,
        rotatedTokenPath,
        outputPath,
        childStdout,
        childStderr,
        childStatus,
      ],
      {
        encoding: "utf8",
        killSignal: "SIGTERM",
        maxBuffer: 16 * 1024 * 1024,
        timeout: 60_000,
      },
    );

    const childStatusText = await readFile(childStatus, "utf8");
    assert.notEqual(childStatusText.trim(), "0");
    assert.equal(await readFile(childStdout, "utf8"), "");
    assert.match(
      await readFile(childStderr, "utf8"),
      /bridge token file changed after it was read/u,
    );
    const rotatedTokenText = await readFile(tokenPath, "utf8");
    const rotatedToken = rotatedTokenText.trim();
    assert.notEqual(rotatedToken, originalToken);
    const receipt = parseRecord(
      await readFile(`${outputPath}.receipt.json`, "utf8"),
    );
    assert.equal(
      receipt["tokenSha256"],
      sha256(Buffer.from(originalToken)),
    );
    const generationPath = requiredString(receipt, "outputPath");
    assert.equal(
      receipt["outputSha256"],
      sha256(await readFile(generationPath)),
    );
    await assert.rejects(
      stat(join(directory, ".bridge.eext.archive-receipt.lock")),
      { code: "ENOENT" },
    );
  });

  void test("serializes concurrent builds without mixing token generations", async () => {
    const directory = await temporaryDirectory();
    const firstTokenPath = join(directory, "first-token");
    const secondTokenPath = join(directory, "second-token");
    const outputPath = join(directory, "bridge.eext");
    runNode(provisionScript, ["--token-file", firstTokenPath]);
    runNode(provisionScript, ["--token-file", secondTokenPath]);
    const firstTokenText = await readFile(firstTokenPath, "utf8");
    const secondTokenText = await readFile(secondTokenPath, "utf8");
    const firstToken = firstTokenText.trim();
    const secondToken = secondTokenText.trim();

    await Promise.all([
      runNodeAsync(buildScript, [
        "--token-file",
        firstTokenPath,
        "--output",
        outputPath,
      ]),
      runNodeAsync(buildScript, [
        "--token-file",
        secondTokenPath,
        "--output",
        outputPath,
      ]),
    ]);

    const receipt = parseRecord(
      await readFile(`${outputPath}.receipt.json`, "utf8"),
    );
    const generationPath = requiredString(receipt, "outputPath");
    const archive = await readFile(generationPath);
    const indexBundle = execFileSync(
      "/usr/bin/unzip",
      ["-p", generationPath, "dist/index.js"],
      { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
    );
    assert.equal(receipt["outputSha256"], sha256(archive));
    const winningTokenSha256 = String(receipt["tokenSha256"]);
    const expectedToken =
      winningTokenSha256 === sha256(Buffer.from(firstToken))
        ? firstToken
        : secondToken;
    const losingToken = expectedToken === firstToken ? secondToken : firstToken;
    assert.ok(indexBundle.includes(expectedToken));
    assert.ok(!indexBundle.includes(losingToken));
    assert.ok(
      [firstToken, secondToken].some(
        (token) => winningTokenSha256 === sha256(Buffer.from(token)),
      ),
    );
  });

  void test("refuses an absent or over-permissive token file", async () => {
    const directory = await temporaryDirectory();
    const missing = join(directory, "missing-token");
    const output = join(directory, "bridge.eext");
    assert.throws(
      () =>
        runNode(buildScript, [
          "--token-file",
          missing,
          "--output",
          output,
        ]),
      /Command failed/u,
    );

    runNode(provisionScript, ["--token-file", missing]);
    await chmod(missing, 0o644);
    assert.throws(
      () =>
        runNode(buildScript, [
          "--token-file",
          missing,
          "--output",
          output,
        ]),
      /Command failed/u,
    );
  });

  void test("refuses a bridge token with another hard link", async () => {
    const directory = await temporaryDirectory();
    const tokenPath = join(directory, "bridge-token");
    const tokenAliasPath = join(directory, "bridge-token-alias");
    const outputPath = join(directory, "bridge.eext");
    runNode(provisionScript, ["--token-file", tokenPath]);
    const tokenBefore = await readFile(tokenPath);
    await link(tokenPath, tokenAliasPath);

    assert.throws(
      () =>
        runNode(buildScript, [
          "--token-file",
          tokenPath,
          "--output",
          outputPath,
        ]),
      /Command failed/u,
    );
    assert.deepEqual(await readFile(tokenPath), tokenBefore);
    assert.deepEqual(await readFile(tokenAliasPath), tokenBefore);
    await assert.rejects(stat(outputPath), { code: "ENOENT" });
  });

  void test("refuses hostile or permissive private artifact destinations", async () => {
    const directory = await temporaryDirectory();
    const tokenPath = join(directory, "bridge-token");
    const victimPath = join(directory, "victim");
    const symlinkOutput = join(directory, "symlink.eext");
    const permissiveOutput = join(directory, "permissive.eext");
    const legacyOutput = join(directory, "legacy.eext");
    runNode(provisionScript, ["--token-file", tokenPath]);

    await writeFile(victimPath, "victim-must-not-change\n", { mode: 0o600 });
    await symlink(victimPath, symlinkOutput);
    assert.throws(
      () =>
        runNode(buildScript, [
          "--token-file",
          tokenPath,
          "--output",
          symlinkOutput,
        ]),
      /Command failed/u,
    );
    assert.equal(await readFile(victimPath, "utf8"), "victim-must-not-change\n");

    await writeFile(permissiveOutput, "public-placeholder\n", { mode: 0o644 });
    await chmod(permissiveOutput, 0o644);
    assert.throws(
      () =>
        runNode(buildScript, [
          "--token-file",
          tokenPath,
          "--output",
          permissiveOutput,
        ]),
      /Command failed/u,
    );
    assert.equal(await readFile(permissiveOutput, "utf8"), "public-placeholder\n");
    const permissiveInformation = await stat(permissiveOutput);
    assert.equal(permissiveInformation.mode % 512, 0o644);

    await writeFile(legacyOutput, "private-legacy-archive\n", { mode: 0o600 });
    assert.throws(
      () =>
        runNode(buildScript, [
          "--token-file",
          tokenPath,
          "--output",
          legacyOutput,
        ]),
      /Command failed/u,
    );
    assert.equal(
      await readFile(legacyOutput, "utf8"),
      "private-legacy-archive\n",
    );
  });

  void test("refuses any bridge artifact destination inside the repository", async () => {
    const directory = await temporaryDirectory();
    const tokenPath = join(directory, "bridge-token");
    const repositoryOutput = join(
      pluginRoot,
      "server",
      "tests",
      "must-not-create-private-bridge.eext",
    );
    runNode(provisionScript, ["--token-file", tokenPath]);
    assert.throws(
      () =>
        runNode(buildScript, [
          "--token-file",
          tokenPath,
          "--output",
          repositoryOutput,
        ]),
      /Command failed/u,
    );
    await assert.rejects(readFile(repositoryOutput), { code: "ENOENT" });
  });

  void test("refuses token overlap with output, receipt, or canonical alias", async () => {
    const directory = await temporaryDirectory();
    const tokenPath = join(directory, "bridge-token.eext");
    runNode(provisionScript, ["--token-file", tokenPath]);
    const tokenBefore = await readFile(tokenPath);

    assert.throws(
      () =>
        runNode(buildScript, [
          "--token-file",
          tokenPath,
          "--output",
          tokenPath,
        ]),
      /Command failed/u,
    );

    assert.deepEqual(await readFile(tokenPath), tokenBefore);
    const tokenInformation = await stat(tokenPath);
    assert.equal(tokenInformation.mode % 512, 0o600);

    const receiptOutput = join(directory, "receipt-collision.eext");
    const receiptTokenPath = `${receiptOutput}.receipt.json`;
    runNode(provisionScript, ["--token-file", receiptTokenPath]);
    const receiptTokenBefore = await readFile(receiptTokenPath);
    assert.throws(
      () =>
        runNode(buildScript, [
          "--token-file",
          receiptTokenPath,
          "--output",
          receiptOutput,
        ]),
      /Command failed/u,
    );
    assert.deepEqual(await readFile(receiptTokenPath), receiptTokenBefore);
    await assert.rejects(readFile(receiptOutput), { code: "ENOENT" });

    const canonicalTokenPath = join(directory, "canonical-token");
    const aliasOutput = join(directory, "token-alias.eext");
    runNode(provisionScript, ["--token-file", canonicalTokenPath]);
    const canonicalTokenBefore = await readFile(canonicalTokenPath);
    await symlink(canonicalTokenPath, aliasOutput);
    assert.throws(
      () =>
        runNode(buildScript, [
          "--token-file",
          canonicalTokenPath,
          "--output",
          aliasOutput,
        ]),
      /Command failed/u,
    );
    assert.deepEqual(await readFile(canonicalTokenPath), canonicalTokenBefore);
  });

  void test("refuses invalid and generation-reserved bridge output basenames", async () => {
    const directory = await temporaryDirectory();
    const tokenPath = join(directory, "bridge-token");
    const invalidOutput = join(directory, "bridge.zip");
    const reservedOutput = join(
      directory,
      `bridge.${"a".repeat(64)}.eext`,
    );
    runNode(provisionScript, ["--token-file", tokenPath]);

    assert.throws(
      () =>
        runNode(buildScript, [
          "--token-file",
          tokenPath,
          "--output",
          invalidOutput,
        ]),
      /Command failed/u,
    );
    await assert.rejects(readFile(invalidOutput), { code: "ENOENT" });
    assert.throws(
      () =>
        runNode(buildScript, [
          "--token-file",
          tokenPath,
          "--output",
          reservedOutput,
        ]),
      /Command failed/u,
    );
    await assert.rejects(readFile(reservedOutput), { code: "ENOENT" });
  });

  void test("refuses another managed control-data subtree as an output", async () => {
    const directory = await temporaryDirectory();
    const homeDirectory = join(directory, "home");
    const controlDirectory = join(directory, "control-data");
    const tokenPath = join(directory, "bridge-token");
    const managedEvidenceOutput = join(
      controlDirectory,
      "evidence",
      "must-not-create-private-bridge.eext",
    );
    await mkdir(homeDirectory, { mode: 0o700 });
    const environment = bridgeEnvironment(controlDirectory, homeDirectory);
    runNode(provisionScript, ["--token-file", tokenPath], environment);
    assert.throws(
      () =>
        runNode(
          buildScript,
          ["--token-file", tokenPath, "--output", managedEvidenceOutput],
          environment,
        ),
      /Command failed/u,
    );
    await assert.rejects(readFile(managedEvidenceOutput), { code: "ENOENT" });
  });

  void test("freezes a reviewed snapshot and rejects later live-source drift", async () => {
    const directory = await temporaryDirectory();
    const liveRoot = join(directory, "live-source");
    const stagedRoot = join(directory, "staged-source");
    await stageReviewedVendoredSource(
      join(pluginRoot, "easyeda-bridge-extension"),
      liveRoot,
    );
    const stagedClosure = await stageReviewedVendoredSource(
      liveRoot,
      stagedRoot,
    );
    const readmePath = join(liveRoot, "README.md");
    await writeFile(
      readmePath,
      `${await readFile(readmePath, "utf8")}\nunauthorized drift\n`,
      "utf8",
    );
    await assert.rejects(
      async () => {
        assertReviewedVendoredSource(
          await captureVendoredSourceClosure(liveRoot),
        );
      },
      /differs from reviewed upstream commit/u,
    );
    assert.deepEqual(
      await captureVendoredSourceClosure(stagedRoot),
      stagedClosure,
    );
    assert.doesNotThrow(() => {
      assertReviewedVendoredSource(stagedClosure);
    });
  });
});
