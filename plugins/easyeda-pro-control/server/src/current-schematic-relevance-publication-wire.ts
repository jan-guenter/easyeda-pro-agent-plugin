/** One original own7 publication route. Neither protocol accepts caller
 * JavaScript, flags, source points or a different application purpose. */
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import {currentSchematicRelevancePublicationNativeWire} from "./current-schematic-relevance-publication-native-wire.ts";
import type {CurrentSchematicRelevancePublicationNativeCommand} from "./current-schematic-relevance-publication-native-protocol.ts";
import {currentSchematicRelevancePublicationControlWire} from "./current-schematic-relevance-publication-control-wire.ts";
import type {CurrentSchematicRelevancePublicationControlCommand} from "./current-schematic-relevance-publication-control-protocol.ts";

export type CurrentSchematicRelevancePublicationCommand=CurrentSchematicRelevancePublicationNativeCommand|CurrentSchematicRelevancePublicationControlCommand;
/** Select only a strict fixed protocol from immutable input data, then encode
 * the exact original publication action and bounded request identifier. */
export function currentSchematicRelevancePublicationWire(input:unknown,id:number):ReturnType<typeof currentSchematicRelevancePublicationNativeWire>|ReturnType<typeof currentSchematicRelevancePublicationControlWire>{const value=captureCurrentPcbStringClockReply(input).value;if(value===null||typeof value!=="object"||Array.isArray(value)){throw new Error("SCH_PUBLICATION_COMMAND");}const phase:unknown=Reflect.get(value,"phase");if(typeof phase!=="string"){throw new TypeError("SCH_PUBLICATION_PHASE");}return phase.startsWith("publication-native-")?currentSchematicRelevancePublicationNativeWire(value,id):currentSchematicRelevancePublicationControlWire(value,id);}
