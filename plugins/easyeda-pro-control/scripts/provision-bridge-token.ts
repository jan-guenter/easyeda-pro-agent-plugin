#!/usr/bin/env node

import {
  bridgeTokenPathFromArguments,
  provisionBridgeTokenFile,
} from "./bridge-token.ts";

const cliArguments = process.argv.slice(2);
const proof = await provisionBridgeTokenFile(
  bridgeTokenPathFromArguments(cliArguments),
);
process.stdout.write(
  `${JSON.stringify({
    created: proof.created,
    path: proof.path,
    sha256: proof.sha256,
  })}\n`,
);
