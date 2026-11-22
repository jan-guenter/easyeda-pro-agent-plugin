/** Independent readable canonical build inputs forked from exact source commit
 * 9db9d91e2116b5c6cbc9475d7dd79b680ea8af88. Targets are comparison/output only.
 * Original helper/review hashes retain that immutable provenance. Separate
 * output pins include the PR223 socket-reader and PR224 transport corrections; current owner
 * hashes identify the reviewed amendment, not unchanged ancestor bytes.
 * Build metadata is never a native-owner receipt. */
export const CURRENT_INVERSE_NATIVE_CANONICAL_BASELINES=Object.freeze({
  "inverse-native-continuation.v4": Object.freeze({
    "commit": "9db9d91e2116b5c6cbc9475d7dd79b680ea8af88",
    "sourceRevision": "reviewed-native-transport-custody.v3",
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
      "bytes": 1_859_307,
      "sha256": "470881b1b8921a6cd654e48a8e293b0597c3681d16a16e0fb83924bf7d7f4358"
    } as const),
    "outputReview": Object.freeze({
      "path": "scripts/footprint-inverse-native-continuation-v4.cs",
      "bytes": 2_544_814,
      "sha256": "5e4c73862115208e2163431ed73c3a439e9c4b4fc3b5b671ccc62e6dadebfd17"
    } as const),
    "owner": Object.freeze({
      "relativePath": "scripts/native-baseline/inverse-native-v4-v1/owner.cs",
      "bytes": 2_544_814,
      "sha256": "5e4c73862115208e2163431ed73c3a439e9c4b4fc3b5b671ccc62e6dadebfd17"
    } as const),
    "driver": Object.freeze({
      "relativePath": "scripts/native-baseline/inverse-native-v4-v1/driver.ps1.txt",
      "bytes": 298_942,
      "sha256": "ac38f710ce86e27c1a2862ed27628fadd660ddb7b0f565ce92a60713730b6b1f"
    } as const),
    "marker": "# INSERT EXACT FIXED INVERSE NATIVE OWNER V1\n"
  } as const),
  "inverse-native-delete-cold-ui.v1": Object.freeze({
    "commit": "9db9d91e2116b5c6cbc9475d7dd79b680ea8af88",
    "sourceRevision": "reviewed-native-transport-custody.v3",
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
      "bytes": 691_685,
      "sha256": "1a061bfe3c64ffeafbd64a0f52bb6d382c3978a08fdd34b3c3191bfda36768d5"
    } as const),
    "outputReview": Object.freeze({
      "path": "scripts/footprint-inverse-native-delete-cold-ui.cs",
      "bytes": 1_048_790,
      "sha256": "4934bf7fc4128d3db28996fc63be7bcde0c04acaa3b5ef5199489c085144ae87"
    } as const),
    "owner": Object.freeze({
      "relativePath": "scripts/native-baseline/inverse-native-cold-ui-v1/owner.cs",
      "bytes": 1_048_790,
      "sha256": "4934bf7fc4128d3db28996fc63be7bcde0c04acaa3b5ef5199489c085144ae87"
    } as const),
    "driver": Object.freeze({
      "relativePath": "scripts/native-baseline/inverse-native-cold-ui-v1/driver.ps1.txt",
      "bytes": 92_812,
      "sha256": "04029913670f70dc6a4bee3de7fbd3370b41b0e991b6e20b7b429da9b3e59ce6"
    } as const),
    "marker": "# INSERT EXACT FIXED INVERSE NATIVE OWNER V1\n"
  } as const)
} as const);
