import assert from "node:assert/strict";
import { test } from "node:test";
import { diagnosticAncillaryOwner } from "../src/current-pcb-diagnostic-ancillary.ts";

// Synthetic source-shaped DOM data, not a captured installed-browser result.
const STYLE = "display: block; position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; border: none; padding: 0px; margin: 0px; opacity: 0; z-index: -1000; pointer-events: none;";
const ATTRIBUTES = ["style", STYLE, "tabindex", "-1", "type", "text/html", "aria-hidden", "true", "data", "about:blank"];
const NODE = { nodeType: 1, nodeName: "OBJECT", localName: "object", backendNodeId: 91, frameId: "sensor-frame", attributes: ATTRIBUTES };
const OWNER = { backendNodeId: 91 };
function sample(node: Readonly<Record<string, unknown>> = NODE, owner: Readonly<Record<string, unknown>> = OWNER): ReturnType<typeof diagnosticAncillaryOwner> {
  return diagnosticAncillaryOwner("sensor-frame", owner, { node });
}
void test("source-shaped OBJECT accepts only comparison data and retains exact immutable attributes", () => {
  const attributes = [...ATTRIBUTES], result = sample({ ...NODE, attributes });
  assert.deepEqual(result, { backendNodeId: 91, attributes: ATTRIBUTES });
  assert.ok(Object.isFrozen(result)); assert.ok(Object.isFrozen(result.attributes));
  attributes[1] = "changed";
  assert.equal(result.attributes[1], STYLE);
  assert.deepEqual(sample(NODE, { backendNodeId: 91, nodeId: 7 }), result);
  for (const css of [STYLE.replaceAll("0px", "0"), STYLE.replace("border: none", "border: 0px none"),
    STYLE.replace("border: none", "border: 0px"), STYLE.slice(0, -1)]) {
    assert.deepEqual(sample({ ...NODE, attributes: ["style", css, ...ATTRIBUTES.slice(2)] }).attributes,
      ["style", css, ...ATTRIBUTES.slice(2)]);
  }
});
void test("blank URL never admits iframe embed wrong frame backend or non-element owner", () => {
  for (const change of [{ nodeName: "IFRAME", localName: "iframe" }, { nodeName: "EMBED", localName: "embed" },
    { nodeName: "object" }, { localName: "OBJECT" }, { nodeType: 9 }, { backendNodeId: 92 }, { frameId: "other" }]) {
    assert.throws(() => sample({ ...NODE, ...change }), /ANCILLARY_OWNER/u);
  }
  for (const owner of [{ backendNodeId: 0 }, { backendNodeId: -1 }, { backendNodeId: 2_147_483_648 },
    { backendNodeId: 1.5 }, { backendNodeId: "91" }, { backendNodeId: 91, nodeId: 0 },
    { backendNodeId: 91, extra: true }]) {
    assert.throws(() => sample(NODE, owner), /ANCILLARY_OWNER/u);
  }
  assert.throws(() => diagnosticAncillaryOwner("sensor-frame", { backendNodeId: 91 }, { node: NODE, extra: true }), /ANCILLARY_OWNER/u);
});
void test("sensor attributes reject unknown duplicate missing aliased and malformed data", () => {
  for (const attributes of [
    [...ATTRIBUTES, "id", "caller-object"], ATTRIBUTES.slice(2), ["class", STYLE, ...ATTRIBUTES.slice(2)],
    [...ATTRIBUTES.slice(0, 8), "style", STYLE], ["STYLE", STYLE, ...ATTRIBUTES.slice(2)],
    ["style", `${STYLE}\0`, ...ATTRIBUTES.slice(2)], ["style", "\uD800", ...ATTRIBUTES.slice(2)],
    ["style", "x".repeat(1025), ...ATTRIBUTES.slice(2)], ["style", true, ...ATTRIBUTES.slice(2)],
  ]) { assert.throws(() => sample({ ...NODE, attributes }), /ANCILLARY_OWNER/u); }
  for (const index of [3, 5, 7, 9]) {
    const attributes = [...ATTRIBUTES]; attributes[index] = "other";
    assert.throws(() => sample({ ...NODE, attributes }), /ANCILLARY_OWNER/u);
  }
});
void test("closed sensor CSS rejects added duplicate omitted malformed and active declarations", () => {
  for (const css of [
    `${STYLE} visibility: hidden;`, STYLE.replace("display: block", "visibility: hidden"),
    STYLE.replace("display: block", "position: absolute"), STYLE.replace("display: block;", ""),
    STYLE.replace("display: block", "display: inline"), STYLE.replace("top: 0px", "top: 1px"),
    STYLE.replace("opacity: 0", "opacity: 1"), STYLE.replace("z-index: -1000", "z-index: 0"),
    STYLE.replace("pointer-events: none", "pointer-events: auto"), STYLE.replace("border: none", "border: hidden"),
    STYLE.replace("width: 100%", "width: calc(100%)"), STYLE.replace("height: 100%", "height: var(--height)"),
    STYLE.replace("display: block", "display: block !important"), STYLE.replace("display: block", "display: /*x*/block"),
    STYLE.replace("position: absolute", "position: url(https://foreign/)"), `${STYLE};`, STYLE.replace("display: block", "display:: block"),
  ]) {
    assert.throws(() => sample({ ...NODE, attributes: ["style", css, ...ATTRIBUTES.slice(2)] }), /ANCILLARY_OWNER/u);
  }
});
