// ✅ Import the React core libraries
import React from 'react';
import ReactDOM from 'react-dom/client';

// ✅ Import global Tailwind styles (adjust path if needed)
import './styles/theme.css'; // or './index.css' if that's your Tailwind file

// ✅ Import the main App component
import App from './App';

// 📍 Get the root DOM node (must match <div id="root"> in index.html)
const container = document.getElementById('root');
if (!container) throw new Error('❌ Root element not found');

const root = ReactDOM.createRoot(container);

// 🧠 Render the App with development checks
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
