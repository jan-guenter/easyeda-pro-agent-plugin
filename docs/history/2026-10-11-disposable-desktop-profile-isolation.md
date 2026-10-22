# Disposable desktop profile isolation

Reviewed 2026-10-11. This is source research, not a launched or validated profile.

## Conclusion

The pinned Windows build has no established same-user disposable-profile route
that isolates preferences, registered projects, project backups and browser
state together. Adding a generic `--user-data-dir` argument is insufficient.
EasyEDA derives its configuration and preference database from the Windows
Documents directory independently of Electron browser storage. It also sets
`userData` itself and derives several other directories separately.

The maintained launcher supplies no profile argument, alternate account or
filesystem isolation. Its Windows Job establishes process ownership, not a
restriction on which files EasyEDA can modify. Keep the passive navigation
preference guard. This research does not authorize bypassing it or changing the
current user's preferences, retention settings, configuration or folders.

## Sources and method

The inspected desktop package reports version `3.2.149.88089769` and entrypoint
`./app.js`. All asset offsets below are zero-based UTF-16 string offsets in the
exact files below, relative to the installed `resources/app` directory.

| Asset | SHA-256 |
| --- | --- |
| `package.json` | `f7d9813ce9c0880ec8e5477bf0714843786e31ec09fac451011da2f030c51a71` |
| `app.js` | `10a427460d498667f6d1df9cd8899a1740afd9644cbf83ecaf80365d590869bb` |
| `assets/pro-ui/3.2.149.43637efe/js/ui.js` | `12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a` |

Only installed program source and maintained launcher source were read. No
preference database, real configuration, project, backup inventory, browser
storage or account data was inspected. No application launch, copy, setting
change or live tool call was performed.

## Independent storage roots

Desktop `app.js` offset1328595 computes `el` from `app.getPath("documents")`,
falling back to the home directory's `Documents` child. For EasyEDA Pro the
application directory name is `EasyEDA-Pro`. Offset1329034 derives `Ke` from
that Documents directory. The Windows cache root instead derives from the
home directory's `AppData/Local` child at1328783 onward.

| Resource | Derived location or authority | Source anchor |
| --- | --- | --- |
| Client configuration | `<Documents>/EasyEDA-Pro/config.json` | `xt`,1329634; read and possible initial write1329877 |
| Preferences and project history database | `<Documents>/EasyEDA-Pro/database/web.db` | `_`,1329185; preference service2215919; history query2324214 |
| Default projects and examples | `Ke/projects`, `Ke/example-projects`, or configuration `APP_PROJECT_DIR` | path declarations1329400 onward; `ys`1323871 |
| Libraries | `Ke/libraries`, or configuration `LIB_DIR` | path declarations1329320 onward; `A0`1324363 |
| Online backups | `Ke/online-projects-backup`, or `ONLINE_BACKUP_DIR` | path declarations1329500 onward; `Ua`1324122 |
| Recovery backups | `Ke/projects-recovery`, or `TMP_BACKUP_DIR` | path declarations1329580 onward; `D5`1324247 |
| Electron `userData` | `<Home>/AppData/Local/EasyEDA-Pro/cache.<arch>.3` | `ur`,1329242; unconditional `setPath` in `tT`1238747 |
| Model cache and updater | Siblings `cache.model.2` and `updater` beneath the same Local root | path declarations1329290 onward |
| Offline project backups | A `<project-name>_backup` directory beside each registered project | `Sn.getFilePath`2213275 |

Configuration loading occurs during module initialization, before `oh` calls
`tT` at2652725. Merely starting the program can create its default configuration
if absent. `tT` creates these derived directories and sets Electron `userData`;
it does not select an independent preference database.

The client settings route is not an ephemeral profile selector. `$5` near1354390
changes project/library/online-backup paths in `I`, writes the same `xt` file
and relaunches. The `changeLaunchType` handler2641000 also writes that file,
including optional recovery-backup changes. Selecting OFFLINE mode therefore
does not isolate storage. Neither route changes the separately derived `web.db`
path, and both would alter the current user's shared configuration.

