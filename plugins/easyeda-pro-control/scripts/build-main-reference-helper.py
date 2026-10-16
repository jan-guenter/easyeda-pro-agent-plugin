#!/usr/bin/env python3
"""Build the fixed Framework helper twice; never load or execute the output DLL."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import platform
import re
import stat
import subprocess
import tarfile
import tempfile
import time
import urllib.request
import zipfile


HERE = Path(__file__).resolve().parent
PLUGIN = HERE.parent


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def digest(data, algorithm="sha256"):
    return hashlib.new(algorithm, data).hexdigest()


def read_file(path, maximum):
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
    with os.fdopen(fd, "rb") as stream:
        before = os.fstat(stream.fileno())
        require(stat.S_ISREG(before.st_mode) and before.st_nlink == 1 and
                0 <= before.st_size <= maximum, "Invalid build input")
        data = stream.read(maximum + 1)
        after = os.fstat(stream.fileno())
        named = path.lstat()
        keys = ("st_dev", "st_ino", "st_mode", "st_size", "st_mtime_ns", "st_ctime_ns")
        require(len(data) == before.st_size and all(getattr(before, k) == getattr(after, k) ==
                getattr(named, k) for k in keys), "Build input changed while reading")
        return data


def acquire(spec, supplied, target):
    if supplied is not None:
        data = read_file(supplied, spec["bytes"])
    else:
        started = time.monotonic()
        with urllib.request.urlopen(spec["url"], timeout=30) as response, target.open("xb") as output:
            require(response.geturl().startswith("https://"), "Insecure download redirect")
            count = 0
            while True:
                block = response.read(1024 * 1024)
                if not block:
                    break
                count += len(block)
                require(count <= spec["bytes"] and time.monotonic() - started < 300, "Download bound exceeded")
                output.write(block)
        data = read_file(target, spec["bytes"])
    require(len(data) == spec["bytes"] and digest(data, spec["algorithm"]) == spec["digest"],
            "Public build archive does not match the reviewed pin")
    if supplied is not None:
        target.write_bytes(data)
    return target


def sdk_tree(archive_path, destination, existing):
    """Only the hash-bound archive's regular files/directories are admitted."""
    seen, total, files, directories = set(), 0, 0, 0
    if not existing:
        destination.mkdir(mode=0o700)
    require(destination.resolve() == destination and destination.is_dir(), "Invalid SDK root")
    with tarfile.open(archive_path, "r:gz") as archive:
        for member in archive:
            require(member.isdir() or member.isfile(), "SDK archive contains a link or special file")
            name = member.name
            while name.startswith("./"):
                name = name[2:]
            if member.isdir() and name in ("", "."):
                continue
            name = name.rstrip("/") if member.isdir() else name
            require(name and not name.startswith("/") and "\\" not in name and
                    all(p not in ("", ".", "..") for p in name.split("/")) and name not in seen,
                    "Invalid SDK member name")
            seen.add(name)
            require(len(seen) <= 5802 and 0 <= member.size <= 268435456, "SDK member bound")
            total += member.size
            require(total <= 638009029, "SDK expanded-size bound")
            target = destination / name
            if member.isdir():
                directories += 1
                if not existing:
                    target.mkdir(mode=0o700, parents=True, exist_ok=True)
                require(target.is_dir() and not target.is_symlink(), "SDK directory mismatch")
            else:
                files += 1
                with archive.extractfile(member) as stream:
                    data = stream.read(member.size + 1)
                require(len(data) == member.size, "SDK member length mismatch")
                if existing:
                    require(read_file(target, member.size) == data, "Deployed SDK differs from public archive")
                else:
                    target.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
                    with target.open("xb") as output:
                        output.write(data)
                    target.chmod(0o600 | (member.mode & 0o100))
                require(bool(target.stat().st_mode & 0o100) == bool(member.mode & 0o100), "SDK executable mode mismatch")
    require((len(seen), files, directories, total) == (5802, 5030, 772, 638009029), "SDK inventory mismatch")
    actual = {p.relative_to(destination).as_posix() for p in destination.rglob("*")}
    require(actual == seen, "Unexpected deployed SDK file")


