/** Test-only transparent delegation. No result, policy or issuer substitution. */
import { sha256Json } from '../../src/core.ts';
import { validateRecordedCaptureEvidence as capture } from '../../src/closed-symbol-recorded-native.ts';
import { validateRecordedTerminationEvidence as termination } from '../../src/closed-symbol-recorded-termination.ts';

export { validateRecordedNativeSource } from '../../src/closed-symbol-recorded-native.ts';
export interface RecordedInvocation {
  readonly kind: 'capture' | 'termination'; readonly ordinal: number; readonly phase: string; readonly attempt: number;
  readonly captureSha256: string; readonly bridgeDispatchSha256: string; readonly nativeSourceSha256: string;
}
const records: RecordedInvocation[] = [];
function record(value: RecordedInvocation): void {
  if (records.length >= 4096) { throw new Error('Synthetic invocation record bound exceeded.'); }
  records.push(Object.freeze(value));
}
export function observedInvocations(): readonly RecordedInvocation[] { return Object.freeze([...records]); }
export function validateRecordedCaptureEvidence(input: Parameters<typeof capture>[0]): ReturnType<typeof capture> {
  const result = capture(input);
  record({ kind: 'capture', ordinal: input.generation.ordinal, phase: input.phase, attempt: input.attempt,
    captureSha256: sha256Json(input.capture), bridgeDispatchSha256: sha256Json(input.bridgeDispatch), nativeSourceSha256: sha256Json(input.source) });
  return result;
}
export function validateRecordedTerminationEvidence(input: Parameters<typeof termination>[0]): ReturnType<typeof termination> {
  const result = termination(input);
  record({ kind: 'termination', ordinal: input.generation.ordinal, phase: 'closed-edit', attempt: 1,
    captureSha256: sha256Json(input.capture), bridgeDispatchSha256: sha256Json(input.bridgeDispatch), nativeSourceSha256: sha256Json(input.source) });
  return result;
}
