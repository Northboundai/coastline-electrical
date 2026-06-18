# assets/img/

Where to drop real images. Every spot on the site that will eventually hold a
photo currently shows a tidy branded placeholder (`.media-plate`), so nothing
ever looks broken before you add real assets.

## Files the HTML already references
| File | Used for | Suggested size |
|------|----------|----------------|
| `favicon.svg` | Browser tab icon (included) | — |
| `central-coast-electrician.jpg` | Hero video poster / fallback still | 1920×1080 |
| `og-cover.jpg` | Social share image (Open Graph / Twitter) | 1200×630 |

## Swapping a placeholder for a real photo
Find a `.media-plate` block (services, projects, about, blog) and replace it
with an `<img>`, e.g.:

```html
<!-- before -->
<div class="media-plate" role="img" aria-label="Switchboard upgrade in Terrigal"> … </div>

<!-- after -->
<img src="assets/img/projects/terrigal-switchboard.jpg"
     alt="Switchboard upgrade in Terrigal" class="media-plate" loading="lazy"
     style="object-fit:cover;aspect-ratio:4/3" />
```

Generate matching imagery with the prompts in `../../higgsfield-prompts.md`.
Keep images optimised (WebP/AVIF or compressed JPG) for fast loading.
