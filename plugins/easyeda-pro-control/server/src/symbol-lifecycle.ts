import type { NativeSourceSnapshot } from "./document-source.ts";
import { buildSymbolSourceGuard } from "./symbol-action.ts";
import type { SymbolScope } from "./symbol-action.ts";
import { buildNativeDocumentCloseFunction, buildNativeDocumentOpenFunction } from "./native-document-lifecycle.ts";

/** Native symbol source updates only enqueue history. This is the compiler
 * save used by installed symbol-generation flows; still checkpoint before close.
 */
export function buildSymbolSaveCode(expected: NativeSourceSnapshot, scope: SymbolScope): string {
  return `${buildSymbolSourceGuard(expected, scope)}
const compiler=doc.consistencyImpl.manager;
if(typeof compiler?.save!=='function')throw new Error('SYMBOL_COMPILER_SAVE_MISSING');
const result=await compiler.save();
if(result?.success!==true)throw new Error('SYMBOL_COMPILER_SAVE_FAILED');
await assertContext();
return {ok:true,kind:'symbol-save-requested',saved:false};`;
}

/** The transaction executor proves complete durable records before calling. */
export function buildSymbolReopenCode(expected: NativeSourceSnapshot, scope: SymbolScope): string {
  const lifecycle = { projectUuid: scope.libraryUuid, documentUuid: scope.symbolUuid, documentType: 2 as const, metadataOwnerUuid: scope.metadataOwnerUuid };
  return `${buildSymbolSourceGuard(expected, scope)}
const editor=eda.dmt_EditorControl,library=eda.lib_Symbol;
if(typeof editor?.closeDocument!=='function'||typeof library?.openInEditor!=='function'||typeof editor?.activateDocument!=='function')throw new Error('SYMBOL_LIFECYCLE_API_MISSING');
const tabId=SCOPE.symbolUuid+'@'+SCOPE.libraryUuid;
const closeProof=await (${buildNativeDocumentCloseFunction(lifecycle)})(tabId);
const openProof=await (${buildNativeDocumentOpenFunction(lifecycle)})(tabId);
const project=await eda.dmt_Project.getCurrentProjectInfo(),current=await eda.dmt_SelectControl.getCurrentDocumentInfo();
if(project?.uuid!==SCOPE.libraryUuid||current?.uuid!==SCOPE.symbolUuid||current?.documentType!==2||current?.tabId!==tabId||current?.parentLibraryUuid!==SCOPE.metadataOwnerUuid)throw new Error('SYMBOL_REOPEN_SCOPE_DRIFT');
return {ok:true,saved:true,closed:true,reopened:true,closeProof,openProof,document:{uuid:SCOPE.symbolUuid,documentType:2,tabId}};`;
}
