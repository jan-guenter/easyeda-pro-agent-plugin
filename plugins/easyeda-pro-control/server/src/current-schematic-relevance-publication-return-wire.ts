/** Reuse exact passive publisher rows and its already armed continuation.
 * This tail cannot arm another callee or release the final local loopback. */
import { CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_CONTROL_REQUESTS as CONTROL } from "./current-schematic-relevance-publication-control-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_NATIVE_REQUESTS as NATIVE } from "./current-schematic-relevance-publication-native-protocol.ts";
import { currentSchematicRelevancePublicationWire } from "./current-schematic-relevance-publication-wire.ts";
import type { CurrentSchematicRelevancePublicationCommand } from "./current-schematic-relevance-publication-wire.ts";

/** Validate the original command first, then admit only passive rows and the
 * four source-ordered resumes in the separately bounded native return ledger. */
export function currentSchematicRelevancePublicationReturnWire(input:unknown,id:number):Readonly<{command:CurrentSchematicRelevancePublicationCommand;request:Readonly<Record<string,string|number>>}>{
 const wire=currentSchematicRelevancePublicationWire(input,id);const command=wire.command;
 if(command.phase==="publication-control-function"||command.phase==="publication-control-possible"||command.phase==="publication-control-return"){throw new Error("SCH_PUBLICATION_RETURN_NO_SETUP");}
 return {command,request:{...wire.request,action:"schematic-relevance-publication-return"}};
}
const stages=5;const nativeReproofs=10;const reads=stages*CONTROL.perStage;const nativeReads=nativeReproofs*NATIVE.reproofReads;const helpers=reads+nativeReads;const controls=stages+1;
export const CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_RETURN_REQUESTS=Object.freeze({stages,perStage:CONTROL.perStage,reads,nativeReproofs,nativeReads,helpers,resumes:0,controls,total:2*helpers+controls});
