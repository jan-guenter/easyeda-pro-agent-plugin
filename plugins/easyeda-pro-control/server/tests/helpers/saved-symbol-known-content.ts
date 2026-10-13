/** Exact synthetic fixture expectation, independent of the projection code.
 * Native raw-parser parity is retained separately as source-only evidence.
 */
import { IDS, OPERATION } from "./symbol-sql-fixture.ts";

export function knownSyntheticSavedContent(documentTime: number): string {
  const body = { docType: "SYMBOL", client: "c".repeat(16), uuid: IDS.target, updateTime: documentTime, version: String(documentTime),
    editVersion: "3.0", user: { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic" } };
  return [
    `${JSON.stringify({ type: "DOCHEAD", ticket: 102 })}||${JSON.stringify(body)}`,
    `${JSON.stringify({ type: "META", ticket: 101, id: "META" })}||${JSON.stringify({ title: OPERATION.patch.name,
      description: OPERATION.patch.description, tags: ["synthetic"], docType: 2, source: "" })}`,
    `${JSON.stringify({ type: "DOCHEAD", ticket: 101 })}||${JSON.stringify(body)}`,
    '{"type":"LINE","ticket":100,"id":"deleted-shape","firstTicket":90}||',
  ].join("|\n");
}
