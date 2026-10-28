---
layout: map
title: Impact
eyebrow: Impact
headline: What we have built, and where it has gone
description: Output and impact of the Pestilli Lab, and a navigable graph connecting its research areas, projects, software, people, and papers.
permalink: /impact/
scripts:
  - /assets/js/pubmed-snapshot.js
  - /assets/js/map-data.js
  - /assets/js/map.js
owned_title: Lab-owned
owned_text: Our own output. The papers we have published, how often they have been cited, and the code we have released in the lab's GitHub organizations and in my own account.
derived_title: Lab-derived
derived_text: What the people who trained with us have done since, under their own names. Citations to all of their work, and the stars, forks, and followers of their personal GitHub accounts. Nothing is counted in both tiers.
strips:
  - chart: papers
    title: Papers, year by year
    text: How many papers we published each year, counting articles and indexed preprints with a lab author.
    source: PubMed
  - chart: citations
    title: Citations, year by year
    text: How often our work is cited each year. Yellow is citations to the lab's own papers, as Google Scholar counts them; blue is citations to everything our current and former trainees have published, under their own names, as OpenAlex counts them.
    source: Google Scholar, OpenAlex
  - chart: github
    title: Where our code lives, and how much it is used
    text: Public repositories in the lab's GitHub organizations and in my account, the stars other people have given them, and how many times they have been forked into someone else's account.
    source: GitHub
  - chart: toprepos
    title: Most-starred repositories
    text: The code of ours that other people have found most useful.
    source: GitHub
graph_title: One graph
graph_text: Our research areas, projects, software and data, people, and papers, connected by what links them in our own files. We place papers in areas by their titles and link them to people by authorship. Click a node to see its neighbors; double-click to open it.
---
I keep two sets of numbers for the lab: what we have produced ourselves, and what the people who trained with us have gone on to do. Both update every week from public sources, named next to each figure. Between them and the charts is everything we have made, drawn as one graph.
