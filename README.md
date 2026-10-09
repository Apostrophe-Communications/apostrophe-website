# Apostrophe Communications: website

Static site (HTML, CSS, JavaScript), served unchanged by Cloudflare Workers Static Assets. No build step is required.

## Deployment

Live site: https://apostrophe-website.dataorc.workers.dev/

Cloudflare Workers Builds is connected to this GitHub repository. Every push to `main` deploys the site automatically with these settings:

- **Build command**: empty (no build step).
- **Deploy command**: `npx wrangler@4.149.0 deploy`.
- **Root directory**: repository root.
- **Production branch**: `main`.

`wrangler.toml` publishes the static files from the repository root and enables the `workers.dev` URL. `.assetsignore` excludes repository/deployment metadata. `_redirects` serves `index.html` at `/`. Existing `.html` links, query strings, CSS, JavaScript, and media are served as they are; missing files return a 404 instead of the home page.

For a manual deployment from an authenticated local checkout:

```
npx wrangler@4.149.0 deploy
```

## Updating content
Everything that changes lives in **`data.js`**:
- **Projects**: copy an entry in `projects`, change the text. `featured` projects appear on the home page carousel (order set by the `featured` list).
- **Real photos**: put images in `images/` and set `image: "images/name.jpg"` on the project.
- **Testimonials, awards, partners, offices, contact details**: edit the matching lists.
- **Enquiry form** (Brand name, Email, Phone, Brand Instagram): set `contact.googleForm` to the Google Form's `formResponse` URL and each question's `entry.NNN` id; responses land in the Google Sheet linked to that form. Empty = the form opens the visitor's email app.

## Preview locally
```
python3 -m http.server 8080
```
then open http://localhost:8080

## Moving to the company domain
Add `apostrophecommunications.com` as a Custom Domain on the `apostrophe-website` Worker in Cloudflare. All links are relative, so nothing in the page code needs to change.

## Saved versions
Earlier versions of the site are kept as git tags (`v1-2026-10-01`, `v2-2026-10-01`), not as folders on the live site. To look at one locally: `git worktree add ../apostrophe-v1 v1-2026-10-01`.
