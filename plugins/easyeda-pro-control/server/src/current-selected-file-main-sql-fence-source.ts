/** Complete fixed209 SQLite call-site fence. Source qualification alone grants no native owner or write authority. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { qualifyCurrentFootprintCopyMainBackendSource } from "./current-footprint-copy-main-backend-source.ts";

export const CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SOURCE = freezeDeep({
  literalTableConstructor: ["attributes","block_symbol_attributes","branch_locks","branches","broadcast_messages","categories","component_fts_ids","component_fts_inv_idx","component_histories","components","coppers","db_paths","db_versions","device_fts_ids","device_fts_inv_idx","devices","documents","editor_bugs","editor_caches","history_data","notifications","project_histories","project_images","project_logs","project_members","project_structures","projects","resources","schematics","system_attributes","system_config","texts","users","web_cookies"],
  appSha256: "52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c",
  readRenderer: { start: 1_292_791, end: 1_299_105, bytes: 6314, sha256: "c3e085daa38ff281385c20e22c1faea33a4a5ad2052265a4ac56e9c6c158ddb9" },
  sites: {
    import: { start: 1_318_872, end: 1_318_890, lineNumber: 1025, columnNumber: 20_050, breakpointColumnNumber: 20_050,
      bytes: 18, sha256: "35fd4f177069f09ccd01d61ab5f747f1942adcaeeca51c56c235cccf6c8eeb7e", expression: "[Z2,yo]" },
    afterImports: { start: 1_318_977, end: 1_318_982, lineNumber: 1025, columnNumber: 20_155, breakpointColumnNumber: 20_158,
      bytes: 5, sha256: "04fe98ba091192c409166898105c22a029ec7485fc992594149cdceed760d955", expression: "[Z2,yo,sc,F5]" },
    keeperBirth: { start: 1_319_116, end: 1_319_155, lineNumber: 1025, columnNumber: 20_294, breakpointColumnNumber: 20_294,
      bytes: 39, sha256: "d504dba02cae699ed317830c90906d39df382e58581f03b0edfa6e1a848c6951", expression: "[t,sc.Database]" },
    keeperBound: { start: 1_319_156, end: 1_319_167, lineNumber: 1025, columnNumber: 20_334, breakpointColumnNumber: 20_337,
      bytes: 11, sha256: "9c2533c32ea708638bbfac26111cc2f782ec79b62a5006b527d627aa2494d5b5", expression: "[t,e,sc.Database]" },
    contextBirth: { start: 1_319_311, end: 1_319_375, lineNumber: 1025, columnNumber: 20_489, breakpointColumnNumber: 20_489,
      bytes: 64, sha256: "8ce7751740a4d5c285855f87872ff9a7c3edd53411362cc75585f3af054aa882", expression: "[t,r,i,sc.Database]" },
    contextBound: { start: 1_319_376, end: 1_319_410, lineNumber: 1025, columnNumber: 20_554, breakpointColumnNumber: 20_556,
      bytes: 34, sha256: "269fd44708699fce3cd982907819f60885d77e9182a3e628acafff4b0719e79e", expression: "[t,r,i,s,sc.Database]" },
    initializerBirth: { start: 1_319_746, end: 1_320_851, lineNumber: 1025, columnNumber: 20_924, breakpointColumnNumber: 20_924,
      bytes: 1105, sha256: "bb5bb52bae224375ea638799202cd0a62ae87b93280bd3c3530cbcbfef24e226", expression: "[t,i,s,sc.Database]" },
    initializerBound: { start: 1_320_852, end: 1_320_886, lineNumber: 1025, columnNumber: 22_030, breakpointColumnNumber: 22_032,
      bytes: 34, sha256: "2be93d43bdf7defb2b3aa2fa311e42cd741583aca9fe2a407bcc4f4519828fe4", expression: "[t,i,s,a,sc.Database]" },
    queryAll: { start: 1_299_354, end: 1_299_418, lineNumber: 1025, columnNumber: 532, breakpointColumnNumber: 540,
      bytes: 64, sha256: "06eeac6c0a55405769d7ff64207b0507488e4a37accb5d8aecbf05632684aeef", expression: "[this,e,r,sc,F5]" },
    queryOne: { start: 1_299_514, end: 1_299_551, lineNumber: 1025, columnNumber: 692, breakpointColumnNumber: 700,
      bytes: 37, sha256: "5ccf7d501e66fb5ef250c2dff41536f8ddc839cc5a90862a65a78353adfdf145", expression: "[this,e,r,sc,F5]" },
    run: { start: 1_299_689, end: 1_299_741, lineNumber: 1025, columnNumber: 867, breakpointColumnNumber: 875,
      bytes: 52, sha256: "e8c5a0710bb2c6f399d274c2ec4fce61a7300de27b6bbbff11980d6feb9a997b", expression: "[this,e,r,sc,F5]" },
    finalize: { start: 1_300_029, end: 1_300_056, lineNumber: 1025, columnNumber: 1207, breakpointColumnNumber: 1209,
      bytes: 27, sha256: "e4a8fd8e8cf1fb6d6bd2f11a44a9d17cbf7a48ff4aa819010825381741fd2e3d", expression: "[this,e]" },
    statementEach: { start: 1_300_160, end: 1_300_216, lineNumber: 1025, columnNumber: 1338, breakpointColumnNumber: 1340,
      bytes: 56, sha256: "dced99a6a7c1ac3b6c1b3266aed2e6ae8763736ca3d69532d5e3e5357238cc72", expression: "[this,e,r,sc,F5]" },
    statementRun: { start: 1_300_362, end: 1_300_406, lineNumber: 1025, columnNumber: 1540, breakpointColumnNumber: 1542,
      bytes: 44, sha256: "226e08298f99b61e57f6b5e5238551c5a3f0e5e1165c150c7670e207554dc417", expression: "[this,e,r,sc,F5]" },
    prepare: { start: 1_300_509, end: 1_300_544, lineNumber: 1025, columnNumber: 1687, breakpointColumnNumber: 1695,
      bytes: 35, sha256: "96fc5796b1f71d6f8f03a9ac95fe0b57cc22e33dc806384c397abc6703d65327", expression: "[this,e,r,i,sc,F5]" },
    prepared: { start: 1_300_545, end: 1_300_566, lineNumber: 1025, columnNumber: 1723, breakpointColumnNumber: 1738,
      bytes: 21, sha256: "344f85cefb722ece0bae29daaa9707d2b885d678007247eae2afa555554ccff7", expression: "[this,e,r,i,s,sc,F5]" },
    wrapClose: { start: 1_300_702, end: 1_300_732, lineNumber: 1025, columnNumber: 1880, breakpointColumnNumber: 1888,
      bytes: 30, sha256: "87d8d99d2a2d50a29bda049c6c8b4885c8fe78c83746b0a00cee8b9f981c87c7", expression: "[this]" },
    keeperClose: { start: 1_319_211, end: 1_319_220, lineNumber: 1025, columnNumber: 20_389, breakpointColumnNumber: 20_391,
      bytes: 9, sha256: "0267c8c7e76ac59c3c6a8500b2953816933954c088775fd6bdf3855aca7d34b0", expression: "[t,e]" },
    initializerSerialize: { start: 1_320_285, end: 1_320_466, lineNumber: 1025, columnNumber: 21_463, breakpointColumnNumber: 21_465,
      bytes: 181, sha256: "30b5cdaeeb8a29d231c76c69a394708e5283ceac4475c81e999e99c3771aa922", expression: "[t,a,o,sc,F5]" },
    initializerPragma: { start: 1_320_302, end: 1_320_464, lineNumber: 1025, columnNumber: 21_480, breakpointColumnNumber: 21_482,
      bytes: 162, sha256: "914b763e8e9bcb4efa6d7cd7ca216a6b3daaeb54010db5f815a4aaae3dcc7e47", expression: "[t,a,o,sc,F5]" },
    initializerClose: { start: 1_320_837, end: 1_320_846, lineNumber: 1025, columnNumber: 22_015, breakpointColumnNumber: 22_017,
      bytes: 9, sha256: "13f14080ef90121919a1ea3da8a3f75bc9eb119ca5d741fe81d5c0a0a574d40d", expression: "[t,a]" },
    driver: { start: 1_375_968, end: 1_376_289, lineNumber: 1164, columnNumber: 2434, breakpointColumnNumber: 2453,
      bytes: 321, sha256: "a3b4db4adc53d6d94632b1148fababfc314eba0095377211a06d79d8c6134974", expression: "[this,r,i,sc,F5]" },
  },
} as const);

export type CurrentSelectedFileMainSqlFenceSite = keyof typeof CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SOURCE.sites;
export interface CurrentSelectedFileMainSqlFenceSource {
  readonly profile: "private.current-selected-file-main-sql-fence-source.v1";
  readonly allOriginalDatabaseBirthsPinned: true;
  readonly rawAndPreparedSqlSitesPinned: true;
  readonly runtimeBound: false;
  readonly executionAuthorized: false;
}
const issued = new WeakSet<object>();
function need(value: boolean): asserts value { if (!value) { throw new Error("SELECTED_FILE_MAIN_SQL_FENCE_SOURCE"); } }
/** Check complete app bytes before any SQLite import continuation. No snippet or caller roster can substitute for this source. */
export function qualifyCurrentSelectedFileMainSqlFenceSource(input: unknown): CurrentSelectedFileMainSqlFenceSource {
  qualifyCurrentFootprintCopyMainBackendSource(input); need(typeof input === "string");
  const renderer = CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SOURCE.readRenderer, rendererText = input.slice(renderer.start, renderer.end);
  need(Buffer.byteLength(rendererText) === renderer.bytes && createHash("sha256").update(rendererText).digest("hex") === renderer.sha256);
  for (const site of Object.values(CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SOURCE.sites)) {
    const prefix = input.slice(0, site.start), text = input.slice(site.start, site.end);
    need(Buffer.byteLength(text) === site.bytes && createHash("sha256").update(text).digest("hex") === site.sha256 &&
      prefix.split("\n").length - 1 === site.lineNumber && site.start - prefix.lastIndexOf("\n") - 1 === site.columnNumber);
  }
  const tables = [...new Set([...input.matchAll(/new Q\("([a-zA-Z_]+)"/gu)].map(match => match[1] ?? ""))].toSorted((left, right) => left < right ? -1 : Number(left !== right));
  need(JSON.stringify(tables) === JSON.stringify(CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SOURCE.literalTableConstructor));
  need(input.match(/require\("sqlite3"\)/gu)?.length === 1 && input.match(/new sc\.Database\(/gu)?.length === 3);
  const token = Object.freeze({ profile: "private.current-selected-file-main-sql-fence-source.v1" as const,
    allOriginalDatabaseBirthsPinned: true as const, rawAndPreparedSqlSitesPinned: true as const, runtimeBound: false as const, executionAuthorized: false as const });
  issued.add(token); return token;
}
export function requireCurrentSelectedFileMainSqlFenceSource(input: unknown): void {
  need(input !== null && typeof input === "object" && issued.has(input));
}

/** Public vendor module/native binding pins. Native source files explain the
 * immutable own filename/sql descriptor checks; runtime metadata is separate. */
export const CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_INSTALLATION_FILES = freezeDeep([
  { relativePath: "../app.js", bytes: 2_657_192, sha256: "52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c" },
  { relativePath: "../node_modules/sqlite3/package.json", bytes: 3619, sha256: "a7d2279dfd425ee3f2f368e5160955491333967f7207ff3690a747a11f049985" },
  { relativePath: "../node_modules/sqlite3/sqlite3.js", bytes: 43, sha256: "b6c7edef7b91e53f02d737e61148d4ec1b5e151806e339346248a2de227a6555" },
  { relativePath: "../node_modules/sqlite3/lib/sqlite3.js", bytes: 6309, sha256: "e453648b76b80be1334dc49bf3ba19672f7acbd11b5d8b1ebe0cab08e3c5edf3" },
  { relativePath: "../node_modules/sqlite3/lib/sqlite3-binding.js", bytes: 449, sha256: "946769d049dacf8a564ab0f7076e1762ebae7ee7aba43d8ac5d72103089b6ccf" },
  { relativePath: "../node_modules/sqlite3/lib/binding/napi-v3-win32-x64/node_sqlite3.node", bytes: 2_742_272, sha256: "a851d31983fd21ee3821b1a0ca148c013029f96c6e0d31afc400e6a62ea7b482" },
  { relativePath: "../node_modules/sqlite3/src/database.cc", bytes: 21_833, sha256: "3778713244ecacaef7f6b75537d5c00e1cab28a79a7298d34729a9f5e115f979" },
  { relativePath: "../node_modules/sqlite3/src/statement.cc", bytes: 29_337, sha256: "7a12e9fd6efc9873025429cd9d86842ee01b4f0e730bda0402053900d30a94d0" },
]);
