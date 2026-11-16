/** Origin-free timer recipes with native DEL's already-incremented maximum.
 * The full writer's pre-Create ticket-advance rule and origins remain strict. */
import {CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_BINDING_PROGRAMS as PURE} from "./current-footprint-forward-writer-ticket-timer-bindings.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

function once(source:string,before:string,after:string):string{if(source.split(before).length!==2){throw new Error("INVERSE_NATIVE_DELETE_TIMER_PREIMAGE");}return source.replace(before,after);}
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_PUBLICATION_TIMER_PROGRAMS=freezeDeep({
 binding:PURE.binding,baseline:PURE.baseline,before:PURE.before,
 entry:once(PURE.entry,'if(maximum<=own(baseline,"6"))bad();','if(maximum!==own(baseline,"6"))bad();'),
 returned:PURE.returned,selfReturned:PURE.selfReturned,
 slot:once(PURE.slot,'if(maximum<own(original,"6"))bad();','if(maximum!==own(original,"6"))bad();'),
});
