/** Supported historical PCB DOCHEAD data, not a newly generated header.
 * Worker b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928:
 * xt at241441 includes a supplied truthy user without projecting its fields;
 * PCB of.head at619874 passes that object through. This bounded adapter admits
 * Only the observed four-string account shape; unknown/null/partial shapes
 * Remain unsupported. Consumers retain original metadata and raw history bytes.
 * Fresh Pi at1856199 captures user before ordinary subscribe at2115300 assigns
 * project.user. Its new header still omits user under the separately pinned
 * Fresh-worker profile. A historical header user is not the new backend actor.
 */
import { z } from "zod";

const time = z.number().int().nonnegative().max(8_640_000_000_000_000).refine(value => !Object.is(value, -0));
const storedUser = z.object({ uuid: z.string().regex(/^[a-f0-9]{32}$/u),
  nickname: z.string().max(1024), username: z.string().max(1024), avatar: z.string().max(4096) }).strict();
export const currentPcbStoredHeaderSchema = z.object({ docType: z.literal("PCB"), client: z.string().regex(/^[a-f0-9]{16}$/u),
  uuid: z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u), updateTime: time, version: z.string().min(1).max(128),
  editVersion: z.string().min(1).max(128).optional(), user: storedUser.optional() }).strict();
