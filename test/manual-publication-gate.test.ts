import { readFile, readdir } from "node:fs/promises";
import { describe, expect, it } from "vitest";

// Publication workflows were retired in 518ee75. Reactivation must deliberately
// revise this boundary as well as reinstate reviewed publication safeguards.
describe("retired production automation boundary", () => {
  it("enables only maintenance CI, with no producer or publisher workflows", async () => {
    const workflows = (await readdir(".github/workflows")).filter((name) => /\.ya?ml$/.test(name));
    expect(workflows.sort()).toEqual(["ci.yml"]);
  });

  it("keeps maintenance CI read-only and free of production access", async () => {
    const ci = await readFile(".github/workflows/ci.yml", "utf8");
    expect(ci).toContain("contents: read");
    expect(ci).not.toMatch(/:\s*write\b/);
    expect(ci).not.toMatch(/\bsecrets\s*[.[]/);
    expect(ci).not.toMatch(/(?:schedule|workflow_dispatch|workflow_run|environment):/);
    expect(ci).not.toMatch(/(?:wrangler\s+(?:deploy|d1|r2)|pnpm\s+(?:deploy|data:))/);
    expect(ci).toContain("pnpm typecheck");
    expect(ci).toContain("pnpm test:worker");
    expect(ci).toContain("pnpm build");
  });
});
