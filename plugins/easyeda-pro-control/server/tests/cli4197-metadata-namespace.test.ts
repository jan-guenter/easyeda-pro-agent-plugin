/** Actual fixed bootstrap control flow, with synthetic OS/process peers only. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { parse } from "acorn";
import { CLI4197_METADATA_LIMITS, cli4197MetadataArguments, parseCli4197MetadataOptions } from "../../scripts/cli4197-metadata/profile.ts";
import { cli4197MetadataBootstrap, cli4197MetadataSandboxArguments } from "../../scripts/cli4197-metadata/namespace.ts";
import { decodeCli4197MetadataReport, verifyCli4197MetadataOutput } from "../../scripts/cli4197-metadata/runner.ts";
import { cli4197NamespaceFixture } from "./helpers/cli4197-metadata-namespace-fixture.ts";

void test("fixed namespace bootstrap closes and audits all seven roles before command-first metadata, retaining vendor stderr", async () => {
  const f = await cli4197NamespaceFixture(); f.run(); assert.equal(f.calls.length, 1);
  const args = f.calls[0]?.[1]; assert.ok(Array.isArray(args)); assert.deepEqual(Array.from(args, (value: unknown): unknown => value), cli4197MetadataArguments("openHelp"));
  assert.equal(f.files.get("/etc/passwd"), "agent:x:1000:1000:Private metadata agent:/home/agent:/bin/false\n");
  assert.equal(f.files.get("/etc/group"), "agent:x:1000:\n");
  f.stdout.write(Buffer.from("open\n\nUsage:\n")); f.stderr.write(Buffer.from("bounded DBus warning\n")); f.close(0);
  assert.deepEqual(f.exits, [0]); const bytes = Buffer.from(JSON.stringify(f.report())); const result = decodeCli4197MetadataReport(bytes, "openHelp");
  assert.equal(result.stderr?.toString(), "bounded DBus warning\n"); assert.equal(result.stdout?.toString(), "open\n\nUsage:\n");
  assert.equal(result.report.apiInvocationAuthorized, false); assert.equal(result.report.connectedRuntimeAdmitted, false);
});

void test("duplicate runtime/ELF descriptors, mismatched mapped roles, shared namespaces and host identity refuse before vendor code", async () => {
  for (const leaked of [4n, 5n]) {
    const f = await cli4197NamespaceFixture(); f.descriptors.set(20, { dev: 1n, ino: leaked });
    assert.throws(f.run, /CLI4197_METADATA_NAMESPACE_REFUSED/u); assert.equal(f.calls.length, 0);
  }
  const mismatched = await cli4197NamespaceFixture(); mismatched.descriptors.set(5, { dev: 1n, ino: 99n });
  assert.throws(mismatched.run, /CLI4197_METADATA_NAMESPACE_REFUSED/u); assert.equal(mismatched.calls.length, 0);
  const shared = await cli4197NamespaceFixture(); shared.setNamespaceShared(); assert.throws(shared.run); assert.equal(shared.calls.length, 0);
  const account = await cli4197NamespaceFixture(); account.setAccountWrong(); assert.throws(account.run); assert.equal(account.calls.length, 0);
});

void test("PID1's deadline and both output bounds exit its job without signals or partial success", async () => {
  for (const stream of ["stdout", "stderr"] as const) {
    const f = await cli4197NamespaceFixture(); f.run(); f[stream].write(Buffer.alloc(CLI4197_METADATA_LIMITS.outputBytes + 1));
    assert.deepEqual(f.exits, [125]); const report = f.report(); assert.equal(report["reason"], `${stream}-bound`);
    assert.equal(report["outputComplete"], false); assert.equal(report["stdout"], null); assert.equal(report["stderr"], null);
  }
  const f = await cli4197NamespaceFixture(); f.run(); f.deadline(); assert.deepEqual(f.exits, [124]); assert.equal(f.report()["reason"], "deadline");
});

void test("developer catalogue rejects arbitrary argv/code/project/session routes and root-help masquerading as command help", () => {
  const options = { command: "rootHelp", runtimeDirectory: "/candidate", inventoryPath: "/inventory.json", evidenceParent: "/private" };
  for (const command of ["invoke", "open", "sessionList", "apiIndex", "stop", "doctor", "__proto__"]) { assert.throws(() => parseCli4197MetadataOptions({ ...options, command })); }
  for (const field of ["argv", "code", "projectPath", "session", "endpoint"]) { assert.throws(() => parseCli4197MetadataOptions({ ...options, [field]: "private" })); }
  assert.throws(() =>{  verifyCli4197MetadataOutput("openHelp", Buffer.from("JLCEDA Pro 4.1.97.04b092ac\n")); });
  assert.throws(() =>{  verifyCli4197MetadataOutput("viaCreateDocs", Buffer.from("{\"ok\":true,\"value\":{}}")); });
  verifyCli4197MetadataOutput("apiHelp", Buffer.from("doc.api\n"));
});

void test("bootstrap is valid fixed JavaScript and sandbox plan exposes no host profile, display, network or account mounts", () => {
  const roles = Object.fromEntries([3, 4, 5, 6, 7, 8, 9].map(fd => [String(fd), { dev: "1", ino: String(fd) }]));
  const bootstrap = cli4197MetadataBootstrap({ command: "rootHelp", nodeSha256: "a".repeat(64), roleIdentities: roles,
    hostNamespaces: { user: "user:[1]", mnt: "mnt:[1]", pid: "pid:[1]", net: "net:[1]", ipc: "ipc:[1]", uts: "uts:[1]" } });
  parse(bootstrap, { ecmaVersion: "latest", sourceType: "module" }); const args = cli4197MetadataSandboxArguments(bootstrap);
  assert.ok(args.includes("--as-pid-1") && args.includes("--unshare-net") && args.includes("--clearenv"));
  assert.ok(!args.includes("--share-net") && !args.includes("--bind") && !args.includes("DISPLAY") && !args.includes("/etc/passwd"));
  assert.ok(args.includes("/proc/self/fd/3") && args.includes("/proc/self/fd/4") && args.includes("/proc/self/fd/5"));
  assert.equal(args.at(-1), bootstrap); assert.ok(Buffer.byteLength(bootstrap) <= CLI4197_METADATA_LIMITS.bootstrapBytes);
});
