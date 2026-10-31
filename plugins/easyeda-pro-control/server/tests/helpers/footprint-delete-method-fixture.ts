/** Interface-test excerpts from project-worker SHA0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046,
 * pro-mgr/3.2.185.bf63a159/js/project-worker.js in EasyEDA3.2.209.8a704eab.
 * Four existing reviewed fixtures are reused. The five additional small
 * fragments total260bytes; exact spans/hashes remain in the delete source profile.
 * Vendor excerpts retain their provenance and are not relicensed as repo code.
 * These inert strings contain no runtime evidence, design data or native IDs. */
import { FOOTPRINT_CREATE_SOURCE_FIXTURE as CREATE } from "./current-footprint-copy-create-source-fixture.ts";
import { footprintDeleteFragments as DELETE } from "./footprint-delete-fragments.ts";

export const footprintDeleteMethodFixture = [
  DELETE.deleteData,
  DELETE.deleteString,
  "verifyKey(s){Se.mustString(s)}",
  "isHas(s){return this.data[s]&&!this.data[s].isDelete}",
  "getMaxTicket(){return this.maxTicket}",
  "setMaxTicket(e,t){e&&(t||this.maxTicket<e)&&(this.maxTicket=e)}",
  CREATE.worker.uploadLocal,
  "get maxTicket(){return this.projectManager.consistencyManager.getMaxTicket()}",
  CREATE.worker.newTicket,
] as const;
