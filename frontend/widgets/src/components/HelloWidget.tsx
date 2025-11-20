import { useState } from 'react';

export interface HelloWidgetProps {
  title?: string;
  initialCount?: number;
}

export default function HelloWidget({
  title = 'MagicSaaS Widget',
  initialCount = 0,
}: HelloWidgetProps) {
  const [count, setCount] = useState(initialCount);

  return (
    <div className="magicsaas-widget">
      <h2>{title}</h2>
      <p>This is an embeddable widget from MagicSaaS System-∞</p>
      <button onClick={() => setCount((c) => c + 1)}>Count: {count}</button>
    </div>
  );
}
