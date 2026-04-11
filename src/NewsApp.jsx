import { useState, useEffect, useCallback, useRef } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  night: {
    bg:"#080809", bgHeader:"rgba(8,8,9,0.97)", bgCard:"rgba(255,255,255,0.02)",
    bgCardHover:"rgba(255,255,255,0.05)", bgReader:"#0a0a0c", bgInput:"rgba(255,255,255,0.04)",
    bgSkeleton1:"rgba(255,255,255,0.04)", bgSkeleton2:"rgba(255,255,255,0.08)",
    border:"rgba(255,255,255,0.07)", borderHover:"rgba(245,197,80,0.28)",
    borderSub:"rgba(255,255,255,0.05)", borderTab:"rgba(255,255,255,0.04)",
    text:"#f1f5f9", textHead:"#f8fafc", textBody:"#4a5568", textMuted:"#334155",
    textFaint:"#1e293b", textSource:"#64748b", accent:"#f5c550",
    accentBg:"rgba(245,197,80,0.10)", accentBord:"rgba(245,197,80,0.28)",
    shadow:"0 12px 40px rgba(0,0,0,0.55)", scrollThumb:"rgba(255,255,255,0.1)", footer:"#2a3547",
  },
  day: {
    bg:"#f5f0e8", bgHeader:"rgba(245,240,232,0.97)", bgCard:"rgba(255,255,255,0.7)",
    bgCardHover:"rgba(255,255,255,0.95)", bgReader:"#faf7f2", bgInput:"rgba(0,0,0,0.04)",
    bgSkeleton1:"rgba(0,0,0,0.05)", bgSkeleton2:"rgba(0,0,0,0.09)",
    border:"rgba(0,0,0,0.08)", borderHover:"rgba(180,120,20,0.35)",
    borderSub:"rgba(0,0,0,0.07)", borderTab:"rgba(0,0,0,0.06)",
    text:"#1a1a1a", textHead:"#0f0f0f", textBody:"#5a5a6a", textMuted:"#8a8a9a",
    textFaint:"#b0b0c0", textSource:"#7a7a8a", accent:"#b87d20",
    accentBg:"rgba(184,125,32,0.10)", accentBord:"rgba(184,125,32,0.28)",
    shadow:"0 8px 30px rgba(0,0,0,0.12)", scrollThumb:"rgba(0,0,0,0.15)", footer:"#a0a0b0",
  },
};

// ─── RSS SOURCES ──────────────────────────────────────────────────────────────
const RSS_SOURCES = {
  top:      ["https://feeds.bbci.co.uk/news/rss.xml","https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml","https://feeds.skynews.com/feeds/rss/home.xml"],
  world:    ["https://feeds.bbci.co.uk/news/world/rss.xml","https://www.aljazeera.com/xml/rss/all.xml","https://feeds.skynews.com/feeds/rss/world.xml"],
  tech:     ["https://techcrunch.com/feed/","https://www.wired.com/feed/rss","https://feeds.arstechnica.com/arstechnica/index"],
  business: ["https://feeds.bbci.co.uk/news/business/rss.xml","https://rss.nytimes.com/services/xml/rss/nyt/Business.xml","https://feeds.skynews.com/feeds/rss/business.xml"],
  science:  ["https://rss.nytimes.com/services/xml/rss/nyt/Science.xml","https://www.newscientist.com/feed/home/","https://feeds.bbci.co.uk/news/science_and_environment/rss.xml"],
  sports:   ["https://feeds.bbci.co.uk/sport/rss.xml","https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml","https://feeds.skynews.com/feeds/rss/sports.xml"],
  cars:     ["https://www.autocar.co.uk/rss","https://www.topgear.com/rss.xml","https://www.caranddriver.com/rss/all.xml/"],
  motos:    ["https://www.motorcycledaily.com/feed","https://www.rideapart.com/rss/articles/all","https://www.webbikeworld.com/feed"],
};

const CATEGORIES = [
  { id:"top",      label:"Top",         icon:"◈" },
  { id:"world",    label:"World",       icon:"◎" },
  { id:"tech",     label:"Tech",        icon:"⟡" },
  { id:"business", label:"Business",    icon:"◇" },
  { id:"science",  label:"Science",     icon:"⬡" },
  { id:"sports",   label:"Sports",      icon:"◉" },
  { id:"cars",     label:"Cars",        icon:"▷" },
  { id:"motos",    label:"Motorcycles", icon:"◍" },
  { id:"saved",    label:"Saved",       icon:"◆" },
];

const RSS2JSON    = "https://api.rss2json.com/v1/api.json?rss_url=";
const CONTACT_EMAIL = "pedro.esteves.pt@proton.me";

// ─── WEATHER CODES ────────────────────────────────────────────────────────────
const WX = {
  0:{icon:"☀️",label:"Clear"},1:{icon:"🌤",label:"Mostly clear"},2:{icon:"⛅",label:"Partly cloudy"},
  3:{icon:"☁️",label:"Overcast"},45:{icon:"🌫",label:"Foggy"},48:{icon:"🌫",label:"Icy fog"},
  51:{icon:"🌦",label:"Light drizzle"},53:{icon:"🌦",label:"Drizzle"},55:{icon:"🌧",label:"Heavy drizzle"},
  61:{icon:"🌧",label:"Light rain"},63:{icon:"🌧",label:"Rain"},65:{icon:"🌧",label:"Heavy rain"},
  71:{icon:"🌨",label:"Light snow"},73:{icon:"🌨",label:"Snow"},75:{icon:"❄️",label:"Heavy snow"},
  80:{icon:"🌦",label:"Showers"},81:{icon:"🌧",label:"Rain showers"},82:{icon:"⛈",label:"Heavy showers"},
  95:{icon:"⛈",label:"Thunderstorm"},96:{icon:"⛈",label:"Hail storm"},99:{icon:"⛈",label:"Hail storm"},
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
async function fetchFeed(url) {
  try {
    const res = await fetch(`${RSS2JSON}${encodeURIComponent(url)}&count=10`);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.status !== "ok") return [];
    return (data.items || []).map(item => ({
      id:          item.guid || item.link,
      title:       item.title || "",
      description: stripHtml(item.description || item.content || ""),
      url:         item.link || "",
      image:       item.thumbnail || item.enclosure?.link || extractImage(item.description) || null,
      source:      data.feed?.title || new URL(url).hostname.replace("www.",""),
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
    }));
  } catch { return []; }
}

