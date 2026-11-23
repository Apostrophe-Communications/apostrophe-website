#!/usr/bin/env python3
"""
Search-engine and AI-crawler copy of the site's text.

The site builds most of its text in the browser from Website/data.js. Google renders
that late and AI crawlers (ChatGPT, Perplexity, Claude) mostly never run it, so they
see near-empty pages. This script writes the same markup the page scripts produce
straight into the HTML files, between <!--pre--> and <!--/pre--> markers. When the page
loads, the scripts replace each container's content with identical markup, so
visitors see exactly what they saw before.

It also writes the structured data (JSON-LD) in each page's <head> and Website/llms.txt.

Run it after every change to Website/data.js:

    python3 scripts/prerender.py

It is safe to run repeatedly: it only rewrites what sits between its own markers.
"""
import json
import math
import re
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent / "Website"
BASE = "https://apostrophecommunications.com/"

src = (SITE / "data.js").read_text(encoding="utf-8")
D = json.loads(src[src.index("window.APOS =") + len("window.APOS ="):].strip().rstrip(";"))
C = D["contact"]


# ---------------------------------------------------------------- helpers (mirror main.js)
def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            .replace('"', "&quot;").replace("'", "&#39;"))


def num(x):
    """Number as JavaScript prints it in a template string."""
    x = round(x, 10)
    return str(int(x)) if x == int(x) else repr(x)


def logo(b):
    if not b.get("logo"):
        return f'<span class="lg lg--txt">{esc(b["name"])}</span>'
    ar = b["w"] / b["h"]
    w = min(math.sqrt(ar) * 1.0, 3.4)
    h = w / ar
    return (f'<span class="lg" role="img" aria-label="{esc(b["name"])}" '
            f"style=\"--lw:{w:.3f};--lh:{h:.3f};--src:url('{esc(b['logo'])}')\"></span>")


def marquee(items):
    def fit(p):
        ar = p["sw"] / p["sh"]
        mx = 0.98
        weight = min(1.35, max(0.72, math.sqrt(0.3 / (p.get("sd") or 0.3))))
        area = (0.26 if p.get("badge") else 0.17) * weight * (p.get("boost") or 1)
        w = math.sqrt(area * ar)
        h = w / ar
        if w > mx:
            w = mx
            h = w / ar
        if h > 0.46:
            h = 0.46
            w = h * ar
        return f"--fw:{w:.3f};--fh:{h:.3f}"

    def tile(p):
        inner = (f'<img src="{esc(p["sticker"])}" alt="" style="{fit(p)}" loading="lazy" decoding="async">'
                 if p.get("sticker") else f'<span class="mq__txt">{esc(p["title"])}</span>')
        cls = "mq__item" + ("" if p.get("slug") else " mq__item--brand")
        if p.get("slug"):
            return (f'<a class="{cls}" href="project.html?p={p["slug"]}" aria-label="{esc(p["title"])}" '
                    f'title="{esc(p["title"])}">{inner}</a>')
        return f'<div class="{cls}" role="img" aria-label="{esc(p["title"])}" title="{esc(p["title"])}">{inner}</div>'

    out = []
    for c in D["categories"]:
        lst = [p for p in items if p.get("category") == c["id"]]
        if lst:
            out.append(f'\n        <div class="mq__group">\n          <h3 class="mq__label" data-reveal>{esc(c["name"])}</h3>\n'
                       f'          <div class="mq__logos">{"".join(tile(p) for p in lst)}</div>\n        </div>')
    return "".join(out)


NAV = [("Home", "./"), ("Projects", "projects.html"), ("About", "about.html"),
       ("Careers", "careers.html"), ("Contact", "contact.html")]
ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 13 13 3M5 3h8v8"/></svg>'


EXPERTISE = "".join(f'<li><a class="link-u" href="{h}">{t}</a></li>' for t, h in [
    ("Luxury PR", "luxury-pr-agency-india.html"), ("Luxury Retail PR", "luxury-retail-pr-agency-india.html"),
    ("Fashion PR", "fashion-pr-agency-india.html"), ("Hospitality PR", "hospitality-pr-agency-delhi.html"),
    ("Alcobev PR", "alcobev-pr-agency-india.html")])


