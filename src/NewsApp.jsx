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
  europe:   ["https://feeds.bbci.co.uk/news/world/europe/rss.xml","https://rss.dw.com/xml/rss-en-eu","https://feeds.thelocal.com/rss/es","https://feeds.thelocal.com/rss/fr","https://feeds.thelocal.com/rss/it","https://feeds.bbci.co.uk/news/uk/rss.xml","https://www.theguardian.com/uk/rss"],
  americas: ["https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml","https://rss.nytimes.com/services/xml/rss/nyt/US.xml","https://feeds.bbci.co.uk/news/world/latin_america/rss.xml","https://en.mercopress.com/rss","https://en.mercopress.com/rss/brazil","https://en.mercopress.com/rss/argentina","https://latinamericanpost.com/feed"],
  // Asia — BBC Asia + SCMP + The Diplomat + Channel NewsAsia + Japan Times + India
  asia:     ["https://feeds.bbci.co.uk/news/world/asia/rss.xml","https://www.scmp.com/rss/91/feed","https://thediplomat.com/feed","https://feeds.bbci.co.uk/news/world/asia/china/rss.xml","https://feeds.bbci.co.uk/news/world/asia/india/rss.xml","https://feeds.bbci.co.uk/news/world/asia/pacific/rss.xml","https://ecns.cn/rss/rss.xml","https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=19832390","https://www.japantimes.co.jp/feed/","https://www3.nhk.or.jp/rss/news/cat0.xml","https://www.koreatimes.co.kr/www/rss/rss.xml","https://koreajoongangdaily.joins.com/feeds/all.xml", "https://www.channelnewsasia.com/rssfeeds/8395986",],
  // Middle East — BBC + Al Jazeera + DW
  mideast:  ["https://feeds.bbci.co.uk/news/world/middle_east/rss.xml","https://www.aljazeera.com/xml/rss/all.xml","https://rss.dw.com/xml/rss-en-me"],
  tech:     ["https://techcrunch.com/feed/","https://www.wired.com/feed/rss","https://feeds.arstechnica.com/arstechnica/index","https://www.theverge.com/rss/tech/index.xml","https://www.engadget.com/rss.xml","https://www.theguardian.com/us/technology/rss","https://www.reutersagency.com/feed/?best-topics=tech&post_type=best","https://www.tomshardware.com/feeds/all"],
  business: ["https://feeds.bbci.co.uk/news/business/rss.xml","https://rss.nytimes.com/services/xml/rss/nyt/Business.xml","https://feeds.skynews.com/feeds/rss/business.xml","https://www.cnbc.com/id/10001147/device/rss/rss.html","https://feeds.marketwatch.com/marketwatch/topstories/","https://www.ft.com/rss/home","https://www.economist.com/business/rss.xml","https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best","https://www.forbes.com/business/feed/","https://www.investing.com/rss/news_25.rss"],
  science:  ["https://feeds.bbci.co.uk/news/science_and_environment/rss.xml","https://rss.nytimes.com/services/xml/rss/nyt/Science.xml","https://www.theguardian.com/science/rss","https://feeds.feedburner.com/sciencealert-latestnews","https://www.sciencedaily.com/rss/top.xml","https://phys.org/rss-feed/","https://www.zmescience.com/feed/","https://sci.news/feed/"],

  sports:   ["https://feeds.bbci.co.uk/sport/rss.xml","https://www.theguardian.com/sport/rss","https://feeds.bbci.co.uk/sport/football/rss.xml","https://soccernews.com/feed","https://worldsoccer.com/feed","https://www.skysports.com/rss/12040","https://www.goal.com/feeds/en/news"],


  cars:     ["https://www.motor1.com/rss/news/all/","https://www.autocar.co.uk/rss","https://electrek.co/feed/","https://www.topgear.com/car-news/rss","https://www.racefans.net/feed/","https://www.autosport.com/rss/f1/news/"],
  motos:    ["https://www.motorcycledaily.com/feed","https://www.rideapart.com/rss/articles/all","https://www.webbikeworld.com/feed","https://www.racefans.net/feed/","https://www.autosport.com/rss/motogp/news/","https://www.motorsport.com/rss/motogp/news/"],


  stocks:   ["https://feeds.marketwatch.com/marketwatch/topstories/","https://www.investing.com/rss/news_25.rss","https://www.cnbc.com/id/100003114/device/rss/rss.html","https://www.cnbc.com/id/15839069/device/rss/rss.html","https://feeds.bbci.co.uk/news/business/rss.xml"],


  crypto:   ["https://www.coindesk.com/arc/outboundfeeds/rss/?outputType=xml","https://cointelegraph.com/rss","https://decrypt.co/feed","https://crypto.news/feed","https://news.bitcoin.com/feed"],
};

// ─── CATEGORY KEYWORD FILTERS ────────────────────────────────────────────────
// Each category has REQUIRED keywords — if a title/source matches none, the
// article is rejected. This stops off-topic articles leaking between sections.
// Keep lists broad — we only want to block obvious mismatches like war news
// appearing in Motorcycles.
const CATEGORY_FILTERS = {
  cars: {
    require: [
      "car","cars","auto","automotive","vehicle","vehicles","suv","sedan","coupe","hatchback",
      "ev","electric vehicle","electric car","hybrid","tesla","bmw","mercedes","audi","ford",
      "toyota","honda","volkswagen","vw","hyundai","kia","porsche","ferrari","mclaren",
      "lamborghini","rivian","lucid","recall","truck","pickup","van","minivan","concept",
      "supercar","hypercar","road test","review","launch","debut","autocar","top gear",
      "motor1","car and driver","driving","dealer","dealership","autonomous","self-driving",
      "formula 1","formula one","f1","grand prix","gp","fia","verstappen","hamilton",
      "leclerc","norris","russell","sainz","piastri","red bull","mercedes-amg","ferrari f1",
      "mclaren f1","qualifying","pole position","paddock","constructor","constructors championship"
    ],
  },
  tech: {
    require: [
      "tech","technology","ai","artificial intelligence","software","hardware","app","apps",
      "startup","startups","device","devices","gadget","gadgets","apple","google","microsoft",
      "meta","amazon","tesla","openai","chip","chips","semiconductor","cpu","gpu","android",
      "iphone","windows","mac","robot","robotics","cybersecurity","privacy","internet","cloud"
    ],
  },
  motos: {
    require: [
      "motorcycle","motorcycles","moto","motorbike","bike","biker","rider","riding",
      "harley","kawasaki","yamaha","suzuki","ducati","triumph","ktm","aprilia",
      "royal enfield","scooter","moped","superbike","enduro","motocross","scrambler",
      "cruiser","touring bike","helmet","handlebar","exhaust","throttle","rpm","wheelie",
      "motogp","moto2","moto3","motoe","grand prix","gp","paddock","qualifying",
      "ducati lenovo","pramac","vr46","gresini","repsol honda","yamaha factory",
      "marquez","bagnaia","martin","acosta","binder","bastianini","bezzecchi",
      "aleix espargaro","vinales","zarco","quartararo"
    ],
  },
  sports: {
    require: ["sport","sports","football","soccer","basketball","tennis","golf","rugby",
              "cricket","baseball","hockey","athletics","olympic","f1","formula 1","nba",
              "nfl","premier league","champions league","la liga","serie a","bundesliga",
              "ligue 1","world cup","transfer","player","team","match","game","tournament",
              "championship","league","goal","score","win","defeat","injury","club","squad",
              "stadium","manager","coach","fixture","fixture","standings","table","cup",
              "ufc","mma","boxing","swimming","cycling","marathon","race","athlete"],
  },
  crypto: {
    require: [
      "bitcoin","btc","ethereum","eth","crypto","cryptocurrency","blockchain","defi","nft",
      "web3","altcoin","altcoins","binance","coinbase","solana","ripple","xrp","dogecoin",
      "doge","stablecoin","usdt","usdc","mining","wallet","token","tokens","exchange",
      "trading","bull","bear","halving","satoshi","dao","coindesk","cointelegraph","decrypt"
    ],
  },
  business: {
    require: [
      "business","company","companies","corporate","startup","startups",
      "market","markets","economy","economic","finance","financial",
      "bank","banking","stock","stocks","shares","invest","investor",
      "revenue","profit","earnings","ipo","ceo","merger","acquisition",
      "inflation","interest rate","fed","central bank","gdp"
    ],
  },
  stocks: {
    require: [
      "stock","stocks","share","shares","market","markets","nasdaq","dow","dow jones","s&p",
      "s&p 500","sp500","nyse","wall street","invest","investor","trading","trade","index",
      "indices","etf","fund","funds","portfolio","earnings","revenue","profit","ipo","dividend",
      "bond","yield","fed","federal reserve","interest rate","inflation","gdp","economy",
      "economic","financial","finance","bank","banking","equity","commodities","oil","gold",
      "forex","currency","marketwatch","cnbc","investing"
    ],
  },
  science: {
    // Science headlines are naturally varied — "mushroom", "petroglyph", "drought" are
    // all valid science but won't contain the word "science".
    // Strategy: block only clearly non-science content (politics, war, crime, sport, finance).
    // Everything from dedicated science sources passes automatically via source name check.
    require: [
      // Direct science vocabulary
      "science","scientific","scientist","scientists","research","researchers","study","studies",
      "discovery","discoveries","experiment","laboratory","lab","journal","findings","finding",
      // Life sciences
      "biology","gene","genes","genetic","dna","rna","protein","cell","cells","bacteria","virus",
      "vaccine","medical","medicine","health","disease","cancer","brain","neuroscience","evolution",
      "species","fossil","dinosaur","animal","animals","wildlife","plant","plants","fungus","fungi",
      "mushroom","insect","bird","fish","shark","whale","bear","polar bear","wolf","dolphin","coral","reef","migration","ecosystem","biodiversity","extinction","endangered",
      // Earth & environment
      "climate","environment","ecology","ocean","sea","glacier","ice","flood","flooding","drought",
      "earthquake","volcano","tsunami","weather","atmosphere","stratosphere","groundwater","fossil fuel",
      "net zero","carbon","emissions","renewable","solar energy","wind power","pollution","wildfire",
      // Physics & chemistry & maths
      "physics","quantum","particle","atom","molecule","chemistry","chemical","element","energy",
      "nuclear","fusion","gravity","relativity","mathematics","theorem","equation","wavelength",
      // Space & astronomy
      "space","nasa","esa","asteroid","comet","planet","solar system","galaxy","universe","cosmos",
      "telescope","rocket","orbit","mars","moon","astronaut","black hole","supernova","exoplanet",
      "satellite","james webb","hubble","spacex","starship","astronomer","astronomers","cosmic",
      // Technology & computing (science-facing only)
      "machine learning","neural network","quantum computing","artificial intelligence","robotics",
      // Archaeology & anthropology
      "ancient","fossil","archaeological","archaeology","anthropology","prehistoric","petroglyph",
      "cave painting","human evolution","homo sapiens","neanderthal","artifact","excavation",
      // Medicine & neuroscience
      "drug","drugs","treatment","therapy","trial","clinical","surgery","vaccine","pandemic",
      "depression","alzheimer","dementia","obesity","diabetes","mental health","hormone","genome",
      // Physics curiosities & general science topics (catches SciShow-style headlines)
      "perpetual motion","temperature","radiation","magnetic","force","friction","pressure",
      "speed of light","dna test","mutation","microbe","microbes","microbiome","enzyme","toxin",
      // Source names — articles from these sources are always science
      "sciencedaily","sciencealert","phys.org","livescience","newscientist","zmescience",
      "sci.news","new scientist","physics world","scientific american","nature.com",
      "guardian science","bbc science","nyt science","eos.org","nautil"
    ],
  },
};

// Returns true if the article passes the category filter (should be shown)
function passesFilter(article, category) {
  const filter = CATEGORY_FILTERS[category];
  if (!filter) return true; // no filter for this category — show everything
  const text = ((article.title || "") + " " + (article.description || "") + " " + (article.source || "")).toLowerCase();
  return filter.require.some(kw => text.includes(kw));
}

