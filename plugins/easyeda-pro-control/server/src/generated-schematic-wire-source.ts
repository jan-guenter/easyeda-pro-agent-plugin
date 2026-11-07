/** Exact native-equivalent setLines source. Existing-ID replacement does not
 * allocate a LINE; its setters, action and persistence still need an original
 * observer. This source contract grants no invocation authority. */
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { GENERATED_SCHEMATIC_RELEVANCE_DISPLAY_SOURCE } from "./generated-schematic-relevance-display-source.ts";

export const GENERATED_SCHEMATIC_WIRE_SET_LINES_SOURCE = "setLines(t,{onDelete:r=Cr}=qt){let n,s=new Map;for(let u of this._lines)s.set(u.id,u),n||(n=u);let a=t.filter(u=>{let{id:h}=u;if(h){let d=s.get(h);return d?(s.delete(h),Object.assign(d,u)):this.createLineBaseOn(u,n),!1}return!0}),o=s.values(),l=s.size,c=a.length;for(let u=0;u<l;u++){let h=a[u];if(!h)break;Object.assign(o.next().value,h)}if(l>c)for(;;){let u=o.next();if(u.value)r(u.value),u.value.parent=null;else break}else for(let u=0,h=c-l;u<h;u++)this.createLineBaseOn(a[l+u],n)}";
export const GENERATED_SCHEMATIC_WIRE_SOURCE_PROFILE = freezeDeep({
  schema: "private.generated-schematic-wire-source.v1",
  files: GENERATED_SCHEMATIC_RELEVANCE_DISPLAY_SOURCE.files.map((file, index) => ({ relativePath: file.relativePath, bytes: file.bytes, sha256: file.sha256,
    setLines: { start: index === 0 ? 3_918_102 : 3_971_747, end: index === 0 ? 3_918_587 : 3_972_232,
      sha256: "3880c8aa2c2e509e73aeb464ee91aab65b14687642afe70d5065b7c6adbcd21c" } })),
  route: "native-equivalent", publicWireModifyInvoked: false, lineCreationSupported: false, writerAuthority: false,
});