def compile_once(root, sdk, sources, references, recipe):
    source_root, ref_root = root / "src", root / "refs"
    source_root.mkdir(mode=0o700)
    ref_root.mkdir(mode=0o700)
    for name, body in sources.items():
        (source_root / name).write_bytes(body)
    for name, body in references.items():
        (ref_root / name).write_bytes(body)
    for name in ("home", "tmp"):
        (root / name).mkdir(mode=0o700)
    output = root / recipe["output"]
    arguments = ["/nostdlib+", "/langversion:5", "/platform:x64", "/target:library", "/deterministic+",
                 "/optimize+", "/debug-", "/warn:4", "/warnaserror+", "/codepage:65001", "/utf8output", "/nologo",
                 '/pathmap:"' + str(root) + '=/easyeda-main-reference"', '/out:"' + str(output) + '"']
    arguments += ['/reference:"' + str(ref_root / name) + '"' for name in references]
    arguments += ['"' + str(source_root / name) + '"' for name in sources]
    response = root / "helper.rsp"
    response.write_text("\n".join(arguments) + "\n", encoding="utf-8")
    environment = {"PATH": "/usr/bin:/bin", "LANG": "C", "LC_ALL": "C", "TZ": "UTC",
                   "TMPDIR": str(root / "tmp"), "DOTNET_ROOT": str(sdk),
                   "DOTNET_CLI_HOME": str(root / "home"), "DOTNET_CLI_TELEMETRY_OPTOUT": "1",
                   "DOTNET_SKIP_FIRST_TIME_EXPERIENCE": "1", "DOTNET_NOLOGO": "1",
                   "DOTNET_MULTILEVEL_LOOKUP": "0", "DOTNET_ROLL_FORWARD": "Disable"}
    with (root / "compiler.log").open("xb") as log:
        result = subprocess.run([str(sdk / "dotnet"), "exec", str(sdk / "sdk/10.0.111/Roslyn/bincore/csc.dll"),
                                 "/noconfig", "@" + str(response)], cwd=root, env=environment,
                                stdin=subprocess.DEVNULL, stdout=log, stderr=subprocess.STDOUT, timeout=120, check=False)
    diagnostics = read_file(root / "compiler.log", 1048576)
    require(result.returncode == 0 and not diagnostics, "Helper compilation failed; retained compiler.log has diagnostics")
    return read_file(output, 1048576)


def publish(path, body):
    if path.exists() or path.is_symlink():
        read_file(path, 1048576)
    temporary = path.with_name(path.name + ".build-tmp")
    with temporary.open("xb") as stream:
        stream.write(body)
        stream.flush()
        os.fsync(stream.fileno())
    temporary.chmod(0o644)
    os.replace(temporary, path)


