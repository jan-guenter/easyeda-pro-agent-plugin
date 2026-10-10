import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');

describe('extension manifest activation', () => {
  it('loads the bridge entry at EasyEDA startup so auto-connect can run without a menu click', () => {
    const manifest: unknown = JSON.parse(
      readFileSync(join(root, 'extension.json'), 'utf8'),
    );

    expect(manifest).toMatchObject({
      activationEvents: { onStartupFinished: true },
    });
  });

  it('uses a private identity that cannot collide with the stock bridge', () => {
    const manifest: unknown = JSON.parse(
      readFileSync(join(root, 'extension.json'), 'utf8'),
    );

    expect(manifest).toMatchObject({
      name: 'easyeda-pro-control-authenticated-bridge',
      uuid: '7e06d286b1ac846ef7eab9c7f2a9ee40',
      displayName: 'EasyEDA Pro Control Authenticated Bridge',
      version: '0.3.0',
      publisher: 'JanGuenter',
      repository: {
        type: 'git',
        url: 'https://github.com/jan-guenter/easyeda-pro-agent-plugin',
      },
      homepage: 'https://github.com/jan-guenter/easyeda-pro-agent-plugin#readme',
      bugs: 'https://github.com/jan-guenter/easyeda-pro-agent-plugin/issues',
      headerMenus: {
        home: [
          {
            id: 'EasyEDAProControlAuthenticatedBridge',
            title: 'Authenticated Control Bridge',
          },
        ],
        sch: [
          {
            id: 'EasyEDAProControlAuthenticatedBridge',
            title: 'Authenticated Control Bridge',
          },
        ],
        pcb: [
          {
            id: 'EasyEDAProControlAuthenticatedBridge',
            title: 'Authenticated Control Bridge',
          },
        ],
      },
    });
  });

  it('satisfies the native importer UUID rule and rejects the former 31-character identity', () => {
    const manifest: unknown = JSON.parse(
      readFileSync(join(root, 'extension.json'), 'utf8'),
    );
    // Installed pro-api 0.2.53 requires exactly 32 lowercase alphanumeric characters.
    const nativeUuidFormat = /^[a-z0-9]{32}$/u;

    expect(manifest).toHaveProperty('uuid', expect.stringMatching(nativeUuidFormat));
    expect('7e06d286b1ac846ef7eab9c7f2a9ee4').not.toMatch(nativeUuidFormat);
  });
});
