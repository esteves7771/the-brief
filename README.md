# The Brief — Live News Aggregator

> A free, clean, live news aggregator pulling breaking stories from BBC, Reuters, Al Jazeera, TechCrunch and more. No accounts. No tracking. Just news.

🔗 **[thebriefnews.org](https://thebriefnews.org)**

![The Brief Screenshot](https://thebriefnews.org/og-image.png)

---

## Features

- **Live RSS feeds** — pulls fresh news from 20+ global sources automatically
- **8 categories** — Top Stories, World, Tech, Business, Science, Sports, Cars, Motorcycles
- **In-app article reader** — full article extraction via custom Netlify serverless function, no iframe blocking
- **Breaking news banner** — live pulsing alert for the latest story
- **Weather widget** — real-time weather based on your location (no API key needed)
- **Bookmarks** — save articles locally with localStorage persistence
- **Share button** — native Web Share API on mobile, clipboard fallback on desktop
- **Night / Day mode** — theme persists across sessions
- **Fully mobile responsive** — works on all screen sizes
- **No accounts** — zero friction, open immediately
- **No tracking** — privacy first

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Inline styles + CSS-in-JS |
| News data | RSS feeds via rss2json proxy |
| Article extraction | Custom Netlify serverless function |
| Weather | Open-Meteo API (free, no key) |
| Hosting | Netlify |
| DNS / CDN | Cloudflare |
| Domain | thebriefnews.org |

---

## Architecture

```
Browser (React + Vite)
    │
    ├── RSS feeds → rss2json.com → JSON articles
    │
    ├── Weather → api.open-meteo.com → temperature + condition
    │
    └── "Read In-App" button
            │
            └── /.netlify/functions/extract
                    │
                    └── Fetches article URL server-side
                        Parses HTML → extracts title, text, image
                        Returns clean JSON → renders in reader panel
```

The article extractor runs as a **Netlify serverless function** — this bypasses CORS restrictions and `X-Frame-Options` blocking that makes iframes useless for news sites. The function mimics a real browser user agent, fetches the raw HTML, strips navigation/ads/scripts, and returns clean readable content.

---

## News Sources

| Category | Sources |
|---|---|
| Top Stories | BBC News, New York Times, Sky News |
| World | BBC World, Al Jazeera, Sky News World |
| Technology | TechCrunch, Wired, Ars Technica |
| Business | BBC Business, NYT Business, Sky Business |
| Science | NYT Science, New Scientist, BBC Science |
| Sports | BBC Sport, NYT Sports, Sky Sports |
| Cars | Autocar, Top Gear, Car and Driver |
| Motorcycles | Motorcycle Daily, RideApart, webBikeWorld |

---

## Run Locally

```bash
# Clone the repo
git clone https://github.com/esteves7771/the-brief.git
cd the-brief

# Install dependencies
npm install

# Run with Netlify CLI (includes serverless functions)
npm install -g netlify-cli
netlify dev

# Or run frontend only (article extractor won't work locally without netlify dev)
npm run dev
```

Open `http://localhost:8888` (netlify dev) or `http://localhost:5173` (npm run dev)

---

## Deploy

```bash
# Build
npm run build

# Deploy to Netlify
netlify deploy --prod
```

The `netlify/functions/extract.js` serverless function deploys automatically alongside the frontend.

---

## Project Structure

```
the-brief/
├── src/
│   ├── main.jsx              # App entry point
│   └── NewsApp.jsx           # Main app component (all UI)
├── netlify/
│   └── functions/
│       └── extract.js        # Article extractor serverless function
├── public/
│   ├── favicon.svg
│   ├── og-image.svg
│   ├── robots.txt
│   ├── sitemap.xml
│   └── ads.txt
├── index.html                # SEO + performance optimised
├── netlify.toml              # Netlify config
└── vite.config.js
```

---

## Monetisation

The Brief is monetised via **Google AdSense** (pending approval). The site is GDPR compliant with a Google CMP consent banner for EEA/UK visitors.

---

## Roadmap

- [ ] AI article summaries (Groq API)
- [ ] Keyword filtering
- [ ] Push notifications (Web Push API)
- [ ] Offline support (Service Worker)
- [ ] Email digest subscription
- [ ] Android app (Capacitor wrapper)

---

## Author

**Pedro Esteves** — Self-taught frontend developer based in Barcelona.

- 🌐 [thebriefnews.org](https://thebriefnews.org)
- 💻 [github.com/esteves7771](https://github.com/esteves7771)
- 📧 pedro.esteves.pt@proton.me

---

## License

MIT — free to use, modify and distribute.

---

*Built in one session over coffee ☕ — from idea to live product in an afternoon.*
