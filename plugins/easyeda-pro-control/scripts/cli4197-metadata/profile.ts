/** Developer-only candidate metadata profile. This separate 4.1.97 catalogue
 * neither changes the connected 209 tuple nor authorizes editor/API execution. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "../../server/src/current-pcb-string-clock-reply.ts";
import { freezeDeep } from "../../server/src/sqlite-inventory-core.ts";

export const CLI4197_METADATA_PROFILE = Object.freeze({
  version: "4.1.97.04b092ac", packageName: "client.pro.lceda.cn", executable: "lceda-pro",
  executableBytes: 196_984_632, executableSha256: "2272fce190ffbd71def6ed2c506d97b2ef035357051d5ed863da45771d730e2a",
  inventoryBytes: 124_752, inventorySha256: "d6120b11f11c0a018a713406cd2498a869c5d9700645deb1665a40a489d154a8",
  runtimeFiles: 580, runtimeBytes: 1_117_239_610,
});
export const CLI4197_METADATA_LIMITS = Object.freeze({ outputBytes: 20_480, reportBytes: 65_536, bootstrapBytes: 32_768,
  outerStderrBytes: 8192, deadlineMilliseconds: 12_000 });
export const CLI4197_METADATA_COMMANDS = freezeDeep({
  rootHelp: ["--help"], openHelp: ["open", "--help"], apiHelp: ["doc", "api", "--help"],
  invokeHelp: ["invoke", "--help"], sessionListHelp: ["session", "list", "--help"],
  viaCreateDocs: ["doc", "api", "--class-name", "PCB_PrimitiveVia", "--method-name", "create"],
} as const);
export type Cli4197MetadataCommand = keyof typeof CLI4197_METADATA_COMMANDS;
const command = z.enum(["rootHelp", "openHelp", "apiHelp", "invokeHelp", "sessionListHelp", "viaCreateDocs"]);
const path = z.string().min(2).max(4096).refine(value => value.startsWith("/") && !/[\0\r\n]/u.test(value));
const options = z.strictObject({ command, runtimeDirectory: path, inventoryPath: path, evidenceParent: path });
export type Cli4197MetadataOptions = z.infer<typeof options>;
/** Only fixed command IDs and developer resource/evidence paths are accepted.
 * There is no argv, code, project, session, endpoint or compatibility override. */
export function parseCli4197MetadataOptions(input: unknown): Cli4197MetadataOptions {
  return freezeDeep(options.parse(captureCurrentPcbStringClockReply(input).value));
}
/** Command-first ordering is required by this candidate's actual CLI parser.
 * Chromium switches are fixed and always follow the complete metadata route. */
export function cli4197MetadataArguments(input: unknown): readonly string[] {
  const id = command.parse(input);
  return Object.freeze([...CLI4197_METADATA_COMMANDS[id], "--no-sandbox", "--ozone-platform=headless", "--disable-gpu"]);
}
