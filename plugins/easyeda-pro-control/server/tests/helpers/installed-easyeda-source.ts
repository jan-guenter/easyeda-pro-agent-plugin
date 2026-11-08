/** Optional offline installed-source evidence. An explicitly configured install
 * must be readable and valid UTF-8; only absent configuration may skip it. */
import {readFile} from "node:fs/promises";
import {dirname,isAbsolute,join,resolve} from "node:path";
import process from "node:process";

export const INSTALLED_EASYEDA_EXECUTABLE_SKIP_REASON="Offline installed-executable check skipped: EASYEDA_PRO_EXECUTABLE is not configured.";
export const INSTALLED_EASYEDA_SOURCE_SKIP_REASON="Offline installed-source check skipped: EASYEDA_ASSETS_ROOT (installed resources/app/assets) is not configured.";
type Environment=Readonly<Record<string,string|undefined>>;
function root(environment:Environment):string|null{const value=environment["EASYEDA_ASSETS_ROOT"];if(value===undefined){return null;}if(value.trim().length===0){throw new Error("Configure a nonempty EASYEDA_ASSETS_ROOT for offline installed-source tests.");}return resolve(value);}
async function text(path:string):Promise<string>{return new TextDecoder("utf-8",{fatal:true,ignoreBOM:true}).decode(await readFile(path));}
function assetPath(relativePath:string):string{if(isAbsolute(relativePath)||relativePath.includes("\\")||relativePath.split("/").some(part=>part===""||part==="."||part==="..")){throw new Error("Expected an asset-relative EasyEDA source path.");}return relativePath;}
export async function readConfiguredEasyedaAssets(relativePaths:readonly string[],environment:Environment=process.env):Promise<readonly string[]|null>{const directory=root(environment),paths=relativePaths.map(path=>assetPath(path));if(directory===null){return null;}const values=await Promise.all(paths.map(path=>text(join(directory,path))));return values;}
export async function readConfiguredEasyedaAsset(relativePath:string,environment:Environment=process.env):Promise<string|null>{const values=await readConfiguredEasyedaAssets([relativePath],environment);return values?.[0]??null;}
export async function readConfiguredEasyedaApp(environment:Environment=process.env):Promise<string|null>{const directory=root(environment);if(directory===null){return null;}const source=await text(join(dirname(directory),"app.js"));return source;}

/** Resolve an explicitly configured PE without converting a broken path into a skip. */
export function configuredEasyedaExecutablePath(environment:Environment=process.env):string|null{const value=environment["EASYEDA_PRO_EXECUTABLE"];if(value===undefined){return null;}if(value.trim().length===0){throw new Error("Configure a nonempty EASYEDA_PRO_EXECUTABLE for offline installed-executable tests.");}return resolve(value);}
