import { createInterface } from "node:readline";

const [nonce, expectedBasename, mode] = process.argv.slice(2);
const ownerId = "1".repeat(32), windowsDirectory = `C:\\SyntheticTemp\\CodexEasyedaFixture_${ownerId}`;
const base = { schema: "easyeda-pro-control.fixture-destination-owner.v1", nonce, ownerId, windowsDirectory,
  directoryIdentity: "12345678:0000000012345678", expectedBasename, entries: [], state: "held", deletionAuthorized: false,
  libraries: [{ windowsDirectory: "C:\\SyntheticLibraries", directoryIdentity: "12345678:1111111111111111", names: ["asset.step"], watchState: "pending" }] };
if (mode === "stderr-init" || mode === "stderr-overflow") {
  process.stderr.write(mode === "stderr-init" ? "Synthetic destination startup failure\n" : "x".repeat(70_000));
} else { process.stdout.write(`${JSON.stringify(base)}\n`); }
const input = createInterface({ input: process.stdin });
input.on("line", (line) => {
  const request: unknown = JSON.parse(line);
  if (request === null || typeof request !== "object" || !("id" in request)) { throw new Error("Invalid synthetic request."); }
  const released = "action" in request && request.action === "release";
  if ("action" in request && ["capture-closed-file", "inspect-closed-file"].includes(String(request.action))) {
    const createdEpochMs = 1_800_000_000_000, modifiedEpochMs = 1_800_000_000_100;
    const createdFileTime = mode === "metadata-invalid-filetime" ? "1" : String(116_444_736_000_000_000n + BigInt(createdEpochMs) * 10_000n);
    const modifiedFileTime = String(116_444_736_000_000_000n + BigInt(modifiedEpochMs) * 10_000n);
    process.stdout.write(`${JSON.stringify({ schema: "easyeda-pro-control.fixture-closed-file-metadata.v1", destination: { ...base, entries: [expectedBasename], requestId: request.id },
      file: { windowsPath: `${windowsDirectory}\\${expectedBasename}`, fileIdentity: "12345678:2222222222222222", bytes: 4096,
        sha256: mode === "metadata-drift" && request.action === "inspect-closed-file" ? "b".repeat(64) : "a".repeat(64),
        createdEpochMs, modifiedEpochMs, createdFileTime, modifiedFileTime, watchState: "pending", readOnlyFileLease: true } })}\n`); return;
  }
  process.stdout.write(`${JSON.stringify({ ...base, ...(released ? { state: "released", libraries: base.libraries.map((entry) => ({ windowsDirectory: entry.windowsDirectory, directoryIdentity: entry.directoryIdentity, names: entry.names, watchState: "cancelled-no-changes" })) } : {}),
    ...(mode === "watch-completed" ? { libraries: [{ ...base.libraries[0], watchState: "notification-completed" }] } : {}),
    ...(mode === "substitute-owner" ? { directoryIdentity: "12345678:0000000099999999" } : {}),
    entries: mode === "unexpected-child" ? ["unreviewed.eprj2"] : [expectedBasename], requestId: request.id })}\n`);
});
