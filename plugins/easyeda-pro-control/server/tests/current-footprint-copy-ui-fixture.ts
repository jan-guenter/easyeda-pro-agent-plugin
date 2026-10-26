/** Exact small UI source spans; no bundle, project data or native authority. */
export const FOOTPRINT_COPY_UI_FIXTURE = {
  "wrapper": "o=>{try{let{message:n,replyTopic:r}=o;try{let a=e(n);a instanceof Promise?a.then(s=>{this.publish(r,{success:!0,result:s})}).catch(s=>{console.error(s),this.publish(r,{success:!1,err:String(s)})}):this.publish(r,{success:!0,result:a})}catch(a){this.publish(r,{success:!1,err:String(a)})}}finally{this.pull(t,i)}}",
  "responder": "async e=>await ZI.getProLibSource(e)",
  "sourceRouter": "async getProLibSource(e){if(typeof window>\"u\")return await $rn(e);try{let{isProject:i,path:o}=e;return h4.getInstance().hasLib(o)?boe.getExtendLib(e):i?boe.getProjectLibByWorker(e):boe.getOtherLibByWorker(e)}catch(i){return{success:!1,message:i.message}}}",
  "projectSource": "async getProjectLibByWorker(e){try{let{path:i,uuid:o,docType:n}=e,{message:r}=await Lo.messageBus.rpcCall(\"/pro-mgr/hasProject\",[i]);return r?n===4?{success:!0,result:(await Lo.messageBus.rpcCall($e.FOOTPRINT.GET_STR,[o,i])).message||\"\"}:gT(n)?{success:!0,result:(await Lo.messageBus.rpcCall($e.SYMBOL.GET_STR,[o,i])).message||\"\"}:{success:!1,message:\"Api call error! The api does not exist!\"}:{success:!1,message:\"Get project library data source Project is not open!\"}}catch(i){return{success:!1,message:i.message}}}",
  "registryInstance": "getInstance(){var e;return(e=this.context.extendLibManager)!=null?e:this.context.extendLibManager=new kgt}",
  "registryHas": "hasLib(e){return this._map.has(e)}",
  "registryContext": "get context(){return Po()}",
  "messageBus": "get messageBus(){if(lCe.bus===void 0)if(typeof window<\"u\"){let t=Po();t._MSG_BUS_=t._MSG_BUS_||new z7e.MessageBus,lCe.bus=t._MSG_BUS_}else self._WORKER_BUS_=self._WORKER_BUS_||new z7e.WorkerMessageBridge(new z7e.MessageBus,self),lCe.bus=self._WORKER_BUS_;return lCe.bus}",
  "contextProducer": "function Po(){return self.EDITOR_TOP||self}"
} as const;
