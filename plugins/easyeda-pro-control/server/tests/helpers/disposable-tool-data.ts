export function requestData(): { request: {
  action: "run-disposable-once";
  target: { projectPath: string; projectUuid: string; branchUuid: string; ownerUuid: string; symbolUuid: string; companionPcbUuid: string };
  metadata: { name: string; description: string }; confirmDisposableMetadataEdit: true;
} } {
  return { request: { action: "run-disposable-once" as const,
    target: { projectPath: "/synthetic/never-opened.eprj2", projectUuid: "a".repeat(64), branchUuid: "b".repeat(32),
      ownerUuid: "c".repeat(32), symbolUuid: "d".repeat(32), companionPcbUuid: "e".repeat(32) },
    metadata: { name: "Synthetic title", description: "Not a project read or native action." }, confirmDisposableMetadataEdit: true as const } };
}
export function artifactData(): { path: string; bytes: number; sha256: string } {
  return { path: "/synthetic/retained.json", bytes: 100, sha256: "a".repeat(64) };
}
const common = { profile: "easyeda-pro-control.closed-symbol-disposable-result.v1", action: "run-disposable-once",
  replayAllowed: false, executionAuthorized: false, saved: false, reopened: false };
export function stoppedData(): typeof common & {
  outcome: string; phase: string; reason: string; operationId: null; claimState: string;
  claimArtifact: null; terminalArtifact: null; completionProved: boolean;
  historicalCompletionRecorded: string; nextSafeAction: string;
} {
  return { ...common, outcome: "stopped", phase: "admission", reason: "validation-stopped", operationId: null,
    claimState: "not-attempted", claimArtifact: null, terminalArtifact: null, completionProved: false,
    historicalCompletionRecorded: "not-checked", nextSafeAction: "Inspect retained evidence. Do not repeat this request or any native phase." };
}
export function completedData(): typeof common & {
  outcome: string; operationId: string; headEligibility: string; claimState: string;
  claimArtifact: ReturnType<typeof artifactData>; terminalArtifact: ReturnType<typeof artifactData>; bodySha256: string;
  completionProved: boolean; historicalCompletionRecorded: boolean; explicitSavePerformed: boolean; targetEditorOpened: boolean;
} {
  return { ...common, outcome: "completed", operationId: "easyeda-synthetic-original", headEligibility: "locked", claimState: "acknowledged",
    claimArtifact: artifactData(), terminalArtifact: artifactData(), bodySha256: "b".repeat(64), completionProved: true,
    historicalCompletionRecorded: true, explicitSavePerformed: false, targetEditorOpened: false };
}