// ─── YOUTUBE SOURCES ──────────────────────────────────────────────────────────
const YT = id => id;
const YOUTUBE_SOURCES = {
  live:     [YT("UCnUYZLuoy1rq1aVMwx4aTzw"),YT("UCNye-wNBqNL5ZzHSJj3l8Bg"),YT("UCknLrEdhRCp1aegoMqRaCZg"),YT("UCBi2mrWuNuyYy4gbM6vU7mQ"),YT("UCupvZG-5ko_eiXAupbDfxWw")],
  top:      [YT("UCnUYZLuoy1rq1aVMwx4aTzw"),YT("UCNye-wNBqNL5ZzHSJj3l8Bg")],
  world:    [YT("UCNye-wNBqNL5ZzHSJj3l8Bg"),YT("UCknLrEdhRCp1aegoMqRaCZg")],
  europe:   [YT("UCknLrEdhRCp1aegoMqRaCZg")],
  asia:     [YT("UCNye-wNBqNL5ZzHSJj3l8Bg")],
  americas: [YT("UCnUYZLuoy1rq1aVMwx4aTzw")],
  mideast:  [YT("UCNye-wNBqNL5ZzHSJj3l8Bg")],
  tech:     [YT("UCBJycsmduvYEL83R_U4JriQ"),YT("UCXuqSBlHAE6Xw-yeJA0Tunw")],
  business: [YT("UCrGyqELkKkXKggRphOTv0Tg"),YT("UCvJJ_dzjViJCoLf5uKUTwoA")],
  science:  [YT("UCZYTClx2T1of7BRZ86-8fow"),YT("UC7DdEm33SyaTDtWYGO2CwdA")],
  sports:   [YT("UCqZQlzSHbVJrwrn5XvzrzcA"),YT("UC1QLLgrGrpTqpad0zJB4Tsg")],
  cars:     [YT("UCjOl2AUblVmg2rA_cRgZkFg"),YT("UCUhFaUpnq31m6TNX2VKVSVA"),YT("UCP3zorCFfVFSGIPUFJziFqA"),YT("UCtze5KM-rMmzBP0HlMN0iKw")],
  motos:    [YT("UCB_cdRhIDhlavY2I5URSC7g"),YT("UCMkMkYwBjSxAaxEBdQBxl5Q"),YT("UCpfBFKpvBpbv7OEzCi8YVWQ"),YT("UC_CjHSEYBFGcuL9Sj-AhVIg")],
  stocks:   [YT("UCvJJ_dzjViJCoLf5uKUTwoA"),YT("UCrGyqELkKkXKggRphOTv0Tg")],
  crypto:   [YT("UCCatR7nWbYrkVXdxXb4cGXw"),YT("UCYP7pHJAN4pOHb62F2p3eRQ")],
};

// ─── WORLD SUB-REGIONS ────────────────────────────────────────────────────────
const WORLD_REGIONS = [
  { id:"world",    label:"🌐 All World",    short:"All" },
  { id:"europe",   label:"🇪🇺 Europe",      short:"EU" },
  { id:"asia",     label:"🌏 Asia",         short:"Asia" },
  { id:"americas", label:"🌎 Americas",     short:"Amer" },
  { id:"mideast",  label:"🕌 Middle East",  short:"ME" },
];

const CATEGORIES = [
  { id:"top",      label:"Top",          short:"Top",   icon:"◈" },
  { id:"world",    label:"World",        short:"World", icon:"◎", hasDropdown:true },
  { id:"tech",     label:"Tech",         short:"Tech",  icon:"⟡" },
  { id:"business", label:"Business",     short:"Biz",   icon:"◇" },
  { id:"science",  label:"Science",      short:"Sci",   icon:"⬡" },
  { id:"sports",   label:"Sports",       short:"Sport", icon:"◉" },
  { id:"cars",     label:"Cars",         short:"Cars",  icon:"▷" },
  { id:"motos",    label:"Motorcycles",  short:"Motos",   icon:"◍" },
  { id:"stocks",   label:"Stocks",       short:"Stocks",  icon:"📈" },
  { id:"crypto",   label:"Crypto",       short:"Crypto",  icon:"₿" },
  { id:"live",     label:"Live Video",   short:"Live",    icon:"▶" },
  { id:"saved",    label:"Saved",        short:"Saved",   icon:"◆" },
];

const RSS2JSON     = "https://api.rss2json.com/v1/api.json?rss_url=";
const CONTACT_EMAIL = "pedro.esteves.pt@proton.me";

// ─── POLITICAL BIAS LOOKUP ────────────────────────────────────────────────────
const BIAS = {
  "BBC News":{ rating:"C",label:"Centre" },"BBC News - Home":{ rating:"C",label:"Centre" },
  "BBC News - World":{ rating:"C",label:"Centre" },"BBC News - Europe":{ rating:"C",label:"Centre" },
  "BBC News - Science & Environment":{ rating:"C",label:"Centre" },"BBC News - Business":{ rating:"C",label:"Centre" },
  "BBC Sport - Sport":{ rating:"C",label:"Centre" },"Reuters":{ rating:"C",label:"Centre" },
  "NYT > HomePage":{ rating:"LC",label:"Lean Left" },"NYT > Science":{ rating:"LC",label:"Lean Left" },
  "NYT > Sports":{ rating:"LC",label:"Lean Left" },"NYT > Business":{ rating:"LC",label:"Lean Left" },
  "New York Times":{ rating:"LC",label:"Lean Left" },
  "The Latest News from the UK and Around the World | Sky News":{ rating:"RC",label:"Lean Right" },
  "Sky News":{ rating:"RC",label:"Lean Right" },"Al Jazeera English":{ rating:"LC",label:"Lean Left" },
  "TechCrunch":{ rating:"LC",label:"Lean Left" },"Wired":{ rating:"LC",label:"Lean Left" },
  "Ars Technica":{ rating:"C",label:"Centre" },"New Scientist":{ rating:"C",label:"Centre" },
  "Euronews":{ rating:"C",label:"Centre" },"DW":{ rating:"C",label:"Centre" },
  "NPR":{ rating:"LC",label:"Lean Left" },"South China Morning Post":{ rating:"RC",label:"Lean Right" },
  "The Guardian":{ rating:"LC",label:"Lean Left" },"The Local":{ rating:"C",label:"Centre" },
  "MercoPress":{ rating:"C",label:"Centre" },"Latin American Post":{ rating:"C",label:"Centre" },
  "BBC News - UK":{ rating:"C",label:"Centre" },"BBC News - Latin America":{ rating:"C",label:"Centre" },
  "CoinTelegraph":{ rating:"C",label:"Centre" },"CoinDesk":{ rating:"C",label:"Centre" },
  "Decrypt":{ rating:"C",label:"Centre" },"Bitcoin Magazine":{ rating:"C",label:"Centre" },
  "MarketWatch":{ rating:"C",label:"Centre" },"Investing.com":{ rating:"C",label:"Centre" },
  "CNBC":{ rating:"RC",label:"Lean Right" },"Motor1":{ rating:"C",label:"Centre" },
  "Autoblog":{ rating:"C",label:"Centre" },"CarBuzz":{ rating:"C",label:"Centre" },
  "Electrek":{ rating:"LC",label:"Lean Left" },"ESPN":{ rating:"C",label:"Centre" },
  "Yahoo Sports":{ rating:"C",label:"Centre" },"Bleacher Report":{ rating:"C",label:"Centre" },
  "The Diplomat":{ rating:"C",label:"Centre" },"SCMP":{ rating:"RC",label:"Lean Right" },
  "Autocar":{ rating:"C",label:"Centre" },"Top Gear":{ rating:"C",label:"Centre" },
  "Car and Driver":{ rating:"C",label:"Centre" },"Motorcycle Daily":{ rating:"C",label:"Centre" },
  "RideApart":{ rating:"C",label:"Centre" },"webBikeWorld":{ rating:"C",label:"Centre" },
};
const BIAS_STYLE = {
  L: { color:"#3b82f6",bg:"rgba(59,130,246,0.12)",label:"Left" },
  LC:{ color:"#60a5fa",bg:"rgba(96,165,250,0.12)",label:"Lean Left" },
  C: { color:"#9ca3af",bg:"rgba(156,163,175,0.12)",label:"Centre" },
  RC:{ color:"#f87171",bg:"rgba(248,113,113,0.12)",label:"Lean Right" },
  R: { color:"#ef4444",bg:"rgba(239,68,68,0.12)",label:"Right" },
};
function getBias(source) {
  if (!source) return null;
  if (BIAS[source]) return BIAS[source];
  const key = Object.keys(BIAS).find(k => source.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(source.toLowerCase()));
  return key ? BIAS[key] : null;
}


// ─── COUNTRY FLAG DETECTION ───────────────────────────────────────────────────
// Detects the country a story is about from title + source keywords
// Returns a flag emoji or null if unknown
const COUNTRY_KEYWORDS = [
  // Major powers
  { flag:"🇺🇸", words:["us","usa","america","american","washington","trump","biden","congress","pentagon","white house","silicon valley","wall street","california","new york","texas","florida"] },
  { flag:"🇬🇧", words:["uk","britain","british","england","english","london","scotland","wales","downing street","parliament","bbc","guardian","sterling"] },
  { flag:"🇨🇳", words:["china","chinese","beijing","shanghai","xi jinping","ccp","hong kong","taiwan strait","yuan","tiananmen"] },
  { flag:"🇷🇺", words:["russia","russian","moscow","kremlin","putin","ukraine war","soviet"] },
  { flag:"🇩🇪", words:["germany","german","berlin","bundesbank","merkel","scholz","bundesliga"] },
  { flag:"🇫🇷", words:["france","french","paris","macron","élysée","euro 2","marseille","lyon"] },
  { flag:"🇮🇳", words:["india","indian","modi","delhi","mumbai","bangalore","rupee","hindustan"] },
  { flag:"🇯🇵", words:["japan","japanese","tokyo","osaka","yen","nikkei","prime minister kishida","samurai"] },
  { flag:"🇰🇷", words:["south korea","korean","seoul","samsung","hyundai","k-pop","kpop"] },
  { flag:"🇧🇷", words:["brazil","brazilian","são paulo","rio","lula","brasília","amazon","petrobras","copa"] },
  { flag:"🇦🇷", words:["argentina","argentinian","buenos aires","milei","pampas","peso"] },
  { flag:"🇲🇽", words:["mexico","mexican","ciudad de mexico","sheinbaum","pemex","tijuana"] },
  { flag:"🇦🇺", words:["australia","australian","sydney","melbourne","canberra","albanese","asx"] },
  { flag:"🇮🇱", words:["israel","israeli","tel aviv","netanyahu","idf","jerusalem","knesset","mossad"] },
  { flag:"🇵🇸", words:["gaza","hamas","palestin","west bank","ramallah","intifada"] },
  { flag:"🇮🇷", words:["iran","iranian","tehran","ayatollah","khamenei","irgc","strait of hormuz"] },
  { flag:"🇹🇷", words:["turkey","turkish","ankara","istanbul","erdogan","lira","bosphorus"] },
  { flag:"🇺🇦", words:["ukraine","ukrainian","kyiv","zelensky","zelenskyy","kharkiv","mariupol","donbas"] },
  { flag:"🇸🇦", words:["saudi arabia","saudi","riyadh","mbs","aramco","neom","opec"] },
  { flag:"🇵🇰", words:["pakistan","pakistani","islamabad","karachi","imran khan","lahore"] },
  { flag:"🇰🇵", words:["north korea","kim jong","pyongyang","dprk"] },
  { flag:"🇹🇼", words:["taiwan","taiwanese","taipei","tsai","foxconn","tsmc"] },
  { flag:"🇸🇬", words:["singapore","singaporean","strait of malacca"] },
  { flag:"🇿🇦", words:["south africa","south african","johannesburg","cape town","anc","rand"] },
  { flag:"🇪🇸", words:["spain","spanish","madrid","barcelona","sanchez","ibex","catalonia"] },
  { flag:"🇮🇹", words:["italy","italian","rome","milan","meloni","montecitorio","serie a"] },
  { flag:"🇵🇹", words:["portugal","portuguese","lisbon","porto","pedro nuno","tap","benfica"] },
  { flag:"🇨🇦", words:["canada","canadian","ottawa","trudeau","toronto","vancouver","alberta"] },
  { flag:"🇪🇺", words:["european union","eu summit","euro zone","eurozone","brussels","ecb","von der leyen"] },
  { flag:"🇻🇪", words:["venezuela","venezuelan","maduro","caracas","pdvsa","bolivar"] },
  { flag:"🇨🇴", words:["colombia","colombian","bogotá","petro","medellin","farc"] },
  { flag:"🇨🇱", words:["chile","chilean","santiago","boric","lithium"] },
  { flag:"🇵🇪", words:["peru","peruvian","lima","boluarte"] },
  { flag:"🇳🇬", words:["nigeria","nigerian","lagos","abuja","tinubu","naira"] },
  { flag:"🇪🇬", words:["egypt","egyptian","cairo","sisi","suez"] },
  { flag:"🇰🇪", words:["kenya","kenyan","nairobi","ruto"] },
  { flag:"🇦🇫", words:["afghanistan","afghan","kabul","taliban"] },
  { flag:"🇮🇩", words:["indonesia","indonesian","jakarta","jokowi","prabowo","rupiah"] },
  { flag:"🇵🇭", words:["philippines","philippine","manila","marcos"] },
  { flag:"🇻🇳", words:["vietnam","vietnamese","hanoi","ho chi minh"] },
  { flag:"🇲🇾", words:["malaysia","malaysian","kuala lumpur","anwar ibrahim"] },
  { flag:"🇧🇩", words:["bangladesh","bangladeshi","dhaka","hasina"] },
  { flag:"🇳🇵", words:["nepal","nepalese","kathmandu","himalaya"] },
  { flag:"🇸🇾", words:["syria","syrian","damascus","assad"] },
  { flag:"🇱🇧", words:["lebanon","lebanese","beirut","hezbollah"] },
  { flag:"🇮🇶", words:["iraq","iraqi","baghdad","kurdistan"] },
  { flag:"🇾🇪", words:["yemen","yemeni","houthi","sanaa","aden"] },
  { flag:"🇳🇴", words:["norway","norwegian","oslo","equinor"] },
  { flag:"🇸🇪", words:["sweden","swedish","stockholm","nato sweden"] },
  { flag:"🇵🇱", words:["poland","polish","warsaw","tusk"] },
  { flag:"🇨🇿", words:["czech","prague","fiala"] },
  { flag:"🇭🇺", words:["hungary","hungarian","budapest","orban","orbán"] },
  { flag:"🇬🇷", words:["greece","greek","athens","mitsotakis"] },
  { flag:"🇮🇪", words:["ireland","irish","dublin","taoiseach"] },
  { flag:"🇳🇿", words:["new zealand","new zealander","wellington","auckland","luxon"] },
];

