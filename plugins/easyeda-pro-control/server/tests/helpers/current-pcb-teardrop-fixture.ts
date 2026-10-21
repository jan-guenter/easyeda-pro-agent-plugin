/** Exact inert Sfe method excerpts. Tests compile these but never call them. */
export const currentPcbTeardropSources = Object.freeze([
  "isMoveSwitch(t){this.isMove=t}", "setSuspend(t){this.suspend=t}",
  "addModify(t){t instanceof Nm&&this.modify.add(t)}",
  "addMaodifyTeardrop(t){t instanceof lt&&this.modifyTears.add(t)}",
  "flushService(){this.timeoutId!=null&&(clearTimeout(this.timeoutId),this.timeoutId=null),this.timeoutId=setTimeout(()=>{if(this.suspend){let t=this.merge(),e=this.removeTears(t);this.addTears(e),this.task.clear()}else this.addTask();this.modify.clear(),this.modifyTears.clear(),this.timeoutId=null},0)}",
  "refreshService(){if(this.timeoutId!=null&&(clearTimeout(this.timeoutId),this.timeoutId=null),this.suspend){let t=this.merge(),e=this.removeTears(t);this.addTears(e),this.task.clear()}else this.addTask();this.modify.clear(),this.modifyTears.clear()}",
]);

/** Caller has Sfe/Z1e/MSG_BUS_PCB and tearsOwner. This creates only synthetic
 * task records and native bound functions, not a native constructor body. */
export const CURRENT_PCB_TEARDROP_SYNTHETIC_BINDING = `
const tearsTopics=["isMoveSwitch","SetSuspend","cheakTearDrop","addModifyTeardrop","flushTearDrop","refreshTearDrop"];
const tearsMethods=["isMoveSwitch","setSuspend","addModify","addMaodifyTeardrop","flushService","refreshService"];
globalThis.teardropProof=[tearsOwner,[],[]];
for(let i=0;i<6;i++){const method=Object.getOwnPropertyDescriptor(Sfe.prototype,tearsMethods[i]).value;
const callback=method.bind(tearsOwner),task=new Z1e();task.callback=callback;task.isRunning=true;
MSG_BUS_PCB.messageBus.subscribed[tearsTopics[i]]=[task];teardropProof[1].push(callback);teardropProof[2].push(method);}
`;
