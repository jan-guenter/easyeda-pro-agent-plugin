import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { sha256Json } from "../src/core.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import { materializeNativeHistory, materializeNativeHistoryCooperatively, parseNativeRecords } from "../src/native-history.ts";
import { verifyNativeAtomHeaderHistory } from "../src/native-atom-header-history.ts";

const CHECKPOINT = "a".repeat(64);
const DOCUMENT = "b".repeat(32);
const preserve = { libraryAtomHeaders: "preserve" } as const;

function row(header: Record<string, unknown>, body: unknown = {}): string {
  return `${JSON.stringify(header)}||${body === null ? "" : JSON.stringify(body)}|\n`;
}
function head(docType = "SYMBOL", ticket = 1, client: string | undefined = "owner", documentUuid = DOCUMENT): string {
  return row({ type: "DOCHEAD", ticket }, { uuid: documentUuid, docType, ...(client === undefined ? {} : { client }) });
}
function atom(ticket: number, firstTicket: number | undefined, body: unknown = {}, additions: Record<string, unknown> = {}): string {
  return row({ type: "PIN", id: "pin", ticket, ...(firstTicket === undefined ? {} : { firstTicket }), ...additions }, body);
}
function history(chunks: readonly string[]): ReturnType<typeof materializeNativeHistory> {
  return materializeNativeHistory(chunks, CHECKPOINT, preserve);
}

// Exact project-worker.js SHA2792c6c87e3c60e09c43f03494a9cbb24e4ebe9c385372bbaf877ed75083a949.
// UTF-16 source offsets: Qe241789, parseFull238798, pE254436 and framing238153.
// These native bodies are replayed against synthetic data only. The framing
// Helper is copied too, so forwarding is not an invented test implementation.
const workerFraming = 'function Bu(e,t,s){return e.slice(t,s)}function Co(e,t,s,r){let i=e.length,n=0;for(;n<i;){let a=e.indexOf(`|\n`,n);if(a<0){if(s)return e.substring(n);a=i}let o=Bu(e,n,a);try{if(o){let c=o.indexOf("||"),l=c>-1,u=l?Bu(o,0,c):o,h=l?Bu(o,c+2):"";if(t(u,h,o,l?n+c+2:n)===!1){o=null;break}o=null}}catch(c){if(console.error(c),r)throw new Error((c==null?void 0:c.message)||"\\u89E3\\u6790\\u5931\\u8D25\\uFF01")}n=a+2}e=null}';
const workerParse = 'parseFull(e,t,s){let r=t,i=s,n,a=null;Co(e,(o,c,l)=>{let u=JSON.parse(o);if(u.type==="EDIT_HEAD")a=JSON.parse(c),this.onEditHead&&this.onEditHead(a);else if(u.type==="DOCHEAD"){let h=JSON.parse(c);i=h.docType,r=h.uuid,n=h.client,h.ticket=u.ticket,this.onDocHead(h,a,l)}else this.onLine(u.id,u.ticket,c,u.type,u.client||n,i,r,u.firstTicket,u.pend,a,u.num,l)},void 0,this.throwError),this.onEnd(),e=null}';
// oxlint-disable-next-line eslint/no-template-curly-in-string -- Preserve the exact pinned function source for VM replay.
const workerSerialize = 'function Qe(e,t,s,r,i,n,a,o){if(r==null)throw new Error(`getAtomDataStr: \\u6570\\u636E\\u65E0\\u6548, dataType=${e}, ticket=${t}, id=${s}, data=${r}`);let c={type:e,ticket:t,id:s};return n!==void 0&&(c.firstTicket=n),a!==void 0&&(c.pend=a),o!==void 0&&(c.num=o),i&&(c.client=i),`${JSON.stringify(c)}||${r}`}';
const workerClock = 'function pE(e,t){return e.ticket===t.ticket?e.client<t.client:e.ticket<t.ticket}var It=class aT{static find(t,s){return t.last&&s(t.last)?t.last:t.list?t.list.find(s):null}static getPreLastNode(t){var s;return(s=t.list)!=null&&s.length?t.list[t.list.length-1]:null}static getFirstTicket(t){var s,r;if(!t)return 0;if(t.last.dataType==="META"){if(t.last.firstTicket!==void 0)return t.last.firstTicket;let i=t.last.ticket;if(t.list)for(let n=t.list.length-1;n>=0;--n){let a=t.list[n];if(a.firstTicket)return a.firstTicket;i=a.ticket}return i}else{let i=aT.getHead(t);return(r=(s=i==null?void 0:i.firstTicket)!=null?s:i==null?void 0:i.ticket)!=null?r:0}}static getHead(t){var s;return((s=t==null?void 0:t.list)==null?void 0:s[0])||t.last}static getPreNode(t,s){if(t.last===s)return t.list?t.list[t.list.length-1]:null;let r=t.list.findIndex(i=>i===s);return t.list[r-1]}static remove(t,s){var r;if(t.last===s)t.last=((r=t.list)==null?void 0:r.pop())||null;else if(t.list){let i=t.list.findIndex(n=>n===s);i>-1&&t.list.slice(i,1)}}static getLength(t){let s=0;return t&&(t.last&&(s+=1),t.list&&(s+=t.list.length)),s}static insert(t,s){if(!t.last){t.last=s;return}if(pE(t.last,s)){let n=t.last;t.last=s,s=n}if(!t.list){t.list=[s];return}let r=0,i=t.list.length;for(;r<i;){let n=Math.floor((r+i)/2);pE(t.list[n],s)?r=n+1:i=n}t.list.splice(r,0,s)}static preForEach(t,s){var r;if(!(!t.last||s(t.last,(r=t.list)!=null&&r.length?t.list[t.list.length-1]:void 0))&&t.list)for(let i=t.list.length-1;i>=0&&!s(t.list[i],i-1>=0?t.list[i-1]:void 0);--i);}static async awaitPreForEach(t,s){if(!t.last)return;let r,i=s(t.last,n=>r=n);if(r===void 0&&await i,!r&&t.list)for(let n=t.list.length-1;n>=0;--n){let a,o=s(t.list[n],c=>a=c);if(a===void 0&&await o,a)break}}}';

