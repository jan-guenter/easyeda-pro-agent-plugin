/** Inert v2 capture joins; no SQLite method, application or original owner runs. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { types } from "node:util";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CAPTURE_PROGRAM as CAPTURE, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CONDITIONS as CONDITIONS, CURRENT_SELECTED_FILE_MAIN_SQL_CAPTURED_FRAME_EXPRESSIONS as EXPRESSIONS, CURRENT_SELECTED_FILE_MAIN_SQL_CAPTURED_FRAME_PROGRAM as PROGRAM } from "../src/current-selected-file-main-sql-fence-programs.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SITES as SITES } from "../src/current-selected-file-main-sql-fence-protocol.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SOURCE as SOURCE } from "../src/current-selected-file-main-sql-fence-source.ts";

type Site = keyof typeof EXPRESSIONS;
/** Build a private genuine-shaped capture while leaving F5/sc/Z2 unavailable
 * to the caller frame. Map/Set stand in only for native descriptor shapes. */
function fixture(): ReturnType<typeof createContext> {
  const context = createContext({ originalProxy: types.isProxy });
  runInContext(`let effects=0;const forbidden=()=>{effects++;throw 0};
    const capture=(function(){const F5={types:{isProxy:originalProxy}},sc={Database:Map,Statement:Set};class Z2{}class yo{}
      return (${CAPTURE}).call([Z2,yo,sc,F5],"C:\\\\Synthetic\\\\fixture.eprj2");})();
    const db=new Map;Object.defineProperty(db,"filename",{value:"C:\\\\Synthetic\\\\fixture.eprj2"});
    const statement=new Set;Object.defineProperty(statement,"sql",{value:"SELECT count(*) FROM projects"});
    const wrap=Object.assign(Object.create(capture[1].prototype),{db}),path=db.filename,sqlite=capture[3],row={key:"sqlite",value:"1"};
    const fields={t:path,e:wrap,r:[],i:undefined,s:db,a:db,o:{},A:row,_:path,nl:"docs",Je:"root",A2:"dir",lc:"name",h6:{},KB:{},sc:sqlite,Date,DateNow:Date.now};
    function raw(tokens){return tokens.map(token=>token==="this"?wrap:token==="sc.Database"?sqlite.Database:token==="Date.now"?Date.now:fields[token]);}
    globalThis.fixture={capture,db,statement,wrap,path,sqlite,fields,raw};`, context);
  return context;
}
/** The caller controls only fixed test operands, never the production helper.
 * The policy baseline gets the same retained module values for comparison. */
function classify(context: ReturnType<typeof createContext>, site: Site, values: string): unknown {
  return runInContext(`(${PROGRAM}).call(${values},capture,${JSON.stringify(site)})`, context);
}

/** Execute the unchanged v1 condition with only its former module aliases
 * restored, independently checking the classifier's fixed operand mapping. */
function legacyCondition(context: ReturnType<typeof createContext>, site: Site): unknown {
  const tokens = EXPRESSIONS[site].slice(1, -1).split(",");
  const local = (name: string): string => { const index = tokens.indexOf(name); return index === -1 ? "undefined" : `selected[${String(index)}]`; };
  const args = ["capture[4]", "capture[3]", "capture[1]", ...["t", "e", "r", "s", "a", "_"].map(name => local(name))];
  return runInContext(`(function(F5,sc,Z2,t,e,r,s,a,_){return ${CONDITIONS[site]};}).call(${local("this")},${args.join(",")})`, context);
}

void test("all23 fixed expressions retain operand positions and every original v1 condition stays byte-exact", () => {
  const digest = createHash("sha256").update(JSON.stringify(CONDITIONS)).digest("hex");
  assert.equal(digest, "b16bb16601fcd44ddd3d762681fd1c6b75c672360649939af1f831c55dce2a33");
  assert.deepEqual(Object.keys(EXPRESSIONS).toSorted(), Object.keys(CONDITIONS).toSorted());
  for (const site of Object.keys(EXPRESSIONS)) {
    assert.ok(Object.hasOwn(CONDITIONS, site));
  }
  for (const site of SITES) {
    const expected = SOURCE.sites[site].expression.slice(1, -1).split(",").filter(value => value !== "F5");
    const nameIndex = expected.indexOf("lc");
    if (nameIndex !== -1) {
      assert.ok(["startupVersion", "startupJB", "startupDC"].includes(site));
      expected[nameIndex] = String.raw`(typeof nl==="string"&&typeof Je==="string"&&Je===nl+"\\EasyEDA-Pro"?"EasyEDA-Pro":void 0)`;
    }
    assert.equal(EXPRESSIONS[site], `[${expected.join(",")}]`);
  }
  assert.ok(Buffer.byteLength(PROGRAM) <= 16_384); assert.ok(Buffer.byteLength(JSON.stringify({ functionDeclaration: PROGRAM })) < 16_384);
});

