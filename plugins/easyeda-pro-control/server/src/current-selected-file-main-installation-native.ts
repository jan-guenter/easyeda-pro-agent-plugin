/** Build-only extension of the existing retained installation owner. Normal
 * births keep their five-file plan. Only fixed SQL birth constructors opt in. */
import { CURRENT_SELECTED_FILE_MAIN_INSTALLATION_FILES as FILES } from "./current-selected-file-main-installation-profile.ts";

const begin = "// BEGIN SELECTED SQL INSTALLATION", end = "// END SELECTED SQL INSTALLATION";
const quote = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
function one(source: string, before: string, after: string): string {
  if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("SELECTED_SQL_INSTALLATION_DUPLICATE"); } return source; }
  if (source.split(before).length !== 2) { throw new Error("SELECTED_SQL_INSTALLATION_ANCHOR"); } return source.replace(before, after);
}
function native(birthFlags: readonly string[]): string {
  return String.raw`${begin}
public static class EasyedaSelectedSql209Installation {
public const int FileCount=${String(FILES.length + 1)};
static readonly string[] Paths={${FILES.map(file => quote(file.relativePath.replaceAll("/", "\\"))).join(",")}};
static readonly long[] Sizes={${FILES.map(file => `${String(file.bytes)}L`).join(",")}};
static readonly string[] Hashes={${FILES.map(file => quote(file.sha256)).join(",")}};
static void Need(bool ok){if(!ok)throw new InvalidOperationException("selected-sql-installation");}
public static void Validate(string[] paths,long[] sizes,string[] hashes){Need(paths!=null&&sizes!=null&&hashes!=null&&paths.Length==FileCount&&sizes.Length==FileCount&&hashes.Length==FileCount);foreach(string path in paths)EasyedaDiagnosticInstallation.ValidatePath(path);string assets=Path.Combine(Path.GetDirectoryName(paths[0]),@"resources\app\assets");for(int i=0;i<Paths.Length;i++){int slot=i<4?i:i+1;Need(paths[slot]==Path.GetFullPath(Path.Combine(assets,Paths[i]))&&sizes[slot]==Sizes[i]&&hashes[slot]==Hashes[i]);}Need(paths[4]==@"C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe");}
}
public sealed partial class EasyedaDiagnosticOwner {public bool SelectedSqlInstallation{get{return ${birthFlags.join("||")};}}}
${end}`;
}
export function applyCurrentSelectedFileMainInstallationNative(input: string): string {
  let source = input;
  const birthFlags = ["pcbViaWrite209", "savedViaReadback209", "schematicDisplayWrite209", "footprintInverse209", "schematicRelevanceDisplayWrite209", "schematicWireEdit209", "schematicSavedReadback209"].filter(flag => {
    const count = input.split(`${flag}=true;`).length - 1;
    if (count > 1) { throw new Error("SELECTED_SQL_INSTALLATION_BIRTH_DUPLICATE"); } return count === 1;
  });
  if (birthFlags.length < 3 || birthFlags.length > 5) { throw new Error("SELECTED_SQL_INSTALLATION_BIRTHS"); }
  const start = source.indexOf(begin), stop = source.indexOf(end);
  if (start !== -1 || stop !== -1) {
    if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) { throw new Error("SELECTED_SQL_INSTALLATION_MARKERS"); }
    source = source.slice(0, start) + native(birthFlags) + source.slice(stop + end.length);
  } else { source = one(source, "public sealed class EasyedaDiagnosticInstallation {", `${native(birthFlags)}\npublic sealed class EasyedaDiagnosticInstallation {`); }
  source = one(source, "  public void AdmitRatline(string[] paths,long[] sizes,string[] hashes) {", `  public void AdmitSelectedSql(string[] paths,long[] sizes,string[] hashes) {
    EasyedaSelectedSql209Installation.Validate(paths,sizes,hashes);
    string[] corePaths=new string[5],coreHashes=new string[5];long[] coreSizes=new long[5];
    Array.Copy(paths,corePaths,5);Array.Copy(sizes,coreSizes,5);Array.Copy(hashes,coreHashes,5);
    Admit(corePaths,coreSizes,coreHashes);
    for(int i=5;i<paths.Length;i++)Pin(paths[i],sizes[i],hashes[i]);
    AssertCurrent();
  }
  public void AdmitRatline(string[] paths,long[] sizes,string[] hashes) {`);
  source = one(source, "if(workerStartupRatline209)installation.AdmitRatline(paths,sizes,hashes);else installation.Admit(paths,sizes,hashes);",
    "if(SelectedSqlInstallation)installation.AdmitSelectedSql(paths,sizes,hashes);else if(workerStartupRatline209)installation.AdmitRatline(paths,sizes,hashes);else installation.Admit(paths,sizes,hashes);");
  source = one(source, "$fileCount=if ($ratlinePurpose) {[EasyedaRatline209Installation]::FileCount} else {5}",
    "$fileCount=if ($owner.SelectedSqlInstallation) {[EasyedaSelectedSql209Installation]::FileCount} elseif ($ratlinePurpose) {[EasyedaRatline209Installation]::FileCount} else {5}");
  return source;
}
