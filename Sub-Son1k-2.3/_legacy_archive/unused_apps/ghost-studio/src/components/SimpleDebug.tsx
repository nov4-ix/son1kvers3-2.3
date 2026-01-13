// src/components/SimpleDebug.tsx
import { useEffect, useState } from 'react';

export function SimpleDebug() {
  const [mounted, setMounted] = useState(false);
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
    const vars = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'NOT_SET',
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT_SET',
      VITE_SUNO_API_KEY: import.meta.env.VITE_SUNO_API_KEY ? 'SET' : 'NOT_SET',
      VITE_APP_URL: import.meta.env.VITE_APP_URL || 'NOT_SET',
      VITE_ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'NOT_SET',
    };
    setEnvVars(vars);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999
    }}>
      <h3 style={{ color: '#00FFE7', marginBottom: '5px' }}>Debug Info</h3>
      {Object.entries(envVars).map(([key, value]) => (
        <div key={key} style={{ marginBottom: '2px' }}>
          <span style={{ color: '#666' }}>{key}:</span> 
          <span style={{ 
            marginLeft: '5px', 
            color: value === 'NOT_SET' ? '#ff4444' : '#00ff88' 
          }}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}
