#!/usr/bin/env python3
"""Package a checked static build and public guides using only Python's stdlib."""
from pathlib import Path
import hashlib
import json
import zipfile

root = Path(__file__).resolve().parent.parent
version = json.loads((root / "package.json").read_text())["version"]
build = root / "dist"
output = root / "output" / "releases"
output.mkdir(parents=True, exist_ok=True)
files = [root / name for name in (
    "index.html", "styles.css", "sw.js", "manifest.webmanifest", "LICENSE",
    "README.md", "README.tr.md", "CHANGELOG.md",
)]
for directory in ("src", "assets", "docs"):
    files.extend(path for path in (root / directory).rglob("*") if path.is_file())

names = {path.relative_to(root).as_posix() for path in files}
assert {path.relative_to(build).as_posix() for path in build.rglob("*") if path.is_file()} == names
for path in files:
    compiled = build / path.relative_to(root)
    if path.is_symlink() or compiled.is_symlink():
        raise RuntimeError(f"Unexpected symlink: {path}")
    assert compiled.read_bytes() == path.read_bytes(), f"Stale build: {path}"

name = f"claim-lantern-v{version}.zip"
target = output / name
with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as archive:
    for path in sorted(files):
        archive.write(build / path.relative_to(root), path.relative_to(root).as_posix())
with zipfile.ZipFile(target) as archive:
    assert archive.testzip() is None
    assert set(archive.namelist()) == names
    for path in files:
        assert archive.read(path.relative_to(root).as_posix()) == path.read_bytes()
digest = hashlib.sha256(target.read_bytes()).hexdigest()
(output / "SHA256SUMS.txt").write_text(f"{digest}  {name}\n")
print(f"Packaged {name}: {target.stat().st_size} bytes; static files and guides match source.")
