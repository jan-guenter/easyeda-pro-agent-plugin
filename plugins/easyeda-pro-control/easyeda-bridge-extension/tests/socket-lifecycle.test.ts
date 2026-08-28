import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');

describe('EasyEDA WebSocket lifecycle', () => {
  it('never fires the open hook from a timer before the real connected callback', () => {
    const source = readFileSync(join(root, 'src', 'index.ts'), 'utf8');

    expect(source).toContain('sysWs.register(');
    expect(source).toContain('fireOpen,');
    expect(source).not.toContain('setTimeout(fireOpen');
    expect(source).toContain('REGISTER_OPEN_CALLBACK_TIMEOUT_MS');
    expect(source).toContain('startSocket({ skipRegister: true })');
    expect(source).toContain('closeHandle(registerHandle)');
  });
});