void test("pinned serializer and parser forward omitted, positive and zero firstTicket including empty tombstones", () => {
  const calls: unknown[][] = [];
  const scope = { calls, console: { error: (): never => assert.fail("Pinned parser swallowed an unexpected error.") } };
  const output: unknown = runInNewContext(`${workerFraming};${workerSerialize};
    const parser={throwError:true,${workerParse},onDocHead(){},onEnd(){},onLine(...args){calls.push(args)}};
    const prefix=${JSON.stringify(head())};
    const rows=[Qe('PIN',459,'positive','{"x":1}',undefined,6),Qe('ATTR',459,'zero','{}',undefined,0),Qe('LINE',456,'deleted','',undefined,454),Qe('PIN',500,'absent','{}','explicit')];
    parser.parseFull(prefix+rows.join('|\\n')+'|\\n');rows;`, scope);
  assert.ok(Array.isArray(output));
  assert.deepEqual(calls.map((args) => [args[0], args[1], args[2], args[4], args[5], args[6], args[7]]), [
    ["positive", 459, '{"x":1}', "owner", "SYMBOL", DOCUMENT, 6],
    ["zero", 459, "{}", "owner", "SYMBOL", DOCUMENT, 0],
    ["deleted", 456, "", "owner", "SYMBOL", DOCUMENT, 454],
    ["absent", 500, "{}", "explicit", "SYMBOL", DOCUMENT, undefined],
  ]);
  const snapshot = history([`${head()}${output.join("|\n")}|\n`])[0];
  assert.ok(snapshot?.atomHeaderHistory);
  assert.equal(snapshot.records.some((entry) => entry.id === "deleted"), false);
  assert.deepEqual(snapshot.atomHeaderHistory.occurrences.map((entry) => [entry.id, entry.serializedFirstTicket, entry.tombstone]), [
    ["positive", 6, false], ["zero", 0, false], ["deleted", 454, true], ["absent", undefined, false],
  ]);
});

