"""Validate CodeHygiene's opt-in Stackforge distribution."""

import subprocess
import tomllib
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LAUNCHER = "integrations/codehygiene/run.sh"


class CodeHygieneSetupTest(unittest.TestCase):
    def test_setup_stages_launcher_without_enabling_project_checks(self):
        manifest = tomllib.loads((ROOT / "stackforge.setups.toml").read_text())
        setup = manifest["setups"]["codehygiene"]

        self.assertEqual(
            setup["files"],
            {
                "tools/anti-slop/codehygiene/run.sh": LAUNCHER,
                "tools/anti-slop/codehygiene/README.md": "integrations/codehygiene/README.md",
            },
        )
        self.assertNotIn("package_json", setup)
        self.assertNotIn("pyproject", setup)

    def test_launcher_is_valid_shell(self):
        subprocess.run(["bash", "-n", str(ROOT / LAUNCHER)], check=True)


if __name__ == "__main__":
    unittest.main()
