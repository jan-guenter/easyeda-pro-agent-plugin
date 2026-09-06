import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  discoverReviewedOrLiveTools,
  reviewedUpstreamToolCatalog,
} from "../src/reviewed-upstream-tools.ts";

void describe("quarantine-safe upstream discovery", () => {
  void test("ships the reviewed 116-tool catalog without development-only tools", () => {
    const tools = reviewedUpstreamToolCatalog();
    assert.equal(tools.length, 116);
    assert.equal(new Set(tools.map((tool) => tool.name)).size, tools.length);
    assert.ok(tools.some((tool) => tool.name === "easyeda_execute"));
    assert.ok(!tools.some((tool) => tool.name === "easyeda_dev_hot_swap"));
  });

  void test("does not call live discovery while dispatch is quarantined", async () => {
    let liveListCalled = false;
    const tools = await discoverReviewedOrLiveTools(
      () => Promise.reject(new Error("orphan risk")),
      () => {
        liveListCalled = true;
        return Promise.resolve([{ name: "unreviewed_live_tool" }]);
      },
      { query: "execute", mode: "write", includeSchemas: true, source: "live" },
    );

    assert.equal(liveListCalled, false);
    assert.deepEqual(
      tools.map((tool) => tool.name),
      ["easyeda_execute"],
    );
    assert.equal(tools[0]?.classification.write, true);
    assert.match(
      String(tools[0]?.description),
      /does not start the upstream process/u,
    );
  });

  void test("uses live discovery after the local dispatch guard passes", async () => {
    const tools = await discoverReviewedOrLiveTools(
      () => Promise.resolve(true),
      () =>
        Promise.resolve([
          {
            name: "easyeda_live_catalog_fixture",
            annotations: { readOnlyHint: true },
          },
        ]),
      { mode: "read", source: "live" },
    );
    assert.deepEqual(
      tools.map((tool) => tool.name),
      ["easyeda_live_catalog_fixture"],
    );
  });

  void test("defaults to local reads without checking or starting a broken upstream", async () => {
    const tools = await discoverReviewedOrLiveTools(
      () => { throw new Error("must not check live admission"); },
      () => { throw new Error("must not start the upstream"); },
      { query: "pcb_components", includeSchemas: true },
    );
    assert.equal(tools.length, 1);
    assert.equal(tools[0]?.catalogSource, "local");
    assert.equal(tools[0]?.schemasAvailable, false);
    assert.equal(tools[0]?.facadeTool, "easyeda_control_read");
    assert.equal(tools[0]?.availability, "advisory-read");
  });

  void test("does not turn upstream read-only annotations into facade permission", async () => {
    const tools = await discoverReviewedOrLiveTools(
      () => Promise.resolve(),
      () => Promise.resolve([]),
      { query: "catalog_list" },
    );
    assert.equal(tools[0]?.classification.readOnly, true);
    assert.equal(tools[0]?.availability, "unavailable");
    assert.equal(tools[0]?.facadeTool, null);
  });

  void test("identifies dedicated capture and export routes and leaves writes unavailable", async () => {
    const tools = await discoverReviewedOrLiveTools(
      () => Promise.resolve(),
      () => Promise.resolve([]),
      { mode: "all", limit: 100 },
    );
    assert.equal(tools.find((tool) => tool.name === "easyeda_canvas_capture")?.facadeTool, "easyeda_control_capture");
    assert.equal(tools.find((tool) => tool.name === "easyeda_pcb_export_route_context")?.availability, "gated-export");
    assert.equal(tools.find((tool) => tool.name === "easyeda_pcb_modify_component")?.availability, "unavailable");
  });

  void test("marks a live allowlisted name unavailable when its metadata drifts to write", async () => {
    const tools = await discoverReviewedOrLiveTools(
      () => Promise.resolve(),
      () => Promise.resolve([{
        name: "easyeda_pcb_components",
        annotations: { readOnlyHint: false, destructiveHint: true },
      }]),
      { source: "live", mode: "all", includeSchemas: true },
    );
    assert.equal(tools[0]?.classification.write, true);
    assert.equal(tools[0]?.availability, "unavailable");
    assert.equal(tools[0]?.facadeTool, null);
    assert.equal(tools[0]?.schemasAvailable, false);
  });
});
