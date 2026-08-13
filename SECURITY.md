# Security Policy

## Supported Versions

This is a template repository, not a published package. It has no releases, no
tags, and no version branches, so there is nothing to backport a fix to.

Only `main` is supported. Fixes land there and nowhere else.

If you generated a project from this template, your copy is a fork in practice.
It does not receive updates from here, and keeping it current is up to you.

## Scope

In scope, because these ship as defaults to everyone who clones the template:

- The security headers in `apps/web/src/proxy.ts` (CSP, HSTS, and the rest)
- `apps/web/Dockerfile` and `docker-compose.yml`
- The GitHub Actions workflows in `.github/workflows/`, especially script
  injection through untrusted event inputs
- Any committed secret, or a default that causes one to leak

Out of scope:

- Advisories against transitive dependencies. `pnpm audit --audit-level=high`
  already gates every CI run and Dependabot opens the update PRs. If you spot a
  stale lockfile entry, open a normal issue or PR rather than a security report.
- Vulnerabilities in Next.js, Turborepo, shadcn/ui, or Biome themselves. Those
  belong upstream with their own maintainers.
- Findings in a project you generated from this template, unless the flaw is in
  code the template gave you.

## Reporting a Vulnerability

Report privately through GitHub:

**https://github.com/ProductOfAmerica/turbo-starter/security/advisories/new**

That opens a thread visible only to maintainers. Please do not open a public
issue for a vulnerability.

Include enough to reproduce it: the affected file, the steps, and what an
attacker gains.

This project is maintained by one person, so treat these as targets rather than
guarantees. Expect an acknowledgement within a week. Accepted reports are fixed
on `main` and credited in the published advisory, unless you would rather stay
anonymous. Declined reports get a reason, not silence.
