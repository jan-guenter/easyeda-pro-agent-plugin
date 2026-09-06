import assert from "node:assert/strict";
import net from "node:net";
import { syncBuiltinESMExports } from "node:module";
import { describe, test } from "node:test";
import type { TestContext } from "node:test";

import { allocatePrivateLoopbackPort } from "../src/authenticated-bridge-gateway.ts";

function mockReservations(
  context: TestContext,
  ports: readonly (number | null)[],
): { readonly closed: boolean[]; readonly restore: () => void } {
  const closed: boolean[] = [];
  const factory = context.mock.method(net, "createServer", () => {
    const index = closed.length;
    const port = ports[index];
    assert.notEqual(port, undefined, "Allocated more ports than the bounded fixture permits.");
    closed.push(false);
    const server = new net.Server();
    context.mock.method(server, "listen", () => {
      queueMicrotask(() => {
        server.emit("listening");
      });
      return server;
    });
    context.mock.method(server, "address", () =>
      port === null ? null : { address: "127.0.0.1", family: "IPv4", port },
    );
    // oxlint-disable promise/prefer-await-to-callbacks -- The net.Server.close fixture must invoke the production API's callback to prove reservation cleanup.
    context.mock.method(server, "close", (callback?: (error?: Error) => void) => {
      closed[index] = true;
      callback?.();
      return server;
    });
    // oxlint-enable promise/prefer-await-to-callbacks
    return server;
  });
  syncBuiltinESMExports();
  return {
    closed,
    restore: (): void => {
      factory.mock.restore();
      syncBuiltinESMExports();
    },
  };
}

void describe("private loopback port allocation", { concurrency: false }, () => {
  void test("closes a colliding reservation before returning a distinct port", async (context) => {
    const reservations = mockReservations(context, [62_000, 62_001]);
    try {
      assert.equal(await allocatePrivateLoopbackPort(62_000), 62_001);
      assert.deepEqual(reservations.closed, [true, true]);
    } finally {
      reservations.restore();
    }
  });

  void test("excludes the production gateway port by default", async (context) => {
    const reservations = mockReservations(context, [49_621, 62_001]);
    try {
      assert.equal(await allocatePrivateLoopbackPort(), 62_001);
      assert.deepEqual(reservations.closed, [true, true]);
    } finally {
      reservations.restore();
    }
  });

  void test("bounds repeated collisions and closes every reservation", async (context) => {
    const reservations = mockReservations(context, Array.from({ length: 8 }, (): number => 62_000));
    try {
      await assert.rejects(allocatePrivateLoopbackPort(62_000), /exhausted 8 attempts/u);
      assert.deepEqual(reservations.closed, Array.from({ length: 8 }, (): boolean => true));
    } finally {
      reservations.restore();
    }
  });

  void test("closes a reservation with no TCP address", async (context) => {
    const reservations = mockReservations(context, [null]);
    try {
      await assert.rejects(allocatePrivateLoopbackPort(62_000), /no TCP address/u);
      assert.deepEqual(reservations.closed, [true]);
    } finally {
      reservations.restore();
    }
  });

  void test("rejects invalid exclusions without allocating a socket", async (context) => {
    const reservations = mockReservations(context, []);
    try {
      for (const port of [-1, 65_536, 1.5, Number.NaN]) {
        await assert.rejects(allocatePrivateLoopbackPort(port), /public bridge port is invalid/u);
      }
      assert.deepEqual(reservations.closed, []);
    } finally {
      reservations.restore();
    }
  });
});
