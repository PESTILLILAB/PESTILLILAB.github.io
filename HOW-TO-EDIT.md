# How to edit this website

## House rules for the text (for people and for AI assistants)

* Write "we", not "I".
* Plain, direct prose in the voice of our papers: full sentences that state a finding and what follows from it.
  No slogans, no one-line fragments for effect, no marketing phrasing.
* Do not cite specific papers anywhere except the Publications page (which is generated from PubMed).
* Do not name specific tools, platforms, or projects on a page unless that page is about them
  (Projects, Code & Data, News). Elsewhere, describe the topic, the question, or the concept.
* When in doubt, borrow wording from the lab's own research statement or papers rather than inventing new phrasing.

Everything on pestillilab.github.io is a text file in this repository. Edit a file, commit it,
and GitHub rebuilds the site in about a minute. No software to install; everything below can be
done in a web browser at github.com/PESTILLILAB/PESTILLILAB.github.io.

## The two moves you will use every time

**Edit a file.** Open the file on GitHub, click the pencil icon (top right of the file view),
make the change, click **Commit changes…**, then **Commit changes** again. Done.

**Add a file.** Open the folder, click **Add file → Create new file**, type the file name, paste
the contents, click **Commit changes…**.

After a commit, the **Actions** tab shows a run called "Deploy site". Green check:
the site is live (hard-refresh the browser if it still looks old). Red X: open the run; the error
names the file and line. It is almost always a YAML line with a stray colon — wrap that value in
quotes and commit again.

## Where things live

| I want to… | File |
|---|---|
| Post news (paper, grant, talk, person, event) | new file in `_posts/` |
| Add or change a team member | `_data/team.yml` |
| Add code, a dataset, an atlas, a benchmark | `_data/resources.yml` |
| Add a course | `_data/teaching.yml` |
| Add press coverage | `_data/press.yml` |
| Add a grant or award | `_data/funding.yml`, `_data/awards.yml` |
| Change the home page text or numbers | `index.md` |
| Change a research area | the file in `_research/` |
| Change a project | the file in `_projects/` |
| Change open positions | `join.md` |
| Change the menu, footer address, or links | `_config.yml` |
| Add a photo | upload to `assets/img/people/` (people) or `assets/img/` (other) |
| Put someone's citations/GitHub on the Impact page | `openalex:` and `github:` lines in `_data/team.yml` |

## Recipes

### Post a news item

1. Open `_posts/`, click **Add file → Create new file**.
2. Name it with the date first: `2026-11-03-new-paper-in-nature.md`. The date orders the list; the
   rest becomes the web address.
3. Paste this and edit it:

   ```
   ---
   title: "New paper on white matter and reading in Nature"
   type: paper
   link: https://doi.org/10.xxxx/xxxxx
   ---
   One or two sentences about it. [Links](https://example.org) and **bold** work.
   ```

   `type` is one word shown as a tag: `paper`, `grant`, `people`, `talk`, `event`, `award`, `press`.
   `link` is optional. With it, the title goes straight to the paper or article; without it, the item
   gets its own page on the site.
4. Commit. The three newest items show on the home page; all items on the News page.

A starter file to copy is in `_templates/news-post.md`.

### Add a team member

1. Upload the photo to `assets/img/people/` (**Add file → Upload files**). Square, about 600 pixels,
   named like `firstname-lastname.jpg`.
2. Open `_data/team.yml`, find the `team:` list, add a block (indentation matters: two spaces):

   ```
     - name: Ada Lovelace
       position: Postdoctoral Researcher (Connectomics)
       image: /assets/img/people/ada-lovelace.jpg
       github: https://github.com/adal
       scholar: https://scholar.google.com/citations?user=XXXX
   ```

   Only `name` and `position` are required. Other link keys: `linkedin`, `twitter`, `cv`.
   Leave `image` out to show initials.

### Someone leaves

In `_data/team.yml`, cut their block from `team:` and paste it at the top of `alumni:`. Add a line
`description: After leaving the lab, Ada started a PhD at …`

### Add a collaborator

Same file, under `collaborators:`. Collaborators show as a list without photos, so `image` is not needed.

### Add code or data

Open `_data/resources.yml` and add an item under the right group (Platforms and tools; Datasets,
atlases and benchmarks; Standards and governance):

```
    - name: My new tool
      description: One sentence saying what it is and what it is for.
      url: https://example.org
      repo: https://github.com/pestillilab/my-new-tool
      tag: tool
```

`repo` and `tag` are optional. Tags used so far: platform, tool, code, dataset, atlas, benchmark, standard.
To add a new group, copy a `- group:` block.

### Add a course

In `_data/teaching.yml`, add a line under the institution:

```
    - { title: Neural Data Science, level: Undergraduate, when: "Fall, 2027–" }
```

Add `url:` inside the braces to link the course page.

### Add press coverage

In `_data/press.yml`, add at the top (newest first):

```
- date: 2027
  title: Headline as printed
  outlet: Publication name
  url: https://…
```

### Add a grant or an award

`_data/funding.yml`: title, source, years, role (PI, Co-PI, Co-I). `_data/awards.yml`: year, text.
Newest first in both.

### Change a research area

Open the area's file in `_research/` (for example `03-learning.md`). The top part between the `---`
lines holds the title, the one-sentence summary used on the home page card, the chips, and the
one-line lede. Below the second `---` is the body text in Markdown. To add an area, copy an
existing file, give it the next number, and set `order:`, `slug:`, `number:`, and `accent:` (blue, red,
orange, yellow, or teal).

### Change a project

Same idea in `_projects/`. `role`, `website`, and `meta` are the lines under the title; the body is Markdown.

### Change the home page

`index.md`. The headline, intro, button labels, the three numbers, the caption of the scales ruler, and the
"how we work" cards are at the top; the two paragraphs about the research programs are the body.

The scales ruler under the numbers is `_includes/figures/scales-ruler.svg`; its labels are plain `<text>`
elements you can edit. The original kit (full SVGs with the viewer rows, and the script that draws it
from data) is kept in `tools/scales-ruler/` with its own README.

### Add photos to the Geneva page or the lab gallery

Upload image files to `assets/img/geneva/` (Geneva program page) or `assets/img/lab/` (bottom of the
Team page). That is all: every image in the folder is shown, sorted by file name, so name them with
the date first (`2027-05-lake.jpg`) to keep the order. The first image is shown large. To caption
one, add a line to `_data/captions.yml`: `2027-05-lake.jpg: Boat trip on Lake Geneva`.
Keep photos under about 400 KB (export at 1600 px wide).

The Geneva page's text, dates and deadline are in `geneva.md`.

### Show a group photo

Upload the photo to `assets/img/`, then at the top of `_data/team.yml` remove the `#` from the three
`group_photo` lines and set the file name and caption.

### The Impact page (numbers and graph)

The numbers come from `_data/stats.json`, which the site's workflow refreshes every Monday from GitHub,
OpenAlex, and PubMed (`tools/stats/fetch_stats.py`); you never edit that file. The Google Scholar figures (citations, h-index) are the one manual part: copy them
into `_data/scholar.yml` now and then, with the month in `as_of`. To include someone's
citations and repositories, give them an `openalex:` ID and a `github:` link in `_data/team.yml`
(find the ID by searching the name at api.openalex.org/authors?search=First+Last; it looks like
A5070135653). People listed under `team:` and `alumni:` count as lab-derived impact.

The graph builds itself from the files you already edit. Papers are placed in research areas by
keywords on their titles (`_data/graph.yml`; add a PubMed ID under `overrides:` to pin one) and
linked to people by author name (add `pubmed_name: Surname I` to a person if the automatic match
fails). Software and datasets join the graph when their entry in `_data/resources.yml` has an `area:`
line, optionally a `project:` and a list of `pmids:`. Projects link to areas through `areas:` in their file.

### Hide a PubMed hit that is not ours

In `_data/publications.yml`, add the PMID (the number in the PubMed URL) under `exclude_pmids:`.
Papers PubMed does not have yet (preprints elsewhere, in-press) go under `extra:` in the same file.

## Starter files

`_templates/` has copy-and-edit starters: `news-post.md`, `research-area.md`, `project.md`,
`team-member.yml`, `resource.yml`. Jekyll ignores that folder, so nothing there appears on the site.

## Rules of thumb

* In YAML, a value with a colon, a `#`, or a leading quote must be wrapped in double quotes:
  `title: "Science: the sequel"`.
* Keep indentation exactly as the neighbouring lines (spaces, not tabs).
* File names: lower case, hyphens, no spaces.
* Photos: keep under about 300 KB; the site resizes nothing.
* When in doubt, copy an existing entry and change the words.
* Course materials live in a separate organization, github.com/psychdatascience; link new courses from `_data/teaching.yml` with `url:`.

## If something looks wrong after a commit

1. Wait two minutes and hard-refresh (Cmd-Shift-R).
2. Check **Actions**. Red run → open it → find the line that says which file failed.
3. Look at the last commit on GitHub (**Commits**) and compare it with the entry above it; the
   mistake is usually a missing space or quote.
4. Nothing is lost: every version of every file is in the history, and **Revert** on a commit undoes it.

Design changes (layout, colors, fonts) live in `_layouts/`, `_includes/`, and `assets/css/style.css`.
See `README.md` for how those fit together.
