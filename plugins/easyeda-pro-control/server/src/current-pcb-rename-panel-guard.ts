/** Fixed absence check, not a permission or AST/source proof.
 * SCH d9d6a955 deviceStandardization6187767 returns if no active DIV marker.
 * Its alternate #device-standardization owner marker is refused too. UI
 * 3823ed6e I8e.initData16645256 otherwise starts supplier/recommendation reads.
 * Requires root/apply/method/methodCheck/bad/projectOnly; never queries data,
 * changes sidebar selection or invokes the subscriber.
 */
export function buildCurrentPcbRenamePanelGuard(): string {
  return String.raw`
const pcbRenamePanels=(()=>{
 projectOnly.check();const document=root.document,select=method(document,'querySelectorAll');
 const check=()=>{projectOnly.check();if(root.document!==document)bad();methodCheck(select);
  for(const selector of ['div[data-activekey="device-standardization"]','[id="device-standardization"]']){
   const matches=apply(select.fn,document,[selector]);if(matches===null||typeof matches!=='object'||matches.length!==0)bad();
   if(root.document!==document)bad();methodCheck(select);projectOnly.check();
  }
 };
 check();return{check};
})();`;
}
