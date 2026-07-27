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
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

const icons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'i',
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
      
      {/* ✅ Уведомления в правом верхнем углу */}
      <div style={{
        position: 'fixed',
        top: '80px',           // ← Отступ сверху (чтобы не перекрывать хедер)
        right: '20px',         // ← Отступ справа
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: '400px',
        width: '100%',
        pointerEvents: 'none', // Чтобы клики проходили сквозь контейнер
      }}>
        {toasts.map(toast => {
          const c = colors[toast.type];
          return (
            <div
              key={toast.id}
              onClick={() => removeToast(toast.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '10px',
                border: `1px solid ${c.border}`,
                backgroundColor: c.bg,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                cursor: 'pointer',
                pointerEvents: 'auto', // Чтобы клик по уведомлению работал
                minWidth: '280px',
                animation: 'slideInRight 0.3s ease-out',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: c.icon,
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  flexShrink: 0,
                }}
              >
                {icons[toast.type]}
              </div>
              <span style={{
                fontSize: '14px',
                color: c.text,
                flex: 1,
              }}>
                {toast.message}
              </span>
            </div>
          );
        })}
      </div>
      
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}