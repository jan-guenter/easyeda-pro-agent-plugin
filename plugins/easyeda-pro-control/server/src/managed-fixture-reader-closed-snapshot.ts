/** Original issued PCB/standalone Pad provider; generic result shapes remain
 * unchanged. Shared file/SQL mechanics issue no project or runtime authority. */
import { types } from "node:util";
import { sha256Json } from "./core.ts";
import { qualifyGeneratedFixtureInitialSql } from "./managed-fixture-initial-sql.ts";
import { qualifyGeneratedPadFixtureInitialSql } from "./managed-pad-fixture-initial-sql.ts";
import { assertOriginalGeneratedPcbReadTarget } from "./managed-pcb-fixture-read-target.ts";
import type { QualifiedGeneratedPcbReadTarget } from "./managed-pcb-fixture-read-target.ts";
import { captureGeneratedReaderClosedData, generatedReaderClosedOwnData as data, requireGeneratedReaderClosedQualificationData } from "./managed-generated-reader-closed-data.ts";

export { decodeGeneratedReaderRawHistory } from "./managed-generated-reader-closed-data.ts";
export interface GeneratedReaderClosedCaptureOptions {
  readonly source: Readonly<{ qualification: QualifiedGeneratedPcbReadTarget; archive: Buffer }>;
  readonly assertOriginalOwner: () => void;
  readonly observeOriginalTermination: () => Promise<void>;
}
export async function captureGeneratedReaderClosedSnapshot(options: GeneratedReaderClosedCaptureOptions): Promise<Readonly<Record<string, unknown>>> {
  const names = ["source", "assertOriginalOwner", "observeOriginalTermination"] as const, sourceNames = ["qualification", "archive"] as const;
  const original = data(options, names);
  const source = data(original["source"], sourceNames);
  const assertOriginalOwner = original["assertOriginalOwner"], observeOriginalTermination = original["observeOriginalTermination"];
  if (typeof assertOriginalOwner !== "function" || typeof observeOriginalTermination !== "function" || types.isProxy(assertOriginalOwner) || types.isProxy(observeOriginalTermination) || !Buffer.isBuffer(source["archive"]) || types.isProxy(source["archive"])) { throw new Error("Generated reader closed capture refused: original closure callbacks and archive."); }
  const qualification = options.source.qualification; requireGeneratedReaderClosedQualificationData(qualification);
  const archive = Buffer.from(source["archive"]); assertOriginalGeneratedPcbReadTarget(qualification);
  const current = (): void => {
    const now = data(options, names);
    const next = data(now["source"], sourceNames);
    if (names.some(name => now[name] !== original[name]) || sourceNames.some(name => next[name] !== source[name])) { throw new Error("Generated reader closed capture refused: original capture callback/source identities."); }
    Reflect.apply(assertOriginalOwner, undefined, []); assertOriginalGeneratedPcbReadTarget(qualification);
  };
  const pad = qualification.schema === "easyeda-pro-control.qualified-generated-pad-fixture-target.v1";
  const report = await captureGeneratedReaderClosedData(Object.freeze({ target: qualification.target, archive, originalQualificationSha256: sha256Json(qualification),
    reportSchema: pad ? "easyeda-pro-control.generated-pad-reader-closed-snapshot.v1" : "easyeda-pro-control.generated-reader-closed-snapshot.v1",
    artifactKind: "generated-reader-closed", assertCurrent: current, observeOriginalTermination: async (): Promise<void> => { current(); await Reflect.apply(observeOriginalTermination, undefined, []); current(); },
    qualifyInitial: pad ? qualifyGeneratedPadFixtureInitialSql : qualifyGeneratedFixtureInitialSql }));
  current(); return report;
}
