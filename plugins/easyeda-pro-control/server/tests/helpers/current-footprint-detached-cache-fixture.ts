/** Exact dropped IIFE body inside an inert synthetic m/worker scaffold. This
 * executes only the test's synthetic local Cache methods, never EasyEDA. */
// oxlint-disable-next-line eslint/no-template-curly-in-string -- Preserve literal interpolation in the exact pinned vendor IIFE; the surrounding test scaffold remains synthetic.
const body = '(async()=>{let b=cg(`localSave/${this.branchUuid}?key=${f.result}&time=${new Date().getTime()}`);await this.localCache.put(b,new Response(u));for(let E of l.url)t.delete(E),this.bufferUploadCache.has(E)?(await this.bufferUploadCache.get(E).delete(E),this.bufferUploadCache.delete(E)):await this.localCache.delete(E)})()';
export function detachedCacheFixtureSource(base: string): string {
  let source = base;
  const put = (offset: number, text: string): void => { source = source.slice(0, offset) + text + source.slice(offset + text.length); };
  put(2_022_800, 'async syntheticMaintenance(){let t=globalThis.SYNTHETIC_PENDING,l=globalThis.SYNTHETIC_BATCH,f=globalThis.SYNTHETIC_RESPONSE,u="synthetic-history";');
  put(2_023_523, "let m=async()=>{"); put(2_024_217, body); put(2_024_536, ";return true};return m()}");
  return source;
}
