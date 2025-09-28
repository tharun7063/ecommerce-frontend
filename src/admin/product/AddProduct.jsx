// src/admin/product/AddProduct.jsx
import React, { useState, useEffect } from "react";
import useStore from "../../store/useStore";

const AddProduct = () => {
  const backend_url = useStore((state) => state.backend_url);
  const token = useStore((state) => state.token);
  const refreshAuth = useStore((state) => state.refreshAuth);

  // Form state
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    short_description: "",
    price: "",
    discount_price: "",
    stock_quantity: "",
    status: "active",
    category_id: "",
    brand_id: "",
    options: [{ name: "", values: [""] }],
    variants: [{ variant_name: "", price: "", stock_quantity: "", option_values: [""] }],
  });

  // Categories & Brands state
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categoryPage, setCategoryPage] = useState(1);
  const [brandPage, setBrandPage] = useState(1);
  const [hasMoreCategories, setHasMoreCategories] = useState(true);
  const [hasMoreBrands, setHasMoreBrands] = useState(true);

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch categories
  const fetchCategories = async (page = 1) => {
    try {
      let authToken = await refreshAuth();
      if (!authToken) authToken = token;

      const res = await fetch(`${backend_url}/category/categories?page=${page}&limit=5`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      if (data.data && Array.isArray(data.data)) {
        if (data.data.length === 0) setHasMoreCategories(false); // No more data
        setCategories((prev) => {
          const newCats = data.data.filter((c) => !prev.some((pc) => pc.id === c.id));
          return [...prev, ...newCats];
        });
      } else {
        setHasMoreCategories(false);
        console.warn("No categories array in response:", data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Fetch brands
  const fetchBrands = async (page = 1) => {
    try {
      let authToken = await refreshAuth();
      if (!authToken) authToken = token;

      const res = await fetch(`${backend_url}/brand?page=${page}&limit=5`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      if (data.data && Array.isArray(data.data)) {
        if (data.data.length === 0) setHasMoreBrands(false);
        setBrands((prev) => {
          const newBrands = data.data.filter((b) => !prev.some((pb) => pb.id === b.id));
          return [...prev, ...newBrands];
        });
      } else {
        setHasMoreBrands(false);
        console.warn("No brands array in response:", data);
      }
    } catch (err) {
      console.error("Error fetching brands:", err);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCategories(categoryPage);
    fetchBrands(brandPage);
  }, []);

  // Load more handlers
  const loadMoreCategories = async () => {
    const nextPage = categoryPage + 1;
    await fetchCategories(nextPage);
    setCategoryPage(nextPage);
  };

  const loadMoreBrands = async () => {
    const nextPage = brandPage + 1;
    await fetchBrands(nextPage);
    setBrandPage(nextPage);
  };

  // Options & variants handlers
  const handleAddOption = () => {
    setForm((prev) => ({
      ...prev,
      options: [...prev.options, { name: "", values: [""] }],
    }));
  };

  const handleAddVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { variant_name: "", price: "", stock_quantity: "", option_values: [""] }],
    }));
  };

  const handleOptionChange = (index, key, value) => {
    const newOptions = [...form.options];
    newOptions[index][key] = value;
    setForm((prev) => ({ ...prev, options: newOptions }));
  };

  const handleVariantChange = (index, key, value) => {
    const newVariants = [...form.variants];
    newVariants[index][key] = value;
    setForm((prev) => ({ ...prev, variants: newVariants }));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    let authToken = await refreshAuth();
    if (!authToken) authToken = token;
    if (!authToken) return alert("JWT token missing!");

    try {
      const res = await fetch(`${backend_url}/product/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to add product");
      const data = await res.json();
      alert("Product added successfully!");
      console.log(data);
    } catch (err) {
      console.error(err);
      alert("Error adding product");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Add Product</h2>

      {/* Basic Info Card */}
      <div className="bg-white shadow-md rounded p-4 space-y-3">
        <h3 className="text-lg font-semibold mb-2">Basic Info</h3>

        <input type="text" name="name" placeholder="Product Name" value={form.name} onChange={handleInputChange} className="w-full border rounded p-2" required />
        <input type="text" name="slug" placeholder="Slug" value={form.slug} onChange={handleInputChange} className="w-full border rounded p-2" required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleInputChange} className="w-full border rounded p-2" required />
        <input type="text" name="short_description" placeholder="Short Description" value={form.short_description} onChange={handleInputChange} className="w-full border rounded p-2" required />

        <div className="grid grid-cols-3 gap-3">
          <input type="number" name="price" placeholder="Price" value={form.price} onChange={handleInputChange} className="border rounded p-2" required />
          <input type="number" name="discount_price" placeholder="Discount Price" value={form.discount_price} onChange={handleInputChange} className="border rounded p-2" />
          <input type="number" name="stock_quantity" placeholder="Stock Quantity" value={form.stock_quantity} onChange={handleInputChange} className="border rounded p-2" required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Category Dropdown */}
          <div>
            <select name="category_id" value={form.category_id} onChange={handleInputChange} className="w-full border rounded p-2" required>
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {hasMoreCategories && (
              <button type="button" onClick={loadMoreCategories} className="text-blue-500 text-sm mt-1">Load more categories</button>
            )}
          </div>

          {/* Brand Dropdown */}
          <div>
            <select name="brand_id" value={form.brand_id} onChange={handleInputChange} className="w-full border rounded p-2" required>
              <option value="">Select Brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
            {hasMoreBrands && (
              <button type="button" onClick={loadMoreBrands} className="text-blue-500 text-sm mt-1">Load more brands</button>
            )}
          </div>
        </div>
      </div>

      {/* Options Card */}
      <div className="bg-white shadow-md rounded p-4 space-y-3">
        <h3 className="text-lg font-semibold">Options</h3>
        {form.options.map((opt, i) => (
          <div key={i} className="space-y-1">
            <input type="text" placeholder="Option Name" value={opt.name} onChange={(e) => handleOptionChange(i, "name", e.target.value)} className="border rounded p-2 w-full" />
            <input type="text" placeholder="Values comma separated" value={opt.values.join(",")} onChange={(e) => handleOptionChange(i, "values", e.target.value.split(","))} className="border rounded p-2 w-full" />
          </div>
        ))}
        <button type="button" onClick={handleAddOption} className="bg-gray-200 px-3 py-1 rounded">Add Option</button>
      </div>

      {/* Variants Card */}
      <div className="bg-white shadow-md rounded p-4 space-y-3">
        <h3 className="text-lg font-semibold">Variants</h3>
        {form.variants.map((v, i) => (
          <div key={i} className="space-y-1">
            <input type="text" placeholder="Variant Name" value={v.variant_name} onChange={(e) => handleVariantChange(i, "variant_name", e.target.value)} className="border rounded p-2 w-full" />
            <input type="number" placeholder="Price" value={v.price} onChange={(e) => handleVariantChange(i, "price", e.target.value)} className="border rounded p-2 w-full" />
            <input type="number" placeholder="Stock Quantity" value={v.stock_quantity} onChange={(e) => handleVariantChange(i, "stock_quantity", e.target.value)} className="border rounded p-2 w-full" />
            <input type="text" placeholder="Option Values comma separated" value={v.option_values.join(",")} onChange={(e) => handleVariantChange(i, "option_values", e.target.value.split(","))} className="border rounded p-2 w-full" />
          </div>
        ))}
        <button type="button" onClick={handleAddVariant} className="bg-gray-200 px-3 py-1 rounded">Add Variant</button>
      </div>

      {/* Submit Button */}
      <div>
        <button type="submit" onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded">Add Product</button>
      </div>
    </div>
  );
};

export default AddProduct;
