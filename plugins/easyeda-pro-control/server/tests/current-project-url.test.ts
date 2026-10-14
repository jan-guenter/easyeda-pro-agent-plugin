import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { buildCurrentProjectUrlGuard } from "../src/current-project-url.ts";

const base = "https://client/editor?cll=warn";
const project = "a".repeat(64);
const tab = `${"b".repeat(16)}@${project}`;
const peer = `${"c".repeat(32)}@${project}`;
function parse(value: unknown, projectUuid = project, activeTabId?: string | null): unknown {
  const context = createContext({ value, projectUuid, activeTabId });
  const result: unknown = runInContext(`const bad=()=>{throw new Error('URL_REFUSED');};${buildCurrentProjectUrlGuard()}parseProjectUrl(value,projectUuid,activeTabId);`, context, { timeout: 1000 });
  return structuredClone(result);
}

void test("ordinary project URL grammar retains empty state and exact bounded project/tab identities", () => {
  for (const value of [base, `${base}#`]) {
    assert.deepEqual(parse(value), { base, empty: true, tabIds: [], activeTabId: null });
  }
  assert.deepEqual(parse(`${base}#id=${project}`), { base, empty: false, tabIds: [], activeTabId: null });
  assert.deepEqual(parse(`${base}#id=${project},tab=${peer}|*${tab}`, project, tab),
    { base, empty: false, tabIds: [peer, tab], activeTabId: tab });
  assert.deepEqual(parse(`${base}#id=${project},tab=${tab}`, project, tab),
    { base, empty: false, tabIds: [tab], activeTabId: null });
  for (const level of ["trace", "debug", "info", "warn", "error"]) {
    const shortProject = "d".repeat(32);
    const shortBase = `https://client/editor?cll=${level}`;
    assert.deepEqual(parse(`${shortBase}#id=${shortProject}`, shortProject),
      { base: shortBase, empty: false, tabIds: [], activeTabId: null });
  }
  const ids = Array.from({ length: 256 }, (_, index) => `${index.toString(16).padStart(16, "0")}@${project}`);
  assert.deepEqual(parse(`${base}#id=${project},tab=${ids.join("|")}`), { base, empty: false, tabIds: ids, activeTabId: null });
});

void test("ordinary project URL grammar refuses foreign identities, ambiguous markers and unreviewed syntax", () => {
  const otherProject = "d".repeat(64);
  const suffixes = [`id=${otherProject}`, `id=${project},tab=${"b".repeat(16)}@${otherProject}`,
    `id=${project},tab=*${tab}|*${peer}`, `id=${project},tab=${tab}|${tab}`, `id=${project},tab=**${tab}`,
    `id=${project},tab=`, `id=${project},tab=${tab}|`, `tab=${tab},id=${project}`,
    `id=${project},tab=${tab},mode=edit`, `id=${project},mode=edit`, `id=${project}%2Ctab=${tab}`,
    `id=${project},tab=!${tab}`, `id=${project},tab=+${tab}`, `id=${project},tab=${tab}_1`,
    `id=${project},tab=${tab}(device)`, `id=${project},tab=${tab}\n`, `id=${project}#`,
    `id=${project},tab=${Array.from({ length: 257 }, (_, index) => `${index.toString(16).padStart(16, "0")}@${project}`).join("|")}`];
  for (const suffix of suffixes) { assert.throws(() => parse(`${base}#${suffix}`), { message: "URL_REFUSED" }); }
  for (const value of [null, {}, "https://client/editor?cll=warn&other=true", `${base}\n`, `${base}#${"x".repeat(32_768)}`]) {
    assert.throws(() => parse(value), { message: "URL_REFUSED" });
  }
  assert.throws(() => parse(`${base}#id=${project},tab=*${peer}`, project, tab), { message: "URL_REFUSED" });
  assert.throws(() => parse(base, `${project}\n`), { message: "URL_REFUSED" });
});
