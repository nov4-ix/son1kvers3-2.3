// src/components/DebugInfo.tsx
import { useEffect, useState } from 'react';

export function DebugInfo() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  useEffect(() => {
    const vars = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'NOT_SET',
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT_SET',
      VITE_SUNO_API_KEY: import.meta.env.VITE_SUNO_API_KEY ? 'SET' : 'NOT_SET',
      VITE_APP_URL: import.meta.env.VITE_APP_URL || 'NOT_SET',
      VITE_ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'NOT_SET',
    };
    setEnvVars(vars);
  }, []);

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50">
      <h3 className="text-cyan mb-2">Debug Info</h3>
      {Object.entries(envVars).map(([key, value]) => (
        <div key={key} className="mb-1">
          <span className="text-gray-400">{key}:</span> 
          <span className={`ml-2 ${value === 'NOT_SET' ? 'text-red-400' : 'text-green-400'}`}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}
