/** Inert global recent-project row/SQL comparison. Native Date objects are
 * represented here by separately observed primitive data, never recreated. */
import { win32 } from "node:path";
import { z } from "zod";
import { sha256Text } from "./core.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_SQL as SQL } from "./current-saved-project-registration-config-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const target = z.strictObject({ schema: z.literal("private.current-saved-project-registration-target-data.v1"),
  rawWindowsPath: z.string().min(12).max(4096), projectUuid: z.string().regex(/^[a-f\d]{64}$/u),
  fileSourceSha256: z.string().regex(/^[a-f\d]{64}$/u), name: z.string().min(1).max(4096), version: z.string().max(4096),
  systemProjectExcluded: z.literal(true), originalNativeMetadataVerified: z.literal(false), registrationAuthorized: z.literal(false),
});
export type CurrentSavedProjectRegistrationTargetData = z.infer<typeof target>;
const date = z.strictObject({ kind: z.literal("date-data"), epochMilliseconds: z.number().int().min(-8_640_000_000_000_000).max(8_640_000_000_000_000) });
const upsert = z.strictObject({ kind: z.literal("upsert"), sql: z.literal(SQL.upsert),
  parameters: z.tuple([z.string().max(4096), z.string().max(4096), z.string().max(4096), date, date]) });
const query = z.strictObject({ kind: z.literal("query-one"), sql: z.literal(SQL.query), parameters: z.tuple([z.string().max(4096)]) });
const packet = z.discriminatedUnion("kind", [upsert, query]);
function need(value: boolean): asserts value { if (!value) { throw new Error("SAVED_PROJECT_REGISTRATION_CONFIG_DATA"); } }

/** K0's supported filename branch. Refuse its special system-library rename;
 * do not normalize path spelling or invent a semantic-version interpretation. */
export function prepareCurrentSavedProjectRegistrationTargetData(input: unknown, systemLibraryName: unknown): CurrentSavedProjectRegistrationTargetData {
  const sealed = currentDisposableOpenSealedTargetSchema.parse(captureCurrentPcbStringClockReply(input).value);
  need(typeof systemLibraryName === "string" && systemLibraryName.length > 0 && systemLibraryName.length <= 4096 && systemLibraryName.isWellFormed());
  const parsed = win32.parse(sealed.rawWindowsPath);
  const match = /^(.+?)(@([0-9.]+))?$/u.exec(parsed.name);
  need(parsed.ext === ".eprj2" && match?.[1] !== undefined && match[1] !== systemLibraryName);
  return freezeDeep(target.parse({ schema: "private.current-saved-project-registration-target-data.v1", rawWindowsPath: sealed.rawWindowsPath,
    projectUuid: sealed.projectUuid, fileSourceSha256: sealed.expectedSourceSha256, name: match[1], version: match[3] ?? "",
    systemProjectExcluded: true, originalNativeMetadataVerified: false, registrationAuthorized: false }));
}

/** Exact compiler output/parameter ordering, including distinct INSERT/UPDATE
 * Date observations. This comparison cannot prove native Date/callback origin. */
export function compareCurrentSavedProjectRegistrationConfigSql(targetInput: unknown, packetInput: unknown): Readonly<{
  schema: "private.current-saved-project-registration-sql-data.v1"; kind: "upsert" | "query-one";
  targetProjectUuid: string; sqlSha256: string; dateEpochMilliseconds: readonly [number, number] | null;
  suppliedSqlAndTargetDataMatch: true; nativeDateObjectsVerified: false; nativeCallbackCompletionVerified: false;
  sharedProfileMutationProven: false; selectedDesignWriteAuthorized: false;
}> {
  const expected = target.parse(captureCurrentPcbStringClockReply(targetInput).value);
  need(sha256Text(expected.rawWindowsPath) === expected.projectUuid);
  const actual = packet.parse(captureCurrentPcbStringClockReply(packetInput).value);
  need(actual.parameters[actual.kind === "upsert" ? 1 : 0] === expected.rawWindowsPath);
  let clocks: readonly [number, number] | null = null;
  if (actual.kind === "upsert") {
    need(actual.parameters[0] === expected.name && actual.parameters[2] === expected.version);
    clocks = [actual.parameters[3].epochMilliseconds, actual.parameters[4].epochMilliseconds];
  }
  return freezeDeep({ schema: "private.current-saved-project-registration-sql-data.v1", kind: actual.kind,
    targetProjectUuid: expected.projectUuid, sqlSha256: sha256Text(actual.sql), dateEpochMilliseconds: clocks,
    suppliedSqlAndTargetDataMatch: true, nativeDateObjectsVerified: false, nativeCallbackCompletionVerified: false,
    sharedProfileMutationProven: false, selectedDesignWriteAuthorized: false });
}
