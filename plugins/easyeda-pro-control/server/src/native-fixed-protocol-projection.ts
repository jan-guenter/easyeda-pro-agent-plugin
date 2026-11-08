/** Immutable build-time projection only. This selects no runtime purpose and
 * cannot install native authority or caller-supplied program bytes. */
export function applyNativeFixedProtocolProjection(input:string,profile:Readonly<{begin:string;end:string;protocols:readonly string[];quoteMethod:string}>,native:string):string{
 const owner="public sealed partial class EasyedaDiagnosticOwner {",parts=native.split(owner);
 if(parts.length!==2||parts[0]===undefined||parts[1]===undefined){throw new Error("NATIVE_FIXED_CODEC_OWNER_ROSTER");}
 const protocols=[...parts[0].matchAll(/public static class ([A-Za-z0-9_]+) \{/gu)].map(match=>match[1]);
 if(JSON.stringify(protocols)!==JSON.stringify(profile.protocols)||!/^[A-Za-z][A-Za-z0-9]+$/u.test(profile.quoteMethod)){throw new Error("NATIVE_FIXED_CODEC_PROTOCOL_ROSTER");}
 const quote=`public static string ${profile.quoteMethod}(string text){return JsonString(text);}`;
 if(parts[1].split(quote).length!==2){throw new Error("NATIVE_FIXED_CODEC_QUOTE");}
 const value=`${profile.begin}\n${parts[0]}${owner}\n${quote}\n}\n\n${profile.end}`;
 const first=input.indexOf(profile.begin),last=input.indexOf(profile.end);
 if(first!==-1||last!==-1){if(first===-1||last<first||input.includes(profile.begin,first+1)||input.includes(profile.end,last+1)||input.slice(first,last+profile.end.length)!==value){throw new Error("NATIVE_FIXED_CODEC_EXISTING_BLOCK");}return input;}
 const anchor="internal enum EasyedaPcbViaWriteBirth { Original }";
 if(input.split(anchor).length!==2){throw new Error("NATIVE_FIXED_CODEC_ANCHOR");}return input.replace(anchor,`${value}\n${anchor}`);
}
