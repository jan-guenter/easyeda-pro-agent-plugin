/** The pinned UI3823ed6e ordinary-project fragment only. This grammar is not
 * project authority: callers retain their independent owner/context checks.
 * Empty fragments remain admissible without asserting any project identity.
 */
export function buildCurrentProjectUrlGuard(): string {
  return String.raw`const parseProjectUrl=(value,projectUuid,activeTabId)=>{
 if(typeof value!=='string'||value.length>32768||typeof projectUuid!=='string')bad();
 const projectMatch=/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/.exec(projectUuid);if(!projectMatch||projectMatch[0]!==projectUuid)bad();
 const pieces=value.split('#');if(pieces.length>2)bad();const base=pieces[0];
 const baseMatch=/^https:\/\/client\/editor\?cll=(?:trace|debug|info|warn|error)$/.exec(base);if(!baseMatch||baseMatch[0]!==base)bad();
 const fragment=pieces.length===1?'':pieces[1];
 if(fragment==='')return{base,empty:true,tabIds:[],activeTabId:null};
 const prefix='id='+projectUuid;if(fragment===prefix)return{base,empty:false,tabIds:[],activeTabId:null};
 if(!fragment.startsWith(prefix+',tab='))bad();const entries=fragment.slice(prefix.length+5).split('|');
 if(entries.length<1||entries.length>256)bad();const tabIds=[],seen=new Set();let markedTabId=null;
 for(const entry of entries){
  const match=/^(\*?)([a-f0-9]{16}|[a-f0-9]{32})@([a-f0-9]{32}|[a-f0-9]{64})$/.exec(entry);
  if(!match||match[0]!==entry||match[3]!==projectUuid)bad();const tabId=match[2]+'@'+match[3];if(seen.has(tabId))bad();seen.add(tabId);tabIds.push(tabId);
  if(match[1]==='*'){if(markedTabId!==null||(activeTabId!==undefined&&activeTabId!==null&&activeTabId!==tabId))bad();markedTabId=tabId;}
 }
 return{base,empty:false,tabIds,activeTabId:markedTabId};
};`;
}