const stripHtml = h => h.replace(/<[^>]*>/g,"").replace(/&[^;]+;/g," ").trim().slice(0,400);
function extractImage(html) {
  if (!html) return null;
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}
function timeAgo(date) {
  const d = (Date.now() - new Date(date)) / 1000;
  if (d < 60)    return "just now";
  if (d < 3600)  return `${Math.floor(d/60)}m ago`;
  if (d < 86400) return `${Math.floor(d/3600)}h ago`;
  return `${Math.floor(d/86400)}d ago`;
}
function dedupe(arr) {
  const seen = new Set();
  return arr.filter(a => {
    const k = a.title.slice(0,60).toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k); return true;
  });
}
function loadBookmarks() {
  try { return JSON.parse(localStorage.getItem("theBriefBookmarks") || "[]"); } catch { return []; }
}
function saveBookmarks(bm) {
  try { localStorage.setItem("theBriefBookmarks", JSON.stringify(bm)); } catch {}
}
function shareArticle(article) {
  if (navigator.share) {
    navigator.share({ title: article.title, url: article.url }).catch(() => {});
  } else {
    navigator.clipboard?.writeText(article.url).catch(() => {});
  }
}

// ─── WEATHER HOOK ─────────────────────────────────────────────────────────────
function useWeather() {
  const [weather, setWeather] = useState(null);
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { latitude: lat, longitude: lon } = coords;
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(2)}&longitude=${lon.toFixed(2)}&current=temperature_2m,weathercode&temperature_unit=celsius&timezone=auto`;
          const res  = await fetch(url);
          const data = await res.json();
          const code = data.current?.weathercode ?? 0;
          const temp = Math.round(data.current?.temperature_2m ?? 0);
          const wx   = WX[code] || { icon:"🌡", label:"" };
          // Reverse geocode city name using open-meteo's timezone string
          const tz   = data.timezone || "";
          const city = tz.split("/").pop()?.replace(/_/g," ") || "";
          setWeather({ temp, icon: wx.icon, label: wx.label, city });
        } catch {}
      },
      () => {},
      { timeout: 8000 }
    );
  }, []);
  return weather;
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────
function Skeleton({ style, th }) {
  return <div style={{ background:`linear-gradient(90deg,${th.bgSkeleton1} 25%,${th.bgSkeleton2} 50%,${th.bgSkeleton1} 75%)`, backgroundSize:"200% 100%", animation:"shimmer 1.6s infinite", borderRadius:3, ...style }} />;
}
function SkeletonCard({ featured, th }) {
  return (
    <div style={{ background:th.bgCard, border:`1px solid ${th.border}`, padding:featured?"1.5rem":"1.1rem", borderRadius:6, display:"flex", flexDirection:"column", gap:"0.75rem" }}>
      <Skeleton th={th} style={{ height:12, width:"35%" }} />
      <Skeleton th={th} style={{ height:featured?24:16 }} />
      <Skeleton th={th} style={{ height:featured?24:16, width:"75%" }} />
      {featured && <Skeleton th={th} style={{ height:180 }} />}
      <Skeleton th={th} style={{ height:12 }} />
      <Skeleton th={th} style={{ height:12, width:"55%" }} />
    </div>
  );
}

// ─── WEATHER WIDGET ───────────────────────────────────────────────────────────
function WeatherWidget({ weather, th }) {
  if (!weather) return null;
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:"0.5rem",
      background:th.accentBg, border:`1px solid ${th.accentBord}`,
      borderRadius:20, padding:"0.25rem 0.75rem",
      flexShrink:0, animation:"fadeIn 0.4s ease",
    }}>
      <span style={{ fontSize:"0.9rem", lineHeight:1 }}>{weather.icon}</span>
      <span style={{ color:th.accent, fontSize:"0.65rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.06em", whiteSpace:"nowrap" }}>
        {weather.temp}°C {weather.city && <span style={{ opacity:0.7 }}>· {weather.city}</span>}
      </span>
    </div>
  );
}

// ─── BREAKING NEWS BANNER ─────────────────────────────────────────────────────
function BreakingBanner({ article, onClick, th }) {
  const [visible, setVisible] = useState(true);
  if (!article || !visible) return null;
  return (
    <div style={{
      background:`linear-gradient(90deg, rgba(239,68,68,0.12), rgba(239,68,68,0.06))`,
      borderBottom:`1px solid rgba(239,68,68,0.25)`,
      padding:"0.55rem 1rem",
      display:"flex", alignItems:"center", gap:"0.75rem",
      animation:"slideDown 0.4s ease",
      cursor:"pointer",
    }}
    onClick={() => onClick(article)}
    >
      {/* Pulse dot */}
      <div style={{ position:"relative", flexShrink:0 }}>
        <div style={{ width:8, height:8, borderRadius:"50%", background:"#ef4444" }} />
        <div style={{ position:"absolute", inset:"-3px", borderRadius:"50%", border:"1px solid rgba(239,68,68,0.4)", animation:"ping 1.5s ease-in-out infinite" }} />
      </div>
      <span style={{ color:"#ef4444", fontSize:"0.58rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.16em", textTransform:"uppercase", flexShrink:0 }}>Breaking</span>
      <p style={{ color:th.textHead, fontSize:"0.78rem", fontFamily:"'Playfair Display',serif", fontWeight:600, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>
        {article.title}
      </p>
      <span style={{ color:th.textMuted, fontSize:"0.6rem", fontFamily:"'DM Mono',monospace", flexShrink:0 }}>{timeAgo(article.publishedAt)}</span>
      <button
        onClick={e => { e.stopPropagation(); setVisible(false); }}
        style={{ background:"transparent", border:"none", color:"rgba(239,68,68,0.5)", cursor:"pointer", fontSize:"0.75rem", padding:"0 4px", flexShrink:0 }}
      >✕</button>
    </div>
  );
}

// ─── NEWS CARD ────────────────────────────────────────────────────────────────
function NewsCard({ article, featured, index, onClick, th, bookmarks, onBookmark }) {
  const [hovered,  setHovered]  = useState(false);
  const [imgErr,   setImgErr]   = useState(false);
  const [shared,   setShared]   = useState(false);
  const isBookmarked = bookmarks.some(b => b.id === article.id);

  const handleShare = (e) => {
    e.stopPropagation();
    shareArticle(article);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };
  const handleBookmark = (e) => {
    e.stopPropagation();
    onBookmark(article);
  };

  return (
    <article
      onClick={() => onClick(article)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:    hovered ? th.bgCardHover : th.bgCard,
        border:        `1px solid ${hovered ? th.borderHover : th.border}`,
        borderRadius:  6, padding: featured ? "1.5rem" : "1.1rem",
        cursor:        "pointer", transition:"all 0.22s ease",
        transform:     hovered ? "translateY(-2px)" : "none",
        boxShadow:     hovered ? th.shadow : "none",
        position:      "relative", overflow:"hidden",
        animation:     `fadeUp 0.45s ease ${index*0.055}s both`,
        display:       "flex", flexDirection:"column",
        gap:           featured ? "0.9rem" : "0.6rem",
      }}
    >
      {featured && <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${th.accent},#e8833a)` }} />}

      {/* meta row */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:"0.5rem" }}>
        <div style={{ display:"flex", gap:"0.45rem", alignItems:"center", flexWrap:"wrap" }}>
          {featured && <span style={{ background:th.accentBg, border:`1px solid ${th.accentBord}`, color:th.accent, fontSize:"0.58rem", letterSpacing:"0.14em", padding:"2px 7px", fontFamily:"'DM Mono',monospace", textTransform:"uppercase" }}>◈ FEATURED</span>}
          <span style={{ color:th.textSource, fontSize:"0.62rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.05em" }}>{article.source}</span>
        </div>
        <span style={{ color:th.textMuted, fontSize:"0.58rem", fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap" }}>{timeAgo(article.publishedAt)}</span>
      </div>

      {/* featured image */}
      {featured && article.image && !imgErr && (
        <div style={{ height:200, borderRadius:4, overflow:"hidden", background:th.bgSkeleton1, flexShrink:0 }}>
          <img src={article.image} alt="" loading="lazy" decoding="async" onError={() => setImgErr(true)} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
        </div>
      )}

      {/* headline */}
      <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:featured?"clamp(1.05rem,2.2vw,1.45rem)":"clamp(0.88rem,1.8vw,0.96rem)", fontWeight:featured?700:600, color:th.textHead, lineHeight:1.3, margin:0, letterSpacing:"-0.01em" }}>{article.title}</h2>

      {/* description */}
      {article.description && (
        <p style={{ color:th.textBody, fontSize:featured?"0.85rem":"0.76rem", lineHeight:1.7, fontFamily:"'Lora',serif", margin:0, display:"-webkit-box", WebkitLineClamp:featured?3:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{article.description}</p>
      )}

      {/* action row */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"0.35rem", color:hovered?th.accent:th.textMuted, fontSize:"0.62rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em", transition:"color 0.2s" }}>
          READ STORY →
        </div>
        <div style={{ display:"flex", gap:"0.4rem" }}>
          {/* Share */}
          <button
            onClick={handleShare}
            title="Share article"
            style={{ background:"transparent", border:`1px solid ${shared?"rgba(74,222,128,0.3)":th.border}`, color:shared?"#4ade80":th.textMuted, borderRadius:4, padding:"3px 8px", cursor:"pointer", fontSize:"0.65rem", fontFamily:"'DM Mono',monospace", transition:"all 0.2s", letterSpacing:"0.06em" }}
          >{shared ? "✓" : "⇪"}</button>
          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            title={isBookmarked ? "Remove bookmark" : "Save article"}
            style={{ background:isBookmarked?th.accentBg:"transparent", border:`1px solid ${isBookmarked?th.accentBord:th.border}`, color:isBookmarked?th.accent:th.textMuted, borderRadius:4, padding:"3px 8px", cursor:"pointer", fontSize:"0.65rem", transition:"all 0.2s" }}
          >{isBookmarked ? "◆" : "◇"}</button>
        </div>
      </div>
    </article>
  );
}

