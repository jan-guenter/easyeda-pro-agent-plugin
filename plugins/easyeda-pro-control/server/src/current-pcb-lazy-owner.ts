/** Own lazy-manager state, never a substitute for an inspected empty instance.
 * FP/ON and MI/w4 initialize their manager to null in PCB217199c8. Absent and
 * own undefined remain unavailable observations, not native initialization. */
import { z } from "zod";

/** Internal fixed leaf fragment. `bad` is supplied by the containing reader.
 * Only the source-captured class's fixed manager property is inspected. */
export const CURRENT_PCB_LAZY_OWNER_GUARDS = `
const lazyOwners=[],lazyOwnerPrototypes=[];
const lazyOwner=c=>{if(typeof c!=="function")bad();const d=Object.getOwnPropertyDescriptor(c,"manager");
if(d&&!Object.hasOwn(d,"value"))bad();
if(!d){let p=c,n=0;while(p!==null){if(++n>8||Object.hasOwn(p,"manager"))bad();const next=Object.getPrototypeOf(p);lazyOwnerPrototypes.push([p,next]);p=next;}}
lazyOwners.push([c,d]);const v=d?d.value:undefined;
return {marker:!d?"absent":v===undefined?"undefined":v===null?"null":"present",value:v};};
const verifyLazyOwners=()=>{for(const [c,d]of lazyOwners){const n=Object.getOwnPropertyDescriptor(c,"manager");
if(!d){if(n!==undefined)bad();let p=Object.getPrototypeOf(c),i=0;while(p!==null){if(++i>8||Object.hasOwn(p,"manager"))bad();p=Object.getPrototypeOf(p);}}
else if(!n||!Object.hasOwn(n,"value")||!Object.is(n.value,d.value)||n.writable!==d.writable||n.configurable!==d.configurable||n.enumerable!==d.enumerable)bad();}
for(const [o,p]of lazyOwnerPrototypes)if(Object.getPrototypeOf(o)!==p)bad();};
`;

const unavailableOwner = z.object({ manager: z.enum(["absent", "undefined", "null"]), state: z.null() }).strict();
type PresentOwnerSchema<T extends z.ZodType> = z.ZodObject<{ manager: z.ZodLiteral<"present">; state: T }, z.core.$strict>;
export function currentPcbLazyOwnerSchema<T extends z.ZodType>(state: T):
z.ZodDiscriminatedUnion<[typeof unavailableOwner, PresentOwnerSchema<T>], "manager"> {
  return z.discriminatedUnion("manager", [
    unavailableOwner,
    z.object({ manager: z.literal("present"), state }).strict(),
  ]);
}
