/** Actual original watch/subscription functions at original source PCs.
  * The page/shape/model surroundings remain inert and grant no native owner. */
 import assert from "node:assert/strict";
 import {CURRENT_SCHEMATIC_WIRE_NET_WATCH_SOURCE as SOURCE,qualifyCurrentSchematicWireNetWatchSource as qualify} from "../../src/current-schematic-wire-net-watch-source.ts";

 export function wireNetWatchFixture(source:string,variant:0|1):string{
  assert.equal(qualify({scriptSource:source}),variant);const p=SOURCE[variant];let result=source.replaceAll(/[^\r\n]/gu,c=>" ".repeat(c.length));
  const write=(start:number,end:number,text:string):void=>{assert.equal(end-start,text.length);assert.ok(/^[ \r\n]*$/u.test(result.slice(start,end)));assert.equal(text.replaceAll(/[^\r\n]/gu,c=>" ".repeat(c.length)),result.slice(start,end));result=result.slice(0,start)+text+result.slice(end);};
  const actor=[p.actors.collection,p.actors.dispatcherBase,p.actors.dispatcher,...p.actors.symbols];
  const names=[...actor.map(a=>a.alias),"watchMethods","bboxMethods","shapeMethods"];const header=`var ${names.join(",")};`;const at=result.indexOf(" ".repeat(header.length));assert.ok(at!==-1);write(at,at+header.length,header);
  for(const a of actor){write(a.start,a.end,source.slice(a.start,a.end));write(a.end,a.end+1,";");}
  const factory=p.actors.disposeFactory;write(factory.start,factory.end,source.slice(factory.start,factory.end));
  for(const[role,label]of[["watch","watchMethods"],["bboxOnUpdate","bboxMethods"],["baseWatch","shapeMethods"]]as const){const row=p.rows[role];const prefix=`${label}={`;write(row.start-prefix.length,row.start,prefix);write(row.start,row.end,source.slice(row.start,row.end));write(row.end,row.end+2,"};");}
  return `${result}
 globalThis.netWatchRoots=(()=>{
  const Owner=${p.actors.collection.alias},Dispatcher=${p.actors.dispatcher.alias};
  Object.setPrototypeOf(watchMethods,Owner.prototype);Object.setPrototypeOf(bboxMethods,Owner.prototype);
  const page={},shapes=new Owner,net=new Owner,bbox=new Owner,dispatcher=new Dispatcher({});shapes.docManager=page;Object.setPrototypeOf(shapes,shapeMethods);Object.setPrototypeOf(shapeMethods,Object.assign(Object.create(Owner.prototype),{baseWatch(){return this._baseWatchSubscriptions}}));shapes._baseWatchSubscriptions=shapes.register(new Owner);shapes.maskRegionWatcher={watch(){return new Owner}};shapes.diffPairsFlagSymbolWatcher={watch(){return new Owner}};
  Object.setPrototypeOf(net,watchMethods);Object.setPrototypeOf(bbox,bboxMethods);
  net.shapeManager=shapes;net._watchSubscriptions=net.register(new Owner);bbox.shapeManager=shapes;bbox._onUpdate=dispatcher;
  shapes.netPointManager=net;shapes.bboxMonitor=bbox;page.shapeManager=shapes;page.fixtureOpaquePeer=17;
  const runner={_currentAction:null},line={shapeManager:shapes},group={shapeManager:shapes},metadata={},host={currentProject:metadata},b={shapes,page,runner,line,group,metadata,host},state={owner:null,before:{},after:null,failed:false,modifyAttempted:false,modifyAcknowledged:false,saveAttempted:false,saveAcknowledged:false,savePromiseSettled:false,observed:false},holder=[b,state];state.owner=holder;
  const native=Object.freeze([Object.getOwnPropertyDescriptor,Object.getOwnPropertyDescriptors,Object.getPrototypeOf,Object.is,Object.hasOwn,Reflect.ownKeys,Reflect.apply,Array.isArray,Map.prototype.get,Map.prototype.has,Map.prototype.forEach,Object.getOwnPropertyDescriptor(Map.prototype,"size").get,Set.prototype.has,Set.prototype.forEach,Object.getOwnPropertyDescriptor(Set.prototype,"size").get,Object.prototype,Array.prototype,Map.prototype,Set.prototype]);
  return{net,shapes,page,holder,native,dispatcher,tamperIterator(){page.fixtureOpaquePeer=42;const values=Array.prototype.values;Array.prototype[Symbol.iterator]=function(){return Reflect.apply(values,typeof this[0]==="symbol"?this:[],[])};},run(){return shapes.baseWatch()},spawnForeign(){const n=new Owner,d=new Dispatcher({}),s={bboxMonitor:Object.assign(Object.create(bboxMethods),{_onUpdate:d})};Object.setPrototypeOf(n,watchMethods);n.shapeManager=s;n._watchSubscriptions=n.register(new Owner);n.watch();return d._listenerSubscriptions[0].cb}};
 })();`;
 }
