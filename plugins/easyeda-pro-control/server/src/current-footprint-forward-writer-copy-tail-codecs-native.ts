import { currentProjectCanvasPendingNativeSource } from "./current-project-canvas-pending-native.ts";
import { currentFootprintForwardWriterCopyPostNativeSource } from "./current-footprint-forward-writer-copy-post-native.ts";
import { currentFootprintForwardWriterBranchQueryNativeSource } from "./current-footprint-forward-writer-branch-query-native.ts";
/** Immutable tail codecs only. Projection excludes all Via owner fields,
 * sender methods, dispatch and admission; a distinct complete birth must own
 * its own ledger before any action can be mounted. */
import { currentFootprintForwardWriterCopyLocalNativeSource } from "./current-footprint-forward-writer-copy-local-native.ts";
import { applyCurrentPcbViaUploadRequestCodecNativeFragment } from "./current-pcb-via-upload-request-native-fragment.ts";
import { applyCurrentPcbViaSaveDrainCodecNativeFragment } from "./current-pcb-via-save-drain-native-fragment.ts";
import { applyCurrentPcbViaPostHistorySyncCodecNativeFragment } from "./current-pcb-via-post-history-sync-native-fragment.ts";
import { applyCurrentPcbViaSaveTailObservationCodecNativeFragment } from "./current-pcb-via-save-tail-observation-native-fragment.ts";

export function currentFootprintForwardWriterCopyTailCodecsNativeSource(): string {
  const anchor = "internal enum EasyedaPcbViaWriteBirth { Original }";
  let source = anchor;
  for (const project of [applyCurrentPcbViaUploadRequestCodecNativeFragment, applyCurrentPcbViaSaveDrainCodecNativeFragment,
    applyCurrentPcbViaPostHistorySyncCodecNativeFragment, applyCurrentPcbViaSaveTailObservationCodecNativeFragment]) { source = project(source); }
  if (!source.endsWith(anchor) || source.split(anchor).length !== 2) { throw new Error("FORWARD_COPY_TAIL_CODEC_PROJECTION"); }
  return currentProjectCanvasPendingNativeSource() + currentFootprintForwardWriterBranchQueryNativeSource() + currentFootprintForwardWriterCopyLocalNativeSource() + source.slice(0, -anchor.length) + currentFootprintForwardWriterCopyPostNativeSource();
}
