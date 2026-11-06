/** Offline installed bytes/UTF16 check; no application or worker is run. */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { CURRENT_PROJECT_SAVE_STRUCTURE_SOURCE, qualifyCurrentProjectSaveStructureSource } from "../server/src/current-project-save-structure-source.ts";
// oxlint-disable-next-line node/no-top-level-await -- This standalone source checker awaits its one bounded file read.
qualifyCurrentProjectSaveStructureSource(await readFile(join(process.argv[2] ?? "/mnt/c/Program Files/easyeda-pro/resources/app/assets", CURRENT_PROJECT_SAVE_STRUCTURE_SOURCE.relativePath), "utf8"));
process.stdout.write(`${JSON.stringify({ sourceQualified: true, sites: 6, nativeExecutionVerified: false, writerAuthority: false })}\n`);
