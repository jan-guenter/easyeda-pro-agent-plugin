/** Twenty-one fixed original-scope requests. The containing runner owns the
 * object group, per-await owner checks and single release/final-owner check. */
import type { CurrentPcbDiagnosticModelCommand } from "./current-pcb-diagnostic-model-runner.ts";
import { CURRENT_PCB_TEARDROP_CALLBACK_SELECTOR, CURRENT_PCB_TEARDROP_OWNER_ASSOCIATION } from "./current-pcb-teardrop-owner-program.ts";
import { decodeCurrentPcbTeardropArguments, decodeCurrentPcbTeardropBound, decodeCurrentPcbTeardropCallbacks,
  decodeCurrentPcbTeardropHandle, decodeCurrentPcbTeardropTarget } from "./current-pcb-teardrop-owner-scope.ts";

const EFFECTS = Object.freeze({ throwOnSideEffect: true, silent: true, awaitPromise: false,
  generatePreview: false, userGesture: false } as const);
export async function observeCurrentPcbTeardropOwner(request: (command: CurrentPcbDiagnosticModelCommand) => Promise<unknown>,
  scope: string, wrapper: string, scriptId: string): Promise<string> {
  const properties = (objectId: string): Promise<unknown> => request({ modelPhase: "properties", method: "Runtime.getProperties",
    params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  const callbacks = decodeCurrentPcbTeardropHandle(await request({ modelPhase: "teardrop-callbacks", method: "Runtime.callFunctionOn",
    params: { ...EFFECTS, objectId: scope, functionDeclaration: CURRENT_PCB_TEARDROP_CALLBACK_SELECTOR, returnByValue: false,
      arguments: [{ objectId: wrapper }] } }), 6);
  const handles = decodeCurrentPcbTeardropCallbacks(await properties(callbacks));
  const retained: ReturnType<typeof decodeCurrentPcbTeardropBound>[] = [];
  for (const [index, handle] of handles.entries()) {
    const bound = decodeCurrentPcbTeardropBound(await properties(handle), index);
    decodeCurrentPcbTeardropTarget(await properties(bound.targetId), scriptId, index);
    decodeCurrentPcbTeardropArguments(await properties(bound.argumentsId), index); retained.push(bound);
  }
  const [first, second, third, fourth, fifth, sixth] = retained;
  if (first === undefined || second === undefined || third === undefined || fourth === undefined || fifth === undefined || sixth === undefined) {
    throw new Error("PCB_TEARDROP_OWNER_INCOMPLETE");
  }
  return decodeCurrentPcbTeardropHandle(await request({ modelPhase: "teardrop-owner", method: "Runtime.callFunctionOn",
    params: { ...EFFECTS, objectId: scope, functionDeclaration: CURRENT_PCB_TEARDROP_OWNER_ASSOCIATION, returnByValue: false,
      arguments: [{ objectId: wrapper }, { objectId: callbacks },
        { objectId: first.ownerId }, { objectId: second.ownerId }, { objectId: third.ownerId },
        { objectId: fourth.ownerId }, { objectId: fifth.ownerId }, { objectId: sixth.ownerId },
        { objectId: first.targetId }, { objectId: second.targetId }, { objectId: third.targetId },
        { objectId: fourth.targetId }, { objectId: fifth.targetId }, { objectId: sixth.targetId }] } }), 3);
}
