#!/usr/bin/env python3
"""Collect the lab's output and impact numbers and write them to _data/stats.json.

Run weekly by .github/workflows/pages.yml (job "stats"); can also be run by hand:
    python3 tools/stats/fetch_stats.py

Sources (all public, no keys needed; GITHUB_TOKEN raises the GitHub rate limit when set):
  GitHub   repositories, stars, forks, followers of the lab organizations and of each
           person in _data/team.yml who has a github: link.
  OpenAlex citations and works for every person in _data/team.yml who has an openalex: id.
  PubMed   papers per year for the query in _config.yml (pubmed_query).
  Scholar  optional, best effort: if _data/scholar.yml has "auto: true", the PI's public Scholar
           profile page is read and its Citations / h-index / i10-index table parsed. Google has no
           API and often refuses automated requests; when that happens the hand-copied numbers in
           scholar.yml stay in use. Nothing else on the page depends on it.

Two tiers:
  owned    the lab itself: PubMed papers, the PI's OpenAlex profile, repositories in the
           organizations listed in ORGS plus the PI's own account.
  derived  current and former trainees under their own names: their OpenAlex profiles
           and their personal GitHub accounts (people listed under team: and alumni:).
Nothing is counted twice: a repository belongs to the account that owns it.

If a source is unreachable the previous numbers for that source are kept, so the page
never goes blank. Errors are printed and the exit code stays 0.
"""
import json, os, sys, time, datetime, re, urllib.request, urllib.parse, urllib.error

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
OUT = os.path.join(ROOT, "_data", "stats.json")
ORGS = ["pestillilab", "brainlife", "psychdatascience"]   # lab-owned organizations
PI_GITHUB = "francopestilli"
UA = "pestillilab-site-stats (pestilli@utexas.edu)"
GH_TOKEN = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
SKIP = set(os.environ.get("STATS_SKIP", "").split(","))   # e.g. STATS_SKIP=openalex,pubmed to run only the GitHub part


def get(url, headers=None, tries=3):
    h = {"User-Agent": UA, "Accept": "application/json"}
    if headers: h.update(headers)
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=40) as r:
                return json.loads(r.read().decode())
        except urllib.error.HTTPError as e:
            if e.code in (403, 429) and i < tries - 1:
                time.sleep(20 * (i + 1)); continue
            raise
        except Exception:
            if i < tries - 1: time.sleep(5); continue
            raise


def gh(path):
    h = {"Authorization": f"Bearer {GH_TOKEN}"} if GH_TOKEN else {}
    return get("https://api.github.com" + path, h)


def gh_repos(kind, login):
    """All public, non-fork repositories of an org or user, with their numbers."""
    repos, page = [], 1
    while True:
        batch = gh(f"/{kind}/{login}/repos?per_page=100&type=public&page={page}")
        for r in batch:
            if r.get("fork"): continue
            repos.append({"name": r["name"], "stars": r["stargazers_count"], "forks": r["forks_count"],
                          "issues": r["open_issues_count"], "language": r.get("language"),
                          "pushed": (r.get("pushed_at") or "")[:10], "archived": r.get("archived", False)})
        if len(batch) < 100: break
        page += 1
    return repos


def summarize(repos):
    return {"repos": len(repos), "stars": sum(r["stars"] for r in repos), "forks": sum(r["forks"] for r in repos),
            "active": sum(1 for r in repos if r["pushed"] >= (datetime.date.today() - datetime.timedelta(days=365)).isoformat())}


def load_yaml(path):
    import yaml
    with open(path, encoding="utf-8") as f: return yaml.safe_load(f)


