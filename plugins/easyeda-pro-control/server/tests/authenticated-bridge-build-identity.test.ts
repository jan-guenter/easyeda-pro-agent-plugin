import assert from "node:assert/strict";
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, test } from "node:test";

import {
  AUTHENTICATED_BRIDGE_REVIEWED_SOURCE_IDENTITY,
  loadAuthenticatedBridgeBuildIdentity,
} from "../src/authenticated-bridge-build-identity.ts";
import type { AuthenticatedBridgeBuildIdentity } from "../src/authenticated-bridge-build-identity.ts";
import { openControlRootCapability } from "../src/control-root.ts";
import { sha256Text } from "../src/core.ts";

const AUTHENTICATION_KEY = "k".repeat(64);
const BUILD_ID = `i${"g".repeat(43)}`;
const ARCHIVE_TEXT = "private authenticated bridge archive\n";
const priorControlDirectory = process.env["EASYEDA_CONTROL_DATA_DIR"];
const temporaryRoots: string[] = [];

async function createFixture(): Promise<{
  readonly archivePath: string;
  readonly controlRoot: string;
  readonly receiptPath: string;
}> {
  const temporary = await mkdtemp(join(tmpdir(), "bridge-identity-"));
  temporaryRoots.push(temporary);
  const controlRoot = join(temporary, "control");
  const buildRoot = join(controlRoot, "bridge-build");
  const archiveSha256 = sha256Text(ARCHIVE_TEXT);
  const archiveBasePath = join(
    buildRoot,
    "easyeda-pro-control-authenticated-bridge.eext",
  );
  const archivePath = archiveBasePath.replace(
    /\.eext$/u,
    `.${archiveSha256}.eext`,
  );
  const receiptPath = `${archiveBasePath}.receipt.json`;
  await mkdir(buildRoot, { recursive: true, mode: 0o700 });
  await chmod(controlRoot, 0o700);
  await writeFile(archivePath, ARCHIVE_TEXT, { mode: 0o600 });
  await writeFile(
    receiptPath,
    `${JSON.stringify({
      schema: "easyeda-pro-control.authenticated-bridge-build.v2",
      outputPath: archivePath,
      outputSha256: archiveSha256,
      outputBytes: Buffer.byteLength(ARCHIVE_TEXT),
      tokenSha256: sha256Text(AUTHENTICATION_KEY),
      authenticatedIndexBuildId: BUILD_ID,
      indexSha256: "2".repeat(64),
      authentication: {
        protocol: "easyeda-pro-control.bridge-auth.v1",
        publicEndpoint: { host: "127.0.0.1", port: 49_621 },
        rawTokenTransmission: false,
        adjacentPortFallback: false,
      },
      source: {
        ...AUTHENTICATED_BRIDGE_REVIEWED_SOURCE_IDENTITY,
        builtFromPrivateSnapshot: true,
        privateSnapshotSealed: true,
        postConsumptionVerified: true,
      },
    })}\n`,
    { mode: 0o600 },
  );
  return { archivePath, controlRoot, receiptPath };
}

async function loadFixtureIdentity(
  controlRoot: string,
): Promise<AuthenticatedBridgeBuildIdentity> {
  const capability = await openControlRootCapability(controlRoot);
  try {
    return await loadAuthenticatedBridgeBuildIdentity(
      AUTHENTICATION_KEY,
      capability,
    );
  } finally {
    await capability.close();
  }
}

afterEach(async () => {
  if (priorControlDirectory === undefined) {
    Reflect.deleteProperty(process.env, "EASYEDA_CONTROL_DATA_DIR");
  } else {
    process.env["EASYEDA_CONTROL_DATA_DIR"] = priorControlDirectory;
  }
  await Promise.all(
    temporaryRoots.splice(0).map((path) => rm(path, { force: true, recursive: true })),
  );
});

void describe(
  "authenticated bridge build identity",
  { concurrency: false },
  () => {
    void test("binds the expected build ID to a private matching archive and receipt", async () => {
      const fixture = await createFixture();
      process.env["EASYEDA_CONTROL_DATA_DIR"] = fixture.controlRoot;

      const identity = await loadFixtureIdentity(fixture.controlRoot);

      assert.equal(identity.authenticatedIndexBuildId, BUILD_ID);
      assert.equal(identity.authenticationKeySha256, sha256Text(AUTHENTICATION_KEY));
      assert.equal(identity.outputPath, fixture.archivePath);
      assert.equal(identity.receiptPath, fixture.receiptPath);
    });

    void test("rejects a mismatched archive or a permissive credential-bearing file", async () => {
      const fixture = await createFixture();
      process.env["EASYEDA_CONTROL_DATA_DIR"] = fixture.controlRoot;
      await writeFile(fixture.archivePath, "replaced archive\n", { mode: 0o600 });
      await assert.rejects(
        loadFixtureIdentity(fixture.controlRoot),
        /not a verified matching pair/u,
      );

      await writeFile(fixture.archivePath, ARCHIVE_TEXT);
      await chmod(fixture.archivePath, 0o644);
      await assert.rejects(
        loadFixtureIdentity(fixture.controlRoot),
        /mode-0600/u,
      );
    });

    void test("rejects a symlinked build directory without following it", async () => {
      const fixture = await createFixture();
      const externalBuild = join(fixture.controlRoot, "bridge-build-real");
      await mkdir(externalBuild, { mode: 0o700 });
      await rm(join(fixture.controlRoot, "bridge-build"), {
        force: true,
        recursive: true,
      });
      await symlink(externalBuild, join(fixture.controlRoot, "bridge-build"));
      process.env["EASYEDA_CONTROL_DATA_DIR"] = fixture.controlRoot;

      await assert.rejects(
        loadFixtureIdentity(fixture.controlRoot),
        /not a real directory/u,
      );
    });

    void test("rejects a same-user control-root replacement after capability acquisition", async () => {
      const fixture = await createFixture();
      const displacedControlRoot = `${fixture.controlRoot}.displaced`;
      const replacementMarker = join(fixture.controlRoot, "must-survive.txt");
      process.env["EASYEDA_CONTROL_DATA_DIR"] = fixture.controlRoot;
      const capability = await openControlRootCapability(fixture.controlRoot);
      try {
        await rename(fixture.controlRoot, displacedControlRoot);
        await mkdir(fixture.controlRoot, { mode: 0o700 });
        await writeFile(replacementMarker, "replacement survives\n", {
          mode: 0o600,
        });
        await assert.rejects(
          loadAuthenticatedBridgeBuildIdentity(
            AUTHENTICATION_KEY,
            capability,
          ),
          /control-root pathname changed/u,
        );
        assert.equal(
          await readFile(replacementMarker, "utf8"),
          "replacement survives\n",
        );
      } finally {
        await capability.close();
      }
    });
  },
);
