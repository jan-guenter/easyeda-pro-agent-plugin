/** Independent readable canonical build inputs forked from exact source commit
 * 9db9d91e2116b5c6cbc9475d7dd79b680ea8af88. Targets are comparison/output only.
 * Original helper/review hashes retain that immutable provenance. Separate
 * output pins include the PR223 bounded socket-reader correction; current owner
 * hashes identify the reviewed amendment, not unchanged ancestor bytes.
 * Build metadata is never a native-owner receipt. */
export const CURRENT_INVERSE_NATIVE_CANONICAL_BASELINES=Object.freeze({
  "inverse-native-continuation.v4": Object.freeze({
    "commit": "9db9d91e2116b5c6cbc9475d7dd79b680ea8af88",
    "sourceRevision": "bounded-websocket-receive.v2",
    "originalHelper": Object.freeze({
      "path": "scripts/footprint-inverse-native-continuation-v4.ps1",
      "bytes": 1_858_644,
      "sha256": "146ce7ad434dee7ccd25c6527bf4cc6bb5f0547be7113aec1abd58d1a2b97a08"
    } as const),
    "originalReview": Object.freeze({
      "path": "scripts/footprint-inverse-native-continuation-v4.cs",
      "bytes": 2_543_678,
      "sha256": "4475e54fc65b33d09c4f3ca015a480aaa7bb27d30be06c115822d64e63e59322"
    } as const),
    "outputHelper": Object.freeze({
      "path": "scripts/footprint-inverse-native-continuation-v4.ps1",
      "bytes": 1_858_684,
      "sha256": "95817ad53d2e90573e91f6497da4e102fc1b08e96c6bb562391ee146c6813635"
    } as const),
    "outputReview": Object.freeze({
      "path": "scripts/footprint-inverse-native-continuation-v4.cs",
      "bytes": 2_543_777,
      "sha256": "e7c6352c566b4c82b46c664f3697befa0a1dfec13ec2d8137b5b6f34d21d9d88"
    } as const),
    "owner": Object.freeze({
      "relativePath": "scripts/native-baseline/inverse-native-v4-v1/owner.cs",
      "bytes": 2_543_777,
      "sha256": "e7c6352c566b4c82b46c664f3697befa0a1dfec13ec2d8137b5b6f34d21d9d88"
    } as const),
    "driver": Object.freeze({
      "relativePath": "scripts/native-baseline/inverse-native-v4-v1/driver.ps1.txt",
      "bytes": 298_727,
      "sha256": "497ce83e8614824e04a05f70960008b10343889185c5eddcb3332661b2ab1b89"
    } as const),
    "marker": "# INSERT EXACT FIXED INVERSE NATIVE OWNER V1\n"
  } as const),
  "inverse-native-delete-cold-ui.v1": Object.freeze({
    "commit": "9db9d91e2116b5c6cbc9475d7dd79b680ea8af88",
    "sourceRevision": "bounded-websocket-receive.v2",
    "originalHelper": Object.freeze({
      "path": "scripts/footprint-inverse-native-delete-cold-ui.ps1",
      "bytes": 690_834,
      "sha256": "bb9df730a0fdf53fb5938b72031cacee50027a6182a25840d23834254c1e85cc"
    } as const),
    "originalReview": Object.freeze({
      "path": "scripts/footprint-inverse-native-delete-cold-ui.cs",
      "bytes": 1_047_555,
      "sha256": "d0aa111374758e8c9863a419f2c4663d49209ee603da8f32856bd97d032b1ea4"
    } as const),
    "outputHelper": Object.freeze({
      "path": "scripts/footprint-inverse-native-delete-cold-ui.ps1",
      "bytes": 690_866,
      "sha256": "0a8137291d45a71acc9199218aef4728c4b50235f5db4762b52c3b29e4438cb2"
    } as const),
    "outputReview": Object.freeze({
      "path": "scripts/footprint-inverse-native-delete-cold-ui.cs",
      "bytes": 1_047_654,
      "sha256": "d894b17969f5bf6ec56520a42c457303e48c55a6a4dc5242915bd85829ea56c8"
    } as const),
    "owner": Object.freeze({
      "relativePath": "scripts/native-baseline/inverse-native-cold-ui-v1/owner.cs",
      "bytes": 1_047_654,
      "sha256": "d894b17969f5bf6ec56520a42c457303e48c55a6a4dc5242915bd85829ea56c8"
    } as const),
    "driver": Object.freeze({
      "relativePath": "scripts/native-baseline/inverse-native-cold-ui-v1/driver.ps1.txt",
      "bytes": 92_405,
      "sha256": "b19f552a403941c02e0c743a3b0322b6188a1b860b0b41dde759278ea1317d97"
    } as const),
    "marker": "# INSERT EXACT FIXED INVERSE NATIVE OWNER V1\n"
  } as const)
} as const);