def main():
    team = load_yaml(os.path.join(ROOT, "_data", "team.yml"))
    cfg = load_yaml(os.path.join(ROOT, "_config.yml"))
    prev = json.load(open(OUT)) if os.path.exists(OUT) else {}
    out = {"updated": datetime.date.today().isoformat(), "owned": prev.get("owned", {}), "derived": prev.get("derived", {}),
           "sources": {"github": "GitHub API", "citations": "OpenAlex", "papers": "PubMed"}}
    people = [dict(p, tier="derived") for p in (team.get("team") or []) + (team.get("alumni") or [])]

    # ---------- GitHub ----------
    try:
        if "github" in SKIP: raise RuntimeError("skipped")
        owned = {"accounts": []}
        for org in ORGS:
            info = gh(f"/orgs/{org}"); repos = gh_repos("orgs", org)
            owned["accounts"].append({"login": org, "kind": "org", "followers": info.get("followers", 0), **summarize(repos),
                                      "top": sorted(repos, key=lambda r: -r["stars"])[:5]})
        info = gh(f"/users/{PI_GITHUB}"); repos = gh_repos("users", PI_GITHUB)
        owned["accounts"].append({"login": PI_GITHUB, "kind": "user", "followers": info.get("followers", 0), **summarize(repos),
                                  "top": sorted(repos, key=lambda r: -r["stars"])[:5]})
        for k in ("repos", "stars", "forks", "followers", "active"):
            owned[k] = sum(a.get(k, 0) for a in owned["accounts"])
        out["owned"]["github"] = owned

        derived = {"accounts": []}
        for p in people:
            login = (p.get("github") or "").rstrip("/").split("/")[-1]
            if not login: continue
            try:
                info = gh(f"/users/{login}"); repos = gh_repos("users", login)
                derived["accounts"].append({"login": login, "name": p["name"], "followers": info.get("followers", 0), **summarize(repos)})
            except Exception as e:
                print("github user", login, e, file=sys.stderr)
        for k in ("repos", "stars", "forks", "followers", "active"):
            derived[k] = sum(a.get(k, 0) for a in derived["accounts"])
        derived["people"] = len(derived["accounts"])
        out["derived"]["github"] = derived
    except Exception as e:
        print("github:", e, file=sys.stderr)

    # ---------- OpenAlex ----------
    def author(aid):
        a = get(f"https://api.openalex.org/authors/{aid}?mailto=pestilli@utexas.edu")
        return {"id": aid, "name": a.get("display_name"), "works": a.get("works_count", 0), "cited": a.get("cited_by_count", 0),
                "by_year": {str(y["year"]): y["cited_by_count"] for y in a.get("counts_by_year", [])}}
    try:
        if "openalex" in SKIP: raise RuntimeError("skipped")
        pi = author(team["pi"]["openalex"])
        out["owned"]["citations"] = {"total": pi["cited"], "works": pi["works"], "by_year": pi["by_year"], "h_index": None}
        try:
            a = get(f"https://api.openalex.org/authors/{team['pi']['openalex']}?mailto=pestilli@utexas.edu")
            out["owned"]["citations"]["h_index"] = (a.get("summary_stats") or {}).get("h_index")
        except Exception: pass
        rows, by_year = [], {}
        for p in people:
            if not p.get("openalex"): continue
            try:
                a = author(p["openalex"]); a["name"] = p["name"]; rows.append(a)
                for y, c in a["by_year"].items(): by_year[y] = by_year.get(y, 0) + c
            except Exception as e:
                print("openalex", p["name"], e, file=sys.stderr)
            time.sleep(0.2)
        out["derived"]["citations"] = {"total": sum(r["cited"] for r in rows), "works": sum(r["works"] for r in rows),
                                       "people": len(rows), "by_year": by_year,
                                       "top": sorted(({"name": r["name"], "cited": r["cited"], "works": r["works"]} for r in rows), key=lambda r: -r["cited"])[:10]}
    except Exception as e:
        print("openalex:", e, file=sys.stderr)

    # ---------- PubMed ----------
    try:
        if "pubmed" in SKIP: raise RuntimeError("skipped")
        q = urllib.parse.quote(cfg.get("pubmed_query", "Pestilli F[Author]"))
        base = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
        ids = get(f"{base}esearch.fcgi?db=pubmed&term={q}&retmax=1000&retmode=json")["esearchresult"]["idlist"]
        excl = set(str(x) for x in (load_yaml(os.path.join(ROOT, "_data", "publications.yml")) or {}).get("exclude_pmids", []))
        ids = [i for i in ids if i not in excl]
        by_year = {}
        for i in range(0, len(ids), 200):
            s = get(f"{base}esummary.fcgi?db=pubmed&id={','.join(ids[i:i+200])}&retmode=json")["result"]
            for pid in ids[i:i+200]:
                m = re.match(r"(\d{4})", s.get(pid, {}).get("pubdate", ""))
                if m: by_year[m.group(1)] = by_year.get(m.group(1), 0) + 1
            time.sleep(0.4)
        out["owned"]["papers"] = {"total": len(ids), "by_year": by_year}
    except Exception as e:
        print("pubmed:", e, file=sys.stderr)
        snap = os.path.join(ROOT, "assets", "js", "pubmed-snapshot.js")
        if os.path.exists(snap) and "papers" not in out["owned"]:
            items = json.loads(re.search(r"=\s*(\{.*\});?\s*$", open(snap, encoding="utf-8").read(), re.S).group(1))["items"]
            by_year = {}
            for it in items:
                m = re.match(r"(\d{4})", it.get("pubdate", ""))
                if m: by_year[m.group(1)] = by_year.get(m.group(1), 0) + 1
            out["owned"]["papers"] = {"total": len(items), "by_year": by_year, "note": "from snapshot"}

    # ---------- Google Scholar (optional) ----------
    try:
        sch_path = os.path.join(ROOT, "_data", "scholar.yml")
        sch = load_yaml(sch_path) if os.path.exists(sch_path) else {}
        if not (sch or {}).get("auto"): raise RuntimeError("skipped (set auto: true in _data/scholar.yml to try)")
        import html as _html
        url = sch.get("url", "").replace("citations?", "citations?hl=en&")
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36", "Accept-Language": "en-US,en;q=0.9"})
        with urllib.request.urlopen(req, timeout=40) as r: page = r.read().decode("utf-8", "ignore")
        nums = [int(n) for n in re.findall(r'class="gsc_rsb_std">(\d+)<', page)]
        if len(nums) < 6: raise RuntimeError("profile table not found (blocked?)")
        out["owned"]["scholar"] = {"citations": nums[0], "h_index": nums[2], "i10_index": nums[4], "as_of": datetime.date.today().isoformat()[:7], "url": sch.get("url")}
        print("scholar:", nums[0], "citations")
    except Exception as e:
        print("scholar:", e, file=sys.stderr)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(out, open(OUT, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    print("wrote", OUT)


if __name__ == "__main__":
    main()