def footer():
    nav = "".join(f'<li><a class="link-u" href="{h}">{t}</a></li>' for t, h in NAV) 
    careers = esc((D.get("careers") or {}).get("form") or "careers.html")
    return f"""
      <section class="s t-stone foot-cta" data-theme="dark">
        <div class="wrap">
          <small data-reveal>Have a Project in Mind?</small>
          <h2 data-split>Let’s Work Together</h2>
          <a class="btn" href="contact.html" data-reveal>Get in Touch <span class="arr">{ARROW}</span></a>
        </div>
      </section>
      <footer class="s t-dark foot-bar" data-theme="dark">
        <div class="wrap">
          <div class="foot-bar__top">
            <div><img class="foot-bar__logo" src="logo-full-white-v6.png?v=20260930150635" alt="Apostrophe Communications" width="150" height="102" loading="lazy"></div>
            <div><h3>Explore</h3><ul>{nav}</ul><h3 style="margin-top:28px">Expertise</h3><ul>{EXPERTISE}</ul></div>
            <div><h3>Sign Up</h3><ul><li><a class="link-u" href="contact.html">Brand Enquiries</a></li><li><a class="link-u" href="contact.html#creators">Creator Sign-Up</a></li><li><a class="link-u" href="{careers}" target="_blank" rel="noopener">Job Applications</a></li></ul></div>
            <div class="foot-bar__hello"><h3>Say Hello</h3><ul><li><a class="link-u mail" href="mailto:{C["email"]}">{esc(C["email"]).replace("@", "@<wbr>")}</a></li><li><a class="link-u" href="{esc(C["maps"])}" target="_blank" rel="noopener">{esc(C["address"])}</a></li></ul></div>
            <div><h3>Follow</h3><ul><li><a class="link-u" href="{C["instagram"]}">Instagram</a></li><li><a class="link-u" href="{C["linkedin"]}">LinkedIn</a></li></ul></div>
          </div>
          <div class="foot-bar__bottom"><span>© Apostrophe Communications</span><span>Partner offices: {" · ".join(D["offices"])}</span></div>
        </div>
      </footer>"""


# ---------------------------------------------------------------- page sections (mirror the page scripts)
def home_parts():
    by_slug = {p["slug"]: p for p in D["projects"]}
    featured = [by_slug[s] for s in D["featured"] if s in by_slug]
    more = [by_slug[s] for s in ["omega-ethos", "abraham-thakore", "chopard-jwc", "saundh", "mrunalini-rao", "stonex", "fcml",
                                 "sameer-madan", "bally", "paul-smith", "truebrowns", "forever-new", "superdry", "beeyoung", "tres", "lopera"]
            if s in by_slug]

    stats = "".join(
        f'<div data-reveal data-delay="{num(i * 0.08)}"><span class="stat__n" data-count="{s["value"]}"><span data-num>{s["value"]}</span>'
        f'<sup>{s["suffix"]}</sup></span><span class="stat__l">{s["label"]}</span></div>'
        for i, s in enumerate(D["stats"]))

    wheel = "".join(f'<li class="wheel__item">{esc(s)}</li>' for s in D["services"])

    def plate(a):
        if a.get("logo"):
            return f'<figure class="recog__plate"><img src="{esc(a["logo"])}" alt="{esc(a["org"])}" loading="lazy" decoding="async"></figure>'
        return '<span class="recog__plate is-empty" aria-hidden="true"></span>'

    recog = "".join(f"""
    <div class="recog__grid recog__group">
      <div class="recog__gname">{esc(g["group"])}</div>
      <div>{"".join(f'''
        <div class="recog__row">{plate(a)}<div><h3>{esc(a["title"])}</h3><p>{esc(a["org"])}</p></div><span class="yr">{esc(a["year"])}</span><i class="recog__line" aria-hidden="true"></i></div>''' for a in g["items"])}
      </div>
    </div>""" for g in D["awards"])

    def initials(name):
        words = [w for w in name.split(" ") if w and w[0].isalpha()]
        return "".join(w[0] for w in words)[:2]

    testi = "".join(f"""
    <article class="tcard">
      <div><div class="tcard__q">“</div><blockquote>{esc(t["quote"])}</blockquote></div>
      <div class="tcard__who"><span class="tcard__av">{esc(initials(t["name"]))}</span><div><b>{esc(t["name"])}</b><small>{esc(t["role"])}</small></div></div>
    </article>""" for t in D["testimonials"])

    return {
        "stats": stats,
        "wheelList": wheel,
        "marquee": marquee(featured + more + (D.get("homeBrands") or [])),
        "recogList": recog,
        "sliderTrack": testi,
    }


