/** The selected SQL fence uses only util.types.isProxy. Node's native lazy
 * exports can execute their loader even during getOwnPropertyDescriptor.
 * Their values and descriptors are deliberately unobserved; this fixed v2
 * scope seals every other descriptor and both complete module key rosters. */
export const CURRENT_SELECTED_FILE_MAIN_SQL_CAPTURE_PROFILE = "private.selected-file-main-sql-capture.v2";
export const CURRENT_SELECTED_FILE_MAIN_SQL_CAPTURE_OPAQUE_UTIL_KEYS = Object.freeze([
  "parseArgs", "TextDecoder", "TextEncoder", "MIMEType", "MIMEParams", "diff", "setTraceSigInt",
] as const);

/** These names are fixed source data, never a caller-selectable exclusion.
 * Unknown native lazy properties still reach descriptor reflection and refuse
 * under the original throwOnSideEffect:true flag. */
export const CURRENT_SELECTED_FILE_MAIN_SQL_CAPTURE_SCOPE_HELPERS = String.raw`
const opaqueUtilKeys=${JSON.stringify(CURRENT_SELECTED_FILE_MAIN_SQL_CAPTURE_OPAQUE_UTIL_KEYS)},captureProfile=${JSON.stringify(CURRENT_SELECTED_FILE_MAIN_SQL_CAPTURE_PROFILE)};
const safeUtilDescriptors=o=>Reflect.ownKeys(o).filter(k=>!opaqueUtilKeys.includes(k)).map(k=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)bad();return[o,k,d];});
const captureScope=(capture,array)=>{const scope=own(capture,"5"),util=own(capture,"4");array(scope,8);const types=own(util,"types");if(own(scope,"0")!==captureProfile||Object.getPrototypeOf(util)!==own(scope,"2")||types!==own(scope,"4")||Object.getPrototypeOf(types)!==own(scope,"5")||own(scope,"7")!==false)bad();const roster=(o,keys)=>{const current=Reflect.ownKeys(o);array(keys,current.length);for(let i=0;i<current.length;i++)if(current[i]!==own(keys,String(i)))bad();};roster(util,own(scope,"3"));roster(types,own(scope,"6"));const rows=own(scope,"1"),n=own(rows,"length");array(rows,n);for(let i=0;i<n;i++)array(own(rows,String(i)),3);return rows;};`;