// ─── ARTICLE EXTRACTOR ────────────────────────────────────────────────────────
async function extractArticle(url) {
  const endpoint = `/.netlify/functions/extract?url=${encodeURIComponent(url)}`;
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`Extraction failed (${res.status})`);
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json;
}

// ─── IN-APP BROWSER ───────────────────────────────────────────────────────────
function InAppBrowser({ url, title, onClose, th }) {
  const [status,   setStatus]   = useState("loading");
  const [article,  setArticle]  = useState(null);
  const [fontSize, setFontSize] = useState(17);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  useEffect(() => {
    const fn = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);
  useEffect(() => {
    setStatus("loading");
    extractArticle(url)
      .then(data => { setArticle(data); setStatus("success"); })
      .catch(() => setStatus("error"));
  }, [url]);

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)", zIndex:200, animation:"fadeIn 0.2s ease" }} />
      <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"min(780px,96vw)", height:"min(90vh,860px)", background:th.bgReader, border:`1px solid ${th.border}`, borderRadius:12, zIndex:201, display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 32px 80px rgba(0,0,0,0.65)", animation:"popIn 0.3s cubic-bezier(0.16,1,0.3,1)" }}>
        {/* chrome bar */}
        <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", padding:"0.6rem 1rem", background:th.bgHeader, borderBottom:`1px solid ${th.border}`, flexShrink:0, flexWrap:"wrap" }}>
          <div style={{ display:"flex", gap:"0.38rem", flexShrink:0 }}>
            <button onClick={onClose} style={{ width:12, height:12, borderRadius:"50%", background:"#ff5f57", border:"none", cursor:"pointer", padding:0 }} />
            <div style={{ width:12, height:12, borderRadius:"50%", background:th.border }} />
            <div style={{ width:12, height:12, borderRadius:"50%", background:th.border }} />
          </div>
          <div style={{ flex:1, minWidth:0, background:th.bgInput, border:`1px solid ${th.border}`, borderRadius:5, padding:"0.28rem 0.7rem", display:"flex", alignItems:"center", gap:"0.4rem" }}>
            <span style={{ fontSize:"0.65rem" }}>🔒</span>
            <span style={{ color:th.textMuted, fontSize:"0.62rem", fontFamily:"'DM Mono',monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{url}</span>
          </div>
          <div style={{ display:"flex", gap:"0.4rem", alignItems:"center", flexShrink:0 }}>
            {[15,17,19].map((s,i) => (
              <button key={s} onClick={() => setFontSize(s)} style={{ background:fontSize===s?th.accentBg:"transparent", border:`1px solid ${fontSize===s?th.accentBord:th.border}`, color:fontSize===s?th.accent:th.textMuted, borderRadius:3, padding:"2px 7px", fontSize:"0.58rem", cursor:"pointer", fontFamily:"'DM Mono',monospace" }}>A{["","·","··"][i]}</button>
            ))}
            <a href={url} target="_blank" rel="noopener noreferrer" style={{ background:th.accentBg, border:`1px solid ${th.accentBord}`, color:th.accent, fontSize:"0.58rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.08em", padding:"4px 9px", borderRadius:4, textDecoration:"none", whiteSpace:"nowrap" }}>OPEN ↗</a>
            <button onClick={onClose} style={{ background:"transparent", border:`1px solid ${th.border}`, color:th.textMuted, cursor:"pointer", fontSize:"0.82rem", padding:"3px 8px", borderRadius:4 }}>✕</button>
          </div>
        </div>
        {status === "loading" && <div style={{ height:2, background:th.border, flexShrink:0, overflow:"hidden" }}><div style={{ height:"100%", background:`linear-gradient(90deg,${th.accent},#e8833a)`, animation:"loadBar 1.6s ease-in-out infinite" }} /></div>}
        <div style={{ flex:1, overflowY:"auto", padding:"2rem 2.5rem" }}>
          {status === "loading" && (
            <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
              {[100,85,95,70,90,75].map((w,i) => <div key={i} style={{ height:i===0?28:16, width:`${w}%`, background:`linear-gradient(90deg,${th.bgSkeleton1} 25%,${th.bgSkeleton2} 50%,${th.bgSkeleton1} 75%)`, backgroundSize:"200% 100%", animation:"shimmer 1.5s infinite", borderRadius:3 }} />)}
              <div style={{ height:220, background:`linear-gradient(90deg,${th.bgSkeleton1} 25%,${th.bgSkeleton2} 50%,${th.bgSkeleton1} 75%)`, backgroundSize:"200% 100%", animation:"shimmer 1.5s infinite", borderRadius:6, margin:"0.5rem 0" }} />
              {[100,88,76,92,65,80].map((w,i) => <div key={i} style={{ height:16, width:`${w}%`, background:`linear-gradient(90deg,${th.bgSkeleton1} 25%,${th.bgSkeleton2} 50%,${th.bgSkeleton1} 75%)`, backgroundSize:"200% 100%", animation:"shimmer 1.5s infinite", borderRadius:3 }} />)}
            </div>
          )}
          {status === "error" && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"60vh", gap:"1.25rem", textAlign:"center" }}>
              <span style={{ fontSize:"2.5rem" }}>⚠️</span>
              <h3 style={{ fontFamily:"'Playfair Display',serif", color:th.textHead, fontSize:"1.1rem", fontWeight:700 }}>Couldn't extract this article</h3>
              <p style={{ color:th.textBody, fontSize:"0.83rem", fontFamily:"'Lora',serif", lineHeight:1.7, maxWidth:400 }}>This article may be behind a paywall. Read it directly at the source.</p>
              <a href={url} target="_blank" rel="noopener noreferrer" style={{ background:th.accentBg, border:`1px solid ${th.accentBord}`, color:th.accent, padding:"0.7rem 1.4rem", borderRadius:5, textDecoration:"none", fontFamily:"'DM Mono',monospace", fontSize:"0.7rem", letterSpacing:"0.1em" }}>READ ON SOURCE ↗</a>
            </div>
          )}
          {status === "success" && article && (
            <div style={{ maxWidth:640, margin:"0 auto" }}>
              <div style={{ display:"flex", gap:"0.6rem", alignItems:"center", flexWrap:"wrap", marginBottom:"1.25rem" }}>
                {article.siteName && <span style={{ background:th.accentBg, border:`1px solid ${th.accentBord}`, color:th.accent, fontSize:"0.6rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em", padding:"3px 9px", textTransform:"uppercase" }}>{article.siteName}</span>}
                {article.author && <span style={{ color:th.textMuted, fontSize:"0.65rem", fontFamily:"'DM Mono',monospace" }}>By {article.author}</span>}
                {article.date && <span style={{ color:th.textFaint, fontSize:"0.62rem", fontFamily:"'DM Mono',monospace" }}>{new Date(article.date).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</span>}
              </div>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.4rem,3.5vw,2rem)", fontWeight:700, color:th.textHead, lineHeight:1.22, marginBottom:"1.5rem", letterSpacing:"-0.02em" }}>{article.title}</h1>
              {article.image && <div style={{ borderRadius:8, overflow:"hidden", marginBottom:"1.75rem", border:`1px solid ${th.border}` }}><img src={article.image} alt="" onError={e=>{e.target.parentElement.style.display="none";}} style={{ width:"100%", display:"block", maxHeight:400, objectFit:"cover" }} /></div>}
              <div style={{ fontFamily:"'Lora',serif", fontSize:`${fontSize}px`, color:th.textBody, lineHeight:1.9 }}>
                {article.text ? article.text.split("\n\n").filter(p=>p.trim()).map((para,i)=><p key={i} style={{ marginBottom:"1.2em" }}>{para}</p>) : <p style={{ color:th.textMuted }}>No text could be extracted.</p>}
              </div>
              <div style={{ borderTop:`1px solid ${th.borderSub}`, marginTop:"2.5rem", paddingTop:"1.25rem", display:"flex", gap:"0.75rem", alignItems:"center", flexWrap:"wrap" }}>
                <p style={{ color:th.textFaint, fontSize:"0.65rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.06em", flex:1 }}>Extracted by The Brief · Original content belongs to the publisher.</p>
                <a href={url} target="_blank" rel="noopener noreferrer" style={{ background:th.accentBg, border:`1px solid ${th.accentBord}`, color:th.accent, padding:"0.55rem 1.1rem", borderRadius:4, textDecoration:"none", fontFamily:"'DM Mono',monospace", fontSize:"0.65rem", letterSpacing:"0.1em", whiteSpace:"nowrap" }}>VIEW ORIGINAL ↗</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── READER PANEL ─────────────────────────────────────────────────────────────
function ReaderPanel({ article, onClose, th, bookmarks, onBookmark }) {
  const [fontSize,    setFontSize]    = useState(16);
  const [showBrowser, setShowBrowser] = useState(false);
  const [shared,      setShared]      = useState(false);
  const isBookmarked = bookmarks.some(b => b.id === article.id);

  useEffect(() => {
    const fn = e => { if (e.key === "Escape" && !showBrowser) onClose(); };
    window.addEventListener("keydown", fn);
    if (!showBrowser) document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
  }, [onClose, showBrowser]);

  const handleShare = () => {
    shareArticle(article);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(5px)", zIndex:100, animation:"fadeIn 0.2s ease" }} />
      <aside style={{ position:"fixed", top:0, right:0, bottom:0, width:"min(680px,100vw)", background:th.bgReader, borderLeft:`1px solid ${th.border}`, zIndex:101, overflowY:"auto", animation:"slideIn 0.3s cubic-bezier(0.16,1,0.3,1)", display:"flex", flexDirection:"column" }}>
        {/* header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.9rem 1.25rem", borderBottom:`1px solid ${th.border}`, position:"sticky", top:0, background:th.bgReader, zIndex:1, gap:"0.75rem", flexWrap:"wrap" }}>
          <div style={{ display:"flex", gap:"0.4rem", alignItems:"center" }}>
            <span style={{ color:th.textMuted, fontSize:"0.58rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em" }}>SIZE</span>
            {[14,16,18,20].map((s,i) => (
              <button key={s} onClick={() => setFontSize(s)} style={{ background:fontSize===s?th.accentBg:"transparent", border:`1px solid ${fontSize===s?th.accentBord:th.border}`, color:fontSize===s?th.accent:th.textMuted, borderRadius:3, padding:"2px 7px", fontSize:"0.6rem", cursor:"pointer", fontFamily:"'DM Mono',monospace" }}>A{["","·","··","···"][i]}</button>
            ))}
          </div>
          <div style={{ display:"flex", gap:"0.5rem", alignItems:"center", flexWrap:"wrap" }}>
            <button onClick={() => onBookmark(article)} style={{ background:isBookmarked?th.accentBg:"transparent", border:`1px solid ${isBookmarked?th.accentBord:th.border}`, color:isBookmarked?th.accent:th.textMuted, fontSize:"0.6rem", fontFamily:"'DM Mono',monospace", padding:"4px 10px", borderRadius:3, cursor:"pointer" }}>{isBookmarked?"◆ SAVED":"◇ SAVE"}</button>
            <button onClick={handleShare} style={{ background:"transparent", border:`1px solid ${shared?"rgba(74,222,128,0.3)":th.border}`, color:shared?"#4ade80":th.textMuted, fontSize:"0.6rem", fontFamily:"'DM Mono',monospace", padding:"4px 10px", borderRadius:3, cursor:"pointer" }}>{shared?"✓ SHARED":"⇪ SHARE"}</button>
            <button onClick={() => setShowBrowser(true)} style={{ background:th.accentBg, border:`1px solid ${th.accentBord}`, color:th.accent, fontSize:"0.6rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.08em", padding:"4px 10px", borderRadius:3, cursor:"pointer", whiteSpace:"nowrap" }}>⬡ READ IN-APP</button>
            <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ color:th.textSource, fontSize:"0.6rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em", textDecoration:"none", border:`1px solid ${th.border}`, padding:"4px 10px", borderRadius:3, whiteSpace:"nowrap" }}>SOURCE ↗</a>
            <button onClick={onClose} style={{ background:"transparent", border:`1px solid ${th.border}`, color:th.textMuted, cursor:"pointer", fontSize:"0.85rem", padding:"4px 9px", borderRadius:3 }}>✕</button>
          </div>
        </div>
        {/* content */}
        <div style={{ padding:"2rem 1.75rem", flex:1 }}>
          <div style={{ display:"flex", gap:"0.6rem", alignItems:"center", marginBottom:"1.25rem", flexWrap:"wrap" }}>
            <span style={{ background:th.accentBg, border:`1px solid ${th.accentBord}`, color:th.accent, fontSize:"0.6rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em", padding:"3px 9px", textTransform:"uppercase" }}>{article.source}</span>
            <span style={{ color:th.textMuted, fontSize:"0.62rem", fontFamily:"'DM Mono',monospace" }}>{timeAgo(article.publishedAt)}</span>
          </div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.3rem,4vw,1.9rem)", fontWeight:700, color:th.textHead, lineHeight:1.22, marginBottom:"1.5rem", letterSpacing:"-0.02em" }}>{article.title}</h1>
          {article.image && <div style={{ borderRadius:5, overflow:"hidden", marginBottom:"1.75rem", border:`1px solid ${th.border}` }}><img src={article.image} alt="" onError={e=>{e.target.parentElement.style.display="none";}} style={{ width:"100%", display:"block", maxHeight:360, objectFit:"cover" }} /></div>}
          <p style={{ fontFamily:"'Lora',serif", fontSize:`${fontSize}px`, color:th.textBody, lineHeight:1.85, marginBottom:"2rem" }}>{article.description || "Full article available at the original source."}</p>
          <div style={{ borderTop:`1px solid ${th.borderSub}`, paddingTop:"1.25rem", display:"flex", flexDirection:"column", gap:"0.75rem" }}>
            <p style={{ color:th.textMuted, fontSize:"0.7rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.06em" }}>Preview from RSS feed. Read the full story below.</p>
            <div style={{ display:"flex", gap:"0.75rem", flexWrap:"wrap" }}>
              <button onClick={() => setShowBrowser(true)} style={{ background:th.accentBg, border:`1px solid ${th.accentBord}`, color:th.accent, padding:"0.65rem 1.25rem", borderRadius:4, cursor:"pointer", fontFamily:"'DM Mono',monospace", fontSize:"0.68rem", letterSpacing:"0.1em" }}>⬡ READ IN-APP</button>
              <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ display:"inline-flex", alignItems:"center", background:"transparent", border:`1px solid ${th.border}`, color:th.textMuted, padding:"0.65rem 1.25rem", borderRadius:4, textDecoration:"none", fontFamily:"'DM Mono',monospace", fontSize:"0.68rem", letterSpacing:"0.1em" }}>OPEN IN BROWSER ↗</a>
            </div>
          </div>
        </div>
      </aside>
      {showBrowser && <InAppBrowser url={article.url} title={article.title} onClose={() => setShowBrowser(false)} th={th} />}
    </>
  );
}

