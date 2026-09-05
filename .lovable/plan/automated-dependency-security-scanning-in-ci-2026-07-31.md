# Automated dependency + security scanning in CI

Goal: get alerted when any package (including transitive ones) picks up a new critical vulnerability, and block deployment when critical findings exist.

## What gets added

1. **Dependabot config** (`.github/dependabot.yml`)
   - Weekly scan of npm dependencies plus GitHub Actions versions.
   - Security updates are raised as pull requests automatically, including for transitive packages.
   - Grouped minor/patch updates so you get one PR instead of dozens.

2. **Security audit workflow** (`.github/workflows/security-audit.yml`)
   - Runs on every pull request and push to the default branch, plus a daily schedule at 06:00 UTC.
   - Steps: install dependencies from the lockfile, run `npm audit --audit-level=critical`, run lint and a production build.
   - Any critical advisory makes the job fail, so the branch cannot be merged or deployed.
   - The daily run is what catches a package that was clean yesterday and vulnerable today, even when nobody pushes code.

3. **CodeQL workflow** (`.github/workflows/codeql.yml`)
   - Static analysis of the app code for injection, auth and secret-handling issues, on pull requests and weekly.

4. **Audit script in `package.json`**
   - `npm run audit:critical` so the same check can be run locally before pushing.

## Notifications

- GitHub Dependabot alerts and workflow failures email the repository owner by default; no extra service needed.
- Optionally the audit workflow can also post failures to the Slack webhook already used for feedback alerts. Say the word and I will wire that in the same workflow.

## Prerequisites (needs your action in GitHub)

- The project must be connected to GitHub for the workflows to run. Once connected, enable in **Settings > Code security**: Dependency graph, Dependabot alerts, and Dependabot security updates.
- To hard-block merges, add a branch protection rule on the default branch and mark the audit job a required status check.

## Notes

- The scanner reads the text lockfile. The repo has both `bun.lock` and `package-lock.json`; CI will use `package-lock.json` with `npm ci` for reproducibility.
- Existing `overrides` in `package.json` (for example `seroval`) stay untouched; the audit respects them.
- No application code or UI changes are involved.
