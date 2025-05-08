// ✅ Import the React core library
import React from 'react';

// ✅ Import ReactDOM to interact with the real DOM
import ReactDOM from 'react-dom/client';

// ✅ Import the main App component — the root of your app's UI
import App from './App';

// 📍 Find the root HTML element in public/index.html (typically: <div id="root"></div>)
const root = ReactDOM.createRoot(document.getElementById('root'));

// 🧠 Render the App component inside a <React.StrictMode> wrapper for development checks
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
