/** Uninvoked local Inspector metadata for the selected worker source path. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CALLEE_ROLES as ROLES, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CALLEE_SOURCE as SOURCE, qualifyCurrentSchematicRelevanceModifyCmCalleeSource } from "../src/current-schematic-relevance-modify-cm-callee-source.ts";
import type { CurrentSchematicRelevanceModifyCmCalleeRole as Role } from "../src/current-schematic-relevance-modify-cm-callee-source.ts";
import { decodeCurrentSchematicRelevanceModifyCmCalleeFunction as decode, requireCurrentSchematicRelevanceModifyCmCalleeDescription as description } from "../src/current-schematic-relevance-modify-cm-callee-replies.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

const fixture = {
  "nodeConstructor": "class dT{static find(t,s){return t.last&&s(t.last)?t.last:t.list?t.list.find(s):null}static getPreLastNode(t){var s;return(s=t.list)!=null&&s.length?t.list[t.list.length-1]:null}static getFirstTicket(t){var s,r;if(!t)return 0;if(t.last.dataType===\"META\"){if(t.last.firstTicket!==void 0)return t.last.firstTicket;let i=t.last.ticket;if(t.list)for(let n=t.list.length-1;n>=0;--n){let a=t.list[n];if(a.firstTicket)return a.firstTicket;i=a.ticket}return i}else{let i=dT.getHead(t);return(r=(s=i==null?void 0:i.firstTicket)!=null?s:i==null?void 0:i.ticket)!=null?r:0}}static getHead(t){var s;return((s=t==null?void 0:t.list)==null?void 0:s[0])||t.last}static getPreNode(t,s){if(t.last===s)return t.list?t.list[t.list.length-1]:null;let r=t.list.findIndex(i=>i===s);return t.list[r-1]}static remove(t,s){var r;if(t.last===s)t.last=((r=t.list)==null?void 0:r.pop())||null;else if(t.list){let i=t.list.findIndex(n=>n===s);i>-1&&t.list.slice(i,1)}}static getLength(t){let s=0;return t&&(t.last&&(s+=1),t.list&&(s+=t.list.length)),s}static insert(t,s){if(!t.last){t.last=s;return}if(EE(t.last,s)){let n=t.last;t.last=s,s=n}if(!t.list){t.list=[s];return}let r=0,i=t.list.length;for(;r<i;){let n=Math.floor((r+i)/2);EE(t.list[n],s)?r=n+1:i=n}t.list.splice(r,0,s)}static preForEach(t,s){var r;if(!(!t.last||s(t.last,(r=t.list)!=null&&r.length?t.list[t.list.length-1]:void 0))&&t.list)for(let i=t.list.length-1;i>=0&&!s(t.list[i],i-1>=0?t.list[i-1]:void 0);--i);}static async awaitPreForEach(t,s){if(!t.last)return;let r,i=s(t.last,n=>r=n);if(r===void 0&&await i,!r&&t.list)for(let n=t.list.length-1;n>=0;--n){let a,o=s(t.list[n],c=>a=c);if(a===void 0&&await o,a)break}}}",
  "ticketCompare": "function EE(e,t){return e.ticket===t.ticket?e.client<t.client:e.ticket<t.ticket}"
} as const;

/** Create only fresh inert class/function definitions at their original UTF-16
 * locations. Parent constructors are stubs; none is invoked by this helper. */
function expression(role: Role, source: string): string {
  const row = SOURCE.roles[role];
  let prefix: string, suffix: string;
  if (row.kind === "class") {
    prefix = `(()=>{${row.parent === null ? "" : `const ${row.parent}=class{};`}const ${row.name}=`;
    suffix = `;return ${row.name};})()`;
  } else if (row.kind === "method") {
    prefix = "(()=>{class Inert{";
    suffix = `};return Inert${source.startsWith("static ") ? "" : ".prototype"}.${row.name};})()`;
  } else { prefix = "("; suffix = ")"; }
  assert.ok(row.sourceColumn >= prefix.length);
  return "\n".repeat(row.sourceLine) + " ".repeat(row.sourceColumn - prefix.length) + prefix + source + suffix;
}

/** Retain only metadata and compare the actual V8 description before decoding;
 * no selected source function or class constructor is called. */
async function inspect(session: Session, role: Role, source: string): Promise<void> {
  const actual = await session.post("Runtime.evaluate", { expression: expression(role, source), returnByValue: false });
  assert.equal(actual.exceptionDetails, undefined); assert.ok(actual.result.objectId !== undefined);
  assert.ok(typeof actual.result.description === "string"); description(actual.result.description, role);
  const reply = await session.post("Runtime.getProperties", { objectId: actual.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
  const location: unknown = reply.internalProperties?.find(value => value.name === "[[FunctionLocation]]")?.value?.value;
  assert.ok(location !== null && typeof location === "object");
  const scriptId: unknown = Reflect.get(location, "scriptId"); assert.ok(typeof scriptId === "string");
  const value = decode(reply, role, scriptId);
  assert.equal(value.originalConsistencyVerified, false); assert.equal(value.originalSheetVerified, false);
  assert.equal(value.callbackReceiverVerified, false); assert.equal(value.continuationAuthorized, false); assert.equal(value.workerCompleted, false);
  assert.equal(value.modifyCompleted, false); assert.equal(value.saveAuthorized, false);
  assert.throws(() => { decode(reply, role, "foreign"); });
  const rounded = structuredClone(reply); const at = rounded.internalProperties?.find(item => item.name === "[[FunctionLocation]]");
  assert.ok(at?.value?.value !== null && typeof at?.value?.value === "object"); Reflect.set(at.value.value, "columnNumber", SOURCE.roles[role].columnNumber + 1);
  assert.throws(() => { decode(rounded, role, scriptId); });
  if (role === "nodeConstructor") {
    assert.equal(reply.result.length, 13); assert.equal(Object.keys(value.staticMethods).length, 10);
    const missing = structuredClone(reply); missing.result = missing.result.filter(item => ["name", "length", "prototype"].includes(item.name));
    assert.equal(missing.result.length, 3);
    assert.throws(() => { decode(missing, role, scriptId); });
    const shadow = structuredClone(reply); const field = shadow.result.find(item => item.name === "find");
    assert.ok(field !== undefined); field.enumerable = true; assert.throws(() => { decode(shadow, role, scriptId); });
  }
  if (role === "ticketCompare") { assert.equal(reply.result.length, 5); assert.ok(value.prototype !== null); }
}

void test("actual default dT static roster and sloppy EE metadata refuse the old class shape and shifted points", async () => {
  const session = new Session(); session.connect();
  try { await session.post("Runtime.enable"); for (const role of ["nodeConstructor", "ticketCompare"] as const) { await inspect(session, role, fixture[role]); } }
  finally { session.disconnect(); }
});

void test("configured complete worker binds all30 original CM/Sheet functions without running their bodies", async context => {
  const source = await readConfiguredEasyedaAsset(SOURCE.relativePath);
  if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  qualifyCurrentSchematicRelevanceModifyCmCalleeSource(source);
  assert.throws(() => { qualifyCurrentSchematicRelevanceModifyCmCalleeSource(source.replace("At=class dT", "At=class xT")); });
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable");
    for (const role of ROLES) { const row = SOURCE.roles[role]; await inspect(session, role, source.slice(row.start, row.end)); }
  } finally { session.disconnect(); }
});
