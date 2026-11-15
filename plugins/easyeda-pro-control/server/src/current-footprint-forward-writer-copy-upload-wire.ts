/** Reuse only the fixed upload data grammar. Its full action has an independent
 * original producer registry and cannot dispatch through a Via owner. */
import { currentPcbViaUploadRequestWire } from "./current-pcb-via-upload-request-wire.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentFootprintForwardWriterCopyUploadWire(input: unknown, id: number): ReturnType<typeof currentPcbViaUploadRequestWire> {
  const original = currentPcbViaUploadRequestWire(input, id);
  return freezeDeep({ command: original.command, request: { ...original.request, action: "footprint-forward-copy-upload" } });
}
