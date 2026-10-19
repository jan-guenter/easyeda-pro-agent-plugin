/** Fixed synthetic owner boundary. No executable is opened or child spawned. */
import type { VerifiedMachineNode } from "../../src/machine-profile.ts";

export { MachineProfileError } from "../../src/machine-profile.ts";

interface NodeState {
  readonly node: VerifiedMachineNode;
  assertions: number;
  closes: number;
}
export const state = {
  acquisitions: 0, nodes: [] as NodeState[], acquireFailure: undefined as Error | undefined,
  assertionFailure: undefined as Error | undefined, closeFailure: undefined as Error | undefined,
  beforeAssert: undefined as (() => Promise<void>) | undefined,
};
export function reset(): void {
  state.acquisitions = 0; state.nodes.length = 0;
  state.acquireFailure = undefined; state.assertionFailure = undefined; state.closeFailure = undefined; state.beforeAssert = undefined;
}
export function retainCurrentProcessSqlNode(): Promise<VerifiedMachineNode> {
  state.acquisitions += 1;
  if (state.acquireFailure !== undefined) { return Promise.reject(state.acquireFailure); }
  const owned: NodeState = { assertions: 0, closes: 0, node: Object.freeze({
    runtime: Object.freeze({ nodeExecutable: process.execPath, nodeVersion: "24.18.0", nodeSha256: "a".repeat(64) }),
    descriptorPath: "/synthetic/not-executable",
    assertCurrent: async (): Promise<void> => {
      owned.assertions += 1; await state.beforeAssert?.();
      if (state.assertionFailure !== undefined) { throw state.assertionFailure; }
    },
    close: (): Promise<void> => {
      owned.closes += 1;
      return state.closeFailure === undefined ? Promise.resolve() : Promise.reject(state.closeFailure);
    },
  }) };
  state.nodes.push(owned); return Promise.resolve(owned.node);
}
