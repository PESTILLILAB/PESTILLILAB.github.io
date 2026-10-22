# pestillilab.github.io

**Making a change? Read [HOW-TO-EDIT.md](HOW-TO-EDIT.md) — step-by-step recipes for news, people, code & data, courses, and pages, all doable on github.com.**

Website of the Pestilli Lab, The University of Texas at Austin. Built with Jekyll, which
GitHub Pages runs automatically: push to the `main` branch and the site rebuilds in about a minute.
**All content is in Markdown and YAML files; the design lives in `_layouts/`, `_includes/` and
`assets/css/style.css`, which you should not need to touch.**

## Where to edit what

| To change… | Edit |
|---|---|
| **Post news** (paper, grant, talk, new member, event) | add a file to `_posts/` — copy `_templates/news-post.md` |
| **Add code, a dataset, an atlas** | `_data/resources.yml` |
| **Press coverage** | `_data/press.yml` |
| **Courses** | `_data/teaching.yml`; intro text in `teaching.md` |
| Home page text (headline, intro, numbers, "how we work") | `index.md` (front matter + body) |
| A research area | the file in `_research/` (one Markdown file per area) |
| A project / platform | the file in `_projects/` (one Markdown file per project) |
| Funding table, awards | `_data/funding.yml`, `_data/awards.yml` |
| Team roster, PI bio | `_data/team.yml` |
| Open positions | `join.md` |
| Publications that PubMed doesn't have, or hits to hide | `_data/publications.yml` |
| Navigation, footer address, links, PubMed query | `_config.yml` |

### Research areas (`_research/*.md`)

Each file has a YAML front matter block and a Markdown body:

```yaml
---
order: 2                 # position on the page and on the home-page cards
slug: vision             # anchor: /research/#vision
number: "02"
eyebrow: "Vision"
title: "Vision and the visual connectome"
accent: orange           # card color: blue, red, orange, yellow, teal
figure: vision           # an SVG in _includes/figures/ (optional)
summary: "One sentence for the home-page card."
chips: ["retinotopic wiring", "perceptual asymmetries"]
lede: "One or two sentences shown under the title."
---
The body, in Markdown. Paragraphs become the main text of the area.
```

Add a file to add an area; delete one to remove it. The home page cards follow automatically.

### Projects (`_projects/*.md`)

```yaml
---
order: 1
slug: brainlife
title: "brainlife.io"
role: "Founder & Director"
website: https://brainlife.io
icon: brainlife          # an SVG in _includes/icons/ (optional; initials shown otherwise)
meta: "One line of details: funder · years · partners. Markdown links allowed."
---
Body text in Markdown.
```

### Team (`_data/team.yml`)

```yaml
team:
  - name: Ada Lovelace
    position: Postdoctoral Researcher (Connectomics)
    image: /assets/img/people/ada-lovelace.jpg    # optional; initials are shown if omitted
    github: https://github.com/...                 # any of github, scholar, linkedin, twitter, cv
```

Put photos in `assets/img/people/` (square, about 600 px). Move an entry between the `team`,
`collaborators` and `alumni` lists to change where it appears; `description` is shown for alumni.
The PI block (`pi:`) has a Markdown `bio`.

### Publications

`/publications/` queries PubMed for the author query in `_config.yml` (`pubmed_query`) on every
visit, so new papers appear automatically. `assets/js/pubmed-snapshot.js` is a cached copy used
for the instant first render and as a fallback; it does not need to be kept current.
`_data/publications.yml` lists extra items (preprints elsewhere, in-press papers) and PMIDs to hide.

## Editing on GitHub (no software needed)

1. Open the repository on github.com and navigate to the file (for example `_data/team.yml`).
2. Click the pencil icon, make the change, and click **Commit changes**.
3. GitHub Pages rebuilds the site in about a minute. If a build fails (usually a YAML typo such as an
   unquoted colon), the error appears under the repository's **Actions** tab.

Common edits:

* **Post news** — in `_posts/`, click **Add file → Create new file**, name it `2026-11-03-short-title.md`
  (the date is the sort key), paste the contents of `_templates/news-post.md`, edit the title, type
  and text, commit. The three newest items appear on the home page; all of them on `/news/`.
  Set `link:` to send readers straight to a paper or article; leave it out to give the item its own page.
* **Add code or data** — append an item to the right group in `_data/resources.yml` (name, one-sentence
  description, url, optional repo and tag). Groups and items appear in file order.
* **Add a team member** — add an entry under `team:` in `_data/team.yml` and upload the photo to `assets/img/people/`.
* **Someone leaves** — cut their entry from `team:` and paste it under `alumni:`, adding a `description:` line.
* **Change a page's text** — edit the Markdown file for that page (`index.md`, `join.md`, …) or the
  area/project file in `_research/` or `_projects/`.
* **Add a research area or project** — copy an existing file in that folder and change its front matter and body.
* **Add a grant or award** — append to `_data/funding.yml` or `_data/awards.yml`.
* **Change the menu or footer** — `_config.yml`.

## Group photo

To show a group photo at the top of the Team page, upload it to `assets/img/` and un-comment the
`group_photo:` block at the top of `_data/team.yml`.

## Layout files (rarely touched)

`_layouts/default.html` is the page shell (head, header, footer, scripts). The other layouts
render one page type each from front matter and data files. Shared fragments are in `_includes/`:
`header.html`, `footer.html`, `page-head.html` (the title block every inner page uses),
`person.html` / `roster-entry.html` / `links.html` (team page), `news-item.html`, `icons/` and `figures/` (SVG art).
`_templates/` holds copy-and-edit starters; Jekyll ignores that folder.

## Previewing locally (optional)

Nothing needs to be installed to publish — GitHub Pages builds the site. To preview on your
computer, install Ruby and run:

```
bundle install
bundle exec jekyll serve
```

then open http://localhost:4000. Alternatively, push to a branch and check the GitHub Pages build
in the repository's **Actions** tab.

## Hero diagram

The exploded "research stack" on the home page is generated by `tools/build_hero.py`, which uses
the projection helper from https://github.com/cathrynlavery/diagram-design (clone it next to this
repo). Edit the `parts` list to change layer names or the focal layer and run the script; it rewrites
`assets/img/hero-stack.svg` and `_includes/hero-stack.svg`. The generated SVG is checked in, so the
script is only needed to change the diagram.

## Deploying

In the repository settings, under **Pages**, set the source to *Deploy from a branch*, branch
`main`, folder `/ (root)`. Jekyll is used by default; do not add a `.nojekyll` file.