function detectCountryFlag(title, source) {
  const text = (title + " " + (source||"")).toLowerCase();
  for (const { flag, words } of COUNTRY_KEYWORDS) {
    if (words.some(w => text.includes(w))) return flag;
  }
  return null;
}

// ─── WEATHER CODES ────────────────────────────────────────────────────────────
const WX = {
  0:{icon:"☀️"},1:{icon:"🌤"},2:{icon:"⛅"},3:{icon:"☁️"},45:{icon:"🌫"},48:{icon:"🌫"},
  51:{icon:"🌦"},53:{icon:"🌦"},55:{icon:"🌧"},61:{icon:"🌧"},63:{icon:"🌧"},65:{icon:"🌧"},
  71:{icon:"🌨"},73:{icon:"🌨"},75:{icon:"❄️"},80:{icon:"🌦"},81:{icon:"🌧"},82:{icon:"⛈"},
  95:{icon:"⛈"},96:{icon:"⛈"},99:{icon:"⛈"},
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
async function fetchFeed(url) {
  try {
    const res = await fetch(`${RSS2JSON}${encodeURIComponent(url)}&count=10`);
    if (!res.ok) { console.warn(`[RSS] HTTP ${res.status} for ${url}`); return []; }
    const data = await res.json();
    if (data.status !== "ok") { console.warn(`[RSS] status="${data.status}" for ${url}`); return []; }
    const items = data.items || [];
    if (items.length === 0) console.warn(`[RSS] 0 items for ${url}`);
    else console.log(`[RSS] ${items.length} items from ${url}`);
    return items.map(item => ({
      id:          item.guid || item.link,
      title:       item.title || "",
      description: stripHtml(item.description || item.content || ""),
      url:         item.link || "",
      image:       item.thumbnail || item.enclosure?.link || extractImage(item.description) || null,
      source:      data.feed?.title || new URL(url).hostname.replace("www.",""),
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      type:        "article",
    }));
  } catch { return []; }
}
async function fetchYouTubeFeed(channelId) {
  try {
    const res = await fetch(`/.netlify/functions/youtube?channelId=${channelId}&count=6`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).map(item => ({
      id:          `yt-${item.videoId}`,
      title:       item.title || "",
      description: item.description || "",
      url:         item.url || `https://www.youtube.com/watch?v=${item.videoId}`,
      image:       item.thumbnail || `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`,
      source:      item.channelName || "YouTube",
      publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date(),
      type:        "video",
      videoId:     item.videoId,
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
function loadBookmarks() { try { return JSON.parse(localStorage.getItem("theBriefBookmarks") || "[]"); } catch { return []; } }
function saveBookmarks(bm) { try { localStorage.setItem("theBriefBookmarks", JSON.stringify(bm)); } catch {} }

function shareArticle(article, platform = "default") {
  const shareText = `${article.title} — via The Brief`;
  const shareUrl  = "https://thebriefnews.org";
  if (platform === "whatsapp") {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`, "_blank");
    return;
  }
  if (platform === "twitter") {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
    return;
  }
  if (navigator.share) {
    navigator.share({ title: shareText, text: shareText, url: shareUrl }).catch(() => {});
  } else {
    navigator.clipboard?.writeText(`${shareText}\n${shareUrl}`).catch(() => {});
  }
}

// ─── TRENDING TOPICS ──────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with','by','from',
  'as','is','was','are','were','be','been','have','has','had','do','does','did','will',
  'would','could','should','may','might','can','it','its','this','that','these','those',
  'i','we','you','he','she','they','what','which','who','when','where','why','how',
  'all','both','each','more','most','other','some','no','not','only','same','so','than',
  'too','just','after','before','over','under','again','says','said','new','first','last',
  'two','three','one','about','into','through','your','our','their','his','her','also',
  'back','even','still','now','day','year','week','time','news','world','report','make',
  'take','come','show','know','think','look','want','give','use','find','tell','ask',
]);
function extractTrending(articles, max = 12) {
  const freq = {};
  articles.forEach(a => {
    (a.title || '').split(/\s+/).forEach(raw => {
      const w = raw.replace(/[^a-zA-Z0-9]/g,'').toLowerCase();
      if (w.length < 4 || STOP_WORDS.has(w)) return;
      const isProper = /^[A-Z]/.test(raw.replace(/[^a-zA-Z]/g,''));
      freq[w] = (freq[w] || 0) + (isProper ? 2 : 1);
    });
  });
  return Object.entries(freq)
    .filter(([,c]) => c >= 2)
    .sort((a,b) => b[1]-a[1])
    .slice(0,max)
    .map(([w]) => w.charAt(0).toUpperCase()+w.slice(1));
}

// ─── WEATHER HOOK ─────────────────────────────────────────────────────────────
function useWeather() {
  const [weather, setWeather] = useState(null);
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { latitude:lat, longitude:lon } = coords;
          const res  = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(2)}&longitude=${lon.toFixed(2)}&current=temperature_2m,weathercode&temperature_unit=celsius&timezone=auto`);
          const data = await res.json();
          const code = data.current?.weathercode ?? 0;
          const temp = Math.round(data.current?.temperature_2m ?? 0);
          const city = (data.timezone||"").split("/").pop()?.replace(/_/g," ") || "";
          setWeather({ temp, icon:(WX[code]||{icon:"🌡"}).icon, city });
        } catch {}
      }, ()=>{}, { timeout:8000 }
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

// ─── COUNTRY FLAG ────────────────────────────────────────────────────────────
function CountryFlag({ title, source }) {
  const flag = detectCountryFlag(title, source);
  if (!flag) return null;
  return (
    <span
      title="Country detected from headline"
      style={{
        fontSize:"0.8rem",
        lineHeight:1,
        flexShrink:0,
        userSelect:"none",
        filter:"drop-shadow(0 1px 1px rgba(0,0,0,0.15))",
      }}
    >
      {flag}
    </span>
  );
}

// ─── BIAS DOT ─────────────────────────────────────────────────────────────────
function BiasDot({ source }) {
  const [showTip, setShowTip] = useState(false);
  const bias = getBias(source);
  if (!bias) return null;
  const style = BIAS_STYLE[bias.rating];
  if (!style) return null;
  return (
    <div style={{ position:"relative", display:"inline-flex", alignItems:"center" }} onMouseEnter={()=>setShowTip(true)} onMouseLeave={()=>setShowTip(false)}>
      <div style={{ width:7, height:7, borderRadius:"50%", background:style.color, border:`1.5px solid ${style.color}`, opacity:0.85, cursor:"default", flexShrink:0 }} />
      {showTip && (
        <div style={{ position:"absolute", bottom:"calc(100% + 5px)", left:"50%", transform:"translateX(-50%)", background:"rgba(0,0,0,0.85)", color:"#fff", fontSize:"0.55rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.08em", padding:"4px 8px", borderRadius:4, whiteSpace:"nowrap", zIndex:10, pointerEvents:"none" }}>
          {style.label} · AllSides
          <div style={{ position:"absolute", bottom:-4, left:"50%", transform:"translateX(-50%)", width:0, height:0, borderLeft:"4px solid transparent", borderRight:"4px solid transparent", borderTop:"4px solid rgba(0,0,0,0.85)" }} />
        </div>
      )}
    </div>
  );
}

// ─── SHARE MENU ───────────────────────────────────────────────────────────────
function ShareMenu({ article, th, onClose, btnRef }) {
  const menuRef = useRef(null);

  // Position the menu fixed relative to the button — avoids all overflow clipping
  const [pos, setPos] = useState({ top:0, right:0 });
  useEffect(() => {
    if (btnRef?.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const menuH = 180; // approximate menu height
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < menuH + 16;
      setPos({
        top:   openUp ? rect.top - menuH - 6 : rect.bottom + 6,
        right: window.innerWidth - rect.right,
      });
    }
  }, [btnRef]);

  // Close on outside click
  useEffect(() => {
    const fn = e => { if (menuRef.current && !menuRef.current.contains(e.target)) onClose(); };
    setTimeout(() => window.addEventListener("mousedown", fn), 10);
    return () => window.removeEventListener("mousedown", fn);
  }, [onClose]);

  const btn = (label, icon, action) => (
    <button
      onClick={e => { e.stopPropagation(); shareArticle(article, action); onClose(); }}
      style={{ display:"flex", alignItems:"center", gap:"0.65rem", background:"transparent", border:"none", color:"inherit", cursor:"pointer", padding:"0.6rem 1rem", width:"100%", textAlign:"left", fontFamily:"'DM Mono',monospace", fontSize:"0.68rem", letterSpacing:"0.06em", transition:"background 0.15s" }}
      onMouseEnter={e=>e.currentTarget.style.background=th.accentBg}
      onMouseLeave={e=>e.currentTarget.style.background="transparent"}
    >
      <span style={{ fontSize:"1.05rem", lineHeight:1, width:20, textAlign:"center" }}>{icon}</span> {label}
    </button>
  );

  // Detect mobile — use bottom sheet style on narrow screens
  const isMobile = typeof window !== "undefined" && window.innerWidth < 520;

  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:499, animation:"fadeIn 0.2s ease" }} />
        {/* Bottom sheet */}
        <div ref={menuRef} onClick={e=>e.stopPropagation()} style={{ position:"fixed", bottom:0, left:0, right:0, background:th.bgReader, borderRadius:"16px 16px 0 0", zIndex:500, boxShadow:"0 -8px 40px rgba(0,0,0,0.35)", animation:"slideUp 0.25s cubic-bezier(0.16,1,0.3,1)", paddingBottom:"env(safe-area-inset-bottom,12px)" }}>
          {/* Handle */}
          <div style={{ display:"flex", justifyContent:"center", padding:"0.75rem 0 0.25rem" }}>
            <div style={{ width:36, height:4, borderRadius:2, background:th.border }} />
          </div>
          <div style={{ padding:"0.4rem 1.25rem 0.75rem", borderBottom:`1px solid ${th.border}` }}>
            <p style={{ color:th.textMuted, fontSize:"0.6rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em", textTransform:"uppercase", textAlign:"center" }}>Share story</p>
          </div>
          {btn("WhatsApp",  "💬", "whatsapp")}
          {btn("Post on X", "𝕏",  "twitter")}
          {btn("Copy link", "🔗", "copy")}
          {btn("More…",     "⇪",  "default")}
          <div style={{ height:"0.5rem" }} />
        </div>
      </>
    );
  }

  return (
    <div
      ref={menuRef}
      onClick={e=>e.stopPropagation()}
      style={{
        position:"fixed",
        top:pos.top,
        right:Math.max(pos.right, 8),
        background:th.bgReader,
        border:`1px solid ${th.border}`,
        borderRadius:10,
        zIndex:500,
        minWidth:190,
        maxWidth:"calc(100vw - 16px)",
        boxShadow:"0 8px 32px rgba(0,0,0,0.35)",
        overflow:"hidden",
        animation:"popUp 0.18s ease",
      }}
    >
      <div style={{ padding:"0.4rem 1rem", borderBottom:`1px solid ${th.border}` }}>
        <p style={{ color:th.textMuted, fontSize:"0.55rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em", textTransform:"uppercase" }}>Share story</p>
      </div>
      {btn("WhatsApp",  "💬", "whatsapp")}
      {btn("Post on X", "𝕏",  "twitter")}
      {btn("Copy link", "🔗", "copy")}
      {btn("More…",     "⇪",  "default")}
    </div>
  );
}

// ─── VIDEO PLAYER ─────────────────────────────────────────────────────────────
function VideoPlayer({ video, onClose, th }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const fn = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", fn); };
  }, [onClose]);
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", backdropFilter:"blur(8px)", zIndex:200, animation:"fadeIn 0.2s ease" }} />
      <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"min(900px,96vw)", zIndex:201, display:"flex", flexDirection:"column", animation:"popIn 0.3s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.75rem 0", marginBottom:"0.5rem" }}>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ color:th.accent, fontSize:"0.6rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em", marginBottom:"0.25rem" }}>{video.source}</p>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(0.9rem,2vw,1.1rem)", fontWeight:700, color:"#f8fafc", lineHeight:1.3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{video.title}</h2>
          </div>
          <div style={{ display:"flex", gap:"0.5rem", marginLeft:"1rem", flexShrink:0 }}>
            <a href={video.url} target="_blank" rel="noopener noreferrer" style={{ background:th.accentBg, border:`1px solid ${th.accentBord}`, color:th.accent, fontSize:"0.58rem", fontFamily:"'DM Mono',monospace", padding:"5px 10px", borderRadius:4, textDecoration:"none" }}>YT ↗</a>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"#fff", cursor:"pointer", fontSize:"0.9rem", padding:"5px 10px", borderRadius:4 }}>✕</button>
          </div>
        </div>
        <div style={{ position:"relative", paddingBottom:"56.25%", borderRadius:8, overflow:"hidden", background:"#000" }}>
          <iframe src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", border:"none" }} />
        </div>
      </div>
    </>
  );
}

