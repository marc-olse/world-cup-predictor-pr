import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import manifest from '../app/manifest';

function pngDimensions(path: string) {
  const file = readFileSync(resolve(process.cwd(), path));

  return {
    width: file.readUInt32BE(16),
    height: file.readUInt32BE(20),
  };
}

describe('PWA manifest and icons', () => {
  it('uses the standalone authenticated start route', () => {
    const value = manifest();

    expect(value.name).toBe('Primicos World Cup');
    expect(value.short_name).toBe('Primicos WC');
    expect(value.start_url).toBe('/matches/today');
    expect(value.scope).toBe('/');
    expect(value.display).toBe('standalone');
  });

  it.each([
    ['public/icons/apple-touch-icon.png', 180],
    ['public/icons/icon-192.png', 192],
    ['public/icons/icon-512.png', 512],
    ['public/icons/icon-maskable-512.png', 512],
  ])('includes a correctly sized %s', (path, size) => {
    expect(pngDimensions(path)).toEqual({ width: size, height: size });
  });
});

describe('service worker cache policy', () => {
  const source = readFileSync(
    resolve(process.cwd(), 'public/sw.js'),
    'utf8',
  );

  it('pre-caches only the offline page and icon assets', () => {
    expect(source).toContain("'/offline.html'");
    expect(source).toContain("'/icons/icon-192.png'");
    expect(source).not.toContain('/matches');
    expect(source).not.toContain('/leaderboard');
    expect(source).not.toContain('supabase');
  });

  it('intercepts navigation GET requests without caching network responses', () => {
    expect(source).toContain("request.mode !== 'navigate'");
    expect(source).toContain("request.method !== 'GET'");
    expect(source).not.toContain('cache.put');
  });
});
