/** Fixed209 passive common readers. The inherited graph labels identify
 * reviewed semantic roles, not current lexical names. Only the descriptor
 * lookup is translated; all bounds, empty-selector and no-shadow checks stay.
 * No vendor getter, serializer, repair, Save or user-supplied program is run. */
import { CURRENT_PCB_209_COMMON_ALIASES, CURRENT_PCB_209_COMMON_CONSTRUCTORS } from "./current-pcb-209-common-profile.ts";
import { CURRENT_PCB_COMMON_METADATA_FUNCTION } from "./current-pcb-common-metadata.ts";
import { CURRENT_PCB_COMMON_PACKET_SEEDS } from "./current-pcb-common-packet-program.ts";
import { CURRENT_PCB_COMMON_PREFERENCE_FUNCTION, CURRENT_PCB_COMMON_PRESENTATION_FUNCTION,
  CURRENT_PCB_COMMON_RULES_FUNCTION } from "./current-pcb-common-state.ts";
import { CURRENT_PCB_CONSTRUCTOR_ASSOCIATION_PROGRAMS, CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS } from "./current-pcb-constructor-scope.ts";
import { CURRENT_PCB_STRING_EMPTY_ASSETS_FUNCTION } from "./current-pcb-string-empty-assets.ts";

function replaceOnce(source: string, old: string, replacement: string): string {
  if (source.split(old).length !== 2) { throw new Error("PCB209_COMMON_PROGRAM_SOURCE"); }
  return source.replace(old, replacement);
}
let association = CURRENT_PCB_CONSTRUCTOR_ASSOCIATION_PROGRAMS.common;
for (const [role, profile] of Object.entries(CURRENT_PCB_209_COMMON_CONSTRUCTORS)) {
  association = replaceOnce(association, JSON.stringify([role, 0, {}]), JSON.stringify([profile.name, 0, {}]));
}

function adapt(source: string): string {
  const lookup = 'klass=n=>{const c=own(scope,n);if(typeof c!=="function")bad();return c;}';
  const translated = `klass=n=>{const aliases=${JSON.stringify(CURRENT_PCB_209_COMMON_ALIASES)};if(!Object.hasOwn(aliases,n))bad();const c=own(scope,aliases[n]);if(typeof c!=="function")bad();return c;}`;
  let result = replaceOnce(source, lookup, translated);
  if (result.includes(CURRENT_PCB_CONSTRUCTOR_ASSOCIATION_PROGRAMS.common)) {
    result = replaceOnce(result, CURRENT_PCB_CONSTRUCTOR_ASSOCIATION_PROGRAMS.common, association);
  }
  // The unit holder is data, so it deliberately does not use the class lookup.
  if (result.includes('own(scope,"_Fe")')) { result = replaceOnce(result, 'own(scope,"_Fe")', 'own(scope,"kFe")'); }
  return result;
}

let constructorFunction = CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS.common;
for (const [role, profile] of Object.entries(CURRENT_PCB_209_COMMON_CONSTRUCTORS)) {
  constructorFunction = replaceOnce(constructorFunction, JSON.stringify([role, role, profile.owner, 0, {}]),
    JSON.stringify([role, profile.name, profile.owner, 0, {}]));
}
export const CURRENT_PCB_209_COMMON_CONSTRUCTOR_FUNCTION = constructorFunction;

export const CURRENT_PCB_209_COMMON_PRESENTATION_FUNCTION = adapt(CURRENT_PCB_COMMON_PRESENTATION_FUNCTION);
export const CURRENT_PCB_209_COMMON_RULES_FUNCTION = adapt(CURRENT_PCB_COMMON_RULES_FUNCTION);
export const CURRENT_PCB_209_COMMON_PREFERENCE_FUNCTION = adapt(CURRENT_PCB_COMMON_PREFERENCE_FUNCTION);
export const CURRENT_PCB_209_COMMON_METADATA_FUNCTION = adapt(CURRENT_PCB_COMMON_METADATA_FUNCTION);
export const CURRENT_PCB_209_COMMON_EMPTY_ASSETS_FUNCTION = adapt(CURRENT_PCB_STRING_EMPTY_ASSETS_FUNCTION);
export const CURRENT_PCB_209_COMMON_PACKET_SEEDS = Object.freeze({
  presentation: adapt(CURRENT_PCB_COMMON_PACKET_SEEDS.presentation),
  rules: adapt(CURRENT_PCB_COMMON_PACKET_SEEDS.rules),
  preference: adapt(CURRENT_PCB_COMMON_PACKET_SEEDS.preference),
});
