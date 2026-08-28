import type { BridgeErrorFactory } from './api-runtime.js';
import { normalizeBinaryResult } from './binary-result.js';
import type { BinaryResultNormalizer, BinaryResultPayload } from './binary-result.js';

const DEFAULT_PAYLOAD_SAFETY_MARGIN = 0.6;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export interface BinaryResultPolicyDependencies {
  getBridgeMaxPayloadSize: () => number;
  createBridgeError: BridgeErrorFactory;
  normalizeResult?: BinaryResultNormalizer;
  safetyMargin?: number;
}

function isBinaryResultPayload(value: unknown): value is BinaryResultPayload {
  return (
    isRecord(value) &&
    typeof value.base64 === 'string' &&
    typeof value.byteLength === 'number' &&
    typeof value.fileName === 'string' &&
    typeof value.mimeType === 'string'
  );
}

export function createBinaryResultNormalizer({
  getBridgeMaxPayloadSize,
  createBridgeError,
  normalizeResult = normalizeBinaryResult,
  safetyMargin = DEFAULT_PAYLOAD_SAFETY_MARGIN,
}: BinaryResultPolicyDependencies): BinaryResultNormalizer {
  return async (value: unknown, fallbackFileName: string): Promise<unknown> => {
    const normalized = await normalizeResult(value, fallbackFileName);
    if (!isBinaryResultPayload(normalized)) {return normalized;}

    const maxPayloadSize = getBridgeMaxPayloadSize();
    const budget = Math.floor(maxPayloadSize * safetyMargin);
    if (normalized.byteLength > budget) {
      throw createBridgeError(
        'PAYLOAD_TOO_LARGE',
        `"${normalized.fileName}" is ${normalized.byteLength} bytes, which exceeds the safe transport budget (${budget} bytes, derived from the server's BRIDGE_MAX_PAYLOAD_SIZE=${maxPayloadSize}).`,
        'Increase BRIDGE_MAX_PAYLOAD_SIZE in the MCP server environment, or (for canvas captures) zoom to a smaller region.',
      );
    }

    return normalized;
  };
}
