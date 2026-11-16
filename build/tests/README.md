# Tests

Two scripts check the site in a real browser. They need Node 18+, Google Chrome and Playwright
(`npm install playwright` anywhere, then point `PLAYWRIGHT_MODULE` at it if it is not in this folder).

1. Serve the website folder: `python3 -m http.server 8765` (run it inside the folder).
2. In another terminal:

```
SITE_URL=http://127.0.0.1:8765/ node build/tests/site.test.mjs
SITE_URL=http://127.0.0.1:8765/ node build/tests/admin.test.mjs
```

Optional settings: `CHROME_PATH` (path to Chrome if it is not installed in the usual place),
`PLAYWRIGHT_MODULE` (full path to Playwright's `index.mjs`), `SHOTS` (a folder for manager screenshots).

**site.test.mjs** reads every generated page and follows every link, image, script and font it points to.
Then it clicks through the site on a desktop and a phone screen: menus, language switch, the home finder,
filters and sorting, every home's photo viewer and enquiry form, the calculator against its formula, the FAQ,
the contact form, and the width of every page at five screen sizes. Its expectations come from
`content/properties.json`, so it keeps working as homes are added and removed.

**admin.test.mjs** runs the property manager from start to finish: add a home with photos, edit it, hide it,
reorder, delete, change a setting, add a review, and confirm that undoing everything leaves the files exactly
as they were. The browser's private file system stands in for the website folder, so nothing on disk changes.
Two things it cannot cover: Chrome's own "choose a folder" window, and reopening a remembered folder.
