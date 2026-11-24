"""Validate the reusable Landmines setup contract."""

import json
import tomllib
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = "integrations/landmines/recommended.json"


class LandminesSetupTest(unittest.TestCase):
    def test_setup_activates_companion_without_overwriting_consumer_config(self):
        manifest = tomllib.loads((ROOT / "stackforge.setups.toml").read_text())
        setup = manifest["setups"]["landmines"]

        self.assertEqual(
            setup["package_json"]["devDependencies"],
            {"@interfere/landmines": "0.3.0", "oxlint": "1.90.0"},
        )
        self.assertEqual(
            setup["files"],
            {
                ".mise/tasks/lint/landmines.toml": "integrations/mise-tasks/landmines/lint.toml",
                "tools/oxlint/landmines-recommended.json": CONFIG_PATH,
                "oxlint.landmines.config.json": "integrations/landmines/oxlint.config.json",
            },
        )
        self.assertEqual(
            setup["activation"]["scripts"]["lint"], ["lint:landmines"]
        )
        self.assertEqual(
            setup["activation"]["verify"],
            [["node-package-manager", "run", "lint:landmines"]],
        )
        self.assertNotIn("@oxlint/plugins", setup["package_json"]["devDependencies"])

        selected = json.loads((ROOT / CONFIG_PATH).read_text())
        self.assertEqual(selected["jsPlugins"], [
            {"name": "landmines", "specifier": "@interfere/landmines"},
        ])
        for rule in ("no-test-doubles", "no-fixed-sleep", "no-flake-masking",
                     "no-unsignaled-poll", "strict-msw", "colocated-tests",
                     "package-exports", "test-file-names", "no-conditional-expect",
                     "no-silent-catch", "no-shared-signal"):
            self.assertEqual(selected["rules"][f"landmines/{rule}"], "error")
        self.assertNotIn("landmines/no-comments", selected["rules"])
        self.assertNotIn("landmines/no-explicit-return-types", selected["rules"])


if __name__ == "__main__":
    unittest.main()