def about_parts():
    team = "".join(f"""
    <figure class="team__card" data-reveal>
      <div class="team__photo"><img src="{esc(t["photo"])}" alt="{esc(t["name"])}" loading="lazy" decoding="async"></div>
      <figcaption><h3>{esc(t["name"])}</h3><p>{esc(t["role"])}</p></figcaption>
    </figure>""" for t in D["team"])
    logos = "".join(f'<div data-reveal>{logo(b)}</div>' for b in D["press"])
    return {"team": team, "logos": logos}


def projects_parts():
    idx = "".join(f"""
    <div class="index__cat" data-reveal>
      <h3>{esc(c["name"])}</h3>
      <div class="index__logos">{"".join(f'<span class="index__b" title="{esc(b["name"])}">{logo(b)}</span>' for b in c["brands"] if not b.get("slug"))}</div>
    </div>""" for c in D["clientIndex"] if any(not b.get("slug") for b in c["brands"]))
    return {"pgrid": marquee(D["projects"]), "clientIndex": idx}


def careers_parts():
    return {"roles": "".join(f"<li data-reveal>{esc(r)}</li>" for r in (D.get("careers") or {}).get("roles", []))}


def contact_parts():
    return {"contactInfo": f"""
    <div data-reveal><h2>Let’s Connect</h2><a class="link-u mail" href="mailto:{esc(C["email"])}">{esc(C["email"]).replace("@", "@<wbr>")}</a></div>
    <div data-reveal><h2>Studio</h2><p><a class="link-u" href="{esc(C["maps"])}" target="_blank" rel="noopener">{esc(C["address"])}</a></p></div>
    <div data-reveal><h2>Partner Offices</h2><p class="small">{" · ".join(esc(o) for o in D["offices"])}</p></div>
    <div data-reveal><h2>Follow</h2><p><a class="link-u" href="{esc(C["instagram"])}">Instagram</a> &nbsp; <a class="link-u" href="{esc(C["linkedin"])}">LinkedIn</a></p></div>"""}


FAQ = [
    ("What does a restaurant PR agency do?",
     "A restaurant PR agency gets a restaurant, bar or hotel talked about by the right people. At Apostrophe that means planning the launch, hosting media previews and tastings, securing coverage in food and lifestyle titles, running creator programmes, profiling chefs and founders, and setting up collaborations and events that bring guests through the door."),
    ("Which food, beverage and hospitality brands has Apostrophe worked with?",
     "Our dining and hospitality clients include " + ", ".join(b["name"] for c in D["clientIndex"] if c["name"].startswith("Dining") for b in c["brands"]) + "."),
    ("When should a new restaurant start PR?",
     "As early as possible, ideally while the menu and interiors are still being finalised. That leaves time to plan media previews, creator tastings and the opening together, so the launch builds momentum instead of starting cold."),
    ("Do you only work with restaurants in Delhi?",
     "Our studio is in Greater Kailash 1, New Delhi, and much of our hospitality work is in Delhi NCR. With partner offices in " + ", ".join(D["offices"]) + " and campaigns in 18+ cities, we also handle openings and F&B brands across India."),
    ("How do I start working with Apostrophe?",
     "Send us a note through the contact page or email " + C["email"] + " with your brand, location and opening date. We usually reply within two working days."),
]


def hospitality_parts():
    dining = [p for p in D["projects"] if p["category"] == "dining" and not p.get("placeholder")]
    work = "".join(f'<li data-reveal><a class="link-u" href="project.html?p={p["slug"]}">{esc(p["title"])}: {esc(p["subtitle"])}</a></li>' for p in dining)
    cat = next(c for c in D["clientIndex"] if c["name"].startswith("Dining"))
    clients = f"""
    <div class="index__cat" data-reveal>
      <h3>{esc(cat["name"])}</h3>
      <div class="index__logos">{"".join(f'<a class="index__b has-page" href="project.html?p={b["slug"]}" title="{esc(b["name"])}: view project">{logo(b)}</a>' if b.get("slug") else f'<span class="index__b" title="{esc(b["name"])}">{logo(b)}</span>' for b in cat["brands"])}</div>
    </div>"""
    faq = "".join(f"""
        <div class="pillar">
          <h2 data-split>{esc(q)}<span class="dotc"></span></h2>
          <p data-reveal>{esc(a)}</p>
        </div>""" for q, a in FAQ)
    return {"fbWork": work, "fbClients": clients, "faq": faq}


