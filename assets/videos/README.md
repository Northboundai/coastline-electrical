# assets/videos/

Drop your Higgsfield hero loop here as:

- `central-coast-electrician.mp4`

The hero `<video>` in `index.html` already points at this path. **The site works
without it** — there's a premium animated CSS/SVG fallback behind the video, so
the hero looks great even with no clip present.

**Recommended export**
- 8–12s, designed as a seamless loop
- H.264 `.mp4`, 1080p or 720p, a few MB max
- No audio (the site never plays sound)

**Compress with ffmpeg**
```bash
ffmpeg -i input.mov -c:v libx264 -crf 26 -preset slow -an -pix_fmt yuv420p \
  -movflags +faststart -vf "scale=1280:-2" central-coast-electrician.mp4
```

Generation prompt: see `../../higgsfield-prompts.md`.