def current_runtime_sources(originals, profile):
    """Fixed two-file build variant. Historical source files are never changed."""
    require(set(profile) == {"schema", "sourcePins", "versions", "runtimePins"} and
            profile["schema"] == "easyeda.current-main-reference-runtime.v1", "Current runtime profile shape")
    require(set(profile["sourcePins"]) == {"FixedFileData.cs", "MainReferenceEvidence.cs"}, "Current source selection")
    for name, pin in profile["sourcePins"].items():
        require(digest(originals[name]) == pin, "Historical source differs from the current transform input")
    require(profile["versions"] == {"electron": "41.2.1-jlc-sa-win-x64.5", "chrome": "146.0.7680.188",
                                    "node": "24.14.1"}, "Current runtime version selection")
    sources = dict(originals)
    file_source = sources["FixedFileData.cs"].decode("utf-8")
    names_match = re.search(r'private static readonly string\[\] names = \{(.*?) \};', file_source, re.S)
    hashes_match = re.search(r'private static readonly string\[\] runtimeHashes = \{(.*?) \};', file_source, re.S)
    require(names_match is not None and hashes_match is not None, "Fixed runtime arrays missing")
    names = re.findall(r'"([^"]+)"', names_match.group(1))[:18]
    names[16] = "locales\\" + names[16]
    old_hashes = re.findall(r'"([a-f0-9]{64})"', hashes_match.group(1))
    require(len(old_hashes) == len(names) == 18 and list(profile["runtimePins"]) == names and
            all(re.fullmatch(r"[a-f0-9]{64}", pin) for pin in profile["runtimePins"].values()), "Current runtime pin inventory")
    for name, old_hash in zip(names, old_hashes):
        require(file_source.count(old_hash) == 1, "Historical runtime hash substitution is ambiguous")
        file_source = file_source.replace(old_hash, profile["runtimePins"][name])
    sources["FixedFileData.cs"] = file_source.encode("utf-8")
    evidence = sources["MainReferenceEvidence.cs"]
    before = b'Equal(value, "electron", "41.2.1-jlc-sa-win-x64.2")'
    after = b'Equal(value, "electron", "41.2.1-jlc-sa-win-x64.5")'
    require(evidence.count(before) == 1, "Historical Electron assertion substitution is ambiguous")
    sources["MainReferenceEvidence.cs"] = evidence.replace(before, after)
    require({name for name in sources if sources[name] != originals[name]} == set(profile["sourcePins"]),
            "Current runtime transform changed an unexpected source")
    return sources


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true")
    mode.add_argument("--write", action="store_true")
    parser.add_argument("--current-runtime", action="store_true")
    parser.add_argument("--sdk-archive", type=Path)
    parser.add_argument("--reference-package", type=Path)
    parser.add_argument("--sdk-a", type=Path)
    parser.add_argument("--sdk-b", type=Path)
    parser.add_argument("--source-directory", type=Path, default=PLUGIN / "scripts/main-reference/native")
    parser.add_argument("--output-directory", type=Path, default=PLUGIN / "server/bin")
    parser.add_argument("--identity-file", type=Path)
    args = parser.parse_args()
    require(platform.system() == "Linux" and platform.machine() == "x86_64", "Build requires Linux x64")
    require((args.sdk_a is None) == (args.sdk_b is None), "Both independent SDK roots are required")
    os.umask(0o077)
    recipe_bytes = read_file(HERE / "main-reference-build.json", 65536)
    recipe = json.loads(recipe_bytes)
    runtime_profile_bytes = read_file(HERE / "main-reference-current-runtime.json", 16384) if args.current_runtime else None
    runtime_profile = json.loads(runtime_profile_bytes) if runtime_profile_bytes is not None else None
    if args.current_runtime:
        recipe = {**recipe, "output": "Easyeda.CurrentMainReference.dll"}
    identity_file = args.identity_file or PLUGIN / ("server/src/current-main-reference-helper-identity.ts" if args.current_runtime
                                                  else "server/src/main-reference-helper-identity.ts")
    names = recipe["sources"]
    require(names and len(names) == len(set(names)) and all(re.fullmatch(r"[A-Za-z][A-Za-z0-9.]*\.cs", n) for n in names),
            "Incomplete fixed source list")
    originals = {name: read_file(args.source_directory / name, 262144) for name in names}
    sources = current_runtime_sources(originals, runtime_profile) if args.current_runtime else originals
    require({p.name for p in args.source_directory.glob("*.cs")} == set(names), "Unselected helper source")
    work = Path(tempfile.mkdtemp(prefix="easyeda-helper-build-"))
    print("Retaining build work at " + str(work), flush=True)
    sdk_archive = acquire(recipe["sdk"], args.sdk_archive, work / "sdk.tar.gz")
    package = acquire(recipe["referencePackage"], args.reference_package, work / "net48.nupkg")
    references = {}
    with zipfile.ZipFile(package) as archive:
        require(len(archive.namelist()) == len(set(archive.namelist())), "Duplicate NuGet member")
        for name, pin in recipe["references"].items():
            data = archive.read("build/.NETFramework/v4.8/" + name)
            require(len(data) == pin["bytes"] and digest(data) == pin["sha256"], "Framework reference pin mismatch")
            references[name] = data
    outputs = []
    for label, supplied in (("a", args.sdk_a), ("b", args.sdk_b)):
        root = work / label
        root.mkdir(mode=0o700)
        sdk = supplied.resolve() if supplied is not None else root / "sdk"
        sdk_tree(sdk_archive, sdk, supplied is not None)
        outputs.append(compile_once(root, sdk, sources, references, recipe))
    require(outputs[0] == outputs[1], "Independent helper builds differ")
    for name, original in originals.items():
        require(read_file(args.source_directory / name, 262144) == original, "Helper source changed during build")
    require(read_file(HERE / "main-reference-build.json", 65536) == recipe_bytes, "Build recipe changed")
    if args.current_runtime:
        require(read_file(HERE / "main-reference-current-runtime.json", 16384) == runtime_profile_bytes, "Current runtime profile changed")
    source_identity = [{"name": n, "sha256": digest(sources[n])} for n in sorted(sources)]
    sources_hash = digest(json.dumps(source_identity, separators=(",", ":"), ensure_ascii=True).encode())
    identity = ("// Generated by scripts/build-main-reference-helper.py from two equal builds.\n"
                "export interface MainReferenceHelperIdentity {\n"
                "  readonly profile: \"private.main-reference-helper.v1\";\n"
                "  readonly bytes: number;\n  readonly sha256: string;\n  readonly sourcesSha256: string;\n}\n"
                "export const MAIN_REFERENCE_HELPER_IDENTITY: Readonly<MainReferenceHelperIdentity> | null = {\n"
                "  profile: \"private.main-reference-helper.v1\",\n"
                "  bytes: " + format(len(outputs[0]), "_d") + ",\n"
                "  sha256: \"" + digest(outputs[0]) + "\",\n"
                "  sourcesSha256: \"" + sources_hash + "\",\n};\n").encode()
    if args.current_runtime:
        identity = ("// Generated by scripts/build-main-reference-helper.py --current-runtime from two equal builds.\n"
                    "import type { MainReferenceHelperIdentity } from \"./main-reference-helper-identity.ts\";\n\n"
                    "export const CURRENT_MAIN_REFERENCE_HELPER_IDENTITY: Readonly<MainReferenceHelperIdentity> = Object.freeze({\n"
                    "  profile: \"private.main-reference-helper.v1\",\n"
                    "  bytes: " + format(len(outputs[0]), "_d") + ",\n"
                    "  sha256: \"" + digest(outputs[0]) + "\",\n"
                    "  sourcesSha256: \"" + sources_hash + "\",\n});\n"
                    "export const CURRENT_MAIN_REFERENCE_RUNTIME_PINS: Readonly<Record<string, string>> = Object.freeze(" +
                    json.dumps(runtime_profile["runtimePins"], indent=2) + ");\n"
                    "export const CURRENT_MAIN_REFERENCE_VERSIONS = Object.freeze(" + json.dumps(runtime_profile["versions"], indent=2) + ");\n"
                    "export const CURRENT_MAIN_REFERENCE_RUNTIME_PROFILE_SHA256 = \"" + digest(runtime_profile_bytes) + "\";\n").encode()
    manifest = {"schema": "easyeda.main-reference-build.v1", "file": recipe["output"], "bytes": len(outputs[0]),
                "sha256": digest(outputs[0]), "recipeSha256": digest(recipe_bytes),
                "sdk": recipe["sdk"], "referencePackage": recipe["referencePackage"],
                "references": recipe["references"], "declaredCompileAssemblyReferenceNames": recipe["declaredCompileAssemblyReferenceNames"],
                "sources": [{"name": n, "bytes": len(b), "sha256": digest(b)} for n, b in sources.items()],
                "sourcesSha256": sources_hash, "independentBuildsEqual": True, "assemblyLoaded": False}
    if args.current_runtime:
        manifest = {**manifest, "schema": "easyeda.current-main-reference-build.v1", "runtimeProfile": runtime_profile,
                    "runtimeProfileSha256": digest(runtime_profile_bytes),
                    "historicalSourcesUnchanged": True, "transformedSources": list(runtime_profile["sourcePins"])}
    body = (json.dumps(manifest, indent=2) + "\n").encode()
    destination = args.output_directory.resolve()
    require(destination.is_dir(), "Output directory is missing")
    dll = destination / recipe["output"]
    record = destination / ("Easyeda.CurrentMainReference.build.json" if args.current_runtime else "Easyeda.MainReference.build.json")
    if args.check:
        require(read_file(dll, 1048576) == outputs[0] and read_file(record, 65536) == body, "Committed helper or build manifest differs")
        require(read_file(identity_file, 8192) == identity, "Compiled helper identity module differs")
    else:
        publish(dll, outputs[0])
        publish(record, body)
        publish(identity_file, identity)
    print(json.dumps({"file": recipe["output"], "bytes": len(outputs[0]), "sha256": digest(outputs[0]), "reproducible": True}))


if __name__ == "__main__":
    main()
