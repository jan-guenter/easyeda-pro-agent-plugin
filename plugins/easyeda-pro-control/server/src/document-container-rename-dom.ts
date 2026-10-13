/** Pinned tab registries can omit orphan loaded editors after an interrupted
 * native close. Inspect DOM frames independently, without model-lookup RPCs.
 * Only a directly opened active PCB is admitted. Even an unused panel pool
 * refuses; its separate initialized-cache/history proof is not this profile.
 */
export const DOCUMENT_CONTAINER_RENAME_DOM_GUARD = `
const frameDocument=editorTop.document;
if(!frameDocument||typeof frameDocument.querySelectorAll!=='function')throw new Error('EDITOR_FRAME_STATE');
const frames=()=>{
if(editorTop.document!==frameDocument)throw new Error('CONTEXT');
const roots=frameDocument.querySelectorAll('#tabbar_bodies');if(roots.length!==1)throw new Error('EDITOR_FRAME_STATE');const root=roots[0];
if(root.tagName!=='DIV'||root.children.length>6)throw new Error('EDITOR_FRAME_STATE');
const staticIds=new Set(['commandWin','exitSmartSizeTool','exitPadShapeTool','project-blank-page','assembly-variant-page']),seenStatic=new Set();let activeFrame;
for(const body of root.children){if(body.tagName!=='DIV')throw new Error('EDITOR_FRAME_STATE');const uuid=body.getAttribute('uuid');
if(uuid===null){if(!staticIds.has(body.id)||seenStatic.has(body.id)||body.querySelectorAll('iframe,.editframe,[c_doctype],[c_dbid],[id^="frame_"]').length!==0)throw new Error('EDITOR_FRAME_STATE');seenStatic.add(body.id);continue;}
if(uuid!==ACTIVE.tabId||activeFrame!==undefined||!body.classList.contains('tabbar-panel')||!body.classList.contains('ruler-theme')||body.classList.contains('blankIframeDiv')||body.children.length>128)throw new Error('EDITOR_FRAME_STATE');
const directFrames=Array.from(body.children).filter(child=>child.tagName==='IFRAME');if(directFrames.length!==1)throw new Error('EDITOR_FRAME_STATE');
const frame=directFrames[0];if(!frame.classList.contains('editframe')||frame.id!=='frame_'+uuid||frame.getAttribute('c_dbid')!==uuid||frame.getAttribute('c_doctype')!=='3'||frame.getAttribute('src')!=='editor?entry=pcb'||frame.getAttribute('pcb-canvas')!=='true'||frame.hasAttribute('blankIframe')||frame.hasAttribute('fromFile')||frame.hasAttribute('jsonCacheReady'))throw new Error('EDITOR_FRAME_STATE');
activeFrame=frame;
}
if(activeFrame===undefined)throw new Error('EDITOR_FRAME_STATE');
// SCH editors can be DIV.editframe; exports can lack an identifying UUID body.
const markers=frameDocument.querySelectorAll('.editframe,[c_doctype],[c_dbid],[id^="frame_"],iframe[src*="entry="]');
if(markers.length!==1||markers[0]!==activeFrame||!root.contains(activeFrame))throw new Error('EDITOR_FRAME_STATE');
const iframes=root.querySelectorAll('iframe');if(iframes.length!==1||iframes[0]!==activeFrame)throw new Error('EDITOR_FRAME_STATE');
};`;