LUX_FAQ = [
    ("What does a luxury PR agency do?",
     "A luxury PR agency builds and protects the reputation of premium brands. At Apostrophe that means collection launches and store openings, private client previews, placements in luxury and fashion titles, celebrity associations, creator programmes, designer and founder profiling, and collaborations that keep a brand desirable without diluting its exclusivity."),
    ("Which luxury brands has Apostrophe worked with?",
     "Our luxury clients include " + ", ".join(b["name"] for c in D["clientIndex"] if c["name"] == "Luxury Retail" for b in c["brands"]) + "."),
    ("How is luxury PR different from mainstream PR?",
     "Luxury PR values the right audience over the biggest one. Coverage, guest lists, celebrity and creator choices are curated to match the brand's craft and heritage, and experiences are often private, so every touchpoint feels as considered as the product."),
    ("Do you work with luxury brands outside Delhi?",
     "Yes. Our studio is in New Delhi, with partner offices in " + ", ".join(D["offices"]) + " and campaigns in 18+ cities, including luxury activations in Ludhiana and fashion moments in Hyderabad and at Lakmé Fashion Week."),
    ("How do I start working with Apostrophe?",
     "Send us a note through the contact page or email " + C["email"] + " with your brand and what you are planning. We usually reply within two working days."),
]


def luxury_parts():
    work_list = [p for p in D["projects"] if p["category"] == "luxury" and not p.get("placeholder")]
    work = "".join(f'<li data-reveal><a class="link-u" href="project.html?p={p["slug"]}">{esc(p["title"])}: {esc(p["subtitle"])}</a></li>' for p in work_list)
    cat = next(c for c in D["clientIndex"] if c["name"] == "Luxury Retail")
    clients = f"""
    <div class="index__cat" data-reveal>
      <h3>{esc(cat["name"])}</h3>
      <div class="index__logos">{"".join(f'<a class="index__b has-page" href="project.html?p={b["slug"]}" title="{esc(b["name"])}: view project">{logo(b)}</a>' if b.get("slug") else f'<span class="index__b" title="{esc(b["name"])}">{logo(b)}</span>' for b in cat["brands"])}</div>
    </div>"""
    faq = "".join(f"""
        <div class="pillar">
          <h2 data-split>{esc(q)}<span class="dotc"></span></h2>
          <p data-reveal>{esc(a)}</p>
        </div>""" for q, a in LUX_FAQ)
    return {"luxWork": work, "luxClients": clients, "luxFaq": faq}


# ---------------------------------------------------------------- more sector pages (one entry each)
BRAND = {}
for _c in D["clientIndex"]:
    for _b in _c["brands"]:
        BRAND.setdefault(_b["name"], _b)
CONTACT_A = ("Send us a note through the contact page or email " + C["email"] +
             " with your brand and what you are planning. We usually reply within two working days.")
