import React from "react";
import { supabase } from "./supabaseClient";

function goTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function PublicProduct() {
  const slug = React.useMemo(() => window.location.pathname.replace("/p/", "").trim(), []);
  const [loading, setLoading] = React.useState(true);
  const [product, setProduct] = React.useState(null);
  const [images, setImages] = React.useState([]);
  const [activeIdx, setActiveIdx] = React.useState(0);

  React.useEffect(() => {
    async function load() {
      setLoading(true);

      const { data: p, error: pErr } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .eq("is_public", true)
        .single();

      if (pErr || !p) {
        setProduct(null);
        setImages([]);
        setLoading(false);
        return;
      }

      setProduct(p);

      const { data: imgs } = await supabase
        .from("product_images")
        .select("id, public_url, position")
        .eq("product_id", p.id)
        .order("position", { ascending: true });

      setImages(Array.isArray(imgs) ? imgs : []);
      setActiveIdx(0);
      setLoading(false);
    }

    load();
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Laden…</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="max-w-3xl mx-auto px-4 py-14">
          <div className="bg-white border rounded-2xl p-8">
            <div className="text-xl font-bold">Product niet gevonden</div>
            <div className="text-sm text-slate-600 mt-2">
              Deze link is ongeldig, of het product staat niet (meer) publiek.
            </div>
            <button onClick={() => goTo("/")} className="mt-6 px-5 py-3 rounded-xl bg-slate-900 text-white">
              Terug naar Partagos
            </button>
          </div>
        </div>
      </div>
    );
  }

  const main = images[activeIdx]?.public_url || images[0]?.public_url;

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="font-bold text-lg">Partagos</div>
          <button onClick={() => goTo("/")} className="text-sm px-4 py-2 rounded-xl border bg-white">
            Home
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-8">
        <div className="bg-white border rounded-2xl p-5">
          <div className="aspect-[4/3] border rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center">
            {main ? <img src={main} alt="" className="w-full h-full object-cover" /> : <div className="text-slate-400">Geen foto</div>}
          </div>

          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-6 gap-2">
              {images.slice(0, 12).map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveIdx(i)}
                  className={`border rounded-xl overflow-hidden aspect-square ${i === activeIdx ? "ring-2 ring-emerald-500" : ""}`}
                  title={`Foto ${i + 1}`}
                >
                  <img src={img.public_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border rounded-2xl p-6">
          <h1 className="text-2xl font-bold">{product.name}</h1>

          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <Meta label="Onderdeelnummer" value={product.part_number || "-"} />
            <Meta label="Motorcode" value={product.engine_code || "-"} />
            <Meta label="Versnellingsbakcode" value={product.gearbox_code || "-"} />
            <Meta label="Locatie" value={product.location || "-"} />
          </div>

          <div className="mt-5 border rounded-xl p-4 bg-slate-50">
            <div className="text-xs text-slate-600">Prijs</div>
            <div className="text-3xl font-extrabold mt-1">
              {product.price ? `€${product.price}` : "Prijs op aanvraag"}
            </div>
            <div className="text-xs text-slate-500 mt-1">Voorraad: {product.stock ?? "-"}</div>
          </div>

          <div className="mt-5 grid sm:grid-cols-2 gap-3">
            <a
              href={`mailto:info@partagos.nl?subject=Interesse%20in%20${encodeURIComponent(product.name)}&body=Ik%20heb%20interesse%20in%20${encodeURIComponent(product.name)}%20(${encodeURIComponent(product.part_number || "-")}).%0A%0ALink:%20${encodeURIComponent(window.location.href)}`}
              className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-center"
            >
              Contact
            </a>
            <button onClick={() => goTo("/login")} className="px-5 py-3 rounded-xl border bg-white font-semibold">
              Inloggen (bedrijven)
            </button>
          </div>

          <div className="mt-6 text-xs text-slate-500">
            Dit is een publieke productpagina. Bedrijfsabonnementen en interne functies blijven afgeschermd.
          </div>
        </div>
      </main>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div className="border rounded-xl p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
