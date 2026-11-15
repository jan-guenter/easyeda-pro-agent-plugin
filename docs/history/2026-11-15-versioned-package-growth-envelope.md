# Versioned package-growth envelope, 2026-11-15

The combined source build exceeded the historical16MiB facade-file envelope
and the package already exceeded the original installed verifier's5,000-entry
bound. The build itself succeeded. The repository scanner refused the large
facade before performing its content scan; that refusal is retained as a
packaging failure, not a runtime or connected result.

The new shared release byte budget admits20MiB only at the exact reproducible
`plugins/easyeda-pro-control/server/dist/server.mjs` repository path. Repository
validation still requires its complete reviewed byte count and digest before
accepting a file larger than8MiB and still performs the privacy scan. All other
repository files keep their previous limits.

The installed verifier has an explicit `--profile=v2` option and separate
`easyeda-pro-control.installed-payload.v2` result. It permits8,192 entries and
20MiB only for the exact installed `server/dist/server.mjs` path. Other installed
files remain limited to16MiB. Aggregate bytes, descriptor identity, hard-link,
symlink, exact path, Git commit, file mode and directory mode checks are
unchanged. The old entry point, limits and v1 result remain available.
Neither result supplies runtime authority or a connected execution claim.

Focused real Git-package comparisons cover an actual facade above16MiB,
refusal after a changed byte beyond that old boundary, and refusal of an
oversized file at another path. Repository cases retain alias, digest, byte
count and over-limit refusals. Both TypeScript configurations, the focused
tests and strict lint for the changed source passed. Final combined package
comparison and exact release CI remain pending.
