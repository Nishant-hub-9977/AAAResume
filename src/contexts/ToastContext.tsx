import React, { createContext, useContext, useState, useCallback } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = uuidv4();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  const toastTypeClasses = {
    success: 'bg-green-100 border-green-500 text-green-800',
    error: 'bg-red-100 border-red-500 text-red-800',
    info: 'bg-blue-100 border-blue-500 text-blue-800',
    warning: 'bg-amber-100 border-amber-500 text-amber-800',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <TransitionGroup>
          {toasts.map((toast) => (
            <CSSTransition key={toast.id} timeout={300} classNames={{
              enter: "opacity-0 translate-y-4",
              enterActive: "opacity-100 translate-y-0 transition-all duration-300",
              exit: "opacity-100",
              exitActive: "opacity-0 transition-opacity duration-300"
            }}>
              <div 
                className={`px-4 py-3 rounded-lg shadow-md border-l-4 flex items-center justify-between min-w-[280px] max-w-md ${toastTypeClasses[toast.type]}`}
              >
                <p className="pr-4">{toast.message}</p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={16} />
                </button>
              </div>
            </CSSTransition>
          ))}
        </TransitionGroup>
      </div>
    </ToastContext.Provider>
  );
};