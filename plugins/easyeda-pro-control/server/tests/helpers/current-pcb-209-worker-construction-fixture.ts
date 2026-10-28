import { workerConstructionFixtureSource } from "./current-pcb-worker-construction-fixture.ts";

/** Inert unchanged vendor excerpts at the separately reviewed209 positions.
 * The changed production text is not executed: padding moves the later spans
 * and newline positions, including the actual line108 serial breakpoint. */
export function worker209ConstructionFixtureSource(publisherMethods = false): string {
  const legacy = workerConstructionFixtureSource(publisherMethods);
  // Synthetic own-data layout for the separately pinned Tg/Pi and ja/Vc
  // Relationships. It does not execute a production getter or mutate a design.
  const layout = `var Pi=class Pi{constructor(p){this.projectManager=p;this.client=p.consistencyManager.client;this.user=p.user;}};var ar=class ar extends Pi{};Tg=class Tg extends ar{};var zy=class zy{};var Vc=class Vc extends zy{constructor(){super();this.maxTicket=0;this.client="1234567890abcdef";}};ja=class ja extends Vc{constructor(){super();this.orderTree={orderChange(){}};}setCacheData(e){this.getCache=e;}onHeadChange(){}onChange(){}};`;
  const prepared = legacy.slice(0, 1000) + layout + legacy.slice(1000 + layout.length);
  return `${prepared.slice(0, 1_800_000)}${" ".repeat(24)}${prepared.slice(1_800_000)}`;
}

/** Exact registration bodies execute against the inert synthetic consistency
 * object. Their original Lg caller and callback arguments are real V8 events. */
export function footprintCopyConstructionFixtureSource(): string {
  let source = worker209ConstructionFixtureSource();
  const put = (offset: number, value: string): void => { source = source.slice(0, offset) + value + source.slice(offset + value.length); };
  put(276_000, 'ja=class ja extends Vc{constructor(){super();this.orderTree={orderChange(){}};this.headCbArr=[];this.cbArr=[];}setCacheData(e){this.getCache=e;}');
  put(276_360, 'onHeadChange(e){this.headCbArr.push(e)}');
  put(295_782, 'onChange(e){this.cbArr.push(e)}');
  put(295_813, '};');
  return source;
}
