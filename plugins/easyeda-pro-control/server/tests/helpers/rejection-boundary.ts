import assert from "node:assert/strict";

/** Preserve a rejected setup/transport cause when a later boundary assertion fails. */
export async function assertRejectsAtBoundary(
  pending: Promise<unknown>,
  assertBoundary: () => void,
): Promise<void> {
  await assert.rejects(pending, (error: unknown): boolean => {
    try {
      assertBoundary();
    } catch (boundaryError) {
      // oxlint-disable-next-line eslint/preserve-caught-error -- Both errors are retained; the original operation failure is the cause, not the secondary assertion.
      throw new AggregateError(
        [error, boundaryError],
        "Operation rejected before the intended test boundary; original rejection retained.",
        { cause: error },
      );
    }
    return true;
  });
}