// ─── THEME TOGGLE ─────────────────────────────────────────────────────────────
function ThemeToggle({ night, onToggle, th }) {
  return (
    <button onClick={onToggle} title={night?"Switch to Day":"Switch to Night"} style={{ display:"flex", alignItems:"center", gap:"0.4rem", background:th.accentBg, border:`1px solid ${th.accentBord}`, borderRadius:20, padding:"0.28rem 0.7rem", cursor:"pointer", transition:"all 0.2s", flexShrink:0 }}>
      <span style={{ fontSize:"0.8rem", lineHeight:1 }}>{night?"☀️":"🌙"}</span>
      <span style={{ color:th.accent, fontSize:"0.56rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em" }} className="toggle-label">{night?"DAY":"NIGHT"}</span>
    </button>
  );
}

// ─── CONTACT POPUP ────────────────────────────────────────────────────────────
function ContactPopup({ onClose, th }) {
  const [copied, setCopied] = useState(false);
  const copyEmail = () => { navigator.clipboard.writeText(CONTACT_EMAIL).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };
  useEffect(() => {
    const fn = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)", zIndex:300, animation:"fadeIn 0.2s ease" }} />
      <div style={{ position:"fixed", bottom:"5rem", right:"1.5rem", background:th.bgReader, border:`1px solid ${th.border}`, borderRadius:10, padding:"1.5rem", zIndex:301, width:"min(320px,90vw)", boxShadow:"0 20px 60px rgba(0,0,0,0.4)", animation:"popUp 0.25s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1rem" }}>
          <div>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", fontWeight:700, color:th.textHead, marginBottom:"0.2rem" }}>Get in touch</h3>
            <p style={{ color:th.textMuted, fontSize:"0.68rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.05em" }}>Pedro Esteves · Developer</p>
          </div>
          <button onClick={onClose} style={{ background:"transparent", border:`1px solid ${th.border}`, color:th.textMuted, cursor:"pointer", fontSize:"0.8rem", padding:"3px 8px", borderRadius:3 }}>✕</button>
        </div>
        <div style={{ background:th.bgInput, border:`1px solid ${th.border}`, borderRadius:6, padding:"0.75rem 1rem", marginBottom:"0.75rem" }}>
          <p style={{ color:th.textMuted, fontSize:"0.58rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em", marginBottom:"0.3rem" }}>EMAIL</p>
          <p style={{ color:th.textHead, fontSize:"0.78rem", fontFamily:"'DM Mono',monospace", wordBreak:"break-all" }}>{CONTACT_EMAIL}</p>
        </div>
        <div style={{ display:"flex", gap:"0.5rem" }}>
          <button onClick={copyEmail} style={{ flex:1, background:copied?"rgba(74,222,128,0.1)":th.accentBg, border:`1px solid ${copied?"rgba(74,222,128,0.3)":th.accentBord}`, color:copied?"#4ade80":th.accent, cursor:"pointer", padding:"0.6rem", borderRadius:5, fontFamily:"'DM Mono',monospace", fontSize:"0.65rem", letterSpacing:"0.1em", transition:"all 0.2s" }}>{copied ? "✓ COPIED" : "COPY EMAIL"}</button>
          <a href={`mailto:${CONTACT_EMAIL}`} style={{ flex:1, background:"transparent", border:`1px solid ${th.border}`, color:th.textMuted, padding:"0.6rem", borderRadius:5, fontFamily:"'DM Mono',monospace", fontSize:"0.65rem", letterSpacing:"0.1em", textDecoration:"none", display:"flex", alignItems:"center", justifyContent:"center" }}>SEND EMAIL ↗</a>
        </div>
      </div>
    </>
  );
}

