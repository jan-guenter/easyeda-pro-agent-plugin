export interface EasyedaTimerApi {
  setTimeoutTimer?: (id: string, delayMs: number, callback: () => void) => boolean;
  clearTimeoutTimer?: (id: string) => boolean;
  setIntervalTimer?: (id: string, delayMs: number, callback: () => void) => boolean;
  clearIntervalTimer?: (id: string) => boolean;
}

interface NativeTimerGlobal {
  setTimeout?: (callback: () => void, delayMs: number) => unknown;
  clearTimeout?: (handle: unknown) => void;
  setInterval?: (callback: () => void, delayMs: number) => unknown;
  clearInterval?: (handle: unknown) => void;
}

export type RuntimeTimerHandle =
  | { source: 'easyeda'; kind: 'timeout' | 'interval'; id: string }
  | { source: 'native'; kind: 'timeout' | 'interval'; handle: unknown };

export interface RuntimeTimers {
  setTimeout(callback: () => void, delayMs: number): RuntimeTimerHandle;
  clearTimeout(handle: RuntimeTimerHandle | null): void;
  setInterval(callback: () => void, delayMs: number): RuntimeTimerHandle;
  clearInterval(handle: RuntimeTimerHandle | null): void;
}

export function createRuntimeTimers(
  getEasyedaTimerApi: () => EasyedaTimerApi | null | undefined,
  nativeGlobal?: NativeTimerGlobal,
  idPrefix = 'easyeda-mcp-pro',
): RuntimeTimers {
  const resolvedNativeGlobal: NativeTimerGlobal = nativeGlobal ?? {
    setTimeout: (callback, delayMs) => globalThis.setTimeout(callback, delayMs),
    clearTimeout: (handle) => {
      Reflect.apply(globalThis.clearTimeout, globalThis, [handle]);
    },
    setInterval: (callback, delayMs) => globalThis.setInterval(callback, delayMs),
    clearInterval: (handle) => {
      Reflect.apply(globalThis.clearInterval, globalThis, [handle]);
    },
  };
  let sequence = 0;
  const nextId = (kind: 'timeout' | 'interval'): string => {
    sequence += 1;
    return `${idPrefix}:${kind}:${sequence}`;
  };

  return {
    setTimeout(callback, delayMs) {
      const api = getEasyedaTimerApi();
      if (
        typeof api?.setTimeoutTimer === 'function' &&
        typeof api.clearTimeoutTimer === 'function'
      ) {
        const id = nextId('timeout');
        if (api.setTimeoutTimer(id, delayMs, callback)) {
          return { source: 'easyeda', kind: 'timeout', id };
        }
      }

      if (
        typeof resolvedNativeGlobal.setTimeout === 'function' &&
        typeof resolvedNativeGlobal.clearTimeout === 'function'
      ) {
        return {
          source: 'native',
          kind: 'timeout',
          handle: resolvedNativeGlobal.setTimeout.call(resolvedNativeGlobal, callback, delayMs),
        };
      }

      throw new Error('No timeout scheduler is available in the EasyEDA extension runtime.');
    },

    clearTimeout(handle) {
      if (!handle) {return;}
      if (handle.source === 'easyeda') {
        const clear = getEasyedaTimerApi()?.clearTimeoutTimer;
        if (typeof clear !== 'function') {
          throw new TypeError('The EasyEDA timeout clearer is no longer callable.');
        }
        if (!clear(handle.id)) {
          throw new TypeError(`EasyEDA did not confirm timeout cleanup for ${handle.id}.`);
        }
        return;
      }
      if (typeof resolvedNativeGlobal.clearTimeout !== 'function') {
        throw new TypeError('The native timeout clearer is no longer available.');
      }
      resolvedNativeGlobal.clearTimeout.call(resolvedNativeGlobal, handle.handle);
    },

    setInterval(callback, delayMs) {
      const api = getEasyedaTimerApi();
      if (
        typeof api?.setIntervalTimer === 'function' &&
        typeof api.clearIntervalTimer === 'function'
      ) {
        const id = nextId('interval');
        if (api.setIntervalTimer(id, delayMs, callback)) {
          return { source: 'easyeda', kind: 'interval', id };
        }
      }

      if (
        typeof resolvedNativeGlobal.setInterval === 'function' &&
        typeof resolvedNativeGlobal.clearInterval === 'function'
      ) {
        return {
          source: 'native',
          kind: 'interval',
          handle: resolvedNativeGlobal.setInterval.call(resolvedNativeGlobal, callback, delayMs),
        };
      }

      throw new Error('No interval scheduler is available in the EasyEDA extension runtime.');
    },

    clearInterval(handle) {
      if (!handle) {return;}
      if (handle.source === 'easyeda') {
        const clear = getEasyedaTimerApi()?.clearIntervalTimer;
        if (typeof clear !== 'function') {
          throw new TypeError('The EasyEDA interval clearer is no longer callable.');
        }
        if (!clear(handle.id)) {
          throw new TypeError(`EasyEDA did not confirm interval cleanup for ${handle.id}.`);
        }
        return;
      }
      if (typeof resolvedNativeGlobal.clearInterval !== 'function') {
        throw new TypeError('The native interval clearer is no longer available.');
      }
      resolvedNativeGlobal.clearInterval.call(resolvedNativeGlobal, handle.handle);
    },
  };
}
