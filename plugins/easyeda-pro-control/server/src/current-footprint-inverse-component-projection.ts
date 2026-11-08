/** The closed inverse driver has no Component birth or diagnostic route.
 * Retain only declarations referenced by the common dispatch, with every
 * Component entry refusing before observing its supplied fields. */
import { currentPcbComponentSpatialNativeSource } from "./current-pcb-component-spatial-native-fragment.ts";

const BEGIN = "// BEGIN GENERATED COMPONENT SPATIAL419";
const END = "// END GENERATED COMPONENT SPATIAL419";
export const CURRENT_FOOTPRINT_INVERSE_CLOSED_COMPONENT_NATIVE_SOURCE = `${BEGIN}
// BEGIN CLOSED INVERSE COMPONENT419
public sealed partial class EasyedaDiagnosticOwner {
readonly bool componentSpatial209=false;
string componentPcbSession,componentProject,componentDocument;
int componentStage;
public static EasyedaDiagnosticOwner CreateComponentSpatial209(){throw Error("inverse-component-purpose-closed");}
public void AdmitComponentAction(string action){throw Error("inverse-component-purpose-closed");}
public void AbortComponentSpatial(){throw Error("inverse-component-purpose-closed");}
static string ComponentOriginalId(int id,string encoded){throw Error("inverse-component-purpose-closed");}
void ComponentSession(string session){throw Error("inverse-component-purpose-closed");}
void ComponentDiscovery(string method,string session){throw Error("inverse-component-purpose-closed");}
public static string ComponentSpatialProtocolMessage(int id,string method,string session,string phase,System.Collections.IDictionary fields){throw Error("inverse-component-purpose-closed");}
public void SendComponentSpatial(int id,string method,string session,string phase,System.Collections.IDictionary fields){throw Error("inverse-component-purpose-closed");}
public static string ComponentRegistrationProtocolMessage(int id,string session,string context,string path,string project,string branch,string document,string source){throw Error("inverse-component-purpose-closed");}
public void SendComponentRegistration(int id,string session,string context,string path,string project,string branch,string document,string source){throw Error("inverse-component-purpose-closed");}
public static void VerifyComponentSpatialSmoke(){throw Error("inverse-component-purpose-closed");}
}
// END CLOSED INVERSE COMPONENT419
${END}`;

/** Build-only projection after the original source/installation derivation.
 * Unknown, mixed, cloned, or partially edited Component implementations fail. */
export function projectCurrentFootprintInverseComponentRuntime(input: string): string {
  const first = input.indexOf(BEGIN), last = input.indexOf(END);
  if (first === -1 || last < first || input.includes(BEGIN, first + BEGIN.length) || input.includes(END, last + END.length)) {
    throw new Error("INVERSE_COMPONENT_BLOCK_ROSTER");
  }
  const stop = last + END.length;
  const original = input.slice(first, stop);
  if (original === CURRENT_FOOTPRINT_INVERSE_CLOSED_COMPONENT_NATIVE_SOURCE) { return input; }
  if (original !== currentPcbComponentSpatialNativeSource(false)) { throw new Error("INVERSE_COMPONENT_SOURCE_MISMATCH"); }
  return input.slice(0, first) + CURRENT_FOOTPRINT_INVERSE_CLOSED_COMPONENT_NATIVE_SOURCE + input.slice(stop);
}
