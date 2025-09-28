// src/pages/Cart.jsx
import React, { useState } from "react";

const CartPage = () => {
  // Sample cart items
  const [cartItems, setCartItems] = useState([
    { id: 1, name: "Product A", price: 299, quantity: 1 },
    { id: 2, name: "Product B", price: 499, quantity: 2 },
    { id: 3, name: "Product C", price: 199, quantity: 1 },
  ]);

  // Update quantity
  const handleQuantityChange = (id, value) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, value) } : item
      )
    );
  };

  // Calculate total
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-5">Your Cart</h1>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <table className="w-full border border-gray-300 rounded-md overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Quantity</th>
              <th className="p-3 text-left">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-3">{item.name}</td>
                <td className="p-3">₹{item.price}</td>
                <td className="p-3">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item.id, parseInt(e.target.value))
                    }
                    className="w-16 px-2 py-1 border rounded"
                  />
                </td>
                <td className="p-3">₹{item.price * item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {cartItems.length > 0 && (
        <div className="flex justify-end mt-5">
          <div className="text-lg font-bold">
            Total: <span className="text-orange-500">₹{total}</span>
          </div>
        </div>
      )}

      {cartItems.length > 0 && (
        <div className="flex justify-end mt-4">
          <button className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
            Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPage;
