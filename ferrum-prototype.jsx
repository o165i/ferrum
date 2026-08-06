import { useState } from "react";
import { ShoppingBag, ChevronDown, X, Plus, Minus } from "lucide-react";

/* ---------------------------------------------------------------
   FERRUM — independent hard-goods label.
   Tokens
   --bg      #0b0b0a  near-black, faint warmth
   --fg      #ece7dc  bone
   --muted   #8c887f  warm grey (secondary text)
   --line    #2a2926  hairline borders
   --accent  #ff3d1a  signal orange-red (sale / cta only)
   Type: Anton (display, heavy/condensed) · Inter (body) · IBM Plex Mono (tags/specs)
   Signature: every product carries a "manifest tag" — a monospace
   shipping-label readout (REF · COLOR · SIZE) that surfaces on hover,
   turning the catalog into something closer to a cargo inventory
   than a boutique shelf.
------------------------------------------------------------------*/

const IMG = (seed, w = 900, h = 1150) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

const PRODUCTS = [
  { id: 1, ref: "FR-014", name: "HAZARD ANORAK", cat: "OUTERWEAR", color: "BLACK", price: 340, sale: null, imgA: "ferrum-anorak-a", imgB: "ferrum-anorak-b" },
  { id: 2, ref: "FR-021", name: "SLAG COAT", cat: "OUTERWEAR", color: "GREY", price: 620, sale: 480, imgA: "ferrum-coat-a", imgB: "ferrum-coat-b" },
  { id: 3, ref: "FR-032", name: "CINDER KNIT", cat: "KNITWEAR", color: "BLACK", price: 180, sale: null, imgA: "ferrum-knit-a", imgB: "ferrum-knit-b" },
  { id: 4, ref: "FR-035", name: "ASH CABLE SWEATER", cat: "KNITWEAR", color: "BONE", price: 210, sale: null, imgA: "ferrum-cable-a", imgB: "ferrum-cable-b" },
  { id: 5, ref: "FR-041", name: "RUST WASH DENIM", cat: "DENIM", color: "RUST", price: 230, sale: null, imgA: "ferrum-denim1-a", imgB: "ferrum-denim1-b" },
  { id: 6, ref: "FR-044", name: "SCRAP CARGO", cat: "DENIM", color: "BLACK", price: 260, sale: 190, imgA: "ferrum-cargo-a", imgB: "ferrum-cargo-b" },
  { id: 7, ref: "FR-051", name: "MANIFEST TEE", cat: "TOPS", color: "BONE", price: 90, sale: null, imgA: "ferrum-tee-a", imgB: "ferrum-tee-b" },
  { id: 8, ref: "FR-053", name: "FREIGHT HOODIE", cat: "TOPS", color: "BLACK", price: 210, sale: null, imgA: "ferrum-hoodie-a", imgB: "ferrum-hoodie-b" },
  { id: 9, ref: "FR-061", name: "STEEL CHAIN", cat: "ACCESSORIES", color: "GREY", price: 60, sale: null, imgA: "ferrum-chain-a", imgB: "ferrum-chain-b" },
  { id: 10, ref: "FR-064", name: "CONCRETE CAP", cat: "ACCESSORIES", color: "BLACK", price: 70, sale: null, imgA: "ferrum-cap-a", imgB: "ferrum-cap-b" },
];

