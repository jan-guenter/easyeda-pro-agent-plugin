/** Fixed current UI 3823ed6e DOM producer profile. MO at 15246203,
 * err/O8o at 15250016/15250392 and xur at 16486904 create these markers.
 * Requires the current metadata compiler's retained document/frame helpers.
 * No tabless editor, export iframe or even unused panel pool is admitted.
 */
export const CURRENT_SYMBOL_CLOSED_TARGET_DOM = `
let closedDomOwners;
const closedTargetDom=()=>{
 check();
 const roots=apply(select,document,['[id="tabbar_bodies"]']);if(roots.length!==1)bad();const bodyRoot=roots[0];
 if(bodyRoot.tagName!=='DIV'||bodyRoot.ownerDocument!==document||bodyRoot.isConnected!==true||bodyRoot.children.length!==6)bad();
 const rootSelect=bodyRoot.querySelectorAll;if(typeof rootSelect!=='function')bad();
 const staticIds=new Set(['commandWin','exitSmartSizeTool','exitPadShapeTool','project-blank-page','assembly-variant-page']),seen=new Set(),owners=[bodyRoot,rootSelect];let activeCount=0;
 for(const body of bodyRoot.children){
  if(body.tagName!=='DIV'||body.ownerDocument!==document||body.isConnected!==true||body.parentElement!==bodyRoot||typeof body.getAttribute!=='function')bad();
  owners.push(body,body.getAttribute);const uuid=apply(body.getAttribute,body,['uuid']);
  if(uuid===null){if(!staticIds.has(body.id)||seen.has(body.id))bad();seen.add(body.id);continue;}
  if(uuid!==target.tabId||++activeCount!==1||body!==parent||body.children.length>128)bad();
  const bodyClasses=body.classList,bodyContains=bodyClasses?.contains;if(typeof bodyContains!=='function')bad();owners.push(bodyClasses,bodyContains);
  if(!apply(bodyContains,bodyClasses,['tabbar-panel'])||!apply(bodyContains,bodyClasses,['ruler-theme'])||apply(bodyContains,bodyClasses,['blankIframeDiv']))bad();
  let directFrames=0;for(const element of body.children){owners.push(element);if(element.tagName==='IFRAME'){if(element!==frame)bad();directFrames++;}}
  if(directFrames!==1)bad();
 }
 if(activeCount!==1||seen.size!==5)bad();
 // Symbols/schematics may be DIVs; exports may lack a UUID body entirely.
 const markers=apply(select,document,['.editframe,[c_doctype],[c_dbid],[id^="frame_"],iframe[src*="entry="],[blankIframe],[pcb-canvas]']);
 if(markers.length!==1||markers[0]!==frame)bad();
 const frames=apply(rootSelect,bodyRoot,['iframe']);if(frames.length!==1||frames[0]!==frame)bad();
 const documentFrames=apply(select,document,['iframe']);if(documentFrames.length!==1||documentFrames[0]!==frame)bad();
 if(closedDomOwners===undefined)closedDomOwners=owners;
 else if(owners.length!==closedDomOwners.length||owners.some((owner,i)=>owner!==closedDomOwners[i]))bad();
 check();
};`;
