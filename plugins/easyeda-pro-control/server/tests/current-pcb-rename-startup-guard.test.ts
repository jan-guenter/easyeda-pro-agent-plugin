import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_PCB_RENAME_STARTUP_STAGES, buildCurrentPcbRenameStartupGuard } from "../src/current-pcb-rename-startup-guard.ts";

function fixture(setup = "", diagnosticStages = false): { run: () => unknown; evaluate: (source: string) => unknown } {
  const context = createContext({});
  runInContext(`globalThis.target={projectUuid:'a'.repeat(64)};globalThis.reads=0;globalThis.forbidden=0;
globalThis.project={uuid:target.projectUuid};
class Manager{constructor(cbb){this.prjUuid=target.projectUuid;this.batchDepth=0;this._isClose=false;this.CBB=cbb;}
get projectId(){forbidden++;throw new Error('GETTER');}get isClose(){forbidden++;throw new Error('GETTER');}
startBatch(){forbidden++;throw new Error('WRITE');}endBatch(){forbidden++;throw new Error('WRITE');}getBatch(){forbidden++;throw new Error('METHOD');}}
globalThis.manager=new Manager(false);globalThis.ast={isBuild:true,isPass:false,transId:1,lastModify:123};
globalThis.temp={isBuild:false,isPass:false,transId:1,lastModify:100};
globalThis.tree={manager(){reads++;return manager;},ast(){reads++;return ast;},tempAst(){reads++;return temp;}};
globalThis.SCH={gVars:{projectMgr:project},D:{leftTree:tree}};
${setup}`, context, { timeout: 1000 });
  return { run: (): unknown => runInContext(`(()=>{const root=globalThis,apply=Reflect.apply;globalThis.startupStage='unset';
const bad=()=>{throw new Error('REFUSED');};const projectOnly={check(){if(globalThis.contextInvalid)bad();}};
const own=(owner,key)=>{if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();const descriptor=Object.getOwnPropertyDescriptor(owner,key);if(!descriptor||!Object.hasOwn(descriptor,'value'))bad();return descriptor.value;};
${buildCurrentPcbRenameStartupGuard(diagnosticStages)}
globalThis.recheck=pcbRenameStartup.check;pcbRenameStartup.check();return true;})()`, context, { timeout: 1000 }) as unknown,
    evaluate: (source): unknown => runInContext(source, context, { timeout: 1000 }) as unknown };
}

