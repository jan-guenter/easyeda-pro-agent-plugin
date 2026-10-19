import { z } from "zod";

export const CURRENT_PCB_PAD_POLYGON_MAX_TOKENS = 2048;
export type CurrentPcbPadPolygonToken = number | "L" | "ARC" | "CARC" | "C" | "CIRCLE";

/** Grammar emitted by PCB217199c8 $1 at4006345, not the broader SDK input
 * grammar. The original ordered token array is retained without tessellation,
 * closure repair, placement transforms or arc/Bezier conversion.
 */
export function currentPcbPadPolygonGrammar(path: readonly CurrentPcbPadPolygonToken[]): boolean {
  if (path.length === 0) { return true; }
  if (path[0] === "CIRCLE") { return path.length === 4 && path.slice(1).every((value) => typeof value === "number") && typeof path[3] === "number" && path[3] >= 0; }
  if (typeof path[0] !== "number" || typeof path[1] !== "number") { return false; }
  let offset = 2;
  while (offset < path.length) {
    const command = path[offset];
    if (command !== "L" && command !== "ARC" && command !== "CARC" && command !== "C") { return false; }
    offset += 1;
    const start = offset;
    while (typeof path[offset] === "number") { offset += 1; }
    const count = offset - start;
    if (command === "ARC" || command === "CARC") {
      if (count !== 3) { return false; }
    } else if (count < 2 || count % 2 !== 0) { return false; }
  }
  return offset > 2;
}

export function createCurrentPcbPadPolygonPathSchema(numberSchema: z.ZodType<number>): z.ZodType<CurrentPcbPadPolygonToken[]> {
  return z.array(z.union([numberSchema, z.enum(["L", "ARC", "CARC", "C", "CIRCLE"])]))
    .max(CURRENT_PCB_PAD_POLYGON_MAX_TOKENS)
    .refine(currentPcbPadPolygonGrammar, "Unsupported native pad polygon token sequence.");
}

/** The parent program supplies own, num, bad and its captured childArrayPrototype.
 * Descriptor checks happen before copying; no accessor or SDK polygon object
 * is evaluated. Grammar is independently checked again by the host schema.
 */
export const CURRENT_PCB_PAD_POLYGON_PROGRAM = `
const padPolygonPath=value=>{
 const prototype=Object.getPrototypeOf(value??{});
 if(!Array.isArray(value)||(prototype!==Array.prototype&&prototype!==childArrayPrototype))bad();
 const length=own(value,'length');
 if(!Number.isInteger(length)||length<0||length>${CURRENT_PCB_PAD_POLYGON_MAX_TOKENS}||Reflect.ownKeys(value).length!==length+1)bad();
 const path=[];
 for(let i=0;i<length;i++){
  const token=own(value,String(i));
  if(typeof token==='number')path.push(num(token));
  else if(token==='L'||token==='ARC'||token==='CARC'||token==='C'||token==='CIRCLE')path.push(token);
  else bad();
 }
 if(length===0)return path;
 if(path[0]==='CIRCLE'){
  if(length!==4||!path.slice(1).every(token=>typeof token==='number')||path[3]<0)bad();
  return path;
 }
 if(typeof path[0]!=='number'||typeof path[1]!=='number')bad();
 let offset=2;
 while(offset<length){
  const command=path[offset];if(command!=='L'&&command!=='ARC'&&command!=='CARC'&&command!=='C')bad();
  offset++;const start=offset;while(typeof path[offset]==='number')offset++;
  const count=offset-start;
  if(command==='ARC'||command==='CARC'){if(count!==3)bad();}
  else if(count<2||count%2!==0)bad();
 }
 if(offset===2)bad();return path;
};
`;

export const CURRENT_PCB_PAD_POLYGON_LIMITATION = "POLYGON defaultCopperShape retains the complete bounded native pathSource and coordinateSpace native-pad-style. Its existing serializer chooses the last available style in layer order 1, 2, 15; this is not a per-layer copper stack. Coordinates/radii are mil and ARC/CARC sweep is degrees, rounded by native serialization to four decimal places. Path tokens preserve L, ARC, CARC, variable-degree C and CIRCLE without converting, closing, rotating, translating or mirroring them; pad x/y/rotation remain separate observations. The native serializer can omit tiny or unsupported segments, so exact token equality is not complete model/rendered geometry or manufacturability proof. Empty serialized paths remain empty observations. At most 2048 tokens per pad, subject to the complete evidence byte bound. Nested complex paths and R are not emitted by this pinned route and refuse. No SDK polygon constructor, path decoder, create-area getter, outline refresh or additional native topic is invoked. Physical-layer stacks, effective inherited/mirrored transforms and complete saved source remain unverified.";