// ─── VIDEO CARD ───────────────────────────────────────────────────────────────
function VideoCard({ video, index, onClick, th }) {
  const [hovered, setHovered] = useState(false);
  const [imgErr,  setImgErr]  = useState(false);
  return (
    <article onClick={() => onClick(video)} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} style={{ background:hovered?th.bgCardHover:th.bgCard, border:`1px solid ${hovered?th.borderHover:th.border}`, borderRadius:6, cursor:"pointer", transition:"all 0.22s ease", transform:hovered?"translateY(-2px)":"none", boxShadow:hovered?th.shadow:"none", animation:`fadeUp 0.45s ease ${index*0.055}s both`, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={{ position:"relative", paddingBottom:"56.25%", background:th.bgSkeleton1, flexShrink:0 }}>
        {video.image && !imgErr && <img src={video.image} alt="" loading="lazy" onError={()=>setImgErr(true)} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", display:"block" }} />}
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:hovered?"rgba(0,0,0,0.35)":"rgba(0,0,0,0.2)", transition:"background 0.2s" }}>
          <div style={{ width:44, height:44, borderRadius:"50%", background:hovered?th.accent:"rgba(255,255,255,0.9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem", transition:"all 0.2s", transform:hovered?"scale(1.1)":"scale(1)" }}>▶</div>
        </div>
        <div style={{ position:"absolute", bottom:8, right:8, background:"rgba(0,0,0,0.7)", borderRadius:3, padding:"2px 6px" }}>
          <span style={{ color:"#fff", fontSize:"0.55rem", fontFamily:"'DM Mono',monospace" }}>▶ VIDEO</span>
        </div>
      </div>
      <div style={{ padding:"0.9rem 1rem", display:"flex", flexDirection:"column", gap:"0.4rem", flex:1 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ color:th.accent, fontSize:"0.58rem", fontFamily:"'DM Mono',monospace", background:th.accentBg, border:`1px solid ${th.accentBord}`, padding:"2px 6px", borderRadius:3 }}>📺 {video.source}</span>
          <span style={{ color:th.textMuted, fontSize:"0.58rem", fontFamily:"'DM Mono',monospace" }}>{timeAgo(video.publishedAt)}</span>
        </div>
        <h3 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:"0.9rem", fontWeight:600, color:th.textHead, lineHeight:1.3, margin:0, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{video.title}</h3>
        <div style={{ color:hovered?th.accent:th.textMuted, fontSize:"0.62rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em", transition:"color 0.2s", marginTop:"auto" }}>WATCH VIDEO →</div>
      </div>
    </article>
  );
}

// ─── NEWS CARD ────────────────────────────────────────────────────────────────
function NewsCard({ article, featured, index, onClick, th, bookmarks, onBookmark }) {
  const [hovered,    setHovered]    = useState(false);
  const [imgErr,     setImgErr]     = useState(false);
  const [showShare,  setShowShare]  = useState(false);
  const shareBtnRef = useRef(null);
  const isBookmarked = bookmarks.some(b => b.id === article.id);
  const handleShareClick = (e) => {
    e.stopPropagation();
    if (navigator.share) { shareArticle(article, "default"); return; }
    setShowShare(s => !s);
  };
  const handleBookmark = (e) => { e.stopPropagation(); onBookmark(article); };

  return (
  <article
    onClick={() => onClick(article)}
    onMouseEnter={() => setHovered(true)}
    onMouseLeave={() => setHovered(false)}
    style={{
      background: hovered ? th.bgCardHover : th.bgCard,
      border: `1px solid ${hovered ? th.borderHover : th.border}`,
      borderRadius: 6,
      padding: featured ? "1.5rem" : "1.1rem",
      cursor: "pointer",
      transition: "all 0.22s ease",
      transform: hovered ? "translateY(-2px)" : "none",
      boxShadow: hovered ? th.shadow : "none",
      position: "relative",
      overflow: "hidden",
      minWidth: 0,
      maxWidth: "100%",
      boxSizing: "border-box",
      animation: `fadeUp 0.45s ease ${index * 0.055}s both`,
      display: "flex",
      flexDirection: "column",
      gap: featured ? "0.9rem" : "0.6rem"
    }}
  >
    {featured && (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          borderRadius: "6px 6px 0 0",
          background: `linear-gradient(90deg,${th.accent},#e8833a)`
        }}
      />
    )}

      {/* Meta row */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:"0.5rem" }}>
        <div style={{ display:"flex", gap:"0.45rem", alignItems:"center", flexWrap:"wrap" }}>
          {featured && <span style={{ background:th.accentBg, border:`1px solid ${th.accentBord}`, color:th.accent, fontSize:"0.58rem", letterSpacing:"0.14em", padding:"2px 7px", fontFamily:"'DM Mono',monospace", textTransform:"uppercase" }}>◈ FEATURED</span>}
          <span style={{ color:th.textSource, fontSize:"0.62rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.05em" }}>{article.source}</span>
          <BiasDot source={article.source} />
          <CountryFlag title={article.title} source={article.source} />
        </div>
        <span style={{ color:th.textMuted, fontSize:"0.58rem", fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap" }}>{timeAgo(article.publishedAt)}</span>
      </div>

      {/* Featured image */}
      {featured && article.image && !imgErr && (
        <div style={{ borderRadius:4, overflow:"hidden", background:th.bgSkeleton1, flexShrink:0 }}>
          <img src={article.image} alt="" loading="lazy" decoding="async" onError={()=>setImgErr(true)} className="featured-img" style={{ width:"100%", objectFit:"cover", display:"block" }} />
        </div>
      )}

      {/* Headline */}
      <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:featured?"clamp(1.05rem,2.2vw,1.45rem)":"clamp(0.88rem,1.8vw,0.96rem)", fontWeight:featured?700:600, color:th.textHead, lineHeight:1.3, margin:0, letterSpacing:"-0.01em" }}>{article.title}</h2>

      {/* Description */}
      {article.description && <p style={{ color:th.textBody, fontSize:featured?"0.85rem":"0.76rem", lineHeight:1.7, fontFamily:"'Lora',serif", margin:0, display:"-webkit-box", WebkitLineClamp:featured?3:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{article.description}</p>}

      {/* Action row */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:"auto" }}>
        <div style={{ color:hovered?th.accent:th.textMuted, fontSize:"0.62rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em", transition:"color 0.2s" }}>READ STORY →</div>
        <div style={{ display:"flex", gap:"0.4rem", position:"relative" }}>
          <button ref={shareBtnRef} onClick={handleShareClick} title="Share" style={{ background:"transparent", border:`1px solid ${th.border}`, color:th.textMuted, borderRadius:4, padding:"3px 8px", cursor:"pointer", fontSize:"0.65rem", fontFamily:"'DM Mono',monospace", transition:"all 0.2s" }}>⇪</button>
          <button onClick={handleBookmark} title={isBookmarked?"Remove":"Save"} style={{ background:isBookmarked?th.accentBg:"transparent", border:`1px solid ${isBookmarked?th.accentBord:th.border}`, color:isBookmarked?th.accent:th.textMuted, borderRadius:4, padding:"3px 8px", cursor:"pointer", fontSize:"0.65rem", transition:"all 0.2s" }}>{isBookmarked?"◆":"◇"}</button>
          {showShare && <ShareMenu article={article} th={th} onClose={()=>setShowShare(false)} btnRef={shareBtnRef} />}
        </div>
      </div>
    </article>
  );
}

