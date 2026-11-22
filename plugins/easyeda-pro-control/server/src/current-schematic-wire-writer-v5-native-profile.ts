/** New readonly birth. The entire immutable V4 finite roster remains a
 * separate inherited reservation; globals cannot spend its unused lanes. */
import {CURRENT_SCHEMATIC_WIRE_WRITER_V4_NATIVE_PROFILE as V4} from "./current-schematic-wire-writer-v4-native-profile.ts";
import {CURRENT_SCHEMATIC_WIRE_V5_TITLE_REQUESTS as TITLE} from "./current-schematic-wire-v5-title-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_GLOBALS_REQUESTS as GLOBALS} from "./current-schematic-wire-globals-protocol.ts";

export const CURRENT_SCHEMATIC_WIRE_WRITER_V5_NATIVE_PURPOSE="schematic-wire-writer-v5-209";
const pollsPerRead=5000/20;
const titleCdp=(TITLE.normal+TITLE.cleanup)*5;
const runtimeIdlePolls=30_000/20;
export const CURRENT_SCHEMATIC_WIRE_WRITER_V5_NATIVE_PROFILE=Object.freeze({
 purpose:CURRENT_SCHEMATIC_WIRE_WRITER_V5_NATIVE_PURPOSE,nativeSwitch:"-SchematicWireWriterV5",main:V4.main,
 renderer:Object.freeze({...V4.renderer,globals:GLOBALS,total:V4.renderer.total+GLOBALS.cdpRequests+titleCdp}),
 globals:Object.freeze({pollsPerRead,polls:GLOBALS.cdpRequests*pollsPerRead,controls:GLOBALS.cdpRequests*(pollsPerRead+1)+2,events:GLOBALS.events}),
 title:Object.freeze({normal:TITLE.normal,cleanup:TITLE.cleanup,commands:TITLE.normal+TITLE.cleanup,runtimeIdlePolls,continuityChecks:(TITLE.normal+TITLE.cleanup)*2,cdpRequests:titleCdp,controls:titleCdp*(pollsPerRead+1)+runtimeIdlePolls,events:(TITLE.normal+TITLE.cleanup)*3+2*84}),
 nativeControls:30_000+(GLOBALS.cdpRequests+titleCdp)*(pollsPerRead+1)+2+runtimeIdlePolls,
 originalTailReservationComplete:false,executionAuthorized:false,saveAuthorized:false,persistenceVerified:false
});
