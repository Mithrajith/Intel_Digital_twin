import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function MetricCard({
    title,
    value,
    unit,
    trend,
    trendValue,
    status = 'neutral',
    icon: Icon
}) {
    const isTrendPositive = trend === 'up';
    const isTrendNegative = trend === 'down';

    const statusColors = {
        success: "text-green-500",
        warning: "text-yellow-500",
        error: "text-red-500",
        neutral: "text-muted-foreground",
    };

    return (
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between pb-2">
                <h3 className="text-sm font-medium text-muted-foreground tracking-tight">
                    {title}
                </h3>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            </div>
            <div className="flex items-baseline gap-1">
                <div className="text-2xl font-bold tracking-tight">{value}</div>
                {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
            </div>
            {(trend || trendValue) && (
                <div className="mt-1 flex items-center text-xs">
                    {isTrendPositive && <ArrowUp className="mr-1 h-3 w-3 text-green-500" />}
                    {isTrendNegative && <ArrowDown className="mr-1 h-3 w-3 text-red-500" />}
                    {trend === 'flat' && <Minus className="mr-1 h-3 w-3 text-gray-500" />}

                    <span className={cn(
                        "font-medium",
                        isTrendPositive && "text-green-500",
                        isTrendNegative && "text-red-500",
                        trend === 'flat' && "text-gray-500"
                    )}>
                        {trendValue}
                    </span>
                    <span className="ml-1 text-muted-foreground">vs last hour</span>
                </div>
            )}
        </div>
    );
}