// ─── TRENDING BAR ─────────────────────────────────────────────────────────────
function TrendingBar({ topics, activeFilter, onFilter, th }) {
  if (!topics.length) return null;
  return (
    <div style={{ borderBottom:`1px solid ${th.borderSub}`, padding:"0.5rem 0", overflowX:"auto", scrollbarWidth:"none", WebkitOverflowScrolling:"touch" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 1rem", display:"flex", gap:"0.4rem", alignItems:"center", flexWrap:"wrap", justifyContent:"center" }} className="trending-inner">
        <span style={{ color:th.textFaint, fontSize:"0.5rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.14em", flexShrink:0 }}>TRENDING</span>
        {activeFilter && (
          <button onClick={() => onFilter(null)} style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", color:"#f87171", borderRadius:20, padding:"3px 10px", cursor:"pointer", fontSize:"0.58rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.06em", flexShrink:0, display:"flex", alignItems:"center", gap:"0.3rem" }}>✕ {activeFilter}</button>
        )}
        {topics.map(topic => (
          <button key={topic} onClick={() => onFilter(activeFilter === topic ? null : topic)} style={{ background: activeFilter===topic ? th.accentBg : th.bgInput, border:`1px solid ${activeFilter===topic ? th.accentBord : th.border}`, color: activeFilter===topic ? th.accent : th.textMuted, borderRadius:20, padding:"3px 12px", cursor:"pointer", fontSize:"0.6rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.06em", whiteSpace:"nowrap", transition:"all 0.18s", flexShrink:0 }}>
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── BREAKING BANNER ──────────────────────────────────────────────────────────
function BreakingBanner({ article, newCount, onClick, th }) {
  const [visible, setVisible] = useState(true);
  if (!article || !visible) return null;
  return (
    <div style={{ background:`linear-gradient(90deg,rgba(239,68,68,0.12),rgba(239,68,68,0.06))`, borderBottom:`1px solid rgba(239,68,68,0.25)`, padding:"0.45rem 1rem" }} onClick={() => onClick(article)}>
      <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", alignItems:"center", gap:"0.75rem", cursor:"pointer" }}>
        <div style={{ position:"relative", flexShrink:0 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:"#ef4444" }} />
          <div style={{ position:"absolute", inset:"-3px", borderRadius:"50%", border:"1px solid rgba(239,68,68,0.4)", animation:"ping 1.5s ease-in-out infinite" }} />
        </div>
        <span style={{ color:"#ef4444", fontSize:"0.58rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.16em", textTransform:"uppercase", flexShrink:0 }}>Breaking</span>
        {newCount > 0 && (
          <span style={{ background:"#ef4444", color:"#fff", fontSize:"0.48rem", fontFamily:"'DM Mono',monospace", borderRadius:10, padding:"1px 6px", flexShrink:0 }}>{newCount} new</span>
        )}
        <p style={{ color:th.textHead, fontSize:"0.78rem", fontFamily:"'Playfair Display',serif", fontWeight:600, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{article.title}</p>
        <span style={{ color:th.textMuted, fontSize:"0.6rem", fontFamily:"'DM Mono',monospace", flexShrink:0 }}>{timeAgo(article.publishedAt)}</span>
        <button onClick={e=>{e.stopPropagation();setVisible(false);}} style={{ background:"transparent", border:"none", color:"rgba(239,68,68,0.5)", cursor:"pointer", fontSize:"0.75rem", padding:"0 4px", flexShrink:0 }}>✕</button>
      </div>
    </div>
  );
}

// ─── ARTICLE EXTRACTOR ────────────────────────────────────────────────────────
async function extractArticle(url) {
  const res = await fetch(`/.netlify/functions/extract?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error(`Extraction failed (${res.status})`);
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json;
}

// ─── IN-APP BROWSER ───────────────────────────────────────────────────────────
function InAppBrowser({ url, onClose, th }) {
  const [status,  setStatus]  = useState("loading");
  const [article, setArticle] = useState(null);
  const [fontSize,setFontSize]= useState(17);
  useEffect(() => { document.body.style.overflow="hidden"; return ()=>{ document.body.style.overflow=""; }; }, []);
  useEffect(() => { const fn=e=>{if(e.key==="Escape")onClose();}; window.addEventListener("keydown",fn); return ()=>window.removeEventListener("keydown",fn); }, [onClose]);
  useEffect(() => { setStatus("loading"); extractArticle(url).then(d=>{setArticle(d);setStatus("success");}).catch(()=>setStatus("error")); }, [url]);
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)", zIndex:200, animation:"fadeIn 0.2s ease" }} />
      <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"min(780px,96vw)", height:"min(90vh,860px)", background:th.bgReader, border:`1px solid ${th.border}`, borderRadius:12, zIndex:201, display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 32px 80px rgba(0,0,0,0.65)", animation:"popIn 0.3s cubic-bezier(0.16,1,0.3,1)" }}>
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
            {[15,17,19].map((s,i)=>(
              <button key={s} onClick={()=>setFontSize(s)} style={{ background:fontSize===s?th.accentBg:"transparent", border:`1px solid ${fontSize===s?th.accentBord:th.border}`, color:fontSize===s?th.accent:th.textMuted, borderRadius:3, padding:"2px 7px", fontSize:"0.58rem", cursor:"pointer", fontFamily:"'DM Mono',monospace" }}>A{["","·","··"][i]}</button>
            ))}
            <a href={url} target="_blank" rel="noopener noreferrer" style={{ background:th.accentBg, border:`1px solid ${th.accentBord}`, color:th.accent, fontSize:"0.58rem", fontFamily:"'DM Mono',monospace", padding:"4px 9px", borderRadius:4, textDecoration:"none" }}>OPEN ↗</a>
            <button onClick={onClose} style={{ background:"transparent", border:`1px solid ${th.border}`, color:th.textMuted, cursor:"pointer", fontSize:"0.82rem", padding:"3px 8px", borderRadius:4 }}>✕</button>
          </div>
        </div>
        {status==="loading" && <div style={{ height:2, background:th.border, flexShrink:0, overflow:"hidden" }}><div style={{ height:"100%", background:`linear-gradient(90deg,${th.accent},#e8833a)`, animation:"loadBar 1.6s ease-in-out infinite" }} /></div>}
        <div style={{ flex:1, overflowY:"auto", padding:"2rem 2.5rem" }}>
          {status==="loading" && <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>{[100,85,95,70,90].map((w,i)=><div key={i} style={{ height:i===0?28:16, width:`${w}%`, background:`linear-gradient(90deg,${th.bgSkeleton1} 25%,${th.bgSkeleton2} 50%,${th.bgSkeleton1} 75%)`, backgroundSize:"200% 100%", animation:"shimmer 1.5s infinite", borderRadius:3 }} />)}</div>}
          {status==="error" && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"60vh", gap:"1.25rem", textAlign:"center" }}>
              <span style={{ fontSize:"2.5rem" }}>⚠️</span>
              <h3 style={{ fontFamily:"'Playfair Display',serif", color:th.textHead, fontSize:"1.1rem", fontWeight:700 }}>Couldn't extract this article</h3>
              <a href={url} target="_blank" rel="noopener noreferrer" style={{ background:th.accentBg, border:`1px solid ${th.accentBord}`, color:th.accent, padding:"0.7rem 1.4rem", borderRadius:5, textDecoration:"none", fontFamily:"'DM Mono',monospace", fontSize:"0.7rem" }}>READ ON SOURCE ↗</a>
            </div>
          )}
          {status==="success" && article && (
            <div style={{ maxWidth:640, margin:"0 auto" }}>
              <div style={{ display:"flex", gap:"0.6rem", alignItems:"center", flexWrap:"wrap", marginBottom:"1.25rem" }}>
                {article.siteName && <span style={{ background:th.accentBg, border:`1px solid ${th.accentBord}`, color:th.accent, fontSize:"0.6rem", fontFamily:"'DM Mono',monospace", padding:"3px 9px", textTransform:"uppercase" }}>{article.siteName}</span>}
                {article.author && <span style={{ color:th.textMuted, fontSize:"0.65rem", fontFamily:"'DM Mono',monospace" }}>By {article.author}</span>}
              </div>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.4rem,3.5vw,2rem)", fontWeight:700, color:th.textHead, lineHeight:1.22, marginBottom:"1.5rem" }}>{article.title}</h1>
              {article.image && <div style={{ borderRadius:8, overflow:"hidden", marginBottom:"1.75rem" }}><img src={article.image} alt="" onError={e=>{e.target.parentElement.style.display="none";}} style={{ width:"100%", display:"block", maxHeight:400, objectFit:"cover" }} /></div>}
              <div style={{ fontFamily:"'Lora',serif", fontSize:`${fontSize}px`, color:th.textBody, lineHeight:1.9 }}>
                {article.text ? article.text.split("\n\n").filter(p=>p.trim()).map((p,i)=><p key={i} style={{ marginBottom:"1.2em" }}>{p}</p>) : <p style={{ color:th.textMuted }}>No text could be extracted.</p>}
              </div>
              <div style={{ borderTop:`1px solid ${th.borderSub}`, marginTop:"2.5rem", paddingTop:"1.25rem", display:"flex", gap:"0.75rem", flexWrap:"wrap" }}>
                <a href={url} target="_blank" rel="noopener noreferrer" style={{ background:th.accentBg, border:`1px solid ${th.accentBord}`, color:th.accent, padding:"0.55rem 1.1rem", borderRadius:4, textDecoration:"none", fontFamily:"'DM Mono',monospace", fontSize:"0.65rem" }}>VIEW ORIGINAL ↗</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── RELATED STORIES ──────────────────────────────────────────────────────────
function RelatedStories({ article, allArticles, onClick, th }) {
  const related = allArticles
    .filter(a => a.id !== article.id && a.type !== "video")
    .filter(a => {
      const titleWords = new Set(article.title.toLowerCase().split(/\s+/).filter(w => w.length > 4));
      const overlap = a.title.toLowerCase().split(/\s+/).filter(w => titleWords.has(w)).length;
      return overlap >= 1;
    })
    .slice(0, 3);
  if (!related.length) return null;
  return (
    <div style={{ borderTop:`1px solid ${th.borderSub}`, marginTop:"2rem", paddingTop:"1.5rem" }}>
      <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"0.9rem", fontWeight:700, color:th.textHead, marginBottom:"1rem", letterSpacing:"-0.01em" }}>Related Stories</h3>
      <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
        {related.map(a => (
          <div key={a.id} onClick={() => onClick(a)} style={{ display:"flex", gap:"0.75rem", alignItems:"flex-start", cursor:"pointer", padding:"0.5rem", borderRadius:5, transition:"background 0.2s" }} onMouseEnter={e=>e.currentTarget.style.background=th.bgInput} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            {a.image && <div style={{ width:60, height:45, borderRadius:4, overflow:"hidden", flexShrink:0, background:th.bgSkeleton1 }}><img src={a.image} alt="" loading="lazy" onError={e=>{e.target.parentElement.style.display="none";}} style={{ width:"100%", height:"100%", objectFit:"cover" }} /></div>}
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ color:th.textSource, fontSize:"0.58rem", fontFamily:"'DM Mono',monospace", marginBottom:"0.2rem" }}>{a.source}</p>
              <p style={{ color:th.textHead, fontSize:"0.8rem", fontFamily:"'Playfair Display',serif", fontWeight:600, lineHeight:1.3, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{a.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── READER PANEL ─────────────────────────────────────────────────────────────
function ReaderPanel({ article, onClose, th, bookmarks, onBookmark, allArticles, onSelectRelated }) {
  const [fontSize,    setFontSize]    = useState(16);
  const [showBrowser, setShowBrowser] = useState(false);
  const [showShare,   setShowShare]   = useState(false);
  const shareBtnRef = useRef(null);
  const isBookmarked = bookmarks.some(b => b.id === article.id);
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 520;

  useEffect(() => {
    const fn = e => { if (e.key==="Escape" && !showBrowser) onClose(); };
    window.addEventListener("keydown", fn);
    if (!showBrowser) document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
  }, [onClose, showBrowser]);

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(5px)", zIndex:100, animation:"fadeIn 0.2s ease" }} />
      <aside style={{ position:"fixed", top:0, right:0, bottom:0, width:"min(680px,100vw)", background:th.bgReader, borderLeft:`1px solid ${th.border}`, zIndex:101, overflowY:"auto", animation:"slideIn 0.3s cubic-bezier(0.16,1,0.3,1)", display:"flex", flexDirection:"column" }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.9rem 1.25rem", borderBottom:`1px solid ${th.border}`, position:"sticky", top:0, background:th.bgReader, zIndex:1, gap:"0.75rem", flexWrap:"wrap" }}>
          <div style={{ display:"flex", gap:"0.4rem", alignItems:"center" }}>
            <span style={{ color:th.textMuted, fontSize:"0.58rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em" }}>SIZE</span>
            {[14,16,18,20].map((s,i)=>(
              <button key={s} onClick={()=>setFontSize(s)} style={{ background:fontSize===s?th.accentBg:"transparent", border:`1px solid ${fontSize===s?th.accentBord:th.border}`, color:fontSize===s?th.accent:th.textMuted, borderRadius:3, padding:"2px 7px", fontSize:"0.6rem", cursor:"pointer", fontFamily:"'DM Mono',monospace" }}>A{["","·","··","···"][i]}</button>
            ))}
          </div>
          <div style={{ display:"flex", gap:"0.5rem", alignItems:"center", flexWrap:"wrap", position:"relative" }}>
            <button onClick={()=>onBookmark(article)} style={{ background:isBookmarked?th.accentBg:"transparent", border:`1px solid ${isBookmarked?th.accentBord:th.border}`, color:isBookmarked?th.accent:th.textMuted, fontSize:"0.6rem", fontFamily:"'DM Mono',monospace", padding:"4px 10px", borderRadius:3, cursor:"pointer" }}>{isBookmarked?"◆ SAVED":"◇ SAVE"}</button>
            <button ref={shareBtnRef} onClick={()=>setShowShare(s=>!s)} style={{ background:"transparent", border:`1px solid ${th.border}`, color:th.textMuted, fontSize:"0.6rem", fontFamily:"'DM Mono',monospace", padding:"4px 10px", borderRadius:3, cursor:"pointer" }}>⇪ SHARE</button>
            {showShare && <ShareMenu article={article} th={th} onClose={()=>setShowShare(false)} btnRef={shareBtnRef} />}
            <button onClick={()=>setShowBrowser(true)} style={{ background:th.accentBg, border:`1px solid ${th.accentBord}`, color:th.accent, fontSize:"0.6rem", fontFamily:"'DM Mono',monospace", padding:"4px 10px", borderRadius:3, cursor:"pointer", whiteSpace:"nowrap" }}>⬡ READ IN-APP</button>
            <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ color:th.textSource, fontSize:"0.6rem", fontFamily:"'DM Mono',monospace", textDecoration:"none", border:`1px solid ${th.border}`, padding:"4px 10px", borderRadius:3, whiteSpace:"nowrap" }}>SOURCE ↗</a>
            <button onClick={onClose} style={{ background:"transparent", border:`1px solid ${th.border}`, color:th.textMuted, cursor:"pointer", fontSize:"0.85rem", padding:"4px 9px", borderRadius:3 }}>✕</button>
          </div>
        </div>
        {/* Content */}
        <div style={{ padding:"2rem 1.75rem", flex:1 }}>
          <div style={{ display:"flex", gap:"0.6rem", alignItems:"center", marginBottom:"1.25rem", flexWrap:"wrap" }}>
            <span style={{ background:th.accentBg, border:`1px solid ${th.accentBord}`, color:th.accent, fontSize:"0.6rem", fontFamily:"'DM Mono',monospace", padding:"3px 9px", textTransform:"uppercase" }}>{article.source}</span>
            <BiasDot source={article.source} />
            <CountryFlag title={article.title} source={article.source} />
            <span style={{ color:th.textMuted, fontSize:"0.62rem", fontFamily:"'DM Mono',monospace" }}>{timeAgo(article.publishedAt)}</span>
          </div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.3rem,4vw,1.9rem)", fontWeight:700, color:th.textHead, lineHeight:1.22, marginBottom:"1.5rem", letterSpacing:"-0.02em" }}>{article.title}</h1>
          {article.image && <div style={{ borderRadius:5, overflow:"hidden", marginBottom:"1.75rem", border:`1px solid ${th.border}` }}><img src={article.image} alt="" onError={e=>{e.target.parentElement.style.display="none";}} style={{ width:"100%", display:"block", maxHeight:360, objectFit:"cover" }} /></div>}
          <p style={{ fontFamily:"'Lora',serif", fontSize:`${fontSize}px`, color:th.textBody, lineHeight:1.85, marginBottom:"2rem" }}>{article.description || "Full article available at the original source."}</p>
          <div style={{ borderTop:`1px solid ${th.borderSub}`, paddingTop:"1.25rem", display:"flex", gap:"0.75rem", flexWrap:"wrap" }}>
            <button onClick={()=>setShowBrowser(true)} style={{ background:th.accentBg, border:`1px solid ${th.accentBord}`, color:th.accent, padding:"0.65rem 1.25rem", borderRadius:4, cursor:"pointer", fontFamily:"'DM Mono',monospace", fontSize:"0.68rem" }}>⬡ READ IN-APP</button>
            <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ display:"inline-flex", alignItems:"center", background:"transparent", border:`1px solid ${th.border}`, color:th.textMuted, padding:"0.65rem 1.25rem", borderRadius:4, textDecoration:"none", fontFamily:"'DM Mono',monospace", fontSize:"0.68rem" }}>OPEN IN BROWSER ↗</a>
          </div>
          {/* Related stories */}
          <RelatedStories article={article} allArticles={allArticles} onClick={onSelectRelated} th={th} />
        </div>
      </aside>
      {showBrowser && <InAppBrowser url={article.url} onClose={()=>setShowBrowser(false)} th={th} />}
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

// ─── WEATHER WIDGET ───────────────────────────────────────────────────────────
function WeatherWidget({ weather, th }) {
  if (!weather) return null;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", background:th.accentBg, border:`1px solid ${th.accentBord}`, borderRadius:20, padding:"0.25rem 0.75rem", flexShrink:0, animation:"fadeIn 0.4s ease" }}>
      <span style={{ fontSize:"0.9rem", lineHeight:1 }}>{weather.icon}</span>
      <span style={{ color:th.accent, fontSize:"0.65rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.06em", whiteSpace:"nowrap" }}>
        {weather.temp}°C {weather.city && <span style={{ opacity:0.7 }}>· {weather.city}</span>}
      </span>
    </div>
  );
}

// ─── CONTACT POPUP ────────────────────────────────────────────────────────────
function ContactPopup({ onClose, th }) {
  const [copied, setCopied] = useState(false);
  const copyEmail = () => { navigator.clipboard.writeText(CONTACT_EMAIL).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);}); };
  useEffect(() => { const fn=e=>{if(e.key==="Escape")onClose();}; window.addEventListener("keydown",fn); return ()=>window.removeEventListener("keydown",fn); }, [onClose]);
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)", zIndex:300, animation:"fadeIn 0.2s ease" }} />
      <div style={{ position:"fixed", bottom:"5rem", right:"1.5rem", background:th.bgReader, border:`1px solid ${th.border}`, borderRadius:10, padding:"1.5rem", zIndex:301, width:"min(320px,90vw)", boxShadow:"0 20px 60px rgba(0,0,0,0.4)", animation:"popUp 0.25s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1rem" }}>
          <div>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", fontWeight:700, color:th.textHead, marginBottom:"0.2rem" }}>Get in touch</h3>
            <p style={{ color:th.textMuted, fontSize:"0.68rem", fontFamily:"'DM Mono',monospace" }}>Pedro Esteves · Developer</p>
          </div>
          <button onClick={onClose} style={{ background:"transparent", border:`1px solid ${th.border}`, color:th.textMuted, cursor:"pointer", fontSize:"0.8rem", padding:"3px 8px", borderRadius:3 }}>✕</button>
        </div>
        <div style={{ background:th.bgInput, border:`1px solid ${th.border}`, borderRadius:6, padding:"0.75rem 1rem", marginBottom:"0.75rem" }}>
          <p style={{ color:th.textMuted, fontSize:"0.58rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em", marginBottom:"0.3rem" }}>EMAIL</p>
          <p style={{ color:th.textHead, fontSize:"0.78rem", fontFamily:"'DM Mono',monospace", wordBreak:"break-all" }}>{CONTACT_EMAIL}</p>
        </div>
        <div style={{ display:"flex", gap:"0.5rem" }}>
          <button onClick={copyEmail} style={{ flex:1, background:copied?"rgba(74,222,128,0.1)":th.accentBg, border:`1px solid ${copied?"rgba(74,222,128,0.3)":th.accentBord}`, color:copied?"#4ade80":th.accent, cursor:"pointer", padding:"0.6rem", borderRadius:5, fontFamily:"'DM Mono',monospace", fontSize:"0.65rem", transition:"all 0.2s" }}>{copied?"✓ COPIED":"COPY EMAIL"}</button>
          <a href={`mailto:${CONTACT_EMAIL}`} style={{ flex:1, background:"transparent", border:`1px solid ${th.border}`, color:th.textMuted, padding:"0.6rem", borderRadius:5, fontFamily:"'DM Mono',monospace", fontSize:"0.65rem", textDecoration:"none", display:"flex", alignItems:"center", justifyContent:"center" }}>SEND EMAIL ↗</a>
        </div>
      </div>
    </>
  );
}

// ─── SAVED VIEW ───────────────────────────────────────────────────────────────
function SavedView({ bookmarks, onClick, onBookmark, th }) {
  if (!bookmarks.length) return (
    <div style={{ textAlign:"center", padding:"5rem 1rem" }}>
      <p style={{ fontSize:"2rem", marginBottom:"1rem" }}>◇</p>
      <p style={{ color:th.textHead, fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", fontWeight:700, marginBottom:"0.5rem" }}>No saved articles yet</p>
      <p style={{ color:th.textMuted, fontFamily:"'DM Mono',monospace", fontSize:"0.7rem", letterSpacing:"0.08em" }}>Tap ◇ on any story to save it here</p>
    </div>
  );
  return (
    <div className="news-grid">
      {bookmarks.map((a,i) => <NewsCard key={a.id||i} article={a} index={i} onClick={onClick} th={th} bookmarks={bookmarks} onBookmark={onBookmark} />)}
    </div>
  );
}

// ─── LIVE VIEW ────────────────────────────────────────────────────────────────
function LiveView({ videos, loading, onPlay, th }) {
  if (loading) return (
    <div className="news-grid">
      {[1,2,3,4,5,6].map(i=>(
        <div key={i} style={{ background:th.bgCard, border:`1px solid ${th.border}`, borderRadius:6, overflow:"hidden" }}>
          <div style={{ paddingBottom:"56.25%", position:"relative" }}><div style={{ position:"absolute", inset:0, background:`linear-gradient(90deg,${th.bgSkeleton1} 25%,${th.bgSkeleton2} 50%,${th.bgSkeleton1} 75%)`, backgroundSize:"200% 100%", animation:"shimmer 1.6s infinite" }} /></div>
          <div style={{ padding:"0.9rem", display:"flex", flexDirection:"column", gap:"0.5rem" }}>
            <div style={{ height:12, width:"40%", background:th.bgSkeleton1, borderRadius:3 }} />
            <div style={{ height:16, background:th.bgSkeleton1, borderRadius:3 }} />
          </div>
        </div>
      ))}
    </div>
  );
  if (!videos.length) return <div style={{ textAlign:"center", padding:"4rem 1rem", color:th.textFaint, fontFamily:"'DM Mono',monospace", fontSize:"0.72rem", letterSpacing:"0.12em" }}>NO VIDEOS FOUND</div>;
  return <div className="news-grid">{videos.map((v,i)=><VideoCard key={v.id||i} video={v} index={i} onClick={onPlay} th={th} />)}</div>;
}

// ─── WORLD DROPDOWN ───────────────────────────────────────────────────────────
// WorldRegionBar — scrollable pill bar, no z-index issues, mobile friendly
function WorldRegionBar({ activeRegion, onSelect, th }) {
  return (
    <div style={{ borderTop:`1px solid ${th.borderTab}`, background:th.bgHeader, overflowX:"auto", scrollbarWidth:"none", WebkitOverflowScrolling:"touch" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0.45rem 1rem", display:"flex", gap:"0.5rem", flexWrap:"wrap", justifyContent:"center" }} className="region-inner">
        {WORLD_REGIONS.map(r => (
          <button
            key={r.id}
            onClick={e => { e.stopPropagation(); onSelect(r.id); }}
            style={{
              background:    activeRegion===r.id ? th.accentBg : "transparent",
              border:        `1px solid ${activeRegion===r.id ? th.accentBord : th.border}`,
              color:         activeRegion===r.id ? th.accent : th.textMuted,
              borderRadius:  20,
              padding:       "0.3rem 0.85rem",
              cursor:        "pointer",
              fontFamily:    "'DM Mono',monospace",
              fontSize:      "0.6rem",
              letterSpacing: "0.06em",
              whiteSpace:    "nowrap",
              transition:    "all 0.18s",
              flexShrink:    0,
              minHeight:     34,
            }}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function NewsApp() {
  const [night,           setNight]           = useState(()=>{ try{return localStorage.getItem("theBriefTheme")!=="day";}catch{return true;} });
  const [activeCategory,  setActiveCategory]  = useState("top");
  const [activeRegion,    setActiveRegion]    = useState("world");
  const [articles,        setArticles]        = useState([]);
  const [videos,          setVideos]          = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedVideo,   setSelectedVideo]   = useState(null);
  const [lastUpdated,     setLastUpdated]     = useState(null);
  const [search,          setSearch]          = useState("");
  const [showContact,     setShowContact]     = useState(false);
  const [bookmarks,       setBookmarks]       = useState(loadBookmarks);
  const [showScrollTop,   setShowScrollTop]   = useState(false);
  const [trendingFilter,  setTrendingFilter]  = useState(null);
  const [newStoryCount,   setNewStoryCount]   = useState(0);
  const prevTopArticleRef = useRef(null);
  const cacheRef = useRef({});
  const th = night ? T.night : T.day;
  const weather = useWeather();

  // Scroll to top button visibility
  useEffect(() => {
    const fn = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", fn, { passive:true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollToTop = () => window.scrollTo({ top:0, behavior:"smooth" });

  const toggleTheme = () => setNight(n=>{ const next=!n; try{localStorage.setItem("theBriefTheme",next?"night":"day");}catch{} return next; });

  const toggleBookmark = (article) => {
    setBookmarks(prev => {
      const exists = prev.some(b=>b.id===article.id);
      const next   = exists ? prev.filter(b=>b.id!==article.id) : [article,...prev];
      saveBookmarks(next);
      return next;
    });
  };

  // Effective feed key — world uses sub-region, others use category directly
  const WORLD_CATS = ["world","europe","asia","americas","mideast"];
  const feedKey = activeCategory === "world" ? activeRegion : activeCategory;
  
  // Category accent overrides for stocks (green) and crypto (orange)
  const catAccent = activeCategory === "stocks" ? "#22c55e"
    : activeCategory === "crypto" ? "#f97316"
    : th.accent;

  const loadNews = useCallback(async (key) => {
    if (key === "saved") return;
    if (cacheRef.current[key]) {
      if (key==="live") { setVideos(cacheRef.current[key]); } else { setArticles(cacheRef.current[key].articles||[]); setVideos(cacheRef.current[key].videos||[]); }
      setLoading(false); return;
    }
    setLoading(true); setError(null);
    try {
      if (key === "live") {
        const results = await Promise.allSettled(YOUTUBE_SOURCES.live.map(fetchYouTubeFeed));
        const all = results.flatMap(r=>r.status==="fulfilled"?r.value:[]);
        const sorted = dedupe(all).sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt));
        cacheRef.current[key] = sorted;
        setVideos(sorted); setArticles([]);
      } else {
        const [artRes, vidRes] = await Promise.all([
          Promise.allSettled((RSS_SOURCES[key]||[]).map(fetchFeed)),
          Promise.allSettled((YOUTUBE_SOURCES[key]||[]).map(fetchYouTubeFeed)),
        ]);
        const allArt = artRes.flatMap(r=>r.status==="fulfilled"?r.value:[]);
        const allVid = vidRes.flatMap(r=>r.status==="fulfilled"?r.value:[]);
        // Apply category keyword filter — blocks off-topic articles
        // Soft-filter categories: if the filter blocks everything, fall back to unfiltered
        // Science is included because headlines are too varied to guarantee keyword matches
        const SOFT_FILTER_CATEGORIES = new Set(["cars","stocks","crypto","science","sports","motos","tech","business"]);

        let filteredArt = allArt.filter(a => passesFilter(a, key));

        if (SOFT_FILTER_CATEGORIES.has(key) && filteredArt.length < 3) {
          filteredArt = allArt; // fallback — show all if filter is too aggressive
        }
        const sortedArt = dedupe(filteredArt).sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt));
        const sortedVid = dedupe(allVid).sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt)).slice(0,4);
        if (!sortedArt.length && !sortedVid.length) throw new Error("No content found. Check your connection.");
        cacheRef.current[key] = { articles:sortedArt, videos:sortedVid };
        setArticles(sortedArt); setVideos(sortedVid);
        // Breaking news badge — detect new top story
        if (key === "top" && sortedArt.length) {
          const topId = sortedArt[0].id;
          if (prevTopArticleRef.current && prevTopArticleRef.current !== topId) {
            const newCount = sortedArt.findIndex(a=>a.id===prevTopArticleRef.current);
            setNewStoryCount(newCount > 0 ? newCount : 0);
          }
          prevTopArticleRef.current = topId;
        }
      }
      setLastUpdated(new Date());
    } catch(e) { setError(e.message); }
    finally    { setLoading(false); }
  }, []);

  useEffect(() => { loadNews(feedKey); }, [feedKey, loadNews]);

  // Reset trending filter when category changes
  useEffect(() => { setTrendingFilter(null); }, [activeCategory, activeRegion]);

  const handleCategoryClick = (id) => {
    setActiveCategory(id);
    setSearch("");
    scrollToTop();
    if (id !== "world") setActiveRegion("world");
  };
  const handleRegionSelect = (regionId) => {
    setActiveRegion(regionId);
    setSearch("");
    scrollToTop();
  };

  // Trending topics from current articles
  const trendingTopics = articles.length > 5 ? extractTrending(articles) : [];

  // Filtered articles
  const baseFilter = (arr) => {
    if (search.trim()) return arr.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.source.toLowerCase().includes(search.toLowerCase()));
    if (trendingFilter) return arr.filter(a => a.title.toLowerCase().includes(trendingFilter.toLowerCase()));
    return arr;
  };
  const filteredArticles = baseFilter(articles);
  const filteredVideos   = activeCategory === "live" ? baseFilter(videos) : videos;

  // Mixed feed builder
const buildMixed = () => {
  const featured = filteredArticles[0] || null;
  const rest = filteredArticles.slice(1);
  const mixed = [];
  let vIdx = 0;

  // 🔥 If no articles, show videos instead
  if (rest.length === 0 && filteredVideos.length > 0) {
    return {
      featured,
      mixed: filteredVideos.map(v => ({ ...v, _type: "video" })),
    };
  }

  // Normal mix
    rest.forEach((a, i) => {
      mixed.push({ ...a, _type: "article" });

      if ((i + 1) % 4 === 0 && vIdx < filteredVideos.length) {
        mixed.push({ ...filteredVideos[vIdx], _type: "video" });
        vIdx++;
      }
    });

    // 🔥 Append remaining videos at the end
    while (vIdx < filteredVideos.length) {
      mixed.push({ ...filteredVideos[vIdx], _type: "video" });
      vIdx++;
    }

    return { featured, mixed };
  };
  const { featured, mixed } = buildMixed();
  const breakingArticle = articles[0] || null;
  const isLive  = activeCategory === "live";
  const isSaved = activeCategory === "saved";
  const isWorld = activeCategory === "world";
  const currentRegion = WORLD_REGIONS.find(r=>r.id===activeRegion) || WORLD_REGIONS[0];

  return (
    <div style={{ minHeight:"100vh", background:th.bg, color:th.text, fontFamily:"'Lora',serif", transition:"background 0.3s, color 0.3s", overflowX:"hidden", width:"100%" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{overflow-x:hidden;max-width:100vw}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${th.scrollThumb};border-radius:10px}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
        @keyframes popIn{from{opacity:0;transform:translate(-50%,-50%) scale(0.94)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
        @keyframes popUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes loadBar{0%{width:0%;margin-left:0}50%{width:60%;margin-left:20%}100%{width:0%;margin-left:100%}}
        @keyframes ping{0%{transform:scale(1);opacity:0.8}100%{transform:scale(2.2);opacity:0}}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        input{outline:none}
        input::placeholder{color:${th.textMuted}}
        input:focus{border-color:${th.accentBord} !important}
        .news-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;width:100%;min-width:0}
        .featured-card{grid-column:span 2;min-width:0;max-width:100%;overflow:hidden}
        .featured-img{height:200px;width:100%;object-fit:cover;display:block}
        @media(max-width:520px){
          .news-grid{grid-template-columns:1fr}
          .featured-card{grid-column:span 1}
          .featured-img{height:170px}
          .featured-card article{padding:1rem !important}
        }
        @media(max-width:400px){
          .featured-img{height:140px}
        }
        @media(max-width:640px){
          .trending-inner{flex-wrap:nowrap !important;justify-content:flex-start !important;width:max-content}
          .region-inner{flex-wrap:nowrap !important;justify-content:flex-start !important;width:max-content}
        }
        @media(max-width:480px){.cat-tab{padding:0.55rem 0.45rem !important}}
        @media(max-width:420px){
          .cat-full{display:none !important}
          .cat-short{display:inline !important;font-size:0.44rem !important;letter-spacing:0.04em !important}
          .toggle-label{display:none !important}
          .hide-sm{display:none !important}
        }
        @media(min-width:421px){.toggle-label{display:inline !important}}
      `}</style>

      {/* ── HEADER ── */}
      <header style={{ borderBottom:`1px solid ${th.border}`, position:"sticky", top:0, zIndex:50, background:th.bgHeader, backdropFilter:"blur(20px)", transition:"background 0.3s" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 1rem", display:"flex", justifyContent:"space-between", alignItems:"center", height:56, gap:"0.75rem" }}>
          {/* Wordmark */}
          <div style={{ display:"flex", alignItems:"baseline", gap:"0.08rem", flexShrink:0 }}>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.1rem,3vw,1.55rem)", fontWeight:800, color:th.textHead, letterSpacing:"-0.03em" }}>The</span>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.1rem,3vw,1.55rem)", fontWeight:800, color:th.accent, letterSpacing:"-0.03em" }}>Brief</span>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.44rem", color:th.textMuted, letterSpacing:"0.2em", marginLeft:"0.35rem", textTransform:"uppercase" }}>Live</span>
          </div>
          {/* Search */}
          <div style={{ flex:1, maxWidth:260, position:"relative", display:"flex", alignItems:"center" }}>
            <span style={{ position:"absolute", left:10, color:th.textMuted, fontSize:"0.85rem", pointerEvents:"none" }}>⌕</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{ width:"100%", background:th.bgInput, border:`1px solid ${th.border}`, borderRadius:5, padding:"0.4rem 0.7rem 0.4rem 1.9rem", color:th.text, fontSize:"0.75rem", fontFamily:"'DM Mono',monospace", transition:"border-color 0.2s" }} />
          </div>
          {/* Right controls */}
          <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", flexShrink:0 }}>
            <WeatherWidget weather={weather} th={th} />
            {lastUpdated && <div className="hide-sm" style={{ color:th.textFaint, fontSize:"0.52rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em", textAlign:"right", lineHeight:1.5 }}><span style={{ display:"block" }}>UPDATED</span>{lastUpdated.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div>}
            <ThemeToggle night={night} onToggle={toggleTheme} th={th} />
          </div>
        </div>

        {/* Breaking banner */}
        {activeCategory==="top" && breakingArticle && <BreakingBanner article={breakingArticle} newCount={newStoryCount} onClick={setSelectedArticle} th={th} />}

        {/* Trending bar — shows on article categories only */}
        {!isLive && !isSaved && trendingTopics.length > 0 && (
          <TrendingBar topics={trendingTopics} activeFilter={trendingFilter} onFilter={setTrendingFilter} th={th} />
        )}

        {/* Category tabs */}
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 1rem", display:"flex", gap:0, overflowX:"auto", borderTop:`1px solid ${th.borderTab}`, scrollbarWidth:"none" }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={()=>handleCategoryClick(cat.id)} className="cat-tab" style={{ background:"transparent", border:"none", borderBottom:`2px solid ${activeCategory===cat.id?(cat.id==="stocks"?"#22c55e":cat.id==="crypto"?"#f97316":th.accent):"transparent"}`, color:activeCategory===cat.id?(cat.id==="stocks"?"#22c55e":cat.id==="crypto"?"#f97316":th.accent):th.textMuted, padding:"0.65rem 0.8rem", cursor:"pointer", fontFamily:"'DM Mono',monospace", fontSize:"0.6rem", letterSpacing:"0.12em", textTransform:"uppercase", display:"flex", alignItems:"center", gap:"0.35rem", whiteSpace:"nowrap", transition:"color 0.2s, border-color 0.2s", flexShrink:0 }}>
              <span style={{ fontSize:cat.id==="live"?"0.85rem":"0.72rem" }}>{cat.icon}</span>
              <span className="cat-label cat-full">{cat.label}</span>
              <span className="cat-label cat-short" style={{ display:"none" }}>{cat.short}</span>
              {/* World region indicator */}
              {cat.id==="world" && activeCategory==="world" && activeRegion !== "world" && (
                <span style={{ fontSize:"0.48rem", fontFamily:"'DM Mono',monospace", color:th.accent, letterSpacing:"0.06em" }}>
                  {WORLD_REGIONS.find(r=>r.id===activeRegion)?.short}
                </span>
              )}
              {cat.id==="saved" && bookmarks.length>0 && <span style={{ background:th.accent, color:night?"#080809":"#fff", fontSize:"0.5rem", fontFamily:"'DM Mono',monospace", borderRadius:10, padding:"1px 5px", lineHeight:1.4 }}>{bookmarks.length}</span>}
              {cat.id==="live" && <span style={{ background:"rgba(239,68,68,0.15)", color:"#ef4444", fontSize:"0.45rem", fontFamily:"'DM Mono',monospace", borderRadius:10, padding:"1px 5px", lineHeight:1.4, letterSpacing:"0.1em" }}>LIVE</span>}
            </button>
          ))}
          {!isSaved && !isLive && (
            <button onClick={()=>{ delete cacheRef.current[feedKey]; loadNews(feedKey); }} title="Refresh" style={{ marginLeft:"auto", background:"transparent", border:"none", color:th.textFaint, cursor:"pointer", padding:"0.65rem 0.8rem", fontSize:"0.75rem", fontFamily:"'DM Mono',monospace", display:"flex", alignItems:"center", gap:"0.35rem", transition:"color 0.2s", whiteSpace:"nowrap", flexShrink:0 }} onMouseEnter={e=>e.currentTarget.style.color=th.accent} onMouseLeave={e=>e.currentTarget.style.color=th.textFaint}>
              ↺ <span className="cat-label cat-full" style={{ fontSize:"0.55rem", letterSpacing:"0.12em" }}>REFRESH</span>
            </button>
          )}
        </div>

        {/* World region bar — appears below tabs when World is active */}
        {isWorld && <WorldRegionBar activeRegion={activeRegion} onSelect={handleRegionSelect} th={th} />}
      </header>

      {/* ── MAIN ── */}
      <main
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "1.5rem 1rem 7rem",
          overflow: "hidden",
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        {/* Section header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem", paddingBottom:"0.7rem", borderBottom:`1px solid ${th.borderSub}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
            <span style={{ color:isLive?"#ef4444":catAccent, fontSize:"0.85rem" }}>{CATEGORIES.find(c=>c.id===activeCategory)?.icon}</span>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(0.9rem,2vw,1.05rem)", fontWeight:700, color:th.textHead, letterSpacing:"-0.01em" }}>
              {isWorld && activeRegion !== "world" ? currentRegion.label : CATEGORIES.find(c=>c.id===activeCategory)?.label}
            </h1>
            {isLive && <span style={{ background:"rgba(239,68,68,0.1)", color:"#ef4444", fontSize:"0.55rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.12em", padding:"2px 8px", borderRadius:10 }}>● LIVE</span>}
            {trendingFilter && <span style={{ background:th.accentBg, color:th.accent, fontSize:"0.55rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em", padding:"2px 8px", borderRadius:10 }}>◈ {trendingFilter}</span>}
            {!isSaved && !isLive && !loading && (filteredArticles.length+filteredVideos.length)>0 && (
              <span style={{ color:th.textFaint, fontSize:"0.55rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.12em" }}>
                {filteredArticles.length} stories{filteredVideos.length>0?` · ${filteredVideos.length} videos`:""}
              </span>
            )}
          </div>
          {(search || trendingFilter) && <button onClick={()=>{setSearch("");setTrendingFilter(null);}} style={{ background:"transparent", border:`1px solid ${th.border}`, color:th.textMuted, cursor:"pointer", padding:"3px 9px", borderRadius:3, fontSize:"0.6rem", fontFamily:"'DM Mono',monospace" }}>CLEAR ✕</button>}
        </div>

        {isSaved && <SavedView bookmarks={bookmarks} onClick={setSelectedArticle} onBookmark={toggleBookmark} th={th} />}
        {isLive  && <LiveView videos={filteredVideos} loading={loading} onPlay={setSelectedVideo} th={th} />}

        {!isSaved && !isLive && error && (
          <div style={{ background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.18)", borderRadius:5, padding:"2rem", textAlign:"center" }}>
            <p style={{ color:"#f87171", fontFamily:"'DM Mono',monospace", fontSize:"0.75rem", letterSpacing:"0.08em", marginBottom:"1rem" }}>⚠ {error}</p>
            <button onClick={()=>{ delete cacheRef.current[feedKey]; loadNews(feedKey); }} style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", color:"#f87171", cursor:"pointer", padding:"6px 16px", borderRadius:3, fontFamily:"'DM Mono',monospace", fontSize:"0.66rem" }}>↺ RETRY</button>
          </div>
        )}

        {!isSaved && !isLive && loading && !error && (
          <div className="news-grid">
            <div className="featured-card"><SkeletonCard featured th={th} /></div>
            {[1,2,3,4].map(i=><SkeletonCard key={i} th={th} />)}
          </div>
        )}

        {!isSaved && !isLive && !loading && !error && filteredArticles.length===0 && filteredVideos.length===0 && (search||trendingFilter) && (
          <div style={{ textAlign:"center", padding:"4rem 1rem", color:th.textFaint, fontFamily:"'DM Mono',monospace", fontSize:"0.72rem", letterSpacing:"0.12em" }}>
            NO CONTENT MATCHING "{(search||trendingFilter||"").toUpperCase()}"
          </div>
        )}

        {!isSaved && !isLive && !loading && !error && (filteredArticles.length>0||filteredVideos.length>0) && (
          <div className="news-grid">
            {featured && <div className="featured-card"><NewsCard article={featured} featured index={0} onClick={setSelectedArticle} th={th} bookmarks={bookmarks} onBookmark={toggleBookmark} /></div>}
            {mixed.map((item,i) =>
              item._type==="video"
                ? <VideoCard key={item.id||i} video={item} index={i+1} onClick={setSelectedVideo} th={th} />
                : <NewsCard key={item.id||i} article={item} index={i+1} onClick={setSelectedArticle} th={th} bookmarks={bookmarks} onBookmark={toggleBookmark} />
            )}
          </div>
        )}
      </main>

      {/* ── SEO SECTION ── */}
      <section style={{ borderTop:`1px solid ${th.borderSub}`, padding:"2.5rem 1rem", transition:"background 0.3s" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ marginBottom:"2rem", textAlign:"center" }}>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", fontWeight:700, color:th.textHead, marginBottom:"0.75rem" }}>About The Brief</h2>
            <p style={{ color:th.textBody, fontSize:"0.82rem", fontFamily:"'Lora',serif", lineHeight:1.8, maxWidth:680, margin:"0 auto" }}>
              The Brief is a free live news aggregator pulling breaking stories from BBC News, Reuters, Al Jazeera, TechCrunch, New York Times, Sky News, Wired and Ars Technica. Now with live video news from YouTube. No account required, no paywalls, no autoplay ads. Just clean, fast, live news and video — updated continuously.
            </p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:"1rem", marginBottom:"2rem" }}>
            {[
              { title:"Top Stories", desc:"Breaking news and top headlines from BBC, Reuters and Sky News updated hourly." },
              { title:"World News", desc:"Global news with regional editions — Europe, Asia, Americas and Middle East." },
              { title:"Technology", desc:"Tech news, reviews and analysis from TechCrunch, Wired and Ars Technica." },
              { title:"Business", desc:"Markets, finance and economy from BBC Business, NYT Business and Sky Business." },
              { title:"Science", desc:"Science, health and space from NYT Science, New Scientist and BBC Science." },
              { title:"Sports", desc:"Sports news and results from BBC Sport, NYT Sports and Sky Sports." },
              { title:"Cars", desc:"Automotive news and videos from Autocar, Top Gear, Carwow and Car and Driver." },
              { title:"Motorcycles", desc:"Motorcycle news and videos from MCN, RideApart, FortNine and RevZilla." },
              { title:"Live Video", desc:"Live breaking news videos from BBC News, Al Jazeera, Reuters, DW News and AP News." },
              { title:"Stocks", desc:"Global stock market news from MarketWatch, Investing.com, CNBC, BBC Business and NYT Markets." },
              { title:"Crypto", desc:"Cryptocurrency news from CoinTelegraph, CoinDesk, Decrypt and Bitcoin Magazine. Bitcoin, Ethereum and altcoins." },
              { title:"Political Bias Ratings", desc:"Every source rated by AllSides. Blue = Left. Grey = Centre. Red = Right. Hover any dot to see the rating." },
            ].map(cat=>(
              <div key={cat.title} style={{ padding:"1rem", background:th.bgCard, border:`1px solid ${th.border}`, borderRadius:6 }}>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"0.88rem", fontWeight:700, color:th.textHead, marginBottom:"0.4rem" }}>{cat.title}</h3>
                <p style={{ color:th.textBody, fontSize:"0.75rem", fontFamily:"'Lora',serif", lineHeight:1.65 }}>{cat.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:"1.5rem" }}>
            <div>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"0.88rem", fontWeight:700, color:th.textHead, marginBottom:"0.5rem" }}>News Sources</h3>
              <p style={{ color:th.textBody, fontSize:"0.75rem", fontFamily:"'Lora',serif", lineHeight:1.8 }}>BBC News · Reuters · Al Jazeera · TechCrunch · New York Times · Sky News · Wired · Ars Technica · New Scientist · Euronews · DW News · NPR · Autocar · Top Gear · Car and Driver · Motorcycle Daily · RideApart · FortNine · RevZilla</p>
            </div>
            <div>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"0.88rem", fontWeight:700, color:th.textHead, marginBottom:"0.5rem" }}>Features</h3>
              <p style={{ color:th.textBody, fontSize:"0.75rem", fontFamily:"'Lora',serif", lineHeight:1.8 }}>Free news aggregator · Live video news · World regional editions · Trending topics · Political bias ratings · No account required · In-app article reader · Breaking news alerts · Weather by location · Save articles · Share to WhatsApp · Night and day mode · Mobile friendly · No tracking</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── BIAS LEGEND ── */}
      <div style={{ borderTop:`1px solid ${th.borderSub}`, padding:"1.5rem 1rem" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"0.88rem", fontWeight:700, color:th.textHead, marginBottom:"1rem" }}>Political Bias Ratings</h3>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"1rem", marginBottom:"0.75rem" }}>
            {[
              { color:"#3b82f6", label:"Left",       desc:"Strongly left-leaning" },
              { color:"#60a5fa", label:"Lean Left",  desc:"Slightly left of centre" },
              { color:"#9ca3af", label:"Centre",     desc:"Balanced, non-partisan" },
              { color:"#f87171", label:"Lean Right", desc:"Slightly right of centre" },
              { color:"#ef4444", label:"Right",      desc:"Strongly right-leaning" },
            ].map(b=>(
              <div key={b.label} style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:b.color, flexShrink:0 }} />
                <span style={{ color:th.textHead, fontSize:"0.72rem", fontFamily:"'DM Mono',monospace" }}>{b.label}</span>
                <span style={{ color:th.textMuted, fontSize:"0.65rem", fontFamily:"'Lora',serif" }}>— {b.desc}</span>
              </div>
            ))}
          </div>
          <p style={{ color:th.textFaint, fontSize:"0.65rem", fontFamily:"'DM Mono',monospace" }}>
            Ratings from <a href="https://www.allsides.com" target="_blank" rel="noopener noreferrer" style={{ color:th.accent, textDecoration:"none" }}>AllSides.com</a> — independent non-partisan media bias resource.
          </p>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:`1px solid ${th.borderSub}`, padding:"2rem 1rem" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", flexDirection:"column", alignItems:"center", gap:"1rem", textAlign:"center" }}>
          <a href="https://www.producthunt.com/products/the-brief-3?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-the-brief-4" target="_blank" rel="noopener noreferrer" style={{ display:"inline-block" }} onMouseEnter={e=>e.currentTarget.style.opacity="0.85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
            <img alt="The Brief | Product Hunt" width="200" height="43" src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1121244&theme=dark&t=1775992143795" style={{ display:"block" }} />
          </a>
          <p style={{ color:th.footer, fontSize:"0.62rem", fontFamily:"'Playfair Display',serif", fontWeight:600 }}>© {new Date().getFullYear()} Pedro Esteves. All rights reserved.</p>
          <p style={{ color:th.textFaint, fontSize:"0.52rem", fontFamily:"'DM Mono',monospace", letterSpacing:"0.14em" }}>THE BRIEF · LIVE NEWS + VIDEO AGGREGATOR · RSS-POWERED</p>
        </div>
      </footer>

      {/* ── SCROLL TO TOP ── */}
      {showScrollTop && (
        <button onClick={scrollToTop} title="Back to top" style={{ position:"fixed", bottom:"5.5rem", right:"1.5rem", background:th.bgCard, border:`1px solid ${th.border}`, borderRadius:"50%", width:42, height:42, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", zIndex:90, boxShadow:th.shadow, fontSize:"1rem", color:th.textMuted, transition:"all 0.2s", animation:"fadeIn 0.25s ease" }} onMouseEnter={e=>{e.currentTarget.style.background=th.accentBg;e.currentTarget.style.color=th.accent;e.currentTarget.style.borderColor=th.accentBord;e.currentTarget.style.transform="translateY(-2px)";}} onMouseLeave={e=>{e.currentTarget.style.background=th.bgCard;e.currentTarget.style.color=th.textMuted;e.currentTarget.style.borderColor=th.border;e.currentTarget.style.transform="none";}}>↑</button>
      )}

      {/* ── CONTACT BUTTON ── */}
      <button onClick={()=>setShowContact(c=>!c)} title="Contact Pedro Esteves" style={{ position:"fixed", bottom:"1.5rem", right:"1.5rem", background:th.accent, border:"none", borderRadius:"50%", width:48, height:48, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", zIndex:90, boxShadow:"0 4px 20px rgba(0,0,0,0.3)", fontSize:"1.1rem", transition:"transform 0.2s, box-shadow 0.2s" }} onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.1)";e.currentTarget.style.boxShadow="0 8px 28px rgba(0,0,0,0.4)";}} onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.3)";}}>✉</button>

      {showContact     && <ContactPopup onClose={()=>setShowContact(false)} th={th} />}
      {selectedArticle && <ReaderPanel article={selectedArticle} onClose={()=>setSelectedArticle(null)} th={th} bookmarks={bookmarks} onBookmark={toggleBookmark} allArticles={articles} onSelectRelated={a=>{setSelectedArticle(a);scrollToTop();}} />}
      {selectedVideo   && <VideoPlayer video={selectedVideo} onClose={()=>setSelectedVideo(null)} th={th} />}
    </div>
  );
}
