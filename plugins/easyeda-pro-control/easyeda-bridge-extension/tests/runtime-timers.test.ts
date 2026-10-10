import { describe, expect, it, vi } from 'vitest';
import { createRuntimeTimers } from '../src/runtime-timers.js';
import type { EasyedaTimerApi } from '../src/runtime-timers.js';

describe('EasyEDA runtime timers', () => {
  it('uses sys_Timer when native browser timers are unavailable', () => {
    const callbacks = new Map<string, () => void>();
    const api: EasyedaTimerApi = {
      setTimeoutTimer: vi.fn((id, _delay, callback) => {
        callbacks.set(id, callback);
        return true;
      }),
      clearTimeoutTimer: vi.fn((id) => callbacks.delete(id)),
      setIntervalTimer: vi.fn((id, _delay, callback) => {
        callbacks.set(id, callback);
        return true;
      }),
      clearIntervalTimer: vi.fn((id) => callbacks.delete(id)),
    };
    const timers = createRuntimeTimers(() => api, {}, 'fixture');
    const timeoutCallback = vi.fn();
    const intervalCallback = vi.fn();

    const timeout = timers.setTimeout(timeoutCallback, 500);
    const interval = timers.setInterval(intervalCallback, 1000);

    expect(timeout).toMatchObject({ source: 'easyeda', kind: 'timeout' });
    expect(interval).toMatchObject({ source: 'easyeda', kind: 'interval' });
    expect(api.setTimeoutTimer).toHaveBeenCalledWith(expect.any(String), 500, timeoutCallback);
    expect(api.setIntervalTimer).toHaveBeenCalledWith(expect.any(String), 1000, intervalCallback);

    timers.clearTimeout(timeout);
    timers.clearInterval(interval);
    expect(api.clearTimeoutTimer).toHaveBeenCalledWith(
      timeout.source === 'easyeda' ? timeout.id : '',
    );
    expect(api.clearIntervalTimer).toHaveBeenCalledWith(
      interval.source === 'easyeda' ? interval.id : '',
    );
  });

  it.each(['timeout', 'interval'] as const)(
    'preserves the EasyEDA timer receiver when clearing a %s',
    (kind) => {
      const pending = new Set<string>();
      const api: EasyedaTimerApi = {
        setTimeoutTimer(id) {
          pending.add(id);
          return true;
        },
        setIntervalTimer(id) {
          pending.add(id);
          return true;
        },
        clearTimeoutTimer(this: EasyedaTimerApi, id) {
          expect(this).toBe(api);
          return pending.delete(id);
        },
        clearIntervalTimer(this: EasyedaTimerApi, id) {
          expect(this).toBe(api);
          return pending.delete(id);
        },
      };
      const timers = createRuntimeTimers(() => api, {}, 'receiver-fixture');
      const timer = kind === 'timeout'
        ? timers.setTimeout(() => {}, 10)
        : timers.setInterval(() => {}, 10);

      expect(pending.size).toBe(1);
      if (kind === 'timeout') {timers.clearTimeout(timer);}
      else {timers.clearInterval(timer);}
      expect(pending.size).toBe(0);
    },
  );

  it('falls back to explicitly supplied native timers', () => {
    const nativeHandle = { id: 1 };
    const native = {
      setTimeout: vi.fn(() => nativeHandle),
      clearTimeout: vi.fn(),
      setInterval: vi.fn(() => nativeHandle),
      clearInterval: vi.fn(),
    };
    const timers = createRuntimeTimers(() => {}, native, 'fixture');

    const timeout = timers.setTimeout(() => {}, 10);
    const interval = timers.setInterval(() => {}, 20);
    timers.clearTimeout(timeout);
    timers.clearInterval(interval);

    expect(native.setTimeout).toHaveBeenCalledOnce();
    expect(native.setInterval).toHaveBeenCalledOnce();
    expect(native.clearTimeout).toHaveBeenCalledWith(nativeHandle);
    expect(native.clearInterval).toHaveBeenCalledWith(nativeHandle);
  });

  it('does not accept an EasyEDA scheduler without its matching clearer', () => {
    const nativeHandle = { id: 2 };
    const native = {
      clearInterval: vi.fn(),
      clearTimeout: vi.fn(),
      setInterval: vi.fn(() => nativeHandle),
      setTimeout: vi.fn(() => nativeHandle),
    };
    const api: EasyedaTimerApi = {
      setIntervalTimer: vi.fn(() => true),
      setTimeoutTimer: vi.fn(() => true),
    };
    const timers = createRuntimeTimers(() => api, native, 'fixture');

    expect(timers.setTimeout(() => {}, 10).source).toBe('native');
    expect(timers.setInterval(() => {}, 20).source).toBe('native');
    expect(api.setTimeoutTimer).not.toHaveBeenCalled();
    expect(api.setIntervalTimer).not.toHaveBeenCalled();
  });

  it('surfaces a false EasyEDA timer cleanup result', () => {
    const api: EasyedaTimerApi = {
      clearIntervalTimer: vi.fn(() => false),
      clearTimeoutTimer: vi.fn(() => false),
      setIntervalTimer: vi.fn(() => true),
      setTimeoutTimer: vi.fn(() => true),
    };
    const timers = createRuntimeTimers(() => api, {}, 'fixture');
    const timeout = timers.setTimeout(() => {}, 10);
    const interval = timers.setInterval(() => {}, 20);

    expect(() => {
      timers.clearTimeout(timeout);
    }).toThrow(/did not confirm timeout cleanup/u);
    expect(() => {
      timers.clearInterval(interval);
    }).toThrow(/did not confirm interval cleanup/u);
  });
});
