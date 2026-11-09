/** Fixed return reference recipe against inert peers. This proves comparisons,
 * not a real native return event, completed SQL body or live startup lifecycle. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInContext } from "node:vm";
import { bind, fixture, select } from "./helpers/startup-library-fixture.ts";
import { CURRENT_MAIN_STARTUP_LIBRARY_RETURN_PROGRAM as RETURN } from "../src/current-main-startup-library-return-program.ts";

void test("all script positions and the actual identical native return receiver are independently required", () => {
  const context = fixture(); bind(context);
  runInContext("const nativeReturn=Promise.resolve(kit.libraryOwner)",context);
  const proof = `(${RETURN}).call([kit.libraryOwner],kit.configTracker,tracker,nativeReturn,kit.libraryOwner)`;
  assert.throws(() => runInContext(proof, context));
  for (let index = 0; index < 332; index += 1) { select(context, index); }
  assert.equal(runInContext(proof, context), true);
  assert.throws(() => runInContext(`(${RETURN}).call([kit.libraryOwner],kit.configTracker,tracker,nativeReturn,{})`, context));
  assert.throws(() => runInContext(`(${RETURN}).call([{}],kit.configTracker,tracker,nativeReturn,kit.libraryOwner)`, context));
  assert.throws(() => runInContext(`(${RETURN}).call([kit.libraryOwner],kit.configTracker,tracker,nativeReturn,new Proxy(kit.libraryOwner,{getPrototypeOf:forbidden}))`, context));
  assert.equal(runInContext("calls", context), 0);
});
