# Authority Layer

An independent interactive proposal by RN Collins exploring how a specific use could remain tied to the decision that governs it as technology, people, purpose, and operating conditions change.

**Live:** https://sovereign-stack-psi.vercel.app

## Status and relationship

RN previously corresponded with Purple Maiʻa about the earlier proposal. This prototype was not commissioned, adopted, endorsed, or validated by Purple Maiʻa. Nothing here is Purple Maiʻa policy, community consent, an approved protocol, or a finding about how Purple Maiʻa actually operates.

Every factual assertion about Purple Maiʻa is separated in the Assumption Ledger as **Public record**, **RN synthesis**, **Hypothesis**, **Proposed design**, or **Unresolved**. Public evidence supplies context, not permission or proof of an internal gap.

## What the prototype demonstrates

Version 1.3.0 presents the work as an executive proposal, an inspectable product specification, and an interactive fictional lifecycle demonstration. It clarifies that the interface documents rather than creates authority; makes deep links direct; simplifies the executive ask; standardizes terminology; and aligns governance, privacy, evidence, forms, and exports with the product’s actual capabilities.

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
