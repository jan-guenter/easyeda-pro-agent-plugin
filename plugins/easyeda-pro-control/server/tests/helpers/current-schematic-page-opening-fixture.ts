import { createContext, runInContext } from "node:vm";
import { sha256Text } from "../../src/core.ts";
import { buildCurrentSchematicPageOpeningProgram } from "../../src/current-schematic-page-opening-program.ts";
import { currentSchematicPageOpeningResultSchema } from "../../src/current-schematic-page-opening.ts";
import { decodeExactReadEnvelope } from "../../src/exact-readers.ts";

const rawWindowsPath = String.raw`C:\Fixtures\ordinary-page.eprj2`;
export const schematicOpeningTarget = { rawWindowsPath, projectUuid: sha256Text(rawWindowsPath), branchUuid: "b".repeat(32),
  documentUuid: "d".repeat(16), schematicUuid: "a".repeat(16), expectedSourceSha256: "e".repeat(64) };

export function currentSchematicPageOpeningFixture(options: { before?: string; afterRegistry?: string; openBody?: string } = {}): {
  run: (phase: "preflight" | "open", windowTabId?: string) => Promise<ReturnType<typeof currentSchematicPageOpeningResultSchema.parse>>;
  evaluate: (source: string) => unknown;
} {
  const context = createContext({ TextEncoder });
  runInContext(`globalThis.window=globalThis;globalThis.top=globalThis;globalThis.target=${JSON.stringify(schematicOpeningTarget)};
globalThis.tabId=target.documentUuid+"@"+target.projectUuid;
globalThis.location={href:"https://client/editor?cll=warn#id="+target.projectUuid,origin:"https://client"};
globalThis.frames=[];globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href,querySelectorAll(selector){if(selector!=="iframe")throw new Error("QUERY");return frames;}};
globalThis.PRO_EDITOR_MODE="CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM";globalThis._TAB_ID_="original-window";
globalThis.start={tabId:"tab_page1",data:{doctype:-1},isAbleDelete:false,group:"start_blank",draggable:true,isDisplayNone:false};
globalThis.info={id:"editor-window-main",belong:"editor-window-main",tabs:[start],activeTabId:"tab_page1"};
class Tabs{static containerIds=["editor-window-main"];static containerTree={id:"editor-window-main"};static belongContainer="editor-window-main";static currentTabId="tab_page1";static getActiveTab(){return this.currentTabId;}static getContainerInfo(id){return id===info.id?info:null;}static getTabById(id){return info.tabs.find(t=>t.tabId===id)??null;}}
globalThis.registryCalls=0;globalThis.documentCalls=0;globalThis.registration={[target.projectUuid]:{path:target.rawWindowsPath,isCbb:false}};
class Registry{async rpcCall(topic,args,timeout){if(this!==gVars.messageBus||topic!=="/pro-mgr/api/client/getProjectPaths"||Object.keys(args).length||timeout!==0)throw new Error("REGISTRY");registryCalls++;await Promise.resolve();${options.afterRegistry ?? ""}return{message:{success:true,result:registration}};}}
class Api{async rpcCall(topic,args){if(this!==gVars.extensionApiMessageBus2||arguments.length!==2||topic!=="extensionApi.DMT_EditorControl.openDocument"||Reflect.ownKeys(args).length!==2||args.documentUuid!==target.documentUuid||!Object.hasOwn(args,"splitScreenId")||args.splitScreenId!==undefined)throw new Error("OPEN");documentCalls++;await Promise.resolve();${options.openBody ?? "opened();return tabId;"}}}
globalThis.gVars={currentProject:{projectId:target.projectUuid,branchUuid:target.branchUuid,isV2Format:false},isHistoryMode:false,messageBus:new Registry(),extensionApiMessageBus2:new Api()};
globalThis._MSG_BUS2_EXTAPI_=gVars.extensionApiMessageBus2;globalThis.UI={gVars,tabBar:Tabs};
globalThis.opened=()=>{info.tabs.push({tabId,data:{doctype:1,pid:target.projectUuid},parentProjectUuid:target.projectUuid});info.activeTabId=tabId;Tabs.currentTabId=tabId;location.href=location.href.split("#")[0]+"#id="+target.projectUuid+",tab=*"+tabId;document.URL=location.href;};
${options.before ?? ""}`, context, { timeout: 1000 });
  return {
    run: async (phase, windowTabId) => {
      const raw: unknown = await (runInContext(`(async function(){${buildCurrentSchematicPageOpeningProgram(schematicOpeningTarget, phase, windowTabId)}})()`, context, { timeout: 1000 }) as unknown);
      return currentSchematicPageOpeningResultSchema.parse(decodeExactReadEnvelope(structuredClone(raw)));
    },
    evaluate: source => runInContext(source, context, { timeout: 1000 }) as unknown,
  };
}
