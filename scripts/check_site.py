#!/usr/bin/env python3
"""Check a built Jekyll site without making network requests.

Usage: python3 scripts/check_site.py [build_directory]
"""

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
from xml.etree import ElementTree


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.references = []
        self.meta = {}
        self.canonical = None
        self.title = ""
        self.in_title = False
        self.refresh = None
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.in_title = tag == "title" or self.in_title
        if tag == "meta":
            self.meta[attrs.get("name") or attrs.get("property")] = attrs.get("content", "")
            if attrs.get("http-equiv", "").lower() == "refresh":
                self.refresh = attrs.get("content", "")
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonical = attrs.get("href")
        for key in ("href", "src", "poster"):
            if attrs.get(key):
                self.references.append(attrs[key])
        if attrs.get("srcset"):
            self.references.extend(item.strip().split()[0] for item in attrs["srcset"].split(",") if item.strip())

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title += data


def check_site(root):
    errors = []
    pages = {path: Page(path.read_text(encoding="utf-8")) for path in root.rglob("*.html")}
    homepage = pages.get(root / "index.html")
    if not homepage or not homepage.canonical:
        return ["Homepage or its canonical URL is missing."], 0, 0

    origin = urlsplit(homepage.canonical)
    base_path = origin.path.rstrip("/")
    reference_count = 0

    def normalized_url(url):
        parts = urlsplit(url)
        return parts._replace(netloc=parts.netloc.lower())

    def check_reference(source, reference):
        nonlocal reference_count
        if reference.startswith(("#", "mailto:", "tel:", "data:", "javascript:")):
            return
        relative_source = source.relative_to(root).as_posix()
        source_url = urljoin(homepage.canonical.rstrip("/") + "/", relative_source)
        target = urlsplit(urljoin(source_url, reference))
        if target.hostname != origin.hostname or target.scheme not in ("http", "https"):
            return
        path = unquote(target.path)
        if base_path and not (path == base_path or path.startswith(base_path + "/")):
            return
        path = path[len(base_path):].lstrip("/")
        candidate = root / path
        options = [candidate, candidate / "index.html"]
        if not candidate.suffix:
            options.append(candidate.with_suffix(".html"))
        reference_count += 1
        if not any(option.is_file() for option in options):
            errors.append("{}: missing internal target {}".format(relative_source, reference))

    for path, page in pages.items():
        for reference in page.references:
            check_reference(path, reference)
        for key in ("og:image", "twitter:image"):
            if page.meta.get(key):
                check_reference(path, page.meta[key])

    for path in root.rglob("*.css"):
        for reference in re.findall(r"url\(\s*['\"]?([^)'\"]+)['\"]?\s*\)", path.read_text(encoding="utf-8")):
            check_reference(path, reference.strip())

    manifest = root / "images/manifest.json"
    if manifest.is_file():
        for icon in json.loads(manifest.read_text(encoding="utf-8")).get("icons", []):
            check_reference(manifest, icon["src"])

    sitemap = root / "sitemap.xml"
    sitemap_urls = []
    if sitemap.is_file():
        for entry in ElementTree.parse(str(sitemap)).iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc"):
            check_reference(sitemap, entry.text)
            sitemap_urls.append(entry.text)
    else:
        errors.append("sitemap.xml is missing.")

    for key in ("description", "og:title", "og:description", "og:image", "twitter:card", "twitter:title", "twitter:description", "twitter:image"):
        if not homepage.meta.get(key):
            errors.append("Homepage metadata is missing {}.".format(key))
    for key in ("og:title", "twitter:title"):
        if homepage.meta.get(key) != homepage.title:
            errors.append("Homepage {} does not match the browser title.".format(key))

    if homepage.title != "Jialin Li - Uncertainty Quantification":
        errors.append("The requested homepage title has changed.")

    # Explicit publication list: new files must not quietly become public pages.
    academic_pages = {"index.html", "teaching/index.html"}
    utility_pages = {"404.html", "terms/index.html"}
    redirects = {
        "about/index.html": "/",
        "about.html": "/",
        "cv/index.html": "/files/CV_JialinLi.pdf",
        "resume.html": "/files/CV_JialinLi.pdf",
    }
    expected_files = academic_pages | utility_pages | set(redirects) | {
        "assets/css/main.css", "assets/js/main.js", "images/selfphoto.png",
        "images/manifest.json", "files/CV_JialinLi.pdf",
        "files/S315_Fall24_Syllabus_JL.pdf", "sitemap.xml", "robots.txt",
    }
    actual_files = {path.relative_to(root).as_posix() for path in root.rglob("*") if path.is_file()}
    for name in sorted(expected_files - actual_files):
        errors.append("Required published file is missing: {}".format(name))
    for name in sorted(actual_files - expected_files):
        errors.append("Unexpected published file: {}".format(name))

    for name in academic_pages | utility_pages | set(redirects):
        page = pages.get(root / name)
        if not page:
            continue
        noindex = "noindex" in {token.strip() for token in page.meta.get("robots", "").lower().split(",")}
        if name in academic_pages and noindex:
            errors.append("Academic page must remain indexable: {}".format(name))
        elif name not in academic_pages and not noindex:
            errors.append("Utility page or redirect needs noindex: {}".format(name))
        if name in redirects:
            destination = urljoin(homepage.canonical, redirects[name].lstrip("/"))
            if not page.canonical or normalized_url(page.canonical) != normalized_url(destination):
                errors.append("Incorrect redirect destination: {}".format(name))
            refresh = re.fullmatch(r"\s*0\s*;\s*url=(.+)", page.refresh or "", re.I)
            if not refresh or normalized_url(refresh.group(1).strip()) != normalized_url(destination):
                errors.append("Missing immediate redirect: {}".format(name))

    expected_sitemap = {
        urljoin(homepage.canonical, path) for path in
        ("", "teaching/", "files/CV_JialinLi.pdf", "files/S315_Fall24_Syllabus_JL.pdf")
    }
    if {normalized_url(url) for url in sitemap_urls} != {normalized_url(url) for url in expected_sitemap}:
        errors.append("Sitemap must list only the two academic pages and both PDFs.")
    robots = root / "robots.txt"
    if robots.is_file() and re.search(r"(?im)^\s*Disallow:\s*/", robots.read_text(encoding="utf-8")):
        errors.append("Do not block crawling: search engines must be able to read utility-page noindex tags.")
    return errors, len(pages), reference_count


if __name__ == "__main__":
    build_directory = Path(sys.argv[1] if len(sys.argv) > 1 else "_site").resolve()
    failures, page_count, reference_count = check_site(build_directory)
    if failures:
        print("Site checks failed:")
        for failure in sorted(set(failures)):
            print("- " + failure)
        sys.exit(1)
    print("Checked {} HTML pages and {} internal references; metadata, redirects, indexing, and publication checks passed.".format(page_count, reference_count))
