/* oxlint-disable eslint/max-classes-per-file -- Two browser interfaces require independent prototype and receiver brands. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { SERVICE_WORKER_READ_PROFILE, buildServiceWorkerReadExpression, validateServiceWorkerReadResult } from "../src/service-worker-read.ts";

type Bag = Record<string, unknown>;
interface Control {
  result: unknown;
  calls: unknown[];
  onRead: (() => unknown) | undefined;
  timeout: () => void;
  cleared: number;
}
interface Fixture {
  sandbox: Bag;
  container: { controllerValue: unknown };
  control: Control;
  run: () => Promise<unknown>;
}

function fixture(): Fixture {
  const control: Control = { result: [], calls: [], onRead: undefined, timeout(): never { throw new Error("timer unavailable"); }, cleared: 0 };
  class SyntheticContainer {
    public controllerValue: unknown = null;
    public get controller(): unknown { return this.controllerValue; }
    public getRegistrations(): Promise<unknown> {
      control.calls.push(this);
      const result = control.onRead?.();
      return Promise.resolve(result === undefined ? control.result : result);
    }
  }
  class SyntheticNavigator {
    public readonly target: SyntheticContainer;
    public constructor(target: SyntheticContainer) { this.target = target; }
    public get serviceWorker(): SyntheticContainer { return this.target; }
  }
  const container = new SyntheticContainer();
  const sandbox: Bag = {
    Array, Object, Reflect,
    location: { href: "https://client/editor?cll=warn#", origin: "https://client" },
    document: { nodeType: 9, URL: "https://client/editor?cll=warn#" },
    PRO_EDITOR_MODE: "CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM",
    Navigator: SyntheticNavigator, navigator: new SyntheticNavigator(container), ServiceWorkerContainer: SyntheticContainer,
    setTimeout(callback: () => void, delay: number): number { assert.equal(delay, 10_000); control.timeout = callback; return 7; },
    clearTimeout(id: unknown): void { assert.equal(id, 7); control.cleared += 1; },
  };
  return {
    sandbox, container, control,
    async run(): Promise<unknown> {
      const result: unknown = runInNewContext(`globalThis.top=globalThis;globalThis.window=globalThis;if(globalThis.document){globalThis.document.defaultView=globalThis;}${buildServiceWorkerReadExpression()}`, sandbox, { timeout: 1000 });
      return await result;
    },
  };
}

void test("exact one read with retained native receiver and data-only result", async () => {
  const state = fixture(), value: unknown = structuredClone(await state.run());
  assert.deepEqual(value, { profile: SERVICE_WORKER_READ_PROFILE, origin: "https://client", controllerAbsent: true, registrationsAbsent: true, scope: "point-in-time-main-storage-key" });
  assert.deepEqual(state.control.calls, [state.container]); assert.equal(state.control.cleared, 1);
  assert.equal(Object.isFrozen(validateServiceWorkerReadResult(value)), true);
});
void test("frozen empty array is also accepted without assuming Chromium implements FrozenArray", async () => {
  const state = fixture(); state.control.result = Object.freeze([]);
  const value: unknown = structuredClone(await state.run()); validateServiceWorkerReadResult(value);
  assert.equal(state.control.calls.length, 1); assert.equal(state.control.cleared, 1);
});
for (const forbidden of ["register(", "unregister(", ".update(", "getRegistration(", "startMessages(", ".ready", ".scriptURL", ".scope", ".active", ".waiting", ".installing", "fetch(", "caches", "indexedDB"]) {
  void test(`expression excludes ${forbidden}`, () => { assert.equal(buildServiceWorkerReadExpression().includes(forbidden), false); });
}

const contexts: [string, (state: Fixture) => void][] = [
  ["wrong origin", (s) => { s.sandbox["location"] = { href: "https://other/editor?cll=warn#", origin: "https://other" }; }],
  ["numeric log level", (s) => { s.sandbox["location"] = { href: "https://client/editor?cll=3#", origin: "https://client" }; }],
  ["startup project", (s) => { s.sandbox["location"] = { href: "https://client/editor?cll=warn#id=target", origin: "https://client" }; }],
  ["startup query", (s) => { s.sandbox["location"] = { href: "https://client/editor?cll=warn&cmd=open#", origin: "https://client" }; }],
  ["mode", (s) => { s.sandbox["PRO_EDITOR_MODE"] = "UNKNOWN-CLIENT-OFFLINE"; }],
  ["missing document", (s) => { Reflect.deleteProperty(s.sandbox, "document"); }],
  ["wrong document", (s) => { s.sandbox["document"] = { nodeType: 1, URL: "https://client/editor?cll=warn#" }; }],
  ["wrong Navigator", (s) => { s.sandbox["Navigator"] = Object; }],
  ["wrong navigator", (s) => { s.sandbox["navigator"] = {}; }],
  ["wrong Container", (s) => { s.sandbox["ServiceWorkerContainer"] = Object; }],
  ["own container shadow", (s) => { Object.defineProperty(s.sandbox["navigator"], "serviceWorker", { value: s.container }); }],
  ["own controller shadow", (s) => { Object.defineProperty(s.container, "controller", { value: null }); }],
  ["own method shadow", (s) => { Object.defineProperty(s.container, "getRegistrations", { value: (): Promise<unknown[]> => Promise.resolve([]) }); }],
  ["controlling worker", (s) => { s.container.controllerValue = {}; }],
  ["undefined controller", (s) => { s.container.controllerValue = undefined; }],
];
for (const [label, mutate] of contexts) {
  void test(`refuses ${label} before native list read`, async () => {
    const state = fixture(); mutate(state);
    await assert.rejects(state.run(), /SERVICE_WORKER_READ_REFUSED:/u); assert.equal(state.control.calls.length, 0);
  });
}

for (const result of [undefined, null, {}, false, "", { length: 0 }, [null], [{}], [undefined]]) {
  void test(`refuses registration presence or malformed result ${JSON.stringify(result)}`, async () => {
    const state = fixture(); state.control.result = result;
    await assert.rejects(state.run(), /SERVICE_WORKER_READ_REFUSED:REGISTRATIONS/u);
    assert.equal(state.control.calls.length, 1); assert.equal(state.control.cleared, 1);
  });
}
void test("no registration object, element getter or script body is read", async () => {
  const state = fixture(); let reads = 0;
  const registrations: unknown[] = [];
  Object.defineProperty(registrations, "0", { get(): never { reads += 1; throw new Error("private worker"); } });
  state.control.result = registrations;
  await assert.rejects(state.run(), /SERVICE_WORKER_READ_REFUSED:REGISTRATIONS/u); assert.equal(reads, 0);
});
void test("extra properties on an empty array refuse without reading getters", async () => {
  const state = fixture(); let reads = 0;
  const registrations: unknown[] = [];
  Object.defineProperty(registrations, "hidden", { get(): never { reads += 1; throw new Error("private"); } });
  state.control.result = registrations;
  await assert.rejects(state.run(), /SERVICE_WORKER_READ_REFUSED:REGISTRATIONS/u); assert.equal(reads, 0);
});

for (const [label, mutate] of contexts) {
  void test(`refuses ${label} after awaited read`, async () => {
    const state = fixture(); state.control.onRead = (): void => { mutate(state); };
    await assert.rejects(state.run(), /SERVICE_WORKER_READ_REFUSED:/u);
    assert.equal(state.control.calls.length, 1); assert.equal(state.control.cleared, 1);
  });
}
for (const field of ["controller", "getRegistrations"]) {
  void test(`native prototype ${field} descriptor replacement refuses`, async () => {
    const state = fixture();
    state.control.onRead = (): void => {
      const prototype: unknown = Object.getPrototypeOf(state.container); assert.ok(prototype !== null && typeof prototype === "object");
      Object.defineProperty(prototype, field, { value: (): Promise<unknown[]> => Promise.resolve([]) });
    };
    await assert.rejects(state.run(), /SERVICE_WORKER_READ_REFUSED:/u); assert.equal(state.control.calls.length, 1);
  });
}
void test("deadline refuses and late empty settlement cannot produce acceptance or retry", async () => {
  const pending = Promise.withResolvers<unknown>(), state = fixture();
  state.control.onRead = (): Promise<unknown> => pending.promise;
  const running = state.run();
  assert.equal(state.control.calls.length, 1); state.control.timeout();
  await assert.rejects(running, /SERVICE_WORKER_READ_REFUSED:TIMEOUT/u);
  pending.resolve([]);
  for (let index = 0; index < 10; index += 1) { await Promise.resolve(); }
  assert.equal(state.control.calls.length, 1); assert.equal(state.control.cleared, 1);
});
void test("native exceptions expose only fixed stage tokens", async () => {
  const state = fixture(); state.control.onRead = (): never => { throw new Error("private scope and script source"); };
  await assert.rejects(state.run(), { message: "SERVICE_WORKER_READ_REFUSED:REGISTRATIONS" }); assert.equal(state.control.calls.length, 1);
});
void test("result parser refuses added authority, missing fields and accessors", async () => {
  const state = fixture();
  const plain: unknown = structuredClone(await state.run());
  const value = validateServiceWorkerReadResult(plain);
  assert.throws(() => validateServiceWorkerReadResult({ ...value, completed: true }), /SERVICE_WORKER_RESULT/u);
  for (const field of Object.keys(value)) {
    const altered = { ...value }; Reflect.deleteProperty(altered, field);
    assert.throws(() => validateServiceWorkerReadResult(altered), /SERVICE_WORKER_RESULT/u);
    let reads = 0;
    Object.defineProperty(altered, field, { get(): never { reads += 1; throw new Error("private"); } });
    assert.throws(() => validateServiceWorkerReadResult(altered), /SERVICE_WORKER_RESULT/u); assert.equal(reads, 0);
  }
});

for (const logLevel of ["trace", "debug", "info", "warn", "error"]) {
  for (const mode of ["CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM", "CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM"]) {
    void test(`source-derived mode and log level ${mode}/${logLevel}`, async () => {
      const href = `https://client/editor?cll=${logLevel}#`, state = fixture();
      state.sandbox["location"] = { href, origin: "https://client" };
      state.sandbox["document"] = { nodeType: 9, URL: href };
      state.sandbox["PRO_EDITOR_MODE"] = mode;
      validateServiceWorkerReadResult(structuredClone(await state.run()));
      assert.equal(state.control.calls.length, 1);
    });
  }
}

function copyObject(value: unknown): object {
  assert.ok(value !== null && typeof value === "object"); return { ...value };
}
const drifts: [string, (state: Fixture) => void][] = [
  ["top frame", (s) => { s.sandbox["top"] = {}; }],
  ["window", (s) => { s.sandbox["window"] = {}; }],
  ["matching document replacement", (s) => { s.sandbox["document"] = copyObject(s.sandbox["document"]); }],
  ["matching location replacement", (s) => { s.sandbox["location"] = copyObject(s.sandbox["location"]); }],
  ["deadline function", (s) => { s.sandbox["setTimeout"] = (): number => 7; }],
  ["clear function", (s) => { s.sandbox["clearTimeout"] = (): undefined => undefined; }],
  ["controller getter", (s) => { Object.defineProperty(Object.getPrototypeOf(s.container), "controller", { get(): null { return null; } }); }],
  ["container getter", (s) => { Object.defineProperty(Object.getPrototypeOf(s.sandbox["navigator"]), "serviceWorker", { get(): unknown { return s.container; } }); }],
  ["container prototype", (s) => { Object.setPrototypeOf(s.container, {}); }],
  ["navigator prototype", (s) => { Object.setPrototypeOf(s.sandbox["navigator"], {}); }],
];
for (const [label, mutate] of drifts) {
  void test(`retains context across an actually pending await: ${label}`, async () => {
    const pending = Promise.withResolvers<unknown>(), state = fixture();
    state.control.onRead = (): Promise<unknown> => pending.promise;
    const running = state.run(); assert.equal(state.control.calls.length, 1);
    mutate(state); pending.resolve([]);
    await assert.rejects(running, /SERVICE_WORKER_READ_REFUSED:/u);
    assert.equal(state.control.calls.length, 1); assert.equal(state.control.cleared, 1);
  });
}
void test("asynchronous native rejection is sanitized without retry", async () => {
  const state = fixture();
  state.control.onRead = (): Promise<never> => Promise.reject(new Error("private scope and script source"));
  await assert.rejects(state.run(), { message: "SERVICE_WORKER_READ_REFUSED:REGISTRATIONS" });
  assert.equal(state.control.calls.length, 1); assert.equal(state.control.cleared, 1);
});
void test("own method accessor is refused without invoking its getter", async () => {
  const state = fixture(); let reads = 0;
  Object.defineProperty(state.container, "getRegistrations", { get(): never { reads += 1; throw new Error("private"); } });
  await assert.rejects(state.run(), /SERVICE_WORKER_READ_REFUSED:/u);
  assert.equal(reads, 0); assert.equal(state.control.calls.length, 0);
});
