import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RegisteredTool, ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AnySchema, ZodRawShapeCompat } from "@modelcontextprotocol/sdk/server/zod-compat.js";
import type { CallToolResult, ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import { isStaticOfflineApiReference } from "./offline-api.ts";
import type { FacadeSessionRetirement } from "./session-retirement.ts";

/** Every SDK tool registration, including full-schema diagnostic routes, enters
 * the same callback admission barrier before its first asynchronous operation. */
export class SessionRetirementMcpServer extends McpServer {
  private readonly retirement: FacadeSessionRetirement;
  private readonly refusal: (error: unknown) => CallToolResult;

  /** Keep the SDK transport while binding every registration to one admission barrier. */
  public constructor(retirement: FacadeSessionRetirement, refusal: (error: unknown) => CallToolResult,
    ...options: ConstructorParameters<typeof McpServer>) {
    super(...options); this.retirement = retirement; this.refusal = refusal;
  }

  /** Preserve SDK schema inference while wrapping every registered callback. */
  // oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- Preserve the SDK override's output-schema inference contract for all existing registrations.
  public override registerTool<OutputArgs extends ZodRawShapeCompat | AnySchema,
    InputArgs extends undefined | ZodRawShapeCompat | AnySchema = undefined>(
    name: string,
    config: { title?: string; description?: string; inputSchema?: InputArgs; outputSchema?: OutputArgs;
      annotations?: ToolAnnotations; _meta?: Record<string, unknown> },
    handler: ToolCallback<InputArgs>,
  ): RegisteredTool {
    const callback = async (...args: Parameters<ToolCallback<InputArgs>>): Promise<CallToolResult> => {
      try {
        // Classification uses only the SDK-validated own data request. Caller
        // Fields cannot select or restore the private source-only history.
        const input: unknown = args[0];
        const request = name === "easyeda_control_api" && input !== null && typeof input === "object"
          ? Object.getOwnPropertyDescriptor(input, "request") : undefined;
        const reference = request !== undefined && "value" in request && isStaticOfflineApiReference(request.value);
        return await this.retirement.run(name, () =>
          // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The SDK's validated ToolCallback supplies this exact result union; Reflect.apply preserves its conditional argument tuple.
          Reflect.apply(handler, undefined, args) as CallToolResult | Promise<CallToolResult>, reference);
      } catch (error) { return this.refusal(error); }
    };
    // The SDK conditionally selects a raw-shape, full-schema or zero-argument
    // Callback. Forward that exact validated tuple through the fixed wrapper.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Parameters<ToolCallback<InputArgs>> above preserves the original conditional callback contract.
    return super.registerTool(name, config, callback as ToolCallback<InputArgs>);
  }
}
