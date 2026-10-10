import type { NativeUiRequest } from "./windows-native-ui.ts";

/** Local inspection, focus and normal close already remain available during
 * recovery. They do not use journal state, so do not scan it before those calls.
 * Every other confirmed input requires the engine's complete fresh-byte gate,
 * including terminal journals with retained orphan risk. A state-only list
 * cannot establish that an earlier native dispatch has stopped executing.
 */
export async function runNativeUiWithOperationAdmission<T>(
  request: NativeUiRequest,
  run: (request: NativeUiRequest) => Promise<T>,
  assertEditingAllowed: () => Promise<true>,
): Promise<T> {
  if ("confirmUIWrite" in request && !["focus", "normal-close"].includes(request.action)) {
    await assertEditingAllowed();
  }
  return run(request);
}
