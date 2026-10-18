export const CURRENT_PCB_RENAME_PANEL_STAGES = Object.freeze([
  "auxiliary-context", "auxiliary-method", "auxiliary-active", "auxiliary-count", "auxiliary-identity", "auxiliary-state", "auxiliary-stability",
] as const);
type PanelStage = typeof CURRENT_PCB_RENAME_PANEL_STAGES[number];

/** Fixed dormant-panel check, not a permission or AST/source proof.
 * SCH d9d6a955 deviceStandardization6187767 returns if no active DIV marker.
 * UI3823ed6e16315/53564 always includes the hidden ID container. Its React
 * createRoot12493071 installs listeners/expandos, not rendered children;
 * Nkt12493187 renders only through the separate initData path. The tab handler
 * 12500597 assigns deviceStandardizationUuid and shows the selected container.
 * I8e.initData16645256 otherwise starts supplier/recommendation reads.
 * Retain the dormant DIV, style object and parent chain. Check the literal
 * display property, not CSS serialization or parent styles: ordinary layout
 * 15694224 changes parent visibility/background, and sibling hide1579217
 * leaves an already-hidden container alone. Comments and React expandos are
 * normal; rendered elements or any owner attribute are not dormant state.
 * Requires root/apply/method/methodCheck/bad/projectOnly; never queries data,
 * changes sidebar selection or invokes the subscriber.
 */
export function buildCurrentPcbRenamePanelGuard(diagnosticStages = false): string {
  const at = (stage: PanelStage): string => diagnosticStages ? `startupStage='${stage}';` : "";
  return String.raw`
const pcbRenamePanels=(()=>{
 ${at("auxiliary-context")}
 projectOnly.check();const document=root.document;
 ${at("auxiliary-method")}
 const select=method(document,'querySelectorAll');
 const base=()=>{
  ${at("auxiliary-context")}
  projectOnly.check();if(root.document!==document)bad();
  ${at("auxiliary-method")}
  methodCheck(select);
 };
 const sample=()=>{
  base();${at("auxiliary-active")}
  const active=apply(select.fn,document,['div[data-activekey="device-standardization"]']);
  if(active===null||typeof active!=='object'||active.length!==0)bad();
  base();${at("auxiliary-count")}
  const matches=apply(select.fn,document,['[id="device-standardization"]']);
  if(matches===null||typeof matches!=='object'||matches.length!==1)bad();
  return matches[0];
 };
 const marker=sample();${at("auxiliary-identity")}
 if(marker===null||typeof marker!=='object')bad();
 const parent=marker.parentElement,box=parent?.parentElement,style=marker.style;
 const identity=()=>{
  ${at("auxiliary-identity")}
  for(const node of [marker,parent,box])if(node===null||typeof node!=='object'||node.tagName!=='DIV'||node.ownerDocument!==document||node.isConnected!==true)bad();
  if(marker.parentElement!==parent||parent.parentElement!==box||box.id!=='bottomBarBox')bad();
 };
 identity();${at("auxiliary-method")}
 const attribute=method(marker,'getAttribute');
 const check=()=>{
  const current=sample();${at("auxiliary-stability")}
  if(current!==marker||marker.style!==style)bad();
  identity();${at("auxiliary-method")}
  methodCheck(attribute);
  ${at("auxiliary-state")}
  if(style===null||typeof style!=='object'||style.display!=='none'||marker.childElementCount!==0||
   apply(attribute.fn,marker,['id'])!=='device-standardization'||apply(attribute.fn,marker,['deviceStandardizationUuid'])!==null)bad();
  base();${at("auxiliary-method")}
  methodCheck(attribute);identity();${at("auxiliary-stability")}
  if(marker.style!==style)bad();
 };
 check();return{check};
})();`;
}
