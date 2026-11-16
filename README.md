# Domia Stays website

The website of Domia Stays Group S.L.: holiday homes in Benidorm, in English and Spanish.

It is a plain static site. No server, no database, no monthly platform. GitHub Pages serves the files in this folder as they are.

## The short version

| I want to… | Do this |
| --- | --- |
| Add, edit, hide or remove a home | Open `admin/index.html` in Chrome, make the change, **Save**, then publish |
| Change the phone, email, check-in times or web address | Same manager, **Settings** tab |
| Add a real guest review | Same manager, **Reviews** tab |
| Change other text (home page, owners page, FAQ) | Edit `build/copy.js`, then save anything in the manager to rebuild |
| Publish | GitHub Desktop: **Commit to main**, then **Push origin** |

## Managing homes (works offline)

1. Open the file `admin/index.html` from this folder in **Google Chrome** or **Edge** on a computer. Double-clicking it is enough.
2. Click **Open the website folder** and choose this folder (`domia-website`). Allow Chrome to edit it.
3. Add or edit a home: name, area, price, photos, description, what's inside, licence number.
4. Click **Save**. The manager resizes the photos and rewrites every page in both languages.
5. Publish (next section).

Nothing goes online until you publish, so you can experiment freely.

- **Hide** takes a home off the site but keeps its details and photos.
- **Delete** removes the home and its photos for good.
- The order of the list is the order on the site. The first six "show on the home page" homes appear on the home page.
- A home's web address is made from its name when you first save it and never changes after that, so links you have shared keep working.
- Leave the Spanish text empty and the Spanish pages show the English text.

## Publishing

One-time setup: install [GitHub Desktop](https://desktop.github.com), sign in, and clone `domiastays/domia-website` to your computer. That cloned folder is the website folder the manager opens.

Each time:

1. Save in the manager.
2. Open GitHub Desktop. The changed files are listed on the left.
3. Type a short note (for example "Add Casa Azul"), click **Commit to main**, then **Push origin**.
4. The site updates about a minute later.

To undo before publishing: in GitHub Desktop, right-click the changed files and choose **Discard changes**. After publishing, every earlier version is still in the History tab and can be restored.

## Pointing your domain at this site

The site's official address is set to `https://domiastays.es` (manager, Settings). Until the domain is connected, the site is served at `https://domiastays.github.io/domia-website/`.

To connect the domain:

1. On GitHub: repository **Settings → Pages → Custom domain**, enter `domiastays.es`, **Save**.
2. At the company where the domain is registered, in DNS settings:
   - four **A** records for `@` pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - one **CNAME** record for `www` pointing to `domiastays.github.io`
   - remove older A or CNAME records for `@` and `www` that point elsewhere
3. Wait for GitHub to show the domain as verified (minutes to a few hours), then tick **Enforce HTTPS**.

Source: [GitHub's guide to custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## What is in this folder

```
index.html, properties.html, …      the pages (generated, do not edit by hand)
properties_<home>.html              one page per home, plus .es.html for Spanish
content/properties.json             every home: text, price, photos, licence
content/site.json                   phone, email, web address, check-in times
content/reviews.json                guest reviews
admin/index.html                    the property manager
build/                              the page generator (lib, copy, templates, generate, cli)
css/site.css, js/site.js            design and behaviour
assets/properties/<home>/           photos of each home (large and -sm web sizes)
assets/img, assets/video            site photography and the hero video
assets/brand, assets/fonts          logo files and the two brand fonts
assets/originals/                   the original full-size media (not used by the site)
```

The pages are generated from `content/` by the code in `build/`. Editing a generated `.html` file by hand works until the next save, which overwrites it. Change the content or the templates instead.

## For developers

- Rebuild from a terminal: `node build/cli.mjs` (Node 18+, no dependencies).
- The generator is plain JavaScript that runs both in Node and in the browser. The manager loads the same four files with `<script>` tags.
- Tests: `build/tests/README.md`.
- English pages are `name.html`, Spanish pages are `name.es.html`. All links are relative, so the site works at a domain root, under `/domia-website/` and straight from the folder.
- Bump `ASSET_VERSION` in `build/templates.js` when `css/site.css` or `js/site.js` change.
