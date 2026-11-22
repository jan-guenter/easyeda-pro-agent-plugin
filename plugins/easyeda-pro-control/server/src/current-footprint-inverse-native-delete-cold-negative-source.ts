/** Exact cold negative-GET branch data, not a native request or authority.
 * Lt is a plain rejection class; it does not inherit native Error. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { qualifyCurrentFootprintInverseInitializedGetSource } from "./current-footprint-inverse-initialized-get-source.ts";
import { qualifyCurrentFootprintInversePublicLookupSource } from "./current-footprint-inverse-public-lookup-source.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_NEGATIVE_SOURCE = freezeDeep({
  "managerResult": {
    "file": "manager",
    "start": 2_069_066,
    "end": 2_069_149,
    "descriptionStart": 2_069_066,
    "name": "",
    "arity": 2,
    "kind": "arrow",
    "strict": false,
    "async": true,
    "syntax": "expression",
    "bytes": 83,
    "sha256": "85da936d2a8a1f2bd83100d8230361ef9be4bd0e9fdb0609ae953da38b708185",
    "lineNumber": 108,
    "columnNumber": 41_712,
    "ownNames": [
      "length",
      "name"
    ],
    "source": "async(t,s)=>{var i;return(i=await K(s).footprint.getData(t))==null?void 0:i.result}"
  },
  "projectGet": {
    "file": "ui",
    "name": "getFootprint",
    "arity": 1,
    "kind": "method",
    "strict": true,
    "async": true,
    "static": false,
    "start": 6_230_498,
    "descriptionStart": 6_230_498,
    "end": 6_230_699,
    "bytes": 201,
    "sha256": "751bdec5a794eb09a1ed2ef35a3dec7404c651e365f8f2a9dac03293761e3bc2",
    "lineNumber": 1171,
    "columnNumber": 113_048,
    "source": "async getFootprint(t){let e=[t.uuid,t.path],{message:i}=await Lo.messageBus.rpcCall($e.FOOTPRINT.GET,e);if(!i)throw new Lt(\"GET_FOOTPRINT\",\"Footprint details data does not exist\");return tgt(t.path,i)}"
  },
  "lookup": {
    "file": "ui",
    "name": "tw",
    "arity": 3,
    "kind": "regular",
    "strict": false,
    "async": true,
    "static": false,
    "start": 10_248_133,
    "descriptionStart": 10_248_133,
    "end": 10_248_335,
    "bytes": 202,
    "sha256": "698d13cb83610e63b910998060fd85a11db120c9ecd7ab9d688df6c66bf2b4f3",
    "lineNumber": 1326,
    "columnNumber": 1619,
    "source": "async function tw(t,e,i){return t===\"symbol\"?await Ze.getSymbol({isProject:i===w.currentProject.projectId,path:i,uuid:e}):await Ze.getFootprint({isProject:i===w.currentProject.projectId,path:i,uuid:e})}"
  },
  "rejectionClass": {
    "file": "ui",
    "start": 6_128_773,
    "end": 6_129_016,
    "bytes": 243,
    "sha256": "cbbd506b81d47dd9f000acadacda4c0218e9252b7f15a85a6ef1a940e4207096",
    "source": "class{constructor(t,e=\"\"){this._message=e,this._action=t}get message(){return this._message}set message(t){this._message=t}get action(){return this._action}set action(t){this._action=t}toJSON(){return{message:this.message,action:this.action}}}"
  }
} as const);
/** Compare complete original files and all relevant fixed bodies. No source
 * string, matching response or error object enrolls a native origin. */
export function qualifyCurrentFootprintInverseNativeDeleteColdNegativeSource(source: string, file: "ui" | "manager"): void {
  qualifyCurrentFootprintInverseInitializedGetSource(source, file);
  if (file === "ui") { qualifyCurrentFootprintInversePublicLookupSource(source); }
  for (const row of Object.values(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_NEGATIVE_SOURCE)) {
    if (row.file === file) { const text = source.slice(row.start,row.end);
      if (text !== row.source || Buffer.byteLength(text) !== row.bytes || createHash("sha256").update(text).digest("hex") !== row.sha256) { throw new Error("INVERSE_NATIVE_DELETE_COLD_NEGATIVE_SOURCE"); }
    }
  }
}
