/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🚀 MAIN - Application entry point                                       ║
 * ║ MagicSaaS System-∞ Admin powered by Sofia AI v4.0                       ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import Metronic styles (these would be added via npm or CDN)
// For now, we'll rely on the Metronic build process
import './index.css';

console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║              🎯 MAGICSAAS SYSTEM-∞ ADMIN DASHBOARD                      ║
║                                                                          ║
║         ✨ Powered by Sofia AI v4.0 - The Brain of MagicSaaS ✨         ║
║              Metronic 9 + React 18 + TypeScript 5.6                     ║
║              Complete AI Stack: LangChain + Langfuse + Qdrant           ║
║                                                                          ║
║              Status: 🟢 ONLINE • Version: 4.0.0 • Enterprise ♾️         ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
`);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
