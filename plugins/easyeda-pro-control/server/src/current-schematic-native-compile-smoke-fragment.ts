/** PowerShell Add-Type exports public types only. Keep private codec smoke
 * implementations private and reach them through this owned public facade. */
const begin = "// BEGIN SCHEMATIC PUBLIC COMPILE SMOKES";
const end = "// END SCHEMATIC PUBLIC COMPILE SMOKES";
const block = `${begin}
public sealed partial class EasyedaDiagnosticOwner {
public static void VerifySchematicProtocolSmokes(){
EasyedaProjectLibraryRefreshProtocol.VerifySmoke();
EasyedaSchematicRelevanceRunPrefixProtocol.VerifySmoke();
EasyedaSchematicRelevanceRunGuardProtocol.VerifySmoke();
}
}
${end}`;
export function normalizeSchematicPublicCompileSmokes(input: string): string {
 const start = input.indexOf(begin), stop = input.indexOf(end);
 if (start !== -1 || stop !== -1) {
  if (start < 1 || input[start-1]!=="\n" || stop < start || input.includes(begin,start+begin.length) || input.includes(end,stop+end.length) || input.slice(start,stop+end.length)!==block) { throw new Error("SCHEMATIC_PUBLIC_SMOKES_BLOCK"); }
  return input.slice(0,start-1)+input.slice(stop+end.length);
 }
 return input;
}
export function applySchematicPublicCompileSmokes(input: string): string {
 const source=normalizeSchematicPublicCompileSmokes(input);
 const anchor = "\n'@\n";
 if(source.split(anchor).length!==2){throw new Error("SCHEMATIC_PUBLIC_SMOKES_ANCHOR");}
 return source.replace(anchor,`\n${block}${anchor}`);
}
