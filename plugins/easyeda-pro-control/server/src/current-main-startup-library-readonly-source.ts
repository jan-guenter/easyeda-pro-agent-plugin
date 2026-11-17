/** Source-only observation of the optional installed stock-library rejection.
 * The source and error do not prove successful initialization or issue a resume. */
import { sha256Text } from "./core.ts";
import { qualifyCurrentSelectedFileMainSqlFenceSource } from "./current-selected-file-main-sql-fence-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_MAIN_STARTUP_LIBRARY_READONLY_SOURCE=freezeDeep({
  run:{start:1_299_554,end:1_299_925,bytes:371,sha256:"eacbd3a0c4f9a0ed9a91d3846800b27c57f74c617ffbb50664cac823c20c5116"},
  rejection:{start:1_299_753,end:1_299_787,bytes:34,sha256:"d481fa22afff84b49e2d9a83a579e51a2c6f500dc4799f27265ba21f0fd7f5c7"},
  start:{lineNumber:1025,columnNumber:931},end:{lineNumber:1025,columnNumber:965},
  point:{lineNumber:1025,columnNumber:957},frameExpression:"[this,e,r,a]",
});
/** Require the entire already-pinned application before inspecting an exact
 * rethrow point. Matching a log/error string or snippet is insufficient. */
export function qualifyCurrentMainStartupLibraryReadonlySource(input:unknown):void {
  qualifyCurrentSelectedFileMainSqlFenceSource(input);
  if(typeof input!=="string") { throw new TypeError("STOCK_READONLY_SOURCE"); }
  for(const site of [CURRENT_MAIN_STARTUP_LIBRARY_READONLY_SOURCE.run,CURRENT_MAIN_STARTUP_LIBRARY_READONLY_SOURCE.rejection]) {
    const text=input.slice(site.start,site.end);
    if(Buffer.byteLength(text)!==site.bytes || sha256Text(text)!==site.sha256) { throw new Error("STOCK_READONLY_SOURCE"); }
  }
  const prefix=input.slice(0,CURRENT_MAIN_STARTUP_LIBRARY_READONLY_SOURCE.rejection.start);
  if(prefix.split("\n").length-1!==1025 || prefix.length-prefix.lastIndexOf("\n")-1!==931) { throw new Error("STOCK_READONLY_SOURCE"); }
}
