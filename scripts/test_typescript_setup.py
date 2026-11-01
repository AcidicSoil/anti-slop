"""Keep the reusable TypeScript setup independent of consumer Oxlint versions."""
import tomllib
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class TypeScriptSetupTest(unittest.TestCase):
    def test_typescript_setup_does_not_override_consumer_oxlint_versions(self):
        manifest = tomllib.loads((ROOT / "stackforge.setups.toml").read_text())
        setup = manifest["setups"]["typescript"]
        dependencies = setup.get("package_json", {}).get("devDependencies", {})
        self.assertNotIn("oxlint", dependencies)
        self.assertNotIn("@oxlint/plugins", dependencies)
        self.assertEqual(setup["package_json"]["scripts"]["lint:anti-slop"], "oxlint .")
        self.assertIn("oxlint.config.ts", setup["files"])


if __name__ == "__main__":
    unittest.main()
