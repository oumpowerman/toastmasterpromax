
import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface AlertOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
}

interface AlertContextType {
  showAlert: (message: string, type?: AlertType, options?: AlertOptions) => Promise<void>;
  showConfirm: (message: string, options?: AlertOptions) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<{
    message: string;
    type: AlertType;
    title?: string;
    confirmText?: string;
    cancelText?: string;
  }>({ message: '', type: 'info' });

  // Use refs to store the resolve function of the current promise
  const resolveRef = useRef<(value: any) => void>(() => {});

  const showAlert = useCallback((message: string, type: AlertType = 'success', options?: AlertOptions) => {
    return new Promise<void>((resolve) => {
      setConfig({ 
        message, 
        type, 
        title: options?.title, 
        confirmText: options?.confirmText || 'ตกลง', 
        cancelText: '' 
      });
      setIsOpen(true);
      resolveRef.current = () => {
        setIsOpen(false);
        resolve();
      };
    });
  }, []);

  const showConfirm = useCallback((message: string, options?: AlertOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfig({ 
        message, 
        type: 'confirm', 
        title: options?.title || 'ยืนยันการทำรายการ', 
        confirmText: options?.confirmText || 'ยืนยัน', 
        cancelText: options?.cancelText || 'ยกเลิก' 
      });
      setIsOpen(true);
      resolveRef.current = (result: boolean) => {
        setIsOpen(false);
        resolve(result);
      };
    });
  }, []);

  const handleConfirm = () => resolveRef.current(true);
  const handleCancel = () => resolveRef.current(false);

  // Styles based on type
  const getStyles = () => {
    switch (config.type) {
      case 'success': return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100', btn: 'bg-green-500 hover:bg-green-600' };
      case 'error': return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100', btn: 'bg-red-500 hover:bg-red-600' };
      case 'warning': return { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-100', btn: 'bg-orange-500 hover:bg-orange-600' };
      case 'confirm': return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-100', btn: 'bg-blue-500 hover:bg-blue-600' };
      default: return { icon: Info, color: 'text-stone-500', bg: 'bg-stone-100', btn: 'bg-stone-800 hover:bg-stone-900' };
    }
  };

  const style = getStyles();
  const Icon = style.icon;

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={config.type === 'confirm' ? undefined : handleConfirm}></div>
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl relative z-10 overflow-hidden transform transition-all scale-100 p-6 text-center border-4 border-stone-50">
            
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${style.bg} ${style.color}`}>
              <Icon size={32} strokeWidth={2.5} />
            </div>

            <h3 className="text-xl font-bold text-stone-800 font-cute mb-2">
              {config.title || (config.type === 'error' ? 'เกิดข้อผิดพลาด' : config.type === 'success' ? 'เรียบร้อย' : 'แจ้งเตือน')}
            </h3>
            
            <p className="text-stone-500 mb-6 font-medium leading-relaxed">
              {config.message}
            </p>

            <div className="flex gap-3">
              {config.type === 'confirm' && (
                <button 
                  onClick={handleCancel}
                  className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl font-bold transition-colors"
                >
                  {config.cancelText}
                </button>
              )}
              <button 
                onClick={handleConfirm}
                className={`flex-1 py-3 text-white rounded-xl font-bold shadow-lg shadow-stone-200 transition-all transform hover:-translate-y-0.5 ${style.btn}`}
              >
                {config.confirmText}
              </button>
            </div>

          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};
