import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import { featuresForPackage } from "./permissions";

function goTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .slice(0, 80);
}

export default function Dashboard() {
  const [sessionLoading, setSessionLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [role, setRole] = useState(null);

  const [companies, setCompanies] = useState([]);
  const [activeCompany, setActiveCompany] = useState(null);

  const [tab, setTab] = useState("products");

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [productImages, setProductImages] = useState([]);
  const [jobs, setJobs] = useState([]);

  // Company settings (watermark)
  const [settings, setSettings] = useState(null);
  const [settingsSaving, setSettingsSaving] = useState(false);

  // New product form
  const [productForm, setProductForm] = useState({
    name: "",
    part_number: "",
    engine_code: "",
    gearbox_code: "",
    location: "",
    price: "",
    stock: 1,
    is_public: false
  });

  // Photo upload state
  const [pendingPhotos, setPendingPhotos] = useState([]); // [{id, file, previewUrl}]
  const dragIdRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data?.session?.user;
      if (!user) {
        goTo("/login");
        return;
      }
      setUserEmail(user.email);
      setSessionLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!userEmail) return;

    async function loadProfile() {
      const { data: profiles, error } = await supabase
        .from("user_profiles")
        .select("role, company_id, companies(*)")
        .eq("email", userEmail);

      if (error) {
        console.error(error);
        return;
      }

      const list = safeArray(profiles).filter((p) => p.companies);
      if (list.length === 0) return;

      setRole(list[0].role);
      const comps = list.map((p) => p.companies);
      setCompanies(comps);
      setActiveCompany(comps[0]);
    }

    loadProfile();
  }, [userEmail]);

  const features = useMemo(() => featuresForPackage(activeCompany?.package), [activeCompany]);

  useEffect(() => {
    if (!activeCompany) return;
    loadProducts();
    loadCompanySettings();
    if (features.canUseMarketplaces) loadJobs();
    setSelectedProduct(null);
    setProductImages([]);
  }, [activeCompany, features.canUseMarketplaces]);

  useEffect(() => {
    if (!selectedProduct) {
      setProductImages([]);
      return;
    }
    loadProductImages(selectedProduct.id);
  }, [selectedProduct]);

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("company_id", activeCompany.id)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    setProducts(safeArray(data));
  }

  async function loadProductImages(productId) {
    const { data, error } = await supabase
      .from("product_images")
      .select("*")
      .eq("company_id", activeCompany.id)
      .eq("product_id", productId)
      .order("position", { ascending: true });

    if (error) console.error(error);
    setProductImages(safeArray(data));
  }

  async function loadJobs() {
    const { data, error } = await supabase
      .from("publish_jobs")
      .select("*")
      .eq("company_id", activeCompany.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) console.error(error);
    setJobs(safeArray(data));
  }

  async function loadCompanySettings() {
    const { data, error } = await supabase
      .from("company_settings")
      .select("*")
      .eq("company_id", activeCompany.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows
      console.error(error);
    }

    if (!data) {
      // ensure defaults row exists
      const { data: inserted, error: insErr } = await supabase
        .from("company_settings")
        .insert([{
          company_id: activeCompany.id,
          watermark_enabled: true,
          watermark_text: `Partagos • ${activeCompany.name}`,
          watermark_position: "br",
          watermark_opacity: 0.75
        }])
        .select("*")
        .single();

      if (insErr) console.error(insErr);
      setSettings(inserted || {
        company_id: activeCompany.id,
        watermark_enabled: true,
        watermark_text: `Partagos • ${activeCompany.name}`,
        watermark_position: "br",
        watermark_opacity: 0.75
      });
      return;
    }

    setSettings(data);
  }

  async function saveCompanySettings() {
    if (!settings) return;
    setSettingsSaving(true);
    const payload = {
      watermark_enabled: !!settings.watermark_enabled,
      watermark_text: settings.watermark_text || `Partagos • ${activeCompany.name}`,
      watermark_position: settings.watermark_position || "br",
      watermark_opacity: Number(settings.watermark_opacity ?? 0.75),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from("company_settings")
      .update(payload)
      .eq("company_id", activeCompany.id);

    if (error) alert(error.message);
    setSettingsSaving(false);
  }

  async function addProductWithPhotos() {
    if (!productForm.name || !activeCompany) return;

    // create stable slug unique globally (name + short id suffix later)
    const base = slugify(productForm.name);
    const slug = `${base}-${Math.random().toString(16).slice(2, 8)}`;

    const payload = {
      company_id: activeCompany.id,
      name: productForm.name,
      part_number: productForm.part_number || null,
      engine_code: productForm.engine_code || null,
      gearbox_code: productForm.gearbox_code || null,
      location: productForm.location || null,
      price: productForm.price ? Number(productForm.price) : null,
      stock: Number(productForm.stock) || 1,
      is_public: !!productForm.is_public,
      slug
    };

    const { data: created, error: insErr } = await supabase
      .from("products")
      .insert([payload])
      .select("*")
      .single();

    if (insErr) {
      alert(insErr.message);
      return;
    }

    if (pendingPhotos.length > 0) {
      const ok = await uploadPendingPhotos(created);
      if (!ok) alert("Product is aangemaakt, maar niet alle foto’s zijn geüpload.");
    }

    setProductForm({
      name: "",
      part_number: "",
      engine_code: "",
      gearbox_code: "",
      location: "",
      price: "",
      stock: 1,
      is_public: false
    });

    cleanupPendingPreviews(pendingPhotos);
    setPendingPhotos([]);

    await loadProducts();
    setSelectedProduct(created);
    await loadProductImages(created.id);
  }

  async function uploadPendingPhotos(product) {
    const bucket = "product-images";
    const companySlug = slugify(activeCompany.name || "company");

    const wmEnabled = !!settings?.watermark_enabled;
    const wmText = settings?.watermark_text || `Partagos • ${activeCompany.name}`;
    const wmCorner = settings?.watermark_position || "br";
    const wmOpacity = clamp01(Number(settings?.watermark_opacity ?? 0.75));

    let allOk = true;

    for (let i = 0; i < pendingPhotos.length; i++) {
      const item = pendingPhotos[i];

      try {
        // Always upload original
        const originalExt = getFileExt(item.file.name) || "jpg";
        const baseName = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

        const originalPath = `${companySlug}/${product.id}/${i}-${baseName}-orig.${originalExt}`;
        const { error: upOrigErr } = await supabase.storage.from(bucket).upload(originalPath, item.file, {
          cacheControl: "3600",
          upsert: false,
          contentType: item.file.type || "image/jpeg"
        });
        if (upOrigErr) throw upOrigErr;

        const { data: origPub } = supabase.storage.from(bucket).getPublicUrl(originalPath);
        const originalUrl = origPub?.publicUrl;
        if (!originalUrl) throw new Error("No publicUrl for original upload");

        // If watermark enabled, create watermarked version; else public_url = original
        let publicUrl = originalUrl;
        let isWatermarked = false;
        let publicPath = originalPath;

        if (wmEnabled) {
          const wmFile = await watermarkImageFile({
            file: item.file,
            watermarkText: wmText,
            corner: wmCorner,
            opacity: wmOpacity
          });

          const wmExt = getFileExt(wmFile.name) || "jpg";
          publicPath = `${companySlug}/${product.id}/${i}-${baseName}-wm.${wmExt}`;

          const { error: upWmErr } = await supabase.storage.from(bucket).upload(publicPath, wmFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: wmFile.type || "image/jpeg"
          });
          if (upWmErr) throw upWmErr;

          const { data: wmPub } = supabase.storage.from(bucket).getPublicUrl(publicPath);
          publicUrl = wmPub?.publicUrl;
          if (!publicUrl) throw new Error("No publicUrl for watermarked upload");
          isWatermarked = true;
        }

        const { error: dbErr } = await supabase.from("product_images").insert([{
          company_id: activeCompany.id,
          product_id: product.id,
          path: publicPath,
          public_url: publicUrl,
          original_url: originalUrl,
          is_watermarked: isWatermarked,
          position: i
        }]);
        if (dbErr) throw dbErr;

      } catch (e) {
        allOk = false;
        console.error(e);
      }
    }

    return allOk;
  }

  async function togglePublic(product, next) {
    const { error } = await supabase.from("products").update({ is_public: !!next }).eq("id", product.id);
    if (error) alert(error.message);
    await loadProducts();
  }

  async function copyPublicLink(product) {
    if (!product.slug) {
      alert("Geen slug gevonden. Maak dit product opnieuw of zet slug handmatig in DB.");
      return;
    }
    const url = `${window.location.origin}/p/${product.slug}`;
    await navigator.clipboard.writeText(url);
    alert("Publieke link gekopieerd.");
  }

  async function deleteProductImage(imageRow) {
    try {
      const { error: rmErr } = await supabase.storage.from("product-images").remove([imageRow.path]);
      if (rmErr) throw rmErr;

      const { error: dbErr } = await supabase.from("product_images").delete().eq("id", imageRow.id);
      if (dbErr) throw dbErr;

      await loadProductImages(selectedProduct.id);
    } catch (e) {
      alert(e?.message || String(e));
    }
  }

  async function saveImageOrder() {
    if (!selectedProduct) return;
    for (let i = 0; i < productImages.length; i++) {
      const img = productImages[i];
      const { error } = await supabase.from("product_images").update({ position: i }).eq("id", img.id);
      if (error) {
        alert(error.message);
        return;
      }
    }
    await loadProductImages(selectedProduct.id);
    alert("Volgorde opgeslagen.");
  }

  async function enqueuePublish(marketplace, product) {
    // Fetch images (ordered) and enforce max-per-marketplace
    const { data: imgs, error: imgErr } = await supabase
      .from("product_images")
      .select("public_url, position")
      .eq("company_id", activeCompany.id)
      .eq("product_id", product.id)
      .order("position", { ascending: true });

    if (imgErr) {
      alert(imgErr.message);
      return;
    }

    const ordered = safeArray(imgs).map((x) => x.public_url).filter(Boolean);

    const max = marketplaceMaxImages(marketplace);
    const images = ordered.slice(0, max);

    const resp = await fetch("/api/publish/enqueue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_id: activeCompany.id,
        marketplace,
        product: {
          id: product.id,
          name: product.name,
          part_number: product.part_number,
          engine_code: product.engine_code,
          gearbox_code: product.gearbox_code,
          price: product.price,
          stock: product.stock
        },
        images
      })
    });

    const json = await resp.json();
    if (!json.ok) alert(json.error || "Enqueue failed");
    if (features.canUseMarketplaces) await loadJobs();
  }

  async function runWorkerOnce() {
    await fetch("/api/publish/worker");
    if (features.canUseMarketplaces) await loadJobs();
  }

  async function logout() {
    await supabase.auth.signOut();
    goTo("/login");
  }

  if (sessionLoading) return <div className="min-h-screen flex items-center justify-center">Laden…</div>;
  if (!activeCompany) return <div className="p-6">Geen bedrijf gevonden.</div>;

  return (
    <div className="min-h-screen flex bg-slate-100">
      <aside className="w-72 bg-slate-900 text-white flex flex-col">
        <div className="p-5 font-bold text-xl border-b border-slate-700">Partagos</div>

        <nav className="flex-1 p-3 space-y-1 text-sm">
          <NavBtn label="Onderdelen" active={tab === "products"} onClick={() => setTab("products")} />
          {features.canUseMarketplaces && <NavBtn label="Marketplaces" active={tab === "marketplaces"} onClick={() => setTab("marketplaces")} />}
          <NavBtn label="Instellingen" active={tab === "settings"} onClick={() => setTab("settings")} />

          {role === "admin" && (
            <NavBtn
              label="Admin: nieuwe klant aanmaken"
              active={false}
              onClick={() => goTo("/admin/customers")}
              className="bg-indigo-600 hover:bg-indigo-500"
            />
          )}
        </nav>

        <div className="p-4 border-t border-slate-700 text-xs space-y-1">
          <div className="font-semibold">{activeCompany.name}</div>
          <div>Pakket: <b>{activeCompany.package}</b></div>
          <div>Rol: <b>{role || "-"}</b></div>
          <button onClick={logout} className="mt-3 w-full bg-slate-800 px-3 py-2 rounded-lg">
            Uitloggen
          </button>
        </div>
      </aside>

      <main className="flex-1">
        <header className="bg-white border-b p-4 flex items-center justify-between">
          <div className="font-semibold capitalize">{tab}</div>
          <select
            value={activeCompany.id}
            onChange={(e) => {
              const c = companies.find((x) => x.id === e.target.value);
              setActiveCompany(c);
              setSelectedProduct(null);
              setProductImages([]);
              cleanupPendingPreviews(pendingPhotos);
              setPendingPhotos([]);
            }}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.package})
              </option>
            ))}
          </select>
        </header>

        <div className="p-6 space-y-6">
          {tab === "products" && (
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Card title="Nieuw onderdeel + foto’s">
                <div className="grid grid-cols-1 gap-2">
                  <input className="border rounded-lg px-3 py-2" placeholder="name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
                  <input className="border rounded-lg px-3 py-2" placeholder="part_number" value={productForm.part_number} onChange={(e) => setProductForm({ ...productForm, part_number: e.target.value })} />
                  <input className="border rounded-lg px-3 py-2" placeholder="engine_code" value={productForm.engine_code} onChange={(e) => setProductForm({ ...productForm, engine_code: e.target.value })} />
                  <input className="border rounded-lg px-3 py-2" placeholder="gearbox_code" value={productForm.gearbox_code} onChange={(e) => setProductForm({ ...productForm, gearbox_code: e.target.value })} />
                  <input className="border rounded-lg px-3 py-2" placeholder="location" value={productForm.location} onChange={(e) => setProductForm({ ...productForm, location: e.target.value })} />
                  <input className="border rounded-lg px-3 py-2" type="number" placeholder="price" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} />
                  <input className="border rounded-lg px-3 py-2" type="number" placeholder="stock" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} />

                  <label className="flex items-center gap-2 text-sm mt-2">
                    <input
                      type="checkbox"
                      checked={!!productForm.is_public}
                      onChange={(e) => setProductForm({ ...productForm, is_public: e.target.checked })}
                    />
                    Publiek zichtbaar (consumenten)
                  </label>
                  <div className="text-xs text-slate-500">
                    Publieke pagina: /p/&lt;slug&gt; (wordt bij aanmaken gezet). Alleen public producten zijn zichtbaar.
                  </div>
                </div>

                <div className="mt-4 border rounded-xl p-3 bg-slate-50">
                  <div className="text-sm font-semibold">Foto’s uploaden</div>
                  <div className="text-xs text-slate-600 mt-1">
                    Watermark instellingen komen uit “Instellingen”. Sleep om volgorde te wijzigen (eerste = hoofdfoto).
                  </div>

                  <input
                    className="mt-3 w-full text-sm"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => onPickFiles(e, setPendingPhotos)}
                  />

                  {pendingPhotos.length > 0 && (
                    <>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {pendingPhotos.map((p, idx) => (
                          <div
                            key={p.id}
                            className="border rounded-xl bg-white overflow-hidden"
                            draggable
                            onDragStart={() => (dragIdRef.current = p.id)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => {
                              const fromId = dragIdRef.current;
                              if (!fromId) return;
                              setPendingPhotos((prev) => reorderById(prev, fromId, p.id));
                              dragIdRef.current = null;
                            }}
                            title={idx === 0 ? "Hoofdfoto" : `Foto #${idx + 1}`}
                          >
                            <div className="relative">
                              <img src={p.previewUrl} alt="" className="w-full h-20 object-cover" />
                              <div className="absolute top-1 left-1 text-[10px] bg-black/70 text-white px-1.5 py-0.5 rounded">
                                {idx === 0 ? "Hoofd" : `#${idx + 1}`}
                              </div>
                              <button
                                type="button"
                                onClick={() => removePendingPhoto(p.id, pendingPhotos, setPendingPhotos)}
                                className="absolute top-1 right-1 text-[10px] bg-white/90 px-1.5 py-0.5 rounded border"
                              >
                                X
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => { cleanupPendingPreviews(pendingPhotos); setPendingPhotos([]); }}
                        className="mt-3 w-full px-3 py-2 rounded-lg border bg-white"
                      >
                        Verwijder geselecteerde foto’s
                      </button>
                    </>
                  )}
                </div>

                <button onClick={addProductWithPhotos} className="mt-3 bg-emerald-600 text-white px-4 py-2 rounded-lg w-full">
                  Opslaan (product + foto’s)
                </button>
              </Card>

              <Card title="Voorraad" className="xl:col-span-2">
                <div className="text-xs text-slate-500 mb-2">
                  Klik een product om foto’s te beheren. Publish maakt jobs en neemt automatisch foto’s mee (volgorde + max per marketplace).
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b text-left">
                      <tr>
                        <th className="py-2 pr-4">Naam</th>
                        <th className="py-2 pr-4">Nr</th>
                        <th className="py-2 pr-4">Motor</th>
                        <th className="py-2 pr-4">Bak</th>
                        <th className="py-2 pr-4">Prijs</th>
                        <th className="py-2 pr-4">Public</th>
                        <th className="py-2 pr-4">Link</th>
                        {features.canUseMarketplaces && <th className="py-2 pr-4">Publish</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} className={`border-b cursor-pointer ${selectedProduct?.id === p.id ? "bg-emerald-50" : ""}`} onClick={() => setSelectedProduct(p)}>
                          <td className="py-2 pr-4 font-medium">{p.name}</td>
                          <td className="py-2 pr-4">{p.part_number || "-"}</td>
                          <td className="py-2 pr-4">{p.engine_code || "-"}</td>
                          <td className="py-2 pr-4">{p.gearbox_code || "-"}</td>
                          <td className="py-2 pr-4">{p.price ? `€${p.price}` : "-"}</td>
                          <td className="py-2 pr-4" onClick={(e) => e.stopPropagation()}>
                            <input type="checkbox" checked={!!p.is_public} onChange={(e) => togglePublic(p, e.target.checked)} />
                          </td>
                          <td className="py-2 pr-4" onClick={(e) => e.stopPropagation()}>
                            <button className="px-2 py-1 rounded-lg border bg-white" onClick={() => copyPublicLink(p)} disabled={!p.slug}>
                              Kopieer
                            </button>
                          </td>
                          {features.canUseMarketplaces && (
                            <td className="py-2 pr-4" onClick={(e) => e.stopPropagation()}>
                              <div className="flex flex-wrap gap-2">
                                <button className="px-2 py-1 rounded-lg border" onClick={() => enqueuePublish("marktplaats", p)}>Marktplaats</button>
                                <button className="px-2 py-1 rounded-lg border" onClick={() => enqueuePublish("ebay", p)}>eBay</button>
                                <button className="px-2 py-1 rounded-lg border" onClick={() => enqueuePublish("rrr", p)}>RRR.lt</button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                      {products.length === 0 && (
                        <tr><td colSpan={features.canUseMarketplaces ? 8 : 7} className="py-6 text-center text-slate-500">Nog geen producten.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {selectedProduct && (
                  <div className="mt-6 border rounded-xl p-4 bg-slate-50">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold">Foto’s beheren: {selectedProduct.name}</div>
                        <div className="text-xs text-slate-600">Drag & drop reorder + opslaan. Delete verwijdert ook uit Storage.</div>
                      </div>
                      <button onClick={saveImageOrder} className="px-4 py-2 rounded-xl bg-slate-900 text-white">
                        Volgorde opslaan
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-6 gap-2">
                      {productImages.map((img, idx) => (
                        <div
                          key={img.id}
                          className="border rounded-xl bg-white overflow-hidden"
                          draggable
                          onDragStart={() => (dragIdRef.current = img.id)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => {
                            const fromId = dragIdRef.current;
                            if (!fromId) return;
                            setProductImages((prev) => reorderById(prev, fromId, img.id));
                            dragIdRef.current = null;
                          }}
                          title={idx === 0 ? "Hoofdfoto" : `Foto #${idx + 1}`}
                        >
                          <div className="relative">
                            <img src={img.public_url} alt="" className="w-full h-20 object-cover" />
                            <div className="absolute top-1 left-1 text-[10px] bg-black/70 text-white px-1.5 py-0.5 rounded">
                              {idx === 0 ? "Hoofd" : `#${idx + 1}`}
                            </div>
                            <button
                              onClick={() => deleteProductImage(img)}
                              className="absolute top-1 right-1 text-[10px] bg-white/90 px-1.5 py-0.5 rounded border"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                      {productImages.length === 0 && (
                        <div className="text-sm text-slate-500">Geen foto’s voor dit product.</div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </section>
          )}

          {tab === "marketplaces" && features.canUseMarketplaces && (
            <Card title="Marketplaces (jobs)">
              <div className="flex gap-2 mb-4">
                <button className="px-4 py-2 rounded-xl border bg-white" onClick={loadJobs}>Refresh jobs</button>
                <button className="px-4 py-2 rounded-xl border bg-white" onClick={runWorkerOnce}>Verwerk 1 job (worker)</button>
                <a className="px-4 py-2 rounded-xl border bg-white" href={`/api/publish/export.csv?company_id=${activeCompany.id}`}>
                  Download CSV feed
                </a>
              </div>

              <div className="border rounded-xl bg-white overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b text-left">
                    <tr>
                      <th className="py-2 px-3">Created</th>
                      <th className="py-2 px-3">Marketplace</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Payload</th>
                      <th className="py-2 px-3">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((j) => (
                      <tr key={j.id} className="border-b">
                        <td className="py-2 px-3">{j.created_at ? new Date(j.created_at).toLocaleString() : "-"}</td>
                        <td className="py-2 px-3">{j.marketplace}</td>
                        <td className="py-2 px-3">{j.status}</td>
                        <td className="py-2 px-3 text-xs max-w-[420px]">
                          <pre className="whitespace-pre-wrap break-words">{JSON.stringify(j.payload, null, 2)}</pre>
                        </td>
                        <td className="py-2 px-3">{j.last_error || ""}</td>
                      </tr>
                    ))}
                    {jobs.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-slate-500">Nog geen publish jobs.</td></tr>}
                  </tbody>
                </table>
              </div>

              <div className="text-xs text-slate-500 mt-3">
                Framework klaar: jobs bevatten product + foto-URLs. Hierna koppel je echte OAuth/API keys per marketplace.
              </div>
            </Card>
          )}

          {tab === "settings" && (
            <Card title="Instellingen (watermark)">
              {!settings ? (
                <div className="text-sm text-slate-600">Laden…</div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!!settings.watermark_enabled}
                        onChange={(e) => setSettings({ ...settings, watermark_enabled: e.target.checked })}
                      />
                      Watermark inschakelen
                    </label>

                    <div>
                      <div className="text-sm font-semibold">Watermark tekst</div>
                      <input
                        className="w-full border rounded-xl px-4 py-2 mt-1"
                        value={settings.watermark_text || ""}
                        onChange={(e) => setSettings({ ...settings, watermark_text: e.target.value })}
                        placeholder={`Partagos • ${activeCompany.name}`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-sm font-semibold">Positie</div>
                        <select
                          className="w-full border rounded-xl px-4 py-2 mt-1"
                          value={settings.watermark_position || "br"}
                          onChange={(e) => setSettings({ ...settings, watermark_position: e.target.value })}
                        >
                          <option value="br">Bottom right</option>
                          <option value="bl">Bottom left</option>
                          <option value="tr">Top right</option>
                          <option value="tl">Top left</option>
                        </select>
                      </div>

                      <div>
                        <div className="text-sm font-semibold">Opacity (0..1)</div>
                        <input
                          className="w-full border rounded-xl px-4 py-2 mt-1"
                          type="number"
                          min="0"
                          max="1"
                          step="0.05"
                          value={settings.watermark_opacity ?? 0.75}
                          onChange={(e) => setSettings({ ...settings, watermark_opacity: e.target.value })}
                        />
                      </div>
                    </div>

                    <button
                      onClick={saveCompanySettings}
                      disabled={settingsSaving}
                      className="px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold"
                    >
                      {settingsSaving ? "Opslaan…" : "Opslaan"}
                    </button>

                    <div className="text-xs text-slate-500">
                      Let op: watermark wordt toegepast bij nieuwe uploads. Bestaande foto’s blijven zoals ze zijn.
                    </div>
                  </div>

                  <div className="border rounded-2xl p-4 bg-slate-50">
                    <div className="text-sm font-semibold mb-2">Preview (simulatie)</div>
                    <div className="text-xs text-slate-600 mb-3">
                      Dit is een UI preview. Upload-proces gebruikt dezelfde instellingen.
                    </div>
                    <WatermarkPreview
                      text={settings.watermark_text || `Partagos • ${activeCompany.name}`}
                      corner={settings.watermark_position || "br"}
                      opacity={clamp01(Number(settings.watermark_opacity ?? 0.75))}
                    />
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

/* -------------------- UI -------------------- */

function NavBtn({ label, active, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 rounded-lg ${active ? "bg-emerald-600" : "hover:bg-slate-800"} ${className}`}
    >
      {label}
    </button>
  );
}

function Card({ title, children, className = "" }) {
  return (
    <div className={`bg-white border rounded-xl p-5 ${className}`}>
      <h2 className="font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function WatermarkPreview({ text, corner, opacity }) {
  const positionStyle = (() => {
    const base = { position: "absolute", padding: "6px 8px", borderRadius: "8px", fontSize: "12px", fontWeight: 700 };
    if (corner === "br") return { ...base, right: 10, bottom: 10 };
    if (corner === "bl") return { ...base, left: 10, bottom: 10 };
    if (corner === "tr") return { ...base, right: 10, top: 10 };
    return { ...base, left: 10, top: 10 };
  })();

  return (
    <div className="relative border rounded-xl bg-white overflow-hidden h-56 flex items-center justify-center">
      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200" />
      <div style={{ ...positionStyle, background: `rgba(0,0,0,${0.55 * opacity})`, color: `rgba(255,255,255,${0.95})` }}>
        {text}
      </div>
    </div>
  );
}

/* -------------------- Photo helpers -------------------- */

function onPickFiles(e, setPendingPhotos) {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;

  const max = 10;
  setPendingPhotos((prev) => {
    const space = Math.max(0, max - prev.length);
    const take = files.slice(0, space);
    const added = take.map((file) => {
      const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
      const previewUrl = URL.createObjectURL(file);
      return { id, file, previewUrl };
    });
    return [...prev, ...added];
  });

  e.target.value = "";
}

function removePendingPhoto(id, pendingPhotos, setPendingPhotos) {
  const item = pendingPhotos.find((p) => p.id === id);
  if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
  setPendingPhotos((prev) => prev.filter((p) => p.id !== id));
}

function cleanupPendingPreviews(list) {
  try {
    for (const p of list || []) {
      if (p?.previewUrl) URL.revokeObjectURL(p.previewUrl);
    }
  } catch {
    // ignore
  }
}

function reorderById(list, fromId, toId) {
  if (fromId === toId) return list;
  const fromIndex = list.findIndex((x) => x.id === fromId);
  const toIndex = list.findIndex((x) => x.id === toId);
  if (fromIndex < 0 || toIndex < 0) return list;

  const copy = [...list];
  const [moved] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, moved);
  return copy;
}

function getFileExt(name) {
  const m = String(name || "").toLowerCase().match(/\.([a-z0-9]+)$/);
  if (!m) return "";
  const ext = m[1];
  if (ext === "jpeg") return "jpg";
  return ext;
}

function clamp01(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return 0.75;
  return Math.max(0, Math.min(1, x));
}

/**
 * Watermark in browser (Canvas), returns NEW File (JPEG/PNG)
 */
async function watermarkImageFile({ file, watermarkText, corner = "br", opacity = 0.75 }) {
  const img = await fileToImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const base = Math.max(16, Math.floor(Math.min(canvas.width, canvas.height) * 0.03));
  ctx.font = `bold ${base}px system-ui, -apple-system, Segoe UI, Roboto, Arial`;
  ctx.textBaseline = "bottom";

  const pad = Math.max(12, Math.floor(base * 0.8));
  const text = watermarkText || "Partagos";
  const metrics = ctx.measureText(text);
  const w = Math.ceil(metrics.width);
  const h = base + Math.floor(base * 0.6);

  let x = pad;
  let y = canvas.height - pad;

  if (corner === "br") { x = canvas.width - w - pad; y = canvas.height - pad; }
  if (corner === "bl") { x = pad; y = canvas.height - pad; }
  if (corner === "tr") { x = canvas.width - w - pad; y = pad + h; }
  if (corner === "tl") { x = pad; y = pad + h; }

  ctx.save();
  ctx.globalAlpha = 0.55 * opacity;
  ctx.fillStyle = "#000";
  ctx.fillRect(x - 10, y - h, w + 20, h + 10);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = "#fff";
  ctx.fillText(text, x, y);
  ctx.restore();

  const outType = pickOutputMime(file.type);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, outType, 0.9));
  const ext = outType === "image/png" ? "png" : "jpg";
  const newName = stripExt(file.name) + `-wm.${ext}`;
  return new File([blob], newName, { type: outType });
}

function stripExt(name) {
  return String(name || "").replace(/\.[a-z0-9]+$/i, "") || "image";
}

function pickOutputMime(type) {
  if (type === "image/png") return "image/png";
  return "image/jpeg";
}

function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
    img.src = url;
  });
}

function marketplaceMaxImages(marketplace) {
  const m = String(marketplace || "").toLowerCase();
  if (m === "marktplaats") return 8;
  if (m === "ebay") return 12;
  if (m === "rrr") return 6;
  return 8;
}