// ─── SAVED ARTICLES VIEW ──────────────────────────────────────────────────────
function SavedView({ bookmarks, onClick, onBookmark, th }) {
  if (bookmarks.length === 0) {
    return (
      <div style={{ textAlign:"center", padding:"5rem 1rem" }}>
        <p style={{ fontSize:"2rem", marginBottom:"1rem" }}>◇</p>
        <p style={{ color:th.textHead, fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", fontWeight:700, marginBottom:"0.5rem" }}>No saved articles yet</p>
        <p style={{ color:th.textMuted, fontFamily:"'DM Mono',monospace", fontSize:"0.7rem", letterSpacing:"0.08em" }}>Tap ◇ on any story to save it here</p>
      </div>
    );
  }
  return (
    <div className="news-grid">
      {bookmarks.map((article, i) => (
        <NewsCard key={article.id || i} article={article} index={i} onClick={onClick} th={th} bookmarks={bookmarks} onBookmark={onBookmark} />
      ))}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function NewsApp() {
  const [night,           setNight]           = useState(() => { try { return localStorage.getItem("theBriefTheme") !== "day"; } catch { return true; } });
  const [activeCategory,  setActiveCategory]  = useState("top");
  const [articles,        setArticles]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [lastUpdated,     setLastUpdated]     = useState(null);
  const [search,          setSearch]          = useState("");
  const [showContact,     setShowContact]     = useState(false);
  const [bookmarks,       setBookmarks]       = useState(loadBookmarks);
  const cacheRef = useRef({});
  const th = night ? T.night : T.day;
  const weather = useWeather();

  const toggleTheme = () => setNight(n => { const next=!n; try{localStorage.setItem("theBriefTheme",next?"night":"day");}catch{} return next; });

  const toggleBookmark = (article) => {
    setBookmarks(prev => {
      const exists = prev.some(b => b.id === article.id);
      const next   = exists ? prev.filter(b => b.id !== article.id) : [article, ...prev];
      saveBookmarks(next);
      return next;
    });
  };

  const loadNews = useCallback(async (cat) => {
    if (cat === "saved") return;
    if (cacheRef.current[cat]) { setArticles(cacheRef.current[cat]); setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const results = await Promise.allSettled(RSS_SOURCES[cat].map(fetchFeed));
      const all = results.flatMap(r => r.status==="fulfilled" ? r.value : []);
      const sorted = dedupe(all).sort((a,b) => new Date(b.publishedAt)-new Date(a.publishedAt));
      if (!sorted.length) throw new Error("No articles found. Check your connection.");
      cacheRef.current[cat] = sorted;
      setArticles(sorted);
      setLastUpdated(new Date());
    } catch(e) { setError(e.message); }
    finally    { setLoading(false); }
  }, []);

  useEffect(() => { loadNews(activeCategory); }, [activeCategory, loadNews]);

  const filtered = activeCategory === "saved" ? bookmarks
    : search.trim()
      ? articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.source.toLowerCase().includes(search.toLowerCase()))
      : articles;

  const featured       = activeCategory !== "saved" ? filtered[0] : null;
  const rest           = activeCategory !== "saved" ? filtered.slice(1) : filtered;
  const breakingArticle= articles[0] || null;

  return (
    <div style={{ minHeight:"100vh", background:th.bg, color:th.text, fontFamily:"'Lora',serif", transition:"background 0.3s, color 0.3s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{overflow-x:hidden}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${th.scrollThumb};border-radius:10px}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
        @keyframes popIn{from{opacity:0;transform:translate(-50%,-50%) scale(0.94)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
        @keyframes popUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes loadBar{0%{width:0%;margin-left:0}50%{width:60%;margin-left:20%}100%{width:0%;margin-left:100%}}
        @keyframes ping{0%{transform:scale(1);opacity:0.8}100%{transform:scale(2.2);opacity:0}}
        input{outline:none}
        input::placeholder{color:${th.textMuted}}
        input:focus{border-color:${th.accentBord} !important}
        .news-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1rem}
        .featured-card{grid-column:span 2}
        @media(max-width:520px){
          .news-grid{grid-template-columns:1fr}
          .featured-card{grid-column:span 1}
        }
        @media(max-width:420px){
          .cat-label{display:none}
          .toggle-label{display:none !important}
          .hide-sm{display:none !important}
        }
        @media(min-width:421px){.toggle-label{display:inline !important}}
      `}</style>

      {/* ── HEADER ── */}
      <header style={{ borderBottom:`1px solid ${th.border}`, position:"sticky", top:0, zIndex:50, background:th.bgHeader, backdropFilter:"blur(20px)", transition:"background 0.3s" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 1rem", display:"flex", justifyContent:"space-between", alignItems:"center", height:56, gap:"0.75rem" }}>
          {/* wordmark */}
          <div style={{ display:"flex", alignItems:"baseline", gap:"0.08rem", flexShrink:0 }}>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.1rem,3vw,1.55rem)", fontWeight:800, color:th.textHead, letterSpacing:"-0.03em" }}>The</span>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.1rem,3vw,1.55rem)", fontWeight:800, color:th.accent, letterSpacing:"-0.03em" }}>Brief</span>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.44rem", color:th.textMuted, letterSpacing:"0.2em", marginLeft:"0.35rem", textTransform:"uppercase" }}>Live</span>
          </div>
          {/* search */}
          <div style={{ flex:1, maxWidth:260, position:"relative", display:"flex", alignItems:"center" }}>
            <span style={{ position:"absolute", left:10, color:th.textMuted, fontSize:"0.85rem", pointerEvents:"none" }}>⌕</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{ width:"100%", background:th.bgInput, border:`1px solid ${th.border}`, borderRadius:5, padding:"0.4rem 0.7rem 0.4rem 1.9rem", color:th.text, fontSize:"0.75rem", fontFamily:"'DM Mono',monospace", transition:"border-color 0.2s" }} />
          </div>
          {/* right controls */}
          <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", flexShrink:0 }}>
            <WeatherWidget weather={weather} th={th} />
            {lastUpdated && <div className="hide-sm" style={{ color:th.textFaint, fontSize:"0.52rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em", textAlign:"right", lineHeight:1.5 }}><span style={{ display:"block" }}>UPDATED</span>{lastUpdated.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div>}
            <ThemeToggle night={night} onToggle={toggleTheme} th={th} />
          </div>
        </div>

        {/* ── BREAKING NEWS BANNER ── */}
        {activeCategory === "top" && breakingArticle && (
          <BreakingBanner article={breakingArticle} onClick={setSelectedArticle} th={th} />
        )}

        {/* tabs */}
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 1rem", display:"flex", gap:0, overflowX:"auto", borderTop:`1px solid ${th.borderTab}`, scrollbarWidth:"none" }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setSearch(""); }} style={{ background:"transparent", border:"none", borderBottom:`2px solid ${activeCategory===cat.id?th.accent:"transparent"}`, color:activeCategory===cat.id?th.accent:th.textMuted, padding:"0.65rem 0.8rem", cursor:"pointer", fontFamily:"'DM Mono',monospace", fontSize:"0.6rem", letterSpacing:"0.12em", textTransform:"uppercase", display:"flex", alignItems:"center", gap:"0.35rem", whiteSpace:"nowrap", transition:"color 0.2s, border-color 0.2s", flexShrink:0 }}>
              <span style={{ fontSize:"0.72rem" }}>{cat.icon}</span>
              <span className="cat-label">{cat.label}</span>
              {cat.id === "saved" && bookmarks.length > 0 && <span style={{ background:th.accent, color:night?"#080809":"#fff", fontSize:"0.5rem", fontFamily:"'DM Mono',monospace", borderRadius:10, padding:"1px 5px", lineHeight:1.4 }}>{bookmarks.length}</span>}
            </button>
          ))}
          {activeCategory !== "saved" && (
            <button onClick={() => { delete cacheRef.current[activeCategory]; loadNews(activeCategory); }} title="Refresh" style={{ marginLeft:"auto", background:"transparent", border:"none", color:th.textFaint, cursor:"pointer", padding:"0.65rem 0.8rem", fontSize:"0.75rem", fontFamily:"'DM Mono',monospace", display:"flex", alignItems:"center", gap:"0.35rem", transition:"color 0.2s", whiteSpace:"nowrap", flexShrink:0 }} onMouseEnter={e=>e.currentTarget.style.color=th.accent} onMouseLeave={e=>e.currentTarget.style.color=th.textFaint}>
              ↺ <span className="cat-label" style={{ fontSize:"0.55rem", letterSpacing:"0.12em" }}>REFRESH</span>
            </button>
          )}
        </div>
      </header>

      {/* ── MAIN ── */}
      <main style={{ maxWidth:1200, margin:"0 auto", padding:"1.5rem 1rem 7rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem", paddingBottom:"0.7rem", borderBottom:`1px solid ${th.borderSub}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
            <span style={{ color:th.accent, fontSize:"0.85rem" }}>{CATEGORIES.find(c=>c.id===activeCategory)?.icon}</span>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(0.9rem,2vw,1.05rem)", fontWeight:700, color:th.textHead, letterSpacing:"-0.01em" }}>{CATEGORIES.find(c=>c.id===activeCategory)?.label}</h1>
            {activeCategory !== "saved" && !loading && filtered.length>0 && <span style={{ color:th.textFaint, fontSize:"0.55rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.12em" }}>{filtered.length} STORIES</span>}
          </div>
          {search && <button onClick={()=>setSearch("")} style={{ background:"transparent", border:`1px solid ${th.border}`, color:th.textMuted, cursor:"pointer", padding:"3px 9px", borderRadius:3, fontSize:"0.6rem", fontFamily:"'DM Mono',monospace" }}>CLEAR ✕</button>}
        </div>

        {/* Saved view */}
        {activeCategory === "saved" && <SavedView bookmarks={bookmarks} onClick={setSelectedArticle} onBookmark={toggleBookmark} th={th} />}

        {/* Error */}
        {activeCategory !== "saved" && error && (
          <div style={{ background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.18)", borderRadius:5, padding:"2rem", textAlign:"center" }}>
            <p style={{ color:"#f87171", fontFamily:"'DM Mono',monospace", fontSize:"0.75rem", letterSpacing:"0.08em", marginBottom:"1rem" }}>⚠ {error}</p>
            <button onClick={()=>{ delete cacheRef.current[activeCategory]; loadNews(activeCategory); }} style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", color:"#f87171", cursor:"pointer", padding:"6px 16px", borderRadius:3, fontFamily:"'DM Mono',monospace", fontSize:"0.66rem", letterSpacing:"0.1em" }}>↺ RETRY</button>
          </div>
        )}

        {/* Skeletons */}
        {activeCategory !== "saved" && loading && !error && (
          <div className="news-grid">
            <div className="featured-card"><SkeletonCard featured th={th} /></div>
            {[1,2,3,4].map(i=><SkeletonCard key={i} th={th} />)}
          </div>
        )}

        {/* No search results */}
        {activeCategory !== "saved" && !loading && !error && filtered.length===0 && search && (
          <div style={{ textAlign:"center", padding:"4rem 1rem", color:th.textFaint, fontFamily:"'DM Mono',monospace", fontSize:"0.72rem", letterSpacing:"0.12em" }}>
            NO STORIES MATCHING "{search.toUpperCase()}"
          </div>
        )}

        {/* Article grid */}
        {activeCategory !== "saved" && !loading && !error && filtered.length>0 && (
          <div className="news-grid">
            {featured && <div className="featured-card"><NewsCard article={featured} featured index={0} onClick={setSelectedArticle} th={th} bookmarks={bookmarks} onBookmark={toggleBookmark} /></div>}
            {rest.map((article,i)=><NewsCard key={article.id||i} article={article} index={i+1} onClick={setSelectedArticle} th={th} bookmarks={bookmarks} onBookmark={toggleBookmark} />)}
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:`1px solid ${th.borderSub}`, padding:"1.5rem 1rem", transition:"color 0.3s" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", flexDirection:"column", alignItems:"center", gap:"0.4rem", textAlign:"center" }}>
          <p style={{ color:th.footer, fontSize:"0.62rem", fontFamily:"'Playfair Display',serif", fontWeight:600, letterSpacing:"0.05em" }}>© {new Date().getFullYear()} Pedro Esteves. All rights reserved.</p>
          <p style={{ color:th.textFaint, fontSize:"0.52rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.14em" }}>THE BRIEF · LIVE NEWS AGGREGATOR · RSS-POWERED</p>
        </div>
      </footer>

      {/* ── FLOATING CONTACT BUTTON ── */}
      <button onClick={() => setShowContact(c=>!c)} title="Contact Pedro Esteves" style={{ position:"fixed", bottom:"1.5rem", right:"1.5rem", background:th.accent, border:"none", borderRadius:"50%", width:48, height:48, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", zIndex:90, boxShadow:"0 4px 20px rgba(0,0,0,0.3)", fontSize:"1.1rem", transition:"transform 0.2s, box-shadow 0.2s" }} onMouseEnter={e=>{ e.currentTarget.style.transform="scale(1.1)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(0,0,0,0.4)"; }} onMouseLeave={e=>{ e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.3)"; }}>✉</button>

      {showContact     && <ContactPopup onClose={() => setShowContact(false)} th={th} />}
      {selectedArticle && <ReaderPanel article={selectedArticle} onClose={()=>setSelectedArticle(null)} th={th} bookmarks={bookmarks} onBookmark={toggleBookmark} />}
    </div>
  );
}
