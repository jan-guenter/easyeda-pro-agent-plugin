import assert from"node:assert/strict";
import{test}from"node:test";
import{createHash}from"node:crypto";
import{gunzipSync,gzipSync}from"node:zlib";
import{expandCurrentFootprintInverseSmokeVectors as expand,projectCurrentFootprintInverseSmokeVectors as project}from"../src/current-footprint-inverse-smoke-vector-storage.ts";

void test("joint immutable vectors restore exact calls and reject forged tables/indices",()=>{const first=Buffer.alloc(64,17).toString("base64");const second=Buffer.alloc(32,29).toString("base64");const source=`class Test{static void Run(){var a=EasyedaDiagnosticFixedTable.Hashes(@"${first}",2);var b=EasyedaDiagnosticFixedTable.Hashes(@"${second}",1);var c=EasyedaDiagnosticFixedTable.Hashes(@"${first}",2);string text="EasyedaFixedSmokeVectors.Get(999)";}}`;const packed=project(source);assert.equal(expand(packed),source);assert.equal(project(packed),packed);assert.ok(packed.includes("EasyedaFixedSmokeVectors.Get(2)"));assert.throws(()=>expand(packed.replace("EasyedaFixedSmokeVectors.Get(1)","EasyedaFixedSmokeVectors.Get(0)")));assert.throws(()=>expand(packed.replace(/Rows0=EasyedaDiagnosticFixedTable.Load\(@"[^"]+/u,'Rows0=EasyedaDiagnosticFixedTable.Load(@"AAAAAAAA')));assert.throws(()=>expand(`${packed}\n// END FIXED INVERSE SMOKE VECTORS V1\n`));assert.throws(()=>project(source.replace(`@"${first}",2`,`@"${first}",3`)));assert.throws(()=>project(source.replace(`@"${first}",2`,`@"${first}", 2`)));});

void test("stored vectors accept another valid gzip encoding while retaining hashes and canonical source checks",()=>{
 const vector=Buffer.alloc(64,17).toString("base64");const source=`class Test{static void Run(){var a=EasyedaDiagnosticFixedTable.Hashes(@"${vector}",2);}}`;const packed=project(source);
 const match=/Load\(@"([A-Za-z\d+/=]+)",(\d+),@"([a-f\d]{64})",@"([a-f\d]{64})",(\d+),2\)/u.exec(packed);assert.ok(match?.[1]!==undefined&&match[3]!==undefined&&match[4]!==undefined);
 const original=Buffer.from(match[1],"base64");
 // oxlint-disable-next-line node/no-sync -- The own test vector is bounded before decompression.
 const raw=gunzipSync(original,{maxOutputLength:60_000});
 // oxlint-disable-next-line node/no-sync -- Create a distinct valid encoding of the same fixed test vector.
 const alternate=gzipSync(raw,{level:1});assert.notDeepEqual(alternate,original);
 const packedHash=createHash("sha256").update(alternate).digest("hex");const updated=packed.replace(`@"${match[1]}"`,`@"${alternate.toString("base64")}"`).replace(`@"${match[4]}"`,`@"${packedHash}"`);
 assert.equal(expand(updated),source);assert.equal(project(updated),packed);
 assert.throws(()=>expand(updated.replace(`@"${packedHash}"`,`@"${"0".repeat(64)}"`)));
 assert.throws(()=>expand(updated.replace(`@"${match[3]}"`,`@"${"0".repeat(64)}"`)));
 assert.throws(()=>expand(updated.replace("Vectors=Join();","Vectors = Join();")));
});
