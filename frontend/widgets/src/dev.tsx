import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelloWidget } from './index';

// Dev preview page for testing widgets
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div style={{ padding: '2rem' }}>
      <h1>MagicSaaS Widgets - Dev Preview</h1>
      <hr />
      <HelloWidget title="Example Widget" initialCount={5} />
    </div>
  </React.StrictMode>
);
