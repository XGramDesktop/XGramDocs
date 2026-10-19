# XGram Documentation

Official documentation for **XGram Desktop**.

- Website: https://xgramdesktop.github.io/XGramDocs/
- Desktop source: https://github.com/XGramDesktop/XGramDesktop
- Releases: https://github.com/XGramDesktop/XGramDesktop/releases

This documentation is maintained independently for XGram and uses XGram branding.

## Pages

- [Home](https://xgramdesktop.github.io/XGramDocs/)
- [Desktop and settings](https://xgramdesktop.github.io/XGramDocs/desktop.html)
- [Features](https://xgramdesktop.github.io/XGramDocs/features.html)
- [Installation](https://xgramdesktop.github.io/XGramDocs/installation.html)
- [Privacy and local data](https://xgramdesktop.github.io/XGramDocs/privacy.html)

The site is plain HTML and CSS with no build step or external runtime dependencies.
Keep the same navigation on every page and use `aria-current="page"` for the current page.
`404.html` uses the absolute site base so its links work for missing nested paths.

Run `node scripts/check-site.mjs` to check local links, anchors, navigation and metadata.
Preview the site over HTTP and check narrow and wide viewports before publishing.