SECTORS = {
    "luxury-retail-pr-agency-india.html": {
        "name": "Luxury Retail PR Agency in India", "crumb": "Luxury Retail PR",
        "service": "Public relations for luxury retailers, store launches and in-store activations",
        "work": ["bvlgari-jwc", "chopard-jwc", "omega-ethos", "bath-body-works", "abraham-thakore", "bally", "paul-smith"],
        "clients": [("Luxury Retail", ["BVLGARI", "Johnson Watch Co.", "Chopard", "Omega", "TAG Heuer", "Rado", "Tiffany & Co.", "Versace",
                                       "Ferragamo", "Berluti", "René Caovilla", "Bally", "Paul Smith", "Brooks Brothers"]),
                    ("Global Retail", ["Bath & Body Works", "SNKRHOOD", "Benefit Cosmetics", "Diesel", "GANT", "G-Star RAW", "Superdry",
                                       "True Religion", "Replay", "Forever New", "Hamleys"])],
        "faq": [
            ("What does a luxury retail PR agency do?",
             "A luxury retail PR agency turns store openings, collection arrivals and in-store moments into reasons for the right customers to visit. At Apostrophe that means store and shop-in-shop launches, private client previews with retail partners, media and creator visits, celebrity appearances and always-on coverage that keeps the boutique in conversation."),
            ("Which luxury and retail brands has Apostrophe worked with?",
             "Our retail clients include BVLGARI, Chopard and Omega with retail partners Johnson Watch Co. and Ethos Watch Co., as well as TAG Heuer, Rado, Tiffany & Co., Versace, Ferragamo, Berluti, René Caovilla, Bally, Paul Smith, Brooks Brothers, Bath & Body Works, SNKRHOOD, Diesel, GANT, Superdry and Hamleys."),
            ("Can PR drive footfall and sales for a store?",
             "Yes, when it is planned around the store. For the Bath & Body Works Disney Collection launch, the collection made up 21% of launch-day sales at DLF Promenade, 19.8% at DLF Mall of India and 16% at Ambience Mall."),
            ("Do you handle store launches outside Delhi?",
             "Yes. Our studio is in New Delhi, with partner offices in " + ", ".join(D["offices"]) + " and campaigns in 18+ cities, including an Omega and Ethos Watch Co. shop-in-shop activation in Ludhiana."),
            ("How do I start working with Apostrophe?", CONTACT_A),
        ],
    },
    "fashion-pr-agency-india.html": {
        "name": "Fashion PR Agency in India", "crumb": "Fashion PR",
        "service": "Public relations for fashion designers, couture houses and fashion and lifestyle brands",
        "work": ["tasva", "tarun-tahiliani", "mrunalini-rao", "abraham-thakore", "sameer-madan", "saundh", "truebrowns", "superdry"],
        "clients": [("Designers & Couture", ["Tarun Tahiliani", "JJ Valaya", "Abraham & Thakore", "Mrunalini Rao", "Sameer Madan", "Raghav Rathore",
                                             "Pankaj & Nidhi", "Elisha Wadhwani", "Jorah", "Ordinaree", "Vazaneh", "Studio Medium"]),
                    ("Fashion & Lifestyle", [b["name"] for c in D["clientIndex"] if c["name"] == "Fashion & Lifestyle" for b in c["brands"]])],
        "faq": [
            ("What does a fashion PR agency do?",
             "A fashion PR agency gets collections seen and talked about. At Apostrophe that means collection launches, fashion week moments, editorial coverage in titles such as Vogue India, Harper's Bazaar India, ELLE and Grazia, celebrity dressing, creator programmes and designer profiling."),
            ("Which fashion brands has Apostrophe worked with?",
             "Our fashion clients include Tarun Tahiliani, TASVA, JJ Valaya, Abraham & Thakore, Mrunalini Rao, Sameer Madan, Raghav Rathore, Saundh, trueBrowns, Superdry, Diesel, GANT, G-Star RAW, Forever New and The House of Rare."),
            ("Has Apostrophe's fashion work won awards?",
             "Yes. Our TASVA × Aditya Birla Group campaign won Gold for Best Campaign in Fashion & Lifestyle at AFAQs Communicon 2025, and we won Silver for Best Fashion, Beauty & Lifestyle Campaign at ET Kaleido 2024."),
            ("What results can fashion PR deliver?",
             "For Mrunalini Rao's tenth anniversary Hastakala showcase, our communications programme delivered 13M+ reach and ₹9.6M+ in PR value. For TASVA we built moments around a baraat, a Hyderabad launch and Lakmé Fashion Week."),
            ("How do I start working with Apostrophe?", CONTACT_A),
        ],
    },
    "alcobev-pr-agency-india.html": {
        "name": "Alcobev PR Agency in India", "crumb": "Alcobev PR",
        "service": "Public relations for alcoholic beverage brands: spirits, beer, wine and bars",
        "work": ["beeyoung", "lopera", "flow", "governor-house"],
        "clients": [("Drinks & Bars", ["Hendrick’s", "Cashmir Vodka", "BeeYoung", "The Irish House", "Farzi Café", "Diva", "Townhall", "Bombay Brasserie", "Punjab Grill"])],
        "faq": [
            ("What does an alcobev PR agency do?",
             "An alcobev PR agency builds awareness and preference for spirits, beer and wine brands through earned media, experiences and culture rather than paid advertising. At Apostrophe that means launches, bar and trade activations, creator programmes, brand collaborations, events and media relations."),
            ("Why do alcohol brands in India rely on PR?",
             "Direct advertising of alcoholic drinks is restricted in India, so brands depend on earned coverage, experiences, collaborations and creator content to reach consumers. We plan these to stay within the rules while still building a brand people talk about."),
            ("Which alcobev brands has Apostrophe worked with?",
             "Our drinks work includes Hendrick’s Gin, Cashmir Vodka, BeeYoung strong beer and bars such as The Irish House, alongside restaurant and nightlife clients including Farzi Café, Diva and Townhall."),
            ("What results can alcobev PR deliver?",
             "Our integrated programme for BeeYoung, built on culture, collaborations and creators, generated 1,816,598 total views and 27,646 shares with a total influencer spend of ₹2.34L."),
            ("How do I start working with Apostrophe?", CONTACT_A),
        ],
    },
}


