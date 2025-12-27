import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const variants = {
    critical: "bg-red-500/10 border-red-500/50 text-red-500",
    warning: "bg-yellow-500/10 border-yellow-500/50 text-yellow-500",
    info: "bg-blue-500/10 border-blue-500/50 text-blue-500",
    success: "bg-green-500/10 border-green-500/50 text-green-500",
};

const icons = {
    critical: AlertCircle,
    warning: AlertTriangle,
    info: Info,
    success: CheckCircle,
};

export function AlertCard({
    variant = 'info',
    title,
    message,
    timestamp,
    onDismiss,
    className
}) {
    const Icon = icons[variant];

    return (
        <div className={cn(
            "relative flex w-full items-start gap-3 rounded-lg border p-4 shadow-sm transition-all",
            variants[variant],
            className
        )}>
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1">
                <h4 className="mb-1 font-medium leading-none tracking-tight">
                    {title}
                </h4>
                <div className="text-sm opacity-90">
                    {message}
                </div>
                {timestamp && (
                    <div className="mt-2 text-xs opacity-70">
                        {timestamp}
                    </div>
                )}
            </div>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="rounded-full p-1 hover:bg-black/10 transition-colors"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Dismiss</span>
                </button>
            )}
        </div>
    );
}
