export const state = (v: Record<string, unknown>) => ({
  inspect: "Inspect target and evidence",
  skipped: "Skip or cancel",
  preview: "Preview selected changes",
  review: "Review safe or conflicting changes",
  ready: "Approved target and changes",
  verify: "Run actual checks",
  retry: "Checks failed",
  "pending-repair": "Pending repair",
  done: "Verified completion",
}[String(v.phase)] ?? String(v.phase));
