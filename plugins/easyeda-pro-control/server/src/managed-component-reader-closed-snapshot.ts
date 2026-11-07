/** Component capture has its own genuine source/checkpoint and result profile.
 * It cannot enter the existing PCB/standalone-Pad provider through an alias. */
import { types } from "node:util";
import { sha256Json } from "./core.ts";
import { assertOriginalGeneratedComponentFixtureTarget, qualifyGeneratedComponentFixtureInitialSql } from "./managed-component-fixture-initial-sql.ts";
import type { QualifiedGeneratedComponentFixtureTarget } from "./managed-component-fixture-initial-sql.ts";
import { assertOriginalGeneratedComponentFixtureOpenCheckpoint } from "./managed-component-fixture-generated-open-checkpoint.ts";
import type { GeneratedComponentFixtureOpenCheckpoint } from "./managed-component-fixture-generated-open-checkpoint.ts";
import { captureGeneratedReaderClosedData, generatedReaderClosedOwnData as data, requireGeneratedReaderClosedQualificationData } from "./managed-generated-reader-closed-data.ts";

export interface ComponentReaderClosedCaptureOptions {
  readonly source: Readonly<{ qualification: QualifiedGeneratedComponentFixtureTarget; archive: Buffer }>;
  readonly prepared: GeneratedComponentFixtureOpenCheckpoint;
  readonly assertOriginalOwner: () => void;
  readonly observeOriginalTermination: () => Promise<void>;
}
export async function captureGeneratedComponentReaderClosedSnapshot(options: ComponentReaderClosedCaptureOptions): Promise<Readonly<Record<string, unknown>>> {
  const names = ["source", "prepared", "assertOriginalOwner", "observeOriginalTermination"] as const, sourceNames = ["qualification", "archive"] as const;
  const original = data(options, names);
  const source = data(original["source"], sourceNames);
  const assertOriginalOwner = original["assertOriginalOwner"], observeOriginalTermination = original["observeOriginalTermination"];
  if (typeof assertOriginalOwner !== "function" || typeof observeOriginalTermination !== "function" || types.isProxy(assertOriginalOwner) || types.isProxy(observeOriginalTermination) || !Buffer.isBuffer(source["archive"]) || types.isProxy(source["archive"])) { throw new Error("Generated Component reader closed capture refused: original closure callbacks and archive."); }
  const qualification = options.source.qualification; requireGeneratedReaderClosedQualificationData(qualification);
  const prepared = options.prepared;
  const archive = Buffer.from(source["archive"]);
  const current = (): void => {
    const now = data(options, names);
    const next = data(now["source"], sourceNames);
    if (names.some(name => now[name] !== original[name]) || sourceNames.some(name => next[name] !== source[name])) { throw new Error("Generated Component reader closed capture refused: original callback/source/checkpoint identities."); }
    assertOriginalGeneratedComponentFixtureTarget(qualification); assertOriginalGeneratedComponentFixtureOpenCheckpoint(prepared);
    if (prepared.qualification !== qualification) { throw new Error("Generated Component reader closed capture refused: original prepared qualification."); }
    Reflect.apply(assertOriginalOwner, undefined, []);
  };
  current();
  const report = await captureGeneratedReaderClosedData(Object.freeze({ target: qualification.target, archive, originalQualificationSha256: sha256Json(qualification),
    reportSchema: "easyeda-pro-control.generated-component-reader-closed-snapshot.v1", artifactKind: "generated-component-reader-closed", assertCurrent: current,
    observeOriginalTermination: async (): Promise<void> => { current(); await Reflect.apply(observeOriginalTermination, undefined, []); current(); },
    qualifyInitial: qualifyGeneratedComponentFixtureInitialSql }));
  current(); return { ...report, originalPreparationCheckpointSha256: prepared.preparationCheckpoint.sha256 };
}
