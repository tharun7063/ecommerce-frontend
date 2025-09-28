import React, { useEffect } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Layout from "./components/Navbar";
import Home from "./pages/Home";
import CartPage from "./pages/Cart";
import LoginPage from "./pages/Login";

import Dashboard from "./admin/Dashboard";
import UserList from "./admin/users/UserList";
import UserDetailsEdit from "./admin/users/UserDetailsEdit";
import ProductList from "./admin/product/ProductList";
import AddProduct from "./admin/product/AddProduct";
import AdminWrapper from "./utils/AdminWrapper";
import RoleRedirect from "./utils/RoleRedirect";
import useStore from "./store/useStore";

function App() {
  const refreshAuth = useStore((state) => state.refreshAuth);

  useEffect(() => {
    // Refresh immediately and then every 14 minutes
    const refreshTokenPeriodically = async () => {
      try {
        const newToken = await refreshAuth();
        if (newToken) console.log("New JWT generated:", newToken);
      } catch (err) {
        console.error("Error refreshing token:", err);
      }
    };

    refreshTokenPeriodically();
    const interval = setInterval(refreshTokenPeriodically, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshAuth]);

  return (
    <Routes>
      {/* Public / customer routes, redirect admin away */}
      <Route element={<RoleRedirect />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="cart" element={<CartPage />} />
        </Route>
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<AdminWrapper />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="user" element={<UserList />} />
          <Route path="user/:uid" element={<UserDetailsEdit />} />
          <Route path="product" element={<ProductList />} />
          <Route path="addproduct" element={<AddProduct/>}/>
        </Route>
      </Route>

      {/* Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
