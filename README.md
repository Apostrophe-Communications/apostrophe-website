# Apostrophe Communications: website

Static site (HTML, CSS, JavaScript). No build step: GitHub Pages serves it as is.

## Updating content
Everything that changes lives in **`data.js`**:
- **Projects**: copy an entry in `projects`, change the text. `featured` projects appear on the home page carousel (order set by the `featured` list).
- **Real photos**: put images in `images/` and set `image: "images/name.jpg"` on the project.
- **Testimonials, awards, partners, offices, contact details**: edit the matching lists.
- **Contact form**: paste a Formspree / Web3Forms URL into `contact.formEndpoint` so messages arrive by email. Empty = the form opens the visitor's email app.

## Preview locally
```
python3 -m http.server 8080
```
then open http://localhost:8080

## Moving to the company domain
In the repo's Settings → Pages, add `apostrophecommunications.com` as the custom domain and update the DNS records at the domain registrar. All links are relative, so nothing in the code needs to change.
