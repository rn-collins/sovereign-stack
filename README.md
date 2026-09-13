# Authority Layer

An independent working proposal by RN Collins for pressure-testing whether a specific use can remain bound to the authority decision that governs it as technology, people, purpose, and operating conditions change.

**Live:** https://sovereign-stack-psi.vercel.app

## Status and relationship

RN previously corresponded with Purple Maiʻa about the earlier proposal. This prototype was not commissioned, adopted, endorsed, or validated by Purple Maiʻa. Nothing here is Purple Maiʻa policy, community consent, an approved protocol, or a finding about how Purple Maiʻa actually operates.

Every factual assertion about Purple Maiʻa is separated in the Assumption Ledger as **Public record**, **RN synthesis**, **Hypothesis**, **Proposed design**, or **Unresolved**. Public evidence supplies context, not permission or proof of an internal gap.

## What the prototype demonstrates

Version 1.2.1 presents the work precisely as an executive proposal, an inspectable product-requirements model, and a high-fidelity interaction simulation. It adds bookmarkable proposal, demonstration, system, engagement, evidence, and tool routes; a 60–90 second executive path; a direct copy-and-reply response path; evidence access dates; tighter affirmative copy; a Content Security Policy; and automated route, accessibility, evidence-link, and Decision Gate checks.

The site illustrates a connected authority system; it does not yet implement one. The current Decision Gate, Authority Record, lifecycle simulation, production-readiness workspace, co-design agenda, pilot charter, learning translation, and Assumption Ledger remain browser-local tools rather than a shared, identity-verified authority graph.

It is a non-production demonstration: it has no account, application database, form-submission endpoint, or configured analytics. Text entered into its editable workspaces is schema-checked and stored only in the visitor's browser; the hosting provider still processes ordinary request metadata. Pause, refusal, withdrawal, and non-digitization remain valid outcomes throughout.

## Local development

```bash
npm install
npm run dev
```

Before release:

```bash
npm run check
```

The repository is configured for automatic Vercel builds through `vercel.json`; GitHub Actions runs the same static checks, Chromium smoke tests, and production build on pushes to `main` and pull requests.

## License

Apache-2.0. See `LICENSE`.
