/** Fixed same-script no-publication branch only. The lexical TP is the
 * original PROJECT created before EP, not a replaceable global lookup. */
export const CURRENT_GENERATED_INITIAL_SYNC_CONDITION = String.raw`(()=>{try{
if(this!==TP)return true;
const data=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))throw 0;return d.value;};
if(data(TP,"notSyncCloud")!==true)return true;
const p=Object.getPrototypeOf(TP);if(p!==Lg.prototype)return true;const b=Object.getPrototypeOf(p);if(b!==Gd.prototype)return true;
for(const o of[TP,p])for(const k of["isReadOnly","isV2Format"])if(Object.getOwnPropertyDescriptor(o,k)!==undefined)return true;
const r=Object.getOwnPropertyDescriptor(b,"isReadOnly"),f=Object.getOwnPropertyDescriptor(b,"isV2Format");
if(!r||!Object.hasOwn(r,"value")||typeof r.value!=="function"||r.writable!==true||r.enumerable!==false||r.configurable!==true||Function.prototype.toString.call(r.value)!=="isReadOnly(){return!!(this.isTemporary||this.isHistoryBack||this.isV2Format)}")return true;
if(!f||Object.hasOwn(f,"value")||typeof f.get!=="function"||typeof f.set!=="function"||f.enumerable!==false||f.configurable!==true||Function.prototype.toString.call(f.get)!=="get isV2Format(){return this._isV2Format}"||Function.prototype.toString.call(f.set)!=="set isV2Format(t){this._isV2Format=t,this._projectDetails&&(this._projectDetails.isV2Format=t)}")return true;
if(data(TP,"isTemporary")!==false||data(TP,"isHistoryBack")!==false||data(TP,"_isV2Format")!==false)return true;
return false;
}catch{return true;}})()`;
