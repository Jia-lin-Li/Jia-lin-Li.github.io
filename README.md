# Jialin Li's academic website

This folder is the source of https://jia-lin-li.github.io/. It uses Jekyll and GitHub Pages. It can be edited, previewed, and published without Codex.

## Open the folder

The working folder on this Mac is `/Users/Burninghorn/AcademicWebsite`. In Finder, press Command+Shift+G and paste that path. Drag the folder into Finder's sidebar to keep it handy. Open the folder in a plain-text/code editor; do not edit source files as rich text in Word.

## Where to edit

| Content | File |
| --- | --- |
| Introduction and research focus | `_pages/about.md` |
| Papers, author lists, statuses, notes, and paper/video links | `_data/research.yml` |
| Teaching experience | `_pages/teaching.md` |
| Name, title, department, university, email, site description, and Analytics ID | `_config.yml` |
| Author-order note and homepage structure | `_layouts/home.html` |
| Navigation labels | `_layouts/default.html` |
| Font sizes, colors, spacing, and responsive layout | `assets/css/editorial.css` |
| Profile portrait and social preview | `images/profile-spiral.webp` and `images/profile-spiral.jpg` |
| Profile journey movie and button | `assets/media/profile-journey.mp4` and `assets/js/profile-travel.js` |
| Browser icon | `images/selfphoto.png` |
| CV | `files/CV_JialinLi.pdf` |
| Privacy text | `_pages/terms.md` |

Biography and teaching are Markdown. Paper entries are YAML: preserve indentation with spaces. Each paper has `title`, `authors`, `url`, and optional `journal`, `details`, `status`, `video`, `note`, and `abstract`. Reorder the groups or entries to change their display order. Notes and abstracts support Markdown links. An `abstract` appears beneath its paper in a collapsible block, closed by default. Keep the existing filenames when replacing PDFs or the portrait.

The profile uses a 512-square still image. The “travel into the picture” button loads a silent, 384-square, 12-second H.264 movie only after a click, plays once, and returns to the still. Click again during playback to stop. There is no automatic animation, including for visitors with reduced motion enabled. Without JavaScript the still remains and the button is hidden. No editor, rendering library, or large source texture is sent to visitors. The original portrait remains the browser icon.

The chosen composition is saved locally in `images/hotel-spiral-settings.json`; its source PNG is `images/hotel-spiral.png`. The cleanup and reproducible rendering files are under `output/hotel-profile-final/`. These working files and the original camera photo are ignored by Git and excluded from publication; only the optimized profile assets are intended for commit and deployment. The browser icon and image manifest also remain in Git.

## Preview locally

Double-click `Preview.command` in Finder. Keep the Terminal window open and visit http://127.0.0.1:4173/. The terminal can be used independently of Codex. Press Control+C in that window to stop the server.

Alternatively, open Terminal in this folder and run:

```sh
bash scripts/preview.sh
```

The preview automatically rebuilds after edits to Markdown, YAML paper data, layouts, and CSS. Refresh the browser after saving. Restart the server after changes to `_config.yml` or `_config.dev.yml`. If the port is already in use, use the preview already running or stop that process before starting another one.

On this Mac, the Ruby dependencies are already installed in `vendor/bundle`. On a fresh setup with Ruby and Bundler available, install the locked dependencies with:

```sh
bash scripts/bundle.sh install
```

The launcher handles this Mac's existing Ruby/OpenSSL architecture arrangement without changing system Ruby. No command depends on a hidden Codex directory. The whole folder can be moved; scripts resolve its location automatically. An installation on a different computer may require Ruby setup and reinstalling its native dependencies.

## Validate and publish

Previewing never publishes changes. Production and preview build outputs are separate, and both are generated: do not edit `_site/` or `_site-preview/`.

Before publishing:

```sh
bash scripts/build-production.sh
python3 scripts/check_site.py _site
```

Publishing uses the existing `master` branch on GitHub. Review your changes, commit them, and push `master` using Git or your preferred Git client. A normal terminal workflow after reviewing `git diff` is:

```sh
git status
git diff
git add _pages/about.md _pages/teaching.md _data/research.yml
git commit -m "Update research and teaching"
git push origin master
```

Stage the specific files you actually edited. GitHub runs the website checks and its existing Pages build/deployment. The last successful deployed version stays online while the next build runs. Check the repository's Actions page after publishing. The local launcher and backup archive are excluded from publication.

## Search and Analytics

`_config.yml` is the public configuration, so ordinary GitHub Pages builds use the correct domain and indexing settings. `_config.dev.yml` disables tracking and indexing for local previews.

Production builds require `JEKYLL_ENV=production` (set by the build script and GitHub workflow). They include the existing Google Analytics measurement ID `G-7WWRGCV8XR`, existing Search Console verification tags, canonical URLs, Open Graph and Twitter metadata, and portrait icons. The homepage and Teaching page allow indexing; utility/redirect pages request no indexing. `sitemap.xml` includes the two academic pages and the CV PDF. The privacy page describes the active environment and never records its own visits.

Google Search updates happen after crawling. In the existing Search Console property, submit `https://jia-lin-li.github.io/sitemap.xml` and request indexing of the homepage and Teaching page with URL Inspection. Confirm actual Analytics visits in the existing property's Realtime report. Having tags configured does not by itself prove Google has indexed the new content or received Analytics events.

## Backup and rollback

The original site, including the last biography and teaching edits, is preserved at the Git tag `backup/pre-editorial-20260907`. A readable source archive is also stored locally at `backups/academic-website-before-editorial-20260907.tar.gz`. The archive and the entire backups folder are excluded from Git and publication.

Git retains the redesign as a separate commit. If a rollback is needed, revert that commit on `master`, validate, and push. Avoid deleting the repository or its history. Keep the backup until you are comfortable with the new site.

The earlier hidden editorial preview is a historical prototype. Edit this folder for future changes.
