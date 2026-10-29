/** Exact small preload spans. These provide no native objects or authority. */
export const FOOTPRINT_COPY_UI_REGISTRY_FIXTURE = {
  // oxlint-disable-next-line eslint/no-template-curly-in-string -- Preserve the native method's template literal as exact source bytes.
  registryConstructor: 'class sl{constructor(){this._changeCbs=new Set,this._map=new Map,this._debounceNotify=Ne.debounce(()=>{this._notify()},50)}static get context(){return ws()}static getInstance(){var t;return(t=this.context.extendLibManager)!=null?t:this.context.extendLibManager=new sl}_notify(){for(let t of this._changeCbs)t()}onChange(t){this._changeCbs.add(t)}offChange(t){this._changeCbs.delete(t)}_getLibId(t){return`${sl.LIB_ID_PREFFIX}${t}`}async addLibWithId(t){this._map.set(t.id,await $T.set(t)),this._debounceNotify()}async addLib(t){let i=this._getLibId(t.title);return await this.addLibWithId({...t,id:i}),i}deleteLib(t){return this._debounceNotify(),this._map.delete(t)}hasLib(t){return this._map.has(t)}getLib(t){return this._map.get(t)}getLibs(){return Array.from(this._map.values())}updateLibTitle(t,i){let s=this._map.get(t);s&&(s.title=i,this._debounceNotify())}updateLibPosition(t,i){let s=this._map.get(t);s&&(s.position=i,this._debounceNotify())}}',
  registryHas: "hasLib(t){return this._map.has(t)}",
  registryInstance: "getInstance(){var t;return(t=this.context.extendLibManager)!=null?t:this.context.extendLibManager=new sl}",
  registryContext: "get context(){return ws()}",
  contextProducer: "function ws(){return self.EDITOR_TOP||self}",
} as const;
