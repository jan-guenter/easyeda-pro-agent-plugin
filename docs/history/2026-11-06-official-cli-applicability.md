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
