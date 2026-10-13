/** Package-owned generated binding for the pinned UI 12414b9d and PCB
 * 65401cdc. The synchronous UI registry selects one ordinary project PCB
 * iframe; all awaited reads and the final write use its captured local bus.
 * Xb/VP.create create a fresh PCB iframe, and bAo/$b close/remove it, rather
 * than recycling it into another PCB. Exclude alternate/imported frames.
 * This is receiver binding, not a document lock or atomic source CAS. The
 * journaled coordinator must retain its independent post-effect proofs.
 * scopeExpression is package-generated, never caller-provided JavaScript.
 */
export function buildPcbExactFrameBinding(scopeExpression: string): string {
  return `
const pcbFrameScope=${scopeExpression};
if(!pcbFrameScope||typeof pcbFrameScope.projectUuid!=='string'||typeof pcbFrameScope.branchUuid!=='string'||!/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/.test(pcbFrameScope.projectUuid)||!/^[a-f0-9]{32}$/.test(pcbFrameScope.branchUuid)||typeof EXPECTED_PROJECT_UUID!=='string'||EXPECTED_PROJECT_UUID!==pcbFrameScope.projectUuid||typeof EXPECTED_DOCUMENT_UUID!=='string'||typeof EXPECTED_TAB_ID!=='string'||EXPECTED_DOCUMENT_TYPE!==3||EXPECTED_TAB_ID!==EXPECTED_DOCUMENT_UUID+'@'+EXPECTED_PROJECT_UUID)throw new Error('CONTEXT');
const pcbFrameLocalHost=globalThis.gVars,pcbFrameOuterHost=globalThis.top?.gVars,pcbFrameLocalUI=globalThis.UI,pcbFrameOuterUI=globalThis.top?.UI;
if((pcbFrameLocalHost!=null&&pcbFrameOuterHost!=null&&pcbFrameLocalHost!==pcbFrameOuterHost)||(pcbFrameLocalUI!=null&&pcbFrameOuterUI!=null&&pcbFrameLocalUI!==pcbFrameOuterUI))throw new Error('CONTEXT');
const pcbFrameHost=pcbFrameLocalHost??pcbFrameOuterHost,pcbFrameUI=pcbFrameLocalUI??pcbFrameOuterUI,pcbFrameEditorTop=globalThis.EDITOR_TOP??globalThis;
const pcbFrameProject=pcbFrameHost?.currentProject,pcbFrameTabs=pcbFrameUI?.tabBar,pcbFramePermission=pcbFrameUI?.concurrentDesign,pcbFrameDocument=pcbFrameEditorTop.document;
if(!pcbFrameProject||typeof pcbFrameTabs?.getActiveTab!=='function'||typeof pcbFrameTabs.getTabById!=='function'||typeof pcbFrameTabs.getTabIframeSync!=='function'||typeof pcbFrameDocument?.querySelectorAll!=='function')throw new Error('HOST');
const pcbFrameGetActive=pcbFrameTabs.getActiveTab,pcbFrameGetTab=pcbFrameTabs.getTabById,pcbFrameGetFrame=pcbFrameTabs.getTabIframeSync;
const pcbFrame=pcbFrameGetFrame.call(pcbFrameTabs,EXPECTED_TAB_ID),pcbFrameWindow=pcbFrame?.contentWindow,pcbFrameNative=pcbFrameWindow?.MSG_BUS_PCB,pcbFrameChannel=pcbFrameNative?.messageBus,pcbFrameRpc=pcbFrameChannel?.rpcCall;
if(typeof pcbFrameRpc!=='function')throw new Error('RECEIVER');
const assertPcbFrameCurrent=()=>{
const lh=globalThis.gVars,oh=globalThis.top?.gVars,lu=globalThis.UI,ou=globalThis.top?.UI;
if((lh!=null&&oh!=null&&lh!==oh)||(lu!=null&&ou!=null&&lu!==ou)||(lh??oh)!==pcbFrameHost||(lu??ou)!==pcbFrameUI||(globalThis.EDITOR_TOP??globalThis)!==pcbFrameEditorTop||pcbFrameEditorTop.gVars!==pcbFrameHost||pcbFrameEditorTop.document!==pcbFrameDocument||pcbFrameHost.currentProject!==pcbFrameProject||pcbFrameUI.tabBar!==pcbFrameTabs||pcbFrameUI.concurrentDesign!==pcbFramePermission||pcbFrameTabs.getActiveTab!==pcbFrameGetActive||pcbFrameTabs.getTabById!==pcbFrameGetTab||pcbFrameTabs.getTabIframeSync!==pcbFrameGetFrame)throw new Error('CONTEXT');
if(pcbFrameProject.projectId!==pcbFrameScope.projectUuid||pcbFrameProject.branchUuid!==pcbFrameScope.branchUuid||pcbFrameProject.isV2Format!==false||pcbFrameHost.isHistoryMode!==false)throw new Error('PROJECT');
if(pcbFrameGetActive.call(pcbFrameTabs)!==EXPECTED_TAB_ID)throw new Error('ACTIVE_TAB');
const tab=pcbFrameGetTab.call(pcbFrameTabs,EXPECTED_TAB_ID);
if(tab?.tabId!==EXPECTED_TAB_ID||tab.data?.doctype!==3||tab.data.pid!==pcbFrameScope.projectUuid||tab.parentLibraryUuid!==undefined)throw new Error('TAB');
if(pcbFramePermission?.isConcurrentStrictMode!==false||typeof pcbFramePermission.getIframeDisableStatusPanelPcb!=='function'||pcbFramePermission.getIframeDisableStatusPanelPcb(EXPECTED_TAB_ID)?.disable!==false)throw new Error('PERMISSION');
const matches=pcbFrameDocument.querySelectorAll('[id="frame_'+EXPECTED_TAB_ID+'"]');
if(matches.length!==1||matches[0]!==pcbFrame||pcbFrameGetFrame.call(pcbFrameTabs,EXPECTED_TAB_ID)!==pcbFrame||pcbFrame.tagName!=='IFRAME'||pcbFrame.id!=='frame_'+EXPECTED_TAB_ID||pcbFrame.ownerDocument!==pcbFrameDocument||pcbFrame.isConnected!==true||!pcbFrame.classList.contains('editframe')||pcbFrame.getAttribute('c_dbid')!==EXPECTED_TAB_ID||pcbFrame.getAttribute('c_doctype')!=='3'||pcbFrame.getAttribute('src')!=='editor?entry=pcb'||pcbFrame.getAttribute('pcb-canvas')!=='true'||pcbFrame.hasAttribute('blankIframe')||pcbFrame.hasAttribute('fromFile')||pcbFrame.hasAttribute('jsonCacheReady')||pcbFrame.parentElement?.getAttribute('uuid')!==EXPECTED_TAB_ID)throw new Error('FRAME');
if(pcbFrame.contentWindow!==pcbFrameWindow||pcbFrameWindow.MSG_BUS_PCB!==pcbFrameNative||pcbFrameNative.messageBus!==pcbFrameChannel||pcbFrameChannel.rpcCall!==pcbFrameRpc)throw new Error('RECEIVER');
};
assertPcbFrameCurrent();
`;
}
