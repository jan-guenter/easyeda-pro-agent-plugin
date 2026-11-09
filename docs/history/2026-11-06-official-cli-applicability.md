# Official CLI applicability, 2026-11-06

The official CLI is a credible separate automation path for a newer desktop runtime. It is **not present as an operational editor CLI in the installed 3.2.209 runtime**, and no new runtime was installed, launched or admitted during this review.

The [official English guide](https://prodocs.easyeda.com/en/api/guide/cli.html) describes sessions, JavaScript invocation, API/file-format discovery, JSON results and MCP. Its `--headless` option creates a hidden editor window; it does not establish an editor-free renderer, GPU-free execution or a pure file compiler. Its `.eprj3` example writes `build/P1.esch2` into a live folder project and waits for editor reload before checking primitives, DRC and an exported image. That is a new folder-project workflow, not a documented direct write route into the existing `.eprj2` SQLite file. The page says desktop 4.1.60 or newer.

The newer [official CLI repository](https://github.com/easyeda/easyeda-client-cli/tree/5452c638fca802ea29e27277479a56d869feb10a), inspected at main commit `5452c638fca802ea29e27277479a56d869feb10a` (2026-11-02), instead requires **4.1.70 or newer**. Its [AI guide](https://github.com/easyeda/easyeda-client-cli/blob/5452c638fca802ea29e27277479a56d869feb10a/cli-for-ai.md) requires discovering the installed executable’s actual help and built-in reference because commands and signatures evolve. It distinguishes international `easyeda-pro` from mainland-China `lceda-pro`. Repository contents are four Markdown documents, with no release binaries. An [official-repository contributor response](https://github.com/easyeda/easyeda-client-cli/issues/1) states MCP support was updated in 4.1.71; this is a maintainer statement, not our runtime validation. The preceding issue reports older MCP/invocation failures and is not independent proof that every later path works.

Availability is distribution-specific. The [international download page](https://easyeda.com/page/download), fetched as HTML today, advertises **3.2.209** for Windows, Linux and macOS. The [Chinese official download page](https://lceda.cn/page/download) advertises **4.1.97**, including Linux x64 ZIP and Windows x64 EXE. Metadata-only HEAD requests returned HTTP200 for the linked CDN packages:

| Official package URL | Content-Length | Last-Modified |
| --- | ---: | --- |
| `https://image.lceda.cn/files/lceda-pro-linux-x64-4.1.97.zip` | 365745749 | 2026-11-05 08:15:02 GMT |
| `https://image.lceda.cn/files/lceda-pro-windows-x64-4.1.97.exe` | 258736448 | 2026-11-05 08:13:39 GMT |

No package body was downloaded. These observations establish a published download and responding object, not package integrity, installation success or CLI correctness.

Read-only installed-file inspection found:

| Installed file under `C:/Program Files/easyeda-pro/resources/app` | Evidence |
| --- | --- |
| `package.json` | `version: 3.2.209.8a704eab`, entry `app.js` |
| `cli.js` | 46-byte strict-mode/source-map stub; SHA256 `3fdc2cb9e9756a03841447910528f9b9c44fb7730de8dc2cdf3ff757c2a355b2` |
| `assets/pro-api/0.3.59.1ca9efb5/cli.js` | 12169 bytes; only `help` command dispatch; SHA256 `6fb9193532658992263ac33e2f41ed8c0d47a61909e97c90d023c4b4f48725ad` |
| Corresponding `cli.schema.json` | 78 bytes, empty `$defs`; SHA256 `1520e4d7cfafca1a6ab43a61f6f72e022db542dca6088b51ec3347ea50d8a13a` |

Neither installed main nor CLI source contains the documented `doctor`, `--headless`, `--mcp` or `session.abort` dispatcher vocabulary. A generated EPRJ3 example in the help stub does not supply those missing implementations. No executable was invoked to test this conclusion.

No reviewed official contract establishes a portable mode, independent user-data/bridge namespace, concurrent side-by-side profile isolation or safe reuse of the current Windows settings. A Linux ZIP provides an extraction format, not that isolation guarantee. The smallest useful follow-up is an explicitly separate disposable 4.1.97 evaluation environment: first inspect actual help and source, then test CLI-owned session/open/invoke/normal shutdown and complete saved/reopened artifacts. Such a new evaluation could remove much custom navigation/invocation plumbing. It would still need version-specific source/API compatibility, unknown-result/no-replay handling and independent persistence checks. The [official format description](https://github.com/easyeda/easyeda-client-cli/blob/5452c638fca802ea29e27277479a56d869feb10a/easyeda-format.md) explicitly describes eventual-consistency records; a successful invocation alone does not prove all storage work has settled.

This note changes no 3.2 source pin, admission, owner, helper, payload or authority. Existing private projects were neither opened nor inspected.

## Packaged 4.1.97 static follow-up

The parent subsequently downloaded the official Linux ZIP for inspection. The complete365745749-byte archive has SHA256 `106133757742048009973b034ff2455a70226b6950241ed65ca334cf26f19071`. Its package identifies `4.1.97.04b092ac`; `resources/app/app.js` is3283623bytes, SHA256 `6df0fc4c87590743b9eea19ae27e42d0f0b243bd3f6e88b390f06cf14eadfee5`. This follow-up parsed that file with Acorn and read selected package/default-app texts without executing vendor JavaScript, CLI or application code. Unlike the installed3.2 stub, this package contains operational CLI/session/MCP implementations.

The ordinary `zG` bootstrap calls `h2` **before CLI classification**, so even documentation/doctor invocations can create application directories. Default data/config/license/database paths derive from `Documents/LCEDA-Pro`; Linux browser/cache/update paths derive from `~/.config/LCEDA-Pro`. `h2` normally sets Electron `userData` to that cache path. `lz[3136460,3136585)` derives the endpoint from the application name and the first eight SHA256 characters of Electron’s current user-data path; `wM[3136585,3136700)` places the Linux socket in `os.tmpdir()`.

The hidden `--owner` selects the resident-server role. Linux child startup (`RG/xG[3270556,3270711)`) detaches/unrefs the executable and forwards `--owner` plus `--userData=<cache-path>`. Within `app.js`, the `--userData` constant has only three references: filtering that option from command arguments twice, and forwarding it to the child once. It does **not** select the data/config roots there. That leaves no established profile-isolation contract for the hidden flag. This finding is limited to the inspected JavaScript/default-app code; native executable behavior was not executed or proved.

A separate embed context can redirect data/config/cache roots through `DSH_EDA_CLI_DATA_DIRECTORY`, but it also causes the normal CLI bootstrap to be skipped. The packaged tail disables the `createClientHost` export; its retained internal implementation therefore does not establish an externally callable embed backend. The default-app ASAR text contains no additional `userData`/`--owner` handling. None of these internal branches was patched or called.

Session cleanup is narrower than persistence proof. `sG.close[3258769,3259473)` marks a session closed, rejects queued/in-flight requests and destroys hidden windows, or visible windows when destruction is requested. Its underlying bridge can also destroy adopted user-origin windows; callers must retain only their originally issued session. `sG.abort[3259474,3260074)` destroys the window and removes its map entry. `VC.destroy` uses `BrowserWindow.destroy`, not a normal editor Save/close transaction. `stop` reaches `gg[3163491,3163675)`: it begins shutdown, waits for pending frames for at most3seconds, closes the socket service, disposes sessions and invokes application exit. The ordinary cleanup callback removes temporary URL state and shuts down folder watches. These results do not prove every original renderer/SQL/file operation fulfilled, and an invocation timeout does not establish absence of effects.

A hidden session is still a real BrowserWindow using the default Electron session, with no independent partition and with background throttling disabled. A feasible Linux evaluation therefore needs an actual filesystem/user boundary, such as a disposable non-root container or VM with its own home, document/config directories, temporary socket directory and activation/config files, and no host CAD/profile mounts. A display backend may still be required; hidden rendering is not proof of display/GPU independence. Runtime libraries, activation, offline configuration and genuine process-tree shutdown remain to be checked on the extracted package. Merely changing a flag, using a ZIP directory, or changing `TMPDIR` does not establish all of those boundaries. The bundled installer is unsuitable for an isolated source probe: it replaces `/opt/apps/lceda-pro`, creates a global command link and desktop entry, recursively changes permissions, and offers a reboot. It was only read.

No new runtime was launched and no existing owner was contacted or terminated by this inspection. Current3.2 admissions and source work remain separate.

## Separate offline candidate declaration inventory

The follow-up extracted the package's1857649-byte `api-types.d.ts`, SHA256
`773046ae11ae9291215226858c7dfc9f8121bbba5f0e7c71d29cd7aa53c81257`,
as data and parsed it with the maintained declaration inventory. The new
`packaged-4197` offline `sdk`/`coverage` reference records115 mounted namespaces,
862 method signatures,829 distinct method paths and474 type names. The three
earlier snapshots remain byte-identical metadata. The combined coverage inventory
now contains855 distinct paths rather than835, without any new execution route.

Its20 new paths cover library geometry, DFM, PCB command-group lifecycle,
fanout/ratlines, detailed DRC, stackup, primitive search, schematic region
rendering/search, Altium export and source-pin geometry. Two former
`sch_SourceDocument` region methods are absent from the candidate and appear
under `sch_Document`; the older paths remain in their original snapshots rather
than becoming aliases or receiving candidate execution support. Every
candidate-only method has a concrete `packaged-4197-runtime-not-admitted`
omission. Static signatures establish neither working implementations nor
permission to use arbitrary CLI invocation. No external compatibility pin,
application installation, native owner or saved-result claim changed.

Both TypeScript projects, strict type-aware lint,75 focused catalog/coverage
checks, deterministic candidate regeneration, all-skill validation and repository
validation passed. The initial focused run retained a stale aggregate omission
count, and the first lint run required an explicit filesystem-flags exception;
both failures remain in private logs. Bundles, full exact-payload CI and actual
candidate execution remain separate work.
