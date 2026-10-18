/** Historical SCH-container DOCHEAD shape only. This is not a sheet header or
 * evidence of current producer, actor, clock, process or writer authority.
 * Worker b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928:
 * xt/of.head at UTF-16 241441/619874 passes a truthy user through; oN at649563
 * selects SCH. Preserve the bounded historical four-string account object.
 * Fresh Dg inherits Pi's captured user at1856199; construction at2105145 precedes
 * subscribe at2115300. Fresh writer headers omit user only under that separately
 * proved lifecycle, never because an earlier header contained another account.
 */
import { z } from "zod";

const time = z.number().int().nonnegative().max(8_640_000_000_000_000).refine(value => !Object.is(value, -0));
const storedUser = z.object({ uuid: z.string().regex(/^[a-f0-9]{32}$/u),
  nickname: z.string().max(1024), username: z.string().max(1024), avatar: z.string().max(4096) }).strict();
export const currentSchematicStoredHeaderSchema = z.object({ docType: z.literal("SCH"), client: z.string().regex(/^[a-f0-9]{16}$/u),
  uuid: z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u), updateTime: time, version: z.string().min(1).max(128),
  editVersion: z.string().min(1).max(128).optional(), user: storedUser.optional() }).strict();