const CATS = ["ALL", "OUTERWEAR", "KNITWEAR", "DENIM", "TOPS", "ACCESSORIES"];
const COLORS = ["BLACK", "GREY", "BONE", "RUST"];

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
      .ferrum-root{
        --bg:#0b0b0a; --fg:#ece7dc; --muted:#8c887f; --line:#2a2926; --accent:#ff3d1a;
        background:var(--bg); color:var(--fg);
        font-family:'Inter',sans-serif;
        min-height:100%;
      }
      .f-display{ font-family:'Anton',sans-serif; text-transform:uppercase; letter-spacing:0.01em; }
      .f-mono{ font-family:'IBM Plex Mono',monospace; }
      .f-tag{ letter-spacing:0.12em; }
      .f-line{ border-color:var(--line) !important; }
      .f-muted{ color:var(--muted); }
      .f-accent{ color:var(--accent); }
      .f-bg-accent{ background:var(--accent); }
      .manifest{
        position:absolute; left:8px; bottom:8px; right:8px;
        display:flex; justify-content:space-between; align-items:center;
        padding:6px 8px; background:rgba(11,11,10,0.88);
        border:1px solid var(--line);
        font-size:10px; letter-spacing:0.08em;
        opacity:0; transform:translateY(4px);
        transition:opacity .18s ease, transform .18s ease;
      }
      .group:hover .manifest{ opacity:1; transform:translateY(0); }
      .imgswap{ transition:opacity .35s ease; }
      .group:hover .imgswap-b{ opacity:1; }
      .group:hover .imgswap-a{ opacity:0; }
      .btn-primary{
        background:var(--fg); color:var(--bg);
        text-transform:uppercase; letter-spacing:0.1em; font-size:12px; font-weight:600;
        padding:14px 20px; transition:opacity .15s ease;
      }
      .btn-primary:hover{ opacity:0.82; }
      .btn-ghost{
        border:1px solid var(--line); color:var(--fg);
        text-transform:uppercase; letter-spacing:0.1em; font-size:12px;
        padding:13px 20px; transition:border-color .15s ease;
      }
      .btn-ghost:hover{ border-color:var(--fg); }
      .swatch{ width:22px; height:22px; border:1px solid var(--line); cursor:pointer; }
      .swatch.active{ outline:1px solid var(--fg); outline-offset:2px; }
    `}</style>
  );
}

function Nav({ screen, setScreen, cartCount }) {
  const tabs = [
    ["HOME", "home"],
    ["CATALOG", "catalog"],
    ["PRODUCT", "product"],
    ["SYSTEM", "system"],
  ];
  return (
    <div className="sticky top-0 z-30 border-b f-line" style={{ background: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-5 py-4">
        <div className="f-display text-xl tracking-widest">FERRUM</div>
        <div className="hidden md:flex gap-7">
          {tabs.map(([label, key]) => (
            <button
              key={key}
              onClick={() => setScreen(key)}
              className="f-mono text-[11px] f-tag uppercase pb-1 border-b"
              style={{
                color: screen === key ? "var(--fg)" : "var(--muted)",
                borderColor: screen === key ? "var(--fg)" : "transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 f-mono text-xs">
          <ShoppingBag size={17} strokeWidth={1.5} />
          <span>{cartCount}</span>
        </div>
      </div>
      {/* mobile tabs */}
      <div className="flex md:hidden gap-5 px-5 pb-3 overflow-x-auto">
        {tabs.map(([label, key]) => (
          <button
            key={key}
            onClick={() => setScreen(key)}
            className="f-mono text-[11px] f-tag uppercase whitespace-nowrap"
            style={{ color: screen === key ? "var(--fg)" : "var(--muted)" }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ManifestTag({ p }) {
  return (
    <div className="manifest f-mono">
      <span>{p.ref}</span>
      <span className="f-muted">{p.color}</span>
    </div>
  );
}

function ProductCard({ p, onOpen }) {
  return (
    <button onClick={onOpen} className="group text-left w-full">
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4/5", background: "#151513" }}>
        <img
          src={IMG(p.imgA)}
          alt={p.name}
          className="imgswap imgswap-a absolute inset-0 w-full h-full object-cover"
          style={{ filter: "grayscale(1) contrast(1.08)" }}
        />
        <img
          src={IMG(p.imgB)}
          alt=""
          className="imgswap imgswap-b absolute inset-0 w-full h-full object-cover opacity-0"
          style={{ filter: "grayscale(1) contrast(1.08)" }}
        />
        {p.sale && (
          <div className="absolute top-2 left-2 f-bg-accent f-mono text-[10px] px-2 py-1" style={{ color: "#0b0b0a" }}>
            SALE
          </div>
        )}
        <ManifestTag p={p} />
      </div>
      <div className="pt-3 flex justify-between items-start">
        <div>
          <div className="text-[13px] tracking-wide">{p.name}</div>
          <div className="f-mono text-[11px] f-muted mt-0.5">{p.cat}</div>
        </div>
        <div className="f-mono text-[13px] text-right">
          {p.sale ? (
            <>
              <div className="f-muted line-through">€{p.price}</div>
              <div className="f-accent">€{p.sale}</div>
            </>
          ) : (
            <div>€{p.price}</div>
          )}
        </div>
      </div>
    </button>
  );
}

/* ---------------- HOME ---------------- */
function Home({ openProduct, setScreen }) {
  const featured = PRODUCTS.slice(0, 4);
  return (
    <div>
      <div className="relative w-full" style={{ height: "78vh", background: "#141412" }}>
        <img
          src={IMG("ferrum-hero", 1600, 1400)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "grayscale(1) contrast(1.1) brightness(0.75)" }}
        />
        <div className="relative z-10 h-full max-w-7xl mx-auto px-5 flex flex-col justify-end pb-16">
          <div className="f-mono text-[11px] f-tag f-muted mb-3">DROP 004 — FW26</div>
          <div className="f-display text-[15vw] md:text-[7vw] leading-[0.85]">FERRUM</div>
          <div className="flex items-center gap-6 mt-6">
            <button onClick={() => setScreen("catalog")} className="btn-primary">
              Enter archive
            </button>
            <span className="f-mono text-[11px] f-muted">12 pieces · limited run</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-16">
        <div className="flex items-baseline justify-between mb-8">
          <div className="f-display text-2xl">SELECTED</div>
          <button onClick={() => setScreen("catalog")} className="f-mono text-[11px] f-tag f-muted underline">
            VIEW ALL →
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featured.map((p) => (
            <ProductCard key={p.id} p={p} onOpen={() => openProduct(p)} />
          ))}
        </div>
      </div>

      <div className="border-t f-line">
        <div className="max-w-7xl mx-auto px-5 py-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            ["01", "MATERIAL FIRST", "Every reference number traces back to a mill or a tannery. No blends we can't stand behind."],
            ["02", "SMALL RUNS", "Pieces are cut in batches of 30–80. Once a size is gone in a colorway, it isn't restocked."],
            ["03", "BUILT TO WEAR OUT", "Raw finishes, natural fading, repairable seams — the object is meant to change with you."],
          ].map(([n, t, d]) => (
            <div key={n}>
              <div className="f-mono f-muted text-xs mb-2">{n}</div>
              <div className="f-display text-lg mb-2">{t}</div>
              <div className="text-sm f-muted leading-relaxed">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- CATALOG ---------------- */
function Catalog({ openProduct }) {
  const [cat, setCat] = useState("ALL");
  const [color, setColor] = useState(null);
  const [sort, setSort] = useState("NEWEST");

  let list = PRODUCTS.filter((p) => cat === "ALL" || p.cat === cat).filter((p) => !color || p.color === color);
  if (sort === "PRICE_ASC") list = [...list].sort((a, b) => (a.sale || a.price) - (b.sale || b.price));
  if (sort === "PRICE_DESC") list = [...list].sort((a, b) => (b.sale || b.price) - (a.sale || a.price));

  return (
    <div className="max-w-7xl mx-auto px-5 py-10">
      <div className="flex items-baseline justify-between mb-8 flex-wrap gap-3">
        <div className="f-display text-3xl">FULL ARCHIVE</div>
        <div className="f-mono text-[11px] f-muted">{list.length} ITEMS</div>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        <aside className="md:w-52 shrink-0">
          <div className="mb-8">
            <div className="f-mono text-[11px] f-tag f-muted mb-3">CATEGORY</div>
            <div className="flex flex-col gap-2">
              {CATS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className="text-left f-mono text-[12px]"
                  style={{ color: cat === c ? "var(--fg)" : "var(--muted)" }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="f-mono text-[11px] f-tag f-muted mb-3">COLOR</div>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(color === c ? null : c)}
                  className={`swatch ${color === c ? "active" : ""}`}
                  title={c}
                  style={{
                    background:
                      c === "BLACK" ? "#111" : c === "GREY" ? "#7d7d78" : c === "BONE" ? "#e8e2d4" : "#8a3a24",
                  }}
                />
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex justify-end mb-5">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="f-mono text-[11px] bg-transparent border f-line px-2 py-1"
            >
              <option value="NEWEST">SORT: NEWEST</option>
              <option value="PRICE_ASC">SORT: PRICE ↑</option>
              <option value="PRICE_DESC">SORT: PRICE ↓</option>
            </select>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {list.map((p) => (
              <ProductCard key={p.id} p={p} onOpen={() => openProduct(p)} />
            ))}
          </div>
          {list.length === 0 && <div className="f-muted f-mono text-sm py-16 text-center">NO ITEMS MATCH THESE FILTERS</div>}
        </div>
      </div>
    </div>
  );
}

/* ---------------- PRODUCT ---------------- */
function Product({ product }) {
  const p = product || PRODUCTS[0];
  const [size, setSize] = useState("M");
  const [open, setOpen] = useState("MATERIALS");
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const sections = [
    ["MATERIALS", "Waxed cotton canvas shell, brushed wool lining. Sourced from a family-run mill outside Biella, running since 1962."],
    ["SHIPPING", "Dispatched within 3 business days. Tracked worldwide shipping; EU orders arrive in 2–4 days, rest of world 5–10."],
    ["CARE", "Dry clean only. Spot-treat with a damp cloth for light marks. Waxed surfaces will darken and soften with wear — that's intended."],
  ];

  return (
    <div className="max-w-7xl mx-auto px-5 py-10 grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="grid grid-cols-1 gap-3">
        <img
          src={IMG(p.imgA, 900, 1150)}
          alt={p.name}
          className="w-full object-cover"
          style={{ filter: "grayscale(1) contrast(1.08)", aspectRatio: "4/5" }}
        />
        <img
          src={IMG(p.imgB, 900, 1150)}
          alt=""
          className="w-full object-cover"
          style={{ filter: "grayscale(1) contrast(1.08)", aspectRatio: "4/5" }}
        />
      </div>

      <div className="md:sticky md:top-24 self-start">
        <div className="f-mono text-[11px] f-muted mb-2">{p.ref} · {p.cat}</div>
        <div className="f-display text-3xl mb-3">{p.name}</div>
        <div className="f-mono text-lg mb-8">
          {p.sale ? (
            <>
              <span className="f-muted line-through mr-3">€{p.price}</span>
              <span className="f-accent">€{p.sale}</span>
            </>
          ) : (
            <span>€{p.price}</span>
          )}
        </div>

        <div className="mb-6">
          <div className="f-mono text-[11px] f-tag f-muted mb-3">SIZE</div>
          <div className="grid grid-cols-6 gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className="f-mono text-[11px] py-2 border f-line"
                style={{
                  background: size === s ? "var(--fg)" : "transparent",
                  color: size === s ? "var(--bg)" : "var(--fg)",
                  borderColor: size === s ? "var(--fg)" : "var(--line)",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary w-full mb-3">Add to bag — €{p.sale || p.price}</button>
        <button className="btn-ghost w-full mb-10">Add to wishlist</button>

        <div className="border-t f-line">
          {sections.map(([label, body]) => (
            <div key={label} className="border-b f-line">
              <button
                onClick={() => setOpen(open === label ? null : label)}
                className="w-full flex justify-between items-center py-4 f-mono text-[11px] f-tag"
              >
                {label}
                {open === label ? <Minus size={13} /> : <Plus size={13} />}
              </button>
              {open === label && <div className="text-sm f-muted leading-relaxed pb-4 pr-6">{body}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- DESIGN SYSTEM ---------------- */
function SystemBlock({ title, children }) {
  return (
    <div className="border-b f-line py-10">
      <div className="f-mono text-[11px] f-tag f-muted mb-6">{title}</div>
      {children}
    </div>
  );
}

function System() {
  const colors = [
    ["--bg", "#0b0b0a", "Ground. Near-black, faint warmth — never true #000."],
    ["--fg", "#ece7dc", "Bone. Primary text and inverted button fill."],
    ["--muted", "#8c887f", "Warm grey. Secondary text, captions, inactive nav."],
    ["--line", "#2a2926", "Hairline borders, dividers, input outlines."],
    ["--accent", "#ff3d1a", "Signal orange-red. Sale price and destructive actions only — never decorative."],
  ];
  return (
    <div className="max-w-5xl mx-auto px-5 py-14">
      <div className="f-display text-4xl mb-2">DESIGN SYSTEM</div>
      <div className="f-muted text-sm mb-10">Reference sheet for the FERRUM UI. Five colors, three typefaces, one signature element.</div>

      <SystemBlock title="COLOR">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {colors.map(([name, hex, desc]) => (
            <div key={name}>
              <div className="w-full mb-2" style={{ height: 64, background: hex, border: "1px solid var(--line)" }} />
              <div className="f-mono text-[11px]">{name}</div>
              <div className="f-mono text-[10px] f-muted">{hex}</div>
              <div className="text-[11px] f-muted mt-1 leading-snug">{desc}</div>
            </div>
          ))}
        </div>
      </SystemBlock>

      <SystemBlock title="TYPE">
        <div className="mb-6">
          <div className="f-display text-5xl mb-1">Anton — Display</div>
          <div className="f-mono text-[11px] f-muted">Headlines, hero type, section titles. Always uppercase. Used at size, never for body copy.</div>
        </div>
        <div className="mb-6">
          <div className="text-2xl mb-1" style={{ fontFamily: "Inter" }}>Inter — Body</div>
          <div className="f-mono text-[11px] f-muted">Paragraphs, nav labels at small sizes, product names. Regular 400 / Medium 500 / Semibold 600.</div>
        </div>
        <div>
          <div className="f-mono text-2xl mb-1">IBM Plex Mono — Utility</div>
          <div className="f-mono text-[11px] f-muted">Prices, REF codes, filters, form controls, manifest tags. Always tracked out (+0.08–0.12em).</div>
        </div>
      </SystemBlock>

      <SystemBlock title="BUTTONS">
        <div className="flex flex-wrap gap-4 items-center">
          <button className="btn-primary">Add to bag</button>
          <button className="btn-ghost">Add to wishlist</button>
          <button className="btn-primary" style={{ opacity: 0.35, pointerEvents: "none" }}>Sold out</button>
        </div>
      </SystemBlock>

      <SystemBlock title="MANIFEST TAG — SIGNATURE ELEMENT">
        <div className="text-sm f-muted mb-4 leading-relaxed max-w-lg">
          Every product image carries a hidden shipping-label readout that appears on hover: reference code, left; colorway, right. It's the one recurring motif that ties the whole catalog together and gives an otherwise plain grid a cargo-manifest character.
        </div>
        <div className="relative w-40" style={{ aspectRatio: "4/5", background: "#151513" }}>
          <img src={IMG("ferrum-anorak-a")} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: "grayscale(1) contrast(1.08)" }} />
          <div className="manifest f-mono" style={{ opacity: 1, transform: "none" }}>
            <span>FR-014</span>
            <span className="f-muted">BLACK</span>
          </div>
        </div>
      </SystemBlock>

      <div className="pt-10">
        <div className="f-mono text-[11px] f-tag f-muted mb-3">SPACING</div>
        <div className="flex items-end gap-4 f-mono text-[10px] f-muted">
          {[4, 8, 12, 16, 24, 32, 48, 64].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div style={{ width: 4, height: s, background: "var(--fg)" }} />
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- ROOT ---------------- */
export default function FerrumPrototype() {
  const [screen, setScreen] = useState("home");
  const [activeProduct, setActiveProduct] = useState(PRODUCTS[0]);
  const cartCount = 0;

  const openProduct = (p) => {
    setActiveProduct(p);
    setScreen("product");
  };

  return (
    <div className="ferrum-root">
      <GlobalStyle />
      <Nav screen={screen} setScreen={setScreen} cartCount={cartCount} />
      {screen === "home" && <Home openProduct={openProduct} setScreen={setScreen} />}
      {screen === "catalog" && <Catalog openProduct={openProduct} />}
      {screen === "product" && <Product product={activeProduct} />}
      {screen === "system" && <System />}
      <div className="border-t f-line">
        <div className="max-w-7xl mx-auto px-5 py-10 flex justify-between items-center f-mono text-[10px] f-muted">
          <div>© 2026 FERRUM</div>
          <div>PROTOTYPE — NOT FOR PRODUCTION</div>
        </div>
      </div>
    </div>
  );
}
