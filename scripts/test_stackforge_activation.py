"""Check all Stackforge setup activation declarations and distributable assets."""

import tomllib
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "stackforge.setups.toml"

NODE_SETUPS = {"typescript", "shadcn", "stylex", "css", "css-tailwind", "landmines"}
NATIVE_SETUPS = {"python", "rust", "go"}


class StackforgeActivationTest(unittest.TestCase):
    def setUp(self):
        self.setups = tomllib.loads(MANIFEST.read_text())["setups"]

    def test_every_setup_has_verification_and_existing_assets(self):
        self.assertEqual(len(self.setups), 10)
        for name, setup in self.setups.items():
            with self.subTest(name=name):
                self.assertTrue(setup["activation"]["verify"])
                self.assertTrue(setup["files"])
                for source in setup["files"].values():
                    self.assertTrue((ROOT / source).exists(), (name, source))

    def test_node_checks_are_declared_and_connected_to_lint(self):
        for name in NODE_SETUPS:
            with self.subTest(name=name):
                setup = self.setups[name]
                (check,) = setup["activation"]["scripts"]["lint"]
                self.assertIn(check, setup["package_json"]["scripts"])
                self.assertEqual(
                    setup["activation"]["verify"],
                    [["node-package-manager", "run", check]],
                )

    def test_every_setup_registers_an_executable_mise_task(self):
        for name, setup in self.setups.items():
            with self.subTest(setup=name):
                advisory = name == "codehygiene"
                task_name = f"review:{name}" if advisory else f"lint:{name}"
                directory = "review" if advisory else "lint"
                task_file = f".mise/tasks/{directory}/{name}.toml"
                self.assertIn(task_file, setup["files"])
                file = ROOT / setup["files"][task_file]
                task = tomllib.loads(file.read_text())
                self.assertEqual(
                    set(task),
                    {task_name},
                    f"{name} must expose its named Mise task",
                )
                invocation = task[task_name]["run"]
                if name in NODE_SETUPS:
                    (child,) = setup["activation"]["scripts"]["lint"]
                    self.assertEqual(invocation, f"npm run {child}")
                elif advisory:
                    self.assertEqual(
                        invocation,
                        "bash tools/anti-slop/codehygiene/run.sh",
                    )
                else:
                    self.assertEqual(invocation, " ".join(setup["activation"]["verify"][0][:2]))

    def test_typescript_setup_enforces_suppression_preflight(self):
        setup = self.setups["typescript"]
        command = setup["package_json"]["scripts"]["lint:anti-slop"]
        self.assertEqual(
            command.split(" && ", 1)[0],
            "node tools/oxlint/anti-slop/check-suppressions.mjs",
        )
        self.assertIn("oxc-parser", setup["package_json"]["devDependencies"])
        self.assertTrue((ROOT / "src/check-suppressions.mjs").exists())

    def test_codehygiene_keeps_advisory_semantics(self):
        setup = self.setups["codehygiene"]
        self.assertNotIn("package_json", setup)
        self.assertNotIn("scripts", setup["activation"])
        self.assertEqual(setup["activation"]["verify"][0][-1], "--help")


if __name__ == "__main__":
    unittest.main()
