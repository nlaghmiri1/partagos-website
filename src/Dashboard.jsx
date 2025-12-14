async function addProduct() {
  if (!form.name) {
    alert("Naam ontbreekt");
    return;
  }

  console.log("INSERT PRODUCT:", {
    company_id: activeCompanyId,
    name: form.name,
    part_number: form.part_number,
    engine_code: form.engine_code,
    gearbox_code: form.gearbox_code,
    location: form.location,
    price: Number(form.price),
    stock: Number(form.stock),
  });

  const { data, error } = await supabase
    .from("products")
    .insert([
      {
        company_id: activeCompanyId,
        name: form.name,
        part_number: form.part_number,
        engine_code: form.engine_code,
        gearbox_code: form.gearbox_code,
        location: form.location,
        price: Number(form.price),
        stock: Number(form.stock),
      },
    ])
    .select();

  if (error) {
    console.error("SUPABASE INSERT ERROR:", error);
    alert("FOUT: " + error.message);
    return;
  }

  console.log("INSERT RESULT:", data);

  setForm({
    name: "",
    part_number: "",
    engine_code: "",
    gearbox_code: "",
    location: "",
    price: "",
    stock: 1,
  });

  loadProducts(activeCompanyId);
}
