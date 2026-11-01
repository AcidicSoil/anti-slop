"""Ensure the Stackforge shadcn package ships every runtime entrypoint."""
import json
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "integrations/shadcn-lint/package"


class ShadcnDistributionTest(unittest.TestCase):
    def test_compiled_package_is_versioned_for_remote_stackforge_consumers(self):
        package = json.loads((PACKAGE / "package.json").read_text())
        tracked = set(subprocess.check_output(
            ["git", "ls-files", "--", "integrations/shadcn-lint/package/dist"],
            cwd=ROOT, text=True,
        ).splitlines())
        compiled = {str(path.relative_to(ROOT)) for path in (PACKAGE / "dist").iterdir() if path.is_file()}
        self.assertGreaterEqual(len(compiled), 5)
        self.assertEqual(compiled - tracked, set(), "Git source sync loses ignored shadcn build files")
        for target in (package["exports"]["."]["default"], package["exports"]["."]["types"]):
            self.assertIn(str((PACKAGE / target).resolve().relative_to(ROOT)), tracked)


if __name__ == "__main__":
    unittest.main()
