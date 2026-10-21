/** Inert excerpts from WORKER b849bd12. Synthetic construction compiles these
 * eight methods at reviewed locations, but never invokes their bodies. */
export const currentPcbStringWorkerGateSources = {
  readOnly: "isReadOnly(){return!!(this.isTemporary||this.isHistoryBack||this.isV2Format)}",
  format: "get isV2Format(){return this._isV2Format}",
  canPublish: "canWsPublish(){return!(!jr||!this.isReady||this.isReadOnly()||this.isSyncing)}",
  publish: 'publish(e,t){console.debug("BC",this.uuid,"PUBLISH",e,t),this.broadcastPublish(e,t)}',
  broadcast: 'broadcastPublish(e,t){this.post({type:"PUBLISH",uuid:this.uuid,topic:e,message:t})}',
  post: "post(e){this.bc.postMessage(e),Promise.resolve().then(()=>{this.onMessage(e)})}",
  message: 'onMessage(e){let{type:t,uuid:s,topic:r}=e;switch(t){case"PUBLISH":{let{message:i}=e;this.onReceivedPublish(s,r,i);break}case"WHOHAS":{this.onReceivedWhoHas(s,r);break}case"IHAVE":{let{id:i}=e;this.onReceivedIHave(s,r,i);break}case"INEED":{let{source:i,id:n}=e;this.onReceivedINeed(s,r,i,n);break}case"IGIVE":{let{target:i,id:n,message:a}=e;this.onReceivedIGive(s,r,n,i,a);break}default:console.warn("unsupported",e)}}',
  received: 'onReceivedPublish(e,t,s){console.debug("BCMSG(",this.uuid,")","from",e,"PUBLISH",t,"message",s);let r=this.subscribed[t];if(r){let i;for(let n of r)n.running()?n.execute(s):(i=i||new Array,i.push(n));if(i)for(let n of i)Hg(r,n);r.length===0&&delete this.subscribed[t]}}',
} as const;

export function currentPcbStringWorkerGateFixture(): string {
  const source = currentPcbStringWorkerGateSources;
  let output = '(()=>{let jr=false;globalThis.setPrivate=v=>{jr=v};globalThis.trapCalls=0;globalThis.console={debug(){trapCalls++},warn(){trapCalls++}};class Mb{}class KP extends Mb{';
  const append = (at: number, part: string): void => {
    if (output.length > at) { throw new Error("Synthetic fixture offset overlaps."); }
    output += " ".repeat(at - output.length) + part;
  };
  append(9842, source.publish); append(10_418, source.received); output += "}class JP extends KP{";
  append(11_813, source.message); append(12_230, source.broadcast); append(12_638, source.post); output += "}";
  output += "\n".repeat(108); append(1_847_288, "\nclass Gd{");
  append(2_012_635, source.format); output += "set isV2Format(value){this._isV2Format=value}";
  append(2_013_215, source.readOnly); output += "}class Lg extends Gd{"; append(2_014_185, "\n");
  append(2_108_520, source.canPublish);
  output += '}const bus=new JP;bus.uuid="12345678-1234-4234-8234-123456789abc";globalThis.PROJECT=new Lg;Object.assign(PROJECT,{uuid:"a".repeat(64),_branchUuid:"b".repeat(32),workerBus:bus,isTemporary:false,isHistoryBack:false,_isV2Format:false,isReady:true});globalThis._TAB_ID_="synthetic-window";})();';
  return output;
}
