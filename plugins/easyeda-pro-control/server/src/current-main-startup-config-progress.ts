/** Finite bookkeeping only. The original inspector cursor supplies each
 * source/connection-bound packet and owns its single native continuation. */
import { z } from "zod";
import { CURRENT_MAIN_STARTUP_CONFIG_SQL as SQL, compareCurrentMainStartupConfigSql } from "./current-main-startup-config-sql.ts";

const selected = z.object({ recognized: z.literal(true), role: z.enum(["jb", "dc"]), site: z.enum(["run", "prepare", "prepared", "statementRun", "finalize"]),
  sql: z.string().min(1).max(65_536).nullable(), parametersEmpty: z.boolean(), transactionDepth: z.union([z.literal(0), z.literal(1)]),
  designWriteGrant: z.literal(false), nativeCompletionProven: z.literal(false) }).strict();
export const currentMainStartupConfigSelectionSchema = z.union([z.object({ recognized: z.literal(false) }).strict(), selected]);
export type CurrentMainStartupConfigSelection = z.infer<typeof currentMainStartupConfigSelectionSchema>;
function need(value: boolean): asserts value { if (!value) { throw new Error("MAIN_STARTUP_CONFIG_SEQUENCE"); } }
export class CurrentMainStartupConfigProgress {
  #version = false; #jb = -1; #dc = -1;
  public version(): void { need(!this.#version && this.#jb === -1 && this.#dc === -1); this.#version = true; }
  public bind(role: "jb" | "dc"): void {
    need(this.#version);
    if (role === "jb") { need(this.#jb === -1 && this.#dc === -1); this.#jb = 0; }
    else { need(this.#jb === SQL.scripts.jb.length + 3 && this.#dc === -1); this.#dc = 0; }
  }
  /** Attempt consumption precedes native resume. A refused/ambiguous original
   * call never refunds a sequence position or creates a retry allowance. */
  public consume(input: CurrentMainStartupConfigSelection): boolean {
    const packet = currentMainStartupConfigSelectionSchema.parse(input); if (!packet.recognized) { return false; }
    need(this.#version && packet.parametersEmpty && packet.sql !== null);
    const match = compareCurrentMainStartupConfigSql(packet.role, packet.site, packet.sql, []); need(match !== null);
    if (packet.role === "jb") {
      const scripts = SQL.scripts.jb.length, step = this.#jb; need(this.#dc === -1 && step >= 0 && step < scripts + 3 && packet.site === "run");
      if (step === 0) { need(match.kind === "begin" && packet.transactionDepth === 1); }
      else if (step <= scripts) { need(match.kind === "script" && match.scriptIndex === step - 1 && packet.transactionDepth === 1); }
      else if (step === scripts + 1) { need(match.kind === "expired-broadcast-delete" && packet.transactionDepth === 1); }
      else { need(match.kind === "commit" && packet.transactionDepth === 0); }
      this.#jb += 1;
    } else {
      need(this.#jb === SQL.scripts.jb.length + 3 && this.#dc >= 0 && this.#dc < 4 && packet.transactionDepth === 0);
      if (this.#dc === 0) { need(packet.site === "run" && match.kind === "script" && match.scriptIndex === 0); }
      else if (this.#dc === 1) { need(packet.site === "run" && match.kind === "expired-cookie-delete"); }
      else { need(packet.site === (this.#dc === 2 ? "prepare" : "prepared") && match.kind === "cookie-upsert"); }
      this.#dc += 1;
    }
    return true;
  }
  public complete(): void { need(this.#version && this.#jb === SQL.scripts.jb.length + 3 && this.#dc === 4); }
  public snapshot(): Readonly<Record<string, unknown>> { return Object.freeze({ currentVersionObserved: this.#version, jbCallsConsumed: Math.max(0, this.#jb), dcCallsConsumed: Math.max(0, this.#dc),
    profileSqlOnly: true, cookieUpdatesAdmitted: false, selectedProjectWriteGrant: false, nativeCompletionProven: false }); }
}