## Why backup and session state remain relevant

`setPreference`2215919 updates `users.preference` using the fixed `_` database.
It then obtains `projectPaths`, enumerates each project's backups and applies
`saveConfig.autoBackupNum`. `projectPaths`2321115 uses the current project
registry; directory discovery1428879 obtains configured project directories
through `ys`. `Sn.getFilePath`2213275 derives backup locations from each project
path, not from Electron `userData`. A fresh browser cache would not constrain
this deletion authority. See the separate
[navigation side-effect trace](2026-10-11-pcb-navigation-preference-side-effects.md).

The desktop creates its ordinary `BrowserWindow` at1356492 without an explicit
session or partition and uses `session.defaultSession` during startup2652725.
UI `saveContainerData`16272148 stores the complete tab-container layout in
`sessionStorage`; the before-unload handler12500478 invokes it. UI preferences
also occupy `localStorage`, including writes15792597 and15797699. Desktop
project history separately queries `web.db` at2324214. Browser storage and
native project history are therefore different isolation obligations.

Electron documents `sessionData` as the browser-storage location, defaulting to
`userData`, and requires a pre-ready override to relocate it. That contract does
not relocate application-managed files under Documents. This trace does not
assume how every Chromium flag interacts with this build's explicit `setPath`.
The fixed native database and project-relative backup paths already disprove
complete isolation through a cache flag alone.
[Electron app paths](https://www.electronjs.org/docs/latest/api/app#appgetpathname),
[path overrides](https://www.electronjs.org/docs/latest/api/app#appsetpathname-path).

## Arguments and maintained launcher

The pinned `app.js` contains no `user-data-dir`, `sessionData`, `fromPartition`
or `getSwitchValue` implementation. Its application-level argument handling
recognizes `--edaDebug` at2652552 and project/library filename suffixes in
`DY`2650973 and `UY`2651103. It requests the single-instance lock at2652950;
the second-instance handler forwards file arguments to the existing process.
These are positive traces of the inspected paths, not proof that Electron has
no other built-in switches. The current official switch reference also does
not establish an EasyEDA-wide profile contract.
[Electron switch reference](https://www.electronjs.org/docs/latest/api/command-line-switches).

The maintained strict `launch-contained` schema in
[index.ts](../../plugins/easyeda-pro-control/server/src/index.ts) accepts only the
action and `confirmLaunch`. [windows-runtime.ts](../../plugins/easyeda-pro-control/server/src/windows-runtime.ts)
derives and hashes the installed executable; it provides no profile parameter.
[windows-authority.ps1](../../plugins/easyeda-pro-control/scripts/windows-authority.ps1)
calls `CreateProcess` at line76 with only the quoted executable, its installation
directory and a null environment pointer. It assigns the process to a Job,
without a restricted token or alternate-user launch. Microsoft documents that
this API uses the caller's security context and a null environment pointer
inherits the caller's environment. There is no filesystem redirection here.
[CreateProcessW](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessw).

## What would establish isolation

A future supported profile mechanism would need to redirect and prove all of
the roots above before EasyEDA initialization, including native configuration,
`web.db`, browser state, registered project paths, libraries, caches and every
backup/recovery destination. It must prevent old absolute paths, restored tabs,
single-instance forwarding and account synchronization from reconnecting the
disposable process to real data. Copying the real configuration or browser
profile would not establish those properties.

A separately authorized Windows account with restricted access, or an isolated
Windows VM with no real-user data mounts, is a candidate for further validation.
Neither is implemented or proved by this research. Such a change also needs a
reviewed launcher, bridge provisioning and fresh runtime admission. Do not
approximate it by changing environment variables, moving real directories,
editing the installed app, intercepting preference writes or weakening guards.