void test("pinned physical head, first serialization and cold zero semantics remain distinct", () => {
  const result: unknown = runInNewContext(`${workerClock};
    const evaluate=(nodes)=>{const tree={};for(const node of nodes)It.insert(tree,node);const head=It.getHead(tree);return {first:It.getFirstTicket(tree),headTicket:head.ticket,headClient:head.client,latest:tree.last.ticket,cold:head.firstTicket||head.ticket}};
    [evaluate([{ticket:459,client:'a',firstTicket:6,dataType:'PIN'}]),
     evaluate([{ticket:459,client:'a',firstTicket:6,dataType:'ATTR'},{ticket:100,client:'a',dataType:'ATTR'}]),
     evaluate([{ticket:459,client:'a',firstTicket:0,dataType:'ATTR'}]),
     evaluate([{ticket:100,client:'a',firstTicket:6,dataType:'META'},{ticket:459,client:'a',firstTicket:42,dataType:'META'}]),
     evaluate([{ticket:456,client:'a',firstTicket:454,dataType:'LINE',data:''},{ticket:500,client:'a',dataType:'LINE',data:'{}'}]),
     evaluate([{ticket:459,client:'z',firstTicket:6,dataType:'PIN'},{ticket:459,client:'a',firstTicket:9,dataType:'PIN'}])];`);
  assert.deepEqual(structuredClone(result), [
    { first: 6, headTicket: 459, headClient: "a", latest: 459, cold: 6 },
    { first: 100, headTicket: 100, headClient: "a", latest: 459, cold: 100 },
    { first: 0, headTicket: 459, headClient: "a", latest: 459, cold: 459 },
    { first: 42, headTicket: 100, headClient: "a", latest: 459, cold: 6 },
    { first: 454, headTicket: 456, headClient: "a", latest: 500, cold: 454 },
    { first: 9, headTicket: 459, headClient: "a", latest: 459, cold: 9 },
  ]);
});

void test("new headers remain unavailable to default materializers and live source parsing", async () => {
  const text = head() + atom(9, 0);
  assert.throws(() => parseNativeRecords(text), /record-invalid/u);
  assert.throws(() => parseDocumentSource(text), /record-invalid/u);
  assert.throws(() => materializeNativeHistory([text], CHECKPOINT), /record-invalid/u);
  await assert.rejects(materializeNativeHistoryCooperatively([text], CHECKPOINT), /record-invalid/u);
  assert.throws(() => materializeNativeHistory([text], undefined, preserve), /atom-header-profile/u);
  assert.equal(history([text])[0]?.records[0]?.ticket, 9);
});

void test("effective document ownership never leaks from a previous chunk or DOCHEAD", () => {
  for (const type of ["SCH_PAGE", "PCB", "DEVICE", "BLOB", "BOARD", "PANEL_LIB"]) {
    assert.throws(() => history([head(type) + atom(9, 1)]), /atom-header-profile/u);
    assert.throws(() => history([head() + atom(9, 1), head(type, 2, "owner", "c".repeat(32)) + atom(9, 1)]), /atom-header-profile/u);
  }
  assert.throws(() => history([head() + atom(9, 1), atom(10, 1)]), /record-invalid/u);
  assert.throws(() => history([row({ type: "DOCHEAD", ticket: 1 }, { uuid: DOCUMENT }) + atom(9, 1)]), /record-invalid/u);
  for (const type of ["EDIT_HEAD", "DOCHEAD", "META", "DELETE_DOC"]) {
    assert.throws(() => history([head() + row({ type, id: type, ticket: 9, firstTicket: 1 }, {})]), /record-invalid/u);
  }
  assert.throws(() => history([head() + atom(9, 1, {}, { id: "DELETE_DOC" })]), /record-invalid|delete-document/u);
});

void test("all earlier physical clocks still reject contradictions after replacement or tombstone", () => {
  const initial = head() + atom(9, 1, { x: 1 });
  const latest = head("SYMBOL", 2) + atom(90, 1, { x: 90 });
  for (const conflicting of [atom(9, 2, { x: 1 }), atom(9, undefined, { x: 1 }), atom(9, 1, { x: 2 }), atom(9, 1, null), atom(9, 1, { x: 1 }, { type: "LINE" })]) {
    assert.throws(() => history([initial, latest, head("SYMBOL", 3) + conflicting]), /record-ticket-conflict/u);
    assert.throws(() => history([latest, initial, head("SYMBOL", 3) + conflicting]), /record-ticket-conflict/u);
  }
  const repeated = history([initial, latest, initial])[0];
  assert.equal(repeated?.records[0]?.body["x"], 90);
  assert.equal(repeated?.atomHeaderHistory?.occurrences.length, 3);
});

