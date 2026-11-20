import { useState } from 'react';
import { Icon } from './icons';

// Looks for your own logo first (public/logo.png), then the default public/logo.svg,
// and finally falls back to a built-in icon, so it never shows a broken image.
const sources = ['/logo.png', '/logo.svg'];

export const Logo = ({ className = 'h-10 w-10' }: { className?: string }) => {
  const [i, setI] = useState(0);
  if (i >= sources.length) {
    return (
      <div className={`grid place-items-center rounded-xl bg-linear-to-br from-brand-400 to-accent-600 text-white shadow-lg shadow-brand-500/30 ${className}`}>
        <Icon name="pill" className="h-1/2 w-1/2" />
      </div>
    );
  }
  return <img src={sources[i]} alt="PharmaConnect logo" className={`object-contain ${className}`} onError={() => setI(i + 1)} />;
};
