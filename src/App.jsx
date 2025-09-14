// App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AuthPage from './pages/Login'

function App() {
  return (
    <>
      <Navbar />
      <div className="pt-20 px-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<AuthPage />} />
          {/* <Route path="/products" element={<Products />} /> */}
          {/* <Route path="/category" element={<Categories />} /> */}
        </Routes>
      </div>
    </>
  );
}
export default App;