void test("startup frames derive the app name from actual roots while the initializer-only alias is absent", () => {
  for (const site of ["startupVersion", "startupJB", "startupDC"] as const) {
    const context = fixture();
    runInContext(`fixture.fields.nl="C:\\\\Synthetic\\\\Documents";fixture.fields.Je=fixture.fields.nl+"\\\\EasyEDA-Pro";
      const {t,e,r,a,o,A,_,nl,Je,A2,h6,KB,sc}=fixture.fields;`, context);
    const old = SOURCE.sites[site].expression.replace(",F5", "");
    assert.throws(() => runInContext(old, context), /lc is not defined/u);
    const raw: unknown = runInContext(EXPRESSIONS[site], context); assert.ok(Array.isArray(raw));
    const rawIndex = SOURCE.sites[site].expression.slice(1, -1).split(",").filter(value => value !== "F5").indexOf("lc");
    assert.equal(raw[rawIndex], "EasyEDA-Pro");
    const normalized = classify(context, site, EXPRESSIONS[site]); assert.ok(Array.isArray(normalized));
    assert.equal(normalized[SOURCE.sites[site].expression.slice(1, -1).split(",").indexOf("lc")], "EasyEDA-Pro");
    assert.equal(runInContext("typeof lc", context), "undefined");
    assert.equal(runInContext("effects", context), 0);
  }
});

void test("startup name derivation rejects other roots and never coerces a hostile value", () => {
  for (const patch of [
    String.raw`fixture.fields.Je="C:\\Synthetic\\Documents\\LCEDA-Pro"`,
    String.raw`fixture.fields.Je="C:\\Other\\EasyEDA-Pro"`,
    'fixture.fields.nl=new Proxy({},{get:forbidden})',
    'fixture.fields.Je=new Proxy({},{get:forbidden})',
  ]) {
    const context = fixture();
    runInContext(`fixture.fields.nl="C:\\\\Synthetic\\\\Documents";fixture.fields.Je=fixture.fields.nl+"\\\\EasyEDA-Pro";
      ${patch};const {t,a,o,A,_,nl,Je,A2,sc}=fixture.fields;`, context);
    const raw: unknown = runInContext(EXPRESSIONS.startupVersion, context); assert.ok(Array.isArray(raw));
    const rawIndex = SOURCE.sites.startupVersion.expression.slice(1, -1).split(",").filter(value => value !== "F5").indexOf("lc");
    assert.equal(raw[rawIndex], undefined);
    assert.equal(runInContext("effects", context), 0);
  }
});

