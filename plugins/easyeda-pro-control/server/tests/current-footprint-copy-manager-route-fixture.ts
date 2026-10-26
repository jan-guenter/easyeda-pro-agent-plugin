/** Minimal exact snippets from pinned EasyEDA Pro UI/manager bundles. Full
 * runtime source issuance is replaced only at the synthetic test boundary. */
/* oxlint-disable eslint/no-template-curly-in-string, unicorn/prefer-string-raw -- Literal vendor source must preserve exact backslashes and template interpolation text for its pinned hash. */
export const FOOTPRINT_COPY_MANAGER_ROUTE_FIXTURE = Object.freeze({
  "rpcUi": "(i,o,n)=>{let{message:r,reply:a}=i;try{let s=e(r);if(s instanceof Promise){let l=Noe(n);s.then(c=>{this.rpcReply(c,a,o,aZ(l))},c=>{console.error(c),this.rpcReply(void 0,a,o,aZ(l))})}else this.rpcReply(s,a,o,n)}catch(s){console.error(s),this.rpcReply(void 0,a,o,n)}}",
  "rpcManager": "(s,r,i)=>{let{message:n,reply:a}=s;try{let o=t(n);if(o instanceof Promise){let c=oc(i);o.then(l=>{this.rpcReply(l,a,r,po(c))},l=>{console.error(l),this.rpcReply(void 0,a,r,po(c))})}else this.rpcReply(o,a,r,i)}catch(o){console.error(o),this.rpcReply(void 0,a,r,i)}}",
  "workerRpcCall": "rpcCall(e,t,s=0){let r=new Promise((i,n)=>{let a=`${GR}-${e}-${this.uuid}-${this.rpcTicket++}`;this.subscribeOnce(a,o=>{o.success?i(o.result):n(new Error(o.err))}),this.push(e,{message:t,replyTopic:a})});return s>0?Promise.race([r,new Promise((i,n)=>{setTimeout(n,s)})]):r}",
  "registryGet": "get(t){return this.map.get(t)}",
  "registryInstance": "getInstance(){return el.tool==null&&(el.tool=new el),el.tool}",
  "footprintGetStr": "async getStr(t){return this.project.isReady?await this.project.workerBus.rpcCall(J.footprint.getStr,t):{success:!1,message:\"\\u5DE5\\u7A0B\\u8FD8\\u6CA1\\u6253\\u5F00\\u5B8C\"}}",
  "channelProducer": "function Hn(e){return self[e]=self[e]||new nO.BroadcastChannelMessageBus(e)}",
  "registryLookup": "function K(e=Ee.currentProject.projectId){let s=so.getInstance().get(e);if(!s)throw new Error(\"Get an illegal project!\");return s}",
  "service": "async s=>pw(t)(s)",
  "handler": "async(t,s)=>{var i;return(i=await K(s).footprint.getStr(t))==null?void 0:i.result}"
} as const);
