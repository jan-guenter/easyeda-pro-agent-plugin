/** Fixed current loaded-project Date observation. No RPC, mutation or Save. */
import { z } from "zod";
import { assertUpstreamReplySettled, canonicalJson, extractToolPayload } from "./core.ts";
import { buildCurrentAgedSqlClockControls, validateCurrentAgedSqlClockControls } from "./current-aged-sql-clock-controls.ts";
import type { CurrentAgedSqlClockControls } from "./current-aged-sql-clock-controls.ts";
import { buildCurrentProjectOnlySymbolGuard } from "./current-project-only-symbol-guard.ts";
import { EXACT_READ_ENVELOPE_SCHEMA, decodeExactReadEnvelope } from "./exact-readers.ts";
import { exact, validateClockControlScope } from "./symbol-clock-controls.ts";
import { validateActorProjection } from "./symbol-dual-actor.ts";

const MAX_BYTES = 98_304;
const targetSchema = z.object({ projectUuid: z.string().regex(/^[a-f0-9]{64}$/u), branchUuid: z.string().regex(/^[a-f0-9]{32}$/u) }).strict();
const OLD_URL_CHECK = String.raw`if(typeof href!=='string'||!/^https:\/\/client\/editor\?cll=(?:trace|debug|info|warn|error)#?$/.test(href)||location.origin!=='https://client'||!document||document.nodeType!==9||document.defaultView!==root||document.URL!==href)bad();`;
function need(condition: boolean): asserts condition { if (!condition) { throw new Error("Current aged SQL renderer refused."); } }
function request(input: unknown): Readonly<{ scope: ReturnType<typeof validateClockControlScope>;
  target: z.infer<typeof targetSchema>; actor: ReturnType<typeof validateActorProjection> }> {
  const value = exact(input, ["scope", "target", "actor"]);
  return Object.freeze({ scope: validateClockControlScope(value["scope"]),
    target: targetSchema.parse(exact(value["target"], ["projectUuid", "branchUuid"])), actor: validateActorProjection(value["actor"]) });
}

export function buildCurrentAgedSqlRendererProgram(input: unknown): string {
  const selected = request(input);
  let controls = buildCurrentAgedSqlClockControls(selected.scope, "renderer", selected.actor);
  // The unchanged historical controls require Start Page URLs. This separately
  // Fixed current profile substitutes the exact retained loaded-project guard
  // In both controls, never an arbitrary URL. Each synchronous Date operation
  // Retains the existing root/URL/project/actor and native method reproof.
  need(controls.split(OLD_URL_CHECK).length === 3);
  controls = controls.replaceAll(OLD_URL_CHECK, "projectOnly.check();");
  return `const observation=(()=>{
const root=globalThis,apply=Reflect.apply,target=${JSON.stringify(selected.target)},expired=false;
const bad=()=>{throw new Error('CURRENT_AGED_SQL_RENDERER_REFUSED');};
const own=(owner,key,optional=false)=>{if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();const d=Object.getOwnPropertyDescriptor(owner,key);if(!d){if(optional&&!(key in owner))return undefined;bad();}if(!Object.hasOwn(d,'value'))bad();return d.value;};
const method=(owner,key)=>{const chain=[];let node=owner;for(let i=0;i<4;i++){if(node===null||(typeof node!=='object'&&typeof node!=='function'))bad();chain.push(node);const d=Object.getOwnPropertyDescriptor(node,key);if(d){if(!Object.hasOwn(d,'value')||typeof d.value!=='function')bad();return{owner,key,chain,fn:d.value};}node=Object.getPrototypeOf(node);}bad();};
const methodCheck=binding=>{for(let i=0;i<binding.chain.length;i++){const node=binding.chain[i];if(i>0&&Object.getPrototypeOf(binding.chain[i-1])!==node)bad();if(i===binding.chain.length-1){if(own(node,binding.key)!==binding.fn)bad();}else if(Object.hasOwn(node,binding.key))bad();}};
${buildCurrentProjectOnlySymbolGuard()}
projectOnly.check();const controls=${controls};projectOnly.check();
return{profile:'private.current-aged-sql-renderer.v1',target,controls,mutationDispatched:false,executionAuthorized:false};
})();
const json=JSON.stringify(observation),utf8Bytes=new TextEncoder().encode(json).byteLength;
const envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
if(utf8Bytes>${MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${MAX_BYTES})throw new Error('CURRENT_AGED_SQL_RENDERER_ENVELOPE');
return envelope;`;
}

export function decodeCurrentAgedSqlRendererReply(raw: unknown, expected: unknown): CurrentAgedSqlClockControls {
  const selected = request(expected);
  assertUpstreamReplySettled(raw);
  const envelope = exact(extractToolPayload(raw), ["schema", "utf8Bytes", "json"]);
  need(envelope["schema"] === EXACT_READ_ENVELOPE_SCHEMA && typeof envelope["json"] === "string" &&
    envelope["json"].length > 0 && envelope["json"].length <= MAX_BYTES &&
    Buffer.byteLength(JSON.stringify(envelope)) <= MAX_BYTES);
  const value = exact(decodeExactReadEnvelope(envelope), ["profile", "target", "controls", "mutationDispatched", "executionAuthorized"]);
  need(value["profile"] === "private.current-aged-sql-renderer.v1" && value["mutationDispatched"] === false && value["executionAuthorized"] === false &&
    canonicalJson(targetSchema.parse(value["target"])) === canonicalJson(selected.target));
  return validateCurrentAgedSqlClockControls(value["controls"], selected.scope, "renderer");
}
