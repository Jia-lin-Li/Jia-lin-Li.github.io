# Jialin Li's academic website

Source for [jia-lin-li.github.io](https://jia-lin-li.github.io/), built with
Jekyll and hosted on GitHub Pages. The site uses the AcademicPages / Minimal
Mistakes theme.

## Where to edit

| Content | File |
| --- | --- |
| Biography, publications, and working papers | `_pages/about.md` |
| Teaching experience | `_pages/teaching.md` |
| CV and resume redirects | `_pages/cv.md`, `_pages/resume.md` |
| Privacy notice | `_pages/terms.md` |
| Downloadable CV | `files/CV_JialinLi.pdf` |
| Teaching syllabus | `files/S315_Fall24_Syllabus_JL.pdf` |
| Navigation links | `_data/navigation.yml` |
| Name, contact details, portrait, and metadata | `_config.yml` |
| Portrait, browser icon, and social preview image | `images/selfphoto.png` |
| Search and sharing metadata markup | `_includes/seo.html` |
| Browser icons and extra head markup | `_includes/head.html` |

The homepage's `seo_title` and `og_description` are configured in its scoped
`defaults` entry in `_config.yml`. These control browser/search and sharing
metadata independently of the visible “About me” heading. The site title remains
“Jialin Li” in the navigation. Page content and research links live in Markdown;
there is no separate publications database or generator.

## Local preview

With Ruby and Bundler installed, use the project launcher:

```sh
bash scripts/bundle.sh install
bash scripts/bundle.sh exec jekyll serve --config _config.yml,_config.dev.yml
```

Open <http://localhost:4000>. The development configuration uses local URLs,
disables analytics, and expands CSS. Restart Jekyll after configuration changes.
Keep `Gemfile.lock` so dependency versions are reproducible.

The launcher uses the locked gems in ignored `vendor/bundle/`. On this Mac it
runs the existing universal system Ruby in Intel mode to match the existing
Homebrew OpenSSL library, and supplies the Command Line Tools C++ header path
when compiling native gems. Other Ruby installations use their selected runtime.
It runs Bundler normally, including dependency checks; it does not install a new
Ruby, modify system gems, or use `JEKYLL_NO_BUNDLER_REQUIRE`.

After a macOS or toolchain update, reinstall native extensions if needed:

```sh
bash scripts/bundle.sh pristine
```

## Build and check

```sh
bash scripts/bundle.sh exec jekyll build --safe
python3 scripts/check_site.py _site
```

`check_site.py` uses only the Python 3 standard library. It checks generated HTML,
CSS assets, manifest icons, homepage metadata, redirect targets, and indexing
rules. It accepts only the intended public files and XML sitemap entries, so
retired template pages cannot accidentally return. It checks local file destinations;
external websites and fragment anchors are outside its scope.

The “Check website” GitHub Actions workflow runs the official GitHub Pages Jekyll
build action and these checks on pushes and pull requests. It validates the site;
it does not deploy it or change the repository's Pages publishing settings.

## Videos and mathematics

Overview videos use the same outlined button style as paper links and sit next
to the corresponding paper in `_pages/about.md`. Preserve the existing video URLs
when updating titles or citation details.

MathJax loads only on pages whose YAML front matter contains `math: true`:

```yaml
---
title: "A page with equations"
math: true
---
```

The current pages contain no equations, so they make no MathJax requests. The
optional loader uses the pinned MathJax 2.7.9 release, which supports Jekyll's
Kramdown math markup, inline `$...$` / `\(...\)`, and display equations. See the
[MathJax documentation](https://docs.mathjax.org/en/v2.7-latest/start.html).

## Public pages and indexing

The public academic pages are `/` and `/teaching/`, plus the CV and syllabus PDFs.
`/about/` and `/about.html` redirect to the homepage; `/cv/` and `/resume` redirect
directly to the CV PDF. GitHub Pages implements these as HTML redirects, not HTTP
301 responses.

`/404.html` provides the missing-page fallback, and `/terms/` contains the short
privacy notice. Both have `noindex` metadata and are excluded from the XML sitemap.
The old HTML sitemap, empty blog feed, and template examples are no longer built.
Crawlers must still be allowed to visit utility URLs to read their `noindex` tags.

New pages default to `noindex` and are excluded from the XML sitemap. When adding
an academic page, explicitly set `noindex: false` and `sitemap: true`, and update
the intended-file and sitemap lists in `scripts/check_site.py`. Search results
update after crawlers revisit the deployed site; a local build does not update
Google's index.

## Repository conventions

- `_site/` and `vendor/bundle/` are local generated files, ignored by Git.
- `_layouts/` and `_includes/` contain only the current page shell, metadata,
  contact profile, navigation, privacy link, analytics, and optional MathJax.
- `assets/js/main.js` contains the Contact and responsive-navigation behavior.
  It is used directly: no jQuery, npm dependencies, or JavaScript build step.
- `_includes/icon.html` contains the three inline SVG icons. There are no icon
  font downloads. Attribution is retained in `THIRD_PARTY_NOTICES.md`.
- `_sass/` keeps the active responsive theme styles and their Susy/Breakpoint
  dependencies. These dependencies should not be deleted without replacing the
  layout rules that call them.
- The site supplies its own theme files. `theme: null` prevents GitHub Pages
  from injecting the unrelated Primer stylesheet.
- Production analytics is configured in `_config.yml`; the development config
  disables it. The 404 and privacy pages also disable analytics.
- Removed template material remains in Git history. The original theme license
  is retained in `LICENSE`.
