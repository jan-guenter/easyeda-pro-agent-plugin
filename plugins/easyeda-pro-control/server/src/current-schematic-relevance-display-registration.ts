/** The existing combined navigation awaits registration before project/page
 * work. Decode its actual complete reply without inventing another SDK result. */
import { z } from "zod";
import { CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_REQUESTS as MAIN } from "./current-saved-project-registration-config-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { validateGeneratedSchematicNavigation } from "./managed-schematic-fixture-opening-program.ts";
import type { QualifiedGeneratedSchematicRelevanceFixtureTarget } from "./managed-schematic-relevance-fixture-initial-sql.ts";

const navigationEnvelope = z.strictObject({ schema: z.literal("easyeda-pro-control.exact-json.v1"), utf8Bytes: z.number().int().min(1).max(65_536), json: z.string().min(1).refine(value => value.isWellFormed()) });
const valueSchema = z.strictObject({ navigation: navigationEnvelope, documentTitle: z.string().min(1).max(512) });
const remoteSchema = z.strictObject({ type: z.literal("object"), value: valueSchema });
const reply = z.strictObject({ result: remoteSchema });
export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_REGISTRATION_REQUESTS = Object.freeze({ main: MAIN, rendererHelperSource: 1, nativeControls: 2 });
export function decodeCurrentSchematicRelevanceDisplayRegistrationNavigation(input: unknown, qualification: QualifiedGeneratedSchematicRelevanceFixtureTarget): Readonly<{
  navigation: ReturnType<typeof validateGeneratedSchematicNavigation>; documentTitle: string;
}> {
  const value = reply.parse(captureCurrentPcbStringClockReply(input).value).result.value;
  if (Buffer.byteLength(value.navigation.json) !== value.navigation.utf8Bytes) { throw new Error("SCHEMATIC_DISPLAY_REGISTRATION_NAVIGATION_BYTES"); }
  const navigation = validateGeneratedSchematicNavigation(JSON.parse(value.navigation.json) as unknown, qualification);
  if (navigation.registration === null) { throw new Error("SCHEMATIC_DISPLAY_REGISTRATION_RESULT_REQUIRED"); }
  return Object.freeze({ navigation, documentTitle: value.documentTitle });
}
