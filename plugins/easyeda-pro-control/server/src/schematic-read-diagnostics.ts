/** Exact literal guards from the fixed flat native capture and its outer read
 * envelope. Keep this dependency-free: core's error classifier loads it before
 * the topology builder. These labels grant no reader or execution authority.
 */
export const SCHEMATIC_FLAT_TOPOLOGY_GUARD_CODES = [
  "ARRAY", "ATTRIBUTE", "ATTR_METHOD", "BODY", "BODY_METHOD", "BODY_TOTAL",
  "CONTACT", "CONTACT_OWNER", "CONTEXT", "COORDINATE", "FRAME_TIMESTAMP",
  "IDENTITY", "INSTANCE_ATTRIBUTE", "LINE_ARITY", "LINE_OWNER", "MANAGER",
  "MULTIPART", "NET_NAME_MEMBERSHIP", "NET_NAME_OWNER", "PAGE_KIND",
  "PAGE_MEMBERSHIP", "PAGE_NOT_INITIALIZED", "PART_TEMPLATE", "PIN_MEMBERSHIP",
  "PIN_OWNER", "POINT_TOTAL", "SETTINGS", "SETTINGS_CHANGED", "SHAPES", "SOURCE",
  "SOURCE_IDENTITY", "SOURCE_INVENTORY", "SOURCE_MODEL_KIND", "SOURCE_TOTAL",
  "SYMBOL_KIND", "TEMPLATE_NOT_INITIALIZED", "UNSUPPORTED_FAMILY", "WIRE_KIND",
] as const;

export const SCHEMATIC_FLAT_READ_GUARD_CODES = [
  "SCH_FLAT_SCOPE", "SCH_FLAT_TRANSPORT_BOUND",
] as const;
