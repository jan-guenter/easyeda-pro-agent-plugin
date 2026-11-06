/** Exact dropped IIFE body inside an inert synthetic m/worker scaffold. This
 * executes only the test's synthetic local Cache methods, never EasyEDA. */
// oxlint-disable-next-line eslint/no-template-curly-in-string -- Preserve literal interpolation in the exact pinned vendor IIFE; the surrounding test scaffold remains synthetic.
const body = '(async()=>{let b=cg(`localSave/${this.branchUuid}?key=${f.result}&time=${new Date().getTime()}`);await this.localCache.put(b,new Response(u));for(let E of l.url)t.delete(E),this.bufferUploadCache.has(E)?(await this.bufferUploadCache.get(E).delete(E),this.bufferUploadCache.delete(E)):await this.localCache.delete(E)})()';
// oxlint-disable-next-line eslint/no-template-curly-in-string -- Keep the exact pinned put body, including its literal logging templates, inside this inert fixture.
const putBody = "async put(t,s,r){t=nu(t);let i=0,n=async()=>{try{console.time(`CustomCache clone ${t}`);let a=s.clone();console.timeEnd(`CustomCache clone ${t}`),console.time(`CustomCache put ${t}`);let o=await this.cache.put(t,a);return console.timeEnd(`CustomCache put ${t}`),o}catch(a){if(++i,console.error(\"cache \\u5199\\u5165\\u5931\\u8D25\",t,i),i>5)throw new Error(`cache \\u5199\\u5165\\u5931\\u8D25:${t},${i},${a.message}`,a);return!r&&(a==null?void 0:a.name)===\"NotFoundError\"?(await this.open(),n()):(await tu(100*i),n())}};return n()}";
export function detachedCacheFixtureSource(base: string): string {
  let source = base;
  const put = (offset: number, text: string): void => { source = source.slice(0, offset) + text + source.slice(offset + text.length); };
  put(1_684_350, "var bb=class{"); put(1_684_363, putBody); put(1_684_885, ";};globalThis.SYNTHETIC_CACHE_CLASS=bb;");
  put(2_022_800, 'async syntheticMaintenance(){let t=globalThis.SYNTHETIC_PENDING,l=globalThis.SYNTHETIC_BATCH,f=globalThis.SYNTHETIC_RESPONSE,u="synthetic-history";');
  put(2_023_523, "let m=async()=>{");
  put(2_023_620, "if(globalThis.SYNTHETIC_HISTORY_FAILURE){"); put(2_023_672, 'console.error("synthetic history failure");}'); put(2_024_217, body); put(2_024_536, ";return true};return m()}");
  put(2_033_400, "Gd.prototype.syntheticHeadPut=async function syncCloud(){let g={};");
  put(2_033_567, 'this.cache.put(ou(this.branchUuid),new Response(JSON.stringify(this.historyIndex),{headers:g}))'); put(2_033_662, ";return true;};");
  return source;
}
