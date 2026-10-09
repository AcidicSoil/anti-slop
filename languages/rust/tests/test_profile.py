"""Ensure the shipped Rust lint profile enforces its documented contracts."""

import shutil
import subprocess
import tempfile
import tomllib
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def check(source: str) -> subprocess.CompletedProcess[str]:
    with tempfile.TemporaryDirectory() as temp:
        crate = Path(temp)
        (crate / 'src').mkdir()
        (crate / 'src/lib.rs').write_text(source, encoding='utf-8')
        rustc_profile = ROOT / 'anti-slop-rust.toml'
        rust = tomllib.loads(rustc_profile.read_text()) if rustc_profile.exists() else {}
        clippy = tomllib.loads((ROOT / 'anti-slop-clippy.toml').read_text())
        lines = ['[package]', 'name = "anti_slop_profile_test"', 'version = "0.1.0"', 'edition = "2021"', '[lints.rust]']
        lines.extend(f'{k} = "{v}"' for k, v in rust.items())
        lines.append('[lints.clippy]')
        lines.extend(f'{k} = "{v}"' for k, v in clippy.items())
        (crate / 'Cargo.toml').write_text('\n'.join(lines) + '\n', encoding='utf-8')
        return subprocess.run(['cargo', 'clippy', '--offline', '--manifest-path', str(crate / 'Cargo.toml')], capture_output=True, text=True, check=False)


@unittest.skipUnless(shutil.which('cargo'), 'Cargo is unavailable')
class RustProfileTests(unittest.TestCase):
    def test_unsafe_op_inside_unsafe_function_requires_explicit_block(self):
        result = check('''
/// # Safety
/// The pointer must be valid.
pub unsafe fn read(pointer: *const i32) -> i32 { *pointer }
''')
        self.assertNotEqual(result.returncode, 0, result.stderr)
        self.assertIn('unsafe-op-in-unsafe-fn', result.stderr)

    def test_documented_unsafe_block_is_allowed(self):
        result = check('''
/// # Safety
/// The pointer must be valid.
pub unsafe fn read(pointer: *const i32) -> i32 {
    // SAFETY: The caller ensures pointer validity.
    unsafe { *pointer }
}
''')
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_allow_requires_reason(self):
        result = check('#[allow(dead_code)]\nfn helper() {}\n')
        self.assertNotEqual(result.returncode, 0, result.stderr)
        self.assertIn('allow_attributes_without_reason', result.stderr)

    def test_allow_with_reason_is_accepted(self):
        result = check('#[allow(dead_code, reason = "Fixture is intentionally unused")]\nfn helper() {}\n')
        self.assertEqual(result.returncode, 0, result.stderr)


if __name__ == '__main__':
    unittest.main()
