// ✅ File: components/Layout.tsx

import React from 'react';
import Navbar from './Navbar'; // 🔗 Import the shared navigation bar to be rendered at the top of every page

// 🧾 Props definition: Layout accepts "children" for page content,
// and setShowAuthModal to allow modal control from Navbar
interface LayoutProps {
  children: React.ReactNode;
  setShowAuthModal: React.Dispatch<React.SetStateAction<boolean>>;
}

// 📦 Layout component: wraps pages with consistent background, text styling, and shared header (Navbar)
const Layout: React.FC<LayoutProps> = ({ children, setShowAuthModal }) => {
  console.log('🧱 <Layout> rendering — modal control passed to <Navbar>');

  return (
    // 📐 Container that fills the full viewport height (min-vh-100)
    // 🎨 Applies the dark blue gradient background and global text color
    <div
      className="min-vh-100 text-white"
      style={{
        background: 'linear-gradient(to bottom right, #0f172a, #0b1120)' // 🔵 Custom brand gradient
      }}
    >
      {/* 🧭 Render the top navigation bar on every page, with modal control prop */}
      <Navbar setShowAuthModal={setShowAuthModal} />

      {/* 🧱 Render the actual page content inside the layout */}
      {children}
    </div>
  );
};

export default Layout; // ✅ Export the Layout so other components like Dashboard and MarketPage can use it