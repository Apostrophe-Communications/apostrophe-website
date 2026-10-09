# Apostrophe Communications: website

Static site (HTML, CSS, JavaScript). No build step: GitHub Pages serves it as is.

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
In the repo's Settings → Pages, add `apostrophecommunications.com` as the custom domain and update the DNS records at the domain registrar. All links are relative, so nothing in the code needs to change.

chore:2

## Saved versions
Earlier versions of the site are kept as git tags (`v1-2026-10-01`, `v2-2026-10-01`), not as folders on the live site. To look at one locally: `git worktree add ../apostrophe-v1 v1-2026-10-01`.
