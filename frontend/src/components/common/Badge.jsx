import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const variants = {
    success: "bg-green-500/15 text-green-500 border-green-500/20",
    warning: "bg-yellow-500/15 text-yellow-500 border-yellow-500/20",
    error: "bg-red-500/15 text-red-500 border-red-500/20",
    info: "bg-blue-500/15 text-blue-500 border-blue-500/20",
    neutral: "bg-gray-500/15 text-gray-400 border-gray-500/20",
};

export function Badge({ variant = 'neutral', className, children }) {
    return (
        <span className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
}