void test("absent ambient modules cannot break readonly approval, and policy-true frames preserve every legacy operand", () => {
  const context = fixture();
  assert.equal(runInContext("typeof F5", context), "undefined"); assert.equal(runInContext("typeof sc", context), "undefined"); assert.equal(runInContext("typeof Z2", context), "undefined");
  const valid: Readonly<Record<Site, string>> = {
    keeperBirth: "[path,sqlite.Database]", contextBirth: "[path,undefined,undefined,sqlite.Database]", initializerBirth: "[path,undefined,undefined,sqlite.Database]",
    keeperBound: "[path,db,sqlite.Database]", contextBound: "[path,undefined,undefined,db,sqlite.Database]", initializerBound: "[path,undefined,undefined,db,sqlite.Database]",
    queryAll: '[wrap,"SELECT count(*) FROM projects",[],sqlite]', queryOne: '[wrap,"SELECT count(*) FROM projects",[],sqlite]', run: '[wrap,"SELECT count(*) FROM projects",[],sqlite]',
    prepare: '[wrap,"SELECT count(*) FROM projects",[],undefined,sqlite]', prepared: '[wrap,"SELECT count(*) FROM projects",[],undefined,statement,sqlite]',
    statementEach: "[wrap,statement,[],sqlite]", statementRun: "[wrap,statement,[],sqlite]", finalize: "[wrap,statement]", wrapClose: "[wrap]", keeperClose: "[path,db]", initializerClose: "[path,db]",
    initializerSerialize: "[path,db,{},sqlite]", initializerPragma: "[path,db,{},sqlite]",
    startupVersion: '[path,db,{},row,path,"docs","root","dir","name",sqlite,Date,Date.now]',
    startupJB: '[undefined,undefined,path,"docs","root","dir","name",{},sqlite,Date,Date.now]', startupDC: '[path,path,"docs","root","dir","name",{},sqlite,Date,Date.now]',
    driver: '[wrap,{pureUrl:"/api/v4/projects"},undefined,sqlite]',
  };
  for (const site of SITES) {
    runInContext(`globalThis.selected=${valid[site]}`, context);
    const value = classify(context, site, "selected");
    assert.equal(value === true, legacyCondition(context, site) === false, site);
    const policyTrue = ["initializerSerialize", "initializerPragma", "startupVersion", "startupJB", "startupDC", "driver"].includes(site);
    if (policyTrue) {
      assert.ok(Array.isArray(value)); const raw: unknown = runInContext("selected", context); assert.ok(Array.isArray(raw));
      let index = 0;
      for (const [position, token] of SOURCE.sites[site].expression.slice(1, -1).split(",").entries()) {
        assert.equal(value[position], token === "F5" ? runInContext("capture[4]", context) : raw[index]);
        if (token !== "F5") { index += 1; }
      }
    } else { assert.equal(value, true, site); }
  }
  const write = classify(context, "run", '[wrap,"DELETE FROM projects",[],sqlite]'); assert.ok(Array.isArray(write)); assert.equal(write[1], "DELETE FROM projects");
  assert.equal(classify(context, "driver", '[wrap,{pureUrl:"/not-project"},undefined,sqlite]'), true);
  assert.equal(runInContext("effects", context), 0); assert.equal(runInContext("capture[8].size", context), 0);
});

void test("Proxy/accessor/raw-module/capture drift is guard-refused without executing hooks or widening a condition", () => {
  for (const code of [
    'new Proxy([wrap,"SELECT count(*) FROM projects",[],sqlite],{getPrototypeOf:forbidden,getOwnPropertyDescriptor:forbidden})',
    '[new Proxy(wrap,{getPrototypeOf:forbidden,getOwnPropertyDescriptor:forbidden}),"SELECT count(*) FROM projects",[],sqlite]',
    '[wrap,"SELECT count(*) FROM projects",new Proxy([],{getPrototypeOf:forbidden,getOwnPropertyDescriptor:forbidden}),sqlite]',
    '[wrap,"SELECT count(*) FROM projects",[],{}]',
    'Object.defineProperty([wrap,"SELECT count(*) FROM projects",[],sqlite],"1",{get:forbidden})',
    '[wrap,"SELECT count(*) FROM projects",[]]',
  ]) {
    const context = fixture(); assert.equal(classify(context, "run", code), "guard-refused"); assert.equal(runInContext("effects", context), 0);
  }
  const constructor = fixture(); assert.equal(classify(constructor, "keeperBirth", "[path,Set]"), "guard-refused");
  for (const mutation of ['Object.defineProperty(sqlite,"Database",{get:forbidden})', 'capture[4].types.isProxy=forbidden', 'capture[6]=forbidden', 'Object.defineProperty(capture,"4",{get:forbidden})']) {
    const context = fixture();
    runInContext(mutation, context);
    assert.equal(classify(context, "run", '[wrap,"SELECT count(*) FROM projects",[],sqlite]'), "guard-refused"); assert.equal(runInContext("effects", context), 0);
  }
  const accessor = fixture(); runInContext('wrap.db=Object.defineProperty(Object.create(sqlite.Database.prototype),"filename",{get:forbidden})', accessor);
  assert.equal(classify(accessor, "run", '[wrap,"SELECT count(*) FROM projects",[],sqlite]'), "guard-refused"); assert.equal(runInContext("effects", accessor), 0);
  const unknown = fixture(); assert.equal(runInContext(`(${PROGRAM}).call([],capture,"caller-code")`, unknown), "guard-refused");
});
