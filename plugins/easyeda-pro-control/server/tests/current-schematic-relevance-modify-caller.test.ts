/** Unchanged pinned worker fragments run on inert CM/receiver data. This
 * regression proves argument forwarding, not ownership or a native writer. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createContext, runInContext } from "node:vm";
import { test } from "node:test";
import { z } from "zod";
import { requireCurrentSchematicRelevanceModifyStructureCaller } from "../src/current-schematic-relevance-modify-structure-replies.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_STRUCTURE_PROGRAMS as P } from "../src/current-schematic-relevance-modify-structure-programs.ts";

const expected = Object.freeze({ compare: "2a5df3ce89bef23f3e7ac860f67c4468dfc72550a8690a29d074f21b1324506d", list: "a4edd5321a0ce2303a0812a725c5edaf326aff29ed97567db95e71f5834e95c4", remoteChange: "f11159ef785df5c8474c957458af4e69140ece319c74f266e8ac09041b95a527", getDoctype: "d714abd071114989218f99fe4a7232f9aec8d03a9291bbd7ae2346339611df8d", setDoctype: "4f6225761c5db83104b08188553e43a3590a807272eaf84dc4550206e1e5331a", publishChange: "aa8e7d3b416f74314dd922d620f1f3728ec386e9f503d28987f9498bd9636877", onChange: "44bfca1afed5a3f24c30767ac3b7a0235fc8fd92808eb604564f98cee1424c9e" });
const fragment = z.strictObject({ role: z.enum(["compare", "list", "remoteChange", "getDoctype", "setDoctype", "publishChange", "onChange"]), start: z.number().int(), end: z.number().int(), bytes: z.number().int(), sha256: z.string(), text: z.string() });
const fixture = z.strictObject({ profile: z.literal("source-only.current209-schematic-modify-caller-excerpts.v1"), sourceSha256: z.literal("0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046"), segments: z.array(fragment).length(7) });

void test("actual existing-TEXT remoteChange and publishChange forward false/TEXT into the original onChange suppression caller", async () => {
  const raw: unknown = JSON.parse(await readFile(new URL("fixtures/current209-schematic-modify-caller-excerpts.json", import.meta.url), "utf8"));
  const source = fixture.parse(raw); const selected: Partial<Record<keyof typeof expected, string>> = {};
  for (const row of source.segments) {
    assert.equal(row.end - row.start, row.text.length); assert.equal(Buffer.byteLength(row.text), row.bytes);
    const sha = createHash("sha256").update(row.text).digest("hex"); assert.equal(sha, row.sha256); assert.equal(sha, expected[row.role]);
    assert.equal(selected[row.role], undefined); selected[row.role] = row.text;
  }
  const context = createContext({ fragments: selected, proof: P.caller });
  const actual: unknown = runInContext(`(()=>{
    "use strict";
    const EE=eval('('+fragments.compare+')'),At=eval('('+fragments.list+')');
    const method=(name)=>Object.getOwnPropertyDescriptor(eval('({'+fragments[name]+'})'),name).value;
    let observed=null,sheetCalls=0;const order=[];
    const ve={BLOB:'BLOB',BOARD:'BOARD',CONFIG:'CONFIG',DEVICE:'DEVICE',FONT:'FONT',FOOTPRINT:'FOOTPRINT',INSTANCE:'INSTANCE',PANEL:'PANEL',PCB:'PCB',SCH:'SCH',SCH_PAGE:'SCH_PAGE'},De={META:'META'};
    const prior={client:'client',ticket:1,dataType:'TEXT',data:'before'},node={last:prior};
    const cm={maxTicket:1,docHead:{page:{docType:'SCH_PAGE'}},caseInsensitiveTypes:new Set(['NET','RULE_SELECTOR']),uniqueIds:{},wDocData:new Map([['page',new Map([['text',node]])]]),getCache:false,cacheType:['META'],needDocIdDoctype:['SCH_PAGE'],
      getUnique(){return'unique';},getIsLocalChange(){return true;},getIsPendChange(){throw Error('excluded pend branch');},setMaxTicket(value){this.maxTicket=Math.max(this.maxTicket,value);},setDocMaxTicket(){},
      orderTree:{has(){return true;},setOrderNum(){throw Error('unchanged first-ticket branch');}},docIds:{setOrderNum(){throw Error('excluded META branch');}},safeString(){throw Error('excluded non-pend branch');},syncPadNet(){throw Error('excluded PAD_NET branch');}};
    cm.getDoctype=method('getDoctype');cm.setDoctype=method('setDoctype');cm.publishChange=method('publishChange');cm.remoteChange=method('remoteChange');
    const project={uuid:'a'.repeat(64),consistencyManager:cm,sheet:{onDataChange(){sheetCalls++;}},uploadStructure(type,command,pend){order.push([type,command,pend]);},localPublishTicket(){order.push('ticket');},canWsPublish(){order.push('ws');return false;}};
    const onChange=(function(){return eval('('+fragments.onChange+')');}).call(project);
    cm.cbArr=[(...args)=>{observed=args;return onChange(...args);}];
    cm.remoteChange(7,'client','page','text','after','TEXT','SCH_PAGE',undefined,undefined,true,undefined,'unique');
    if(observed===null||sheetCalls!==1||node.last.ticket!==7||node.list.length!==1||node.list[0]!==prior)throw Error('original source forwarding not reached');
    const frame=[project,...observed,'SCH_PAGE'],packet=[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis];
    const projected=Reflect.apply(eval('('+proof+')'),packet,[frame,project,[project,'SCH_PAGE','TEXT',true,ve,De]]);
    const wrong=frame.slice();wrong[10]=undefined;wrong[13]=undefined;let refused=false;try{Reflect.apply(eval('('+proof+')'),packet,[wrong,project,[project,'SCH_PAGE','TEXT',true,ve,De]]);}catch{refused=true;}
    return JSON.stringify({projected,duplicateTicket:observed[9],previousType:observed[12],order,refused});
  })()`, context);
  assert.ok(typeof actual === "string");
  const parsed: unknown = JSON.parse(actual);
  const data = z.strictObject({ projected: z.array(z.unknown()), duplicateTicket: z.literal(false), previousType: z.literal("TEXT"), order: z.array(z.unknown()), refused: z.literal(true) }).parse(parsed);
  const payload = ["bus", "/pro-mgr/worker/batchPendData", "page", "page", "text", 7, "after", "client", "unique", "channel", "TEXT", "SCH_PAGE"] as const;
  requireCurrentSchematicRelevanceModifyStructureCaller(data.projected, payload, "a".repeat(64));
  assert.throws(() => { requireCurrentSchematicRelevanceModifyStructureCaller(data.projected, payload, "b".repeat(64)); });
  assert.throws(() => { requireCurrentSchematicRelevanceModifyStructureCaller([...data.projected.slice(0, 9), "channel"], payload, "a".repeat(64)); });
  assert.deepEqual(parsed, { projected: ["page", "text", "after", "TEXT", "client", 7, true, "unique", "SCH_PAGE", "a".repeat(64)], duplicateTicket: false, previousType: "TEXT", order: [["SCH_PAGE", "TEXT", true], "ticket", "ws"], refused: true });
});
