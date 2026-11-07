/** Complete source and exact generated global-registration SQL only.
 * This leaf issues no request, connection, Date, native SQL or writer grant. */
import { sha256Text } from "./core.ts";
import { qualifyCurrentFootprintCopyMainBackendSource } from "./current-footprint-copy-main-backend-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_SOURCE = freezeDeep([
{"name":"vu","start":2_323_828,"end":2_324_334,"bytes":506,"sha256":"630511eea7b7f5e29a8a508d51093d51ec6379f05ed7aa8d566bb52bed7dff3d","lineNumber":8549,"columnNumber":98_105},
{"name":"ca","start":2_323_721,"end":2_323_823,"bytes":102,"sha256":"40cd69e9d6842885584196f5378476f11ba0644ff0105fcb6f90883822d024f1","lineNumber":8549,"columnNumber":97_998},
{"name":"K0","start":1_326_872,"end":1_327_164,"bytes":292,"sha256":"89c754fc91b669b94db9910e7c43e83c65907eafe9755c8a80510e911165e092","lineNumber":1027,"columnNumber":5834},
{"name":"D5","start":1_292_791,"end":1_299_105,"bytes":6314,"sha256":"c3e085daa38ff281385c20e22c1faea33a4a5ad2052265a4ac56e9c6c158ddb9","lineNumber":1020,"columnNumber":13_493},
{"name":"Da","start":1_292_705,"end":1_292_791,"bytes":86,"sha256":"71d81cb5dde1a0afc003e168fe1f3cb6dbb36e99cfabf3d1c46f315b7699a5af","lineNumber":1020,"columnNumber":13_407},
{"name":"wo","start":1_292_474,"end":1_292_705,"bytes":231,"sha256":"731b4bbeafe74c6b71a3cdcdaf3923a98c2e53018c95202080f10ed487dd8557","lineNumber":1020,"columnNumber":13_176},
{"name":"ji","start":1_292_430,"end":1_292_474,"bytes":44,"sha256":"bb36eab116d116cc60d3ba3f87d464cd04598620868c77f2d2aa14871b0eb5a9","lineNumber":1020,"columnNumber":13_132},
{"name":"d","start":1_292_377,"end":1_292_429,"bytes":52,"sha256":"07a8b421bacebf42aaf849386aa3d9fe1bcba1ad2346c3a10b65916ed0a1d408","lineNumber":1020,"columnNumber":13_079},
{"name":"Jr","start":1_292_306,"end":1_292_376,"bytes":70,"sha256":"fc6f935bef409dd79dce408922bb80327ccba04b79a4048b9cf228014008b613","lineNumber":1020,"columnNumber":13_008},
{"name":"Q","start":1_291_956,"end":1_292_305,"bytes":349,"sha256":"a0927d35f5ff09abd9efc7a90bdd8439f70255a74591e37996f94f9c709e0d22","lineNumber":1020,"columnNumber":12_658},
{"name":"openProject","start":2_332_540,"end":2_333_277,"bytes":737,"sha256":"9074b087f50749744f315ed1008ae23f22ab4812a774142a242095fefb0fc778","lineNumber":8549,"columnNumber":106_817,"arity":0,"async":true},
{"name":"save","start":2_323_847,"end":2_324_220,"bytes":373,"sha256":"f3705104297844e4fff52aa1b9c01db389b2d7c20b3553a33750c5ba5c86866f","lineNumber":8549,"columnNumber":98_124,"arity":1,"async":true}
] as const);
export const CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_SQL = freezeDeep({
upsert:"\n    insert into db_paths (\"name\",\"path\",\"system\",\"type\",\"version\",\"last_open_time\") values (\n        ?,\n        ?,\n        false,\n        1,\n        ?,\n        ?) on conflict (\"path\") do update set \"last_open_time\" = \n    ?",
query:"select \n    t1.\"path\" as \"path\",\n    t1.\"name\" as \"name\",\n    t1.\"version\" as \"version\",\n    t1.\"system\" as \"system\",\n    t1.\"type\" as \"type\",\n    t1.\"last_open_time\" as \"last_open_time\" from db_paths t1  where \n    t1.\"path\" = \n    ?"
} as const);
/** Actual V8 call locations were also observed by compiling only the two
 * method declarations in an inert Inspector context. No application or SQL
 * method ran. Runtime admission still requires these exact current pauses. */
export const CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_SITES = freezeDeep({
  bind: { lineNumber: 8549, columnNumber: 98_195,
    expression: "[this,e,r,i,ca,vu,sd,Q,Jr,_,sc,F5,Date,Date.now,Date.prototype.getTime,Date.prototype,I.systemLibName]" },
  afterExec: { lineNumber: 8549, columnNumber: 98_420, expression: "[this,e,r,i,sc,F5,Date,Date.now]" },
  opened: { lineNumber: 8549, columnNumber: 107_364, expression: "[this,e,i,sc,F5,Date,Date.now]" },
} as const);
/** Full original app bytes and all exact DSL/table/caller rows are required.
 * A qualified source string remains data; actual pause/receiver/connection and
 * original pending registration custody belong to the retained runner. */
export function qualifyCurrentSavedProjectRegistrationConfigSource(input: unknown): void {
  qualifyCurrentFootprintCopyMainBackendSource(input);
  if (typeof input !== "string") { throw new TypeError("SAVED_PROJECT_REGISTRATION_CONFIG_SOURCE"); }
  for (const row of CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_SOURCE) {
    const prefix = input.slice(0, row.start), source = input.slice(row.start, row.end);
    if (Buffer.byteLength(source) !== row.bytes || sha256Text(source) !== row.sha256 || prefix.split("\n").length - 1 !== row.lineNumber ||
      row.start - prefix.lastIndexOf("\n") - 1 !== row.columnNumber) { throw new Error("SAVED_PROJECT_REGISTRATION_CONFIG_SOURCE"); }
  }
}
