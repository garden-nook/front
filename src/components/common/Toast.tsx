import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

const icons: Record<ToastType, string> = {
  success: '✓',
  error: '',
  warning: '⚠',
  info: 'ℹ',
};

const colors: Record<ToastType, { bg: string; border: string; text: string; icon: string }> = {
  success: { bg: '#F0FDF4', border: '#86EFAC', text: '#166534', icon: '#22C55E' },
  error: { bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B', icon: '#EF4444' },
  warning: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', icon: '#F59E0B' },
  info: { bg: '#EFF6FF', border: '#93C5FD', text: '#1E40AF', icon: '#3B82F6' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Контейнер уведомлений — ЛЕВЫЙ НИЖНИЙ УГОЛ */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: '380px',
      }}>
        {toasts.map(toast => {
          const c = colors[toast.type];
          return (
            <div
              key={toast.id}
              style={{
                backgroundColor: c.bg,
                border: `1px solid ${c.border}`,
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                animation: 'slideIn 0.3s ease-out',
                cursor: 'pointer',
                minWidth: '280px',
              }}
              onClick={() => removeToast(toast.id)}
            >
              <span style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: c.icon,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 700,
                flexShrink: 0,
              }}>
                {icons[toast.type]}
              </span>
              <span style={{ fontSize: '13px', color: c.text, flex: 1 }}>
                {toast.message}
              </span>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}