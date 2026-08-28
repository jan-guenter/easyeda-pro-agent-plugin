interface AsyncClosable {
  readonly close: () => Promise<void>;
}

interface AsyncReleasable {
  readonly release: () => Promise<void>;
}

interface SerializedShutdownGate {
  readonly closeAdmission: () => void;
  readonly runAfterAdmissionClose: <Result>(
    task: () => Result | Promise<Result>,
  ) => Promise<Result>;
}

export async function shutdownBeforeLeaseRelease(
  authorities: readonly AsyncClosable[],
  lease: AsyncReleasable,
): Promise<void> {
  const results = await Promise.allSettled(
    authorities.map((authority) => authority.close()),
  );
  const failures: unknown[] = results.flatMap((result): unknown[] =>
    result.status === "rejected" ? [result.reason] : [],
  );
  if (failures.length === 0) {
    try {
      await lease.release();
    } catch (error) {
      failures.push(error);
    }
  }
  if (failures.length > 0) {
    throw new AggregateError(
      failures,
      "EasyEDA control shutdown was incomplete; the ownership lease remains retained after authority cleanup failure.",
    );
  }
}

/**
 * Stop accepting MCP work immediately, then wait behind the same serialization
 * gate as every admitted operation before closing live authorities and releasing
 * the process lease. The returned closure memoizes both successful and failed
 * shutdown so duplicate process signals cannot start competing cleanup runs.
 */
export function createSerializedShutdown(
  admission: AsyncClosable,
  authorities: readonly AsyncClosable[],
  lease: AsyncReleasable,
  gate: SerializedShutdownGate,
): () => Promise<void> {
  let shutdownPromise: Promise<void> | undefined;
  return (): Promise<void> => {
    if (shutdownPromise !== undefined) {
      return shutdownPromise;
    }

    const settlement = Promise.withResolvers<null>();
    const memoizedShutdown = (async (): Promise<void> => {
      await settlement.promise;
    })();
    // Publish the returned Promise before any cleanup callback can re-enter
    // Shutdown, including through a synchronous transport-close event.
    shutdownPromise = memoizedShutdown;

    const performShutdown = async (): Promise<void> => {
      try {
        // Closing the local gate first prevents server.close() re-entrancy from
        // Enqueuing work behind the authority/lease cleanup task.
        gate.closeAdmission();

        let admissionClose: Promise<void>;
        try {
          admissionClose = admission.close();
        } catch (error) {
          admissionClose = Promise.reject(
            error instanceof Error
              ? error
              : new Error("MCP admission close threw a non-error.", {
                  cause: error,
                }),
          );
        }
        // Admission may reject before an in-flight gate owner settles. Attach
        // An observer immediately; the serialized cleanup still consumes and
        // Reports this exact rejection and retains the lease.
        const observeAdmissionClose = async (): Promise<void> => {
          try {
            await admissionClose;
          } catch {
            // ShutdownBeforeLeaseRelease reports the original rejection.
          }
        };
        void observeAdmissionClose();

        await gate.runAfterAdmissionClose(() =>
          shutdownBeforeLeaseRelease(
            [{ close: (): Promise<void> => admissionClose }, ...authorities],
            lease,
          ),
        );
        settlement.resolve(null);
      } catch (error) {
        settlement.reject(error);
      }
    };
    void performShutdown();
    return memoizedShutdown;
  };
}
