import { createContext, useContext, useState, useCallback } from 'react';

const ToastCtx = createContext(null);
export const useToast = () => useContext(ToastCtx);

const STYLES = {
  success: { bar: 'bg-green-500', bg: 'bg-white',  icon: '✓', iconBg: 'bg-green-100 text-green-600', title: 'text-gray-900', msg: 'text-gray-500' },
  error:   { bar: 'bg-red-500',   bg: 'bg-white',  icon: '✕', iconBg: 'bg-red-100 text-red-600',     title: 'text-gray-900', msg: 'text-gray-500' },
  warn:    { bar: 'bg-amber-400', bg: 'bg-white',  icon: '!', iconBg: 'bg-amber-100 text-amber-600', title: 'text-gray-900', msg: 'text-gray-500' },
  info:    { bar: 'bg-blue-500',  bg: 'bg-white',  icon: 'i', iconBg: 'bg-blue-100 text-blue-600',   title: 'text-gray-900', msg: 'text-gray-500' },
};

function ToastItem({ t, onRemove }) {
  const s = STYLES[t.type] || STYLES.info;
  return (
    <div
      className={`${s.bg} flex items-start gap-3 p-4 pr-3 rounded-xl shadow-lg border border-gray-100 w-full max-w-sm animate-toast-in relative overflow-hidden`}
      role="alert"
      aria-live="assertive"
    >
      {/* Colour bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${s.bar}`} />
      {/* Icon */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${s.iconBg}`}>
        {t.icon || s.icon}
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        {t.title && <p className={`text-sm font-semibold ${s.title}`}>{t.title}</p>}
        <p className={`text-sm leading-snug ${t.title ? s.msg : s.title}`}>{t.message}</p>
      </div>
      {/* Dismiss */}
      <button
        onClick={onRemove}
        className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors text-xs font-bold"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const add = useCallback((message, type = 'info', opts = {}) => {
    const id = Date.now() + Math.random();
    const duration = opts.duration ?? (type === 'error' ? 6000 : 4500);
    setToasts(prev => [...prev.slice(-4), { id, message, type, title: opts.title, icon: opts.icon }]);
    if (duration > 0) setTimeout(() => remove(id), duration);
    return id;
  }, [remove]);

  const toast = {
    success: (msg, opts) => add(msg, 'success', typeof opts === 'string' ? { title: opts } : opts || {}),
    error:   (msg, opts) => add(msg, 'error',   typeof opts === 'string' ? { title: opts } : opts || {}),
    warn:    (msg, opts) => add(msg, 'warn',     typeof opts === 'string' ? { title: opts } : opts || {}),
    info:    (msg, opts) => add(msg, 'info',     typeof opts === 'string' ? { title: opts } : opts || {}),
    dismiss: (id) => remove(id),
  };

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div
        className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none"
        aria-label="Notifications"
      >
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem t={t} onRemove={() => remove(t.id)} />
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