def sector_parts(spec):
    def run():
        by = {p["slug"]: p for p in D["projects"]}
        work = "".join(f'<li data-reveal><a class="link-u" href="project.html?p={p["slug"]}">{esc(p["title"])}: {esc(p["subtitle"])}</a></li>'
                       for p in (by.get(s) for s in spec["work"]) if p and not p.get("placeholder"))
        def b_html(b):
            if b.get("slug"):
                return f'<a class="index__b has-page" href="project.html?p={b["slug"]}" title="{esc(b["name"])}: view project">{logo(b)}</a>'
            return f'<span class="index__b" title="{esc(b["name"])}">{logo(b)}</span>'
        clients = "".join(f"""
    <div class="index__cat" data-reveal>
      <h3>{esc(label)}</h3>
      <div class="index__logos">{"".join(b_html(BRAND[n]) for n in names if n in BRAND)}</div>
    </div>""" for label, names in spec["clients"])
        faq = "".join(f"""
        <div class="pillar">
          <h2 data-split>{esc(q)}<span class="dotc"></span></h2>
          <p data-reveal>{esc(a)}</p>
        </div>""" for q, a in spec["faq"])
        return {"svcWork": work, "svcClients": clients, "svcFaq": faq}
    return run


# ---------------------------------------------------------------- structured data
def social():
    return [u for u in (C.get("instagram"), C.get("linkedin")) if u and u.startswith("http")]


ADDRESS = {
    "@type": "PostalAddress",
    "streetAddress": "67, Lower Ground Floor, Hemkunt Colony, Greater Kailash 1",
    "addressLocality": "New Delhi",
    "postalCode": "110048",
    "addressRegion": "Delhi",
    "addressCountry": "IN",
}
FOUNDER = {
    "@type": "Person",
    "@id": BASE + "about.html#founder",
    "name": "Kritika Lalchandani",
    "jobTitle": "Founder",
    "worksFor": {"@id": BASE + "#org"},
    "award": [f'{a["title"]}, {a["org"]} {a["year"]}'.strip() for g in D["awards"] if g["group"] == "Founder" for a in g["items"]],
}


def org():
    return {
        "@type": ["Organization", "ProfessionalService"],
        "@id": BASE + "#org",
        "name": "Apostrophe Communications",
        "alternateName": "Apostrophe",
        "url": BASE,
        "logo": BASE + "logo-full-black-v6.png",
        "image": BASE + "logo-full-black-v6.png",
        "description": ("Apostrophe Communications is an award-winning PR and integrated communications agency based in New Delhi, India, working with "
                        "luxury, fashion, lifestyle, beauty, interiors and hospitality brands. Since 2017 it has partnered with "
                        "250+ premium Indian and global brands, with campaigns in 18+ cities."),
        "foundingDate": "2017",
        "founder": {"@id": FOUNDER["@id"]},
        "email": C["email"],
        "address": ADDRESS,
        "areaServed": {"@type": "Country", "name": "India"},
        "knowsAbout": ["Public relations", "Luxury PR", "Fashion PR", "Lifestyle PR", "Hospitality PR", "Restaurant PR", "Food and beverage PR", "Hotel PR", "Interiors PR",
                       "Influencer marketing", "Celebrity associations", "Event management", "Crisis management",
                       "Reputation management", "Brand strategy"],
        "makesOffer": [{"@type": "Offer", "itemOffered": {"@type": "Service", "name": s}} for s in D["services"]],
        "award": [f'{a["title"]}, {a["org"]} {a["year"]}'.strip() for g in D["awards"] if g["group"] != "Founder" for a in g["items"]],
        "sameAs": social(),
    }


