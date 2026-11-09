import assert from "node:assert/strict";
import { test } from "node:test";
import { continueCurrentFootprintInverseReference } from "../src/current-footprint-inverse-reference-continuation.ts";

void test("reference continuation stops before downstream control on either malformed acknowledgment", async () => {
  let effects = 0; const getter = Object.defineProperty({}, "extra", { enumerable: true, get: (): never => { effects += 1; throw new Error("UNTRUSTED_REPLY_GETTER"); } });
  const hidden = Object.defineProperty({}, "extra", { value: true });
  for (const malformed of [{ extra: true }, [], null, undefined, "{}", getter, hidden, { [Symbol("extra")]: true }]) {
    for (const failure of ["remove", "resume"]) {
      const calls: string[] = [];
      await assert.rejects(continueCurrentFootprintInverseReference({ current: (): void => undefined,
        remove: (): Promise<unknown> => { calls.push("remove"); return Promise.resolve(failure === "remove" ? malformed : {}); },
        resume: (): Promise<unknown> => { calls.push("resume"); return Promise.resolve(malformed); },
        wait: (): Promise<true> => { calls.push("wait"); return Promise.resolve(true); },
      }));
      assert.deepEqual(calls, failure === "remove" ? ["remove"] : ["remove", "resume"]);
    }
  }
  assert.equal(effects, 0);
});
void test("reference continuation preserves original failures and exact success order without retries", async () => {
  const calls: string[] = [], held = Object.freeze({ originalFrame: "frame" });
  const actual = await continueCurrentFootprintInverseReference({ current: (): void => { calls.push("current"); },
    remove: (): Promise<object> => { calls.push("remove"); return Promise.resolve({}); },
    resume: (): Promise<object> => { calls.push("resume"); return Promise.resolve({}); },
    wait: (): Promise<typeof held> => { calls.push("wait"); return Promise.resolve(held); },
  });
  assert.equal(actual, held); assert.deepEqual(calls, ["current", "remove", "current", "resume", "current", "wait", "current"]);
  const original = new Error("original removal failed"); let downstream = 0;
  await assert.rejects(continueCurrentFootprintInverseReference({ current: (): void => undefined,
    remove: (): Promise<never> => Promise.reject(original), resume: (): Promise<object> => { downstream += 1; return Promise.resolve({}); }, wait: (): Promise<true> => { downstream += 1; return Promise.resolve(true); },
  }), error => error === original); assert.equal(downstream, 0);
  let current = 0;
  await assert.rejects(continueCurrentFootprintInverseReference({ current: (): void => { current += 1; if (current === 2) { throw original; } },
    remove: (): Promise<object> => Promise.resolve({}), resume: (): Promise<object> => { downstream += 1; return Promise.resolve({}); }, wait: (): Promise<true> => { downstream += 1; return Promise.resolve(true); },
  }), error => error === original); assert.equal(downstream, 0);
});
