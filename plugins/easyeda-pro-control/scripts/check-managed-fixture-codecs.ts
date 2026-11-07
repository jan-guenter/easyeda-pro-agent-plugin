/** Offline source qualification only. No EasyEDA, bridge or SQLite is opened. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { isAbsolute, join } from "node:path";
import { createContext, runInContext } from "node:vm";
import { z } from "zod";
import { MANAGED_FIXTURE_ARC_FIELDS, MANAGED_FIXTURE_GENERATOR_KINDS, MANAGED_FIXTURE_GENERATOR_PROFILE, MANAGED_FIXTURE_LINE_FIELDS,
  MANAGED_FIXTURE_VIA_FIELDS, generateManagedFixtureArchiveData } from "../server/src/managed-fixture-generator.ts";
import { readManagedLibraryZip } from "../server/src/managed-library-files-zip.ts";

function hash(bytes: Buffer | string): string { return createHash("sha256").update(bytes).digest("hex"); }
async function sourceFile(root: string, pin: typeof MANAGED_FIXTURE_GENERATOR_PROFILE.sources[number]): Promise<string> {
  const path = join(root, pin.relativePath);
  assert.equal(await realpath(path), path);
  // oxlint-disable-next-line no-bitwise -- Refuse symlink leaves and substituted FIFOs before bounded source reading.
  const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const before = await handle.stat({ bigint: true });
    assert.ok(before.isFile() && before.nlink === 1n && before.size === BigInt(pin.bytes));
    const bytes = Buffer.alloc(pin.bytes + 1); let offset = 0;
    while (offset < bytes.length) {
      const read = await handle.read(bytes, offset, bytes.length - offset, offset); if (read.bytesRead === 0) { break; } offset += read.bytesRead;
    }
    const after = await handle.stat({ bigint: true }), named = await lstat(path, { bigint: true });
    assert.ok(offset === pin.bytes && after.isFile() && named.isFile() && !named.isSymbolicLink() &&
      before.dev === after.dev && before.ino === after.ino && before.size === after.size && before.mtimeNs === after.mtimeNs && before.ctimeNs === after.ctimeNs &&
      after.dev === named.dev && after.ino === named.ino && after.size === named.size && after.mtimeNs === named.mtimeNs && after.ctimeNs === named.ctimeNs);
    const content = bytes.subarray(0, offset); assert.equal(hash(content), pin.sha256); assert.equal(await realpath(path), path);
    return new TextDecoder("utf-8", { fatal: true }).decode(content);
  } finally { await handle.close(); }
}

const bodySchema = z.record(z.string(), z.unknown());
function scenario(bytes: Buffer): ReadonlyMap<string, Record<string, unknown>> {
  const source = readManagedLibraryZip(bytes).get("Fixture.epru"); assert.ok(source);
  const rows = new Map<string, Record<string, unknown>>();
  for (const line of source.toString("utf8").slice(0, -2).split("|\n")) {
    const boundary = line.indexOf("||"), header = bodySchema.parse(JSON.parse(line.slice(0, boundary)) as unknown);
    const body = bodySchema.parse(JSON.parse(line.slice(boundary + 2)) as unknown);
    rows.set(String(header["type"]), { ...body, ...(header["id"] === undefined ? {} : { id: header["id"] }) });
  }
  return rows;
}

async function main(): Promise<void> {
  assert.equal(process.argv.length, 2, "This fixed checker accepts no arguments or profile overrides.");
  const root = process.env["EASYEDA_ASSETS_ROOT"];
  assert.ok(typeof root === "string" && isAbsolute(root) && await realpath(root) === root, "Configure the canonical installed EASYEDA_ASSETS_ROOT.");
  const sources: string[] = [];
  for (const pin of MANAGED_FIXTURE_GENERATOR_PROFILE.sources) { sources.push(await sourceFile(root, pin)); }
  const pcb = z.string().parse(sources[0]); const manager = z.string().parse(sources[1]);
  const methods = new Map<string, string>();
  for (const pin of MANAGED_FIXTURE_GENERATOR_PROFILE.sourceMethods) {
    const selectedSource: string = pin.className === "AF" || pin.className === "Xp" ? manager : pcb;
    const content: string = selectedSource.slice(pin.start, pin.end); assert.equal(hash(content), pin.sha256);
    methods.set(`${pin.className}.${pin.method}`, content);
  }
  const method = (key: string): string => { const value = methods.get(key); assert.ok(value !== undefined); return value; };
  // The full PCB source and selected spans above are fixed before this isolated
  // VM sees any source. Only these reviewed codec methods run, with synthetic
  // Vector/model constructors. This is not an editor/native-model lifecycle.
  const aliasStart = pcb.indexOf("Na={") + 3; const aliasEnd = pcb.indexOf("};var Jg=", aliasStart) + 1;
  assert.ok(aliasStart > 3 && aliasEnd > aliasStart && aliasEnd - aliasStart < 2048);
  const setup = `const Na=${pcb.slice(aliasStart, aliasEnd)};const fields={${method("Jg.getVIA")},${method("Jg.getLINE")},${method("Jg.getARC")}};
class E{constructor(x,y){this.x=x;this.y=y;}distance1(other){return Math.hypot(this.x-other.x,this.y-other.y);}equals1(other){return this.x===other.x&&this.y===other.y;}
sub(other){return new E(this.x-other.x,this.y-other.y);}add(other){return new E(this.x+other.x,this.y+other.y);}mul(value){return new E(this.x*value,this.y*value);}length(){return Math.hypot(this.x,this.y);}
normalize(){const length=this.length();return new E(this.x/length,this.y/length);}rotate(origin,angle){const x=this.x-origin.x,y=this.y-origin.y;return new E(origin.x+x*Math.cos(angle)-y*Math.sin(angle),origin.y+x*Math.sin(angle)+y*Math.cos(angle));}
angle(other){return Math.atan2(this.y-other.y,this.x-other.x);}};E.ORIGIN=new E(0,0);
const Xa=value=>value==='0'||value===0?null:value!=null?value.toString():null;const NVe=value=>value==='SUTURE'?2:value==='BLIND'?1:0;
const Fr=Math.PI*2,le={CW:0,CCW:1},zt={toDegrees:value=>value*180/Math.PI},ne={eq:(a,b)=>Math.abs(a-b)<1e-10};var jM;${method("global.jM")};
${method("global.kVe")};${method("global.q1")};class yo{${method("yo.pointToAngle")}}class ArcBase{${method("tF.constructor")}}`;
  const context = createContext({}, { codeGeneration: { strings: false, wasm: false } });
  runInContext(setup, context, { timeout: 1000 });
  const viaFields: unknown = runInContext("fields.getVIA('2.0')", context, { timeout: 1000 });
  const lineFields: unknown = runInContext("fields.getLINE('2.0')", context, { timeout: 1000 });
  const arcFields: unknown = runInContext("fields.getARC('2.0')", context, { timeout: 1000 });
  assert.deepEqual(z.array(z.string()).parse(viaFields), MANAGED_FIXTURE_VIA_FIELDS);
  assert.deepEqual(z.array(z.string()).parse(lineFields), MANAGED_FIXTURE_LINE_FIELDS);
  assert.deepEqual(z.array(z.string()).parse(arcFields), MANAGED_FIXTURE_ARC_FIELDS);
  for (const kind of MANAGED_FIXTURE_GENERATOR_KINDS) {
    const generated = generateManagedFixtureArchiveData(kind), rows = scenario(generated.bytes);
    const via = rows.get("VIA"); assert.ok(via);
    const code = `(function(){const value={${method("u6.feed")},${method("u6.check")},${method("u6.viaCheck")},${method("u6.finish")},isNumber:Number.isFinite,
getItem(type,expansionType){return{type,expansionType,center:this.center,radius:this.radius,holeRadius:this.holeRadius,startLayer:this.startLayer,endLayer:this.endLayer,locked:this.locked};}};
value.feed(${JSON.stringify(via)});if(!value.check())throw new Error('Via check refused');return value.finish();})()`;
    const decoded: unknown = runInContext(code, context, { timeout: 1000 });
    const result = z.object({ type: z.literal(0), expansionType: z.literal(2), center: z.object({ x: z.literal(0), y: z.literal(0) }),
      radius: z.literal(10), holeRadius: z.literal(5), startLayer: z.literal(1), endLayer: z.literal(2), locked: z.literal(false) }).strict().parse(decoded);
    assert.equal(result.radius, 10);
    const meta = rows.get("META"); assert.ok(meta); const { id: _id, ...metadata } = meta;
    const nativeMeta: unknown = runInContext(`({${method("AF.metaData")}}).metaData(${JSON.stringify(metadata)})`, context, { timeout: 1000 });
    assert.deepEqual(bodySchema.parse(nativeMeta), metadata);
    const line = rows.get("LINE");
    if (line !== undefined) {
      const nativeLine: unknown = runInContext(`(function(){const value={${method("e6.feed")},${method("e6.check")},${method("e6.finish")},isNumber:Number.isFinite,
getItem(start,end){return{start,end,width:this.width,layerId:this.layerId,locked:this.locked};}};value.feed(${JSON.stringify(line)});return value.finish();})()`, context, { timeout: 1000 });
      z.object({ start: z.object({ x: z.literal(50), y: z.literal(0) }), end: z.object({ x: z.literal(150), y: z.literal(0) }),
        width: z.literal(10), layerId: z.literal(1), locked: z.literal(false) }).strict().parse(nativeLine);
    }
    const arc = rows.get("ARC");
    if (arc !== undefined) {
      const nativeArc: unknown = runInContext(`(function(){const value={${method("Q4.feed")},${method("Q4.check")},${method("Q4.arcCheck")},${method("Q4.finish")},isNumber:Number.isFinite,
addItem(center,radius,startAngle,endAngle,sweep){const model=new ArcBase(center,radius,startAngle,endAngle,sweep,this.type);return{center:model._center,radius:model._radius,startAngle:model._startAngle,endAngle:model._endAngle,sweep:model._sweep,arcType:model._arcType,width:this.width,layerId:this.layerId,locked:this.locked};}};
value.feed(${JSON.stringify(arc)});if(!value.check()||!value.arcCheck())throw new Error('Arc check refused');return value.finish();})()`, context, { timeout: 1000 });
      const resultArc = z.object({ center: z.object({ x: z.number(), y: z.number() }), radius: z.number(), startAngle: z.number(), endAngle: z.number(),
        sweep: z.literal(1), arcType: z.literal(1), width: z.literal(10), layerId: z.literal(1), locked: z.literal(false) }).strict().parse(nativeArc);
      for (const [actual, expected] of [[resultArc.center.x, 350], [resultArc.center.y, 100], [resultArc.radius, 100], [resultArc.startAngle, Math.PI], [resultArc.endAngle, 3 * Math.PI / 2]]) {
        assert.ok(actual !== undefined && expected !== undefined && Math.abs(actual - expected) < 1e-10, `Actual pinned Arc decode ${String(actual)} differs from fixed expected ${String(expected)}.`);
      }
    }
  }
  process.stdout.write(`${JSON.stringify({ ok: true, schema: "easyeda-pro-control.fixture-codec-source-check.v1",
    scenarios: [...MANAGED_FIXTURE_GENERATOR_KINDS], sourceProfile: MANAGED_FIXTURE_GENERATOR_PROFILE,
    wholeSourcePinsMatched: true, selectedMethodPinsMatched: true, nativeFieldRostersMatched: true,
    actualCodecFeedCheckFinishExecutedOffline: true, vectorAndModelConstructors: "synthetic",
    editorOpened: false, sqliteAccessed: false, nativeImportExecuted: false, nativeSceneVerified: false })}\n`);
}
// oxlint-disable-next-line node/no-top-level-await -- This fixed private ESM checker awaits its bounded read-only source campaign before returning an exit status.
try { await main(); }
catch (error) { process.stderr.write(`${error instanceof Error ? error.message : "Fixture codec source check failed."}\n`); process.exitCode = 1; }
