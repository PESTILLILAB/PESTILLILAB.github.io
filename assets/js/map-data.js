---
# Built by Jekyll: gathers the site's data files into one object for the Impact page.
---
window.MAP_DATA = {
  areas: [{% for a in site.research %}{ slug: {{ a.slug | jsonify }}, title: {{ a.title | jsonify }}, number: {{ a.number | jsonify }}, accent: {{ a.accent | default: 'blue' | jsonify }}, summary: {{ a.summary | jsonify }}, url: "{{ '/research/' | relative_url }}#{{ a.slug }}" }{% unless forloop.last %},{% endunless %}{% endfor %}],
  projects: [{% for p in site.projects %}{ slug: {{ p.slug | jsonify }}, title: {{ p.title | jsonify }}, role: {{ p.role | jsonify }}, website: {{ p.website | jsonify }}, areas: {{ p.areas | jsonify }}, url: "{{ '/projects/' | relative_url }}#{{ p.slug }}" }{% unless forloop.last %},{% endunless %}{% endfor %}],
  resources: [{% for g in site.data.resources %}{% for r in g.items %}{ name: {{ r.name | jsonify }}, description: {{ r.description | jsonify }}, url: {{ r.url | jsonify }}, repo: {{ r.repo | jsonify }}, tag: {{ r.tag | jsonify }}, group: {{ g.group | jsonify }}, area: {{ r.area | jsonify }}, project: {{ r.project | jsonify }}, pmids: {{ r.pmids | jsonify }} },{% endfor %}{% endfor %}],
  people: [{% assign T = site.data.team %}{ name: {{ T.pi.name | jsonify }}, role: "pi", position: {{ T.pi.position | jsonify }}, pubmed_name: {{ T.pi.pubmed_name | jsonify }}, github: {{ T.pi.github | jsonify }}, url: "{{ '/team/' | relative_url }}" },
    {% for p in T.team %}{ name: {{ p.name | jsonify }}, role: "team", position: {{ p.position | jsonify }}, pubmed_name: {{ p.pubmed_name | jsonify }}, github: {{ p.github | jsonify }}, url: "{{ '/team/' | relative_url }}" },{% endfor %}
    {% for p in T.alumni %}{ name: {{ p.name | jsonify }}, role: "alumni", position: {{ p.position | jsonify }}, pubmed_name: {{ p.pubmed_name | jsonify }}, github: {{ p.github | jsonify }}, url: "{{ '/team/' | relative_url }}#alumni" },{% endfor %}
  ],
  rules: {{ site.data.graph | jsonify }},
  stats: {{ site.data.stats | jsonify }},
  scholar: {{ site.data.scholar | jsonify }},
  excludePmids: {{ site.data.publications.exclude_pmids | jsonify }}
};
