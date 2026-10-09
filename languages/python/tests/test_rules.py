"""Behavior tests for the public Pylint anti-slop diagnostics."""
import json
import os
import subprocess
import sys
import tempfile
import textwrap
import unittest
from pathlib import Path

from pylint.lint import Run

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


def diagnostics(source: str, *rules: str) -> list[str]:
    with tempfile.TemporaryDirectory() as temp:
        path = Path(temp) / "sample.py"
        path.write_text(textwrap.dedent(source), encoding="utf-8")
        environment = os.environ.copy()
        python_dir = str(Path(__file__).resolve().parents[1])
        environment["PYTHONPATH"] = os.pathsep.join(
            filter(None, [python_dir, environment.get("PYTHONPATH")])
        )
        process = subprocess.run([
            sys.executable, "-m", "pylint",
            "--load-plugins=anti_slop",
            "--disable=all",
            "--enable=" + ",".join(rules),
            "--output-format=json",
            "--persistent=n",
            str(path),
        ], capture_output=True, text=True, env=environment, check=False)
        if process.returncode & 32 or not process.stdout.strip().startswith("["):
            raise AssertionError(
                f"Pylint could not run: {process.returncode}, "
                f"stdout={process.stdout!r}, stderr={process.stderr!r}"
            )
        return [message["symbol"] for message in json.loads(process.stdout)]


class AntiSlopRuleTests(unittest.TestCase):
    def test_any_alias_detects_direct_and_chained_aliases(self):
        result = diagnostics("""
            from typing import Any, TypeAlias
            Payload: TypeAlias = Any
            Alias = Payload
        """, "no-any-type-alias")
        self.assertEqual(result.count("no-any-type-alias"), 2)

    def test_pep695_any_alias_is_detected(self):
        result = diagnostics("""
            from typing import Any
            type Payload = Any
        """, "no-any-type-alias")
        self.assertEqual(result, ["no-any-type-alias"])

    def test_any_alias_ignores_typed_or_unknown_imported_aliases(self):
        result = diagnostics("""
            from external_package import External
            A = str | bytes
            B = External
        """, "no-any-type-alias")
        self.assertEqual(result, [])

    def test_imported_any_names_resolve(self):
        result = diagnostics("""
            import typing as t
            from typing import Any as Broad
            One = t.Any
            Two = Broad
        """, "no-any-type-alias")
        self.assertEqual(result.count("no-any-type-alias"), 2)

    def test_unrelated_any_symbol_does_not_trigger(self):
        result = diagnostics("""
            class Any: pass
            Alias = Any
        """, "no-any-type-alias")
        self.assertEqual(result, [])

    def test_dictionary_type_resolves_local_alias(self):
        result = diagnostics("""
            from typing import Any
            Value = Any
            def consume(data: dict[str, Value]) -> None:
                pass
        """, "no-unsafe-dictionary-type")
        self.assertEqual(result, ["no-unsafe-dictionary-type"])

    def test_known_type_widened_then_cast_reports(self):
        result = diagnostics("""
            from typing import Any, cast
            class User: pass
            def load() -> User:
                user = User()
                broad: Any = user
                # SAFETY: The original value is statically known.
                return cast(User, broad)
        """, "no-widen-then-cast")
        self.assertEqual(result, ["no-widen-then-cast"])

    def test_genuine_boundary_cast_does_not_report(self):
        result = diagnostics("""
            from typing import cast
            class User: pass
            def decode(value: object) -> User:
                # SAFETY: Checked by the caller at the trust boundary.
                return cast(User, value)
        """, "no-widen-then-cast")
        self.assertEqual(result, [])

    def test_widened_value_reassigned_before_cast_does_not_report(self):
        result = diagnostics("""
            from typing import Any, cast
            class User: pass
            def decode(other: Any) -> User:
                broad: Any = User()
                broad = other
                # SAFETY: Checked at the boundary.
                return cast(User, broad)
        """, "no-widen-then-cast")
        self.assertEqual(result, [])

    def test_widened_value_that_escapes_does_not_report(self):
        result = diagnostics("""
            from typing import Any, cast
            class User: pass
            def decode() -> User:
                broad: Any = User()
                print(broad)
                # SAFETY: Checked at the boundary.
                return cast(User, broad)
        """, "no-widen-then-cast")
        self.assertEqual(result, [])


if __name__ == "__main__":
    unittest.main()
