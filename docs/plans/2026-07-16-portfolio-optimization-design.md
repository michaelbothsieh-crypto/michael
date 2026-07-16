# Portfolio optimization design

## Goal

Make the portfolio faster to scan, lighter to load, and easier to share without changing its visual identity. The strongest section must contain only projects with a working demo URL, and the full project list must support time sorting.

## Chosen approach

- Rank the strongest eight projects by the existing `sortWeight`, but require a non-empty `homepageUrl`.
- Keep all projects available while rendering twelve at a time, then reveal the next batch with a native intersection observer as the visitor scrolls. Category and time sorting remain client-side because the dataset is small and already local.
- Offer three time orders: recently updated (default), newest created, and oldest created.
- Replace GSAP scroll choreography with one small CSS reveal animation and remove both GSAP packages.
- Move rich project details from the homepage modal to statically generated `/projects/[slug]` pages. Cards become normal links, which reduces homepage client data and makes cases shareable and indexable.
- Hide known-broken demo URLs through project overrides, and make README generation respect the same effective homepage URL.

## Cleanup plan

1. Lock selection and sorting behavior with a small Node assertion test.
2. Add a minimal summary type for homepage serialization.
3. Remove modal state, project-view payloads, GSAP hooks, and unused click callbacks.
4. Add the static detail route and sitemap entries.
5. Remove GSAP dependencies only after no imports remain.

## Alternatives rejected

- Virtualizing 37 cards: unnecessary complexity for a list this small; progressive disclosure is enough.
- Adding a global state library: local state covers filters, sort order, and visible count.
- Keeping modal details plus adding routes: duplicates two detail surfaces and preserves the large homepage payload.
- Generating new strongest-case scores: existing curated `sortWeight` already represents editorial strength.

## Verification

- Assert strongest projects all have demo URLs and sorting is deterministic.
- Verify category + time sort + automatic scroll loading in Playwright.
- Verify every project route builds, has metadata, and appears in the sitemap.
- Keyboard-check cards and detail navigation at 320px, 768px, 1024px, and 1440px.
- Compare production LCP/CLS and initial JavaScript transfer against the existing baseline.
- Run lint, TypeScript, build, and console/network checks.