def ld(*nodes):
    data = {"@context": "https://schema.org", "@graph": list(nodes)}
    body = json.dumps(data, ensure_ascii=False, indent=1).replace("</", "<\\/")
    return f'\n  <script type="application/ld+json">\n{body}\n  </script>\n  '


def page_ld(path, name, typ="WebPage"):
    return {"@type": typ, "@id": BASE + path + "#page", "url": BASE + path, "name": name,
            "isPartOf": {"@id": BASE + "#site"}, "about": {"@id": BASE + "#org"}}


WEBSITE = {"@type": "WebSite", "@id": BASE + "#site", "url": BASE, "name": "Apostrophe Communications",
           "publisher": {"@id": BASE + "#org"}, "inLanguage": "en-IN"}

PAGES = {
    "index.html": (home_parts, ld(org(), WEBSITE, FOUNDER, page_ld("", "Apostrophe Communications | Luxury PR Agency in Delhi, India"))),
    "about.html": (about_parts, ld(org(), FOUNDER, page_ld("about.html", "About Apostrophe Communications", "AboutPage"))),
    "projects.html": (projects_parts, ld(org(), page_ld("projects.html", "PR Case Studies and Clients", "CollectionPage"))),
    "careers.html": (careers_parts, ld(org(), page_ld("careers.html", "Careers at Apostrophe Communications"))),
    "contact.html": (contact_parts, ld(org(), page_ld("contact.html", "Contact Apostrophe Communications", "ContactPage"))),
    "project.html": (lambda: {}, None),
    "luxury-pr-agency-india.html": (luxury_parts, ld(
        org(),
        {"@type": "Service", "@id": BASE + "luxury-pr-agency-india.html#service",
         "name": "Luxury PR", "serviceType": "Public relations for luxury watch, jewellery, couture, fashion and design brands",
         "provider": {"@id": BASE + "#org"}, "areaServed": {"@type": "Country", "name": "India"},
         "url": BASE + "luxury-pr-agency-india.html"},
        {"@type": "FAQPage", "@id": BASE + "luxury-pr-agency-india.html#faq",
         "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in LUX_FAQ]},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": BASE},
            {"@type": "ListItem", "position": 2, "name": "Luxury PR", "item": BASE + "luxury-pr-agency-india.html"}]},
        page_ld("luxury-pr-agency-india.html", "Luxury PR Agency in India"))),
    "hospitality-pr-agency-delhi.html": (hospitality_parts, ld(
        org(),
        {"@type": "Service", "@id": BASE + "hospitality-pr-agency-delhi.html#service",
         "name": "Restaurant and hospitality PR", "serviceType": "Public relations for restaurants, bars, hotels and food and beverage brands",
         "provider": {"@id": BASE + "#org"}, "areaServed": [{"@type": "City", "name": "New Delhi"}, {"@type": "Country", "name": "India"}],
         "url": BASE + "hospitality-pr-agency-delhi.html"},
        {"@type": "FAQPage", "@id": BASE + "hospitality-pr-agency-delhi.html#faq",
         "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": BASE},
            {"@type": "ListItem", "position": 2, "name": "Restaurant & Hospitality PR", "item": BASE + "hospitality-pr-agency-delhi.html"}]},
        page_ld("hospitality-pr-agency-delhi.html", "Restaurant & Hospitality PR Agency in Delhi"))),
}


for _path, _spec in SECTORS.items():
    PAGES[_path] = (sector_parts(_spec), ld(
        org(),
        {"@type": "Service", "@id": BASE + _path + "#service", "name": _spec["crumb"], "serviceType": _spec["service"],
         "provider": {"@id": BASE + "#org"}, "areaServed": {"@type": "Country", "name": "India"}, "url": BASE + _path},
        {"@type": "FAQPage", "@id": BASE + _path + "#faq",
         "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in _spec["faq"]]},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": BASE},
            {"@type": "ListItem", "position": 2, "name": _spec["crumb"], "item": BASE + _path}]},
        page_ld(_path, _spec["name"])))


