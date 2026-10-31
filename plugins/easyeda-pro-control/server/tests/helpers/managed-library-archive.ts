import { managedProjectFootprintArchive } from "./managed-project-footprint-archive.ts";

export const MANAGED_LIBRARY_ARCHIVE_FIXTURE_UUID = "1234567890abcdef1234567890abcdef";
export function managedLibraryArchiveFixture(docType: 2 | 4 = 4): Readonly<{ archive: Buffer; source: string; member: string; manifest: string; prefix: string }> {
  const documentType = docType === 4 ? "FOOTPRINT" : "SYMBOL";
  const header = `${JSON.stringify({ type: "DOCHEAD", ticket: 0 })}||${JSON.stringify({ docType: documentType, uuid: MANAGED_LIBRARY_ARCHIVE_FIXTURE_UUID })}`;
  const metadata = { title: "Supplied archive", description: "Exact supplied metadata", tags: ["Test"], source: "",
    ...(docType === 2 ? { docType: 2 } : {}) };
  const prefix = `${header}|\n${JSON.stringify({ type: "META", ticket: 1, id: "META" })}||${JSON.stringify(metadata)}|\n`;
  const source = `${header}|\n${JSON.stringify({ type: "FUTURE", ticket: 2, id: "future" })}||${JSON.stringify({ text: "Supplied 😀 source", retained: { url: "https://example.invalid/never-follow", value: 17 } })}|\n`;
  const item = { uuid: MANAGED_LIBRARY_ARCHIVE_FIXTURE_UUID, path: "0819f05c4eef4c71ace90d822a990e87", docType,
    ...metadata, future: { retained: true } };
  const map = { [MANAGED_LIBRARY_ARCHIVE_FIXTURE_UUID]: item };
  const manifest = JSON.stringify({ devices: {}, symbols: docType === 2 ? map : {}, footprints: docType === 4 ? map : {}, panelLibs: {}, futureRoot: true });
  const member = "ProLib_pc_2026-10-31.elibu";
  const archive = managedProjectFootprintArchive([{ name: member, content: prefix + source },
    { name: docType === 4 ? "footprint2.json" : "symbol2.json", content: manifest }]);
  return { archive, source, member, manifest, prefix };
}
