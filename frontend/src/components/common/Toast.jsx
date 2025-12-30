import React from 'react';
import { X, AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const icons = {
    critical: AlertCircle,
    warning: AlertTriangle,
    info: Info,
    success: CheckCircle,
};

const variants = {
    critical: "bg-red-500 text-white border-red-600",
    warning: "bg-yellow-500 text-white border-yellow-600",
    info: "bg-blue-500 text-white border-blue-600",
    success: "bg-green-500 text-white border-green-600",
};

export function ToastContainer() {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-lg border ${variants[toast.type] || variants.info} animate-in slide-in-from-right-full duration-300`}
                >
                    {React.createElement(icons[toast.type] || icons.info, { className: "h-5 w-5 shrink-0 mt-0.5" })}
                    <div className="flex-1">
                        <h4 className="font-semibold text-sm">{toast.title}</h4>
                        <p className="text-sm opacity-90">{toast.message}</p>
                    </div>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