void test("explicit and inherited client provenance remains distinct without inventing an original owner", () => {
  const inherited = atom(9, 1, { x: 1 });
  const explicit = atom(9, 1, { x: 1 }, { client: "owner" });
  const nullInherited = atom(9, 1, { x: 1 }, { client: null });
  const absentHead = row({ type: "DOCHEAD", ticket: 1 }, { uuid: DOCUMENT, docType: "SYMBOL" });
  const document = history([head() + inherited + explicit + nullInherited])[0];
  const occurrences = document?.atomHeaderHistory?.occurrences;
  assert.ok(occurrences);
  assert.deepEqual(occurrences.map((entry) => [entry.client, entry.clientSource]), [["owner", "inherited"], ["owner", "explicit"], ["owner", "inherited"]]);
  assert.equal(new Set(occurrences.map((entry) => entry.headerSha256)).size, 3);
  assert.equal(history([absentHead + inherited])[0]?.atomHeaderHistory?.occurrences[0]?.clientSource, "missing");
  assert.throws(() => history([absentHead + inherited, head("SYMBOL", 2) + atom(90, 1), head("SYMBOL", 3) + explicit]), /record-client-conflict/u);
});

void test("complete parse errors precede stale clock conflicts and unsupported document application", async () => {
  const malformed = '{"type":"PIN","id":"later","ticket":11}||{"x":1,"\\u0078":2}|\n';
  const conflict = head() + atom(9, 1, { x: 1 }) + atom(90, 1) + atom(9, 1, { x: 2 });
  for (const text of [conflict + malformed, head("SCH_PAGE") + atom(9, 1) + malformed,
    row({ type: "DOCHEAD", ticket: 1 }, { uuid: DOCUMENT }) + atom(9, 1) + malformed]) {
    assert.throws(() => history([text]), /\(record-invalid\)/u);
    await assert.rejects(materializeNativeHistoryCooperatively([text], CHECKPOINT, preserve), /\(record-invalid\)/u);
  }
});

void test("noncanonical first clocks cannot be coerced, merged or erased through JSON normalization", () => {
  for (const encoded of ['"1"', "null", "true", "-1", "0.5", "9007199254740992", "10", "-0"]) {
    assert.throws(() => history([`${head()}{"type":"PIN","id":"pin","ticket":9,"firstTicket":${encoded}}||{}|\n`]), /record-invalid/u);
  }
  for (const extra of ['"firstTicket":1,"firstTicket":1', String.raw`"firstTicket":1,"first\u0054icket":1`, '"firstTicket":1,"num":0', '"firstTicket":1,"pend":false']) {
    assert.throws(() => history([`${head()}{"type":"PIN","id":"pin","ticket":9,${extra}}||{}|\n`]), /record-invalid/u);
  }
  assert.throws(() => history([`${head()}{"type":"PIN","id":"pin","ticket":9,"firstTicket":1}||{"nested":{"constructor":{}}}|\n`]), /record-invalid/u);
});

