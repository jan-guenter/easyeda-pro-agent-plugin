/** Test-only ordering for inert Inspector workers. */
export function wireFixtureCallQueue(): <T>(call: () => Promise<T>) => Promise<T> {
  let previous: Promise<null> = Promise.resolve(null);
  return async <T>(call: () => Promise<T>): Promise<T> => {
    const before = previous, released = Promise.withResolvers<null>();
    previous = released.promise;
    await before;
    try { return await call(); } finally { released.resolve(null); }
  };
}

/** Publish the original terminal outcome only after the same cleanup settles.
 * A timeout and the main task share one publication and one cleanup attempt. */
export function wireFixtureCompletion(
  cleanup: () => Promise<void>,
  publish: (result: Readonly<Record<string, unknown>>) => void,
): (result: Readonly<Record<string, unknown>>) => Promise<void> {
  let completion: Promise<void> | null = null;
  return (result: Readonly<Record<string, unknown>>): Promise<void> => {
    if (completion !== null) { return completion; }
    const task = (async (): Promise<void> => {
      try { await cleanup(); } catch (error) {
        publish({ ...result,
          fixtureError: Object.hasOwn(result, "fixtureError") ? result["fixtureError"] : "Wire fixture cleanup failed",
          fixtureCleanupError: error instanceof Error ? error.stack : String(error),
        });
        return;
      }
      publish(result);
    })();
    completion = task;
    return task;
  };
}

/** Attach a rejection observer before arm can fail; cleanup still joins the
 * unchanged original run Promise and retains its original failure. */
export async function observeWireFixtureTask(task: Promise<unknown>): Promise<void> {
  try { await task; } catch {
    // The worker reports the original arm/run failure after cleanup settles.
  }
}
