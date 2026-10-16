/** Fixed program and original transport boundaries, no Windows or live profile. */
/* oxlint-disable import/max-dependencies -- Exercise both fixed programs, the original transport refusal and the maintained SQL reader without substituting their validators. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { Script, createContext, runInContext } from "node:vm";
import { sha256Text } from "../src/core.ts";
import { buildCurrentAgedSqlReferenceProgram, compileCurrentAgedSqlReferenceMetadata } from "../src/current-aged-sql-reference-program.ts";
import { buildCurrentAgedSqlRendererProgram, decodeCurrentAgedSqlRendererReply } from "../src/current-aged-sql-renderer-program.ts";
import { selectCurrentUnlockedSqlHead } from "../src/current-aged-sql-head.ts";
import { currentSymbolClockEvidenceId } from "../src/current-symbol-clock-evidence.ts";
import { buildMainReferenceProgram } from "../src/closed-symbol-main-reference-program.ts";
import { invokeMainReferenceTransport } from "../src/closed-symbol-main-reference-transport.ts";
import { request as mainRequest } from "./helpers/main-reference-settlement-fixture.ts";
import { HISTORY_TABLE, IDS, inventory, mutate, fixture as sqlFixture } from "./helpers/symbol-sql-fixture.ts";

const actor = { uuid: "1".repeat(32), username: "synthetic", nickname: "Synthetic" };
const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32) };
const scope = { createdAtLiteral: "2026-01-15 12:34:56", referenceUtcMs: Date.UTC(2026, 9, 16, 12) };
const request = { scope, target, actor };
function renderer(before = ""): unknown {
  const context = createContext({ TextEncoder });
  runInContext(`globalThis.window=globalThis;globalThis.top=globalThis;globalThis.target=${JSON.stringify(target)};
globalThis.location={href:'https://client/editor?cll=warn#id='+target.projectUuid,origin:'https://client'};
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href};globalThis.navigator={serviceWorker:{controller:null}};
globalThis.PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';globalThis.PRO_EDITOR_VERSION='3.2.206';
globalThis.info={id:'editor-window-main',belong:'editor-window-main',tabs:[{tabId:'tab_page1',data:{doctype:-1},isAbleDelete:false,group:'start_blank',draggable:true,isDisplayNone:false}],activeTabId:'tab_page1'};
class Tabs{static containerIds=['editor-window-main'];static containerTree={id:'editor-window-main'};static belongContainer='editor-window-main';static currentTabId='tab_page1';static isOpenProjectDoc=true;static isOpenOtherDoc=true;static getActiveTab(){return this.currentTabId;}static getContainerInfo(){return info;}static hasTabUnSaved(){return false;}static isTabUnSaved(){return false;}}
class Permission{constructor(){this._isConcurrentStrictMode=false;}get isConcurrentStrictMode(){return this._isConcurrentStrictMode;}set isConcurrentStrictMode(value){this._isConcurrentStrictMode=value;}getIframeDisableStatusPanelPcb(){return{disable:false};}}
globalThis.gVars={currentProject:{projectId:target.projectUuid,branchUuid:target.branchUuid,isV2Format:false},isHistoryMode:false,sessionStorageTabs:new Set(),urlCmd:null,globalVariableCookieData:{userInfo:${JSON.stringify(actor)}},loginedUserInfo:${JSON.stringify(actor)}};
globalThis.UI={gVars,tabBar:Tabs,concurrentDesign:new Permission()};
globalThis.domRoot={tagName:'DIV',ownerDocument:document,isConnected:true,children:[]};
domRoot.children=['commandWin','exitSmartSizeTool','exitPadShapeTool','project-blank-page','assembly-variant-page'].map(id=>({id,tagName:'DIV',ownerDocument:document,isConnected:true,parentElement:domRoot,getAttribute(){return null;}}));
globalThis.extraIframes=[];document.querySelectorAll=function(selector){if(selector==='[id="tabbar_bodies"]')return[domRoot];if(selector==='iframe')return extraIframes;return[];};
let clock=${scope.referenceUtcMs};Date.now=()=>clock++;
globalThis.eda=new Proxy({}, {get(){throw new Error('NO_EDA_ACCESS');}});globalThis.fetch=()=>{throw new Error('NO_NETWORK');};
${before}`, context, { timeout: 1000 });
  return structuredClone(runInContext(`(()=>{${buildCurrentAgedSqlRendererProgram(request)}})()`, context, { timeout: 5000 }) as unknown);
}
function reply(value: unknown): unknown { return { content: [], structuredContent: { ok: true, result: value } }; }

void test("current scratch compiler executes full scans before returning the unchanged generic controls wire shape", async () => {
  const metadata = await compileCurrentAgedSqlReferenceMetadata(mainRequest);
  const historical = buildMainReferenceProgram(mainRequest), program = buildCurrentAgedSqlReferenceProgram(mainRequest);
  assert.ok(new Script(program) instanceof Script);
  assert.equal(metadata.mainSha256, sha256Text(program)); assert.notEqual(metadata.mainSha256, sha256Text(historical));
  assert.match(program, /scanBefore=scan\(\),scanAfter=scan\(\)/u);
  assert.match(program, /return currentAgedControls.controlsAfter/u);
  assert.equal(program.indexOf("return currentAgedControls.controlsAfter") < program.indexOf("write('result.json'"), true);
  assert.equal(metadata.profile, "private.current-aged-sql-reference-program.v1");
  assert.equal(metadata.parserSource.sha256, "52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c");
  assert.doesNotMatch(program, /BrowserWindow|eval\(|executeJavaScript|require\(['"]\.\//u);
  // The metadata twin and serialized projections do not issue invocation rights.
  assert.throws(() => invokeMainReferenceTransport(metadata), /unissued/u);
  assert.throws(() => invokeMainReferenceTransport(structuredClone(metadata)), /unissued/u);
});
void test("loaded-project renderer controls preserve exact literal and reject forged result scope", () => {
  const envelope = renderer(), value = decodeCurrentAgedSqlRendererReply(reply(envelope), request);
  assert.equal(value.controlsBefore.sql[0]?.input, scope.createdAtLiteral);
  assert.equal(value.scanAfter.offsets.length, 1681); assert.equal(value.executionAuthorized, false);
  assert.throws(() => decodeCurrentAgedSqlRendererReply(reply(envelope), { ...request, scope: { ...scope, createdAtLiteral: "2026-01-16 12:34:56" } }));
});
void test("loaded-project renderer refuses hidden editor, changed project and actor before success", () => {
  for (const change of ["extraIframes.push({});", "gVars.currentProject.branchUuid='c'.repeat(32);",
    "gVars.loginedUserInfo.uuid='2'.repeat(32);", "location.href+='|extra';document.URL=location.href;",
    "const native=Date.prototype.getTimezoneOffset;Date.prototype.getTimezoneOffset=function(){gVars.currentProject.branchUuid='c'.repeat(32);return native.call(this);};"]) {
    assert.throws(() => renderer(change), /(?:CURRENT_AGED_SQL_RENDERER|CURRENT_AGED_SQL_CLOCK_CONTROLS|CLOCK_CONTROL_READ)_REFUSED/u);
  }
});
void test("exact before head uses original completed SQL reader and refuses locked or malformed dates", async () => {
  const data = await sqlFixture(), selected = { projectUuid: IDS.project, branchUuid: IDS.branch, ownerUuid: IDS.actor };
  await assert.rejects(selectCurrentUnlockedSqlHead(data.before, selected));
  mutate(data.path, `UPDATE "${HISTORY_TABLE}" SET is_lock=0,created_at='2026-01-15 12:34:56'`);
  const before = await inventory(data.path);
  assert.deepEqual(await selectCurrentUnlockedSqlHead(before, selected), { historyUuid: IDS.oldHead, createdAtLiteral: scope.createdAtLiteral });
  await assert.rejects(selectCurrentUnlockedSqlHead(structuredClone(before), selected));
  mutate(data.path, `UPDATE "${HISTORY_TABLE}" SET created_at='2026-02-30 12:34:56'`);
  await assert.rejects(selectCurrentUnlockedSqlHead(await inventory(data.path), selected));
});
void test("clock evidence sidecar cannot collide with baseline operation or select a path", () => {
  const id = currentSymbolClockEvidenceId("current-symbol-fixture");
  assert.match(id, /^current-clock-[a-f0-9]{64}$/u);
  assert.equal(id, currentSymbolClockEvidenceId("current-symbol-fixture"));
  assert.notEqual(id, currentSymbolClockEvidenceId("another-fixture"));
  assert.throws(() => currentSymbolClockEvidenceId("../outside"));
});
