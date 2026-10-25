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


    def test_conditional_empty_dict_unpack_reports_both_branches(self):
        result = diagnostics("""
            def make(flag: bool, value: int):
                first = {**({"count": value} if flag else {})}
                second = {**({} if flag else {"count": value})}
                return first, second
        """, "no-conditional-empty-dict-unpack")
        self.assertEqual(result, ["no-conditional-empty-dict-unpack"] * 2)

    def test_conditional_dict_unpack_allows_nonempty_and_ordinary_unpacks(self):
        result = diagnostics("""
            def make(flag: bool, defaults: dict[str, int]):
                first = {**defaults, "mode": 1}
                second = {**({"x": 1} if flag else {"y": 2})}
                third = {"x": None if flag else 2}
                fourth = {}
                if flag:
                    fourth["x"] = 1
                return first, second, third, fourth
        """, "no-conditional-empty-dict-unpack")
        self.assertEqual(result, [])


    def test_known_local_widening_reports_constructors_aliases_and_functions(self):
        result = diagnostics("""
            from typing import Any
            Broad = Any
            class User: pass
            def handle() -> None: pass
            def make():
                first: Any = User()
                second: Broad = User()
                third: Any = handle
                concrete: User = User()
                fourth: Any = concrete
                return first, second, third, fourth
        """, "no-known-value-widening")
        self.assertEqual(result, ["no-known-value-widening"] * 4)

    def test_known_local_widening_skips_unproven_values_and_object(self):
        result = diagnostics("""
            from typing import Any
            from external_package import External, Unknown
            ExternalAlias = External
            class User: pass
            global_value: Any = User()
            def make(source: Any):
                safe: object = User()
                unknown: Any = Unknown()
                imported: Any = External
                parameter: Any = source
                uninitialized: Any
                unknown_call: Any = factory()
                typed: External = source
                erased: Any = typed
                alias_typed: ExternalAlias = source
                erased_alias: Any = alias_typed
                return safe, unknown, imported, parameter, uninitialized, unknown_call, erased, erased_alias
        """, "no-known-value-widening")
        self.assertEqual(result, [])


    def test_any_signature_policies_cover_nested_alias_and_variadic_forms(self):
        result = diagnostics("""
            from typing import Any, TypeAlias
            Alias: TypeAlias = Any
            def direct(value: Any) -> Any:
                return value
            def nested(values: list[Any]) -> list[Any]:
                return values
            def alias(value: Alias) -> Alias:
                return value
            def dictionary(values: dict[str, Any]) -> dict[str, Any]:
                return values
            def variadic(*args: Any, **kwargs: Any) -> None:
                pass
        """, "no-any-parameter", "no-any-return", "no-unsafe-dictionary-type")
        self.assertEqual(result.count("no-any-parameter"), 5)
        self.assertEqual(result.count("no-any-return"), 3)
        self.assertEqual(result.count("no-unsafe-dictionary-type"), 2)


if __name__ == "__main__":
    unittest.main()