void test("raw header encoding and every position are committed without changing body semantics", () => {
  const ordinary = atom(9, 1);
  const respaced = ordinary.replace('{"type"', '{ "type"');
  const first = history([head() + ordinary])[0], second = history([head() + respaced])[0];
  assert.ok(first?.atomHeaderHistory && second?.atomHeaderHistory);
  assert.equal(first.semanticSha256, second.semanticSha256);
  assert.notEqual(first.atomHeaderHistory.sha256, second.atomHeaderHistory.sha256);
  const rawHeader = ordinary.slice(0, ordinary.indexOf("||"));
  assert.equal(first.atomHeaderHistory.occurrences[0]?.headerSha256, createHash("sha256").update(rawHeader).digest("hex"));
  const binding = { checkpointSha256: CHECKPOINT, documentUuid: DOCUMENT, docType: "SYMBOL" } as const;
  assert.deepEqual(verifyNativeAtomHeaderHistory(first.atomHeaderHistory, binding), first.atomHeaderHistory);
  for (const changed of [{ ...binding, checkpointSha256: "d".repeat(64) }, { ...binding, documentUuid: "d".repeat(32) }, { ...binding, docType: "FOOTPRINT" as const }]) {
    assert.throws(() => verifyNativeAtomHeaderHistory(first.atomHeaderHistory, changed), /provenance/u);
  }
  for (const mutation of [{ recordIndex: 2 }, { chunkIndex: 1 }, { clientSource: "explicit" }, { serializedFirstTicket: 0 }, { tombstone: true }, { bodySha256: null }]) {
    const proof = structuredClone(first.atomHeaderHistory);
    Object.assign(proof.occurrences[0] ?? assert.fail("Missing occurrence."), mutation);
    assert.throws(() => verifyNativeAtomHeaderHistory(proof, binding), /provenance/u);
  }
  const truncated = { ...first.atomHeaderHistory, occurrences: [] };
  assert.throws(() => verifyNativeAtomHeaderHistory(truncated, binding), /provenance/u);
});

void test("raw body commitment retains signed zero and spacing even when canonical semantic hashes agree", () => {
  const prefix = `${head()}{"type":"PIN","id":"pin","ticket":9,"firstTicket":1}||`;
  const zero = history([`${prefix}{"x":0}|\n`])[0];
  const negative = history([`${prefix}{"x":-0}|\n`])[0];
  const spaced = history([`${prefix}{ "x":0}|\n`])[0];
  assert.ok(zero?.atomHeaderHistory && negative?.atomHeaderHistory && spaced?.atomHeaderHistory);
  assert.equal(zero.semanticSha256, negative.semanticSha256);
  assert.equal(zero.semanticSha256, spaced.semanticSha256);
  assert.equal(Object.is(negative.records[0]?.body["x"], -0), true);
  assert.equal(new Set([zero, negative, spaced].map((entry) => entry.atomHeaderHistory?.sha256)).size, 3);
});

void test("offline provenance validation cannot execute accessors or erase undefined field presence", () => {
  const proof = history([head() + atom(9, 1)])[0]?.atomHeaderHistory; assert.ok(proof);
  const binding = { checkpointSha256: CHECKPOINT, documentUuid: DOCUMENT, docType: "SYMBOL" } as const;
  const accessor = structuredClone(proof);
  Object.defineProperty(accessor, "occurrences", { enumerable: true, get: (): never => assert.fail("Untrusted provenance accessor executed.") });
  assert.throws(() => verifyNativeAtomHeaderHistory(accessor, binding), /provenance/u);
  const undefinedField = structuredClone(proof); assert.ok(undefinedField.occurrences[0]);
  Reflect.set(undefinedField.occurrences[0], "serializedFirstTicket", undefined);
  assert.throws(() => verifyNativeAtomHeaderHistory(undefinedField, binding), /provenance/u);
  const nestedAccessor = structuredClone(proof); assert.ok(nestedAccessor.occurrences[0]);
  Object.defineProperty(nestedAccessor.occurrences[0], "ticket", { enumerable: true, get: (): never => assert.fail("Untrusted atom accessor executed.") });
  assert.throws(() => verifyNativeAtomHeaderHistory(nestedAccessor, binding), /provenance/u);
});

void test("opt-in leaves legacy no-field snapshots and schematic first clocks byte-identical", async () => {
  const chunks = [head() + atom(9, undefined, { x: 1 }) + head("SCH_PAGE", 1, "owner", "c".repeat(32))
    + row({ type: "ATTR", id: "attr", ticket: 0 }, { value: "zero physical clock" }),
  head("SYMBOL", 2) + atom(90, undefined, { x: 90 })];
  const expected = materializeNativeHistory(chunks, CHECKPOINT);
  assert.deepEqual(history(chunks), expected);
  assert.deepEqual(await materializeNativeHistoryCooperatively(chunks, CHECKPOINT, preserve), expected);
  assert.ok(expected.every((entry) => !Object.hasOwn(entry, "atomHeaderHistory")));
  assert.equal(expected.find((entry) => entry.docType === "SCH_PAGE")?.records[0]?.firstTicket, 0);
  assert.equal(sha256Json(history(chunks)), sha256Json(expected));
});
