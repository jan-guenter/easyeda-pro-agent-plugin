/** Conservative contract for this repository's fixed CI layout, not a YAML parser. */
/* oxlint-disable no-template-curly-in-string -- These exact Bash and GitHub expressions are data, not JavaScript templates. */
export const CI_GATE_SCRIPT = 'test "${BUILD_RESULT}" = "success"\ntest "${FACADE_RESULT}" = "success"';
export const CI_GATE_JOB = [
  "  test-build:",
  "    name: test-build",
  "    needs: [verify-build, facade-tests]",
  "    if: always()",
  "    runs-on: ubuntu-24.04",
  "    timeout-minutes: 2",
  "    steps:",
  "      - name: Require build checks and every facade shard",
  "        env:",
  "          BUILD_RESULT: ${{ needs.verify-build.result }}",
  "          FACADE_RESULT: ${{ needs.facade-tests.result }}",
  "        shell: bash",
  "        run: |",
  ...CI_GATE_SCRIPT.split("\n").map((line) => `          ${line}`),
].join("\n");
const SHARD_HEADER = [
  "  facade-tests:",
  "    name: facade-tests (${{ matrix.shard }}/8)",
  "    runs-on: ubuntu-24.04",
  "    timeout-minutes: 30",
  "    strategy:",
  "      fail-fast: false",
  "      matrix:",
  "        shard: [1, 2, 3, 4, 5, 6, 7, 8]",
  "",
  "    steps:",
].join("\n");
const SHARD_COMMAND = "node --import ./scripts/test-isolation.ts --test --test-concurrency=1 --test-shard=${{ matrix.shard }}/8 server/tests/*.test.ts";
const SHARD_SAFETY = [
  "sudo prlimit --pid \"${PPID}\" --core=0:0",
  'ulimit -S -c 0', 'ulimit -H -c 0',
  'test "${parent_core_soft}" = "0"', 'test "${parent_core_hard}" = "0"',
  'test "$(node --version)" = "v24.18.0"', 'test "$(npm --version)" = "11.16.0"',
  'readFileSync("/proc/self/limits", "utf8")', "persist-credentials: false",
  "node-version: 24.18.0", 'test "$(npm config get ignore-scripts)" = "true"', "npm ci --ignore-scripts",
  'bwrap_commit="1b80120ef26a28e065e67f89bfef873f13bdd317"',
  "https://github.com/containers/bubblewrap.git", "-Dsupport_setuid=false", "libcap2-bin", "sqlite3",
  'sudo install -o root -g root -m 0755 "${bwrap_source}/_build/bwrap" /usr/sbin/bwrap',
  "test ! -L /usr/sbin/bwrap", 'test "$(/usr/sbin/bwrap --version)" = "bubblewrap 0.11.2"',
  'test "$(stat -c \'%a:%u:%g\' /usr/sbin/bwrap)" = "755:0:0"', 'test -z "$(getcap -n /usr/sbin/bwrap)"',
  "--bind-fd --ro-bind-data --ro-bind-fd --json-status-fd --block-fd --disable-userns",
  "kernel.apparmor_restrict_unprivileged_userns=0", "run: npm run build",
  'exec 142</etc/hosts', 'exec 145</etc/group',
  'test "$(readlink /proc/self/fd/142)" = "/etc/hosts"', 'test "$(readlink /proc/self/fd/145)" = "/etc/group"',
  "          LC_ALL: C", 'test "$(ulimit -c)" = "0"',
];
/* oxlint-enable no-template-curly-in-string */

/** Exact gate text makes skipped, cancelled, failed or absent dependencies fail. */
export function validateCiWorkflow(source: string): readonly string[] {
  const errors: string[] = [];
  if (Buffer.byteLength(source) > 65_536 || source.split("\njobs:\n").length !== 2) { return ["CI source shape or bound differs."]; }
  const body = source.split("\njobs:\n")[1];
  if (body === undefined) { return ["CI jobs missing."]; }
  const starts = [...body.matchAll(/^ {2}([A-Za-z_][A-Za-z0-9_-]*):$/gmu)];
  if (starts.map((match) => match[1]).join(",") !== "verify-build,facade-tests,test-build") {
    return ["CI must contain exactly the build, eight-shard matrix and protected gate jobs."];
  }
  const jobs = starts.map((match, index) => body.slice(match.index, starts[index + 1]?.index).trimEnd());
  const build = jobs[0] ?? "", gate = jobs[2] ?? "", shards = jobs[1] ?? "";
  if (!build.startsWith("  verify-build:\n    runs-on: ubuntu-24.04\n    timeout-minutes: 20\n\n    steps:\n")) { errors.push("Build job must remain unconditional."); }
  if (!shards.startsWith(`${SHARD_HEADER}\n`)) { errors.push("Exact complete shard matrix required."); }
  if (gate !== CI_GATE_JOB) { errors.push("Protected gate must require success of both dependencies even after failure or skipping."); }
  if (/^\s*continue-on-error:/mu.test(source) || /^ {8}if:/mu.test(`${build}\n${shards}`)) { errors.push("Build and shard checks cannot be optional or conditional."); }
  if (/uses:\s+[^\s#]+@(?![a-f0-9]{40}\b)/u.test(source)) { errors.push("Every CI action must be commit-pinned."); }
  const commands = shards.split("\n").filter((line) => line.includes("node --import") && line.includes("--test"));
  if (commands.length !== 1 || commands[0]?.trim() !== SHARD_COMMAND) { errors.push("Shard command must retain every test, preload and serial worker bound."); }
  for (const safety of SHARD_SAFETY) { if (!shards.includes(safety)) { errors.push(`Missing per-shard safety: ${safety}`); } }
  if (shards.includes("actions/upload-artifact")) { errors.push("Only the build job may upload the shared plugin artifact."); }
  return Object.freeze(errors);
}