# ---------------------------------------------------------------- write
def fill(html, cid, content):
    pat = re.compile(r'(id="%s"[^>]*>)(?:<!--pre-->.*?<!--/pre-->)?(</(?:div|ul|article)>)' % re.escape(cid), re.S)
    html, n = pat.subn(lambda m: m.group(1) + "<!--pre-->" + content + "<!--/pre-->" + m.group(2), html, count=1)
    if n != 1:
        raise SystemExit(f"container #{cid} not found or not empty")
    return html


for name, (parts, jsonld) in PAGES.items():
    path = SITE / name
    html = path.read_text(encoding="utf-8")
    for cid, content in {**parts(), "footer": footer()}.items():
        html = fill(html, cid, content)
    if jsonld:
        html = re.sub(r"\n  <!--pre:ld-->.*?<!--/pre:ld-->", "", html, flags=re.S)
        html = html.replace("</head>", "  <!--pre:ld-->" + jsonld + "<!--/pre:ld-->\n</head>", 1)
    path.write_text(html, encoding="utf-8")
    print("updated", name)


# ---------------------------------------------------------------- llms.txt: a plain-text brief for AI assistants
def blocks_text(lst):
    out = []
    for b in lst:
        if b["t"] == "list":
            if b.get("label"):
                out.append(b["label"] + ":")
            out += [f"- {x}" for x in b["v"]]
        else:
            out.append(b["v"])
    return "\n".join(out)


cats = {c["id"]: c["name"] for c in D["categories"]}
lines = [
    "# Apostrophe Communications",
    "",
    "> Apostrophe Communications is an award-winning PR and integrated communications agency based in New Delhi, India, with partner offices in "
    + ", ".join(D["offices"]) + ". Founded in 2017 by Kritika Lalchandani, it has worked with 250+ premium Indian and "
    "global brands across luxury, fashion, lifestyle, beauty, interiors and hospitality, with campaigns in 18+ cities. "
    "Its awards include Rising PR Consultancy of the Year (BW Excel Awards 2025), Gold at AFAQs Communicon 2025 and Silver at ET Kaleido 2024.",
    "",
    f"Website: {BASE}",
    f"Contact: {C['email']}",
    f"Studio: {C['address']}",
    "",
    "## Services",
    *[f"- {s}" for s in D["services"]],
    "",
    "## Sectors",
    *[f"- {c['name']}" for c in D["categories"]],
    "",
    "## Selected clients",
    "- " + ", ".join(dict.fromkeys(b["name"] for c in D["clientIndex"] for b in c["brands"])),
    "",
    "## Recognition",
    *[f"- {a['title']}, {a['org']}{' ' + a['year'] if a['year'] else ''} ({g['group'].lower()})" for g in D["awards"] for a in g["items"]],
    "",
    "## Media",
    "Client stories appear in " + ", ".join(p["name"] for p in D["press"]) + ".",
    "",
    "## Pages",
    f"- [About]({BASE}about.html): the agency, its founder and leadership team",
    f"- [Projects]({BASE}projects.html): case studies and clients by sector",
    f"- [Contact]({BASE}contact.html): brand enquiries and creator sign-up",
    f"- [Careers]({BASE}careers.html): open roles",
    f"- [Luxury PR]({BASE}luxury-pr-agency-india.html): PR for luxury watch, jewellery, couture, fashion and design brands in India",
    f"- [Restaurant & Hospitality PR]({BASE}hospitality-pr-agency-delhi.html): food, beverage and hospitality PR in Delhi and across India",
    *[f"- [{sp['crumb']}]({BASE}{pth}): {sp['service'][0].lower() + sp['service'][1:]}" for pth, sp in SECTORS.items()],
    "",
    "## Case studies",
]
for p in D["projects"]:
    if p.get("placeholder"):
        continue
    lines += ["", f"### {p['title']}: {p['subtitle']}",
              f"{BASE}project.html?p={p['slug']}",
              f"Sector: {cats.get(p['category'], '')}. Work: {', '.join(p['tags'])}."]
    for h in p.get("highlights", []):
        lines.append(f"Result: {h.get('prefix', '')}{h['value']}{h.get('suffix', '')} {h['label']}")
    for key in ("background", "objective", "solution", "impact"):
        if p["sections"].get(key):
            lines += ["", f"{key.title()}: " + blocks_text(p["sections"][key])]
(SITE / "llms.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")
print("updated llms.txt")