void test("dormant PCB guard accepts initial and settled empty-batch owners without invoking operations or convenience getters", () => {
  for (const setup of ["", "manager.pendSchematicId=new Set();manager.pendSheetId=new Set();"]) {
    const env = fixture(setup);
    assert.equal(env.run(), true);
    assert.equal(env.evaluate("recheck()"), undefined);
    assert.equal(env.evaluate("reads"), 9);
    assert.equal(env.evaluate("forbidden"), 0);
    assert.equal(env.evaluate("manager.batchDepth"), 0);
    assert.equal(env.evaluate("ast.transId"), 1);
  }
  const program = buildCurrentPcbRenameStartupGuard();
  assert.doesNotMatch(program, /startBatch|endBatch|rpcCall|\.publish\(|setTimeout|requestAnimationFrame|Save|new Function|eval\(/u);
});

void test("PCB guard accepts only explicit native ordinary-project CBB values without normalization", () => {
  for (const value of ["false", "0", "-0", "null", "undefined"]) {
    const env = fixture(`manager.CBB=${value};`);
    assert.equal(env.run(), true, value); assert.equal(env.evaluate("recheck()"), undefined);
    assert.equal(env.evaluate(`Object.is(manager.CBB,${value})`), true);
    assert.equal(env.evaluate("forbidden"), 0);
  }
  for (const value of ["true", "1", "-1", "''", "'0'", "'false'", "NaN", "Infinity", "0n", "[]", "{}", "new Boolean(false)"]) {
    assert.throws(() => fixture(`manager.CBB=${value};`).run(), /REFUSED/u, value);
  }
  for (const setup of ["delete manager.CBB;", "delete manager.CBB;Manager.prototype.CBB=undefined;", "delete manager.CBB;Manager.prototype.CBB=false;"]) {
    assert.throws(() => fixture(setup).run(), /REFUSED/u, setup);
  }
});

void test("PCB guard refuses every change between supported CBB values, including signed zero", () => {
  const values = ["false", "0", "-0", "null", "undefined"];
  for (const before of values) {
    for (const after of values.filter(value => value !== before)) {
      const env = fixture(`manager.CBB=${before};`); env.run(); env.evaluate(`manager.CBB=${after};`);
      assert.throws(() => env.evaluate("recheck()"), /REFUSED/u, `${before} -> ${after}`);
      assert.equal(env.evaluate("forbidden"), 0);
    }
  }
});

void test("PCB startup diagnostic inventory covers every emitted fixed stage and excludes private values", () => {
  const cases = [
    ["pcb-context", "globalThis.contextInvalid=true;", ""],
    ["pcb-holder", "tree.manager=null;", ""],
    ["pcb-manager", "manager.batchDepth=1;", ""],
    ["pcb-cbb", "manager.CBB='PRIVATE_VALUE';", ""],
    ["pcb-ast-state", "ast.isPass=true;", ""],
    ["pcb-ast-version", "ast.transId=2;", ""],
    ["pcb-pending", "manager.pendSchematicId=new Set(['sheet']);", ""],
    ["pcb-stability", "", "manager.CBB=null;"],
  ] as const;
  assert.deepEqual(cases.map(([stage]) => stage), CURRENT_PCB_RENAME_STARTUP_STAGES);
  const instrumented = buildCurrentPcbRenameStartupGuard(true);
  assert.deepEqual(new Set([...instrumented.matchAll(/startupStage='([^']+)'/gu)].map(match => match[1])),
    new Set(CURRENT_PCB_RENAME_STARTUP_STAGES));
  assert.doesNotMatch(buildCurrentPcbRenameStartupGuard(), /startupStage/u);
  for (const [stage, setup, drift] of cases) {
    const env = fixture(setup, true);
    if (drift === "") { assert.throws(() => env.run(), /REFUSED/u); }
    else { env.run(); env.evaluate(drift); assert.throws(() => env.evaluate("recheck()"), /REFUSED/u); }
    assert.equal(env.evaluate("startupStage"), stage); assert.equal(env.evaluate("forbidden"), 0);
  }
});

void test("PCB guard rejects active batch, unfinished AST compilation and malformed native state", () => {
  for (const setup of ["manager.batchDepth=1;", "manager.batchDepth=-1;", "manager.batchDepth=-0;", "manager.batchDepth=NaN;",
    "manager.batchDepth='0';", "manager._isClose=true;", "manager.CBB=true;", "manager.prjUuid='foreign';", "project.uuid='foreign';",
    "ast.isBuild=false;", "ast.isPass=true;", "temp.isBuild=true;", "temp.isPass=true;", "temp=ast;", "ast.transId=2;",
    "temp.transId=2;", "ast.transId=temp.transId=0;", "ast.transId=temp.transId=1.5;", "ast.transId=temp.transId=Infinity;",
    "ast.transId=temp.transId=Number.MAX_SAFE_INTEGER+1;", "temp.transId='1';", "ast.lastModify=-0;", "ast.lastModify=-1;",
    "ast.lastModify=NaN;", "ast.lastModify='123';", "Object.setPrototypeOf(ast,null);", "globalThis.contextInvalid=true;",
    "target.projectUuid=project.uuid=manager.prjUuid=undefined;", "target.projectUuid=project.uuid=manager.prjUuid='foreign';"]) {
    const env = fixture(setup);
    assert.throws(() => env.run(), /REFUSED/u, setup);
    assert.equal(env.evaluate("forbidden"), 0);
  }
});

void test("PCB guard accepts only paired absent or distinct canonical empty pending sets", () => {
  for (const setup of ["manager.pendSchematicId=new Set();", "manager.pendSheetId=new Set();", "manager.pendSchematicId=undefined;",
    "Object.getPrototypeOf(manager).pendSchematicId=new Set();", "manager.pendSchematicId=manager.pendSheetId=new Set();",
    "manager.pendSchematicId=new Set(['sheet']);manager.pendSheetId=new Set();", "manager.pendSchematicId=new Set();manager.pendSheetId=new Set(['sheet']);",
    "manager.pendSchematicId={size:0};manager.pendSheetId=new Set();", "manager.pendSchematicId=new(class extends Set{})();manager.pendSheetId=new Set();",
    "manager.pendSchematicId=new Set();manager.pendSchematicId.extra=true;manager.pendSheetId=new Set();",
    "manager.pendSchematicId=new Set();manager.pendSheetId=new Proxy(new Set(),{});"]) {
    assert.throws(() => fixture(setup).run(), /REFUSED|incompatible receiver/u, setup);
  }
});

void test("PCB guard never invokes substituted data getters", () => {
  for (const [owner, key] of [["SCH", "D"], ["SCH.D", "leftTree"], ["tree", "manager"], ["tree", "ast"], ["tree", "tempAst"],
    ["manager", "prjUuid"], ["manager", "batchDepth"], ["manager", "_isClose"], ["manager", "CBB"], ["manager", "pendSchematicId"],
    ["ast", "transId"], ["temp", "isPass"], ["ast", "lastModify"]]) {
    const env = fixture(`Object.defineProperty(${owner},'${key}',{get(){forbidden++;throw new Error('GETTER');}});`);
    assert.throws(() => env.run(), /REFUSED/u, `${owner}.${key}`);
    assert.equal(env.evaluate("forbidden"), 0);
  }
});

void test("PCB guard rejects owner, accessor, prototype and exact settled-counter drift after capture", () => {
  for (const drift of ["SCH={...SCH};", "SCH.gVars={...SCH.gVars};", "SCH.gVars.projectMgr={...project};", "SCH.D={...SCH.D};",
    "SCH.D.leftTree={...tree};", "tree.manager=()=>manager;", "tree.ast=()=>ast;", "tree.tempAst=()=>temp;",
    "manager=new Manager();", "Object.setPrototypeOf(manager,{});", "ast={...ast};", "temp={...temp};",
    "ast.transId=temp.transId=2;", "ast.lastModify=124;", "manager.batchDepth=1;", "temp.isPass=true;",
    "manager.pendSchematicId=new Set();manager.pendSheetId=new Set();", "globalThis.Set=class extends Set{};",
    "Object.defineProperty(Set.prototype,'size',{get(){forbidden++;return 0;}});", "globalThis.contextInvalid=true;"]) {
    const env = fixture(); env.run(); env.evaluate(drift);
    assert.throws(() => env.evaluate("recheck()"), /REFUSED/u, drift);
    assert.equal(env.evaluate("forbidden"), 0);
  }
  for (const drift of ["manager.pendSchematicId=new Set();", "manager.pendSheetId=new Set();", "delete manager.pendSchematicId;delete manager.pendSheetId;",
    "manager.pendSheetId.add('sheet');", "Object.defineProperty(manager,'pendSheetId',{get(){forbidden++;return new Set();}});"]) {
    const env = fixture("manager.pendSchematicId=new Set();manager.pendSheetId=new Set();"); env.run(); env.evaluate(drift);
    assert.throws(() => env.evaluate("recheck()"), /REFUSED/u, drift);
    assert.equal(env.evaluate("forbidden"), 0);
  }
});
