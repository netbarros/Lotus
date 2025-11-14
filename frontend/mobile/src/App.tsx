import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <header className="app-header">
        <h1>MagicSaaS Mobile</h1>
        <p>Progressive Web App powered by Sofia AI v4.0</p>
      </header>
      <main>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
