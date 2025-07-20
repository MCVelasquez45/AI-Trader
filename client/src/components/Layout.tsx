// File: components/Layout.tsx

import React from 'react';
import Navbar from './Navbar'; // 🔗 Import the shared navigation bar to be rendered at the top of every page

// 🧾 Props definition: Layout accepts "children", meaning any content passed between <Layout>...</Layout>
interface LayoutProps {
  children: React.ReactNode;
}

// 📦 Layout component: wraps pages with consistent background, text styling, and shared header (Navbar)
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    // 📐 Container that fills the full viewport height (min-vh-100)
    // 🎨 Applies the dark blue gradient background and global text color
    <div
      className="min-vh-100 text-white"
      style={{
        background: 'linear-gradient(to bottom right, #0f172a, #0b1120)' // 🔵 Custom brand gradient
      }}
    >
      <Navbar /> {/* 🧭 Render the top navigation bar on every page */}

      {children} {/* 🧱 Render the actual page content inside the layout */}
    </div>
  );
};

export default Layout; // ✅ Export the Layout so other components like Dashboard and MarketPage can use it
