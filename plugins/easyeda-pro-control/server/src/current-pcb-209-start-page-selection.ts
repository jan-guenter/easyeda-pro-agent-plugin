/** Metadata selection only. The original owner independently reproves target
 * membership, frame custody and the full actual UI source before any action. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

const token = z.string().regex(/^[A-Za-z\d_.:-]{1,128}$/u);
const start = /^https:\/\/client\/editor\?cll=(?:trace|debug|info|warn|error)#?$/u;
const target = z.strictObject({ targetId: token, type: z.string().max(128), url: z.string().max(8192), attached: z.boolean() });
const browser = z.looseObject({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-browser-observation.v1"), targets: z.array(target).max(256) });
const frame = z.strictObject({ id: token, loaderId: token, url: z.string().max(8192), securityOrigin: z.string().max(8192), parentId: token.optional() });
const inventory = z.looseObject({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-frame-inventory.v1"), targetId: token,
  frames: z.array(frame).min(1).max(128) });
export interface CurrentPcb209StartPageSelection { readonly targetId: string; readonly url: string }
export function selectCurrentPcb209StartPage(input: unknown): CurrentPcb209StartPageSelection {
  const value = browser.parse(captureCurrentPcbStringClockReply(input).value); const pages = value.targets.filter(row => row.type === "page");
  const selected = pages[0];
  if (pages.length !== 1 || selected === undefined || selected.attached || !start.test(selected.url) || new Set(value.targets.map(row => row.targetId)).size !== value.targets.length) { throw new Error("PCB209_START_PAGE_SELECTION"); }
  return Object.freeze({ targetId: selected.targetId, url: selected.url });
}
export function selectCurrentPcb209StartPageFrame(input: unknown, selected: CurrentPcb209StartPageSelection): Readonly<{ targetId: string; frameId: string; frameUrl: string }> {
  const original = z.strictObject({ targetId: token, url: z.string().regex(start) }).parse(captureCurrentPcbStringClockReply(selected).value);
  const value = inventory.parse(captureCurrentPcbStringClockReply(input).value); const roots = value.frames.filter(row => row.parentId === undefined); const root = roots[0];
  if (value.targetId !== original.targetId || roots.length !== 1 || root === undefined || root.securityOrigin !== "https://client" || !start.test(root.url) ||
    root.url.replace(/#$/u, "") !== original.url.replace(/#$/u, "") || new Set(value.frames.map(row => row.id)).size !== value.frames.length) { throw new Error("PCB209_START_PAGE_FRAME_SELECTION"); }
  return Object.freeze({ targetId: original.targetId, frameId: root.id, frameUrl: root.url });
}
