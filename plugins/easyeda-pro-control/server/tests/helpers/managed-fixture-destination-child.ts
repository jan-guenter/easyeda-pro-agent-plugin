import { createInterface } from "node:readline";

const [nonce, expectedBasename, mode] = process.argv.slice(2);
const ownerId = "1".repeat(32), windowsDirectory = `C:\\SyntheticTemp\\CodexEasyedaFixture_${ownerId}`;
const base = { schema: "easyeda-pro-control.fixture-destination-owner.v1", nonce, ownerId, windowsDirectory,
  directoryIdentity: "12345678:0000000012345678", expectedBasename, entries: [], state: "held", deletionAuthorized: false,
  libraries: [{ windowsDirectory: "C:\\SyntheticLibraries", directoryIdentity: "12345678:1111111111111111", names: ["asset.step"], watchState: "pending" }] };
process.stdout.write(`${JSON.stringify(base)}\n`);
const input = createInterface({ input: process.stdin });
input.on("line", (line) => {
  const request: unknown = JSON.parse(line);
  if (request === null || typeof request !== "object" || !("id" in request)) { throw new Error("Invalid synthetic request."); }
  const released = "action" in request && request.action === "release";
  process.stdout.write(`${JSON.stringify({ ...base, ...(released ? { state: "released", libraries: base.libraries.map((entry) => ({ windowsDirectory: entry.windowsDirectory, directoryIdentity: entry.directoryIdentity, names: entry.names, watchState: "cancelled-no-changes" })) } : {}),
    ...(mode === "watch-completed" ? { libraries: [{ ...base.libraries[0], watchState: "notification-completed" }] } : {}),
    ...(mode === "substitute-owner" ? { directoryIdentity: "12345678:0000000099999999" } : {}),
    entries: mode === "unexpected-child" ? ["unreviewed.eprj2"] : [expectedBasename], requestId: request.id })}\n`);
});
