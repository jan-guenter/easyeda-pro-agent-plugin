/** Ordinary existing-profile startup only. The application bootstrap is byte
 * identical to 206; the executable, package and module selectors are separate
 * reviewed identities. This profile grants no native diagnostic/design route.
 */
export const ORDINARY_LAUNCH_209_PROFILE = {
  schema: "easyeda-pro-control.ordinary-launch.v1",
  installedPackageVersion: "3.2.209.8a704eab",
  installedFiles: [
    { relativePath: "../../../easyeda-pro.exe", bytes: 222_989_936, sha256: "8770f2cea950d9483f230f961b486e5ceaeffd619e2c2816957cb6ff3fd0bb38" },
    { relativePath: "../app.js", bytes: 2_657_192, sha256: "52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c" },
    { relativePath: "../package.json", bytes: 248, sha256: "c63c12edae82c39c1fb2c0f0dd0e27678b83526c89ea174b3b79655711da8e51" },
    { relativePath: "../editor.ini", bytes: 8031, sha256: "ced74cf98aedf6b04d0f23871b945f4155978d7e35edbc1704b8cdaf566623f9" },
  ],
  helper: { relativePath: "scripts/windows-authority.ps1", sha256: "507fdea31ee30387ea31e90ca749058fa987ee573de12940db57357d2d321e35" },
} as const;
