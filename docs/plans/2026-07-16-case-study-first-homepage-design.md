# Case-study first homepage design

## Goal

Make the portfolio feel curated rather than templated. A visitor should understand the product-engineering focus, inspect three working cases, and reach the complete archive without seeing the same project three times.

## Structure

1. A typography-led hero states the product thesis and proof of output.
2. The three strongest projects with healthy demos appear as full-width editorial case previews.
3. The complete project set becomes a compact, sortable archive with automatic scroll loading.
4. A dark closing section points to the public GitHub profile.

## Constraints

- Keep the existing bilingual content, category filters, time sorting, static detail routes, and twelve-item loading batches.
- Use existing project screenshots and the warm neutral palette.
- Add no dependencies or decorative animation system.
- Do not expose private contact information in this preview.

## Verification

- Confirm exactly three featured cases and that each has a working Demo link.
- Confirm archive sorting, filtering, and automatic loading still work.
- Check 320px, 768px, 1024px, and 1440px layouts, keyboard focus, console output, TypeScript, lint, and production build.
