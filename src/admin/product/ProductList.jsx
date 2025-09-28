// src/admin/product/ProductList.jsx
import React, { useEffect, useState } from "react";
import useStore from "../../store/useStore";
import { useNavigate } from "react-router-dom";

const ProductList = () => {
  const backend_url = useStore((state) => state.backend_url);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // loading state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${backend_url}/product`);
        if (!response.ok) throw new Error("Failed to fetch products");
        const result = await response.json();
        setProducts(result.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false); // stop loading after fetch
      }
    };

    fetchProducts();
  }, [backend_url]);

  return (
    <div>
      {/* Header with button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          onClick={() => navigate("/admin/addproduct")}

        >
          Add Product
        </button>
      </div>

      {/* Products table */}
      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr className="text-center">
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Category</th>
            <th className="border px-2 py-1">Brand</th>
            <th className="border px-2 py-1">Price</th>
            <th className="border px-2 py-1">Discount Price</th>
            <th className="border px-2 py-1">Stock</th>
            <th className="border px-2 py-1">Variants</th>
            <th className="border px-2 py-1">Images / Video</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="text-center align-top animate-pulse">
                  <td className="border px-2 py-1 bg-gray-200 h-6"></td>
                  <td className="border px-2 py-1 bg-gray-200 h-6"></td>
                  <td className="border px-2 py-1 bg-gray-200 h-6"></td>
                  <td className="border px-2 py-1 bg-gray-200 h-6"></td>
                  <td className="border px-2 py-1 bg-gray-200 h-6"></td>
                  <td className="border px-2 py-1 bg-gray-200 h-6"></td>
                  <td className="border px-2 py-1 bg-gray-200 h-6"></td>
                  <td className="border px-2 py-1 bg-gray-200 h-6"></td>
                </tr>
              ))
            : products.map((product) => (
                <tr key={product.id} className="text-center align-top">
                  <td className="border px-2 py-1">{product.name}</td>
                  <td className="border px-2 py-1">{product.category?.name}</td>
                  <td className="border px-2 py-1">{product.brand?.name}</td>
                  <td className="border px-2 py-1">{product.price}</td>
                  <td className="border px-2 py-1">{product.discount_price}</td>
                  <td className="border px-2 py-1">{product.stock_quantity}</td>
                  <td className="border px-2 py-1 text-left">
                    {product.variants?.map((v) => (
                      <div key={v.id}>
                        {v.variant_name} - {v.price} ({v.stock_quantity})
                      </div>
                    ))}
                  </td>
                  <td className="border px-2 py-1 text-left">
                    {product.images?.map((img) =>
                      img.type === "image" ? (
                        <img
                          key={img.id}
                          src={img.url}
                          alt={img.name}
                          className="w-16 h-16 object-cover m-1 inline-block"
                        />
                      ) : (
                        <a
                          key={img.id}
                          href={img.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-orange-500"
                        >
                          {img.name}
                        </a>
                      )
                    )}
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;
