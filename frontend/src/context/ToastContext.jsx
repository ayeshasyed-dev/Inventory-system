import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const showError = useCallback((msg) => addToast(msg, 'error'), [addToast]);
  const showWarning = useCallback((msg) => addToast(msg, 'warning'), [addToast]);
  const showInfo = useCallback((msg) => addToast(msg, 'info'), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
      <div className="toast-container" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {toasts.map((t) => {
          let Icon = Info;
          let color = '#3b82f6';
          if (t.type === 'success') {
            Icon = CheckCircle2;
            color = '#10b981';
          } else if (t.type === 'error') {
            Icon = AlertCircle;
            color = '#ef4444';
          } else if (t.type === 'warning') {
            Icon = AlertTriangle;
            color = '#f59e0b';
          }

          return (
            <div
              key={t.id}
              className={`toast toast-${t.type}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 18px',
                background: '#131b2e',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderLeft: `4px solid ${color}`,
                borderRadius: '10px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                minWidth: '300px',
                maxWidth: '420px',
                color: '#fff',
                fontSize: '0.9rem',
              }}
            >
              <Icon size={18} style={{ color, flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
