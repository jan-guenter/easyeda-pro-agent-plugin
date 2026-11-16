/** Inert regressions for the exact reviewed support programs. No native
 * owner, original SQL capture, task dispatcher or invocation is constructed. */
import assert from "node:assert/strict";
import {test} from "node:test";
import {Script} from "node:vm";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_BODY_PROGRAMS as BODY} from "../src/current-footprint-inverse-native-delete-main-body-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_READS as READS,currentFootprintInverseNativeDeleteMainReadCases} from "../src/current-footprint-inverse-native-delete-main-read-protocol.ts";
import {currentFootprintInverseNativeReferenceNextDependenciesNativeSource} from "../src/current-footprint-inverse-native-reference-next-dependencies-native.ts";
import {CURRENT_FOOTPRINT_MUTATION_PUBLICATION_DATA_LIMITS as LIMITS,CURRENT_FOOTPRINT_MUTATION_PUBLICATION_PROJECTION as PROJECTION} from "../src/current-footprint-mutation-publication-data.ts";

void test("actual byte helper accepts byte views and rejects wider or forged inherited byteLength views", () => {
  const source=BODY.capture.program;const end=source.indexOf("\nconst capture=");assert.ok(end>0);
  // Run the actual helper prefix; the proxy predicate is an inert stand-in.
  // Full SQL/request/owner qualification is deliberately outside this unit.
  const convert:unknown=new Script(`(()=>{${source.slice(source.indexOf("{")+1,end)}return value=>bytes(value,{proxy:()=>false});})()`).runInNewContext({});
  assert.equal(typeof convert,"function");if(typeof convert!=="function"){assert.fail("fixed byte helper missing");}
  assert.equal(Reflect.apply(convert,null,[new Uint8Array(17)]),"00".repeat(17));
  assert.equal(Reflect.apply(convert,null,[Buffer.alloc(17,255)]),"ff".repeat(17));
  assert.throws(()=>Reflect.apply(convert,null,[new Uint16Array(17)]));
  assert.throws(()=>Reflect.apply(convert,null,[new DataView(new ArrayBuffer(17))]));
  let getters=0;class Forged extends Uint16Array {}
  Object.defineProperty(Forged.prototype,"byteLength",{get():number{getters+=1;return 17;},configurable:true});
  assert.throws(()=>Reflect.apply(convert,null,[new Forged(17)]));assert.equal(getters,0);
});

void test("main read budgets include both the held step and original driver step", () => {
  const cases=currentFootprintInverseNativeDeleteMainReadCases();
  for(const kind of ["branch","history","body"] as const){
    const normal=cases.filter(command=>command.kind===kind&&!command.phase.endsWith("-remove")&&!command.phase.endsWith("-release"));
    assert.equal(normal.filter(command=>command.phase.endsWith("-driver-step")).length,1);
    assert.equal(normal.length,READS[kind].normal);
  }
  assert.deepEqual([READS.branch.normal,READS.history.normal,READS.body.normal],[9,12,9]);
});

void test("emitted dependency sender rejects a foreign held query kind before message construction and ledger mutation", () => {
  const source=currentFootprintInverseNativeReferenceNextDependenciesNativeSource();
  const start=source.indexOf("public void SendFootprintInverseNativeReferenceNextDependenciesCore(");assert.ok(start!==-1);
  const body=source.slice(start,source.indexOf("public static void VerifyFootprintInverseNativeReferenceNextDependenciesCodec",start));
  const guard=body.indexOf('fields["queryKind"] as string!=nrsKind');assert.ok(guard!==-1);
  for(const later of ["string text=FootprintInverseNativeReferenceNextDependenciesMessage(","++nrdCalls","++nrdProperties","++nrdHelpers","SendMessage(id,text)"]){assert.ok(body.indexOf(later)>guard);}
});

void test("actual fixed parser refuses expanded EDIT_HEAD duplication before multi-gigabyte trace serialization", () => {
  const edit=`{"type":"EDIT_HEAD"}||${JSON.stringify({uuid:"editor",padding:"x".repeat(524_288)})}`;
  const header=`{"type":"DOCHEAD","ticket":22}||${JSON.stringify({docType:"FOOTPRINT",uuid:"c".repeat(16),client:"d".repeat(16)})}`;
  const lines=Array.from({length:10_000},(_,index)=>`${JSON.stringify({type:"LINE",ticket:22,id:`line_${String(index)}`})}||[]`);
  const positive:unknown=new Script(PROJECTION).runInNewContext({payload:JSON.stringify([[edit,header,lines[0]].join("|\n")])},{timeout:1000,contextCodeGeneration:{strings:false,wasm:false}});
  assert.equal(typeof positive,"string");
  const body=[edit,header,...lines].join("|\n");assert.ok(Buffer.byteLength(body)<LIMITS.utf8Bytes);
  assert.throws(()=>new Script(PROJECTION).runInNewContext({payload:JSON.stringify([body])},{timeout:1000,contextCodeGeneration:{strings:false,wasm:false}}),/MUTATION_BODY_PROJECTION_BOUND/u);
});
