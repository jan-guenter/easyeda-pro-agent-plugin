import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  assertSelfSoftCoreLimitZero,
  assertZeroSoftCoreLimit,
  runWithZeroSoftCoreLimit,
} from "../src/soft-core-limit.ts";

void describe("soft core-file limit boundary", () => {
  void test("accepts only one exact procfs row with canonical zero", () => {
    for (const row of [
      "Max core file size        0                    unlimited            bytes     ",
      "Max core file size\t0\t4096\tbytes",
    ]) {
      assert.doesNotThrow(() => {
        assertZeroSoftCoreLimit(
          `Limit                     Soft Limit           Hard Limit           Units\n${row}\nMax open files            1024                 1024                 files\n`,
        );
      });
    }

    const malformed = [
      "",
      "Max core file size 1 unlimited bytes\n",
      "Max core file size unlimited unlimited bytes\n",
      "Max core file size 00 unlimited bytes\n",
      "Max core file size +0 unlimited bytes\n",
      "Max core file size 0 unbounded bytes\n",
      "Max core file size 0 unlimited byte\n",
      "Max core file size 0 unlimited kbytes\n",
      "Max core file size 0 unlimited bytes extra\n",
      "Max core file size 0 unlimited bytes\r\n",
      " Max core file size 0 unlimited bytes\n",
      "Max core file size 0 unlimited bytes\nMax core file size 0 unlimited bytes\n",
      "Max core file sizes 0 unlimited bytes\n",
      `Max core file size 0 unlimited bytes\0\n`,
      "x".repeat(64 * 1024 + 1),
    ];
    for (const limits of malformed) {
      assert.throws(
        () => {
          assertZeroSoftCoreLimit(limits);
        },
        /core-file limit|limits record/u,
      );
    }
  });

  void test("does not invoke protected key reads or builds for nonzero or unknown limits", async () => {
    for (const readLimits of [
      (): Promise<string> =>
        Promise.resolve("Max core file size 4096 unlimited bytes\n"),
      (): Promise<string> => Promise.reject(new Error("limits unavailable")),
    ]) {
      let keyRead = false;
      let credentialBuild = false;
      await assert.rejects(
        runWithZeroSoftCoreLimit(
          (): Promise<string> => {
            keyRead = true;
            return Promise.resolve("long-lived-hmac-key");
          },
          readLimits,
        ),
        /core-file limit/u,
      );
      assert.equal(keyRead, false);
      await assert.rejects(
        runWithZeroSoftCoreLimit(
          (): Promise<string> => {
            credentialBuild = true;
            return Promise.resolve("credential-bearing-extension");
          },
          readLimits,
        ),
        /core-file limit/u,
      );
      assert.equal(credentialBuild, false);
    }
  });

  void test("fails the self assertion closed when the limits read is unknown", async () => {
    await assert.rejects(
      assertSelfSoftCoreLimitZero(() =>
        Promise.reject(new Error("unavailable private mount")),
      ),
      /could not be proven zero/u,
    );
  });

  void test("admits a protected operation exactly once after a zero proof", async () => {
    let calls = 0;
    const result = await runWithZeroSoftCoreLimit(
      (): Promise<string> => {
        calls += 1;
        return Promise.resolve("admitted");
      },
      (): Promise<string> =>
        Promise.resolve("Max core file size 0 unlimited bytes\n"),
    );
    assert.equal(result, "admitted");
    assert.equal(calls, 1);
  });
});
