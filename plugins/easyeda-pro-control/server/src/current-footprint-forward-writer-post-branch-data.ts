/** Exact observed post-copy branch. This inert comparison grants no native
 * request; the original completion and Main reader must supply its inputs. */
import { z } from "zod";
import { sha256Text } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import type { CurrentFootprintForwardWriterBranchData } from "./current-footprint-forward-writer-branch-data.ts";

export function compareCurrentFootprintForwardWriterPostBranchData(before: CurrentFootprintForwardWriterBranchData, historyUuid: string, body: string): CurrentFootprintForwardWriterBranchData {
 if (!/^[a-f\d]{32}$/u.test(historyUuid) || historyUuid === before.historyUuid || !body.isWellFormed() || Buffer.byteLength(body) > 4096 || sha256Text(before.body) !== before.sha256) { throw new Error("FORWARD_WRITER_POST_BRANCH_INPUT"); }
 const scalar = z.union([z.string().max(1024),z.number().int(),z.boolean(),z.null()]);
 const read = (text: string): Record<string,z.infer<typeof scalar>> => { const parsed: unknown = JSON.parse(text); return z.record(z.string(),scalar).parse(captureCurrentPcbStringClockReply(parsed).value); };
 const actual = read(body), original = read(before.body);
 const newId = actual["project_histories_id"], oldId = original["project_histories_id"];
 if (JSON.stringify(actual) !== body || typeof oldId !== "number" || typeof newId !== "number" || !Number.isSafeInteger(newId) || newId <= oldId || actual["history_uuid"] !== historyUuid || original["history_uuid"] !== before.historyUuid) { throw new Error("FORWARD_WRITER_POST_BRANCH_HISTORY"); }
 const replaced = { ...actual, history_uuid: original["history_uuid"], project_histories_id: oldId };
 if (JSON.stringify(replaced) !== before.body) { throw new Error("FORWARD_WRITER_POST_BRANCH_COLLATERAL"); }
 return freezeDeep({ projectUuid:before.projectUuid,branchUuid:before.branchUuid,historyUuid,body,sha256:sha256Text(body),observedLocalOffsetMinutes:before.observedLocalOffsetMinutes,writerClockAuthority:false });
}
