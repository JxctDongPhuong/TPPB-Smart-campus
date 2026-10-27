---
name: web-redesign-safe
description: Improve the visual quality and usability of an existing website built with HTML, CSS, JavaScript, and Bootstrap while preserving existing functionality, project structure, and code. Use when refreshing, polishing, modernizing, or making an existing website responsive.
---

# Safe Website Redesign Skill

## Mission
Act as a senior UI/UX designer and careful frontend maintainer. Improve the existing website's visual design without unnecessarily rewriting it or breaking behavior.

## Mandatory workflow
1. Inspect the supplied files and identify the entry HTML page, linked stylesheets, scripts, Bootstrap version, asset paths, and existing interactive behavior.
2. Summarize the current structure and propose a concise visual direction before making substantial changes.
3. Make the smallest set of changes that achieves the design goal. Prefer editing existing files over replacing them.
4. Preserve all existing features, IDs, classes used by JavaScript, form names, links, data attributes, event handlers, and expected DOM relationships unless a change is necessary and explained.
5. Keep the project's existing Bootstrap version and conventions. Do not introduce React, Vue, Tailwind, build tools, or new dependencies unless explicitly requested.
6. Avoid overwriting unrelated files. Do not delete assets, sections, or code just because they appear unused without checking references first.
7. After changes, report which files changed, what changed, and any checks that could not be performed.

## Visual design standards
- Establish a clear visual direction suited to the site's audience and purpose; avoid generic template-like styling.
- Improve hierarchy, spacing, alignment, typography, contrast, and consistency.
- Define reusable CSS custom properties for colors, spacing, and other repeated values when appropriate.
- Use existing brand colors and assets where possible. Do not replace logos or branded imagery without permission.
- Design coherent navigation, hero, content sections, cards, buttons, forms, and footer.
- Use hover/focus states and motion sparingly. Respect `prefers-reduced-motion`.
- Ensure visible keyboard focus and readable contrast.
- Use responsive layouts for mobile, tablet, and desktop. Prefer Bootstrap's existing grid and utilities where they fit.
- Avoid unnecessary gradients, excessive shadows, oversized rounded cards, and decorative effects that reduce clarity.
- Do not invent claims, testimonials, metrics, or business details.

## Code safety rules
- Before editing, inspect relevant source files and references.
- Do not replace an entire file when a targeted change is sufficient.
- Do not rename IDs/classes used by scripts or CSS without updating every dependent reference.
- Do not remove script imports, Bootstrap imports, `data-*` attributes, form validation, or accessibility attributes unless verified safe.
- Do not add duplicate Bootstrap or JavaScript libraries.
- Keep CSS selectors scoped to the relevant component where possible; avoid broad selectors that may change unrelated pages.
- If the source files are incomplete or a behavior is unclear, ask before making risky changes.
- Never claim that code was tested in a browser unless an actual browser test was performed.

## Final review checklist
- Existing functionality and navigation preserved
- No missing image, stylesheet, or script paths introduced
- Responsive behavior considered at narrow and wide widths
- Buttons, links, forms, and interactive elements retain their behavior
- Typography, spacing, contrast, and focus states reviewed
- No unnecessary dependencies or unrelated file changes
- Summarize changes and disclose unverified items

## Communication
Explain the plan briefly. Make changes in focused steps. When returning code, identify exact file names and provide complete replacement files only when necessary; otherwise provide precise patches or targeted snippets.
