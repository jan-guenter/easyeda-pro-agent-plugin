/** The same content rules apply to current files and unpublished Git objects.
 * Labels identify a finding without returning its secret or private value. */
export const secretPatterns: readonly (readonly [string, RegExp])[] = [
  ["private-key", /-----BEGIN (?:DSA |EC |OPENSSH |PGP |RSA )?PRIVATE KEY-----/u],
  ["github-classic", /\bgh[opsu]_[A-Za-z0-9]{30,255}\b/u],
  ["github-fine-grained", /\bgithub_pat_[A-Za-z0-9_]{40,255}\b/u],
  ["aws-access-key", /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/u],
  ["npm-token", /\bnpm_[A-Za-z0-9]{30,255}\b/u],
  ["slack-token", /\bxox[baprs]-[A-Za-z0-9-]{20,255}\b/u],
  ["openai-key", /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,255}\b/u],
  ["anthropic-key", /\bsk-ant-[A-Za-z0-9_-]{20,255}\b/u],
  ["google-api-key", /\bAIza[A-Za-z0-9_-]{30,60}\b/u],
  [
    "assigned-secret",
    /(?:api[_-]?key|authentication[_-]?key|bridge[_-]?token|credential|password|secret|session[_-]?token|token)\s*[:=]\s*["'][A-Za-z0-9_+./=-]{32,}["']/iu,
  ],
  [
    "esbuild-inlined-secret",
    /\b(?:true|!0)\s*\?\s*["'][A-Za-z0-9_-]{32,256}["']\s*:\s*void 0\b/u,
  ],
  ["credential-url", /https?:\/\/[^\s/@:]+:[^\s/@]+@/iu],
];
export const privateDesignName = ["Piano", "Pi"].join("");
export const privateDesignPath = ["/root/work/", "piano", "pi"].join("");
export const privacyPatterns: readonly (readonly [string, RegExp])[] = [
  ["private-design-name", new RegExp(`\\b${privateDesignName}\\b`, "u")],
  ["private-design-path", new RegExp(`${privateDesignPath}(?:/|\\b)`, "u")],
  [
    "windows-user-path",
    /\/mnt\/c\/Users\/(?!Fixture(?:\/|\b)|Public(?:\/|\b))[^/\s]+\//u,
  ],
];
