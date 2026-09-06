import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import process from "node:process";
import { test } from "node:test";

void test("admits the actual ws default backlog without expanding listener authority", async () => {
  const reservation = createServer();
  reservation.listen({ host: "127.0.0.1", port: 0 });
  await once(reservation, "listening");
  const address = reservation.address();
  assert.ok(address !== null && typeof address !== "string");
  const port = address.port;
  const reservationClosed = once(reservation, "close");
  reservation.close();
  await reservationClosed;
  const source = `
    import assert from 'node:assert/strict';
    import { once } from 'node:events';
    import net from 'node:net';
    import { WebSocketServer } from 'ws';
    import { installUpstreamNetworkPolicy } from './server/src/upstream-network-policy.ts';
    const port = Number(process.argv[1]);
    installUpstreamNetworkPolicy(port);
    const server = new WebSocketServer({ host: '127.0.0.1', port });
    await once(server, 'listening');
    assert.equal(server.address().port, port);
    assert.equal(server.address().address, '127.0.0.1');
    for (const host of ['0.0.0.0', 'localhost', '::1']) {
      assert.throws(() => new WebSocketServer({ host, port }), /may listen only/);
    }
    assert.throws(() => new WebSocketServer({ host: '127.0.0.1', port: port === 65535 ? port - 1 : port + 1 }), /may listen only/);
    const listener = new net.Server();
    assert.throws(() => listener.listen({ fd: 0 }), /may listen only/);
    assert.throws(() => listener.listen({ host: '127.0.0.1', port, fd: 0 }), /may listen only/);
    assert.throws(() => listener.listen(port, '127.0.0.1', {}), /may listen only/);
    assert.throws(() => Reflect.apply(net.Server.prototype._listen2, listener,
      ['127.0.0.1', port, 4, false, 0, 0]), /without an inherited descriptor/);
    const closed = once(server, 'close');
    server.close();
    await closed;
    process.stdout.write('exact-ws-listener-policy-passed');
  `;
  const child = spawn(process.execPath, ["--input-type=module", "--eval", source, String(port)], {
    cwd: new URL("../..", import.meta.url),
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 10_000,
  });
  let stdout = "";
  let stderr = "";
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk: string) => {
    stdout += chunk;
  });
  child.stderr.on("data", (chunk: string) => {
    stderr += chunk;
  });
  await once(child, "close");
  assert.equal(child.signalCode, null);
  assert.equal(child.exitCode, 0, stderr);
  assert.equal(stdout, "exact-ws-listener-policy-passed");
});
