/** Fixed source fragment for an internal observer, never an authority claim. */
export const ACTOR_NAME_MAX_CODE_UNITS = 1024;

/** Requires the enclosing fixed compiler's own(), host and bad() helpers.
 * It reads only the three explicitly projected fields on each retained object.
 * Jo.setUserInfo's source-native nickname || "" normalization is explicit.
 */
export const SYMBOL_DUAL_ACTOR_CAPTURE_SOURCE = `
 const cookies=own(host,'globalVariableCookieData'),actor=own(cookies,'userInfo');
 const startupActor=own(host,'loginedUserInfo');
 const actorProject=value=>{
  if(value===null||typeof value!=='object'||Array.isArray(value))bad();
  const uuid=own(value,'uuid'),username=own(value,'username'),nickname=own(value,'nickname');
  if(typeof uuid!=='string'||!/^[a-f0-9]{32}$/.test(uuid)||typeof username!=='string'||username.length===0||username.length>${ACTOR_NAME_MAX_CODE_UNITS}||typeof nickname!=='string'||nickname.length>${ACTOR_NAME_MAX_CODE_UNITS})bad();
  return{uuid,username,nickname};
 };
 const startupActorProjection=actorProject(startupActor),cachedActorProjection=actorProject(actor);
 const actorEqual=(left,right)=>left.uuid===right.uuid&&left.username===right.username&&left.nickname===right.nickname;
 const normalizedStartup={...startupActorProjection,nickname:startupActorProjection.nickname||''};
 if(!actorEqual(normalizedStartup,cachedActorProjection))bad();
 const actorUuid=cachedActorProjection.uuid;
 const checkDualActor=()=>{
  if(own(host,'globalVariableCookieData')!==cookies||own(cookies,'userInfo')!==actor||own(host,'loginedUserInfo')!==startupActor)bad();
  if(!actorEqual(actorProject(startupActor),startupActorProjection)||!actorEqual(actorProject(actor),cachedActorProjection))bad();
 };
`;

export interface ActorProjection { readonly uuid: string; readonly username: string; readonly nickname: string }

/** Result shape only. Full startup provenance and future APP identity stay unproved. */
export function validateActorProjection(input: unknown): ActorProjection {
  if (input === null || typeof input !== "object" || Array.isArray(input) ||
      (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null) || Reflect.ownKeys(input).length !== 3) {
    throw new Error("SYMBOL_ACTOR_RESULT");
  }
  const values: Record<string, unknown> = {};
  for (const key of ["uuid", "username", "nickname"]) {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { throw new Error("SYMBOL_ACTOR_RESULT"); }
    values[key] = descriptor.value as unknown;
  }
  const nickname = values["nickname"], username = values["username"], uuid = values["uuid"];
  if (typeof uuid !== "string" || !/^[a-f0-9]{32}$/u.test(uuid) || typeof username !== "string" || username.length === 0 ||
      username.length > ACTOR_NAME_MAX_CODE_UNITS || typeof nickname !== "string" || nickname.length > ACTOR_NAME_MAX_CODE_UNITS) {
    throw new Error("SYMBOL_ACTOR_RESULT");
  }
  return Object.freeze({ uuid, username, nickname });
}
